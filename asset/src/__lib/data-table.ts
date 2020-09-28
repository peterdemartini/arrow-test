import type * as dt from '@terascope/data-types';
import { DataFrame, ColumnTransform } from '@terascope/data-mate';
import { FilterMatch, TableAPI, TransformAction } from './interfaces';
import { matchers } from './utils';

export class DataTable implements TableAPI {
    private _table: DataFrame;

    constructor(typeConfig: [string, dt.FieldTypeConfig][]) {
        this._table = DataFrame.fromJSON<any>(
            {
                fields: Object.fromEntries(typeConfig) as any
            },
            []
        );
    }

    get schema(): dt.DataTypeConfig {
        return this._table.config;
    }

    async insert(records: Record<string, any>[]): Promise<void> {
        this._table = this._table.concat(records);
    }

    async sum(field: string): Promise<bigint> {
        return BigInt(this._table.getColumn(field)!.sum());
    }

    async transform(field: string, action: TransformAction): Promise<void> {
        const col = this._table.getColumn(field)!;
        this._table = this._table.assign([
            col.transform(ColumnTransform[action])
        ]);
    }

    async filter(...matches: FilterMatch[]): Promise<number> {
        const filtered = this._table.filterBy(Object.fromEntries(matches.map((match) => {
            const op = matchers[match.operator ?? 'eq'];
            return [match.field, (value: any) => op(value, match.value)];
        })));
        return filtered.count();
    }

    toJSON(): Record<string, unknown>[] {
        return this._table.toJSON();
    }
}
