import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router-dom') || id.includes('/react/') || id.includes('/react-dom/')) {
              return 'react'
            }

            if (id.includes('/antd/') || id.includes('@ant-design')) {
              return 'antd'
            }

            if (id.includes('@tanstack/react-query') || id.includes('/axios/')) {
              return 'query'
            }

            if (id.includes('/i18next/') || id.includes('react-i18next')) {
              return 'i18n'
            }
          }

          return undefined
        },
      },
    },
  },
  server: {
    port: 5174,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5123',
        changeOrigin: true,
      },
    },
  }
})