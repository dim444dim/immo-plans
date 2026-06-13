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
