import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { version } from './package.json'; // Import version from package.json

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: `dist/motion_preview_web_v${version}`, // Use the version in the build directory name
  },
})
