# Beijing Lightweight Evidence Tasks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Beijing as the first prototype city where evidence is earned through lightweight interactions, facilities unlock through historical events, and each event can carry an attractive image.

**Architecture:** Keep the current vanilla HTML/CSS/JS structure. Add one reusable evidence-task modal, a small `EVIDENCE_TASKS` data map in `intro.js`, and minimal state additions for completed tasks and event-unlocked facilities. Beijing will be the only city converted in this pass; Shanghai/Tianjin/Fuzhou remain compatible with the old hotspot flow.

**Tech Stack:** Vanilla HTML, CSS, JavaScript IIFE, localStorage save data, static WebP assets, Python static server.

---

## File Structure

- Modify: `index.html`
  - Add one reusable `#evidenceTaskModal`.
  - Bump `style-explore.css` and `intro.js` cache versions after implementation.
- Modify: `style-explore.css`
  - Add styles for the lightweight evidence task modal.
  - Add styles for event images and locked facilities.
- Modify: `intro.js`
  - Add `EVIDENCE_TASKS` data for Beijing.
  - Add task state: `completedEvidenceTasks`.
  - Modify hotspot flow so Beijing hotspots open tasks before evidence is collected.
  - Modify evidence ledger to store `evidenceText`.
  - Modify facility locking to support `unlockEventId`.
  - Add optional event image rendering.
- Create directory if missing: `assets/events/`
  - User will later place images such as `assets/events/e_bj_envoy.webp`.
- Optional later: `assets/actions/`
  - Not required for this first prototype; event-level images come first.

---

## Task 1: Add Persistent Task State And Beijing Task Data

**Files:**
- Modify: `intro.js`

- [ ] **Step 1: Add `completedEvidenceTasks` to game state**

In `gameState`, after `evidenceLedger: [],` add:

```js
    completedEvidenceTasks: new Set(), // 已完成的輕量證據任務（key: city:hotspot）
```

- [ ] **Step 2: Persist the new state**

In `saveGame()`, after `evidenceLedger: [...(gameState.evidenceLedger || [])],` add:

```js
        completedEvidenceTasks: [...(gameState.completedEvidenceTasks || [])],
```

In `applySave(save)`, after `gameState.evidenceLedger = save.evidenceLedger || [];` add:

```js
    gameState.completedEvidenceTasks = new Set(save.completedEvidenceTasks || []);
```

In `resetGameState(route)`, after `gameState.evidenceLedger = [];` add:

```js
    gameState.completedEvidenceTasks = new Set();
```

- [ ] **Step 3: Add helper functions**

Place after `function evidenceKey(cityKey, hotspotId) { ... }`:

```js
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
```

- [ ] **Step 4: Add Beijing task data**

Place after `CITY_SCENES` and before `let foundHotspots = new Set();`:

```js
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
      title: '跟 蹤 公 使 動 線',
      instruction: '依次點擊使節進入京師外交秩序的三個位置。',
      prompt: '黑禮服的外國使節捧著國書，穿過京師街道。',
      evidenceText: '《天津條約》《北京條約》准許外國公使常駐北京，直接衝擊天朝體制，促成總理衙門設立。',
      dse: '不平等條約 · 公使駐京 · 總理衙門背景',
      success: '你跟到衙門門前，終於明白：不是洋人路過北京，而是北京被迫容納近代外交。',
      steps: [
        { id: 'envoy-a', text: '使 節 隊 伍' },
        { id: 'envoy-b', text: '東 堂 子 胡 同' },
        { id: 'envoy-c', text: '總 理 衙 門 門 前' }
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
    }
  };
```

- [ ] **Step 5: Verify syntax**

Run:

```bash
node --check intro.js
```

Expected: no output and exit code `0`.

---

## Task 2: Add The Evidence Task Modal Shell

**Files:**
- Modify: `index.html`
- Modify: `style-explore.css`

- [ ] **Step 1: Add modal HTML**

In `index.html`, place this after `#hotspotModal` and before the end of `screen2`:

```html
      <!-- 輕量證據任務 modal -->
      <div class="evidence-task-modal" id="evidenceTaskModal" hidden>
        <div class="et-card" role="dialog" aria-labelledby="etTitle">
          <button class="et-close" type="button" id="etClose" aria-label="關閉">✕</button>
          <span class="et-kicker">證 據 任 務</span>
          <h3 class="et-title" id="etTitle">任務名稱</h3>
          <p class="et-prompt" id="etPrompt">任務描述</p>
          <p class="et-instruction" id="etInstruction">操作提示</p>
          <div class="et-body" id="etBody"></div>
          <div class="et-feedback" id="etFeedback" aria-live="polite"></div>
          <button class="et-submit" type="button" id="etSubmit" disabled>收 錄 證 據 →</button>
        </div>
      </div>
```

