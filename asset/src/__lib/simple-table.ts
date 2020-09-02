/* eslint-disable @typescript-eslint/prefer-for-of */
/* global BigInt */
import * as dt from '@terascope/data-types';
import { DataEntity } from '@terascope/job-components';
import { FilterMatch, TableAPI, TransformAction } from './interfaces';
import { matchers, transformActions } from './utils';

type Maybe<T> = T|null;
type Column<T = unknown> = Maybe<T>[];
type SimpleFields = Record<string, Column<unknown>>;

export class SimpleTable implements TableAPI {
    private length = 0;
    private schema: [string, dt.FieldTypeConfig][];
    private readonly _table: SimpleFields;

    constructor(typeConfig: [string, dt.FieldTypeConfig][]) {
        this.schema = typeConfig.slice();
        this._table = Object.fromEntries(typeConfig.map(
            ([field]) => [field, [] as Column]
        ));
    }

    insert(records: DataEntity[]): void {
        const len = records.length;

        for (let i = 0; i < len; i++) {
            for (const [field] of this.schema) {
                this._table[field].push(records[i][field] ?? null);
            }
            this.length++;
        }
    }

    sum(field: string): bigint {
        const col = this.getColumn<number>(field);
        let sum = BigInt(0);
        for (let i = 0; i < this.length; i++) {
            const value = col[i];
            if (value != null) {
                sum += BigInt(value);
            }
        }
        return sum;
    }

    transform(field: string, action: TransformAction): number {
        const col = this.getColumn(field);
        let count = 0;

        for (let i = 0; i < this.length; i++) {
            const value = transformActions[action](col[i]);
            if (value != null) count++;
            col[i] = value;
        }
        return count;
    }

    filter(...matches: FilterMatch[]): number {
        if (!matches.length) return 0;

        const otherFields = this.schema
            .filter(([field]) => !matches.some((m) => field === m.field))
            .map(([field]) => field);

        const filtered: Record<string, unknown>[] = [];

        for (let i = 0; i < this.length; i++) {
            const row: Record<string, unknown> = {};
            const matched = matches.every((match) => {
                const op = matchers[match.operator ?? 'eq'];
                let val: unknown;
                if (match.field in row) {
                    val = row[match.field];
                } else {
                    val = this.getValue(match.field, i);
                    row[match.field] = val;
                }
                return op(val, match.value);
            });

            if (matched) {
                for (const field of otherFields) {
                    row[field] = this._table[field][i];
                }
                filtered.push(row);
            }
        }

        return filtered.length;
    }

    getRow(index: number): Record<string, unknown> {
        const row: Record<string, unknown> = {};
        for (const [field] of this.schema) {
            row[field] = this._table[field][index];
        }
        return row;
    }

    getValue<T>(field: string, index: number): Maybe<T> {
        return this._table[field][index] as Maybe<T>;
    }

    getColumn<T>(name: string): Column<T> {
        const col = this._table[name] as Column<T>;
        if (!col) {
            throw new Error(`Missing column for ${name}`);
        }
        return col;
    }

    toJSON(): Record<string, unknown>[] {
        const records: Record<string, unknown>[] = Array(this.length);
        for (let i = 0; i < this.length; i++) {
            records[i] = this.getRow(i);
        }
        return records;
    }
}
