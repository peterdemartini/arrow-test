import { FieldTypeConfig } from '@terascope/data-types';
import { APIConfig } from '@terascope/job-components';

export interface ArrowTableConfig extends APIConfig {
    type_config: [string, FieldTypeConfig][];
}
