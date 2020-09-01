import { OpConfig } from '@terascope/job-components';

export interface TableReaderConfig extends OpConfig {
    total: number;
    batch_size: number;
}
