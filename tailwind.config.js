/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './conditions.html', './js/main.js'],
  theme: {
    extend: {
      // Couleurs de marque — pointent vers les variables CSS définies dans css/main.css (:root).
      // La source unique de vérité reste le :root ; ici on expose juste les classes Tailwind brand-*.
      colors: {
        brand: {
          cyan: 'var(--cyan)',
          dark: 'var(--bg-dark)',
          dark2: 'var(--bg-dark-2)',
          whatsapp: 'var(--whatsapp)',
        },
      },
    },
  },
  plugins: [],
};
