import {
    BatchProcessor, DataEntity
} from '@terascope/job-components';
import { ArrowTable } from '../__lib/arrow-table';
import { TableAction } from '../__lib/interfaces';
import { TableActionConfig } from './interfaces';

export default class ArrowTableAction extends BatchProcessor<TableActionConfig> {
    async onBatch(records: DataEntity[]): Promise<DataEntity[]> {
        const api = this.getAPI<ArrowTable>(this.opConfig.table_api);
        if (this.opConfig.action === TableAction.store) {
            api.insert(records);
        } else if (this.opConfig.action === TableAction.sum) {
            const sum = api.sum(this.opConfig.args[0]);
            this.logger.debug(`Action sum result "${sum}"`);
            return [
                DataEntity.make({ sum })
            ];
        } else if (this.opConfig.action === TableAction.filter) {
            const count = api.filter(...this.opConfig.args);
            this.logger.debug(`Action filtered result "${count}"`);
            return [
                DataEntity.make({ count })
            ];
        } else if (this.opConfig.action === TableAction.transform) {
            const transformed = api.transform(this.opConfig.args[0], this.opConfig.args[1]);
            this.logger.debug(`Action transform result "${transformed}"`);
            return [
                DataEntity.make({ transformed })
            ];
        }
        return records;
    }
}
