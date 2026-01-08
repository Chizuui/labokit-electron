import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: (() => {
    const p: any[] = [react()];
    const isElectronBuild = process.env.BUILD_ELECTRON === 'true' || process.env.ELECTRON === '1';
    if (isElectronBuild) {
      p.push(electron({
        main: {
          entry: 'electron/main.ts',
          vite: {
            build: {
              rollupOptions: {
                external: ['electron-squirrel-startup']
              }
            }
          }
        },
        preload: {
          input: path.join(__dirname, 'electron/preload.ts'),
        },
        renderer: process.env.NODE_ENV === 'test'
          ? undefined
          : {},
      }));
    }
    return p;
  })(),
})