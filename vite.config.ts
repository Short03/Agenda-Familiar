/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // The new version waits until the person accepts it (ADR 0005), so nothing reloads
      // in the middle of typing a task.
      registerType: 'prompt',
      // Icons are generated from public/icon.svg by `pnpm generate-pwa-assets`.
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'icon.svg'],
      manifest: {
        name: 'Agenda familiar',
        short_name: 'Agenda',
        description: 'Calendario y tareas de la familia.',
        lang: 'es-MX',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#fff5f8',
        theme_color: '#fff5f8',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the whole app shell, fonts included, so it opens without internet.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Spanish only needs the latin subsets; skip ~100 KB of fonts nobody will render.
        globIgnores: ['**/*-cyrillic*', '**/*-vietnamese*', '**/*-greek*'],
        // Client-side routes (/tareas, /ajustes) must load index.html when offline.
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
      // The service worker is off in `pnpm dev`; test it with `pnpm build && pnpm preview`.
      devOptions: { enabled: false },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    restoreMocks: true,
  },
})
