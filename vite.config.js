import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
  // Base public path
  base: './',

  // Build options
  build: {
    outDir: 'dist',
    assetsDir: 'assets',

    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console for now, can enable in production
        drop_debugger: true,
      },
    },

    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code
          tsparticles: ['@tsparticles/engine', '@tsparticles/all'],
        },
      },
    },

    // Asset size warnings
    chunkSizeWarningLimit: 1000,
  },

  // Server options for development
  server: {
    port: 3000,
    open: true,
    cors: true,
  },

  // Preview options (for testing production build)
  preview: {
    port: 4173,
    open: true,
  },

  // Plugins
  plugins: [
    // HTML plugin for transformations
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title: 'tsDice - The Ultimate tsParticles Scene Randomizer',
        },
      },
    }),

    // Legacy browser support (optional - increases bundle size)
    legacy({
      targets: ['defaults', 'not IE 11'],
      modernPolyfills: true,
    }),
  ],

  // Optimization
  optimizeDeps: {
    include: ['lz-string'],
  },

  // Define env variables
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'production'
    ),
  },
});
