import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/user": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/aset": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/perbaikan": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/rusak": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/dipinjam": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/dijual": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/riwayat": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/beban": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/departemen": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/mutasi": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
