

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    base: env.VITE_ROUTER_BASE_URL || '/',
    define: {
      'process.env': env,
    },
    plugins: [react()],
    optimizeDeps: {
      include: ['react', 'react-dom'],
    }
})
}