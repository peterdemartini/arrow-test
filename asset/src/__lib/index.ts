import type { FieldTypeConfig } from '@terascope/data-types';
import { TableAPI, TableType } from './interfaces';
import { ArrowTable } from './arrow-table';
import { JSONTable } from './json-table';
import { SimpleTable } from './simple-table';

export * from './arrow-table';
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
    throw new Error(`Unknown Table API Type ${type}`);
}
