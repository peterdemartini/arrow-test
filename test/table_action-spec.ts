import 'jest-extended';
import { Chance } from 'chance';
import {
    withoutNil,
    chunk, isInteger, OpConfig, random, times
} from '@terascope/job-components';
import { TypeConfigFields } from '@terascope/data-types';
import { WorkerTestHarness, newTestJobConfig } from 'teraslice-test-harness';

import {
    TableType,
    TableAPI,
    TableAction,
    TransformAction,
    toUpperCase
} from '../asset/src/__lib';

const chance = new Chance();

// hoise these so we get consistent results
let array_input: Record<string, unknown>[];
let value_input: Record<string, unknown>[];

type TestAction = {
    action: TableAction,
} & Record<string, unknown>;
describe.each(Object.values(TableType))('(%s) Table Action Processor', (tableType) => {
    let harness: WorkerTestHarness;

    let tableAPI: TableAPI;
    async function makeTest(
        actions: TestAction[], typeConfig: TypeConfigFields
    ): Promise<void> {
        const ops: OpConfig[] = actions.length ? actions.map(({ action, ...args }) => ({
            _op: `table_${action}`,
            ...args
        })) : [{ _op: 'noop' }];

        const apiConfig = {
            _name: 'table',
            type: tableType,
            type_config: Object.entries(typeConfig)
        };
        const job = newTestJobConfig({
            max_retries: 0,
            apis: [apiConfig],
            operations: [
                { _op: 'table_reader', passthrough_slice: true },
                ...ops
            ]
        });
        harness = new WorkerTestHarness(job);

        await harness.initialize();
        tableAPI = harness.getAPI<TableAPI>('table');
    }

    // eslint-disable-next-line jest/require-top-level-describe
    afterEach(async () => {
        if (harness) await harness.shutdown();
    });

    const SIZE = 2;
    const CHUNKS = 2;

    let chunked: (Record<string, unknown>[])[];
    let results: Record<string, unknown>[];

    describe('when storing non-array/object values', () => {
        async function prepare(actions: TestAction[]) {
            results = [];

            await makeTest(actions, {
                _key: { type: 'Keyword' },
                keyword: { type: 'Keyword' },
                text: { type: 'Text' },
                bool: { type: 'Boolean' },
                byte: { type: 'Byte' },
                short: { type: 'Short' },
                int: { type: 'Integer' },
                float: { type: 'Float' },
            });

            value_input = value_input || times(SIZE * CHUNKS, () => ({
                _key: chance.guid({ version: 4 }),
                keyword: randNull(chance.animal, {}, chance),
                text: randNull(chance.paragraph, {}, chance),
                bool: randNull(chance.bool, undefined, chance),
                byte: randNull(chance.integer, { min: -128, max: 127 }, chance),
                short: randNull(chance.integer, { min: -32_768, max: 32_767 }, chance),
                int: randNull(chance.integer, { min: -(2 ** 31), max: (2 ** 31) - 1 }, chance),
                float: randNull(chance.floating, {}, chance)
            }));

            chunked = chunk(value_input, CHUNKS);

            for (const slice of chunked) {
                const sliceResult = await harness.runSlice(slice);
                results = results.concat(sliceResult.map((obj) => ({ ...obj })));
            }
        }

        it('should store the correct data', async () => {
            await prepare([]);
            expect(tableAPI.toJSON()).toStrictEqual(value_input.map(withoutNil));
        });

        it('should be able sum the data', async () => {
            await prepare([
                { action: TableAction.sum, field: 'short' }
            ]);

            let _last = BigInt(0);

            const expected = chunked
                .map((data) => data.reduce((acc, curr) => {
                    if (!isInteger(curr.short)) return acc;
                    return acc + curr.short;
                }, 0))
                .map((num) => {
                    const sum = BigInt(num) + _last;
                    _last = sum;
                    return { sum };
                });

            expect(results).toEqual(expected);
        });

        it('should be able to filter by value', async () => {
            await prepare([
                {
                    action: TableAction.filter,
                    filters: [{
                        field: 'bool',
                        value: true
                    }]
                }
            ]);

            let _last = 0;

            const expected = chunked
                .map((data) => data.filter((obj) => obj.bool === true).length)
                .map((num) => {
                    const count = num + _last;
                    _last = count;
                    return { count };
                });

            expect(results).toEqual(expected);
        });

        it('should be able to filter by multiple values', async () => {
            await prepare([
                {
                    action: TableAction.filter,
                    filters: [{
                        field: 'bool',
                        value: false
                    }, {
                        field: 'short',
                        value: 100,
                        operator: 'ge'
                    }]
                }
            ]);

            let _last = 0;

            const pre = chunked
                .map((data) => data.filter((obj) => (
                    obj.bool === false && (obj.short as number) >= 100
                )));

            const expected = pre
                .map((num) => {
                    const count = num.length + _last;
                    _last = count;
                    return { count };
                });

            expect(results).toEqual(expected);
        });

        it('should be able to transform a column', async () => {
            await prepare([
                {
                    action: TableAction.transform,
                    field: 'keyword',
                    fn: TransformAction.toUpperCase,
                }
            ]);

            expect(tableAPI.toJSON()).toEqual(value_input.map((record) => ({
                ...withoutNil(record),
                keyword: toUpperCase(record.keyword)
            })));
        });
    });

    describe('when storing array values', () => {
        async function prepare(actions: TestAction[]) {
            results = [];

            await makeTest(actions, {
                _key: { type: 'Keyword' },
                keyword: { type: 'Keyword', array: true },
                bool: { type: 'Boolean', array: true },
                byte: { type: 'Byte', array: true },
                short: { type: 'Short', array: true },
                int: { type: 'Integer', array: true },
                float: { type: 'Float', array: true },
            });

            array_input = array_input || times(SIZE * CHUNKS, () => ({
                _key: chance.guid({ version: 4 }),
                keyword: randArrSize(chance.animal, {}, chance),
                bool: randArrSize(chance.bool, undefined, chance),
                byte: randArrSize(chance.integer, { min: -128, max: 127 }, chance),
                short: randArrSize(chance.integer, { min: -32_768, max: 32_767 }, chance),
                int: randArrSize(chance.integer, { min: -(2 ** 31), max: (2 ** 31) - 1 }, chance),
                float: randArrSize(chance.floating, {}, chance)
            }));

            chunked = chunk(array_input, CHUNKS);
            for (const slice of chunked) {
                const sliceResult = await harness.runSlice(slice);
                results = results.concat(sliceResult.map((obj) => ({ ...obj })));
            }
        }

        it('should store the correct data', async () => {
            await prepare([]);
            expect(tableAPI.toJSON()).toStrictEqual(array_input);
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
