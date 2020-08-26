import 'jest-extended';
import { TypeConfigFields } from '@terascope/data-types';
import { WorkerTestHarness, newTestJobConfig } from 'teraslice-test-harness';
import { ArrowTableConfig } from '../asset/src/arrow_table/interfaces';
import { StoreInArrowConfig } from '../asset/src/store_in_arrow/interfaces';

describe('Store in Arrow', () => {
    let harness: WorkerTestHarness;

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
    }

    afterEach(async () => {
        if (harness) await harness.shutdown();
    });

    it('should be able to store the input in arrow', async () => {
        await makeTest({
            name: { type: 'Keyword' }
        });

        const results = await harness.runSlice([{
            name: 'Foo',
        }]);

        expect(results).toBeArrayOfSize(1);
    });
});
