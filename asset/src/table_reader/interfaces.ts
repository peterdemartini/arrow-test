import { OpConfig } from '@terascope/job-components';

export interface TableReaderConfig extends OpConfig {
    table_api: 'arrow_table'|'json_table';
    total: number;
    batch_size: number;
}
