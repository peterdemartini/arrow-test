import 'jest-extended';
import { Chance } from 'chance';
import { TypeConfigFields } from '@terascope/data-types';
import { WorkerTestHarness, newTestJobConfig } from 'teraslice-test-harness';
import { chunk, random, times } from '@terascope/job-components';
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

    it('should be able to store non-array/object values in arrow', async () => {
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
            keyword: randNull(chance.animal, {}, chance),
            text: randNull(chance.paragraph, {}, chance),
            bool: randNull(chance.bool, undefined, chance),
            byte: randNull(chance.integer, { min: -128, max: 127 }, chance),
            short: randNull(chance.integer, { min: -32_768, max: 32_767 }, chance),
            int: randNull(chance.integer, {}, chance),
            float: randNull(chance.floating, {}, chance)
        }));

        for (const slice of chunk(input, 10)) {
            await harness.runSlice(slice);
        }

        expect(arrowTable.toJSON()).toStrictEqual(input);
    });

    it('should be able to store array values in arrow', async () => {
        await makeTest({
            _key: { type: 'Keyword' },
            keyword: { type: 'Keyword', array: true },
            bool: { type: 'Boolean', array: true },
            byte: { type: 'Byte', array: true },
            short: { type: 'Short', array: true },
            int: { type: 'Integer', array: true },
            float: { type: 'Float', array: true },
        });

        const input = times(20, () => ({
            _key: chance.guid({ version: 4 }),
            keyword: randArrSize(chance.animal, {}, chance),
            bool: randArrSize(chance.bool, undefined, chance),
            byte: randArrSize(chance.integer, { min: -128, max: 127 }, chance),
            short: randArrSize(chance.integer, { min: -32_768, max: 32_767 }, chance),
            int: randArrSize(chance.integer, {}, chance),
            float: randArrSize(chance.floating, {}, chance)
        }));

        for (const slice of chunk(input, 10)) {
            await harness.runSlice(slice);
        }

        expect(arrowTable.toJSON()).toStrictEqual(input);
    });
});

function randArrSize<T, A>(fn: (arg?: A) => T, arg?: A, thisArg?: any): (T|null)[] {
    return times(random(0, 20), () => randNull(fn, arg, thisArg));
}

function randNull<T, A>(fn: (arg?: A) => T, arg?: A, thisArg?: any): (T|null) {
    const num = random(0, 10);
    if (num === 0) return null;
    if (thisArg) return fn.call(thisArg, arg);
    return fn(arg);
}
