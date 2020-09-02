import { ConvictSchema } from '@terascope/job-components';
import { SumActionConfig } from './interfaces';

export default class Schema extends ConvictSchema<SumActionConfig> {
    build(): Record<string, any> {
        return {
            field: {
                doc: 'Field to transform',
                default: null,
                format: 'required_String',
            },
        };
    }
}
