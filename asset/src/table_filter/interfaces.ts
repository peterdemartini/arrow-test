import { OpConfig } from '@terascope/job-components';
import { FilterMatch } from '../__lib/interfaces';

export interface FilterActionConfig extends OpConfig {
    filters: FilterMatch[]
}
