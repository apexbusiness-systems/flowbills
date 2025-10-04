import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    minify: mode === 'production' ? 'esbuild' : false,
    sourcemap: mode !== 'production',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core vendor chunk
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          // Router chunk
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }
          // Supabase chunk
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          // Query chunk
          if (id.includes('node_modules/@tanstack')) {
            return 'vendor-query';
          }
          // UI components chunk
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-ui';
          }
          // Charts chunk
          if (id.includes('node_modules/recharts')) {
            return 'vendor-charts';
          }
          // Other large dependencies
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        },
        // Optimize asset file names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.');
          const ext = info?.[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext || '')) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },
    target: 'es2020',
    cssCodeSplit: true,
    reportCompressedSize: false, // Faster builds
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none',
    treeShaking: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
    exclude: ['@tanstack/react-query-devtools'],
  },
  preview: {
    host: "::",
    port: 4173,
  },
}));
