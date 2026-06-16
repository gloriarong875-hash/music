import { defineConfig } from 'vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = dirname(fileURLToPath(import.meta.url))
const folder = (...codes) => String.fromCodePoint(...codes)
const mapFolder = (firstCode) => `${folder(firstCode, 0x5730, 0x56fe)}/index.html`

export default defineConfig({
  base: './',
  server: {
    host: '127.0.0.1',
    port: 4173,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(projectRoot, 'index.html'),
        drum: resolve(projectRoot, 'drum.html'),
        shengEntry: resolve(projectRoot, mapFolder(0x7b19)),
        drumEntry: resolve(projectRoot, mapFolder(0x9f13)),
        diziEntry: resolve(projectRoot, mapFolder(0x7b1b)),
        xunEntry: resolve(projectRoot, mapFolder(0x57d9)),
      },
    },
  },
})
