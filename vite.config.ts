import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://unpugnaciously-unmensurable-madison.ngrok-free.dev',
        changeOrigin: true,
        secure: true
      },
      '/auth': {
        target: 'https://unpugnaciously-unmensurable-madison.ngrok-free.dev',
        changeOrigin: true,
        secure: true
      }
    }
  },
  define: {
    // Define environment variables for build time
    'import.meta.env.VITE_API_URL': JSON.stringify(
      mode === 'production' 
        ? 'https://unpugnaciously-unmensurable-madison.ngrok-free.dev'
        : 'http://localhost:3001'
    )
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
