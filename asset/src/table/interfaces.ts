import { FieldTypeConfig } from '@terascope/data-types';
import { APIConfig } from '@terascope/job-components';

export enum TableType {
    arrow = 'arrow',
    json = 'json',
    simple = 'simple',
}

export interface TableConfig extends APIConfig {
    type: TableType;
    type_config: [string, FieldTypeConfig][];
}
