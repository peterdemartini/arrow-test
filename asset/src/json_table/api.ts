import { OperationAPI } from '@terascope/job-components';
import { JSONTable } from '../__lib/json-table';
import { JSONTableConfig } from './interfaces';

export default class JSONTableAPI extends OperationAPI<JSONTableConfig> {
    async createAPI(): Promise<JSONTable> {
        return new JSONTable(this.apiConfig.type_config);
    }
}
