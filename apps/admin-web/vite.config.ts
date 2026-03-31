/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    alias: {
      '@/_shared/queryProvider': path.resolve(__dirname, '../../packages/shared-ui/src/api'),
      '@/_shared/hooks': path.resolve(__dirname, '../../packages/shared-ui/src'),
      '@/_shared/components/auth': path.resolve(__dirname, './src/app/components/auth'),
      '@/_shared/layout': path.resolve(__dirname, './src/app/layout'),
      '@/_shared/context': path.resolve(__dirname, './src/app/context'),
      '@/_shared': path.resolve(__dirname, './src/app'),
      '@': path.resolve(__dirname, './src'),
      '@mercado/shared-ui': path.resolve(__dirname, '../../packages/shared-ui/src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
