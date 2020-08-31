/* global BigInt */
import * as a from 'apache-arrow';
import * as dt from '@terascope/data-types';
import {
    DataEntity, times
} from '@terascope/job-components';
import { FilterMatch, TableAPI, TransformAction } from './interfaces';
import { transformActions } from './utils';

export class ArrowTable implements TableAPI {
    readonly schema: a.Schema;

    private _table: a.Table|undefined;

    static toJSON(table: a.Table): Record<string, unknown>[] {
        const records: Record<string, unknown>[] = [];

        const colNames = times(table.numCols, (i) => table!.getColumnAt(i))
            .filter((col): col is a.Column => col != null)
            .map((col) => col.name);

        for (const row of table) {
            const record: Record<string, unknown> = {};
            for (const name of colNames) {
                const value = row.get(name);
                if (value instanceof a.BaseVector) {
                    record[name] = value.toJSON();
                } else {
                    record[name] = value;
                }
            }
            records.push(record);
        }

        return records.slice();
    }

    constructor(typeConfig: [string, dt.FieldTypeConfig][]) {
        this.schema = new a.Schema(typeConfig.map(
            ([name, config]) => this._getField(name, config)
        ));
    }

    insert(records: DataEntity[]): void {
        const len = records.length;
        const builders: Record<string, a.Builder> = Object.create(null);

        this.schema.fields.forEach((field) => {
            builders[field.name] = a.Builder.new({ type: field.type, nullValues: [null] });
        });

        for (let i = 0; i < len; i++) {
            const record = records[i];
            for (const field in builders) {
                if (hasOwn(record, field)) {
                    builders[field].append(record[field] ?? null);
                } else {
                    builders[field].append(null);
                }
            }
        }

        const columns = Object.entries(builders).map(
            ([field, builder]) => {
                const vector = builder.finish().toVector();
                if (!this._table) return a.Column.new(field, vector);

                const col = this._table.getColumn(field);
                if (!col) return a.Column.new(field, vector);

                return a.Column.new(field, ...col.chunks, vector);
            }
        );

        this._table = a.Table.new(...columns);
    }

    sum(field: string): bigint {
        const col = this._table?.getColumn(field);
        if (!col) throw new Error(`Missing column ${field}`);

        let sum = BigInt(0);
        const numChunks = col.chunks.length;
        for (let i = 0; i < numChunks; i++) {
            const chunk = col.chunks[i] as a.Float64Vector;
            const chunkLen = chunk.length;
            for (let j = 0; j < chunkLen; j++) {
                const value = chunk.get(j);
                if (value != null) {
                    sum += typeof value !== 'bigint' ? BigInt(value) : value;
                }
            }
        }
        return sum;
    }

    transform(field: string, action: TransformAction): number {
        const col = this._table?.getColumn(field);
        if (!col) return Number.NaN;

        const numChunks = col.chunks.length;
        for (let i = 0; i < numChunks; i++) {
            const chunk = col.chunks[i] as a.Utf8Vector;
            const chunkLen = chunk.length;
            for (let j = 0; j < chunkLen; j++) {
                const val = transformActions[action](chunk.get(j));
                chunk.set(j, val);
            }
        }
        return col.length - col.nullCount;
    }

    filter(...matches: FilterMatch[]): number {
        if (!this._table) return -1;

        const predicate = a.predicate.and(
            ...matches.map((match) => {
                const op = match.operator ?? 'eq';
                const col = a.predicate.col(match.field);
                return col[op](match.value);
            })
        );
        const filtered = this._table.filter(predicate);
        return filtered.count();
    }

    toJSON(): Record<string, unknown>[] {
        if (!this._table) return [];
        return ArrowTable.toJSON(this._table);
    }

    private _getField(name: string, config: dt.FieldTypeConfig): a.Field {
        const type = this._getType(config.type);
        const field = new a.Field(name, type, true);
        if (!config.array) return field;
        return new a.Field(name, new a.List(field), true);
    }

    /**
     * @todo handle objects
     * @todo handle geo
     * @todo handle dates
    */
    private _getType(type: dt.AvailableType): a.DataType {
        switch (type) {
            case 'Boolean':
                return new a.Bool();
            case 'Integer':
            case 'Number':
            case 'Float':
            case 'Double':
                return new a.Float64();
            case 'Byte':
                return new a.Int8();
            case 'Short':
                return new a.Int16();
            case 'Long':
                return new a.Int64();
            default:
                return new a.Utf8();
        }
    }
}

function hasOwn<T extends Record<string, unknown>, K extends(keyof T)>(obj: T, key: K) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
