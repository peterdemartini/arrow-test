import 'jest-extended';
import { WorkerTestHarness } from 'teraslice-test-harness';
import { StoreInArrowConfig } from '../asset/src/store_in_arrow/interfaces';

describe('Store in Arrow', () => {
    let harness: WorkerTestHarness;

    async function makeTest(config?: Partial<StoreInArrowConfig>) {
        const opConfig = Object.assign({}, { _op: 'store_in_arrow' }, config);

        harness = WorkerTestHarness.testProcessor(opConfig);

        await harness.initialize();
    }

    afterEach(async () => {
        if (harness) await harness.shutdown();
    });


    it('should be able to store the input in arrow', async () => {
        await makeTest({});
        const results = await harness.runSlice([{
            name: 'Foo',
        }]);
        expect(results).toBeArrayOfSize(1);
    })
});
