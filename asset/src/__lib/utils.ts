import { TransformAction } from './interfaces';

export function toUpperCase(value: unknown): string|null {
    if (typeof value !== 'string') return null;
    return value.toUpperCase();
}

export function toLowerCase(value: unknown): string|null {
    if (typeof value !== 'string') return null;
    return value.toLowerCase();
}

export function increment(value: unknown): number|bigint|null {
    if (typeof value === 'number') return value + 1;
    if (typeof value === 'bigint') return value + BigInt(1);
    return null;
}

export function decrement(value: unknown): number|bigint|null {
    if (typeof value === 'number') return value - 1;
    if (typeof value === 'bigint') return value - BigInt(1);
    return null;
}

type TActions = Record<TransformAction, (value: unknown) => any|null>;
export const transformActions: TActions = Object.freeze({
    [TransformAction.toUpperCase]: toUpperCase,
    [TransformAction.toLowerCase]: toLowerCase,
    [TransformAction.increment]: increment,
    [TransformAction.decrement]: decrement,
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
