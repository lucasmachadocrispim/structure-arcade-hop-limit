/**
 * Converte docs/gdd.md em docs/GDD.pdf.
 *
 * Estratégia: usa pandoc se estiver disponível (o CI tem);
 * caso contrário, gera docs/GDD.html para impressão manual em PDF.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const md = join(root, 'docs/gdd.md');
const pdf = join(root, 'docs/GDD.pdf');

if (!existsSync(md)) {
  console.error('✗ docs/gdd.md não existe');
  process.exit(1);
}

let pandoc = false;
try { execSync('pandoc --version', { stdio: 'ignore' }); pandoc = true; } catch { /* sem pandoc */ }

if (pandoc) {
  execSync(
    `pandoc "${md}" -o "${pdf}" -V geometry:margin=2cm -V fontsize=11pt`,
    { stdio: 'inherit' },
  );
  console.log('✓ GDD.pdf gerado com pandoc');
} else {
  const html = join(root, 'docs/GDD.html');
  const texto = readFileSync(md, 'utf8')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>');
  writeFileSync(
    html,
    `<!doctype html><meta charset="utf-8"><title>GDD · HOP LIMIT</title>
<style>body{font:16px/1.6 system-ui,sans-serif;max-width:800px;margin:3em auto;padding:0 1em;color:#16161a}h1{font-size:2em}h2{margin-top:1.6em;border-bottom:2px solid #e3142f;padding-bottom:.3em}</style>
<article><p>${texto}</p></article>`,
  );
  console.log('⚠ pandoc ausente. Gerado docs/GDD.html (imprima como PDF para a entrega).');
}