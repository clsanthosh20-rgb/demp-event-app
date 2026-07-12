import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  sourcemap: true,
  external: [
    'firebase-functions',
    'firebase-admin',
    '@google-cloud/storage',
    'sharp',
  ],
  tsconfig: 'tsconfig.json',
});
