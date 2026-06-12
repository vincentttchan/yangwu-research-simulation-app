# Nanjing Core Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Nanjing as a playable post-1864 background city with three hotspots, three lightweight evidence tasks, three free events, and matching facility entries.

**Architecture:** Follow the existing single-file data-driven structure in `intro.js`. Nanjing will be added through `CITY_SCENES`, `EVIDENCE_TASKS`, and `EVENTS` only; no new interaction engine or layout system is required.

**Tech Stack:** Vanilla JavaScript, static HTML/CSS, existing `intro.js` city/evidence/event systems, existing image folders under `assets/`.

---

## File Structure

- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/intro.js`
  - Replace the current empty `nanjing` scene with playable data.
  - Add three `EVIDENCE_TASKS` entries keyed by `nanjing:<hotspotId>`.
  - Add three `EVENTS` entries keyed by `e_nj_ruins`, `e_nj_liangjiang`, `e_nj_arsenal`.
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/docs/城市CoreLoop-設計與實作-v2.md`
  - Mark Nanjing as planned/implemented after code is added.
  - Keep it as a background-cause city, not a late-failure city.
- Use later, if image assets are produced:
  - `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/assets/city/city-nanjing.webp`
  - `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/assets/hotspot/nj-ruins.webp`
  - `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/assets/hotspot/nj-liangjiang.webp`
  - `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/assets/hotspot/nj-arsenal.webp`
  - `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/assets/facility/nj-liangjiang.webp`
  - `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/assets/facility/nj-archive.webp`
  - `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/assets/facility/nj-jinghai.webp`
  - `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/assets/facility/nj-inn.webp`

---

### Task 1: Add Playable Nanjing City Scene

