# Screen 2 全幅旋轉木馬 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將 Screen 2「擇路」介面從現有 2×2 格局完全替換為全幅旋轉木馬，每次顯示一名人物（滿幅銅版畫底圖 + 左側文字疊加），淡入淡出切換，選定後底部滑出「啟程」確認欄。

**Architecture:** 純前端改造（vanilla JS + CSS），無新增依賴。HTML 替換 `.route-list-full` 為新的 `#s2-carousel` 容器；CSS 新增 `.s2c-*` 類別空間；JS 改寫導覽 / 選擇邏輯，保留現有 `gotoMap(route)` 啟程函數作為出口。舊的 `.route-card`、`.timeline-full`、`.selection-footer` 區塊及其 CSS 一併移除。

**Tech Stack:** HTML5、CSS3（grid、flex、transitions、transform、clip-path）、Vanilla JS（IIFE 內），無框架、無建構步驟。專案目前無自動化測試框架，每一任務之「驗證」步驟皆為「在瀏覽器中目視確認」。

---

## File Structure

需要修改的檔案（全部已存在）：

| 路徑 | 責任 |
|------|------|
| `index.html` | Screen 2 區塊內：移除 `.route-list-full`、`.timeline-full`、`.selection-footer`；新增 `#s2-carousel` skeleton + `#s2-confirm-bar` |
| `style-explore.css` | 移除 `.route-card`、`.rc-*`、`.timeline-full`、`.selection-footer`、`.selected-display`、`.begin-button` 等 ~600 行；新增 `.s2c-*` 類別 |
| `intro.js` | 移除 `routeCards`、`selectRoute`、`highlightEvents`、`clearHighlight`、`btnBegin` 處理；新增 carousel 渲染 / 導覽 / 選擇模組 |

不需修改：`gotoMap()`、`ROUTE_MAP_DATA`、`ROUTE_NAMES`、`ROUTE_CITY_UNLOCK`、Screen 3 全部。

---

## Task 1: 新增 carousel 資料模型（JS）

**Files:**
- Modify: `intro.js`（IIFE 內，在現有 `ROUTE_NAMES` 之後新增常數）

- [ ] **Step 1: 在 `intro.js` 中找到 `ROUTE_NAMES` 常數定義（約第 126 行），在它之後新增以下資料**

```javascript
  // ---------- Screen 2 旋轉木馬資料 ----------
  const CAROUSEL_DATA = [
    {
      key: 'lihongzhang',
      num: '壹',
      name: '李 鴻 章',
      en: 'Li Hongzhang · 1823–1901',
      bio: '直隸總督，洋務運動核心推手。淮軍出身，1870 接掌北洋三十年；主導江南製造、北洋成軍，亦親歷甲午挫敗與馬關之辱。',
      tags: ['器物派', '外交重臣'],
      difficulty: 2,
      meta: '約 30 分鐘 · 16 鐵釘事件 · 4 城市',
      portrait: 'assets/sketches/lihongzhang-portrait.webp',
      recommended: true
    },
    {
      key: 'yixin',
      num: '貳',
      name: '奕 　 訢',
      en: 'Prince Gong · 1833–1898',
      bio: '恭親王，1861 設總理衙門掌外交。你將立於朝廷風暴中央，見證每項改革如何被妥協、被抵抗、被緩慢推進。',
      tags: ['制度派', '總理衙門'],
      difficulty: 4,
      meta: '約 35 分鐘 · 政治深度 · 北京為主',
      portrait: 'assets/sketches/yixin-portrait.webp',
      recommended: false
    },
    {
      key: 'rongheng',
      num: '參',
      name: '容 　 閎',
      en: 'Yung Wing · 1828–1912',
      bio: '耶魯第一位中國畢業生。一生只做一件事：送三十個孩子渡洋。十年後，再親眼看著他們被召回。',
      tags: ['思想派', '留學夢碎'],
      difficulty: 3,
      meta: '約 25 分鐘 · 結局較早',
      portrait: 'assets/sketches/rongheng-portrait.webp',
      recommended: false
    },
    {
      key: 'free',
      num: '肆',
      name: '自 由 書 記',
      en: 'The Drifting Brush',
      bio: '不屬於任何人，因此得以看見所有人。你遊走於官邸、課室、衙門之間，見證這三十年——但沒有人為你負責。',
      tags: ['自由探索'],
      difficulty: 0,  // 0 = 不顯示星號
      meta: '時長不定 · 城市不限',
      portrait: 'assets/sketches/free-portrait.webp',
      recommended: false,
      isFree: true
    }
  ];
```

