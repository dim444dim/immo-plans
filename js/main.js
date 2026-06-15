/* ---- bloc JS #1 ---- */

  // ── LOADER ──
  (function(){
    const loaderStart = performance.now();
    const MIN_DISPLAY = 200; // évite un flash si le chargement est instantané
    function hideLoader() {
      const wait = Math.max(0, MIN_DISPLAY - (performance.now() - loaderStart));
      setTimeout(() => document.getElementById('loader').classList.add('done'), wait);
    }
    if (document.readyState === 'complete') hideLoader();
    else window.addEventListener('load', hideLoader);
  })();

  // ── PARALLAX SOURIS (hero uniquement) ──
  (function(){
    const heroEl = document.querySelector('.hero');
    const heroInner = document.querySelector('.hero-inner');
    let mx = 0, my = 0, cx = 0, cy = 0, raf = null;

    document.addEventListener('mousemove', e => {
      // -1 à +1 centré sur le milieu de l'écran
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(update);
    });

    function update() {
      raf = null;
      // Lerp doux vers la cible
      cx += (mx - cx) * 0.06;
      cy += (my - cy) * 0.06;

      // Fond : bouge dans le sens du curseur (amplitude 18px)
      const scrollP = Math.min(window.scrollY / (document.body.scrollHeight - window.innerHeight || 1), 1);
      const scl = 1 + scrollP * 0.18;
      bg.style.transform = `scale(${scl}) translate(${cx * 18}px, ${cy * 12}px)`;

      // Texte hero : bouge légèrement à l'opposé (effet de profondeur)
      if (heroInner) {
        heroInner.style.transform = `translate(${-cx * 8}px, ${-cy * 5}px)`;
      }

      if (Math.abs(mx - cx) > 0.001 || Math.abs(my - cy) > 0.001) {
        raf = requestAnimationFrame(update);
      }
    }
  })();

  // ── VIEWER 3D — chargement de l'iframe au clic + switch to tab 3D ──
  (function(){
    const frame = document.getElementById('demo-frame');
    const hint  = document.getElementById('scene-hint');
    const overlay = document.getElementById('demo-overlay');
    if (!frame || !overlay) return;

    frame.addEventListener('load', () => {
      try {
        // Passe directement en Vue 3D
        frame.contentWindow.switchTab('3d');
        // Affiche le hint puis le cache après 3s
        hint && hint.classList.remove('hidden');
        setTimeout(() => hint && hint.classList.add('hidden'), 3000);
      } catch(e) {}
    });

    // Cache le hint au premier survol dans l'iframe
    frame.addEventListener('mouseenter', () => {
      setTimeout(() => hint && hint.classList.add('hidden'), 1500);
    });

    function loadDemo() {
      overlay.classList.add('hidden');
      frame.src = 'plan-interactif-romorantin.html';
    }
    overlay.addEventListener('click', loadDemo);
    overlay.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadDemo(); }
    });
  })();

  // Parallax zoom au scroll (géré dans le mousemove aussi — ici juste la mise à jour au scroll sans souris)
  const bg = document.getElementById('page-bg');
  let tk = false;
  window.addEventListener('scroll', () => {
    if (!tk) {
      requestAnimationFrame(() => {
        const p = Math.min(window.scrollY / (document.body.scrollHeight - window.innerHeight || 1), 1);
        const scl = 1 + p * 0.18;
        // On garde la translation souris actuelle en lisant le transform existant
        const cur = bg.style.transform;
        const t = cur.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
        const tx = t ? t[1] : '0', ty = t ? t[2] : '0';
        bg.style.transform = `scale(${scl}) translate(${tx}px, ${ty}px)`;
        tk = false;
      });
      tk = true;
    }
  });

  // Scroll reveal
  const obs = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('v'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  // Barres animées
  const barsEl = document.getElementById('bars');
  if (barsEl) {
    new IntersectionObserver(es => {
      if (es[0].isIntersecting) {
        barsEl.querySelectorAll('.bfill').forEach(b => { b.style.width = b.dataset.w + '%'; });
      }
    }, { threshold: 0.3 }).observe(barsEl);
  }

  // FAQ
  document.querySelectorAll('.faqq').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const was = item.classList.contains('open');
      document.querySelectorAll('.faqitem').forEach(i => {
        i.classList.remove('open');
        const q = i.querySelector('.faqq');
        const a = i.querySelector('.faqa');
        if (q) q.setAttribute('aria-expanded', 'false');
        if (a) a.setAttribute('aria-hidden', 'true');
      });
      if (!was) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        const ans = item.querySelector('.faqa');
        if (ans) ans.setAttribute('aria-hidden', 'false');
        if (window.plausible) plausible('FAQ ouverte', {props: {question: btn.textContent.replace(/[+\-]$/, '').trim()}});
      }
    });
  });

  // ── ANIMATION MOT PAR MOT — H1 HERO ──
  document.addEventListener('DOMContentLoaded', function(){(function(){
    const h1 = document.querySelector('.hero-inner h1');
    if (!h1) return;
    const wordSpans = [];
    const initialDelay = 0.3, wordGap = 0.085;
    const children = Array.from(h1.childNodes);
    h1.innerHTML = '';

    children.forEach(node => {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(part => {
          if (/\S/.test(part)) {
            const sp = document.createElement('span');
            sp.className = 'word'; sp.textContent = part;
            h1.appendChild(sp); wordSpans.push(sp);
          } else if (part) {
            h1.appendChild(document.createTextNode(part));
          }
        });
      } else if (node.nodeType === 1) {
        if (node.tagName === 'BR') {
          h1.appendChild(document.createElement('br'));
        } else {
          const el = document.createElement(node.tagName);
          Array.from(node.attributes).forEach(a => el.setAttribute(a.name, a.value));
          Array.from(node.childNodes).forEach(child => {
            if (child.nodeType === 3) {
              child.textContent.split(/(\s+)/).forEach(part => {
                if (/\S/.test(part)) {
                  const sp = document.createElement('span');
                  sp.className = 'word'; sp.textContent = part;
                  el.appendChild(sp); wordSpans.push(sp);
                } else if (part) {
                  el.appendChild(document.createTextNode(part));
                }
              });
            } else {
              el.appendChild(child.cloneNode(true));
            }
          });
          h1.appendChild(el);
        }
      }
    });

    wordSpans.forEach((sp, i) => {
      sp.style.animationDelay = (initialDelay + i * wordGap) + 's';
    });
  })()});

  // ── COMPTEURS ANIMÉS ──
  function animCount(el) {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const dur = 1800;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(ease * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  const countObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && e.target.dataset.count) {
        animCount(e.target);
        countObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => countObs.observe(el));

  // ── CURSEUR CUSTOM ──
  (function(){
    const isMobile = window.matchMedia('(hover:none)').matches || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) return;

    const dot = document.querySelector('.custom-cursor-dot');
    const clickables = 'a, button, [role="button"], .btn-p, .btn-g, .glass';

    let x = 0, y = 0, dotX = 0, dotY = 0;
    const dotLerp = 0.25;

    document.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; });

    function animate() {
      dotX += (x - dotX) * dotLerp;
      dotY += (y - dotY) * dotLerp;
      dot.style.transform = `translate(calc(-50% + ${Math.round(dotX)}px), calc(-50% + ${Math.round(dotY)}px))`;
      requestAnimationFrame(animate);
    }
    animate();

    document.addEventListener('mouseover', e => { if (e.target.closest(clickables)) dot.classList.add('hov'); });
    document.addEventListener('mouseout',  e => { if (e.target.closest(clickables)) dot.classList.remove('hov'); });
  })();

  // ── AVANT / APRÈS SLIDER ──
  (function(){
    const wrap  = document.querySelector('.ab-wrap');
    const div   = document.getElementById('ab-div');
    const after = document.querySelector('.ab-after');
    if (!wrap || !div || !after) return;

    function setPos(clientX) {
      const rect = wrap.getBoundingClientRect();
      let pct = (clientX - rect.left) / rect.width * 100;
      pct = Math.max(5, Math.min(95, pct));
      div.style.left = pct + '%';
      after.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
      div.setAttribute('aria-valuenow', Math.round(pct));
    }

    let dragging = false;
    let abRaf = null, abPendingX = null;
    function scheduleSetPos(clientX) {
      abPendingX = clientX;
      if (!abRaf) abRaf = requestAnimationFrame(() => { abRaf = null; setPos(abPendingX); });
    }

    div.addEventListener('mousedown',  e => { dragging = true; e.preventDefault(); });
    window.addEventListener('mouseup', () => dragging = false);
    window.addEventListener('mousemove', e => { if (dragging) scheduleSetPos(e.clientX); });

    div.addEventListener('touchstart', () => { dragging = true; }, { passive: true });
    window.addEventListener('touchend', () => dragging = false);
    window.addEventListener('touchmove', e => {
      if (dragging) scheduleSetPos(e.touches[0].clientX);
    }, { passive: true });

    div.addEventListener('keydown', e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const rect = wrap.getBoundingClientRect();
      const cur = parseFloat(div.style.left) || 50;
      const step = e.shiftKey ? 10 : 5;
      setPos(rect.left + (Math.max(5, Math.min(95, cur + (e.key === 'ArrowLeft' ? -step : step))) / 100) * rect.width);
      e.preventDefault();
    });
  })();

  // ── FORMULAIRE MODAL ──
  (function(){
    const overlay = document.getElementById('form-overlay');
    const box     = document.getElementById('form-box');
    const form    = document.getElementById('devis-form');
    const fclose  = document.getElementById('fclose');
    const fback   = document.getElementById('fback');
    if (!overlay) return;

    window.openForm = function() {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => document.getElementById('f-prenom') && document.getElementById('f-prenom').focus(), 100);
      if (window.plausible) plausible('Devis ouvert');
    };

    function closeForm() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    fclose.addEventListener('click', closeForm);
    if (fback) fback.addEventListener('click', e => { e.preventDefault(); closeForm(); });
    overlay.addEventListener('click', e => { if (e.target === overlay) closeForm(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeForm(); });

    // Radios custom
    overlay.querySelectorAll('.fradio').forEach(label => {
      label.addEventListener('click', () => {
        overlay.querySelectorAll('.fradio').forEach(l => l.classList.remove('checked'));
        label.classList.add('checked');
      });
    });

    // Soumission
    form.addEventListener('submit', e => {
      e.preventDefault();
      const prenom  = document.getElementById('f-prenom').value.trim();
      const email   = document.getElementById('f-email').value.trim();
      const url     = document.getElementById('f-url').value.trim();
      const message = document.getElementById('f-msg').value.trim();
      const budget  = form.querySelector('.fradio.checked input')?.value || 'Non précisé';

      let valid = true;
      const formError = document.getElementById('form-error');
      [document.getElementById('f-prenom'), document.getElementById('f-email')].forEach(el => el.classList.remove('err'));
      formError.textContent = '';

      if (!prenom) { document.getElementById('f-prenom').classList.add('err'); valid = false; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { document.getElementById('f-email').classList.add('err'); valid = false; }
      if (!valid) {
        formError.textContent = 'Merci de renseigner votre prénom et une adresse email valide.';
        return;
      }

      const subject = encodeURIComponent('Devis ImmoViz 3D — ' + prenom);
      const body = encodeURIComponent(
        'Bonjour,\n\nJe souhaite un devis ImmoViz 3D.\n\n' +
        'Prénom : ' + prenom + '\nEmail : ' + email +
        '\nOffre : ' + budget +
        (url ? '\nURL annonce : ' + url : '') +
        (message ? '\n\nMessage :\n' + message : '') +
        '\n\n---\nEnvoyé depuis immoviz3d.fr'
      );
      window.open('mailto:dimitri444art@gmail.com?subject=' + subject + '&body=' + body, '_blank');
      box.classList.add('sent');
      if (window.plausible) plausible('Devis envoyé', {props: {budget: budget}});
    });

    // Intercepter tous les CTAs "devis"
    document.querySelectorAll('a[href*="Devis"], a[href*="devis"]').forEach(a => {
      if (!a.closest('#form-overlay') && !a.closest('.mobile-menu')) {
        a.addEventListener('click', e => { e.preventDefault(); openForm(); });
      }
    });
  })();

  // ── STICKY CTA ──
  (function(){
    const bar = document.getElementById('sticky-cta');
    const btn = document.getElementById('sticky-btn');
    if (!bar) return;
    if (btn) btn.addEventListener('click', () => window.openForm && openForm());

    let visible = false;
    function update() {
      const scrollY = window.scrollY;
      const docH    = document.body.scrollHeight;
      const winH    = window.innerHeight;
      const nearBottom = scrollY + winH > docH - 120;
      const shouldShow = scrollY > 520 && !nearBottom;
      if (shouldShow !== visible) {
        visible = shouldShow;
        bar.classList.toggle('visible', visible);
      }
    }
    let stickyTicking = false;
    window.addEventListener('scroll', () => {
      if (!stickyTicking) {
        stickyTicking = true;
        requestAnimationFrame(() => { update(); stickyTicking = false; });
      }
    }, { passive: true });
  })();

  // ── BURGER MENU MOBILE ──
  (function(){
    const btn   = document.getElementById('burger-btn');
    const menu  = document.getElementById('mobile-menu');
    const close = document.getElementById('mmclose');
    if (!btn || !menu) return;

    function openMenu() {
      menu.classList.add('open');
      btn.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (close) close.focus();
    }
    function closeMenu() {
      menu.classList.remove('open');
      btn.classList.remove('open');
      document.body.style.overflow = '';
      btn.focus();
    }

    btn.addEventListener('click', () => menu.classList.contains('open') ? closeMenu() : openMenu());
    if (close) close.addEventListener('click', closeMenu);
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    // Piège à focus + Escape pendant que le menu est ouvert
    menu.addEventListener('keydown', e => {
      if (!menu.classList.contains('open')) return;
      if (e.key === 'Escape') { closeMenu(); return; }
      if (e.key !== 'Tab') return;
      const focusables = menu.querySelectorAll('a, button');
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  })();

  // ── ANALYTICS DÉMOS ──
  document.querySelectorAll('.btn-demo').forEach(a => {
    a.addEventListener('click', () => {
      if (window.plausible) plausible('Demo cliquée');
    });
  });

  // ── CONSTANTES PARTAGÉES ──
  const WHATSAPP_PHONE = '33767519437';
  const PLAUSIBLE_DOMAIN = 'dim444dim.github.io/immo-plans';
  const COUNTER_TARGETS = { agentCount: 234, planCount: 1203, visitCount: 45234 };
  const LIVE_STATS_TARGETS = { dashStat1: 12, dashStat2: 18, dashStat3: 540, dashStat4: 3.2 };

  // ── GESTION CENTRALISÉE DES POPUPS (évite l'empilement exit-popup / lead-magnet) ──
  const PopupManager = {
    actif: null,
    estDisponible(id) { return this.actif === null || this.actif === id; },
    ouvrir(id) { this.actif = id; },
    fermer(id) { if (this.actif === id) this.actif = null; }
  };

  // ── WHATSAPP BUTTON ──
  function initWhatsAppButton(){
    const btn = document.getElementById('whatsapp-btn');
    if(!btn) return;
    btn.onclick=()=>{
      const message='Bonjour, je suis intéressé par votre service ImmoViz 3D. Pouvez-vous me donner plus d\'informations ?';
      const encodedMsg=encodeURIComponent(message);
      const url=`https://wa.me/${WHATSAPP_PHONE}?text=${encodedMsg}`;
      window.open(url,'_blank','noopener,noreferrer');
      if(window.plausible) plausible('WhatsApp cliqué');
    };
  }
  document.addEventListener('DOMContentLoaded', initWhatsAppButton);
  if(document.readyState!=='loading') initWhatsAppButton();



/* ---- bloc JS #2 ---- */

  (function(){
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;
    if (localStorage.getItem('immoviz_exitPopupShown')) return;

    const EXIT_POPUP_HTML = `
      <div class="exit-modal" role="dialog" aria-modal="true" aria-labelledby="exit-popup-title" tabindex="-1">
        <button id="exit-close-btn" class="exit-close" aria-label="Fermer">✕</button>
        <h2 id="exit-popup-title">Avant de partir — Aperçu gratuit 24h</h2>
        <p>Pas d'engagement. Aucun frais cachés.</p>
        <div class="exit-buttons">
          <button id="exit-btn-yes" class="exit-btn exit-btn-yes">Oui, je suis intéressé</button>
          <button id="exit-btn-no" class="exit-btn exit-btn-no">Non, fermer</button>
        </div>
      </div>
    `;

    function init() {
      let lastMouseY = null;
      let popupShown = false;
      let exitPreviousFocus = null;
      let popup = null;

      function buildPopup() {
        if (popup) return popup;
        popup = document.createElement('div');
        popup.id = 'exit-popup';
        popup.innerHTML = EXIT_POPUP_HTML;
        document.body.appendChild(popup);

        popup.querySelector('#exit-close-btn').addEventListener('click', closeExitPopup);
        popup.querySelector('#exit-btn-no').addEventListener('click', closeExitPopup);
        popup.querySelector('#exit-btn-yes').addEventListener('click', () => {
          const message = 'Bonjour, avant de partir j\'aimerais en savoir plus sur ImmoViz 3D';
          const encodedMsg = encodeURIComponent(message);
          const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMsg}`;
          window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
          if (window.plausible) plausible('Exit intent: WhatsApp cliqué');
          closeExitPopup();
        });
        popup.addEventListener('click', e => { if (e.target === popup) closeExitPopup(); });
        return popup;
      }

      function showExitPopup() {
        if (!PopupManager.estDisponible('exit')) return;
        popupShown = true;
        localStorage.setItem('immoviz_exitPopupShown', 'true');
        PopupManager.ouvrir('exit');
        exitPreviousFocus = document.activeElement;
        buildPopup();
        popup.classList.add('show');
        document.body.style.overflow = 'hidden';
        popup.querySelector('.exit-modal').focus();
        if (window.plausible) plausible('Exit intent pop-up affiché');
      }

      function closeExitPopup() {
        popup.classList.remove('show');
        document.body.style.overflow = '';
        PopupManager.fermer('exit');
        if (exitPreviousFocus && exitPreviousFocus.focus) exitPreviousFocus.focus();
      }

      const handleMouseMove = (e) => {
        if (popupShown) return;
        const currentY = e.clientY;
        if (lastMouseY === null) { lastMouseY = currentY; return; }
        const isMovingUp = currentY < lastMouseY;
        lastMouseY = currentY;
        if (currentY < 50 && isMovingUp) showExitPopup();
      };

      window.addEventListener('mousemove', handleMouseMove, true);

      document.addEventListener('mouseleave', e => {
        if (popupShown) return;
        if (e.clientY < 0) showExitPopup();
      }, true);

      document.addEventListener('keydown', e => {
        if (popup && e.key === 'Escape' && popup.classList.contains('show')) closeExitPopup();
      });
    }

    // Détection d'intention de sortie différée : ne coûte rien au chargement initial
    if ('requestIdleCallback' in window) requestIdleCallback(init, { timeout: 2000 });
    else setTimeout(init, 1500);
  })();


/* ---- bloc JS #3 ---- */

  function animateCounter(elementId, targetValue, duration = 2000) {
    const element = document.getElementById(elementId);
    if (!element) return; // Sécurité si l'élément n'existe pas
    const startTime = Date.now();

    function updateCounter() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = Math.floor(targetValue * progress);
      element.textContent = currentValue.toLocaleString('fr-FR');

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    }

    updateCounter();
  }

  window.addEventListener('load', () => {
    animateCounter('agentCount', COUNTER_TARGETS.agentCount, 2000);
    animateCounter('planCount', COUNTER_TARGETS.planCount, 2000);
    animateCounter('visitCount', COUNTER_TARGETS.visitCount, 2000);
  });


/* ---- bloc JS #4 ---- */

  const QUIZ_MODAL_HTML = `
    <div class="bg-gray-900 rounded-lg max-w-2xl w-full border border-gray-800 p-8" role="dialog" aria-modal="true" aria-labelledby="quiz-modal-title" tabindex="-1">
      <h2 class="text-3xl font-bold text-white mb-2" id="quiz-modal-title">Quel agent es-tu ?</h2>
      <p class="text-gray-400 mb-8">5 questions pour découvrir ta stratégie ImmoViz idéale.</p>

      <div id="quizContainer" aria-live="polite">
        <!-- Les questions s'affichent ici via JS -->
      </div>

      <div id="quizResult" class="hidden" aria-live="polite">
        <h3 class="text-2xl font-bold text-green-500 mb-4" id="resultTitle"></h3>
        <p class="text-gray-300 mb-6" id="resultText"></p>
        <div class="bg-gray-800 p-4 rounded mb-6 border-l-4 border-green-500">
          <p class="text-white font-semibold" id="resultOffer"></p>
        </div>
        <button onclick="closeQuiz()" class="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded">
          ✅ Je veux mon devis gratuit
        </button>
      </div>
    </div>
  `;

  let quizModalBuilt = false;
  function buildQuizModal() {
    if (quizModalBuilt) return;
    quizModalBuilt = true;
    const modal = document.createElement('div');
    modal.id = 'quizModal';
    modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center hidden p-4';
    modal.innerHTML = QUIZ_MODAL_HTML;
    document.body.appendChild(modal);
  }

  const quizQuestions = [
    {
      q: "Combien de biens vends-tu par mois ?",
      answers: ["1-3 (je suis solo)", "4-10 (petite agence)", "10+ (grosse agence)"]
    },
    {
      q: "Quel est ton plus grand problème ?",
      answers: ["Les biens ne se vendent pas assez vite", "Pas assez de visites en ligne", "Les acheteurs demandent des prix plus bas"]
    },
    {
      q: "Tes clients te demandent quoi ?",
      answers: ["Plus d'infos détaillées sur le bien", "Visites virtuelles 3D", "Pouvoir comparer avec d'autres biens"]
    },
    {
      q: "Tu veux investir combien maximum ?",
      answers: ["< 200€ (test rapide)", "200-500€ (petit portfolio)", "500€+ (sérieusement)"]
    },
    {
      q: "D'où vient la majorité de tes clients ?",
      answers: ["Annonces classiques (LeBonCoin, Seloger)", "Réseaux sociaux (Facebook, Instagram)", "Bouche à oreille et recommandations"]
    }
  ];

  let currentQuestion = 0;
  let quizScore = [0, 0, 0]; // 3 profils possibles

  function renderQuestion() {
    const container = document.getElementById('quizContainer');
    const q = quizQuestions[currentQuestion];

    container.innerHTML = `
      <p class="text-white font-semibold mb-4">${currentQuestion + 1}/5 - ${q.q}</p>
      <div class="grid gap-3">
        ${q.answers.map((ans, i) => `
          <button onclick="answerQuestion(${i})" class="bg-gray-800 hover:bg-gray-700 text-white text-left px-4 py-3 rounded border border-gray-700 hover:border-blue-500 transition">
            ${ans}
          </button>
        `).join('')}
      </div>
      <div class="mt-6 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div class="h-full bg-blue-600" style="width: ${(currentQuestion / quizQuestions.length) * 100}%"></div>
      </div>
    `;
  }

  function answerQuestion(index) {
    quizScore[index % 3]++;
    currentQuestion++;

    if (currentQuestion < quizQuestions.length) {
      setTimeout(() => renderQuestion(), 200);
    } else {
      setTimeout(() => showQuizResult(), 200);
    }
  }

  function showQuizResult() {
    const winnerIndex = quizScore.indexOf(Math.max(...quizScore));
    const results = [
      {
        title: "🎯 Tu es du type « Solo Efficient »",
        text: "Tu vends 1-3 biens/mois mais tu veux clairement augmenter ta productivité.",
        offer: "Agents comme toi gagnent en moyenne 2 500€ de PLUS par an avec ImmoViz 3D grâce aux +40% de clics. À 150€/plan, tu rentres dans tes frais en seulement 3 biens vendus. C'est RENTABLE immédiatement."
      },
      {
        title: "📈 Tu es du type « Agence en Climbing »",
        text: "Tu gères 4-10 biens/mois avec une vraie équipe derrière toi.",
        offer: "Package agence 5 plans = 600€ au lieu de 750€. Ça t'économise 150€ + retouches illimitées. Pour 10 biens = 1 000€ au lieu de 1 500€. Multiplication par 3-5 de ton trafic garanti."
      },
      {
        title: "🏆 Tu es du type « Boss Immobilier »",
        text: "10+ biens/mois, tu cherches l'excellence et l'efficacité maximale.",
        offer: "Forfait agence illimité = 2 500€/mois. Support prioritaire 24/7 + updates mensuelles + white-label possible (tu vends ImmoViz sous ta marque et tu gardes la marge). Tu deviens un expert incontournable dans ta région."
      }
    ];

    const result = results[winnerIndex];
    document.getElementById('quizContainer').classList.add('hidden');
    document.getElementById('quizResult').classList.remove('hidden');
    document.getElementById('resultTitle').textContent = result.title;
    document.getElementById('resultText').textContent = result.text;
    document.getElementById('resultOffer').textContent = result.offer;
  }

  function closeQuiz() {
    document.getElementById('quizModal').classList.add('hidden');
    document.getElementById('quizButton').focus();
    // Ouvre le formulaire de devis du site (mécanisme natif de la page)
    if (window.openForm) {
      openForm();
    } else {
      const contactForm = document.getElementById('devis-form');
      if (contactForm) contactForm.scrollIntoView({ behavior: 'smooth' });
    }
  }

  document.getElementById('quizButton').addEventListener('click', () => {
    buildQuizModal();
    currentQuestion = 0;
    quizScore = [0, 0, 0];
    document.getElementById('quizModal').classList.remove('hidden');
    document.getElementById('quizResult').classList.add('hidden');
    document.getElementById('quizContainer').classList.remove('hidden');
    renderQuestion();
    document.getElementById('quizModal').querySelector('[role="dialog"]').focus();
  });

  document.addEventListener('keydown', e => {
    const quizModal = document.getElementById('quizModal');
    if (e.key === 'Escape' && quizModal && !quizModal.classList.contains('hidden')) closeQuiz();
  });


/* ---- bloc JS #5 ---- */

  const CHATBOT_HTML = `
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-lg flex justify-between items-center">
      <h3 class="text-white font-bold"><span aria-hidden="true">🤖</span> Conseiller ImmoViz</h3>
      <button onclick="toggleChatbot()" class="text-white hover:text-gray-200 text-xl" aria-label="Fermer le chat">✕</button>
    </div>

    <div id="chatMessages" class="flex-1 overflow-y-auto p-4 space-y-3" role="log" aria-live="polite">
      <div class="bg-gray-800 p-3 rounded text-white text-sm">
        Salut! 👋 Je suis ton assistant ImmoViz. Comment tu t'appelles ?
      </div>
    </div>

    <div class="border-t border-gray-800 p-3 flex gap-2">
      <input id="chatInput" type="text" placeholder="Tape ta réponse..." class="flex-1 bg-gray-800 text-white rounded px-3 py-2 text-sm outline-none border border-gray-700 focus:border-blue-500">
      <button onclick="sendChatMessage()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold">→</button>
    </div>
  `;

  let chatbotBuilt = false;
  function buildChatbot() {
    if (chatbotBuilt) return;
    chatbotBuilt = true;
    const bot = document.createElement('div');
    bot.id = 'chatbot';
    bot.className = 'fixed bottom-4 right-4 z-30 w-96 bg-gray-900 rounded-lg shadow-2xl border border-gray-800 flex flex-col';
    bot.style.height = '500px';
    bot.style.display = 'none';
    bot.setAttribute('role', 'dialog');
    bot.setAttribute('aria-label', 'Assistant ImmoViz');
    bot.setAttribute('tabindex', '-1');
    bot.innerHTML = CHATBOT_HTML;
    document.body.appendChild(bot);
    document.getElementById('chatInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendChatMessage();
    });
  }

  const chatFlowQuestions = [
    { q: "Comment tu t'appelles ?", key: "name" },
    { q: "Combien de biens tu vends par mois ?", key: "biens" },
    { q: "Quel est ton plus grand défi ?", key: "challenge" },
    { q: "Tu as déjà testé une visite virtuelle 3D avant ?", key: "tried3d" }
  ];

  let chatStep = 0;
  let chatData = {};

  function displayMessage(text, isBot = true) {
    const messagesDiv = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = isBot
      ? 'bg-gray-800 p-3 rounded text-white text-sm max-w-xs'
      : 'bg-blue-600 p-3 rounded text-white text-sm ml-auto max-w-xs text-right';
    msgDiv.textContent = text;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    displayMessage(text, false);
    input.value = '';

    if (chatStep < chatFlowQuestions.length) {
      chatData[chatFlowQuestions[chatStep].key] = text;
      chatStep++;

      setTimeout(() => {
        if (chatStep < chatFlowQuestions.length) {
          displayMessage(chatFlowQuestions[chatStep].q);
        } else {
          showChatSummary();
        }
      }, 500);
    }
  }

  function showChatSummary() {
    const summary = `Super ${chatData.name}! 👏

Tu vends ${chatData.biens} biens/mois et ton défi c'est "${chatData.challenge}".

Les agents comme toi gagnent en moyenne 2 500€ de PLUS par an avec ImmoViz 3D grâce aux +40% de clics sur les annonces.

À seulement 150€ par plan, tu rentres dans tes frais rapidement. Vraiment rentable. 🚀`;

    displayMessage(summary);

    // Bouton final
    const btnDiv = document.createElement('div');
    btnDiv.className = 'mt-4';
    btnDiv.innerHTML = `<button onclick="goToContact()" class="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded font-bold text-sm">✅ Je veux un devis gratuit</button>`;
    document.getElementById('chatMessages').appendChild(btnDiv);
  }

  function goToContact() {
    // Ferme le chatbot et affiche le toggle
    document.getElementById('chatbot').style.display = 'none';
    const toggle = document.getElementById('chatToggle');
    if (toggle) toggle.style.display = 'flex';

    // Ouvre le vrai formulaire de devis du site (sinon scroll vers #contact en secours)
    if (window.openForm) {
      window.openForm();
    } else {
      const contactForm = document.getElementById('contact');
      if (contactForm) contactForm.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function toggleChatbot() {
    buildChatbot();
    const chatbot = document.getElementById('chatbot');
    const toggle = document.getElementById('chatToggle');
    if (chatbot.style.display === 'none' || chatbot.style.display === '') {
      chatbot.style.display = 'flex';
      toggle.style.display = 'none';
      document.getElementById('chatInput').focus();
    } else {
      chatbot.style.display = 'none';
      toggle.style.display = 'flex';
      toggle.focus();
    }
  }

  document.addEventListener('keydown', e => {
    const chatbot = document.getElementById('chatbot');
    if (e.key === 'Escape' && chatbot && chatbot.style.display === 'flex') toggleChatbot();
  });


/* ---- bloc JS #6 ---- */

  const biensSlider = document.getElementById('biensSlider');
  const prixSlider = document.getElementById('prixSlider');
  const commissionSlider = document.getElementById('commissionSlider');

  function updateROI() {
    const biens = parseInt(biensSlider.value);
    const prix = parseInt(prixSlider.value);
    const commission = parseFloat(commissionSlider.value) / 100;

    // Update des labels
    document.getElementById('biensValue').textContent = biens + ' bien' + (biens > 1 ? 's' : '');
    document.getElementById('prixValue').textContent = (prix / 1000).toFixed(0) + 'k€';
    document.getElementById('commissionValue').textContent = (commission * 100).toFixed(1) + '%';
    biensSlider.setAttribute('aria-valuetext', biens + ' bien' + (biens > 1 ? 's' : '') + ' par mois');
    prixSlider.setAttribute('aria-valuetext', (prix / 1000).toFixed(0) + ' 000 euros');
    commissionSlider.setAttribute('aria-valuetext', (commission * 100).toFixed(1) + ' pour cent');

    // Calcul ROI
    // ImmoViz génère +40% de visites qualifiées. On NE traduit PAS ça par +40% de ventes
    // (irréaliste) : hypothèse prudente de +15% de ventes effectivement conclues grâce à la
    // meilleure visibilité de l'annonce.
    const UPLIFT_VENTES = 0.15;
    const commissionParBien = prix * commission;
    const ventesAnnuelles = biens * 12;                        // biens mis en vente sur l'année
    const ventesSupp = ventesAnnuelles * UPLIFT_VENTES;        // ventes additionnelles estimées
    const gainSupplementaire = Math.round(ventesSupp * commissionParBien);
    const coutAnnuelImmo = ventesAnnuelles * 150;              // 1 plan ImmoViz (150€) par bien
    const gainNet = gainSupplementaire - coutAnnuelImmo;
    const roi = coutAnnuelImmo > 0 ? ((gainNet / coutAnnuelImmo) * 100).toFixed(0) : 0;

    document.getElementById('roiResult').textContent = gainSupplementaire.toLocaleString('fr-FR') + '€';
    document.getElementById('roiAnnualCost').textContent = coutAnnuelImmo.toLocaleString('fr-FR') + '€';
    document.getElementById('roiNet').textContent = gainNet.toLocaleString('fr-FR') + '€';
    document.getElementById('roiPercent').textContent = roi + '%';
  }

  biensSlider.addEventListener('input', updateROI);
  prixSlider.addEventListener('input', updateROI);
  commissionSlider.addEventListener('input', updateROI);

  function scrollToContact() {
    // Le site n'a pas de #contact : on ouvre le vrai formulaire modal (comme le reste du site)
    if (window.openForm) {
      window.openForm();
    } else {
      const contactForm = document.getElementById('contact');
      if (contactForm) contactForm.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Init au load
  updateROI();


/* ---- bloc JS #7 ---- */

  // ── DASHBOARD : compteurs animés au scroll (IntersectionObserver + rAF) ──
  function animDashStat(el, target, duration = 1500) {
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      if (p < 1) {
        const current = target * p;
        el.textContent = target < 10 ? current.toFixed(1) : Math.floor(current).toLocaleString('fr-FR');
        requestAnimationFrame(step);
      } else {
        el.textContent = target < 10 ? target.toFixed(1) : target.toLocaleString('fr-FR');
        el.setAttribute('data-animated', 'true');
      }
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        [
          {id: 'dashStat1', target: LIVE_STATS_TARGETS.dashStat1},
          {id: 'dashStat2', target: LIVE_STATS_TARGETS.dashStat2},
          {id: 'dashStat3', target: LIVE_STATS_TARGETS.dashStat3},
          {id: 'dashStat4', target: LIVE_STATS_TARGETS.dashStat4}
        ].forEach(stat => {
          const el = document.getElementById(stat.id);
          if (!el || el.getAttribute('data-animated')) return;
          animDashStat(el, stat.target);
        });
        observer.unobserve(entry.target);
      }
    });
  });

  const section = document.querySelector('section:has(#dashStat1)');
  if (section) observer.observe(section);


/* ---- bloc JS #8 ---- */

  function calculatePlacesLeft() {
    const now = new Date();
    const dayOfWeek = now.getDay();

    // Lundi = 1 … Dimanche = 0
    // Raréfaction progressive sur la semaine (Lun=7 → Sam/Dim=0)
    const placesByDay = { 1: 7, 2: 6, 3: 5, 4: 3, 5: 2, 6: 0, 0: 0 };
    const placesLeft = placesByDay[dayOfWeek];

    const placesElement = document.getElementById('placesLeft');
    const placesBar = document.getElementById('placesBar');

    if (!placesElement || !placesBar) return;

    placesElement.textContent = placesLeft;

    // Si 0 places : change le design
    if (placesLeft === 0) {
      placesBar.classList.remove('from-red-600', 'to-red-700');
      placesBar.classList.add('from-black', 'to-gray-900', 'border-t', 'border-red-600');
      placesBar.innerHTML = `
        <div class="max-w-4xl mx-auto text-center">
          <h3 class="font-bold text-lg text-red-500">🔴 Complet cette semaine</h3>
          <p class="text-sm text-gray-400 mt-1">Remplissez le formulaire pour la semaine prochaine</p>
        </div>
      `;
    }
  }

  // Calcule au chargement
  calculatePlacesLeft();

  // Recalcule chaque heure (pour que le compteur change)
  setInterval(calculatePlacesLeft, 3600000);


/* ---- bloc JS #9 ---- */

  // --- DÉMO : pas de dépendance externe, fonctionne sans erreur ---
  function checkoutStripe(priceId, amount){
    alert('💳 Paiement en ligne — bientôt disponible\n\n'
      + 'Offre sélectionnée : ' + amount + '€\n\n'
      + 'Le paiement direct par carte arrive prochainement.\n'
      + 'En attendant, cliquez sur « Demander un devis » : '
      + 'réponse et lien de commande sous 24h.');
  }

  function emailDevis(){
    window.location.href = 'mailto:dimitri444art@gmail.com?subject=Demande de devis ImmoViz 3D';
  }

  /* ===== CODE RÉEL (à décommenter une fois Stripe + CSP configurés) =====
  // <script src="https://js.stripe.com/v3/"><\/script>  // à ajouter dans le <head>
  const stripe = Stripe('pk_test_VOTRE_CLEF_STRIPE');
  async function checkoutStripe(priceId, amount){
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      });
      if (!res.ok) throw new Error('Erreur serveur (' + res.status + ')');
      const { sessionId } = await res.json();
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;
    } catch (err) {
      console.error('Erreur paiement Stripe :', err);
      alert('Une erreur est survenue lors du paiement. Veuillez réessayer ou nous contacter.');
    }
  }
  ======================================================================= */


/* ---- bloc JS #10 ---- */

  const LEAD_MAGNET_HTML = `
    <div class="bg-gray-900 rounded-lg max-w-md w-full border border-gray-800 p-8 relative" role="dialog" aria-modal="true" aria-labelledby="lead-magnet-title" tabindex="-1">
      <button onclick="closeLeadMagnet()" class="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" aria-label="Fermer">✕</button>

      <div style="text-align: center; padding: 20px 0;">
        <h3 style="color: white; margin: 0 0 15px 0; font-size: 1.5rem; font-weight: bold;">Intéressé par mes services ?</h3>
        <p style="color: rgba(255,255,255,0.9); margin: 0 0 20px 0; font-size: 1rem;">Contacte-moi directement sur WhatsApp</p>
        <a href="https://wa.me/33767519437" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: white; color: var(--whatsapp); padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 1rem;">💬 Parle-moi sur WhatsApp</a>
      </div>
    </div>
  `;

  let leadMagnetModalBuilt = false;
  function buildLeadMagnetModal() {
    if (leadMagnetModalBuilt) return;
    leadMagnetModalBuilt = true;
    const modal = document.createElement('div');
    modal.id = 'leadMagnetModal';
    modal.className = 'fixed inset-0 bg-black/70 z-50 flex items-center justify-center hidden p-4';
    modal.innerHTML = LEAD_MAGNET_HTML;
    document.body.appendChild(modal);
  }

  let leadMagnetPreviousFocus = null;

  function showLeadMagnet() {
    const shown = localStorage.getItem('immoviz_leadMagnetShown');
    if (shown) return;

    setTimeout(() => {
      if (!PopupManager.estDisponible('leadMagnet')) return;
      buildLeadMagnetModal();
      const modal = document.getElementById('leadMagnetModal');
      leadMagnetPreviousFocus = document.activeElement;
      modal.classList.remove('hidden');
      modal.querySelector('[role="dialog"]').focus();
      PopupManager.ouvrir('leadMagnet');
      localStorage.setItem('immoviz_leadMagnetShown', 'true');
    }, 30000);
  }

  function closeLeadMagnet() {
    const modal = document.getElementById('leadMagnetModal');
    if (modal) modal.classList.add('hidden');
    PopupManager.fermer('leadMagnet');
    if (leadMagnetPreviousFocus && leadMagnetPreviousFocus.focus) leadMagnetPreviousFocus.focus();
  }

  document.addEventListener('keydown', e => {
    const leadModal = document.getElementById('leadMagnetModal');
    if (e.key === 'Escape' && leadModal && !leadModal.classList.contains('hidden')) closeLeadMagnet();
  });

  let leadMagnetTicking = false;
  window.addEventListener('scroll', () => {
    if (!leadMagnetTicking) {
      leadMagnetTicking = true;
      requestAnimationFrame(() => {
        if ((window.scrollY / (document.body.scrollHeight - window.innerHeight)) > 0.5) {
          showLeadMagnet();
        }
        leadMagnetTicking = false;
      });
    }
  });


/* ---- bloc JS #11 ---- */

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/immo-plans/service-worker.js').catch(() => {});
  }

  // Affiche un prompt "Ajouter à l'écran d'accueil" sur mobile
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Affiche le bouton "Installer l'application" dans le footer
    const installBtn = document.querySelector('[data-install-pwa]');
    if (installBtn) {
      installBtn.style.display = 'flex';
      installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          deferredPrompt = null;
          installBtn.style.display = 'none';
        }
      });
    }
  });

  // L'app est déjà installée ou vient d'être installée → masquer le bouton
  window.addEventListener('appinstalled', () => {
    const installBtn = document.querySelector('[data-install-pwa]');
    if (installBtn) installBtn.style.display = 'none';
  });


/* ---- bloc JS #12 ---- */

function loadTrackers() {
  if (document.querySelector('script[data-tracker="plausible"]')) return;
  const plausible = document.createElement('script');
  plausible.defer = true;
  plausible.src = 'https://plausible.io/js/script.js';
  plausible.dataset.domain = PLAUSIBLE_DOMAIN;
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
