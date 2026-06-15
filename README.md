# ImmoViz 3D — `immo-plans`

Site vitrine statique pour **ImmoViz 3D** : plans interactifs **2D + Vue 3D + Visite 360°**
pour valoriser les annonces immobilières (LeBonCoin, etc.).

🔗 **En ligne :** https://dim444dim.github.io/immo-plans/ (GitHub Pages, public)

---

## 🧩 Contenu

| Fichier | Rôle |
|---------|------|
| `index.html` | Landing page (offre, tarifs, démos, formulaires, newsletter) |
| `plan-interactif-romorantin.html` | Démo plan interactif — maison 170 m² (Romorantin) |
| `plan-interactif-niort.html` | Démo plan interactif — maison 177 m² (Niort) |
| `plan-interactif-tours.html` | Démo plan interactif — maison 235 m² (Tours) |
| `privacy.html` / `conditions.html` / `livraison.html` | Pages légales (RGPD, CGV, livraison) |
| `manifest.json` + `service-worker.js` | PWA (installable, fonctionne hors-ligne) |
| `css/`, `fonts/`, `icons/`, `panoramas/` | Assets (Tailwind compilé, polices auto-hébergées, icônes, panoramas 360°) |

> Le site est **statique** : aucun serveur ni base de données. Les vues 3D utilisent
> Three.js / Babylon.js embarqués dans les pages de démo.

---

## 🛠️ Développement

Prérequis : **Node.js** (pour le build CSS Tailwind uniquement).

```bash
npm install          # installe les outils de build (Tailwind, terser, clean-css…)
npm run build:css    # recompile css/tailwind.min.css depuis src/tailwind-input.css
```

Pour prévisualiser en local, servir le dossier avec n'importe quel serveur statique
(ex. `npx serve .`) puis ouvrir `index.html`.

### Conventions de code
- Indentation **2 espaces**, fins de ligne **LF**, encodage **UTF-8** (voir `.editorconfig`)
- Formatage JS/CSS : guillemets simples, point-virgules (voir `.prettierrc`)

---

## 🔒 Sécurité & confidentialité

- **CSP** (Content-Security-Policy) restrictive en meta tag dans chaque page.
- **RGPD** : les trackers (Plausible Analytics) ne se chargent qu'**après consentement**
  via le bandeau cookies (clé `immoviz_cookieConsent` en `localStorage`).
- Aucune clé API ni donnée client dans le code.

Détails complets dans `../AUDIT_SECURITE_CSP.md` (dossier parent du projet).

---

## 🚀 Déploiement

Le site est publié via **GitHub Pages** (branche par défaut). Un `git push` met le site
à jour automatiquement après quelques minutes.

---

## 📒 Historique

Le détail des évolutions (vagues de développement) est consigné dans `WORKFLOW.md`.
