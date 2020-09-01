import { ConvictSchema } from '@terascope/job-components';
import { TableReaderConfig } from './interfaces';

export default class Schema extends ConvictSchema<TableReaderConfig> {
    build(): Record<string, any> {
        return {
            total: {
                doc: 'The total number of records to read',
                format: 'nat',
                default: 5_000_000
            },
            batch_size: {
                doc: 'The number of records to read per fetch',
                format: 'nat',
                default: 5000
            }
        };
    }
}
