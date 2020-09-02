import { DataEntity } from '@terascope/job-components';

export enum TableAction {
    sum = 'sum',
    filter = 'filter',
    transform = 'transform'
}

export type FilterMatch = {
    field: string;
    value: any;
    operator?: 'eq'|'ge'|'gt'|'le'|'lt'|'ne';
};

export enum TransformAction {
    toUpperCase = 'toUpperCase',
    toLowerCase ='toLowerCase'
}

export interface TableAPI {
    insert(records: DataEntity[]): void;

    sum(field: string): bigint;

    transform(field: string, action: TransformAction): number;

    filter(...matches: FilterMatch[]): number;

    toJSON(): Record<string, any>[];
}
