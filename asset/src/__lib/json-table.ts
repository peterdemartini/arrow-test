/* global BigInt */
import * as dt from '@terascope/data-types';
import {
    DataEntity, filterObject
} from '@terascope/job-components';
import { FilterMatch, TableAPI, TransformAction } from './interfaces';
import { transformActions } from './utils';

type JSONTableArr = ReadonlyArray<Record<string, unknown>>;

export class JSONTable implements TableAPI {
    readonly schema: [string, dt.FieldTypeConfig][];

    private _table: JSONTableArr = [];
    private _matchers = Object.freeze({
        eq(a: any, b: any) {
            return Object.is(a, b);
        },
        ge(a: any, b: any) {
            return a >= b;
        },
        gt(a: any, b: any) {
            return a > b;
        },
        le(a: any, b: any) {
            return a <= b;
        },
        lt(a: any, b: any) {
            return a < b;
        },
        ne(a: any, b: any) {
            return !Object.is(a, b);
        }
    })

    constructor(typeConfig: [string, dt.FieldTypeConfig][]) {
        this.schema = typeConfig.slice();
    }

    insert(records: DataEntity[]): void {
        const table: Record<string, unknown>[] = [];

        const includes = this.schema.map(([field]) => field);
        for (const record of records) {
            table.push(filterObject(record, { includes }));
        }
        this._table = this._table.concat(table);
    }

    sum(field: string): bigint {
        let sum = BigInt(0);
        for (const record of this._table) {
            const value = record[field];
            if (value != null) {
                sum += BigInt(value);
            }
        }
        return sum;
    }

    transform(field: string, action: TransformAction): number {
        let count = 0;
        this._table = this._table.map((record) => {
            record[field] = transformActions[action](record[field]);
            if (record[field] != null) count++;
            return record;
        });
        return count;
    }

    filter(...matches: FilterMatch[]): number {
        const matchRecord = (record: Record<string, unknown>): boolean => matches.every((match) => {
            const op = this._matchers[match.operator ?? 'eq'];
            return op(record[match.field], match.value);
        });

        const filtered = this._table.filter(matchRecord);
        return filtered.length;
    }

    toJSON(): Record<string, unknown>[] {
        return JSON.parse(JSON.stringify(this._table));
    }
}
