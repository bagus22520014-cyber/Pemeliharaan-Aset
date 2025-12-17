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
        bypass: (req) => {
          // Don't proxy React Router route /users
          if (req.url === "/users") {
            return req.url;
          }
          return null;
        },
      },
      "/aset": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          const url = req.url;
          // Don't proxy if it's a React Router route (HTML pages)
          // Only proxy API calls (should have headers or query params, not just page navigation)
          if (
            url === "/aset/daftar" ||
            url === "/aset/kategori" ||
            url === "/aset/status"
          ) {
            return url; // Return the URL to bypass proxy (serve from Vite)
          }
          // Otherwise let it proxy to backend
          return null;
        },
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
      "/approval": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          // Don't proxy React Router route /approval/pending
          if (req.url === "/approval/pending") {
            return req.url;
          }
          return null;
        },
      },
      "/notification": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          // Don't proxy React Router route /notifications
          if (req.url === "/notifications") {
            return req.url;
          }
          return null;
        },
      },
    },
  },
});
