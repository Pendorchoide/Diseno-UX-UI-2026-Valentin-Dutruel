import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(root, 'index.html'),
        quote: resolve(root, 'views/cotizar.html'),
        plans: resolve(root, 'views/planes.html'),
        customer: resolve(root, 'views/datos.html'),
        payment: resolve(root, 'views/pago.html'),
        success: resolve(root, 'views/exito.html'),
        paymentError: resolve(root, 'views/error-pago.html'),
      },
    },
  },
});
