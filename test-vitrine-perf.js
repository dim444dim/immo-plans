#!/usr/bin/env node
'use strict';

/*
 * test-vitrine-perf.js — Gate perf + analytics de la vitrine ImmoViz 3D.
 *
 * Lancé en CI / à la main : `node test-vitrine-perf.js`.
 * Échecs BRUYANTS : chaque assertion ratée est listée et le process sort en
 * code 1 (pour bloquer un déploiement).
 *
 * Couvre (Vague 3.B) :
 *   1. index/blois/amboise : snippet Plausible présent (src + data-domain)
 *      et <meta CSP> qui autorise plausible.io en script-src ET connect-src.
 *   2. Toute <img> a width ET height (zéro CLS) ; l'image LCP de l'accueil est
 *      préchargée en fetchpriority="high" (donc PAS lazy) ; aucune <img> ne
 *      combine fetchpriority="high" + loading="lazy" (contradiction).
 *   3. demo-3d : plus aucun .gif > 300 Ko référencé ; la vidéo (MP4 + WebM +
 *      poster) est en place et référencée.
 *   4. .gitignore exclut screenshots/ et test-evidence/ du déploiement.
 *
 * ⚠️ Parsing d'attributs HTML : QUOTE-AWARE — capture (["'])(.*?)\1.
 *    JAMAIS [^"'] : la valeur d'un attribut content="... 'self' ..." contient
 *    des apostrophes internes et serait tronquée (cf. feedback_regex_attr_inner_quote).
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = __dirname;
const PAGES = ['index.html', 'blois.html', 'amboise.html'];
const PLAUSIBLE_SRC = 'https://plausible.io/js/script.js';
const PLAUSIBLE_HOST = 'https://plausible.io';
const EXPECTED_DOMAIN = 'dim444dim.github.io/immo-plans';
const MAX_GIF_BYTES = 300 * 1024;

let passed = 0;
const failures = [];

function check(name, fn) {
  try {
    fn();
    passed++;
    console.log('  ✓ ' + name);
  } catch (e) {
    failures.push(name + '\n      → ' + e.message);
    console.error('  ✗ ' + name + '\n      → ' + e.message);
  }
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function sizeOf(rel) {
  return fs.statSync(path.join(ROOT, rel)).size;
}

/* Extracteur d'attribut QUOTE-AWARE : capture le délimiteur ouvrant (" ou ')
 * puis tout jusqu'au MÊME délimiteur fermant. Indispensable pour content="..."
 * dont la valeur CSP contient des 'self' apostrophés. */
function attr(tag, name) {
  const m = tag.match(new RegExp(name + '\\s*=\\s*(["\'])([\\s\\S]*?)\\1', 'i'));
  return m ? m[2] : null;
}

function tagsOf(html, tagName) {
  return html.match(new RegExp('<' + tagName + '\\b[^>]*>', 'gi')) || [];
}

