import VueInspector from 'vite-plugin-vue-inspector'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  nitro: {
    plugins: ['@/server/plugins/prisma.ts']
  },
  runtimeConfig: {
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    RP_ID: process.env.RP_ID,
    ORIGIN: process.env.ORIGIN,
    databaseUrl: process.env.DATABASE_URL,
  },
  css: [
    '@/assets/scss/styles.scss'
  ],
  experimental: {
    payloadExtraction: false
  },
  vite: {
    clearScreen: false,
    plugins: [VueInspector()]
  }
})