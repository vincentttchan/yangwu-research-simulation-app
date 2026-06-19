import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE_URL = process.env.TASK35_BASE_URL || 'http://127.0.0.1:5174/';
const OUT_DIR = join('docs', 'qa-artifacts', 'task35-normal-flow');
const SUMMARY_PATH = join(OUT_DIR, 'task35-normal-flow-summary.json');
const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const VIEWPORTS = [
  { name: 'phone-390x844', width: 390, height: 844, mobile: true, requirePhoneDefaults: true },
  { name: 'phone-430x932', width: 430, height: 932, mobile: true, requirePhoneDefaults: true },
  { name: 'ipad-portrait-768x1024', width: 768, height: 1024, mobile: false, requirePhoneDefaults: true },
  { name: 'ipad-landscape-1024x768', width: 1024, height: 768, mobile: false, requirePhoneDefaults: true }
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  return response.json();
}

async function waitFor(fn, timeout = 10_000, interval = 120, label = 'condition') {
  const start = Date.now();
  let last;
  while (Date.now() - start < timeout) {
    try {
      last = await fn();
      if (last) return last;
    } catch (error) {
      last = error.message;
    }
    await sleep(interval);
  }
  throw new Error(`Timed out waiting for ${label}; last=${JSON.stringify(last)}`);
}

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      }
    };
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  async evaluate(expression, params = {}) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
      ...params
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text || JSON.stringify(result.exceptionDetails));
    }
    return result.result.value;
  }

  close() {
    try {
      this.ws.close();
    } catch {
      // best-effort cleanup
    }
  }
}

function safeSelector(selector) {
  return JSON.stringify(selector);
}

async function startChrome(viewport) {
  assert.equal(existsSync(CHROME_PATH), true, `Chrome should exist at ${CHROME_PATH}`);
  const port = 9400 + Math.floor(Math.random() * 500);
  const profile = `/tmp/yangwu-task35-${viewport.name}-${Date.now()}`;
  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    `--window-size=${viewport.width},${viewport.height}`,
    'about:blank'
  ], { stdio: 'ignore' });

  await waitFor(async () => {
    try {
      return (await fetchJson(`http://127.0.0.1:${port}/json/version`)).webSocketDebuggerUrl;
    } catch {
      return false;
    }
  }, 8_000, 100, `${viewport.name} Chrome debugger`);

  const target = await fetchJson(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
  const cdp = new CdpClient(target.webSocketDebuggerUrl);
  await cdp.open();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.mobile ? 2 : 1,
    mobile: viewport.mobile
  });
  await cdp.send('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 5
  });

  return { chrome, cdp };
}

async function visible(cdp, selector) {
  return cdp.evaluate(`(() => {
    const el = document.querySelector(${safeSelector(selector)});
    if (!el || el.hidden || el.getAttribute('aria-hidden') === 'true') return false;
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return rect.width > 0
      && rect.height > 0
      && style.display !== 'none'
      && style.visibility !== 'hidden'
      && Number(style.opacity || 1) > 0;
  })()`);
}

async function click(cdp, selector) {
  return cdp.evaluate(`(() => {
    const el = document.querySelector(${safeSelector(selector)});
    if (!el) return false;
    el.scrollIntoView({ block: 'center', inline: 'center' });
    el.click();
    return true;
  })()`);
}

async function fireClick(cdp, selector) {
  return cdp.evaluate(`(() => {
    const el = document.querySelector(${safeSelector(selector)});
    if (!el) return false;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    return true;
  })()`);
}

async function screenshot(cdp, viewportName, name) {
  const response = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false
  });
  const file = join(OUT_DIR, `${viewportName}-${name}.png`);
  writeFileSync(file, Buffer.from(response.data, 'base64'));
  return file;
}

async function skipCoach(cdp) {
  for (let i = 0; i < 8; i++) {
    const open = await cdp.evaluate(`!!document.querySelector('#coachmark:not([hidden])')`);
    if (!open) return;
    await click(cdp, '#cmSkip');
    await sleep(250);
  }
}

