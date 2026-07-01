import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // During `npm run dev`, forward API calls to the FastAPI backend
      // running separately on port 8000.
      "/api": "http://127.0.0.1:8000",
    },
  },
  build: {
    outDir: "dist",
  },
});
