/**
 * Shared TypeScript interfaces and types.
 */

import type { Storage } from './storage';
import type { HttpClient } from './api';

/**
 * Context object passed to all feature initializers.
 */
export interface UserscriptContext {
    storage: Storage;
    httpClient: HttpClient;
}

/**
 * Result type for operations that can fail.
 */
export type Result<T, E = Error> =
    | { success: true; data: T }
    | { success: false; error: E };

export function ok<T>(data: T): Result<T, never> {
    return { success: true, data };
}

export function err<E>(error: E): Result<never, E> {
    return { success: false, error };
}
