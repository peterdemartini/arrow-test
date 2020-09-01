import { ConvictSchema } from '@terascope/job-components';
import { TableConfig } from './interfaces';

export default class Schema extends ConvictSchema<TableConfig> {
    build(): Record<string, any> {
        return {
            type: {
                doc: 'The Table API config',
                default: null,
                format: 'required_String'
            },
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
