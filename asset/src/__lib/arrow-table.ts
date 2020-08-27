import * as a from 'apache-arrow';
import * as dt from '@terascope/data-types';
import {
    DataEntity, mapValues, times
} from '@terascope/job-components';

type ArrowDT = ReturnType<ArrowTable['getArrowDataType']>;
export class ArrowTable {
    readonly typeConfig: dt.TypeConfigFields;
    readonly fieldTypes: Record<string, ArrowDT>;
    readonly schema: a.Schema;

    private _table: a.Table;

    constructor(typeConfig: dt.TypeConfigFields) {
        this.typeConfig = typeConfig;
        this.fieldTypes = mapValues(typeConfig, (config) => this.getArrowDataType(config));

        this.schema = new a.Schema(Object.keys(typeConfig).map((name) => {
            const { Type } = this.fieldTypes[name];
            return new a.Field(
                name, new Type(), true
            );
        }));
        this._table = a.Table.empty(this.schema);
    }

    concat(records: DataEntity[]): void {
        const len = records.length;
        const builders: Record<string, a.Builder> = Object.create(null);

        Object.entries(this.fieldTypes).forEach(([field, { Type, Builder }]) => {
            builders[field] = new (Builder as any)({
                type: new Type(), nullValues: [null]
            });
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
            ([field, builder]) => a.Column.new(field, builder.finish().toVector())
        );

        this._table = this._table.assign(a.Table.new(columns));
    }

    /**
     * @todo handle arrays
     * @todo handle objects
     * @todo handle geo
    */
    private getArrowDataType({ type }: dt.FieldTypeConfig) {
        switch (type) {
            case 'Boolean':
                return {
                    Type: a.Bool,
                    Builder: a.BoolBuilder,
                };
            case 'Integer':
            case 'Number':
            case 'Float':
            case 'Double':
                return {
                    Type: a.Float64,
                    Builder: a.Float64Builder,
                };
            case 'Byte':
                return {
                    Type: a.Int8,
                    Builder: a.Int8Builder,
                };
            case 'Short':
                return {
                    Type: a.Int16,
                    Builder: a.Int8Builder,
                };
            case 'Long':
                return {
                    Type: a.Int64,
                    Builder: a.Int64Builder,
                };
            default:
                return {
                    Type: a.Utf8,
                    Builder: a.Utf8Builder,
                };
        }
    }

    toJSON(): any[] {
        const records: any[] = [];
        const colNames = times(this._table.numCols, (i) => this._table.getColumnAt(i))
            .filter((col): col is a.Column => col != null)
            .map((col) => col.name);

        for (const row of this._table) {
            const record: Record<string, any> = {};
            for (const name of colNames) {
                record[name] = row.get(name);
            }
            records.push(record);
        }
        return records.slice();
    }
}

function hasOwn<T extends Record<string, any>, K extends(keyof T)>(obj: T, key: K) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
