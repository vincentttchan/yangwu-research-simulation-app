/* ============================================================
   motion.js — 動畫工具
   自訂游標 / Magnetic / Smooth Scroll（輕量自寫）
   依《視覺規格 v2》§4
   ============================================================ */

(function () {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none)').matches;
  if (reduced || isTouch) return;

  // ---------- 自訂游標：點即時 + 環慣性 ----------
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform  = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  }, { passive: true });

  // 環用 lerp 跟隨，製造慣性
  function tick() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // hover 在可點擊物上 → 點縮環脹
  function bindHover(selector) {
    document.querySelectorAll(selector).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        dot.classList.add('is-hover');
        ring.classList.add('is-hover');
      });
      el.addEventListener('mouseleave', () => {
        dot.classList.remove('is-hover');
        ring.classList.remove('is-hover');
      });
    });
  }
  bindHover('button, a, [data-magnetic], .route-item, .route-card, .timeline-events-full li, .back-link, .audio-strip');

  // ---------- Magnetic Button ----------
  // 游標靠近時，按鈕向游標位移最多 6px
  document.querySelectorAll('[data-magnetic]').forEach((btn) => {
    const PULL = 6;       // 最大位移
    const REACH = 120;    // 觸發距離

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > REACH) return;
      const force = (1 - dist / REACH) * PULL;
      const ang = Math.atan2(dy, dx);
      btn.style.transform = `translate(${Math.cos(ang) * force}px, ${Math.sin(ang) * force}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)';
      btn.style.transform = '';
      setTimeout(() => { btn.style.transition = ''; }, 500);
    });
  });

})();
