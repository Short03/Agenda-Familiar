import { defineConfig, minimal2023Preset as preset } from '@vite-pwa/assets-generator/config'

const BRAND_PINK = '#c2185b'

/**
 * Generates the PWA icons from public/icon.svg (run `pnpm generate-pwa-assets`).
 * Maskable and Apple icons get padding on a solid background: Android may crop maskable
 * icons into a circle, and iOS does not support transparency in home screen icons.
 */
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...preset,
    maskable: { ...preset.maskable, resizeOptions: { background: BRAND_PINK } },
    apple: { ...preset.apple, resizeOptions: { background: BRAND_PINK } },
  },
  images: ['public/icon.svg'],
})
