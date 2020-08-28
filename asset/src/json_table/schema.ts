import { DataType, LATEST_VERSION } from '@terascope/data-types';
import { ConvictSchema } from '@terascope/job-components';
import { JSONTableConfig } from './interfaces';

export default class Schema extends ConvictSchema<JSONTableConfig> {
    build(): Record<string, any> {
        return {
            type_config: {
                doc: 'The data type field configuration entries',
                default: [],
                format: (arg: unknown) => {
                    if (!Array.isArray(arg)) {
                        throw new Error('type_config must be an array');
                    }
                    // validate the data type config
                    new DataType({
                        version: LATEST_VERSION,
                        fields: Object.fromEntries(arg)
                    });
                }
            }
        };
    }
}
