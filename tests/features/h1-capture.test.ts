/**
 * Tests for h1-capture feature logic.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createMockStorage } from '../../src/utils/storage';
import {
    extractH1Text,
    saveH1ToStorage,
    getStoredH1s,
} from '../../src/features/h1-capture/h1-capture.logic';

describe('extractH1Text', () => {
    it('should extract text from h1 element', () => {
        const html = '<html><body><h1>Hello World</h1></body></html>';
        const result = extractH1Text(html);
        expect(result).toBe('Hello World');
    });

    it('should return null when no h1 exists', () => {
        const html = '<html><body><h2>Not an H1</h2></body></html>';
        const result = extractH1Text(html);
        expect(result).toBeNull();
    });

    it('should extract only the first h1 when multiple exist', () => {
        const html = '<html><body><h1>First H1</h1><h1>Second H1</h1></body></html>';
        const result = extractH1Text(html);
        expect(result).toBe('First H1');
    });

    it('should handle h1 with attributes', () => {
        const html = '<h1 class="title" id="main">Styled Title</h1>';
        const result = extractH1Text(html);
        expect(result).toBe('Styled Title');
    });

    it('should strip inner HTML tags', () => {
        const html = '<h1><span>Inner</span> <strong>Tags</strong></h1>';
        const result = extractH1Text(html);
        expect(result).toBe('Inner Tags');
    });

    it('should decode HTML entities', () => {
        const html = '<h1>Tom &amp; Jerry</h1>';
        const result = extractH1Text(html);
        expect(result).toBe('Tom & Jerry');
    });

    it('should return null for empty h1', () => {
        const html = '<h1>   </h1>';
        const result = extractH1Text(html);
        expect(result).toBeNull();
    });
});

describe('saveH1ToStorage and getStoredH1s', () => {
    let mockStorage: ReturnType<typeof createMockStorage>;

    beforeEach(() => {
        mockStorage = createMockStorage();
    });

    it('should save and retrieve h1 entry', () => {
        saveH1ToStorage(mockStorage, 'Test Title', 'https://example.com');

        const stored = getStoredH1s(mockStorage);

        expect(stored).toHaveLength(1);
        expect(stored[0].text).toBe('Test Title');
        expect(stored[0].url).toBe('https://example.com');
        expect(stored[0].capturedAt).toBeDefined();
    });

    it('should return empty array when no h1s stored', () => {
        const stored = getStoredH1s(mockStorage);
        expect(stored).toEqual([]);
    });

    it('should append multiple h1 entries', () => {
        saveH1ToStorage(mockStorage, 'First', 'https://first.com');
        saveH1ToStorage(mockStorage, 'Second', 'https://second.com');
        saveH1ToStorage(mockStorage, 'Third', 'https://third.com');

        const stored = getStoredH1s(mockStorage);

        expect(stored).toHaveLength(3);
        expect(stored[0].text).toBe('First');
        expect(stored[1].text).toBe('Second');
        expect(stored[2].text).toBe('Third');
    });
});
