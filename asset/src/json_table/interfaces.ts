import { FieldTypeConfig } from '@terascope/data-types';
import { APIConfig } from '@terascope/job-components';

export interface JSONTableConfig extends APIConfig {
    type_config: [string, FieldTypeConfig][];
}
