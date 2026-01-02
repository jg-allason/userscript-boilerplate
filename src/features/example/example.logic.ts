/**
 * Example feature logic - demonstrates the separation of concerns pattern.
 */

import type { Storage } from '../../utils/storage';
import type { HttpClient } from '../../utils/api';
import type { Result } from '../../utils/types';
import { ok, err } from '../../utils/types';

export interface CounterData {
    value: number;
    lastUpdated: string;
}

const COUNTER_STORAGE_KEY = 'example_counter';

export function getCounter(storage: Storage): number {
    const data = storage.get<CounterData>(COUNTER_STORAGE_KEY);
    return data?.value ?? 0;
}

export function incrementCounter(storage: Storage): number {
    const current = getCounter(storage);
    const newValue = current + 1;
    storage.set(COUNTER_STORAGE_KEY, { value: newValue, lastUpdated: new Date().toISOString() });
    return newValue;
}

export function decrementCounter(storage: Storage): number {
    const current = getCounter(storage);
    const newValue = Math.max(0, current - 1);
    storage.set(COUNTER_STORAGE_KEY, { value: newValue, lastUpdated: new Date().toISOString() });
    return newValue;
}

export function resetCounter(storage: Storage): void {
    storage.delete(COUNTER_STORAGE_KEY);
}

export interface ExampleApiResponse {
    id: number;
    title: string;
    completed: boolean;
}

export async function fetchExampleData(
    httpClient: HttpClient,
    id: number
): Promise<Result<ExampleApiResponse>> {
    if (id <= 0) return err(new Error('ID must be positive'));
    try {
        const response = await httpClient.get<ExampleApiResponse>(
            `https://jsonplaceholder.typicode.com/todos/${id}`
        );
        return ok(response.data);
    } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
    }
}

export function formatCounterDisplay(value: number): string {
    if (value === 0) return 'Counter: 0 (click + to start)';
    return `Counter: ${value}`;
}

export function isValidOperation(
    operation: 'increment' | 'decrement' | 'reset',
    currentValue: number
): boolean {
    switch (operation) {
        case 'increment': return currentValue < Number.MAX_SAFE_INTEGER;
        case 'decrement': return currentValue > 0;
        case 'reset': return currentValue !== 0;
    }
}
