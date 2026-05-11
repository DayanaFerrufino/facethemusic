import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// ESLint checks the frontend code for common JavaScript and React mistakes.
export default defineConfig([
  // Ignore the build folder because Vite creates it automatically.
  globalIgnores(['dist']),
  {
    // Apply these lint rules to JavaScript and JSX files.
    files: ['**/*.{js,jsx}'],
    extends: [
      
      js.configs.recommended,                         // Recommended JavaScript rules from ESLint.
      reactHooks.configs.flat.recommended,            // React Hooks rules catch incorrect useEffect/useState patterns.
      reactRefresh.configs.vite,                      // React Refresh rules help Vite reload React components correctly.    
    ],
    languageOptions: {
      ecmaVersion: 2020,                              // Sets the JavaScript version ESLint understands.
      globals: globals.browser,                       // Adds browser globals like window, document, and fetch.
      parserOptions: {
        ecmaVersion: 'latest',                        // Allows parsing of modern JavaScript features used in the codebase.
        ecmaFeatures: { jsx: true },                  // Enables parsing of JSX syntax used in React components.
        sourceType: 'module',                         // Allows use of import/export statements in the code.
      },
    },
    rules: {
      // Allows unused constants that are written like React components or config names.
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
