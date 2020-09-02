import { FieldTypeConfig } from '@terascope/data-types';
import { APIConfig } from '@terascope/job-components';
import { TableType } from '../__lib';

export interface TableConfig extends APIConfig {
    type: TableType;
    type_config: [string, FieldTypeConfig][];
}