function cspContent(html) {
  const meta = (html.match(/<meta\b[^>]*>/gi) || [])
    .find(t => /http-equiv\s*=\s*(["'])Content-Security-Policy\1/i.test(t));
  return meta ? attr(meta, 'content') : null;
}

/* Renvoie le tableau des sources d'une directive CSP, ou null si absente. */
function cspDirective(csp, name) {
  const part = csp.split(';').map(s => s.trim()).filter(Boolean)
    .find(p => p === name || p.startsWith(name + ' '));
  return part ? part.slice(name.length).trim().split(/\s+/).filter(Boolean) : null;
}

console.log('\n=== test-vitrine-perf.js ===\n');

/* ------------------------------------------------------------------ *
 * 1. Plausible : snippet + CSP (index/blois/amboise)
 * ------------------------------------------------------------------ */
console.log('1. Plausible (snippet + CSP)');
for (const page of PAGES) {
  const html = read(page);

  check(`${page} : snippet Plausible présent (src + data-domain)`, () => {
    const script = tagsOf(html, 'script').find(s => attr(s, 'src') === PLAUSIBLE_SRC);
    assert(script, `aucune <script src="${PLAUSIBLE_SRC}">`);
    const domain = attr(script, 'data-domain');
    assert(domain, 'data-domain absent du snippet Plausible');
    assert.strictEqual(domain, EXPECTED_DOMAIN, `data-domain = "${domain}" (attendu "${EXPECTED_DOMAIN}")`);
  });

  check(`${page} : CSP autorise plausible.io en script-src ET connect-src`, () => {
    const csp = cspContent(html);
    assert(csp, 'meta Content-Security-Policy absente');
    const scriptSrc = cspDirective(csp, 'script-src');
    assert(scriptSrc, 'directive script-src absente');
    assert(scriptSrc.includes(PLAUSIBLE_HOST), `script-src n'autorise pas ${PLAUSIBLE_HOST} (=${scriptSrc.join(' ')})`);
    const connectSrc = cspDirective(csp, 'connect-src');
    assert(connectSrc, 'directive connect-src absente');
    assert(connectSrc.includes(PLAUSIBLE_HOST), `connect-src n'autorise pas ${PLAUSIBLE_HOST} (=${connectSrc.join(' ')})`);
  });
}

/* ------------------------------------------------------------------ *
 * 2. Images : width/height partout + LCP preload fetchpriority
 * ------------------------------------------------------------------ */
console.log('\n2. Images (CLS / LCP)');
for (const page of PAGES) {
  const html = read(page);

  check(`${page} : toute <img> a width ET height`, () => {
    const imgs = tagsOf(html, 'img');
    for (const img of imgs) {
      assert(attr(img, 'width'), `<img> sans width : ${img.slice(0, 90)}…`);
      assert(attr(img, 'height'), `<img> sans height : ${img.slice(0, 90)}…`);
    }
  });

  check(`${page} : aucune <img> ne combine fetchpriority="high" + loading="lazy"`, () => {
    const imgs = tagsOf(html, 'img');
    for (const img of imgs) {
      const lazyHigh = attr(img, 'fetchpriority') === 'high' && attr(img, 'loading') === 'lazy';
      assert(!lazyHigh, `<img> LCP marquée lazy : ${img.slice(0, 90)}…`);
    }
  });
}

check('index.html : image LCP préchargée en fetchpriority="high" (et non lazy)', () => {
  const html = read('index.html');
  const link = tagsOf(html, 'link').find(l =>
    attr(l, 'rel') === 'preload' &&
    attr(l, 'as') === 'image' &&
    attr(l, 'fetchpriority') === 'high');
  assert(link, 'aucun <link rel="preload" as="image" fetchpriority="high"> (image LCP)');
});

/* ------------------------------------------------------------------ *
 * 3. demo-3d : plus de GIF lourd, vidéo en place
 * ------------------------------------------------------------------ */
console.log('\n3. demo-3d (GIF lourd → vidéo)');
check('aucun .gif > 300 Ko référencé dans index/blois/amboise', () => {
  const seen = new Set();
  for (const page of PAGES) {
    const html = read(page);
    const refs = html.match(/[\w\-./]+\.gif/gi) || [];
    for (const ref of refs) {
      const rel = ref.replace(/^\.?\//, '');
      if (seen.has(rel)) continue;
      seen.add(rel);
      if (exists(rel) && sizeOf(rel) > MAX_GIF_BYTES) {
        assert.fail(`${page} référence ${rel} (${(sizeOf(rel) / 1024 | 0)} Ko > 300 Ko)`);
      }
    }
  }
});

check('index.html : vidéo demo-3d (WebM + MP4 + poster) en place et référencée', () => {
  const html = read('index.html');
  assert(/<video\b/i.test(html), 'aucun élément <video>');
  assert(/demo-3d\.webm/i.test(html), 'source WebM non référencée');
  assert(/demo-3d\.mp4/i.test(html), 'source MP4 non référencée');
  assert(exists('img/demo-3d.webm'), 'img/demo-3d.webm manquant');
  assert(exists('img/demo-3d.mp4'), 'img/demo-3d.mp4 manquant');
  const video = tagsOf(html, 'video')[0];
  assert(video, '<video> introuvable');
  assert(attr(video, 'width') && attr(video, 'height'), '<video> sans width/height (CLS)');
  const poster = attr(video, 'poster');
  assert(poster, '<video> sans poster');
  assert(exists(poster.replace(/^\.?\//, '')), `poster manquant : ${poster}`);
});

/* ------------------------------------------------------------------ *
 * 4. .gitignore : artefacts dev exclus du déploiement
 * ------------------------------------------------------------------ */
console.log('\n4. .gitignore (artefacts dev)');
check('.gitignore exclut screenshots/ et test-evidence/', () => {
  const lines = read('.gitignore').split(/\r?\n/)
    .map(l => l.trim().replace(/^\//, '').replace(/\/$/, ''));
  assert(lines.includes('screenshots'), 'screenshots/ non ignoré');
  assert(lines.includes('test-evidence'), 'test-evidence/ non ignoré');
});

/* ------------------------------------------------------------------ */
console.log('\n=== Résultat : ' + passed + ' OK, ' + failures.length + ' échec(s) ===');
if (failures.length) {
  console.error('\nÉCHECS :\n - ' + failures.join('\n - ') + '\n');
  process.exit(1);
}
console.log('Tout est vert.\n');
