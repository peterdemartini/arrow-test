/* eslint-disable @typescript-eslint/prefer-for-of */
/* global BigInt */
import * as dt from '@terascope/data-types';
import {
    DataEntity, times
} from '@terascope/job-components';
import { FilterMatch, TableAPI, TransformAction } from './interfaces';
import { createFilterMatchFn, transformActions } from './utils';

type Maybe<T> = T|null;
type Column<T = unknown> = ReadonlyArray<Maybe<T>>;
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
        const fieldsLen = this.schema.length;

        const fieldValues: (unknown[])[] = times(fieldsLen, () => Array(len));
        for (let i = 0; i < len; i++) {
            for (let j = 0; j < fieldsLen; j++) {
                const [field] = this.schema[j];
                fieldValues[j][i] = records[i][field] ?? null;
            }
        }
        for (let j = 0; j < fieldsLen; j++) {
            const [field] = this.schema[j];
            this._table[field] = this._table[field].concat(fieldValues[j]);
        }
        this.length += len;
    }

    sum(field: string): bigint {
        const col = this.getColumn<number>(field, true);
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
        const col = this.getColumn(field, true);
        let count = 0;

        const newCol: unknown[] = Array(this.length);
        for (let i = 0; i < this.length; i++) {
            const value = transformActions[action](col[i]);
            if (value != null) count++;
            newCol[i] = value;
        }
        this._table[field] = newCol;
        return count;
    }

    filter(...matches: FilterMatch[]): number {
        if (!matches.length) return 0;

        const fieldMatchers = createFilterMatchFn(matches);

        const filtered: Record<string, unknown>[] = [];
        for (let i = 0; i < this.length; i++) {
            const matched = fieldMatchers.every(
                ([field, fn]) => fn(this.getValue(field, i))
            );
            if (matched) filtered.push(this.getRow(i));
        }

        return filtered.length;
    }

    getRow(index: number): Record<string, unknown> {
        const entries = this.schema.map(([field]) => [field, this.getValue(field, index)]);
        return Object.fromEntries(entries);
    }

    getValue<T>(field: string, index: number): Maybe<T> {
        return this._table[field][index] as Maybe<T>;
    }

    getColumn<T>(name: string, throwOnMissing: true): Column<T>;
    getColumn<T>(name: string, throwOnMissing: false): Column<T>|undefined;
    getColumn<T>(name: string, throwOnMissing: boolean): Column<T>|undefined {
        const col = this._table[name] as Column<T>|undefined;
        if (!col) {
            if (!throwOnMissing) return;
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