- [ ] **Step 2: 提交**

```bash
git add intro.js
git commit -m "feat(screen2): add carousel data model"
```

---

## Task 2: HTML 結構替換

**Files:**
- Modify: `index.html`（第 144–304 行）

- [ ] **Step 1: 在 `index.html` 中刪除現有 `<ul class="route-list-full">` 全段（第 144–239 行）、整個 `<section class="timeline-full ...">`（第 242–286 行）、以及 `<footer class="selection-footer">`（第 288–304 行）**

要刪除的範圍：從第 144 行的 `<ul class="route-list-full">` 開始，到第 304 行的 `</footer>` 結束。

- [ ] **Step 2: 在原 `<ul class="route-list-full">` 的位置（即 `.selection-title` `</h2>` 之後、`</section>` 之前）插入新的 carousel skeleton**

```html
        <!-- 旋轉木馬：JS 渲染 -->
        <div class="s2-carousel" id="s2Carousel" aria-roledescription="carousel">
          <button class="s2c-arrow s2c-arrow--prev" id="s2cPrev" type="button" aria-label="上一位">‹</button>
          <div class="s2c-stage" id="s2cStage"><!-- slides injected by JS --></div>
          <button class="s2c-arrow s2c-arrow--next" id="s2cNext" type="button" aria-label="下一位">›</button>
          <div class="s2c-dots" id="s2cDots" role="tablist"><!-- dots injected by JS --></div>
        </div>

      </section>

      <!-- 啟程確認欄（初始隱藏，選定路線後滑出） -->
      <div class="s2-confirm-bar" id="s2ConfirmBar" aria-hidden="true">
        <span class="s2cb-name" id="s2cbName">—</span>
        <button class="s2cb-start" id="s2cbStart" type="button">
          <span class="s2cb-start-label">啟&nbsp;程</span>
          <span class="s2cb-start-arrow">→</span>
        </button>
      </div>
```

注意：`</section>` 屬於原本的 `.selection-stage`，移動到 carousel 之後。`.s2-confirm-bar` 是 `#screen2` 的直接子節點（不在 `.selection-stage` 內），以便定位於畫面底部。

- [ ] **Step 3: 在瀏覽器打開 `index.html`，序章進入 Screen 2，確認頁面結構**

預期：標題「擇路而行」仍可見；下方為空白容器（尚未渲染）；底部無確認欄；無 console 錯誤（除了之後的 JS 找不到舊元素之外）。

- [ ] **Step 4: 提交**

```bash
git add index.html
git commit -m "feat(screen2): replace 2x2 grid markup with carousel skeleton"
```

---

## Task 3: JS 渲染 slides 與導覽邏輯

**Files:**
- Modify: `intro.js`（在現有 `routeCards` 邏輯處全面取代，約第 121–182 行）

- [ ] **Step 1: 在 `intro.js` 找到 `// ---------- 5. 路線 ↔ 時間軸 聯動 ----------` 段落，刪除整段（第 120 行到 `selectRoute` 函數結尾，約第 182 行止；包含 `routeCards`、`tlItems`、`ROUTE_NAMES` 之後到 `selectRoute` 函數結束的全部代碼）**

注意：`ROUTE_NAMES` 常數本身保留，因為 `btnBegin` 處理仍需要它（之後會替換）。

