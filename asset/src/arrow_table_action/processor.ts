import {
    BatchProcessor, DataEntity
} from '@terascope/job-components';
import { ArrowTable } from '../__lib/arrow-table';
import { Action, ArrowTableActionConfig } from './interfaces';

export default class ArrowTableAction extends BatchProcessor<ArrowTableActionConfig> {
    async onBatch(records: DataEntity[]): Promise<DataEntity[]> {
        const api = this.getAPI<ArrowTable>('arrow_table');
        if (this.opConfig.action === Action.store) {
            api.concat(records);
        } else if (this.opConfig.action === Action.sum) {
            return [
                DataEntity.make({ sum: api.sum(this.opConfig.args[0]) })
            ];
        } else if (this.opConfig.action === Action.filter) {
            const result = api.filter(...this.opConfig.args);
            return DataEntity.makeArray(result);
        }
        return records;
    }
}
