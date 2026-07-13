import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.cjs',
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  sourcemap: true,
  external: [
    'firebase-functions',
    'firebase-admin',
    '@google-cloud/storage',
    'sharp',
    '@prisma/client',
    '.prisma/client',
    '@prisma/client/runtime/library',
  ],
  tsconfig: 'tsconfig.json',
});
