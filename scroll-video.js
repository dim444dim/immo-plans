const FRICTION = 0.86;
const STIFFNESS = 0.62;
const FRAMES_PER_SCROLL_TURN = 30;
const WHEEL_UNITS_PER_TURN = 100;
const SCROLL_SENSITIVITY = FRAMES_PER_SCROLL_TURN / WHEEL_UNITS_PER_TURN;

let bitmaps = [];
let loadedCount = 0;
let ready = false;
let currentFrame = 0;
let targetFrame = 0;
let velocity = 0;
let rafId = null;

async function loadManifest(frameDir) {
  const res = await fetch(frameDir + 'manifest.json');
  const manifest = await res.json();
  // Format canonique produit par scripts/extract-frames.ps1 : { count, frames: [...] }
  if (manifest && Array.isArray(manifest.frames)) return manifest.frames;
  if (Array.isArray(manifest)) return manifest;
  throw new Error('manifest.json invalide dans ' + frameDir);
}

async function loadFrame(frameDir, filename, index, total, progressEl) {
  const res = await fetch(frameDir + filename);
  const blob = await res.blob();
  bitmaps[index] = await createImageBitmap(blob);
  loadedCount++;
  if (progressEl) {
    progressEl.textContent = Math.round((loadedCount / total) * 100);
  }
}

function attachScrollHandlers(sectionEl, count) {
  // Aux bornes (première/dernière frame), on laisse l'événement remonter :
  // sinon la page est piégée dans la section une fois l'animation terminée.
  function atBoundary(delta) {
    return (delta < 0 && targetFrame <= 0) || (delta > 0 && targetFrame >= count - 1);
  }

  sectionEl.addEventListener('wheel', (e) => {
    if (atBoundary(e.deltaY)) return;
    e.preventDefault();
    targetFrame = Math.max(0, Math.min(count - 1, targetFrame + e.deltaY * SCROLL_SENSITIVITY));
  }, { passive: false });

  let touchStartY = null;
  sectionEl.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  sectionEl.addEventListener('touchmove', (e) => {
    if (touchStartY === null) return;
    const touchY = e.touches[0].clientY;
    const delta = touchStartY - touchY;
    if (atBoundary(delta)) {
      touchStartY = touchY;
      return;
    }
    e.preventDefault();
    touchStartY = touchY;
    targetFrame = Math.max(0, Math.min(count - 1, targetFrame + delta * SCROLL_SENSITIVITY));
  }, { passive: false });
}

function startLoop(ctx, canvas, count) {
  function loop() {
    velocity = velocity * FRICTION + (targetFrame - currentFrame) * STIFFNESS;
    currentFrame = Math.max(0, Math.min(count - 1, currentFrame + velocity));
    ctx.drawImage(bitmaps[Math.round(currentFrame)], 0, 0, canvas.width, canvas.height);
    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);
}

async function initScrollVideo(canvasId, frameDir, count) {
  bitmaps = [];
  loadedCount = 0;
  ready = false;
  currentFrame = 0;
  targetFrame = 0;
  velocity = 0;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  const progressEl = document.getElementById('scroll-progress');
  const loaderEl = document.getElementById('scroll-loader');
  const sectionEl = document.getElementById('scroll-video-section');

  const filenames = await loadManifest(frameDir);
  const total = filenames.length || count;

  await Promise.all(filenames.map((filename, index) =>
    loadFrame(frameDir, filename, index, total, progressEl)
  ));

  canvas.width = bitmaps[0].width;
  canvas.height = bitmaps[0].height;

  ready = true;
  if (loaderEl) loaderEl.style.display = 'none';

  if (sectionEl) attachScrollHandlers(sectionEl, total);

  startLoop(ctx, canvas, total);
}

window.initScrollVideo = initScrollVideo;

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('scroll-canvas')) {
    initScrollVideo('scroll-canvas', 'assets/frames-demo/', 10);
  }
});
