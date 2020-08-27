import * as a from 'apache-arrow';
import * as dt from '@terascope/data-types';
import {
    DataEntity, times
} from '@terascope/job-components';

export class ArrowTable {
    readonly typeConfig: dt.TypeConfigFields;
    readonly schema: a.Schema;

    private _table: a.Table|undefined;

    constructor(typeConfig: dt.TypeConfigFields) {
        this.typeConfig = typeConfig;

        this.schema = new a.Schema(Object.entries(typeConfig).map(
            ([name, config]) => this._getField(name, config)
        ));
    }

    concat(records: DataEntity[]): void {
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

        const newTable = a.Table.new(...columns);
        this._table = newTable;
    }

    sum(field: string): number {
        const col = this._table?.getColumn(field);
        if (!col) return Number.NaN;
        if (!a.DataType.isInt(col.type) && !a.DataType.isFloat(col.type)) {
            return Number.NaN;
        }
        let sum = 0;
        for (const val of col) {
            sum += val != null ? val : 0;
        }
        return sum;
    }

    /**
     * @todo handle objects
     * @todo handle geo
    */
    private _getField(name: string, config: dt.FieldTypeConfig): a.Field {
        const type = this._getType(config.type);
        const field = new a.Field(name, type, true);
        if (!config.array) return field;
        return new a.Field(name, new a.List(field), true);
    }

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

    toJSON(): any[] {
        if (!this._table) return [];
        const records: any[] = [];

        const colNames = times(this._table.numCols, (i) => this._table!.getColumnAt(i))
            .filter((col): col is a.Column => col != null)
            .map((col) => col.name);

        for (const row of this._table) {
            const record: Record<string, any> = {};
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
}

function hasOwn<T extends Record<string, any>, K extends(keyof T)>(obj: T, key: K) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
