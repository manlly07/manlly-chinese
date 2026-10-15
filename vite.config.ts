import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // "./" để build ra chạy được trên mọi host tĩnh (GitHub Pages, Netlify, mở file…)
  base: "./",
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