- [ ] **Step 2: 在 `CAROUSEL_DATA` 常數之後（即 Task 1 新增區塊之後）新增渲染與導覽邏輯**

```javascript
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

  function renderCarousel() {
    if (!s2Stage || !s2Dots) return;
    s2Stage.innerHTML = '';
    s2Dots.innerHTML  = '';
    CAROUSEL_DATA.forEach((c, i) => {
      // slide
      const slide = document.createElement('article');
      slide.className = 's2c-slide' + (i === 0 ? ' is-active' : '') + (c.isFree ? ' is-free' : '');
      slide.dataset.routeKey = c.key;

      const starsHtml = c.difficulty > 0
        ? `<span class="s2c-stars" aria-label="難度 ${c.difficulty}">${'★'.repeat(c.difficulty)}${'☆'.repeat(5 - c.difficulty)}</span>`
        : '';
      const recBadge = c.recommended
        ? `<span class="s2c-rec">✦ 首 次 推 薦</span>`
        : '';
      const tagsHtml = c.tags.map(t => `<span class="s2c-tag">${t}</span>`).join('');
      const portraitHtml = c.isFree
        ? `<div class="s2c-portrait s2c-portrait--blank"><span>？</span></div>`
        : `<img class="s2c-portrait" src="${c.portrait}" alt="" aria-hidden="true">`;

      slide.innerHTML = `
        <div class="s2c-portrait-wrap">${portraitHtml}</div>
        <div class="s2c-overlay"></div>
        <span class="s2c-bgnum" aria-hidden="true">${c.num}</span>
        <div class="s2c-text">
          ${recBadge}
          <span class="s2c-num">${c.num}</span>
          <h3 class="s2c-name">${c.name}</h3>
          <em class="s2c-en">${c.en}</em>
          <span class="s2c-line"></span>
          <p class="s2c-bio">${c.bio}</p>
          <div class="s2c-tags">${tagsHtml}${starsHtml}</div>
          <p class="s2c-meta">${c.meta}</p>
          <button class="s2c-cta" type="button" data-route="${c.key}">
            <span class="s2c-cta-label">擇 此 路 線</span>
            <span class="s2c-cta-arrow">→</span>
          </button>
        </div>
      `;
      s2Stage.appendChild(slide);

      // dot
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 's2c-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `跳至 ${c.name}`);
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
    slides[s2CurIdx]?.classList.remove('is-active');
    dots[s2CurIdx]?.classList.remove('is-active');
    slides[idx]?.classList.add('is-active');
    dots[idx]?.classList.add('is-active');
    s2CurIdx = idx;

    // 同步確認欄人物名（若已選定，名字隨當前幀變化代表「準備轉移選擇」？否——確認欄顯示「已選定」的人物名，不隨翻頁變）
    // 此處不更新 s2BarName；只在 selectRoute 時更新。

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
  }

  renderCarousel();
  s2Bind();
```

- [ ] **Step 3: 在瀏覽器重新整理，進入 Screen 2，按左右箭嘴與點點切換幀**

預期：四張 slide 渲染出 placeholder 結構（無樣式，但內容文字顯示）；箭嘴與點點可切換；console 無錯誤。

- [ ] **Step 4: 提交**

```bash
git add intro.js
git commit -m "feat(screen2): render carousel slides + nav logic (arrows/dots/keyboard/swipe)"
```

---

## Task 4: CSS 基礎佈局 — 容器、舞台、肖像、文字層

**Files:**
- Modify: `style-explore.css`（在原 `.route-card` 區塊之前新增；舊類別暫時保留，最後一個 task 才清理）

- [ ] **Step 1: 在 `style-explore.css` 中找到 `.route-card {` 行（約第 713 行），在其之前插入新的 carousel 樣式**

