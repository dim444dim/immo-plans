# ImmoViz 3D — Workflow Mission

## Vague 1
- [x] 1A — Curseur custom JS — 2026-06-09
- [x] 1B — Split-text h1 mot par mot — 2026-06-09
- [x] 1C — Loader initial — 2026-06-09
- [x] 1D — Compteurs animés — 2026-06-09

## Corrections Débrief V1
- [x] 1A fix — @media(hover:none) cursor:auto mobile — 2026-06-09
- [x] 1B fix — IIFE enveloppée dans DOMContentLoaded — 2026-06-09

## Vague 2
- [x] 2A — Slider Avant/Après — 2026-06-09
- [x] 2B — Section Comment ça marche — 2026-06-09
- [x] 2C — SVG miniatures démos — 2026-06-09
- [x] 2C fix — label Tours "Appartement · ~85m²" — 2026-06-09

## Vague 3
- [x] 3A — Optimisation mobile : burger menu, breakpoints 740/640/480px, statbox unsticky, ab-wrap 240px, iframe-shell 340px, h1 letter-spacing -1px mobile — 2026-06-09
- [x] 3B — Meta OG + SEO : og:title/description/url/type/image, twitter:card/title/image, canonical — 2026-06-09
- [x] 3C — Polish final : scroll-margin-top 80px sur toutes sections nav, footer liens sociaux (WhatsApp/LinkedIn placeholders), console propre — 2026-06-09

## Vague 4
- [x] 4A — Formulaire modal : champs prénom/email/URL/budget/message, validation, mailto structuré, état succès — 2026-06-09
- [x] 4B — Sticky CTA bar : pill fixe bottom, apparaît après 520px scroll, masqué near-footer, ouvre formulaire modal — 2026-06-09
- [x] 4C — Section Témoignages : 3 cards glass ★★★★★, placée avant CTA final — 2026-06-09

## Vague 7
- [x] 7A — Métadonnées démos corrigées : Niort 177m²·11 pièces·Marais Poitevin, Tours Maison bourgeoise 235m²·Tours centre, hcard hero Tours mis à jour — 2026-06-09
- [x] 7B — livraison.html : page client post-commande, params URL ?nom=&plan=&bien=, URL copiable en 1 clic, 3 étapes LeBonCoin, retouche incluse — 2026-06-09

## Vague 6
- [x] 6A — Plausible Analytics : `<script defer data-domain="dim444dim.github.io/immo-plans">` ajouté dans `<head>` après meta theme-color — 2026-06-09
- [x] 6B — Événements de conversion : 'Devis ouvert' (openForm), 'Devis envoyé' (+props budget), 'Demo cliquée' (.btn-demo), 'FAQ ouverte' (+props question) — wrapper `if (window.plausible)` sécurisé — 2026-06-09

## Vague 5
- [x] 5A — Lighthouse / Core Web Vitals — 2026-06-09
  - font-display:swap déjà présent dans l'URL Google Fonts ✅
  - `<link rel="preload" as="image">` ajouté pour l'image hero Unsplash (LCP)
  - Pas de `<img>` dans la page (fond en CSS background-image) → loading="lazy" N/A
  - `<meta name="theme-color" content="#0d0d0d">` ajouté dans le head
  - CSS inline minifié : ~12 lignes vides superflues supprimées entre sections
- [x] 5B — Accessibilité clavier — 2026-06-09
  - `:focus-visible` outline cyan ajouté sur a/button/input/textarea/select/[role="slider"]/.faqq/.fradio
  - FAQ : `aria-expanded="false/true"` sur .faqq, `aria-hidden="true/false"` sur .faqa (HTML + JS)
  - Slider avant/après : `role="slider"` aria-valuenow/min/max + tabindex="0" + navigation clavier ←→
  - Mobile menu close : `aria-label="Fermer le menu"` ajouté (burger avait déjà aria-label="Menu")

