import { ConvictSchema } from '@terascope/job-components';
import { Action, ArrowTableActionConfig } from './interfaces';

export default class Schema extends ConvictSchema<ArrowTableActionConfig> {
    build(): Record<string, any> {
        return {
            action: {
                doc: 'Select the arrow table action you want to perform',
                default: Action.store,
                format: (val: unknown) => {
                    if (typeof val === 'string' && val in Action) return;
                    throw new Error('Invalid action given');
                }
            },
            args: {
                doc: 'An array of arguments for the table action',
                default: [],
                format: Array,
            }
        };
    }
}