```css
/* ========== Screen 2 · 旋轉木馬 ========== */
.s2-carousel {
  position: relative;
  width: min(96vw, 1280px);
  margin: 0 auto;
  aspect-ratio: 16 / 9;
  max-height: 72vh;
  background: #0e0905;
  border: 1px solid var(--ink-dim, #3d2e14);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.55);
}

.s2c-stage {
  position: absolute;
  inset: 0;
}

.s2c-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.6s ease;
  display: block;
}
.s2c-slide.is-active {
  opacity: 1;
  pointer-events: auto;
  z-index: 2;
}

/* ── 肖像層 ── */
.s2c-portrait-wrap {
  position: absolute;
  right: 0;
  top: 0;
  width: 60%;
  height: 100%;
  overflow: hidden;
}
.s2c-portrait {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  display: block;
  filter: sepia(0.15) contrast(1.05);
}
.s2c-portrait--blank {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(201,169,110,0.10) 0%, rgba(100,30,30,0.08) 100%);
  border-left: 1px solid rgba(201,169,110,0.25);
  font-size: clamp(4rem, 10vw, 8rem);
  color: rgba(201,169,110,0.30);
  font-family: 'STKaiti', 'KaiTi', serif;
}

/* ── 文字層 ── */
.s2c-text {
  position: absolute;
  left: 5%;
  top: 50%;
  transform: translateY(-50%);
  width: 44%;
  max-width: 520px;
  z-index: 3;
  color: var(--ink-cream, #e8d5a3);
}
.s2c-num {
  display: block;
  font-size: 0.75rem;
  letter-spacing: 0.25em;
  color: var(--rouge, #cc3333);
  opacity: 0.7;
  margin-bottom: 4px;
}
.s2c-name {
  font-size: clamp(1.4rem, 2.8vw, 2.1rem);
  letter-spacing: 0.18em;
  color: var(--ink-cream, #e8d5a3);
  margin: 0 0 4px;
  font-weight: 500;
}
.s2c-en {
  display: block;
  font-size: 0.75rem;
  color: #8a7a5a;
  letter-spacing: 0.1em;
  font-style: italic;
  margin-bottom: 10px;
}
.s2c-line {
  display: block;
  width: 22px;
  height: 1px;
  background: var(--rouge, #cc3333);
  margin: 0 0 12px;
}
.s2c-bio {
  font-size: 0.92rem;
  line-height: 1.85;
  color: #a08a5a;
  margin: 0 0 12px;
  font-family: 'STSong', 'SimSun', serif;
}
.s2c-meta {
  font-size: 0.72rem;
  color: #6a5a3a;
  letter-spacing: 0.08em;
  margin: 6px 0 14px;
}
```

- [ ] **Step 2: 同檔案內，bump CSS 版本號**

在 `index.html` 中找到 `<link rel="stylesheet" href="style-explore.css?v=19">`（搜尋 `style-explore.css?v=`），將 `v=19` 改為 `v=20`。

- [ ] **Step 3: 重整瀏覽器，進入 Screen 2**

預期：第一張 slide 顯示李鴻章銅版畫於右側（若圖片存在），左側顯示「壹」、「李 鴻 章」、英文、朱砂線、傳記、元資訊。其他 slide 隱藏。

- [ ] **Step 4: 提交**

```bash
git add style-explore.css index.html
git commit -m "feat(screen2): carousel base layout (stage, portrait, text layer)"
```

---

## Task 5: CSS 視覺潤飾 — 漸層、大字背景、推薦徽章、標籤、CTA

**Files:**
- Modify: `style-explore.css`（接續 Task 4 新增區塊）

- [ ] **Step 1: 在 Task 4 新增的 `.s2c-meta` 規則之後，新增以下樣式**

