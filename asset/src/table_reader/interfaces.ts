import { OpConfig } from '@terascope/job-components';

export interface TableReaderConfig extends OpConfig {
    passthrough_slice: boolean;
    total: number;
    batch_size: number;
}
