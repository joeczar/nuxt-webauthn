import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  // You can add options here if needed
})
  .override('nuxt/typescript/rules', {
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  })
  .override('nuxt/vue/rules', {
    rules: {
      // Vue-specific rules
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',
      'vue/require-default-prop': 'error',
    },
  })
  .override('nuxt/javascript', {
    rules: {
      // General JavaScript rules
      'no-console': ['error', { allow: ['warn', 'error', 'info', 'debug'] }],
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  })
