import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// ─── Theme colors from src/theme/theme.js (defaultColors) ───
// We reference them here so the manifest stays in sync with the app theme.
const themeColors = {
  layout: "#132421",    // primary.dark → used as theme_color (status-bar tint)
  active: "#407f68",    // primary.main
  surface: "#fef7c5",   // background splash
};

export default defineConfig({
  plugins: [
    react(),

    // ─── PWA configuration ───────────────────────────────────
    VitePWA({
      registerType: "autoUpdate",

      // Enable PWA in dev mode (manifest + SW available during development)
      devOptions: {
        enabled: true,
      },

      // Extra static assets to precache (beyond auto-detected JS/CSS)
      includeAssets: [
        "images/taskbnb.png",
        "images/logo.png",
        "images/taskbnb-192x192.png",
        "images/taskbnb-512x512.png",
      ],

      // ── Web App Manifest ──────────────────────────────────
      manifest: {
        name: "TaskBnb - Property Management",
        short_name: "TaskBnb",
        description:
          "TaskBnb property management & team coordination platform",
        theme_color: themeColors.layout,        // dark green status bar
        background_color: themeColors.surface,  // cream splash screen
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "images/taskbnb-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "images/taskbnb-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "images/taskbnb-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        categories: ["business", "productivity"],
      },

      // ── Workbox (Service Worker) config ────────────────────
      workbox: {
        // Which static files to precache in the build output
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Exclude oversized images from precache (they'll still load from network)
        globIgnores: ["**/commingsoon.png", "**/*.gif"],
        // Increase limit to accommodate larger assets (default is 2 MiB)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB

        // Runtime caching rules for dynamic content
        runtimeCaching: [
          // 1) API calls — NetworkFirst (try server, fallback to cache)
          {
            urlPattern: /^https:\/\/api\.taskbnb\.in\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // 2) Google Fonts stylesheets — CacheFirst (rarely change)
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // 3) Google Fonts font files — CacheFirst
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // 4) Image CDN / uploaded images — StaleWhileRevalidate
          {
            urlPattern: /\.(?:png|gif|jpg|jpeg|svg|webp)$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],

  // ─── Build config (unchanged) ─────────────────────────────
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-mui": [
            "@mui/material",
            "@emotion/react",
            "@emotion/styled",
          ],
          "vendor-mui-icons": ["@mui/icons-material"],
          "vendor-charts": ["recharts"],
          "vendor-table": ["material-react-table"],
          "vendor-date": ["@mui/x-date-pickers", "dayjs"],
        },
      },
    },
  },

  // ─── Dev server config (unchanged) ────────────────────────
  server: {
    host: "0.0.0.0",
    port: 7001,
    strictPort: true,
    allowedHosts: ["taskbnb.in", "www.taskbnb.in", "api.taskbnb.in", "app.taskbnb.in"],
    fs: {
      deny: [".git"],
    },
    watch: {
      ignored: ["**/.git/**"],
    },
  },
});
