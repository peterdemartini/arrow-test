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

    async fetch({ count }: SliceRequest): Promise<DataEntity[]> {
        if (typeof count !== 'number') throw new Error('Invalid count for slice input');

        const api = this.getAPI<TableAPI>('table');

        const results: DataEntity[] = [];
        for (let i = 0; i < count; i++) {
            if (this.offset > (this.data.length - 1)) this.offset = 0;
            const doc = this.data[this.offset++];
            results.push(DataEntity.make(doc));
        }

        await pDelay(500);
        api.insert(results);

        return results;
    }
}
