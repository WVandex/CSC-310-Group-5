import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    //@ts-ignore
    tailwindcss(),
  ],
})