- [ ] **Step 2: Add modal CSS**

Append to `style-explore.css` near the hotspot modal styles:

```css
.evidence-task-modal {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  background: rgba(15, 12, 9, 0.58);
  backdrop-filter: blur(8px);
}
.evidence-task-modal[hidden] {
  display: none;
}
.et-card {
  width: min(760px, calc(100vw - 44px));
  max-height: min(760px, calc(100vh - 44px));
  overflow: auto;
  background: rgba(238, 229, 207, 0.96);
  color: var(--text-base);
  border: 1px solid rgba(48, 65, 67, 0.22);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.32);
  padding: 30px;
  position: relative;
}
.et-close {
  position: absolute;
  top: 12px;
  right: 12px;
  border: 0;
  background: transparent;
  color: var(--text-soft);
  cursor: pointer;
}
.et-kicker {
  display: block;
  font-size: 11px;
  letter-spacing: 0.28em;
  color: var(--vermillion);
  margin-bottom: 12px;
}
.et-title {
  font-family: var(--font-zh);
  font-size: 28px;
  letter-spacing: 0.24em;
  font-weight: 400;
  margin: 0 0 16px;
}
.et-prompt,
.et-instruction,
.et-feedback {
  font-size: 15px;
  line-height: 1.9;
  letter-spacing: 0.08em;
  color: var(--text-soft);
}
.et-body {
  display: grid;
  gap: 12px;
  margin: 22px 0;
}
.et-option,
.et-seq-step,
.et-classify-item,
.et-classify-target {
  border: 1px solid rgba(48, 65, 67, 0.18);
  background: rgba(255, 252, 243, 0.72);
  color: var(--text-base);
  font-family: var(--font-zh);
  font-size: 15px;
  letter-spacing: 0.08em;
  line-height: 1.7;
  padding: 12px 14px;
}
.et-option,
.et-seq-step,
.et-classify-item {
  cursor: pointer;
}
.et-option.is-selected,
.et-seq-step.is-done,
.et-classify-item.is-selected {
  border-color: rgba(166, 58, 42, 0.7);
  color: var(--vermillion);
  background: rgba(166, 58, 42, 0.08);
}
.et-classify-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.et-classify-items {
  display: grid;
  gap: 8px;
}
.et-classify-target {
  min-height: 96px;
}
.et-submit {
  border: 1px solid var(--vermillion);
  background: transparent;
  color: var(--vermillion);
  font-family: var(--font-zh);
  font-size: 14px;
  letter-spacing: 0.24em;
  padding: 12px 18px;
  cursor: pointer;
}
.et-submit:disabled {
  opacity: 0.38;
  cursor: default;
}
```

- [ ] **Step 3: Bump cache version**

In `index.html`, update:

```html
<link rel="stylesheet" href="style-explore.css?v=61">
<script src="intro.js?v=53"></script>
```

If later tasks edit CSS/JS again in the same implementation session, keep only the final cache version bump.

---

## Task 3: Implement The Reusable Evidence Task Flow

**Files:**
- Modify: `intro.js`

- [ ] **Step 1: Add task runtime state**

Near `let currentEventId = null;`, add:

```js
  let currentEvidenceTask = null;
  let currentEvidenceHotspot = null;
  let currentEvidenceButton = null;
  let taskRuntime = null;
```

- [ ] **Step 2: Add task lookup and opening**

Place before `openHotspot(hs, btn)`:

```js
  function getEvidenceTask(cityKey, hotspotId) {
    return EVIDENCE_TASKS[taskKey(cityKey, hotspotId)] || null;
  }

  function openEvidenceTask(cityKey, hs, btn) {
    const task = getEvidenceTask(cityKey, hs.id);
    if (!task) return false;
    currentEvidenceTask = task;
    currentEvidenceHotspot = hs;
    currentEvidenceButton = btn;
    taskRuntime = { selections: {}, selected: null, sequenceIndex: 0 };

    const modal = document.getElementById('evidenceTaskModal');
    if (!modal) return false;
    const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    setText('etTitle', task.title);
    setText('etPrompt', task.prompt);
    setText('etInstruction', task.instruction);
    setText('etFeedback', '');
    const submit = document.getElementById('etSubmit');
    if (submit) {
      submit.disabled = true;
      submit.onclick = completeEvidenceTask;
    }
    renderEvidenceTaskBody(task);
    modal.removeAttribute('hidden');
    return true;
  }
```

