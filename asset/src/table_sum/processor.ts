import {
    BatchProcessor, DataEntity
} from '@terascope/job-components';
import { TableAPI } from '../__lib/interfaces';
import { SumActionConfig } from './interfaces';

export default class TableSumAction extends BatchProcessor<SumActionConfig> {
    async onBatch(): Promise<DataEntity[]> {
        const api = this.getAPI<TableAPI>('table');
        const sum = api.sum(this.opConfig.field);
        this.logger.debug(`[ACTION] sum result: ${sum}`);
        return [
            DataEntity.make({ sum })
        ];
    }
}
