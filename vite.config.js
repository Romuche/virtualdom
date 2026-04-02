import { defineConfig } from 'vite'
import { resolve } from 'path'
import { copyFileSync, mkdirSync } from 'fs'

export default defineConfig({
  base: './',
  build: {
    outDir: 'docs',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        virtual: resolve(__dirname, 'virtual.html'),
      },
    },
  },
  plugins: [
    {
      name: 'copy-static-assets',
      closeBundle() {
        mkdirSync('docs', { recursive: true })
        copyFileSync('src/messages.js', 'docs/messages.js')
      },
    },
  ],
})
