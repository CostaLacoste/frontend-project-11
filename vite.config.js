import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const codeRoot = path.resolve(__dirname, 'code');

// Приложение в code/. Сборка: npm run build → dist/index.html в корне репозитория.
// Явный input — чтобы резолв совпадал с ожиданиями rolldown/Hexlet (модуль code/index.html).
export default defineConfig({
  root: codeRoot,
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(codeRoot, 'index.html'),
    },
  },
});
