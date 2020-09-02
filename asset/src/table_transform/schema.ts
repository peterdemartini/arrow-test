import { ConvictSchema } from '@terascope/job-components';
import { TransformAction } from '../__lib/interfaces';
import { TransformActionConfig } from './interfaces';

export default class Schema extends ConvictSchema<TransformActionConfig> {
    build(): Record<string, any> {
        return {
            field: {
                doc: 'Field to transform',
                default: null,
                format: 'required_String',
            },
            fn: {
                doc: 'Transformation function to use',
                default: null,
                format: (val: unknown) => {
                    if (typeof val === 'string' && val in TransformAction) return;
                    throw new Error('Invalid action given');
                }
            }
        };
    }
}
