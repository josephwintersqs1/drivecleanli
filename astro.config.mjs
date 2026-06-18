// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  publicDir: 'static',
  output: 'server',
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    // Allow Square webhooks through ngrok during local dev (Vite blocks unknown Host headers)
    server: {
      allowedHosts: ['.ngrok-free.dev', '.ngrok.io', '.ngrok.app'],
    },
  },

  adapter: node({
    mode: 'standalone',
  }),
});