## Vague 7bis — Fonctionnalités marketing & conversion — 2026-06-11/12
- [x] 7bis-A — Garantie 7 jours, FAQ enrichie, comparatif Matterport, badges certifications (0fabab9, 020abb4, ae09d90 — harmonisation garantie 7j / paiement après livraison)
- [x] 7bis-B — Bloc "Objectifs 2026" animé dans le hero (e72796f)
- [x] 7bis-C — Bannière sticky "places limitées" avec compteur jour/semaine (d8a0e6b, 56b07f8)
- [x] 7bis-D — Modale quiz interactif "Quel agent es-tu ?" (1a24aae), repositionnée en bas-gauche avec correction du z-index (54ae7a6)
- [x] 7bis-E — Chatbot IA conseiller ImmoViz : 4 questions + résumé personnalisé (d6db6b5), fermé par défaut et empilé au-dessus du bouton WhatsApp sur mobile (037b393)
- [x] 7bis-F — Calculateur ROI interactif (3 sliders) (a230a2a)
- [x] 7bis-G — Section dashboard "En chiffres" avec compteurs animés au scroll (27420f6)
- [x] 7bis-H — `.gitignore` standard (secrets, dumps DB) (6fb22a8)
- [x] 7bis-I — Boutons paiement Stripe (mode démo) sur les offres Tarifs (78bf3c9)
- [x] 7bis-J — RGPD : blocage réel des trackers (Plausible) tant que le consentement cookies n'est pas donné (5e29569)

