/* Logique propre à livraison.html : personnalisation via paramètres URL
   (?nom=...&plan=...&bien=...) + copie du lien du plan. Externalisé du
   <script> inline pour respecter la CSP (script-src 'self'). */
(function(){
  const params = new URLSearchParams(window.location.search);
  const nom  = params.get('nom')  || '';
  const plan = params.get('plan') || '';
  const bien = params.get('bien') || '';

  if (nom) {
    const heroSub = document.getElementById('hero-sub');
    heroSub.textContent = '';
    heroSub.append('Bonjour ');
    const strongNom = document.createElement('strong');
    strongNom.textContent = nom;
    heroSub.append(strongNom);
    heroSub.append(' ! Votre plan interactif est prêt. Voici tout ce dont vous avez besoin pour le publier sur LeBonCoin.');
  }

  if (bien) {
    document.getElementById('bien-name').textContent = bien;
    document.getElementById('bien-card').style.display = 'flex';
  }

  const baseUrl = window.location.origin + window.location.pathname.replace('livraison.html', '');
  const planUrl = plan
    ? baseUrl + plan
    : 'https://dim444dim.github.io/immo-plans/';

  document.getElementById('plan-link').href = planUrl;
  document.getElementById('plan-url').textContent = planUrl;
  document.getElementById('phrase-copy').textContent = '🏡 Plan interactif 3D disponible : ' + planUrl;
})();

function copyUrl() {
  const url = document.getElementById('plan-url').textContent;
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.textContent = '✓ Copié';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copier'; btn.classList.remove('copied'); }, 2000);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    document.getElementById('copy-btn').textContent = '✓ Copié';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const copyBtn = document.getElementById('copy-btn');
  if (copyBtn) copyBtn.addEventListener('click', copyUrl);
});
