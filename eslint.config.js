import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    prettier,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        ignores: ['dist/**', 'node_modules/**', '*.config.js', 'vite.config.js'],
    },
    {
        rules: {
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            'prettier/prettier': 'warn',
        },
    },
    {
        files: ['**/*.test.ts', 'e2e/**/*.ts'],
        rules: {
            '@typescript-eslint/no-unsafe-argument': 'off',
        },
    }
);
