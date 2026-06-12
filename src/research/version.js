export const APP_VERSION = 'dev-v0.1';
export const RESEARCH_COHORT = 'lkkc-may-june-2026';

window.__APP_VERSION = APP_VERSION;
window.__RESEARCH_COHORT = RESEARCH_COHORT;

document.documentElement.dataset.appVersion = APP_VERSION;
document.documentElement.dataset.researchCohort = RESEARCH_COHORT;
