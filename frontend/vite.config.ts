import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const wifiAddressLogger: Plugin = {
  name: 'wifi-address-logger',
  configureServer(server) {
    server.httpServer?.once('listening', () => {
      const addresses = Object.entries(os.networkInterfaces())
        .filter(([name]) => /wi-?fi|wlan|wireless/i.test(name))
        .flatMap(([, interfaces]) => (interfaces || [])
          .filter((network) => network.family === 'IPv4' && !network.internal)
          .map((network) => network.address));
      const boundAddress = server.httpServer?.address();
      const port = boundAddress && typeof boundAddress === 'object'
        ? boundAddress.port
        : server.config.server.port;

      if (addresses.length) {
        addresses.forEach((address) => console.log(`  Wi-Fi: http://${address}:${port}/`));
      } else {
        console.warn('  Wi-Fi IPv4 address not found. Check the active network adapter.');
      }
    });
  },
};

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), wifiAddressLogger],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3001,
      strictPort: true,
      proxy: {
        '/api': {
          target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },

      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});