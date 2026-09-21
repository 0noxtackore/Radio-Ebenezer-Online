import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5504,
    open: true,
  },
  build: {
    outDir: "dist",
  },
});