```css
/* ── 暗化漸層（壓過肖像，讓左側文字清晰） ── */
.s2c-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    rgba(8, 5, 3, 0.95) 0%,
    rgba(8, 5, 3, 0.85) 30%,
    rgba(8, 5, 3, 0.40) 55%,
    rgba(8, 5, 3, 0.08) 75%,
    transparent 100%
  );
}

/* ── 大漢字背景數字（右下） ── */
.s2c-bgnum {
  position: absolute;
  right: 4%;
  bottom: -6%;
  font-size: clamp(7rem, 18vw, 14rem);
  font-family: 'STKaiti', 'KaiTi', serif;
  color: rgba(201, 169, 110, 0.045);
  font-weight: bold;
  line-height: 0.85;
  pointer-events: none;
  z-index: 2;
  user-select: none;
}

/* ── 首次推薦徽章 ── */
.s2c-rec {
  display: inline-block;
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  color: var(--rouge, #cc3333);
  margin-bottom: 8px;
  padding: 2px 0;
  border-bottom: 1px solid rgba(204, 51, 51, 0.35);
}

/* ── 標籤群 + 難度星 ── */
.s2c-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 8px;
}
.s2c-tag {
  font-size: 0.7rem;
  padding: 2px 8px;
  background: rgba(201, 169, 110, 0.08);
  border: 1px solid rgba(201, 169, 110, 0.28);
  color: #b09060;
  letter-spacing: 0.1em;
}
.s2c-stars {
  font-size: 0.78rem;
  color: var(--rouge, #cc3333);
  letter-spacing: 0.12em;
  margin-left: 2px;
}

/* ── CTA 按鈕（擇此路線） ── */
.s2c-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background: transparent;
  border: 1px solid var(--rouge, #cc3333);
  color: var(--rouge, #cc3333);
  font-family: inherit;
  font-size: 0.85rem;
  letter-spacing: 0.18em;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.s2c-cta:hover {
  background: rgba(204, 51, 51, 0.12);
}
.s2c-cta-arrow {
  font-size: 1rem;
}
```

- [ ] **Step 2: 重整瀏覽器，進入 Screen 2**

預期：左側文字清晰可讀（暗色漸層生效）；右下出現淡淡大「壹」字；李鴻章 slide 上方有「✦ 首 次 推 薦」朱砂徽章；標籤膠囊、★★☆☆☆ 與「擇此路線 →」按鈕齊全。

- [ ] **Step 3: 提交**

```bash
git add style-explore.css
git commit -m "feat(screen2): carousel visual polish (gradient, bg num, badges, tags, CTA)"
```

---

## Task 6: CSS 導覽控制 — 箭嘴與點點

**Files:**
- Modify: `style-explore.css`（接續 Task 5）

- [ ] **Step 1: 在 Task 5 新增的 `.s2c-cta-arrow` 規則之後，新增以下樣式**

```css
/* ── 左右箭嘴 ── */
.s2c-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(14, 9, 5, 0.55);
  border: 1px solid rgba(201, 169, 110, 0.30);
  color: var(--ink-cream, #e8d5a3);
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-family: serif;
}
.s2c-arrow:hover {
  background: rgba(201, 169, 110, 0.18);
  border-color: var(--ink-gold, #c9a96e);
  transform: translateY(-50%) scale(1.06);
}
.s2c-arrow--prev { left: 14px; }
.s2c-arrow--next { right: 14px; }

/* ── 點點指示器 ── */
.s2c-dots {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}
.s2c-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(201, 169, 110, 0.25);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: background 0.25s, transform 0.15s;
}
.s2c-dot:hover { transform: scale(1.25); }
.s2c-dot.is-active {
  background: var(--rouge, #cc3333);
}
```

- [ ] **Step 2: 重整瀏覽器，進入 Screen 2，按左右箭嘴**

預期：箭嘴出現於 carousel 左右兩側中間，hover 時放大且邊框金色；底部四點，當前 active 為朱砂色；點點點擊可跳轉；淡入淡出動畫流暢。

- [ ] **Step 3: 提交**

```bash
git add style-explore.css
git commit -m "feat(screen2): arrows + dot indicators with hover states"
```

---

## Task 7: 選擇狀態 + 底部啟程確認欄（CSS）

**Files:**
- Modify: `style-explore.css`（接續 Task 6）

- [ ] **Step 1: 在 Task 6 新增的 `.s2c-dot.is-active` 規則之後，新增以下樣式**

