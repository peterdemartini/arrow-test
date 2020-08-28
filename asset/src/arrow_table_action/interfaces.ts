import { OpConfig } from '@terascope/job-components';

export enum Action {
    store = 'store',
    sum = 'sum',
    filter = 'filter',
}
export interface ArrowTableActionConfig extends OpConfig {
    action: Action;
    args: any[];
}
