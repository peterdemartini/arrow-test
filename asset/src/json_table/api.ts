import { OperationAPI } from '@terascope/job-components';
import { ArrowTable } from '../__lib/arrow-table';
import { ArrowTableConfig } from './interfaces';

export default class ArrowTableAPI extends OperationAPI<ArrowTableConfig> {
    async createAPI(): Promise<ArrowTable> {
        return new ArrowTable(this.apiConfig.type_config);
    }
}
