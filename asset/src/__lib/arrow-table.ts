import * as a from 'apache-arrow';
import type * as dt from '@terascope/data-types';
import { FilterMatch, TableAPI, TransformAction } from './interfaces';
import { transformActions } from './utils';

export class ArrowTable implements TableAPI {
    private schema: a.Schema;
    private builders: Record<string, a.Builder> = {};

    private _table: a.Table = a.Table.empty();

    constructor(typeConfig: [string, dt.FieldTypeConfig][]) {
        this.schema = new a.Schema(typeConfig.map(
            ([name, config]) => this._getField(name, config)
        ));
        this.schema.fields.forEach((field) => {
            this.builders[field.name] = a.Builder.new({ type: field.type, nullValues: [null] });
        });
    }

    insert(records: Record<string, any>[]): void {
        const len = records.length;

        const builders = Object.entries(this.builders);

        for (let i = 0; i < len; i++) {
            const record = records[i];
            for (const [field, builder] of builders) {
                builder.append(record[field] ?? null);
            }
        }

        const columns = builders.map(
            ([field, builder]) => {
                const vector = builder.finish().toVector();
                const col = this._table.getColumn(field);
                if (!col) return a.Column.new(field, vector);

                return a.Column.new(field, ...col.chunks, vector);
            }
        );

        this._table = a.Table.new(columns);
    }

    sum(field: string): bigint {
        const col = this._table.getColumn(field);
        if (!col) throw new Error(`Missing column for field ${field}`);

        let sum = BigInt(0);
        for (const value of col) {
            if (value != null) {
                sum += typeof value !== 'bigint' ? BigInt(value) : value;
            }
        }
        return sum;
    }

    transform(field: string, action: TransformAction): number {
        const col = this._transformColumn(field, action);

        const columns = this.schema.fields.map((f, i) => {
            if (f.name === field) return col;
            return this._table.getColumnAt(i) as a.Column;
        });

        this._table = a.Table.new(columns);
        return col.length - col.nullCount;
    }

    private _transformColumn(field: string, action: TransformAction): a.Vector {
        const builder = this.builders[field];

        const col = this._table.getColumn(field);
        if (!col) throw new Error(`Missing column for field ${field}`);

        function transformAndAppend(value: unknown): void {
            builder.append(transformActions[action](value));
        }

        for (const value of col) { transformAndAppend(value); }

        const vector = builder.finish().toVector();
        return a.Column.new(col.field, vector);
    }

    filter(...matches: FilterMatch[]): number {
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
        const records: Record<string, unknown>[] = [];

        const colNames = this._table.schema.fields.map((f) => f.name);

        for (const row of this._table) {
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
