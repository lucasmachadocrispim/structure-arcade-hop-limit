/**
 * Build do HOP LIMIT.
 * Copia os arquivos estáticos para dist/ e escreve dist/version.json
 * com a versão (do package.json), o SHA do commit (via env) e a data.
 */
import { mkdirSync, rmSync, cpSync, writeFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

// 1. index.html
cpSync(join(root, 'index.html'), join(dist, 'index.html'));

// 2. src/
cpSync(join(root, 'src'), join(dist, 'src'), { recursive: true });

// 3. assets e outros arquivos estáticos, se existirem
['assets'].forEach(p => {
  const abs = join(root, p);
  if (existsSync(abs)) cpSync(abs, join(dist, p), { recursive: true });
});

// 4. version.json
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const sha = (process.env.GITHUB_SHA || 'local').slice(0, 7);
const version = {
  versao: pkg.version,
  sha,
  build: new Date().toISOString(),
};
writeFileSync(join(dist, 'version.json'), JSON.stringify(version, null, 2));

console.log('✓ Build concluído em dist/');
console.log('  versão:', version.versao, '· sha:', version.sha);
console.log('  arquivos:', readdirSync(dist).join(', '));