import { ConvictSchema } from '@terascope/job-components';
import { FilterActionConfig } from './interfaces';

export default class Schema extends ConvictSchema<FilterActionConfig> {
    build(): Record<string, any> {
        return {
            filters: {
                doc: 'An array of filter matches',
                default: [],
                format: Array,
            }
        };
    }
}
