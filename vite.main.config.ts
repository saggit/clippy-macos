import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: ["@electron/llm", "node-llama-cpp", "electron-log"],
    },
    sourcemap: true,
  },
});
