#!/usr/bin/env node
// verify-vitrine.mjs — VERIFY Vague 3 (vitrine immo-plans), point d'entrée unique.
//
// Usage : node verify-vitrine.mjs [--a=<hash3A>] [--b=<hash3B>]
//                                 [--domain=dim444dim.github.io] [--lighthouse]
//
// Sortie : exit 0 = PASS (déterministe + runtime vérifié)
//          exit 1 = FAIL (au moins un contrôle rouge)
//          exit 2 = PASS déterministe, mais runtime NON vérifié (outils absents)
//
// Phases : 0 git/intégrité · 1 tests Node des instances · 2 probes contenu (déterministe)
//          · 3 navigateur (Playwright, best-effort) · 4 Lighthouse (opt-in --lighthouse).
// Les phases 1+2 sont le GATE DUR. 3+4 sont best-effort (mieux vaut le confirmer, mais
// le déterministe ne ment pas et tourne partout).

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  if (m) return m.split('=').slice(1).join('=');
  return process.argv.includes(`--${k}`) ? true : d;
};
// Pas de valeur figée par défaut : le vrai défaut est l'INCOHÉRENCE entre pages.
// --domain=… (optionnel) ajoute en plus un contrôle d'égalité à une valeur attendue.
const DOMAIN_EXPECTED = (arg('domain', process.env.DATA_DOMAIN || '') || '').toString() || null;
const HASH_A = arg('a', process.env.V3A_HASH || '');
const HASH_B = arg('b', process.env.V3B_HASH || '');
const DO_LH = !!arg('lighthouse', false);

const PAGES = ['index', 'conditions', 'privacy', 'livraison', 'blois', 'amboise'];
const LEGAL = ['conditions', 'privacy', 'livraison'];

// Ownership pour le contrôle de disjonction (Phase 0).
const OWN_A = [/^conditions\.html$/, /^privacy\.html$/, /^livraison\.html$/, /^mentions-legales\.html$/, /^test-vitrine-legal\.js$/];
const OWN_B = [/^index\.html$/, /^blois\.html$/, /^amboise\.html$/, /^test-vitrine-perf\.js$/, /^\.gitignore$/,
  /^img\//, /^sw\.js$/, /^service-worker\.js$/, /^manifest\.json$/, /^css\//, /^assets\//,
  /^test-evidence\//, /^screenshots\//, /^chatbot-.*\.png$/]; // 3.B = nettoyage des artefacts dev (suppressions légitimes)

const results = [];
const rec = (phase, label, status, detail = '') => {
  results.push({ phase, status });
  const ic = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏭️';
  console.log(`  ${ic} [${phase}] ${label}${detail ? ` — ${detail}` : ''}`);
};
const head = (t) => console.log(`\n▶ ${t}`);

const read = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : null);

