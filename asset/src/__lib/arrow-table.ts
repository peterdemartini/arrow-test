import * as a from 'apache-arrow';
import * as dt from '@terascope/data-types';
import { times } from '@terascope/utils';
import { FilterMatch, TableAPI, TransformAction } from './interfaces';
import { transformActions } from './utils';

export class ArrowTable implements TableAPI {
    private schema: a.Schema;
    private builders: Record<string, a.Builder> = {};

    private _table: a.Table = a.Table.empty();

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
                builder.clear();
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
        const log = process.env.LOG_TIMES === 'true';
        if (log) console.time('init');
        const builder = this.builders[field];

        const col = this._table.getColumn(field);
        if (!col) throw new Error(`Missing column for field ${field}`);
        if (log) console.timeEnd('init');

        if (log) console.time('chunks');
        let x = 0;
        for (const chunk of col.toArray()) {
            if (log && x++ % 1000 === 0) {
                console.time('transform');
                const val = transformActions[action](chunk);
                console.timeEnd('transform');
                console.time('append');
                builder.append(val);
                console.timeEnd('append');
            } else {
                builder.append(transformActions[action](chunk));
            }
        }
        if (log) console.timeEnd('chunks');
        if (log) console.time('finish builder');
        const vector = builder.finish().toVector();
        builder.clear();
        const result = vector.length - vector.nullCount;
        if (log) console.timeEnd('finish builder');

        if (log) console.time('create column');
        const schemaField = this.schema.fields.find((f) => f.name === field)!;
        const newCol = a.Column.new(schemaField, vector);
        if (log) console.timeEnd('create column');

        if (log) console.time('select columns');
        const columns = this.schema.fields.map((f, i) => {
            if (f.name === field) return newCol;
            return this._table.getColumnAt(i);
        }).filter((c): c is a.Column => c != null);
        if (log) console.timeEnd('select columns');

        if (log) console.time('new table');
        this._table = a.Table.new(columns);
        if (log) console.timeEnd('new table');
        return result;
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
