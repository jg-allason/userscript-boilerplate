/**
 * H1 Capture feature logic - extracts and stores h1 elements from pages.
 */

import type { Storage } from '../../utils/storage';

/** Stored H1 data structure */
export interface StoredH1 {
    text: string;
    url: string;
    capturedAt: string;
}

const H1_STORAGE_KEY = 'captured_h1s';

/**
 * Extracts text from the first h1 element in HTML string.
 * @param html HTML string to parse
 * @returns Text content of first h1, or null if not found
 */
export function extractH1Text(html: string): string | null {
    const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (!match) return null;

    // Strip inner HTML tags and decode entities
    const text = match[1]
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .trim();

    return text || null;
}

/**
 * Saves an h1 text to storage with URL and timestamp.
 * @param storage Storage dependency
 * @param h1Text The h1 text to save
 * @param url The URL where h1 was captured
 */
export function saveH1ToStorage(storage: Storage, h1Text: string, url: string): void {
    const existing = storage.get<StoredH1[]>(H1_STORAGE_KEY, []) ?? [];

    const newEntry: StoredH1 = {
        text: h1Text,
        url,
        capturedAt: new Date().toISOString(),
    };

    existing.push(newEntry);
    storage.set(H1_STORAGE_KEY, existing);
}

/**
 * Gets all stored h1 entries from storage.
 * @param storage Storage dependency
 * @returns Array of stored h1 entries
 */
export function getStoredH1s(storage: Storage): StoredH1[] {
    return storage.get<StoredH1[]>(H1_STORAGE_KEY, []) ?? [];
}
