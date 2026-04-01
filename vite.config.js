import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const codeRoot = path.resolve(__dirname, 'code');
const htmlEntry = path.resolve(codeRoot, 'index.html');

// Ключ «code/index.html» — как у rolldown в CI; root = code/ → итог dist/index.html.
export default defineConfig({
  root: codeRoot,
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'code/index.html': htmlEntry,
      },
    },
  },
});
