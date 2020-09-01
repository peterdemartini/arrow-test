/* eslint-disable @typescript-eslint/prefer-for-of */
/* global BigInt */
import * as dt from '@terascope/data-types';
import { FieldTypeConfig } from '@terascope/data-types';
import {
    DataEntity
} from '@terascope/job-components';
import { FilterMatch, TableAPI, TransformAction } from './interfaces';
import { matchers, transformActions } from './utils';

type Maybe<T> = T|null;
type SimpleField<T = unknown> = Readonly<{
    config: FieldTypeConfig;
    values: ReadonlyArray<Maybe<T>>
}>
type SimpleFields = Map<string, SimpleField>;

export class SimpleTable implements TableAPI {
    private length = 0;
    private readonly _table: SimpleFields;

    constructor(typeConfig: [string, dt.FieldTypeConfig][]) {
        this._table = new Map(typeConfig.map(
            ([field, config]) => [field, { config, values: [] }]
        ));
    }

    insert(records: DataEntity[]): void {
        const len = records.length;
        const fieldValues: Record<string, Maybe<unknown>[]> = Object.fromEntries([
            ...this._table.keys()
        ].map((field) => [field, Array(len)]));

        for (let i = 0; i < len; i++) {
            for (const field of this._table.keys()) {
                fieldValues[field][i] = records[i][field] ?? null;
            }
        }
        for (const [field, { config, values }] of this._table) {
            this._table.set(field, {
                config,
                values: values.concat(fieldValues[field])
            });
        }
        this.length += len;
    }

    sum(field: string): bigint {
        const col = this._table.get(field);
        if (!col) throw new Error(`Expected column ${field}`);

        return col.values.reduce(sumFn, BigInt(0));
    }

    transform(field: string, action: TransformAction): number {
        const col = this._table.get(field);
        if (!col) throw new Error(`Expected column ${field}`);
        let count = 0;
        const values = col.values.map((val) => {
            const tVal = transformActions[action](val);
            if (tVal != null) count++;
            return tVal;
        });
        this._table.set(field, {
            config: col.config,
            values
        });
        return count;
    }

    filter(...matches: FilterMatch[]): number {
        if (!matches.length) return 0;

        type Grouped = Record<string, (value: unknown) => boolean>;
        const fieldMatchers = matches.reduce((acc, m) => {
            const prev = acc[m.field];
            acc[m.field] = (value: unknown): boolean => {
                const op = matchers[m.operator ?? 'eq'];
                if (!op(value, m.value)) return false;
                return prev ? prev(value) : true;
            };
            return acc;
        }, Object.create(null) as Grouped);

        const filtered: Record<string, unknown>[] = [];
        for (let i = 0; i < this.length; i++) {
            let matched = true;
            // eslint-disable-next-line guard-for-in
            for (const field in fieldMatchers) {
                if (!matched) continue;
                const fn = fieldMatchers[field];
                const val = this.getValue(field, i);
                if (!fn(val)) {
                    matched = false;
                }
            }
            if (matched) filtered.push(this.getRow(i));
        }

        return filtered.length;
    }

    getRow(index: number): Record<string, unknown> {
        const row: Record<string, unknown> = {};
        for (const [field, { values }] of this._table) {
            row[field] = values[index];
        }
        return row;
    }

    getValue<T>(field: string, index: number): Maybe<T> {
        return this._table.get(field)!.values[index] as Maybe<T>;
    }

    toJSON(): Record<string, unknown>[] {
        const records: Record<string, unknown>[] = Array(this.length);
        for (let i = 0; i < this.length; i++) {
            records[i] = this.getRow(i);
        }
        return records;
    }
}

function sumFn(acc: bigint, curr: unknown): bigint {
    if (curr == null) return acc;
    return acc + BigInt(curr);
}