## Vague 8 — Audit PWA (corrections) — 2026-06-13
- [x] 8A — Icônes PNG (remplacent les SVG data-URI, incompatibles iOS Safari) :
  - `icons/icon-192.png`, `icons/icon-512.png` (purpose "any")
  - `icons/icon-maskable-192.png`, `icons/icon-maskable-512.png` (purpose "maskable", contenu dans la safe zone à 80%)
  - `icons/apple-touch-icon.png` (180x180) + `<link rel="apple-touch-icon">` et `<link rel="icon">` dans index.html
  - Générées via `icons/generate_icons.py` (Pillow, fond #159500 + texte "3D", police arialbd) — relancer ce script si le logo change
- [x] 8B — `orientation`: `portrait-primary` → `any` dans manifest.json. Justification : le site est 100% responsive (breakpoints 740/640/480px) et contient un viewer 3D interactif (#demo-frame) qu'il est préférable de pouvoir consulter en paysage une fois l'app installée.
- [x] 8C — `service-worker.js` : `CACHE_NAME` bump `v1` → `v2` (commentaire ajouté expliquant la politique de versioning) + `urlsToCache` complété avec toutes les pages réelles (privacy, conditions, livraison, les 3 plans interactifs), `manifest.json` et les 5 icônes.
- [x] 8D — Bouton "Installer l'application" (`data-install-pwa`) ajouté dans le footer (icône download, masqué par défaut, affiché par le handler `beforeinstallprompt`, masqué à nouveau via `appinstalled`).
- [x] 8E — Test réel Service Worker / offline via Playwright (`C:\Dev\tools\playwright\pwa-test.js`), serveur local `python -m http.server` sur `C:\Dev\immobilier-3d\` (port 8088) :
  - SW actif sur le scope `http://localhost:8088/immo-plans/` (`active: "activating"` → puis `activated`)
  - Cache `immoviz-v2` contient les 14 ressources attendues (vérifié par `caches.keys()`)
  - Rechargement hors-ligne de `/immo-plans/` → page servie depuis le cache (titre OK)
  - Navigation hors-ligne vers `/immo-plans/livraison.html` → `status: 200` (servie depuis le cache, pas de fallback)
  - Captures (preuve, dans ce repo) : `test-evidence/pwa-online.png`, `test-evidence/pwa-offline.png`
  - Script de test : `C:\Dev\tools\playwright\pwa-test.js`
  - Pour rejouer : `node pwa-test.js http://localhost:8088/immo-plans/`

## Vague 9 — Audit PERFORMANCE (corrections) — 2026-06-14
- [x] 9A — Nettoyage `index.html` : suppression du code Three.js mort et des blocs dupliqués (calculateur ROI #2, `calculatePlacesLeft` #2, `animateCounter` #2 + double listener `load`).
- [x] 9B — `index.html` : délai du loader réduit, image héro responsive (mobile).
- [x] 9C — `plan-interactif-tours.html` : script Three.js cassé (src + inline) corrigé, Three.js chargé en lazy-load, suppression du double listener `mousemove`/`console.log`.
- [x] 9D — `plan-interactif-romorantin.html` : suppression du double tracking GA (`gtag`), retrait du `Sky.js` mort, Three.js/OrbitControls/QRCode chargés en lazy-load, suppression du double listener `mousemove`/`console.log`.
- [x] 9E — `plan-interactif-niort.html` : script Three.js cassé corrigé, Three.js/OrbitControls en lazy-load, suppression du double listener `mousemove`/`console.log`.
- [x] 9F — Extraction de l'image base64 (2,75 Mo) de `plan-interactif-niort.html` vers `panoramas/niort-salon.webp`, chargée en lazy-load.
- [x] 9G — Migration Tailwind CDN → build local :
  - `package.json` (script `build:css`), `tailwind.config.js` (scope `index.html` + `conditions.html`, seuls fichiers utilisant Tailwind), `src/tailwind-input.css`
  - `css/tailwind.min.css` généré (242 règles, ~17,8 Ko) via `npm run build:css` — à régénérer après toute modification des classes Tailwind dans `index.html`/`conditions.html`
  - Retrait de `<script src="https://cdn.tailwindcss.com">` (head + body) dans `index.html` et `conditions.html`, ajout de `<link rel="stylesheet" href="css/tailwind.min.css">`
  - CSP (`index.html`) : retrait de `https://cdn.tailwindcss.com` du `script-src`
- [x] 9H — `service-worker.js` → `immoviz-v3` :
  - `urlsToCache` complété avec `css/tailwind.min.css` et toutes les pages réelles
  - Stratégie passée en *stale-while-revalidate* (réponse instantanée depuis le cache + rafraîchissement réseau en arrière-plan, y compris pour les ressources CDN en `no-cors`/opaque)
- [x] 9I — Minification CSS/JS inline via `scripts/minify-inline.mjs` (CleanCSS niveau 1 pour le CSS, nettoyage des lignes vides pour le JS — pas de mangling des noms de fonctions, référencés depuis des `onclick="..."` HTML) sur les 7 pages HTML. Suppression des `console.log` de debug dans `plan-interactif-niort.html` (conservés : `console.error`). Validation syntaxique via Terser (`compress:false, mangle:false`) → 0 erreur.
  - Pour rejouer après modification du HTML/JS inline : `node scripts/minify-inline.mjs`
- [x] 9J — Bugs fonctionnels pré-existants découverts et corrigés pendant la vérification visuelle (hors périmètre initial de l'audit PERF, mais bloquants pour les tests) :
  - `plan-interactif-tours.html` : `init360()` chargeait `./panorama-salon.png` (404, fichier inexistant) → remplacé par une sphère placeholder générée directement (pas de requête réseau).
  - `plan-interactif-romorantin.html` : `switchTab`/clics 2D/3D/360° entièrement cassés par un `document.getElementById('default-view')` retournant toujours `null` (élément inexistant) → variable et usages supprimés.
  - `plan-interactif-romorantin.html` : texture de sol CDN jsdelivr (`grasslight-big.jpg`, 404) → remplacée par la texture canvas existante `makeGrassTex()`.
  - `plan-interactif-niort.html` : `REAL_IMAGES['sejour-principal']` référençait une image inexistante (404) → entrée supprimée (fallback texture générée, comme les autres pièces).
  - `plan-interactif-tours.html`, `plan-interactif-romorantin.html`, `plan-interactif-niort.html` : popup exit-intent totalement inerte — le script s'exécutait avant que `#exit-popup` n'existe dans le DOM (`getElementById` → `null` → `return` immédiat) → IIFE enveloppée dans `document.addEventListener('DOMContentLoaded', ...)`.
  - `index.html` + les 3 pages plan : régression découverte après le fix DOMContentLoaded — `lastMouseY` initialisé à `window.innerHeight` déclenchait la popup exit-intent dès le premier `mousemove`, même sans intention de quitter la page (tout mouvement initial avec `clientY < 50` était interprété comme "vers le haut"). Corrigé : `lastMouseY = null` au départ, le premier `mousemove` ne fait qu'enregistrer la position de référence sans déclencher la popup.
- [x] 9K — Vérification visuelle (Playwright, serveur local `python -m http.server 8080` depuis `C:\Dev\immobilier-3d\`) :
  - `index.html` : rendu Tailwind OK (242 règles appliquées), bannière cookies visible puis masquée après "Accepter", calculateur ROI réactif (112 500€ → 225 000€ en déplaçant un slider), 0 erreur console
  - `plan-interactif-tours.html`, `plan-interactif-romorantin.html`, `plan-interactif-niort.html` : onglets 2D/3D/360° fonctionnels (Three.js chargé en lazy-load), 0 erreur console
  - Popup exit-intent : invisible au chargement, s'affiche correctement lors d'un mouvement de souris réel vers le haut du viewport (`clientY < 50`)
  - Scripts de test ajoutés dans `C:\Dev\tools\playwright\` : `test-tabs.js`, `test-exit-popup.js`, `test-index-features.js`, `shot-3d.js`

## Vague 10 — PERF round 2 — 2026-06-14
- [x] 10A — PERF-242/226/243 : `index.html` — différé l'injection DOM + l'init JS des 4 widgets non critiques, qui ne coûtent plus rien au chargement initial :
  - **Quiz** (`#quizModal`) : markup déplacé dans `QUIZ_MODAL_HTML` (template string), injecté via `buildQuizModal()` au premier clic sur `#quizButton`.
  - **Chatbot** (`#chatbot`) : markup déplacé dans `CHATBOT_HTML`, injecté via `buildChatbot()` au premier clic sur `#chatToggle` (le bouton flottant, lui, reste visible immédiatement — UX standard).
  - **Lead-magnet** (`#leadMagnetModal`) : markup déplacé dans `LEAD_MAGNET_HTML`, injecté via `buildLeadMagnetModal()` lors du premier déclenchement réel (scroll > 50% de la page, après 30s).
  - **Exit-intent popup** (`#exit-popup`) : markup déplacé dans `EXIT_POPUP_HTML`, injecté via `buildPopup()`. Détection de l'intention de sortie elle-même différée via `requestIdleCallback` (fallback `setTimeout(1500)`).
  - Tous les listeners `keydown`/Escape associés gèrent désormais le cas "modale jamais construite" (`if (modal && ...)`) pour éviter un `TypeError` si l'utilisateur appuie sur Échap avant la 1ère ouverture.
- [x] 10B — PERF-214 : compteurs du dashboard (`#dashStat1-4`) — `setInterval(...,30)` remplacé par `animDashStat()` (boucle `requestAnimationFrame`, durée 1500ms), déclenché via `IntersectionObserver` au scroll dans la section, même pattern que les compteurs `[data-count]`.
- [x] 10C — PERF-215 : slider avant/après — `getBoundingClientRect()` sur chaque `mousemove`/`touchmove` remplacé par `scheduleSetPos()` qui throttle via `requestAnimationFrame` (flag `abRaf` + position en attente `abPendingX`).
- [x] 10D — PERF-216 : listeners `scroll` non throttlés — `sticky-cta` et `lead-magnet` utilisent désormais le pattern `{ passive: true }` + flag `*Ticking` + `requestAnimationFrame`, identique au parallax du fond de page.
- [x] 10E — PERF-231 : loader — délai fixe `setTimeout(600)` remplacé par une attente de `window.addEventListener('load')` (ou exécution immédiate si `document.readyState === 'complete'`), avec un minimum d'affichage de 200ms (`MIN_DISPLAY`) pour éviter un flash sur connexion rapide.
- [x] 10F — PERF-224 : versioning cache-busting `?v=20260614` ajouté sur `css/tailwind.min.css`, les icônes PWA et les fonts auto-hébergées (voir 10H), `service-worker.js` → `immoviz-v4`. Plafond honnête : GitHub Pages ne permet pas de définir des en-têtes `Cache-Control`/`immutable` côté serveur — le versioning par query string est le seul levier disponible côté repo (4/5, pas 5/5).
- [x] 10G — PERF-221 : widget Trustpilot — **décision : suppression complète** (pas de compte Trustpilot réel à ce jour). Aucune référence `trustpilot.com` ni dans le HTML ni dans la CSP. Section témoignages conservée avec les 3 avis internes (`.tgrid-t`/`.tcard-t`) déjà présents depuis la Vague 4C.
- [x] 10H — PERF-225 : Google Fonts auto-hébergées — suppression de `fonts.googleapis.com`/`fonts.gstatic.com` (CSP `font-src 'self'`, `style-src 'self' 'unsafe-inline'`, plus de `<link rel="preconnect">` vers Google) :
  - 2 fichiers `.woff2` (sous-ensemble latin) ajoutés dans `fonts/` : `inter-tight-latin-700-900.woff2` (44 Ko, weights 700/800/900) et `playfair-display-italic-400-latin.woff2` (22 Ko, italic 400) — 68 Ko au total, soit moins que les ~80-100 Ko habituellement transférés depuis Google Fonts (2 familles × plusieurs formats/variantes).
  - `@font-face` avec `font-display:swap` + `unicode-range` (latin) déclarés dans le `<style>` global ; `<link rel="preload" as="font" type="font/woff2" crossorigin>` ajouté pour `inter-tight` (police du `<h1>`, critique pour le LCP).
  - `service-worker.js` (`immoviz-v4`) précache désormais les 2 fichiers de fonts.
- [x] 10I — PERF-238 : Lighthouse installé (`devDependencies` v13.4.0) et exécuté en local (`python -m http.server 8080`, Chrome headless, throttling mobile par défaut) :
  - `plan-interactif-niort.html` : **100/100** — LCP 1.4s, FCP 1.4s, TBT 10ms, CLS 0, TTI 1.4s, Speed Index 2.3s. Confirme l'efficacité du lazy-load Three.js (Vague 9E).
  - `index.html` (run #1) : **41/100** — LCP 5.6s, CLS 0, **TBT 3270ms**, TTI 7.4s, Speed Index 5.7s, FCP 2.9s. Analyse de `bootup-time`/`script-treemap` : la cause n'est **pas** un artefact de poste de travail partagé mais bien `index.html` lui-même — l'iframe `#demo-frame` (`src="plan-interactif-romorantin.html"`, section "VIEWER 3D INTERACTIF") charge systématiquement la page Three.js la plus lourde du site dès le chargement initial, malgré l'attribut `loading="lazy"` (peu efficace sur un iframe situé au-dessus de la ligne de flottaison). Bootup-time de cette page seule : 8804ms (4x CPU throttling).
  - **Fix concret appliqué** : remplacement de l'iframe auto-chargée par un pattern **click-to-load** — `#demo-frame` n'a plus de `src` initial ; un overlay `#demo-overlay` ("▶ Démo 3D interactive — Cliquez pour charger le plan en direct") couvre l'emplacement, accessible clavier (`role="button"`, `tabindex="0"`, Enter/Espace). Au clic, `frame.src = 'plan-interactif-romorantin.html'` et l'overlay disparaît (`opacity` + `pointer-events:none`). Au `load` de l'iframe, bascule automatique sur l'onglet 3D (`switchTab('3d')`) + affichage temporaire du `#scene-hint`.
  - `index.html` (run #2, après fix) : **71/100** — LCP **2.9s** (-2.7s), CLS 0, **TBT 780ms** (-2490ms, ÷4.2), TTI **2.9s** (-4.5s), Speed Index 5.2s, FCP 1.9s. Reste à 0.38/1 sur le TBT : le `mainthread-work-breakdown` du run #2 montre que le coût restant (~2.8s de "Style & Layout" sous throttling 4x CPU sur 918 nœuds DOM) est désormais un coût de **rendu initial intrinsèque** à la page (Tailwind + animations CSS), pas un script bloquant identifiable — non traité ici (cf. liste finale, amélioration future possible mais non triviale).
  - `service-worker.js` — `urlsToCache` (précache à l'`install`) limité à l'app shell (page d'accueil + assets critiques). Les pages secondaires lourdes (`privacy.html`, `conditions.html`, `livraison.html`, les 3 `plan-interactif-*.html` avec Three.js) ne sont plus précachées au premier chargement : elles restent mises en cache à la volée (stale-while-revalidate) lors de leur première visite réelle. Bonne pratique PWA standard ("precache app shell only, runtime-cache the rest").
  - Rapports JSON conservés : `test-evidence/lighthouse/index-report.json` (run #1), `test-evidence/lighthouse/index-report-v2.json` (run #2), `test-evidence/lighthouse/niort-report.json`.
- [x] 10J — PERF-207/208/226/243 : `index.html` = 144 025 octets (~140,6 Ko), 2294 lignes (taille quasi stable malgré le templating du 10A : le CSS `@font-face` auto-hébergé (10H) + l'overlay `#demo-overlay` (10L) + les templates JS des 4 widgets (10A) compensent le retrait du markup statique). Le gain réel n'est pas la taille du fichier mais le **DOM initial** (964 → **918** nœuds, -5%, sous l'effet combiné 10A + 10L) et le nombre de `<script>` (12, recompté et confirmé stable).
- [x] 10K — Re-vérification Playwright (serveur local `python -m http.server 8080` depuis `C:\Dev\immobilier-3d\`), 0 erreur console sur toutes les pages :
  - `index.html` : `test-index-features.js` (cookies, ROI), `test-exit-popup.js` (popup absente du DOM au chargement, apparaît au mouvement vers le haut), `test-chatbot.js` (lazy-build au 1er clic, flux 4 questions, toggle), `quiz-test.js` (lazy-build, 5 questions, résultat personnalisé)
  - `plan-interactif-tours.html`, `plan-interactif-romorantin.html`, `plan-interactif-niort.html` : `test-tabs.js` — onglets 2D/3D/360° OK, Three.js lazy-load OK
- [x] 10L — PERF-238/243 (fix majeur découvert pendant l'audit, hors liste initiale) : viewer 3D de démo (`#demo-frame`) converti en **click-to-load** avec overlay `#demo-overlay` (CSS `.demo-overlay`/`.demo-overlay-icon`, gradient cyan/marine, icône ▶). `#scene-hint` masqué par défaut (`hidden`) jusqu'au premier `load` de l'iframe. **Changement de comportement utilisateur à noter** : la démo 3D interactive ne se charge plus automatiquement à l'arrivée sur la page — elle nécessite un clic/Entrée sur l'overlay. C'est ce fix qui explique l'essentiel du gain de 10I (41 → 71/100, TBT ÷4.2).

## Vague 11 — Audit qualité de code / refactoring (Phase 2) — 2026-06-15
> Suite de la Phase 1 (corrections ciblées CODE-6xx). Phase 2 = refactoring à risque plus élevé, validé point par point avec tests Playwright après chaque étape. Aucun changement visuel pour le visiteur (vérifié captures + computed styles).
- [x] 11-A — CODE-632/634 : ajout de `.editorconfig` (LF, UTF-8, indent 2 espaces ; `trim_trailing_whitespace=false` pour `*.md`), `.prettierrc` (singleQuote, semi, printWidth 100) et `README.md` (présentation, build, conventions, sécurité). Aucun impact sur le site.
- [x] 11-B — CODE-604/614 : extraction du monolithe `index.html` (2320 lignes) → `css/main.css` (4 blocs `<style>` concaténés) + `js/main.js` (12 blocs `<script>` concaténés, chargé en `<script defer>` dans le `<head>`). `index.html` ramené à ~1170 lignes. `'unsafe-inline'` **conservé** dans la CSP (le retrait complet — réécriture de tous les `onclick=` — est un chantier séparé non fait ici). Conséquences traitées : `tailwind.config.js` scanne désormais `./js/main.js` (sinon purge des classes des modals quiz/chatbot construits en templates JS) ; `service-worker.js` précache `css/main.css` + `js/main.js`, cache bumpé `immoviz-v4` → `immoviz-v5` ; `css/tailwind.min.css` rebuildé (purge de 3 classes mortes : `animate-pulse`, `ease-out`, `sepia`, -367 o). Validé : 0 violation CSP, rendu pixel-identique, toutes fonctions OK.
- [x] 11-C — CODE-620 : design system couleurs. `:root` de `css/main.css` enrichi et documenté comme **source unique de vérité** (`--cyan`, `--bg-dark`, `--bg-dark-2`, `--whatsapp`, `--text-main`). Valeurs en dur identiques remplacées par `var(--…)` dans `css/main.css` + styles inline `index.html`/`js/main.js`. Couleurs de marque exposées en classes Tailwind via `tailwind.config.js` (`colors.brand.{cyan,dark,dark2,whatsapp}` pointant vers les variables CSS) ; 8 classes arbitraires `bg-[#0d0d0d]`/`from-[#1a1a1a]`… converties en `bg-brand-dark`/`from-brand-dark2`. Règle appliquée : **fusion uniquement de valeurs strictement identiques** → zéro changement de teinte (les `stroke="#00e5ff"` des SVG ne sont pas touchés, `var()` non supporté dans les attributs de présentation SVG). Validé : variables résolues correctes, 0 erreur.
- [x] 11-D — CODE-618 : réduction des `!important` (78 → 47, soit **31 retirés**). Méthode : retrait uniquement des `!important` **prouvés redondants** (par spécificité), conservation de ceux **structurellement nécessaires**.
  - `plan-interactif-romorantin.html` : 55 → 34. Retirés : surcharges mode sombre `[data-theme=dark] #X` / `:root:not([data-theme=light]) #X` (spécificité 0,1,1,0 > base 0,1,0,0), vues `#view-Xd.active` (id+classe > `.view.active`), `#tabs`/`#view-* min-height` mobiles. **Conservés (nécessaires)** : `canvas{width/height:100%!important}` (écrase le style inline de Three.js), `#room-info-panel` + `#qr-modal>div` en dark (écrasent `style="background:white"` inline — régression détectée au test et corrigée en les restaurant), `.main-container{height:auto!important}` + `#room-info-panel{width:100%!important}` mobiles (écrasent styles inline), slider `::-webkit-slider-thumb` (pseudo-éléments natifs). **Bug corrigé** : `prefers-reduced-motion` avait `animation-duration:NaNs` (invalide) → `.01ms` (accessibilité réelle).
  - `plan-interactif-niort.html` : 10 → 4 (vues `.active` retirées ; canvas conservés).
  - `plan-interactif-tours.html` : 4 → 4 (uniquement canvas, tous nécessaires).
  - `css/main.css` : 9 → 5. Retirés : `#quizButton` padding, `#chatToggle`/`#chatbot` bottom/z-index (id bat les classes Tailwind `bottom-4`/`px-6`, pas de style inline). Conservés : curseur custom `.hov{transform:scale(2)!important}` (écrase le transform inline JS), `prefers-reduced-motion` (accessibilité).
  - Validé : mode clair/sombre, vues 2D/3D/360°, layout mobile 390px, positionnement chatbot/quiz — tous corrects, 0 erreur console.
