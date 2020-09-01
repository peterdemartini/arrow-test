import { OpConfig } from '@terascope/job-components';
import { TableAction } from '../__lib/interfaces';

export interface TableActionConfig extends OpConfig {
    action: TableAction;
    args: any[];
}
