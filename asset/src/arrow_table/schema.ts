import { ConvictSchema } from '@terascope/job-components';
import { ArrowTableConfig } from './interfaces';

export default class Schema extends ConvictSchema<ArrowTableConfig> {
    build(): Record<string, any> {
        return {
            type_config: {
                doc: 'The data type field configuration entries',
                default: [],
                format: (arg: unknown) => {
                    if (!Array.isArray(arg)) {
                        throw new Error('type_config must be an array');
                    }
                    Object.fromEntries(arg);
                }
            }
        };
    }
}
