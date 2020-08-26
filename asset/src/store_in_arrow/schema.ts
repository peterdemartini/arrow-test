import { ConvictSchema } from '@terascope/job-components';
import { StoreInArrowConfig } from './interfaces';

export default class Schema extends ConvictSchema<StoreInArrowConfig> {
    build(): Record<string, any> {
        return {
        };
    }
}
