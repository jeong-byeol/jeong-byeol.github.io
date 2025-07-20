import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          wagmi: ['wagmi', 'viem'],
          router: ['react-router-dom']
        }
      }
    }
  },
  base: './', // 상대 경로로 설정하여 GitHub Pages에서 정상 작동
})
