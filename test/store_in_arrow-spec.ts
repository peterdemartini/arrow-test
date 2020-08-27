import 'jest-extended';
import { Chance } from 'chance';
import { TypeConfigFields } from '@terascope/data-types';
import { WorkerTestHarness, newTestJobConfig } from 'teraslice-test-harness';
import { times } from '@terascope/job-components';
import { ArrowTableConfig } from '../asset/src/arrow_table/interfaces';
import { StoreInArrowConfig } from '../asset/src/store_in_arrow/interfaces';
import { ArrowTable } from '../asset/src/__lib/arrow-table';

const chance = new Chance();

describe('Store in Arrow', () => {
    let harness: WorkerTestHarness;

    let arrowTable: ArrowTable;
    async function makeTest(typeConfig: TypeConfigFields, config?: Partial<StoreInArrowConfig>) {
        const opConfig: StoreInArrowConfig = { _op: 'store_in_arrow', ...config };
        const apiConfig: ArrowTableConfig = { _name: 'arrow_table', type_config: Object.entries(typeConfig) };
        const job = newTestJobConfig({
            max_retries: 0,
            apis: [apiConfig],
            operations: [
                { _op: 'test-reader', passthrough_slice: true },
                opConfig
            ]
        });
        harness = new WorkerTestHarness(job);

        await harness.initialize();
        arrowTable = harness.getAPI<ArrowTable>('arrow_table');
    }

    afterEach(async () => {
        if (harness) await harness.shutdown();
    });

    it('should be able to store the input in arrow', async () => {
        await makeTest({
            _key: { type: 'Keyword' },
            keyword: { type: 'Keyword' },
            text: { type: 'Text' },
            bool: { type: 'Boolean' },
            byte: { type: 'Byte' },
            short: { type: 'Short' },
            int: { type: 'Integer' },
            float: { type: 'Float' },
        });

        const input = times(20, () => ({
            _key: chance.guid({ version: 4 }),
            keyword: chance.animal(),
            text: chance.paragraph(),
            bool: chance.bool(),
            byte: chance.integer({ min: -128, max: 127 }),
            short: chance.integer({ min: -32_768, max: 32_767 }),
            int: chance.integer(),
            float: chance.floating()
        }));
        const results = await harness.runSlice(input);

        expect(arrowTable.toJSON()).toStrictEqual(input);
        expect(results).toBeArrayOfSize(input.length);
    });
});
