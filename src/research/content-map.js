export const RESEARCH_CONSTRUCTS = Object.freeze({
  HISTORICAL_COMPLEXITY: 'historical_complexity',
  EVIDENCE_USE: 'evidence_use',
  HISTORICAL_EMPATHY: 'historical_empathy',
  ARGUMENTATION: 'argumentation',
  CHRONOLOGY: 'chronology',
  COMPARATIVE_PERSPECTIVE: 'comparative_perspective'
});

export const RESEARCH_ID_POLICY = Object.freeze({
  version: 'content-freeze-lite-v0.1',
  freezesIdsOnly: true,
  freezesWordingOrVisuals: false,
  loggerQueueKey: 'yangwu_research_event_queue_v1',
  appVersionBaseline: 'dev-v0.1'
});

const C = RESEARCH_CONSTRUCTS;

function entriesToMap(entries) {
  return Object.freeze(Object.fromEntries(entries.map((entry) => [entry.id, Object.freeze(entry)])));
}

function route(id, label, perspective) {
  return { id, label, perspective, constructs: [C.HISTORICAL_EMPATHY, C.HISTORICAL_COMPLEXITY] };
}

function city(id, label, focus, constructs = [C.HISTORICAL_COMPLEXITY, C.EVIDENCE_USE]) {
  return { id, label, focus, constructs };
}

function event(id, cityId, eventKind, constructs) {
  return { id, cityId, eventKind, constructs };
}

function evidenceTask(id, constructs = [C.EVIDENCE_USE, C.HISTORICAL_COMPLEXITY]) {
  const [cityId, hotspotId] = id.split(':');
  return { id, cityId, hotspotId, constructs };
}

