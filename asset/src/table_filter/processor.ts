import {
    BatchProcessor, DataEntity
} from '@terascope/job-components';
import { TableAPI } from '../__lib/interfaces';
import { FilterActionConfig } from './interfaces';

export default class TableFilterAction extends BatchProcessor<FilterActionConfig> {
    async onBatch(): Promise<DataEntity[]> {
        const api = this.getAPI<TableAPI>('table');
        const count = api.filter(...this.opConfig.filters);
        this.logger.debug(`[ACTION] filtered result: ${count}`);
        return [
            DataEntity.make({ count })
        ];
    }
}
