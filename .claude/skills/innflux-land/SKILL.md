```markdown
# innflux-land Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `innflux-land` JavaScript codebase. It covers file organization, import/export styles, commit messaging, and testing approaches. Use this guide to ensure your contributions align with the established practices in this repository.

## Coding Conventions

### File Naming
- Use **kebab-case** for all file names.
  - Example:  
    ```
    user-profile.js
    data-fetcher.test.js
    ```

### Import Style
- Use **relative imports** to reference modules within the project.
  - Example:
    ```javascript
    import { fetchData } from './data-fetcher.js';
    import { calculateTotal } from '../utils/math-utils.js';
    ```

### Export Style
- Use **named exports** for functions, objects, or constants.
  - Example:
    ```javascript
    // In user-profile.js
    export function getUserProfile(id) { ... }
    export const DEFAULT_AVATAR = 'default.png';
    ```

### Commit Patterns
- Commit messages are **freeform** (no strict prefixing), with an average length of 72 characters.
  - Example:
    ```
    Add support for user avatar uploads and profile editing
    ```

## Workflows

### Adding a New Feature
**Trigger:** When implementing a new functionality or module  
**Command:** `/add-feature`

1. Create a new file using kebab-case (e.g., `new-feature.js`).
2. Implement your feature using named exports.
3. Use relative imports to include dependencies.
4. Write corresponding tests in a `*.test.js` file.
5. Commit your changes with a clear, descriptive message.

### Writing Tests
**Trigger:** When adding or updating code that requires test coverage  
**Command:** `/write-test`

1. Create a test file named after the module, using the pattern `*.test.js`.
   - Example: `user-profile.test.js`
2. Write tests using the project's preferred (currently undetected) testing framework.
3. Ensure all tests pass before committing.

### Refactoring Code
**Trigger:** When improving code structure or readability without changing functionality  
**Command:** `/refactor-code`

1. Update code while maintaining existing behavior.
2. Follow file naming, import, and export conventions.
3. Update or add tests as needed.
4. Commit with a descriptive message about the refactor.

## Testing Patterns

- Test files use the `*.test.js` naming convention and are located alongside or near the modules they test.
- The specific testing framework is not detected; follow existing patterns in the repo.
- Example test file:
  ```javascript
  // user-profile.test.js
  import { getUserProfile } from './user-profile.js';

  test('returns correct profile for valid user ID', () => {
    const profile = getUserProfile(1);
    expect(profile).toBeDefined();
  });
  ```

## Commands
| Command        | Purpose                                         |
|----------------|-------------------------------------------------|
| /add-feature   | Start the process for adding a new feature      |
| /write-test    | Guide for writing and placing new tests         |
| /refactor-code | Steps for safely refactoring existing code      |
```
