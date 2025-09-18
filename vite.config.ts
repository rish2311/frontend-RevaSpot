import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // The server configuration in Vite allows you to set up a development server with specific settings.
  // The 'proxy' option is used to redirect API requests during development to avoid CORS issues.
  // Here, requests to '/api' are proxied to 'http://localhost:5000'.
  // 'changeOrigin: true' modifies the origin of the host header to the target URL.
  // The 'rewrite' function modifies the path of the request, removing the '/api' prefix.

  server: {
    proxy: {
      '/api': {
        target: 'http://api.staging.revspot.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    watch: {
      usePolling: true,
    },
  },
})
