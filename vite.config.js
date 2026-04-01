import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Приложение в каталоге code/. Сборка: vite build (без аргумента code/index.html — в Vite 8 это даёт ошибку резолва).
export default defineConfig({
  root: path.resolve(__dirname, 'code'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
});
