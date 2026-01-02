/**
 * Storage abstraction for GM storage APIs.
 * Provides both real implementation and mock for testing.
 */

/** Storage interface for dependency injection */
export interface Storage {
    get<T>(key: string, defaultValue?: T): T | undefined;
    set<T>(key: string, value: T): void;
    delete(key: string): void;
    list(): string[];
    clear(): void;
}

/**
 * Real GM storage implementation using Tampermonkey/Violentmonkey APIs.
 * Use this in production code.
 */
export const gmStorage: Storage = {
    get<T>(key: string, defaultValue?: T): T | undefined {
        const value = GM_getValue(key, defaultValue);
        return value as T | undefined;
    },

    set<T>(key: string, value: T): void {
        GM_setValue(key, value);
    },

    delete(key: string): void {
        GM_deleteValue(key);
    },

    list(): string[] {
        return GM_listValues();
    },

    clear(): void {
        const keys = GM_listValues();
        for (const key of keys) {
            GM_deleteValue(key);
        }
    },
};

/**
 * Creates an in-memory mock storage for testing.
 * @returns A mock Storage implementation backed by a Map
 */
export function createMockStorage(): Storage {
    const store = new Map<string, unknown>();

    return {
        get<T>(key: string, defaultValue?: T): T | undefined {
            if (store.has(key)) {
                return store.get(key) as T;
            }
            return defaultValue;
        },

        set<T>(key: string, value: T): void {
            store.set(key, value);
        },

        delete(key: string): void {
            store.delete(key);
        },

        list(): string[] {
            return [...store.keys()];
        },

        clear(): void {
            store.clear();
        },
    };
}
