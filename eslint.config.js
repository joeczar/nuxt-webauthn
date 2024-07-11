import eslintPluginVue from 'eslint-plugin-vue'
import eslintPluginNuxt from 'eslint-plugin-nuxt'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import * as typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptEslintParser from '@typescript-eslint/parser'

const config = [
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
        plugins: {
            '@typescript-eslint': typescriptEslint,
            vue: eslintPluginVue,
            nuxt: eslintPluginNuxt,
            prettier: eslintPluginPrettier,
        },
        languageOptions: {
            parser: typescriptEslintParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                extraFileExtensions: ['.vue'],
            },
        },
        rules: {
            // TypeScript rules
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',

            // Vue rules
            'vue/multi-word-component-names': 'off',
            'vue/no-v-html': 'off',

            // Prettier rules
            'prettier/prettier': 'error',

            // Add any other rules you want here
        },
    },
    {
        files: ['**/*.vue'],
        rules: {
            // Vue-specific rules
            'vue/html-indent': ['error', 2],
            'vue/singleline-html-element-content-newline': 'off',
            'vue/component-name-in-template-casing': ['error', 'PascalCase'],
        },
    },
    {
        files: ['**/*.ts', '**/*.vue'],
        rules: {
            // TypeScript-specific rules for .ts files and <script lang="ts"> blocks in .vue files
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
        },
    },
    {
        ignores: ['.nuxt', 'dist', 'node_modules'],
    },
]

export default config