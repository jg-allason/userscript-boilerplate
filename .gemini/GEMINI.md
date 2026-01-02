## Userscript Development Guidelines for AI Agent

### Project Overview
This is a Tampermonkey/Violentmonkey userscript project with:
- Modular architecture (separated logic and UI layers)
- Unit testing with Vitest
- TypeScript support
- Vite bundling for Violentmonkey's "Track local file" feature

### Directory Structure
```
/src
  /features           # Feature modules (each has .logic.ts and .ui.ts)
  /utils              # Shared utilities
    storage.ts        # GM storage wrapper with mock support
    api.ts            # HTTP client wrapper with mock support
    dom.ts            # DOM helper utilities
    types.ts          # Shared TypeScript interfaces
  main.ts             # Entry point
  main.user.ts        # Userscript header + imports main.ts
/tests
  /features           # Tests for logic files only
  /utils              # Tests for utilities
  setup.ts            # Test setup, global mocks
/dist                 # Build output
```

### Architecture Rules

#### Separation of Concerns
- NEVER put business logic in UI files
- Logic files (`.logic.ts`) must have ZERO imports from:
  - DOM APIs (document, window, Element, etc.)
  - GM_* APIs directly (use injected abstractions)
  - UI files
- UI files (`.ui.ts`) are thin wrappers that:
  - Create DOM elements
  - Bind event listeners
  - Call logic functions with appropriate parameters
  - Display results

#### Dependency Injection
Logic functions receive dependencies as parameters. Never import gmStorage or gmHttpClient directly in logic files.
```typescript
// WRONG - direct dependency
import { gmStorage } from '../utils/storage';
export function saveData(data: Data) {
  gmStorage.set('data', data);
}

// CORRECT - injected dependency
import type { Storage } from '../utils/storage';
export function saveData(storage: Storage, data: Data) {
  storage.set('data', data);
}
```

#### File Naming Convention
- `feature-name.logic.ts` - Business logic, pure functions
- `feature-name.ui.ts` - DOM interaction, event handling
- `feature-name.types.ts` - Feature-specific types (if needed)
- `feature-name.test.ts` - Tests for logic file only

### Testing Requirements

#### Every logic function must have tests
- Test the happy path
- Test edge cases (empty input, null, undefined)
- Test error conditions

#### Test file structure
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockStorage } from '../../src/utils/storage';
import { createMockHttpClient } from '../../src/utils/api';
import { functionToTest } from '../../src/features/feature-name/feature-name.logic';

describe('functionToTest', () => {
  let mockStorage: ReturnType<typeof createMockStorage>;
  let mockHttpClient: ReturnType<typeof createMockHttpClient>;
  
  beforeEach(() => {
    mockStorage = createMockStorage();
    mockHttpClient = createMockHttpClient();
  });
  
  it('should do expected behavior', () => {
    // Arrange
    const input = { ... };
    
    // Act
    const result = functionToTest(mockStorage, input);
    
    // Assert
    expect(result).toEqual({ ... });
  });
});
```

#### Run tests after every change
- After writing/modifying any `.logic.ts` file, immediately run: `npm run test:run`
- If tests fail, fix them before proceeding
- Never commit or consider work done with failing tests

### Workflow for Adding New Features

1. **Create the logic file first**
```
   src/features/new-feature/new-feature.logic.ts
```
   - Define interfaces for input/output
   - Implement pure functions
   - No DOM, no GM APIs

2. **Create tests immediately**
```
   tests/features/new-feature.test.ts
```
   - Write tests for each function
   - Run `npm run test:run` and ensure all pass

3. **Create the UI file**
```
   src/features/new-feature/new-feature.ui.ts
```
   - Import logic functions
   - Create DOM elements
   - Wire event handlers to logic
   - Export init function

4. **Register in main.ts**
```typescript
   import { initNewFeature } from './features/new-feature/new-feature.ui';
   // In initialize():
   initNewFeature(context);
```

5. **Update userscript header** in `src/main.user.ts` if needed
   - Add @match patterns
   - Add @grant permissions
   - Add @connect domains

6. **Build and verify**
```bash
   npm run build
```

### Workflow for Modifying Existing Features

1. Locate the logic file for the feature
2. Read existing tests to understand current behavior
3. Modify logic as needed
4. Update/add tests for new behavior
5. Run tests: `npm run test:run`
6. Update UI if needed (only if interface changed)
7. Build: `npm run build`

### Commands Reference
```bash
npm run dev          # Watch mode, rebuilds on changes
npm run build        # Production build
npm run test         # Watch mode for tests
npm run test:run     # Single test run (use this to verify)
npm run test:coverage # Run with coverage report
```

### Important Reminders

- The built file at `/dist/bundle.user.js` is what Violentmonkey loads
- After `npm run build`, Violentmonkey auto-reloads if "Track local file" is enabled
- Tests run in Node, not browser - no real DOM or GM APIs available
- Always use mocks in tests, never real implementations
- If you need DOM in tests, enable jsdom environment per-file