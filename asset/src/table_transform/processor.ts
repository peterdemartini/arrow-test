import {
    BatchProcessor, DataEntity
} from '@terascope/job-components';
import { TableAPI } from '../__lib/interfaces';
import { TransformActionConfig } from './interfaces';

export default class TableTransformAction extends BatchProcessor<TransformActionConfig> {
    async onBatch(): Promise<DataEntity[]> {
        const api = this.getAPI<TableAPI>('table');
        const transformed = await api.transform(this.opConfig.field, this.opConfig.fn);
        this.logger.debug(`[ACTION] transform result: ${transformed}`);
        return [
            DataEntity.make({ transformed })
        ];
    }
}
