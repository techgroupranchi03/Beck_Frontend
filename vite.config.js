import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@emotion/react', '@emotion/styled'],
          'vendor-mui-icons': ['@mui/icons-material'],
          'vendor-charts': ['recharts'],
          'vendor-table': ['material-react-table'],
          'vendor-date': ['@mui/x-date-pickers', 'dayjs'],
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 7001,
    strictPort: true,
    allowedHosts: [
      'taskbnb.in',
      'www.taskbnb.in',
      'api.taskbnb.in'
    ]
  }
});
