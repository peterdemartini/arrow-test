/* global BigInt */
import 'jest-extended';
import { Chance } from 'chance';
import { TypeConfigFields } from '@terascope/data-types';
import { WorkerTestHarness, newTestJobConfig } from 'teraslice-test-harness';
import {
    chunk, cloneDeep, isInteger, random, times
} from '@terascope/job-components';
import { TableActionConfig } from '../asset/src/table_action/interfaces';
import { TableAPI, TableAction, TransformAction } from '../asset/src/__lib/interfaces';
import { toUpperCase } from '../asset/src/__lib/utils';

const chance = new Chance();

// hoise these so we get consistent results
let array_input: Record<string, unknown>[];
let value_input: Record<string, unknown>[];

describe.each(['arrow_table', 'json_table'])('(%s) Table Action Processor', (tableAPIName) => {
    let harness: WorkerTestHarness;

    let tableAPI: TableAPI;
    async function makeTest(
        actions: { action: TableAction, args?: any[] }[], typeConfig: TypeConfigFields
    ): Promise<void> {
        const ops: TableActionConfig[] = actions.map(({ action, args = [] }) => ({
            _op: 'table_action',
            table_api: tableAPIName as any,
            action,
            args
        }));
        const apiConfig = { _name: tableAPIName, type_config: Object.entries(typeConfig) };
        const job = newTestJobConfig({
            max_retries: 0,
            apis: [apiConfig],
            operations: [
                { _op: 'test-reader', passthrough_slice: true },
                ...ops
            ]
        });
        harness = new WorkerTestHarness(job);

        await harness.initialize();
        tableAPI = harness.getAPI<TableAPI>(tableAPIName);
    }

    // eslint-disable-next-line jest/require-top-level-describe
    afterEach(async () => {
        if (harness) await harness.shutdown();
    });

    const SIZE = 10;

    let chunked: (Record<string, unknown>[])[];
    let results: Record<string, unknown>[];

    describe('when storing non-array/object values', () => {
        async function prepare(actions: { action: TableAction, args?: any[] }[]) {
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

            value_input = value_input ? cloneDeep(value_input) : times(SIZE * 2, () => ({
                _key: chance.guid({ version: 4 }),
                keyword: randNull(chance.animal, {}, chance),
                text: randNull(chance.paragraph, {}, chance),
                bool: randNull(chance.bool, undefined, chance),
                byte: randNull(chance.integer, { min: -128, max: 127 }, chance),
                short: randNull(chance.integer, { min: -32_768, max: 32_767 }, chance),
                int: randNull(chance.integer, {}, chance),
                float: randNull(chance.floating, {}, chance)
            }));

            chunked = chunk(value_input, SIZE);

            for (const slice of chunked) {
                const sliceResult = await harness.runSlice(slice);
                results = results.concat(sliceResult.map((obj) => ({ ...obj })));
            }
        }

        it('should store the correct data', async () => {
            await prepare([{ action: TableAction.store }]);
            expect(tableAPI.toJSON()).toStrictEqual(value_input);
        });

        it('should be able sum the data', async () => {
            await prepare([
                { action: TableAction.store },
                { action: TableAction.sum, args: ['short'] }
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
                { action: TableAction.store },
                {
                    action: TableAction.filter,
                    args: [{
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
                { action: TableAction.store },
                {
                    action: TableAction.filter,
                    args: [{
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
                { action: TableAction.store },
                {
                    action: TableAction.transform,
                    args: ['keyword', TransformAction.toUpperCase]
                }
            ]);

            expect(tableAPI.toJSON()).toEqual(value_input.map((record) => ({
                ...record,
                keyword: toUpperCase(record.keyword)
            })));
        });
    });

    describe('when storing array values', () => {
        async function prepare(actions: { action: TableAction, args?: any[] }[]) {
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

            array_input = array_input ? cloneDeep(array_input) : times(SIZE * 2, () => ({
                _key: chance.guid({ version: 4 }),
                keyword: randArrSize(chance.animal, {}, chance),
                bool: randArrSize(chance.bool, undefined, chance),
                byte: randArrSize(chance.integer, { min: -128, max: 127 }, chance),
                short: randArrSize(chance.integer, { min: -32_768, max: 32_767 }, chance),
                int: randArrSize(chance.integer, {}, chance),
                float: randArrSize(chance.floating, {}, chance)
            }));

            chunked = chunk(array_input, SIZE);
            for (const slice of chunked) {
                const sliceResult = await harness.runSlice(slice);
                results = results.concat(sliceResult.map((obj) => ({ ...obj })));
            }
        }

        it('should store the correct data', async () => {
            await prepare([{ action: TableAction.store }]);
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
