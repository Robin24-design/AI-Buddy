import path from 'node:path'
import { fileURLToPath } from 'node:url'
import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: '/AI-Buddy/',
  resolve: {
    alias: [
      { find: '@/api/base44Client', replacement: path.join(rootDir, 'api') },
      { find: '@/lib/app-params', replacement: path.join(rootDir, 'app-params.js') },
      { find: '@/lib/authReturnTo', replacement: path.join(rootDir, 'authReturnTo.js') },
      { find: '@/lib/AuthContext', replacement: path.join(rootDir, 'AuthContext.jsx') },
      { find: '@/lib/utils', replacement: path.join(rootDir, 'utils.js') },
      { find: '@/hooks/use-mobile', replacement: path.join(rootDir, 'use-mobile.jsx') },
      { find: '@/components/GoogleIcon', replacement: path.join(rootDir, 'Googlelcon.jsx') },
      { find: '@/components/ui', replacement: rootDir },
      { find: '@/components/ai', replacement: rootDir },
      { find: '@/components', replacement: rootDir },
    ],
  },
  plugins: [
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }),
    react(),
  ]
})
