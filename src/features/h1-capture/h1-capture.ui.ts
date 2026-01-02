/**
 * H1 Capture feature UI - captures h1 from current page on load.
 */

import type { UserscriptContext } from '../../utils/types';
import {
    extractH1Text,
    saveH1ToStorage,
    getStoredH1s,
} from './h1-capture.logic';

/**
 * Initializes the h1-capture feature.
 * Captures the first h1 from the current page and saves it to storage.
 * @param context Userscript context with dependencies
 */
export function initH1Capture(context: UserscriptContext): void {
    const { storage } = context;

    // Get h1 from current page
    const html = document.body.innerHTML;
    const h1Text = extractH1Text(html);

    if (h1Text) {
        const url = window.location.href;
        saveH1ToStorage(storage, h1Text, url);

        console.log('[H1 Capture] Saved:', { text: h1Text, url });
    } else {
        console.log('[H1 Capture] No h1 found on page');
    }

    // Log all stored h1s
    const allH1s = getStoredH1s(storage);
    console.log('[H1 Capture] All stored h1s:', allH1s);
}
