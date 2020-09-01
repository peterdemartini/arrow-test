import { OperationAPI } from '@terascope/job-components';
import { TableConfig, TableType } from './interfaces';
import { ArrowTable } from '../__lib/arrow-table';
import { JSONTable } from '../__lib/json-table';
import { TableAPI } from '../__lib/interfaces';
import { SimpleTable } from '../__lib/simple-table';

export default class TableOperationAPI extends OperationAPI<TableConfig> {
    async createAPI(): Promise<TableAPI> {
        const { type, type_config } = this.apiConfig;
        if (type === TableType.arrow) {
            return new ArrowTable(type_config);
        }
        if (type === TableType.json) {
            return new JSONTable(type_config);
        }
        if (type === TableType.simple) {
            return new SimpleTable(type_config);
        }
        throw new Error(`Unknown Table API Type ${type}`);
    }
}
