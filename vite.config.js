import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const codeRoot = path.resolve(__dirname, 'code');
const htmlEntry = path.resolve(codeRoot, 'index.html');

// Сборка из корня: `vite build` (как в CI Hexlet / @hexlet/project).
// root = code/, явный input + alias на строку code/index.html для rolldown.
export default defineConfig({
  root: codeRoot,
  resolve: {
    alias: {
      'code/index.html': htmlEntry,
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: htmlEntry,
    },
  },
});
