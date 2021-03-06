import type * as dt from '@terascope/data-types';
import { filterObject, withoutNil } from '@terascope/utils';
import { FilterMatch, TableAPI, TransformAction } from './interfaces';
import { matchers, transformActions } from './utils';

type JSONTableArr = ReadonlyArray<Record<string, unknown>>;

export class JSONTable implements TableAPI {
    private schema: [string, dt.FieldTypeConfig][];

    private _table: JSONTableArr = [];

    constructor(typeConfig: [string, dt.FieldTypeConfig][]) {
        this.schema = typeConfig.slice();
    }

    async insert(records: Record<string, any>[]): Promise<void> {
        const table: Record<string, unknown>[] = [];

        const includes = this.schema.map(([field]) => field);
        for (const record of records) {
            table.push(filterObject(record, { includes }));
        }
        this._table = this._table.concat(table);
    }

    async sum(field: string): Promise<bigint> {
        let sum = BigInt(0);
        for (const record of this._table) {
            const value = record[field];
            if (value != null) {
                sum += typeof value !== 'bigint' ? BigInt(value) : value;
            }
        }
        return sum;
    }

    async transform(field: string, action: TransformAction): Promise<void> {
        this._table = this._table.map((record) => {
            record[field] = transformActions[action](record[field]);
            return record;
        });
    }

    async filter(...matches: FilterMatch[]): Promise<number> {
        const matchRecord = (record: Record<string, unknown>): boolean => matches.every((match) => {
            const op = matchers[match.operator ?? 'eq'];
            return op(record[match.field], match.value);
        });

        const filtered = this._table.filter(matchRecord);
        return filtered.length;
    }

    toJSON(): Record<string, unknown>[] {
        return JSON.parse(JSON.stringify(this._table)).map(withoutNil);
    }
}
