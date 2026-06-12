# Task 9 Login UI Design Spec

Date: 2026-06-10  
Workstream: research/logger  
Status: design spec, not implementation

## 1. Purpose

Task 9 defines the student-facing research login UI for the Self-Strengthening Movement simulation. It builds on the Task 8B backend boundary but does not yet connect Supabase. The goal is to introduce a safe, low-friction research gate that can bind gameplay logs to a pseudonymous participant session in formal research mode, while preserving normal development and visual optimisation workflows.

## 2. Scope

Task 9 covers:

- when the login gate appears;
- where it sits in relation to the existing opening screen;
- student-facing wording;
- form fields and validation states;
- successful login session handling;
- development bypass rules;
- accessibility and mobile/iPad expectations;
- acceptance criteria for later implementation.

Task 9 does not:

- connect to Supabase;
- create real participant validation;
- submit real research logs;
- build a teacher dashboard;
- require email/password/social login;
- collect student real names or school account credentials;
- modify the research instruments.

## 3. Mode Trigger

The research login gate appears only when the URL includes:

```text
?mode=research
```

Default development play remains unchanged:

```text
http://localhost:5173/
```

Development and testing may explicitly bypass the gate with:

```text
?mode=dev
```

If no mode is provided, the app behaves like the current development/demo game and starts at the normal opening screen.

## 4. Recommended User Flow

### 4.1 Development / Demo Flow

1. User opens the game without `?mode=research`.
2. Existing opening screen appears.
3. User may enter the game as usual.
4. Local research logger and version markers may still load for QA, but no participant session is required.

### 4.2 Research Flow

1. Student opens the research URL with `?mode=research`.
2. A research login gate appears before the existing opening screen becomes playable.
3. Student enters:
   - participant code;
   - session code.
4. Student submits the form.
5. Frontend calls the existing Task 8B helper shape for `/api/login`.
6. If successful in the later Supabase version, the app stores the limited research session object using `saveResearchSession()`.
7. The login gate closes and the existing opening screen becomes available.
8. Subsequent local logs can be associated with the research session in later submission tasks.

During Task 9 implementation, the API may still return `501 supabase_not_connected`. The UI should display a clear non-alarming message rather than pretending login succeeded.

## 5. Placement And Visual Direction

The login gate should appear as a full-screen research access layer before the normal game opening. It should feel quiet, institutional, and research-appropriate, not like a commercial account login.

Recommended placement:

- Use a new layer above the existing `screen1`.
- Do not replace or redesign the current opening screen.
- When the gate is visible, disable interaction with the game opening behind it.
- After successful login, remove or hide the gate and reveal the existing opening screen.

Visual tone:

- restrained;
- readable on iPad and mobile;
- compatible with the current historical visual language;
- no marketing-style hero copy;
- no decorative account/profile imagery;
- no dashboard-like complexity for students.

The login panel may use the game's existing paper/ink visual vocabulary, but it should not become a large explanatory card that teaches the study. It is a simple research access step.

## 6. Form Fields

### 6.1 Required Fields

| Field | Label | Example | Notes |
|---|---|---|---|
| `participant_code` | 參與代碼 | `YW-014` | Provided by teacher/researcher. |
| `session_code` | 課節代碼 | `LKKC-2026` | Shared or class/session-specific. |

### 6.2 Forbidden Fields

The login UI must not ask for:

- student real name;
- email address;
- phone number;
- social login;
- school account password;
- student ID number;
- location permission;
- camera, microphone, or screen recording permission.

## 7. Student-Facing Copy

Use short Traditional Chinese copy for the first version.

Recommended heading:

```text
研究登入
```

Recommended support text:

```text
請輸入老師或研究員提供的參與代碼與課節代碼。
請勿輸入真實姓名。
```

Field labels:

```text
參與代碼
課節代碼
```

Primary button:

```text
進入研究版本
```

Secondary development-only link or button, visible only outside formal research deployment:

```text
開發試玩
```

The development bypass should not appear in formal research mode unless the app is running on localhost or an explicitly approved development URL.

## 8. Validation And Error States