- [ ] **Step 3: Add renderers for the three task types**

Place after `openEvidenceTask(...)`:

```js
  function renderEvidenceTaskBody(task) {
    const body = document.getElementById('etBody');
    if (!body) return;
    body.innerHTML = '';
    if (task.type === 'sequence') renderSequenceTask(body, task);
    if (task.type === 'pick') renderPickTask(body, task);
    if (task.type === 'classify') renderClassifyTask(body, task);
  }

  function setTaskSubmitReady(ready, message) {
    const submit = document.getElementById('etSubmit');
    const feedback = document.getElementById('etFeedback');
    if (submit) submit.disabled = !ready;
    if (feedback) feedback.textContent = message || '';
  }

  function renderSequenceTask(body, task) {
    task.steps.forEach((step, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'et-seq-step';
      btn.textContent = (idx + 1) + ' · ' + step.text;
      btn.addEventListener('click', () => {
        if (idx !== taskRuntime.sequenceIndex) {
          setTaskSubmitReady(false, '先找前一個位置。');
          return;
        }
        btn.classList.add('is-done');
        taskRuntime.sequenceIndex += 1;
        const done = taskRuntime.sequenceIndex >= task.steps.length;
        setTaskSubmitReady(done, done ? task.success : '很好，繼續跟下去。');
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

    task.items.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'et-classify-item';
      btn.textContent = item.text;
      btn.addEventListener('click', () => {
        itemsWrap.querySelectorAll('.et-classify-item').forEach((node) => node.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        selected.itemId = item.id;
      });
      itemsWrap.appendChild(btn);
    });

    task.groups.forEach((group) => {
      const target = document.createElement('button');
      target.type = 'button';
      target.className = 'et-classify-target';
      target.textContent = group.label;
      target.addEventListener('click', () => {
        if (!selected.itemId) {
          setTaskSubmitReady(false, '先選一句話，再放入觀念。');
          return;
        }
        const item = task.items.find((entry) => entry.id === selected.itemId);
        taskRuntime.selections[item.id] = group.id;
        target.textContent = group.label + '：' + item.text;
        selected.itemId = null;
        itemsWrap.querySelectorAll('.et-classify-item').forEach((node) => node.classList.remove('is-selected'));
        const done = task.items.every((entry) => taskRuntime.selections[entry.id] === entry.group);
        const allPlaced = task.items.every((entry) => taskRuntime.selections[entry.id]);
        setTaskSubmitReady(done, done ? task.success : (allPlaced ? '有一句放錯了，試着重新判斷。' : '已放入，繼續。'));
      });
      grid.appendChild(target);
    });

    body.appendChild(itemsWrap);
    body.appendChild(grid);
  }
```

- [ ] **Step 4: Add task completion**

Place after task renderers:

```js
  function completeEvidenceTask() {
    const cityKey = gameState.currentCity;
    const hs = currentEvidenceHotspot;
    const btn = currentEvidenceButton;
    const task = currentEvidenceTask;
    const modal = document.getElementById('evidenceTaskModal');
    if (!cityKey || !hs || !task) return;

    markEvidenceTaskDone(cityKey, hs.id);
    collectEvidence(cityKey, hs, task);
    if (btn) btn.classList.add('is-found');
    const count = document.getElementById('exploreCount');
    if (count) count.textContent = String(document.querySelectorAll('#cityHotspots .hotspot.is-found').length);

    if (gameState.axes[hs.axis] !== undefined) {
      gameState.axes[hs.axis] = Math.min(gameState.axesMax[hs.axis], gameState.axes[hs.axis] + 1);
      refreshAxes();
    }
    if (hs.type === 'clue' && hs.unlocks) {
      gameState.unlockedEvents = gameState.unlockedEvents || new Set();
      const wasUnlocked = gameState.unlockedEvents.has(hs.unlocks);
      gameState.unlockedEvents.add(hs.unlocks);
      if (!wasUnlocked) markRecentlyUnlocked(hs.unlocks);
    }

    if (modal) modal.setAttribute('hidden', '');
    currentEvidenceTask = null;
    currentEvidenceHotspot = null;
    currentEvidenceButton = null;
    taskRuntime = null;
    renderJournalEvidence();
    refreshActionList();
    saveGame();
    showEvidenceToast(task.evidenceText || hs.name);
  }
```

