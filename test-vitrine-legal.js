#!/usr/bin/env node
'use strict';

/**
 * test-vitrine-legal.js — Gate de conformité légale des pages vitrine (Vague 3.A).
 *
 * Assertions STATIQUES sur le HTML des pages possédées (conditions / privacy / livraison).
 * Aucune dépendance : fs + regex. Echecs BRUYANTS (page + raison), exit 1 si un seul échoue.
 *
 * Méthode test-first : ce fichier est écrit AVANT de corriger les pages. Il doit être ROUGE
 * tant que les mentions légales / Plausible / SIRET ne sont pas en place, puis VERT après.
 */

const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const PAGES = ['conditions.html', 'privacy.html', 'livraison.html'];

// --- Constantes attendues (doivent être IDENTIQUES dans le HTML) ---
const HOST = 'GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA';
const CONTACT = 'dimitri444art@gmail.com';
const PLAUSIBLE_SRC = 'https://plausible.io/js/script.js';
const PLAUSIBLE_DOMAIN = 'dim444dim.github.io';
const DIRECTEUR_LABEL = 'Directeur de la publication';
// Phrase de rétractation 14j : doit apparaître MOT POUR MOT et à l'identique sur chaque page.
const RETRACTATION = "Conformément à l'article L221-18 du Code de la consommation, vous disposez d'un délai de 14 jours à compter de la commande pour exercer votre droit de rétractation, sans avoir à justifier de motifs.";

// --- Compteur d'assertions ---
let pass = 0;
let fail = 0;
const failures = [];

function check(cond, msg) {
  if (cond) {
    pass++;
  } else {
    fail++;
    failures.push(msg);
    console.error('  ✗ ' + msg);
  }
}

// --- Parsing CSP QUOTE-AWARE : (["'])(.*?)\1 — JAMAIS [^"'] (la CSP contient des 'self') ---
function extractCsp(html) {
  const m = html.match(
    /<meta\s+http-equiv=(["'])Content-Security-Policy\1\s+content=(["'])([\s\S]*?)\2\s*\/?>/i
  );
  return m ? m[3] : null;
}

function directiveSources(csp, name) {
  // ';' n'apparaît pas à l'intérieur des quotes de cette CSP : split simple sûr ici.
  const parts = csp.split(';').map((s) => s.trim()).filter(Boolean);
  for (const p of parts) {
    const toks = p.split(/\s+/);
    if (toks[0].toLowerCase() === name) return toks.slice(1);
  }
  return null;
}

function cspAllowsPlausible(sources) {
  if (!sources) return false;
  return sources.some((s) => /(^|\/\/)plausible\.io/i.test(s) || s === 'https://plausible.io');
}

// --- Détection d'un <script> à contenu inline (la CSP sans 'unsafe-inline' le bloquerait) ---
function findInlineScript(html) {
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m[2].trim().length > 0) return m[0].slice(0, 90).replace(/\s+/g, ' ');
  }
  return null;
}

// --- Détection d'un handler inline on*= (hors <style>/<script>, qui n'en contiennent pas) ---
function stripStyleScript(html) {
  return html
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
}