### 8.1 Missing Codes

Trigger:

- participant code is empty;
- session code is empty.

Message:

```text
請輸入參與代碼及課節代碼。
```

### 8.2 Invalid Or Excluded Participant

Trigger:

- later Supabase API returns `invalid_or_excluded_participant`;
- code does not match;
- consent status is not included.

Message:

```text
代碼未能確認。請檢查輸入，或向老師／研究員查詢。
```

### 8.3 Backend Not Connected

Trigger:

- Task 8B stub returns `supabase_not_connected`.

Message:

```text
研究登入尚未連接後台。現在仍可作開發測試。
```

Behaviour:

- On localhost, allow development bypass after this message.
- On formal research deployment, do not allow silent bypass.

### 8.4 Network Error

Trigger:

- fetch fails;
- server unavailable;
- unexpected non-JSON response.

Message:

```text
暫時未能連接登入服務。請稍後再試，或通知老師／研究員。
```

### 8.5 Already Logged In

Trigger:

- `loadResearchSession()` returns a valid session object.

Behaviour:

- Gate may show a short returning-session state and allow the student to continue.
- Do not display sensitive internal details.
- It may show participant code only if needed for classroom troubleshooting.

## 9. Session Handling

On successful login, save only the limited session object:

```json
{
  "session_id": "uuid",
  "participant_code": "YW-014",
  "class_id": "LKKC-S4A",
  "condition": "scaffolded",
  "app_version": "research-v1.0-lkkc-may2026",
  "research_cohort": "lkkc-may-june-2026",
  "content_map_version": "content-freeze-lite-v0.1"
}
```

Use:

- `saveResearchSession()` after successful login;
- `loadResearchSession()` when deciding whether to show the gate;
- `clearResearchSession()` only for explicit restart/debug flows, not automatically during normal play.

The session object should be stored in `sessionStorage`, not `localStorage`, so it is scoped to the browser session.

## 10. Relationship To Existing Logger

Task 9 does not submit logs to Supabase.

It prepares the front end so future tasks can:

- attach `session_id` to queued local events;
- submit `yangwu_research_event_queue_v1` to `/api/logs-batch`;
- distinguish dev/demo play from formal research play.

Until the submission sprint, local logs remain local-only.

## 11. Accessibility And Device Expectations

The login UI must be comfortable on:

- desktop;
- iPad landscape and portrait;
- mobile portrait.

Requirements:

- tap targets at least 44px high;
- labels visible above or beside fields;
- fields usable with software keyboard;
- error messages announced visually near the form;
- focus should move to the first empty field on missing-code validation;
- form submit should work with Enter key;
- no text should overflow the panel on mobile.

## 12. Privacy And Ethics Guardrails

The login UI must reinforce the study's privacy design:

- participant code is pseudonymous, not anonymous;
- students should not enter real names;
- no personal email or password is required;
- no social login is used;
- name-to-code matching is handled outside the game database.

The UI should avoid long ethics explanations. Consent and participant information are handled by separate research documents. The login screen should provide only the minimum needed for safe classroom use.

## 13. Implementation Boundary For The Next Plan

The later implementation plan should create small focused files:

- `src/research/login-gate.js` for login gate behaviour;
- CSS section in `src/style-explore.css` for the research gate;
- minimal HTML markup in `index.html`, or DOM-created markup if this better matches existing patterns;
- tests for mode detection, privacy text, and main-entry import rules.

The implementation should import `src/research/api.js` only through the login gate module, not directly from `src/main.js` unless the implementation plan explicitly chooses that entry shape and updates stability guards accordingly.

## 14. Acceptance Criteria

Task 9 design is complete when:

- `?mode=research` is the only trigger for the login gate;
- normal localhost development remains unblocked;
- participant code and session code are the only login fields;
- student-facing copy explicitly says not to enter real names;
- missing-code, invalid-code, backend-not-connected, network-error, and already-logged-in states are defined;
- successful login stores only the limited research session object;
- no Supabase connection is added by this design;
- no personal account login is introduced;
- iPad/mobile usability is considered;
- the later implementation can be tested without real Supabase.

