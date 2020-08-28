import { DataEntity } from '@terascope/job-components';

export enum TableAction {
    store = 'store',
    sum = 'sum',
    filter = 'filter',
}

export type FilterMatch = {
    field: string;
    value: any;
    operator?: 'eq'|'ge'|'gt'|'le'|'lt'|'ne';
};

export interface TableAPI {
    insert(records: DataEntity[]): void;

    sum(field: string): number;

    filter(...matches: FilterMatch[]): Record<string, any>[];

    toJSON(): Record<string, any>[];
}
