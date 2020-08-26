import { MapProcessor, DataEntity, OpConfig } from '@terascope/job-components';
import { StoreInArrowConfig } from './interfaces';

export default class SetKey extends MapProcessor<StoreInArrowConfig> {
    map(doc: DataEntity): DataEntity {
        return doc;
    }
}
