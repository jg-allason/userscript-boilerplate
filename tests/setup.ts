import { vi, beforeEach } from 'vitest';

// Mock GM APIs globally for any test that accidentally imports them
const mockGMStorage = new Map<string, unknown>();

vi.stubGlobal('GM_getValue', (key: string, defaultValue?: unknown) =>
    mockGMStorage.has(key) ? mockGMStorage.get(key) : defaultValue
);

vi.stubGlobal('GM_setValue', (key: string, value: unknown) =>
    mockGMStorage.set(key, value)
);

vi.stubGlobal('GM_deleteValue', (key: string) =>
    mockGMStorage.delete(key)
);

vi.stubGlobal('GM_listValues', () =>
    [...mockGMStorage.keys()]
);

vi.stubGlobal('GM_xmlhttpRequest', (_options: unknown) => {
    throw new Error('GM_xmlhttpRequest should be mocked in individual tests');
});

vi.stubGlobal('GM_addStyle', (_css: string) => {
    // No-op for tests
});

vi.stubGlobal('GM_registerMenuCommand', (_name: string, _callback: () => void) => {
    // No-op for tests
});

// Reset storage between tests
beforeEach(() => {
    mockGMStorage.clear();
});
