/**
 * HORUS C-UAS SYSTEM — Application JavaScript v2.0
 * Advanced System for Drone Detection, Tracking & Neutralization
 * Horus University Egypt · Faculty of Engineering · July 2026
 */
'use strict';

/* ── CONSTANTS ─────────────────────────────────────────────────── */
const PAGES = ['home','arch','research','team','gallery','sim','contact'];
const GALLERY_CATS = ['all','team','hw','conf','sw','video'];

/* ── STATE ─────────────────────────────────────────────────────── */
let isArabic    = false;
let canvasState = 'patrol';
let simRunning  = false;
let heroParticles = null;

/* ═══════════════════════════════════════════════════════════════
   1. READING PROGRESS BAR
═══════════════════════════════════════════════════════════════ */
function initProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled  = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = maxScroll > 0 ? (scrolled / maxScroll * 100) + '%' : '0%';
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════════════════
   2. ROUTER
═══════════════════════════════════════════════════════════════ */
function showPage(id) {
  if (!PAGES.includes(id)) id = 'home';

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

  const pg = document.getElementById('page-' + id);
  const nt = document.getElementById('ntab-' + id);
  if (pg) pg.classList.add('active');
  if (nt) nt.classList.add('active');

  window.location.hash = id;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeMob();

  if (id === 'sim') initSimulation();
  if (id === 'home') initHeroParticles();

  // Refresh AOS on page change
  if (window.AOS) setTimeout(() => AOS.refresh(), 50);
}

function hashRoute() {
  const h = (window.location.hash || '').replace('#', '');
  showPage(PAGES.includes(h) ? h : 'home');
}

window.addEventListener('hashchange', hashRoute);

/* ═══════════════════════════════════════════════════════════════
   3. MOBILE MENU
═══════════════════════════════════════════════════════════════ */
function openMob() {
  document.getElementById('navTabs')?.classList.add('open');
  document.getElementById('navClose').style.display = 'flex';
  document.getElementById('mobBtn')?.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}
function closeMob() {
  document.getElementById('navTabs')?.classList.remove('open');
  const nc = document.getElementById('navClose');
  if (nc) nc.style.display = 'none';
  document.getElementById('mobBtn')?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

/* ═══════════════════════════════════════════════════════════════
   4. CLOCK
═══════════════════════════════════════════════════════════════ */
function tick() {
  const ts = new Date().toLocaleTimeString('en-GB');
  ['hudClock', 'dClock'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = ts;
  });
}
setInterval(tick, 1000);

