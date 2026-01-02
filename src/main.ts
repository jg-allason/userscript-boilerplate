import { gmStorage } from './utils/storage';
import { gmHttpClient } from './utils/api';
import type { UserscriptContext } from './utils/types';

// Import feature initializers
import { initExample } from './features/example/example.ui';
import { initH1Capture } from './features/h1-capture/h1-capture.ui';

/**
 * Main entry point for the userscript.
 * Creates the context and initializes all features.
 */
export function initialize(): void {
    const context: UserscriptContext = {
        storage: gmStorage,
        httpClient: gmHttpClient,
    };

    // Initialize features
    initExample(context);
    initH1Capture(context);

    console.log('[Userscript] Initialized');
}

// Auto-run when script loads
initialize();