```css
/* ── CTA 已選定狀態 ── */
.s2c-cta.is-chosen {
  background: var(--rouge, #cc3333);
  color: #fff;
  cursor: default;
  pointer-events: none;
}
.s2c-cta.is-chosen .s2c-cta-label::before {
  content: '✦ ';
}
.s2c-cta.is-chosen .s2c-cta-label::after {
  content: ' 定';
}
.s2c-cta.is-chosen .s2c-cta-arrow {
  display: none;
}

/* ── 底部啟程確認欄 ── */
.s2-confirm-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 60px;
  background: rgba(8, 5, 3, 0.96);
  border-top: 1px solid var(--rouge, #cc3333);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
}
.s2-confirm-bar.is-visible {
  transform: translateY(0);
}
.s2cb-name {
  font-size: 0.95rem;
  letter-spacing: 0.18em;
  color: var(--ink-cream, #e8d5a3);
  font-family: 'STKaiti', 'KaiTi', serif;
}
.s2cb-start {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 28px;
  background: var(--rouge, #cc3333);
  border: none;
  color: #fff;
  font-family: inherit;
  font-size: 0.95rem;
  letter-spacing: 0.22em;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.s2cb-start:hover {
  background: #e04444;
  transform: scale(1.03);
}
.s2cb-start-arrow {
  font-size: 1.1rem;
}
```

- [ ] **Step 2: 重整瀏覽器，目視確認**

預期：頁面結構與 Task 6 相同（確認欄尚未觸發顯示）；無視覺問題。

- [ ] **Step 3: 提交**

```bash
git add style-explore.css
git commit -m "feat(screen2): CTA chosen state + bottom confirm bar styles"
```

---

## Task 8: JS 選擇邏輯 + 啟程整合

**Files:**
- Modify: `intro.js`（在 Task 3 新增的 `s2Bind()` 之後 / 之內擴充）

- [ ] **Step 1: 在 `intro.js` 中找到 Task 3 新增的 `s2Bind` 函數，在它的末尾（最後一個 `s2Stage?.addEventListener('touchend', ...)` 之後）新增以下事件綁定**

```javascript
    // 選擇路線（CTA 點擊）
    s2Stage?.addEventListener('click', (e) => {
      const btn = e.target.closest('.s2c-cta');
      if (!btn) return;
      const route = btn.dataset.route;
      s2Choose(route);
    });
    // 啟程
    s2BarBtn?.addEventListener('click', () => {
      if (!s2Chosen) return;
      s2BarBtn.disabled = true;
      gotoMap(s2Chosen);
    });
```

- [ ] **Step 2: 在 `s2Bind` 函數之後（仍在 IIFE 內）新增 `s2Choose` 函數**

```javascript
  function s2Choose(routeKey) {
    s2Chosen = routeKey;
    // 更新所有 CTA 狀態：當前選定的為 is-chosen，其他恢復
    s2Stage?.querySelectorAll('.s2c-cta').forEach((b) => {
      b.classList.toggle('is-chosen', b.dataset.route === routeKey);
    });
    // 更新底部欄人物名 + 顯示
    const data = CAROUSEL_DATA.find((c) => c.key === routeKey);
    if (data && s2BarName) {
      s2BarName.textContent = `${data.name.replace(/\s+/g, '')} · 洋務三十年`;
    }
    if (s2Bar) {
      s2Bar.classList.add('is-visible');
      s2Bar.setAttribute('aria-hidden', 'false');
    }
  }
```

- [ ] **Step 3: 移除舊的 `btnBegin` 處理邏輯**

在 `intro.js` 中找到「`// ---------- 6. 啟程 → 入職過場 → 九州地圖 ----------`」段落結尾處的 `btnBegin && btnBegin.addEventListener('click', () => {...})` 區塊（約第 282–293 行），整段刪除（已被 Task 8 Step 1 的 `s2BarBtn` 處理取代）。

`gotoMap` 函數本身保留不動。

- [ ] **Step 4: 重整瀏覽器，在 Screen 2 點擊「擇此路線 →」**

