import js from '@eslint/js';
import globals from 'globals';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    ignores: ['src/vendor/**', 'dist/**', 'coverage/**', 'node_modules/**', 'landing-page/**', '.nvmrc'],
  },
  js.configs.recommended,
  ...compat.extends('airbnb-base'),
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        chrome: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'import/extensions': ['error', 'always'],
      'import/prefer-default-export': 'off',
      'no-param-reassign': 'off',
      'no-use-before-define': ['error', { functions: false }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'func-names': 'off',
      'no-alert': 'warn',
      'consistent-return': 'off',
      'object-curly-newline': 'off',
      'max-len': ['error', { code: 120 }],
    },
  },
];