export const RESEARCH_CONTENT_MAP = Object.freeze({
  routes: entriesToMap([
    route('free', '自由書記', 'Cross-route witness perspective'),
    route('lihongzhang', '李鴻章', 'Material self-strengthening and regional power'),
    route('rongheng', '容閎', 'Education, overseas learning, and intellectual change'),
    route('yixin', '奕訢', 'Court politics, diplomacy, and institutional constraint')
  ]),

  cities: entriesToMap([
    city('beijing', '北京', 'Court politics, diplomacy, and conservative resistance', [C.HISTORICAL_COMPLEXITY, C.HISTORICAL_EMPATHY, C.ARGUMENTATION]),
    city('fuzhou', '福州', 'Shipbuilding, naval education, and maritime defence', [C.EVIDENCE_USE, C.HISTORICAL_COMPLEXITY, C.CHRONOLOGY]),
    city('guangzhou', '廣州', 'Treaty ports, trade, and the end of the Canton system'),
    city('hongkong', '香港', 'Western learning, print culture, and overseas education', [C.EVIDENCE_USE, C.HISTORICAL_EMPATHY, C.HISTORICAL_COMPLEXITY]),
    city('japan', '日本', 'Meiji comparison and regional pressure', [C.COMPARATIVE_PERSPECTIVE, C.HISTORICAL_COMPLEXITY, C.ARGUMENTATION]),
    city('kaiping', '開平', 'Coal mining, railway development, and social resistance'),
    city('korea', '朝鮮', 'Sino-Japanese rivalry and the East Asian crisis', [C.CHRONOLOGY, C.HISTORICAL_COMPLEXITY, C.COMPARATIVE_PERSPECTIVE]),
    city('nanjing', '南京', 'Post-rebellion reconstruction and regional military industry'),
    city('shanghai', '上海', 'Treaty-port industry, arsenals, shipping, and knowledge circulation'),
    city('tianjin', '天津', 'Beiyang military administration, telegraphy, and diplomacy'),
    city('weihaiwei', '威海', 'Beiyang Fleet, naval defence, and war failure', [C.CHRONOLOGY, C.HISTORICAL_COMPLEXITY, C.ARGUMENTATION]),
    city('wuhan', '武漢', 'Late Self-Strengthening industry and official enterprise limits')
  ]),

  events: entriesToMap([
    event('e_beiyang_fleet', 'weihaiwei', 'pinned', [C.CHRONOLOGY, C.HISTORICAL_COMPLEXITY, C.ARGUMENTATION]),
    event('e_bj_envoy', 'beijing', 'city_event', [C.EVIDENCE_USE, C.HISTORICAL_COMPLEXITY]),
    event('e_bj_wall', 'beijing', 'city_event', [C.EVIDENCE_USE, C.HISTORICAL_EMPATHY]),
    event('e_bj_woren', 'beijing', 'city_event', [C.HISTORICAL_EMPATHY, C.ARGUMENTATION]),
    event('e_chashan_listen', 'shanghai', 'city_event', [C.HISTORICAL_EMPATHY, C.HISTORICAL_COMPLEXITY]),
    event('e_fuzhou_mawei', 'fuzhou', 'pinned', [C.CHRONOLOGY, C.HISTORICAL_COMPLEXITY, C.ARGUMENTATION]),
    event('e_fuzhou_shipyard', 'fuzhou', 'pinned', [C.EVIDENCE_USE, C.HISTORICAL_COMPLEXITY]),
    event('e_fuzhou_taiwan', 'fuzhou', 'pinned', [C.CHRONOLOGY, C.HISTORICAL_COMPLEXITY]),
    event('e_fz_french', 'fuzhou', 'city_event', [C.EVIDENCE_USE, C.HISTORICAL_COMPLEXITY]),
    event('e_fz_haifang', 'fuzhou', 'city_event', [C.EVIDENCE_USE, C.ARGUMENTATION]),
    event('e_fz_yan', 'fuzhou', 'city_event', [C.HISTORICAL_EMPATHY, C.HISTORICAL_COMPLEXITY]),
    event('e_gz_hong', 'guangzhou', 'city_event', [C.EVIDENCE_USE, C.HISTORICAL_COMPLEXITY]),
    event('e_gz_humen', 'guangzhou', 'city_event', [C.HISTORICAL_EMPATHY, C.CHRONOLOGY]),
    event('e_gz_trade', 'guangzhou', 'city_event', [C.EVIDENCE_USE, C.HISTORICAL_COMPLEXITY]),
    event('e_haifang_chouyi', 'beijing', 'pinned', [C.ARGUMENTATION, C.HISTORICAL_COMPLEXITY]),
    event('e_handle_court', 'shanghai', 'city_event', [C.HISTORICAL_EMPATHY, C.HISTORICAL_COMPLEXITY]),
    event('e_hk_harbour', 'hongkong', 'city_event', [C.HISTORICAL_EMPATHY, C.HISTORICAL_COMPLEXITY]),
    event('e_hk_press', 'hongkong', 'city_event', [C.EVIDENCE_USE, C.ARGUMENTATION]),
    event('e_hk_rong', 'hongkong', 'city_event', [C.HISTORICAL_EMPATHY, C.HISTORICAL_COMPLEXITY]),
    event('e_jiangnan', 'shanghai', 'city_event', [C.EVIDENCE_USE, C.HISTORICAL_COMPLEXITY]),
    event('e_jiangnan_pinned', 'shanghai', 'pinned', [C.CHRONOLOGY, C.HISTORICAL_COMPLEXITY]),
    event('e_jp_meiji', 'japan', 'comparison', [C.COMPARATIVE_PERSPECTIVE, C.ARGUMENTATION]),
    event('e_jp_navy', 'japan', 'comparison', [C.COMPARATIVE_PERSPECTIVE, C.HISTORICAL_COMPLEXITY]),
    event('e_jp_tairiku', 'japan', 'comparison', [C.COMPARATIVE_PERSPECTIVE, C.CHRONOLOGY]),
    event('e_korea_donghak', 'korea', 'pinned', [C.CHRONOLOGY, C.HISTORICAL_COMPLEXITY]),
    event('e_korea_situation', 'korea', 'city_event', [C.CHRONOLOGY, C.COMPARATIVE_PERSPECTIVE]),
    event('e_kp_fengshui', 'kaiping', 'city_event', [C.HISTORICAL_EMPATHY, C.HISTORICAL_COMPLEXITY]),
    event('e_kp_mine', 'kaiping', 'city_event', [C.EVIDENCE_USE, C.HISTORICAL_COMPLEXITY]),
    event('e_kp_rail', 'kaiping', 'city_event', [C.EVIDENCE_USE, C.ARGUMENTATION]),
    event('e_nj_arsenal', 'nanjing', 'city_event', [C.EVIDENCE_USE, C.HISTORICAL_COMPLEXITY]),
    event('e_nj_liangjiang', 'nanjing', 'city_event', [C.HISTORICAL_COMPLEXITY, C.ARGUMENTATION]),
    event('e_nj_ruins', 'nanjing', 'city_event', [C.HISTORICAL_EMPATHY, C.CHRONOLOGY]),
    event('e_shimonoseki_treaty', 'shanghai', 'terminal', [C.CHRONOLOGY, C.ARGUMENTATION, C.HISTORICAL_COMPLEXITY]),
    event('e_shisanhang', 'shanghai', 'city_event', [C.EVIDENCE_USE, C.HISTORICAL_COMPLEXITY]),
    event('e_students_depart', 'shanghai', 'pinned', [C.HISTORICAL_EMPATHY, C.HISTORICAL_COMPLEXITY]),
    event('e_students_return', 'shanghai', 'pinned', [C.HISTORICAL_EMPATHY, C.ARGUMENTATION]),
    event('e_tianjin_jiaoan', 'tianjin', 'pinned', [C.HISTORICAL_EMPATHY, C.HISTORICAL_COMPLEXITY]),
    event('e_tj_advisor', 'tianjin', 'city_event', [C.EVIDENCE_USE, C.HISTORICAL_COMPLEXITY]),
    event('e_tj_haihe', 'tianjin', 'city_event', [C.EVIDENCE_USE, C.CHRONOLOGY]),
    event('e_tj_telegraph', 'tianjin', 'city_event', [C.EVIDENCE_USE, C.HISTORICAL_COMPLEXITY]),
    event('e_tongwen_guan', 'beijing', 'pinned', [C.HISTORICAL_EMPATHY, C.ARGUMENTATION]),
    event('e_wh_iron', 'wuhan', 'city_event', [C.EVIDENCE_USE, C.HISTORICAL_COMPLEXITY]),
    event('e_wh_river', 'wuhan', 'city_event', [C.EVIDENCE_USE, C.HISTORICAL_COMPLEXITY]),
    event('e_wh_zhang', 'wuhan', 'city_event', [C.ARGUMENTATION, C.HISTORICAL_COMPLEXITY]),
    event('e_whw_ding', 'weihaiwei', 'city_event', [C.HISTORICAL_EMPATHY, C.ARGUMENTATION]),
    event('e_whw_harbor', 'weihaiwei', 'city_event', [C.EVIDENCE_USE, C.HISTORICAL_COMPLEXITY]),
    event('e_write_yixin', 'shanghai', 'city_event', [C.HISTORICAL_EMPATHY, C.ARGUMENTATION]),
    event('e_yellow_sea_battle', 'weihaiwei', 'terminal', [C.CHRONOLOGY, C.ARGUMENTATION, C.HISTORICAL_COMPLEXITY]),
    event('e_yuanmingyuan', 'beijing', 'pinned', [C.HISTORICAL_EMPATHY, C.HISTORICAL_COMPLEXITY]),
    event('e_zhaoshangju', 'shanghai', 'pinned', [C.EVIDENCE_USE, C.HISTORICAL_COMPLEXITY]),
    event('e_zhibuju', 'shanghai', 'pinned', [C.EVIDENCE_USE, C.HISTORICAL_COMPLEXITY]),
    event('e_zongli_yamen', 'beijing', 'pinned', [C.CHRONOLOGY, C.HISTORICAL_COMPLEXITY])
  ]),

  evidenceTasks: entriesToMap([
    evidenceTask('beijing:bj-envoy'),
    evidenceTask('beijing:bj-wall', [C.EVIDENCE_USE, C.HISTORICAL_EMPATHY]),
    evidenceTask('beijing:bj-woren', [C.EVIDENCE_USE, C.ARGUMENTATION]),
    evidenceTask('fuzhou:fz-battery', [C.EVIDENCE_USE, C.ARGUMENTATION]),
    evidenceTask('fuzhou:fz-french'),
    evidenceTask('fuzhou:fz-yan', [C.EVIDENCE_USE, C.HISTORICAL_EMPATHY]),
    evidenceTask('guangzhou:gz-hong'),
    evidenceTask('guangzhou:gz-humen', [C.EVIDENCE_USE, C.HISTORICAL_EMPATHY]),
    evidenceTask('guangzhou:gz-trade'),
    evidenceTask('hongkong:hk-harbour', [C.EVIDENCE_USE, C.HISTORICAL_EMPATHY]),
    evidenceTask('hongkong:hk-press', [C.EVIDENCE_USE, C.ARGUMENTATION]),
    evidenceTask('hongkong:hk-rong', [C.EVIDENCE_USE, C.HISTORICAL_EMPATHY]),
    evidenceTask('kaiping:kp-fengshui', [C.EVIDENCE_USE, C.HISTORICAL_EMPATHY]),
    evidenceTask('kaiping:kp-mine'),
    evidenceTask('kaiping:kp-rail', [C.EVIDENCE_USE, C.ARGUMENTATION]),
    evidenceTask('nanjing:nj-arsenal'),
    evidenceTask('nanjing:nj-liangjiang', [C.EVIDENCE_USE, C.ARGUMENTATION]),
    evidenceTask('nanjing:nj-ruins', [C.EVIDENCE_USE, C.HISTORICAL_EMPATHY]),
    evidenceTask('shanghai:sh-bund'),
    evidenceTask('shanghai:sh-junk', [C.EVIDENCE_USE, C.HISTORICAL_EMPATHY]),
    evidenceTask('shanghai:sh-stack'),
    evidenceTask('shanghai:sh-steamer'),
    evidenceTask('shanghai:sh-workers', [C.EVIDENCE_USE, C.HISTORICAL_EMPATHY]),
    evidenceTask('tianjin:tj-advisor'),
    evidenceTask('tianjin:tj-haihe', [C.EVIDENCE_USE, C.CHRONOLOGY]),
    evidenceTask('tianjin:tj-telegraph'),
    evidenceTask('wuhan:wh-iron'),
    evidenceTask('wuhan:wh-river'),
    evidenceTask('wuhan:wh-zhang', [C.EVIDENCE_USE, C.ARGUMENTATION])
  ])
});

if (typeof window !== 'undefined') {
  window.__researchContentMap = RESEARCH_CONTENT_MAP;
  window.__researchIdPolicy = RESEARCH_ID_POLICY;
}

if (typeof document !== 'undefined') {
  document.documentElement.dataset.researchContentMap = RESEARCH_ID_POLICY.version;
}
