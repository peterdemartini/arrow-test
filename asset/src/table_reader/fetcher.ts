import fs from 'fs';
import path from 'path';
import {
    Fetcher, DataEntity, SliceRequest, pDelay
} from '@terascope/job-components';
import { TableReaderConfig } from './interfaces';
import { TableAPI } from '../__lib/interfaces';

export default class TableFetcher extends Fetcher<TableReaderConfig> {
    data: Record<string, any>[] = [];
    offset = 0;

    async initialize(): Promise<void> {
        const basePath = await this.context.apis.assets.getPath('arrow-test');
        const filePath = path.join(basePath, 'people.json');
        this.data = await new Promise<Record<string, any>[]>((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) reject(err);
                else resolve(JSON.parse(data));
            });
        });
        await super.initialize();
    }

    async fetch(slice: SliceRequest): Promise<DataEntity[]> {
        const api = this.getAPI<TableAPI>('table');
        if (this.opConfig.passthrough_slice) {
            if (!Array.isArray(slice)) {
                throw new Error('Test, when passthrough_slice is set to true it expects an array');
            }
            api.insert(slice);
            return slice as any[];
        }
        if (typeof slice.count !== 'number') {
            throw new Error('Invalid count for slice input');
        }

        const results: DataEntity[] = [];
        for (let i = 0; i < slice.count; i++) {
            if (this.offset > (this.data.length - 1)) this.offset = 0;
            const doc = this.data[this.offset++];
            results.push(DataEntity.make(doc));
        }

        await pDelay(10);
        api.insert(results);
        await pDelay(10);

        return results;
    }
}
