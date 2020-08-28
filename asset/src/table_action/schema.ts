import { ConvictSchema } from '@terascope/job-components';
import { TableAction } from '../__lib/interfaces';
import { TableActionConfig } from './interfaces';

export default class Schema extends ConvictSchema<TableActionConfig> {
    build(): Record<string, any> {
        return {
            table: {
                doc: 'The name of the table API to use',
                default: 'arrow_table',
            },
            action: {
                doc: 'Select the table action you want to perform',
                default: TableAction.store,
                format: (val: unknown) => {
                    if (typeof val === 'string' && val in TableAction) return;
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