預期：按鈕變為朱砂填色「✦ 已 擇 定」；底部出現朱砂分隔線的黑色確認欄，左顯「李鴻章 · 洋務三十年」，右為「啟 程 →」紅按鈕；切換到另一幀後按該幀的 CTA，選擇轉移、底部名字更新。點啟程進入 Screen 3。

- [ ] **Step 5: 提交**

```bash
git add intro.js
git commit -m "feat(screen2): selection state + bottom bar + gotoMap integration"
```

---

## Task 9: 響應式調整

**Files:**
- Modify: `style-explore.css`（接續 Task 7 新增區塊）

- [ ] **Step 1: 在 Task 7 新增的 `.s2cb-start-arrow` 規則之後，新增以下 media queries**

```css
/* ── 響應式：平板 ── */
@media (max-width: 1024px) {
  .s2c-text {
    width: 48%;
    left: 4%;
  }
  .s2c-portrait-wrap { width: 56%; }
  .s2c-bio { font-size: 0.85rem; }
}

/* ── 響應式：手機 ── */
@media (max-width: 768px) {
  .s2-carousel {
    aspect-ratio: 3 / 4;
    max-height: 78vh;
    width: 96vw;
  }
  .s2c-portrait-wrap {
    width: 100%;
    height: 50%;
    top: 0;
    bottom: auto;
  }
  .s2c-overlay {
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(8, 5, 3, 0.10) 35%,
      rgba(8, 5, 3, 0.85) 55%,
      rgba(8, 5, 3, 0.97) 100%
    );
  }
  .s2c-text {
    width: 90%;
    left: 5%;
    top: auto;
    bottom: 6%;
    transform: none;
  }
  .s2c-name { font-size: 1.4rem; }
  .s2c-bio { font-size: 0.8rem; line-height: 1.7; }
  .s2c-bgnum { font-size: 6rem; right: 3%; bottom: -4%; }
  .s2-confirm-bar {
    padding: 0 16px;
    height: 56px;
  }
  .s2cb-name { font-size: 0.8rem; letter-spacing: 0.1em; }
  .s2cb-start { padding: 8px 18px; font-size: 0.85rem; letter-spacing: 0.15em; }
}

@media (max-width: 480px) {
  .s2c-arrow {
    width: 38px;
    height: 38px;
    font-size: 1.3rem;
  }
  .s2c-arrow--prev { left: 6px; }
  .s2c-arrow--next { right: 6px; }
  .s2c-dot { width: 10px; height: 10px; }
}
```

- [ ] **Step 2: 在瀏覽器 DevTools 切換至 iPhone / iPad 尺寸測試**

預期：
- 桌面（>1024px）：文字 44%、肖像 60%，正常顯示
- 平板（768–1024px）：文字 48%、肖像 56%，文字微縮
- 手機（<768px）：上下分區，肖像上半、文字下半（漸層改為垂直）
- 小手機（<480px）：箭嘴與點點放大，符合觸控

- [ ] **Step 3: 提交**

```bash
git add style-explore.css
git commit -m "feat(screen2): responsive breakpoints (tablet/mobile/small mobile)"
```

---

## Task 10: 清理舊代碼

**Files:**
- Modify: `style-explore.css`（刪除舊 `.route-card`、`.rc-*`、`.timeline-full`、`.selection-footer`、`.selected-display`、`.begin-button` 相關規則）
- Modify: `intro.js`（移除舊 `ROUTE_NAMES` 中已不用的部分？保留——確認 `gotoMap` 內未使用）
- Modify: `index.html`（bump JS 版本號）

- [ ] **Step 1: 確認 `intro.js` 中沒有任何殘留引用舊 DOM 的代碼**

執行：
```bash
grep -n "route-card\|rc-\|routeCards\|tlItems\|selectedDisplay\|btnBegin\|highlightEvents\|clearHighlight" "/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/intro.js"
```

預期：無任何匹配（若有遺漏，視情況刪除或修正）。

