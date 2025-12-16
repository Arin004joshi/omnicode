import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // FIX: Explicitly tell esbuild to treat .js files as JSX
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/, // Targets all .jsx and .js files in src/
    exclude: [],
  }
})