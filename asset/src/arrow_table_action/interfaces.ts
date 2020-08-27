import { OpConfig } from '@terascope/job-components';

export enum Action {
    store = 'store',
    sum = 'sum',
}
export interface ArrowTableActionConfig extends OpConfig {
    action: Action;
}
