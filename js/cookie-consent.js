/* Bandeau cookies — partagé par privacy.html et livraison.html.
   Pattern repris de main.js (wireStaticHandlers) : aucun onclick inline,
   pour permettre une CSP sans 'unsafe-inline' dans script-src. */
(function(){
  function loadTrackers() {
    if (document.querySelector('script[data-tracker="plausible"]')) return;
    const plausible = document.createElement('script');
    plausible.defer = true;
    plausible.src = 'https://plausible.io/js/script.js';
    plausible.dataset.domain = 'dim444dim.github.io/immo-plans';
    plausible.dataset.tracker = 'plausible';
    document.head.appendChild(plausible);
  }

  function disableTrackers() {
    window.plausible = () => {};
    document.querySelectorAll('script[data-tracker]').forEach(el => el.remove());
  }

  function acceptCookies() {
    localStorage.setItem('immoviz_cookieConsent', 'accepted');
    loadTrackers();
    document.getElementById('cookieBanner').style.display = 'none';
  }

  function rejectCookies() {
    localStorage.setItem('immoviz_cookieConsent', 'rejected');
    disableTrackers();
    document.getElementById('cookieBanner').style.display = 'none';
  }

  window.addEventListener('load', () => {
    const consent = localStorage.getItem('immoviz_cookieConsent');

    if (consent === 'accepted') {
      loadTrackers();
      document.getElementById('cookieBanner').style.display = 'none';
    } else if (consent === 'rejected') {
      disableTrackers();
      document.getElementById('cookieBanner').style.display = 'none';
    } else {
      disableTrackers();
      document.getElementById('cookieBanner').style.display = 'flex';
    }
  });

  const cookieReject = document.getElementById('cookie-reject');
  if (cookieReject) cookieReject.addEventListener('click', rejectCookies);
  const cookieAccept = document.getElementById('cookie-accept');
  if (cookieAccept) cookieAccept.addEventListener('click', acceptCookies);
})();
