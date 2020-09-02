import { OperationAPI } from '@terascope/job-components';
import { TableConfig } from './interfaces';
import { TableAPI } from '../__lib/interfaces';
import { newTable } from '../__lib';

export default class TableOperationAPI extends OperationAPI<TableConfig> {
    async createAPI(): Promise<TableAPI> {
        return newTable(this.apiConfig.type, this.apiConfig.type_config);
    }
}