async function resolveEventIfOpen(cdp, viewportName) {
  if (!(await visible(cdp, '#eventModal:not([hidden])'))) return { opened: false };

  const openShot = await screenshot(cdp, viewportName, 'event-open');
  const footer = await cdp.evaluate(`(() => {
    const button = document.querySelector('#eventModal .em-choice, #emContinue, .em-challenge-opt, #emResultContinue');
    if (!button) return null;
    const rect = button.getBoundingClientRect();
    return {
      top: rect.top,
      bottom: rect.bottom,
      visible: rect.bottom <= innerHeight && rect.top >= 0,
      text: button.textContent.trim()
    };
  })()`);

  if (await visible(cdp, '#eventModal:not([hidden]) .em-choice')) {
    await click(cdp, '#eventModal:not([hidden]) .em-choice');
    await waitFor(
      () => cdp.evaluate(`document.querySelector('#eventModal')?.dataset.phase === 'payoff'`),
      4_000,
      100,
      `${viewportName} event payoff`
    );
    const payoffShot = await screenshot(cdp, viewportName, 'event-payoff');
    await click(cdp, '#emContinue');
    await waitFor(
      async () => !(await visible(cdp, '#eventModal:not([hidden])')),
      7_000,
      100,
      `${viewportName} event close`
    );
    return { opened: true, footer, screenshots: { open: openShot, payoff: payoffShot } };
  }

  return { opened: true, footer, screenshots: { open: openShot } };
}

async function openCityActionEventIfAvailable(cdp, viewportName) {
  const clicked = await cdp.evaluate(`(() => {
    const btn = document.querySelector('#cityActionsList .ca-item:not(:disabled)');
    if (!btn) return false;
    btn.scrollIntoView({ block: 'center', inline: 'center' });
    btn.click();
    return true;
  })()`);
  if (!clicked) return { opened: false, attemptedAction: false };
  await waitFor(() => visible(cdp, '#eventModal:not([hidden])'), 5_000, 100, `${viewportName} city action event`);
  const result = await resolveEventIfOpen(cdp, viewportName);
  return { ...result, attemptedAction: true };
}

function combinations(length, choices) {
  const out = [];
  const current = [];
  function walk(index) {
    if (index === length) {
      out.push([...current]);
      return;
    }
    for (let i = 0; i < choices; i++) {
      current[index] = i;
      walk(index + 1);
    }
  }
  walk(0);
  return out;
}

