import 'jest-extended';
import { Chance } from 'chance';
import { TypeConfigFields } from '@terascope/data-types';
import { WorkerTestHarness, newTestJobConfig } from 'teraslice-test-harness';
import { chunk, random, times } from '@terascope/job-components';
import { ArrowTableConfig } from '../asset/src/arrow_table/interfaces';
import { Action, ArrowTableActionConfig } from '../asset/src/arrow_table_action/interfaces';
import { ArrowTable } from '../asset/src/__lib/arrow-table';

const chance = new Chance();

describe('Arrow Table Action Processor', () => {
    let harness: WorkerTestHarness;

    let arrowTable: ArrowTable;
    async function makeTest(
        action: Action, typeConfig: TypeConfigFields,
    ): Promise<void> {
        const opConfig: ArrowTableActionConfig = { _op: 'arrow_table_action', action };
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

    describe('when storing non-array/object values', () => {
        let input: Record<string, any>[] = [];
        beforeEach(async () => {
            await makeTest(Action.store, {
                _key: { type: 'Keyword' },
                keyword: { type: 'Keyword' },
                text: { type: 'Text' },
                bool: { type: 'Boolean' },
                byte: { type: 'Byte' },
                short: { type: 'Short' },
                int: { type: 'Integer' },
                float: { type: 'Float' },
            });

            input = times(20, () => ({
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
        });

        it('should store the correct data', async () => {
            expect(arrowTable.toJSON()).toStrictEqual(input);
        });
    });

    describe('when storing array values', () => {
        let input: Record<string, any>[] = [];
        beforeEach(async () => {
            await makeTest(Action.store, {
                _key: { type: 'Keyword' },
                keyword: { type: 'Keyword', array: true },
                bool: { type: 'Boolean', array: true },
                byte: { type: 'Byte', array: true },
                short: { type: 'Short', array: true },
                int: { type: 'Integer', array: true },
                float: { type: 'Float', array: true },
            });

            input = times(20, () => ({
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
        });

        it('should store the correct data', async () => {
            expect(arrowTable.toJSON()).toStrictEqual(input);
        });
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
