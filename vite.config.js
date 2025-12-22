import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
// Central LAN/backend host for proxies and HMR
const LAN_HOST = "192.168.1.15";
const BACKEND = `http://${LAN_HOST}:4000`;
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // bind to all network interfaces for LAN access
    host: true,
    port: 5173,
    // explicit HMR settings so the client connects to the correct LAN IP
    hmr: {
      protocol: "ws",
      host: LAN_HOST,
      port: 5173,
    },
    proxy: {
      "/user": {
        target: BACKEND,
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
        target: BACKEND,
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
        target: BACKEND,
        changeOrigin: true,
        secure: false,
      },
      "/rusak": {
        target: BACKEND,
        changeOrigin: true,
        secure: false,
      },
      "/dipinjam": {
        target: BACKEND,
        changeOrigin: true,
        secure: false,
      },
      "/dijual": {
        target: BACKEND,
        changeOrigin: true,
        secure: false,
      },
      "/riwayat": {
        target: BACKEND,
        changeOrigin: true,
        secure: false,
      },
      "/beban": {
        target: BACKEND,
        changeOrigin: true,
        secure: false,
      },
      "/departemen": {
        target: BACKEND,
        changeOrigin: true,
        secure: false,
      },
      "/mutasi": {
        target: BACKEND,
        changeOrigin: true,
        secure: false,
      },
      "/approval": {
        target: BACKEND,
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
        target: BACKEND,
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