async function solveEvidenceTask(cdp, viewportName) {
  const taskType = await cdp.evaluate(`document.querySelector('#evidenceTaskModal')?.dataset.taskType || null`);
  if (!taskType) return { taskType: null, solved: false };

  if (taskType === 'sequence') {
    const orders = await cdp.evaluate(`Array.from(document.querySelectorAll('.et-seq-step')).map((btn, index) => ({ index, order: Number(btn.dataset.order) })).sort((a, b) => a.order - b.order).map((entry) => entry.index)`);
    for (const index of orders) {
      await cdp.evaluate(`document.querySelectorAll('.et-seq-step')[${index}]?.click()`);
      await sleep(120);
    }
  } else if (taskType === 'pick') {
    const count = await cdp.evaluate(`document.querySelectorAll('.et-option').length`);
    for (let i = 0; i < count; i++) {
      await cdp.evaluate(`document.querySelectorAll('.et-option')[${i}]?.click()`);
      await sleep(120);
      const ready = await cdp.evaluate(`document.querySelector('#etSubmit') && !document.querySelector('#etSubmit').disabled`);
      if (ready) break;
    }
  } else if (taskType === 'classify') {
    const { itemCount, targetCount } = await cdp.evaluate(`(() => ({
      itemCount: document.querySelectorAll('.et-classify-item').length,
      targetCount: document.querySelectorAll('.et-classify-target').length
    }))()`);
    for (const combo of combinations(itemCount, targetCount)) {
      for (let itemIndex = 0; itemIndex < combo.length; itemIndex++) {
        const targetIndex = combo[itemIndex];
        await cdp.evaluate(`(() => {
          const item = document.querySelectorAll('.et-classify-item')[${itemIndex}];
          const target = document.querySelectorAll('.et-classify-target')[${targetIndex}];
          if (!item || !target) return false;
          item.click();
          target.click();
          return true;
        })()`);
        await sleep(40);
      }
      const ready = await cdp.evaluate(`document.querySelector('#etSubmit') && !document.querySelector('#etSubmit').disabled`);
      if (ready) break;
    }
  } else if (taskType === 'findImage') {
    await cdp.evaluate(`(() => {
      const fallback = document.querySelector('.et-find-fallback');
      if (fallback) { fallback.click(); return true; }
      const target = document.querySelector('.et-find-img');
      if (!target) return false;
      const rect = target.getBoundingClientRect();
      target.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2
      }));
      return true;
    })()`);
  }

  const solved = await waitFor(
    () => cdp.evaluate(`document.querySelector('#etSubmit') && !document.querySelector('#etSubmit').disabled`),
    4_000,
    100,
    `${viewportName} evidence solved`
  );
  await click(cdp, '#etSubmit');
  await waitFor(
    async () => !(await visible(cdp, '#evidenceTaskModal:not([hidden])')),
    5_000,
    100,
    `${viewportName} evidence close`
  );
  await sleep(500);
  return { taskType, solved: !!solved };
}

