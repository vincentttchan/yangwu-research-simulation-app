/* ============================================================
   intro.js v3.0 — 雙屏架構控制
   載入序列（年份 + 進度線） + stagger reveal
   開卷過場 / 路線↔時間軸聯動 / 啟程
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('dragstart', (e) => {
    if (e.target && e.target.closest && e.target.closest('img')) e.preventDefault();
  });

  // ---------- 1. 載入序列（年份 + 進度線同步） ----------
  const loader   = document.getElementById('loader');
  const yearEl   = document.getElementById('loaderYear');
  const fillEl   = document.getElementById('loaderProgress');
  const stage    = document.getElementById('stage');
  const START = 1860, END = 1895;
  const DURATION = 3200;
  const RESEARCH_LOGIN_PASSED_EVENT = 'yangwu:research-login-passed';
  const now = () => (typeof window.performance !== 'undefined' && typeof window.performance.now === 'function')
    ? window.performance.now()
    : Date.now();
  const requestFrame = (callback) => (typeof window.requestAnimationFrame !== 'undefined' && typeof window.requestAnimationFrame === 'function')
    ? window.requestAnimationFrame(callback)
    : window.setTimeout(() => callback(now()), 16);
  let loaderStartTime = now();
  let loaderStarted = false;
  const MANAGED_MODAL_IDS = [
    'eventModal',
    'evidenceTaskModal',
    'hotspotModal',
    'personModal',
    'achievementGallery',
    'personGallery',
    'setbackModal',
    'interludeModal',
    'letterModal'
  ];

  function isLayerOpen(id) {
    const el = document.getElementById(id);
    return !!(el && !el.hasAttribute('hidden'));
  }

  function refreshManagedModalState() {
    const openIds = MANAGED_MODAL_IDS.filter(isLayerOpen);
    if (openIds.length) {
      document.documentElement.dataset.modalOpen = 'true';
      document.documentElement.dataset.modalStack = openIds.join(' ');
    } else {
      delete document.documentElement.dataset.modalOpen;
      delete document.documentElement.dataset.modalStack;
    }
  }

  function closeSealPanels() {
    document.querySelectorAll('.seal-panel:not([hidden])').forEach((p) => p.setAttribute('hidden', ''));
    document.querySelectorAll('.seal-btn').forEach((b) => b.setAttribute('aria-pressed', 'false'));
  }

  function closeManagedModals(options = {}) {
    const except = options.except || null;
    const keep = new Set(options.keep || []);
    MANAGED_MODAL_IDS.forEach((id) => {
      if (id === except || keep.has(id)) return;
      const el = document.getElementById(id);
      if (el) {
        el.setAttribute('hidden', '');
        el.setAttribute('aria-hidden', 'true');
      }
    });
    if (options.closePanels !== false) closeSealPanels();
    refreshManagedModalState();
  }

  function openManagedModal(id, options = {}) {
    const el = document.getElementById(id);
    if (!el) return null;
    if (options.exclusive !== false) {
      closeManagedModals({
        except: id,
        keep: options.keep || [],
        closePanels: options.closePanels
      });
    } else if (options.closePanels) {
      closeSealPanels();
    }
    el.removeAttribute('hidden');
    el.setAttribute('aria-hidden', 'false');
    refreshManagedModalState();
    return el;
  }

  function hideManagedModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute('hidden', '');
    el.setAttribute('aria-hidden', 'true');
    refreshManagedModalState();
  }

  function closeTopManagedLayer() {
    const em = document.getElementById('eventModal');
    if (em && !em.hasAttribute('hidden')) {
      const ph = em.dataset.phase;
      if (ph === 'result') {
        if (em.dataset.mode === 'facility') finishFacilityTask();
        else closeEventModal();
        return true;
      }
      if (ph === 'payoff') {
        const ev = EVENTS[currentEventId];
        if (!(ev && ev.challenge)) closeEventModal();
      }
      return true;
    }
    if (isLayerOpen('evidenceTaskModal')) return true;
    if (isLayerOpen('achievementGallery')) { hideManagedModal('achievementGallery'); return true; }
    if (isLayerOpen('personGallery')) { hideManagedModal('personGallery'); return true; }
    if (isLayerOpen('personModal')) { hideManagedModal('personModal'); return true; }
    if (isLayerOpen('hotspotModal')) { dismissHotspotModal(); return true; }
    if (isLayerOpen('letterModal')) { hideManagedModal('letterModal'); return true; }
    if (isLayerOpen('setbackModal')) { hideManagedModal('setbackModal'); return true; }
    if (isLayerOpen('interludeModal')) { hideManagedModal('interludeModal'); return true; }
    if (document.querySelector('.seal-panel:not([hidden])')) {
      closeSealPanels();
      return true;
    }
    return false;
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function tickYear(frameTime) {
    const t = Math.min(1, (frameTime - loaderStartTime) / DURATION);
    const eased = easeOutCubic(t);
    const v = Math.round(START + (END - START) * eased);
    if (yearEl) yearEl.textContent = v;
    if (fillEl) fillEl.style.width = (eased * 100) + '%';
    if (t < 1) {
      requestFrame(tickYear);
    } else {
      setTimeout(finishLoader, 420);
    }
  }

  function isResearchMode() {
    return new URLSearchParams(window.location.search).get('mode') === 'research';
  }

  function startLoaderAfterGate() {
    if (loaderStarted) return;
    loaderStarted = true;
    loaderStartTime = now();
    window.setTimeout(() => {
      if (loader && document.body.contains(loader)) finishLoader();
    }, DURATION + 900);
    try {
      requestFrame(tickYear);
    } catch (e) {
      finishLoader();
    }
  }

  if (isResearchMode() && document.documentElement.dataset.researchLoginGate !== 'passed') {
    document.documentElement.dataset.introLoader = 'waiting-research-login';
    window.addEventListener(RESEARCH_LOGIN_PASSED_EVENT, () => {
      document.documentElement.dataset.introLoader = 'running';
      startLoaderAfterGate();
    }, { once: true });
  } else {
    document.documentElement.dataset.introLoader = 'running';
    startLoaderAfterGate();
  }

  function finishLoader() {
    loader && loader.classList.add('is-out');
    stage && stage.setAttribute('aria-hidden', 'false');
    stage && stage.classList.add('is-in');
    setTimeout(() => loader && loader.remove(), 1100);
    startReveal();
    primeIntroBgm();
  }

  // ---------- 3. Stagger reveal ----------
  function startReveal() {
    document.querySelectorAll('.reveal-item').forEach((el) => {
      const order = parseInt(el.dataset.reveal || '0', 10);
      const delay = 80 + order * 160;
      setTimeout(() => el.classList.add('is-revealed'), delay);
    });
  }

  // ---------- 4. 開卷：序章 → 擇路 ----------
  const btnOpen = document.getElementById('btnOpen');
  const btnBack = document.getElementById('btnBack');

  function gotoSelection() {
    if (!stage) return;
    stage.classList.add('is-on-selection');
    // 切換 aria-hidden
    document.getElementById('screen1')?.setAttribute('aria-hidden', 'true');
    document.getElementById('screen2')?.setAttribute('aria-hidden', 'false');
  }
  function gotoIntro() {
    if (!stage) return;
    stage.classList.remove('is-on-selection');
    document.getElementById('screen1')?.setAttribute('aria-hidden', 'false');
    document.getElementById('screen2')?.setAttribute('aria-hidden', 'true');
  }

  btnOpen && btnOpen.addEventListener('click', () => {
    try { BGM.start(); } catch (e) {}
    gotoSelection();
  });
  btnBack && btnBack.addEventListener('click', gotoIntro);

  // ---------- 5. 路線選擇 ----------
  const ROUTE_NAMES = {
    lihongzhang: { zh: '李 鴻 章 · 淮 軍 餘 暉', en: 'Li Hongzhang · Huai Army' },
    rongheng:    { zh: '容 　 閎 · 留 學 夢 碎',   en: 'Rong Hong · A Dream Recalled' },
    yixin:       { zh: '奕 　 訢 · 總 理 風 雲',   en: 'Yi Xin · Zongli Yamen' },
    free:        { zh: '自 由 書 記 · 遊 幕 之 客', en: 'The Drifting Brush' }
  };

  // ---------- Screen 2 旋轉木馬資料 ----------
  const CAROUSEL_DATA = [
    {
      key: 'lihongzhang',
      num: '壹',
      name: '李 鴻 章',
      en: 'Li Hongzhang · 1823–1901',
      routeLine: '自江南煙囪起筆，親歷自強盛衰',
      bio: '你將從上海啟程，見證船炮、官局、商辦與朝議如何一面推動自強，一面把更深的難題留到戰火之前。',
      tags: ['首卷路線', '北洋伏線'],
      ability: {
        axes: ['軍工：船炮、製造', '折衝：列強談判', '聲望：朝廷資源', '眼界：重技術，輕制度'],
        risk: '船炮可造，制度未必肯動。'
      },
      difficulty: 2,
      meta: '首輪建議 · 約 30 分鐘 · 上海起步',
      portrait: 'assets/sketches/lihongzhang-portrait.webp',
      recommended: true,
      stats: { qi: 5, jiao: 4, wang: 4, xue: 2 }   // 器物 外交 聲望 西學
    },
    {
      key: 'yixin',
      num: '貳',
      name: '奕 　 訢',
      en: 'Prince Gong · 1833–1898',
      routeLine: '在朝廷中樞推動外交與制度轉向',
      bio: '恭親王，1861 設總理衙門掌外交。你將立於朝廷風暴中央，見證每項改革如何被妥協、被抵抗、被緩慢推進。',
      tags: ['制度派', '總理衙門'],
      ability: {
        axes: ['器物：有限支持新式設備', '外交：總理衙門與條約應對', '聲望：宗室身份與中樞權力', '西學：以實用為主'],
        risk: '能開新局，亦受守舊牽制。'
      },
      difficulty: 4,
      meta: '約 35 分鐘 · 政治深度 · 北京為主',
      portrait: 'assets/sketches/yixin-portrait.webp',
      recommended: false,
      stats: { qi: 2, jiao: 5, wang: 4, xue: 2 }
    },
    {
      key: 'rongheng',
      num: '參',
      name: '容 　 閎',
      en: 'Yung Wing · 1828–1912',
      routeLine: '以留學與人才培養打開近代視野',
      bio: '耶魯第一位中國畢業生。一生只做一件事：送三十個孩子渡洋。十年後，再親眼看著他們被召回。',
      tags: ['思想派', '留學夢碎'],
      ability: {
        axes: ['器物：理解技術而非掌軍工', '外交：熟悉西方社會', '聲望：理想高，權力弱', '西學：教育與人才路線'],
        risk: '理想走得太前，制度未必追得上。'
      },
      difficulty: 3,
      meta: '約 25 分鐘 · 結局較早',
      portrait: 'assets/sketches/rongheng-portrait.webp',
      recommended: false,
      stats: { qi: 2, jiao: 3, wang: 2, xue: 5 }
    },
    {
      key: 'free',
      num: '肆',
      name: '自 由 書 記',
      en: 'The Drifting Brush',
      routeLine: '穿行各城，連結事件與人物線索',
      bio: '不屬於任何人，因此得以看見所有人。你遊走於官邸、課室、衙門之間，見證這三十年——但沒有人為你負責。',
      tags: ['自由探索'],
      ability: {
        axes: ['器物：從現場觀察所得', '外交：靠人脈與消息', '聲望：無派系，也少庇護', '西學：可自由補足'],
        risk: '自由帶來視野，也帶來孤立。'
      },
      difficulty: 0,
      meta: '時長不定 · 城市不限',
      portrait: 'assets/sketches/free-portrait.webp',
      recommended: false,
      isFree: true,
      stats: { qi: 2, jiao: 2, wang: 2, xue: 2 }   // 均衡低值，象徵「無定形」
    }
  ];

  // ---------- Screen 2 旋轉木馬 · 渲染 ----------
  const s2Stage  = document.getElementById('s2cStage');
  const s2Dots   = document.getElementById('s2cDots');
  const s2Prev   = document.getElementById('s2cPrev');
  const s2Next   = document.getElementById('s2cNext');
  const s2Bar    = document.getElementById('s2ConfirmBar');
  const s2BarName= document.getElementById('s2cbName');
  const s2BarBtn = document.getElementById('s2cbStart');

  let s2CurIdx = 0;
  let s2Chosen = null;       // 已選定的 route key（null = 未選）
  let s2Busy   = false;      // 過渡動畫進行中

  // —— 雷達圖 SVG 生成器 ——
  // stats: { qi(器物), jiao(外交), wang(聲望), xue(西學) }，每值 0–5
  function buildRadar(stats) {
    const cx = 80, cy = 80, maxR = 55, levels = 4;
    const axes = [
      { key: 'qi',   label: '器', angle: -Math.PI / 2 },  // top
      { key: 'jiao', label: '交', angle: 0 },              // right
      { key: 'wang', label: '望', angle: Math.PI / 2 },    // bottom
      { key: 'xue',  label: '學', angle: Math.PI },        // left
    ];

    // 背景網格（四個菱形）
    let gridPolys = '';
    for (let l = levels; l >= 1; l--) {
      const r = (l / levels) * maxR;
      const pts = axes.map(a =>
        `${(cx + r * Math.cos(a.angle)).toFixed(2)},${(cy + r * Math.sin(a.angle)).toFixed(2)}`
      ).join(' ');
      gridPolys += `<polygon class="radar-grid" points="${pts}"/>`;
    }

    // 軸線
    const axisLines = axes.map(a => {
      const x2 = (cx + maxR * Math.cos(a.angle)).toFixed(2);
      const y2 = (cy + maxR * Math.sin(a.angle)).toFixed(2);
      return `<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}"/>`;
    }).join('');

    // 數據多邊形
    const dataPts = axes.map(a => {
      const v = Math.min(5, Math.max(0, stats[a.key] || 0));
      const r = (v / 5) * maxR;
      return `${(cx + r * Math.cos(a.angle)).toFixed(2)},${(cy + r * Math.sin(a.angle)).toFixed(2)}`;
    }).join(' ');
    const dataPoly = `<polygon class="radar-data" points="${dataPts}"/>`;

    // 軸端標籤（hover 時顯示）
    const labelOffset = maxR + 14;
    const labels = axes.map(a => {
      const x = (cx + labelOffset * Math.cos(a.angle)).toFixed(2);
      const y = (cy + labelOffset * Math.sin(a.angle)).toFixed(2);
      const anchor = Math.abs(a.angle) < 0.1 ? 'start' : (Math.abs(a.angle - Math.PI) < 0.1 ? 'end' : 'middle');
      const dy = Math.abs(a.angle) < 0.1 || Math.abs(a.angle - Math.PI) < 0.1 ? '0.35em' :
                 (a.angle > 0 ? '0.8em' : '0em');
      return `<text class="radar-label" x="${x}" y="${y}" text-anchor="${anchor}" dy="${dy}">${a.label}</text>`;
    }).join('');

    return `<svg class="s2c-radar-svg" viewBox="0 0 160 160" aria-hidden="true">${gridPolys}${axisLines}${dataPoly}${labels}</svg>`;
  }

  function buildAbilityPanel(c) {
    const ability = c.ability || {};
    const axes = (ability.axes || []).map(t => {
      const [label, ...rest] = t.split('：');
      const desc = rest.join('：');
      return `<li><span>${label || ''}</span><em>${desc || ''}</em></li>`;
    }).join('');
    return `
      <div class="s2c-ability-panel" aria-hidden="true">
        <div class="s2c-ability-head">
          <span class="s2c-ability-kicker">${c.num} · 稟 賦</span>
        </div>
        <div class="s2c-ability-radar">${buildRadar(c.stats || {})}</div>
        <ul class="s2c-ability-list">${axes}</ul>
        <p class="s2c-ability-risk">${ability.risk || ''}</p>
        <p class="s2c-ability-note">＊此為路線稟賦，僅示人物特質；遊戲中另計「見識」三軸（器物・制度・思想）。</p>
      </div>
    `;
  }

  // ── 路線漸進解鎖：李鴻章預設開放，逐步完成後揭示其餘 ──
  const ROUTES_DONE_KEY = 'tansuo_routes_done_v1';
  function loadRoutesDone() {
    try { return JSON.parse(localStorage.getItem(ROUTES_DONE_KEY)) || []; } catch (e) { return []; }
  }
  function markRouteDone(r) {
    try { const d = loadRoutesDone(); if (r && d.indexOf(r) === -1) { d.push(r); localStorage.setItem(ROUTES_DONE_KEY, JSON.stringify(d)); } } catch (e) {}
  }
  const ROUTE_UNLOCK = {
    lihongzhang: () => true,
    yixin:       () => loadRoutesDone().length >= 1,
    rongheng:    () => loadRoutesDone().length >= 2,
    free:        () => loadRoutesDone().length >= 3
  };
  const ROUTE_UNLOCK_HINT = {
    yixin:    '完 成 一 局 後 解 鎖',
    rongheng: '完 成 兩 條 路 線 後 解 鎖',
    free:     '完 成 三 條 路 線 後 解 鎖'
  };
  function routeUnlocked(key) { try { return (ROUTE_UNLOCK[key] || (() => true))(); } catch (e) { return true; } }
  // 測試用：解鎖全部路線
  window.__unlockRoutes = () => { try { localStorage.setItem(ROUTES_DONE_KEY, JSON.stringify(['lihongzhang', 'yixin', 'rongheng', 'free'])); } catch (e) {} location.reload(); };

  function renderCarousel() {
    if (!s2Stage || !s2Dots) return;
    s2Stage.innerHTML = '';
    s2Dots.innerHTML  = '';
    CAROUSEL_DATA.forEach((c, i) => {
      // slide
      const unlocked = routeUnlocked(c.key);
      const slide = document.createElement('article');
      slide.className = 's2c-slide' + (i === 0 ? ' is-active' : '') + (c.isFree ? ' is-free' : '') + (unlocked ? '' : ' is-locked');
      slide.dataset.routeKey = c.key;

      const starsHtml = c.difficulty > 0
        ? `<span class="s2c-stars" aria-label="難度 ${c.difficulty}">${'★'.repeat(c.difficulty)}${'☆'.repeat(5 - c.difficulty)}</span>`
        : '';
      const recBadge = c.recommended
        ? `<span class="s2c-rec">✦ 首 卷 路 線</span>`
        : '';
      const tagsHtml = c.tags.map(t => `<span class="s2c-tag">${t}</span>`).join('');
      const portraitHtml = `<img class="s2c-portrait" src="${c.portrait}" alt="" aria-hidden="true" draggable="false">`;
      const abilityHtml = buildAbilityPanel(c);

      slide.innerHTML = `
        <div class="s2c-portrait-wrap" aria-hidden="true">
          <div class="s2c-portrait-card">
            <div class="s2c-portrait-face">
              ${portraitHtml}
              <span class="s2c-flip-hint">能力</span>
            </div>
            ${abilityHtml}
          </div>
        </div>
        <div class="s2c-overlay"></div>
        <span class="s2c-bgnum" aria-hidden="true">${c.num}</span>
        <div class="s2c-text">
          ${recBadge}
          <span class="s2c-num">${c.num}</span>
          <h3 class="s2c-name">${c.name}</h3>
          <p class="s2c-route-line">${c.routeLine || ''}</p>
          <span class="s2c-line"></span>
          <p class="s2c-bio">${c.bio}</p>
          <div class="s2c-tags">${tagsHtml}${starsHtml}</div>
          ${unlocked
            ? `<button class="s2c-cta" type="button" data-route="${c.key}">
            <span class="s2c-cta-label">擇 此 人 物</span>
            <span class="s2c-cta-arrow">→</span>
          </button>`
            : `<div class="s2c-locked-cta"><span class="s2c-lock-seal">鎖</span><span class="s2c-lock-hint">${ROUTE_UNLOCK_HINT[c.key] || '尚 未 解 鎖'}</span></div>`}
        </div>
      `;
      s2Stage.appendChild(slide);

      // dot
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 's2c-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `第 ${i + 1} 位見證者`);
      dot.dataset.idx = i;
      s2Dots.appendChild(dot);
    });
  }

  function s2Goto(nextIdx) {
    if (s2Busy) return;
    const total = CAROUSEL_DATA.length;
    const idx = ((nextIdx % total) + total) % total;
    if (idx === s2CurIdx) return;
    s2Busy = true;

    const slides = s2Stage.querySelectorAll('.s2c-slide');
    const dots   = s2Dots.querySelectorAll('.s2c-dot');
    slides.forEach(s => {
      s.classList.remove('is-flipped');
    });
    slides[s2CurIdx]?.classList.remove('is-active');
    dots[s2CurIdx]?.classList.remove('is-active');
    slides[idx]?.classList.add('is-active');
    dots[idx]?.classList.add('is-active');
    s2CurIdx = idx;

    setTimeout(() => { s2Busy = false; }, 620);
  }

  function s2Bind() {
    s2Prev?.addEventListener('click', () => s2Goto(s2CurIdx - 1));
    s2Next?.addEventListener('click', () => s2Goto(s2CurIdx + 1));
    s2Dots?.addEventListener('click', (e) => {
      const dot = e.target.closest('.s2c-dot');
      if (!dot) return;
      s2Goto(Number(dot.dataset.idx));
    });
    // 鍵盤
    document.addEventListener('keydown', (e) => {
      if (document.getElementById('screen2')?.getAttribute('aria-hidden') !== 'false') return;
      if (e.key === 'ArrowLeft')  s2Goto(s2CurIdx - 1);
      if (e.key === 'ArrowRight') s2Goto(s2CurIdx + 1);
    });
    // 手機 swipe
    let touchX = 0;
    s2Stage?.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
    s2Stage?.addEventListener('touchend',   (e) => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) s2Goto(s2CurIdx + (dx < 0 ? 1 : -1));
    }, { passive: true });
    // 選擇路線（CTA 點擊）—— 兩段式：is-chosen 為真時直接啟程
    s2Stage?.addEventListener('click', (e) => {
      const portrait = e.target.closest('.s2c-portrait-wrap');
      if (portrait) return;
      const btn = e.target.closest('.s2c-cta');
      if (!btn || btn.disabled) return;
      const route = btn.dataset.route;
      if (!route) return;
      if (btn.classList.contains('is-chosen')) {
        // 第二段：啟程 → D 過場 → 地圖
        console.log('[s2] embark →', route);
        btn.disabled = true;
        showCutscene(route);
      } else {
        // 第一段：選定
        console.log('[s2] choose →', route);
        s2Choose(route);
      }
    });
    s2Stage?.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const portrait = e.target.closest('.s2c-portrait-wrap');
      if (!portrait) return;
      e.preventDefault();
    });
    // 啟程（底欄按鈕同樣走 D 過場）
    s2BarBtn?.addEventListener('click', () => {
      if (!s2Chosen) return;
      s2BarBtn.disabled = true;
      showCutscene(s2Chosen);
    });
  }

  function s2Choose(routeKey) {
    // 第一段：選定此人物（第二段由 click handler 直接走 gotoMap）
    s2Chosen = routeKey;
    s2Stage?.querySelectorAll('.s2c-cta').forEach((b) => {
      const isThis = b.dataset.route === routeKey;
      b.classList.toggle('is-chosen', isThis);
      b.disabled = false;
      const label = b.querySelector('.s2c-cta-label');
      if (label) label.textContent = isThis ? '啟 程 入 局' : '擇 此 人 物';
      // 選中時清空箭嘴文字，確保任何字型都不會顯示 →；未選中則還原
      const arrow = b.querySelector('.s2c-cta-arrow');
      if (arrow) {
        arrow.textContent = isThis ? '' : '→';
        arrow.style.removeProperty('display');
      }
    });
  }

  renderCarousel();
  s2Bind();

  // ---------- 6. 啟程 → 入職過場 → 九州地圖 ----------
  // 城市座標對應 SVG viewBox 1600x1000，校準至新底圖
  // PEKING 832,300 · NANKING 990,470 · SHANGHAI 1015,510
  // FOOCHOW 990,625 · CANTON 745,725 · SEOUL 1240,305 · EDO 1480,410
  const ROUTE_MAP_DATA = {
    lihongzhang: {
      name: '你 — 李 鴻 章',
      quote: '自上海煙囪起筆',
      hud:  '李 鴻 章 · 淮 軍 餘 暉',
      city: { x: 1018, y: 510, label: '上海' }
    },
    rongheng: {
      name: '你 — 容　閎',
      quote: '三十童子尚未啟航',
      hud:  '容 　 閎 · 留 學 夢 碎',
      city: { x: 770, y: 745, label: '香港' }
    },
    yixin: {
      name: '你 — 恭 親 王',
      quote: '京師甫定，朝堂未穩',
      hud:  '奕 　 訢 · 總 理 風 雲',
      city: { x: 832, y: 300, label: '北京' }
    },
    free: {
      name: '你 — 無名書記',
      quote: '從廢墟之中提筆',
      hud:  '自 由 書 記 · 遊 幕 之 客',
      city: { x: 832, y: 300, label: '北京' }
    }
  };

  function spawnAsh() {
    const container = document.getElementById('ashParticles');
    if (!container) return;
    container.innerHTML = '';
    const N = 64;
    for (let i = 0; i < N; i++) {
      const p = document.createElement('span');
      p.className = 'ash-particle';
      p.style.left = `${Math.random() * 100}%`;
      p.style.setProperty('--size', `${1 + Math.random() * 2.5}px`);
      p.style.setProperty('--drift', `${(Math.random() - 0.5) * 100}px`);
      p.style.animationDelay = `${Math.random() * 1.2}s`;
      p.style.animationDuration = `${2.2 + Math.random() * 2.4}s`;
      container.appendChild(p);
    }
  }

  function setPhase(n) {
    const s3 = document.getElementById('screen3');
    if (s3) s3.dataset.phase = String(n);
  }

  // ---------- D 過場：啟程後，gotoMap 前的歷史背景過場 ----------
  // 人物第四頁資料
  const CS_CHAR_DATA = {
    lihongzhang: {
      portrait: 'assets/sketches/lihongzhang-portrait.webp',
      name:     '李 鴻 章',
      quote:    '「中國文武制度，事事遠出西人之上，獨火器萬不能及。」',
      source:   '李鴻章〈致總理衙門書〉· 1864',
      begin:    '江 南 煙 囪 初 起，船 炮 可 造；更 難 造 的，是 一 個 肯 變 的 朝 局。'
    },
    yixin: {
      portrait: 'assets/sketches/yixin-portrait.webp',
      name:     '恭 親 王',
      quote:    '「髮捻交乘，心腹之害也；俄國……肘腋之憂也；英國……肢體之患也。」',
      source:   '奕訢〈統籌全局摺〉· 1861',
      begin:    '我 將 立 於 朝 堂 風 暴 之 中 ， 於 妥 協 間 為 變 法 求 一 線 。'
    },
    rongheng: {
      portrait: 'assets/sketches/rongheng-portrait.webp',
      name:     '容 　 閎',
      quote:    '「予既身受文明教育之益，當使後我之人，亦享此同等之利益。」',
      source:   '容閎《西學東漸記》',
      begin:    '我 將 把 幼 童 送 向 遠 洋 ， 以 新 學 換 一 個 未 來 。'
    },
    free: {
      portrait: 'assets/sketches/free-portrait.webp',
      name:     '自 由 書 記',
      quote:    '「我不屬於任何派系，所以哪裡都去得。這三十年的成敗，我要親眼看個明白。」',
      source:   '',
      begin:    '我 將 行 走 於 九 州 各 城 ， 親 手 拼 起 這 三 十 年 。'
    }
  };

  function showCutscene(route) {
    const cs = document.getElementById('cutscene');
    // 過場元素不存在時直接進入地圖（保全性回退）
    if (!cs) { gotoMap(route); return; }
    cs.dataset.route = route || 'free';

    // 注入第四頁人物資料
    const char = CS_CHAR_DATA[route] || {};
    const portrait  = document.getElementById('csPortrait');
    const charName  = document.getElementById('csCharName');
    const charQuote = document.getElementById('csCharQuote');
    const charSource = document.getElementById('csCharSource');
    const charBegin = document.getElementById('csCharBegin');
    if (portrait) { portrait.src = char.portrait || ''; portrait.alt = char.name || ''; }
    if (charName)  charName.textContent  = char.name  || '';
    if (charQuote) charQuote.textContent = char.quote || '';
    if (charSource) {
      charSource.textContent = char.source || '';
      charSource.style.display = char.source ? '' : 'none';
    }
    if (charBegin) charBegin.textContent = char.begin || '';

    // 重置至第一頁
    let currentPage = 1;
    cs.querySelectorAll('.cs-page').forEach(p => p.classList.remove('is-active'));
    cs.querySelectorAll('.cs-dot').forEach(d => d.classList.remove('is-active'));
    const firstPage = cs.querySelector('.cs-page[data-page="1"]');
    const firstDot  = cs.querySelector('.cs-dot[data-dot="1"]');
    if (firstPage) firstPage.classList.add('is-active');
    if (firstDot)  firstDot.classList.add('is-active');

    // 顯示過場
    cs.setAttribute('aria-hidden', 'false');
    cs.classList.add('is-visible');

    function goToPage(n) {
      currentPage = n;
      cs.querySelectorAll('.cs-page').forEach(p =>
        p.classList.toggle('is-active', parseInt(p.dataset.page, 10) === n)
      );
      cs.querySelectorAll('.cs-dot').forEach(d =>
        d.classList.toggle('is-active', parseInt(d.dataset.dot, 10) === n)
      );
      const lbl = document.getElementById('csNextLabel');
      if (lbl) lbl.textContent = n === 4 ? '啟 程' : '繼 續';
    }

    function endCutscene() {
      setPhase(1);
      document.getElementById('screen2')?.setAttribute('aria-hidden', 'true');
      document.getElementById('screen3')?.setAttribute('aria-hidden', 'false');
      stage?.classList.remove('is-on-selection');
      stage?.classList.add('is-on-map');
      cs.classList.add('is-handoff');
      cs.classList.remove('is-visible');
      cs.setAttribute('aria-hidden', 'true');
      nextBtn.removeEventListener('click', onNext);
      skipBtn?.removeEventListener('click', onSkip);
      document.removeEventListener('keydown', onKey);
      // 短暫淡出後進入地圖
      setTimeout(() => {
        cs.classList.remove('is-handoff');
        gotoMap(route);
      }, 320);
    }

    function onNext() { currentPage < 4 ? goToPage(currentPage + 1) : endCutscene(); }
    function onSkip() { endCutscene(); }
    function onKey(e) {
      if (e.key === 'ArrowRight' || e.key === 'Enter') onNext();
    }

    const nextBtn = document.getElementById('csNext');
    const skipBtn = document.getElementById('csSkip');
    nextBtn?.addEventListener('click', onNext);
    skipBtn?.addEventListener('click', onSkip);
    document.addEventListener('keydown', onKey);
  }

  function gotoMap(route) {
    const data = ROUTE_MAP_DATA[route];
    if (!data) return;
    const s3 = document.getElementById('screen3');
    if (!s3 || !stage) return;

    // 注入路線資料
    const nameEl = document.getElementById('confirmName');
    const quoteEl = document.getElementById('confirmQuote');
    const pulseEl = document.getElementById('cityPulse');
    const hudYear = document.getElementById('mapYearHud');
    const hudRoute = document.getElementById('mapRouteName');
    if (nameEl) nameEl.textContent = data.name;
    if (quoteEl) quoteEl.textContent = data.quote;
    if (pulseEl) pulseEl.setAttribute('transform', `translate(${data.city.x} ${data.city.y})`);
    if (hudYear) hudYear.textContent = '1861';
    if (hudRoute) hudRoute.textContent = data.hud;

    // 進入 Screen 3
    document.getElementById('screen2')?.setAttribute('aria-hidden', 'true');
    s3.setAttribute('aria-hidden', 'false');
    stage.classList.remove('is-on-selection');
    stage.classList.add('is-on-map');

    // 先判定新局／續局
    const save = (typeof loadGame === 'function') ? loadGame() : null;
    const isNewGame = !(save && save.route === route);

    // 入職過場序列（領命後才開始）
    const runEntry = () => {
      settled = false;  // 新局／續局重置結算旗標
      setPhase(1);                                              //  0.0s  離場 + 暗幕
      setTimeout(() => { spawnAsh(); setPhase(2); },  800);     //  0.8s  灰燼升起
      setTimeout(() => setPhase(3),                  1800);     //  1.8s  路線確認
      setTimeout(() => setPhase(4),                  3000);     //  3.0s  年份鎖定
      setTimeout(() => setPhase(5),                  3800);     //  3.8s  地圖出霧
      setTimeout(() => {
        setPhase(6);
        if (isNewGame) { if (save) clearSave(); resetGameState(route); }
        else { applySave(save); }
        window.__yangwuResearch?.logSessionStart({
          routeId: route,
          isNewGame,
          year: gameState.currentYear,
          season: gameState.currentSeason
        });
        if (typeof window.__initMapUI === 'function') window.__initMapUI(route);
      }, 5300);                                                 //  5.3s  起點脈衝 + UI
    };

    // 新局／續局：人物過場結束後直接揭示入場，避免重複任務說明。
    runEntry();
  }

  // ---------- 6b. 城市資料（座標對應 SVG viewBox 1600x1000） ----------
  const CITIES = {
    beijing:    { x: 551,  y: 191, name: '北 京', en: 'Peking' },
    tianjin:    { x: 601,  y: 247, name: '天 津', en: 'Tianjin' },
    kaiping:    { x: 636,  y: 203, name: '開 平', en: 'Kaiping' },
    weihaiwei:  { x: 748,  y: 288, name: '威 海', en: 'Weihai' },
    nanjing:    { x: 688,  y: 470, name: '南 京', en: 'Nanking' },
    shanghai:   { x: 740,  y: 502, name: '上 海', en: 'Shanghai' },
    wuhan:      { x: 511,  y: 480, name: '武 漢', en: 'Wuhan' },
    fuzhou:     { x: 660,  y: 657, name: '福 州', en: 'Foochow' },
    guangzhou:  { x: 516,  y: 774, name: '廣 州', en: 'Canton' },
    hongkong:   { x: 530,  y: 803, name: '香 港', en: 'Hong Kong' },
    korea:      { x: 853,  y: 220, name: '朝 鮮', en: 'Korea' },
    japan:      { x: 1250, y: 443, name: '日 本', en: 'Japan' }
  };

  // 城市一句簡介（hover 展品標籤卡用）
  const CITY_DESC = {
    beijing:   '總理衙門與同文館 · 洋務中樞',
    tianjin:   '北洋重鎮 · 機器、電報與水師',
    kaiping:   '開平煤礦 · 唐胥鐵路之始',
    weihaiwei: '北洋水師基地 · 海防鎖鑰',
    nanjing:   '兩江總督駐節 · 金陵製造',
    shanghai:  '江南製造總局 · 通商首埠',
    wuhan:     '漢陽鐵廠 · 湖廣自強',
    fuzhou:    '福州船政 · 閩海籌艦',
    guangzhou: '通商舊口 · 中西交匯',
    hongkong:  '西學之窗 · 留學之議',
    korea:     '朝鮮風雲 · 宗藩與東學',
    japan:     '明治維新 · 強弱之鏡'
  };

  // 各路線初始可用城市 / 解鎖年份
  const ROUTE_CITY_UNLOCK = {
    lihongzhang: { shanghai: 1860, nanjing: 1860, guangzhou: 1860, fuzhou: 1860, beijing: 1860, tianjin: 1866, kaiping: 1877, weihaiwei: 1886, wuhan: 1889, hongkong: 1860, japan: 1888, korea: 1890 },
    rongheng:    { hongkong: 1860, shanghai: 1860, nanjing: 1860, beijing: 1860, guangzhou: 1860, fuzhou: 1860, tianjin: 1866, weihaiwei: 1886, japan: 1888, korea: 1890 },
    yixin:       { beijing: 1860, tianjin: 1860, shanghai: 1860, nanjing: 1860, fuzhou: 1860, guangzhou: 1860, kaiping: 1877, weihaiwei: 1886, wuhan: 1889, hongkong: 1860, japan: 1888, korea: 1890 },
    free:        { beijing: 1860, tianjin: 1866, shanghai: 1860, nanjing: 1860, fuzhou: 1860, guangzhou: 1860, kaiping: 1877, weihaiwei: 1886, wuhan: 1889, hongkong: 1860, japan: 1888, korea: 1890 }
  };

  // ---------- 6c. 鐵釘事件清單（李鴻章 + 通用） ----------
  const PINNED_EVENTS = [
    { year: 1860, name: '圓 明 園',  poetic: '北方烽火',   ganzhi: '庚申', city: 'beijing' },
    { year: 1861, name: '總理衙門',  poetic: '外間有衙',   ganzhi: '辛酉', city: 'beijing' },
    { year: 1862, name: '同 文 館',  poetic: '異字將譯',   ganzhi: '壬戌', city: 'beijing' },
    { year: 1865, name: '江南製造',  poetic: '機巧待興',   ganzhi: '乙丑', city: 'shanghai' },
    { year: 1866, name: '福州船政',  poetic: '閩海籌艦',   ganzhi: '丙寅', city: 'fuzhou' },
    { year: 1870, name: '天津教案',  poetic: '津門火起',   ganzhi: '庚午', city: 'tianjin' },
    { year: 1872, name: '留美學童',  poetic: '彼岸有信',   ganzhi: '壬申', city: 'shanghai' },
    { year: 1873, name: '輪船招商',  poetic: '商旗競渡',   ganzhi: '癸酉', city: 'shanghai' },
    { year: 1874, name: '日本侵台',  poetic: '東瀛異動',   ganzhi: '甲戌', city: 'fuzhou' },
    { year: 1875, name: '海防籌議',  poetic: '海塞之爭',   ganzhi: '乙亥', city: 'beijing' },
    { year: 1881, name: '留美撤回',  poetic: '童子歸來',   ganzhi: '辛巳', city: 'shanghai' },
    { year: 1882, name: '機器織布',  poetic: '機杼抗洋',   ganzhi: '壬午', city: 'shanghai' },
    { year: 1884, name: '馬江海戰',  poetic: '煙起閩江',   ganzhi: '甲申', city: 'fuzhou' },
    { year: 1888, name: '北洋成軍',  poetic: '北洋將齊',   ganzhi: '戊子', city: 'weihaiwei' },
    { year: 1894, name: '黃海海戰',  poetic: '甲午秋風',   ganzhi: '甲午', city: 'weihaiwei' },
    { year: 1895, name: '馬關條約',  poetic: '春帆樓上',   ganzhi: '乙未', city: 'shanghai' }
  ];

  function eventState(eventYear, currentYear) {
    if (eventYear < currentYear) return 'witnessed';
    if (eventYear === currentYear) return 'current';
    if (eventYear - currentYear <= 3) return 'coming';
    return 'distant';
  }

  function renderEventsList(currentYear) {
    const ul = document.getElementById('eventsList');
    if (!ul) return;
    ul.innerHTML = '';
    PINNED_EVENTS.forEach((ev) => {
      let st = eventState(ev.year, currentYear);
      // 只有「已接線」的鐵釘才能顯示為「正在發生 ◉」；未接線者最多到 coming
      const wired = !!PINNED_BY_YEAR[ev.year];
      if (wired && gameState.completedEvents.has(PINNED_BY_YEAR[ev.year])) st = 'witnessed';
      if (st === 'current' && !wired) st = 'coming';
      const li = document.createElement('li');
      li.className = 'is-' + st;
      let mark = '○', label = '', yearTxt = String(ev.year);
      let cityTag = '';
      if (st === 'witnessed') { mark = '✓'; label = ev.name; }
      else if (st === 'current') { mark = '◉'; label = ev.name; cityTag = (CITIES[ev.city]?.name || '').replace(/\s+/g, ''); }
      else if (st === 'coming') { mark = '·'; label = '「' + ev.poetic + '」'; if (wired) cityTag = (CITIES[ev.city]?.name || '').replace(/\s+/g, ''); }
      else { mark = '?'; label = '待至 ' + ev.ganzhi + ' 之年'; yearTxt = '——'; }
      li.innerHTML =
        '<span class="ev-mark">' + mark + '</span>' +
        '<span class="ev-year">' + yearTxt + '</span>' +
        '<span class="ev-name">' + label + '</span>' +
        (cityTag ? '<span class="ev-city">' + cityTag + '</span>' : '');
      ul.appendChild(li);
    });
  }

  // 城市是否「尚有可為之事」（有未完成、且年代已到的探訪事件）
  // 某城某 actionEvent 是否仍為「待探線索」：未完成、已登場、非鐵釘，
  // 且其對應熱點證據尚未全部收錄（已收錄＝該地線索已探完，不再計數）。
  function isCityClueOpen(cityKey, id, scene) {
    const ev = EVENTS[id];
    if (!ev || ev.type === 'pinned') return false;
    if (gameState.completedEvents.has(id)) return false;
    if ((ev.appearFromYear || 0) > gameState.currentYear) return false;
    const hsList = eventEvidenceHotspots(id, scene);
    if (hsList.length && hsList.every((hs) =>
      collectedEvidence.has(evidenceKey(cityKey, hs.id)) || isEvidenceTaskDone(cityKey, hs.id)
    )) return false;
    return true;
  }

  function cityHasContent(cityKey) {
    const scene = CITY_SCENES[cityKey];
    if (!scene) return false;
    return (scene.actionEvents || []).some((id) => isCityClueOpen(cityKey, id, scene));
  }

  function cityScenePlayable(scene) {
    if (!scene) return false;
    return !!(
      (scene.hotspots && scene.hotspots.length) ||
      (scene.actionEvents && scene.actionEvents.length) ||
      (scene.facilities && scene.facilities.length)
    );
  }

  // ---------- 6d. 城市印章標籤（SVG 生成） ----------
  function renderCitySeals(route, currentYear, currentCityKey) {
    const g = document.getElementById('citySeals');
    if (!g) return;
    g.innerHTML = '';
    const unlocks = ROUTE_CITY_UNLOCK[route] || ROUTE_CITY_UNLOCK.free;
    const SVG_NS = 'http://www.w3.org/2000/svg';
    Object.keys(CITIES).forEach((key) => {
      const c = CITIES[key];
      const unlockYear = unlocks[key];
      if (unlockYear === undefined) return;  // 此路線不顯示
      const isCurrent = (key === currentCityKey);
      const isLocked  = (currentYear < unlockYear);
      const isUnreleased = !cityScenePlayable(CITY_SCENES[key]);
      const hasContent = !isLocked && !isCurrent && cityHasContent(key);
      const isTarget = !isLocked && !isCurrent && gameState.mainlineTargetCity === key;
      const isVisited = !isCurrent && (gameState.citiesVisited || []).indexOf(key) > -1;
      const actionable = !isLocked && !isCurrent && (hasContent || isTarget);

      const group = document.createElementNS(SVG_NS, 'g');
      group.setAttribute('class',
        'city-seal' +
        (isCurrent ? ' city-seal--current' : '') +
        (isLocked ? ' city-seal--locked' : '') +
        (isUnreleased ? ' city-seal--unreleased' : '') +
        (hasContent ? ' city-seal--hascontent' : '') +
        (isVisited ? ' city-seal--visited' : '') +
        (isTarget ? ' city-seal--target' : '')
      );
      group.setAttribute('transform', `translate(${c.x} ${c.y})`);
      group.dataset.cityKey = key;
      group.style.pointerEvents = isLocked ? 'auto' : 'auto';   // 鎖城亦可 hover 看「待 年份」

      // 可前往城：朱印呼吸脈動環（置於最底層）
      if (actionable) {
        const ring = document.createElementNS(SVG_NS, 'circle');
        ring.setAttribute('class', 'city-seal-pulse');
        ring.setAttribute('cx', 0);
        ring.setAttribute('cy', 16);
        ring.setAttribute('r', 14);
        group.appendChild(ring);
      }

      if (hasContent) {
        const dot = document.createElementNS(SVG_NS, 'circle');
        dot.setAttribute('class', 'city-seal-mark');
        dot.setAttribute('cx', (c.name.length > 3 ? 22 : 18) + 4);
        dot.setAttribute('cy', 9);
        dot.setAttribute('r', 2.4);
        group.appendChild(dot);
      }

      const w = c.name.length > 3 ? 44 : 36;
      const h = 16;
      const rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('class', 'city-seal-box');
      rect.setAttribute('x', -w/2);
      rect.setAttribute('y', 8);
      rect.setAttribute('width', w);
      rect.setAttribute('height', h);
      rect.setAttribute('rx', '1');
      group.appendChild(rect);

      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('class', 'city-seal-text');
      text.setAttribute('x', 0);
      text.setAttribute('y', 16);
      text.textContent = c.name;
      group.appendChild(text);

      // 未解鎖城：標示「待 年份」，讓玩家一開始就看見整段旅程的版圖
      if (isLocked) {
        const wait = document.createElementNS(SVG_NS, 'text');
        wait.setAttribute('class', 'city-seal-wait');
        wait.setAttribute('x', 0);
        wait.setAttribute('y', 30);
        wait.textContent = '待 ' + unlockYear;
        group.appendChild(wait);
      }

      if (!isLocked) group.addEventListener('click', () => onCityClick(key));
      group.addEventListener('mouseenter', () => showCityHoverCard(key, group, { locked: isLocked, current: isCurrent, visited: isVisited, actionable: actionable, unlockYear: unlockYear }));
      group.addEventListener('mouseleave', hideCityHoverCard);
      g.appendChild(group);
    });
    renderJourneyLine(route);
  }

  // ---------- 旅程線：水墨筆觸串連走過的城 ----------
  function renderJourneyLine(route) {
    const g = document.getElementById('journeyLine');
    if (!g) return;
    g.innerHTML = '';
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const visited = (gameState.citiesVisited || []).filter((k) => CITIES[k]);
    if (visited.length < 2) return;
    const pts = visited.map((k) => ({ x: CITIES[k].x, y: CITIES[k].y + 16 }));
    // 以二次貝茲略帶弧度，模擬手繪筆觸
    let d = 'M ' + pts[0].x + ' ' + pts[0].y;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - Math.hypot(b.x - a.x, b.y - a.y) * 0.08;
      d += ' Q ' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + b.x + ' ' + b.y;
    }
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('class', 'journey-path');
    path.setAttribute('d', d);
    g.appendChild(path);
    // 落點金珠（不含最後一點，最後一點為當前城，由 cityPulse 表示）
    pts.forEach((p, i) => {
      const dot = document.createElementNS(SVG_NS, 'circle');
      dot.setAttribute('class', 'journey-dot');
      dot.setAttribute('cx', p.x);
      dot.setAttribute('cy', p.y);
      dot.setAttribute('r', i === pts.length - 1 ? 3.4 : 2.6);
      g.appendChild(dot);
    });
  }

  // ---------- 城市 hover 展品標籤卡 ----------
  let hoverCardHideTimer = null;
  function showCityHoverCard(key, group, st) {
    const card = document.getElementById('cityHoverCard');
    const c = CITIES[key];
    if (!card || !c) return;
    if (hoverCardHideTimer) { clearTimeout(hoverCardHideTimer); hoverCardHideTimer = null; }
    const nameEl = document.getElementById('chcName');
    const descEl = document.getElementById('chcDesc');
    const statusEl = document.getElementById('chcStatus');
    if (nameEl) nameEl.textContent = c.name;
    if (descEl) descEl.textContent = CITY_DESC[key] || '';
    // 簡化：只留地名＋一句介紹；唯「未解鎖」城仍提示開放年份（其餘狀態靠節點視覺表達）
    if (statusEl) {
      if (st.locked) { statusEl.textContent = '待 ' + (st.unlockYear || '') + ' 年 開 放'; statusEl.className = 'chc-status is-locked'; statusEl.hidden = false; }
      else { statusEl.textContent = ''; statusEl.hidden = true; }
    }
    // 用實際渲染的 bounding box 定位（涵蓋所有 transform/縮放，最穩）
    const r = group.getBoundingClientRect();
    card.style.left = (r.left + r.width / 2) + 'px';
    card.style.top = r.top + 'px';
    card.setAttribute('aria-hidden', 'false');
    card.classList.add('is-on');
  }
  function hideCityHoverCard() {
    const card = document.getElementById('cityHoverCard');
    if (!card) return;
    hoverCardHideTimer = setTimeout(() => {
      card.classList.remove('is-on');
      card.setAttribute('aria-hidden', 'true');
    }, 80);
  }

  function onCityClick(cityKey) {
    const c = CITIES[cityKey];
    const scene = CITY_SCENES[cityKey];
    if (!c) return;
    // 進城前立即收起 hover 展品卡，免得卡在城市場景上
    if (hoverCardHideTimer) { clearTimeout(hoverCardHideTimer); hoverCardHideTimer = null; }
    const _hc = document.getElementById('cityHoverCard');
    if (_hc) { _hc.classList.remove('is-on'); _hc.setAttribute('aria-hidden', 'true'); }
    // #8 歷史召喚鎖定：召喚未了時，只准前往指定城，其餘城不可往
    if (gameState.locked && gameState.pendingPinnedCity && cityKey !== gameState.pendingPinnedCity) {
      const target = (CITIES[gameState.pendingPinnedCity]?.name || gameState.pendingPinnedCity).replace(/\s+/g, '');
      flashHint('歷 史 召 喚 未 了 · 須 先 前 往 ' + target);
      return;
    }
    if (!scene) {
      flashHint(`${c.name} 場景尚未開放`);
      return;
    }
    if (!cityScenePlayable(scene)) {
      flashHint(`${c.name} 卷 宗 尚 未 開 放 · 請 先 前 往 上 海、北 京 或 福 州`);
      return;
    }
    // 跨城移動消耗時間（以季為單位；同城重訪免費）
    const isCrossCity = (gameState.currentCity !== cityKey);
    let travelSeasons = 0;
    if (isCrossCity) {
      travelSeasons = cityTravelCost(gameState.currentCity, cityKey);
      advanceSeason(travelSeasons, { silent: true });  // 不播全屏季節轉場，改由進城 loader 顯示
    }
    openCityScene(cityKey, c, scene, travelSeasons);
    if (gameState.mainlineTargetCity === cityKey) {
      gameState.mainlineTargetCity = null;
      if (currentRoute) renderCitySeals(currentRoute, gameState.currentYear, gameState.currentCity);
      saveGame();
    }
  }

  // 移動成本：以地圖座標距離估算，鄰近 1 季，中距 2 季，遠程 3 季，極遠 4 季。
  function cityTravelCost(fromKey, toKey) {
    const a = CITIES[fromKey], b = CITIES[toKey];
    if (!a || !b) return 1;
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    if (dist > 410) return 4;   // 遠程跨國（如 福州→北京 ≈421）＝整 1 年，免零頭一季空白
    if (dist > 300) return 3;
    if (dist > 160) return 2;
    return 1;
  }

  function flashHint(msg) {
    const hint = document.getElementById('topbarHint');
    if (!hint) return;
    const original = hint.textContent;
    hint.textContent = msg;
    hint.style.color = 'rgba(232, 222, 202, 0.95)';
    setTimeout(() => {
      hint.textContent = original;
      hint.style.color = '';
    }, 2200);
  }

  // ---------- 6e. 章印面板開關 ----------
  function bindSealPanels() {
    document.querySelectorAll('.seal-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.panel;
        const panel = document.getElementById('panel-' + id);
        if (!panel) return;
        const isOpen = !panel.hasAttribute('hidden');
        closeManagedModals();
        closeSealPanels();
        // 切換目標
        if (!isOpen) {
          if (id === 'juan') renderJournalEvidence();
          panel.removeAttribute('hidden');
          btn.setAttribute('aria-pressed', 'true');
        }
      });
    });

    // 點面板背景或 ✕ 關閉
    document.querySelectorAll('.seal-panel').forEach((panel) => {
      panel.addEventListener('click', (e) => {
        if (e.target === panel || e.target.dataset.close !== undefined) {
          closeSealPanels();
        }
      });
    });

    // ESC 關閉
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSealPanels();
      }
    });
  }
  bindSealPanels();

  // ---------- 6f. 進入地圖時初始化 UI ----------
  function initMapUI(route) {
    // 從 gameState 讀取當前狀態（已由 applySave 或 resetGameState 設好）
    const currentYear = gameState.currentYear;
    const currentCity = gameState.currentCity || (ROUTE_START_CITY[route] || 'shanghai');

    // 旅程線起點：把起始城記為已踏訪（若尚未記錄）
    if (!gameState.citiesVisited) gameState.citiesVisited = [];
    if (currentCity && gameState.citiesVisited.indexOf(currentCity) === -1) {
      gameState.citiesVisited.push(currentCity);
    }

    // 同步當前城市印章位置（朱砂脈衝）
    const cityData = CITIES[currentCity];
    const pulseEl = document.getElementById('cityPulse');
    if (cityData && pulseEl) {
      pulseEl.setAttribute('transform', `translate(${cityData.x} ${cityData.y})`);
    }

    renderEventsList(currentYear);
    renderCitySeals(route, currentYear, currentCity);
    refreshTopbarYear();
    refreshAxes();
    renderResources();      // 四方阻力
    renderNetwork();        // 友 · 人物網絡
    updateGuidanceHint();   // 當前要務 + 目標城高亮

    // 新玩家引導：未做過任何事的話，顯示一次性引導 toast
    if (gameState.completedEvents.size === 0 && foundHotspots.size === 0) {
      showIntroHint();
    }
    renderJournalEvidence();
    // 進入地圖後，檢查是否有鐵釘待自動觸發（如 1860 圓明園 news 類型）
    setTimeout(() => checkAndTriggerPinned(false), 1200);
    // 新手引導（首玩自動）：待地圖過場完成（phase 6）後啟動
    maybeMapCoach();
    try { BGM.setScene('map'); } catch (e) {}
  }

  function showIntroHint() {
    const hint = document.getElementById('topbarHint');
    if (!hint) return;
    const original = hint.textContent;
    hint.textContent = '先 往 上 海 · 朱 砂 印 已 亮';
    hint.style.color = 'rgba(232, 222, 202, 0.98)';
    setTimeout(() => {
      hint.textContent = original;
      hint.style.color = '';
    }, 6000);
  }

  // ════════════ 新手引導 coachmark（首玩自動·可略過·可重看）════════════
  const COACH_MAP_KEY = 'tansuo_coach_map_v1';
  const COACH_CITY_KEY = 'tansuo_coach_city_v1';
  const MAP_COACH = [
    { sel: '#topbarHint', title: '朱 砂 所 指', text: '朱砂印代表眼前要務。先看它指向哪一城，再決定動身。' },
    { sel: '#topbarSide', title: '青 綠 可 訪', text: '青綠印不是主線急報，而是可另行探訪的線索。若暫無把握，可先跟朱砂走。' },
    { sel: '.map-events', title: '史 · 事', text: '左卷記着你將親歷的史事。朱砂一亮，便是時局催你前往之處。' },
    { sel: '.events-journal', title: '手 卷', text: '手卷收着旅程、證據與下一步。若忘了方向，先翻此卷。' },
    { sel: '#mapStats .ms-group:nth-child(1)', title: '四 方 風 聲', text: '朝廷、清議、民情、餉源都會回應你的抉擇。它們不是分數，而是局勢。' },
    { sel: '#mapStats .ms-group:nth-child(2)', title: '見 識', text: '見識記下你的理解走向。器物、制度、思想會逐步構成你的判斷。' },
    { sel: '#mapStats .ms-group:nth-child(3)', title: '舊 友 新 知', text: '你遇見的人會留在此處。關係未必即時有用，但會改變你看見的歷史。' }
  ];
  const CITY_COACH = [
    { sel: '.city-hotspots', title: '先 看 紅 點', text: '紅點是現場留下的痕跡。先看一眼，不必急着判斷。' },
    { sel: '#hotspotObservation', title: '所 見 而 已', text: '浮出的短句只是你眼前所見。真正能否成為證據，要進一步查證。' },
    { sel: '#cityMissionSheet', title: '查 證 入 卷', text: '點入紅點後完成查證，線索才會收入手卷。' },
    { sel: '#cityMissionSheet', title: '史 事 抉 擇', text: '證據入卷後，相關史事才會展開。你的處置會推動局勢變化。' }
  ];
  let coachSteps = null, coachIdx = 0, coachDoneKey = null;
  function bindCoachOnce() {
    if (window.__coachBound) return; window.__coachBound = true;
    document.getElementById('cmNext')?.addEventListener('click', coachNext);
    document.getElementById('cmSkip')?.addEventListener('click', () => {
      try { localStorage.setItem(COACH_MAP_KEY, '1'); localStorage.setItem(COACH_CITY_KEY, '1'); } catch (e) {}
      coachEnd(null);
    });
  }
  function finishCityCoachOutcome() {
    markCityIntroSeen(gameState.currentCity);
    resumePinnedAfterCoreLoop();
  }
  function coachEnd(flagKey) {
    const finishedKey = flagKey || coachDoneKey;
    const m = document.getElementById('coachmark');
    if (m) m.setAttribute('hidden', '');
    coachSteps = null;
    if (flagKey) { try { localStorage.setItem(flagKey, '1'); } catch (e) {} }
    if (finishedKey === COACH_CITY_KEY) finishCityCoachOutcome();
  }
  function coachNext() {
    if (!coachSteps) return;
    coachIdx++;
    if (coachIdx >= coachSteps.length) coachEnd(coachDoneKey);
    else coachShow(coachIdx);
  }
  function coachShow(i) {
    const step = coachSteps && coachSteps[i];
    if (!step) { coachEnd(coachDoneKey); return; }
    const m = document.getElementById('coachmark');
    const spot = document.getElementById('cmSpot');
    const bubble = document.getElementById('cmBubble');
    if (!m || !spot || !bubble) return;
    const setText = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
    setText('cmTitle', step.title); setText('cmText', step.text);
    setText('cmStep', (i + 1) + ' / ' + coachSteps.length);
    const nextBtn = document.getElementById('cmNext');
    if (nextBtn) nextBtn.textContent = (i === coachSteps.length - 1) ? '完 成' : '下 一 步 →';
    m.removeAttribute('hidden');
    const target = step.sel ? document.querySelector(step.sel) : null;
    const r = target ? target.getBoundingClientRect() : null;
    if (r && r.width) {
      const pad = 8;
      spot.style.display = 'block';
      spot.style.left = (r.left - pad) + 'px'; spot.style.top = (r.top - pad) + 'px';
      spot.style.width = (r.width + pad * 2) + 'px'; spot.style.height = (r.height + pad * 2) + 'px';
      const bw = 300;
      bubble.style.left = Math.min(Math.max(r.left, 16), window.innerWidth - bw - 16) + 'px';
      if (r.bottom + 190 < window.innerHeight) bubble.style.top = (r.bottom + 16) + 'px';
      else bubble.style.top = Math.max(16, r.top - 170) + 'px';
    } else {
      spot.style.display = 'none';
      bubble.style.left = (window.innerWidth / 2 - 150) + 'px';
      bubble.style.top = (window.innerHeight / 2 - 90) + 'px';
    }
  }
  function startCoach(steps, flagKey, opts) {
    opts = opts || {};
    if (!opts.force) { try { if (localStorage.getItem(flagKey)) return; } catch (e) {} }
    bindCoachOnce();
    coachSteps = steps; coachIdx = 0; coachDoneKey = flagKey;
    coachShow(0);
  }
  let coachMapTries = 0;
  function maybeMapCoach() {
    try { if (localStorage.getItem(COACH_MAP_KEY)) return; } catch (e) {}
    const s3 = document.getElementById('screen3');
    if (s3 && s3.dataset.phase === '6') { setTimeout(() => startCoach(MAP_COACH, COACH_MAP_KEY), 700); return; }
    if (coachMapTries++ < 30) setTimeout(maybeMapCoach, 400);
  }
  window.__replayCoach = () => startCoach(MAP_COACH, COACH_MAP_KEY, { force: true });

  function ensureCityIntroState() {
    gameState.citiesIntroduced = gameState.citiesIntroduced || [];
    return gameState.citiesIntroduced;
  }

  function shouldProtectFirstCityEntry(cityKey) {
    if (!cityKey) return false;
    try { if (localStorage.getItem(COACH_CITY_KEY)) return false; } catch (e) {}
    const seen = ensureCityIntroState();
    if (seen.indexOf(cityKey) !== -1) return false;
    const scene = CITY_SCENES[cityKey];
    if (!scene || !cityScenePlayable(scene)) return false;
    return visibleCityHotspots(scene).some((hs) => !hasFoundHotspot(cityKey, hs.id));
  }

  function markCityIntroSeen(cityKey) {
    if (!cityKey) return;
    const seen = ensureCityIntroState();
    if (seen.indexOf(cityKey) === -1) {
      seen.push(cityKey);
      saveGame();
    }
  }

  function coreLoopLayerOpen() {
    return !!document.querySelector('#coachmark:not([hidden]), #evidenceTaskModal:not([hidden]), #hotspotModal:not([hidden])');
  }

  function shouldDeferPinnedForCoreLoop(ev, onCityEnter) {
    if (!ev || !onCityEnter) return false;
    if (!citySceneIsOpen()) return false;
    if (shouldProtectFirstCityEntry(ev.city)) return true;
    return coreLoopLayerOpen();
  }

  // 將 initMapUI 暴露給 gotoMap 使用
  window.__initMapUI = initMapUI;

  // ============================================================
  // BGM · Web Audio 程序生成輕量氛圍音
  // ============================================================
  const BGM = (function () {
    let ctx = null;
    let masterGain = null;
    const nodes = [];
    let bellTimer = null;
    let enabled = false;

    function ensureCtx() {
      if (ctx) return ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.10;
      masterGain.connect(ctx.destination);
      return ctx;
    }

    function makeNoiseBuffer(seconds) {
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
      const d = buf.getChannelData(0);
      // 粉紅噪音近似（簡易濾波累積）
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < d.length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.0990460;
        b1 = 0.96300 * b1 + white * 0.2965164;
        b2 = 0.57000 * b2 + white * 1.0526913;
        d[i] = (b0 + b1 + b2 + white * 0.1848) * 0.18;
      }
      return buf;
    }

    function start() {
      if (enabled) return;
      if (!ensureCtx()) return;
      if (ctx.state === 'suspended') ctx.resume();
      enabled = true;

      // 1. 風聲：低通過濾的粉紅噪音
      const noise = ctx.createBufferSource();
      noise.buffer = makeNoiseBuffer(4);
      noise.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 220;
      lp.Q.value = 0.6;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.45;
      // LFO modulates filter slowly for breathing
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 60;
      lfo.connect(lfoGain).connect(lp.frequency);
      lfo.start();
      noise.connect(lp).connect(noiseGain).connect(masterGain);
      noise.start();
      nodes.push(noise, lfo);

      // 2. 低音底鼓：D2 (~73 Hz) 持續正弦
      const drone = ctx.createOscillator();
      drone.type = 'sine';
      drone.frequency.value = 73.42;
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.10;
      drone.connect(droneGain).connect(masterGain);
      drone.start();
      nodes.push(drone);

      // 3. 偶發鈴聲（東方五聲調式：宮商角徵羽）
      scheduleBell();
      // 套用當前場景（腳步/張力/鈴音讓位/SUNO 地圖曲）
      applyScene();
    }

    function scheduleBell() {
      if (!enabled) return;
      const delay = 9000 + Math.random() * 16000;  // 9-25 秒
      bellTimer = setTimeout(() => {
        playBell();
        scheduleBell();
      }, delay);
    }

    function playBell() {
      if (!ctx || !enabled || bellsMuted) return;
      // 五聲音階（D 宮）：D4 E4 F#4 A4 B4 + 上一八度
      const notes = [293.66, 329.63, 369.99, 440, 493.88, 587.33, 659.25];
      const freq = notes[Math.floor(Math.random() * notes.length)];
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const env = ctx.createGain();
      env.gain.value = 0;
      osc.connect(env).connect(masterGain);
      osc.start();
      const now = ctx.currentTime;
      env.gain.linearRampToValueAtTime(0.14, now + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0008, now + 4.0);
      osc.stop(now + 4.2);
    }

    // ── 分場景音景 ──
    let bellsMuted = false;
    let scene = 'map';
    let stepTimer = null;
    const tensionNodes = [];
    const mapTheme = document.getElementById('mapTheme');
    let mapThemeReady = false;
    if (mapTheme) {
      mapTheme.addEventListener('canplaythrough', () => { mapThemeReady = true; if (enabled) applyScene(); }, { once: true });
      mapTheme.addEventListener('error', () => { mapThemeReady = false; });
    }
    function playFootstep() {
      if (!ctx || !enabled) return;
      const src = ctx.createBufferSource(); src.buffer = makeNoiseBuffer(0.3);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 170; lp.Q.value = 0.7;
      const env = ctx.createGain(); env.gain.value = 0;
      src.connect(lp).connect(env).connect(masterGain);
      const now = ctx.currentTime;
      env.gain.linearRampToValueAtTime(0.11, now + 0.015);
      env.gain.exponentialRampToValueAtTime(0.0006, now + 0.24);
      src.start(now); src.stop(now + 0.32);
    }
    function startFootsteps() {
      if (stepTimer) return;
      const loop = () => { if (!enabled) { stepTimer = null; return; } playFootstep(); stepTimer = setTimeout(loop, 520 + Math.random() * 200); };
      loop();
    }
    function stopFootsteps() { if (stepTimer) { clearTimeout(stepTimer); stepTimer = null; } }
    function startTension() {
      if (tensionNodes.length || !ctx) return;
      [57, 57.7].forEach((f) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const g = ctx.createGain(); g.gain.value = 0.06;
        o.connect(g).connect(masterGain); o.start(); tensionNodes.push(o);
      });
    }
    function stopTension() { while (tensionNodes.length) { const n = tensionNodes.pop(); try { n.stop(); } catch (e) {} } }
    function syncMapTheme() {
      if (!mapTheme) return;
      const wantMusic = enabled && (scene === 'map' || scene === 'city') && mapThemeReady;
      if (wantMusic) { mapTheme.volume = 0.5; const p = mapTheme.play(); if (p && p.catch) p.catch(() => {}); }
      else { try { mapTheme.pause(); } catch (e) {} }
    }
    function applyScene() {
      const mapMusic = mapThemeReady && (scene === 'map' || scene === 'city');
      if (scene === 'cityLoader') { startFootsteps(); stopTension(); }
      else if (scene === 'event') { stopFootsteps(); startTension(); }
      else { stopFootsteps(); stopTension(); }
      // SUNO 地圖曲在場時，程序鈴音讓位、底床降音量（風聲/drone 仍作微底）
      bellsMuted = (scene === 'cityLoader' || scene === 'event' || mapMusic);
      if (masterGain) masterGain.gain.value = mapMusic ? 0.045 : 0.10;
      syncMapTheme();
    }
    function setScene(name) {
      scene = name || 'map';
      if (enabled) applyScene();
    }

    function stop() {
      enabled = false;
      if (bellTimer) { clearTimeout(bellTimer); bellTimer = null; }
      stopFootsteps(); stopTension();
      try { if (mapTheme) mapTheme.pause(); } catch (e) {}
      while (nodes.length) {
        const n = nodes.pop();
        try { n.stop(); } catch (e) {}
      }
    }

    function setEnabled(v) {
      if (v) start(); else stop();
    }

    function resume() {
      if (!ensureCtx()) return;
      try {
        const p = ctx.state === 'suspended' ? ctx.resume() : null;
        if (p && p.catch) p.catch(() => {});
      } catch (e) {}
      if (enabled) applyScene();
    }

    // ⑨ 音效強拍：關鍵時刻一記深沉砲鼓（直連 destination，不受場景衰減）
    function impact() {
      if (!ctx || !enabled) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(96, t); o.frequency.exponentialRampToValueAtTime(36, t + 0.55);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.55, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 1.05);
      try {
        const len = Math.floor(ctx.sampleRate * 0.3);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
        const nb = ctx.createBufferSource(); nb.buffer = buf;
        const ng = ctx.createGain(); ng.gain.value = 0.28;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 850;
        nb.connect(lp).connect(ng).connect(ctx.destination); nb.start(t);
      } catch (e) {}
    }

    return {
      start, stop, setEnabled, setScene, impact, resume,
      isOn: () => enabled
    };
  })();
  window.__BGM = BGM;

  let introBgmRequested = false;
  function primeIntroBgm() {
    if (introBgmRequested) return;
    introBgmRequested = true;
    try {
      BGM.start();
      BGM.setScene('map');
    } catch (e) {}

    const unlock = () => {
      try {
        if (!BGM.isOn()) BGM.start();
        else if (typeof BGM.resume === 'function') BGM.resume();
        BGM.setScene(citySceneIsOpen() ? 'city' : 'map');
      } catch (e) {}
      try { syncBgmToggles(); } catch (e) {}
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
  }

  // ============================================================
  // 6g. 城市場景頁
  // ============================================================

  const CITY_SCENES = {
    shanghai: {
      en: 'Shanghai',
      yearLabel: '咸豐十一年（1861）春',
      tagline: '「通商口岸、洋務新興之地」',
      // 自由事件清單（鐵釘自動觸發，不在這）；按年份解鎖
      actionEvents: ['e_shisanhang', 'e_write_yixin', 'e_chashan_listen', 'e_handle_court', 'e_jiangnan'],
      hotspots: [
        // ── 1861 起可見 ──
        { id: 'sh-bund',    type: 'clue', unlocks: 'e_shisanhang',  appearFromYear: 1861, x: '14%', y: '41%',
          name: '外 灘 洋 行',  axis: 'system',
          desc: '外灘洋行沿江而立，旗幟、賬房、買辦與搬運工同在一條石岸上。五口通商後，舊式公行退場，新的華洋中介正在上海成形。' },
        { id: 'sh-steamer', type: 'clue', unlocks: 'e_write_yixin', appearFromYear: 1861, x: '68%', y: '50%',
          name: '西 洋 輪 船', axis: 'material',
          desc: '不必等風的單煙囪明輪船，與江上同行的中式帆船一比，技術差距一目了然。中國若要自強，非得也造得出這樣的船——你動了【寫信予奕訢】、建言興辦輪船的念頭。' },
        { id: 'sh-workers', type: 'clue', unlocks: 'e_handle_court', appearFromYear: 1861, x: '18%', y: '78%',
          name: '碼 頭 工 人', axis: 'thought',
          desc: '苦力們以竹竿挑著貨箱，毫無表情。他們的生計與市面民情，或許正藏在你案頭那疊【朝廷雜務】文書之中。' },
        { id: 'sh-junk',    type: 'clue', unlocks: 'e_chashan_listen', appearFromYear: 1861, x: '45%', y: '51%',
          name: '中 式 帆 船', axis: 'thought',
          desc: '三桅篷船泊在江畔，船夫們在岸邊茶肆歇腳閒談。湊近那間【茶館】，或能聽見市井對時局的議論。' },
        // ── 1865 江南機器製造總局創辦後才出現 ──
        { id: 'sh-stack',   type: 'clue', unlocks: 'e_jiangnan', appearFromYear: 1865, x: '78%', y: '33%',
          name: '江南製造煙囪', axis: 'material',
          desc: '高聳的紅磚煙囪終日吐出黑煙——李鴻章奏設的江南機器製造總局，中國境內最大的近代軍工廠。' }
      ],
      // 城市設施（四角）
      facilities: [
        { id: 'sh-wharf',     name: '外灘碼頭',  en: 'Bund Wharf', corner: 'tl',
          unlockYear: 1860, desc: '洋船與沙船在此交會，貨箱、茶包與銀票一日數易其手。在此探聽商情船期，可長見識。',
          gain: { axis: 'system', amount: 1 },
          challenge: {
            type: 'fact', axis: 'system',
            q: '上海原非官辦軍工重鎮，為何反而成為新技術、新思想傳入中國的最大門戶？',
            options: [
              { label: '《南京條約》開上海為通商口岸，華洋雜處、外資與報館譯書匯聚，遂成中外交會的樞紐', correct: true },
              { label: '因清廷刻意把所有官辦軍工集中設於上海', correct: false },
              { label: '因上海地處內陸、遠離海防前線而最安全', correct: false }
            ],
            explain: '1842《南京條約》開上海為五口之一，華洋雜處、外資洋行與報館譯書在此匯聚——非因官辦，而因「開埠＋地利＋資訊匯流」，使上海成為新技術與新思想傳入的最大門戶。（DSE：通商口岸·上海崛起之因）'
          } },
        { id: 'sh-yishu',     name: '譯 書 館',  en: 'Translation Bureau', corner: 'tr',
          unlockYear: 1867, desc: '聘洋員譯述西書，新學東傳之要地。靜心研讀，西學見識大進。',
          gain: { axis: 'thought', amount: 2 },
          challenge: {
            type: 'fact', axis: 'thought',
            q: '洋務派在造船炮之外，還要辦同文館、譯西書、育西學人才，這反映了怎樣的認識？',
            options: [
              { label: '認識到單憑購買器物不足以自強，必須培養能讀懂、運用、再造西學的本國人才', correct: true },
              { label: '認為外語人才比軍備更能直接在戰場上打勝仗', correct: false },
              { label: '純粹為了應付科舉考試增設的新科目', correct: false }
            ],
            explain: '設同文館／廣方言館、譯西書屬洋務「文教改革」——洋務派漸悟器物背後須有人才與學問支撐，單靠買船買炮難以持久自強。（DSE：洋務措施·文教育才的用意）'
          } },
        { id: 'sh-cargo',     name: '貨 棧',      en: 'Cargo Warehouse', corner: 'bl',
          unlockYear: 1860, desc: '貨棧堆滿洋布、茶箱與機器零件，市面與工人消息往往先到此處。',
          gain: { axis: 'thought', amount: 1 },
          challenge: {
            type: 'scenario', axis: 'thought',
            q: '貨棧堆滿廉價洋布。這類機製洋貨大量輸入，對中國社會造成甚麼影響？',
            options: [
              { label: '衝擊本土手工棉紡織業，部分農村手工業者破產', correct: true },
              { label: '促使本土手工業迅速全面機械化', correct: false },
              { label: '對民生與經濟毫無影響', correct: false }
            ],
            explain: '機製洋布價廉物美、大量輸入，衝擊中國傳統手工棉紡織業，令不少農村手工業者破產——這是列強經濟入侵的具體後果，也是洋務「求富」要回應的問題。（DSE：列強經濟入侵·背景）'
          } },
        { id: 'sh-inn',       name: '客 棧',     en: 'Inn', corner: 'br',
          unlockYear: 1860, desc: '南來北往的商旅暫歇之所。在此養精蓄銳，靜候時機，待一季流轉。',
          gain: null }
      ]
    },
    beijing: {
      en: 'Peking',
      yearLabel: '咸豐十一年（1861）春',
      tagline: '「天朝中樞 · 制度與守舊之爭」',
      actionEvents: ['e_bj_wall', 'e_bj_envoy', 'e_bj_woren'],
      hotspots: [
        { id: 'bj-wall',  type: 'clue', unlocks: 'e_bj_wall',  appearFromYear: 1861, x: '49%', y: '12%',
          name: '紫禁城牆', axis: 'system',
          desc: '灰磚高牆巍然，是「天朝上國」千年自尊的象徵。牆內仍以舊禮視天下，牆外的世界卻已換了規則——【天朝舊夢】。' },
        { id: 'bj-envoy', type: 'clue', unlocks: 'e_bj_envoy', appearFromYear: 1861, x: '54%', y: '62%',
          name: '外 國 使 節', axis: 'system',
          desc: '黑禮服、高禮帽的洋人捧著文書出入。第二次鴉片戰爭後，他們竟得常駐京師——這在十年前是不可想像的。湊近聽聽他們的【交涉】。' },
        { id: 'bj-woren',  type: 'clue', unlocks: 'e_bj_woren', appearFromYear: 1862, x: '7%', y: '66%',
          name: '守 舊 老 臣', axis: 'thought',
          desc: '幾位老臣聚於廊下，神色凝重。為首者正是倭仁——他正草擬奏摺，反對同文館聘洋人教天文算學。聽其【衞道之爭】。' }
      ],
      facilities: [
        { id: 'bj-zongli', name: '總理衙門', en: 'Zongli Yamen', corner: 'tl',
          unlockYear: 1861, unlockEventId: 'e_zongli_yamen', lockedLabel: '尚 未 設 立', desc: '清廷第一個專責對外交涉的中央機構。研習其章程文書，可長制度見識。',
          gain: { axis: 'system', amount: 2 },
          challenge: {
            type: 'fact', axis: 'system',
            q: '1861 年設立的「總理各國事務衙門」，在中國歷史上的開創意義是甚麼？',
            options: [
              { label: '第一個專責對外交涉（近代外交）的中央機構', correct: true },
              { label: '第一個統領全國新式陸軍的機構', correct: false },
              { label: '第一個管理科舉與學校的機構', correct: false }
            ],
            explain: '總理衙門（1861）是清廷第一個專責對外交涉的中央機構，象徵放下「天朝—藩屬」舊秩序、開始以近代方式處理對外關係，是外交制度近代化的起點。（DSE：外交制度·措施）'
          } },
        { id: 'bj-tongwen', name: '同 文 館', en: 'Tongwen Guan', corner: 'tr',
          unlockYear: 1862, unlockEventId: 'e_tongwen_guan', lockedLabel: '待 同 文 館 史 事', desc: '隸於總理衙門，招八旗子弟習英法俄文與西學。靜心研讀，西學見識大進。',
          gain: { axis: 'thought', amount: 2 },
          challenge: {
            type: 'fact', axis: 'thought',
            q: '中外交往日繁，清廷設京師同文館（1862）、上海廣方言館，最直接是為解決甚麼問題？',
            options: [
              { label: '缺乏通曉外語的翻譯與外交人才', correct: true },
              { label: '缺乏製造槍炮的兵工廠', correct: false },
              { label: '缺乏開採煤鐵的礦務局', correct: false }
            ],
            explain: '隨着條約交涉與洋務開展，清廷亟需通曉外語、西學的翻譯與外交人才，遂設同文館、廣方言館——這是洋務「文教改革·培養人才」的開端。（DSE：文教改革·培養翻譯外交人才）'
          } },
        { id: 'bj-junji', name: '軍 機 處', en: 'Grand Council', corner: 'bl',
          unlockYear: 1861, desc: '中樞要地，京中政情消息匯聚之所。打聽朝局，可察洋務推行之難。',
          gain: { axis: 'system', amount: 1 },
          challenge: {
            type: 'scenario', axis: 'system',
            q: '李鴻章主張集中力量加強海防，左宗棠主張「海防、塞防並重」，後期李鴻章又與張之洞交惡——這些最能反映洋務的甚麼問題？',
            options: [
              { label: '督撫各持己見、彼此不和，洋務欠統一指揮', correct: true },
              { label: '督撫同心協力、配合無間', correct: false },
              { label: '中央嚴格節制，督撫毫無實權', correct: false }
            ],
            explain: '洋務派內部意見不合、督撫不和（李鴻章 vs 左宗棠、李鴻章 vs 張之洞），甲午時南洋水師更不援北洋——「權力有限、官員不和」使洋務難以一體，是失敗主因之一。（DSE：失敗原因·官員不和）'
          } },
        { id: 'bj-guild', name: '會 館', en: 'Guild Lodge', corner: 'br',
          unlockYear: 1860, desc: '各省士人寄寓之所。在此養精蓄銳，靜候時機，待一季流轉。',
          gain: null }
      ]
    },
    tianjin: {
      en: 'Tianjin',
      yearLabel: '同治九年（1870）春',
      tagline: '「直隸門戶 · 北洋軍政之樞」',
      actionEvents: ['e_tj_haihe', 'e_tj_advisor', 'e_tj_telegraph'],
      hotspots: [
        { id: 'tj-haihe', type: 'clue', unlocks: 'e_tj_haihe', appearFromYear: 1866, x: '70%', y: '62%',
          name: '海 河 碼 頭', axis: 'system',
          desc: '海河入海，洋槍洋炮、煤鐵糧餉在此集散。李鴻章督直隸後，天津成為北洋軍需轉運的咽喉，也照見洋務「燒銀」的一面。' },
        { id: 'tj-advisor', type: 'clue', unlocks: 'e_tj_advisor', appearFromYear: 1880, x: '92.2%', y: '48.1%',
          name: '客 卿 教 習', axis: 'material',
          desc: '西洋軍官在操場指點演炮、測繪。北洋重金禮聘洋將洋匠以速成新軍，卻也引來「仰賴夷人」的非議與隱憂。' },
        { id: 'tj-telegraph', type: 'clue', unlocks: 'e_tj_telegraph', appearFromYear: 1880, x: '70.1%', y: '28.5%',
          name: '電 報 線 杆', axis: 'thought',
          desc: '一排電報線杆切過平原。消息不再只靠驛馬，軍務、商務、外交開始追趕蒸汽時代的速度——卻也驚動了講風水的鄉民。' }
      ],
      facilities: [
        { id: 'tj-beiyang', name: '北洋衙署', en: 'Beiyang Office', corner: 'tl',
          unlockYear: 1870, desc: '北洋軍政文書匯聚之地。研讀奏摺與軍費調度，可明白地方督撫如何推動洋務。',
          gain: { axis: 'system', amount: 2 },
          challenge: {
            type: 'scenario', axis: 'system',
            q: '洋務經費「大多由地方督撫自行籌集」，這對改革造成甚麼影響？',
            options: [
              { label: '財源分散而有限、難以持續，制約了洋務成效', correct: true },
              { label: '經費充裕，洋務從不缺錢', correct: false },
              { label: '全由中央統一撥足，地方無須操心', correct: false }
            ],
            explain: '晚清國庫空虛，洋務經費多賴地方督撫自籌（釐金、海關洋稅等），力有不逮、財源分散，加上賠款沉重、軍費遭挪用，是洋務「經費不足」的根本困境。（DSE：失敗原因·經費不足·地方自籌）'
          } },
        { id: 'tj-dagu', name: '大沽炮台', en: 'Dagu Forts', corner: 'tr',
          unlockYear: 1861, desc: '京畿海防第一線。登台觀炮，可見外患如何迫使清廷重思海防。',
          gain: { axis: 'system', amount: 1 },
          challenge: {
            type: 'fact', axis: 'system',
            q: '第二次鴉片戰爭中，大沽、天津失守對清廷的最大刺激是甚麼？',
            options: [
              { label: '京師門戶被打開，迫使清廷正視西方軍事威脅', correct: true },
              { label: '證明傳統海防已完全足夠', correct: false },
              { label: '令清廷立即廢除所有不平等條約', correct: false }
            ],
            explain: '大沽與天津失守使戰火直逼北京，清廷感到「船堅炮利」的現實壓力，成為日後洋務自強與海防建設的重要背景。（DSE：背景·外患刺激）'
          } },
        { id: 'tj-wubei', name: '武備學堂', en: 'Military Academy', corner: 'bl',
          unlockYear: 1885, desc: '訓練新式軍官與陸軍人才。研習操典，可見洋務由器物走向人才培養。',
          gain: { axis: 'material', amount: 2 },
          challenge: {
            type: 'fact', axis: 'material',
            q: '清廷已能向外國購艦、聘洋員，為何仍要自辦武備學堂、培養本國軍官？',
            options: [
              { label: '器物與洋員終究受制於人，唯有自育懂西法的本國軍事人才，才能真正掌握國防', correct: true },
              { label: '因為本國軍官的薪餉遠比聘用洋員昂貴', correct: false },
              { label: '因為武備學堂同時負責經營民用企業以牟利', correct: false }
            ],
            explain: '新式軍事學堂培養懂操典、測繪、西法的本國軍官，正因購艦聘洋員終受制於人；自育人才方能真正掌握國防——屬洋務文教與強兵的交界。（DSE：措施·軍事人才自主）'
          } },
        { id: 'tj-inn', name: '驛 站', en: 'Relay Inn', corner: 'br',
          unlockYear: 1860, desc: '海河路旁的驛站，軍報與旅人往返不絕。在此暫歇，待一季流轉。',
          gain: null }
      ]
    },
    kaiping: {
      en: 'Kaiping',
      yearLabel: '光緒三年（1877）春',
      tagline: '「煤鐵深藏 · 民用企業與民間阻力」',
      actionEvents: ['e_kp_mine', 'e_kp_rail', 'e_kp_fengshui'],
      hotspots: [
        { id: 'kp-mine', type: 'clue', unlocks: 'e_kp_mine', appearFromYear: 1877, x: '52%', y: '30%',
          name: '開 平 煤 礦', axis: 'system',
          desc: '開平礦務局的礦井與煤堆。唐廷樞主辦，「官督商辦」興此近代煤礦——洋務「求富」的民用企業，在這北方礦區挖出第一鍬。' },
        { id: 'kp-rail', type: 'clue', unlocks: 'e_kp_rail', appearFromYear: 1877, x: '40%', y: '74%',
          name: '唐 胥 鐵 路', axis: 'material',
          desc: '唐山至胥各莊的鐵軌——中國第一條自建鐵路。為運煤而築，卻因鄉民疑其震動龍脈，起步時竟以騾馬拖拉車廂。' },
        { id: 'kp-fengshui', type: 'clue', unlocks: 'e_kp_fengshui', appearFromYear: 1877, x: '13%', y: '30%',
          name: '風 水 民 怨', axis: 'thought',
          desc: '鐵路礦井所到之處，鄉民焚香叩拜、聯名抗阻：說機車震龍脈、礦洞洩地氣。新事業每進一步，都拖著民間阻力的重量。' }
      ],
      facilities: [
        { id: 'kp-bureau', name: '礦務局公所', en: 'Mining Bureau', corner: 'tl',
          unlockYear: 1877, desc: '開平礦務局的辦事公所。查閱章程帳冊，可見「官督商辦」如何集資興辦民用企業。',
          gain: { axis: 'system', amount: 1 },
          challenge: {
            type: 'fact', axis: 'system',
            q: '開平礦務局採「官督商辦」，這種形式的最大優點與最大隱患分別是甚麼？',
            options: [
              { label: '優點是能借官府之力募集商股、興辦大型企業；隱患是官府過度干預、權責不清，易生官僚積弊', correct: true },
              { label: '優點是完全排除官府、純由商人主導；隱患是無從籌集資金', correct: false },
              { label: '優點與隱患皆無，是毫無缺陷的完美經營形式', correct: false }
            ],
            explain: '「官督商辦」由官府給照、保護、監督，商人集股經營：既能集資興利、引入商業活力，又因官督過度、權責不清而效率低下、弊端叢生——是洋務民用企業利弊並存的典型。（DSE：求富·官督商辦的雙面性）'
          } },
        { id: 'kp-tang', name: '商 務 房', en: 'Merchant Office', corner: 'tr',
          unlockYear: 1877, desc: '唐廷樞等商董議事之所。研讀商務文書，可見買辦商人在洋務企業中的角色。',
          gain: { axis: 'material', amount: 1 },
          challenge: {
            type: 'scenario', axis: 'material',
            q: '開平煤礦一類民用企業，對洋務「自強」軍工有何作用？',
            options: [
              { label: '提供煤炭等燃料原料，支撐輪船、機器與軍工——求富以助求強', correct: true },
              { label: '與軍事工業完全無關', correct: false },
              { label: '專門生產糧食供應軍隊', correct: false }
            ],
            explain: '開平煤礦供應輪船、機器局與軍工所需的煤炭燃料，體現洋務後期「求富以求強」：民用企業不只營利，更為自強事業提供能源與原料支撐。（DSE：求富與求強的關係）'
          } },
        { id: 'kp-inn', name: '礦 區 客 棧', en: 'Colliery Inn', corner: 'br',
          unlockYear: 1877, desc: '礦區旁的旅舍，可聽礦工商旅談煤鐵與時局。在此暫歇，待一季流轉。',
          gain: null }
      ]
    },
    weihaiwei: {
      en: 'Weihaiwei',
      yearLabel: '光緒十四年（1888）春',
      tagline: '「北洋之家 · 海軍夢的終點」',
      actionEvents: ['e_whw_harbor', 'e_whw_ding'],
      hotspots: [
        { id: 'whw-harbor', type: 'clue', unlocks: 'e_whw_harbor', appearFromYear: 1888, x: '54.0%', y: '38.0%',
          name: '劉 公 島 軍 港', axis: 'material',
          desc: '威海灣口的劉公島，鐵碼頭、煤棧、船塢俱全，定遠、鎮遠兩鐵甲停泊其間——北洋海軍的母港，洋務「強兵」三十年的最後堡壘。' },
        { id: 'whw-ding', type: 'clue', unlocks: 'e_whw_ding', appearFromYear: 1888, x: '36.4%', y: '60.4%',
          name: '提 督 衙 署', axis: 'system',
          desc: '北洋海軍提督丁汝昌的衙署。陸將統水師、添艦無望、餉械兩缺——這支艦隊的難處，都壓在這位提督的眉間。' }
      ],
      facilities: [
        { id: 'whw-inn', name: '島 上 客 棧', en: 'Island Inn', corner: 'br',
          unlockYear: 1888, desc: '劉公島上的旅舍，可聽水師官兵談海防與時局。在此暫歇，待一季流轉。',
          gain: null }
      ]
    },
    japan: {
      en: 'Japan · Yokohama / Tokyo',
      yearLabel: '光緒十四年（1888）後',
      tagline: '「東鄰之變 · 明治維新的鏡像」',
      actionEvents: ['e_jp_meiji', 'e_jp_navy', 'e_jp_tairiku'],
      hotspots: [
        { id: 'jp-meiji', type: 'clue', unlocks: 'e_jp_meiji', appearFromYear: 1888, x: '46.5%', y: '67.5%',
          name: '脫 亞 入 歐', axis: 'system',
          desc: '街上和服與西裝並行，廢藩置縣、立憲在即。日本不止學器物——它把整個政教制度都翻新了。' },
        { id: 'jp-navy', type: 'clue', unlocks: 'e_jp_navy', appearFromYear: 1888, x: '57.9%', y: '50.0%',
          name: '富 國 強 兵', axis: 'material',
          desc: '橫須賀船廠汽笛長鳴，吉野等新式快艦次第下水。傾國之力擴軍——與北洋六年不添一艦，恰成對照。' },
        { id: 'jp-tairiku', type: 'clue', unlocks: 'e_jp_tairiku', appearFromYear: 1888, x: '22.4%', y: '36.7%',
          name: '大 陸 政 策', axis: 'thought',
          desc: '報端與議院鼓吹「征韓」「開拓萬里波濤」。這個脫胎換骨的鄰邦，眼光已越過對馬海峽，望向朝鮮與中國。' }
      ],
      facilities: [
        { id: 'jp-yokohama-yang', name: '橫 濱 洋 樓', en: 'Yokohama Hall', corner: 'br',
          unlockYear: 1888, desc: '華洋雜處的橫濱，西式洋樓內冠蓋雲集。在此周旋，或可一睹明治重臣的真面目。',
          gain: null }
      ]
    },
    korea: {
      en: 'Korea · Hanseong',
      yearLabel: '光緒二十年（1894）',
      tagline: '「半島烽煙 · 甲午的導火線」',
      actionEvents: ['e_korea_situation'],
      hotspots: [
        { id: 'kr-palace', type: 'clue', unlocks: 'e_korea_situation', appearFromYear: 1890, x: '50.6%', y: '41.3%',
          name: '漢 城 風 雲', axis: 'system',
          desc: '朝鮮乃清之藩屬，然日本久已覬覦。景福宮內外，清、日勢力與本土黨爭交纏——一點火星，便可燎原。' }
      ],
      facilities: []
    },
    nanjing: {
      en: 'Nanking',
      yearLabel: '同治三年（1864）秋',
      tagline: '「太平餘燼 · 廢墟之上」',
      actionEvents: ['e_nj_ruins', 'e_nj_liangjiang', 'e_nj_arsenal'],
      hotspots: [
        { id: 'nj-ruins', type: 'clue', unlocks: 'e_nj_ruins', appearFromYear: 1864, x: '14%', y: '66%',
          name: '太 平 廢 墟', axis: 'thought',
          desc: '焦黑梁木、破瓦與歸來的百姓散在城下。太平天國之亂雖平，清廷的根基卻已被震動——細看這片【城破之後】。' },
        { id: 'nj-liangjiang', type: 'clue', unlocks: 'e_nj_liangjiang', appearFromYear: 1864, x: '46%', y: '33%',
          name: '兩 江 督 署', axis: 'system',
          desc: '衙署重新開門，幕僚、奏摺、軍政文書往來不息。曾國藩一類地方督撫由此掌握軍政與籌餉大權——入內查這【督撫之權】。' },
        { id: 'nj-arsenal', type: 'clue', unlocks: 'e_nj_arsenal', appearFromYear: 1864, x: '82%', y: '64%',
          name: '製 器 舊 檔', axis: 'material',
          desc: '案上有槍炮圖紙、炮管零件與安慶軍械所舊檔。江南煙囪升起之前，戰亂已逼人翻開製器圖樣——整理這批【製器舊檔】。' }
      ],
      facilities: [
        { id: 'nj-gongyuan', name: '江 南 貢 院', en: 'Examination Hall', corner: 'tl',
          unlockYear: 1864, desc: '科舉考場，三年一試，士子雲集。新學東漸，這裏仍考八股——舊制與新政並行於一城。',
          gain: { axis: 'thought', amount: 2 },
          challenge: {
            type: 'fact', axis: 'thought',
            q: '洋務興學堂、譯西書、派留學，但科舉取士之制始終未改。這反映洋務的甚麼局限？',
            options: [
              { label: '只增新式人才管道、不觸科舉與政體，舊制仍主導士人正途', correct: true },
              { label: '科舉已廢除，全面改行西式教育', correct: false },
              { label: '新式學堂畢業即可直接任官，取代科舉', correct: false }
            ],
            explain: '洋務增設同文館、船政學堂、派留學，卻未動科舉取士的根本制度——士人正途仍是八股科舉，新式人才難獲重用，反映「中體西用」只添枝節、不改根本的局限。（DSE：失敗原因·制度未改）'
          } },
        { id: 'nj-archive', name: '軍械檔案房', en: 'Arsenal Archive', corner: 'tr',
          unlockYear: 1864, desc: '舊檔記著安慶軍械所與早期製器嘗試。翻閱圖紙，可長器物見識。',
          gain: { axis: 'material', amount: 2 },
          challenge: {
            type: 'fact', axis: 'material',
            q: '安慶軍械所僅靠手工試製、未用大型機器，為何仍在洋務史上佔開創地位？',
            options: [
              { label: '它是中國最早自辦的近代軍工，標誌「師夷長技」由議論走向實作、開洋務「製器」之先', correct: true },
              { label: '因為它的產量與規模冠絕整個洋務時期', correct: false },
              { label: '因為它是第一家官督商辦的民用航運企業', correct: false }
            ],
            explain: '安慶軍械所（1861，曾國藩創設）雖以手工試製、規模有限，卻是中國最早自辦的近代軍工，標誌「製器」由空談落為實作；其後江南製造總局（1865）方踵事增華。（DSE：自強·軍工開端的意義）'
          } },
        { id: 'nj-jinghai', name: '靜海寺遺址', en: 'Treaty Memory Site', corner: 'bl',
          unlockYear: 1864, desc: '條約記憶與戰後殘痕並存。駐足此地，可回想外患如何與內憂交逼。',
          gain: { axis: 'thought', amount: 1 },
          challenge: {
            type: 'fact', axis: 'thought',
            q: '靜海寺旁簽訂的《南京條約》(1842)，在中國近代史上的地位是甚麼？',
            options: [
              { label: '中國近代第一個不平等條約，開割地（香港）、賠款、五口通商之端', correct: true },
              { label: '清廷主動變法自強的開端', correct: false },
              { label: '一份平等互惠的通商友好條約', correct: false }
            ],
            explain: '《南京條約》(1842) 於南京下關江面簽訂、靜海寺為議約相關之地，是中國近代第一個不平等條約：割香港、開五口、巨額賠款，標誌「三千年未有之變局」的外患之始，也是日後洋務「自強」的背景。（DSE：不平等條約·外患背景）'
          } },
        { id: 'nj-inn', name: '市 集 客 棧', en: 'Market Inn', corner: 'br',
          unlockYear: 1864, desc: '戰後市集初復，旅人與百姓談論兵亂、稅餉與重建。在此暫歇，待一季流轉。',
          gain: null }
      ]
    },
    wuhan: {
      en: 'Wuhan',
      yearLabel: '光緒十五年（1889）春',
      tagline: '「九省通衢 · 後期洋務的工業地平線」',
      actionEvents: ['e_wh_iron', 'e_wh_river', 'e_wh_zhang'],
      hotspots: [
        { id: 'wh-iron', type: 'clue', unlocks: 'e_wh_iron', appearFromYear: 1889, x: '74%', y: '22%',
          name: '漢 陽 鐵 廠', axis: 'material',
          desc: '漢水之濱，高爐林立、黑煙蔽空——張之洞辦的漢陽鐵廠，亞洲第一座近代鋼鐵聯合企業。洋務三十年走到的最遠處，也照見官辦企業積重難返的隱憂。' },
        { id: 'wh-river', type: 'clue', unlocks: 'e_wh_river', appearFromYear: 1889, x: '28%', y: '40%',
          name: '長 江 碼 頭', axis: 'system',
          desc: '漢口碼頭，長江、漢水交匯，帆檣輪船雲集。「九省通衢」的水運之便，把九省物產與洋務雄心都匯到了這座碼頭。' },
        { id: 'wh-zhang', type: 'clue', unlocks: 'e_wh_zhang', appearFromYear: 1889, x: '50%', y: '33%',
          name: '張 之 洞 新 政', axis: 'thought',
          desc: '督署案頭，張之洞正撰《勸學篇》。後期洋務的集大成者，一句「中學為體，西學為用」，道盡這場改革的底色與界限。' }
      ],
      facilities: [
        { id: 'wh-yamen', name: '湖廣督署', en: 'Viceroy Yamen', corner: 'tl',
          unlockYear: 1889, desc: '張之洞督湖廣的衙署。研讀其新政文書，可見後期洋務求富求強並舉的格局。',
          gain: { axis: 'system', amount: 1 },
          challenge: {
            type: 'fact', axis: 'system',
            q: '張之洞在湖廣興辦漢陽鐵廠、槍砲廠、紗廠、新式學堂，反映洋務後期的甚麼特點？',
            options: [
              { label: '由地方督撫主持、求富與求強並舉、規模更大而仍屬官辦', correct: true },
              { label: '改採商辦民營、政府完全不再介入', correct: false },
              { label: '只辦軍工、不涉民用工業', correct: false }
            ],
            explain: '張之洞是洋務後期代表，於湖廣興辦重工業、軍工、民用工業與新式學堂，求富與求強並舉、規模空前；但仍以官辦為主、未觸制度，是後期洋務的特點與局限。（DSE：後期洋務·地方督撫）'
          } },
        { id: 'wh-machine', name: '鐵廠機器局', en: 'Ironworks Bureau', corner: 'tr',
          unlockYear: 1889, desc: '漢陽鐵廠的機器與帳房。查閱其營運，可見官辦重工業的成效與積弊。',
          gain: { axis: 'material', amount: 1 },
          challenge: {
            type: 'scenario', axis: 'material',
            q: '漢陽鐵廠雖為亞洲第一座近代鋼鐵廠，卻長期虧損，最能說明洋務企業的甚麼局限？',
            options: [
              { label: '官辦企業選址用人失當、管理積弊、效率低落', correct: true },
              { label: '中國完全沒有鐵礦與煤礦', correct: false },
              { label: '鋼鐵在當時毫無用處', correct: false }
            ],
            explain: '漢陽鐵廠規模空前，卻因選址欠當（煤鐵不配）、用人唯親、管理積弊而長期虧損——暴露洋務官辦企業效率低落的根本局限。（DSE：局限·官辦企業弊端）'
          } },
        { id: 'wh-inn', name: '江 邊 客 棧', en: 'Riverside Inn', corner: 'br',
          unlockYear: 1889, desc: '長江邊的旅舍，可聽商旅工匠談鐵廠與時局。在此暫歇，待一季流轉。',
          gain: null }
      ]
    },
    fuzhou: {
      en: 'Foochow',
      yearLabel: '咸豐十一年（1861）春',
      tagline: '「閩江船政 · 海軍之夢與殤」',
      actionEvents: ['e_fz_french', 'e_fz_yan', 'e_fz_haifang'],
      hotspots: [
        { id: 'fz-french', type: 'clue', unlocks: 'e_fz_french', appearFromYear: 1866, x: '43%', y: '67%',
          name: '法國工程師', axis: 'material',
          desc: '船台旁，法國工程師與清官、華匠圍看圖紙。日意格協助建廠與訓練，令船政能速成，也留下依賴外技的隱憂——細看這【借法之局】。' },
        { id: 'fz-yan',    type: 'clue', unlocks: 'e_fz_yan',    appearFromYear: 1866, x: '10%', y: '72%',
          name: '少 年 學 生', axis: 'thought',
          desc: '船政學堂門前，幾名少年抱著書卷與圖紙。嚴復亦在其列——日後遠渡英倫，再以《天演論》震動中國思想。問問這【學堂少年】的志向。' },
        { id: 'fz-battery', type: 'clue', unlocks: 'e_fz_haifang', appearFromYear: 1874, x: '78%', y: '26%',
          name: '炮 台 艦 影', axis: 'system',
          desc: '閩江口的炮台與遠處的艦影。同治十三年，日本竟藉口牡丹社事件出兵台灣——海防之議，自此再難迴避。登台遠眺這【海防之憂】。' }
      ],
      facilities: [
        { id: 'fz-zhengju', name: '福州船政局', en: 'Foochow Navy Yard', corner: 'tl',
          unlockYear: 1866, desc: '左宗棠奏設、沈葆楨主持的近代造船廠。研習其制，可長器物見識。',
          gain: { axis: 'material', amount: 2 },
          challenge: {
            type: 'fact', axis: 'material',
            q: '福州船政局（1866）在洋務運動中的主要意義是甚麼？',
            options: [
              { label: '中國第一座大型近代造船廠——軍事工業與海防建設的代表', correct: true },
              { label: '中國第一所外語翻譯學校', correct: false },
              { label: '中國第一家民用航運公司', correct: false }
            ],
            explain: '福州船政局（1866，左宗棠奏設、沈葆楨主持）是中國第一座大型近代造船廠，附設船政學堂培養海軍人才，是洋務「強兵」與近代海軍的搖籃。（DSE：軍事工業·海防）'
          } },
        { id: 'fz-xuetang', name: '船政學堂', en: 'Naval Academy', corner: 'tr',
          unlockYear: 1866, desc: '分前後學堂，習造船與駕駛，並遣優異者赴歐深造。研讀可長見識。',
          gain: { axis: 'thought', amount: 2 },
          challenge: {
            type: 'fact', axis: 'thought',
            q: '洋務派不惜守舊非議，派船政學生留學歐美，最深層的用意超出「學技術」，在於甚麼？',
            options: [
              { label: '培養能融會中西、自主造船駕駛與治學的通才，謀求根本而非一時的自強', correct: true },
              { label: '只為換取列強減免戰爭賠款的外交籌碼', correct: false },
              { label: '為了讓學生放棄科舉、從此永留海外', correct: false }
            ],
            explain: '船政學堂選派嚴復等留學歐洲，屬洋務「派遣留學生／文教改革」——用意在育成能自主掌握技術與學問的通才、謀根本自強；嚴復歸國後譯《天演論》，影響尤深。（DSE：文教改革·育才的深層用意）'
          } },
        { id: 'fz-dock', name: '馬尾船塢', en: 'Mawei Dock', corner: 'bl',
          unlockYear: 1869, desc: '船台之上，國造輪船次第成形。同治八年，首艘輪船「萬年清」下水。',
          gain: { axis: 'material', amount: 1 },
          challenge: {
            type: 'scenario', axis: 'material',
            q: '船政局雖能造出輪船，但船材、機器、圖樣多賴外國。這反映洋務軍事工業的甚麼局限？',
            options: [
              { label: '核心技術仍依賴外國，未能真正自主', correct: true },
              { label: '造出的輪船完全無法使用', correct: false },
              { label: '工人不願學習新技術', correct: false }
            ],
            explain: '船政局能造船，但關鍵的鋼材、機器、設計長期依賴外國工程師與進口，缺乏自主技術根基——「只學器物、依賴外人」是洋務軍事工業的根本局限。（DSE：局限·依賴外國技術）'
          } },
        { id: 'fz-inn', name: '江 岸 客 棧', en: 'Riverside Inn', corner: 'br',
          unlockYear: 1860, desc: '閩江畔的旅舍，可聽往來海客談船政與海防。在此養精蓄銳，待一季流轉。',
          gain: null }
      ]
    },
    guangzhou: {
      en: 'Canton',
      yearLabel: '咸豐十一年（1861）春',
      tagline: '「通商百年 · 西風先至」',
      actionEvents: ['e_gz_hong', 'e_gz_humen', 'e_gz_trade'],
      hotspots: [
        { id: 'gz-hong', type: 'clue', unlocks: 'e_gz_hong', appearFromYear: 1861, x: '46%', y: '37%',
          name: '十 三 行', axis: 'system',
          desc: '珠江岸邊，十三行商館鱗次櫛比。鴉片戰爭前，這裡是天朝唯一的通商之窗，公行壟斷中外貿易——五口通商後，這套舊規便走到了盡頭。' },
        { id: 'gz-humen', type: 'clue', unlocks: 'e_gz_humen', appearFromYear: 1861, x: '7%', y: '47%',
          name: '虎 門 炮 台', axis: 'thought',
          desc: '虎門炮台扼守珠江口。林則徐曾在此銷煙，英艦的炮火也由此而來——「三千年未有之變局」，便從這裡的炮聲開始。' },
        { id: 'gz-trade', type: 'clue', unlocks: 'e_gz_trade', appearFromYear: 1861, x: '52%', y: '72%',
          name: '珠 江 洋 行', axis: 'material',
          desc: '珠江江面舟楫往來，岸上洋行、行商雜處。通商口岸的利權，正一寸寸落入掛著洋旗的商行手裡。' }
      ],
      facilities: [
        { id: 'gz-customs', name: '粵海關', en: 'Canton Customs', corner: 'tl',
          unlockYear: 1861, desc: '管理通商稅務的舊衙門。查閱關冊，可見通商口岸的稅與利如何流轉。',
          gain: { axis: 'system', amount: 1 },
          challenge: {
            type: 'fact', axis: 'system',
            q: '廣州「一口通商」的獨佔地位，為何在鴉片戰爭後的五口通商下反而走向衰落？',
            options: [
              { label: '獨佔本源於清廷限關政策；五口開放後貿易分流、上海後來居上，廣州壟斷遂被打破', correct: true },
              { label: '因為廣州在戰後被劃為完全禁止貿易的城市', correct: false },
              { label: '因為十三行公行制度在戰後反而獲得擴張', correct: false }
            ],
            explain: '清廷長期「一口通商」、由十三行公行專營，使廣州獨佔外貿；鴉片戰爭後五口通商、上海憑地利後來居上，貿易分流，廣州壟斷地位告終。（DSE：通商制度·一口通商及其終結）'
          } },
        { id: 'gz-cohong', name: '十三行商館', en: 'The Hongs', corner: 'tr',
          unlockYear: 1861, desc: '昔日行商雲集之地。研讀其興衰，可見通商制度與利權的變遷。',
          gain: { axis: 'material', amount: 1 },
          challenge: {
            type: 'scenario', axis: 'material',
            q: '洋貨傾銷、行商破產、利權外溢——這一困局，最直接促使洋務派提出哪一主張？',
            options: [
              { label: '興辦實業、自設企業以「分洋商之利」、挽回利權（求富）', correct: true },
              { label: '立即全面廢除對外通商、閉關自守', correct: false },
              { label: '放棄關稅自主、任由洋貨自由輸入', correct: false }
            ],
            explain: '條約令清廷喪失關稅自主權、洋貨傾銷、利權外溢，洋務派遂於後期倡「求富」——興辦輪船招商局、礦務、紡織等民用企業，以「分洋商之利」、挽回利權。（DSE：求富背景·挽回利權）'
          } },
        { id: 'gz-inn', name: '珠 江 客 棧', en: 'Pearl River Inn', corner: 'br',
          unlockYear: 1861, desc: '珠江畔的旅舍，可聽行商海客談通商與時局。在此暫歇，待一季流轉。',
          gain: null }
      ]
    },
    hongkong: {
      en: 'Hong Kong',
      yearLabel: '咸豐十一年（1861）春',
      tagline: '「英屬之島 · 西學東漸之窗」',
      actionEvents: ['e_hk_rong', 'e_hk_press', 'e_hk_harbour'],
      hotspots: [
        { id: 'hk-rong', type: 'clue', unlocks: 'e_hk_rong', appearFromYear: 1861, x: '45%', y: '76%',
          name: '容 閎 與 留 學', axis: 'thought',
          desc: '港島的教會學堂裡，曾走出一個叫容閎的少年——首位耶魯畢業的中國人。從這裡到美國的大學，再到一船赴洋的幼童，洋務育才的種子在這殖民港發芽。' },
        { id: 'hk-press', type: 'clue', unlocks: 'e_hk_press', appearFromYear: 1861, x: '8%', y: '56%',
          name: '西 書 報 館', axis: 'thought',
          desc: '街角一間報館兼書肆，架上是西書、地圖、洋報。王韜在港辦《循環日報》——新知由此口岸，悄悄流入中國。' },
        { id: 'hk-harbour', type: 'clue', unlocks: 'e_hk_harbour', appearFromYear: 1861, x: '66%', y: '42%',
          name: '維 多 利 亞 港', axis: 'system',
          desc: '英艦與華船共泊一灣，山上是殖民官署與洋樓，山下是華人苦力與舢舨——同一座港，兩個世界，像一面照出時代距離的鏡子。' }
      ],
      facilities: [
        { id: 'hk-college', name: '英華書院', en: 'Anglo-Chinese College', corner: 'tl',
          unlockYear: 1861, desc: '教會所辦的西式學堂，授英文與西學。研讀其制，可見近代新式教育的雛形。',
          gain: { axis: 'thought', amount: 1 },
          challenge: {
            type: 'fact', axis: 'thought',
            q: '香港的教會學堂、西書報館對近代中國的主要作用是？',
            options: [
              { label: '成為西學東漸的窗口，培養與啟發了早期改革與留學人才', correct: true },
              { label: '專門製造槍砲輪船', correct: false },
              { label: '使中國放棄一切傳統學問', correct: false }
            ],
            explain: '香港作為殖民港口，西式學堂、西書報刊在此流通，是西學東漸的重要窗口，啟發了容閎、王韜等早期改革與留學人才。（DSE：文教·西學東漸·外部刺激）'
          } },
        { id: 'hk-press-fac', name: '循環日報館', en: 'Universal Circulating Herald', corner: 'tr',
          unlockYear: 1861, desc: '王韜主辦的早期華文報館。翻閱其論說，可見新知與變法思想的萌芽。',
          gain: { axis: 'thought', amount: 1 },
          challenge: {
            type: 'scenario', axis: 'thought',
            q: '王韜在港辦報、鼓吹變法，反映洋務時期一股甚麼樣的思潮？',
            options: [
              { label: '在「中體西用」之外，已有人主張更深入的制度與變法改革', correct: true },
              { label: '主張完全廢除一切西方事物', correct: false },
              { label: '主張立即推翻清朝建立共和', correct: false }
            ],
            explain: '王韜等早期改良思想家透過報刊鼓吹變法，反映在洋務「中體西用」只改器物之外，已萌生更深入的制度變革思想，為日後維新鋪路。（DSE：思想·早期維新思潮）'
          } },
        { id: 'hk-inn', name: '港 島 客 棧', en: 'Island Inn', corner: 'br',
          unlockYear: 1861, desc: '碼頭旁的旅舍，常見待渡留洋的學子與行旅。在此暫歇，待一季流轉。',
          gain: null }
      ]
    }
  };

  const EVIDENCE_TASKS = {
    'beijing:bj-wall': {
      type: 'classify',
      title: '辨 明 天 朝 與 外 交',
      instruction: '把每一句話放到正確觀念之下。',
      prompt: '紫禁城牆仍在，但牆外世界已不再按朝貢秩序運行。',
      evidenceText: '清廷原以「天朝上國」自居，缺乏對等外交觀念；戰敗後被迫面對近代國際秩序。',
      dse: '洋務背景 · 外交衝擊 · 天朝觀轉變',
      success: '你看見：牆沒有倒，但牆代表的世界秩序已先裂開。',
      groups: [
        { id: 'tribute', label: '天 朝 朝 貢 觀' },
        { id: 'modern', label: '近 代 外 交 觀' }
      ],
      items: [
        { id: 'wall-a', text: '萬國來朝，夷狄受封。', group: 'tribute' },
        { id: 'wall-b', text: '使節常駐，國書往來。', group: 'modern' },
        { id: 'wall-c', text: '外國不是藩屬，而是交涉對象。', group: 'modern' }
      ]
    },
    'beijing:bj-envoy': {
      type: 'sequence',
      title: '核 對 公 使 駐 京 紀 錄',
      instruction: '把條約後外國使節進入京師外交秩序的三步，排成先後。',
      prompt: '案上有條約摘錄、入京照會與衙門往復文書。你要核明：外國公使如何由「不得入京」變成「常駐京師」。',
      evidenceText: '《天津條約》《北京條約》准許外國公使常駐北京，直接衝擊天朝體制，促成總理衙門設立。',
      dse: '不平等條約 · 公使駐京 · 總理衙門背景',
      success: '你核清了：不是洋人路過北京，而是北京被迫承認近代外交秩序。',
      steps: [
        { id: 'envoy-a', text: '條約准許公使駐京' },
        { id: 'envoy-b', text: '各國照會進入京師' },
        { id: 'envoy-c', text: '總理衙門專責交涉' }
      ]
    },
    'beijing:bj-woren': {
      type: 'pick',
      title: '辨 認 衞 道 之 爭',
      instruction: '選出最能代表倭仁反對同文館聘西人教天文算學的理由。',
      prompt: '倭仁的奏摺字字端正，卻把新學擋在門外。',
      evidenceText: '守舊派認為西學為末技，甚至會動搖儒家根本，反映洋務運動受「中體西用」與守舊思想限制。',
      dse: '局限 · 守舊派反對 · 中體西用',
      success: '你辨出他的恐懼：他反對的不只是一門算學，而是西學進入士人心中。',
      options: [
        { id: 'woren-a', text: '西學只是末技，立國根本仍在人心與禮義。', correct: true },
        { id: 'woren-b', text: '造船太貴，因此不應設學堂。', correct: false },
        { id: 'woren-c', text: '外國公使不應乘轎入城。', correct: false }
      ]
    },

    // ──────── 上海 5 點（4 型：find×2 / pick / classify / sequence）────────
    'shanghai:sh-bund': {
      type: 'findImage',
      title: '洋 行 門 前',
      instruction: '在洋行門前，點出居中的「買辦」。',
      prompt: '洋行樓上三面洋旗招展，門前一華一洋正在議價。哪一位，是替華商與洋商牽線的「買辦」？',
      image: 'assets/hotspot/sh-bund.webp',
      targets: [ { x: 47, y: 52, w: 17, h: 44 } ],
      decoys: [ { x: 64, y: 48, w: 14, h: 46, hint: '這位是洋商（高禮帽、西裝）。買辦是替他與華商牽線的華人中介——再看他身旁那位。' } ],
      evidenceText: '五口通商後，舊有的公行專營制度被廢除，買辦取而代之，成為洋行與華商之間的新中介。',
      dse: '通商制度 · 公行廢除 · 買辦興起',
      success: '你認出了他——不官不商，卻站在華洋之間。公行去了，買辦來了，這就是通商口岸的新規矩。'
    },
    'shanghai:sh-steamer': {
      type: 'findImage',
      title: '江 上 認 船',
      instruction: '在江面上點出「西洋輪船」。',
      prompt: '黃浦江上，新舊兩種船並行。哪一艘，是逼得清廷「師夷長技」的西洋輪船？',
      image: 'assets/hotspot/sh-steamer.webp',
      targets: [ { x: 11, y: 30, w: 41, h: 46 } ],
      decoys: [ { x: 60, y: 22, w: 34, h: 72, hint: '這是中式帆船，靠風帆行駛。再看左邊那艘冒黑煙、有明輪的。' } ],
      evidenceText: '西洋輪船以蒸汽為動力、不待風潮，速度與載量遠勝中式帆船；「船堅砲利」的差距，正是清廷被迫自強的直接刺激。',
      dse: '背景 · 器物差距 · 船堅砲利',
      success: '煙囪吐黑煙、明輪破浪——那道新舊之間的差距，就是「自強」二字的由來。'
    },
    'shanghai:sh-workers': {
      type: 'pick',
      title: '洋 貨 入 市',
      instruction: '查貨單與稅冊，選出最能說明問題的判斷。',
      prompt: '碼頭堆滿廉價洋布、洋紗。工人說，這些貨一入市，城外不少織戶就關了機杼。',
      evidenceText: '機製洋貨價廉而大量輸入，衝擊中國傳統手工棉紡織業，令不少手工業者破產——這是列強經濟入侵的具體後果。',
      dse: '列強經濟入侵 · 民情衝擊',
      success: '洋貨入市，便宜了買家，卻奪了織戶的飯碗——這正是洋務「求富」要回應的痛處。',
      options: [
        { id: 'wk-a', text: '機製洋貨價廉量大，衝擊本土手工業，不少手工業者破產', correct: true },
        { id: 'wk-b', text: '洋貨輸入使本土手工業迅速全面機械化、更加興旺', correct: false },
        { id: 'wk-c', text: '洋貨只供洋人使用，對華人民生毫無影響', correct: false }
      ]
    },
    'shanghai:sh-junk': {
      type: 'classify',
      title: '茶 肆 眾 議',
      instruction: '把茶客的議論，分到「內憂」或「外患」之下。',
      prompt: '帆船泊岸，岸邊茶肆人聲鼎沸。茶客你一言我一語，道盡這亂世的內外交煎。',
      evidenceText: '太平天國等內亂與財政困窘（內憂），加上列強船砲與經濟入侵（外患），內外交煎，正是清廷推行洋務自強的時代背景。',
      dse: '背景 · 內憂外患',
      success: '洋務並非憑空而起，而是內憂與外患夾逼下，不得不為的自強。',
      groups: [
        { id: 'inner', label: '內 憂' },
        { id: 'outer', label: '外 患' }
      ],
      items: [
        { id: 'jk-a', text: '長毛（太平軍）一鬧十餘年，東南糜爛', group: 'inner' },
        { id: 'jk-b', text: '厘金加抽，商旅叫苦，國庫仍空', group: 'inner' },
        { id: 'jk-c', text: '洋人船砲犀利，沿海門戶大開', group: 'outer' },
        { id: 'jk-d', text: '洋貨傾銷，土產滯銷，利權外溢', group: 'outer' }
      ]
    },
    'shanghai:sh-stack': {
      type: 'classify',
      title: '查 明 製 造 之 限',
      instruction: '把帳簿與工場線索，分到「自強成效」或「局限」之下。',
      prompt: '江南製造的煙囪已經升起。這裏不再問它是否成立，而是查明：這座軍工巨物究竟強在何處、又困在何處。',
      evidenceText: '江南製造局能自造槍砲輪船，顯示洋務「自強」成效；但機器、圖樣、洋匠與經費多受外力與官辦體制牽制，暴露依賴外技、成本高昂的局限。',
      dse: '成效 · 軍事工業；局限 · 依賴外技／成本高昂',
      success: '你看清了：煙囪證明自強已經落地，帳簿卻暴露它仍被洋機器、洋匠與巨額經費牽住。',
      groups: [
        { id: 'effect', label: '自 強 成 效' },
        { id: 'limit', label: '局 限' }
      ],
      items: [
        { id: 'st-a', text: '可在中國境內製造槍砲、船械', group: 'effect' },
        { id: 'st-b', text: '附設翻譯館，開始培養技術知識', group: 'effect' },
        { id: 'st-c', text: '蒸汽錘、車床、圖樣多購自西洋', group: 'limit' },
        { id: 'st-d', text: '洋員薪金與機器維修耗費甚巨', group: 'limit' }
      ]
    },

    // ──────── 福州 3 點（findImage / sequence / pick）────────
    'fuzhou:fz-french': {
      type: 'findImage',
      title: '圖 紙 之 主',
      instruction: '點出主持設計的「法國工程師」。',
      prompt: '船台旁，眾人圍著一張大圖紙。指點江山、主持設計的，究竟是誰？',
      image: 'assets/hotspot/fz-french.webp',
      targets: [ { x: 36, y: 26, w: 18, h: 40 } ],
      decoys: [
        { x: 54, y: 28, w: 18, h: 44, hint: '這是清廷官員（頂戴官服）。船政由清廷主持，技術卻握在洋人手裡——看圖紙旁那兩位西裝洋人。' },
        { x: 3, y: 30, w: 31, h: 62, hint: '這是華工／學徒。真正主持設計、握有技術的，是那兩位洋人技師。' }
      ],
      evidenceText: '福州船政局延聘法國工程師（日意格等）主持建廠、設計與訓練；船政雖能速成，核心技術卻長期依賴外國——依賴外技是洋務軍事工業的根本局限。',
      dse: '局限 · 依賴外技',
      success: '洋人指點、清官旁觀、華匠環立——能造船，未必能自主，這正是洋務「只學器物」的隱憂。'
    },
    'fuzhou:fz-yan': {
      type: 'sequence',
      title: '養 成 之 路',
      instruction: '把船政育才之路排成先後。',
      prompt: '船政學堂門前，少年抱著書卷與圖紙。其中一位叫嚴復——這些孩子，將被培養成什麼？',
      evidenceText: '福州船政學堂分前後學堂教造船與駕駛，並選派優異者赴歐深造（如嚴復留英），是洋務「文教改革·派遣留學生」培養近代海軍與技術人才的重要一環。',
      dse: '措施 · 文教改革 · 派遣留學生',
      success: '從學堂到歐洲——洋務終於想到：器物之外，更要養出能造、能駛、能譯的人。',
      steps: [
        { id: 'fy-1', text: '考入船政學堂 · 習西文' },
        { id: 'fy-2', text: '分習造船（前學堂）或駕駛（後學堂）' },
        { id: 'fy-3', text: '選優派赴英法深造' },
        { id: 'fy-4', text: '歸國任海軍將官或譯介西學' }
      ]
    },
    'fuzhou:fz-battery': {
      type: 'pick',
      title: '海 防 之 憂',
      instruction: '選出最能說明此事影響的判斷。',
      prompt: '閩江口炮台與遠處艦影。同治十三年，日本竟藉牡丹社事件出兵台灣——這意味著什麼？',
      evidenceText: '1874 年日本藉牡丹社事件出兵台灣，暴露中國東南海防空虛，直接刺激清廷展開「海防大籌議」、加緊建設北洋與南洋海軍。',
      dse: '背景 · 海防壓力（日本侵台）',
      success: '海防之議自此再難迴避——這正是日後北洋海軍的由來。',
      options: [
        { id: 'fb-a', text: '日本侵台暴露中國海防空虛，刺激清廷大籌海防、加緊建設近代海軍', correct: true },
        { id: 'fb-b', text: '證明中國海防已固若金湯，無需再建設', correct: false },
        { id: 'fb-c', text: '日本從此放棄一切對外擴張', correct: false }
      ]
    },

    // ──────── 天津 3 點（classify / pick / sequence）────────
    'tianjin:tj-haihe': {
      type: 'classify',
      title: '支 多 源 少',
      instruction: '把帳目分到「龐大開支」或「有限財源」。',
      prompt: '海河碼頭，軍火、煤鐵、糧餉日夜轉運。北洋的銀子，究竟夠不夠用？',
      evidenceText: '北洋軍需龐大（練兵、購炮、造船、買煤），財源卻只有海關洋稅與厘金且不穩定；支多源少，使洋務經費始終短絀——這是洋務難以為繼的根本困境。',
      dse: '局限 · 經費不足／餉源',
      success: '要辦的事愈來愈多，能用的銀子卻就那麼些。洋務之難，往往先難在一個「錢」字。',
      groups: [
        { id: 'cost', label: '龐 大 開 支' },
        { id: 'income', label: '有 限 財 源' }
      ],
      items: [
        { id: 'hh-a', text: '練兵購炮', group: 'cost' },
        { id: 'hh-b', text: '修台造船', group: 'cost' },
        { id: 'hh-c', text: '艦隊買煤、養兵發餉', group: 'cost' },
        { id: 'hh-d', text: '海關洋稅（須與各省分用）', group: 'income' },
        { id: 'hh-e', text: '厘金抽釐（層層截留）', group: 'income' }
      ]
    },
    'tianjin:tj-advisor': {
      type: 'pick',
      title: '客 卿 之 患',
      instruction: '選出聘用洋教習最根本的局限。',
      prompt: '操場上，洋教習指點清軍演炮測繪，新軍面貌一新。重金禮聘洋將，代價是什麼？',
      evidenceText: '北洋重金禮聘洋將洋教習速成新軍，操典測繪確有實效；但核心技術與人才仍握於外人，費用高昂、洋員質素參差，若不能自育人才終受制於人——「依賴外人」是洋務的局限。',
      dse: '局限 · 依賴外人／技術不能自立',
      success: '洋教習能補一時之短，卻補不了「自立」二字——今日的客卿，可能是明日受制於人的把柄。',
      options: [
        { id: 'ad-a', text: '核心技術與人才仍握於外人、未能自立；且薪酬高昂、洋員良莠不齊', correct: true },
        { id: 'ad-b', text: '聘用洋教習可使中國軍隊立即超越列強', correct: false },
        { id: 'ad-c', text: '聘用洋教習毫無代價與風險', correct: false }
      ]
    },
    'tianjin:tj-telegraph': {
      type: 'sequence',
      title: '消 息 之 速',
      instruction: '把消息傳遞方式，依「由慢到快」排序。',
      prompt: '一排電報線杆切過平原。軍情、商情，從此快了多少？',
      evidenceText: '天津電報總局（1880）架設電報，使軍情、商情由驛馬、輪船的數日縮為瞬息，是洋務「通訊近代化」措施；但鄉民疑其傷風水、招雷火，技術推行亦遇民間阻力。',
      dse: '措施 · 通訊近代化；局限 · 民間疑慮',
      success: '近代戰爭與商務，比的已不只是船炮，更是消息的速度。',
      steps: [
        { id: 'tg-1', text: '驛馬傳遞（日行數百里）' },
        { id: 'tg-2', text: '輪船遞送（沿江海較快）' },
        { id: 'tg-3', text: '電報傳訊（瞬息千里）' }
      ]
    },

    // ──────── 南京 3 點（pick / classify / sequence）────────
    'nanjing:nj-ruins': {
      type: 'pick',
      title: '城 破 之 後',
      instruction: '選出最能說明太平天國後清廷危機的判斷。',
      prompt: '焦黑梁木與歸來百姓都在提醒你：戰亂雖平，清廷已元氣大傷。這片廢墟說明了什麼？',
      evidenceText: '太平天國等內亂動搖清廷統治，清廷為維持政權而更重視新式武器與地方軍事力量；洋務自強首先來自內憂後的生存危機。',
      dse: '背景 · 內憂刺激洋務 · 太平天國',
      success: '你看懂了：自強不是從信心開始，而是從恐懼開始。',
      options: [
        { id: 'nr-a', text: '內亂動搖清廷統治，使清廷急需新式武器與地方軍事力量自保', correct: true },
        { id: 'nr-b', text: '內亂結束後清廷再無任何危機，因此不必改革', correct: false },
        { id: 'nr-c', text: '太平天國只影響民間生活，與洋務背景毫無關係', correct: false }
      ]
    },
    'nanjing:nj-liangjiang': {
      type: 'classify',
      title: '督 撫 之 權',
      instruction: '把線索分到「地方可辦洋務」或「中央統籌不足」。',
      prompt: '戰後的督署，奏摺、幕僚、軍餉與地方軍隊都聚在一起。這股權力既能辦事，也會留下問題。',
      evidenceText: '曾國藩、李鴻章等地方督撫掌握軍政與財政，能推動洋務；但改革分散於地方，缺乏全國統一規劃，形成中央統籌不足的局限。',
      dse: '地方官倡導洋務 · 局限：中央統籌不足',
      success: '地方重臣救了清廷，也讓洋務難成一盤棋。',
      groups: [
        { id: 'can', label: '地 方 可 辦 洋 務' },
        { id: 'limit', label: '中 央 統 籌 不 足' }
      ],
      items: [
        { id: 'lj-a', text: '督撫可籌餉練兵', group: 'can' },
        { id: 'lj-b', text: '幕府聚集懂軍政與製器的人才', group: 'can' },
        { id: 'lj-c', text: '各省分頭興辦，步調不一', group: 'limit' },
        { id: 'lj-d', text: '財權與兵權分散在地方', group: 'limit' }
      ]
    },
    'nanjing:nj-arsenal': {
      type: 'sequence',
      title: '製 器 舊 檔',
      instruction: '把早期製器走向江南製造的脈絡排成先後。',
      prompt: '案上有槍炮圖紙與安慶軍械所舊檔。江南製造局之前，製器之路已經開始。',
      evidenceText: '安慶軍械所等早期製器嘗試，反映清廷在內亂後已開始以西式器械求自保，為江南製造總局等大型軍工奠下前奏。',
      dse: '措施 · 自強階段 · 軍事工業前奏',
      success: '江南煙囪升起之前，戰亂已逼人翻開槍炮圖紙。',
      steps: [
        { id: 'na-1', text: '內亂暴露傳統軍備不足' },
        { id: 'na-2', text: '地方督撫籌辦練兵與製器' },
        { id: 'na-3', text: '安慶軍械所嘗試製造槍炮' },
        { id: 'na-4', text: '江南製造總局等大型軍工興起' }
      ]
    },

    // ──────── 廣州 3 點（classify / pick / findImage）────────
    'guangzhou:gz-hong': {
      type: 'classify',
      title: '一 口 通 商 之 變',
      instruction: '把每項分到「一口通商·舊制」或「五口通商後·新局」。',
      prompt: '珠江岸邊，十三行商館林立。這裡曾是天朝唯一對外通商之地——可那「一口通商」的舊規，正在崩解。',
      evidenceText: '鴉片戰爭前，廣州是唯一通商口岸，由十三行公行專營中外貿易；《南京條約》五口通商後，公行制度廢除、上海等口岸興起，廣州的獨佔地位終結。',
      dse: '通商制度 · 公行 · 一口通商→五口通商',
      success: '一場戰爭，廢了公行、開了五口，也把貿易重心，從珠江移向了黃浦江。',
      groups: [
        { id: 'old', label: '一 口 通 商 · 舊 制' },
        { id: 'new', label: '五 口 通 商 後 · 新 局' }
      ],
      items: [
        { id: 'gh-a', text: '廣州獨攬中外貿易、十三行公行專營', group: 'old' },
        { id: 'gh-b', text: '外商只准在廣州、不得入內地', group: 'old' },
        { id: 'gh-c', text: '開廣州、廈門、福州、寧波、上海五口', group: 'new' },
        { id: 'gh-d', text: '公行制度廢除、上海漸取代廣州', group: 'new' }
      ]
    },
    'guangzhou:gz-humen': {
      type: 'pick',
      title: '銷 煙 與 戰 端',
      instruction: '選出最能說明虎門／鴉片戰爭與洋務關係的判斷。',
      prompt: '虎門炮台扼守珠江口。當年林則徐在此銷煙，英艦的炮火也由此而來——這裡，是「三千年未有之變局」的起點。',
      evidenceText: '林則徐虎門銷煙引發鴉片戰爭，中國戰敗簽《南京條約》，暴露「船堅砲利」的差距與防務落後——這場挫敗是二十年後洋務「師夷長技以自強」的遠因。',
      dse: '背景 · 鴉片戰爭（洋務遠因）',
      success: '林則徐在此「開眼看世界」，魏源由是提「師夷長技以制夷」——洋務的種子，早在這虎門的炮聲裡就已埋下。',
      options: [
        { id: 'gm-a', text: '鴉片戰爭中國戰敗，暴露武備落後、門戶洞開，是日後洋務「自強」的遠因', correct: true },
        { id: 'gm-b', text: '鴉片戰爭中國大勝，從此再無外患', correct: false },
        { id: 'gm-c', text: '林則徐銷煙使中國從此禁絕一切對外貿易', correct: false }
      ]
    },
    'guangzhou:gz-trade': {
      type: 'findImage',
      title: '珠 江 認 行',
      instruction: '在岸邊點出「洋行」（外國商行）。',
      prompt: '珠江江面舟楫往來，岸上洋行、行商雜處。哪一座，是掌控進出口的「洋行」？',
      image: 'assets/hotspot/gz-trade.webp',
      targets: [ { x: 2, y: 6, w: 41, h: 70 } ],     // 左：洋行（拱廊洋樓·洋旗·洋商）
      decoys: [ { x: 56, y: 10, w: 40, h: 70, hint: '這是華人行商的店與帆船；掌控進出口的，是左邊那座掛著洋旗、洋式拱廊的洋行。' } ],
      evidenceText: '五口通商後，洋行（外國商行）大量進駐通商口岸、掌控進出口貿易，本土行商與手工業者受其衝擊——這是列強經濟入侵在口岸的具體景象。',
      dse: '列強經濟入侵 · 洋行',
      success: '你認出了它——通商口岸的利權，正一寸寸落入掛著洋旗的商行手裡。'
    },

    // ──────── 香港 3 點（sequence / findImage / pick）────────
    'hongkong:hk-rong': {
      type: 'sequence',
      title: '留 學 之 路',
      instruction: '把留學運動的興起排成先後。',
      prompt: '港島的教會學堂裡，一個叫容閎的少年正讀著西書。從這裡到美國的大學，再到一船赴洋的幼童——洋務育才的種子，原來在這殖民港發芽。',
      evidenceText: '容閎自香港赴美、成首位耶魯畢業的中國人，歸國後力倡選派幼童留學；經曾國藩、李鴻章奏准，1872 年留美幼童成行——這是洋務「派遣留學生」的思想與人才源頭。',
      dse: '措施 · 派遣留學生 · 留學運動之源',
      success: '從一間教會學堂，到一船赴洋的幼童——原來洋務育才的起點，是這座殖民港。',
      steps: [
        { id: 'hr-1', text: '容閎自香港赴美·成首位耶魯畢業的華人' },
        { id: 'hr-2', text: '歸國倡「以西學灌輸中國」' },
        { id: 'hr-3', text: '說動曾國藩、李鴻章奏准' },
        { id: 'hr-4', text: '1872 起選派幼童留美' }
      ]
    },
    'hongkong:hk-press': {
      type: 'findImage',
      title: '新 知 之 窗',
      instruction: '點出傳播新知的「西書報館」。',
      prompt: '港島街角，一間報館兼書肆。架上是西書、地圖、報刊——新知由此口岸，悄悄流入中國。',
      image: 'assets/hotspot/hk-press.webp',
      targets: [ { x: 5, y: 24, w: 43, h: 54 } ],    // 左：西書報館（書架/讀報/地圖）
      decoys: [ { x: 56, y: 26, w: 40, h: 54, hint: '這是教四書五經的舊式私塾；傳西學新知的，是左邊那間陳列洋書洋報的報館。' } ],
      evidenceText: '香港作為殖民港口，西書、報刊、地圖在此流通，是西學東漸、新知傳入中國的重要窗口；王韜在港辦《循環日報》，早期改革思想多受此啟發。',
      dse: '西學東漸 · 思想啟蒙',
      success: '在這殖民港的書架上，藏著日後動搖「中體西用」的新思想種子。'
    },
    'hongkong:hk-harbour': {
      type: 'pick',
      title: '殖 民 之 鏡',
      instruction: '選出香港對近代中國最主要的「刺激」意義。',
      prompt: '維多利亞港。英艦與華船共泊一灣，山上是殖民官署與洋樓，山下是華人苦力與舢舨——同一座港，兩個世界。',
      evidenceText: '香港的法律、教育、市政與商業近在咫尺，形成強烈對照，刺激中國知識分子（如王韜、容閎）反思自身、推動變革——是洋務與其後維新的重要外部刺激。',
      dse: '背景 · 外部刺激 · 殖民對照',
      success: '同一座港、兩個世界——香港像一面鏡子，照出中國與時代的距離，也照出非變不可的緊迫。',
      options: [
        { id: 'hh-a', text: '作為對照的殖民窗口：西方制度、學問、效率近在眼前，刺激中國人反思與自強', correct: true },
        { id: 'hh-b', text: '證明殖民統治對中國只有好處而無代價', correct: false },
        { id: 'hh-c', text: '與中國的改革思想毫無關係', correct: false }
      ]
    },

    // ──────── 武漢 3 點（findImage / pick / classify）────────
    'wuhan:wh-iron': {
      type: 'findImage',
      title: '鐵 廠 之 煙',
      instruction: '點出近代的「漢陽鐵廠」。',
      prompt: '漢水之濱，新舊並存。哪一處，是張之洞辦的近代鋼鐵廠——高爐、廠房、黑煙蔽空？',
      image: 'assets/hotspot/wh-iron.webp',
      targets: [ { x: 50, y: 14, w: 48, h: 54 } ],   // 右：近代鐵廠（高爐·廠房·黑煙）
      decoys: [ { x: 2, y: 24, w: 38, h: 64, hint: '這是傳統民居與帆船；近代鐵廠是右邊那一片高爐、廠房與沖天黑煙。' } ],
      evidenceText: '漢陽鐵廠（張之洞辦）是中國乃至亞洲第一座近代鋼鐵聯合企業，代表洋務後期由「求富」邁向重工業；但選址用人失當、長期虧損，也暴露官辦企業的弊端。',
      dse: '後期洋務 · 近代重工業 · 官辦成效與局限',
      success: '那道工業之煙，是洋務三十年走到的最遠處——也照見官辦企業積重難返的隱憂。'
    },
    'wuhan:wh-river': {
      type: 'pick',
      title: '九 省 通 衢',
      instruction: '選出武漢成為後期洋務重鎮的關鍵地利。',
      prompt: '漢口碼頭，長江、漢水交匯，帆檣輪船雲集。「九省通衢」的武漢，為何成了後期洋務的重鎮？',
      evidenceText: '武漢居長江中游、九省通衢，漢口為通商巨埠；水運便利使原料、燃料、貨物易於集散，成為張之洞興辦漢陽鐵廠等後期洋務事業的重鎮。',
      dse: '後期洋務 · 內陸樞紐 · 求富工業',
      success: '一條長江，把九省的物產與洋務的雄心，都匯到了這座碼頭。',
      options: [
        { id: 'wr-a', text: '居長江中游、水運四通，便於原料與貨物集散，利於興辦近代工業與商務', correct: true },
        { id: 'wr-b', text: '因地處邊陲、與外界隔絕而適合辦廠', correct: false },
        { id: 'wr-c', text: '因從不通商而免受洋貨衝擊', correct: false }
      ]
    },
    'wuhan:wh-zhang': {
      type: 'classify',
      title: '中 體 西 用',
      instruction: '把每項分到「中學為體」或「西學為用」。',
      prompt: '督署案頭，張之洞正撰《勸學篇》。一句「中學為體，西學為用」，道盡這場改革的底色與界限。',
      evidenceText: '張之洞《勸學篇》倡「中學為體、西學為用」：以綱常名教為根本（體），只取西方器物技藝為輔助（用）。這既是洋務的指導思想，也是它只改器物、不改制度的根本局限。',
      dse: '中體西用 · 後期洋務 · 局限',
      success: '「中體西用」——既是洋務三十年的旗幟，也是它始終跨不過的那道牆。',
      groups: [
        { id: 'ti', label: '中 學 為 體' },
        { id: 'yong', label: '西 學 為 用' }
      ],
      items: [
        { id: 'wz-a', text: '綱常名教、忠君尊孔', group: 'ti' },
        { id: 'wz-b', text: '維護既有政治倫理秩序', group: 'ti' },
        { id: 'wz-c', text: '學西方的機器、工藝、軍事', group: 'yong' },
        { id: 'wz-d', text: '辦鐵廠、槍砲廠、新式學堂', group: 'yong' }
      ]
    },

    // ──────── 開平 3 點（classify / sequence / pick）────────
    'kaiping:kp-mine': {
      type: 'classify',
      title: '官 督 商 辦',
      instruction: '把每項分到「官（督）」或「商（辦）」。',
      prompt: '開平礦務局的礦井旁，官員與商股各司其職。這「官督商辦」的礦，到底誰管哪一塊？',
      evidenceText: '開平礦務局（1877，唐廷樞主辦）採「官督商辦」：官府給照保護、委派總辦並監督，商人集股出資經營——是洋務「求富」階段民用企業的典型，能集資興利，卻也受官府干預。',
      dse: '求富 · 民用企業 · 官督商辦',
      success: '官的照、商的銀——開平的煤，就在這「官督商辦」的夾縫裡挖了出來。',
      groups: [
        { id: 'guan', label: '官（督）' },
        { id: 'shang', label: '商（辦）' }
      ],
      items: [
        { id: 'km-a', text: '給照、批地、保護、委派總辦', group: 'guan' },
        { id: 'km-b', text: '監督礦務、抽取規費', group: 'guan' },
        { id: 'km-c', text: '集股出資、經營營利', group: 'shang' },
        { id: 'km-d', text: '自負盈虧、僱工採煤行銷', group: 'shang' }
      ]
    },
    'kaiping:kp-rail': {
      type: 'sequence',
      title: '鐵 路 之 始',
      instruction: '把唐胥鐵路的興築與波折排成先後。',
      prompt: '礦坑的煤要快速運出海口。一條中國人自建的鐵路，就在這阻力重重中誕生。',
      evidenceText: '為運開平之煤，1881 年築成唐山至胥各莊的唐胥鐵路——中國第一條自建鐵路；初期因鄉民以「震動龍脈、傷風水」為由反對，竟一度以騾馬拖拉車廂，後才獲准行駛機車。',
      dse: '交通近代化 · 中國自建鐵路 · 民間阻力',
      success: '中國第一條自建鐵路，起步時竟是騾馬拉著走——洋務每前進一步，都拖著民間阻力的重量。',
      steps: [
        { id: 'kr-1', text: '開平採煤·需快速運煤出海' },
        { id: 'kr-2', text: '築唐山至胥各莊鐵路（中國首條自建鐵路）' },
        { id: 'kr-3', text: '鄉民疑「震動龍脈」·初期禁機車、改騾馬拖拉' },
        { id: 'kr-4', text: '終獲准用蒸汽機車牽引' }
      ]
    },
    'kaiping:kp-fengshui': {
      type: 'pick',
      title: '風 水 之 爭',
      instruction: '選出鄉民反對鐵路礦務最能反映的局限。',
      prompt: '鐵路、礦井所到之處，鄉民焚香叩拜、聯名抗阻：說機車震龍脈、礦洞洩地氣、煙囪壞風水。',
      evidenceText: '開平鐵路、礦務屢遭鄉民以「傷風水、震龍脈」為由反對——反映洋務引進新技術時，因民智未開、迷信深重而缺乏社會基礎，民間阻力成為改革的一大局限。',
      dse: '局限 · 民間反對 · 缺乏社會基礎',
      success: '龍脈、地氣、風水——擋在鐵路前的，不只是技術難題，更是一整套未被觸動的舊觀念。',
      options: [
        { id: 'kf-a', text: '民智未開、迷信與風水觀念深，使鐵路礦務缺乏社會基礎、阻力重重', correct: true },
        { id: 'kf-b', text: '證明鐵路礦務在技術上完全無法運作', correct: false },
        { id: 'kf-c', text: '證明清廷已徹底禁止一切近代企業', correct: false }
      ]
    }
  };

  let foundHotspots = new Set();
  let collectedEvidence = new Set();
  let recentUnlockedEventId = null;

  function hotspotKey(cityKey, hotspotId) {
    return cityKey + ':' + hotspotId;
  }

  function hasFoundHotspot(cityKey, hotspotId) {
    return foundHotspots.has(hotspotKey(cityKey, hotspotId)) || foundHotspots.has(hotspotId);
  }

  function markFoundHotspot(cityKey, hotspotId) {
    foundHotspots.add(hotspotKey(cityKey, hotspotId));
  }

  function evidenceKey(cityKey, hotspotId) {
    return cityKey + ':' + hotspotId;
  }

  function taskKey(cityKey, hotspotId) {
    return cityKey + ':' + hotspotId;
  }

  function isEvidenceTaskDone(cityKey, hotspotId) {
    return !!(gameState.completedEvidenceTasks && gameState.completedEvidenceTasks.has(taskKey(cityKey, hotspotId)));
  }

  function markEvidenceTaskDone(cityKey, hotspotId) {
    gameState.completedEvidenceTasks = gameState.completedEvidenceTasks || new Set();
    gameState.completedEvidenceTasks.add(taskKey(cityKey, hotspotId));
  }

  function collectEvidence(cityKey, hs, task) {
    const key = evidenceKey(cityKey, hs.id);
    if (collectedEvidence.has(key)) return false;
    collectedEvidence.add(key);
    gameState.evidenceLedger = gameState.evidenceLedger || [];
    gameState.evidenceLedger.push({
      key,
      city: cityKey,
      hotspot: hs.id,
      name: hs.name,
      axis: hs.axis,
      unlocks: hs.unlocks || null,
      evidenceText: task?.evidenceText || hs.evidenceText || hs.desc,
      dse: task?.dse || null,
      taskType: task?.type || null,
      year: gameState.currentYear,
      season: gameState.currentSeason || 0
    });
    return true;
  }

  function eventEvidenceHotspots(eventId, scene) {
    return (scene?.hotspots || []).filter((hs) => hs.unlocks === eventId);
  }

  function eventEvidenceCount(eventId, scene) {
    return eventEvidenceHotspots(eventId, scene)
      .filter((hs) => collectedEvidence.has(evidenceKey(gameState.currentCity, hs.id)) || hasFoundHotspot(gameState.currentCity, hs.id))
      .length;
  }

  function hasEvidenceForEvent(eventId, scene) {
    return eventEvidenceCount(eventId, scene) >= eventEvidenceRequired(eventId, scene);
  }

  function eventEvidenceRequired(eventId, scene) {
    return Math.max(1, eventEvidenceHotspots(eventId, scene).length);
  }

  function taskGoalText(ev, eventId, scene) {
    if (ev && ev.taskGoal) return ev.taskGoal;
    const hs = eventEvidenceHotspots(eventId, scene)[0];
    if (hs) return '整理「' + hs.name + '」證據';
    return '整理「' + ((ev && ev.title) || '此地') + '」證據';
  }

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function stripDseTag(text) {
    return String(text || '')
      .replace(/（DSE：[^）]*）/g, '')
      .replace(/\(DSE:[^)]*\)/g, '')
      .replace(/DSE\s*[·：:][^。；\n]*/g, '')
      .replace(/\s+([。；，])/g, '$1')
      .trim();
  }
  // 抽取 DSE 考點標註內容（供「學習回收」用）
  function extractDseTag(text) {
    const m = String(text || '').match(/（DSE：([^）]*)）/) || String(text || '').match(/\(DSE:([^)]*)\)/);
    return m ? m[1].trim() : '';
  }
  // 記錄一題求知考驗（最終結算「學習回收」用）；同題只留最後一次
  function recordQuiz(entry) {
    if (!entry || !entry.q) return;
    gameState.quizLog = gameState.quizLog || [];
    const i = gameState.quizLog.findIndex((e) => e.q === entry.q);
    if (i >= 0) gameState.quizLog[i] = entry; else gameState.quizLog.push(entry);
  }

  function eventDseText(ev) {
    if (!ev) return '待整理';
    if (ev.dse) return ev.dse;
    const explain = ev.challenge && ev.challenge.explain;
    const match = explain && explain.match(/DSE：([^）)]+)/);
    if (match) return match[1];
    return AXIS_NAMES[ev.challenge?.axis || ev.choices?.[0]?.axis] || '見識整理';
  }

  function markRecentlyUnlocked(eventId) {
    recentUnlockedEventId = eventId;
    setTimeout(() => {
      if (recentUnlockedEventId === eventId) {
        recentUnlockedEventId = null;
        refreshActionList();
      }
    }, 4200);
  }

  // 直書：去除空白後純文字字串
  // 配合 CSS writing-mode: vertical-rl，會自然由上至下堆疊
  function vertical(name) {
    return name.replace(/\s+/g, '');
  }

  function setText(id, txt) {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  function visibleCityHotspots(scene) {
    return (scene?.hotspots || []).filter((hs) => (hs.appearFromYear || 0) <= gameState.currentYear);
  }

  function hideHotspotObservation() {
    const obs = document.getElementById('hotspotObservation');
    if (obs) {
      obs.setAttribute('hidden', '');
      obs.classList.remove('is-visible');
      obs.style.removeProperty('--ho-x');
      obs.style.removeProperty('--ho-y');
      obs.style.removeProperty('--ho-gap-x');
      obs.style.removeProperty('--ho-gap-y');
      delete obs.dataset.vertical;
    }
    document.querySelectorAll('#cityHotspots .hotspot.is-observation-open').forEach((node) => {
      node.classList.remove('is-observation-open');
    });
  }

  function shortObservationCopy(text) {
    const copy = String(text || '').replace(/\s+/g, '');
    const firstSentence = copy.split(/[。！？；]/).find(Boolean) || copy;
    if (firstSentence.length <= 48) return firstSentence;
    const cut = firstSentence.slice(0, 46);
    return cut.replace(/[，。；、：]$/, '') + '…';
  }

  function getHotspotObservationAnchor(canvasRect, spotRect) {
    const x = ((spotRect.left + spotRect.width / 2 - canvasRect.left) / Math.max(canvasRect.width, 1)) * 100;
    const y = ((spotRect.top + spotRect.height / 2 - canvasRect.top) / Math.max(canvasRect.height, 1)) * 100;
    const nearLeft = x < 52;
    const nearTop = y < 42;
    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(12, Math.min(84, y)),
      side: nearLeft ? 'right' : 'left',
      vertical: nearTop ? 'below' : 'above',
      gapX: nearLeft ? '14px' : '-14px',
      gapY: nearTop ? '14px' : '-14px'
    };
  }

  function showHotspotObservation(hs, spot) {
    const obs = document.getElementById('hotspotObservation');
    const text = document.getElementById('hoText');
    const canvas = document.getElementById('cityCanvas');
    if (!obs || !text || !canvas || !hs || !spot) return;
    const copy = shortObservationCopy(hs.desc || hs.name || '');
    if (!copy) return;
    const nameEl = document.getElementById('hoName');
    if (nameEl) nameEl.textContent = hs.name || '';
    text.textContent = copy;
    const canvasRect = canvas.getBoundingClientRect();
    const spotRect = spot.getBoundingClientRect();
    const anchor = getHotspotObservationAnchor(canvasRect, spotRect);
    obs.style.setProperty('--ho-x', anchor.x.toFixed(2) + '%');
    obs.style.setProperty('--ho-y', anchor.y.toFixed(2) + '%');
    obs.style.setProperty('--ho-gap-x', anchor.gapX);
    obs.style.setProperty('--ho-gap-y', anchor.gapY);
    obs.dataset.side = anchor.side;
    obs.dataset.vertical = anchor.vertical;
    document.querySelectorAll('#cityHotspots .hotspot.is-observation-open').forEach((node) => {
      if (node !== spot) node.classList.remove('is-observation-open');
    });
    spot.classList.add('is-observation-open');
    obs.removeAttribute('hidden');
    obs.classList.add('is-visible');
  }

  function renderCityHotspots(scene) {
    const cityKey = gameState.currentCity;
    const visibleHotspots = visibleCityHotspots(scene);
    const renderedHotspots = visibleHotspots.filter((hs) => !hasFoundHotspot(cityKey, hs.id));
    const hotspotsEl = document.getElementById('cityHotspots');
    if (hotspotsEl) {
      hideHotspotObservation();
      hotspotsEl.innerHTML = '';
      visibleHotspots.forEach((hs) => {
        if (hasFoundHotspot(cityKey, hs.id)) return;
        const btn = document.createElement('button');
        btn.className = 'hotspot';
        btn.type = 'button';
        btn.style.left = hs.x;
        btn.style.top = hs.y;
        btn.dataset.hotspotId = hs.id;
        btn.dataset.type = hs.type || 'observation';
        btn.setAttribute('data-observation', hs.desc || hs.name || '');
        btn.innerHTML = '<span class="hotspot-label">' + hs.name + '</span>';
        btn.addEventListener('pointerenter', () => showHotspotObservation(hs, btn));
        btn.addEventListener('focus', () => showHotspotObservation(hs, btn));
        btn.addEventListener('pointerleave', () => {
          if (!btn.classList.contains('is-observation-open')) hideHotspotObservation();
        });
        btn.addEventListener('blur', hideHotspotObservation);
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const touchLike = typeof window.matchMedia === 'function' && window.matchMedia('(hover: none)').matches;
          if (touchLike && !btn.classList.contains('is-observation-open')) {
            showHotspotObservation(hs, btn);
            return;
          }
          hideHotspotObservation();
          openHotspot(hs, btn);
        });
        hotspotsEl.appendChild(btn);
      });
    }
    return renderedHotspots;
  }

  function renderCityClueHint(scene, visibleHotspots) {
    const canvasEl = document.getElementById('cityCanvas');
    if (!canvasEl) return;
    const old = canvasEl.querySelector('.city-clue-hint');
    if (old) old.remove();
    if (visibleHotspots.length > 0) return;
    const fy = earliestFutureContentYear(scene);
    const hint = document.createElement('div');
    hint.className = 'city-clue-hint';
    hint.textContent = fy
      ? ('洋 務 未 興 於 此 · ' + eraYearLabel(fy) + ' 後，線 索 漸 現')
      : '此 地 暫 無 線 索 可 尋';
    canvasEl.appendChild(hint);
  }

  function getCityMissionState(scene) {
    const activeScene = scene || CITY_SCENES[gameState.currentCity];
    const visibleHotspots = activeScene ? visibleCityHotspots(activeScene) : [];
    const foundVisible = visibleHotspots.filter((hs) => hasFoundHotspot(gameState.currentCity, hs.id)).length;
    const remaining = visibleHotspots.filter((hs) => !hasFoundHotspot(gameState.currentCity, hs.id));
    const locked = optionalActionsLocked();
    const actionIds = activeScene ? (activeScene.actionEvents || []) : [];
    const availableAction = actionIds.map((eventId) => {
      const ev = EVENTS[eventId];
      if (!ev || ev.type === 'pinned') return null;
      if ((ev.appearFromYear || 0) > gameState.currentYear) return null;
      const isDone = gameState.completedEvents.has(eventId);
      const foundEvidence = eventEvidenceCount(eventId, activeScene);
      const requiredEvidence = eventEvidenceRequired(eventId, activeScene);
      const isUnlocked = (gameState.unlockedEvents || new Set()).has(eventId) || foundEvidence >= requiredEvidence;
      return { eventId, ev, isDone, foundEvidence, requiredEvidence, isUnlocked };
    }).find((item) => item && !item.isDone && item.isUnlocked && !locked);

    let objective = '進城尋找線索';
    let next = '點選朱砂熱點';
    if (!activeScene) {
      objective = '尚未進入城市';
      next = '返回地圖選擇城市';
    } else if (availableAction) {
      objective = taskGoalText(availableAction.ev, availableAction.eventId, activeScene);
      next = '整理已收集證據';
    } else if (remaining.length > 0) {
      objective = '收集城市線索';
      next = '尚有 ' + remaining.length + ' 處可探';
    } else if (locked) {
      objective = '他城要事待辦';
      next = '先處理鐵釘史事';
    } else {
      objective = cityEmptyHint(activeScene);
      next = '可推至下一要事';
    }

    return {
      objective,
      next,
      foundVisible,
      totalVisible: visibleHotspots.length
    };
  }

  function updateCityMissionSheet(scene, message) {
    const state = getCityMissionState(scene);
    setText('cityMissionObjective', state.objective);
    setText('cityMissionNext', state.next);
    setText('exploreCount', String(state.foundVisible));
    setText('exploreTotal', String(state.totalVisible));
    const feedback = document.getElementById('cityMissionFeedback');
    if (feedback) {
      feedback.textContent = message || '';
      feedback.toggleAttribute('hidden', !message);
    }
  }

  function setMissionSheetExpanded(expanded) {
    const sheet = document.getElementById('cityMissionSheet');
    const toggle = document.getElementById('cityMissionToggle');
    const value = expanded ? 'true' : 'false';
    if (sheet) sheet.dataset.expanded = value;
    if (toggle) toggle.setAttribute('aria-expanded', value);
  }

  function toggleMissionSheet() {
    const sheet = document.getElementById('cityMissionSheet');
    const expanded = !(sheet && sheet.dataset.expanded === 'true');
    setMissionSheetExpanded(expanded);
  }

  function refreshCitySceneContent(scene) {
    const activeScene = scene || CITY_SCENES[gameState.currentCity];
    if (!activeScene) return;
    setText('ctYear', yearToLabel(gameState.currentYear, gameState.currentSeason));
    const visibleHotspots = renderCityHotspots(activeScene);
    updateCityMissionSheet(activeScene);
    renderCityClueHint(activeScene, visibleHotspots);
    renderActionList(activeScene);
    renderFacilities(activeScene);
  }

  function openCityScene(cityKey, city, scene, travelSeasons) {
    const sc = document.getElementById('cityScene');
    if (!sc) return;

    // 同步當前城市 + 記錄踏訪 + 存檔
    gameState.currentCity = cityKey;
    gameState.citiesVisited = gameState.citiesVisited || [];
    if (gameState.citiesVisited.indexOf(cityKey) === -1) gameState.citiesVisited.push(cityKey);
    saveGame();
    window.__yangwuResearch?.logCityEntered({
      routeId: currentRoute,
      cityId: cityKey,
      year: gameState.currentYear,
      season: gameState.currentSeason,
      travelSeasons
    });

    // 注入加載器名稱（純文字 + vertical-rl）
    const loaderName = document.getElementById('cityLoaderName');
    if (loaderName) loaderName.textContent = vertical(city.name);
    // 進城 loader 顯示抵達時間（取代與城名重疊的全屏季節轉場）
    const loaderYear = document.getElementById('cityLoaderYear');
    if (loaderYear) {
      const prefix = (travelSeasons && travelSeasons > 1) ? ('歷 ' + travelSeasons + ' 季 · ') : '';
      loaderYear.textContent = prefix + yearToLabel(gameState.currentYear, gameState.currentSeason);
    }

    // 注入場景內容
    setText('ctZh', city.name);
    setText('ctEn', scene.en);
    setText('cityTagline', scene.tagline);
    const cpZh = document.getElementById('cpZh');
    if (cpZh) cpZh.textContent = vertical(city.name);
    setText('cpEn', scene.en);
    const cityCanvas = document.getElementById('cityCanvas');
    const cityBg = document.getElementById('cityBg');
    if (cityCanvas && cityBg) {
      cityCanvas.classList.remove('has-image');
      const imageSrc = scene.image || `assets/city/city-${cityKey}.webp`;
      cityBg.onload = () => cityCanvas.classList.add('has-image');
      cityBg.onerror = () => {
        cityCanvas.classList.remove('has-image');
        cityBg.removeAttribute('src');
      };
      cityBg.src = imageSrc;
    }

    // 注入會隨年份/事件變動的城市內容
    setMissionSheetExpanded(false);
    refreshCitySceneContent(scene);

    // 顯示 + 啟動加載序列
    sc.removeAttribute('hidden');
    sc.dataset.phase = 'loading';
    try { BGM.setScene('cityLoader'); } catch (e) {}
    // 1.8s 後切到 ready，並檢查是否有鐵釘待自動觸發
    setTimeout(() => {
      sc.dataset.phase = 'ready';
      try { BGM.setScene('city'); } catch (e) {}
      // 進城後檢查鐵釘（travel 類型 + 在當城）
      setTimeout(() => checkAndTriggerPinned(true), 600);
      // #11 線索提示：若無鐵釘搶先，提示此城尚有幾處可查線索（含當地人物）
      setTimeout(() => {
        if (document.querySelector('.event-modal:not([hidden]), .interlude-modal:not([hidden]), .coachmark:not([hidden])')) return;
        let clues = (scene.hotspots || []).filter((h) => (h.appearFromYear || 0) <= gameState.currentYear && !hasFoundHotspot(cityKey, h.id)).length;
        if (cityLocalPersonPending()) clues += 1;
        if (clues > 0) flashSceneTagline('此 處 尚 有 ' + clues + ' 事 可 探 · 點 朱 砂 熱 點 或 客 棧');
      }, 1500);
      // 首次進城：Core Loop 引導（須有熱點可指；無鐵釘搶先時才顯）
      setTimeout(() => {
        try { if (localStorage.getItem(COACH_CITY_KEY)) return; } catch (e) {}
        if (document.querySelector('#eventModal:not([hidden]), #evidenceTaskModal:not([hidden]), #interludeModal:not([hidden])')) return;
        if (document.querySelector('.city-hotspots .hotspot')) startCoach(CITY_COACH, COACH_CITY_KEY);
      }, 1200);
    }, 1800);
  }

  function facilityIsLocked(f) {
    if (gameState.currentYear < (f.unlockYear || 0)) return true;
    if (f.unlockEventId && !gameState.completedEvents.has(f.unlockEventId)) return true;
    return false;
  }

  function facilityLockText(f) {
    if (gameState.currentYear < (f.unlockYear || 0)) return '尚 未 設 立';
    if (f.unlockEventId && !gameState.completedEvents.has(f.unlockEventId)) return f.lockedLabel || '待 史 事 解 鎖';
    return '';
  }

  // 渲染城市設施（四角）
  function renderFacilities(scene) {
    const wrap = document.getElementById('cityFacilities');
    if (!wrap || !scene) return;
    wrap.innerHTML = '';
    const facilities = scene.facilities || [];
    const locked = gameState.locked;
    facilities.forEach((f) => {
      const yearLocked = facilityIsLocked(f);
      const lockText = facilityLockText(f);
      const studied = facilityIsStudy(f) && !!(gameState.facilityUsed && gameState.facilityUsed[facilityUsedKey(f)]);
      const btn = document.createElement('button');
      btn.className = 'facility facility--' + f.corner +
                      (yearLocked ? ' facility--yearlocked' : '') +
                      (studied ? ' facility--studied' : '') +
                      (locked ? ' facility--disabled' : '');
      btn.type = 'button';
      btn.dataset.facId = f.id;
      btn.innerHTML =
        '<span class="fc-icon">' + (studied ? '✓' : '⌂') + '</span>' +
        '<span class="fc-name">' + f.name + '</span>' +
        (yearLocked ? '<span class="fc-locked">' + escapeHTML(lockText || '鎖') + '</span>' :
          (studied ? '<span class="fc-locked">已 研 習</span>' : ''));
      btn.disabled = yearLocked || locked;
      if (!btn.disabled) btn.addEventListener('click', () => openFacility(f));
      wrap.appendChild(btn);
    });
  }

  // 設定 mini-modal 圖片（無圖時優雅退場）
  function setHmImage(path) {
    const wrap = document.getElementById('hmImage');
    const img = document.getElementById('hmImg');
    if (!wrap || !img) return;
    wrap.setAttribute('hidden', '');
    img.onload = () => wrap.removeAttribute('hidden');
    img.onerror = () => { wrap.setAttribute('hidden', ''); img.removeAttribute('src'); };
    if (path) img.src = path; else img.removeAttribute('src');
  }

  function setEventImage(eventId) {
    const wrap = document.getElementById('emImage');
    const img = document.getElementById('emImg');
    if (!wrap || !img) return;
    wrap.setAttribute('hidden', '');
    img.onload = () => wrap.removeAttribute('hidden');
    img.onerror = () => { wrap.setAttribute('hidden', ''); img.removeAttribute('src'); };
    img.src = 'assets/events/' + eventId + '.webp';
  }

  // 研習設施（有考驗或見識）：全程限一次（key=fac:id）；客棧等純待一季者：每季可重複
  function facilityIsStudy(f) { return !!(f && (f.challenge || f.gain)); }
  function facilityUsedKey(f) {
    if (facilityIsStudy(f)) return 'fac:' + f.id;
    return f.id + '-' + gameState.currentYear + '-' + (gameState.currentSeason || 0);
  }

  // 客棧/茶肆「聽街知巷聞」：每城可結識的在地人物（與見聞卡共用 key，addToNetwork 去重）
  const CITY_LOCAL_PERSON = {
    beijing:   { key: 'wenxiang',     name: '文 祥',     relation: '軍機大臣 · 總理衙門核心 · 力主自強' },
    shanghai:  { key: 'zhengguanying', name: '鄭 觀 應', relation: '買辦出身 · 著《盛世危言》倡商戰變法' },
    fuzhou:    { key: 'shenbaozhen',  name: '沈 葆 楨',  relation: '船政大臣 · 主持福州船政局' },
    tianjin:   { key: 'shengxuanhuai', name: '盛 宣 懷', relation: '洋務實業之手 · 經辦招商局、電報局' },
    nanjing:   { key: 'xuefucheng',   name: '薛 福 成',  relation: '曾李幕僚 · 出使大臣 · 早期維新' },
    guangzhou: { key: 'huangzunxian', name: '黃 遵 憲',  relation: '外交官 · 著《日本國志》警醒國人' },
    kaiping:   { key: 'tangtingshu',  name: '唐 廷 樞',  relation: '開平礦務局總辦 · 招商局買辦' },
    wuhan:     { key: 'guhongming',   name: '辜 鴻 銘',  relation: '張之洞洋文案 · 學貫中西、性卻守舊' },
    hongkong:  { key: 'hoqi',         name: '何 啟',     relation: '西醫書院創辦 · 維新先聲（日後啟蒙革命）' },
    weihaiwei: { key: 'dengshichang', name: '鄧 世 昌',  relation: '致遠艦管帶 · 日後黃海死戰殉國' },
    japan:     { key: 'itohirobumi',  name: '伊 藤 博 文', relation: '明治元勳 · 日本首相（他日馬關之敵）' }
  };

  // 客棧結識：每城一段對話（扣當地史事；談畢方入冊）
  const CITY_LOCAL_VIGNETTE = {
    beijing: { kicker: '京 師 客 邸',
      text: '會館的茶座上，一位氣度沉穩的軍機大臣正與人低語朝局。有人引你過去——竟是文祥。「自強之事，朝中肯點頭的，十不得一；你我能做的，是把能做的先做了。」',
      choices: [
        { label: '請教中樞如何推動洋務', axis: 'system', reply: '他細說總理衙門如何在守舊聲中為新政開路。你記下：制度的縫隙，也是改革的起點。' },
        { label: '問他自強最大的阻力', axis: 'thought', reply: '「不在洋人，在人心。」一句道破。你忽然明白：器物易得，人心難轉。' }
      ] },
    shanghai: { kicker: '滬 上 茶 寮',
      text: '十里洋場的茶寮裡，一位買辦出身的儒商正談「商戰」二字——他便是著《盛世危言》的鄭觀應。「兵戰不如商戰；洋人以商奪我利權，我亦當以商還擊。」',
      choices: [
        { label: '請教商戰之道', axis: 'material', reply: '他講招商局如何與洋輪爭利。你記下：富國，才是強國的根。' },
        { label: '問他變法之見', axis: 'system', reply: '「徒學器械，末也；通上下之情、開議院，本也。」其言已近維新。' }
      ] },
    fuzhou: { kicker: '閩 江 官 廨',
      text: '船政衙署旁的客舍，船政大臣沈葆楨剛從船塢回來，衣上猶帶煤煙氣。「造一艦易，育一才難——船政真正要造的，是人。」',
      choices: [
        { label: '請教船政成效', axis: 'material', reply: '他歷數已下水的兵輪。你記下：中國的近代海軍，正從這條江口起步。' },
        { label: '問他經費之困', axis: 'system', reply: '「謗我糜費者眾；可不費，何以育才？」洋務之難，盡在此一歎。' }
      ] },
    tianjin: { kicker: '津 門 帳 房',
      text: '海河邊的帳房裡，一位精明的洋務幹員正盤算招商局與電報局的帳——他是盛宣懷。「辦實業，先要算得清帳；空談自強，不如多開一條電報線。」',
      choices: [
        { label: '請教官督商辦', axis: 'system', reply: '他剖析官與商如何分權合利、又如何互相掣肘。你記下：制度，決定實業的生死。' },
        { label: '問他實業之要', axis: 'material', reply: '「輪船、電報、礦、紡——環環相扣。」一張近代實業的網，在他口中徐徐展開。' }
      ] },
    nanjing: { kicker: '江 寧 書 齋',
      text: '督署附近的書齋，一位曾、李幕府的智囊正整理出使歐洲的日記——他是薛福成。「親眼見過泰西議院與工廠，才知我輩所學，不過皮毛。」',
      choices: [
        { label: '請教出洋見聞', axis: 'thought', reply: '他談歐洲的政制與民氣。你記下：變的不只是器物，是整個世道。' },
        { label: '問他變法之策', axis: 'system', reply: '「欲圖自強，須變成法。」早期維新的種子，已在他筆下。' }
      ] },
    guangzhou: { kicker: '粵 海 會 館',
      text: '廣州的會館裡，一位剛從日本歸來的外交官正談東瀛維新——他是著《日本國志》的黃遵憲。「日本變法二十年，脫胎換骨；此書我寫了，只怕無人肯讀。」',
      choices: [
        { label: '請教日本維新', axis: 'system', reply: '他細述明治如何全面改制。你心頭一凜：這個鄰邦，已非昔日之倭。' },
        { label: '問他中日之別', axis: 'thought', reply: '「彼變其本，我變其末。」一語道破甲午未戰先決的勝負。' }
      ] },
    kaiping: { kicker: '開 平 礦 局',
      text: '礦務局的客廳，總辦唐廷樞剛從礦井上來，正籌劃一條運煤的鐵路。「有煤有鐵有路，洋務才有根；沒有這些，船炮不過是空架子。」',
      choices: [
        { label: '請教煤鐵之利', axis: 'material', reply: '他談開平煤如何供應輪船與機器。你記下：實業的底層，是資源與運輸。' },
        { label: '問他鐵路之爭', axis: 'system', reply: '「修一條唐胥鐵路，朝中吵了三年。」守舊之頑，於此可見。' }
      ] },
    wuhan: { kicker: '江 漢 洋 館',
      text: '張之洞幕府的洋館裡，一位拖著長辮、通曉九種語文的怪才正用英文數落英國——他是辜鴻銘。「我精通西學，所以更知中學之可貴；爾等棄本逐末，可笑。」',
      choices: [
        { label: '與他辯中西之學', axis: 'thought', reply: '一場唇槍舌劍。你未必認同，卻見識了「中體西用」最極端的一張面孔。' },
        { label: '請教張之洞新政', axis: 'material', reply: '他談漢陽鐵廠與兩湖學堂。後期洋務的格局，在他口中漸次清晰。' }
      ] },
    hongkong: { kicker: '香 港 西 醫',
      text: '西醫書院的講堂外，一位留英歸來、西裝革履的華人紳商正與學生談新政——他是何啟。「醫人、醫國，理本相通；中國這身病，要從根上治。」',
      choices: [
        { label: '請教新學與維新', axis: 'thought', reply: '他談西學如何育人、新政如何救國。你隱約看見維新與革命的前夜。' },
        { label: '問他香港之用', axis: 'system', reply: '「華洋雜處之地，正是新思潮的窗口。」一扇看世界的窗，在此敞開。' }
      ] },
    weihaiwei: { kicker: '劉 公 島 畔',
      text: '北洋水師基地的營房，一位治軍嚴明的管帶正擦拭佩刀——他是致遠艦的鄧世昌。「艦可以舊，志不可墮；設有戰事，世昌願與艦共存亡。」',
      choices: [
        { label: '請教北洋海軍', axis: 'material', reply: '他歷數定遠、致遠諸艦。你記下：這是洋務「強兵」的巔峰——也將是它的墓碑。' },
        { label: '敬他死戰之志', axis: 'thought', reply: '你向這位軍人深深一揖。多年後黃海的炮聲裡，你會記起今日他眼中的光。' }
      ] },
    japan: { kicker: '橫 濱 洋 樓',
      text: '橫濱的西式洋樓裡，一位留學英國歸來、氣度逼人的明治重臣正與西人談笑風生。有人低聲告訴你：此人名伊藤博文。「貴國地大物博，可惜……只學了我們也在學的西洋皮毛。」',
      choices: [
        { label: '冷眼記下此人', axis: 'system', reply: '你不動聲色，將這個名字與這張臉牢牢記住。他日馬關談判桌對面，正是此人。' },
        { label: '探問日本國策', axis: 'thought', reply: '他直言不諱：日本要的不是自保，是大陸。你脊背發涼——強敵的野心，已寫在臉上。' }
      ] }
  };
  // 插曲/結識卡頭圖：傳城市 key→用該城場景圖；傳路徑→直接用；空→隱藏
  function setInterludeImage(ref) {
    const fig = document.getElementById('ilImg');
    const img = document.getElementById('ilImgEl');
    if (!fig || !img) return;
    let src = '';
    if (ref) src = /[/.]/.test(ref) ? ref : ('assets/city/city-' + ref + '.webp');
    if (src) { img.src = src; fig.removeAttribute('hidden'); }
    else { img.removeAttribute('src'); fig.setAttribute('hidden', ''); }
  }

  // 客棧對話：開一段 vignette，談畢方結識（重用插曲 modal）
  function openInnVignette(city, person) {
    const v = CITY_LOCAL_VIGNETTE[city];
    const modal = document.getElementById('interludeModal');
    if (!v || !modal || !person) { if (person) addToNetwork(person.key, person.name, person.relation); return; }
    const setText = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
    setInterludeImage(city);
    setText('ilKicker', v.kicker || '聽 街 知 巷 聞');
    setText('ilTitle', person.name);
    setText('ilText', v.text);
    const dseEl = document.getElementById('ilDse'); if (dseEl) dseEl.setAttribute('hidden', '');
    const opts = document.getElementById('ilOptions');
    if (opts) {
      opts.innerHTML = '';
      (v.choices || []).forEach((opt) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'il-option';
        b.innerHTML = '<span class="ilo-label">' + escapeHTML(opt.label) + '</span>';
        b.addEventListener('click', () => resolveInnVignette(person, opt));
        opts.appendChild(b);
      });
    }
    modal.dataset.kind = 'vignette';
    openManagedModal('interludeModal');
  }
  function resolveInnVignette(person, opt) {
    const opts = document.getElementById('ilOptions');
    if (opts) {
      opts.innerHTML = '<p class="il-note">' + escapeHTML(stripDseTag(opt.reply || '')) + '</p>' +
        '<button class="il-option il-continue" type="button" id="ilMeet">結 識 ' + escapeHTML((person.name || '').trim()) + ' →</button>';
      document.getElementById('ilMeet')?.addEventListener('click', () => {
        hideManagedModal('interludeModal');
        addToNetwork(person.key, person.name, person.relation);
      });
    }
  }
  function isRestInn(f) { return !facilityIsStudy(f); }   // 無 gain/challenge ＝ 客棧（聽街談）
  function cityLocalPersonPending() {
    const p = CITY_LOCAL_PERSON[gameState.currentCity];
    if (!p || (gameState.network || []).some((x) => x.key === p.key)) return null;
    return p;
  }

  function openFacility(f) {
    const hm = document.getElementById('hotspotModal');
    if (!hm) return;
    const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    delete hm.dataset.pendingAxis;
    delete hm.dataset.pendingUnlock;
    delete hm.dataset.pendingEvidence;
    setText('hmName', f.name);
    setText('hmDesc', f.desc);
    setHmImage('assets/facility/' + f.id + '.webp');
    setText('hmAxis', f.gain
      ? ('耗 1 季 · + ' + f.gain.amount + ' ' + (AXIS_NAMES[f.gain.axis] || ''))
      : (isRestInn(f) && cityLocalPersonPending() ? '耗 1 季 · 聽 街 知 巷 聞 · 或 結 識 當 地 人 物' : '耗 1 季 · 靜 候 時 機'));

    const action = document.getElementById('hmAction');
    if (action) {
      action.removeAttribute('hidden');
      const usedThisYear = !!(gameState.facilityUsed && gameState.facilityUsed[facilityUsedKey(f)]);
      if (optionalActionsLocked()) {
        action.textContent = '要 事 待 辦 於 他 城 · 暫 不 得 前 往';
        action.disabled = true; action.onclick = null;
      } else if (usedThisYear) {
        action.textContent = facilityIsStudy(f) ? '已 研 習 · 不 再 重 複' : '本 季 已 前 往';
        action.disabled = true; action.onclick = null;
      } else {
        action.textContent = '前 往 · 耗 一 季 →';
        action.disabled = false;
        action.onclick = () => useFacility(f);
      }
    }
    openManagedModal('hotspotModal');
  }

  let currentFacility = null;

  function useFacility(f) {
    if (gameState.locked) return;
    if (gameState.facilityUsed && gameState.facilityUsed[facilityUsedKey(f)]) return;
    const hm = document.getElementById('hotspotModal');
    if (hm) hideManagedModal('hotspotModal');
    if (f.challenge) startFacilityTask(f);
    else finishFacilityVisit(f, false);  // 客棧等無考驗：純耗一季
  }

  // 設施研習：先作研習回應（不罰：判斷得宜 +見識、失準 +0），再耗一季
  function startFacilityTask(f) {
    const modal = document.getElementById('eventModal');
    if (!modal || !f.challenge) { finishFacilityVisit(f, false); return; }
    currentFacility = f;
    currentEventId = null;
    modal.dataset.kind = 'free';
    modal.dataset.mode = 'facility';
    modal.dataset.phase = 'challenge';
    openManagedModal('eventModal');
    const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    setText('emChallengeKicker', '研 習 · ' + f.name);
    setText('emChallengeQ', f.challenge.q);
    const optsEl = document.getElementById('emChallengeOptions');
    if (!optsEl) return;
    optsEl.innerHTML = '';
    const btns = [];
    f.challenge.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'em-challenge-opt';
      btn.type = 'button';
      btn.innerHTML = '<span class="emo-mark">問</span><span class="emo-label">' + opt.label + '</span>';
      btn.addEventListener('click', () => gradeFacility(f, idx, btns));
      optsEl.appendChild(btn);
      btns.push(btn);
    });
  }

  function gradeFacility(f, pickedIdx, btns) {
    const modal = document.getElementById('eventModal');
    const ch = f.challenge;
    if (!modal || !ch) return;
    const correct = !!(ch.options[pickedIdx] && ch.options[pickedIdx].correct);
    if (correct) gameState.challengeCorrect = (gameState.challengeCorrect || 0) + 1;
    btns.forEach((b, i) => { b.disabled = true; if (ch.options[i].correct) b.classList.add('is-correct'); });
    if (!correct) btns[pickedIdx] && btns[pickedIdx].classList.add('is-wrong');
    // 學習不罰：判斷得宜才加見識
    if (correct && f.gain && gameState.axes[f.gain.axis] !== undefined) {
      gameState.axes[f.gain.axis] = Math.min(
        gameState.axesMax[f.gain.axis],
        (gameState.axes[f.gain.axis] || 0) + f.gain.amount
      );
    }
    const correctOpt = ch.options.find((o) => o.correct);
    recordQuiz({
      q: stripDseTag(ch.q), picked: ch.options[pickedIdx] ? ch.options[pickedIdx].label : '',
      answer: correctOpt ? correctOpt.label : '', correct: correct,
      explain: stripDseTag(ch.explain || ''), dse: ch.dse || extractDseTag(ch.explain),
      source: f.name || ''
    });
    setTimeout(() => {
      modal.dataset.phase = 'result';
      const mark = document.getElementById('emResultMark');
      if (mark) { mark.textContent = correct ? '所 學 可 用' : '再 作 研 讀'; mark.dataset.correct = correct ? 'true' : 'false'; }
      const badge = document.getElementById('emResultBadge');
      if (badge) {
        if (correct && f.gain) { badge.style.display = ''; badge.textContent = '+ ' + f.gain.amount + ' ' + AXIS_NAMES[f.gain.axis]; badge.dataset.axis = f.gain.axis; }
        else { badge.style.display = ''; badge.textContent = '無 加 成'; badge.removeAttribute('data-axis'); }
      }
      const explainEl = document.getElementById('emResultExplain');
      if (explainEl) explainEl.textContent = stripDseTag(correct
        ? (ch.explain || '')
        : ('師傅提醒：若從「' + (correctOpt ? correctOpt.label : '') + '」入手，這門技藝會更易看清。' + (ch.explain || '')));
    }, 700);
  }

  // 結束設施研習：標記本季已用 + 耗一季
  function finishFacilityTask() {
    const f = currentFacility;
    const modal = document.getElementById('eventModal');
    if (modal) { modal.setAttribute('hidden', ''); delete modal.dataset.phase; delete modal.dataset.mode; delete modal.dataset.kind; }
    currentFacility = null;
    if (f) finishFacilityVisit(f, false);  // 加成已在 gradeFacility 套用
  }

  // 共用：標記使用 + 耗一季 + 刷新（withReward 用於無考驗但有加成的設施，目前無）
  function finishFacilityVisit(f, withReward) {
    gameState.facilityUsed = gameState.facilityUsed || {};
    gameState.facilityUsed[facilityUsedKey(f)] = true;
    // 客棧/茶肆：聽街知巷聞，先一段對話，談畢方結識當地人物（一次性）
    if (isRestInn(f)) {
      const cityNow = gameState.currentCity;
      const p = CITY_LOCAL_PERSON[cityNow];
      if (p && !(gameState.network || []).some((x) => x.key === p.key)) {
        if (CITY_LOCAL_VIGNETTE[cityNow]) setTimeout(() => openInnVignette(cityNow, p), 450);
        else addToNetwork(p.key, p.name, p.relation);
      }
    }
    if (withReward && f.gain && gameState.axes[f.gain.axis] !== undefined) {
      gameState.axes[f.gain.axis] = Math.min(
        gameState.axesMax[f.gain.axis],
        (gameState.axes[f.gain.axis] || 0) + f.gain.amount
      );
    }
    advanceSeason(1);   // 研習 = 主動行動，消耗一季
    refreshAxes();
    flashSceneTagline(f.name + ' · 歲 月 一 季 流 轉');
    updateCityMissionSheet(CITY_SCENES[gameState.currentCity], '已完成：' + f.name);
  }

  // 鐵釘自動觸發檢查
  // onCityEnter = true 表示是進城時觸發
  // 觸發規則：
  //   - 地圖只發出「歷史召喚」，不直接彈事件
  //   - 所有鐵釘都必須進入對應城市後才觸發
  //   - 最早一個「逾期或本年、未見證」的鐵釘會鎖定玩家前往該城
  function findDueTravelPinned() {
    const years = Object.keys(PINNED_BY_YEAR).map(Number).sort((a, b) => a - b);
    for (let i = 0; i < years.length; i++) {
      const y = years[i];
      if (y > gameState.currentYear) break;
      const id = PINNED_BY_YEAR[y];
      if (gameState.completedEvents.has(id)) continue;
      const ev = EVENTS[id];
      if (ev && ev.city) return id;
    }
    return null;
  }

  // #1 朝鮮前置：東學黨（甲午導火線）觸發前，必先親歷「漢城風雲」見聞
  function resolvePinnedToOpen(id) {
    if (id === 'e_korea_donghak' && !gameState.completedEvents.has('e_korea_situation')) {
      return 'e_korea_situation';
    }
    return id;
  }

  function checkAndTriggerPinned(onCityEnter) {
    const fireDelay = onCityEnter ? 600 : 1650;
    const canWitnessInCurrentCity = (ev) =>
      !!(ev && ev.city && gameState.currentCity === ev.city && (onCityEnter || citySceneIsOpen()));

    // 0. 待辦鐵釘：抵達指定城即觸發（不論年份是否已過）
    if (gameState.pendingPinnedId) {
      const ev = EVENTS[gameState.pendingPinnedId];
      if (canWitnessInCurrentCity(ev) && !gameState.completedEvents.has(gameState.pendingPinnedId)) {
        const pid = gameState.pendingPinnedId;
        if (shouldDeferPinnedForCoreLoop(ev, onCityEnter)) {
          gameState.locked = true;
          gameState.pendingPinnedCity = ev.city;
          showForcePrompt(ev.city);
          refreshActionList();
          return;
        }
        gameState.locked = false; gameState.pendingPinnedCity = null; gameState.pendingPinnedId = null;
        clearForcePrompt(); refreshActionList();
        setTimeout(() => openEvent(resolvePinnedToOpen(pid)), fireDelay);
      } else if (ev && ev.city) {
        gameState.locked = true;
        gameState.pendingPinnedCity = ev.city;
        showForcePrompt(ev.city);
        refreshActionList();
      }
      return;
    }

    // 1. 逾期／本年的鐵釘 → 抵城即觸發，否則設待辦逼親往
    const tid = findDueTravelPinned();
    if (tid) {
      const ev = EVENTS[tid];
      if (canWitnessInCurrentCity(ev)) {
        if (shouldDeferPinnedForCoreLoop(ev, onCityEnter)) {
          gameState.locked = true;
          gameState.pendingPinnedCity = ev.city;
          gameState.pendingPinnedId = tid;
          showForcePrompt(ev.city);
          refreshActionList();
          return;
        }
        gameState.locked = false; gameState.pendingPinnedCity = null; gameState.pendingPinnedId = null;
        clearForcePrompt();
        setTimeout(() => openEvent(resolvePinnedToOpen(tid)), fireDelay);
      } else {
        gameState.locked = true;
        gameState.pendingPinnedCity = ev.city;
        gameState.pendingPinnedId = tid;
        showForcePrompt(ev.city);
        refreshActionList();
      }
      return;
    }

    // 2. 無待辦
    gameState.locked = false;
    gameState.pendingPinnedCity = null;
  }

  function showForcePrompt(cityKey) {
    const hint = document.getElementById('topbarHint');
    if (!hint) return;
    const cityName = (CITIES[cityKey]?.name || cityKey).replace(/\s+/g, '');
    const ev = gameState.pendingPinnedId ? EVENTS[gameState.pendingPinnedId] : null;
    hint.textContent = '急 報 入 卷 · 速 往 ' + cityName + (ev ? ' · 「' + ev.title + '」' : ' · 有 要 事 待 辦');
    hint.style.color = 'rgba(232, 100, 80, 0.98)';
    hint.style.fontWeight = '500';
    hint.classList.add('topbar-hint--force');
    highlightTargetCity(cityKey);
    if (ev) {
      updateJournalNextStep({ year: ev.year, eventId: gameState.pendingPinnedId, event: ev }, cityName);
    }
  }
  function clearForcePrompt() {
    const hint = document.getElementById('topbarHint');
    if (!hint) return;
    hint.style.color = '';
    hint.style.fontWeight = '';
    hint.classList.remove('topbar-hint--force');
    highlightTargetCity(null);
  }

  // ---------- 地圖放大至城市（事件前儀式） ----------
  function zoomMapToCity(cityKey) {
    const mapPan = document.getElementById('mapPan');
    if (!mapPan) return;
    if (!cityKey) {
      mapPan.classList.remove('map-pan--zoomed');
      mapPan.style.transformOrigin = '';
      mapPan.style.transform = '';
      return;
    }
    const c = CITIES[cityKey];
    if (!c) return;
    const ox = (c.x / 1600 * 100);
    const oy = (c.y / 1000 * 100);
    mapPan.style.transformOrigin = ox + '% ' + oy + '%';
    mapPan.style.transform = 'scale(1.85)';
    mapPan.classList.add('map-pan--zoomed');
  }

  // ---------- 指引：當前要務（依完整鐵釘路線圖 PINNED_EVENTS） ----------
  // 下一個「已接線」(可真正觸發) 的鐵釘：{year, eventId, event}
  function nextWiredPinned() {
    const years = Object.keys(PINNED_BY_YEAR).map(Number).sort((a, b) => a - b);
    for (let i = 0; i < years.length; i++) {
      const y = years[i];
      if (y < gameState.currentYear) continue;
      const id = PINNED_BY_YEAR[y];
      if (!id || gameState.completedEvents.has(id)) continue;
      const ev = EVENTS[id];
      if (!ev) continue;
      return { year: y, eventId: id, event: ev };
    }
    return null;
  }

  function seasonsUntilYear(year) {
    if (year <= gameState.currentYear) return 0;
    return Math.max(0, (year - gameState.currentYear) * 4 - (gameState.currentSeason || 0));
  }

  function timeUntilText(year) {
    const seasons = seasonsUntilYear(year);
    if (seasons <= 0) return '時 機 已 至';
    const years = Math.floor(seasons / 4);
    const rest = seasons % 4;
    if (years && rest) return '尚 餘 ' + years + ' 年 ' + rest + ' 季';
    if (years) return '尚 餘 ' + years + ' 年';
    return '尚 餘 ' + rest + ' 季';
  }

  // 在地圖上高亮目標城市印章
  function highlightTargetCity(cityKey) {
    const seals = document.getElementById('citySeals');
    if (seals) seals.classList.toggle('seals-summon', !!cityKey);
    document.querySelectorAll('#citySeals .city-seal').forEach((g) => {
      g.classList.toggle('city-seal--target', !!cityKey && g.dataset.cityKey === cityKey);
    });
  }

  function nextPinnedForCity(cityKey) {
    let target = null;
    Object.keys(PINNED_BY_YEAR).forEach((y) => {
      const yr = Number(y);
      const id = PINNED_BY_YEAR[y];
      const ev = EVENTS[id];
      if (!ev || ev.city !== cityKey || gameState.completedEvents.has(id)) return;
      if (yr < gameState.currentYear) return;
      if (yr === gameState.currentYear && gameState.currentSeason > 0) return;
      if (!target || yr < target.year) target = { year: yr, eventId: id, event: ev };
    });
    return target;
  }

  function goToLetterTargetCity(cityKey) {
    const c = CITIES[cityKey];
    if (!c) return;
    gameState.mainlineTargetCity = cityKey;
    highlightTargetCity(cityKey);
    if (currentRoute) renderCitySeals(currentRoute, gameState.currentYear, gameState.currentCity);
    updateGuidanceHint();
    saveGame();
    if (citySceneIsOpen()) {
      flashSceneTagline('已 記 入 手 卷 · ' + c.name.replace(/\s+/g, '') + ' 為 下 一 站');
    } else {
      flashHint('已 標 記 下 一 站 · ' + c.name);
    }
  }

  // 某城目前「可探訪的選修線索」數（年代已到、未完成、非鐵釘）
  function countCityClues(cityKey) {
    const scene = CITY_SCENES[cityKey];
    if (!scene) return 0;
    return (scene.actionEvents || []).filter((id) => isCityClueOpen(cityKey, id, scene)).length;
  }

  // 支柱二·多線引導：在要務之外，列出「另可探訪」的城（已解鎖、有選修內容），可點擊直達
  function renderSideContent() {
    const el = document.getElementById('topbarSide');
    if (!el) return;
    el.innerHTML = '';
    const unlocks = ROUTE_CITY_UNLOCK[currentRoute] || ROUTE_CITY_UNLOCK.free;
    const items = Object.keys(unlocks).filter((key) => {
      if (key === gameState.currentCity) return false;
      if (gameState.currentYear < unlocks[key]) return false;          // 未解鎖
      if (!cityScenePlayable(CITY_SCENES[key])) return false;
      return cityHasContent(key);
    }).map((key) => ({ key, name: (CITIES[key]?.name || '').replace(/\s+/g, ''), n: countCityClues(key) }));
    const suspenses = activeSuspenses();
    if (!items.length && !suspenses.length) { el.setAttribute('hidden', ''); return; }
    el.removeAttribute('hidden');
    // 懸案（紅色警示）優先列出，形成「不奔走就失血」的拉力
    suspenses.forEach((s) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'side-chip side-chip--alert';
      chip.innerHTML = '<span class="side-name">⚠ ' + (CITIES[s.city]?.name || '').replace(/\s+/g, '') + ' · ' + (s.title || '').replace(/\s+/g, '') + '</span>';
      chip.addEventListener('click', () => openSuspense(s));
      el.appendChild(chip);
    });
    if (items.length) {
      const lead = document.createElement('span');
      lead.className = 'side-lead';
      lead.textContent = '另 可 探 訪 ·';
      el.appendChild(lead);
      items.forEach((it) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'side-chip';
        chip.innerHTML = '<span class="side-name">' + it.name + '</span>' +
          (it.n ? '<span class="side-n">' + it.n + '</span>' : '');
        chip.addEventListener('click', () => onCityClick(it.key));
        el.appendChild(chip);
      });
    }
  }

  function updateGuidanceHint() {
    updateAdvanceControls();
    renderJournalEvidence();
    const hint = document.getElementById('topbarHint');
    if (!hint) return;

    // 0. 有待辦旅行要事（可能逾期）→ 永遠優先顯示目標城，杜絕空白／矛盾指引
    if (gameState.pendingPinnedId && gameState.pendingPinnedCity) {
      showForcePrompt(gameState.pendingPinnedCity);
      const side = document.getElementById('topbarSide');
      if (side) { side.innerHTML = ''; side.setAttribute('hidden', ''); }   // 強制待辦時不分心
      return;
    }
    renderSideContent();
    // 待辦已清：移除殘留的強制提示樣式，避免凍結指引
    if (hint.classList.contains('topbar-hint--force')) clearForcePrompt();

    const p = nextWiredPinned();
    if (!p) {
      if (gameState.mainlineTargetCity && CITIES[gameState.mainlineTargetCity]) {
        const c = CITIES[gameState.mainlineTargetCity];
        hint.textContent = '書 信 所 指 · ' + c.name.replace(/\s+/g, '') + ' 已 標 記 為 下 一 站';
        hint.style.color = '';
        highlightTargetCity(gameState.mainlineTargetCity);
        updateJournalNextStep(null);
        return;
      }
      hint.textContent = '自 由 探 索 · 探 訪 線 索、研 習 設 施，累 積 見 識';
      hint.style.color = '';
      highlightTargetCity(null);
      updateJournalNextStep(null);
      return;
    }
    const ev = p.event;
    const cityName = (CITIES[ev.city]?.name || '').replace(/\s+/g, '');
    const dueText = timeUntilText(p.year);
    hint.textContent = (seasonsUntilYear(p.year) <= 0)
      ? ('速 往 ' + cityName + ' · 朱 砂 印 已 亮 · 「' + ev.title + '」')
      : ('將 有 要 事 於 ' + cityName + ' · ' + dueText);   // 未到期不劇透事件名，保留神秘
    highlightTargetCity(ev.city);
    hint.style.color = '';
    updateJournalNextStep(p, cityName);
  }

  function renderJournalEvidence() {
    const summary = document.getElementById('juanSummary');
    const list = document.getElementById('juanEvidenceList');
    const visited = (gameState.citiesVisited || []).length;
    const evidence = gameState.evidenceLedger || [];
    let freeTasks = 0;
    gameState.completedEvents.forEach((id) => {
      const ev = EVENTS[id];
      if (ev && ev.type !== 'pinned') freeTasks++;
    });

    if (summary) {
      summary.innerHTML =
        '<p><span>所 到</span><em>' + visited + ' 城</em></p>' +
        '<p><span>證 據</span><em>' + evidence.length + ' 件</em></p>' +
        '<p><span>任 務</span><em>' + freeTasks + ' 件</em></p>';
    }
    if (!list) return;
    if (!evidence.length) {
      list.innerHTML = '<p class="panel-empty">尚 未 收 錄 證 據</p>';
      renderJournalTasks();
      return;
    }
    list.innerHTML = evidence.slice().reverse().map((e) => {
      const cityName = (CITIES[e.city]?.name || e.city || '').replace(/\s+/g, '');
      const axis = AXIS_NAMES[e.axis] || e.axis || '見識';
      const season = SEASON_NAMES[e.season] || '';
      const ev = e.unlocks ? EVENTS[e.unlocks] : null;
      const task = ev ? ev.title : '城市觀察';
      const evidenceText = e.evidenceText || '';
      return '<article class="jv-item">' +
        '<span class="jv-city">' + escapeHTML(cityName) + '</span>' +
        '<span class="jv-name">' + escapeHTML(e.name) + '</span>' +
        '<em class="jv-meta">' + escapeHTML(e.year + ' · ' + season + ' · ' + axis) + '</em>' +
        '<span class="jv-task">' + escapeHTML('對應任務 · ' + task) + '</span>' +
        (evidenceText ? '<span class="jv-evidence">' + escapeHTML(stripDseTag(evidenceText)) + '</span>' : '') +
      '</article>';
    }).join('');
    renderJournalTasks();
  }

  function renderJournalTasks() {
    const slot = document.getElementById('juanTaskList');
    if (!slot) return;
    const cityKey = gameState.currentCity;
    const scene = CITY_SCENES[cityKey];
    if (!scene || !cityScenePlayable(scene)) {
      slot.innerHTML = '<p class="panel-empty">尚 未 入 城</p>';
      return;
    }

    const ids = (scene.actionEvents || []).filter((eventId) => {
      const ev = EVENTS[eventId];
      return ev && ev.type !== 'pinned' && (ev.appearFromYear || 0) <= gameState.currentYear;
    });
    if (!ids.length) {
      slot.innerHTML = '<p class="panel-empty">此 城 暫 無 任 務</p>';
      return;
    }

    const locked = optionalActionsLocked();
    slot.innerHTML = ids.map((eventId) => {
      const ev = EVENTS[eventId];
      const done = gameState.completedEvents.has(eventId);
      const found = eventEvidenceCount(eventId, scene);
      const required = eventEvidenceRequired(eventId, scene);
      const evidenceReady = found >= required;
      const unlocked = (gameState.unlockedEvents || new Set()).has(eventId) || evidenceReady;
      if (evidenceReady && !done) {
        gameState.unlockedEvents = gameState.unlockedEvents || new Set();
        gameState.unlockedEvents.add(eventId);
      }
      const goal = taskGoalText(ev, eventId, scene);
      const status = done ? '已入卷' : (locked ? '暫停' : (unlocked ? '可開始' : '尋證中'));
      const stateClass = done ? ' is-done' : (unlocked ? ' is-ready' : ' is-locked');
      return '<article class="jt-item' + stateClass + '">' +
        '<div class="jt-head">' +
          '<span class="jt-status">' + escapeHTML(status) + '</span>' +
          '<strong class="jt-title">' + escapeHTML(goal) + '</strong>' +
        '</div>' +
        '<p class="jt-desc">' + escapeHTML(stripDseTag(ev.setup || ev.title || '')) + '</p>' +
        '<div class="jt-meta">' +
        '<span>證據 ' + found + '/' + required + '</span>' +
        '<span>' + escapeHTML(AXIS_NAMES[ev.challenge?.axis || ev.choices?.[0]?.axis] || '見識') + '</span>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function updateJournalNextStep(p, locTxt) {
    const slot = document.getElementById('juanNextStep');
    if (!slot) return;
    if (!p) {
      slot.innerHTML = '<p class="panel-empty">暫無指定要事 · 自由探索</p>';
      return;
    }
    const ev = p.event;
    const dueText = timeUntilText(p.year);
    slot.innerHTML =
      '<p class="jns-line"><span class="jns-label">下一要事</span><span class="jns-val">' + (ev.title || '') + '</span></p>' +
      '<p class="jns-line"><span class="jns-label">所在</span><span class="jns-val">' + (locTxt || '') + '</span></p>' +
      '<p class="jns-line"><span class="jns-label">時候</span><span class="jns-val">' + p.year + ' · ' + dueText + '</span></p>';
  }

  // A4 · 「推至要事」按鈕：無下一鐵釘時置灰
  function updateAdvanceControls() {
    const btn = document.getElementById('cityAdvanceNext');
    if (!btn) return;
    const p = nextWiredPinned();
    if (p) {
      btn.disabled = false;
      btn.querySelector('.cs-text').textContent = '推 至 要 事';
    } else {
      btn.disabled = true;
      btn.querySelector('.cs-text').textContent = '暫 無 要 事';
    }
  }

  function closeCityScene() {
    const sc = document.getElementById('cityScene');
    if (!sc) return;
    sc.setAttribute('hidden', '');
    delete sc.dataset.phase;
    const hm = document.getElementById('hotspotModal');
    if (hm) hm.setAttribute('hidden', '');
    setMissionSheetExpanded(false);
  }

  function getEvidenceTask(cityKey, hotspotId) {
    return EVIDENCE_TASKS[taskKey(cityKey, hotspotId)] || null;
  }

  function openEvidenceTask(cityKey, hs, btn) {
    const task = getEvidenceTask(cityKey, hs.id);
    if (!task) return false;
    const modal = document.getElementById('evidenceTaskModal');
    if (!modal) return false;
    currentEvidenceTask = task;
    currentEvidenceHotspot = hs;
    currentEvidenceButton = btn;
    taskRuntime = { selections: {}, selected: null, sequenceIndex: 0 };
    modal.dataset.taskType = task.type;
    modal.dataset.phase = 'task';

    const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    setText('etTitle', task.title);
    setText('etPrompt', task.prompt);
    setText('etInstruction', task.instruction);
    setText('etFeedback', '');
    document.getElementById('etFeedback')?.classList.remove('et-feedback--toast');
    document.getElementById('etRevealDone')?.remove();   // 清除上次 reveal 殘留鈕
    const submit = document.getElementById('etSubmit');
    if (submit) {
      submit.disabled = true;
      submit.textContent = '收 錄 證 據 →';                // 重置（reveal 會改成「探訪→/完成」）
      submit.onclick = completeEvidenceTask;
    }
    // 非 find 任務頂部加該熱點特寫圖 banner（find 的圖在 body 內，不重複）
    const banner = document.getElementById('etBanner');
    const bannerImg = document.getElementById('etBannerImg');
    if (banner && bannerImg) {
      if (task.type !== 'findImage') {
        banner.setAttribute('hidden', '');
        bannerImg.onload = () => banner.removeAttribute('hidden');
        bannerImg.onerror = () => { banner.setAttribute('hidden', ''); bannerImg.removeAttribute('src'); };
        bannerImg.src = 'assets/hotspot/' + hs.id + '.webp';
      } else {
        banner.setAttribute('hidden', '');
        bannerImg.removeAttribute('src');
      }
    }
    renderEvidenceTaskBody(task);
    openManagedModal('evidenceTaskModal');
    return true;
  }

  function closeEvidenceTaskModal() {
    document.getElementById('etRevealDone')?.remove();
    const modal = document.getElementById('evidenceTaskModal');
    if (modal) hideManagedModal('evidenceTaskModal');
    if (modal) {
      delete modal.dataset.taskType;
      delete modal.dataset.phase;
    }
    currentEvidenceTask = null;
    currentEvidenceHotspot = null;
    currentEvidenceButton = null;
    taskRuntime = null;
  }

  function renderEvidenceTaskBody(task) {
    const body = document.getElementById('etBody');
    if (!body) return;
    body.innerHTML = '';
    if (task.type === 'sequence') renderSequenceTask(body, task);
    if (task.type === 'pick') renderPickTask(body, task);
    if (task.type === 'classify') renderClassifyTask(body, task);
    if (task.type === 'findImage') renderFindImageTask(body, task);
  }

  // 圖中尋證：在熱點特寫圖上點出正確的人/物（誤點正確誤區給提示）
  function renderFindImageTask(body, task) {
    const wrap = document.createElement('div');
    wrap.className = 'et-find';
    const img = document.createElement('img');
    img.className = 'et-find-img';
    img.alt = '';
    // 保險：圖片尚未生成時不卡死——顯示提示並允許過關（之後出圖再對圖調座標）
    img.onerror = () => {
      wrap.classList.add('et-find--noimg');
      img.setAttribute('hidden', '');
      if (!wrap.querySelector('.et-find-fallback')) {
        const fb = document.createElement('div');
        fb.className = 'et-find-fallback';
        fb.textContent = '（此處特寫圖待補；點此暫且記下）';
        fb.addEventListener('click', () => { if (taskRuntime) taskRuntime.findSolved = true; setTaskSubmitReady(true, task.success); });
        wrap.appendChild(fb);
      }
    };
    img.src = task.image;
    wrap.appendChild(img);
    // 可發現性：圖上明示這是「點圖作答」任務
    const badge = document.createElement('span');
    badge.className = 'et-find-badge';
    badge.textContent = '🔍 點 圖 作 答';
    wrap.appendChild(badge);
    const marker = document.createElement('span');
    marker.className = 'et-find-marker';
    marker.setAttribute('hidden', '');
    wrap.appendChild(marker);

    const inRect = (px, py, r) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;

    wrap.addEventListener('click', (e) => {
      if (taskRuntime && taskRuntime.findSolved) return;
      const rect = img.getBoundingClientRect();
      if (!rect.width) return;
      const px = ((e.clientX - rect.left) / rect.width) * 100;
      const py = ((e.clientY - rect.top) / rect.height) * 100;
      const hit = (task.targets || []).find((t) => inRect(px, py, t));
      if (hit) {
        taskRuntime.findSolved = true;
        marker.style.left = (hit.x + hit.w / 2) + '%';
        marker.style.top = (hit.y + hit.h / 2) + '%';
        marker.removeAttribute('hidden');
        // 聚光燈高亮命中目標
        const spot = document.createElement('span');
        spot.className = 'et-find-spot';
        spot.style.left = hit.x + '%'; spot.style.top = hit.y + '%';
        spot.style.width = hit.w + '%'; spot.style.height = hit.h + '%';
        wrap.appendChild(spot);
        // 「找到了」彈出
        const found = document.createElement('span');
        found.className = 'et-find-found';
        found.textContent = '找 到 了';
        found.style.left = (hit.x + hit.w / 2) + '%';
        found.style.top = Math.max(hit.y + hit.h / 2 - 6, 6) + '%';
        wrap.appendChild(found);
        wrap.classList.add('is-solved');
        setTaskSubmitReady(true, task.success);
        return;
      }
      const decoy = (task.decoys || []).find((d) => inRect(px, py, d));
      setTaskSubmitReady(false, decoy ? decoy.hint : '再 找 找 ——' + (task.instruction || ''));
    });
    body.appendChild(wrap);
    setTaskSubmitReady(false, '');
  }

  function setTaskSubmitReady(ready, message) {
    const submit = document.getElementById('etSubmit');
    const feedback = document.getElementById('etFeedback');
    if (submit) submit.disabled = !ready;
    if (feedback) {
      feedback.classList.remove('et-feedback--toast');
      feedback.textContent = stripDseTag(message || '');
    }
  }

  function renderSequenceTask(body, task) {
    if (taskRuntime.sequenceIndex >= task.steps.length) {
      setTaskSubmitReady(true, task.success);
      return;
    }
    // 打亂顯示順序、隱藏序號，讓玩家自行判斷先後（真正的排序挑戰）
    const order = task.steps.map((s, i) => ({ s, i }));
    for (let k = order.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      const tmp = order[k]; order[k] = order[j]; order[j] = tmp;
    }
    order.forEach(({ s, i }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'et-seq-step';
      btn.textContent = s.text;
      btn.dataset.order = i;
      btn.addEventListener('click', () => {
        const ord = Number(btn.dataset.order);
        if (taskRuntime.sequenceIndex >= task.steps.length) { setTaskSubmitReady(true, task.success); return; }
        if (ord < taskRuntime.sequenceIndex) { setTaskSubmitReady(false, '這一步已排過了。'); return; }
        if (ord !== taskRuntime.sequenceIndex) { setTaskSubmitReady(false, '順序不對——先想想哪一步在前。'); return; }
        btn.classList.add('is-done');
        btn.disabled = true;
        taskRuntime.sequenceIndex += 1;
        btn.textContent = taskRuntime.sequenceIndex + ' · ' + s.text;
        const done = taskRuntime.sequenceIndex >= task.steps.length;
        setTaskSubmitReady(done, done ? task.success : '對了，接著想下一步。');
      });
      body.appendChild(btn);
    });
  }

  function renderPickTask(body, task) {
    task.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'et-option';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => {
        body.querySelectorAll('.et-option').forEach((node) => node.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        taskRuntime.selected = opt.id;
        setTaskSubmitReady(!!opt.correct, opt.correct ? task.success : '這不是核心理由，再讀一次奏摺。');
      });
      body.appendChild(btn);
    });
  }

  function renderClassifyTask(body, task) {
    const itemsWrap = document.createElement('div');
    itemsWrap.className = 'et-classify-items';
    const grid = document.createElement('div');
    grid.className = 'et-classify-grid';
    const selected = { itemId: null };
    const itemBtns = {};
    const groupLabel = {};
    task.groups.forEach((g) => { groupLabel[g.id] = g.label; });

    const clearSel = () => {
      selected.itemId = null;
      itemsWrap.querySelectorAll('.et-classify-item').forEach((n) => n.classList.remove('is-selected'));
      grid.classList.remove('is-awaiting');
    };

    task.items.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'et-classify-item';
      btn.innerHTML = '<span class="ci-text"></span><span class="ci-tag"></span>';
      btn.querySelector('.ci-text').textContent = item.text;
      itemBtns[item.id] = btn;
      btn.addEventListener('click', () => {
        clearSel();                 // 重選（已放入者亦可再點以移動）
        btn.classList.add('is-selected');
        selected.itemId = item.id;
        grid.classList.add('is-awaiting');
      });
      itemsWrap.appendChild(btn);
    });

    task.groups.forEach((group) => {
      const target = document.createElement('button');
      target.type = 'button';
      target.className = 'et-classify-target';
      target.innerHTML = '<span class="ct-label"></span>';
      target.querySelector('.ct-label').textContent = group.label;
      target.addEventListener('click', () => {
        if (!selected.itemId) { setTaskSubmitReady(false, '① 先點一句話　② 再點分類放入。'); return; }
        const item = task.items.find((e) => e.id === selected.itemId);
        taskRuntime.selections[item.id] = group.id;
        const ib = itemBtns[item.id];
        ib.classList.add('is-placed');
        ib.querySelector('.ci-tag').textContent = '→ ' + groupLabel[group.id];
        clearSel();
        const done = task.items.every((e) => taskRuntime.selections[e.id] === e.group);
        const allPlaced = task.items.every((e) => taskRuntime.selections[e.id]);
        setTaskSubmitReady(done, done ? task.success : (allPlaced ? '有一句放錯了，點它再重放。' : '已放入，繼續分類。'));
      });
      grid.appendChild(target);
    });

    const hint = document.createElement('p');
    hint.className = 'et-classify-hint';
    hint.textContent = '① 點一句話　② 點下方分類放入';
    body.appendChild(itemsWrap);
    body.appendChild(hint);
    body.appendChild(grid);
  }

  function completeEvidenceTask() {
    const cityKey = gameState.currentCity;
    const hs = currentEvidenceHotspot;
    const btn = currentEvidenceButton;
    const task = currentEvidenceTask;
    if (!cityKey || !hs || !task) return;

    markFoundHotspot(cityKey, hs.id);
    markEvidenceTaskDone(cityKey, hs.id);
    markCityIntroSeen(cityKey);
    const newlyCollected = collectEvidence(cityKey, hs, task);
    if (btn) btn.remove();
    updateCityMissionSheet(CITY_SCENES[cityKey]);

    if (newlyCollected && gameState.axes[hs.axis] !== undefined) {
      gameState.axes[hs.axis] = Math.min(gameState.axesMax[hs.axis], gameState.axes[hs.axis] + 1);
      refreshAxes();
      if (typeof showAxisGain === 'function') showAxisGain(hs.axis);
    }
    if (newlyCollected && hs.type === 'clue' && hs.unlocks) {
      gameState.unlockedEvents = gameState.unlockedEvents || new Set();
      const wasUnlocked = gameState.unlockedEvents.has(hs.unlocks);
      gameState.unlockedEvents.add(hs.unlocks);
      if (!wasUnlocked) {
        markRecentlyUnlocked(hs.unlocks);
        if (typeof showUnlockToast === 'function' && EVENTS[hs.unlocks]) {
          showUnlockToast(EVENTS[hs.unlocks].title);
        }
      }
    }

    renderJournalEvidence();
    refreshActionList();
    saveGame();
    window.__yangwuResearch?.logEvidenceTaskCompleted({
      routeId: currentRoute,
      cityId: cityKey,
      hotspotId: hs.id,
      evidenceTaskId: taskKey(cityKey, hs.id),
      eventId: hs.unlocks,
      taskType: task.type,
      newlyCollected
    });
    // A3.5: keep completion lightweight, then return or enter the linked event.
    showEvidenceReveal(hs, btn, task);
  }

  function getAxisInquiryHint(axis) {
    if (axis === 'material') return '從器物與技術切入：它帶來甚麼成效，又受哪些非技術因素限制？';
    if (axis === 'system') return '從制度、財政與官僚運作切入：誰能推動，誰又能阻滯？';
    if (axis === 'thought') return '從思想、民情與價值觀切入：人們如何理解「西學」與「自強」？';
    return '從器物、制度、財政、政治與民情的互動切入，而不只看單一成敗。';
  }

  function getEvidenceRevealScaffold(hs, task) {
    return {
      observation: hs?.desc || hs?.name || '先描述你在城市熱點中看到的歷史線索。',
      source: task?.evidenceText || hs?.evidenceText || hs?.desc || hs?.name || '把可用資料轉化為證據。'
    };
  }

  function getFrontstageGainLabel(axis) {
    return axis ? '見 聞' : '線 索';
  }

  function evidenceRevealStepLabel(step) {
    if (step === 'source') return '所 據';
    return '所 見';
  }

  function hasPendingPinnedInCurrentCity() {
    const pendingId = gameState.pendingPinnedId || findDueTravelPinned();
    const ev = pendingId ? EVENTS[pendingId] : null;
    return !!(ev && ev.city && gameState.currentCity === ev.city && !gameState.completedEvents.has(pendingId));
  }

  function finishEvidenceReveal(hs) {
    const ev = hs.unlocks ? EVENTS[hs.unlocks] : null;
    const done = ev && gameState.completedEvents.has(hs.unlocks);
    const locked = optionalActionsLocked();
    if (hasPendingPinnedInCurrentCity()) {
      closeEvidenceTaskModal();
      updateCityMissionSheet(CITY_SCENES[gameState.currentCity], '已收錄證據：' + hs.name + '，史事即將展開');
      resumePinnedAfterCoreLoop();
      return;
    }
    if (ev && !done && !locked) {
      closeEvidenceTaskModal();
      updateCityMissionSheet(CITY_SCENES[gameState.currentCity], '已收錄證據：' + hs.name + '，可整理相關史事');
      openEvent(hs.unlocks);
    } else if (ev && !done && locked) {
      // 鎖定中：不彈卡片，輕量更新要務提示後繼續探索
      closeEvidenceTaskModal();
      updateCityMissionSheet(CITY_SCENES[gameState.currentCity], '已收錄證據：' + hs.name + '，要事待辦後可回此探訪');
    } else {
      closeEvidenceTaskModal();
      updateCityMissionSheet(CITY_SCENES[gameState.currentCity], '已收錄證據：' + hs.name);
      resumePinnedAfterCoreLoop();
    }
  }

  function resumePinnedAfterCoreLoop() {
    setTimeout(() => checkAndTriggerPinned(true), 450);
  }

  function showEvidenceCollectedToast(hs) {
    const feedback = document.getElementById('etFeedback');
    const name = hs?.name || '線索';
    if (feedback) {
      feedback.textContent = '已記下：' + name;
      feedback.classList.add('et-feedback--toast');
    }
  }

  function renderEvidenceRevealStep(hs, task, step) {
    const modal = document.getElementById('evidenceTaskModal');
    const body = document.getElementById('etBody');
    const submit = document.getElementById('etSubmit');
    if (!modal || !body || !submit) return;
    modal.dataset.revealStep = 'toast';
    body.innerHTML = '';
    submit.disabled = true;
    submit.textContent = '已 記 下';
    submit.onclick = null;
    showEvidenceCollectedToast(hs);
    window.setTimeout(() => finishEvidenceReveal(hs), hs?.unlocks ? 650 : 520);
  }

  function getEventEvidenceEntries(eventId) {
    return (gameState.evidenceLedger || []).filter((entry) => entry.unlocks === eventId);
  }

  function getEventInquiryScaffold(eventId, ev) {
    const entries = getEventEvidenceEntries(eventId);
    const firstChoiceAxis = (ev?.choices || []).find((choice) => choice.axis)?.axis;
    const axis = ev?.challenge?.axis || firstChoiceAxis;
    const evidenceLine = entries.length
      ? entries.slice(0, 2).map((entry) => entry.name + '：' + (entry.evidenceText || '已收錄城市線索')).join('；')
      : '先閱讀事件敘述，再扣連城市線索與所學史實。';
    return {
      question: '眼前局勢未明，須先聽各方說法。',
      evidence: evidenceLine,
      lens: '先看誰得利、誰受阻，再看這件事如何牽動日後局勢。',
      evidenceCount: entries.length
    };
  }

  function getChoiceReflectionPrompt(choice, ev) {
    const title = ev?.title || '此事';
    return '手卷提示：記下「' + title + '」一事，留意此選擇留下的餘波。';
  }

  function setEventRhythmPhase(phase) {
    const modal = document.getElementById('eventModal');
    if (modal) modal.dataset.rhythm = phase || 'choose';
  }

  function getChoiceImpactText(choice) {
    const effectLabels = {
      favor: '聖眷',
      opinion: '清議',
      populace: '民情',
      funds: '餉源',
      material: '見聞',
      system: '見聞',
      thought: '見聞'
    };
    const effects = choice?.effects || {};
    const parts = [];
    Object.keys(effects).forEach((key) => {
      const value = effects[key];
      const label = effectLabels[key] || AXIS_NAMES[key] || key;
      if (typeof value === 'number' && value !== 0) {
        parts.push(label + (value > 0 ? ' +' : ' ') + value);
      }
    });
    if (parts.length) return '即時影響：' + parts.join('、');
    return '這項選擇主要改變你的歷史理解，而非立即改變資源。';
  }

  function choiceMetaLabel(choice) {
    return '抉 擇';
  }

  function getChallengeSpeaker(ev, ch) {
    const axis = ch?.axis;
    if (axis === 'material') return '洋 匠 追 問';
    if (axis === 'system') return '幕 僚 追 問';
    if (axis === 'thought') return '士 人 追 問';
    if (ch?.type === 'scenario') return '局 中 人 追 問';
    if (ev?.type === 'pinned') return '朝 局 追 問';
    return '幕 僚 追 問';
  }

  // 證據卡 reveal（朱砂「證」印 + 證據句 + 見識；繼續鈕直接接探訪或關閉）
  function showEvidenceReveal(hs, btn, task) {
    // A3.5 輕量化：不再彈「已記下」卡，改飄一枚證印 toast，再直接續流程
    closeEvidenceTaskModal();
    showEvidenceFlash(hs);
    finishEvidenceReveal(hs);
  }
  // 證據收錄輕量提示（朱砂「證」印，自動消失）
  function showEvidenceFlash(hs) {
    const name = (hs && hs.name) ? hs.name : '線索';
    const t = document.createElement('div');
    t.className = 'evidence-flash';
    t.innerHTML = '<span class="ef-seal" aria-hidden="true">證</span>' +
      '<span class="ef-text">已 收 入 證 據 簿 · ' + escapeHTML(name) + '</span>';
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('is-in'));
    setTimeout(() => { t.classList.remove('is-in'); setTimeout(() => t.remove(), 420); }, 1700);
  }
  function addRevealDoneButton() {
    const submit = document.getElementById('etSubmit');
    if (!submit || document.getElementById('etRevealDone')) return;
    const b = document.createElement('button');
    b.id = 'etRevealDone'; b.type = 'button'; b.className = 'et-submit et-reveal-done';
    b.textContent = '完 成'; b.onclick = () => { b.remove(); closeEvidenceTaskModal(); };
    submit.parentNode.insertBefore(b, submit.nextSibling);
  }

  function openHotspot(hs, btn) {
    hideHotspotObservation();
    const hm = document.getElementById('hotspotModal');
    if (!hm) return;
    const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    setText('hmName', hs.name);
    setText('hmDesc', hs.desc);
    setHmImage('assets/hotspot/' + hs.id + '.webp');
    delete hm.dataset.pendingAxis;
    delete hm.dataset.pendingUnlock;
    delete hm.dataset.pendingEvidence;

    // 第一次發現：+1 見識（觀察獎勵）+ 解鎖對應事件（行動列表備援）
    const cityKey = gameState.currentCity;
    const wasFound = hasFoundHotspot(cityKey, hs.id);
    const task = getEvidenceTask(cityKey, hs.id);
    if (!wasFound && task && !isEvidenceTaskDone(cityKey, hs.id)) {
      hideManagedModal('hotspotModal');
      hm.setAttribute('hidden', '');
      if (openEvidenceTask(cityKey, hs, btn)) return;
    }
    if (!wasFound) {
      markFoundHotspot(cityKey, hs.id);
      const newlyCollected = collectEvidence(cityKey, hs);
      btn.classList.add('is-found');
      setText('exploreCount', String(document.querySelectorAll('#cityHotspots .hotspot.is-found').length));
      if (newlyCollected && gameState.axes[hs.axis] !== undefined) {
        gameState.axes[hs.axis] = Math.min(
          gameState.axesMax[hs.axis],
          gameState.axes[hs.axis] + 1
        );
        refreshAxes();
        hm.dataset.pendingAxis = hs.axis;
        hm.dataset.pendingEvidence = hs.name;
      }
      if (newlyCollected && hs.type === 'clue' && hs.unlocks) {
        gameState.unlockedEvents = gameState.unlockedEvents || new Set();
        const wasUnlocked = gameState.unlockedEvents.has(hs.unlocks);
        gameState.unlockedEvents.add(hs.unlocks);
        if (!wasUnlocked) {
          hm.dataset.pendingUnlock = hs.unlocks;
          markRecentlyUnlocked(hs.unlocks);
        }
        refreshActionList();
      }
      renderJournalEvidence();
      saveGame();
    }

    // 探訪按鈕：線索熱點 → 直接開啟事件（觀察 + 角色追問）
    const action = document.getElementById('hmAction');
    if (action) {
      if (hs.type === 'clue' && hs.unlocks && EVENTS[hs.unlocks]) {
        const done = gameState.completedEvents.has(hs.unlocks);
        const yearLocked = optionalActionsLocked();
        action.removeAttribute('hidden');
        action.disabled = !!done || yearLocked;
        action.textContent = done ? '任 務 已 整 理'
          : (yearLocked ? '要 事 待 辦 於 他 城 · 暫 不 得 探 訪'
          : ('開 始 任 務 · ' + taskGoalText(EVENTS[hs.unlocks], hs.unlocks, CITY_SCENES[cityKey]) + ' · 耗 一 季 →'));
        action.onclick = (done || yearLocked) ? null : () => {
          hideManagedModal('hotspotModal');
          delete hm.dataset.pendingAxis;
          delete hm.dataset.pendingUnlock;
          delete hm.dataset.pendingEvidence;
          openEvent(hs.unlocks);
        };
        setText('hmAxis', wasFound ? '證 據 已 收 錄 · 可 整 理 任 務' : '收 得 證 據 · + 1 ' + getFrontstageGainLabel(hs.axis));
      } else {
        action.setAttribute('hidden', '');
        action.onclick = null;
        setText('hmAxis', wasFound ? '證 據 已 收 錄' : '收 得 證 據 · + 1 ' + getFrontstageGainLabel(hs.axis));
      }
    }
    openManagedModal('hotspotModal');
  }

  // 軸獲得視覺反饋（飄字 toast + 軸條閃光）
  function showAxisGain(axis) {
    if (!axis || !AXIS_NAMES[axis]) return;
    const s3 = document.getElementById('screen3');
    if (!s3) return;
    // toast
    const toast = document.createElement('div');
    toast.className = 'axis-toast';
    toast.textContent = '+ 1 ' + getFrontstageGainLabel(axis);
    s3.appendChild(toast);
    setTimeout(() => { try { toast.remove(); } catch (e) {} }, 2000);
    // 軸條閃光
    const bar = document.querySelector('.axis--' + axis);
    if (bar) {
      bar.classList.remove('axis--flash');
      void bar.offsetWidth;  // force reflow
      bar.classList.add('axis--flash');
      setTimeout(() => bar.classList.remove('axis--flash'), 900);
    }
  }

  // ---------- 事件 modal 開關 ----------
  let currentEventId = null;
  let currentEvidenceTask = null;
  let currentEvidenceHotspot = null;
  let currentEvidenceButton = null;
  let taskRuntime = null;
  let pendingChoiceEffects = null;   // 選擇層的資源 effects（混合模型）

  function openEvent(eventId) {
    const ev = EVENTS[eventId];
    if (!ev) return;
    pendingChoiceEffects = null;
    if (gameState.completedEvents.has(eventId)) return;
    currentEventId = eventId;
    // ⑨ 音效強拍：終局與重大轉折事件登場時，一記深沉砲鼓
    if (window.__BGM && __BGM.isOn && __BGM.isOn() &&
        ['e_yuanmingyuan', 'e_korea_donghak', 'e_yellow_sea_battle', 'e_shimonoseki_treaty', 'e_fuzhou_mawei'].indexOf(eventId) !== -1) {
      try { __BGM.impact(); } catch (e) {}
    }

    const modal = document.getElementById('eventModal');
    if (!modal) return;
    const isPinned = (ev.type === 'pinned');

    // 城市內見證鐵釘時，保留城市頁作為事件背景，不退回地圖。
    if (isPinned && ev.city && gameState.currentCity === ev.city && citySceneIsOpen()) {
      actuallyOpenEvent(eventId, ev);
      return;
    }

    // 地圖層觸發鐵釘時才保留放大儀式。
    if (isPinned && ev.city) {
      zoomMapToCity(ev.city);
      setTimeout(() => actuallyOpenEvent(eventId, ev), 1200);
      return;
    }
    actuallyOpenEvent(eventId, ev);
  }

  // 甲午輕量規格：四方阻力（聖眷/清議/民情/餉源）總和越低，北洋處境越慘
  function jiawuSeverity() {
    const r = gameState.res || {};
    const sum = (r.favor || 0) + (r.opinion || 0) + (r.populace || 0) + (r.funds || 0); // 0–400
    let base;
    if (sum < 130) base = '此時的北洋——餉源早斷、艦舊無煤、士心渙散，朝中猶在和戰之間反覆；未戰，敗象已成。';
    else if (sum < 250) base = '此時的北洋——軍費短絀、添艦無望、號令難一；縱有死戰之心，已難挽既成的頹勢。';
    else base = '此時的北洋——將士尚存死戰之志，然器不如人、援不繼至、廟算已失；縱奮戰竟日，終究敗局難回。';
    // 曾親見日本擴軍者，更明白這敗局的伏線
    if (gameState.completedEvents && gameState.completedEvents.has('e_jp_navy')) {
      base += ' 你曾親睹東鄰傾國擴軍、快艦如林——此刻方知，這場慘敗的伏線，早在對岸寫就。';
    }
    return base;
  }

  function actuallyOpenEvent(eventId, ev) {
    const modal = document.getElementById('eventModal');
    if (!modal) return;
    const isPinned = (ev.type === 'pinned');

    // 設定主題類別（鐵釘 / 自由）
    modal.dataset.kind = isPinned ? 'pinned' : 'free';
    modal.dataset.phase = 'choose';
    setEventRhythmPhase('choose');
    openManagedModal('eventModal');
    window.__yangwuResearch?.logEventOpened({
      routeId: currentRoute,
      cityId: ev.city || gameState.currentCity,
      eventId,
      source: citySceneIsOpen() ? 'city' : 'map',
      year: gameState.currentYear,
      season: gameState.currentSeason
    });
    try { BGM.setScene('event'); } catch (e) {}
    setEventImage(eventId);

    const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    const setHTML = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

    // 章節編號（鐵釘才顯示）
    const chapter = document.getElementById('emChapter');
    if (chapter) {
      chapter.textContent = isPinned && ev.chapter ? ('第 ' + ev.chapter + ' 章') : '';
      chapter.style.display = isPinned ? '' : 'none';
    }
    setText('emTitle', ev.title);
    const en = document.getElementById('emEn');
    if (en) {
      en.textContent = ev.en || '';
      en.style.display = ev.en ? '' : 'none';
    }
    // 甲午輕量規格：依四方阻力決定北洋此刻的慘烈程度（越低越慘）
    setText('emSetup', stripDseTag(eventId === 'e_yellow_sea_battle' ? (ev.setup + ' ' + jiawuSeverity()) : ev.setup));
    const inquiry = getEventInquiryScaffold(eventId, ev);
    modal.dataset.evidenceLinked = inquiry.evidenceCount > 0 ? 'true' : 'false';

    // 注入選項（#4 條件選項：未達成者隱藏）
    const choicesEl = document.getElementById('emChoices');
    if (choicesEl) {
      choicesEl.innerHTML = '';
      ev.choices.filter(choiceRequiresMet).forEach((ch, choiceIndex) => {
        const btn = document.createElement('button');
        btn.className = 'em-choice';
        btn.type = 'button';
        btn.innerHTML =
          '<span class="emc-main"><span class="emc-label">' + escapeHTML(ch.label) + '</span></span>' +
          effectChips(ch.effects);
        btn.addEventListener('click', () => chooseEvent(ch, choiceIndex));
        choicesEl.appendChild(btn);
      });
    }
  }

  // #4 條件選項：依結識人物 / 過往決定印記 / 見識門檻，決定某選項是否出現
  function choiceRequiresMet(ch) {
    const r = ch && ch.requires;
    if (!r) return true;
    const net = new Set((gameState.network || []).map((p) => p.key));
    const fl = gameState.flags || {};
    const arr = (v) => Array.isArray(v) ? v : [v];
    if (r.met && !arr(r.met).every((k) => net.has(k))) return false;
    if (r.flag && !arr(r.flag).every((f) => fl[f])) return false;
    if (r.notFlag && arr(r.notFlag).some((f) => fl[f])) return false;
    if (r.axisMin && (gameState.axes[r.axisMin.axis] || 0) < r.axisMin.val) return false;
    return true;
  }

  function chooseEvent(choice, choiceIndex) {
    const modal = document.getElementById('eventModal');
    if (!modal) return;
    // 留下決定印記，供日後事件的條件選項使用
    if (choice.setsFlag) {
      gameState.flags = gameState.flags || {};
      (Array.isArray(choice.setsFlag) ? choice.setsFlag : [choice.setsFlag]).forEach((f) => { gameState.flags[f] = true; });
    }
    modal.dataset.phase = 'payoff';
    setEventRhythmPhase('payoff');
    const ev = EVENTS[currentEventId];
    const isPinned = ev && ev.type === 'pinned';
    window.__yangwuResearch?.logDecisionSelected({
      routeId: currentRoute,
      cityId: gameState.currentCity,
      eventId: currentEventId,
      choiceId: choice.id || null,
      choiceIndex,
      choiceAxis: choice.axis,
      hasEffects: !!choice.effects
    });

    const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    setText('emChoiceLabel', '你 · 選擇 · ' + choice.label);
    setText('emPayoff', stripDseTag(choice.payoff));
    setText('emAxisBadge', isPinned ? ('+ 1 ' + getFrontstageGainLabel(choice.axis)) : '證 據 回 報');
    const badge = document.getElementById('emAxisBadge');
    if (badge) {
      if (isPinned) badge.dataset.axis = choice.axis;
      else badge.removeAttribute('data-axis');
    }

    // 暫存待結算的選擇（含選擇層的資源 effects）
    modal.dataset.chosenAxis = choice.axis;
    pendingChoiceEffects = choice.effects || null;

    // 若此事件有「角色追問」，把繼續鈕改為進入追問
    const cont = document.getElementById('emContinue');
    if (cont) cont.textContent = (ev && ev.challenge) ? '聽 其 追 問 →' : '整 理 入 卷';
  }

  // ── 角色追問：玩家在局中回應，內部仍保留得失結算 ──
  function showChallenge(ev) {
    const modal = document.getElementById('eventModal');
    const ch = ev && ev.challenge;
    if (!modal || !ch) { closeEventModal(); return; }
    modal.dataset.phase = 'challenge';
    setEventRhythmPhase('challenge');
    const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    setText('emChallengeKicker', getChallengeSpeaker(ev, ch));
      setText('emChallengeQ', stripDseTag(ch.q));
    const optsEl = document.getElementById('emChallengeOptions');
    if (!optsEl) return;
    optsEl.innerHTML = '';
    const btns = [];
    ch.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'em-challenge-opt';
      btn.type = 'button';
      btn.dataset.idx = idx;
      btn.innerHTML = '<span class="emo-mark">問</span><span class="emo-label">' + opt.label + '</span>';
      btn.addEventListener('click', () => gradeChallenge(ev, idx, btns));
      optsEl.appendChild(btn);
      btns.push(btn);
    });
  }

  function gradeChallenge(ev, pickedIdx, btns) {
    const modal = document.getElementById('eventModal');
    const ch = ev && ev.challenge;
    if (!modal || !ch) return;
    const picked = ch.options[pickedIdx];
    const correct = !!(picked && picked.correct);
    const axis = ch.axis;
    const delta = correct ? 2 : -1;
    if (correct) gameState.challengeCorrect = (gameState.challengeCorrect || 0) + 1;

    // 鎖定所有選項並標示對錯
    btns.forEach((b, i) => {
      b.disabled = true;
      if (ch.options[i].correct) b.classList.add('is-correct');
    });
    if (!correct) btns[pickedIdx]?.classList.add('is-wrong');

    // 套用點數（地板 0、天花板 axesMax）
    gameState.axes[axis] = Math.max(
      0,
      Math.min(gameState.axesMax[axis], (gameState.axes[axis] || 0) + delta)
    );

    const correctOpt = ch.options.find((o) => o.correct);
    recordQuiz({
      q: stripDseTag(ch.q), picked: picked ? picked.label : '',
      answer: correctOpt ? correctOpt.label : '', correct: correct,
      explain: stripDseTag(ch.explain || ''), dse: ch.dse || extractDseTag(ch.explain),
      source: ev.title || ''
    });
    setTimeout(() => {
      modal.dataset.phase = 'result';
      setEventRhythmPhase('result');
      const mark = document.getElementById('emResultMark');
      if (mark) { mark.textContent = correct ? '所 斷 可 取' : '尚 待 斟 酌'; mark.dataset.correct = correct ? 'true' : 'false'; }
      const badge = document.getElementById('emResultBadge');
      if (badge) {
        badge.textContent = (delta > 0 ? '+ ' : '− ') + Math.abs(delta) + ' ' + getFrontstageGainLabel(axis);
        badge.dataset.axis = axis;
      }
      const explainEl = document.getElementById('emResultExplain');
      if (explainEl) {
        explainEl.textContent = stripDseTag(correct
          ? (ch.explain || '')
          : ('幕僚低聲提醒：若從「' + (correctOpt ? correctOpt.label : '') + '」入手，局勢會更清楚。' + (ch.explain || '')));
      }
    }, 700);
  }

  function closeEventModal() {
    const modal = document.getElementById('eventModal');
    if (!modal) return;
    const axis = modal.dataset.chosenAxis;
    const eventId = currentEventId;
    hideManagedModal('eventModal');
    delete modal.dataset.phase;
    delete modal.dataset.chosenAxis;
    delete modal.dataset.kind;
    delete modal.dataset.mode;
    delete modal.dataset.rhythm;
    try { BGM.setScene(citySceneIsOpen() ? 'city' : 'map'); } catch (e) {}

    // 結算：事件完成、可能推進時間、刷新 UI。自由任務的分數主要來自證據與考驗。
    if (axis && eventId) {
      commitEvent(eventId, axis);
    }
    if (eventId && citySceneIsOpen()) {
      const ev = EVENTS[eventId];
      const feedback = ev ? ('已整理史事：' + ev.title) : '已整理一項史事';
      updateCityMissionSheet(CITY_SCENES[gameState.currentCity], feedback);
    }
    currentEventId = null;

    // 終局鏈：漢城風雲見聞（1894+）→ 東學黨（導火線）→ 黃海甲午（幕二）→ 馬關（幕三）→ 結算。
    if (eventId === 'e_korea_situation' && gameState.currentYear >= 1894 && !gameState.completedEvents.has('e_korea_donghak')) {
      setTimeout(() => openEvent('e_korea_donghak'), 700);
    } else if (eventId === 'e_korea_donghak') {
      setTimeout(() => openEvent('e_yellow_sea_battle'), 650);
    } else if (eventId === 'e_yellow_sea_battle') {
      setTimeout(() => openEvent('e_shimonoseki_treaty'), 650);
    } else if (eventId === 'e_shimonoseki_treaty') {
      setTimeout(triggerSettlement, 700);
    }
  }

  function commitEvent(eventId, axis) {
    const ev = EVENTS[eventId];
    if (!ev) return;
    const givesWitnessAxis = ev.type === 'pinned' && axis && gameState.axes[axis] !== undefined;
    if (givesWitnessAxis) {
      gameState.axes[axis] = Math.min(
        gameState.axesMax[axis],
        (gameState.axes[axis] || 0) + 1
      );
    }
    gameState.completedEvents.add(eventId);

    // C2 · 事件中登場的人物加入「友」
    if (ev.meet && ev.meet.key) addToNetwork(ev.meet.key, ev.meet.name, ev.meet.relation);
    // 事件對四方阻力的影響（混合：事件層 + 選擇層）
    if (ev.effects) applyResourceEffects(ev.effects, { noSetback: true });
    if (pendingChoiceEffects) applyResourceEffects(pendingChoiceEffects);
    pendingChoiceEffects = null;

    // 鐵釘完成 → 解除鎖定
    if (ev.type === 'pinned') {
      gameState.locked = false;
      gameState.pendingPinnedCity = null;
      clearForcePrompt();
    }

    refreshAxes();
    if (givesWitnessAxis) setTimeout(() => showAxisGain(axis), 250);
    // 事件後縮回地圖（若有 zoom）
    setTimeout(() => zoomMapToCity(null), 400);

    // 任務整理（自由事件）= 主動行動，消耗一季；鐵釘為自動見證，不另耗時
    const pendingLetter = ev.letter;
    if (ev.type !== 'pinned') {
      advanceSeason(1);
    } else {
      refreshEventsList();
      refreshActionList();
      refreshTopbarYear();
      updateGuidanceHint();
      saveGame();
      if (citySceneIsOpen()) {
        setTimeout(() => checkAndTriggerPinned(true), 900);
      }
    }
    // 書信引線：事件後來信，串連下一處（並激活「友」）
    if (pendingLetter) {
      setTimeout(() => deliverLetter(pendingLetter), ev.type !== 'pinned' ? 1900 : 800);
    }
  }

  function refreshAxes() {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v); };
    set('axisMaterial', gameState.axes.material);
    set('axisSystem',   gameState.axes.system);
    set('axisThought',  gameState.axes.thought);
    // 識面板進度條同步
    const lines = document.querySelectorAll('#panel-zhi .panel-axis-line');
    if (lines.length === 3) {
      const axes = [
        { key: 'material', max: 30 },
        { key: 'system',   max: 25 },
        { key: 'thought',  max: 20 }
      ];
      lines.forEach((line, i) => {
        const v = gameState.axes[axes[i].key];
        const fill = line.querySelector('.pal-bar-fill');
        const num  = line.querySelector('.pal-num');
        if (fill) fill.style.width = (Math.min(v / axes[i].max, 1) * 100) + '%';
        if (num)  num.textContent = v + ' / ' + axes[i].max;
      });
    }
  }

  function refreshEventsList() {
    renderEventsList(gameState.currentYear);
  }

  // 此城最早一筆「尚未到年代」的內容（線索／事件／設施）出現年；無則 null
  function earliestFutureContentYear(scene) {
    if (!scene) return null;
    const cy = gameState.currentYear;
    let min = null;
    const consider = (y) => { if (y && y > cy && (min === null || y < min)) min = y; };
    (scene.hotspots || []).forEach((h) => consider(h.appearFromYear || 0));
    (scene.actionEvents || []).forEach((id) => { const ev = EVENTS[id]; if (ev) consider(ev.appearFromYear || 0); });
    (scene.facilities || []).forEach((f) => consider(f.unlockYear || 0));
    return min;
  }
  // 「同治五年（1866）」式短標籤
  function eraYearLabel(y) {
    const base = YEAR_LABELS[y];
    if (!base) return y + ' 年';
    return base.split('·')[0].replace('大清', '').trim() + '（' + y + '）';
  }
  // 空城提示：若日後有內容，告知何時漸有線索；否則維持「暫無可為」
  function cityEmptyHint(scene) {
    const fy = earliestFutureContentYear(scene);
    if (fy) return '此 地 洋 務 未 興 · ' + eraYearLabel(fy) + ' 後 漸 有 線 索';
    return '此 地 暫 無 可 為 之 事';
  }

  // 統一渲染當前城市的行動列表（自由事件 only，鐵釘自動觸發不在列表）
  function renderActionList(scene) {
    const actionsEl = document.getElementById('cityActionsList');
    if (!actionsEl || !scene) return;
    actionsEl.innerHTML = '';
    const ids = scene.actionEvents || [];
    const locked = optionalActionsLocked();
    let any = 0;
    ids.forEach((eventId) => {
      const ev = EVENTS[eventId];
      if (!ev) return;
      if (ev.type === 'pinned') return;  // 鐵釘自動觸發，不在行動列表
      if ((ev.appearFromYear || 0) > gameState.currentYear) return;  // 該年代尚未到
      const isDone = gameState.completedEvents.has(eventId);
      const foundEvidence = eventEvidenceCount(eventId, scene);
      const requiredEvidence = eventEvidenceRequired(eventId, scene);
      const evidenceReady = foundEvidence >= requiredEvidence;
      const isUnlocked = (gameState.unlockedEvents || new Set()).has(eventId) || evidenceReady;
      if (evidenceReady && !isDone) {
        gameState.unlockedEvents = gameState.unlockedEvents || new Set();
        gameState.unlockedEvents.add(eventId);
      }
      const btn = document.createElement('button');
      btn.className = 'ca-item';
      if (isDone) btn.classList.add('ca-item--done');
      if (!isUnlocked && !isDone) btn.classList.add('ca-item--locked');
      if (locked) btn.classList.add('ca-item--disabled');
      if (eventId === recentUnlockedEventId && isUnlocked && !isDone) btn.classList.add('ca-item--new');
      btn.type = 'button';
      btn.dataset.eventId = eventId;
      let icon = '▸';
      let title = ev.title;
      const taskGoal = taskGoalText(ev, eventId, scene);
      if (isDone) icon = '✓';
      else if (!isUnlocked) { icon = '□'; title = '證 據 未 足'; }
      const meta = isDone ? '已整理'
        : (isUnlocked ? ('證據 ' + foundEvidence + '/' + requiredEvidence) : ('先尋線索 ' + foundEvidence + '/' + requiredEvidence));
      const main = (isUnlocked || isDone) ? ('任 務 · ' + taskGoal) : title;
      btn.innerHTML =
        '<span class="ca-main">' + icon + ' ' + main + '</span>' +
        '<span class="ca-evidence">' + meta + '</span>';
      btn.disabled = isDone || !isUnlocked || locked;
      if (!btn.disabled) btn.addEventListener('click', () => openEvent(eventId));
      actionsEl.appendChild(btn);
      any++;
    });
    if (!any) {
      actionsEl.innerHTML = '<span class="ca-empty">' + cityEmptyHint(scene) + '</span>';
    }
  }

  function refreshActionList() {
    const sc = document.getElementById('cityScene');
    if (!sc || sc.hasAttribute('hidden')) return;
    const scene = CITY_SCENES[gameState.currentCity];
    refreshCitySceneContent(scene);
  }

  function refreshTopbarYear() {
    const yearEl = document.getElementById('topbarYear');
    if (!yearEl) return;
    yearEl.textContent = yearToLabel(gameState.currentYear, gameState.currentSeason);
  }

  // 年份 → 國號 + 干支 + 季 文字
  const YEAR_LABELS = {
    1860: '大清 咸豐十年 · 庚申',
    1861: '大清 咸豐十一年 · 辛酉',
    1862: '大清 同治元年 · 壬戌',
    1865: '大清 同治四年 · 乙丑',
    1866: '大清 同治五年 · 丙寅',
    1870: '大清 同治九年 · 庚午',
    1872: '大清 同治十一年 · 壬申',
    1873: '大清 同治十二年 · 癸酉',
    1874: '大清 同治十三年 · 甲戌',
    1875: '大清 光緒元年 · 乙亥',
    1881: '大清 光緒七年 · 辛巳',
    1882: '大清 光緒八年 · 壬午',
    1884: '大清 光緒十年 · 甲申',
    1888: '大清 光緒十四年 · 戊子',
    1894: '大清 光緒二十年 · 甲午',
    1895: '大清 光緒二十一年 · 乙未'
  };
  function yearToLabel(y, season) {
    const base = (YEAR_LABELS[y] || ('大清 · ' + y));
    const s = season == null && y === gameState.currentYear ? gameState.currentSeason : season;
    return s == null ? base : (base + ' · ' + (SEASON_NAMES[s] || ''));
  }

  function citySceneIsOpen() {
    const sc = document.getElementById('cityScene');
    return !!(sc && !sc.hasAttribute('hidden'));
  }

  // 推進 n 季；4 季 = 1 年。只有跨年時才檢查鐵釘年份。
  // opts.silent：跨城旅行時不播全屏季節轉場（改由進城 loader 顯示抵達時間，避免與城名重疊）。
  function advanceSeason(n, opts) {
    n = Math.max(1, n || 1);
    let yearsElapsed = 0;
    let pendingPart = null;   // #7：本次推進若跨入新篇，延後觸發該年鐵釘至轉場點擊後
    for (let i = 0; i < n; i++) {
      gameState.currentSeason = (gameState.currentSeason + 1) % 4;
      if (gameState.currentSeason === 0) {
        gameState.currentYear++;
        yearsElapsed++;
        gameState.res.funds = clampRes(gameState.res.funds - 1);                 // 年年欠餉
        if (gameState.currentYear % 2 === 0) gameState.res.opinion = clampRes(gameState.res.opinion - 1);  // 清議漸厲（雙年）
        gameState.partsShown = gameState.partsShown || [];
        const partHere = (!pendingPart) ? STORY_PARTS.find((p) => p.year === gameState.currentYear && gameState.partsShown.indexOf(p.year) === -1) : null;
        if (partHere) {
          gameState.partsShown.push(partHere.year);
          pendingPart = partHere;   // 篇章轉場：先播，待點擊續後才觸發本年事件
        } else {
          checkAndTriggerPinned(false);
        }
      }
    }
    if (!(opts && opts.silent)) playYearTransition(gameState.currentYear, n);  // 整段推進只播一次過場
    refreshTopbarYear();
    refreshEventsList();
    refreshActionList();
    if (currentRoute) renderCitySeals(currentRoute, gameState.currentYear, gameState.currentCity);  // 城市解鎖狀態
    updateGuidanceHint();  // 內含目標城高亮（須在 seals 重繪後）
    // 年年欠餉、清議漸厲：已於跨年時逐年扣（見上方迴圈）
    if (yearsElapsed > 0) checkSuspenseExpiry();   // 支柱三：懸案逾期失血
    renderResources();
    warnIfDanger();
    saveGame();
    setTimeout(checkResourceSetbacks, 800);
    // 丙·動態小事件：非旅行的推進（在城內推進一季／一年）落在空檔年時，必出一張不耗行動的過場插曲
    if (!(opts && opts.silent)) maybeShowInterlude(yearsElapsed);
    // 抵 1895 · 自動結算（但若終局甲午尚未見證，先讓玩家走完威海衛三幕，由馬關後自動結算）
    if (gameState.currentYear >= 1895 && gameState.completedEvents.has('e_yellow_sea_battle')) {
      setTimeout(triggerSettlement, 1700);
    }
    // #7 篇章轉場：跨入新篇門檻時播放（每篇一次；里程碑，不受 silent 抑制）
    if (pendingPart) {
      saveGame();
      showPartTransition(pendingPart, function () { checkAndTriggerPinned(false); });
    }
  }

  // ---------- #7 篇章轉場（年份門檻觸發 · 純電影過場）----------
  const STORY_PARTS = [
    { year: 1865, no: '第 二 篇', name: '求 強', bg: '/assets/sketches/ironclad-warship.webp',
      sub: '船炮可造，自強自軍工始——江南、福州，機器轟鳴。' },
    { year: 1873, no: '第 三 篇', name: '求 富', bg: '/assets/events/e_zhaoshangju.webp',
      sub: '徒強不富，難以持久——招商、開礦、織布，寓強於富。' },
    { year: 1884, no: '第 四 篇', name: '危 局', bg: '/assets/events/e_fuzhou_mawei.webp',
      sub: '邊釁四起、海塞交困——三十年自強，將驗於一戰。' }
  ];
  function showPartTransition(part, onClose) {
    const el = document.getElementById('partTransition');
    if (!el) { if (onClose) onClose(); return; }
    const set = (id, t) => { const x = document.getElementById(id); if (x) x.textContent = t; };
    set('ptNo', part.no); set('ptName', part.name); set('ptSub', part.sub);
    const bg = document.getElementById('ptBg');
    if (bg) bg.style.backgroundImage = part.bg ? ('url("' + part.bg + '")') : 'none';
    el.classList.add('is-on');
    el.setAttribute('aria-hidden', 'false');
    try { if (window.__BGM && window.__BGM.impact) window.__BGM.impact(); } catch (e) {}
    let closed = false;
    const close = () => {
      if (closed) return; closed = true;
      el.classList.remove('is-on');
      el.setAttribute('aria-hidden', 'true');
      el.removeEventListener('click', close);
      clearTimeout(timer);
      // 點擊續後，才觸發本篇該年的歷史事件（避免事件覆蓋轉場）
      if (onClose) setTimeout(onClose, 360);
    };
    // 以點擊為主；保留長時 fallback 避免卡死
    const timer = setTimeout(close, 9000);
    el.addEventListener('click', close);
  }

  function advanceYear(n) {
    advanceSeason(Math.max(1, n || 1) * 4);
  }

  // 是否為鐵釘年（該年專屬於歷史時刻，禁止主動探訪/研習）
  function isPinnedYear(year) {
    return !!PINNED_BY_YEAR[year != null ? year : gameState.currentYear];
  }

  // 推進至下一個有鐵釘的年份（沒有則推進一季）
  function advanceToNextPinned() {
    let target = null;
    for (const y in PINNED_BY_YEAR) {
      const yr = Number(y);
      if (yr > gameState.currentYear && !gameState.completedEvents.has(PINNED_BY_YEAR[y])) {
        if (target === null || yr < target) target = yr;
      }
    }
    advanceSeason(target ? Math.max(1, seasonsUntilYear(target)) : 1);
  }

  // ════ 書信引線 + 友（人物網絡）════
  function addToNetwork(key, name, relation) {
    gameState.network = gameState.network || [];
    if (gameState.network.some((p) => p.key === key)) return;
    gameState.network.push({ key, name, relation: relation || '' });
    savePersonSeen(key, name, relation);   // #2 人物冊：跨局永久記錄
    renderNetwork();
    showNetworkToast(name, relation);
    saveGame();
  }
  // 結識新人物：朱砂入冊收集動畫
  function showNetworkToast(name, relation) {
    const t = document.createElement('div');
    t.className = 'net-toast';
    t.innerHTML = '<span class="nt-seal">友</span><div class="nt-body">' +
      '<span class="nt-kicker">結 識 新 知</span>' +
      '<span class="nt-name">' + escapeHTML(name || '') + '</span>' +
      (relation ? '<span class="nt-rel">' + escapeHTML(relation) + '</span>' : '') +
      '</div>';
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('is-on'));
    setTimeout(() => { t.classList.remove('is-on'); setTimeout(() => t.remove(), 600); }, 2600);
  }
  function renderNetwork() {
    const wrap = document.getElementById('networkList');
    if (!wrap) return;
    const net = gameState.network || [];
    if (!net.length) {
      wrap.innerHTML = '<p class="panel-empty">尚未結識任何人。</p><p class="panel-empty-en">your journey has yet to begin</p>';
      return;
    }
    wrap.innerHTML = net.map((p) =>
      '<button type="button" class="net-person" data-person="' + p.key + '"><span class="net-name">' + p.name + '</span>' +
      (p.relation ? '<span class="net-rel">' + p.relation + '</span>' : '') +
      '<span class="net-more">細 覽 ›</span></button>'
    ).join('');
    wrap.querySelectorAll('.net-person').forEach((b) => {
      b.addEventListener('click', () => openPerson(b.dataset.person));
    });
  }
  function deliverLetter(letterId) {
    const lt = LETTERS[letterId];
    if (!lt) return;
    if (lt.fromKey) addToNetwork(lt.fromKey, lt.from, lt.relation);
    const modal = document.getElementById('letterModal');
    if (!modal) return;
    const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    setText('ltFrom', lt.from);
    setText('ltDate', lt.date || '');
    const bodyEl = document.getElementById('ltBody');
    if (bodyEl) bodyEl.innerHTML = (lt.body || '').split('\n').filter((s) => s.trim()).map((p) => '<p>' + p + '</p>').join('');
    const pointWrap = document.getElementById('ltPointWrap');
    const begin = document.getElementById('ltBegin');
    const store = document.getElementById('ltStore');
    if (lt.pointTo) {
      modal.dataset.pointCity = lt.pointTo.city || '';
      // 「所指」不再單列；目的地併入按鈕，簡潔交代
      const destName = (CITIES[lt.pointTo.city]?.name || '').replace(/\s+/g, '');
      if (begin) begin.textContent = destName ? ('標 記 下 一 站 · ' + destName + ' →') : '標 記 下 一 站 →';
      if (store) store.setAttribute('hidden', '');   // 收入手卷併入「標記下一站」自動完成，不再單列
      if (pointWrap) pointWrap.style.display = 'none';
    } else {
      modal.dataset.pointCity = '';
      if (begin) begin.textContent = '收 入 手 卷 →';
      if (store) store.setAttribute('hidden', '');
      if (pointWrap) pointWrap.style.display = 'none';
    }
    openManagedModal('letterModal');
  }
  document.getElementById('ltBegin')?.addEventListener('click', () => {
    const modal = document.getElementById('letterModal');
    if (!modal) return;
    const city = modal.dataset.pointCity;
    hideManagedModal('letterModal');
    if (city) goToLetterTargetCity(city);
  });
  document.getElementById('ltStore')?.addEventListener('click', () => {
    const modal = document.getElementById('letterModal');
    if (modal) hideManagedModal('letterModal');
  });

  // ════════════ 四方阻力資源系統 ════════════
  function clampRes(v) { return Math.max(0, Math.min(100, Math.round(v))); }

  function renderResources() {
    RES_KEYS.forEach((k) => {
      const v = gameState.res[k];
      const danger = v <= SETBACK_THRESHOLD;   // 告急（紅色脈動）
      const fill = document.getElementById('res-' + k + '-fill');
      const num = document.getElementById('res-' + k + '-num');
      if (fill) { fill.style.width = v + '%'; fill.classList.toggle('is-low', v < 25); fill.classList.toggle('is-danger', danger); }
      if (num) { num.textContent = v; num.classList.toggle('is-danger', danger); }
      // 地圖常駐四方阻力小列
      const mf = document.getElementById('mres-' + k);
      const mn = document.getElementById('mresn-' + k);
      if (mf) { mf.style.width = v + '%'; mf.classList.toggle('is-low', v < 25); mf.classList.toggle('is-danger', danger); }
      if (mn) { mn.textContent = v; mn.classList.toggle('is-danger', danger); }
    });
  }

  // 四方阻力告急：某項首次跌入危險區即明顯警示
  let _dangerWarned = {};
  function warnIfDanger() {
    RES_KEYS.forEach((k) => {
      const v = gameState.res[k];
      if (v <= SETBACK_THRESHOLD && !_dangerWarned[k]) {
        _dangerWarned[k] = true;
        if (typeof flashHint === 'function') flashHint('⚠ ' + RES_META[k].name.replace(/\s+/g, '') + ' 告 急 · 須 速 設 法 挽 回');
      } else if (v > SETBACK_THRESHOLD + 6) {
        _dangerWarned[k] = false;   // 回升後可再次警示
      }
    });
  }

  function showResToast(changed) {
    const s3 = document.getElementById('screen3');
    if (!s3 || !changed.length) return;
    const t = document.createElement('div');
    t.className = 'res-toast';
    t.innerHTML = changed.map((c) => {
      const m = RES_META[c.k];
      return '<span class="' + (c.d > 0 ? 'up' : 'down') + '">' + m.name + ' ' + (c.d > 0 ? '+' : '−') + Math.abs(c.d) + '</span>';
    }).join('');
    s3.appendChild(t);
    setTimeout(() => { try { t.remove(); } catch (e) {} }, 2600);
  }

  // 套用資源變動（含飄字、存檔、延後檢查反撲）
  function applyResourceEffects(effects, opts) {
    if (!effects) return;
    opts = opts || {};
    const changed = [];
    Object.keys(effects).forEach((k) => {
      if (gameState.res[k] === undefined) return;
      const before = gameState.res[k];
      gameState.res[k] = clampRes(before + effects[k]);
      if (gameState.res[k] !== before) changed.push({ k, d: gameState.res[k] - before });
    });
    renderResources();
    if (changed.length && !opts.silent) showResToast(changed);
    warnIfDanger();
    saveGame();
    checkDismissal();
    if (!opts.noSetback) setTimeout(checkResourceSetbacks, 500);
  }

  // 失敗結局：聖眷歸零 → 罷官還鄉（提前出局）
  function checkDismissal() {
    if (gameOver) return;
    if ((gameState.res.favor || 0) <= 0) { gameOver = true; triggerDismissal(); }
  }
  function triggerDismissal() {
    gameState.dismissed = true;
    try { saveGame(); } catch (e) {}
    // 收掉開啟中的彈窗，免得壓在結算上
    ['eventModal', 'interludeModal', 'hotspotModal', 'evidenceTaskModal', 'setbackModal'].forEach((id) => {
      document.getElementById(id)?.setAttribute('hidden', '');
    });
    if (typeof flashHint === 'function') flashHint('聖 眷 盡 失 · 罷 官 還 鄉');
    if (window.__BGM && __BGM.isOn && __BGM.isOn()) { try { __BGM.impact(); } catch (e) {} }
    setTimeout(() => { try { showSettlement(); } catch (e) {} }, 1100);
  }

  // 阻力反撲（軟懲罰：扣分 + DSE 解說，不 game over）
  const SETBACK_THRESHOLD = 22;
  const SETBACKS = {
    favor:    { title: '聖 眷 已 疏', body: '中樞對洋務日生疑忌。一道上諭，撥往製造局的款項被挪去別用——「該衙門靡費過甚，著即核減。」', penalty: { funds: -6 }, dse: '最高領導（朝廷／慈禧）對洋務並非全力支持，甚至挪用海軍經費修頤和園——「中央缺乏堅定支持」是洋務失敗的關鍵原因。（DSE：失敗原因）' },
    opinion:  { title: '清 議 反 撲', body: '御史聯名上奏，痛斥西學為「奇技淫巧」、有傷風化，要求裁撤新政學堂。守舊之聲，滿朝鼎沸。', penalty: { favor: -5 }, dse: '以倭仁為首的守舊派，視西學為末技、力衞「中體」之道，是洋務推行的最大內部阻力之一。（DSE：守舊派反對）' },
    populace: { title: '民 怨 沸 騰', body: '鄉間盛傳洋人挖眼製藥、鐵路斷龍脈傷風水。一處教案爆發，工程被迫停頓——洋務之名，在民間竟成了禍。', penalty: { funds: -5 }, dse: '民智未開、迷信與排外（反洋教、以風水反對鐵路礦務），使洋務在基層舉步維艱。（DSE：民智未開·民間反對）' },
    funds:    { title: '餉 源 將 罄', body: '海關洋稅有限，厘金層層截留。製造局的工匠數月未得餉，新購的機器只能蒙塵——「巧婦難為無米之炊。」', penalty: { opinion: -4 }, dse: '洋務經費主要靠海關洋稅與厘金，始終短絀；中央無統一財政規劃，是洋務難以為繼的根本困境。（DSE：經費不足）' }
  };

  function checkResourceSetbacks() {
    checkDismissal();
    if (gameOver) return;
    if (document.querySelector('.event-modal:not([hidden]), .letter-modal:not([hidden]), .settlement:not([hidden]), .setback-modal:not([hidden])')) return;
    for (let i = 0; i < RES_KEYS.length; i++) {
      const k = RES_KEYS[i];
      if (gameState.res[k] < SETBACK_THRESHOLD) {
        const last = gameState.setbackAt[k];
        if (last === undefined || (gameState.currentYear - last) >= 4) {
          gameState.setbackAt[k] = gameState.currentYear;
          saveGame();
          triggerSetback(k);
          return;  // 一次只彈一個
        }
      }
    }
  }

  function triggerSetback(k) {
    const sb = SETBACKS[k];
    if (!sb) return;
    const modal = document.getElementById('setbackModal');
    if (!modal) return;
    const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    setText('sbTitle', sb.title);
    setText('sbBody', sb.body);
    setText('sbDse', stripDseTag(sb.dse));
    const pen = document.getElementById('sbPenalty');
    if (pen) pen.innerHTML = Object.keys(sb.penalty).map((rk) => {
      return '<span class="sb-pen-item">' + RES_META[rk].name + ' − ' + Math.abs(sb.penalty[rk]) + '</span>';
    }).join('');
    openManagedModal('setbackModal');
    // 套用連鎖懲罰（不再觸發新反撲，避免連環）
    applyResourceEffects(sb.penalty, { silent: true, noSetback: true });
  }
  document.getElementById('sbOk')?.addEventListener('click', () => {
    hideManagedModal('setbackModal');
  });

  // ════════════ 丙·動態小事件（不耗行動的過場插曲）════════════
  // 在城內推進落於「空檔年」（無鐵釘、無待辦）時，必出一張時局插曲：阻力示警／友訊／見聞。
  const INTERLUDE_WARN_LOW = 40;   // 資源警戒帶上限（門檻22 ~ 此值之間優先示警）
  const INTERLUDES = {
    favor: [
      { id: 'fav1', kicker: '朝 中 風 聲', title: '聖 眷 浮 動',
        text: '有人在太后面前進言，說你「專擅洋務、結交外人」。聖眷之事，向來最難測。',
        dse: '洋務派依附權臣、聖眷不穩——朝廷對改革缺乏堅定信任。',
        options: [
          { label: '入京陛見 · 表忠輸誠', effects: { favor: 5, funds: -3 }, note: '一番剖白，聖心稍安——可這趟打點，又是一筆人情與開銷。' },
          { label: '托重臣代為周旋', effects: { favor: 3, opinion: -2 }, note: '借李鴻章等之力暫穩聖眷，卻更被清流視為「朋黨」。' }
        ] },
      { id: 'fav2', kicker: '名 分 之 議', title: '越 分 任 事',
        text: '你以書記之身，竟與督撫直接議洋務大計，有人冷笑你「越分妄為、好出風頭」。',
        dse: '洋務新政衝擊舊有名分官制，行事者易被指「越權」——體制本身即阻力。',
        options: [
          { label: '謹守本分 · 退居幕後', effects: { favor: 4, opinion: -1 }, note: '你斂去鋒芒，聖眷得保——可有些該說的話，終究嚥了回去。' },
          { label: '借勢任事 · 放手去做', effects: { favor: -2, funds: 4 }, note: '你不避嫌疑、實心辦事，事是辦成了，閒話卻也多了。' }
        ] },
      { id: 'fav3', kicker: '內 廷 傳 聞', title: '海 軍 之 款', minYear: 1885,
        text: '傳聞海軍衙門的經費，將為修葺頤和園挪用。你若進言，恐拂逆上意。',
        dse: '海軍經費被挪修頤和園，北洋艦隊長年未能更新——埋下甲午慘敗的伏線。',
        options: [
          { label: '上疏力諫 · 請專款於海防', effects: { opinion: 5, favor: -5 }, note: '你犯顏直諫，士林稱許，聖心卻已不悅——這一疏，前程堪虞。' },
          { label: '緘默不言 · 明哲保身', effects: { favor: 3, populace: -2 }, note: '你嚥下諫言，聖眷得保——只是那幾艘該添的快船，從此沒了下文。' }
        ] }
    ],
    opinion: [
      { id: 'op1', kicker: '士 林 之 議', title: '清 議 沸 騰',
        text: '京中御史聯名上奏，痛斥洋務「用夷變夏、糜費無度」。清流的筆，比洋槍更難擋。',
        dse: '守舊派／清議視西學為末技，是洋務最大的內部阻力之一。',
        options: [
          { label: '上疏自辯 · 力陳自強', effects: { opinion: 5, favor: -2 }, note: '你據理力爭，謗議稍緩，卻也因「強辯」開罪部分清流。' },
          { label: '低調行事 · 避其鋒芒', effects: { opinion: 2 }, note: '你暫避風頭，洋務之事，只能悄悄地做。' }
        ] },
      { id: 'op2', kicker: '理 學 之 爭', title: '中 體 西 用', maxYear: 1875,
        text: '理學名臣倭仁上奏：「立國之道，尚禮義不尚權謀」，痛詆同文館招正途人員習西學、奉夷為師。',
        dse: '倭仁等守舊派反對同文館，認為西學動搖儒家根本——「中體西用」下的思想阻力。',
        options: [
          { label: '據理駁之 · 西學亦聖人之道', effects: { opinion: 4, favor: -2 }, note: '你引經據典反駁，新學暫得喘息——卻也被視為「離經叛道」。' },
          { label: '折衷其說 · 體用並舉', effects: { opinion: 2 }, note: '你以「中學為體、西學為用」緩頰，爭議稍平，根本之問卻被擱下。' }
        ] },
      { id: 'op3', kicker: '使 臣 蒙 謗', title: '出 洋 之 辱', minYear: 1877,
        text: '出使外洋的使臣，因稱許西方政教、記其見聞，竟被同鄉刊文痛罵「有二心於英國」。',
        dse: '郭嵩燾因主張學習西方政教制度而遭士林唾罵，反映清議對「制度層」改革的強烈排斥。',
        options: [
          { label: '為之聲援 · 刊布其書', effects: { opinion: 4, favor: -3 }, note: '你公開聲援，識者額手——守舊者卻把你也記上了一筆。' },
          { label: '惋惜而已 · 不敢附和', effects: { opinion: 1 }, note: '你私下嘆息：連「看一看西方」都成了罪過，遑論變法。' }
        ] }
    ],
    populace: [
      { id: 'pop1', kicker: '市 井 浮 言', title: '民 情 不 安',
        text: '鄉間盛傳鐵路電線「斷龍脈、傷風水」，又怨機器奪了手藝人的飯碗。怨氣在市井蔓延。',
        dse: '民智未開、迷信排外，使洋務缺乏社會基礎。',
        options: [
          { label: '出告示 · 遣紳耆安撫', effects: { populace: 5, funds: -2 }, note: '好言相勸，浮言稍歇——安一方民心，從不只靠一紙告示。' },
          { label: '照舊推行 · 不予理會', effects: { populace: -3 }, note: '工程照舊，民怨積壓，他日恐釀更大風波。' }
        ] },
      { id: 'pop2', kicker: '民 教 相 爭', title: '教 案 又 起',
        text: '鄉間又起教案風聲：民與教民因田土、習俗械鬥，洋人領事屢屢登門交涉。',
        dse: '民教衝突（如天津教案）反映民間排外情緒，是洋務對外交涉的長期難題。',
        options: [
          { label: '彈壓護教 · 息事寧人', effects: { populace: -3, favor: 2 }, note: '你照條約彈壓了事，洋人滿意，民間卻罵你「媚外」。' },
          { label: '持平勘斷 · 不偏不倚', effects: { populace: 4, funds: -2 }, note: '你細查曲直、撫卹兩造，民心稍安——只是這碗水，端得實在費力。' }
        ] },
      { id: 'pop3', kicker: '失 業 鼓 噪', title: '奪 我 生 計',
        text: '輪船招商局開行，沙船幫、漕運水手頓失生計，群聚碼頭鼓噪不去。',
        dse: '近代企業衝擊沙船、漕運等傳統行業，造成社會反彈——洋務「求富」的社會代價。',
        options: [
          { label: '撥款安置 · 收為局用', effects: { populace: 4, funds: -3 }, note: '你招撫部分水手入局，怨氣稍平——安頓人心，從來不便宜。' },
          { label: '照章裁汰 · 不得不然', effects: { populace: -3 }, note: '新舊交替，總有人被甩在後頭——這代價，最終由小民承受。' }
        ] }
    ],
    funds: [
      { id: 'fund1', kicker: '度 支 告 急', title: '餉 源 拮 据',
        text: '製造局與防營的餉銀又遲了。委員上稟：「巧婦難為無米之炊，再拖恐生變。」',
        dse: '洋務無穩定餉源，經費短絀是難以為繼的根本困境。',
        options: [
          { label: '挪海關洋稅暫濟', effects: { funds: 6, favor: -3 }, note: '銀子到位，卻動了別處的款，朝中已有微詞。' },
          { label: '樽節度日 · 緩購器械', effects: { funds: 2 }, note: '省下些許，新機器新船械只得再等——自強的步子又慢一拍。' }
        ] },
      { id: 'fund2', kicker: '雜 款 支 絀', title: '善 後 無 銀',
        text: '戰事善後、撫卹、修械，處處要銀，藩庫早已見底，唯餘加抽釐金一途。',
        dse: '洋務經費多賴釐金、海關稅等雜款拼湊，加稅又激民怨——財政結構性困境。',
        options: [
          { label: '加抽釐金 · 取於商旅', effects: { funds: 6, populace: -3 }, note: '關卡林立、層層抽釐，銀子是有了，商民的怨氣也漲了。' },
          { label: '奏請部撥 · 仰給中央', effects: { funds: 2, favor: -1 }, note: '戶部勉強撥了些，卻嫌你「靡費」——求人的款，從來不痛快。' }
        ] },
      { id: 'fund3', kicker: '洋 行 進 言', title: '借 債 興 工',
        text: '有洋行願借鉅款，供築路、購艦、開礦，息重而見效快。借，還是不借？',
        dse: '舉借外債可加速洋務，卻加深財政依賴、利權外流——「飲鴆止渴」的兩難。',
        options: [
          { label: '借洋債 · 速興船炮路礦', effects: { funds: 10, opinion: -5 }, note: '銀到工興，氣象一新——只是這筆重息與利權，已悄悄抵押了出去。' },
          { label: '量入為出 · 不假外人', effects: { funds: 2 }, note: '你守住了利權，自強的步子卻只能一寸寸地挪。' }
        ] }
    ],
    network: [
      { id: 'net1', kicker: '故 人 來 信', title: '同 道 寄 書',
        text: '網絡中的同道寄來一封信，談及各地洋務見聞，末了問你近況。',
        options: [
          { label: '回信 · 互通消息', effects: { opinion: 2 }, note: '你與同道互通有無，對天下大勢又多一分了解。' },
          { label: '附寄洋務籌略', effects: { favor: 1, opinion: 1 }, note: '同道間的聲氣，正是改革難得的助力。' }
        ] },
      { id: 'net_ronghong', who: 'ronghong', minYear: 1872, kicker: '滬 上 來 信', title: '容 閎 · 幼 童 之 憂',
        text: '容閎自上海來信，談及幼童在美所學日進，卻憂朝中守舊者屢言其「忘本崇洋」，欲奏請召回。',
        dse: '容閎推動留美幼童，主張教育與人才為自強根本；計劃終因守舊派攻訐而中途撤回。',
        options: [
          { label: '覆信力挺 · 請續派留學', effects: { opinion: 3, favor: -2 }, note: '你撐他到底——育才是百年之計，豈可半途而廢。' },
          { label: '婉陳其難 · 勸其慎行', effects: { favor: 1 }, note: '你深知朝局險惡，只能勸他暫避鋒芒——可惜，可惜。' }
        ] },
      { id: 'net_xushou', who: 'xushou', minYear: 1868, kicker: '譯 館 寄 書', title: '徐 壽 · 明 理 為 先',
        text: '徐壽自江南製造局翻譯館寄來新譯的化學圖說，信中道：「欲精製造，必先明其理，徒購機器無益。」',
        dse: '徐壽於翻譯館譯介西方科技，主張「明理」乃製造之本，是洋務由器物走向科學認知的一環。',
        options: [
          { label: '助其刊行 · 廣布西學', effects: { opinion: 2, funds: -1 }, note: '你出資助刊——譯一部書，勝過買十架機器。' },
          { label: '致謝存念 · 細加研讀', effects: {}, note: '你細讀其書，方知「能造」之前，須先「能解其理」。' }
        ] },
      { id: 'net_xurun', who: 'xurun', minYear: 1873, kicker: '招 商 局 函', title: '徐 潤 · 商 戰 之 艱',
        text: '徐潤自輪船招商局來函，談洋商削價傾軋、華商集股觀望之難，末了問可有官帑暫濟。',
        dse: '招商局與外國輪船公司「商戰」，反映洋務「求富」中官督商辦企業的資金與競爭困境。',
        options: [
          { label: '為之轉圜 · 籌撥官帑', effects: { funds: 3, favor: -1 }, note: '你代為周旋撥款——華商的船，總算能與洋輪爭一爭利權。' },
          { label: '勉以自強 · 集股應之', effects: { opinion: 1 }, note: '你勸他廣集商股、苦撐到底——求富之路，從來不易。' }
        ] },
      { id: 'net_yanfu', who: 'yanfu', minYear: 1879, kicker: '英 倫 寄 書', title: '嚴 復 · 富 強 之 本',
        text: '嚴復自英倫寄書，縱論西洋富強之本不在堅船利炮，而在學術、政教、民智——「中體西用」恐未中肯綮。',
        dse: '嚴復留學歸來，指西方富強根源在學術政教制度，超越「中體西用」只改器物的局限，啟維新思潮。',
        options: [
          { label: '深以為然 · 暗思變法', effects: { opinion: 2 }, note: '你心頭一震：原來洋務改的，只是皮毛——根本之變，尚在後頭。' },
          { label: '半信半疑 · 姑存其說', effects: {}, note: '你將信將疑，卻已埋下一粒種子——他日，或將發芽。' }
        ] },
      { id: 'net_giquel', who: 'giquel', minYear: 1866, kicker: '船 政 來 訪', title: '日 意 格 · 洋 員 之 功',
        text: '法國洋員日意格來訪，談船政造艦進度頭頭是道，言下頗以監造之功自得，又暗示合同當續。',
        dse: '福州船政依賴日意格等法國洋員設計監造，凸顯洋務「關鍵技術依賴外國」的根本局限。',
        options: [
          { label: '虛心請益 · 厚禮相待', effects: { funds: -1 }, note: '你以禮待之，技藝是學到些——可這份倚賴，何時是個頭？' },
          { label: '暗催育才 · 圖謀自主', effects: { opinion: 1 }, note: '你表面周旋，心中已定：須快養成自有工匠，方不必處處仰人。' }
        ] },
      { id: 'net_woren', who: 'woren', maxYear: 1875, kicker: '理 學 之 詰', title: '倭 仁 · 衞 道 不 移',
        text: '倭仁府上傳出話來，仍以「立國在禮義人心，不在權謀技巧」相詰，於洋務諸事，始終不以為然。',
        dse: '倭仁為理學名臣、守舊派領袖，以儒家禮義反對西學新政，是洋務運動最大的思想阻力之一。',
        options: [
          { label: '登門辯說 · 力陳體用', effects: { opinion: 2, favor: -1 }, note: '你據理力爭，他不為所動——道不同，終究難相為謀。' },
          { label: '敬而遠之 · 各行其是', effects: {}, note: '你避其鋒芒，心知這道「人心」之牆，比洋人的炮還難破。' }
        ] }
    ],
    insight: [
      { id: 'ins_material', axisGate: { axis: 'material', min: 6 }, kicker: '器 物 之 眼', title: '船 炮 之 外',
        text: '看過太多煙囪、船塢與槍炮，你漸漸看穿一件事：器物仿造得再像，鋼材、機器、圖紙仍處處仰賴外人。',
        dse: '洋務軍工雖能仿造，關鍵材料與技術長期依賴進口與洋員——「只學器物、未能自主」是其根本局限。',
        options: [ { label: '記 下 這 層 體 悟', effects: {}, note: '你記下：能仿造，未必能自主；器物之學，到底只是表層。' } ] },
      { id: 'ins_system', axisGate: { axis: 'system', min: 6 }, kicker: '制 度 之 眼', title: '政 體 未 動',
        text: '愈看朝局、衙門與外交之變，你愈明白：洋務動了器物、設了新衙，卻始終不碰科舉、官制與政體。',
        dse: '洋務以「中體西用」為限，只改器物與部分機構、未觸政治制度，是其無法根本自強的關鍵局限。',
        options: [ { label: '記 下 這 層 體 悟', effects: { opinion: 1 }, note: '你記下：不變政體，新政終究是舊軀殼上的補丁。' } ] },
      { id: 'ins_thought', axisGate: { axis: 'thought', min: 6 }, kicker: '思 想 之 眼', title: '人 心 未 開',
        text: '你重人才、重西學、重思想之變，終於望見最深一層：富強之本不在器物制度，而在學術與民智之開。',
        dse: '嚴復等指西方富強根於學術政教與民智；思想啟蒙的缺位，使洋務缺乏社會基礎，伏線日後維新。',
        options: [ { label: '記 下 這 層 體 悟', effects: {}, note: '你記下：器物可購、制度可仿，唯人心民智之開，最難而最久。' } ] }
    ],
    vignette: [
      // ── 情緒高點：希望之巔（留學啟碇）──
      { id: 'vig_hope', kicker: '少 年 遠 行', title: '海 天 之 際', minYear: 1872, maxYear: 1881,
        text: '江口，一艘輪船載著留洋幼童啟碇。最小的不過十二三歲，趴在欄杆上回望故土，眼裡有淚，也有光。送行的人輕聲說：「這些娃娃，是大清的種子。」',
        dse: '留美幼童承載著洋務育才的最大希望——這是自強運動最明亮的一刻。（DSE：文教改革·育才之望）',
        options: [ { label: '目 送 他 們 遠 去', effects: {}, note: '你站在岸邊很久。三十年裡見過太多帳目與爭吵，可這一刻你忽然相信：只要種子撒下去，總有開花的一天。' } ] },
      // ── 情緒高點：盛極之歎（北洋列陣）──
      { id: 'vig_peak', kicker: '海 防 重 鎮', title: '巨 艦 列 陣', minYear: 1888, maxYear: 1891,
        text: '定遠、鎮遠泊在港中，鐵甲映日、巨炮指天——號稱「亞洲第一」的艦隊，就在眼前。一名老水兵紅著眼說：「打了一輩子敗仗，總算有揚眉吐氣這一天。」',
        dse: '北洋海軍成軍是洋務「強兵」的巔峰——然盛極之後，便是甲午的長坡。（DSE：海防·強兵的頂點）',
        options: [ { label: '與 有 榮 焉', effects: { favor: 1 }, note: '你也紅了眼眶。三十年自強，至此似見頂點。可你心底有個聲音，輕輕問了一句：頂點之後呢？' } ] },
      { id: 'vig1', kicker: '街 市 見 聞', title: '洋 貨 盈 市',
        text: '市集上洋布、洋油、洋火堆積如山，本地土布、土貨乏人問津。',
        dse: '列強商品傾銷，衝擊本土手工業——洋務「求富」要回應的問題。',
        options: [ { label: '記 下 所 見', effects: { populace: -1 }, note: '你記下：不興實業、不奪利權，民生終被洋貨蠶食。' } ] },
      { id: 'vig2', kicker: '江 上 見 聞', title: '輪 船 過 境',
        text: '一艘掛著外國旗的輪船鳴笛駛過，本地沙船帆影遠遠落在後頭。',
        dse: '航運利權旁落外人——招商局一類民用企業正為此而設。',
        options: [ { label: '記 下 所 見', effects: {}, note: '你記下：船堅，更要自有；利權，終須自掌。' } ] },
      { id: 'vig3', kicker: '邸 報 傳 抄', title: '各 省 參 差',
        text: '邸報傳來各省洋務消息：有的興工廠學堂，有的按兵不動，步調全然不一。',
        dse: '洋務由地方督撫分頭推行，缺乏中央統籌。',
        options: [ { label: '記 下 所 見', effects: {}, note: '你記下：無全國一盤棋，洋務終是零散的自強。' } ] },
      { id: 'vig4', kicker: '學 堂 見 聞', title: '新 學 書 聲',
        text: '路過一所新式學堂，少年們誦讀外語、演算西學，與街角私塾的書聲交錯。',
        dse: '新式學堂培養西學人才，屬洋務文教改革。',
        options: [ { label: '記 下 所 見', effects: { opinion: 1 }, note: '你記下：器物之外，育才方是長久之計。' } ] },
      { id: 'vig5', kicker: '電 線 見 聞', title: '頃 刻 千 里',
        text: '一封電報自天津瞬息傳至上海，圍觀的商人嘖嘖稱奇，直道是「神仙手段」。',
        dse: '電報線的架設是洋務「求強求富」的近代基礎設施，大幅加快軍政商情傳遞。',
        options: [ { label: '記 下 所 見', effects: {}, note: '你記下：消息快一刻，調度便靈一分——這也是國力。' } ] },
      { id: 'vig6', kicker: '路 工 見 聞', title: '鐵 路 受 阻',
        text: '鄉紳聯名呈文，說鐵路「震動陵寢、奪民田廬」，工程一再受阻，甚至有已築之路被拆。',
        dse: '鐵路因風水、民田與守舊觀念屢遭反對（如吳淞鐵路被拆毀），洋務基建步履維艱。',
        options: [ { label: '記 下 所 見', effects: { populace: -1 }, note: '你記下：器物易購，人心難移——這才是最硬的關。' } ] },
      { id: 'vig7', kicker: '歸 客 見 聞', title: '留 洋 歸 來', minYear: 1872,
        text: '幾名剪了短髮、著洋裝的少年自美歸來，操著流利英語，街市行人側目而視。',
        dse: '留美幼童計劃培養新式人才，卻因保守勢力指其「離經叛道」而中途撤回。',
        options: [ { label: '記 下 所 見', effects: { opinion: 1 }, note: '你記下：好不容易養成的人才，竟容不下——可惜，可嘆。' } ] },
      { id: 'vig8', kicker: '礦 區 見 聞', title: '黑 金 滾 滾',
        text: '開平的煤一車車裝船，運往天津機器局與北洋兵船，爐火日夜不熄。',
        dse: '開平煤礦為近代工業與海軍提供燃料，是洋務「求富」較成功的民用企業個案。',
        options: [ { label: '記 下 所 見', effects: { funds: 1 }, note: '你記下：自有煤鐵，船炮才不必處處仰人鼻息。' } ] },
      { id: 'vig9', kicker: '譯 館 見 聞', title: '西 書 東 來',
        text: '製造局譯出的西書堆滿案頭：算學、化學、汽機、製器之法，字字皆是新天地。',
        dse: '江南製造局翻譯館系統譯介西方科技書籍，是西學東漸的重要管道。',
        options: [ { label: '記 下 所 見', effects: {}, note: '你記下：能造之先，須能譯、能算、能解其理。' } ] },
      // ── 途中人物（結識後入「舊友新知」名冊）──
      { id: 'vig_chashang', city: 'guangzhou', kicker: '茶 寮 偶 遇', title: '走 販 老 茶 客',
        text: '茶寮裏一位白髯老者，曾走南闖北販茶數十年。談起洋商通商、釐卡苛雜，見解老辣，末了嘆一句「世道變了」。',
        dse: '民間商旅對通商與釐金的切身觀感，是洋務經濟政策的社會面。',
        options: [ { label: '與 之 攀 談 · 記 下 其 人', effects: {}, note: '你記下這位老茶客——市井之見，往往比奏摺更實。' } ] },
      { id: 'vig_matou', city: 'tianjin', kicker: '碼 頭 偶 遇', title: '海 河 工 頭',
        text: '海河碼頭上一名工頭，指揮著扛包的腳夫。他說洋輪一來、沙船生意一落千丈，弟兄們的飯碗都懸著。',
        dse: '近代輪運衝擊傳統沙船、漕運從業者的生計，是洋務「求富」的社會代價。',
        options: [ { label: '記 下 其 人 與 其 憂', effects: { populace: 1 }, note: '你記下：機器奪了舊飯碗，新飯碗卻未及生出。' } ] },
      { id: 'vig_xuetu', city: 'fuzhou', kicker: '船 廠 偶 遇', title: '船 政 學 徒',
        text: '船塢邊一名少年學徒，捧著圖紙演算，眼裏有光。他說將來要造出全由華人設計的鐵甲艦。',
        dse: '船政學堂培養本土造船、駕駛人才，是洋務「育才求自主」的希望所在。',
        options: [ { label: '勉 其 向 學 · 記 下 其 人', effects: { opinion: 1 }, note: '你記下：器物可購，唯這雙眼裏的志氣，買不來。' } ] },
      { id: 'vig_shuli', city: 'beijing', kicker: '官 署 偶 遇', title: '中 樞 書 吏',
        text: '中樞官署裏遇見一名與你同樣奔走公文的書吏，彼此一見如故，談洋務、談前程，也談這京城的冷暖。',
        dse: '基層書吏是洋務政令落地的執行末梢，他們的見聞構成改革的真實肌理。',
        options: [ { label: '結 為 同 道 · 互 通 聲 氣', effects: { opinion: 1 }, note: '你記下：這條自強路上，總算多一個說得上話的人。' } ] },
      { id: 'vig_jiaoxi', city: 'shanghai', kicker: '學 堂 偶 遇', title: '西 學 教 習',
        text: '廣方言館裏一位受聘的西洋教習，正用半生不熟的官話講解算學。課後與你閒談，談中西之異，頗為懇切。',
        dse: '洋務聘用外國教習傳授西學西藝，既收一時之效，亦埋下「技術依賴外人」之憂。',
        options: [ { label: '虛 心 請 益 · 記 下 其 人', effects: {}, note: '你記下：師夷之技，終須化為己有，方不受制於人。' } ] },
      { id: 'vig_xiangshen', city: 'nanjing', kicker: '鄉 里 偶 遇', title: '江 南 鄉 紳',
        text: '江南一位守舊鄉紳，捻鬚搖頭，說鐵路電線「驚擾祖塋、有傷地脈」，斷不可行，一臉理直氣壯。',
        dse: '地方士紳的守舊與風水之忌，是洋務新政在基層推行的真實阻力。',
        options: [ { label: '耐 心 周 旋 · 記 下 其 人', effects: { populace: 1 }, note: '你記下：最難開的，從不是礦，而是人心。' } ] },
      { id: 'vig_kp_miner', city: 'kaiping', kicker: '礦 區 偶 遇', title: '開 平 礦 工',
        text: '井口一名滿臉煤灰的礦工剛升井換班。他說洋法開採省力得多，可工錢仍薄、塌方仍險，命是自己的。',
        dse: '開平煤礦以機器開採、為近代工業與海軍供煤，但礦工的待遇與安全，是「求富」企業的底層代價。',
        options: [ { label: '記 下 其 人 與 其 苦', effects: { populace: 1 }, note: '你記下：黑金滾滾上船，礦工的命卻仍按舊價算。' } ] },
      { id: 'vig_wh_ironworker', city: 'wuhan', kicker: '鐵 廠 偶 遇', title: '漢 陽 鐵 工',
        text: '漢陽鐵廠的爐前工，渾身被高爐烤得通紅。他說廠子虧不虧、官老爺爭不爭，他不懂，只知這爐火不能熄。',
        dse: '漢陽鐵廠為亞洲第一座近代鋼鐵廠，爐前工人是後期重工業「求強求富」的血肉基礎。',
        options: [ { label: '記 下 其 人 與 爐 火', effects: {}, note: '你記下：官帳上的虧累，與爐前這身汗，是兩本不通的帳。' } ] },
      { id: 'vig_hk_baoren', city: 'hongkong', kicker: '報 館 偶 遇', title: '報 館 編 輯',
        text: '循環日報館裏一名年輕編輯，剪報、譯電、寫論說，徹夜不息。他說一紙報章勝過十道奏摺——因為它說給萬民聽。',
        dse: '香港華文報刊（如王韜《循環日報》）開啟近代輿論，是早期維新變法思潮的民間搖籃。',
        options: [ { label: '與 論 時 局 · 記 下 其 人', effects: { opinion: 1 }, note: '你記下：船炮能禦一時之敵，輿論卻能變一代之心。' } ] }
    ]
  };

  function pickInterlude() {
    gameState.shownInterludes = gameState.shownInterludes || [];
    const used = new Set(gameState.shownInterludes);
    const yr = gameState.currentYear || 0;
    const netKeys = new Set((gameState.network || []).map((p) => p.key));
    // 合格＝年代相符 且（非人物卡 或 已結識該人物）且（無見識門檻 或 該軸已達門檻）
    const axisVal = (a) => (gameState.axes && gameState.axes[a]) || 0;
    const eligible = (c) => (!c.minYear || yr >= c.minYear) && (!c.maxYear || yr <= c.maxYear)
      && (!c.who || netKeys.has(c.who))
      && (!c.axisGate || axisVal(c.axisGate.axis) >= c.axisGate.min)
      && (!c.city || gameState.currentCity === c.city);   // 途中人物：限該城
    const pickFresh = (pool) => {
      if (!pool || !pool.length) return null;
      const ok = pool.filter(eligible);
      const base = ok.length ? ok : pool;        // 無合格者則放寬（避免空手）
      const fresh = base.filter((c) => !used.has(c.id));
      const arr = fresh.length ? fresh : base;   // 用盡則允許重複
      return arr[Math.floor(Math.random() * arr.length)];
    };
    // 1. 阻力示警：警戒帶（門檻 ~ 警戒上限）中最低的資源優先
    let warnKey = null, warnVal = Infinity;
    RES_KEYS.forEach((k) => {
      const v = gameState.res[k];
      if (v >= SETBACK_THRESHOLD && v <= INTERLUDE_WARN_LOW && v < warnVal) { warnVal = v; warnKey = k; }
    });
    if (warnKey) { const c = pickFresh(INTERLUDES[warnKey]); if (c) return c; }
    // 1.5 見識所及：見識軸初達門檻時，優先讓玩家看見「眼界打開」（僅首見高優先）
    const insFresh = (INTERLUDES.insight || []).filter((c) => eligible(c) && !used.has(c.id));
    if (insFresh.length) return insFresh[Math.floor(Math.random() * insFresh.length)];
    // 2. 友訊（有網絡 + 半數機率）
    if ((gameState.network || []).length && Math.random() < 0.5) {
      const c = pickFresh(INTERLUDES.network); if (c) return c;
    }
    // 3. 見聞
    return pickFresh(INTERLUDES.vignette);
  }

  function showInterlude(card) {
    const modal = document.getElementById('interludeModal');
    if (!modal || !card) return;
    gameState.shownInterludes = gameState.shownInterludes || [];
    if (!gameState.shownInterludes.includes(card.id)) gameState.shownInterludes.push(card.id);
    const setText = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
    setInterludeImage(card.img || gameState.currentCity);
    setText('ilKicker', card.kicker || '時 局 一 隅');
    setText('ilTitle', card.title || '');
    setText('ilText', card.text || '');
    const dseEl = document.getElementById('ilDse');
    if (dseEl) {
      if (card.dse) { dseEl.textContent = '【史】' + stripDseTag(card.dse); dseEl.removeAttribute('hidden'); }
      else dseEl.setAttribute('hidden', '');
    }
    const opts = document.getElementById('ilOptions');
    if (opts) {
      opts.innerHTML = '';
      (card.options || []).forEach((o) => {
        const btn = document.createElement('button');
        btn.className = 'il-option';
        btn.type = 'button';
        btn.innerHTML = '<span class="ilo-label">' + escapeHTML(o.label) + '</span>' + effectChips(o.effects);
        btn.addEventListener('click', () => resolveInterlude(o));
        opts.appendChild(btn);
      });
    }
    openManagedModal('interludeModal');
  }

  function resolveInterlude(opt) {
    if (opt.effects) applyResourceEffects(opt.effects, { noSetback: true });   // 不耗行動、不觸發反撲連鎖
    if (opt.meet && opt.meet.key) { addToNetwork(opt.meet.key, opt.meet.name, opt.meet.relation); renderNetwork(); }   // 途中人物入名冊
    const opts = document.getElementById('ilOptions');
    if (opts) {
      opts.innerHTML = '<p class="il-note">' + stripDseTag(opt.note || '') + '</p>' +
        '<button class="il-option il-continue" type="button" id="ilContinue">繼 續 →</button>';
      document.getElementById('ilContinue')?.addEventListener('click', () => {
        hideManagedModal('interludeModal');
      });
    }
    saveGame();
  }

  function maybeShowInterlude(yearsElapsed) {
    if (!yearsElapsed) return;
    if (gameState.pendingPinnedId || gameState.locked) return;   // 有要事待辦則不插入
    if (PINNED_BY_YEAR[gameState.currentYear]) return;           // 落在鐵釘年則讓鐵釘優先
    if (gameState.currentYear >= 1895) return;                   // 結算年不插入
    setTimeout(() => {
      if (document.querySelector('.event-modal:not([hidden]), .letter-modal:not([hidden]), .settlement:not([hidden]), .setback-modal:not([hidden]), .interlude-modal:not([hidden])')) return;
      const card = pickInterlude();
      if (card) showInterlude(card);
    }, 1300);
  }

  // ════════════ 支柱三·懸案（需求拉力）════════════
  // 鐵釘之間的帶限期時局：及時前往處理 → 穩住阻力；置之不理逾期 → 該阻力失血。
  const SUSPENSE_PENALTY = 8;   // 逾期失血（調高：迫使玩家正視懸案）
  const SUSPENSE_DEADLINE = 2;  // 限期（年）
  const SUSPENSES = [
    { id: 'sus_sh_shachuan', year: 1863, city: 'shanghai', res: 'funds',
      kicker: '滬 上 告 急', title: '沙 船 失 業',
      text: '招商局未興，洋輪已奪沙船生意。沙船幫聚眾鼓噪，商捐銀根告緊，地方度支雪上加霜。',
      dse: '洋輪競爭衝擊傳統沙船業，既是社會問題也加重地方財政——洋務「求富」要回應的難題。',
      options: [
        { label: '籌議華資輪運 · 以新製舊', note: '你不堵而疏，籌議華商集股自辦輪船、引沙船幫入股——亂象漸平，更為日後輪船招商局埋下伏筆。', gain: { funds: 2 } },
        { label: '撥銀賑濟失業船戶', note: '你撥款賑濟船戶，眼前民怨暫息——可地方度支，又多了一道填不滿的窟窿。', gain: { populace: 2, funds: -2 } }
      ] },
    { id: 'sus_nj_minbian', year: 1864, city: 'nanjing', res: 'populace',
      kicker: '江 寧 戰 後', title: '兵 燹 餘 患',
      text: '天京克復，城破之後流民盜匪四起，散兵未遣、民心惶惶，稍一不慎即生大亂。',
      dse: '太平天國平定後江南殘破、善後維艱，是地方督撫推行洋務的現實背景。',
      options: [
        { label: '安輯流亡 · 漸次遣勇', note: '你緩遣散勇、安插流亡，雖費時日，江寧人心漸定，未再生變。', gain: { populace: 2 } },
        { label: '開倉賑濟 · 重兵彈壓', note: '你一面開倉賑流民、一面派勇彈壓，亂象速平——只是這一壓一賑，耗餉甚鉅。', gain: { populace: 3, funds: -2 } }
      ] },
    { id: 'sus_fz_qingyi', year: 1867, city: 'fuzhou', res: 'opinion',
      kicker: '閩 中 物 議', title: '船 政 糜 費',
      text: '船政開辦耗銀如水，京中清流頻頻上奏，譏其「以巨帑養洋匠、徒費而無功」。',
      dse: '船政局耗費浩大、成效未顯，引清議抨擊，反映洋務常受守舊輿論掣肘。',
      options: [
        { label: '具陳成效 · 公開辯白', note: '你列舉造船育才之實效、公開陳奏，以理服人，謗議稍息。', gain: { opinion: 2 } },
        { label: '登門疏通 · 私下斡旋', note: '你登門周旋、私下打點言路，物議轉緩快了許多——人情雖通，卻不免落個結黨營私之譏。', gain: { opinion: 3, favor: -1 } }
      ] },
    { id: 'sus_gz_liquan', year: 1869, city: 'guangzhou', res: 'funds',
      kicker: '粵 海 利 權', title: '釐 卡 之 爭',
      text: '洋商藉條約屢爭免釐，地方稅源日蹙。一味退讓則餉源更窘，強征又恐起交涉。',
      dse: '通商口岸的釐金與利權之爭，反映洋務財政對關稅、釐金等雜款的高度依賴。',
      options: [
        { label: '據約力爭 · 力守稅權', note: '你引條約逐條與領事周旋，寸土必爭，餉源勉得保住一線。', gain: { funds: 2 } },
        { label: '暫讓免釐 · 息事寧人', note: '你讓步免釐、平息交涉，洋商稱便、地方無事——可這一退，餉源更見其窘。', gain: { populace: 1, funds: -2 } }
      ] },
    { id: 'sus_tj_jiaoan', year: 1871, city: 'tianjin', res: 'populace',
      kicker: '津 門 餘 波', title: '教 案 善 後',
      text: '天津教案血案之後，民教積怨未消，洋人索賠催逼，稍有差池便再起風波。',
      dse: '天津教案（1870）後續交涉艱難，凸顯民間排外與列強壓力下洋務外交的兩難。',
      options: [
        { label: '持平善後 · 撫民息訟', note: '你兩面斡旋、撫卹息訟，不偏不倚，總算未再激出新的風波。', gain: { populace: 2 } },
        { label: '從速賠款 · 先安洋人', note: '你力主從速賠款結案，洋人暫息怒火——民間卻譏官府媚外畏夷，積怨反更深一層。', gain: { favor: 1, populace: -2 } }
      ] },
    { id: 'sus_sh_liuxue', year: 1876, city: 'shanghai', res: 'opinion',
      kicker: '士 林 之 疑', title: '留 童 風 議',
      text: '留美幼童剪辮著洋裝、習教入俗的消息傳回，守舊士林大譁，奏請撤回之聲漸起。',
      dse: '留美幼童「西化」引守舊派攻訐，終致 1881 撤回——洋務育才受思想阻力之證。',
      options: [
        { label: '上疏陳情 · 力保留學', note: '你力陳育才之效、懇請勿撤——撤議暫緩，可這股守舊逆流，終究難以久抗。', gain: { opinion: 2 } },
        { label: '折衷改章 · 加派漢文教習', note: '你建言折衷、加派漢文教習以塞眾口，物議大為緩和——只是這「中學為體」的緊箍，又收緊了一分。', gain: { opinion: 3, favor: -1 } }
      ] },
    { id: 'sus_bj_haifang', year: 1879, city: 'beijing', res: 'favor',
      kicker: '中 樞 角 力', title: '海 塞 之 爭',
      text: '海防、塞防孰重的爭論未息，餉分兩處、議論紛紜。你夾在其間，聖眷亦因進言而浮動。',
      dse: '海防與塞防之爭使有限餉源分流，反映洋務缺乏統籌、受朝局牽制的困境。',
      options: [
        { label: '調和兩議 · 折衝樽俎', note: '你不偏一方、折衝於海塞兩派之間，暫息其爭，聖心稍安。', gain: { favor: 2 } },
        { label: '力主海防為先', note: '你直陳海防為當務之急、據理力爭——切中時弊，博得務實之名，卻開罪了塞防一系，自此朝中結怨。', gain: { opinion: 2, favor: -1 } }
      ] },
    { id: 'sus_fz_zhanbei', year: 1883, city: 'fuzhou', res: 'favor',
      kicker: '閩 海 風 雲', title: '戰 雲 將 至',
      text: '法人謀越南、覬覦閩台，戰雲漸濃。和戰之議搖擺不定，備戰遲緩，朝中責難已起。',
      dse: '中法戰爭前夕清廷和戰不定、備戰遲緩，伏下 1884 馬江海戰慘敗之因。',
      options: [
        { label: '力主備戰 · 整飭船防', note: '你力促整軍備防、儲煤蓄械、嚴申戒備——縱使前路未卜，總勝過束手待變。', gain: { favor: 2 } },
        { label: '附和廷議 · 主和緩兵', note: '你附和主和之議、靜候轉圜，朝中無責、一時安穩——可馬江口的船防，就在這「緩」字裡，鬆懈了下去。', gain: { favor: 1, populace: 1 }, setsFlag: 'zhuhe_1883' }
      ] },
    // ── 甲午前的十年（1884–93）：資源在戰前被掏空，正是洋務失敗的核心伏線 ──
    { id: 'sus_tj_junfei', year: 1885, city: 'tianjin', res: 'funds',
      kicker: '度 支 黑 洞', title: '軍 費 挪 移',
      text: '海軍衙門的款項，一筆筆轉入修園工程。北洋的購艦、養船之費，眼看就要見底。',
      dse: '慈禧挪用海軍經費修頤和園（傳三千萬兩、李蓮英侵吞八成），北洋長年無力更新，是甲午慘敗的關鍵成因。',
      options: [
        { label: '力爭撥款 · 保北洋之需', note: '你多方周旋、勉爭得些許餉銀——可那筆大宗，終究填了園子，不是填了海防。', gain: { funds: 2 } },
        { label: '迎合園工 · 先固聖眷', note: '你不諍反順、協理園工事宜，聖眷大悅——可海防那道窟窿，從此再無人敢提半個字。', gain: { favor: 3, funds: -2 } },
        { label: '暗中騰挪 · 拆東補西', note: '你暗裡挪借、拆東牆補西牆，勉強撐住購艦之急——帳目卻越理越亂，後患難料。', gain: { funds: 2, opinion: -1 } }
      ] },
    { id: 'sus_whw_tingjian', year: 1889, city: 'weihaiwei', res: 'favor',
      kicker: '軍 港 隱 憂', title: '六 年 不 添 艦',
      text: '北洋成軍之後，竟六年未再添購一艦一炮。將領憂心忡忡，而日本的新式快艦正一艘艘下水。',
      dse: '北洋海軍 1888 成軍後因經費停滯、未再添艦更新，日本海軍卻急速擴張，埋下黃海海戰艦速火力俱遜之敗。',
      options: [
        { label: '冒死上奏 · 力請續購', note: '你不顧逆鱗、上奏力請添購快艦——奏摺如石沉大海，聖心反生不悅。博得敢言之名，卻折了聖眷。', gain: { opinion: 2, favor: -1 } },
        { label: '隱忍不發 · 明哲保身', note: '你按下憂慮、不觸逆鱗，聖眷得保——而那六年的空白，終將在黃海，被日艦的速射砲一一填滿。', gain: { favor: 2 } },
        { label: '自募商捐 · 暗中籌械', note: '你不驚動中樞，私下聯絡商紳籌捐添械——雖是杯水車薪，卻是你能做的最後努力。', gain: { funds: 1, populace: 1 } }
      ] },
    { id: 'sus_wh_kuisun', year: 1891, city: 'wuhan', res: 'opinion',
      kicker: '官 辦 之 弊', title: '鐵 廠 虧 累',
      text: '漢陽鐵廠雖為亞洲第一座近代鋼鐵廠，卻連年虧累。京中清流又起，譏官辦實業「徒糜公帑」。',
      dse: '漢陽鐵廠規模空前卻長年虧損，暴露洋務官辦／官督商辦企業權責不清、用人不當、效率低下的根本局限。',
      options: [
        { label: '整頓帳目 · 力陳實業之基', note: '你查弊整頓、力陳鋼鐵乃自強之基，謗議稍息——可官辦的積弊，豈是一兩道整頓令能除？', gain: { opinion: 2 } },
        { label: '改官辦為官督商辦', note: '你建言引商股活其局、改「官辦」為「官督商辦」，虧累稍解、物議轉緩——卻也讓利權旁落，新的爭議隨之而起。', gain: { opinion: 2, funds: 1, favor: -1 } }
      ] }
  ];

  function activeSuspenses() {
    gameState.suspenses = gameState.suspenses || {};
    const unlocks = ROUTE_CITY_UNLOCK[currentRoute] || ROUTE_CITY_UNLOCK.free;
    return SUSPENSES.filter((s) => {
      if (gameState.suspenses[s.id]) return false;                       // 已處理／已逾期
      if (gameState.currentYear < s.year) return false;                  // 未發生
      if (gameState.currentYear > s.year + SUSPENSE_DEADLINE) return false; // 已過期（由 expiry 處理）
      if (unlocks[s.city] === undefined) return false;                   // 此路線無此城
      if (gameState.currentYear < unlocks[s.city]) return false;         // 該城尚未解鎖
      return true;
    });
  }

  function checkSuspenseExpiry() {
    gameState.suspenses = gameState.suspenses || {};
    SUSPENSES.forEach((s) => {
      if (gameState.suspenses[s.id]) return;
      if (gameState.currentYear > s.year + SUSPENSE_DEADLINE) {
        gameState.suspenses[s.id] = 'expired';
        applyResourceEffects({ [s.res]: -SUSPENSE_PENALTY }, { silent: true, noSetback: true });
        if (typeof flashHint === 'function') {
          flashHint('懸 案 誤 期 · ' + (s.title || '').replace(/\s+/g, '') + ' · ' + RES_META[s.res].name.replace(/\s+/g, '') + ' −' + SUSPENSE_PENALTY);
        }
      }
    });
  }

  function openSuspense(s) {
    const modal = document.getElementById('interludeModal');
    if (!modal) return;
    const setText = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
    setText('ilKicker', s.kicker || '懸 案 待 決');
    setText('ilTitle', s.title || '');
    setText('ilText', s.text || '');
    const dseEl = document.getElementById('ilDse');
    if (dseEl) {
      if (s.dse) { dseEl.textContent = '【史】' + stripDseTag(s.dse); dseEl.removeAttribute('hidden'); }
      else dseEl.setAttribute('hidden', '');
    }
    const opts = document.getElementById('ilOptions');
    if (opts) {
      opts.innerHTML = '';
      // 多個實質處理手法（各有取捨；數值已隱，憑敘述權衡）——不再提供「擱置」選項
      const options = s.options || (s.resolveLabel ? [{ label: s.resolveLabel, note: s.resolveNote, gain: s.resolveGain }] : []);
      options.forEach((opt) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'il-option';
        b.innerHTML = '<span class="ilo-label">' + escapeHTML(opt.label) + '</span>';
        b.addEventListener('click', () => resolveSuspense(s, opt));
        opts.appendChild(b);
      });
      // 低調的「再思量」：未決定就先退出，懸案保留（逾期仍會失血）
      const defer = document.createElement('button');
      defer.type = 'button'; defer.className = 'il-defer';
      defer.textContent = '再 思 量 · 容 後 再 決';
      defer.addEventListener('click', () => { hideManagedModal('interludeModal'); });
      opts.appendChild(defer);
    }
    modal.dataset.kind = 'suspense';
    openManagedModal('interludeModal');
  }

  function resolveSuspense(s, opt) {
    opt = opt || (s.resolveLabel ? { note: s.resolveNote, gain: s.resolveGain } : {});
    gameState.suspenses = gameState.suspenses || {};
    gameState.suspenses[s.id] = 'resolved';
    if (opt.gain) applyResourceEffects(opt.gain, { noSetback: true });
    if (opt.setsFlag) {   // 懸案的決定亦可留印記，供日後事件的條件選項使用
      gameState.flags = gameState.flags || {};
      (Array.isArray(opt.setsFlag) ? opt.setsFlag : [opt.setsFlag]).forEach((f) => { gameState.flags[f] = true; });
    }
    renderResources();
    const opts = document.getElementById('ilOptions');
    if (opts) {
      opts.innerHTML = '<p class="il-note">' + escapeHTML(stripDseTag(opt.note || '此事暫告平息。')) + '</p>' +
        '<button class="il-option il-continue" type="button" id="ilContinue">親 往 處 理 · 耗 一 季 →</button>';
      document.getElementById('ilContinue')?.addEventListener('click', () => {
        hideManagedModal('interludeModal');
        advanceSeason(1, { silent: true });   // 處理懸案＝主動行動，耗一季（不疊插曲）
        updateGuidanceHint();
      });
    }
  }

  // ════════════ 成就 + 結算（1895 / 致仕）════════════
  const ACHV_KEY = 'tansuo_achievements_v1';
  // 每個成就的專屬印字（古印風）
  const ACHV_ICON = {
    first_step: '啼', eager: '學', diligent: '勤', erudite: '識',
    qiwu: '器', zhidu: '制', sixiang: '思', balanced: '衡',
    witness: '史', cities: '州', eastasia: '渡', network: '友',
    gathering: '賢', steady: '挽', retire: '退', dismissed: '罷',
    foresight: '先', perfect: '圓'
  };
  const ACHIEVEMENTS = [
    // ── 入門 ──
    { id: 'first_step', name: '初 試 啼 聲', desc: '完成第一個探訪事件', test: (s) => s.explored >= 1 },
    { id: 'eager',      name: '善 應 追 問', desc: '一局妥善回應 10 次角色追問', test: (s) => s.correct >= 10 },
    { id: 'diligent',   name: '勤 訪 不 輟', desc: '一局完成 12 個探訪事件', test: (s) => s.explored >= 12 },
    // ── 見識 ──
    { id: 'erudite',    name: '滿 腹 經 綸', desc: '任一見識軸達上限',     test: (s) => s.m >= s.mMax || s.sy >= s.syMax || s.t >= s.tMax },
    { id: 'qiwu',       name: '器 物 之 臣', desc: '結算時器物見識居首',   test: (s) => s.m > s.sy && s.m > s.t && s.m > 0 },
    { id: 'zhidu',      name: '制 度 之 臣', desc: '結算時制度見識居首',   test: (s) => s.sy > s.m && s.sy > s.t && s.sy > 0 },
    { id: 'sixiang',    name: '思 想 之 臣', desc: '結算時思想見識居首',   test: (s) => s.t > s.m && s.t > s.sy && s.t > 0 },
    { id: 'balanced',   name: '體 用 兼 觀', desc: '三軸見識皆達 8 以上',   test: (s) => s.m >= 8 && s.sy >= 8 && s.t >= 8 },
    // ── 歷史見證 ──
    { id: 'witness',    name: '歷 史 見 證 者', desc: '見證全部已開放的歷史時刻', test: (s) => s.pinnedTotal > 0 && s.pinnedWitnessed >= s.pinnedTotal },
    { id: 'cities',     name: '踏 遍 九 州', desc: '踏訪全部已開放城市',   test: (s) => s.cityPlayable > 0 && s.cityVisited >= s.cityPlayable },
    { id: 'eastasia',   name: '東 渡 觀 瀾', desc: '親赴日本、看清強弱之分', test: (s) => s.visitedJapan || s.sawJapanNavy },
    // ── 人物 ──
    { id: 'network',    name: '廣 結 善 緣', desc: '一局結識 3 位人物',     test: (s) => s.network >= 3 },
    { id: 'gathering',  name: '群 賢 畢 至', desc: '一局結識 7 位人物',     test: (s) => s.network >= 7 },
    // ── 治事 · 懸案 ──
    { id: 'steady',     name: '力 挽 狂 瀾', desc: '化解 5 樁懸案而無一誤期', test: (s) => s.susResolved >= 5 && s.susExpired === 0 },
    // ── 結局 ──
    { id: 'retire',     name: '功 成 身 退', desc: '活到 1895 · 致仕還鄉', test: (s) => s.reached1895 && !s.dismissed },
    { id: 'dismissed',  name: '罷 官 還 鄉', desc: '聖眷盡失、黯然去職（雖敗猶記）', test: (s) => s.dismissed },
    { id: 'foresight',  name: '先 見 之 明', desc: '親見東瀛擴軍，再走完甲午全局', test: (s) => s.sawJapanNavy && s.witnessedJiawu },
    // ── 圓滿 ──
    { id: 'perfect',    name: '完 美 見 證', desc: '見證全部歷史時刻且見識總計 ≥ 30', test: (s) => s.pinnedTotal > 0 && s.pinnedWitnessed >= s.pinnedTotal && (s.m + s.sy + s.t) >= 30 }
  ];

  function loadAchievements() {
    try { return JSON.parse(localStorage.getItem(ACHV_KEY)) || []; } catch (e) { return []; }
  }
  function saveAchievementsList(ids) {
    try { localStorage.setItem(ACHV_KEY, JSON.stringify([...new Set(ids)])); } catch (e) {}
  }

  function buildRunSummary() {
    const uniquePinned = [...new Set(Object.values(PINNED_BY_YEAR).filter((id) => id !== 'e_yuanmingyuan'))];
    const pinnedWitnessed = uniquePinned.filter((id) => gameState.completedEvents.has(id)).length;
    let explored = 0;
    gameState.completedEvents.forEach((id) => { const e = EVENTS[id]; if (e && e.type !== 'pinned') explored++; });
    const cityPlayable = Object.keys(CITY_SCENES).filter((k) => (CITY_SCENES[k].hotspots || []).length > 0).length;
    const sv = gameState.suspenses || {};
    let susResolved = 0, susExpired = 0;
    Object.keys(sv).forEach((k) => { if (sv[k] === 'resolved') susResolved++; else if (sv[k] === 'expired') susExpired++; });
    const done = gameState.completedEvents || new Set();
    return {
      route: currentRoute,
      reached1895: gameState.currentYear >= 1895,
      year: gameState.currentYear,
      m: gameState.axes.material, sy: gameState.axes.system, t: gameState.axes.thought,
      mMax: gameState.axesMax.material, syMax: gameState.axesMax.system, tMax: gameState.axesMax.thought,
      correct: gameState.challengeCorrect || 0,
      explored,
      pinnedWitnessed, pinnedTotal: uniquePinned.length,
      cityVisited: (gameState.citiesVisited || []).length, cityPlayable,
      network: (gameState.network || []).length,
      res: { ...gameState.res },
      dismissed: !!gameState.dismissed,
      susResolved, susExpired,
      sawJapanNavy: done.has('e_jp_navy'),
      visitedJapan: (gameState.citiesVisited || []).indexOf('japan') !== -1,
      witnessedJiawu: done.has('e_yellow_sea_battle')
    };
  }

  function evaluateAchievements(s) {
    return ACHIEVEMENTS.filter((a) => { try { return a.test(s); } catch (e) { return false; } }).map((a) => a.id);
  }

  // 人物尾聲：本局結識的真實歷史人物，他們後來如何（史實後日談）
  const PERSON_EPILOGUE = {
    wenxiang:     '總理衙門的中流砥柱，一八七六年積勞病逝——自強尚在半途，柱石已先傾。',
    zhengguanying:'《盛世危言》一紙風行，「富強救國」「商戰」之說，啟蒙了往後一代維新志士。',
    shenbaozhen:  '主船政、護台灣，一八七九年病逝任上——他一手建起的福建水師，後來幾乎全沒於馬江。',
    shengxuanhuai:'招商局、電報局、漢冶萍、通商銀行、南洋公學……「中國實業之父」半生功業，多在你走過的這些局廠。',
    xuefucheng:   '出使英法義比、睜眼看世界，留下《出使日記》警世——一八九四年歸國病逝，正當甲午烽煙乍起。',
    huangzunxian: '《日本國志》的警世之言當年無人肯聽，直到甲午一敗方知其重——他成了戊戌維新的先行者。',
    tangtingshu:  '開平煤礦、唐胥鐵路——中國第一條自建鐵路出自其手，一八九二年病逝於任。',
    guhongming:   '通九種語文、學貫中西，卻終身拖著辮子為舊學張目——成了民國第一文化怪傑。',
    hoqi:         '他創辦的香港西醫書院，門下走出一個叫孫文的青年——他日點燃的，是革命。',
    dengshichang: '黃海一役，致遠中彈、彈將盡，他下令全速撞向敵艦——闔艦二百餘人隨艦同沉，殉國。',
    lihongzhang:  '親手簽下馬關、辛丑兩約，「裱糊匠」三字背盡天下罵名，一九〇一年於罵聲中含恨而歿。',
    zhangzhidong: '漢陽鐵廠、湖北新軍、兩湖學堂——後期洋務的殿軍，一直撐到了清末新政的門檻。',
    xushou:       '在江南製造局譯西書、辨化學、造輪船——中國近代化學與科技翻譯的開山者，一八八四年辭世。',
    ronghong:     '留美幼童雖中途撤回，種子已埋下；他晚年傾心維新與革命，奔走半生，終客死異邦。',
    xurun:        '招商局的買辦能臣，富甲一時，終因滬上地產投機而傾家——一身起落，盡是商海浮沉。',
    woren:        '理學名臣、守舊魁首——他那句「立國之道尚禮義而不尚權謀」，攔了洋務整整一代人。',
    giquel:       '這位法蘭西監督替福州船政帶出了第一批中國造船與海軍人才，功成後歸國，一八八六年歿於故里。',
    yanfu:        '他從福州船政學堂走向英倫，歸來譯《天演論》——「物競天擇，適者生存」八字，驚醒了整個中國。',
    itohirobumi:  '一八九五年春帆樓，他坐在李鴻章對面，逐條逼簽馬關和約——割台澎、賠二萬萬。你當年在橫濱看見的那個強鄰，終於兵臨城下。'
  };

  const ROUTE_LABEL = {
    lihongzhang: '北洋幕府的書記', rongheng: '留學出身的異數',
    yixin: '總理衙門的書吏', free: '一介布衣書記'
  };

  // 人物小傳（詳情卡）：身世與洋務角色（後日談見 PERSON_EPILOGUE）
  const PERSON_BIO = {
    wenxiang:     '滿洲鑲紅旗，軍機大臣兼總理衙門大臣。恭親王之外最堅定的自強派，主持洋務外交、創設同文館——是清廷中樞少數真懂時局的人。',
    zhengguanying:'廣東香山人，買辦出身而精通商務。歷任輪船招商局、上海機器織布局總辦，倡「商戰」與變法，著《盛世危言》風行一時。',
    shenbaozhen:  '福建侯官人，林則徐之婿。首任船政大臣，主持福州船政局造艦育才，又渡台辦防——近代海軍與海防的奠基者之一。',
    shengxuanhuai:'江蘇常州人，李鴻章幕僚出身的實業能手。輪船招商局、電報局、漢冶萍、通商銀行、南北洋公學……洋務實業無役不與。',
    xuefucheng:   '江蘇無錫人，曾、李兩幕的智囊。早期維新思想家，後出使英法義比四國，《籌洋芻議》《出使日記》開拓國人眼界。',
    huangzunxian: '廣東嘉應人，外交官兼詩人。駐日多年，深察明治維新，著《日本國志》警醒國人——惜其言當年無人肯聽。',
    tangtingshu:  '廣東香山人，怡和洋行買辦出身。任輪船招商局、開平礦務局總辦，主持開平煤礦與唐胥鐵路，是洋務實業的幹才。',
    guhongming:   '祖籍福建、生於南洋，遊學歐洲通九種語文。入張之洞幕任洋文案，學貫中西卻終身守舊護辮，性情孤峭。',
    hoqi:         '香港華人精英，留英習醫兼習法律。創辦香港西醫書院（孫中山即其學生），倡言新政——維新與革命之間的橋樑。',
    dengshichang: '廣東番禺人，福州船政學堂首屆畢業。北洋水師致遠艦管帶，治軍嚴明、忠勇剛烈，終以身許國。',
    lihongzhang:  '安徽合肥人，淮軍統帥、直隸總督兼北洋大臣。洋務後期的核心推手，主持北洋海防、實業與外交，毀譽一身。',
    zhangzhidong: '直隸南皮人，清流出身的封疆大吏。歷任兩廣、湖廣總督，辦漢陽鐵廠、織布局、新式學堂與新軍，標舉「中體西用」。',
    xushou:       '江蘇無錫人，自學成才的科學家。在江南製造局翻譯館與傅蘭雅合譯西方科技書籍，並造出中國第一艘自製輪船「黃鵠號」。',
    ronghong:     '廣東香山人，中國首位耶魯畢業生（容閎）。倡議並主持留美幼童計劃，畢生奔走於教育與改革之間。',
    xurun:        '廣東香山人，寶順洋行買辦出身的鉅商。協辦輪船招商局，投資地產、保險、礦務，是早期民族資本的代表。',
    woren:        '蒙古正紅旗，理學名臣、同治帝師。守舊派領袖，力斥同文館設天文算學館，視西學為「奇技淫巧」，與洋務派針鋒相對。',
    giquel:       '法國海軍軍官（Prosper Giquel）。受聘為福州船政局首任洋監督，引進法國技術與師資，助中國造出第一批近代軍艦。',
    yanfu:        '福建侯官人，福州船政學堂畢業、留學英國皇家海軍學院。歸國任教北洋水師學堂，後以翻譯《天演論》震動思想界。',
    itohirobumi:  '長州藩出身，明治維新元勳。曾留學英國，主導日本立憲、四任首相——脫胎換骨的新日本由他擘畫。他日馬關春帆樓上，正是他逼李鴻章簽約之人。'
  };

  // 開啟人物詳情卡（點擊關係圖中的人物）
  function openPerson(key) {
    const modal = document.getElementById('personModal');
    if (!modal) return;
    const person = (gameState.network || []).find((p) => p.key === key);
    if (!person) return;
    const setHtml = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
    const img = document.getElementById('pmPortrait');
    const seal = document.getElementById('pmSeal');
    if (img && seal) {
      img.onerror = () => { img.style.display = 'none'; seal.style.display = 'flex'; };
      img.onload = () => { img.style.display = 'block'; seal.style.display = 'none'; };
      seal.textContent = (person.name || '？').trim().charAt(0);
      img.style.display = 'none'; seal.style.display = 'flex';
      img.src = 'assets/portrait/' + key + '.webp';
    }
    setHtml('pmName', person.name || '');
    setHtml('pmRel', person.relation || '');
    setHtml('pmBio', PERSON_BIO[key] || '——');
    openManagedModal('personModal');
  }

  // 得着（轉場幕六）：依本局見識傾向與結識人物，動態生成「火種」一句
  function buildSeedLine() {
    const a = gameState.axes || { material: 0, system: 0, thought: 0 };
    const netKeys = new Set((gameState.network || []).map((p) => p.key));
    const reformers = ['hoqi', 'yanfu', 'huangzunxian', 'ronghong', 'zhengguanying'].filter((k) => netKeys.has(k));
    if (reformers.length) return '你 結 識 的 那 些 睜 眼 看 世 界 的 人，把 火 種 傳 給 了 後 來 者。';
    const max = Math.max(a.material, a.system, a.thought);
    if (max === 0) return '你 走 過 的 九 州 山 河，記 下 了 一 個 時 代 的 掙 扎 與 不 甘。';
    if (a.material === max) return '你 親 見 的 船 塢、鐵 路 與 學 堂，都 成 了 後 來 者 的 根 基。';
    if (a.system === max) return '你 看 透 的 那 些 制 度 之 弊，日 後 成 了 維 新 變 法 的 先 聲。';
    return '你 所 重 的 西 學 與 人 才，育 出 了 喚 醒 中 國 的 新 一 代 人。';
  }

  function buildVerdict(s) {
    // 一、見識傾向
    const total = s.m + s.sy + s.t;
    let axisPart;
    if (total === 0) axisPart = '你行遍九州，卻未及細究——三十年如過眼雲煙。';
    else if (s.m >= 8 && s.sy >= 8 && s.t >= 8) axisPart = '器物、制度、思想，你皆有所見：洋務之敗，不在造不出船炮，而在只造船炮——體用須兼觀，方為真自強。';
    else {
      const max = Math.max(s.m, s.sy, s.t);
      if (s.m === max) axisPart = '你眼中盡是煙囪、船塢與槍炮。器物誠可貴，然制度不變、人心未開，終究是「中體西用」的舊夢。';
      else if (s.sy === max) axisPart = '你識得朝局、衙門與外交之變。制度之眼可貴，然器物不強、實業不興，紙上新政亦難自強。';
      else axisPart = '你重人才、重西學、重思想之變——此乃洋務最深一層的覺悟，惜守舊勢大、根基太淺。';
    }
    // 二、四方阻力（教育收口：洋務之敗，是結構之困）
    const r = s.res || {};
    const low = RES_KEYS.filter((k) => (r[k] !== undefined ? r[k] : 100) < 30).map((k) => RES_META[k].name);
    let resPart;
    if (low.length >= 3) resPart = '而 ' + low.join('、') + ' 俱已崩壞——四面阻力交逼，縱有滿腹見識，亦無從施展。洋務之敗，非你不力，乃這個時代的結構之困。';
    else if (low.length >= 1) resPart = '惟 ' + low.join('、') + ' 早已見絀，足見洋務處處掣肘——這，正是它走向甲午的伏線。';
    else resPart = '四方阻力你尚能勉力周旋，於這舉步維艱的時局，已屬難得——然洋務的根本困局，從非一人之力可解。';
    // 三、本局軌跡（個人化收口：出身路線＋見證程度＋懸案成敗＋親歷東亞變局）
    const routeName = ROUTE_LABEL[s.route] || '一介書記';
    const ratio = s.pinnedTotal ? s.pinnedWitnessed / s.pinnedTotal : 0;
    const sv = gameState.suspenses || {};
    let resolved = 0, expired = 0;
    Object.keys(sv).forEach((k) => { if (sv[k] === 'resolved') resolved++; else if (sv[k] === 'expired') expired++; });
    let runPart = ' 身為' + routeName + '，';
    if (ratio >= 0.8) runPart += '你幾乎見證了這三十年每一處歷史的轉折';
    else if (ratio >= 0.4) runPart += '這三十年的大事，你親歷了泰半';
    else runPart += '這三十年的風雲，你只趕上了寥寥數樁';
    if (resolved && !expired) runPart += '，經手的危局亦一一化解。';
    else if (expired && expired >= resolved) runPart += '，惟有些危局，終在你手中拖成了積弊。';
    else if (resolved || expired) runPart += '，幾樁危局或解或誤，已是盡力周旋。';
    else runPart += '。';
    if (gameState.completedEvents.has('e_jp_navy')) {
      runPart += '你曾親渡東瀛，看清了日本何以強、中國何以弱——這份明白，沉重而清醒。';
    }
    let lead = '';
    if (gameState.dismissed) lead = '聖眷盡失——一道上諭，你被褫職罷官、黯然還鄉，洋務之路就此中斷。回望這未竟的數年：';
    return lead + axisPart + resPart + runPart;
  }

  function statLine(label, val) {
    return '<div class="stl-stat"><span class="sts-label">' + label + '</span><span class="sts-val">' + val + '</span></div>';
  }

  function showSettlement() {
    const s = buildRunSummary();
    window.__yangwuResearch?.logSessionEnd({
      routeId: currentRoute,
      year: s.year,
      season: gameState.currentSeason,
      completedEventsCount: s.pinnedWitnessed + s.explored,
      citiesVisitedCount: s.cityVisited,
      evidenceCount: (gameState.evidenceLedger || []).length,
      challengeCorrect: gameState.challengeCorrect || 0
    });
    markRouteDone(currentRoute);   // #2 路線漸進解鎖：完成一局即記錄
    const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    setText('stlVerdict', buildVerdict(s));
    setText('stlEndYear', (YEAR_LABELS[s.year] || ('大清 · ' + s.year)));
    setText('stlTitle', gameState.dismissed ? '罷 官 還 鄉' : (s.reached1895 ? '六 旬 致 仕' : '致 仕 還 鄉'));
    const tl = document.getElementById('stlTimeline');
    if (tl) tl.innerHTML = PINNED_EVENTS.map((ev) => {
      const id = PINNED_BY_YEAR[ev.year];
      const witnessed = !!(id && gameState.completedEvents.has(id));
      return '<span class="stl-tl-dot ' + (witnessed ? 'is-on' : 'is-off') + '" title="' + ev.year + ' ' + ev.name + '">' + (witnessed ? '●' : '○') + '</span>';
    }).join('');
    const st = document.getElementById('stlStats');
    if (st) st.innerHTML =
      statLine('見證歷史時刻', s.pinnedWitnessed + ' / ' + s.pinnedTotal) +
      statLine('踏訪城市', s.cityVisited + ' / ' + s.cityPlayable) +
      statLine('結識人物', String(s.network)) +
      statLine('追問應對', String(s.correct) + ' 次') +
      statLine('見識 · 器物', s.m + ' / ' + s.mMax) +
      statLine('見識 · 制度', s.sy + ' / ' + s.syMax) +
      statLine('見識 · 思想', s.t + ' / ' + s.tMax);
    // 四方阻力收場狀態
    const rb = document.getElementById('stlRes');
    if (rb) rb.innerHTML = RES_KEYS.map((k) => {
      const v = (s.res && s.res[k] !== undefined) ? s.res[k] : 0;
      const lowCls = v < 30 ? ' is-low' : '';
      return '<div class="stl-res-item' + lowCls + '"><span class="stlr-name">' + RES_META[k].name + '</span>' +
        '<span class="stlr-bar"><span class="stlr-fill" style="width:' + v + '%"></span></span>' +
        '<span class="stlr-num">' + v + '</span></div>';
    }).join('');
    // 人物尾聲：本局結識且有後日談的真實人物
    const epiWrap = document.getElementById('stlEpilogue');
    const epiList = document.getElementById('stlEpiList');
    if (epiWrap && epiList) {
      const met = (gameState.network || []).filter((p) => PERSON_EPILOGUE[p.key]);
      if (met.length) {
        epiList.innerHTML = met.map((p) =>
          '<div class="stl-epi-item"><span class="sei-name">' + p.name + '</span>' +
          '<span class="sei-fate">' + PERSON_EPILOGUE[p.key] + '</span></div>'
        ).join('');
        epiWrap.removeAttribute('hidden');
      } else {
        epiWrap.setAttribute('hidden', '');
      }
    }
    const unlockedNow = evaluateAchievements(s);
    const prev = loadAchievements();
    const newly = unlockedNow.filter((id) => prev.indexOf(id) === -1);
    saveAchievementsList([...prev, ...unlockedNow]);
    const list = document.getElementById('stlAchvList');
    if (list) {
      const shown = unlockedNow.map((id) => {
        const a = ACHIEVEMENTS.find((x) => x.id === id);
        const isNew = newly.indexOf(id) !== -1;
        return '<span class="stl-achv' + (isNew ? ' is-new' : '') + '">' + (a ? a.name : id) + (isNew ? '<em>新</em>' : '') + '</span>';
      }).join('');
      list.innerHTML = shown || '<span class="stl-achv-empty">本局未解鎖成就 · 再接再厲</span>';
    }
    document.getElementById('settlement')?.removeAttribute('hidden');
  }

  // ════════════ 學習回收（DSE 重點 ＋ 錯題回顧 ＋ 複習本局考點）════════════
  function showDseReview() {
    const modal = document.getElementById('dseReview');
    if (!modal) return;
    const log = gameState.quizLog || [];
    const wrong = log.filter((e) => !e.correct);

    // 一、本局 DSE 重點（取每題的考點，去重）
    const points = [];
    const seen = {};
    log.forEach((e) => {
      const pt = (e.dse || '').trim();
      if (pt && !seen[pt]) { seen[pt] = 1; points.push({ pt, correct: e.correct }); }
    });
    const pointsEl = document.getElementById('drPoints');
    if (pointsEl) {
      pointsEl.innerHTML = points.length
        ? points.map((p) => '<li class="dr-point' + (p.correct ? '' : ' is-missed') + '">' +
            '<span class="drp-mark">' + (p.correct ? '✓' : '✗') + '</span>' +
            '<span class="drp-text">' + escapeHTML(p.pt) + '</span></li>').join('')
        : '<li class="dr-empty">本局未遇求知考驗——下局多研習設施、答求知題，便會在此積累 DSE 重點。</li>';
    }

    // 一·五、洋務何以未竟（結構性失敗原因——成敗評價考點，固定收束）
    const failEl = document.getElementById('drFail');
    if (failEl) {
      const reasons = [
        ['只變器物、不變制度', '「中體西用」自縛，未觸動政治與根本制度，自強流於表層。'],
        ['缺乏中央統籌', '由地方督撫分頭推行，各自為政、互不相屬，難成整體規劃。'],
        ['經費不足與官督商辦之弊', '財政拮据、實業官僚化貪腐，求富成效受限。'],
        ['守舊阻撓、社會基礎薄弱', '守舊派掣肘、民智未開、迷信反對，新政缺乏廣泛支持。'],
        ['外患致命、甲午潰敗', '列強環伺，甲午一戰盡顯成效不足——三十年自強驗於一役。']
      ];
      failEl.innerHTML = reasons.map((r) =>
        '<li class="dr-fail-item"><span class="drf-head">' + r[0] + '</span>' +
        '<span class="drf-body">' + r[1] + '</span></li>').join('');
    }

    // 二、錯題回顧（你的選擇 ✗ ＋ 正解 ✓ ＋ 解析）
    const wrongWrap = document.getElementById('drWrongWrap');
    const wrongEl = document.getElementById('drWrong');
    if (wrongEl) {
      if (wrong.length) {
        wrongEl.innerHTML = wrong.map((e) =>
          '<div class="dr-wq">' +
          '<p class="drw-q">' + escapeHTML(e.q) + '</p>' +
          '<p class="drw-line drw-x"><span class="drw-tag">你答</span>' + escapeHTML(e.picked || '—') + '</p>' +
          '<p class="drw-line drw-ok"><span class="drw-tag">正解</span>' + escapeHTML(e.answer || '') + '</p>' +
          (e.explain ? '<p class="drw-explain">' + escapeHTML(e.explain) + '</p>' : '') +
          '</div>'
        ).join('');
        if (wrongWrap) wrongWrap.style.display = '';
      } else {
        wrongEl.innerHTML = '<p class="dr-empty">本局求知考驗全部答對——根基扎實。</p>';
        if (wrongWrap) wrongWrap.style.display = '';
      }
    }

    // 三、複習本局考點（全部題目展開）
    const allEl = document.getElementById('drAll');
    if (allEl) {
      allEl.innerHTML = log.length
        ? log.map((e) =>
            '<div class="dr-aq">' +
            '<p class="dra-q">' + escapeHTML(e.q) + '</p>' +
            '<p class="dra-ans"><span class="drw-tag">正解</span>' + escapeHTML(e.answer || '') + '</p>' +
            (e.explain ? '<p class="dra-explain">' + escapeHTML(e.explain) + '</p>' : '') +
            (e.source ? '<em class="dra-src">— ' + escapeHTML(e.source) + '</em>' : '') +
            '</div>').join('')
        : '<p class="dr-empty">本局未遇求知考驗。</p>';
      allEl.setAttribute('hidden', '');
    }
    const toggle = document.getElementById('drReviewAll');
    if (toggle) toggle.textContent = '複 習 本 局 考 點 ▾';

    modal.removeAttribute('hidden');
  }

  function showAchievementGallery() {
    const unlocked = loadAchievements();
    const prog = document.getElementById('achvProgress');
    if (prog) prog.textContent = unlocked.length + ' / ' + ACHIEVEMENTS.length + ' 已 解 鎖';
    const grid = document.getElementById('achvGrid');
    if (grid) grid.innerHTML = ACHIEVEMENTS.map((a) => {
      const got = unlocked.indexOf(a.id) !== -1;
      return '<div class="achv-item ' + (got ? 'is-got' : 'is-locked') + '">' +
        '<span class="achv-seal' + (got ? ' achv-seal--got' : '') + '">' + (got ? (ACHV_ICON[a.id] || '✦') : '·') + '</span>' +
        '<span class="achv-name">' + (got ? a.name : '？ ？ ？') + '</span>' +
        '<span class="achv-desc">' + a.desc + '</span></div>';
    }).join('');
    openManagedModal('achievementGallery', { keep: ['settlement'] });
  }

  // ════════════ #2 人物冊（跨局永久畫廊）════════════
  const PERSON_SEEN_KEY = 'tansuo_persons_v1';
  function loadPersonsSeen() {
    try { return JSON.parse(localStorage.getItem(PERSON_SEEN_KEY)) || {}; } catch (e) { return {}; }
  }
  function savePersonSeen(key, name, relation) {
    try {
      const seen = loadPersonsSeen();
      if (!seen[key]) { seen[key] = { name: name || '', relation: relation || '' }; localStorage.setItem(PERSON_SEEN_KEY, JSON.stringify(seen)); }
    } catch (e) {}
  }
  function showPersonGallery() {
    const seen = loadPersonsSeen();
    const keys = Object.keys(PERSON_BIO);
    const gotCount = keys.filter((k) => seen[k]).length;
    const prog = document.getElementById('pgProgress');
    if (prog) prog.textContent = gotCount + ' / ' + keys.length + ' 已 結 識';
    const grid = document.getElementById('pgGrid');
    if (grid) grid.innerHTML = keys.map((k) => {
      const s = seen[k];
      if (!s) {
        return '<div class="pg-item is-locked"><span class="pg-portrait pg-portrait--locked">？</span>' +
          '<span class="pg-name">？ ？ ？</span></div>';
      }
      const initial = (s.name || '？').trim().charAt(0);
      return '<div class="pg-item is-got">' +
        '<span class="pg-portrait"><img src="assets/portrait/' + k + '.webp" alt="" draggable="false" ' +
        'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
        '<span class="pg-seal" style="display:none">' + initial + '</span></span>' +
        '<span class="pg-name">' + escapeHTML(s.name || '') + '</span>' +
        (s.relation ? '<span class="pg-rel">' + escapeHTML(s.relation) + '</span>' : '') +
        '<span class="pg-bio">' + escapeHTML(PERSON_BIO[k] || '') + '</span></div>';
    }).join('');
    openManagedModal('personGallery', { keep: ['settlement'] });
  }

  // 結局轉場：四幕甲午幻滅 → 淡入結算（點擊推進/略過）
  function playEndingCinema(done) {
    const cinema = document.getElementById('endingCinema');
    if (!cinema) { done(); return; }
    // 幕六「得着」依本局動態生成
    const seedCap = document.getElementById('ecSeedCap');
    if (seedCap) seedCap.innerHTML = '然 這 條 路，沒 有 白 走 ——<br>' + buildSeedLine();
    const beats = [...cinema.querySelectorAll('.ec-beat')];
    const durations = [2800, 3400, 3400, 3800, 4600, 4000, 5400];
    let idx = -1, timer = null, finished = false;
    const onClick = () => { clearTimeout(timer); if (idx >= beats.length - 1) finish(); else step(); };
    function step() {
      idx++;
      if (idx >= beats.length) { finish(); return; }
      beats.forEach((b, i) => b.classList.toggle('is-on', i === idx));
      timer = setTimeout(step, durations[idx] || 3200);
    }
    function finish() {
      if (finished) return; finished = true;
      clearTimeout(timer);
      cinema.removeEventListener('click', onClick);
      cinema.classList.remove('is-on');
      setTimeout(() => { cinema.setAttribute('hidden', ''); done(); }, 600);
    }
    cinema.removeAttribute('hidden');
    cinema.addEventListener('click', onClick);
    requestAnimationFrame(() => { cinema.classList.add('is-on'); step(); });
  }

  let settled = false;
  function triggerSettlement() {
    if (settled) return;
    settled = true;
    closeManagedModals();
    closeSealPanels();
    document.getElementById('cityScene')?.setAttribute('hidden', '');
    setTimeout(() => playEndingCinema(showSettlement), 300);
  }

  document.getElementById('btnRetire')?.addEventListener('click', () => {
    if (confirm('致仕還鄉，結算這三十年？')) triggerSettlement();
  });
  // 測試鉤：在 console 輸入 __playEnding() 即可預覽七幕轉場＋結算（不必玩滿三十年）
  window.__playEnding = () => { settled = false; playEndingCinema(showSettlement); };

  // ════════════ Debug 面板（平衡驗證／壓測；?dbg=1 或按 ` 開啟）════════════
  const __dbg = {
    state() {
      const s = gameState;
      const done = [...(s.completedEvents || [])];
      return {
        year: s.currentYear, season: s.currentSeason, route: currentRoute, city: s.currentCity,
        res: { ...s.res },
        axes: { ...s.axes }, axesMax: { ...s.axesMax },
        network: (s.network || []).map((p) => p.key),
        flags: { ...(s.flags || {}) },
        suspenses: { ...(s.suspenses || {}) },
        pinnedDone: done.filter((id) => EVENTS[id] && EVENTS[id].type === 'pinned'),
        explored: done.filter((id) => EVENTS[id] && EVENTS[id].type !== 'pinned').length,
        locked: s.locked, target: s.mainlineTargetCity, dismissed: s.dismissed
      };
    },
    start(route) { route = route || 'lihongzhang'; resetGameState(route); const s3 = document.getElementById('screen3'); if (s3) s3.dataset.phase = '6'; if (window.__initMapUI) window.__initMapUI(route); this.refresh(); return this.state(); },
    allRes(v) { ['favor', 'opinion', 'populace', 'funds'].forEach((k) => { gameState.res[k] = v; }); renderResources(); this.refresh(); return this.state().res; },
    setRes(o) { Object.assign(gameState.res, o); renderResources(); this.refresh(); return this.state().res; },
    setAxis(o) { Object.assign(gameState.axes, o); refreshAxes(); this.refresh(); return this.state().axes; },
    advance(n) { advanceSeason(n || 1, { silent: true }); this.refresh(); return this.state(); },
    toYear(y) { let g = 0; while (gameState.currentYear < y && g++ < 200) advanceSeason(1, { silent: true }); this.refresh(); return this.state(); },
    fire(id) { openEvent(id); return 'opened ' + id; },
    endgame() { openEvent('e_korea_situation'); return '觸發終局鏈（漢城風雲→東學黨→黃海→馬關→結算）'; },
    settle() { triggerSettlement(); return 'settle'; },
    save() { saveGame(); return 'saved: ' + JSON.stringify(this.state().res); },
    load() { const s = loadGame(); if (s) { applySave(s); this.refresh(); } return s ? ('loaded: ' + JSON.stringify(this.state())) : 'no save'; },
    flag(f, v) { gameState.flags = gameState.flags || {}; gameState.flags[f] = (v !== false); this.refresh(); return this.state().flags; },
    meet(k, n) { addToNetwork(k, n || k, ''); this.refresh(); return this.state().network; },
    refresh() {
      const el = document.getElementById('dbgBody');
      if (!el) return;
      const s = this.state();
      el.innerHTML =
        '<b>' + s.year + ' · ' + ['春', '夏', '秋', '冬'][s.season || 0] + '</b> · ' + (s.route || '-') + ' · ' + (s.city || '-') +
        (s.locked ? ' · <span style="color:#f88">LOCKED→' + (s.target || '?') + '</span>' : '') + '<br>' +
        '聖眷 ' + s.res.favor + ' · 清議 ' + s.res.opinion + ' · 民情 ' + s.res.populace + ' · 餉源 ' + s.res.funds + '<br>' +
        '見識 器' + s.axes.material + '/' + s.axesMax.material + ' 制' + s.axes.system + '/' + s.axesMax.system + ' 思' + s.axes.thought + '/' + s.axesMax.thought + '<br>' +
        '鐵釘 ' + s.pinnedDone.length + ' · 探訪 ' + s.explored + ' · 人物 ' + s.network.length + '<br>' +
        '懸案 ' + JSON.stringify(s.suspenses) + '<br>' +
        '印記 ' + JSON.stringify(s.flags);
    },
    panel() {
      if (document.getElementById('dbgPanel')) { document.getElementById('dbgPanel').remove(); return; }
      const p = document.createElement('div');
      p.id = 'dbgPanel';
      p.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99999;width:340px;background:rgba(12,10,7,0.94);color:#e8deca;font:11px/1.5 monospace;border:1px solid #5a4730;border-radius:6px;padding:10px;';
      p.innerHTML =
        '<div id="dbgBody" style="margin-bottom:8px;white-space:pre-wrap;"></div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:4px;">' +
        ['+1年|toYear:+1', '至1875|y:1875', '至1888|y:1888', '至1894|y:1894',
         '全資源100|allRes:100', '全資源25|allRes:25', '見識滿|axismax',
         '終局鏈|endgame', '結算|settle', '存檔|save', '讀檔|load', '解全路線|routes'].map((b) => {
          const [label, act] = b.split('|');
          return '<button data-act="' + act + '" style="font:11px monospace;background:#3a2d1c;color:#e8deca;border:1px solid #5a4730;border-radius:3px;padding:3px 6px;cursor:pointer;">' + label + '</button>';
        }).join('') + '</div>';
      document.body.appendChild(p);
      p.addEventListener('click', (e) => {
        const act = e.target && e.target.dataset && e.target.dataset.act;
        if (!act) return;
        if (act === 'toYear:+1') __dbg.advance(4);
        else if (act.startsWith('y:')) __dbg.toYear(+act.slice(2));
        else if (act.startsWith('allRes:')) __dbg.allRes(+act.split(':')[1]);
        else if (act === 'axismax') __dbg.setAxis({ material: gameState.axesMax.material, system: gameState.axesMax.system, thought: gameState.axesMax.thought });
        else if (act === 'endgame') __dbg.endgame();
        else if (act === 'settle') __dbg.settle();
        else if (act === 'save') alert(__dbg.save());
        else if (act === 'load') alert(__dbg.load());
        else if (act === 'routes') window.__unlockRoutes();
      });
      this.refresh();
    }
  };
  window.__dbg = __dbg;
  document.addEventListener('keydown', (e) => { if (e.key === '`' || e.key === '~') __dbg.panel(); });
  if (/[?&]dbg=1/.test(location.search)) setTimeout(() => __dbg.panel(), 800);
  // 人物詳情卡關閉
  const closePerson = () => hideManagedModal('personModal');
  document.getElementById('pmClose')?.addEventListener('click', closePerson);
  document.getElementById('pmBackdrop')?.addEventListener('click', closePerson);
  document.getElementById('introAchv')?.addEventListener('click', showAchievementGallery);
  document.getElementById('stlGallery')?.addEventListener('click', showAchievementGallery);
  document.getElementById('stlReview')?.addEventListener('click', showDseReview);
  document.getElementById('drClose')?.addEventListener('click', () => { const m = document.getElementById('dseReview'); if (m) m.setAttribute('hidden', ''); });
  document.getElementById('dseReview')?.addEventListener('click', (e) => { if (e.target.id === 'dseReview') e.currentTarget.setAttribute('hidden', ''); });
  document.getElementById('drReviewAll')?.addEventListener('click', (e) => {
    const all = document.getElementById('drAll');
    if (!all) return;
    const open = all.hasAttribute('hidden');
    if (open) { all.removeAttribute('hidden'); e.target.textContent = '收 起 考 點 ▴'; }
    else { all.setAttribute('hidden', ''); e.target.textContent = '複 習 本 局 考 點 ▾'; }
  });
  document.getElementById('achvClose')?.addEventListener('click', () => hideManagedModal('achievementGallery'));
  document.getElementById('introPersons')?.addEventListener('click', showPersonGallery);
  document.getElementById('pgClose')?.addEventListener('click', () => hideManagedModal('personGallery'));
  document.getElementById('achievementGallery')?.addEventListener('click', (e) => { if (e.target.id === 'achievementGallery') hideManagedModal('achievementGallery'); });
  document.getElementById('personGallery')?.addEventListener('click', (e) => { if (e.target.id === 'personGallery') hideManagedModal('personGallery'); });
  document.addEventListener('click', (e) => {
    const achv = e.target.closest?.('#introAchv');
    const persons = e.target.closest?.('#introPersons');
    if (achv) {
      e.preventDefault();
      e.stopPropagation();
      showAchievementGallery();
    } else if (persons) {
      e.preventDefault();
      e.stopPropagation();
      showPersonGallery();
    }
  }, true);
  document.getElementById('stlRestart')?.addEventListener('click', () => {
    document.getElementById('settlement')?.setAttribute('hidden', '');
    settled = false;
    refreshManagedModalState();
    gotoSelectionFromMap();
  });

  // 全屏年度過場：干支大字 + 飄落粒子 + 年號
  const SEASON_GLYPH = { 0: '櫻', 1: '☀', 2: '楓', 3: '❄' };
  let seasonTransTimer = null;
  function playYearTransition(year, n) {
    const el = document.getElementById('seasonTransition');
    if (!el) return;
    const setText = (id, txt) => { const t = document.getElementById(id); if (t) t.textContent = txt; };
    const season = gameState.currentSeason;
    el.dataset.season = String(season);
    const label = yearToLabel(year, gameState.currentSeason);
    // 取干支兩字作大字（label 末段，如「乙丑」）；無則用年份數字
    const ganzhi = label.includes('·') ? label.split('·').pop().trim() : String(year);
    setText('stSeason', ganzhi);
    const elapsed = n && n > 1 ? ('歷 ' + n + ' 季 · ') : '';
    setText('stYear', elapsed + label);
    // 飄落粒子
    const wrap = document.getElementById('stParticles');
    if (wrap) {
      wrap.innerHTML = '';
      const glyph = SEASON_GLYPH[season] || '·';
      const n = 14;
      for (let i = 0; i < n; i++) {
        const p = document.createElement('span');
        p.className = 'st-particle';
        p.textContent = glyph;
        p.style.left = (Math.random() * 100).toFixed(1) + '%';
        p.style.fontSize = (12 + Math.random() * 16).toFixed(0) + 'px';
        p.style.setProperty('--drift', (Math.random() * 120 - 60).toFixed(0) + 'px');
        p.style.animationDuration = (1.6 + Math.random() * 1.2).toFixed(2) + 's';
        p.style.animationDelay = (Math.random() * 0.4).toFixed(2) + 's';
        wrap.appendChild(p);
      }
    }
    el.classList.add('is-active');
    if (seasonTransTimer) clearTimeout(seasonTransTimer);
    seasonTransTimer = setTimeout(() => el.classList.remove('is-active'), 1500);
  }
  // 點擊可提早略過季節過場
  document.getElementById('seasonTransition')?.addEventListener('click', function () {
    this.classList.remove('is-active');
    if (seasonTransTimer) clearTimeout(seasonTransTimer);
  });

  // 綁定返回鈕
  document.getElementById('cityBack')?.addEventListener('click', closeCityScene);
  document.getElementById('cityMissionToggle')?.addEventListener('click', toggleMissionSheet);

  // 綁定事件 modal 的「繼續」按鈕：有考驗則進考驗，否則結算
  document.getElementById('emContinue')?.addEventListener('click', () => {
    const ev = EVENTS[currentEventId];
    if (ev && ev.challenge) showChallenge(ev);
    else closeEventModal();
  });
  document.getElementById('emResultContinue')?.addEventListener('click', () => {
    const modal = document.getElementById('eventModal');
    if (modal && modal.dataset.mode === 'facility') finishFacilityTask();
    else closeEventModal();
  });
  const etClose = document.getElementById('etClose');
  if (etClose) {
    etClose.addEventListener('click', closeEvidenceTaskModal);
  }

  // 「停留一季」已由「客棧」設施取代。年度回合制下，另設「推進」控制：
  // 主動行動（探訪／研習）在鐵釘年禁用；推進 / 跨城移動則始終可用。
  // 主動行動只在「他城有 travel 鐵釘待辦」時禁用；鐵釘年本身不鎖
  // （鐵釘為自動見證，不佔玩家當年的主動行動）
  function optionalActionsLocked() {
    return gameState.locked;
  }
  document.getElementById('cityAdvanceYear')?.addEventListener('click', () => {
    advanceSeason(1);
    flashSceneTagline('歲 月 一 季 流 轉');
  });
  document.getElementById('cityAdvanceNext')?.addEventListener('click', () => {
    advanceToNextPinned();
    flashSceneTagline('時 光 飛 逝 · 直 至 要 事 將 臨');
  });

  function flashSceneTagline(msg) {
    const tag = document.getElementById('cityTagline');
    if (!tag) return;
    const original = tag.dataset.original || tag.textContent;
    tag.dataset.original = original;
    tag.textContent = msg;
    tag.style.color = 'rgba(232, 222, 202, 0.95)';
    setTimeout(() => {
      tag.textContent = original;
      tag.style.color = '';
    }, 2200);
  }

  // ---------- 重新擇路 ----------
  function gotoSelectionFromMap() {
    // 關閉所有面板
    document.querySelectorAll('.seal-panel').forEach((p) => p.setAttribute('hidden', ''));
    document.querySelectorAll('.seal-btn').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    // 關閉城市場景
    const sc = document.getElementById('cityScene');
    if (sc) {
      sc.setAttribute('hidden', '');
      delete sc.dataset.phase;
    }
    // 清存檔 + 重置狀態
    clearSave();
    currentRoute = null;
    gameState.completedEvents = new Set();
    gameState.axes = { material: 0, system: 0, thought: 0 };
    foundHotspots = new Set();
    collectedEvidence = new Set();
    gameState.evidenceLedger = [];
    // 從地圖切回擇路
    const s3 = document.getElementById('screen3');
    const s2 = document.getElementById('screen2');
    if (s3) {
      s3.setAttribute('aria-hidden', 'true');
      s3.dataset.phase = '0';
    }
    document.getElementById('screen1')?.setAttribute('aria-hidden', 'true');
    if (s2) s2.setAttribute('aria-hidden', 'false');
    if (stage) {
      stage.classList.remove('is-on-map');
      stage.classList.add('is-on-selection');
    }
    // 重置 Screen 2 旋轉木馬選擇狀態
    s2Chosen = null;
    s2Stage?.querySelectorAll('.s2c-cta').forEach((b) => {
      b.classList.remove('is-chosen');
      b.disabled = false;
      const label = b.querySelector('.s2c-cta-label');
      const arrow = b.querySelector('.s2c-cta-arrow');
      if (label) label.textContent = '擇 此 人 物';
      if (arrow) { arrow.textContent = '→'; arrow.style.removeProperty('display'); }
    });
  }

  document.getElementById('btnRestartRoute')?.addEventListener('click', () => {
    const yes = confirm('將清除目前的存檔並回到擇路頁。確定？');
    if (yes) gotoSelectionFromMap();
  });

  // BGM 開關
  const btnBgmToggle = document.getElementById('btnBgmToggle');
  const ambientToggle = document.getElementById('ambientToggle');
  window.__BGM = BGM;

  function syncBgmToggles() {
    const pressed = BGM.isOn() ? 'true' : 'false';
    btnBgmToggle?.setAttribute('aria-pressed', pressed);
    ambientToggle?.setAttribute('aria-pressed', pressed);
  }

  if (ambientToggle) {
    ambientToggle.hidden = false;
    ambientToggle.addEventListener('click', () => {
      BGM.setEnabled(!BGM.isOn());
      syncBgmToggles();
    });
  }

  // —— 史事欄收摺成書籤頁籤（呼吸式面板）——
  (function bindEventsCollapse() {
    const aside = document.getElementById('mapEvents');
    const btnCollapse = document.getElementById('eventsCollapse');
    const btnTab = document.getElementById('eventsTab');
    if (!aside || !btnCollapse || !btnTab) return;
    const KEY = 'yangwu_events_collapsed';
    function apply(collapsed) {
      aside.classList.toggle('is-collapsed', collapsed);
      btnCollapse.setAttribute('aria-expanded', String(!collapsed));
      btnTab.setAttribute('aria-expanded', String(!collapsed));
      try { localStorage.setItem(KEY, collapsed ? '1' : '0'); } catch (e) {}
    }
    try { if (localStorage.getItem(KEY) === '1') apply(true); } catch (e) {}
    btnCollapse.addEventListener('click', () => apply(true));
    btnTab.addEventListener('click', () => apply(false));
  })();

  if (btnBgmToggle) {
    // 開啟印面板時同步當前狀態
    document.querySelector('.seal-btn[data-panel="yin"]')?.addEventListener('click', () => {
      syncBgmToggles();
    });
    btnBgmToggle.addEventListener('click', () => {
      const next = !BGM.isOn();
      BGM.setEnabled(next);
      syncBgmToggles();
    });
  }
  syncBgmToggles();

  // 熱點 modal 關閉（點背景或 ✕） + 飄字
  const hotspotModal = document.getElementById('hotspotModal');
  function dismissHotspotModal() {
    if (!hotspotModal) return;
    const pending = hotspotModal.dataset.pendingAxis;
    const unlocked = hotspotModal.dataset.pendingUnlock;
    const evidence = hotspotModal.dataset.pendingEvidence;
    hideManagedModal('hotspotModal');
    delete hotspotModal.dataset.pendingAxis;
    delete hotspotModal.dataset.pendingUnlock;
    delete hotspotModal.dataset.pendingEvidence;
    if (pending) setTimeout(() => showAxisGain(pending), 180);
    if (evidence) setTimeout(() => showEvidenceToast(evidence), 240);
    if (unlocked) {
      const ev = EVENTS[unlocked];
      if (ev) setTimeout(() => showUnlockToast(ev.title), 320);
    }
  }

  function showEvidenceToast(title) {
    const s3 = document.getElementById('screen3');
    if (!s3) return;
    const toast = document.createElement('div');
    toast.className = 'unlock-toast unlock-toast--evidence';
    toast.innerHTML = '<em>證 據 收 錄</em><span>' + title + '</span>';
    s3.appendChild(toast);
    setTimeout(() => { try { toast.remove(); } catch (e) {} }, 3000);
  }

  function showUnlockToast(title) {
    const s3 = document.getElementById('screen3');
    if (!s3) return;
    const toast = document.createElement('div');
    toast.className = 'unlock-toast';
    toast.innerHTML = '<em>新 增 任 務</em><span>' + title + '</span>';
    s3.appendChild(toast);
    setTimeout(() => { try { toast.remove(); } catch (e) {} }, 3200);
  }
  if (hotspotModal) {
    hotspotModal.addEventListener('click', (e) => {
      if (e.target === hotspotModal || e.target.dataset.close !== undefined) {
        dismissHotspotModal();
      }
    });
  }

  // ============================================================
  // 6h. 事件資料 + 遊戲狀態
  // ============================================================

  const EVENTS = {
    // ════════════ 鐵釘事件 ════════════
    // 1860 圓明園 · 傳信制（李在上海，京中傳信）
    e_yuanmingyuan: {
      type: 'pinned',
      year: 1860,
      city: 'beijing',
      deliveryMode: 'news',
      chapter: '1-1',
      title: '圓 明 園',
      en: 'Burning of the Summer Palace',
      setup: '咸豐十年九月。英法聯軍攻入北京、焚毀圓明園，三日大火不熄。烈火傳信，天下震動——消息傳到你案頭時，你握信的紙角，抖了三下。',
      choices: [
        { id: 'a', label: '細想這場敗仗的根由',  axis: 'material',
          payoff: '敗的不是一座園子，是「船堅炮利」四個字。英人的快槍與堅船，已非靠人多勢眾能擋——你開始明白：非自強不可。三千年未有之變局，就在眼前。' },
        { id: 'b', label: '打聽戰況詳情',          axis: 'system',
          payoff: '據京中逃難來的太監講，英人不只焚園，連石碑、佛像都鑿斷帶走。「他們不只要勝，要羞辱我們。」——你開始明白什麼是「外交」。' },
        { id: 'c', label: '靜坐良久，思索此事',      axis: 'thought',
          payoff: '燒一座園子能算敗仗？敗的不是園子，是「天朝」二字。從今往後，「天下」這個詞，已經換了主人。你提筆寫下：「三千年未有」。' }
      ]
    },
    // 1861 總理衙門 · 傳信制
    e_zongli_yamen: {
      type: 'pinned',
      year: 1861,
      city: 'beijing',
      deliveryMode: 'travel',
      chapter: '1-2',
      title: '總 理 衙 門',
      en: 'The Zongli Yamen',
      setup: '咸豐十一年正月。你抵京時，東堂子胡同內新設「總理各國事務衙門」，奕訢主政。歷朝專責「外夷」的衙門，這是第一個。門外洋使與清吏同路而行，天朝舊例已被迫改寫。',
      choices: [
        { id: 'a', label: '研究新衙門的章程',  axis: 'system',
          payoff: '章程仿軍機處而設，下分英、法、俄、美、海防五股。你發現——這不只是個衙門，是大清第一個承認「對等外交」的機構。從此「天朝」二字，再無體面可言。' },
        { id: 'b', label: '觀察李鴻章如何回信', axis: 'material',
          payoff: '李鴻章草擬一信，建議衙門統籌兵工製造、輪船購置。「外交不過是門面，根本在實力。」——他已經想好怎麼把這個新衙門變成自強的引擎。' },
        { id: 'c', label: '走訪江南文人聽聞', axis: 'thought',
          payoff: '老儒生輕蔑：「設個衙門就能對洋？三十年前禁口洋話的詔書，誰廢的？」你忽然明白——制度可以一夜建成，人心要三代才能轉。' }
      ]
    },
    // 1862 同文館 · 傳信制
    e_tongwen_guan: {
      type: 'pinned',
      year: 1862,
      city: 'beijing',
      deliveryMode: 'travel',
      chapter: '1-3',
      title: '同 文 館',
      en: 'The Tongwen Guan',
      letter: 'lt_bj_to_sh',
      setup: '同治元年六月。你再入北京，同文館已在總理衙門旁開學，招八旗子弟學英、法、俄三國語言。倭仁上奏激烈反對：「立國之道，當尚禮義不尚權謀，根本之圖，在人心不在技藝。」',
      choices: [
        { id: 'a', label: '研讀倭仁的奏摺',  axis: 'thought',
          payoff: '老臣的字句一字一頓：「未聞有恃術數而能起衰振弱者也。」——你抄下整段，心想：他不是錯，只是早了三十年。三十年後若大清還在，會是誰錯？' },
        { id: 'b', label: '查同文館首批學生名單', axis: 'system',
          payoff: '十人，皆八旗下級官學生。年齡 13 至 17。多數父母不識洋字，視此為「失節」。你記下名單——日後若有人成材，便是這場爭論的最直接證明。' },
        { id: 'c', label: '想李鴻章對此的態度', axis: 'material',
          payoff: '他來信曰：「學洋話不過末技，學洋學乃要務。」隨即提議在上海設「廣方言館」，比京師同文館更務實。——你明白了什麼是「上有政策，下有對策」。' }
      ]
    },
    // 1865 江南製造總局 · 須親臨上海
    e_jiangnan_pinned: {
      type: 'pinned',
      year: 1865,
      city: 'shanghai',
      deliveryMode: 'travel',
      chapter: '4',
      title: '江 南 製 造',
      en: 'The Jiangnan Arsenal',
      meet: { key: 'xushou', name: '徐 壽', relation: '科學家 · 江南製造翻譯館' },
      effects: { funds: -6, favor: 3 },
      letter: 'lt_sh_to_fz',
      setup: '同治四年。李鴻章、曾國藩奏設江南機器製造總局於上海，購美商旗記鐵廠為基。黃浦江畔，煙囪升起，槍炮與機器第一次成為「自強」二字的實物。',
      choices: [
        { id: 'a', label: '入機器車間觀察', axis: 'material',
          payoff: '蒸汽錘、車床、鏜炮機一字排開，洋匠指點，華工默記。你看見中國第一次試圖把「買船買炮」變成「自造船炮」——可每一件機器，仍帶著外國製造的銘牌。' },
        { id: 'b', label: '查製造局經費', axis: 'system',
          payoff: '帳簿上，海關洋稅、軍餉、厘金輾轉入局，又迅速化為洋員薪金與機器開銷。你忽然明白：自強不是一句口號，是一座每日吞銀的工廠。' },
        { id: 'c', label: '訪翻譯館與工匠', axis: 'thought',
          payoff: '徐壽與傅蘭雅正校譯西書，圖紙旁堆著鉛字與算稿。器物之後，仍要有人能讀懂、能傳授、能再造。你記下：機器只是開端，人才才是根本。' }
      ],
      challenge: {
        type: 'fact',
        axis: 'material',
        q: '江南機器製造總局的設立，證明了甚麼、又未能改變甚麼？',
        options: [
          { label: '證明中國已能引進西方機器、自造槍炮輪船；卻未能改變官辦低效與政治制度不變的根本格局', correct: true },
          { label: '證明中國軍備已超越列強，並徹底改革了官制', correct: false },
          { label: '證明洋務已放棄西學、轉而回歸傳統', correct: false }
        ],
        explain: '江南製造總局是前期「自強」官辦軍工的代表，證明清廷已能學西方器物製器；但官辦體制低效、政教制度未動，國家積弱依舊——器物之變，難補制度之缺。（DSE：自強·成就與局限）'
      }
    },
    // 1872 留美學童 · 須親臨上海
    e_students_depart: {
      type: 'pinned',
      year: 1872,
      city: 'shanghai',
      deliveryMode: 'travel',
      chapter: '7',
      title: '留 美 學 童',
      en: 'Chinese Educational Mission',
      meet: { key: 'ronghong', name: '容 閎', relation: '留美先驅 · 幼童出洋倡議者' },
      effects: { funds: -4, favor: 2, opinion: -3 },
      setup: '同治十一年。上海碼頭，第一批幼童整裝赴美。容閎逐一點名，孩子們抱著書箱，眼裡有懼也有光。造船造炮之外，洋務終於把希望押在「人」身上。',
      choices: [
        { id: 'a', label: '送學童登船', axis: 'thought',
          payoff: '船梯晃動，一名少年回頭望向岸邊。你忽然覺得，這一刻比工廠煙囪更難得：清廷願意讓孩子離開舊書院，去陌生世界學習新知。' },
        { id: 'b', label: '與容閎商議章程', axis: 'system', setsFlag: 'champion_study',
          payoff: '容閎說，留學不只學語言，更要學工程、制度與世界眼光。可章程裡仍要安排中文監督、禮教約束——新學被放出去，又被舊制牽著線。（你力主放手育才，已記入案）' },
        { id: 'c', label: '估算留學經費', axis: 'material',
          payoff: '船費、學費、監督薪銀，一項項列下來，數目並不輕。你明白：人才培養比買機器慢得多，也貴得多；但若不培養，機器永遠只是買來的。' }
      ],
      challenge: {
        type: 'fact',
        axis: 'thought',
        q: '派幼童赴美留學，反映洋務派試圖突破單靠「買器物」的哪一根本局限？',
        options: [
          { label: '突破「有器物而無人才」的局限——培養能自主掌握西學與技術的本國人才', correct: true },
          { label: '突破軍費不足的局限——指望留學生帶回大筆資金', correct: false },
          { label: '突破科舉的局限——留學歸來即可直接入閣拜相', correct: false }
        ],
        explain: '留美幼童屬洋務文教改革，旨在培養懂西學、工程的本國人才，彌補「買船買炮卻無人能造、能用」的根本缺陷——人才方為自強之本。（DSE：文教改革·育才以補器物之不足）'
      }
    },
    // 1881 留美撤回 · 須親臨上海
    e_students_return: {
      type: 'pinned',
      year: 1881,
      city: 'shanghai',
      deliveryMode: 'travel',
      chapter: '11',
      title: '留 美 撤 回',
      en: 'Recall of the Chinese Educational Mission',
      effects: { favor: -2, opinion: 3, populace: -2 },
      setup: '光緒七年。留美幼童奉命撤回，陸續抵達上海。有人剪短辮子，有人穿西服，有人已能談鐵路、法律與算學。朝廷卻疑他們「沾染洋俗」，寧可中斷這條路。',
      choices: [
        { id: 'a', label: '詢問歸國學童所學', axis: 'thought',
          payoff: '少年們談機械、電報、鐵路與學校制度，言語間已不是舊書院的世界。你聽得越久，越覺得撤回不是保守禮法，而是把未來叫回碼頭。' },
        { id: 'b', label: '查朝廷撤回理由', axis: 'system',
          payoff: '奏報中寫著剪辮、入教、習洋俗種種罪名。你看見的不是一群失控學生，而是一個政權對「人心會變」的恐懼。洋務可以買機器，卻害怕人真正改變。' },
        { id: 'c', label: '記錄制度得失', axis: 'material',
          payoff: '有些學童日後仍入礦務、鐵路、外交、海軍任事，可整個計劃已被腰斬。你記下：短期看，撤回平息清議；長期看，人才斷層自此埋下。' },
        { id: 'd', label: '重申當年力保留學之志', axis: 'thought',
          requires: { flag: 'champion_study' },
          payoff: '九年前你曾與容閎細商章程、力主放手讓孩子去看世界。如今他們被召回碼頭，你據理力爭、懇請暫緩——逆流難擋，可你問心無愧。種子已埋，只待來日。' }
      ],
      challenge: {
        type: 'scenario',
        axis: 'system',
        q: '留美幼童計劃被撤回，最能反映洋務運動哪一項局限？',
        options: [
          { label: '守舊派與禮教疑慮仍強，文教改革難以持續深入', correct: true },
          { label: '清廷已完全不需要西學人才', correct: false },
          { label: '留學生全部沒有學到任何技術', correct: false }
        ],
        explain: '留美幼童被撤回，反映清廷雖推動西學與留學，仍受守舊思想與禮教疑慮制約，改革容易半途而廢。這是洋務「中體西用」框架下難以真正改變人與制度的局限。（DSE：局限·守舊反對／文教改革不足）'
      }
    },

    // ════════════ 自由事件 · 上海 ════════════
    // 線索熱點解鎖 → 外灘買辦
    e_shisanhang: {
      type: 'free',
      title: '外 灘 買 辦',
      city: 'shanghai',
      meet: { key: 'xurun', name: '徐 潤', relation: '香山買辦 · 後入輪船招商局' },
      effects: { funds: 4 },   // 通商之利，稍裕餉源
      setup: '上海外灘洋行門前，茶箱、洋布與銀票堆滿石岸。你看見一名瘦削的中年人，正以英語替華商與洋商議價。舊日廣州公行已成往事，新的買辦階層在通商口岸興起。',
      choices: [
        { id: 'a', label: '與買辦攀談', axis: 'system',
          payoff: '他自稱「徐潤」，能說流利英語。「先生若有閒情，不妨學些洋話。將來必用得上。」——他看了你一眼，笑了。' },
        { id: 'b', label: '細看茶磚分類', axis: 'thought',
          payoff: '光「上等武夷」就分七級。賣給洋人的，是最次的；最好的留給本地紅利。你忽然懂了「不平等」三字的真正分量。' }
      ],
      challenge: {
        type: 'fact', axis: 'system',
        q: '替洋商居間而興起的「買辦」階層，對近代中國經濟同時帶來怎樣的正反兩面影響？',
        options: [
          { label: '一面引入外資與西方商業經驗、孕育出早期實業人才；一面依附外商、助長利權外流', correct: true },
          { label: '純粹有利無弊，使中國完全掌握了對外貿易的主權', correct: false },
          { label: '純粹有害無益，與洋務實業的興辦毫無關係', correct: false }
        ],
        explain: '買辦居間中外貿易，既帶來資金、商業經驗與一批轉向近代實業的人才（鄭觀應、唐廷樞、徐潤皆出身買辦），也使其依附外商、利權外溢——是條約體制下利弊並存的新興階層。（DSE：通商制度·買辦的雙重性）'
      }
    },
    // 線索熱點解鎖 → 寫信予奕訢
    e_write_yixin: {
      type: 'free',
      title: '寫 信 予 奕 訢',
      city: 'shanghai',
      effects: { favor: 4 },   // 上達中樞，得聖眷
      setup: '夜深。你在書房展紙磨墨。京中傳來消息，總理衙門剛剛成立。奕訢主政——這是清廷第一個專責外交的機構。',
      choices: [
        { id: 'a', label: '建議派遣留學', axis: 'thought',
          payoff: '你寫道：「西人之強，根在學術。若不育才，雖購百艦亦不能用。」——這封信，十年後將被收入容閎的籌劃方案。' },
        { id: 'b', label: '建議廣設工廠', axis: 'material',
          payoff: '你寫道：「自強之要，首在製器。請購機器、仿西法設局，俾能自造船炮。」——這封信，與李鴻章日後奏設製造局的構想，幾乎同途。' }
      ],
      challenge: {
        type: 'fact', axis: 'system',
        q: '「中體西用」作為洋務的指導思想，如何同時「推動」又「限制」了這場改革？',
        options: [
          { label: '它為引進西方器物提供正當理由、推動了技術變革；卻又把改革鎖死在器物層面，不容觸動政制與思想', correct: true },
          { label: '它主張全盤西化，使改革毫無阻力、一帆風順', correct: false },
          { label: '它完全反對學習西方，故改革其實從未真正展開', correct: false }
        ],
        explain: '「中學為體、西學為用」一面替洋務派抵擋守舊攻訐、為學習西方器物開路；一面又以「中學為體」劃下紅線，使改革止於船炮機器、不及政制與思想——這正是洋務「只改器物」的根本局限。（DSE：洋務思想·推動與局限）'
      }
    },
    // 線索熱點解鎖 → 處理朝廷雜務
    e_handle_court: {
      type: 'free',
      title: '處 理 朝 廷 雜 務',
      city: 'shanghai',
      effects: { funds: 8, favor: 2 },   // 為朝廷辦差，得餉得眷
      setup: '一摞文書送到——皆是朝廷例行公文，需逐件批覆。你抬頭看了看窗外，工人正抬著一台西洋機器入庫。',
      choices: [
        { id: 'a', label: '專心處理公文', axis: 'system',
          payoff: '你細讀每件公文，發現一份咸豐朝的舊檔案——關於閉關政策的辯論。原來幾十年前，已有人預見今日。' },
        { id: 'b', label: '抽空去看機器', axis: 'material',
          payoff: '是一台德製蒸氣鍋爐。工頭講解時，你發現它的結構比想像中簡單。「機器並不神秘，難的是讓它運轉的人。」' }
      ],
      challenge: {
        type: 'scenario', axis: 'system',
        q: '舊檔案令你思索：洋務運動之所以興起，最主要的外在刺激是甚麼？',
        options: [
          { label: '兩次鴉片戰爭中，清廷親歷西方「船堅炮利」的軍事差距', correct: true },
          { label: '商人自發要求對外開放貿易', correct: false },
          { label: '清廷主動仿效日本明治維新', correct: false }
        ],
        explain: '兩次鴉片戰爭（1840、1856）令清廷深感西方「船堅炮利」之威脅，加上太平天國內憂，開明官員遂主張「師夷長技以制夷」——這是洋務運動興起的直接外在刺激。（DSE：洋務背景 · 外患）'
      }
    },
    // 江南機器製造總局（1865 後才出現於行動列表）
    e_jiangnan: {
      type: 'free',
      title: '江 南 製 造 局',
      city: 'shanghai',
      appearFromYear: 1865,
      meet: { key: 'xushou', name: '徐 壽', relation: '科學家 · 江南製造翻譯館' },
      effects: { funds: -6, favor: 2 },   // 軍工燒餉，惟中樞初期支持
      setup: '同治四年。李鴻章與曾國藩奏設江南機器製造總局於上海，購美商旗記鐵廠為基。這是中國第一座大型近代軍工廠——煙囪初次在黃浦江畔吐出黑煙。',
      choices: [
        { id: 'a', label: '參觀機器車間', axis: 'material',
          payoff: '蒸汽錘、車床、鏜炮機……皆購自西洋，洋匠領薪指導，華工在旁默記。你明白：買得到機器，買不到的是會造機器的人。' },
        { id: 'b', label: '查閱經費帳目', axis: 'system',
          payoff: '經費由海關洋稅與軍餉撥支，年耗數十萬兩。你發現——製造局造一桿槍，竟比向洋行買還貴。「自強」與「省費」，未必同行。' },
        { id: 'c', label: '探翻譯館譯書', axis: 'thought',
          payoff: '局內附設翻譯館，徐壽、華蘅芳與傅蘭雅同譯西書，一部《汽機發軔》正在校字。你想：器物之後，終究要落到「學問」二字。' }
      ],
      challenge: {
        type: 'fact', axis: 'system',
        q: '江南製造局這類「官辦」軍事工業所暴露的局限，如何促使洋務後期轉向「求富」？',
        options: [
          { label: '官辦軍工只費不賺、全靠海關與軍餉支撐，難以為繼；遂悟「求強」須先「求富」，轉辦能生利的民用實業', correct: true },
          { label: '官辦軍工已能自給自足且大量盈利，轉辦民用純粹為了與洋商爭利', correct: false },
          { label: '因列強施壓，要求中國停辦軍工、改辦商業', correct: false }
        ],
        explain: '江南製造局等官辦軍工「只費不生財」，經費依賴海關洋稅與軍餉、造價甚至高於外購，難以持久。洋務派遂悟「求強」必先「求富」——1870 年代起興辦輪船招商局等民用企業，是洋務由「求強」到「求富」的關鍵轉折。（DSE：洋務階段·由求強到求富）'
      }
    },
    // 新增第 4 自由事件 · 茶館聞時事
    e_chashan_listen: {
      type: 'free',
      title: '茶 館 聞 時 事',
      city: 'shanghai',
      effects: { populace: 4 },   // 體察民情
      setup: '城南老茶館。三人圍坐，講京中烽火。一人說：「英人退兵了。」另一人嗤之：「退？是該搶的都搶完了。」第三人沉默，只喝茶。',
      choices: [
        { id: 'a', label: '靠近細聽',     axis: 'thought',
          payoff: '沉默那人忽然抬頭：「先生像是讀過書的——你說，國家輸了一場仗，老百姓的茶錢是該漲還是該降？」你答不出。從此你知道，民心不是道理能說清的。' },
        { id: 'b', label: '與老闆交談',   axis: 'system',
          payoff: '老闆收錢時嘆：「衙門要茶捐，洋人要厘金，咱算盤打不過去。」——你第一次明白「厘金」如何夾在新舊政之間，誰都收，誰都不認。' }
      ],
      challenge: {
        type: 'fact', axis: 'thought',
        q: '茶客抱怨的「厘金」，反映了清廷怎樣的處境？',
        options: [
          { label: '為籌措鎮壓太平天國的軍費而開徵新稅，財政拮据、內憂深重', correct: true },
          { label: '國庫充盈，主動減免百姓賦稅', correct: false },
          { label: '已仿照西法，建立了現代化稅制', correct: false }
        ],
        explain: '厘金是清廷為籌措鎮壓太平天國的軍費而開徵的國內通過稅，反映清廷財政拮据、內憂深重。這種「內憂外患交逼」正是迫使清廷推行洋務自強的時代背景。（DSE：洋務背景 · 內憂／財政）'
      }
    },

    // ════════════ 自由事件 · 北京 ════════════
    e_bj_wall: {
      type: 'free',
      title: '天 朝 舊 夢',
      city: 'beijing',
      setup: '紫禁城下，灰磚高牆望不到頂。守城老兵說：「祖宗之法，萬國來朝。」可你方才見洋人乘轎入宮——昔日「夷狄」，今已平起平坐。',
      choices: [
        { id: 'a', label: '仰觀宮牆，思天朝體制', axis: 'system',
          payoff: '你想起：設總理衙門之前，清廷無「外交部」，因為它根本不承認有對等之國。萬里長城擋得住騎兵，擋不住一個換了規則的世界。' },
        { id: 'b', label: '問老兵京中近事', axis: 'thought',
          payoff: '老兵壓低聲音：「聽說要請洋人進館教書了，倭中堂氣得很。」——舊與新的裂縫，已從宮牆一直裂到人心。' }
      ],
      challenge: {
        type: 'fact', axis: 'system',
        q: '清廷以「天朝上國」朝貢觀看待對外關係，為何難以應付近代外交、終須另設總理衙門？',
        options: [
          { label: '朝貢觀視外國為藩屬夷狄、無對等觀念與常設外交機構，面對條約體制與列強交涉束手無策', correct: true },
          { label: '朝貢觀其實運作良好，設總理衙門純為節省開支', correct: false },
          { label: '因列強主動要求中國恢復朝貢制度', correct: false }
        ],
        explain: '設總理衙門前，清廷以「天朝上國」自居，視外國為夷狄、藩屬，並無對等外交觀念。兩次鴉片戰爭戰敗後被迫簽約、設衙門，才漸接受近代國際關係。（DSE：天朝觀→外交制度近代化）'
      }
    },
    e_bj_envoy: {
      type: 'free',
      title: '公 使 駐 京',
      city: 'beijing',
      effects: { opinion: -3, favor: 2 },   // 與洋人周旋，清議側目
      setup: '一隊洋人使節捧著國書步入衙署。隨員低聲為你引介：「此乃英國公使。依新約，各國公使自此常駐北京。」',
      choices: [
        { id: 'a', label: '細察新約條款', axis: 'system',
          payoff: '《天津條約》《北京條約》准外國公使常駐京師。「夷人不得入京」的舊例就此打破——清廷被迫以對等之禮，待昔日眼中的「夷狄」。' },
        { id: 'b', label: '觀察朝臣反應', axis: 'thought',
          payoff: '幾位老臣別過頭去，不願正視。你明白：條約改得了規矩，改不了人心；近代外交，是被炮口逼出來的。' }
      ],
      challenge: {
        type: 'fact', axis: 'system',
        q: '第二次鴉片戰爭後的條約，准許外國做下列何事，直接衝擊了天朝體制、催生總理衙門？',
        options: [
          { label: '外國公使常駐北京', correct: true },
          { label: '外國可在內地自由開礦設廠', correct: false },
          { label: '外國派兵長駐紫禁城', correct: false }
        ],
        explain: '《天津條約》《北京條約》准許外國公使常駐北京，打破「夷人不得入京」的舊例，迫使清廷正視對等外交，直接促成 1861 年總理衙門的設立。（DSE：不平等條約·外交衝擊）'
      }
    },
    e_bj_woren: {
      type: 'free',
      title: '衞 道 之 爭',
      city: 'beijing',
      letter: 'lt_bj_to_sh',
      meet: { key: 'woren', name: '倭 仁', relation: '理學名臣 · 守舊派領袖' },
      effects: { opinion: -8, favor: 3 },   // 力推新學 → 觸怒清議，得中樞青睞
      setup: '倭仁的奏摺擲地有聲：「立國之道，尚禮義不尚權謀；根本之圖，在人心不在技藝。」他反對同文館聘西人教天文算學，言辭懇切，卻也步步退讓不得。',
      choices: [
        { id: 'a', label: '細讀倭仁奏摺', axis: 'thought',
          payoff: '「未聞有恃術數而能起衰振弱者也。」——你抄下這句。他不是壞人，只是真心相信：救國靠的是聖人之道，而非洋人之器。' },
        { id: 'b', label: '聽奕訢如何回應', axis: 'system',
          payoff: '奕訢反詰：那便請倭中堂另保通曉算學之中士，另設一館。倭仁無人可保，啞口無言。新政未必勝，舊學卻已先窮。' }
      ],
      challenge: {
        type: 'fact', axis: 'thought',
        q: '倭仁反對同文館聘西人教天文算學，最能說明洋務運動的哪一項局限？',
        options: [
          { label: '「中體西用」下，西學被視為末技，改革難觸及思想與制度', correct: true },
          { label: '洋務派內部嚴重貪污腐敗', correct: false },
          { label: '西方教師的學術水準不足', correct: false }
        ],
        explain: '倭仁之爭顯示：即使只引進西方科技，仍遭守舊派以「衞道」之名強烈抵制。在「中體西用」框架下，西學被貶為末技，改革無法深入思想與制度——這是洋務運動的根本局限。（DSE：守舊派反對·中體西用·局限）'
      }
    },

    // ════════════ 自由事件 · 天津 ════════════
    e_tj_haihe: {
      type: 'free',
      title: '海 河 軍 需',
      city: 'tianjin',
      taskGoal: '整理「海河碼頭」軍需證據',
      appearFromYear: 1870,
      effects: { favor: 3, funds: -4 },
      setup: '同治九年，李鴻章督直隸、領北洋。海河碼頭上，洋槍洋炮、煤鐵糧餉沿河轉運，天津成了北方軍政的咽喉。可帳房先生卻皺著眉：船要煤、炮要彈、兵要餉，銀子像潮水退得比漲得快。',
      choices: [
        { id: 'a', label: '查點軍需轉運', axis: 'system',
          payoff: '一筆筆軍火、煤鐵、糧餉在此集散。你看見洋務的骨架：要強兵，先要一整套後勤與調度，而這一切都壓在「銀」字上。' },
        { id: 'b', label: '細看北洋帳目', axis: 'thought',
          payoff: '帳簿入不敷出，處處挪借。你記下：洋務不是不想辦大，而是餉源有限——買得起一艘船，未必養得起一支艦隊。' }
      ],
      challenge: {
        type: 'scenario', axis: 'system',
        q: '北洋海防軍需龐大而經費常常不足，最能說明洋務運動哪一項根本困難？',
        options: [
          { label: '財政短絀、缺乏穩定餉源，難以長期支撐大規模建設', correct: true },
          { label: '清廷財政充裕，從不缺乏洋務經費', correct: false },
          { label: '洋務完全不需要花費金錢', correct: false }
        ],
        explain: '洋務的軍工、海防、新式企業都極耗資金，但清廷財政短絀、缺乏穩定餉源，常靠挪借與海關稅勉強支撐；經費不足是洋務難以持續壯大的根本限制之一。（DSE：局限·經費不足／餉源）'
      }
    },
    e_tj_advisor: {
      type: 'free',
      title: '客 卿 教 習',
      city: 'tianjin',
      taskGoal: '整理「客卿教習」用人證據',
      appearFromYear: 1880,
      meet: { key: 'foreign_advisor', name: '德 籍 教 習', relation: '北洋客卿 · 漢納根之流' },
      effects: { favor: 2, opinion: -3 },
      setup: '操場邊，幾名西洋軍官正指點清軍演炮、繪測炮位。北洋重金禮聘洋將洋匠，盼以「客卿」之力速成新軍。可士林議論紛紛：堂堂天朝，竟要仰仗夷人教戰？',
      choices: [
        { id: 'a', label: '請教練兵之法', axis: 'material',
          payoff: '洋教習所授操典、測繪、炮術確有實效，新軍面貌一新。你明白：器物可買，技術也可請人來教——一時之間，確能補上短板。' },
        { id: 'b', label: '細想倚賴之患', axis: 'thought',
          payoff: '你卻也看到隱憂：洋員良莠不齊、所費不貲，核心技術終握於人手。若不能自育人才，今日請來的客卿，便是明日受制於人的把柄。' }
      ],
      challenge: {
        type: 'scenario', axis: 'thought',
        q: '梁啟超評李鴻章「知有兵事而不知有民政，知有洋務而不知有國務」，最能說明洋務派的甚麼局限？',
        options: [
          { label: '識見有限——只重軍事與洋務，忽略政治、民生制度的全盤配合', correct: true },
          { label: '軍事技術不足，造不出槍炮輪船', correct: false },
          { label: '完全不懂得與外國打交道', correct: false }
        ],
        explain: '梁啟超此語點出洋務派「識見有限」：他們以為學得船堅炮利即可自強，卻不知兵事背後有民政、洋務背後有國務，忽略政治經濟社會的整體配合，故難有根本成效。（DSE：失敗原因·識見有限）'
      }
    },
    e_tj_telegraph: {
      type: 'free',
      title: '電 報 軍 務',
      city: 'tianjin',
      taskGoal: '整理「電報線杆」通訊證據',
      appearFromYear: 1880,
      effects: { funds: -2, populace: -2 },
      setup: '電報線沿海河平原延伸。商人說它能快傳行情，軍官說它能急送軍報，鄉民卻疑它傷風水、招雷火。新技術一入地方，便利與阻力便一同到來。',
      choices: [
        { id: 'a', label: '試讀軍報電文', axis: 'material',
          payoff: '一封軍報轉瞬抵達。你第一次感到，近代戰爭比的不只是炮，更是消息速度。慢一步，便可能全局皆失。' },
        { id: 'b', label: '記錄民間疑懼', axis: 'thought',
          payoff: '村民圍著線杆議論紛紛。你記下：洋務推技術，若不能解釋其用、安其心，民間反對便會化作另一種阻力。' }
      ],
      challenge: {
        type: 'scenario', axis: 'thought',
        q: '民眾反對電線、鐵路等新事物，最能反映洋務運動哪一項困難？',
        options: [
          { label: '新技術推行缺乏社會基礎，民間疑懼與風水觀念形成阻力', correct: true },
          { label: '中國民間已完全接受所有西方技術', correct: false },
          { label: '電報與軍事、商務毫無關係', correct: false }
        ],
        explain: '洋務引進技術，但教育普及不足、民間疑懼深，常以風水、民生受損等理由反對電線、鐵路、礦務，顯示改革缺乏廣泛社會基礎。（DSE：局限·民間反對）'
      }
    },

    // ════════════ 自由事件 · 南京 ════════════
    e_nj_ruins: {
      type: 'free',
      title: '城 破 之 後',
      city: 'nanjing',
      taskGoal: '整理「太平廢墟」內憂證據',
      appearFromYear: 1864,
      effects: { opinion: -2, favor: 2 },
      setup: '同治三年，天京陷落。南京城內仍有焦黑屋樑與殘破門樓，百姓扶老攜幼回到廢墟旁。戰事雖平，清廷卻再也不能假裝天下無事。',
      choices: [
        { id: 'a', label: '記錄戰後殘局', axis: 'thought',
          payoff: '你看見房舍、人口、糧餉一同破碎。內亂不只是民變，而是足以動搖清廷統治的巨震。' },
        { id: 'b', label: '追問何以自強', axis: 'material',
          payoff: '老兵指著破炮說：「若槍炮不如人，城池再厚亦無用。」你記下：自強首先是為了活下去。' }
      ],
      challenge: {
        type: 'scenario', axis: 'thought',
        q: '太平天國等內亂與洋務運動的出現有何關係？',
        options: [
          { label: '內亂動搖清廷統治，迫使清廷重視新式軍備與自強改革', correct: true },
          { label: '內亂證明傳統制度完全有效，無需改革', correct: false },
          { label: '內亂只與農民生活有關，與清廷改革無關', correct: false }
        ],
        explain: '太平天國等內亂重創清廷，令中央不得不倚重地方軍事力量，也促使官員重視新式武器與軍事工業。內憂是洋務運動的重要背景之一。（DSE：背景 · 內憂刺激洋務）'
      }
    },
    e_nj_liangjiang: {
      type: 'free',
      title: '督 撫 之 權',
      city: 'nanjing',
      taskGoal: '整理「兩江督署」地方權力證據',
      appearFromYear: 1864,
      meet: { key: 'zeng_guofan', name: '曾 國 藩', relation: '兩江總督 · 湘軍領袖' },
      effects: { favor: 3, funds: -2 },
      setup: '兩江督署中，幕僚持卷而入，軍餉、團練、製器、善後一併送到案前。曾國藩沉默良久，只說：「大亂之後，非地方自任其責，不足以救時。」',
      choices: [
        { id: 'a', label: '讀地方籌餉奏摺', axis: 'system',
          payoff: '地方能籌餉、練兵、辦廠，效率往往比層層上奏更快。你看見洋務得以起步的現實條件。' },
        { id: 'b', label: '細想各省分辦之弊', axis: 'thought',
          payoff: '但各省各辦、彼此不統，今日一局、明日一廠，難成全國一體。你記下：能辦事的權力，也會造成分散。' }
      ],
      challenge: {
        type: 'scenario', axis: 'system',
        q: '洋務主要由地方督撫分頭推行，這種方式最大的雙面性是甚麼？',
        options: [
          { label: '能因地制宜迅速辦事，但造成各自為政、中央統籌不足', correct: true },
          { label: '完全由中央統一計劃，地方沒有作用', correct: false },
          { label: '地方督撫只負責科舉，與洋務無關', correct: false }
        ],
        explain: '洋務靠曾國藩、李鴻章、左宗棠、張之洞等地方督撫推動，能成事也造成資源分散、步調不一。這是洋務的重要局限與失敗原因。（DSE：地方官倡導 · 中央統籌不足）'
      }
    },
    e_nj_arsenal: {
      type: 'free',
      title: '製 器 舊 檔',
      city: 'nanjing',
      taskGoal: '整理「製器舊檔」軍工前奏證據',
      appearFromYear: 1864,
      effects: { favor: 2, funds: -3 },
      setup: '案上攤開安慶軍械所舊檔，旁邊放著炮管零件與測量器。製器之事仍粗疏，卻已證明：若不學西式槍炮，清廷很難再守住自己的城池。',
      choices: [
        { id: 'a', label: '翻查槍炮圖紙', axis: 'material',
          payoff: '圖紙並不精美，卻是一次艱難起步。你看見江南製造局之前，已有官員在戰亂中摸索西式製器。' },
        { id: 'b', label: '追溯軍工脈絡', axis: 'system',
          payoff: '安慶軍械所、江南製造局、福州船政局，一條線漸漸清楚：自強先從軍事工業開始。' }
      ],
      challenge: {
        type: 'fact', axis: 'material',
        q: '江南製造總局附設的翻譯館，對近代中國的長遠意義，為何往往超過它所造的槍炮？',
        options: [
          { label: '槍炮終會陳舊報廢，譯印的數理化與西學書籍卻持續傳播新知、培育人才，啟發了後來的維新與科學', correct: true },
          { label: '因為翻譯館實際生產的軍火比製造局本身更多', correct: false },
          { label: '因為翻譯館負責對外交涉，取代了總理衙門', correct: false }
        ],
        explain: '製造局所造船炮終會老舊，翻譯館譯印的百餘種數理、化學、製造西書卻長期流傳，成為西學東漸與育才的重要管道——器物易逝，知識與人才方為自強之本。（DSE：自強·譯書局·西學傳播的長遠影響）'
      }
    },

    // ════════════ 自由事件 · 福州 ════════════
    e_fz_french: {
      type: 'free',
      title: '借 法 之 局',
      city: 'fuzhou',
      appearFromYear: 1866,
      meet: { key: 'giquel', name: 'Giquel · 日意格', relation: '法國海軍軍官 · 船政洋員' },
      setup: '法人日意格（Giquel）攤開造船圖樣，侃侃而談。船廠的機器、圖樣、工匠訓練與技師薪俸，皆有賴這些洋員協助——五年合同，每月薪銀數百兩。倚之則速成，賴之則受制。你該如何進言？',
      choices: [
        { id: 'a', label: '倚重洋員 · 求速成', axis: 'material',
          payoff: '你主張厚聘洋員、速建船廠。船確實造得快了，但洋薪靡費、技術盡操人手——朝中已有人譏「以重金養洋人，何異飲鴆」。',
          effects: { funds: -6, opinion: -4 } },
        { id: 'b', label: '限期 · 令華員自立', axis: 'thought',
          payoff: '你主張與洋員約定年限、令華匠華生盡快接手。進度慢了，根基卻穩——沈葆楨深然之：「洋師可一時，不可長恃。」',
          effects: { opinion: 3, populace: 2 } }
      ],
      challenge: {
        type: 'fact', axis: 'material',
        q: '船政局倚賴日意格等法國洋員，沈葆楨等人為求技術自主，採取了甚麼對策？',
        options: [
          { label: '附設船政學堂，培養華人造船與駕駛人才', correct: true },
          { label: '解聘全部洋員，立即停辦船政', correct: false },
          { label: '與法國簽約，永久委託其代造艦船', correct: false }
        ],
        explain: '船政局深知倚賴洋員非長久之計，遂附設船政學堂，培養華人造船、駕駛與留學人才（嚴復即其一），冀逐步取代洋員、達致技術自主——這是洋務「育才求自主」的努力。（DSE：船政學堂·育才自主）'
      }
    },
    e_fz_yan: {
      type: 'free',
      title: '學 堂 少 年',
      city: 'fuzhou',
      appearFromYear: 1866,
      meet: { key: 'yanfu', name: '嚴 復', relation: '船政學堂學生 · 後譯《天演論》' },
      setup: '船政學堂後學堂，少年嚴復伏案演算。他問你：「先生，船炮之外，西人何以強？」你一時語塞——這問題，比造一艘船更難回答。',
      choices: [
        { id: 'a', label: '答以「在學問制度」', axis: 'thought',
          payoff: '你說：強不在器，而在學問與制度。少年眼睛一亮。十餘年後，他自英倫歸來，譯出《天演論》，把「物競天擇」四字，種進整代中國人心裡。' },
        { id: 'b', label: '勉其「精習技藝」', axis: 'material',
          payoff: '你勉他先精技藝、報效船政。他點頭，卻又追問：「若技藝精而國仍弱，又當如何？」——這一問，要等到甲午，才有血的答案。' }
      ],
      challenge: {
        type: 'fact', axis: 'thought',
        q: '嚴復所譯《天演論》之所以震動朝野，主要因為它傳入並衝擊了甚麼？',
        options: [
          { label: '傳入「物競天擇、適者生存」的進化觀，令國人驚覺不變法圖強即亡國滅種，衝擊了天朝自大與守舊心態', correct: true },
          { label: '它詳細記載了西方各國的地理疆域與物產', correct: false },
          { label: '它主張恢復科舉、強化中學以抵禦西方', correct: false }
        ],
        explain: '嚴復（船政學堂培養、留英歸國）所譯《天演論》引入「物競天擇、適者生存」的進化論，在甲午慘敗後令國人猛醒：再不變法自強便將亡國滅種——震動維新一代，足見洋務「派遣留學」育才之深遠。（DSE：文教改革·思想啟蒙）'
      }
    },
    e_fz_haifang: {
      type: 'free',
      title: '海 防 之 憂',
      city: 'fuzhou',
      appearFromYear: 1874,
      effects: { funds: -4 },
      setup: '同治十三年，日本藉牡丹社事件出兵台灣。閩江艦隊倉促備戰，朝野始驚：原來海上的威脅，不只來自西洋，更來自東鄰那個剛維新的島國。',
      choices: [
        { id: 'a', label: '主張急購鐵甲艦', axis: 'material',
          payoff: '你力主購艦籌防。然款項何來？海關、厘金皆已捉襟見肘——海防之議雖起，餉源卻是死結。' },
        { id: 'b', label: '思海防全局之難', axis: 'system',
          payoff: '你想：南北洋分立、督撫各防各的，無統一指揮、無穩定餉源。海防不是買幾艘船的事，是整個國家能否協調的事——而這，恰是清廷最缺的。' }
      ],
      challenge: {
        type: 'fact', axis: 'system',
        q: '1874 年日本侵台事件，對清廷海防觀念的最大影響是甚麼？',
        options: [
          { label: '震動朝野，引發大規模海防大籌議、加速建立近代海軍', correct: true },
          { label: '使清廷決定放棄一切海防', correct: false },
          { label: '證明傳統水師已足以禦敵', correct: false }
        ],
        explain: '1874 日本侵台暴露海防空虛，引發清廷「海防大籌議」，加速籌建南北洋海軍——但分立的督撫、短絀的餉源，也埋下日後甲午潰敗的伏線。（DSE：海防·由強轉富之始）'
      }
    },

    // ════════════ 鐵釘 · 福州（travel：須親臨）════════════
    e_fuzhou_shipyard: {
      type: 'pinned', year: 1866, city: 'fuzhou', deliveryMode: 'travel', chapter: '5',
      title: '福 州 船 政', en: 'The Foochow Navy Yard',
      letter: 'lt_fz_to_nj',
      effects: { funds: -8, favor: 3 },
      setup: '同治五年。左宗棠奏設福州船政局，沈葆楨總理其事，聘法人日意格建廠。馬尾江畔，第一座近代船塢與學堂同時奠基——中國的海軍夢，自此起航。',
      choices: [
        { id: 'a', label: '察船廠規制', axis: 'material',
          payoff: '鐵廠、船塢、繪事院俱備，仿法國建制。你明白：這不只造一艘船，是要建一整套「能造船的體系」——洋務的雄心，盡在於此。' },
        { id: 'b', label: '訪船政學堂', axis: 'thought',
          payoff: '前學堂習造船、後學堂習駕駛，課以英法文與算學。沈葆楨言：「船政根本，在學不在器。」——他比許多人都看得遠。' },
        { id: 'c', label: '問經費所出', axis: 'system',
          payoff: '經費取自閩海關洋稅，每月五萬兩。你心下一沉：這數目看似不少，卻要養廠、養學堂、養洋員——洋務的每一步，都踩在「錢」的鋼絲上。' }
      ],
      challenge: {
        type: 'fact', axis: 'material',
        q: '福州船政局與江南製造總局同屬洋務「自強」階段，兩者共同的性質是甚麼？',
        options: [
          { label: '官辦的近代軍事工業（造船炮、強兵）', correct: true },
          { label: '官督商辦的民用企業（求富）', correct: false },
          { label: '培養外交官的文教機構', correct: false }
        ],
        explain: '福州船政局（造船·海軍）與江南製造總局（槍炮）同為洋務「自強」階段的官辦軍事工業，目標是強兵禦侮——這是洋務前期的重心。（DSE：自強·軍事工業）'
      }
    },
    e_fuzhou_taiwan: {
      type: 'pinned', year: 1874, city: 'fuzhou', deliveryMode: 'travel', chapter: '9',
      title: '日 本 侵 台', en: 'Japan Invades Taiwan',
      effects: { favor: -2, funds: -5 },
      setup: '同治十三年。日本以琉球漂民被殺為由，出兵台灣。沈葆楨奉命巡台籌防，閩江艦隊南下。維新方七年的日本，已敢向天朝亮刃——這一刀，刺醒了清廷的海防迷夢。',
      choices: [
        { id: 'a', label: '隨艦隊巡台', axis: 'system',
          payoff: '你隨沈葆楨渡海。所見炮台殘破、兵船老舊，方知「海防」二字，過去不過是紙上文章。日本一逼，虛實立見。' },
        { id: 'b', label: '錄朝野議論', axis: 'thought',
          payoff: '事後清廷大開「海防大籌議」，李鴻章主張練北洋水師。你記下：原來要逼清廷動真格，竟需一個東鄰小國的刀。' }
      ],
      challenge: {
        type: 'fact', axis: 'system',
        q: '1874 年日本侵台，因軍情傳遞遲緩而貽誤事機，使清廷認識到哪一項洋務設施的重要性？',
        options: [
          { label: '電報（電線）——其後設南北洋電報局、鋪設津滬與滬港電線', correct: true },
          { label: '科舉考試制度', correct: false },
          { label: '傳統驛站快馬', correct: false }
        ],
        explain: '日本侵台時軍情傳遞遲緩、貽誤事機，朝廷始知「電報實為防務必須之物」，其後李鴻章設南北洋電報局、鋪設津滬與滬港電線——洋務交通通訊由此起步。（DSE：後期·發展郵電）'
      }
    },
    e_fuzhou_mawei: {
      type: 'pinned', year: 1884, city: 'fuzhou', deliveryMode: 'travel', chapter: '13',
      title: '馬 江 海 戰', en: 'The Battle of Foochow',
      effects: { favor: -8, populace: -5, funds: -6 },
      setup: '光緒十年，中法戰爭。法國艦隊闖入馬尾軍港。開戰不過半小時，苦心經營近二十年的福建艦隊——那些船政局親手造出的兵船——盡沉閩江。煙起江上，十餘年心血，一旦成灰。',
      choices: [
        { id: 'a', label: '記下這場慘敗', axis: 'system',
          payoff: '艦隊何以速亡？無統一指揮、戰備鬆弛、和戰不定。你終於明白：能造出船，未必能打勝仗——器物之外，是整個制度的潰敗。' },
        { id: 'b', label: '望江上殘煙良久', axis: 'thought',
          payoff: '你想起學堂裡那些少年的眼睛。船政辦了二十年，造船、育才，可一場半小時的海戰，就把一切打回原形。洋務的局限，從未如此刺目。' },
        { id: 'c', label: '悔當年附和主和之議', axis: 'system',
          requires: { flag: 'zhuhe_1883' },
          payoff: '去年戰雲將至，你曾附和廷議、主張緩兵。如今馬江一炬，船防鬆懈的惡果就在眼前——你終於懂得：和戰猶豫，比戰敗更先輸了一著。這份悔，你記下了。' }
      ],
      challenge: {
        type: 'fact', axis: 'system',
        q: '1884 年馬江（馬尾）海戰，福建艦隊半小時即覆滅，最深刻地揭示了洋務運動的甚麼問題？',
        options: [
          { label: '只重器物（造船），卻缺乏統一指揮、戰備與制度——器物改革難以單獨成功', correct: true },
          { label: '中國工人造的船質量太差', correct: false },
          { label: '法國海軍人數遠多於中國', correct: false }
        ],
        explain: '馬尾一役，船政局苦心經營的艦隊速敗，暴露洋務「只改器物、不改制度」之弊：無統一指揮、戰備鬆弛、和戰不定——這正是十年後甲午慘敗的預演。（DSE：局限·失敗原因）'
      }
    },

    // ════════════ 乙·加密主線 A 階段（填補空檔史事）════════════
    e_tianjin_jiaoan: {
      type: 'pinned', year: 1870, city: 'tianjin', deliveryMode: 'travel', chapter: '6',
      title: '天 津 教 案', en: 'The Tientsin Massacre',
      meet: { key: 'zeng_guofan', name: '曾 國 藩', relation: '直隸總督 · 教案善後' },
      effects: { opinion: -6, populace: -5, funds: -4 },
      setup: '同治九年六月。天津民間盛傳教堂育嬰堂迷拐幼孩、挖眼剖心，群情洶湧，焚毀望海樓教堂，殺死洋人與教民。法國軍艦旋即壓境問罪。曾國藩奉命查辦，殺民、賠款、遣使道歉以求息事，卻被清議罵作「賣國」。',
      choices: [
        { id: 'a', label: '查民教衝突之由', axis: 'thought',
          payoff: '謠言、文化隔閡、積年排外之心交織而成。你記下：洋務在上層引器物、設衙門，民間卻仍以舊眼看洋教洋人——改革沒有社會基礎，便處處是火種。' },
        { id: 'b', label: '看列強砲艦施壓', axis: 'system',
          payoff: '一案未平，七國公使聯銜抗議，法艦列於海口。賠款、正法、道歉，條條皆須照辦。你看見弱國外交之難：談判桌上的籌碼，從來是艦砲。' },
        { id: 'c', label: '觀清議交攻曾國藩', axis: 'thought',
          payoff: '主和即賣國，主戰則啟釁——曾國藩兩面受夾，聲名一夕墮地。你忽然明白：在「清議」之下，務實辦洋務的人，往往先被自己人罵倒。' }
      ],
      challenge: {
        type: 'scenario', axis: 'thought',
        q: '天津教案（1870）最能反映洋務運動推行時面對的甚麼困難？',
        options: [
          { label: '民間排外與中外文化衝突，加上列強壓力，使改革缺乏穩定的社會與外交環境', correct: true },
          { label: '證明清廷已能在外交上與列強平等對抗', correct: false },
          { label: '說明洋務運動已得到全國民眾支持', correct: false }
        ],
        explain: '天津教案暴露洋務的深層困境：上層引進西法，民間卻因謠言、文化隔閡而仇教排外；列強又藉案施壓索賠。改革缺乏社會基礎與外交實力，是洋務難以順利推行的重要局限。（DSE：局限·民間反對／外患）'
      }
    },
    e_zhaoshangju: {
      type: 'pinned', year: 1873, city: 'shanghai', deliveryMode: 'travel', chapter: '8',
      title: '輪 船 招 商 局', en: 'China Merchants S.N. Co.',
      letter: 'lt_to_kp',
      meet: { key: 'tang_tingshu', name: '唐 廷 樞', relation: '輪船招商局 · 總辦 / 買辦出身' },
      effects: { funds: 10, favor: 2 },   // 求富興利·餉源槓桿（平衡 v72：6→10）
      setup: '同治十二年。李鴻章奏設輪船招商局於上海，「官督商辦」，招華商入股，承運漕糧，與旗昌、太古等洋行爭航運之利。洋務至此，由「自強」造船砲，邁向「求富」興企業。',
      choices: [
        { id: 'a', label: '查官督商辦之制', axis: 'system',
          payoff: '官府給照、督理、保護，商人出資、經營、營利。你記下這嶄新的形式：既非純官辦，也非純商辦——它想借商人之力辦洋務，卻也把官場的手伸進了商場。' },
        { id: 'b', label: '看與洋行爭利', axis: 'material',
          payoff: '招商局開航，運費下降，旗昌洋行終被收購。你第一次看見洋務「求富」的鋒芒：不止強兵，更要在商戰中奪回被洋人壟斷的利權。' },
        { id: 'c', label: '算招商局盈虧', axis: 'system',
          payoff: '帳上確有盈餘反哺，可官員委派、用人唯親、挪用公款的弊端亦隨之而生。你記下：官督商辦能集資興利，卻也埋下管理積弊的根。' }
      ],
      challenge: {
        type: 'fact', axis: 'system',
        q: '輪船招商局的創辦，反映洋務運動出現了怎樣的轉變與用意？',
        options: [
          { label: '由「求強」轉向「求富」，以官督商辦民用企業與外商爭利、挽回被洋輪奪去的航運利權', correct: true },
          { label: '由「求富」退回純軍事的「求強」階段', correct: false },
          { label: '放棄與外商競爭，改為專營官府專賣', correct: false }
        ],
        explain: '輪船招商局（1872）是洋務「求富」階段代表，採官督商辦經營近代航運、與外商爭利挽回利權，標誌洋務由「求強」（軍工）擴展到「求富」（民用）——惟官督積弊亦成其局限。（DSE：求富·官督商辦的用意與局限）'
      }
    },
    e_haifang_chouyi: {
      type: 'pinned', year: 1875, city: 'beijing', deliveryMode: 'news', chapter: '10',
      title: '海 防 大 籌 議', en: 'The Maritime Defense Debate',
      letter: 'lt_hf_to_gz',
      effects: { favor: 2 },
      setup: '光緒元年。日本侵台甫平，朝廷大籌海防。李鴻章力主重海防、建鐵甲艦隊，甚至議暫緩西征、移餉東南；左宗棠則力爭「東則海防、西則塞防，二者並重」，請纓收復新疆。一場決定國防方向的大辯論，自京中傳遍各省。',
      choices: [
        { id: 'a', label: '力主李鴻章海防之策', axis: 'system', setsFlag: 'haifang_first',
          payoff: '列強皆自海上來，京畿門戶洞開。你力主李鴻章傾力建近代海軍、購鐵甲艦——「師夷長技以制夷」護國，海防為先。（你的主張已記入案）' },
        { id: 'b', label: '議左宗棠塞防之爭', axis: 'thought',
          payoff: '左宗棠抗言：西北一棄，蒙患蔓延，祖宗之地不可輕割。你看見另一種眼光：國防不只看海，丟了塞防，海防也終難安。' },
        { id: 'c', label: '權衡餉源兩難', axis: 'system',
          payoff: '海防、塞防皆耗巨餉，而國庫空虛、餉源有限。你終於明白爭論的核心，從來不只是戰略，而是——錢不夠，二者難以兼得。' },
        { id: 'd', label: '採鄭觀應「商戰」之說 · 富國以養兵', axis: 'system',
          requires: { met: 'zhengguanying' }, effects: { funds: 2 },
          payoff: '你引鄭觀應之論：欲強兵，必先求富；以商養戰，方為長久之計。此議令滿座耳目一新——這是你結識他，才帶得進這場廷議的眼光。' }
      ],
      challenge: {
        type: 'scenario', axis: 'system',
        q: '1874–75 年「海防與塞防之爭」，最能反映洋務時期清廷的甚麼處境？',
        options: [
          { label: '國防資源有限，須在海疆與陸疆防務間取捨，反映財政與國力的困窘', correct: true },
          { label: '清廷財政充裕，可同時全力建設海陸兩防', correct: false },
          { label: '列強已不再對中國構成任何威脅', correct: false }
        ],
        explain: '日本侵台後，清廷展開海防大籌議：李鴻章主海防、左宗棠主塞防，最終確立「海防塞防並重」，設北洋、南洋海防並命左宗棠西征。這場爭論凸顯國力與餉源有限下的國防取捨。（DSE：海防建設背景·國防策略）'
      }
    },
    e_zhibuju: {
      type: 'pinned', year: 1882, city: 'shanghai', deliveryMode: 'travel', chapter: '12',
      title: '機 器 織 布 局', en: 'Shanghai Cotton Mill',
      letter: 'lt_to_japan',
      meet: { key: 'zheng_guanying', name: '鄭 觀 應', relation: '織布局總辦 · 後著《盛世危言》' },
      effects: { funds: 9, favor: 1 },   // 求富興利·餉源槓桿（平衡 v72：4→9）
      setup: '光緒八年。李鴻章督辦、鄭觀應等籌辦上海機器織布局，以機器紡織與進口洋布相抗，挽回為洋人賺去的利權。然官督商辦積弊已現，官場掣肘、用人糾葛，令這類民用企業舉步維艱。',
      choices: [
        { id: 'a', label: '看機器抵洋布', axis: 'material',
          payoff: '機製棉布勻細價廉，足與進口洋布一爭。你記下：洋務「求富」之意，正在以機器工業守住本國市場、收回利權。' },
        { id: 'b', label: '訪鄭觀應論商戰', axis: 'thought',
          payoff: '鄭觀應言：「習兵戰不如習商戰。」你心頭一震——原來在器物與制度之外，已有人想到：與列強之爭，終要在商業與國力上見高下。' },
        { id: 'c', label: '查官督商辦之弊', axis: 'system',
          payoff: '官府派員、商股受制、效率低落、虧空時聞。你記下：民用企業雖能求富，卻困於官督商辦——官的手太重，商的力難伸。' }
      ],
      challenge: {
        type: 'fact', axis: 'system',
        q: '上海機器織布局一類民用企業，其主要目的與最大局限分別是甚麼？',
        options: [
          { label: '目的在「求富」、以機器工業抵制洋貨挽回利權；局限在官督商辦下受官府干預、效率不彰', correct: true },
          { label: '目的在製造槍砲、強化軍隊；局限在工人不足', correct: false },
          { label: '目的在改革科舉；局限在缺乏校舍', correct: false }
        ],
        explain: '機器織布局屬洋務「求富」的民用企業，以機器紡織抵制進口洋布、挽回利權；但在「官督商辦」下，官府干預、用人積弊、效率低落，成為這類企業的根本局限。（DSE：求富·民用企業·官督商辦局限）'
      }
    },

    // ════════════ 威海衛 · 終局三幕（北洋成軍 → 甲午 → 馬關）════════════
    // 氛圍熱點（輕量探索）
    e_whw_harbor: {
      type: 'free', title: '劉 公 島 軍 港', city: 'weihaiwei', appearFromYear: 1888,
      taskGoal: '整理「劉公島軍港」北洋證據',
      effects: { favor: 2, funds: -2 },
      setup: '劉公島橫臥威海灣口，是北洋海軍的母港。鐵碼頭、煤棧、船塢、提督署一應俱全。定遠、鎮遠兩鐵甲巍然停泊——這裡，是洋務「強兵」三十年砌起的最後堡壘。',
      choices: [
        { id: 'a', label: '登艦觀鐵甲', axis: 'material',
          payoff: '定遠艦三十公分巨砲、鐵甲厚實，購自德國，曾是亞洲最強。你卻也聽見老水兵低語：「成軍那年起，就再沒添過新船了。」' },
        { id: 'b', label: '看軍港佈防', axis: 'system',
          payoff: '南北兩岸炮台環抱港口，本是金湯之固。可你心頭一凜：若敵從陸路抄了炮台，回過頭來，這港便成了甕。' }
      ],
      challenge: {
        type: 'fact', axis: 'material',
        q: '劉公島（威海衛）既是北洋海軍母港、又是其覆滅之地——這一興一亡，象徵了甚麼？',
        options: [
          { label: '既象徵洋務「強兵」海防的最高成果，也象徵這一成果在甲午被摧毀、洋務軍事路線的破產', correct: true },
          { label: '象徵中國第一所外語學堂的興衰起落', correct: false },
          { label: '它只是一個普通的民用通商口岸，並無特殊象徵意義', correct: false }
        ],
        explain: '威海衛劉公島集結定遠、鎮遠等主力，是洋務「強兵」與近代海防的巔峰；北洋艦隊卻正於此地全軍覆沒——一島興亡，恰是洋務「只強兵、不改制」終致失敗的縮影。（DSE：海防·強兵的成果與破產）'
      }
    },
    e_whw_ding: {
      type: 'free', title: '提 督 衙 署', city: 'weihaiwei', appearFromYear: 1888,
      taskGoal: '整理「提督衙署」軍政證據',
      meet: { key: 'ding_ruchang', name: '丁 汝 昌', relation: '北洋海軍提督 · 殉國於威海' },
      effects: { favor: 2, opinion: -2 },
      setup: '提督衙署內，海軍提督丁汝昌伏案理事。他出身淮軍陸將，奉李鴻章命統北洋水師。案頭軍報堆疊，眉間卻有化不開的憂色——添艦無望、餉械兩缺，這支艦隊的難處，他比誰都清楚。',
      choices: [
        { id: 'a', label: '聽提督憂思', axis: 'thought',
          payoff: '丁汝昌嘆道：日本年年添艦練兵，我則六年未進一艦；和戰之策又懸於朝堂反覆。你聽出，這位提督早已預見了那不祥的結局。' },
        { id: 'b', label: '查水師軍務', axis: 'system',
          payoff: '陸將統水師、號令不一、各艦管帶各行其是。你記下：這支「海軍」，缺的不只是新艦，更是一套統一的近代軍政。' }
      ],
      challenge: {
        type: 'scenario', axis: 'system',
        q: '北洋海軍由陸將統領、各艦號令不一，最能反映洋務軍事建設的甚麼問題？',
        options: [
          { label: '只購器物（船艦）而軍制、指揮、訓練未近代化——制度未改', correct: true },
          { label: '中國水兵人數不足', correct: false },
          { label: '艦隊完全沒有任何戰鬥力', correct: false }
        ],
        explain: '北洋海軍雖有先進艦船，卻沿用舊式軍制、指揮不統一、訓練廢弛——「只改器物、不改制度」，是洋務強兵的根本局限，也預埋了甲午之敗。（DSE：局限·制度未改）'
      }
    },

    // 第一幕 · 1888 北洋成軍（travel·威海衛）
    e_beiyang_fleet: {
      type: 'pinned', year: 1888, city: 'weihaiwei', deliveryMode: 'travel', chapter: '14',
      title: '北 洋 成 軍', en: 'The Beiyang Fleet',
      letter: 'lt_to_wuhan',
      meet: { key: 'ding_ruchang', name: '丁 汝 昌', relation: '北洋海軍提督' },
      effects: { favor: 5, opinion: 3 },
      setup: '光緒十四年，《北洋海軍章程》頒行，北洋海軍正式成軍。定遠、鎮遠、致遠、經遠……二十餘艦列陣劉公島，號稱亞洲第一艦隊。三十年自強，至此似見輝煌頂點——然而，頂點之後，便是長坡。',
      choices: [
        { id: 'a', label: '檢閱鐵甲艦隊', axis: 'material',
          payoff: '巨艦列陣、旌旗蔽空，李鴻章與有榮焉。可你默記下一個冷峻的事實：成軍之日，竟也是北洋添艦的終止之時——此後六年，未再進一艦一砲。' },
        { id: 'b', label: '追北洋經費去向', axis: 'system',
          payoff: '海軍衙門的銀子，漸漸移作三海工程、頤和園修建。你心頭發涼：當對手年年擴軍，我們卻把強兵的餉，築成了園林的太湖石。' },
        { id: 'c', label: '重申當年「海防為先」之議', axis: 'system',
          requires: { flag: 'haifang_first' },
          payoff: '十三年前那場海防大籌議，你曾力主海防為先。今日艦隊雖成，添艦卻已停——你重申舊議、力請持續更新，可那筆錢，早已築成了園中的石舫。先見一場，終是無力。' }
      ],
      challenge: {
        type: 'fact', axis: 'system',
        q: '北洋海軍 1888 年成軍後「六年未再添購新艦」，主要原因是甚麼？',
        options: [
          { label: '海軍經費被挪用（如修頤和園）、朝廷不再投入，海防建設停滯', correct: true },
          { label: '中國已造出足夠的國產軍艦，無需再購', correct: false },
          { label: '列強禁止中國購買任何軍艦', correct: false }
        ],
        explain: '北洋成軍後，海軍經費大量被挪作頤和園等工程，朝廷對海防投入停滯；日本卻持續擴軍。此消彼長，正是六年後甲午慘敗的伏因。（DSE：失敗原因·朝廷不重視／經費挪用）'
      }
    },

    // 第二幕 · 1894 黃海甲午（travel·威海衛）— 四因
    e_jp_meiji: {
      type: 'free', title: '脫 亞 入 歐', en: 'Meiji Restoration', city: 'japan', appearFromYear: 1888,
      taskGoal: '記下日本明治維新的見聞',
      setup: '東京街頭，斷髮西裝與和服並行。短短二十餘年，日本廢藩置縣、開議院、改法制、興學校——不止學器物，更從政教制度根本翻新。你想起國內：同文館、製造局之外，科舉、官制、政體，紋絲未動。',
      choices: [
        { id: 'a', label: '記 其 制 度 之 變', axis: 'system',
          payoff: '你記下：明治維新「破舊立新」，自上而下改了整個體制；而洋務「中體西用」，只在舊軀殼上添了幾根新枝。' },
        { id: 'b', label: '問 其 變 法 之 由', axis: 'thought',
          payoff: '日本士人答：「不全變，不足以圖存。」你默然——這句話，三十年來在中國卻始終說不出口。' }
      ],
      challenge: {
        type: 'fact', axis: 'system',
        q: '與洋務運動相比，日本明治維新最根本的不同在哪裏？',
        options: [
          { label: '明治維新全面改革政治、經濟、教育與社會制度，非只學器物', correct: true },
          { label: '明治維新只造船炮、不碰制度，與洋務完全相同', correct: false },
          { label: '明治維新完全拒絕西方、回歸傳統', correct: false }
        ],
        explain: '明治維新「脫亞入歐」，自政體、法制、教育到社會全面西化變革；洋務則限於「中體西用」、只學器物而不觸制度——這正是日強中弱、終致甲午勝負的根本分野。（DSE：洋務 vs 明治維新·對照）'
      }
    },
    e_jp_navy: {
      type: 'free', title: '富 國 強 兵', en: 'Rising Fleet', city: 'japan', appearFromYear: 1888,
      taskGoal: '記下日本海軍擴張的見聞',
      setup: '橫須賀軍港，新式快艦次第下水——吉野航速逾二十節、速射砲密如疾雨。日本傾國之力、節衣縮食以購艦擴軍。你心頭一沉：同一時間，北洋自成軍後六年未添一艦，那筆海軍款，填了頤和園。',
      choices: [
        { id: 'a', label: '記 其 艦 速 火 力', axis: 'material',
          payoff: '你記下：日艦新、快、砲速；北洋舊、慢、彈匱。器物之差，已在無聲處拉開。' },
        { id: 'b', label: '歎 我 添 艦 無 望', axis: 'system',
          payoff: '你歎：器物可購，然購之須餉、續之須恆。北洋之困，不在不知買船，而在無錢、無心、無持續之政。' }
      ],
      challenge: {
        type: 'fact', axis: 'material',
        q: '1888 年後，中日海軍實力此消彼長，主因是甚麼？',
        options: [
          { label: '日本持續傾力擴充新式快艦，北洋卻因經費被挪、六年未再添艦', correct: true },
          { label: '中國軍艦數量一直遠多於日本', correct: false },
          { label: '兩國海軍都停止了發展', correct: false }
        ],
        explain: '1888 北洋成軍後，海軍經費被挪修頤和園，六年未添新艦；日本卻舉國擴軍、新購吉野等快艦——此消彼長，埋下黃海艦速火力俱遜之敗。（DSE：甲午成因·軍備）'
      }
    },
    e_jp_tairiku: {
      type: 'free', title: '大 陸 政 策', en: 'Continental Ambition', city: 'japan', appearFromYear: 1888,
      taskGoal: '記下日本擴張野心的見聞',
      setup: '報端與議院高唱「征韓」、「開拓萬里波濤之國威」。這個脫胎換骨的鄰邦，已不甘居於島上——其目光越過對馬海峽，直指朝鮮，繼而中國。山雨欲來。',
      choices: [
        { id: 'a', label: '記 其 野 心 所 向', axis: 'thought',
          payoff: '你記下：日本之強，非為自保，乃為擴張。朝鮮，將是它伸向大陸的第一步。' },
        { id: 'b', label: '憂 我 藩 屬 難 保', axis: 'system',
          payoff: '你憂心：朝鮮為我藩屬，一旦有變，清日必爭。而今日之日本，已非昔日之倭。' }
      ],
      challenge: {
        type: 'fact', axis: 'thought',
        q: '日本明治維新後推行「大陸政策」，其首要目標是甚麼？',
        options: [
          { label: '控制朝鮮、進而侵略中國大陸', correct: true },
          { label: '與中國結盟共同抵禦西方', correct: false },
          { label: '放棄對外擴張、專注內政', correct: false }
        ],
        explain: '日本明治維新後國力大增，推行「大陸政策」，以朝鮮為跳板覬覦中國——1894 朝鮮東學黨之亂，正是它出兵、引爆甲午戰爭的時機。（DSE：甲午背景·日本擴張）'
      }
    },
    e_korea_situation: {
      type: 'free', title: '漢 城 風 雲', en: 'Hanseong', city: 'korea', appearFromYear: 1890,
      taskGoal: '記下朝鮮局勢的見聞',
      setup: '漢城景福宮內外，親清、親日、本土改革各派暗潮洶湧。朝鮮為清廷藩屬二百餘年，然日本經營已深。市井間，東學道徒聚眾的消息，正一日緊似一日。',
      choices: [
        { id: 'a', label: '察 清 日 之 爭', axis: 'system',
          payoff: '你看出：朝鮮已成清日角力的棋盤。宗主之名在清，經營之實在日——名實之間，戰機暗伏。' }
      ],
      challenge: {
        type: 'fact', axis: 'system',
        q: '甲午戰爭前，朝鮮在中日之間處於甚麼地位？',
        options: [
          { label: '名義上是清廷藩屬，實則成為中日勢力角逐之地', correct: true },
          { label: '已完全併入日本版圖', correct: false },
          { label: '與中日皆無往來的孤立之國', correct: false }
        ],
        explain: '朝鮮長期為清廷藩屬，但明治維新後日本積極滲透、覬覦半島；中日在朝鮮的角力，最終因 1894 東學黨之亂同時出兵而引爆甲午戰爭。（DSE：甲午導火線·朝鮮）'
      }
    },
    e_korea_donghak: {
      type: 'pinned', year: 1894, city: 'korea', deliveryMode: 'travel', chapter: '14',
      title: '東 學 黨 之 亂', en: 'The Donghak Uprising',
      setup: '光緒二十年春，朝鮮東學道徒揭竿而起，勢如燎原。朝鮮王廷震恐，循例求宗主清廷發兵助剿。李鴻章遣葉志超率淮軍渡海——豈料日本以「保護僑民」為名，傾數倍之兵同時登陸，賴著不走。一觸即發。',
      choices: [
        { id: 'a', label: '力 主 慎 重 · 勿 墮 其 計', axis: 'system',
          payoff: '你進言：日本蓄謀已久，我出兵正中其下懷，宜慎。然木已成舟，淮軍已渡，兩國大軍對峙牙山、漢城之間——退無可退。' },
        { id: 'b', label: '按 朝 廷 之 命 · 護 藩 屬', axis: 'thought',
          payoff: '護藩屬、保宗主，名正言順。可你心知：這一仗，賭的是洋務三十年的全部家當，而對手，是脫胎換骨的明治日本。' }
      ],
      challenge: {
        type: 'fact', axis: 'system',
        q: '1894 年甲午戰爭爆發的導火線是甚麼？',
        options: [
          { label: '朝鮮東學黨之亂，清日同時出兵朝鮮、衝突遂起', correct: true },
          { label: '日本直接進攻中國本土的北京', correct: false },
          { label: '列強聯手逼迫中日開戰', correct: false }
        ],
        explain: '1894 朝鮮東學黨起事，朝鮮求清出兵；清依宗主之義派兵，日本藉口同時大舉出兵、拒不撤退，終於開戰——這便是甲午戰爭的導火線。（DSE：甲午導火線·東學黨之亂）'
      }
    },
    e_yellow_sea_battle: {
      type: 'pinned', year: 1894, city: 'weihaiwei', deliveryMode: 'travel', chapter: '15',
      title: '黃 海 · 甲 午', en: 'The Battle of the Yellow Sea',
      effects: { favor: -6, populace: -6, funds: -6 },
      setup: '光緒二十年，朝鮮事起，中日開戰。黃海大東溝外，北洋艦隊與日本聯合艦隊相遇——這是三十年洋務「強兵」的總考驗。',
      choices: [
        { id: 'a', label: '看「各自為政」', axis: 'system',
          payoff: '北洋孤軍力戰，南洋、福建、廣東艦隊隔岸觀火。名為「海軍」，實則四洋分立、無人統一調度——洋務由地方督撫分頭辦的舊病，此刻致命。' },
        { id: 'b', label: '看「和戰不定」', axis: 'system',
          payoff: '朝堂主戰主和反覆，李鴻章奉旨「保船制敵」，竟成「避戰自保」。艦隊困於威海不敢出，坐失戰機——廟算先亂，師出已疲。' },
        { id: 'c', label: '看「軍備落後」', axis: 'material',
          payoff: '艦齡老朽、航速火力俱遜日艦，速射砲缺、炮彈不足甚至填以泥沙。成軍六年未添一艦——當年的「亞洲第一」，已被對手遠遠拋下。' },
        { id: 'd', label: '看「戰略失誤」', axis: 'system',
          payoff: '黃海陣型失當、旗艦中砲指揮中斷；其後退守威海衛軍港，反遭日軍從陸路抄炮台、海陸夾擊，甕中待斃，全軍覆沒。' },
        { id: 'e', label: '你早見過這場敗仗的伏線', axis: 'thought',
          requires: { met: 'itohirobumi' },
          payoff: '橫濱洋樓裡見伊藤博文的那一眼，你便隱隱知道有此一日。敗的不是一場海戰，是兩條道路——他們脫胎換骨，我們只換了船炮。這份清醒，你要留給後人。' }
      ],
      challenge: {
        type: 'scenario', axis: 'system',
        q: '黃海海戰中北洋艦隊落敗，最直接暴露了甚麼問題？',
        options: [
          { label: '六年未添艦更新、艦速火力俱遜於日艦，兼彈藥不足、陣型指揮失當', correct: true },
          { label: '北洋艦隊根本沒有任何近代軍艦', correct: false },
          { label: '士兵盡皆臨陣脫逃、不願作戰', correct: false }
        ],
        explain: '黃海一役，北洋因 1888 成軍後六年未添新艦（經費被挪修頤和園），艦速、航速、速射火力俱遜於日本聯合艦隊，又有彈藥不足、煤質低劣、陣型指揮失當——正是洋務「只購器物、不持續投入、軍制未改」的總清算。（DSE：黃海海戰·戰敗原因）'
      }
    },

    // 第三幕 · 1895 馬關（甲午後自動接續 → 結算）
    e_shimonoseki_treaty: {
      type: 'pinned', year: 1895, city: 'weihaiwei', deliveryMode: 'news', chapter: '16',
      title: '馬 關 議 和', en: 'The Treaty of Shimonoseki',
      effects: { favor: -6, populace: -8, funds: -8 },
      setup: '光緒二十一年，威海衛陷落，北洋艦隊全軍覆沒，丁汝昌服毒殉國。李鴻章渡海赴日本馬關議和——割台灣、澎湖、遼東，賠銀二萬萬兩，增開商埠。三十年自強，一夕化為灰燼。',
      choices: [
        { id: 'a', label: '讀馬關條約', axis: 'system',
          payoff: '賠款二萬萬兩，相當於清廷數年歲入；台灣自此淪日五十年。割地賠款之重，亙古未有——「自強」的招牌，被這紙條約徹底砸碎。' },
        { id: 'b', label: '望李鴻章背影', axis: 'thought',
          payoff: '老臣自日歸來，舉國唾罵。你卻忽然明白：敗的不是他一人——是「中體西用」三十年只學器物、未觸制度根本的整個洋務。' }
      ],
      challenge: {
        type: 'fact', axis: 'thought',
        q: '甲午戰敗與《馬關條約》，對洋務運動有何意義？',
        options: [
          { label: '宣告洋務「自強求富」破產，證明只學器物不改制度無法救國，刺激其後維新與革命', correct: true },
          { label: '證明洋務運動已徹底成功', correct: false },
          { label: '使中國從此不再受列強侵略', correct: false }
        ],
        explain: '甲午一敗，三十年洋務的成果毀於一旦，宣告「中體西用」只改器物路線的破產；它促使知識分子轉向制度變革，催生戊戌維新與日後的革命。（DSE：洋務運動的失敗與影響）'
      }
    },

    // ════════════ 廣州 · 背景城（通商與鴉片戰爭之源，無鐵釘）════════════
    e_gz_hong: {
      type: 'free', title: '十 三 行', city: 'guangzhou', appearFromYear: 1861,
      taskGoal: '整理「十三行」通商證據',
      effects: { populace: -1 },
      setup: '珠江岸邊，十三行商館鱗次櫛比。鴉片戰爭前，這裡是天朝唯一的通商之窗：公行壟斷中外貿易，外商只能在此交易、不得入內地。一場戰爭之後，這套維持百年的舊規，正迅速瓦解。',
      choices: [
        { id: 'a', label: '查公行專營之制', axis: 'system',
          payoff: '行商代官府管理外貿、收稅、約束洋商，是「天朝—藩屬」秩序在貿易上的延伸。你記下：這套制度的前提，是把通商當恩賜、把外人當夷狄。' },
        { id: 'b', label: '看五口通商之變', axis: 'material',
          payoff: '五口一開、公行一廢，上海憑長江之便迅速崛起，廣州的獨佔地位一去不返。你看見：條約不只割地賠款，更改寫了整個貿易的版圖。' }
      ],
      challenge: {
        type: 'fact', axis: 'system',
        q: '《南京條約》開五口、廢公行後，廣州在中國對外貿易中的地位有何變化？',
        options: [
          { label: '一口獨佔地位終結，上海憑長江之便後來居上', correct: true },
          { label: '地位更形鞏固，仍是唯一通商口岸', correct: false },
          { label: '完全退出對外貿易，淪為內陸城市', correct: false }
        ],
        explain: '五口通商、公行廢除後，廣州一口獨佔的地位一去不返，上海憑長江航運與地利後來居上，成為新的貿易與洋務樞紐——通商格局因條約而改寫。（DSE：通商制度·五口通商後的變遷）'
      }
    },
    e_gz_humen: {
      type: 'free', title: '虎 門 炮 台', city: 'guangzhou', appearFromYear: 1861,
      taskGoal: '整理「虎門炮台」戰史證據',
      effects: { favor: -1, opinion: 1 },
      setup: '虎門炮台扼守珠江口。道光十九年，林則徐在此銷煙；不久英艦溯江而上，土炮土垣抵不住堅船利砲——一場敗仗，揭開了「三千年未有之大變局」。',
      choices: [
        { id: 'a', label: '憑弔林則徐銷煙', axis: 'thought',
          payoff: '林則徐查禁鴉片、編譯夷情，是近代「開眼看世界」的第一人。魏源承其志，提出「師夷長技以制夷」——這六個字，二十年後成了洋務的口號。' },
        { id: 'b', label: '察炮台之敗', axis: 'system',
          payoff: '土炮射程短、炮台難轉向，面對機動的蒸汽艦隊毫無還手之力。你記下：這場慘敗第一次把「船堅砲利」四字，刻進了清廷的記憶。' }
      ],
      challenge: {
        type: 'scenario', axis: 'thought',
        q: '鴉片戰爭與虎門之敗，與其後的洋務運動有何關係？',
        options: [
          { label: '戰敗暴露武備落後、刺激「師夷長技以自強」，是洋務運動的遠因', correct: true },
          { label: '戰爭大勝，使中國從此無需改革', correct: false },
          { label: '與洋務運動完全沒有關係', correct: false }
        ],
        explain: '鴉片戰爭中國戰敗、被迫簽《南京條約》，暴露「船堅砲利」的差距；林則徐、魏源「師夷長技以制夷」的主張，正是二十年後洋務「自強」的思想遠因。（DSE：背景·鴉片戰爭／洋務遠因）'
      }
    },
    e_gz_trade: {
      type: 'free', title: '珠 江 洋 行', city: 'guangzhou', appearFromYear: 1861,
      taskGoal: '整理「珠江洋行」利權證據',
      effects: { funds: 1, populace: -2 },
      setup: '珠江江面舟楫往來，岸上洋行、行商雜處。五口通商之後，外國洋行大舉進駐，掌控進出口；昔日的行商，或淪為洋行的買辦，或在洋貨傾銷下漸漸沒落。',
      choices: [
        { id: 'a', label: '看洋行掌利權', axis: 'material',
          payoff: '進出口、定價、航運，漸由洋行說了算。你記下：通商口岸的利權外溢，正是洋務日後要「求富」「收回利權」的痛處所在。' },
        { id: 'b', label: '看行商之沒落', axis: 'system',
          payoff: '舊日富甲一方的行商，有的破產、有的轉作買辦替洋人牽線。你看見：一個舊商人階層的崩解，與一個新中介階層的興起，都在這珠江岸上。' }
      ],
      challenge: {
        type: 'fact', axis: 'material',
        q: '五口通商後，外國洋行進駐口岸對中國經濟的主要影響是？',
        options: [
          { label: '洋行掌控進出口、洋貨大量輸入，衝擊本土行商與手工業，利權外溢', correct: true },
          { label: '使中國迅速成為世界工業強國', correct: false },
          { label: '對中國民生與經濟毫無影響', correct: false }
        ],
        explain: '通商口岸開放後，外國洋行掌控進出口貿易、洋貨價廉大量輸入，衝擊本土行商與手工業、利權外溢——這是列強經濟入侵的具體景象，也是洋務「求富」要回應的問題。（DSE：列強經濟入侵）'
      }
    },

    // ════════════ 香港 · 背景城（西學東漸·留學之源，無鐵釘）════════════
    e_hk_rong: {
      type: 'free', title: '容 閎 與 留 學', city: 'hongkong', appearFromYear: 1861,
      taskGoal: '整理「容閎與留學」育才證據',
      meet: { key: 'yung_wing', name: '容 閎', relation: '留學之父 · 首位耶魯華人' },
      effects: { opinion: 1 },
      setup: '港島的教會學堂裡，曾走出一個叫容閎的少年。他遠渡重洋、成為首位耶魯畢業的中國人；歸國後奔走多年，只為一個念頭：把西方的學術，灌輸到中國來。',
      choices: [
        { id: 'a', label: '聽容閎之志', axis: 'thought',
          payoff: '容閎說：欲使中國日趨於文明富強之境，當引西方之學術。你聽出，這是比「買船買炮」更深一層的眼光——強國，先要育人。' },
        { id: 'b', label: '看留學之議', axis: 'system',
          payoff: '他說動曾國藩、李鴻章奏准，1872 年起選派幼童赴美。你記下：洋務的「派遣留學生」，思想源頭原來在這座殖民港。' }
      ],
      challenge: {
        type: 'fact', axis: 'thought',
        q: '留美幼童計劃中途被撤回，但詹天佑日後仍主持京張鐵路——這最能說明洋務文教改革的甚麼？',
        options: [
          { label: '育才之效深遠：縱使計劃遭守舊腰斬，已播下的人才種子仍在日後開花結果', correct: true },
          { label: '說明留學計劃從未培養出任何有用人才', correct: false },
          { label: '說明清廷自始至終全力支持留學、毫無阻力', correct: false }
        ],
        explain: '容閎策劃的一百二十名留美幼童雖遭撤回，仍育出詹天佑（京張鐵路）、唐紹儀等棟樑——足見文教育才之效深遠：種子一旦播下，縱遇中斷，仍會在日後開花。（DSE：派遣留學生·成果與長遠影響）'
      }
    },
    e_hk_press: {
      type: 'free', title: '西 書 報 館', city: 'hongkong', appearFromYear: 1861,
      taskGoal: '整理「西書報館」新知證據',
      meet: { key: 'wang_tao', name: '王 韜', relation: '《循環日報》主筆 · 早期變法思想家' },
      effects: { opinion: 1 },
      setup: '街角一間報館兼書肆，架上是西書、地圖、洋報。王韜在港主辦《循環日報》，以報章鼓吹變法——新知與新思想，正由這殖民港的口岸，悄悄流入中國。',
      choices: [
        { id: 'a', label: '翻閱西書洋報', axis: 'thought',
          payoff: '地理、格致、史志、時務……你第一次看見，西學不只船炮，更是一整套看世界的方法。' },
        { id: 'b', label: '訪王韜論變法', axis: 'thought',
          payoff: '王韜直言：洋務若只變器物、不變法度，終是捨本逐末。你心頭一震——原來「中體西用」之外，早有人想得更遠。' }
      ],
      challenge: {
        type: 'scenario', axis: 'thought',
        q: '王韜、鄭觀應等早期改良思想家的變法主張，對日後歷史有何影響？',
        options: [
          { label: '突破「中體西用」、倡議進至制度變革，為日後維新運動鋪路', correct: true },
          { label: '直接引發辛亥革命、推翻清朝', correct: false },
          { label: '促使洋務派放棄一切西學', correct: false }
        ],
        explain: '王韜、鄭觀應等透過報刊鼓吹變法，主張在「中體西用」之外進一步改革政教制度，是早期維新思潮，啟發並為日後（1898）戊戌維新運動鋪路。（DSE：思想·早期維新→維新運動）'
      }
    },
    e_hk_harbour: {
      type: 'free', title: '維 多 利 亞 港', city: 'hongkong', appearFromYear: 1861,
      taskGoal: '整理「維多利亞港」殖民對照證據',
      effects: { populace: -1 },
      setup: '維多利亞港，英艦與華船共泊一灣。山上是殖民官署、洋樓、教堂與法院，井然有序；山下是華人苦力、舢舨與雜沓市集——同一座港，分作兩個世界。',
      choices: [
        { id: 'a', label: '看殖民秩序', axis: 'system',
          payoff: '法律、市政、學校、商務，皆按西法運作、效率井然。你心情複雜：屈辱的割地之上，竟也立著一面照出差距的鏡子。' },
        { id: 'b', label: '看華洋不平等', axis: 'thought',
          payoff: '華人居山下、做苦力，洋人居山上、掌權柄。你記下：這座港既是西學之窗，也是國弱受欺的活教材——兩種刺激，都逼人思變。' }
      ],
      challenge: {
        type: 'scenario', axis: 'system',
        q: '香港作為英國殖民港口，對近代中國最主要的「刺激」意義是甚麼？',
        options: [
          { label: '西方制度、學問、效率近在眼前，形成對照，刺激中國人反思與求變', correct: true },
          { label: '證明殖民統治對中國只有好處而無代價', correct: false },
          { label: '與中國的改革思想毫無關係', correct: false }
        ],
        explain: '香港的法律、教育、市政與商業近在咫尺，與積弱的中國形成強烈對照，刺激王韜、容閎等知識分子反思自身、推動變革——是洋務與其後維新的重要外部刺激。（DSE：背景·外部刺激·殖民對照）'
      }
    },

    // ════════════ 武漢 · 背景城（後期洋務·漢陽鐵廠，無鐵釘）════════════
    e_wh_iron: {
      type: 'free', title: '漢 陽 鐵 廠', city: 'wuhan', appearFromYear: 1889,
      taskGoal: '整理「漢陽鐵廠」工業證據',
      effects: { funds: -4, favor: 2 },
      setup: '漢水之濱，高爐林立、黑煙蔽空。張之洞辦的漢陽鐵廠，是中國乃至亞洲第一座近代鋼鐵聯合企業——洋務「求富」三十年，至此邁向了重工業的門檻。',
      choices: [
        { id: 'a', label: '入廠觀高爐', axis: 'material',
          payoff: '煉鐵、煉鋼、軋材，一座鋼鐵聯合企業巍然成形。你看見洋務最雄心的一步：不止造船買炮，更要自煉鋼鐵、自立工業之基。' },
        { id: 'b', label: '查鐵廠帳目', axis: 'system',
          payoff: '帳簿觸目驚心：選址欠當、煤鐵不配、用人唯親、年年虧損。你記下：規模愈大，官辦的積弊也愈無從遮掩。' }
      ],
      challenge: {
        type: 'fact', axis: 'material',
        q: '漢陽鐵廠在洋務運動中的地位與其長期虧損，分別說明甚麼？',
        options: [
          { label: '它是中國近代重工業的開端（成就），其虧損則暴露官辦企業選址用人與管理的弊端（局限）', correct: true },
          { label: '它證明洋務運動已使中國成為工業強國', correct: false },
          { label: '它與洋務「求富」毫無關係', correct: false }
        ],
        explain: '漢陽鐵廠是中國乃至亞洲第一座近代鋼鐵聯合企業，標誌洋務後期邁向重工業；但選址欠當、管理積弊、長期虧損，暴露官辦企業效率低落的根本局限。（DSE：後期洋務·成效與局限）'
      }
    },
    e_wh_river: {
      type: 'free', title: '長 江 碼 頭', city: 'wuhan', appearFromYear: 1889,
      taskGoal: '整理「長江碼頭」樞紐證據',
      effects: { funds: 2 },
      setup: '漢口碼頭，長江、漢水交匯，帆檣輪船雲集，貨物堆積如山。九省通衢的水運之便，把南北物產與洋務的雄心，都匯到了這座碼頭。',
      choices: [
        { id: 'a', label: '看水運集散', axis: 'system',
          payoff: '煤、鐵、棉、糧沿江而來，鋼鐵、紗布順流而去。你明白張之洞為何擇此辦廠：近代工業，要的正是這四通八達的物流。' },
        { id: 'b', label: '訪漢口商埠', axis: 'material',
          payoff: '漢口開埠通商，洋行華商雜處，儼然內陸的上海。你記下：後期洋務的重心，已由沿海延伸到長江中游的內陸樞紐。' }
      ],
      challenge: {
        type: 'scenario', axis: 'system',
        q: '武漢（漢口）成為後期洋務工業重鎮，最主要的地利條件是甚麼？',
        options: [
          { label: '居長江中游、九省通衢，水運便利、原料貨物易集散', correct: true },
          { label: '地處邊陲、與外界完全隔絕', correct: false },
          { label: '從不對外通商、免受任何影響', correct: false }
        ],
        explain: '武漢居長江中游、九省通衢，漢口為通商巨埠，水運便利使原料、燃料與貨物易於集散——這是張之洞在此興辦漢陽鐵廠等後期洋務事業的關鍵地利。（DSE：後期洋務·內陸樞紐）'
      }
    },
    e_wh_zhang: {
      type: 'free', title: '張 之 洞 新 政', city: 'wuhan', appearFromYear: 1889,
      taskGoal: '整理「張之洞新政」思想證據',
      meet: { key: 'zhang_zhidong', name: '張 之 洞', relation: '湖廣總督 · 後期洋務集大成者' },
      effects: { favor: 2, opinion: 1 },
      setup: '督署案頭，張之洞正撰《勸學篇》。鐵廠、槍砲廠、紗廠、新式學堂，他一手經營；而那句「中學為體，西學為用」，道盡了這場改革的底色，也劃下了它的界限。',
      choices: [
        { id: 'a', label: '讀《勸學篇》', axis: 'thought',
          payoff: '「舊學為體，新學為用，不使偏廢。」你讀懂了洋務三十年的旗幟——可也讀出那道牆：綱常名教既不可動，西學便永遠只是「用」。' },
        { id: 'b', label: '看新政諸業', axis: 'system',
          payoff: '一省之內，重工業、軍工、民用、文教並舉，規模空前。你記下：後期洋務愈辦愈大，卻始終跨不過「只改器物、不改制度」那一步。' }
      ],
      challenge: {
        type: 'fact', axis: 'thought',
        q: '張之洞《勸學篇》「中學為體、西學為用」，最能概括洋務運動的甚麼性質？',
        options: [
          { label: '以綱常名教為根本、只取西方器物技藝為輔——只改器物不改制度的指導思想與根本局限', correct: true },
          { label: '主張全面西化、廢除一切傳統', correct: false },
          { label: '主張立即推翻帝制、建立共和', correct: false }
        ],
        explain: '「中學為體、西學為用」是洋務的指導思想：以綱常名教為根本，只取西方器物技藝為輔助。這既凝聚了洋務的共識，也決定了它只改器物、不觸制度的根本局限。（DSE：中體西用·局限）'
      }
    },

    // ════════════ 開平 · 背景城（民用企業·自建鐵路·民間阻力，無鐵釘）════════════
    e_kp_mine: {
      type: 'free', title: '開 平 煤 礦', city: 'kaiping', appearFromYear: 1877,
      taskGoal: '整理「開平煤礦」求富證據',
      meet: { key: 'tang_tingshu_kp', name: '唐 廷 樞', relation: '開平礦務局 · 總辦' },
      effects: { funds: 4, favor: 1 },
      setup: '光緒三年，李鴻章命唐廷樞主辦開平礦務局，以「官督商辦」開採北方煤鐵。礦井、煤堆、抽水機器一字排開——洋務「求富」的民用企業，在這北方礦區挖出了第一鍬。',
      choices: [
        { id: 'a', label: '查官督商辦之制', axis: 'system',
          payoff: '官府給照、批地、保護、委派總辦；商人集股、出資、經營、營利。你記下這「求富」的典型形式：借商人之力辦實業，卻也把官的手伸進了礦場。' },
        { id: 'b', label: '看煤助自強', axis: 'material',
          payoff: '開平之煤，供輪船、機器局與軍工燃用。你明白後期洋務的算盤：求富不只為營利，更為自強的船炮機器，備下源源的燃料。' }
      ],
      challenge: {
        type: 'fact', axis: 'system',
        q: '開平礦務局（1877）代表洋務運動的哪一階段、哪一類措施？',
        options: [
          { label: '「求富」階段的官督商辦民用企業（近代採礦）', correct: true },
          { label: '「自強」階段的官辦軍事工業', correct: false },
          { label: '政治制度改革', correct: false }
        ],
        explain: '開平礦務局是洋務「求富」階段的民用企業，採官督商辦形式經營近代煤礦，既供軍工燃料、又求營利——體現後期洋務「求富以助求強」。（DSE：求富·官督商辦·民用企業）'
      }
    },
    e_kp_rail: {
      type: 'free', title: '唐 胥 鐵 路', city: 'kaiping', appearFromYear: 1877,
      taskGoal: '整理「唐胥鐵路」交通證據',
      effects: { populace: -2 },
      setup: '礦坑的煤要快速運出海口。於是唐山至胥各莊之間，鋪起了中國第一條自建鐵路——可這一小段鐵軌，竟在「龍脈」與「風水」的爭吵聲中，走得步步維艱。',
      choices: [
        { id: 'a', label: '看自建鐵路', axis: 'material',
          payoff: '中國人自己勘線、自己鋪軌，運煤效率倍增。你看見近代交通的破土：洋務終於從船與炮，邁向了鐵路與基建。' },
        { id: 'b', label: '聽風水之阻', axis: 'thought',
          payoff: '鄉民疑機車震動龍脈、驚擾祖墳，群起反對。鐵路初通，竟一度禁用機車、改以騾馬拖拉車廂。你記下：每一步近代化，都拖著民間阻力的重量。' }
      ],
      challenge: {
        type: 'fact', axis: 'material',
        q: '為運開平之煤而建的唐胥鐵路，在中國交通史上的意義是甚麼？',
        options: [
          { label: '中國第一條自建鐵路，近代交通的開端；初期卻因風水反對而以騾馬拖拉', correct: true },
          { label: '中國第一條由外國獨資建造的鐵路', correct: false },
          { label: '與洋務運動毫無關係的觀光鐵路', correct: false }
        ],
        explain: '唐胥鐵路（1881）是中國第一條自建鐵路，為運開平之煤而築，是近代交通的開端；初期因鄉民以「震龍脈、傷風水」反對，曾以騾馬拖拉車廂，後才獲准行駛機車。（DSE：交通近代化·民間阻力）'
      }
    },
    e_kp_fengshui: {
      type: 'free', title: '風 水 民 怨', city: 'kaiping', appearFromYear: 1877,
      taskGoal: '整理「風水民怨」阻力證據',
      effects: { populace: -3, opinion: -1 },
      setup: '鐵路、礦井所到之處，鄉民焚香叩拜、聯名抗阻：說機車震龍脈、礦洞洩地氣、煙囪壞風水。新事業每要前進一步，都先撞上這一堵看不見的牆。',
      choices: [
        { id: 'a', label: '聽鄉民之懼', axis: 'thought',
          payoff: '龍脈、地氣、祖墳……他們怕的不是機器本身，是機器背後那個陌生而失控的新世界。你明白：洋務缺的，是讓百姓安心的解釋與基礎。' },
        { id: 'b', label: '思阻力之源', axis: 'system',
          payoff: '民智未開、教育未普及、新政與民生脫節。你記下：技術可以引進，人心卻難一夕轉變——這正是洋務「缺乏社會基礎」的死結。' }
      ],
      challenge: {
        type: 'scenario', axis: 'thought',
        q: '鄉民以「風水、龍脈」反對鐵路礦務，最能反映洋務運動的甚麼局限？',
        options: [
          { label: '民智未開、迷信深重，新技術缺乏社會基礎，民間阻力重重', correct: true },
          { label: '中國民眾已全面接受一切西方事物', correct: false },
          { label: '鐵路礦務在技術上完全無法運作', correct: false }
        ],
        explain: '開平鐵路、礦務屢遭鄉民以風水、龍脈為由反對，反映洋務引進新技術時，因民智未開、迷信深重而缺乏廣泛社會基礎——民間阻力是洋務難以順利推行的重要局限。（DSE：局限·民間反對·缺乏社會基礎）'
      }
    }
  };

  // ════════════ 書信引線（串連各城、激活「友」）════════════
  const LETTERS = {
    lt_bj_to_sh: {
      from: '李 鴻 章',
      fromKey: 'lihongzhang',
      relation: '洋務重臣 · 器物自強的旗手',
      date: '同治元年 · 京中遞至',
      body: '京中制度之爭，倭仁諸公各執一詞，恐難有結果。然依鄙見，根本不在口舌，而在製器——徒爭體用，不如先造出一桿能用的槍。\n\n上海江南將設機器局，仿西法造船炮。足下既在南中，盍往一觀？器物之事，眼見方為真。',
      pointTo: { city: 'shanghai', note: '上海 · 江南機器製造（將於 1865 興辦）' }
    },
    lt_sh_to_fz: {
      from: '沈 葆 楨',
      fromKey: 'shenbaozhen',
      relation: '船政大臣 · 福州船政總理',
      date: '同治四年 · 自閩中寄',
      body: '製造局既興，槍炮可期。然海疆萬里，徒有陸器而無艦船，終是門戶洞開。\n\n左公與我，將於福州馬尾設船政局，造輪船、立學堂，育我中華自己的海軍。此事艱钜，尤須有心人親見。閣下若有暇，南下閩江一行如何？',
      pointTo: { city: 'fuzhou', note: '福州 · 馬尾船政（將於 1866 創辦）' }
    },
    lt_fz_to_nj: {
      from: '曾 國 藩', fromKey: 'zeng_guofan', relation: '兩江總督 · 湘軍領袖',
      date: '同治五年 · 自江寧寄',
      body: '閩中船政既興，然南洋根本，仍在江寧（南京）。大亂之後，百廢待舉——軍械、善後、籌餉，皆關自強大局。\n\n足下若由閩北上，何妨先到江寧一行？看看這兵燹之後，地方如何自任其責。',
      pointTo: { city: 'nanjing', note: '南京 · 兩江善後與自強（戰後重建）' }
    },
    lt_hf_to_gz: {
      from: '鄭 觀 應', fromKey: 'zhengguanying', relation: '上海買辦 · 早期維新',
      date: '光緒元年 · 海防議後寄',
      body: '海防之議方殷，然強兵之外，更須求富、爭利權。南粵通商最早：廣州十三行的興衰、香港西書報館的新知，皆足省思。\n\n閣下若有意，何不南下廣州、香港一觀？商戰之要、變法之聲，盡在南天。',
      pointTo: { city: 'guangzhou', note: '廣州／香港 · 通商利權與西學東漸' }
    },
    lt_to_kp: {
      from: '唐 廷 樞', fromKey: 'tangtingshu', relation: '招商局買辦 · 開平礦務總辦',
      date: '同治十二年 · 自津門寄',
      body: '招商局輪船日繁，而煤價盡操於洋商之手——船炮機器，非煤不濟。\n\n我將於直隸開平設礦，以機器採煤、築唐胥鐵路運之，是中國自建鐵路之始。閣下他日北來，盍至開平一觀這「黑金」之利？',
      pointTo: { city: 'kaiping', note: '開平 · 機器煤礦與唐胥鐵路（1877 後）' }
    },
    lt_to_japan: {
      from: '黃 遵 憲', fromKey: 'huangzunxian', relation: '駐日參贊 · 著《日本國志》',
      date: '光緒八年 · 自東瀛寄',
      body: '僕參贊日本數年，所見所思，輯為《日本國志》。此邦維新，非徒堅船利炮——其變法、立憲、興學，皆自根本改起，氣象一新，令人悚然。\n\n中土洋務，徒習皮毛而已。閣下他日若得東渡（一八八八年後），務必親見這脫胎換骨之鄰邦——知彼，方知己之所缺。',
      pointTo: { city: 'japan', note: '日本 · 明治維新與大陸政策（1888 後可往）' }
    },
    lt_to_wuhan: {
      from: '張 之 洞', fromKey: 'zhangzhidong', relation: '湖廣總督 · 後期洋務代表',
      date: '光緒十五年 · 自武昌寄',
      body: '鄙人移督湖廣，將於漢陽設鐵廠、槍炮廠，又興紗廠、新式學堂——求富求強並舉，規模當為國朝之最。\n\n然官辦積弊、經費維艱，成敗未可知。閣下若溯江而上，盍至武漢一觀這後期洋務的格局與隱憂？',
      pointTo: { city: 'wuhan', note: '武漢 · 張之洞新政與漢陽鐵廠（1889 後）' }
    }
  };

  // 遊戲狀態（單局）
  const gameState = {
    currentYear: 1861,
    currentSeason: 0,           // 0=春, 1=夏, 2=秋, 3=冬
    currentCity: 'shanghai',
    axes: { material: 0, system: 0, thought: 0 },
    axesMax: { material: 30, system: 25, thought: 20 },
    completedEvents: new Set(),
    unlockedEvents: new Set(),  // 自由事件解鎖（透過線索熱點）
    facilityUsed: {},           // 設施使用記錄（key: facId-year-season，每季每設施限一次）
    evidenceLedger: [],         // 已收錄證據（由城市熱點取得）
    completedEvidenceTasks: new Set(), // 已完成的輕量證據任務（key: city:hotspot）
    challengeCorrect: 0,        // 角色追問妥善回應次數（成就用）
    quizLog: [],                // 求知考驗記錄（最終結算「學習回收」用）
    partsShown: [],             // 已播放的篇章轉場（年份門檻，#7）
    citiesVisited: [],          // 已踏訪城市（成就用）
    citiesIntroduced: [],       // 已完成首次入城核心循環提示的城市
    // 四方阻力（洋務面對的現實阻力，0–100）
    res: { favor: 55, opinion: 50, populace: 50, funds: 45 },  // 聖眷·清議·民情·餉源
    setbackAt: {},              // 各資源上次反撲年份（冷卻用）
    locked: false,              // true = 鐵釘待辦於他城，其他行動禁用
    pendingPinnedCity: null,    // 待辦鐵釘所在城市
    pendingPinnedId: null,      // 待辦鐵釘事件 id（抵城即觸發，避免趕路跳過）
    mainlineTargetCity: null,   // 書信標記的下一站：只提示，不傳送、不推進
    hasOpenedYuanmingyuan: false,  // 開局首次自動觸發圓明園的旗標
    network: [],
    shownInterludes: [],        // 丙·已出現過的動態小事件 id（避免短期重複）
    suspenses: {},              // 支柱三·懸案狀態（id → 'resolved' | 'expired'）
    flags: {}                   // #4 決定印記（choice.setsFlag → 供條件選項 requires 使用）
  };
  // 四方阻力定義
  const RES_KEYS = ['favor', 'opinion', 'populace', 'funds'];
  const RES_META = {
    favor:    { name: '聖 眷', sub: '朝廷信任', low: '聖眷漸失 · 政策遭否、經費被挪' },
    opinion:  { name: '清 議', sub: '士林輿論', low: '清議洶洶 · 守舊派群起反撲' },
    populace: { name: '民 情', sub: '民間人心', low: '民怨四起 · 教案、阻工、抵制' },
    funds:    { name: '餉 源', sub: '財力',     low: '餉源將罄 · 工廠停擺、艦無煤' }
  };
  // 選項資源效果預覽小籤（把取捨下沉到機制層）
  function effectChips(effects) {
    return '';  // #3 數值全隱：行動不交代數值影響，讓玩家憑敘述思考
    /* eslint-disable no-unreachable */
    if (!effects) return '';
    const keys = RES_KEYS.filter((k) => effects[k]);
    if (!keys.length) return '';
    return '<span class="eff-chips">' + keys.map((k) => {
      const v = effects[k];
      const cls = v > 0 ? 'up' : 'down';
      const sign = v > 0 ? '＋' : '－';
      return '<span class="eff-chip ' + cls + '">' + RES_META[k].name + ' ' + sign + Math.abs(v) + '</span>';
    }).join('') + '</span>';
  }
  // 季節中文
  const SEASON_NAMES = ['春', '夏', '秋', '冬'];
  let currentRoute = null;
  let gameOver = false;   // 提前出局（罷官）旗標
  // 路線預設起點
  const ROUTE_START_CITY = {
    lihongzhang: 'shanghai',
    rongheng:    'hongkong',
    yixin:       'beijing',
    free:        'beijing'
  };

  // ---------- localStorage 存檔 ----------
  const SAVE_KEY = 'tansuo_save_v1';

  function saveGame() {
    if (!currentRoute) return;
    try {
      const data = {
        version: 1,
        route: currentRoute,
        currentYear: gameState.currentYear,
        currentSeason: gameState.currentSeason || 0,
        currentCity: gameState.currentCity,
        axes: { ...gameState.axes },
        completedEvents: [...gameState.completedEvents],
        unlockedEvents: [...(gameState.unlockedEvents || [])],
        facilityUsed: { ...(gameState.facilityUsed || {}) },
        evidence: [...collectedEvidence],
        evidenceLedger: [...(gameState.evidenceLedger || [])],
        completedEvidenceTasks: [...(gameState.completedEvidenceTasks || [])],
        challengeCorrect: gameState.challengeCorrect || 0,
        quizLog: [...(gameState.quizLog || [])],
        partsShown: [...(gameState.partsShown || [])],
        citiesVisited: [...(gameState.citiesVisited || [])],
        citiesIntroduced: [...(gameState.citiesIntroduced || [])],
        res: { ...gameState.res },
        setbackAt: { ...gameState.setbackAt },
        foundHotspots: [...foundHotspots],
        network: [...gameState.network],
        shownInterludes: [...(gameState.shownInterludes || [])],
        suspenses: { ...(gameState.suspenses || {}) },
        flags: { ...(gameState.flags || {}) },
        mainlineTargetCity: gameState.mainlineTargetCity || null,
        hasOpenedYuanmingyuan: !!gameState.hasOpenedYuanmingyuan,
        dismissed: !!gameState.dismissed,
        lastSaved: Date.now()
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) { /* ignore quota errors */ }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.version !== 1) return null;
      return data;
    } catch (e) { return null; }
  }

  function clearSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  }

  function applySave(save) {
    if (!save) return;
    currentRoute = save.route;
    gameState.currentYear = save.currentYear;
    gameState.currentSeason = save.currentSeason || 0;
    gameState.currentCity = save.currentCity;
    gameState.axes = { material: 0, system: 0, thought: 0, ...save.axes };
    gameState.completedEvents = new Set(save.completedEvents || []);
    gameState.unlockedEvents = new Set(save.unlockedEvents || []);
    gameState.facilityUsed = save.facilityUsed || {};
    collectedEvidence = new Set(save.evidence || save.foundHotspots || []);
    gameState.evidenceLedger = save.evidenceLedger || [];
    gameState.completedEvidenceTasks = new Set(save.completedEvidenceTasks || []);
    gameState.challengeCorrect = save.challengeCorrect || 0;
    gameState.quizLog = save.quizLog || [];
    gameState.partsShown = save.partsShown || [];
    gameState.citiesVisited = save.citiesVisited || [];
    gameState.citiesIntroduced = save.citiesIntroduced || [];
    gameState.res = { favor: 55, opinion: 50, populace: 50, funds: 45, ...(save.res || {}) };
    gameState.setbackAt = save.setbackAt || {};
    foundHotspots = new Set(save.foundHotspots || []);
    gameState.network = save.network || [];
    gameState.shownInterludes = save.shownInterludes || [];
    gameState.suspenses = save.suspenses || {};
    gameState.flags = save.flags || {};
    gameState.locked = false;
    gameState.pendingPinnedCity = null;
    gameState.pendingPinnedId = null;
    gameState.mainlineTargetCity = save.mainlineTargetCity || null;
    gameState.hasOpenedYuanmingyuan = !!save.hasOpenedYuanmingyuan;
    gameState.dismissed = !!save.dismissed;
    gameOver = !!save.dismissed;
  }

  function resetGameState(route) {
    currentRoute = route;
    gameState.currentYear = 1861;
    gameState.currentSeason = 0;
    gameState.currentCity = ROUTE_START_CITY[route] || 'shanghai';
    gameState.axes = { material: 0, system: 0, thought: 0 };
    gameState.completedEvents = new Set();
    gameState.unlockedEvents = new Set();
    gameState.facilityUsed = {};
    collectedEvidence = new Set();
    gameState.evidenceLedger = [];
    gameState.completedEvidenceTasks = new Set();
    gameState.challengeCorrect = 0;
    gameState.quizLog = [];
    gameState.partsShown = [];
    gameState.citiesVisited = [];
    gameState.citiesIntroduced = [];
    gameState.res = { favor: 55, opinion: 50, populace: 50, funds: 45 };
    gameState.setbackAt = {};
    foundHotspots = new Set();
    gameState.network = [];
    gameState.shownInterludes = [];
    gameState.suspenses = {};
    gameState.flags = {};
    _dangerWarned = {};
    gameState.locked = false;
    gameState.pendingPinnedCity = null;
    gameState.pendingPinnedId = null;
    gameState.mainlineTargetCity = null;
    gameState.hasOpenedYuanmingyuan = false;
    gameState.dismissed = false;
    gameOver = false;
    // #6 教學：每開新局重置一次，使導引在每場新旅程首次出現（？鈕仍可隨時重看）
    try { localStorage.removeItem(COACH_MAP_KEY); localStorage.removeItem(COACH_CITY_KEY); } catch (e) {}
    applyRoutePerk(route);
  }

  // 路線起始稟賦（玩法深度：選誰，起步即不同）
  const ROUTE_PERK = {
    lihongzhang: { axes: { material: 2 }, res: { favor: 5 },               note: '淮軍宿將·北洋實權' },
    rongheng:    { axes: { thought: 2 },  res: { opinion: 5, favor: -5 },   note: '留學先驅·體制之外' },
    yixin:       { axes: { system: 2 },   res: { favor: 8 },                note: '宗室中樞·總理衙門' },
    free:        { axes: { material: 1, system: 1, thought: 1 }, res: { favor: 2, opinion: 2, populace: 2, funds: 2 }, note: '自由書記·靈活穩健' }
  };
  function applyRoutePerk(route) {
    const p = ROUTE_PERK[route]; if (!p) return;
    if (p.axes) Object.keys(p.axes).forEach((k) => {
      const max = (gameState.axesMax && gameState.axesMax[k]) || 99;
      gameState.axes[k] = Math.max(0, Math.min(max, (gameState.axes[k] || 0) + p.axes[k]));
    });
    if (p.res) Object.keys(p.res).forEach((k) => {
      gameState.res[k] = Math.max(0, Math.min(100, (gameState.res[k] || 0) + p.res[k]));
    });
  }

  // 軸名中文映射
  const AXIS_NAMES = {
    material: '器物',
    system:   '制度',
    thought:  '思想'
  };

  // 鐵釘年份對應事件 ID（路線無關，所有路線共用）
  const PINNED_BY_YEAR = {
    1860: 'e_yuanmingyuan',
    1861: 'e_zongli_yamen',
    1862: 'e_tongwen_guan',
    1865: 'e_jiangnan_pinned',   // 江南製造（travel）
    1866: 'e_fuzhou_shipyard',   // 福州船政（travel）
    1870: 'e_tianjin_jiaoan',    // 天津教案（travel）— 乙A
    1872: 'e_students_depart',   // 留美學童（travel）
    1873: 'e_zhaoshangju',       // 輪船招商局（travel）— 乙A
    1874: 'e_fuzhou_taiwan',     // 日本侵台（travel）
    1875: 'e_haifang_chouyi',    // 海防大籌議（news）— 乙A
    1881: 'e_students_return',   // 留美撤回（travel）
    1882: 'e_zhibuju',           // 機器織布局（travel）— 乙A
    1884: 'e_fuzhou_mawei',      // 馬江海戰（travel）— 史實校正 1885→1884
    1888: 'e_beiyang_fleet',     // 北洋成軍（travel·威海衛）— 終局幕一
    1894: 'e_korea_donghak'  // 東學黨之亂（news·導火線）→ 自動接黃海甲午 → 馬關 → 結算
  };

  // 鐵釘年份順序（用於年份推進）
  const PINNED_YEARS = [1860, 1861, 1862, 1865, 1866, 1870, 1872, 1873, 1874, 1875, 1881, 1882, 1884, 1888, 1894, 1895];

  function initEventQaRoute() {
    let params;
    try { params = new URLSearchParams(window.location.search); }
    catch (e) { return; }
    const eventId = params.get('eventQa');
    if (!eventId || !EVENTS[eventId]) return;
    resetGameState('li');
    if (stage) {
      stage.classList.add('is-on-selection', 'is-on-map');
      document.getElementById('screen1')?.setAttribute('aria-hidden', 'true');
      document.getElementById('screen2')?.setAttribute('aria-hidden', 'true');
      document.getElementById('mapScreen')?.setAttribute('aria-hidden', 'false');
    }
    initMapUI('li');
    window.setTimeout(() => {
      gameState.completedEvents.delete(eventId);
      gameState.locked = false;
      gameState.pendingPinnedCity = null;
      gameState.pendingPinnedId = null;
      pendingChoiceEffects = null;
      currentEventId = eventId;
      actuallyOpenEvent(eventId, EVENTS[eventId]);
    }, 700);
  }

  initEventQaRoute();

  // ESC 統一處理（最上層 modal / panel > 城市場景）
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (closeTopManagedLayer()) return;
    const sc = document.getElementById('cityScene');
    if (sc && !sc.hasAttribute('hidden')) {
      closeCityScene();
    }
  });

  // ---------- 7. Reduced motion 直接進場 ----------
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (loader) loader.classList.add('is-out');
    if (stage) {
      stage.setAttribute('aria-hidden', 'false');
      stage.classList.add('is-in');
    }
    document.querySelectorAll('.reveal-item').forEach((el) => el.classList.add('is-revealed'));
  }

})();

/* ============================================================
   序章動態強化（獨立·只操作 DOM）：逐字筆墨浮現 + 滑鼠視差 + 餘燼上飄
   ============================================================ */
(function () {
  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    var intro = document.getElementById('screen1');
    var stage = document.getElementById('stage');
    if (!intro) return;
    var introHidden = function () { return !stage || stage.classList.contains('is-on-map') || stage.classList.contains('is-on-selection'); };

    // 1. 標題逐字筆墨浮現（作品名）
    var q = intro.querySelector('.game-title');
    if (q && !q.dataset.split) {
      q.dataset.split = '1';
      var txt = q.textContent, i = 0, frag = document.createDocumentFragment();
      Array.prototype.forEach.call(txt, function (c) {
        if (c === ' ' || c.charCodeAt(0) === 160) { frag.appendChild(document.createTextNode(' ')); return; }
        var s = document.createElement('span'); s.className = 'qch'; s.textContent = c;
        s.style.transitionDelay = (0.55 + i * 0.075) + 's'; frag.appendChild(s); i++;
      });
      q.textContent = ''; q.appendChild(frag); q.style.opacity = '1';
      var tries = 0;
      (function waitReveal() {
        var loader = document.getElementById('loader');
        var gone = !loader || loader.classList.contains('is-out') || loader.offsetParent === null;
        if (gone || tries++ > 60) {
          Array.prototype.forEach.call(q.querySelectorAll('.qch'), function (s) { s.classList.add('qch--in'); });
        } else { setTimeout(waitReveal, 150); }
      })();
    }

    // 2. 滑鼠視差（獸首隨游標微動，造景深）
    var sketch = intro.querySelector('.corner-sketch');
    if (sketch && window.matchMedia && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.addEventListener('mousemove', function (e) {
        if (introHidden()) return;
        var cx = e.clientX / window.innerWidth - 0.5, cy = e.clientY / window.innerHeight - 0.5;
        sketch.style.transform = 'translate(' + (cx * 20) + 'px,' + (cy * 16) + 'px)';
      }, { passive: true });
    }

    // 3. 餘燼上飄
    if (!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      setInterval(function () {
        if (introHidden()) return;
        var em = document.createElement('div'); em.className = 'intro-ember';
        em.style.left = (18 + Math.random() * 72) + '%';
        em.style.setProperty('--ex', (Math.random() * 70 - 35) + 'px');
        var dur = 6 + Math.random() * 5; em.style.animation = 'ember-rise ' + dur + 's linear forwards';
        var sz = 2 + Math.random() * 3; em.style.width = em.style.height = sz + 'px';
        intro.appendChild(em);
        setTimeout(function () { try { em.remove(); } catch (e) {} }, dur * 1000 + 300);
      }, 650);
    }
  });
})();