**Files:**
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/intro.js`

- [ ] **Step 1: Locate the empty Nanjing scene**

Run:

```bash
rg -n "nanjing:" intro.js
```

Expected: one scene entry similar to:

```js
nanjing:   { en: 'Nanking',   yearLabel: '咸豐十一年（1861）春', tagline: '「太平餘燼 · 廢墟之城」',     actionEvents: [], hotspots: [] },
```

- [ ] **Step 2: Replace the empty scene with playable post-1864 Nanjing**

Replace the one-line `nanjing` object with:

```js
nanjing: {
  en: 'Nanking',
  yearLabel: '同治三年（1864）秋',
  tagline: '「太平餘燼 · 廢墟之上」',
  actionEvents: ['e_nj_ruins', 'e_nj_liangjiang', 'e_nj_arsenal'],
  hotspots: [
    { id: 'nj-ruins', type: 'clue', unlocks: 'e_nj_ruins', appearFromYear: 1864, x: '18%', y: '69%',
      name: '太 平 廢 墟', axis: 'thought',
      desc: '焦黑梁木、破瓦與歸來的百姓散在城下。太平天國之亂雖平，清廷的根基卻已被震動——細看這片【城破之後】。' },
    { id: 'nj-liangjiang', type: 'clue', unlocks: 'e_nj_liangjiang', appearFromYear: 1864, x: '59%', y: '43%',
      name: '兩 江 督 署', axis: 'system',
      desc: '衙署重新開門，幕僚、奏摺、軍政文書往來不息。曾國藩一類地方督撫由此掌握軍政與籌餉大權——入內查這【督撫之權】。' },
    { id: 'nj-arsenal', type: 'clue', unlocks: 'e_nj_arsenal', appearFromYear: 1864, x: '77%', y: '63%',
      name: '製 器 舊 檔', axis: 'material',
      desc: '案上有槍炮圖紙、炮管零件與安慶軍械所舊檔。江南煙囪升起之前，戰亂已逼人翻開製器圖樣——整理這批【製器舊檔】。' }
  ],
  facilities: [
    { id: 'nj-liangjiang-fac', name: '兩江總督衙門', en: 'Liangjiang Office', corner: 'tl',
      unlockYear: 1864, desc: '戰後軍政與籌餉文書匯聚之地。研讀奏摺，可見地方督撫如何成為洋務推手。',
      gain: { axis: 'system', amount: 2 },
      challenge: {
        type: 'scenario', axis: 'system',
        q: '太平天國後，曾國藩、李鴻章等地方督撫掌握軍政與財政，對洋務運動有何影響？',
        options: [
          { label: '有利地方推動洋務，但也造成各自為政、中央統籌不足', correct: true },
          { label: '令中央能完全統一規劃所有改革', correct: false },
          { label: '使清廷不再需要新式軍事與工業', correct: false }
        ],
        explain: '太平天國後，清廷更倚重曾國藩、李鴻章等地方督撫。他們能籌餉練兵、創辦洋務，但各地分頭興辦亦造成中央統籌不足。（DSE：地方官倡導洋務 · 中央統籌不足）'
      } },
    { id: 'nj-archive', name: '軍械檔案房', en: 'Arsenal Archive', corner: 'tr',
      unlockYear: 1864, desc: '舊檔記著安慶軍械所與早期製器嘗試。翻閱圖紙，可長器物見識。',
      gain: { axis: 'material', amount: 2 },
      challenge: {
        type: 'fact', axis: 'material',
        q: '安慶軍械所等早期製器嘗試，與洋務運動哪一類措施最接近？',
        options: [
          { label: '自強階段的軍事工業，製造槍炮以求強兵', correct: true },
          { label: '求富階段的民用航運企業', correct: false },
          { label: '政治制度改革，建立議會', correct: false }
        ],
        explain: '安慶軍械所代表早期製器嘗試，與後來江南製造總局同屬「自強」取向的軍事工業，目標是製造槍炮、強兵禦侮。（DSE：自強 · 軍事工業）'
      } },
    { id: 'nj-jinghai', name: '靜海寺遺址', en: 'Treaty Memory Site', corner: 'bl',
      unlockYear: 1864, desc: '條約記憶與戰後殘痕並存。駐足此地，可回想外患如何與內憂交逼。',
      gain: { axis: 'thought', amount: 1 },
      challenge: {
        type: 'fact', axis: 'thought',
        q: '1842 年《南京條約》對中國近代史有何重要意義？',
        options: [
          { label: '中國近代第一個不平等條約，開啟五口通商與割讓香港', correct: true },
          { label: '正式建立北洋艦隊', correct: false },
          { label: '設立總理衙門與同文館', correct: false }
        ],
        explain: '《南京條約》是中國近代第一個不平等條約，割讓香港、開五口通商、賠款，標誌外患加深；它與後來內亂一同構成洋務背景。（DSE：不平等條約 · 外患背景）'
      } },
    { id: 'nj-inn', name: '市 集 客 棧', en: 'Market Inn', corner: 'br',
      unlockYear: 1864, desc: '戰後市集初復，旅人與百姓談論兵亂、稅餉與重建。在此暫歇，待一季流轉。',
      gain: null }
  ]
},
```

- [ ] **Step 3: Check syntax**

Run:

```bash
node --check intro.js
```

Expected: no output and exit code 0.

---

### Task 2: Add Three Nanjing Evidence Tasks

**Files:**
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/intro.js`

- [ ] **Step 1: Locate the end of the Tianjin task block**

Run:

```bash
rg -n "tianjin:tj-telegraph|const EVIDENCE_TASKS|let foundHotspots" intro.js
```

Expected: `tianjin:tj-telegraph` appears before `let foundHotspots`.

- [ ] **Step 2: Insert Nanjing tasks before `let foundHotspots`**

Add a comma after the existing `tianjin:tj-telegraph` task object if needed, then insert:

```js
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
    }
```

- [ ] **Step 3: Check syntax**

Run:

```bash
node --check intro.js
```

Expected: no output and exit code 0.

---

### Task 3: Add Three Nanjing Free Events

**Files:**
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/intro.js`

- [ ] **Step 1: Locate the Tianjin free events**

Run:

```bash
rg -n "自由事件 · 天津|e_tj_haihe|自由事件 · 福州" intro.js
```

Expected: Tianjin free event block appears before Fuzhou free event block.

- [ ] **Step 2: Insert Nanjing free events after the Tianjin block**

Add the following block before `// ════════════ 自由事件 · 福州`:

```js
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
        q: '安慶軍械所、江南製造總局等軍工設施，最能代表洋務運動哪一階段的措施？',
        options: [
          { label: '前期「自強」：興辦軍事工業，製造槍炮輪船', correct: true },
          { label: '後期「求富」：創辦民用企業賺取商利', correct: false },
          { label: '戊戌變法：改革政治制度', correct: false }
        ],
        explain: '洋務前期以「自強」為口號，重點是創辦江南製造總局、福州船政局等軍事工業，製造槍炮輪船以強兵禦侮。（DSE：自強 · 軍事工業）'
      }
    },
```

