// Minifie en place les blocs <style> et <script> inline des pages HTML.
// - CSS  : minification complète (CleanCSS, niveau 1 — sûr, pas de réécriture agressive)
// - JS   : nettoyage léger (suppression des lignes vides superflues) — les noms de
//          variables/fonctions sont conservés car ils sont référencés depuis des
//          attributs onclick="..." dans le HTML.
//
// Réexécution : node scripts/minify-inline.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CleanCSS from 'clean-css';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const FILES = [
  'index.html',
  'conditions.html',
  'livraison.html',
  'privacy.html',
  'plan-interactif-romorantin.html',
  'plan-interactif-niort.html',
  'plan-interactif-tours.html',
];

const cleanCss = new CleanCSS({ level: 1 });

function collapseBlankLines(js) {
  return js
    .split('\n')
    .map(line => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

for (const file of FILES) {
  const filePath = path.join(ROOT, file);
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  html = html.replace(/<style(\s[^>]*)?>([\s\S]*?)<\/style>/g, (full, attrs, css) => {
    const out = cleanCss.minify(css);
    if (out.errors.length) {
      console.error(`${file} — erreur CSS:`, out.errors);
      return full;
    }
    changed = true;
    return `<style${attrs || ''}>${out.styles}</style>`;
  });

  html = html.replace(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g, (full, attrs, js) => {
    if (attrs && (attrs.includes('src=') || attrs.includes('ld+json'))) return full;
    if (!js.trim()) return full;
    changed = true;
    return `<script${attrs || ''}>${collapseBlankLines(js)}</script>`;
  });

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`✔ ${file} minifié`);
  } else {
    console.log(`– ${file} inchangé`);
  }
}
