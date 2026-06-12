import { loadResearchSession, saveResearchSession } from './session.js';

const MODE_RESEARCH = 'research';
const MODE_DEV = 'dev';
const LOGIN_PASSED_EVENT = 'yangwu:research-login-passed';

const COPY = {
  heading: '研究登記',
  support: '憑老師或研究員提供的代碼進入研究版本。',
  privacy: '此處毋須填寫真實姓名。',
  participantLabel: '參與代碼',
  sessionLabel: '課節代碼',
  submit: '核驗 · 入局',
  devBypass: '開發試玩',
  missingCodes: '請輸入參與代碼及課節代碼。',
  invalidCode: '代碼未能確認。請檢查輸入，或向老師／研究員查詢。',
  backendNotConnected: '研究登入尚未連接後台。現在仍可作開發測試。',
  networkError: '暫時未能連接登入服務。請稍後再試，或通知老師／研究員。',
  returning: '已偵測到本課節的研究登入，可繼續進入。'
};

function getMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') || '';
}

function isLocalhost() {
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

function setMarker(state) {
  document.documentElement.dataset.researchLoginGate = state;
}

function createField(id, label, autocomplete) {
  const wrap = document.createElement('label');
  wrap.className = 'research-login-field';
  wrap.setAttribute('for', id);

  const labelText = document.createElement('span');
  labelText.className = 'research-login-label';
  labelText.textContent = label;

  const input = document.createElement('input');
  input.id = id;
  input.name = id;
  input.type = 'text';
  input.inputMode = 'text';
  input.autocomplete = autocomplete;
  input.spellcheck = false;
  input.className = 'research-login-input';

  wrap.append(labelText, input);
  return { wrap, input };
}

function setMessage(node, message, tone = 'neutral') {
  node.textContent = message || '';
  node.dataset.tone = tone;
  node.hidden = !message;
}

function closeGate(gate) {
  gate.setAttribute('hidden', '');
  gate.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('has-research-login-gate');
  setMarker('passed');
  window.dispatchEvent(new CustomEvent(LOGIN_PASSED_EVENT));
}

function focusFirstEmpty(participantInput, sessionInput) {
  const target = !participantInput.value.trim() ? participantInput : sessionInput;
  window.setTimeout(() => target.focus(), 0);
}

async function submitLogin({ participantInput, sessionInput, messageNode, gate, submitButton }) {
  const participantCode = participantInput.value.trim();
  const sessionCode = sessionInput.value.trim();

  if (!participantCode || !sessionCode) {
    setMessage(messageNode, COPY.missingCodes, 'error');
    focusFirstEmpty(participantInput, sessionInput);
    return;
  }

  submitButton.disabled = true;
  setMessage(messageNode, '', 'neutral');

  try {
    const { loginWithParticipantCode } = await import('./api.js');
    const result = await loginWithParticipantCode(participantCode, sessionCode);

    if (result.ok && result.data?.session) {
      const saved = saveResearchSession(result.data.session);
      if (saved) closeGate(gate);
      else setMessage(messageNode, COPY.networkError, 'error');
      return;
    }

    const error = result.data?.error;
    if (error === 'missing_codes') {
      setMessage(messageNode, COPY.missingCodes, 'error');
      focusFirstEmpty(participantInput, sessionInput);
      return;
    }

    if (error === 'invalid_or_excluded_participant') {
      setMessage(messageNode, COPY.invalidCode, 'error');
      return;
    }

    if (error === 'supabase_not_connected' || (isLocalhost() && (result.status === 404 || !error))) {
      setMessage(messageNode, COPY.backendNotConnected, 'warning');
      return;
    }

    setMessage(messageNode, COPY.networkError, 'error');
  } catch (error) {
    setMessage(messageNode, COPY.networkError, 'error');
  } finally {
    submitButton.disabled = false;
  }
}

function renderGate() {
  const existingSession = loadResearchSession();
  const gate = document.createElement('section');
  gate.className = 'research-login-gate';
  gate.setAttribute('role', 'dialog');
  gate.setAttribute('aria-modal', 'true');
  gate.setAttribute('aria-labelledby', 'researchLoginHeading');

  const panel = document.createElement('form');
  panel.className = 'research-login-panel';
  panel.noValidate = true;

  const eyebrow = document.createElement('p');
  eyebrow.className = 'research-login-eyebrow';
  eyebrow.textContent = '入局核驗';

  const heading = document.createElement('h2');
  heading.id = 'researchLoginHeading';
  heading.className = 'research-login-heading';
  heading.textContent = COPY.heading;

  const support = document.createElement('p');
  support.className = 'research-login-copy';
  support.textContent = COPY.support;

  const privacy = document.createElement('p');
  privacy.className = 'research-login-privacy';
  privacy.textContent = COPY.privacy;

  const participant = createField('participant_code', COPY.participantLabel, 'off');
  const session = createField('session_code', COPY.sessionLabel, 'off');

  const message = document.createElement('p');
  message.className = 'research-login-message';
  message.setAttribute('aria-live', 'polite');
  message.hidden = true;

  const actions = document.createElement('div');
  actions.className = 'research-login-actions';

  const submit = document.createElement('button');
  submit.className = 'research-login-submit';
  submit.type = 'submit';
  submit.textContent = COPY.submit;

  actions.append(submit);

  if (isLocalhost()) {
    const bypass = document.createElement('button');
    bypass.className = 'research-login-bypass';
    bypass.type = 'button';
    bypass.textContent = COPY.devBypass;
    bypass.addEventListener('click', () => closeGate(gate));
    actions.append(bypass);
  }

  panel.append(
    eyebrow,
    heading,
    support,
    privacy,
    participant.wrap,
    session.wrap,
    message,
    actions
  );
  gate.append(panel);
  document.body.append(gate);

  document.body.classList.add('has-research-login-gate');
  setMarker(existingSession ? 'returning' : 'visible');

  if (existingSession) {
    setMessage(message, COPY.returning, 'neutral');
    window.setTimeout(() => closeGate(gate), 650);
    return;
  }

  panel.addEventListener('submit', (event) => {
    event.preventDefault();
    submitLogin({
      participantInput: participant.input,
      sessionInput: session.input,
      messageNode: message,
      gate,
      submitButton: submit
    });
  });

  window.setTimeout(() => participant.input.focus(), 0);
}

function initResearchLoginGate() {
  const mode = getMode();
  if (mode === MODE_DEV) {
    setMarker('dev-bypass');
    return;
  }

  if (mode !== MODE_RESEARCH) {
    setMarker('inactive');
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderGate, { once: true });
  } else {
    renderGate();
  }
}

initResearchLoginGate();

export const __researchLoginGateForTests = {
  MODE_RESEARCH,
  MODE_DEV,
  LOGIN_PASSED_EVENT,
  COPY,
  getMode,
  isLocalhost
};
