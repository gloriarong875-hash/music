import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 4173,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        sound: resolve(import.meta.dirname, "pages/sound/index.html"),
        form: resolve(import.meta.dirname, "pages/form/index.html"),
        chronicle: resolve(import.meta.dirname, "pages/chronicle/index.html"),
      },
    },
  },
});
