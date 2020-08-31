import { TransformAction } from './interfaces';

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
