import { OpConfig } from '@terascope/job-components';
import { TableAction } from '../__lib/interfaces';

export interface TableActionConfig extends OpConfig {
    table_api: 'arrow_table'|'json_table';
    action: TableAction;
    args: any[];
}
