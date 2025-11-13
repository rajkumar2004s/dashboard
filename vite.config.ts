import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

const clientRoot = path.resolve(__dirname, "client");

export default defineConfig({
  root: clientRoot,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.join(clientRoot, "src"),
    },
  },
  build: {
    outDir: path.resolve(clientRoot, "dist"),
    emptyOutDir: true,
  },
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
      options: {
        from: undefined,
        map: !process.env.NODE_ENV || process.env.NODE_ENV === "development",
      },
    },
  },
  server: {
    host: true,
    port: Number(process.env.VITE_PORT ?? 5173),
  },
  preview: {
    host: true,
    port: Number(process.env.VITE_PREVIEW_PORT ?? 4173),
  },
});