/* ═══════════════════════════════════════════════════════════════
   5. HERO PARTICLE NETWORK
═══════════════════════════════════════════════════════════════ */
function initHeroParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || heroParticles) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let raf;
  const NUM = 55, DIST = 130;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  for (let i = 0; i < NUM; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.2 + 0.4,
      a: Math.random() * 0.35 + 0.08,
    });
  }

  function draw() {
    const homeActive = document.getElementById('page-home')?.classList.contains('active');
    if (!canvas.isConnected || !homeActive) { cancelAnimationFrame(raf); heroParticles = null; return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,169,66,${p.a})`;
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(200,169,66,${(1 - d / DIST) * 0.12})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(draw);
  }

  heroParticles = true;
  draw();
}

/* ═══════════════════════════════════════════════════════════════
   6. HERO SWIPER
═══════════════════════════════════════════════════════════════ */
function initHeroSwiper() {
  if (!window.Swiper) return;
  new Swiper('.hero-swiper', {
    loop: true,
    autoplay: { delay: 3800, disableOnInteraction: false, pauseOnMouseEnter: true },
    effect: 'fade',
    fadeEffect: { crossFade: true },
    speed: 900,
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    a11y: { prevSlideMessage: 'Previous slide', nextSlideMessage: 'Next slide' },
  });
}

/* ═══════════════════════════════════════════════════════════════
   7. AOS (Animate On Scroll)
═══════════════════════════════════════════════════════════════ */
function initAOS() {
  if (!window.AOS) return;
  AOS.init({
    duration: 650,
    easing: 'ease-out-quad',
    once: true,
    offset: 60,
    disable: window.matchMedia('(prefers-reduced-motion:reduce)').matches,
  });
}

/* ═══════════════════════════════════════════════════════════════
   8. GLIGHTBOX (Gallery Lightbox)
═══════════════════════════════════════════════════════════════ */
function initGLightbox() {
  if (!window.GLightbox) return;
  GLightbox({
    selector: '.glightbox',
    touchNavigation: true,
    loop: true,
    autoplayVideos: true,
    skin: 'clean',
    openEffect: 'fade',
    closeEffect: 'fade',
    slideEffect: 'slide',
    moreText: 'See more',
    moreLength: 60,
    closeButton: true,
    touchFollowAxis: true,
    keyboardNavigation: true,
    zoomable: true,
  });
}

/* ═══════════════════════════════════════════════════════════════
   9. GALLERY FILTER
═══════════════════════════════════════════════════════════════ */
function filterGal(cat, btn) {
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.gal-item').forEach(item => {
    const show = cat === 'all' || item.dataset.cat === cat;
    item.style.display = show ? '' : 'none';
    if (show) {
      item.style.animation = 'none';
      item.offsetHeight; // reflow
      item.style.animation = 'msgIn .3s ease-out forwards';
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   10. COUNTER ANIMATIONS
═══════════════════════════════════════════════════════════════ */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const dec    = el.dataset.dec    || 0;
  const dur    = 1800;
  const start  = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const val  = target * ease;
    el.textContent = prefix + val.toFixed(dec) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else {
      el.textContent = prefix + target.toFixed(dec) + suffix;
      el.classList.add('counter-pop');
      setTimeout(() => el.classList.remove('counter-pop'), 300);
    }
  }
  requestAnimationFrame(step);
}

function initCounters() {
  if (!window.IntersectionObserver) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = '1';
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-counter]').forEach(el => obs.observe(el));
}

/* ═══════════════════════════════════════════════════════════════
   11. CANVAS SIMULATION ENGINE
═══════════════════════════════════════════════════════════════ */
const drone  = { x: 320, y: 180, vx: 0.6, vy: -0.4 };
const bbox   = { x: 0, y: 0, w: 0, h: 0, alpha: 0 };
const smooth = { x: 320, y: 180 };
let frame = 0, confSmooth = 0, simRaf = null;
let simEls = null; /* cached DOM refs for the readout panel — populated once, not per frame */

function initSimulation() {
  if (simRunning) return;
  const canvas = document.getElementById('simCanvas');
  if (!canvas) return;
  simRunning = true;
  tick();
  drawSimFrame(canvas, canvas.getContext('2d'));
}

function drawSimFrame(canvas, ctx) {
  if (!canvas.isConnected || !document.getElementById('page-sim')?.classList.contains('active')) {
    simRunning = false; return;
  }
  frame++;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  /* sky gradient */
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0a1628'); sky.addColorStop(0.6, '#111e35'); sky.addColorStop(1, '#1a2a48');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  /* grid */
  ctx.strokeStyle = 'rgba(200,169,66,.04)'; ctx.lineWidth = 1;
  for (let gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
  for (let gy = 0; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

  /* city silhouette */
  ctx.fillStyle = 'rgba(13,27,62,.65)';
  const bldgs = [[0,20],[60,35],[110,15],[180,45],[240,25],[320,50],[400,20],[470,40],[540,18],[600,30],[640,0]];
  ctx.beginPath(); ctx.moveTo(0, H);
  bldgs.forEach(b => ctx.lineTo(b[0], H * 0.65 - b[1]));
  ctx.lineTo(W, H); ctx.closePath(); ctx.fill();

  /* crosshair */
  ctx.strokeStyle = 'rgba(200,169,66,.1)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();

  /* corner brackets */
  const bs = 20, bo = 10;
  ctx.strokeStyle = 'rgba(200,169,66,.32)'; ctx.lineWidth = 1.5;
  [[bo,bo,1,1],[W-bo,bo,-1,1],[bo,H-bo,1,-1],[W-bo,H-bo,-1,-1]].forEach(c => {
    ctx.beginPath(); ctx.moveTo(c[0]+c[2]*bs, c[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(c[0], c[1]+c[3]*bs); ctx.stroke();
  });

  /* drone movement */
  const isLocked  = canvasState === 'locked';
  const isDetect  = canvasState === 'detect';
  const isPatrol  = canvasState === 'patrol' || canvasState === 'monitor';
  const speedMult = isLocked ? 0.28 : isDetect ? 0.48 : 1;

  drone.x += drone.vx * speedMult + (Math.random() - 0.5) * 0.3;
  drone.y += drone.vy * speedMult + (Math.random() - 0.5) * 0.3;
  if (drone.x < 20 || drone.x > W - 20) drone.vx *= -1;
  if (drone.y < 30 || drone.y > H * 0.6) drone.vy *= -1;

  if (isPatrol) {
    bbox.alpha = Math.max(0, bbox.alpha - 0.04);
    confSmooth = Math.max(0, confSmooth - 0.03);
  } else {
    bbox.alpha  = Math.min(1, bbox.alpha + 0.06);
    confSmooth  = Math.min(isLocked ? 0.97 : 0.93, confSmooth + 0.04);
    smooth.x   += (drone.x - smooth.x) * (isLocked ? 0.35 : 0.22);
    smooth.y   += (drone.y - smooth.y) * (isLocked ? 0.35 : 0.22);
    bbox.w = isLocked ? 80 : 72; bbox.h = isLocked ? 64 : 56;
    bbox.x = smooth.x - bbox.w / 2; bbox.y = smooth.y - bbox.h / 2;
  }

  /* draw drone */
  const dw = 20, dh = 14;
  const da = 0.7 + Math.sin(frame * 0.08) * 0.14;
  ctx.save(); ctx.translate(drone.x, drone.y);
  ctx.fillStyle = `rgba(180,180,200,${da})`;
  ctx.beginPath(); ctx.ellipse(0, 0, dw * 0.5, dh * 0.35, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = `rgba(160,160,180,${da})`; ctx.lineWidth = 1.5;
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(arm => {
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(arm[0]*dw*0.8, arm[1]*dh*0.9); ctx.stroke();
    ctx.fillStyle = `rgba(200,200,220,${da * 0.75})`;
    ctx.beginPath(); ctx.ellipse(arm[0]*dw*0.8, arm[1]*dh*0.9, 5, 2, frame * 0.3, 0, Math.PI * 2); ctx.fill();
  });
  if (Math.floor(frame / 15) % 2 === 0) {
    ctx.fillStyle = 'rgba(255,80,80,.9)';
    ctx.beginPath(); ctx.arc(0, dh * 0.35, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  /* bounding box */
  if (bbox.alpha > 0.01) {
    const a = bbox.alpha;
    ctx.strokeStyle = `rgba(231,76,60,${a * 0.3})`; ctx.lineWidth = 6;
    ctx.strokeRect(bbox.x - 3, bbox.y - 3, bbox.w + 6, bbox.h + 6);
    ctx.strokeStyle = `rgba(231,76,60,${a})`; ctx.lineWidth = 1.5; ctx.setLineDash([]);
    ctx.strokeRect(bbox.x, bbox.y, bbox.w, bbox.h);
    const cs = 10;
    ctx.strokeStyle = `rgba(200,169,66,${a})`; ctx.lineWidth = 2;
    [[bbox.x,bbox.y,1,1],[bbox.x+bbox.w,bbox.y,-1,1],[bbox.x,bbox.y+bbox.h,1,-1],[bbox.x+bbox.w,bbox.y+bbox.h,-1,-1]].forEach(c => {
      ctx.beginPath(); ctx.moveTo(c[0]+c[2]*cs, c[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(c[0], c[1]+c[3]*cs); ctx.stroke();
    });
    const cx = bbox.x + bbox.w / 2, cy = bbox.y + bbox.h / 2;
    ctx.strokeStyle = `rgba(231,76,60,${a})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx-6,cy); ctx.lineTo(cx+6,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,cy-6); ctx.lineTo(cx,cy+6); ctx.stroke();
    /* label */
    const lbl = isLocked ? 'DRONE · LOCKED' : 'DRONE · DETECT';
    ctx.fillStyle = `rgba(231,76,60,${a})`; ctx.fillRect(bbox.x, bbox.y-18, bbox.w, 17);
    ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.font = 'bold 9px "Roboto Mono",monospace'; ctx.textAlign = 'left';
    ctx.fillText(`${lbl}  ${(confSmooth*100).toFixed(0)}%`, bbox.x+4, bbox.y-5);
    /* Kalman prediction */
    if (isLocked) {
      const kpx = drone.x + drone.vx * 8, kpy = drone.y + drone.vy * 8;
      ctx.strokeStyle = `rgba(200,169,66,${a * 0.5})`; ctx.lineWidth = 1; ctx.setLineDash([3,5]);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(kpx, kpy); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = `rgba(200,169,66,${a})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(kpx, kpy, 4, 0, Math.PI * 2); ctx.stroke();
    }
  }

  /* HUD mode text */
  const modeText  = isLocked ? '● LOCKED' : isDetect ? '● DETECT' : '● PATROL';
  const modeColor = isLocked ? 'rgba(231,76,60,.9)' : isDetect ? 'rgba(243,156,18,.9)' : 'rgba(46,204,113,.9)';
  ctx.fillStyle = modeColor; ctx.font = 'bold 9px "Roboto Mono",monospace'; ctx.textAlign = 'right';
  ctx.fillText(modeText, W-10, H-10);
  /* REC */
  if (Math.floor(frame/30) % 2 === 0) {
    ctx.fillStyle = 'rgba(231,76,60,.9)'; ctx.beginPath(); ctx.arc(18, 16, 4, 0, Math.PI * 2); ctx.fill();
  }

  /* Update UI readouts — throttled to ~15fps instead of every 60fps frame,
     with cached element refs and change-detection on the state-driven fields. */
  if (frame % 4 === 0) {
    if (!simEls) {
      simEls = {
        infMs: document.getElementById('infMs'),
        confDisp: document.getElementById('confDisp'),
        classDisp: document.getElementById('classDisp'),
        kalmanDisp: document.getElementById('kalmanDisp'),
      };
    }
    if (simEls.infMs) simEls.infMs.textContent = (28 + Math.round(Math.random() * 6)) + 'ms';
    if (simEls.confDisp) simEls.confDisp.textContent = confSmooth > 0.01 ? confSmooth.toFixed(2) : '--';

    const classVal = isPatrol ? '--' : 'DRONE';
    if (simEls.classDisp && simEls.classDisp.textContent !== classVal) simEls.classDisp.textContent = classVal;

    const kalmanVal = isLocked ? 'TRACKING' : isDetect ? 'INIT' : 'IDLE';
    if (simEls.kalmanDisp && simEls.kalmanDisp.textContent !== kalmanVal) simEls.kalmanDisp.textContent = kalmanVal;
  }

  simRaf = requestAnimationFrame(() => drawSimFrame(canvas, ctx));
}

/* ═══════════════════════════════════════════════════════════════
   12. SIMULATION EVENTS (Telegram feed + dashboard)
═══════════════════════════════════════════════════════════════ */
const simMsgs = {
  intrusion: [
    { t:'a', m:'🚨 AIRSPACE BREACH DETECTED\n\nClass I UAS signature — Sector NE-4\nFreq: 2.4 GHz control link detected\nBearing: 047° · Initiating slew-to-cue…' },
    { t:'l', m:'🎯 VISUAL ACQUISITION\n\nYOLOv8n: DRONE class detected\nConf: 0.93 · BBox: [521,192,89,74]px\nKalman filter initialised · PTZ slewing…' },
    { t:'a', m:'🔴 TARGET LOCKED\n\nKalman state: [312,184,+2.1,-0.8]\nBBox stable · PID engaged\nAwaiting operator: ENGAGE or MONITOR?' },
  ],
  lock:   [{ t:'l', m:'🎯 PRECISION LOCK CONFIRMED\n\nCentroid: [356, 221]px · Size: 88×72px\nVelocity: [+2.3, -0.8] px/s\nTracking stable · Kalman RMSE: ~12px' }],
  clear:  [{ t:'i', m:'✅ AREA CLEAR\n\nNo UAS class detected in frame.\nAll pipeline stages nominal.\nResuming autonomous patrol sweep…' }],
  status: [{ t:'i', m:'📊 PIPELINE STATUS\n\nGStreamer: ✓ RTSP active\nYOLOv8n INT8: ✓ loaded\nKalman Filter: ✓ initialized\nISAPI/PID: ✓ standby\nTelegram Bot: ✓ connected (4G)\nAll layers nominal.' }],
};

const dashData = {
  intrusion: { s:'SCANNING',  sc:'dp-v',     t:'UAS DETECTED',  c:'0.93', b:'[521,192,89,74]px', l:'~139 ms', ai:'93%', lk:'72%'  },
  lock:      { s:'LOCKED',    sc:'dp-v red', t:'DRONE CLASS I', c:'0.95', b:'[356,221,88,72]px', l:'~137 ms', ai:'95%', lk:'98%'  },
  clear:     { s:'PATROL',    sc:'dp-v',     t:'NONE',          c:'--',   b:'--',                l:'-- ms',   ai:'0%',  lk:'0%'   },
  status:    { s:'ONLINE',    sc:'dp-v',     t:'MONITORING',    c:'0.88', b:'[312,184,80,65]px', l:'~139 ms', ai:'88%', lk:'85%'  },
};

function addMsg(type, text) {
  const box = document.getElementById('tgBox');
  if (!box) return;
  const m = document.createElement('div');
  m.className = 'tmsg ' + type;
  m.innerHTML = text.replace(/\n/g, '<br>') + `<div class="tmsg-ts">${new Date().toLocaleTimeString('en-GB')}</div>`;
  box.appendChild(m);
  box.scrollTop = box.scrollHeight;
}

function updDash(key) {
  const d = dashData[key]; if (!d) return;
  const sys = document.getElementById('dSys');
  if (sys) { sys.textContent = d.s; sys.className = d.sc || 'dp-v'; }
  ['dTgt','dConf','dBbox','dLat'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.textContent = [d.t, d.c, d.b, d.l][i];
  });
  const aiBar = document.getElementById('aiBar');
  const lkBar = document.getElementById('lkBar');
  if (aiBar) { aiBar.style.width = d.ai; aiBar.setAttribute('aria-valuenow', parseInt(d.ai)); }
  if (lkBar) { lkBar.style.width = d.lk; lkBar.setAttribute('aria-valuenow', parseInt(d.lk)); }
  const aiPct = document.getElementById('aiPct'); if (aiPct) aiPct.textContent = d.ai;
  const lkPct = document.getElementById('lkPct'); if (lkPct) lkPct.textContent = d.lk;

  /* Give the eye an explicit "look here" cue the instant the numbers change,
     instead of leaving camera/dashboard/Telegram to update with no sequencing hint. */
  const panel = document.querySelector('.dash-panel');
  if (panel) { panel.classList.remove('flash'); void panel.offsetWidth; panel.classList.add('flash'); }

  canvasState = { intrusion:'detect', lock:'locked', clear:'patrol', status:'monitor' }[key] || 'patrol';
  pipelineAnimate(key);
}

function sim(type) {
  const msgs = simMsgs[type]; if (!msgs) return;
  updDash(type);
  msgs.forEach((m, i) => setTimeout(() => addMsg(m.t, m.m), i * 1400));
}

/* ═══════════════════════════════════════════════════════════════
   13. PIPELINE STEP ANIMATION
═══════════════════════════════════════════════════════════════ */
function pipelineAnimate(type) {
  const steps  = ['ps0','ps1','ps2','ps3','ps4','ps5'];
  const counts = { intrusion:4, lock:5, clear:3, status:3 };
  const count  = counts[type] || 3;
  steps.forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('active','done'); });
  steps.slice(0, count).forEach((id, i) => {
    setTimeout(() => {
      const el = document.getElementById(id); if (!el) return;
      if (i > 0) {
        const prev = document.getElementById(steps[i-1]);
        if (prev) { prev.classList.remove('active'); prev.classList.add('done'); }
      }
      el.classList.add('active');
      if (i === count - 1) setTimeout(() => { el.classList.remove('active'); el.classList.add('done'); }, 600);
    }, i * 350);
  });
}

/* ═══════════════════════════════════════════════════════════════
   14. MODE TOGGLE
═══════════════════════════════════════════════════════════════ */
function initModeToggle() {
  const mt = document.getElementById('modeToggle');
  if (!mt) return;
  mt.addEventListener('change', function () {
    const isM = this.checked;
    const lA  = document.getElementById('mlAuto');
    const lM  = document.getElementById('mlManual');
    const md  = document.getElementById('modeDesc');
    if (lA) lA.className = 'mode-lbl' + (isM ? '' : ' on-auto');
    if (lM) lM.className = 'mode-lbl' + (isM ? ' on-manual' : '');
    if (md) md.textContent = isM ? 'MANUAL override active. Operator controls PTZ and engagement directly.' : 'Autonomous tracking and automated engagement active.';
    this.setAttribute('aria-checked', isM ? 'true' : 'false');
    addMsg(isM ? 'l' : 'i', isM
      ? '⚠️ MANUAL OVERRIDE activated.\nAutonomous engagement suspended.\nOperator authorisation required for all countermeasures.'
      : '✅ Reverted to AUTONOMOUS mode.\nFull automation engaged. YOLOv8n pipeline active.');
  });
}

/* ═══════════════════════════════════════════════════════════════
   15. PDF MODAL
═══════════════════════════════════════════════════════════════ */
function openPdf(src, title) {
  if (window.matchMedia('(max-width:640px)').matches) {
    window.open(src, '_blank');
    return;
  }
  const modal = document.getElementById('pdf-modal');
  const frame = document.getElementById('pdf-frame');
  const tit   = document.getElementById('pdf-modal-title');
  const dl    = document.getElementById('pdf-download-link');
  if (!modal || !frame) return;
  if (tit) tit.textContent = title || 'Document Viewer';
  if (dl)  dl.href = src;
  frame.src = src;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePdf() {
  const modal = document.getElementById('pdf-modal');
  const frame = document.getElementById('pdf-frame');
  if (modal) modal.classList.remove('open');
  if (frame) frame.src = '';
  document.body.style.overflow = '';
}

function openFullscreen() {
  const frame = document.getElementById('pdf-frame');
  if (frame && frame.requestFullscreen) frame.requestFullscreen();
}

/* Close on overlay click */
document.addEventListener('click', e => {
  if (e.target.id === 'pdf-modal') closePdf();
});

/* Close on ESC */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closePdf(); closeMob(); }
});

/* ═══════════════════════════════════════════════════════════════
   16. CONTACT FORM
═══════════════════════════════════════════════════════════════ */
async function submitForm(e) {
  e.preventDefault();
  const name    = document.getElementById('cf-name')?.value.trim();
  const org     = document.getElementById('cf-org')?.value.trim();
  const email   = document.getElementById('cf-email')?.value.trim();
  const subject = document.getElementById('cf-subject')?.value;
  const message = document.getElementById('cf-msg')?.value.trim();
  if (!name || !email || !subject || !message) {
    alert(isArabic ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Please fill in all required fields.');
    return;
  }
  const btn  = document.querySelector('.form-submit');
  const orig = btn?.textContent;
  if (btn) { btn.textContent = isArabic ? 'جاري الإرسال...' : 'Sending…'; btn.disabled = true; btn.style.opacity = '.65'; }
  
  const BOT_TOKEN = '8755127790:AAEzIi1svbJPiG7fy6Wj9Kx8Og4G0pXL9II';
  const CHAT_ID   = '5022244123';

  const text =
    `📩 New Website Enquiry\n\n` +
    `👤 Name: ${name}\n` +
    `🏢 Institution: ${org || 'N/A'}\n` +
    `📧 Email: ${email}\n` +
    `📌 Subject: ${subject}\n\n` +
    `💬 Message:\n${message}`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text }),
    });
    if (res.ok) {
      const toast = document.getElementById('form-toast');
      if (toast) { toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 5000); }
      document.getElementById('contactForm')?.reset();
    } else throw new Error('API error');
  } catch {
    alert(isArabic ? 'حدث خطأ، يرجى المحاولة مرة أخرى.' : 'Error sending. Please try again.');
  } finally {
    if (btn) { btn.textContent = orig; btn.disabled = false; btn.style.opacity = '1'; }
  }
}

/* ═══════════════════════════════════════════════════════════════
   17. LANGUAGE TOGGLE
═══════════════════════════════════════════════════════════════ */
const TRANSLATIONS = {
  'ntab-home':      { en:'Overview',              ar:'نظرة عامة'       },
  'ntab-arch':      { en:'Architecture',          ar:'المعمارية'        },
  'ntab-research':  { en:'Research',              ar:'الأبحاث'          },
  'ntab-team':      { en:'Team',                  ar:'الفريق'           },
  'ntab-gallery':   { en:'Gallery',               ar:'المعرض'           },
  'ntab-sim':       { en:'Live Demo',             ar:'عرض مباشر'        },
  'ntab-contact':   { en:'Contact',               ar:'تواصل معنا'       },
  'uniFaculty':     { en:'Faculty of Engineering',ar:'كلية الهندسة'     },
  'uniDept':        { en:'Department of Communications & Electronics Engineering', ar:'قسم هندسة الاتصالات والإلكترونيات' },
  'problem-heading':{ en:'The Granularity Gap',   ar:'فجوة الدقة'       },
  'conops-heading': { en:'System Workflow',       ar:'مسار عمل النظام'  },
  'ach-heading':    { en:'Key Achievements',      ar:'الإنجازات الرئيسية' },
  'arch-heading':   { en:'Architecture & Data Flow', ar:'المعمارية وتدفق البيانات' },
  'research-heading':{ en:'Research & Publications', ar:'الأبحاث والمنشورات' },
  'research-lead':  { en:'Peer-reviewed publication, competitive awards, and externally funded innovation — the academic footprint of this work extends beyond the graduation project.', ar:'نشر علمي محكَّم، وجوائز تنافسية، وابتكار ممول خارجياً — البصمة الأكاديمية لهذا العمل تتخطى حدود مشروع التخرج.' },
  'sup-heading':    { en:'Supervisory Committee', ar:'لجنة الإشراف'      },
  'team-heading':   { en:'Team Horus — Class of 2026', ar:'فريق حورس — دفعة 2026' },
  'gallery-heading':{ en:'Project Media Gallery', ar:'معرض وسائط المشروع' },
  'sim-heading':    { en:'Live System Simulation', ar:'محاكاة النظام المباشرة' },
  'sim-lead':       { en:'Visualisation of the C-UAS pipeline. Toggle AUTO / MANUAL, simulate events, and observe live data flow.', ar:'تصوير لمعمارية نظام C-UAS. بدّل بين AUTO / MANUAL وراقب تدفق البيانات.' },
  'form-heading':   { en:'Send an Enquiry',       ar:'أرسل استفساراً'   },
  'contact-lead':   { en:'Faculty of Engineering — Horus University Egypt, New Damietta. For academic enquiries, collaboration proposals, and research correspondence.', ar:'كلية الهندسة — جامعة حورس مصر، دمياط الجديدة. للاستفسارات الأكاديمية ومقترحات التعاون.' },
};

function toggleLang() {
  isArabic = !isArabic;
  const root = document.getElementById('htmlRoot');
  root.setAttribute('lang', isArabic ? 'ar' : 'en');
  root.setAttribute('dir',  isArabic ? 'rtl' : 'ltr');
  const lbl = document.getElementById('langLabel');
  if (lbl) lbl.textContent = isArabic ? 'English' : 'العربية';

  Object.keys(TRANSLATIONS).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const val = isArabic ? TRANSLATIONS[id].ar : TRANSLATIONS[id].en;
    el.innerHTML = val;
  });

  const cta = document.querySelector('.nav-cta');
  if (cta) cta.textContent = isArabic ? 'المنشورات ↗' : 'Publications ↗';

  const filterMap = {
    all:'الكل', team:'الفريق', hw:'الأجهزة', sw:'البرمجيات', conf:'المؤتمرات', video:'الفيديو'
  };
  document.querySelectorAll('.fbtn').forEach(b => {
    const fn = b.getAttribute('onclick') || '';
    const m  = fn.match(/filterGal\('([^']+)'/);
    if (m && isArabic && filterMap[m[1]]) b.textContent = filterMap[m[1]];
    else if (m && !isArabic) {
      const labels = { all:'All', team:'Team', hw:'Hardware', sw:'Software / AI', conf:'Conference', video:'Video' };
      b.textContent = labels[m[1]] || m[1];
    }
  });

  const subBtn = document.querySelector('.form-submit');
  if (subBtn) subBtn.textContent = isArabic ? 'إرسال الرسالة' : 'Send Message';
  const mapBtn = document.querySelector('.map-btn');
  if (mapBtn) mapBtn.textContent = isArabic ? 'فتح في خرائط جوجل ↗' : 'Open in Google Maps ↗';
}

/* ═══════════════════════════════════════════════════════════════
   18. KEYBOARD GALLERY ITEM
═══════════════════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.classList.contains('gal-item')) {
    e.target.click();
  }
});

/* ═══════════════════════════════════════════════════════════════
   19. DOMContentLoaded — INIT
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  /* Route on load */
  const h = (window.location.hash || '').replace('#', '');
  showPage(PAGES.includes(h) ? h : 'home');

  /* Core inits */
  initProgressBar();
  initHeroSwiper();
  initAOS();
  initGLightbox();
  initCounters();
  initModeToggle();
  tick();

  /* Nav click outside closes mobile menu */
  document.addEventListener('click', e => {
    const tabs = document.getElementById('navTabs');
    const btn  = document.getElementById('mobBtn');
    if (tabs?.classList.contains('open') && !tabs.contains(e.target) && e.target !== btn) {
      closeMob();
    }
  });

  /* Expose globals for inline onclick handlers */
  window.showPage     = showPage;
  window.openMob      = openMob;
  window.closeMob     = closeMob;
  window.filterGal    = filterGal;
  window.sim          = sim;
  window.toggleLang   = toggleLang;
  window.submitForm   = submitForm;
  window.openPdf      = openPdf;
  window.closePdf     = closePdf;
  window.openFullscreen = openFullscreen;
});
