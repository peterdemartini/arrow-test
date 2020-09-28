import type { FieldTypeConfig } from '@terascope/data-types';
import { TableAPI, TableType } from './interfaces';
import { ArrowTable } from './arrow-table';
import { JSONTable } from './json-table';
import { SimpleTable } from './simple-table';
import { DataTable } from './data-table';

export * from './arrow-table';
export * from './data-table';
export * from './interfaces';
export * from './json-table';
export * from './simple-table';
export * from './utils';

export function newTable(type: TableType, typeConfig: [string, FieldTypeConfig][]): TableAPI {
    if (type === TableType.arrow) {
        return new ArrowTable(typeConfig);
    }
    if (type === TableType.json) {
        return new JSONTable(typeConfig);
    }
    if (type === TableType.simple) {
        return new SimpleTable(typeConfig);
    }
    if (type === TableType.data) {
        return new DataTable(typeConfig);
    }
    throw new Error(`Unknown Table API Type ${type}`);
}
