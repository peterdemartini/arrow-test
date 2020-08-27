import {
    BatchProcessor, DataEntity
} from '@terascope/job-components';
import { ArrowTable } from '../__lib/arrow-table';
import { ArrowTableActionConfig } from './interfaces';

export default class ArrowTableAction extends BatchProcessor<ArrowTableActionConfig> {
    async onBatch(records: DataEntity[]): Promise<DataEntity[]> {
        const api = this.getAPI<ArrowTable>('arrow_table');
        if (this.opConfig.action === 'store') {
            api.concat(records);
        }
        return records;
    }
}
