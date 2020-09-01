import { memoize } from '@terascope/job-components';
import { FilterMatch, TransformAction } from './interfaces';

export function toUpperCase(value: unknown): string|null {
    if (typeof value !== 'string') return null;
    return value.toUpperCase();
}

export function toLowerCase(value: unknown): string|null {
    if (typeof value !== 'string') return null;
    return value.toLowerCase();
}

type TActions = Record<TransformAction, (value: unknown) => any|null>;
export const transformActions: TActions = Object.freeze({
    [TransformAction.toUpperCase]: toUpperCase,
    [TransformAction.toLowerCase]: toLowerCase,
});

export const matchers = Object.freeze({
    eq(a: any, b: any) {
        return Object.is(a, b);
    },
    ge(a: any, b: any) {
        return a >= b;
    },
    gt(a: any, b: any) {
        return a > b;
    },
    le(a: any, b: any) {
        return a <= b;
    },
    lt(a: any, b: any) {
        return a < b;
    },
    ne(a: any, b: any) {
        return !Object.is(a, b);
    }
});
type Grouped = Record<string, (value: unknown) => boolean>;

export const createFilterMatchFn = memoize(_createFilterMatchFn);
function _createFilterMatchFn(matches: FilterMatch[]): [string, (value: unknown) => boolean][] {
    const grouped = matches.reduce((acc, m) => {
        const prev = acc[m.field];
        acc[m.field] = (value: unknown): boolean => {
            const op = matchers[m.operator ?? 'eq'];
            if (!op(value, m.value)) return false;
            return prev ? prev(value) : true;
        };
        return acc;
    }, {} as Grouped);
    return Object.entries(grouped);
}
