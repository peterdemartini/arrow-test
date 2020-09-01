import {
    SlicerRecoveryData, Slicer
} from '@terascope/job-components';
import { TableReaderConfig } from './interfaces';

export default class TableSlicer extends Slicer<TableReaderConfig> {
    remaining = 0;

    maxQueueLength(): number {
        return this.executionConfig.workers;
    }

    async initialize(recoveryData: SlicerRecoveryData[]): Promise<void> {
        await super.initialize(recoveryData);
        this.remaining = Math.ceil(this.opConfig.total / this.opConfig.batch_size);
    }

    async slice(): Promise<{ count: number }|null> {
        if (this.executionConfig.lifecycle === 'once') {
            if (this.remaining <= 0) return null;
            this.remaining--;
        }

        return { count: this.opConfig.batch_size };
    }
}