function findInlineHandler(html) {
  const m = stripStyleScript(html).match(/\son[a-z]+\s*=\s*["']/i);
  return m ? m[0].trim() : null;
}

// --- SIRET : doit être des chiffres OU « immatriculation en cours » (jamais un placeholder) ---
function siretOk(html) {
  // Cherche chaque occurrence "SIRET" puis examine une fenêtre de texte qui suit, TAGS RETIRÉS
  // (un <strong>SIRET :</strong> sépare le label de la valeur par une balise fermante).
  const re = /SIRET\b/gi;
  let m;
  let seen = false;
  while ((m = re.exec(html)) !== null) {
    seen = true;
    const window = html.slice(m.index, m.index + 120).replace(/<[^>]*>/g, ' ');
    if (/\d{3,}/.test(window) || /immatriculation en cours/i.test(window)) return true;
  }
  return seen ? false : false;
}

// --- Placeholders interdits (mais PAS les crochets légitimes type "[coller votre URL ici]") ---
function findPlaceholder(html) {
  if (/\[\s*À\s+COMPL[EÉ]TER/i.test(html)) return '[À COMPLÉTER…]';
  if (/\bTODO\b/i.test(html)) return 'TODO';
  const m = html.match(/\[[^\]]*\b(compl[eé]ter|à renseigner|renseigner le|à remplir|à définir|placeholder|xxx+)\b[^\]]*\]/i);
  return m ? m[0] : null;
}

// ======================= EXÉCUTION =======================
console.log('test-vitrine-legal.js — conformité légale vitrine\n');

for (const page of PAGES) {
  const fp = path.join(DIR, page);
  console.log('== ' + page + ' ==');
  if (!fs.existsSync(fp)) {
    check(false, `[${page}] fichier introuvable`);
    continue;
  }
  const html = fs.readFileSync(fp, 'utf8');

  // 1. Hébergeur GitHub + directeur de publication + contact
  check(html.includes(HOST), `[${page}] hébergeur GitHub absent (attendu: "${HOST}")`);
  check(html.includes(DIRECTEUR_LABEL), `[${page}] directeur de publication absent (attendu label: "${DIRECTEUR_LABEL}")`);
  check(html.includes(CONTACT), `[${page}] contact email absent (attendu: "${CONTACT}")`);

  // 2. Aucun placeholder ; SIRET = chiffres OU "immatriculation en cours"
  const ph = findPlaceholder(html);
  check(ph === null, `[${page}] placeholder interdit trouvé: ${ph}`);
  check(siretOk(html), `[${page}] SIRET invalide (attendu: chiffres OU "immatriculation en cours")`);

  // 3. Snippet Plausible présent (src + data-domain)
  check(html.includes(PLAUSIBLE_SRC), `[${page}] snippet Plausible absent (src "${PLAUSIBLE_SRC}")`);
  check(html.includes('data-domain="' + PLAUSIBLE_DOMAIN + '"'), `[${page}] data-domain Plausible absent/incorrect (attendu "${PLAUSIBLE_DOMAIN}")`);

  // 4. CSP autorise plausible.io en script-src ET connect-src (parse quote-aware)
  const csp = extractCsp(html);
  check(csp !== null, `[${page}] aucune <meta CSP> trouvée`);
  if (csp) {
    check(cspAllowsPlausible(directiveSources(csp, 'script-src')), `[${page}] CSP script-src n'autorise pas plausible.io`);
    check(cspAllowsPlausible(directiveSources(csp, 'connect-src')), `[${page}] CSP connect-src n'autorise pas plausible.io`);
  }

  // 5. Aucun handler inline on*= ni <script> à contenu inline
  const handler = findInlineHandler(html);
  check(handler === null, `[${page}] handler inline interdit trouvé: ${handler}`);
  const inlineScript = findInlineScript(html);
  check(inlineScript === null, `[${page}] <script> à contenu inline interdit: ${inlineScript}`);

  // 6. Rétractation 14j présente et identique (même constante sur chaque page)
  check(html.includes(RETRACTATION), `[${page}] rétractation 14j absente ou non identique`);
}

// --- Vérif transversale : la rétractation est bien IDENTIQUE entre toutes les pages ---
const retractFound = PAGES
  .map((p) => path.join(DIR, p))
  .filter((fp) => fs.existsSync(fp))
  .map((fp) => fs.readFileSync(fp, 'utf8').includes(RETRACTATION));
check(retractFound.every(Boolean), 'rétractation 14j non identique/présente sur toutes les pages');

// ======================= BILAN =======================
const total = pass + fail;
console.log('\n----------------------------------------');
console.log(`Assertions : ${total} | OK : ${pass} | ÉCHECS : ${fail}`);
if (fail > 0) {
  console.error('\nÉCHECS :');
  failures.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('Tout est vert ✅');
process.exit(0);