- [ ] **Step 2: 在 `style-explore.css` 中刪除以下舊規則整段**

刪除範圍：從 `.route-card {`（約第 713 行）開始，到 `.rc-confirm-quote::after { ... }`（約第 1210 行附近）結束的所有 `.route-card`、`.rc-*` 相關規則。

同時刪除：
- `.route-list-full { ... }`（若存在）
- `.timeline-full { ... }`、`.tl-label`、`.timeline-line`、`.timeline-events-full`、`.timeline-events-full li`、`.t-dot`、`.t-year`、`.t-event`、`:has(li.is-related)` 相關規則
- `.selection-footer { ... }`、`.selected-display`、`.sd-label`、`.sd-en`、`.begin-button`、`.begin-button-wrap`、`.open-rings`、`.ring.r1`、`.ring.r2`、`.open-hint` 相關規則

使用 `grep -n` 確認刪除完整，例如：
```bash
grep -n "\.route-card\|\.rc-\|\.timeline-full\|\.selection-footer\|\.selected-display\|\.begin-button\|\.t-dot\|\.t-year\|\.t-event" "/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/style-explore.css"
```

預期：所有匹配皆已刪除。

- [ ] **Step 3: 在 `index.html` 中 bump JS 版本號**

搜尋 `intro.js?v=`，將 `v=16`（或當前版本）改為 `v=17`。

- [ ] **Step 4: 重整瀏覽器，完整跑一次流程**

預期：
1. 序章 → 點「開始」進入 Screen 2 — 旋轉木馬正常顯示
2. 箭嘴 / 點點 / 鍵盤左右 / 手機 swipe 切換流暢
3. 點「擇此路線 →」→ 按鈕變朱砂「✦ 已擇定」，底部欄滑出
4. 切換到另一幀再選 → 選擇轉移，底部名字更新
5. 點「啟程 →」→ 入職過場（5.5s）→ 地圖出現
6. 任何路線進入 Screen 3 都正常，事件流程不受影響
7. Console 完全無錯誤
8. DevTools 切手機尺寸：上下分區佈局正確

- [ ] **Step 5: 提交**

```bash
git add style-explore.css index.html intro.js
git commit -m "chore(screen2): remove obsolete route-card/timeline/footer styles + bump JS version"
```

---

## Self-Review 結果

**Spec coverage：**
- ✅ 全幅旋轉木馬替換 2×2 → Task 2/3
- ✅ 滿幅底圖 + 文字疊加佈局 → Task 4/5
- ✅ 淡入淡出 0.6s ease → Task 4（`.s2c-slide` transition）
- ✅ 大漢字背景數字 → Task 5（`.s2c-bgnum`）
- ✅ 首次推薦徽章 → Task 5（`.s2c-rec`）
- ✅ 朱砂橫線、標籤、難度星、CTA → Task 5
- ✅ 左右箭嘴、dots、鍵盤、swipe → Task 3 + Task 6
- ✅ 選擇狀態機（已擇 / 換選） → Task 7 + Task 8
- ✅ 底部啟程確認欄滑出 → Task 7 + Task 8
- ✅ 自由書記特殊處理（無星 + 空白肖像） → Task 1（`isFree`、`difficulty: 0`） + Task 3（`is-free` class + blank portrait）+ Task 4（`.s2c-portrait--blank`）
- ✅ 與 `gotoMap(route)` 接口 → Task 8 Step 1
- ✅ 響應式 → Task 9
- ✅ 清理舊代碼 → Task 10

**Placeholder scan：** 無 TBD / TODO，每段 CSS / JS 皆完整可貼上即用。

**Type consistency：** `s2Chosen` / `s2CurIdx` / `s2Busy` 命名一致；DOM id 一致（`s2cStage` / `s2cDots` / `s2cPrev` / `s2cNext` / `s2ConfirmBar` / `s2cbName` / `s2cbStart`）；CSS 類別 `.s2c-*` 命名空間一致。

無發現問題。