- [ ] **Step 5: Wire close button**

In the existing close-button setup area, or near other listeners, add:

```js
  const etClose = document.getElementById('etClose');
  if (etClose) {
    etClose.addEventListener('click', () => {
      const modal = document.getElementById('evidenceTaskModal');
      if (modal) modal.setAttribute('hidden', '');
    });
  }
```

- [ ] **Step 6: Verify syntax**

Run:

```bash
node --check intro.js
```

Expected: no output and exit code `0`.

---

## Task 4: Route Beijing Hotspots Through Tasks Before Evidence Is Collected

**Files:**
- Modify: `intro.js`

- [ ] **Step 1: Modify `collectEvidence` signature**

Change:

```js
  function collectEvidence(cityKey, hs) {
```

to:

```js
  function collectEvidence(cityKey, hs, task) {
```

Inside `gameState.evidenceLedger.push({ ... })`, add:

```js
      evidenceText: task?.evidenceText || hs.evidenceText || hs.desc,
      dse: task?.dse || null,
      taskType: task?.type || null,
```

- [ ] **Step 2: Update `renderJournalEvidence()` to show evidence text**

In the returned HTML for each `.jv-item`, after `jv-task`, add:

```js
        '<span class="jv-dse">' + escapeHTML(e.evidenceText || ('DSE · ' + dse)) + '</span>' +
        '<span class="jv-dse">' + escapeHTML(e.dse ? ('DSE · ' + e.dse) : ('DSE · ' + dse)) + '</span>' +
```

Remove the old single `jv-dse` line to avoid duplicate DSE output.

- [ ] **Step 3: Modify `openHotspot()` first-discovery block**

At the start of `openHotspot(hs, btn)`, after `const wasFound = hasFoundHotspot(cityKey, hs.id);`, add:

```js
    const task = getEvidenceTask(cityKey, hs.id);
    if (!wasFound && task && !isEvidenceTaskDone(cityKey, hs.id)) {
      hm.setAttribute('hidden', '');
      openEvidenceTask(cityKey, hs, btn);
      return;
    }
```

Then keep the existing direct `collectEvidence(cityKey, hs);` path for non-Beijing hotspots and old content.

- [ ] **Step 4: Verify fallback behavior**

Manual browser check:

1. Start or keep server:

```bash
python3 -m http.server 8765
```

2. Open:

```text
http://127.0.0.1:8765/index.html
```

3. Enter Beijing route or force route through existing UI.
4. Click `外國使節`.

Expected:

- The evidence task modal opens.
- Evidence is not recorded before completing the sequence.
- After completing sequence and clicking `收錄證據`, the handscroll evidence list shows the evidence sentence.

---

## Task 5: Lock Beijing Facilities By Historical Event Completion

**Files:**
- Modify: `intro.js`
- Modify: `style-explore.css`

- [ ] **Step 1: Add unlock event metadata**

In `CITY_SCENES.beijing.facilities`, update:

```js
        { id: 'bj-zongli', name: '總理衙門', en: 'Zongli Yamen', corner: 'tl',
          unlockYear: 1861, unlockEventId: 'e_zongli_yamen', lockedLabel: '尚 未 設 立',
```

```js
        { id: 'bj-tongwen', name: '同 文 館', en: 'Tongwen Guan', corner: 'tr',
          unlockYear: 1862, unlockEventId: 'e_tongwen_guan', lockedLabel: '待 同 文 館 史 事',
```

Leave `bj-junji` and `bj-guild` without `unlockEventId`.

- [ ] **Step 2: Add helper**

Place before `renderFacilities(scene)`:

```js
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
```

- [ ] **Step 3: Update `renderFacilities(scene)`**

Replace:

```js
      const yearLocked = (year < f.unlockYear);
```

with:

```js
      const yearLocked = facilityIsLocked(f);
      const lockText = facilityLockText(f);
```

Replace the locked label part:

```js
        (yearLocked ? '<span class="fc-locked">🔒</span>' : '');
```

with:

```js
        (yearLocked ? '<span class="fc-locked">' + escapeHTML(lockText || '鎖') + '</span>' : '');
```

- [ ] **Step 4: Improve locked facility CSS**

Add:

```css
.facility--yearlocked .fc-locked {
  display: block;
  margin-top: 3px;
  font-size: 9px;
  letter-spacing: 0.2em;
  color: rgba(232, 222, 202, 0.46);
}
```

- [ ] **Step 5: Manual verification**

In Beijing before completing `e_zongli_yamen`:

- `總理衙門` is visible but disabled.
- It says `尚 未 設 立` or `待 史 事 解 鎖`.

After completing `e_zongli_yamen`:

- `總理衙門` becomes clickable.

After completing `e_tongwen_guan`:

- `同文館` becomes clickable.

---

## Task 6: Add Event-Level Images To The Event Modal

**Files:**
- Modify: `index.html`
- Modify: `style-explore.css`
- Modify: `intro.js`
- Create directory: `assets/events/`

- [ ] **Step 1: Create assets directory**

Run:

```bash
mkdir -p assets/events
```

- [ ] **Step 2: Add event image HTML**

In `index.html`, inside `.em-setup` before `emChapter`, add:

```html
            <figure class="em-image" id="emImage" hidden>
              <img id="emImg" src="" alt="" draggable="false">
            </figure>
```

- [ ] **Step 3: Add CSS**

Append:

```css
.em-image {
  width: 100%;
  aspect-ratio: 16 / 7;
  margin: 0 0 18px;
  overflow: hidden;
  border: 1px solid rgba(229, 224, 217, 0.16);
  background: rgba(0, 0, 0, 0.16);
}
.em-image[hidden] {
  display: none;
}
.em-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: sepia(0.22) contrast(0.95);
}
```

- [ ] **Step 4: Add image helper**

Place near `setHmImage(path)`:

```js
  function setEventImage(eventId) {
    const wrap = document.getElementById('emImage');
    const img = document.getElementById('emImg');
    if (!wrap || !img) return;
    wrap.setAttribute('hidden', '');
    img.onload = () => wrap.removeAttribute('hidden');
    img.onerror = () => { wrap.setAttribute('hidden', ''); img.removeAttribute('src'); };
    img.src = 'assets/events/' + eventId + '.webp';
  }
```

- [ ] **Step 5: Call helper**

In `actuallyOpenEvent(eventId, ev)`, after `modal.removeAttribute('hidden');`, add:

```js
    setEventImage(eventId);
```

- [ ] **Step 6: Manual fallback check**

Before event images exist:

- Open any event.
- Expected: no broken image visible.

After placing `assets/events/e_bj_envoy.webp`:

- Open `公使駐京`.
- Expected: image appears at top of modal.

---

## Task 7: Verification And Browser Smoke Test

**Files:**
- Modify: none unless bugs found.

- [ ] **Step 1: Syntax check**

Run:

```bash
node --check intro.js
```

Expected: no output and exit code `0`.

- [ ] **Step 2: Server check**

Run:

```bash
curl -I --max-time 3 http://127.0.0.1:8765/index.html
```

Expected:

```text
HTTP/1.0 200 OK
```

If server is not running:

```bash
python3 -m http.server 8765
```

- [ ] **Step 3: Browser flow check**

Open:

```text
http://127.0.0.1:8765/index.html
```

Check:

1. Enter or resume Beijing.
2. Click `紫禁城牆`.
3. Complete classification task.
4. Verify evidence appears in handscroll.
5. Click `外國使節`.
6. Complete sequence task.
7. Verify `公使駐京` action unlocks.
8. Verify `總理衙門` stays locked until `e_zongli_yamen` is completed.
9. Open event modal and verify missing event images fail silently.

- [ ] **Step 4: Cache-bust confirmation**

Inspect loaded script and CSS in browser or page source:

```text
style-explore.css?v=61
intro.js?v=53
```

- [ ] **Step 5: Commit checkpoint if user wants git history**

Only run this if the user asks for commits:

```bash
git add index.html style-explore.css intro.js docs/城市CoreLoop與輕量任務設計-v1.md docs/superpowers/plans/2026-06-01-beijing-lightweight-tasks.md
git commit -m "feat: prototype Beijing evidence tasks"
```

---

## Self-Review

Spec coverage:

- Evidence has real gameplay purpose: covered by Tasks 1, 3, 4.
- Beijing prototype first: covered by Tasks 1, 4, 5.
- Lightweight interactions only: covered by Task 1 task data and Task 3 renderers.
- Facilities unlock through historical events: covered by Task 5.
- Event images: covered by Task 6.
- Handscroll evidence list: covered by Task 4.

Known intentional limits:

- This plan does not implement action-level individual images yet. Event-level images are the first step.
- This plan converts only Beijing hotspots. Other cities continue using the existing direct evidence collection flow until Beijing is validated.
- This plan keeps the current large `intro.js` structure to avoid destabilizing the project during prototype work.

