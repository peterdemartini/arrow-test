import { OpConfig } from '@terascope/job-components';
import { TransformAction } from '../__lib/interfaces';

export interface TransformActionConfig extends OpConfig {
    field: string;
    fn: TransformAction;
}