async function walkNormalFlow(viewport) {
  const { chrome, cdp } = await startChrome(viewport);
  const consoleMessages = [];
  cdp.ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      consoleMessages.push({
        type: msg.params.type,
        text: msg.params.args.map((arg) => arg.value || arg.description || '').join(' ')
      });
    }
  });

  try {
    await cdp.send('Page.navigate', { url: `${BASE_URL}?mode=research` });
    await waitFor(() => cdp.evaluate('document.readyState === "complete"'), 15_000, 100, `${viewport.name} document`);
    await waitFor(() => visible(cdp, '.research-login-bypass'), 10_000, 100, `${viewport.name} dev bypass`);
    const loginShot = await screenshot(cdp, viewport.name, 'login');

    await click(cdp, '.research-login-bypass');
    await waitFor(() => visible(cdp, '#btnOpen'), 8_000, 120, `${viewport.name} intro`);
    await click(cdp, '#btnOpen');
    await waitFor(() => visible(cdp, '.s2c-slide.is-active .s2c-cta'), 5_000, 120, `${viewport.name} character CTA`);
    const characterShot = await screenshot(cdp, viewport.name, 'character');

    await click(cdp, '.s2c-slide.is-active .s2c-cta');
    await waitFor(
      () => cdp.evaluate(`document.querySelector('.s2c-slide.is-active .s2c-cta')?.classList.contains('is-chosen')`),
      3_000,
      100,
      `${viewport.name} route chosen`
    );
    await click(cdp, '.s2c-slide.is-active .s2c-cta');
    await waitFor(() => visible(cdp, '#cutscene.is-visible'), 4_000, 100, `${viewport.name} route cutscene`);
    for (let i = 0; i < 4; i++) {
      await click(cdp, '#csNext');
      await sleep(180);
    }

    await waitFor(
      () => cdp.evaluate(`document.querySelector('#screen3')?.dataset.phase === '6'`),
      9_000,
      150,
      `${viewport.name} map phase 6`
    );
    await sleep(1_700);
    await skipCoach(cdp);
    await resolveEventIfOpen(cdp, `${viewport.name}-map-auto`);
    await skipCoach(cdp);
    const mapShot = await screenshot(cdp, viewport.name, 'map');

    const mapState = await cdp.evaluate(`(() => ({
      phase: document.querySelector('#screen3')?.dataset.phase,
      overflowX: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      eventsCollapsed: document.querySelector('#mapEvents')?.classList.contains('is-collapsed'),
      statsOpen: document.querySelector('#mapStats')?.classList.contains('is-mobile-open'),
      statsPanelVisible: (() => {
        const panel = document.querySelector('#mapStats');
        if (!panel) return false;
        const rect = panel.getBoundingClientRect();
        const style = getComputedStyle(panel);
        return rect.width > 0
          && rect.height > 0
          && style.display !== 'none'
          && style.visibility !== 'hidden'
          && Number(style.opacity || 1) > 0;
      })(),
      targetCity: document.querySelector('.city-seal--target')?.dataset.cityKey || null,
      citySeals: document.querySelectorAll('.city-seal').length,
      modalOpen: document.documentElement.dataset.modalOpen || null,
      brokenVisible: Array.from(document.images).filter((img) => {
        const rect = img.getBoundingClientRect();
        const style = getComputedStyle(img);
        return rect.width > 0
          && rect.height > 0
          && style.display !== 'none'
          && style.visibility !== 'hidden'
          && img.complete
          && img.naturalWidth === 0;
      }).map((img) => img.getAttribute('src'))
    }))()`);

    await click(cdp, '#eventsTab');
    await waitFor(
      () => cdp.evaluate(`!document.querySelector('#mapEvents')?.classList.contains('is-collapsed')`),
      3_000,
      100,
      `${viewport.name} events open`
    );
    const eventsShot = await screenshot(cdp, viewport.name, 'events-open');
    await click(cdp, '#eventsCollapse');
    await waitFor(
      () => cdp.evaluate(`document.querySelector('#mapEvents')?.classList.contains('is-collapsed')`),
      3_000,
      100,
      `${viewport.name} events closed`
    );

    let statsShot;
    if (viewport.requirePhoneDefaults) {
      await click(cdp, '#mapStatsTab');
      await waitFor(
        () => cdp.evaluate(`document.querySelector('#mapStats')?.classList.contains('is-mobile-open')`),
        3_000,
        100,
        `${viewport.name} stats open`
      );
      statsShot = await screenshot(cdp, viewport.name, 'stats-open');
      await click(cdp, '#mapStatsTab');
      await waitFor(
        () => cdp.evaluate(`!document.querySelector('#mapStats')?.classList.contains('is-mobile-open')`),
        3_000,
        100,
        `${viewport.name} stats closed`
      );
    } else {
      await waitFor(
        () => cdp.evaluate(`(() => {
          const panel = document.querySelector('#mapStats');
          if (!panel) return false;
          const rect = panel.getBoundingClientRect();
          const style = getComputedStyle(panel);
          return rect.width > 0
            && rect.height > 0
            && style.display !== 'none'
            && style.visibility !== 'hidden'
            && Number(style.opacity || 1) > 0;
        })()`),
        3_000,
        100,
        `${viewport.name} stats visible`
      );
      statsShot = await screenshot(cdp, viewport.name, 'stats-visible');
    }

    await click(cdp, '.events-journal');
    await waitFor(() => visible(cdp, '#panel-juan:not([hidden])'), 3_000, 100, `${viewport.name} journal`);
    const journalShot = await screenshot(cdp, viewport.name, 'journal');
    await click(cdp, '#panel-juan [data-close]');
    await waitFor(async () => !(await visible(cdp, '#panel-juan:not([hidden])')), 3_000, 100, `${viewport.name} journal close`);

    const targetSelector = mapState.targetCity
      ? `.city-seal[data-city-key="${mapState.targetCity}"]`
      : '.city-seal--target';
    await fireClick(cdp, targetSelector);
    await waitFor(
      () => cdp.evaluate(`document.querySelector('#cityScene') && !document.querySelector('#cityScene').hasAttribute('hidden') && document.querySelector('#cityScene')?.dataset.phase === 'ready'`),
      7_000,
      100,
      `${viewport.name} city ready`
    );
    await sleep(1_300);
    let cityEvent = await resolveEventIfOpen(cdp, `${viewport.name}-city-auto`);
    await skipCoach(cdp);
    const cityShot = await screenshot(cdp, viewport.name, 'city');

    const cityState = await cdp.evaluate(`(() => ({
      overflowX: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      cityPhase: document.querySelector('#cityScene')?.dataset.phase,
      cityTitle: document.querySelector('#ctZh')?.textContent,
      hotspots: document.querySelectorAll('#cityHotspots .hotspot').length,
      sheetExpanded: document.querySelector('#cityMissionSheet')?.dataset.expanded,
      cityBg: {
        complete: document.querySelector('#cityBg')?.complete,
        nw: document.querySelector('#cityBg')?.naturalWidth,
        nh: document.querySelector('#cityBg')?.naturalHeight
      },
      actions: Array.from(document.querySelectorAll('#cityActionsList .ca-item')).map((btn) => ({
        eventId: btn.dataset.eventId || null,
        disabled: btn.disabled,
        text: btn.textContent.trim()
      }))
    }))()`);

    await fireClick(cdp, '#cityHotspots .hotspot');
    await sleep(250);
    await fireClick(cdp, '#cityHotspots .hotspot');
    await waitFor(() => visible(cdp, '#evidenceTaskModal:not([hidden])'), 5_000, 120, `${viewport.name} evidence`);
    const evidenceShot = await screenshot(cdp, viewport.name, 'evidence');
    const evidenceState = await cdp.evaluate(`(() => {
      const card = document.querySelector('#evidenceTaskModal .et-card');
      const rect = card?.getBoundingClientRect();
      const img = document.querySelector('#etBannerImg');
      return {
        overflowX: Math.max(0, document.documentElement.scrollWidth - innerWidth),
        card: rect ? { top: rect.top, bottom: rect.bottom, height: rect.height, width: rect.width } : null,
        viewport: { w: innerWidth, h: innerHeight },
        banner: {
          src: img?.getAttribute('src'),
          complete: img?.complete,
          nw: img?.naturalWidth,
          nh: img?.naturalHeight
        },
        submitVisible: !!document.querySelector('#etSubmit')?.getBoundingClientRect().height
      };
    })()`);
    const evidenceSolve = await solveEvidenceTask(cdp, viewport.name);

    if (!cityEvent.opened) {
      await waitFor(
        () => cdp.evaluate(`!!document.querySelector('#cityActionsList .ca-item:not(:disabled)')`),
        5_000,
        100,
        `${viewport.name} unlocked city action`
      );
      cityEvent = await openCityActionEventIfAvailable(cdp, `${viewport.name}-city-action`);
    }

    return {
      viewport,
      screenshots: {
        login: loginShot,
        character: characterShot,
        map: mapShot,
        events: eventsShot,
        stats: statsShot,
        journal: journalShot,
        city: cityShot,
        evidence: evidenceShot,
        eventOpen: cityEvent?.screenshots?.open || null,
        eventPayoff: cityEvent?.screenshots?.payoff || null
      },
      mapState,
      cityEvent,
      cityState,
      evidenceState,
      evidenceSolve,
      consoleMessages
    };
  } finally {
    cdp.close();
    chrome.kill('SIGTERM');
  }
}