// ── CSP : extraction QUOTE-AWARE. La valeur contient des apostrophes ('self') →
//    on capture avec (["'])(.*?)\1 et JAMAIS [^"'] (qui tronquerait à 'self').
//    Réf. mémoire feedback_regex_attr_inner_quote (bug réel attrapé en Vague 2).
function extractCSP(html) {
  const tag = html.match(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/i);
  if (!tag) return null;
  const c = tag[0].match(/content=(["'])([\s\S]*?)\1/i);
  return c ? c[2] : null;
}
const cspAllowsPlausible = (csp) =>
  !!csp && /script-src[^;]*plausible\.io/i.test(csp) && /connect-src[^;]*plausible\.io/i.test(csp);

function plausibleSnippet(html) {
  const tag = html.match(/<script[^>]*plausible\.io\/js\/script\.js[^>]*>/i);
  if (!tag) return { ok: false, domain: null };
  const dd = tag[0].match(/data-domain=["']([^"']+)["']/i);
  return { ok: true, domain: dd ? dd[1] : null };
}

// ───────────────────────── Phase 0 — git / intégrité ─────────────────────────
function changedFiles(hash) {
  try {
    return execSync(`git show --pretty="" --name-only ${hash}`, { cwd: ROOT })
      .toString().split('\n').map((s) => s.trim()).filter(Boolean);
  } catch { return null; }
}
function phase0() {
  head('Phase 0 — git & intégrité (fichiers disjoints)');
  if (!HASH_A || !HASH_B) { rec(0, 'commits 3.A/3.B', 'skip', 'hash non fournis (--a=/--b=)'); return; }
  const a = changedFiles(HASH_A), b = changedFiles(HASH_B);
  if (!a || !b) { rec(0, 'lecture des commits', 'fail', 'hash introuvable'); return; }
  const inter = a.filter((f) => b.includes(f));
  rec(0, 'aucun fichier partagé entre 3.A et 3.B', inter.length ? 'fail' : 'pass', inter.join(', '));
  const offA = a.filter((f) => !OWN_A.some((r) => r.test(f)));
  const offB = b.filter((f) => !OWN_B.some((r) => r.test(f)));
  rec(0, '3.A ne touche que ses fichiers', offA.length ? 'fail' : 'pass', offA.join(', '));
  rec(0, '3.B ne touche que ses fichiers', offB.length ? 'fail' : 'pass', offB.join(', '));
}

// ───────────────────── Phase 1 — tests Node des instances ────────────────────
function runNode(file) {
  if (!existsSync(join(ROOT, file))) return { status: 'skip', detail: 'absent (à livrer)' };
  const r = spawnSync('node', [file], { cwd: ROOT, encoding: 'utf8' });
  return { status: r.status === 0 ? 'pass' : 'fail', detail: r.status === 0 ? '' : `exit ${r.status}` };
}
function phase1() {
  head('Phase 1 — gate déterministe des instances (je relance moi-même)');
  let r = runNode('test-vitrine-legal.js'); rec(1, 'test-vitrine-legal.js (3.A)', r.status, r.detail);
  r = runNode('test-vitrine-perf.js'); rec(1, 'test-vitrine-perf.js (3.B)', r.status, r.detail);
}

// ──────────────────────── Phase 2 — probes contenu ───────────────────────────
function phase2() {
  head('Phase 2 — probes de contenu (déterministe, 6 pages)');
  const pages = Object.fromEntries(PAGES.map((p) => [p, read(`${p}.html`)]));

  // a) aucun placeholder légal n'a fuité
  let leaks = [];
  for (const p of PAGES) if (pages[p] && /\[À COMPLÉTER|TODO|XXXX|lorem ipsum/i.test(pages[p])) leaks.push(p);
  rec(2, 'aucun placeholder/[À COMPLÉTER] en ligne', leaks.length ? 'fail' : 'pass', leaks.join(', '));

  // b) SIRET = chiffres OU "immatriculation en cours", jamais un crochet
  let siretOk = false, siretBad = false;
  for (const p of LEGAL) {
    if (!pages[p]) continue;
    const m = pages[p].match(/siret[\s:]*[^<\n]{0,80}/i);
    if (m) {
      if (/\d{9,}/.test(m[0]) || /immatriculation en cours/i.test(m[0])) siretOk = true;
      if (/\[/.test(m[0])) siretBad = true;
    }
  }
  rec(2, 'SIRET réel OU « immatriculation en cours »', siretOk && !siretBad ? 'pass' : 'fail',
    siretBad ? 'placeholder crochet présent' : (siretOk ? '' : 'mention SIRET absente/non conforme'));

  // c) snippet Plausible présent sur TOUTES les pages + data-domain COHÉRENT
  let missing = []; const domains = new Map();
  for (const p of PAGES) {
    if (!pages[p]) { missing.push(`${p}(absent)`); continue; }
    const s = plausibleSnippet(pages[p]);
    if (!s.ok) missing.push(p); else domains.set(p, s.domain);
  }
  rec(2, 'snippet Plausible présent sur les 6 pages', missing.length ? 'fail' : 'pass', missing.join(','));
  const distinct = [...new Set(domains.values())];
  rec(2, 'data-domain IDENTIQUE partout (contrat partagé)', distinct.length <= 1 ? 'pass' : 'fail',
    distinct.length <= 1 ? `= ${distinct[0] || '?'}` : `divergent: ${[...domains].map(([p, d]) => `${p}=${d}`).join('  ')}`);
  if (DOMAIN_EXPECTED) {
    const wrong = [...domains].filter(([, d]) => d !== DOMAIN_EXPECTED).map(([p]) => p);
    rec(2, `data-domain == ${DOMAIN_EXPECTED}`, wrong.length ? 'fail' : 'pass', wrong.join(','));
  }

  // d) cohérence CSP : plausible autorisé (script+connect) sur les 6 pages
  let cspBad = [];
  for (const p of PAGES) { if (!pages[p]) continue; if (!cspAllowsPlausible(extractCSP(pages[p]))) cspBad.push(p); }
  rec(2, 'CSP autorise plausible.io (script+connect) partout', cspBad.length ? 'fail' : 'pass', cspBad.join(', '));

  // e) zéro inline exécutable (CSP-ready)
  let inlineBad = [];
  const HANDLER = /\son(click|load|error|mouse[a-z]+|key[a-z]+|submit|change|input|focus|blur|toggle)\s*=/i;
  const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)(?![^>]*type=["']application\/(ld\+)?json["'])[^>]*>\s*[^\s<]/i;
  for (const p of PAGES) { if (!pages[p]) continue; if (HANDLER.test(pages[p]) || INLINE_SCRIPT.test(pages[p])) inlineBad.push(p); }
  rec(2, 'aucun handler on*= ni <script> inline exécutable', inlineBad.length ? 'fail' : 'pass', inlineBad.join(', '));

  // f) toutes les <img> ont width ET height (zéro CLS)
  let imgBad = [];
  for (const p of PAGES) {
    if (!pages[p]) continue;
    const imgs = pages[p].match(/<img\b[^>]*>/gi) || [];
    for (const t of imgs) if (!/\bwidth=/i.test(t) || !/\bheight=/i.test(t)) { imgBad.push(p); break; }
  }
  rec(2, 'chaque <img> a width+height', imgBad.length ? 'fail' : 'pass', imgBad.join(', '));

  // g) demo allégée : pas de .gif > 300 Ko référencé dans index, et un <video> présent
  if (pages.index) {
    const gif = pages.index.match(/src=["']([^"']*\.gif)["']/i);
    let heavy = false, detail = '';
    if (gif) {
      const f = join(ROOT, gif[1].replace(/^\.?\//, ''));
      if (existsSync(f) && statSync(f).size > 300 * 1024) { heavy = true; detail = `${gif[1]} = ${(statSync(f).size/1024|0)}Ko`; }
    }
    const hasVideo = /<video\b/i.test(pages.index);
    rec(2, 'demo en vidéo/WebP (pas de .gif lourd)', heavy || !hasVideo ? 'fail' : 'pass',
      heavy ? detail : (!hasVideo ? '<video> absent' : ''));
  }

  // h) artefacts dev hors déploiement — on teste la RÉALITÉ (non trackés par git),
  //    pas le texte du .gitignore (qui peut utiliser des patterns ancrés /dir/).
  let tracked = '';
  try { tracked = execSync('git ls-files screenshots test-evidence chatbot-*.png', { cwd: ROOT }).toString().trim(); } catch { /* hors dépôt */ }
  rec(2, 'artefacts dev (screenshots/test-evidence) non trackés', tracked ? 'fail' : 'pass',
    tracked ? `${tracked.split('\n').length} fichier(s) encore trackés` : '');
}

// ───────────── serveur statique en process (pour Phase 3, sans dépendance) ────
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
function staticServer() {
  return createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/' ) p = '/index.html';
    const f = join(ROOT, p);
    if (!f.startsWith(ROOT) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': MIME[extname(f)] || 'application/octet-stream' });
    res.end(readFileSync(f));
  });
}

// ──────────────────────── Phase 3 — navigateur réel ──────────────────────────
async function phase3() {
  head('Phase 3 — navigateur réel (Playwright : CSP=0 + Plausible fire)');
  let chromium;
  try { ({ chromium } = await import('playwright')); } catch { /* pas dans immo-plans */ }
  if (!chromium) {
    // Repli : résoudre Playwright depuis scraper-app (Chromium déjà installé là-bas).
    try {
      const { createRequire } = await import('node:module');
      const { pathToFileURL } = await import('node:url');
      const req = createRequire(pathToFileURL(join(ROOT, '..', 'scraper-app', 'package.json')));
      chromium = req('playwright').chromium;
    } catch { /* indisponible */ }
  }
  if (!chromium) { rec(3, 'Playwright', 'skip', "absent — `npx playwright install` ou lancer via le MCP chrome-devtools"); return; }
  const srv = staticServer(); await new Promise((r) => srv.listen(0, r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const browser = await chromium.launch();
  try {
    for (const p of PAGES) {
      const ctx = await browser.newContext(); const page = await ctx.newPage();
      let scriptLoaded = false, ignoredLocalhost = false, fired = false; const logs = [];
      // Plausible IGNORE volontairement localhost/127.x (/api/event ne part pas) → on prouve
      // que le script a CHARGÉ et tourne via le log « Ignoring Event: localhost », jamais en
      // bypassant la garde. Réf. mémoire feedback_plausible_localhost_no_event.
      page.on('console', (m) => { const t = m.text(); logs.push(t); if (/ignoring event.*(localhost|file)/i.test(t)) ignoredLocalhost = true; });
      page.on('request', (r) => { if (/plausible\.io\/js\//.test(r.url())) scriptLoaded = true; if (/plausible\.io\/api\/event/.test(r.url())) fired = true; });
      await page.addInitScript(() => document.addEventListener('securitypolicyviolation', (e) => (window.__csp = (window.__csp || []).concat(e.violatedDirective))));
      await page.goto(`${base}/${p}.html`, { waitUntil: 'networkidle' }).catch(() => {});
      const csp = (await page.evaluate(() => window.__csp || []).catch(() => [])) || [];
      rec(3, `${p} : 0 violation CSP`, csp.length ? 'fail' : 'pass', csp.join(','));
      // OK = script chargé ET (event suppressed pour localhost OU réellement émis hors-localhost).
      const ok = scriptLoaded && (ignoredLocalhost || fired);
      rec(3, `${p} : Plausible chargé + comportement correct`, ok ? 'pass' : (scriptLoaded ? 'fail' : 'skip'),
        ok ? (fired ? 'event émis' : 'localhost ignoré (attendu)') : (scriptLoaded ? 'chargé mais ni event ni ignore' : 'script.js non chargé (réseau requis)'));
      await ctx.close();
    }
  } finally { await browser.close(); srv.close(); }
}

// ──────────────────────── Phase 4 — Lighthouse (opt-in) ───────────────────────
async function phase4() {
  if (!DO_LH) { head('Phase 4 — Lighthouse'); rec(4, 'Lighthouse', 'skip', 'passer --lighthouse pour l’activer'); return; }
  head('Phase 4 — Lighthouse (perf mobile index ≥ 90, CLS≈0)');
  const srv = staticServer(); await new Promise((r) => srv.listen(0, r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const out = join(ROOT, '.lh-report.json');
  const r = spawnSync('npx', ['-y', 'lighthouse', `${base}/index.html`, '--only-categories=performance',
    '--form-factor=mobile', '--screenEmulation.mobile', '--quiet', '--chrome-flags=--headless=new --no-sandbox',
    `--output=json`, `--output-path=${out}`], { encoding: 'utf8', shell: process.platform === 'win32' });
  srv.close();
  if (r.status !== 0 || !existsSync(out)) { rec(4, 'exécution Lighthouse', 'skip', 'indisponible/hors-ligne'); return; }
  try {
    const j = JSON.parse(readFileSync(out, 'utf8'));
    const perf = Math.round((j.categories.performance.score || 0) * 100);
    const cls = j.audits['cumulative-layout-shift']?.numericValue ?? 1;
    rec(4, `Performance ≥ 90`, perf >= 90 ? 'pass' : 'fail', `score=${perf}`);
    rec(4, `CLS ≈ 0`, cls <= 0.1 ? 'pass' : 'fail', `cls=${cls.toFixed(3)}`);
  } catch (e) { rec(4, 'parse rapport', 'skip', e.message); }
}

// ───────────────────────────── verdict ───────────────────────────────────────
(async () => {
  console.log('═══ VERIFY Vague 3 — vitrine immo-plans ═══');
  phase0(); phase1(); phase2();
  await phase3(); await phase4();

  const fails = results.filter((r) => r.status === 'fail').length;
  const skips = results.filter((r) => r.status === 'skip').length;
  console.log('\n────────────────────────────────────────────');
  if (fails > 0) { console.log(`❌ FAIL — ${fails} contrôle(s) rouge(s). Renvoyer la mission fautive à son instance.`); process.exit(1); }
  if (skips > 0) { console.log(`🟡 PASS DÉTERMINISTE — ${skips} phase(s) non vérifiée(s) (outils/inputs absents). Confirmer runtime avant Vague 4.`); process.exit(2); }
  console.log('✅ PASS — déterministe + runtime. → Vague 4 (re-audit 100/100).'); process.exit(0);
})();
