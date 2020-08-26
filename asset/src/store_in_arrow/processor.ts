import {
    BatchProcessor, DataEntity
} from '@terascope/job-components';
import { ArrowTable } from '../__lib/arrow-table';
import { StoreInArrowConfig } from './interfaces';

export default class StoreInArrow extends BatchProcessor<StoreInArrowConfig> {
    async onBatch(records: DataEntity[]): Promise<DataEntity[]> {
        const api = this.getAPI<ArrowTable>('arrow_table');
        api.concat(records);
        return records;
    }
}
