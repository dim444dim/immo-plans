// Construit css/tailwind.min.css avec le plugin PostCSS de Tailwind 4.
// Remplace l'outil `@tailwindcss/cli`, dont le module de surveillance de fichiers
// (@parcel/watcher) tire `micromatch` puis `braces`, signalés par npm audit sans correctif.
import { readFileSync, writeFileSync } from 'node:fs';
import tailwind from '@tailwindcss/postcss';
import postcss from 'postcss';

const entree = 'src/tailwind-input.css';
const sortie = 'css/tailwind.min.css';

const { css } = await postcss([tailwind({ optimize: { minify: true } })]).process(
  readFileSync(entree, 'utf8'),
  { from: entree, to: sortie },
);
writeFileSync(sortie, css);
console.log(`${sortie} : ${css.length} octets`);
