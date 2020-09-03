export enum TableType {
    json = 'json',
    simple = 'simple',
    arrow = 'arrow',
}

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
    toLowerCase = 'toLowerCase',
    increment = 'increment',
    decrement = 'decrement',
}

export interface TableAPI {
    insert(records: Record<string, any>[]): Promise<void>;

    sum(field: string): Promise<bigint>;

    transform(field: string, action: TransformAction): Promise<number>;

    filter(...matches: FilterMatch[]): Promise<number>;

    toJSON(): Record<string, any>[];
}
