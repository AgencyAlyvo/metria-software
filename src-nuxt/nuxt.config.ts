import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }, { charset: 'utf-8' }],
      script: [],
      link: [],
      style: [],
      noscript: [],
    },
  },
  srcDir: 'app',
  serverDir: 'server',
  dir: {
    public: 'public',
    modules: 'modules',
    shared: 'shared',
  },
  modulesDir: ['../node_modules'],
  ssr: false, // Obligatoire pour Tauri.
  alias: {
    '#src-nuxt': fileURLToPath(new URL('.', import.meta.url)),
    '#src-core': fileURLToPath(new URL('../src-core', import.meta.url)),
  },
  css: ['~/assets/css/tailwind.css', '~/assets/css/main.scss'],
  devtools: { enabled: true },
  telemetry: false,
  components: {
    dirs: [{ path: '~/components', pathPrefix: false }],
  },
  runtimeConfig: {
    public: {
      appEnv: process.env.NUXT_PUBLIC_NODE_ENV,
      appIdentifier: process.env.NUXT_PUBLIC_APP_IDENTIFIER,
      apiBaseUrl: process.env.NUXT_PUBLIC_BASE_URL_API,
    },
  },
  typescript: {
    strict: true,
    typeCheck: true,
    tsConfig: {
      compilerOptions: {
        skipLibCheck: true,
        noEmit: true,
      },
    },
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@tauri-apps/api/core',
        '@tauri-apps/api/event',
        '@tauri-apps/api/window',
        '@tauri-apps/plugin-fs',
        '@tauri-apps/plugin-http',
        '@tauri-apps/plugin-opener',
      ],
    },
  },
  modules: ['@pinia/nuxt', '@nuxtjs/google-fonts', '@nuxt/ui'],
  pinia: {
    storesDirs: ['~/stores/**'],
  },
  googleFonts: {
    families: {
      Manrope: [400, 500, 600, 700, 800],
    },
  },
})
