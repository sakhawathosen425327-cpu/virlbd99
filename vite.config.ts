import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

// Dynamically construct a distinct version string on each build
const getBuildVersion = () => {
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
    return `${packageJson.version || '0.0.0'}-${Date.now()}`;
  } catch (err) {
    return `0.0.0-${Date.now()}`;
  }
};

const buildVersion = getBuildVersion();

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name]-[hash]-v${buildVersion}.js`,
          chunkFileNames: `assets/[name]-[hash]-v${buildVersion}.js`,
          assetFileNames: `assets/[name]-[hash]-v${buildVersion}.[ext]`,
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