async function assertServerReady() {
  try {
    const response = await fetch(BASE_URL);
    assert.equal(response.ok, true, `Local app should respond at ${BASE_URL}`);
  } catch (error) {
    throw new Error(`Local app is not reachable at ${BASE_URL}. Start the Vite dev server first. ${error.message}`);
  }
}

function assertRun(run) {
  assert.equal(run.mapState.phase, '6', `${run.viewport.name} should reach map phase 6`);
  assert.equal(run.mapState.overflowX, 0, `${run.viewport.name} map should not horizontally overflow`);
  assert.equal(run.mapState.brokenVisible.length, 0, `${run.viewport.name} should have no visible broken images`);
  assert.equal(run.mapState.citySeals >= 8, true, `${run.viewport.name} should render city seals`);
  assert.equal(run.mapState.targetCity, 'beijing', `${run.viewport.name} first normal target should be Beijing`);

  if (run.viewport.requirePhoneDefaults) {
    assert.equal(run.mapState.eventsCollapsed, true, `${run.viewport.name} events drawer should be collapsed by default`);
    assert.equal(run.mapState.statsOpen, false, `${run.viewport.name} stats drawer should be closed by default`);
  } else {
    assert.equal(run.mapState.statsPanelVisible, true, `${run.viewport.name} stats panel should be visible/readable`);
  }

  assert.equal(
    run.cityEvent.opened,
    true,
    `${run.viewport.name} should open the first historical event modal; actions=${JSON.stringify(run.cityState.actions)}`
  );
  assert.equal(run.cityEvent.footer?.visible, true, `${run.viewport.name} event modal footer/action should be reachable`);
  assert.equal(run.cityState.overflowX, 0, `${run.viewport.name} city should not horizontally overflow`);
  assert.equal(run.cityState.cityPhase, 'ready', `${run.viewport.name} city scene should be ready`);
  assert.equal(run.cityState.cityTitle, '北 京', `${run.viewport.name} first city should be Beijing`);
  assert.equal(run.cityState.hotspots > 0, true, `${run.viewport.name} city should have hotspots`);
  assert.equal(run.cityState.cityBg.nw, 1600, `${run.viewport.name} city image should load`);

  assert.equal(run.evidenceState.overflowX, 0, `${run.viewport.name} evidence modal should not horizontally overflow`);
  assert.equal(run.evidenceState.card.width <= run.evidenceState.viewport.w, true, `${run.viewport.name} evidence card should fit viewport width`);
  assert.equal(run.evidenceState.card.bottom <= run.evidenceState.viewport.h, true, `${run.viewport.name} evidence card bottom should remain within viewport`);
  assert.equal(run.evidenceState.banner.nw, 1600, `${run.viewport.name} evidence banner should load`);
  assert.equal(run.evidenceState.submitVisible, true, `${run.viewport.name} evidence submit should be visible/reachable`);
  assert.equal(run.evidenceSolve.solved, true, `${run.viewport.name} evidence task should be solvable through normal controls`);

  const severeConsole = run.consoleMessages.filter((msg) => ['error', 'warning'].includes(msg.type));
  assert.deepEqual(severeConsole, [], `${run.viewport.name} should have no console errors/warnings`);

  Object.values(run.screenshots).filter(Boolean).forEach((file) => {
    assert.equal(existsSync(file), true, `Screenshot should exist: ${file}`);
    assert.equal(statSync(file).size > 20_000, true, `Screenshot should not be empty: ${file}`);
  });
}

mkdirSync(OUT_DIR, { recursive: true });
await assertServerReady();

const runLog = [];
for (const viewport of VIEWPORTS) {
  const run = await walkNormalFlow(viewport);
  assertRun(run);
  runLog.push(run);
}

const summary = {
  generatedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  runLog
};

writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2));

const doc = readFileSync(join('docs', 'task-35-normal-flow-route-to-map-qa.md'), 'utf8');
[
  'Task 35 Mobile / iPad UI Update + Normal-Flow Route-to-Map QA',
  'Formal research data collection status: still `No-Go`',
  '390 x 844',
  '430 x 932',
  '768 x 1024',
  '1024 x 768',
  'normal player flow',
  'Beijing',
  'event drawer',
  'stats drawer',
  'journal',
  'evidence task modal',
  'Task 62 follow-up pass',
  'evidence-gated Beijing historical event'
].forEach((needle) => {
  assert.match(doc, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Task 35 doc should include ${needle}`);
});

console.log('task 35 normal-flow route-to-map QA checks passed');