- [ ] **Step 3: Check syntax**

Run:

```bash
node --check intro.js
```

Expected: no output and exit code 0.

---

### Task 4: Update Core Loop Documentation

**Files:**
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/docs/城市CoreLoop-設計與實作-v2.md`

- [ ] **Step 1: Find the待建城市 section**

Run:

```bash
rg -n "南京|待建城市|天津" docs/城市CoreLoop-設計與實作-v2.md
```

Expected: Nanjing appears under pending city blueprint.

- [ ] **Step 2: Add an implemented Nanjing subsection**

After the Tianjin subsection and before the pending city blueprint table, add:

```markdown
### 3.5 南京 ✅（核心衝擊：內亂後的廢墟與地方督撫興起）
| 熱點 | 任務型 | 查證 | DSE |
|---|---|---|---|
| nj-ruins 太平廢墟(1864) | pick「城破之後」 | 判斷太平天國後清廷危機 | 背景·內憂刺激洋務 |
| nj-liangjiang 兩江督署(1864) | classify「督撫之權」 | 分辨地方可辦洋務與中央統籌不足 | 地方官倡導·中央統籌不足 |
| nj-arsenal 製器舊檔(1864) | sequence「製器舊檔」 | 內亂→地方練兵→安慶軍械所→江南製造局 | 措施·自強·軍事工業前奏 |
設施：兩江總督衙門(1864)、軍械檔案房(1864)、靜海寺遺址(1864)、市集客棧(1864)。
```

- [ ] **Step 3: Remove Nanjing from the pending table**

In the pending table, delete the row:

```markdown
| 南京 | 內憂戰亂後的重建與製器 | 太平天國餘燼、地方督撫、安慶軍械所 | 內憂·地方督撫·軍工開端 |
```

If the table numbering or heading says `3.5 待建城市藍圖`, rename it to:

```markdown
### 3.6 待建城市藍圖 ⬜（沿用同一套 Core Loop）
```

---

### Task 5: Verify Nanjing Is Playable

**Files:**
- Check: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/intro.js`
- Check: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/index.html`

- [ ] **Step 1: Static syntax check**

Run:

```bash
node --check intro.js
```

Expected: no output and exit code 0.

- [ ] **Step 2: Whitespace check**

Run:

```bash
git diff --check -- intro.js docs/城市CoreLoop-設計與實作-v2.md
```

Expected: no output and exit code 0.

- [ ] **Step 3: Serve asset and page smoke check**

Run:

```bash
node - <<'NODE'
const http = require('http');
for (const path of ['/index.html','/intro.js']) {
  http.get({host:'127.0.0.1', port:8765, path}, (res) => {
    console.log(path, res.statusCode, res.headers['content-type'] || '');
    res.resume();
  }).on('error', (e) => console.log(path, 'ERR', e.message));
}
NODE
```

Expected if local server is running:

```text
/index.html 200 text/html
/intro.js 200 text/javascript
```

If the local server is not running, start it separately from the project folder and retry.

- [ ] **Step 4: Browser flow check**

Open:

```text
http://127.0.0.1:8765/index.html
```

Expected player flow:

1. Start game and reach map.
2. Select a route that can access Nanjing.
3. Click Nanjing.
4. Confirm the city scene opens with three hotspots:
   - 太 平 廢 墟
   - 兩 江 督 署
   - 製 器 舊 檔
5. Click each hotspot and complete its evidence task.
6. Confirm each task shows a evidence reveal and then can open the corresponding event.
7. Confirm event completion returns to Nanjing, not the map.

---

## Self-Review

**Spec coverage:** This plan covers the approved Nanjing setting: post-1864 war recovery, three core tasks, three events, DSE evidence sentences, and facilities. Tianjin is intentionally not modified because the approved direction was to keep its existing three-task structure.

**Placeholder scan:** No `TBD`, `TODO`, or deferred implementation placeholders are present. Image files are named for future asset production, but implementation does not depend on them because non-`findImage` tasks only use optional banner images if files exist.

**Type consistency:** Hotspot ids match evidence task keys and event unlock ids:
- `nj-ruins` → `nanjing:nj-ruins` → `e_nj_ruins`
- `nj-liangjiang` → `nanjing:nj-liangjiang` → `e_nj_liangjiang`
- `nj-arsenal` → `nanjing:nj-arsenal` → `e_nj_arsenal`

