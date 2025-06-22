import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    schemas: 'src/schemas.ts',
    validators: 'src/validators.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false, // Keep readable for debugging
  treeshake: true,
  splitting: false,
  outDir: 'dist',
  target: 'es2022',
  platform: 'neutral',
});