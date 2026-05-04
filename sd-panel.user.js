// ==UserScript==
// @name         SD Panel
// @namespace    amimirsh-watch-sorter
// @version      1.5.1
// @description  Foresight Watch Sorter by Amir Hossein Mirshekari @amimirsh
// @match        https://sort-eu.aka.amazon.com/foresight*
// @match        https://trans-logistics-eu.amazon.com/sortcenter/tantei*
// @match        https://stem-eu.corp.amazon.com/node/*/equipment*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// @grant        GM_openInTab
// @grant        unsafeWindow
// @noframes
// @connect      trans-logistics-eu.amazon.com
// @connect      trans-logistics.amazon.com
// @connect      vinyaas-ui-eu.amazon.com
// @connect      skynet.amazon.dev
// @connect      stem-eu.corp.amazon.com
// @run-at       document-start
// @updateURL    https://amsdpanel-lab.github.io/sd-panel/sd-panel.meta.js
// @downloadURL  https://amsdpanel-lab.github.io/sd-panel/sd-panel.user.js
// ==/UserScript==

(function () {
  'use strict';

  const SCRIPT_NAME = 'WatchSorter';
  const SCRIPT_VERSION = '1.5.0';
const SCRIPT_AUTHOR = 'Amir Hossein Mirshekari @amimirsh';




const isForesightPage = location.hostname.includes('sort-eu.aka.amazon.com');
    const isStemPage = location.hostname.includes('stem-eu.corp.amazon.com');
const STEM_COMMAND_KEY = 'watchSorterStemCommand:v1';
const STEM_LOG_KEY = 'watchSorterStemLog:v1';
const STEM_HEARTBEAT_KEY = 'watchSorterStemHeartbeat:v1';
    const STEM_BOOTSTRAP_RESULT_KEY = 'watchSorterStemBootstrapResult:v1';
const STEM_GRAPHQL_URL = 'https://stem-eu.corp.amazon.com/sortcenter/equipmentmanagement/graphql';
const STEM_HEARTBEAT_TTL_MS = 1500;
    const STEM_PENDING_COMMAND_KEY = 'watchSorterStemPendingCommand:v1';
const STEM_REFRESH_MARK_KEY = 'watchSorterStemRefreshMark:v1';
    const STEM_PENDING_SESSION_KEY = 'watchSorterStemPendingCommandSession:v1';
    const STEM_AREA_RESOURCE_MAP_KEY = 'watchSorterStemAreaResourceMap:v1';
const STEM_AREA_RESOURCE_MAP_TTL_MS = 4 * 60 * 60 * 1000;
const VINYAAS_CONFIG_URL = 'https://vinyaas-ui-eu.amazon.com/sortcenter/vinyaas/fetchdata/getNodeConfiguration';
const VINYAAS_CACHE_TTL_MS = 60 * 60 * 1000;
const VISTA_FLOWRATE_URL = 'https://trans-logistics-eu.amazon.com/sortcenter/flowrate';
const VISTA_DETAIL_URL = 'https://trans-logistics-eu.amazon.com/sortcenter/vista/controller/getContainersDetailByCriteria';
const VISTA_OUTBOUND_URL = 'https://trans-logistics-eu.amazon.com/sortcenter/vista/controller/getOutboundDetails';
    const SKYNET_ALERTS_URL = 'https://skynet.amazon.dev/get-alerts';
const SKYNET_ACTION_URL = 'https://skynet.amazon.dev/perform-alert-action';
const SKYNET_VAST_ALERT_NAMES = [
  'Missing Container',
  'Dwelling Container',
  'Chute VPM',
  'Failed Move',
];
const SKYNET_VAST_REFRESH_MS = 30000;
    const HRZ_CPT_URL = 'https://trans-logistics-eu.amazon.com/ssp/dock/hrz/cpt/fetchdata';
    const TANTEI_GRAPHQL_URL = 'https://trans-logistics-eu.amazon.com/sortcenter/tantei/graphql';
    const VAST_TANTEI_TOKEN_STORAGE_KEY = 'watchSorter:tanteiCsrfToken:v1';
const VAST_TANTEI_TOKEN_TS_STORAGE_KEY = 'watchSorter:tanteiCsrfTokenTs:v1';
const VAST_TANTEI_BATCH_SIZE = 50;
const VAST_TANTEI_CACHE_TTL_MS = 2 * 60 * 1000;
    const VAST_TANTEI_TOKEN_TTL_MS = 10 * 60 * 1000;
    const VAST_TANTEI_BOOTSTRAP_TIMEOUT_MS = 20000;
const VAST_TANTEI_BOOTSTRAP_POLL_MS = 500;
    const VAST_AREA_AUDIT_REFRESH_MS = 5 * 60 * 1000;
const VISTA_HOURS_BACK = 36;
  const SELECTORS = {
    attentionAreasList: '.AttentionAreasGroup-list',
  };

    const NORES_DEBUG_COLUMNS = {
  laneStem: false,
  laneVista: false,
  cptVista: false,
  cptHrz: false,
};

const IDS = {
  card: 'ws-attention-card',
  overlay: 'ws-overlay',
  style: 'ws-style',
  tableBody: 'ws-table-body',
  searchInput: 'ws-search-input',
  remapBtn: 'ws-remap-btn',
  closeBtn: 'ws-close-btn',
  statusText: 'ws-status-text',
  mapInfo: 'ws-map-info',
  logsPanel: 'ws-logs-panel',
  logsContent: 'ws-logs-content',
  copyLogsBtn: 'ws-copy-logs-btn',
  clearLogsBtn: 'ws-clear-logs-btn',
  tableHeadRow: 'ws-table-head-row',
  footer: 'ws-footer',
  seriesBar: 'ws-series-bar',
  readinessBar: 'ws-readiness-bar',
      nextCptBar: 'ws-next-cpt-bar',
  cptCard: 'ws-cpt-audit-card',
      vastCard: 'ws-vast-card',
  vastOverlay: 'ws-vast-overlay',
  vastCloseBtn: 'ws-vast-close-btn',
  vastSearchInput: 'ws-vast-search-input',
  vastStatusText: 'ws-vast-status-text',
  vastSeriesBar: 'ws-vast-series-bar',
  vastOperatorTitle: 'ws-vast-operator-title',
  vastOperatorFilterBar: 'ws-vast-operator-filter-bar',
  vastOperatorBody: 'ws-vast-operator-body',
  vastTableBody: 'ws-vast-table-body',
  cptOverlay: 'ws-cpt-overlay',
  cptCloseBtn: 'ws-cpt-close-btn',
  cptSearchInput: 'ws-cpt-search-input',
  cptTimeBar: 'ws-cpt-time-bar',
    cptScopeBar: 'ws-cpt-scope-bar',
  cptSeriesBar: 'ws-cpt-series-bar',
  cptTableBody: 'ws-cpt-table-body',
  cptSummary: 'ws-cpt-summary',
  cptStatusText: 'ws-cpt-status-text',
    cptTableHandle: 'ws-cpt-table-handle',
      cptStageOverlay: 'ws-cpt-stage-overlay',
  cptStageCloseBtn: 'ws-cpt-stage-close-btn',
  cptStageBody: 'ws-cpt-stage-body',
    cptPrintOverlay: 'ws-cpt-print-overlay',
cptPrintCloseBtn: 'ws-cpt-print-close-btn',
cptPrintBody: 'ws-cpt-print-body',
    tabsBar: 'ws-tabs-bar',
    sorterTabBtn: 'ws-tab-sorter',
sorterTabPanel: 'ws-sorter-view',
sorterSearchInput: 'ws-sorter-search-input',
sorterBody: 'ws-sorter-body',
sorterStatusText: 'ws-sorter-status-text',
sorterSummaryBar: 'ws-sorter-summary-bar',
sorterSummaryTotal: 'ws-sorter-summary-total',
  stemTabBtn: 'ws-tab-stem',
  stemTabPanel: 'ws-stem-view',
  stemBody: 'ws-stem-body',
    reportTabBtn: 'ws-tab-report',
reportTabPanel: 'ws-report-view',
reportBody: 'ws-report-body',
  watchTabBtn: 'ws-tab-watch-sorter',
  noResTabBtn: 'ws-tab-no-resources',
  watchTabPanel: 'ws-watch-sorter-view',
  noResTabPanel: 'ws-no-resources-view',
  noResSearchInput: 'ws-no-resources-search-input',
  noResTableBody: 'ws-no-resources-table-body',
  noResStatusText: 'ws-no-resources-status-text',
    noResVistaStatusText: 'ws-no-resources-vista-status-text',
      opsSummary: 'ws-ops-summary',
  opsFreeAreasValue: 'ws-ops-free-areas-value',
  opsMirroredAreasValue: 'ws-ops-mirrored-areas-value',
  opsNeededAreasValue: 'ws-ops-needed-areas-value',
  opsDeallocateReadyValue: 'ws-ops-deallocate-ready-value',
  opsWrongAllocationValue: 'ws-ops-wrong-allocation-value',
      opsFreeAreasMeta: 'ws-ops-free-areas-meta',
  opsMirroredAreasMeta: 'ws-ops-mirrored-areas-meta',
  opsNeededAreasMeta: 'ws-ops-needed-areas-meta',
  opsDeallocateReadyMeta: 'ws-ops-deallocate-ready-meta',
  opsWrongAllocationMeta: 'ws-ops-wrong-allocation-meta',
    watchCompactSummary: 'ws-watch-compact-summary',
  sharedSearchInput: 'ws-shared-search-input',
  sharedSearchStatusText: 'ws-shared-search-status-text',
  readySeriesWrap: 'ws-ready-series-wrap',
  readySeriesTitle: 'ws-ready-series-title',
  readySeriesBody: 'ws-ready-series-body',
      noResSummaryBar: 'ws-nores-summary-bar',
  noResSummaryNoRes: 'ws-nores-summary-nores',
  noResSummaryJackpot: 'ws-nores-summary-jackpot',
  noResSummaryTotal: 'ws-nores-summary-total',
      noResSummaryAllocated: 'ws-nores-summary-allocated',
};

  function parseRoute() {
    const url = new URL(window.location.href);
    const path = url.pathname.replace(/\/+$/, '');
    const parts = path.split('/').filter(Boolean);

    const result = {
      href: url.href,
      pathname: path,
      isForesightRoot: false,
      isSorterDetail: false,
      facility: '',
      sorterName: '',
      nodeKey: '',
    };

    if (parts.length === 1 && parts[0] === 'foresight') {
      result.isForesightRoot = true;
      return result;
    }

    if (parts.length >= 3 && parts[0] === 'foresight') {
      result.isSorterDetail = true;
      result.facility = decodeURIComponent(parts[1] || '').trim();
      result.sorterName = decodeURIComponent(parts[2] || '').trim();
      result.nodeKey = [result.facility, result.sorterName].filter(Boolean).join('/');
      return result;
    }

    return result;
  }

  function getStorageKey(route) {
    const host = window.location.hostname || 'unknown-host';
    const nodePart = route.nodeKey || 'unknown-node';
    return `watchSorterMap:${host}:${nodePart}:v1`;
  }

  const route = parseRoute();

const state = {
  route,
  storageKey: getStorageKey(route),
  runtimeTabId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  structureMap: null,

  vinyaasConfig: {
    rows: [],
    bySf: new Map(),
    laneBySf: new Map(),
    parentFiltersBySf: new Map(),
    loadedAt: 0,
    loading: false,
    error: '',
    status: 'idle',
  },

  rows: [],
  filteredRows: [],
  searchQuery: '',
  sorterSearchQuery: '',
stemSearchQuery: '',

stemAction: {
  area: '',
  stackingFilter: '',
  logs: [],
busy: false,
busyActionKey: '',
busyText: '',
statusType: '',
statusMessage: '',
requestAllocatePopupOpen: false,
  requestAllocateLoading: false,
  requestAllocateError: '',
  requestAllocateAreas: [],
  requestAllocateSelectedArea: '',
  requestAllocateAllocatedAreas: [],
  requestAllocateResourceCacheInfo: '',
  requestAllocateSubmitting: false,
  requestAllocateResultType: '',
  requestAllocateResultMessage: '',
},

stemHierarchy: {
  rows: [],
  lanesBySf: new Map(),
  lastSnapshotAt: 0,
  status: 'idle',
},

activeSeries: new Set(),
  seriesButtons: [],
  activeReadiness: new Set(),
      activeNextCptFilters: new Set(),
    activeMirrorNeededFilters: new Set(),
  readinessCounts: { ready: 0, monitor: 0 },
  sortKey: '',
  sortDir: 'desc',
  overlayOpen: false,
  lastLiveUpdateAt: 0,
  lastLiveNodeId: '',
  latestRawPayload: null,
  logsVisible: false,
      activeRecirculationTab: 'watchSorter',
readyAreaTantei: {
  byArea: {},
  loading: false,
  loadedAt: 0,
  cacheKey: '',
  refreshingAreas: new Set(),
  refreshTimer: null,
  deallocatingAreas: new Set(),
  deallocateStatusByArea: {},
},
noResources: {
  rows: [],
  filteredRows: [],
  searchQuery: '',
  sortKey: 'cptMs',
  sortDir: 'asc',
  vistaCountsByFilter: {},
vistaSummaryByFilter: {},
vistaLaneByFilter: {},
vistaLaneToCpt: {},
jackpotLaneToCpt: {},
hrzLaneToCpt: {},
vistaLoadedAt: 0,
vistaLoading: false,
vistaError: '',
},

    outbound: {
  loads: [],
  lastFetchTs: 0,
},
stackedVista: {
  rows: [],
  filteredRows: [],
  loadedAt: 0,
  loading: false,
  error: '',
},
stageVista: {
  rows: [],
  loadedAt: 0,
  loading: false,
  error: '',
  activeLane: '',
  refreshTimer: null,
},
    loadedVista: {
  rows: [],
  loadedAt: 0,
  loading: false,
  error: '',
  activeLane: '',
  refreshTimer: null,
},

vast: {
  overlayOpen: false,
  searchQuery: '',
  activeTab: 'Missing Container',
  alerts: [],
  filteredRows: [],
  loading: false,
  error: '',
  loadedAt: 0,
  refreshTimer: null,
  liveTimer: null,
  solvingFingerprints: new Set(),

  areaAuditRows: [],
  areaAuditLoading: false,
  areaAuditLoadedAt: 0,
  areaAuditError: '',
    tanteiToken: '',
tanteiTokenLoadedAt: 0,
tanteiBootstrapRunning: false,
    areaAuditRefreshTimer: null,
},

cptAudit: {
  searchQuery: '',
  activeCptTimes: new Set(),
  activeSeries: new Set(),
  timeScopeHours: 4,
  leftTableHidden: false,
  filteredRows: [],
  overlayOpen: false,
  expandedRowKeys: new Set(),
  snapshotMap: {},
  snapshotStorageKey: `watchSorterCptAuditSnapshots:${getStorageKey(route)}`,
  stageOpen: false,
  stageRowKey: '',
  stageSortKey: 'location',
  stageSortDir: 'asc',
loadedOpen: false,
loadedRowKey: '',
loadedSortKey: 'containerId',
loadedSortDir: 'asc',


  printScopeHours: 4,
  printSelectedSeries: new Set(),
  printCopiesBySeries: {},
  printPopupOpen: false,
printSavedFilters: null,
printFullAuditor: false,
printSnapshotRows: [],
printSnapshotCreatedAt: 0,
},
};

  const runtimeLogs = [];

  function stringifyLogPart(part) {
    if (typeof part === 'string') return part;
    if (part instanceof Error) return `${part.name}: ${part.message}`;
    try {
      return JSON.stringify(part, null, 2);
    } catch {
      return String(part);
    }
  }

    function debugVistaMatch(payload) {
  appendRuntimeLog('MATCH', [payload]);
}

  function appendRuntimeLog(level, args) {
    const ts = new Date().toLocaleTimeString();
    const message = args.map(stringifyLogPart).join(' ');
    const line = `[${ts}] [${level}] ${message}`;
    runtimeLogs.push(line);
if (runtimeLogs.length > 200) runtimeLogs.shift();
    const logsContent = document.getElementById(IDS.logsContent);
    if (logsContent) {
      logsContent.textContent = runtimeLogs.join('\n');
      logsContent.scrollTop = logsContent.scrollHeight;
    }
  }

  function log(...args) {
    console.log(`[${SCRIPT_NAME}]`, ...args);
    appendRuntimeLog('INFO', args);
  }

  function warn(...args) {
    console.warn(`[${SCRIPT_NAME}]`, ...args);
    appendRuntimeLog('WARN', args);
  }

  function error(...args) {
    console.error(`[${SCRIPT_NAME}]`, ...args);
    appendRuntimeLog('ERROR', args);
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

    function buildTanteiUrlForArea(areaName) {
  const facility = String(state?.route?.facility || '').trim();
  const area = String(areaName || '').trim();
  if (!facility || !area) return '#';

  const url = new URL('https://trans-logistics-eu.amazon.com/sortcenter/tantei');
  url.searchParams.set('nodeId', facility);
  url.searchParams.set('searchType', 'Container');
  url.searchParams.set('searchId', area);
  return url.toString();
}

function renderAreaLink(areaName, extraClass = '') {
  const safeArea = String(areaName || '').trim();
  if (!safeArea) return '-';

  const href = buildTanteiUrlForArea(safeArea);
  const cls = extraClass ? ` class="${escapeHtml(extraClass)}"` : '';

  return `<a${cls} href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(safeArea)}</a>`;
}

  function normalizeText(value) {
    return String(value ?? '').trim().toLowerCase();
  }

    function getNoResHiddenColumnStyle(columnKey) {
  return NORES_DEBUG_COLUMNS[columnKey] ? '' : 'display:none;';
}

function normalizeStackingFilterForBridge(value) {
  return String(value || '').trim().replace(/-MERGE$/i, '').toUpperCase();
}

function normalizeVinyaasKey(value) {
  return String(value || '').trim().toUpperCase();
}

function getVinyaasStorageKey() {
  const nodeId = String(state?.route?.facility || '').trim() || 'unknown-node';
  return `watchSorterVinyaasConfig:${nodeId}:v1`;
}

function getVinyaasUrl() {
  const nodeId = String(state?.route?.facility || '').trim();
  if (!nodeId) return '';
  return `${VINYAAS_CONFIG_URL}?nodeId=${encodeURIComponent(nodeId)}`;
}

function gmGetJson(url) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url,
      headers: {
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
      },
      onload: response => {
        try {
          const text = String(response?.responseText || '');
          const json = JSON.parse(text);
          resolve(json);
        } catch (err) {
          reject(err);
        }
      },
      onerror: err => reject(err),
      ontimeout: err => reject(err),
    });
  });
}

function parseVinyaasConfig(data) {
  const rows = [];
  const bySf = new Map();
  const laneBySf = new Map();
  const parentFiltersBySf = new Map();

  const entities = data?.ret?.entities;
  const elements = data?.ret?.elements;

  if (!Array.isArray(entities) || !Array.isArray(elements)) {
    return { rows, bySf, laneBySf, parentFiltersBySf };
  }

  const colIdx = {};
  entities.forEach((name, idx) => {
    colIdx[String(name || '').trim()] = idx;
  });

  const sfIdx = colIdx['STACKING FILTER'];
  const laneIdx = colIdx['LANE'];
  const laneTypeIdx = colIdx['LANE TYPE'];
  const parentIdx = colIdx['PARENT STACKING FILTERS'];
  const outputCtIdx = colIdx['OUTPUT CONTAINER TYPE(S)'];
  const containerTypeIdx = colIdx['CONTAINER TYPE'];
  const categoryIdx = colIdx['CATEGORY NAME'];
  const sortCodeIdx = colIdx['SORT CODE'];

  for (const element of elements) {
    if (!Array.isArray(element)) continue;

    const sfRaw = sfIdx !== undefined ? String(element[sfIdx] || '').trim() : '';
    const laneRaw = laneIdx !== undefined ? String(element[laneIdx] || '').trim() : '';

    if (!sfRaw) continue;

    const sfKey = normalizeVinyaasKey(sfRaw);
    const lane = laneRaw || '-';

    const parentText = parentIdx !== undefined ? String(element[parentIdx] || '').trim() : '';
    const parents = parentText
      ? parentText.split(',').map(x => normalizeVinyaasKey(x)).filter(Boolean)
      : [];

    const item = {
      stackingFilter: sfRaw,
      stackingFilterKey: sfKey,
      lane,
      laneType: laneTypeIdx !== undefined ? String(element[laneTypeIdx] || '').trim() : '',
      parents,
      outputContainerTypes: outputCtIdx !== undefined ? String(element[outputCtIdx] || '').trim() : '',
      containerType: containerTypeIdx !== undefined ? String(element[containerTypeIdx] || '').trim() : '',
      categoryName: categoryIdx !== undefined ? String(element[categoryIdx] || '').trim() : '',
      sortCode: sortCodeIdx !== undefined ? String(element[sortCodeIdx] || '').trim() : '',
    };

    rows.push(item);

    if (!bySf.has(sfKey)) {
      bySf.set(sfKey, item);
    } else if (bySf.get(sfKey)?.lane === '-' && lane !== '-') {
      bySf.set(sfKey, item);
    }

    if (lane && lane !== '-') {
      laneBySf.set(sfKey, lane);
      laneBySf.set(normalizeStackingFilterForBridge(sfRaw), lane);
    }

    if (parents.length) {
      parentFiltersBySf.set(sfKey, parents);
    }
  }

  return { rows, bySf, laneBySf, parentFiltersBySf };
}

function applyVinyaasConfig(parsed, meta = {}) {
  state.vinyaasConfig.rows = parsed.rows || [];
  state.vinyaasConfig.bySf = parsed.bySf || new Map();
  state.vinyaasConfig.laneBySf = parsed.laneBySf || new Map();
  state.vinyaasConfig.parentFiltersBySf = parsed.parentFiltersBySf || new Map();
  state.vinyaasConfig.loadedAt = Number(meta.loadedAt || Date.now());
  state.vinyaasConfig.error = '';
  state.vinyaasConfig.status =
    `loaded rows=${state.vinyaasConfig.rows.length} lanes=${state.vinyaasConfig.laneBySf.size}`;

  state.noResources.rows = attachVinyaasLaneToNoResourceRows(state.noResources.rows);

  if (state.overlayOpen && state.activeRecirculationTab === 'noResources') {
    applyNoResourceSearch(state.noResources.searchQuery || '');
  }

  if (state.cptAudit.overlayOpen) {
    renderCptAudit();
  }
}

function readVinyaasCache() {
  try {
    const raw = localStorage.getItem(getVinyaasStorageKey());
    if (!raw) return null;

    const cached = JSON.parse(raw);
    const ts = Number(cached?.loadedAt || 0);
    if (!ts || Date.now() - ts > VINYAAS_CACHE_TTL_MS) return null;

    return cached;
  } catch {
    return null;
  }
}

function writeVinyaasCache(payload) {
  try {
    localStorage.setItem(getVinyaasStorageKey(), JSON.stringify(payload));
  } catch (err) {
    warn('Failed to write Vinyaas cache', err);
  }
}

async function refreshVinyaasConfig(options = {}) {
  if (state.vinyaasConfig.loading) return false;

  const force = Boolean(options.force);
  const cached = !force ? readVinyaasCache() : null;

  if (cached?.data) {
    const parsed = parseVinyaasConfig(cached.data);
    applyVinyaasConfig(parsed, { loadedAt: cached.loadedAt });
    log('Vinyaas config loaded from cache', state.vinyaasConfig.status);
    return true;
  }

  const url = getVinyaasUrl();
  if (!url) {
    state.vinyaasConfig.status = 'no nodeId';
    return false;
  }

  state.vinyaasConfig.loading = true;
  state.vinyaasConfig.status = 'loading';

  try {
    const data = await gmGetJson(url);
    const loadedAt = Date.now();

    writeVinyaasCache({
      schemaVersion: 1,
      nodeId: String(state?.route?.facility || '').trim(),
      loadedAt,
      data,
    });

    const parsed = parseVinyaasConfig(data);
    applyVinyaasConfig(parsed, { loadedAt });

    log('Vinyaas config refreshed', state.vinyaasConfig.status);
    return true;
  } catch (err) {
    state.vinyaasConfig.error = err?.message || String(err);
    state.vinyaasConfig.status = `failed: ${state.vinyaasConfig.error}`;
    error('Failed to refresh Vinyaas config', err);
    return false;
  } finally {
    state.vinyaasConfig.loading = false;
  }
}

function scheduleVinyaasRefresh() {
  window.setInterval(() => {
    refreshVinyaasConfig({ force: true });
  }, VINYAAS_CACHE_TTL_MS);
}

function getLaneForStackingFilter(stackingFilter) {
  const rawKey = normalizeVinyaasKey(stackingFilter);
  const bridgeKey = normalizeStackingFilterForBridge(stackingFilter);

  if (!rawKey && !bridgeKey) return '-';

  return (
    state.vinyaasConfig.laneBySf.get(rawKey) ||
    state.vinyaasConfig.laneBySf.get(bridgeKey) ||
    '-'
  );
}

function attachVinyaasLaneToNoResourceRows(rows) {
  return (Array.isArray(rows) ? rows : []).map(row => {
    return {
      ...row,
      lane: getLaneForStackingFilter(row?.stackingFilter),
      laneVista: getVistaLaneForStackingFilter(row?.stackingFilter),
    };
  });
}
  function tokenMatchesPrefix(token, query) {
    return normalizeText(token).startsWith(query);
  }

function rowMatchesQuery(row, queryRaw) {
  const query = normalizeText(queryRaw);
  if (!query) return true;

  if (tokenMatchesPrefix(row.stackingFilter, query)) return true;
  if (tokenMatchesPrefix(row.lane, query)) return true;
  if (tokenMatchesPrefix(row.door, query)) return true;

  return (row.areas || []).some(area => tokenMatchesPrefix(area, query));
}

  function inferAreaType(areaName) {
    const value = String(areaName || '').trim();
    if (!value) return 'Other';
    const dashIndex = value.indexOf('-');
    if (dashIndex > 0) return value.slice(0, dashIndex);
    return 'Other';
  }

  function inferAreaSortKey(areaName) {
    const value = String(areaName || '').trim();
    const match = value.match(/^([A-Za-z]+)-(\d+)(.*)$/);
    if (!match) return value;
    const [, prefix, number, suffix] = match;
    return `${prefix}|${String(Number(number)).padStart(6, '0')}|${suffix || ''}`;
  }

  function inferAreaSeries(areaName) {
    const value = String(areaName || '').trim();
    const match = value.match(/^([A-Za-z]+)-(\d+)/);
    if (!match) return '';

    const [, prefix, numberText] = match;
    const number = Number(numberText);
    if (!Number.isFinite(number)) return '';

    const base = Math.floor(number / 100) * 100;
    return `${prefix}-${base}`;
  }

  function extractSeriesButtonsFromRows(rows) {
    const set = new Set();

    for (const row of rows) {
      for (const area of row.areas || []) {
        const series = inferAreaSeries(area);
        if (series) set.add(series);
      }
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  function rowMatchesActiveSeries(row) {
    if (!state.activeSeries || state.activeSeries.size === 0) return true;

    return (row.areas || []).some(area => {
      return areaMatchesActiveSeries(area);
    });
  }

  function areaMatchesActiveSeries(areaName) {
    if (!state.activeSeries || state.activeSeries.size === 0) return true;

    const series = inferAreaSeries(areaName);
    return Boolean(series) && state.activeSeries.has(series);
  }

function filterRows(rows, query) {
  return rows.filter(row => {
    const baseMatch =
      rowMatchesQuery(row, query) &&
      rowMatchesActiveSeries(row) &&
      rowMatchesActiveReadiness(row) &&
      rowMatchesNextCptFilter(row);

    if (!baseMatch) return false;

    if (
      state.activeMirrorNeededFilters &&
      state.activeMirrorNeededFilters.size > 0 &&
      state.activeMirrorNeededFilters.has('mirrorNeeded')
    ) {
      return Boolean(getAdditionalAreaNeedForRow(row));
    }

    return true;
  });
}

  function getRowSortValue(row, sortKey) {
    switch (sortKey) {
      case 'areasCount':
        return Number(row.areasCount || 0);
            case 'areas': {
  const firstArea = Array.isArray(row.areas) && row.areas.length ? row.areas[0] : '';
  return inferAreaSortKey(firstArea);
}
      case 'onSorterNow':
        return Number(row.metrics?.onSorterNow || 0);
      case 'm15':
        return Number(row.metrics?.m15 || 0);
      case 'm30':
        return Number(row.metrics?.m30 || 0);
      case 'm60':
        return Number(row.metrics?.m60 || 0);
      case 'm120':
        return Number(row.metrics?.m120 || 0);
      case 'm240':
        return Number(row.metrics?.m240 || 0);
      case 'cptMs':
        return Number(row.cptMs || 0);
      default:
        return 0;
    }
  }

function sortRows(rows) {
  const inputRows = [...rows];

  const normalRows = inputRows.filter(row => !isFreeWatchSorterRow(row));
  const freeRows = inputRows.filter(row => isFreeWatchSorterRow(row));

  const sortChunk = (chunk) => {
    if (!state.sortKey) {
      return [...chunk];
    }

    return [...chunk].sort((a, b) => {
      const aValue = getRowSortValue(a, state.sortKey);
      const bValue = getRowSortValue(b, state.sortKey);

      if (aValue === bValue) {
        return a.stackingFilter.localeCompare(b.stackingFilter);
      }

      const bothNumbers =
        typeof aValue === 'number' &&
        typeof bValue === 'number' &&
        Number.isFinite(aValue) &&
        Number.isFinite(bValue);

      if (bothNumbers) {
        if (state.sortDir === 'asc') {
          return aValue - bValue;
        }
        return bValue - aValue;
      }

      const aText = String(aValue ?? '');
      const bText = String(bValue ?? '');

      if (state.sortDir === 'asc') {
        return aText.localeCompare(bText);
      }

      return bText.localeCompare(aText);
    });
  };

  const sortedNormal = sortChunk(normalRows);
  const sortedFree = [...freeRows].sort((a, b) => {
    const aArea = Array.isArray(a?.areas) && a.areas.length ? a.areas[0] : '';
    const bArea = Array.isArray(b?.areas) && b.areas.length ? b.areas[0] : '';
    return inferAreaSortKey(aArea).localeCompare(inferAreaSortKey(bArea));
  });

  return [...sortedNormal, ...sortedFree];
}

  function getSortIndicator(sortKey) {
    if (state.sortKey !== sortKey) return ' ↕';
    return state.sortDir === 'asc' ? ' ▲' : ' ▼';
  }

    function getStageSortIndicator(sortKey) {
  if (state.cptAudit.stageSortKey !== sortKey) return ' ↕';
  return state.cptAudit.stageSortDir === 'asc' ? ' ▲' : ' ▼';
}

    function sortVistaStageRows(rows) {
  const sortKey = state.cptAudit.stageSortKey || 'location';
  const sortDir = state.cptAudit.stageSortDir || 'asc';

  const sorted = [...(Array.isArray(rows) ? rows : [])];

  sorted.sort((a, b) => {
    let aValue;
    let bValue;

    switch (sortKey) {
      case 'location':
        aValue = String(a?.location || '').trim();
        bValue = String(b?.location || '').trim();
        break;

      case 'contentCount':
        aValue = Number(a?.contentCount || 0);
        bValue = Number(b?.contentCount || 0);
        break;

      case 'stackingFilter':
        aValue = String(a?.stackingFilter || '').trim();
        bValue = String(b?.stackingFilter || '').trim();
        break;

      case 'dwellTime':
        aValue = Number(a?.dwellTimeMinutes || 0);
        bValue = Number(b?.dwellTimeMinutes || 0);
        break;

      default:
        aValue = String(a?.location || '').trim();
        bValue = String(b?.location || '').trim();
        break;
    }

    const bothNumbers =
      typeof aValue === 'number' &&
      typeof bValue === 'number' &&
      Number.isFinite(aValue) &&
      Number.isFinite(bValue);

    if (bothNumbers) {
      if (aValue !== bValue) {
        return sortDir === 'asc' ? aValue - bValue : bValue - aValue;
      }
    } else {
      const cmp = String(aValue).localeCompare(String(bValue));
      if (cmp !== 0) {
        return sortDir === 'asc' ? cmp : -cmp;
      }
    }

    return String(a?.containerId || '').localeCompare(String(b?.containerId || ''));
  });

  return sorted;
}

  function formatCpt(ms) {
    if (!Number.isFinite(ms) || ms <= 0) return '-';
    try {
      return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(ms));
    } catch {
      return String(ms);
    }
  }

    function parseLoosePackageKey(rawKey) {
  const value = String(rawKey || '').trim();
  const plusIndex = value.indexOf('+');

  if (plusIndex === -1) {
    return {
      rawKey: value,
      sorterName: '',
      stackingFilter: value,
    };
  }

  return {
    rawKey: value,
    sorterName: value.slice(0, plusIndex).trim(),
    stackingFilter: value.slice(plusIndex + 1).trim(),
  };
}

function extractNoResourceRowsFromPayload(payload) {
  const facilityProjection =
    payload?.data?.facilityProjections ||
    payload?.facilityProjections ||
    null;

  if (!facilityProjection) {
    log('NoResources: facilityProjections not found');
    return [];
  }

  const topEdges = facilityProjection?.destinations?.edges || [];
  let looseList = [];

  for (const edge of topEdges) {
    const vertex = edge?.vertex;
    if (!vertex) continue;

    if (vertex.type === 'SORTER') {
      const candidate = vertex?.loosePackages?.loosePackages60min;
      if (Array.isArray(candidate)) {
        looseList = candidate;
        break;
      }
    }
  }

  if (!Array.isArray(looseList) || !looseList.length) {
    log('NoResources: loosePackages60min not found under SORTER vertex', payload);
    return [];
  }

  log('NoResources: loosePackages60min found', looseList);

  return looseList
    .map(item => {
      const parsed = parseLoosePackageKey(item?.stackingFilter);
      return {
        rawKey: parsed.rawKey,
        sorterName: parsed.sorterName,
        stackingFilter: parsed.stackingFilter,
        count: Number(item?.count || 0),
      };
    })
    .filter(row => row.count > 0)
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.stackingFilter.localeCompare(b.stackingFilter);
    });
}

function filterNoResourceRows(rows, queryRaw) {
  const query = normalizeText(queryRaw);
  if (!query) return [...rows];

  return rows.filter(row => {
    if (tokenMatchesPrefix(row.stackingFilter, query)) return true;
    if (tokenMatchesPrefix(row.lane, query)) return true;
if (tokenMatchesPrefix(row.laneVista, query)) return true;

    const eligibleAreas = getEligibleAreasForNoResourceRow(row);
    return eligibleAreas.some(area => tokenMatchesPrefix(area, query));
  });
}

    function renderNoResourceAreaCell(row, eligibleAreas) {
  if (Array.isArray(eligibleAreas) && eligibleAreas.length) {
    return escapeHtml(eligibleAreas.join(', '));
  }

  const sf = String(row?.stackingFilter || '').trim();
  if (!sf) return '-';

  const actionKey = `requestAllocate:${sf}`;
  const busy = isStemBusy();
  const current = isCurrentStemAction(actionKey);

  return `
    <button
      type="button"
      class="ws-btn ws-nores-allocate-btn"
      data-nores-allocate-sf="${escapeHtml(sf)}"
      ${busy ? 'disabled' : ''}
      style="padding:4px 10px; border-radius:14px; font-size:12px; font-weight:800; ${busy ? 'opacity:0.55; cursor:not-allowed;' : ''}"
    >
      ${current ? 'In progress...' : 'Allocate'}
    </button>
  `;
}

function renderNoResourceRows(rows) {
  const tbody = document.getElementById(IDS.noResTableBody);
if (!rows.length) {
  tbody.innerHTML = `
    <tr>
      <td colspan="${6 + (NORES_DEBUG_COLUMNS.laneStem ? 1 : 0) + (NORES_DEBUG_COLUMNS.laneVista ? 1 : 0) + (NORES_DEBUG_COLUMNS.cptVista ? 1 : 0) + (NORES_DEBUG_COLUMNS.cptHrz ? 1 : 0)}" class="ws-empty">No no-resource rows</td>
    </tr>
  `;
  return;
}

  tbody.innerHTML = rows.map(row => {
const eligibleAreas = getEligibleAreasForNoResourceRow(row);
const areaHtml = renderNoResourceAreaCell(row, eligibleAreas);

const laneStemText = row?.lane || getLaneForStackingFilter(row?.stackingFilter) || '-';
const laneVistaText = row?.laneVista || getVistaLaneForStackingFilter(row?.stackingFilter) || '-';

const vistaCptText = getVistaCptTextForRow(row);
const hrzCptText = getHrzCptTextForRow(row);

const effectiveCpt = getEffectiveCpt(row);
const cptText = effectiveCpt ? formatCpt(effectiveCpt) : '-';
const total = getNoResourceTotal(row);

const isPassed = isNoResourceCptPassed(row);
const isUrgent = isNoResourceCptUrgent(row);
const isAreaValid = isNoResourceAreaValid(row);

let rowClass = '';
if (isPassed) {
  rowClass = 'ws-nores-row-passed';
} else if (isUrgent) {
  rowClass = 'ws-nores-row-urgent';
} else if (isAreaValid) {
  rowClass = 'ws-nores-row-valid';
}

const areaCellClass = isAreaValid ? 'ws-nores-area-valid' : '';
const cptCellClass = isPassed
  ? 'ws-nores-cpt-passed'
  : (isUrgent ? 'ws-nores-cpt-urgent' : '');

    return `
<tr class="${rowClass}">
  <td>${escapeHtml(row.stackingFilter)}</td>
  <td style="${getNoResHiddenColumnStyle('laneStem')}">${escapeHtml(laneStemText)}</td>
  <td style="${getNoResHiddenColumnStyle('laneVista')}">${escapeHtml(laneVistaText)}</td>
  <td>${escapeHtml(Number(row.count || 0))}</td>
  <td>${escapeHtml(Number(row.vistaCount || 0))}</td>
  <td>${escapeHtml(total)}</td>
  <td style="${getNoResHiddenColumnStyle('cptVista')}">${escapeHtml(vistaCptText)}</td>
  <td style="${getNoResHiddenColumnStyle('cptHrz')}">${escapeHtml(hrzCptText)}</td>
  <td class="${cptCellClass}">${escapeHtml(cptText)}</td>
  <td class="${areaCellClass}">${areaHtml}</td>
</tr>
    `;
  }).join('');
      tbody.querySelectorAll('[data-nores-allocate-sf]').forEach(btn => {
    btn.addEventListener('click', async event => {
      event.preventDefault();
      event.stopPropagation();

      const sf = String(btn.getAttribute('data-nores-allocate-sf') || '').trim();
      if (!sf) return;

      state.stemAction.area = '';
      state.stemAction.stackingFilter = sf;

installStemLogListener();
await handleStemAction('requestAllocate');
    });
  });
}

function getNoResourceSummaryCounts() {
  const rows = Array.isArray(state.noResources.rows) ? state.noResources.rows : [];

  let noResSf = 0;
  let noResPkgs = 0;

  let jackpotSf = 0;
  let jackpotPkgs = 0;

  let allocatedSf = 0;
  let allocatedPkgs = 0;

  let totalSf = 0;
  let totalPkgs = 0;

  for (const row of rows) {
    const noResCount = Number(row?.count || 0);
    const jackpotCount = Number(row?.vistaCount || 0);
    const totalCount = noResCount + jackpotCount;
    const isAllocated = isNoResourceAreaValid(row);

    if (noResCount > 0) {
      noResSf += 1;
      noResPkgs += noResCount;
    }

    if (jackpotCount > 0) {
      jackpotSf += 1;
      jackpotPkgs += jackpotCount;
    }

    if (isAllocated && totalCount > 0) {
      allocatedSf += 1;
      allocatedPkgs += totalCount;
    }

    if (totalCount > 0) {
      totalSf += 1;
      totalPkgs += totalCount;
    }
  }

  return {
    noRes: { sf: noResSf, pkgs: noResPkgs },
    jackpot: { sf: jackpotSf, pkgs: jackpotPkgs },
    allocated: { sf: allocatedSf, pkgs: allocatedPkgs },
    total: { sf: totalSf, pkgs: totalPkgs },
  };
}

function formatNoResSummaryPillHtml(title, stats) {
  const safe = stats || { sf: 0, pkgs: 0 };

  return `
    <div class="ws-nores-summary-title">${escapeHtml(title)}</div>
    <div class="ws-nores-summary-metrics">
      <div class="ws-nores-summary-metric">
        <span class="ws-nores-summary-metric-label">SF</span>
        <span class="ws-nores-summary-metric-value">${escapeHtml(safe.sf)}</span>
      </div>
      <div class="ws-nores-summary-metric">
        <span class="ws-nores-summary-metric-label">Pkgs</span>
        <span class="ws-nores-summary-metric-value">${escapeHtml(safe.pkgs)}</span>
      </div>
    </div>
  `;
}

function renderNoResourceSummaryBar() {
  const noResEl = document.getElementById(IDS.noResSummaryNoRes);
  const jackpotEl = document.getElementById(IDS.noResSummaryJackpot);
  const allocatedEl = document.getElementById(IDS.noResSummaryAllocated);
  const totalEl = document.getElementById(IDS.noResSummaryTotal);

  if (!noResEl || !jackpotEl || !allocatedEl || !totalEl) return;

  const counts = getNoResourceSummaryCounts();

  noResEl.innerHTML = formatNoResSummaryPillHtml('No Resources', counts.noRes);
  jackpotEl.innerHTML = formatNoResSummaryPillHtml('Jackpot', counts.jackpot);
  allocatedEl.innerHTML = formatNoResSummaryPillHtml('Allocated', counts.allocated);
  totalEl.innerHTML = formatNoResSummaryPillHtml('Total', counts.total);
}

function setNoResourceStatus(text) {
  const el = document.getElementById(IDS.noResStatusText);
  if (el) {
    el.textContent = `Status: ${text}`;
  }
}

function applyNoResourceSearch(query) {
  state.noResources.searchQuery = query;

  const filtered = filterNoResourceRows(state.noResources.rows, query);
  const sorted = sortNoResourceRows(filtered);

  state.noResources.filteredRows = sorted;

renderNoResourceRows(sorted);
renderNoResourceSummaryBar();
setNoResourceStatus(`filtered ${sorted.length}/${state.noResources.rows.length}`);
}

  function createMetricMap(packages) {
    const result = Object.create(null);
    if (!Array.isArray(packages)) return result;
    for (const item of packages) {
      const id = item?.id;
      const count = Number(item?.count ?? 0);
      if (!id) continue;
      result[id] = Number.isFinite(count) ? count : 0;
    }
    return result;
  }

  function getMetric(metricMap, key) {
    return Number(metricMap?.[key] ?? 0);
  }

  function getCriticalPullTimeMs(raw) {
    if (raw == null) return null;

    if (typeof raw === 'number') {
      return Number.isFinite(raw) ? raw : null;
    }

    if (typeof raw === 'string') {
      const num = Number(raw);
      return Number.isFinite(num) ? num : null;
    }

    if (typeof raw === 'object') {
      const parsed = Number(raw.parsedValue);
      if (Number.isFinite(parsed)) return parsed;

      const source = Number(raw.source);
      if (Number.isFinite(source)) {
        return source < 1e12 ? Math.round(source * 1000) : source;
      }
    }

    return null;
  }
  function isZeroRow(row) {
    const m = row.metrics || {};
    return (
      Number(m.onSorterNow || 0) === 0 &&
      Number(m.m15 || 0) === 0 &&
      Number(m.m30 || 0) === 0 &&
      Number(m.m60 || 0) === 0 &&
      Number(m.m120 || 0) === 0 &&
      Number(m.m240 || 0) === 0
    );
  }

  function getMinutesToCpt(cptMs) {
    if (!Number.isFinite(cptMs) || cptMs <= 0) return null;
    return (cptMs - Date.now()) / 60000;
  }

    function isWithinCptAuditScope(cptMs) {
  const minutes = getMinutesToCpt(cptMs);
  if (minutes === null || minutes < 0) return false;

  const scopeHours = state.cptAudit.timeScopeHours;
  if (scopeHours == null) return true;

  return minutes <= scopeHours * 60;
}

function isWithinCptWindow(cptMs) {
  const minutes = getMinutesToCpt(cptMs);
  return minutes !== null && minutes >= 0;
}

function formatCptTimeLabel(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return '';

  const d = new Date(ms);
  const dd = String(d.getDate()).padStart(2, '0');
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');

  return `${dd}.${MM}.${yyyy} ${hh}:${mm}`;
}

    function formatDwellTime(minutesValue) {
  const totalMinutes = Number(minutesValue || 0);

  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return '-';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function parseCptTimeLabelToMs(label) {
  const match = String(label || '').match(
    /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/
  );
  if (!match) return Number.POSITIVE_INFINITY;

  const [, dd, MM, yyyy, hh, mm] = match;
  return new Date(
    Number(yyyy),
    Number(MM) - 1,
    Number(dd),
    Number(hh),
    Number(mm),
    0,
    0
  ).getTime();
}
    function getDateFromCptLabel(label) {
  const match = String(label || '').match(/^(\d{2}\.\d{2}\.\d{4}) /);
  return match ? match[1] : '';
}
function getIncomingTo60(row) {
  const m = row.metrics || {};
  return (
    Number(m.onSorterNow || 0) +
    Number(m.m15 || 0) +
    Number(m.m30 || 0) +
    Number(m.m60 || 0)
  );
}

function getCptAuditRowColor(row) {
  const incomingTo60 = getIncomingTo60(row);
  if (incomingTo60 === 0) return 'green';
  if (incomingTo60 < 5) return 'yellow';
  return 'orange';
}

function getCptAuditBaseRows() {
  const rows = Array.isArray(state.rows) ? state.rows : [];

  return rows
    .filter(row => !isFreeWatchSorterRow(row))
    .filter(row => {
      const cptMs = Number(row?.cptMs || 0);
      const lane = getLaneForCptRow(row);
      const stackingFilter = String(row?.stackingFilter || '').trim();
      const sweeperMs = Number(
        getSweeperForCptRow({ lane, stackingFilter }) || 0
      );

      return (
        isWithinCptAuditScope(cptMs) ||
        isWithinCptAuditScope(sweeperMs)
      );
    })
    .map(row => {
      const sweeperMs = Number(
        getSweeperForCptRow({
          lane: getLaneForCptRow(row),
          stackingFilter: String(row?.stackingFilter || '').trim()
        }) || 0
      );
      const cptMs = Number(getHrzCptForCptRow(row) || 0);

      return {
        lane: getLaneForCptRow(row),
        stackingFilter: String(row?.stackingFilter || '').trim(),
        areas: Array.isArray(row?.areas) ? [...row.areas] : [],
        areasCount: Number(row?.areasCount || (Array.isArray(row?.areas) ? row.areas.length : 0) || 0),
        sweeperMs,
        cptMs,
        door: getDoorForCptRow(row),
        metrics: {
          onSorterNow: Number(row?.metrics?.onSorterNow || 0),
          m15: Number(row?.metrics?.m15 || 0),
          m30: Number(row?.metrics?.m30 || 0),
          m60: Number(row?.metrics?.m60 || 0),
        },
      };
    });
}

function rowMatchesCptAuditSeries(row) {
  const activeSeries = state.cptAudit.activeSeries;

  if (!activeSeries || activeSeries.size === 0) return true;

  const areas = Array.isArray(row?.areas) ? row.areas : [];

  return areas.some(area => {
    const series = inferAreaSeries(area);
    return Boolean(series) && activeSeries.has(series);
  });
}

function rowMatchesCptAuditTime(row) {
  const active = state.cptAudit.activeCptTimes;
  if (!active || active.size === 0) return true;

  const cptMs = Number(row?.cptMs || 0);
  const cptLabel = formatCptTimeLabel(cptMs);
  if (cptLabel && active.has(`cpt|${cptLabel}`)) return true;

  const sweeperMs = getCptAuditSweeperMs(row);

if (
  sweeperMs > 0 &&
  sweeperMs !== cptMs &&
  sweeperMs >= Date.now()
) {
    const sweeperLabel = formatCptTimeLabel(sweeperMs);
    if (sweeperLabel && active.has(`sweeper|${sweeperLabel}`)) return true;
  }

  return false;
}
function rowMatchesCptAuditQuery(row, queryRaw) {
  return rowMatchesQuery(row, queryRaw);
}

    function getOutboundLaneCandidates(row) {
  const laneFromStem = getLaneForStackingFilter(row?.stackingFilter);
  const laneFromVista = getVistaLaneForStackingFilter(row?.stackingFilter);

  return [
    String(row?.lane || '').trim(),
    String(laneFromStem || '').trim(),
    String(laneFromVista || '').trim(),
  ].filter(Boolean);
}

function getOutboundMatchesForRow(row) {
  const candidates = getOutboundLaneCandidates(row);
  if (!candidates.length) return [];

  const outboundLoads = Array.isArray(state.outbound?.loads) ? state.outbound.loads : [];
  const results = [];
  const seen = new Set();

  for (const candidate of candidates) {
    for (const load of outboundLoads) {
      const lane = String(load?.lane || '').trim();
      if (!lane) continue;

      const isExact = lane === candidate;

      const upperLane = lane.toUpperCase();
      const upperCandidate = candidate.toUpperCase();
      const isLoose =
        upperLane === upperCandidate ||
        upperLane.includes(upperCandidate) ||
        upperCandidate.includes(upperLane);

      if (!isExact && !isLoose) continue;

      const key = [
        lane,
        Number(load?.sdtMs || 0),
        Number(load?.cptMs || 0),
        String(load?.door || '').trim(),
      ].join('||');

      if (seen.has(key)) continue;
      seen.add(key);
      results.push(load);
    }
  }

  return results;
}

function getBestOutboundSweeperMatchForRow(row) {
  const matches = getOutboundMatchesForRow(row);
  const now = Date.now();

  const futureMatches = matches
    .filter(load => Number(load?.sdtMs || 0) > now)
    .sort((a, b) => Number(a?.sdtMs || 0) - Number(b?.sdtMs || 0));

  if (futureMatches.length) return futureMatches[0];

  const anyTimedMatches = matches
    .filter(load => Number(load?.sdtMs || 0) > 0)
    .sort((a, b) => Number(a?.sdtMs || 0) - Number(b?.sdtMs || 0));

  return anyTimedMatches[0] || null;
}

function getDoorListForCptRow(row) {
  const matches = getOutboundMatchesForRow(row);
  const doorSet = new Set();

  for (const match of matches) {
    const door = String(match?.door || '').trim();
    if (door && door !== '-') doorSet.add(door);
  }

  return Array.from(doorSet).sort((a, b) => a.localeCompare(b));
}

function getOutboundMatchForRow(row) {
  const matches = getOutboundMatchesForRow(row);
  return matches[0] || null;
}

function getDoorForCptRow(row) {
  const doors = getDoorListForCptRow(row);
  if (doors.length) return doors.join(', ');
  return String(row?.door || '').trim() || '-';
}

function getSweeperForCptRow(row) {
  const match = getBestOutboundSweeperMatchForRow(row);
  return Number(match?.sdtMs || row?.sdtMs || 0);
}

function getLaneForCptRow(row) {
  const candidates = getOutboundLaneCandidates(row);
  if (candidates.length) return candidates[0];

  return String(
    row?.lane ||
    getLaneForStackingFilter(row?.stackingFilter) ||
    getVistaLaneForStackingFilter(row?.stackingFilter) ||
    '-'
  ).trim() || '-';
}

    function getHrzCptForCptRow(row) {
  const lane =
    String(getLaneForCptRow(row) || '').trim() ||
    String(row?.lane || '').trim() ||
    String(getVistaLaneForStackingFilter(row?.stackingFilter) || '').trim() ||
    String(getLaneForStackingFilter(row?.stackingFilter) || '').trim();

  if (!lane || lane === '-') return 0;

  return Number(getHrzCptForLane(lane) || 0);
}

    function getForesightRowForVistaContainer(vistaItem, laneRow) {
  const targetSf = normalizeStackingFilter(vistaItem?.stackingFilter);
  const targetArea = String(vistaItem?.location || '').trim();
  const targetLane = String(laneRow?.lane || '').trim();

  if (!targetSf || !targetArea || !targetLane) return null;

  const baseRows = Array.isArray(state.rows) ? state.rows : [];

  const candidates = baseRows.filter(row => {
    if (normalizeStackingFilter(row?.stackingFilter) !== targetSf) return false;

    const rowLane = String(getLaneForCptRow(row) || '').trim();
    if (rowLane !== targetLane) return false;

    const areas = Array.isArray(row?.areas) ? row.areas.map(a => String(a || '').trim()) : [];
    return areas.includes(targetArea);
  });

  if (candidates.length) return candidates[0];

  const fallback = baseRows.find(row => {
    if (normalizeStackingFilter(row?.stackingFilter) !== targetSf) return false;
    const areas = Array.isArray(row?.areas) ? row.areas.map(a => String(a || '').trim()) : [];
    return areas.includes(targetArea);
  });

  return fallback || null;
}

function getVistaStackedChildrenForLaneRow(laneRow) {
  const lane = String(laneRow?.lane || '').trim();
  if (!lane || lane === '-') return [];

  const baseRows = Array.isArray(state.rows) ? state.rows : [];
  const stackedRows = Array.isArray(state.stackedVista?.rows) ? state.stackedVista.rows : [];

  // فقط rowهای Foresight مربوط به همین lane
  const foresightRows = baseRows.filter(row => {
    if (isFreeWatchSorterRow(row)) return false;
    const rowLane = String(getLaneForCptRow(row) || '').trim();
    return rowLane === lane;
  });

  const result = [];
  const usedVistaIndexes = new Set();
  const activeSeries = state.cptAudit.activeSeries;

  const matchesActiveCptSeries = (areaName) => {
    const safeArea = String(areaName || '').trim();
    if (!safeArea) return false;

    if (!activeSeries || activeSeries.size === 0) {
      return true;
    }

    const series = inferAreaSeries(safeArea);
    return Boolean(series) && activeSeries.has(series);
  };

  // backbone = Foresight rows
  for (const foresightRow of foresightRows) {
    const foresightAreas = Array.isArray(foresightRow?.areas)
      ? foresightRow.areas.map(a => String(a || '').trim()).filter(Boolean)
      : [];

    const filteredForesightAreas =
      activeSeries && activeSeries.size > 0
        ? foresightAreas.filter(area => activeSeries.has(inferAreaSeries(area)))
        : foresightAreas;

    if (!filteredForesightAreas.length) {
      continue;
    }

    // فقط Vista itemهای مربوط به همین row
    const vistaRowsForThisRow = [];
    for (let i = 0; i < stackedRows.length; i += 1) {
      if (usedVistaIndexes.has(i)) continue;

      const item = stackedRows[i];
      const itemArea = String(item?.location || '').trim();

      if (!itemArea) continue;
      if (!filteredForesightAreas.includes(itemArea)) continue;

      vistaRowsForThisRow.push({ item, index: i });
    }

    // برای هر area یک row بساز
    for (const area of filteredForesightAreas) {
      let matchedIndex = -1;
      let matchedItem = null;

      for (const entry of vistaRowsForThisRow) {
        const itemArea = String(entry?.item?.location || '').trim();
        if (itemArea !== area) continue;

        matchedIndex = entry.index;
        matchedItem = entry.item;
        break;
      }

      if (matchedItem) {
        usedVistaIndexes.add(matchedIndex);

        result.push({
          containerId: String(matchedItem?.containerId || '').trim() || '-',
          area: area,
          stackingFilter:
            String(matchedItem?.stackingFilter || '').trim() ||
            String(foresightRow?.stackingFilter || '').trim() ||
            '-',
          sweeperText: '',
          cptText: (() => {
            const hrzMs = Number(getHrzCptForCptRow(foresightRow) || 0);
            return hrzMs > 0 ? formatCptTimeLabel(hrzMs) : '';
          })(),
          location: area,
          onSorterNow: Number(foresightRow?.metrics?.onSorterNow || 0),
          m15: Number(foresightRow?.metrics?.m15 || 0),
          m30: Number(foresightRow?.metrics?.m30 || 0),
          m60: Number(foresightRow?.metrics?.m60 || 0),
          detailText: `${matchedItem?.isClosed ? 'Closed' : 'Open'} (${Number(matchedItem?.childCount || 0)})`,
          isClosed: Boolean(matchedItem?.isClosed),
          childCount: Number(matchedItem?.childCount || 0),
          cptMsVista: Number(matchedItem?.cptMs || 0),
          cptMsForesight: Number(getHrzCptForCptRow(foresightRow) || 0),
          source: 'matched',
        });
      } else {
        result.push({
          containerId: '-',
          area: area,
          stackingFilter: String(foresightRow?.stackingFilter || '').trim() || '-',
          sweeperText: '',
          cptText: (() => {
            const hrzMs = Number(getHrzCptForCptRow(foresightRow) || 0);
            return hrzMs > 0 ? formatCptTimeLabel(hrzMs) : '';
          })(),
          location: area,
          onSorterNow: Number(foresightRow?.metrics?.onSorterNow || 0),
          m15: Number(foresightRow?.metrics?.m15 || 0),
          m30: Number(foresightRow?.metrics?.m30 || 0),
          m60: Number(foresightRow?.metrics?.m60 || 0),
          detailText: 'No Vista match',
          isClosed: false,
          childCount: 0,
          cptMsVista: 0,
          cptMsForesight: Number(getHrzCptForCptRow(foresightRow) || 0),
          source: 'foresight-only',
        });
      }
    }
  }

  // leftover Vista -> vista-only
  for (let i = 0; i < stackedRows.length; i += 1) {
    if (usedVistaIndexes.has(i)) continue;

    const item = stackedRows[i];
    const itemArea = String(item?.location || '').trim();
    const itemRoute = String(item?.raw?.route || '').trim();
    const vistaCptMs = Number(item?.cptMs || 0);

    // فقط leftoverهای همین lane
    if (itemRoute !== lane) continue;

    if (!matchesActiveCptSeries(itemArea)) continue;

    if (vistaCptMs > 0 && vistaCptMs <= Date.now()) continue;

    result.push({
      containerId: String(item?.containerId || '').trim() || '-',
      area: itemArea || '-',
      stackingFilter: String(item?.stackingFilter || '').trim() || '-',
      sweeperText: '',
      cptText: vistaCptMs > 0 ? formatCptTimeLabel(vistaCptMs) : '',
      location: itemArea || '-',
      onSorterNow: '-',
      m15: '-',
      m30: '-',
      m60: '-',
      detailText: `${item?.isClosed ? 'Closed' : 'Open'} (${Number(item?.childCount || 0)})`,
      isClosed: Boolean(item?.isClosed),
      childCount: Number(item?.childCount || 0),
      cptMsVista: vistaCptMs,
      cptMsForesight: 0,
      source: 'vista-only',
    });
  }

  function isZeroLikeMetric(value) {
    return value === '-' || Number(value || 0) === 0;
  }

  function isMetricsEmptyRow(row) {
    return (
      isZeroLikeMetric(row?.onSorterNow) &&
      isZeroLikeMetric(row?.m15) &&
      isZeroLikeMetric(row?.m30) &&
      isZeroLikeMetric(row?.m60)
    );
  }

  function getDetailPriority(row) {
    const metricsEmpty = isMetricsEmptyRow(row);
    const count = Number(row?.childCount || 0);

    if (!metricsEmpty) return 0;
    if (count > 0) return 1;
    return 2;
  }

  result.sort((a, b) => {
    const aPriority = getDetailPriority(a);
    const bPriority = getDetailPriority(b);

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    if (a.area !== b.area) {
      return inferAreaSortKey(a.area).localeCompare(inferAreaSortKey(b.area));
    }

    if (a.source !== b.source) {
      const rank = { matched: 0, 'foresight-only': 1, 'vista-only': 2 };
      return (rank[a.source] ?? 9) - (rank[b.source] ?? 9);
    }

    if (a.isClosed !== b.isClosed) {
      return a.isClosed ? 1 : -1;
    }

    if (b.childCount !== a.childCount) {
      return b.childCount - a.childCount;
    }

    return a.containerId.localeCompare(b.containerId);
  });

  return result;
}

    function getVistaStageRowsForLaneRow(laneRow) {
  const lane = String(laneRow?.lane || '').trim();
  if (!lane || lane === '-') return [];

  const stageRows = Array.isArray(state.stageVista?.rows) ? state.stageVista.rows : [];

  const result = stageRows.filter(item => {
    const route = String(item?.route || '').trim();
    if (route && route === lane) return true;

    const sf = String(item?.stackingFilter || '').trim();
    const laneFromVista = String(getVistaLaneForStackingFilter(sf) || '').trim();
    const laneFromStem = String(getLaneForStackingFilter(sf) || '').trim();

    return laneFromVista === lane || laneFromStem === lane;
  });

return result;
}



    function getVistaStackedRowsForCptAudit() {
  const query = state.cptAudit.searchQuery || '';

  return (state.stackedVista.rows || [])
    .filter(row => isWithinCptAuditScope(row.cptMs))
    .filter(row => {
      if (!query) return true;

      const q = normalizeText(query);
      return (
        tokenMatchesPrefix(row.containerId, q) ||
        tokenMatchesPrefix(row.stackingFilter, q) ||
        tokenMatchesPrefix(row.location, q)
      );
    })
    .map(row => ({
      lane: row.containerId,                 // ستون Lane = Container ID
      stackingFilter: row.stackingFilter,
      areas: [row.location],                // برای detail row
      areaCount: 1,
      stackingFilterCount: 1,
      sweeperMs: 0,
      cptMs: row.cptMs,
      door: row.location,                   // ستون Door = Location
      metrics: {
        onSorterNow: row.childCount,        // فعلاً count را اینجا می‌گذاریم
        m15: 0,
        m30: 0,
        m60: 0,
      },
      vistaDetail: {
        isClosed: row.isClosed,
        childCount: row.childCount,
        location: row.location,
        locationType: row.locationType,
      },
      children: [
        {
          lane: row.containerId,
          stackingFilter: row.stackingFilter,
          area: row.location,
          sweeperMs: 0,
          cptMs: row.cptMs,
          door: row.location,
          metrics: {
            onSorterNow: row.childCount,
            m15: 0,
            m30: 0,
            m60: 0,
          },
          vistaDetail: {
            isClosed: row.isClosed,
            childCount: row.childCount,
            location: row.location,
            locationType: row.locationType,
          },
        }
      ],
    }));
}

function getCptAuditTimeBuckets(rows) {
  const map = new Map();

  for (const row of rows) {
const cptMs = Number(row?.cptMs || 0);
const cptLabel = formatCptTimeLabel(cptMs);

if (cptLabel && isWithinCptAuditScope(cptMs)) {
  const key = `cpt|${cptLabel}`;
  if (!map.has(key)) {
    map.set(key, {
      key,
      label: cptLabel,
      kind: 'cpt',
    });
  }
}

const sweeperMs = getCptAuditSweeperMs(row);

if (
  sweeperMs > 0 &&
  sweeperMs !== cptMs &&
  sweeperMs >= Date.now() &&
  isWithinCptAuditScope(sweeperMs)
) {
  const sweeperLabel = formatCptTimeLabel(sweeperMs);
  if (sweeperLabel) {
    const key = `sweeper|${sweeperLabel}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        label: sweeperLabel,
        kind: 'sweeper',
      });
    }
  }
}
  }

  return Array.from(map.values()).sort((a, b) => {
    const diff = parseCptTimeLabelToMs(a.label) - parseCptTimeLabelToMs(b.label);
    if (diff !== 0) return diff;
    if (a.kind === b.kind) return 0;
    return a.kind === 'cpt' ? -1 : 1;
  });
}

function getCptAuditSeriesButtons(rows) {
  return extractSeriesButtonsFromRows(rows);
}

function filterCptAuditRows(rows, query) {
  return rows.filter(row => {
    return (
      rowMatchesCptAuditQuery(row, query) &&
      rowMatchesCptAuditSeries(row) &&
      rowMatchesCptAuditTime(row)
    );
  });
}
    function loadCptAuditSnapshots() {
  try {
    const raw = localStorage.getItem(state.cptAudit.snapshotStorageKey);
    if (!raw) {
      state.cptAudit.snapshotMap = {};
      log('No CPT Audit snapshots found in localStorage');
      return;
    }

    const parsed = JSON.parse(raw);
    state.cptAudit.snapshotMap = parsed && typeof parsed === 'object' ? parsed : {};
    log('Loaded CPT Audit snapshots from localStorage', state.cptAudit.snapshotMap);
  } catch (err) {
    error('Failed to load CPT Audit snapshots', err);
    state.cptAudit.snapshotMap = {};
  }
}

function saveCptAuditSnapshots() {
  try {
    localStorage.setItem(
      state.cptAudit.snapshotStorageKey,
      JSON.stringify(state.cptAudit.snapshotMap)
    );
    log('Saved CPT Audit snapshots to localStorage', state.cptAudit.snapshotMap);
  } catch (err) {
    error('Failed to save CPT Audit snapshots', err);
  }
}

function getCptSnapshotKey(rowOrTimeLabel) {
  if (typeof rowOrTimeLabel === 'string') {
    return rowOrTimeLabel;
  }

  return formatCptTimeLabel(rowOrTimeLabel?.cptMs);
}

function getAreasForSnapshotRow(row) {
  return Array.isArray(row?.areas) ? [...row.areas] : [];
}

function getRowsWithin45Minutes(rows) {
  return rows.filter(row => {
    const minutes = getMinutesToCpt(row.cptMs);
    return minutes !== null && minutes >= 0 && minutes <= 45;
  });
}

function captureCptAuditSnapshots(rows) {
  let changed = false;
  const rowsWithin45 = getRowsWithin45Minutes(rows);

  const byTimeKey = new Map();

  for (const row of rowsWithin45) {
    const timeKey = getCptSnapshotKey(row);
    if (!timeKey) continue;

    if (!byTimeKey.has(timeKey)) {
      byTimeKey.set(timeKey, new Set());
    }

    for (const area of getAreasForSnapshotRow(row)) {
      byTimeKey.get(timeKey).add(area);
    }
  }

  for (const [timeKey, areaSet] of byTimeKey.entries()) {
    if (!state.cptAudit.snapshotMap[timeKey]) {
      state.cptAudit.snapshotMap[timeKey] = {
        createdAt: Date.now(),
        areas: Array.from(areaSet).sort((a, b) =>
          inferAreaSortKey(a).localeCompare(inferAreaSortKey(b))
        ),
      };
      changed = true;
      log('Captured CPT Audit baseline snapshot', {
        timeKey,
        areas: state.cptAudit.snapshotMap[timeKey].areas,
      });
    }
  }


  if (changed) {
    saveCptAuditSnapshots();
  }
}
    function cleanupCptAuditSnapshots(rows) {
  const activeTimeKeys = new Set(
    rows
      .map(row => getCptSnapshotKey(row))
      .filter(Boolean)
  );

  let changed = false;

  for (const key of Object.keys(state.cptAudit.snapshotMap || {})) {
    if (!activeTimeKeys.has(key)) {
      delete state.cptAudit.snapshotMap[key];
      changed = true;
      log('Removed stale CPT Audit snapshot', { timeKey: key });
    }
  }

  if (changed) {
    saveCptAuditSnapshots();
  }
}

function getSnapshotForTimeKey(timeKey) {
  return state.cptAudit.snapshotMap?.[timeKey] || null;
}

function getMinutesToCptForTimeLabel(rows, timeLabel) {
  const row = rows.find(r => formatCptTimeLabel(r.cptMs) === timeLabel);
  if (!row) return null;
  return getMinutesToCpt(row.cptMs);
}

function getCptAuditSummaryTimeEntries(row, options = {}) {
  const entries = [];

  const shouldIncludeMs = (ms) => {
    const value = Number(ms || 0);
    if (!Number.isFinite(value) || value <= 0) return false;

    if (options.respectCptAuditScope) {
      return isWithinCptAuditScope(value);
    }

    return true;
  };

  const cptMs = Number(row?.cptMs || 0);
  const cptLabel = formatCptTimeLabel(cptMs);

  if (cptLabel && shouldIncludeMs(cptMs)) {
    entries.push({
      label: cptLabel,
      kind: 'cpt',
    });
  }

  const sweeperMs = getCptAuditSweeperMs(row);

if (
  sweeperMs > 0 &&
  sweeperMs !== cptMs &&
  sweeperMs >= Date.now() &&
  shouldIncludeMs(sweeperMs)
) {
    const sweeperLabel = formatCptTimeLabel(sweeperMs);
    if (sweeperLabel) {
      entries.push({
        label: sweeperLabel,
        kind: 'sweeper',
      });
    }
  }

  return entries;
}

function buildCurrentSummaryMap(rows, options = {}) {
  const map = new Map();
  const activeSeries = state.cptAudit.activeSeries;

  for (const row of rows) {
    const timeEntries = getCptAuditSummaryTimeEntries(row, options);
    if (!timeEntries.length) continue;

    let areasForSummary = row.areas || [];

    if (activeSeries && activeSeries.size > 0) {
      areasForSummary = areasForSummary.filter(area => {
        const series = inferAreaSeries(area);
        return activeSeries.has(series);
      });
    }

    for (const timeEntry of timeEntries) {
const timeKey = `${timeEntry.kind}|${timeEntry.label}`;
if (!timeEntry.label) continue;

if (!map.has(timeKey)) {
  map.set(timeKey, {
    key: timeKey,
    label: timeEntry.label,
    kind: timeEntry.kind,
    items: new Map(),
  });
}

const bucket = map.get(timeKey);

      for (const area of areasForSummary) {
        bucket.items.set(area, {
          area,
          incomingTo60: getIncomingTo60(row),
          baseColor: getCptAuditRowColor(row),
          kind: timeEntry.kind,
        });
      }
    }
  }

  return map;
}
      function getTotalPackages(row) {
    const m = row.metrics || {};
    return (
      Number(m.onSorterNow || 0) +
      Number(m.m15 || 0) +
      Number(m.m30 || 0) +
      Number(m.m60 || 0) +
      Number(m.m120 || 0) +
      Number(m.m240 || 0)
    );
  }
  function isMultiAreaLowVolume(row) {
    const areas = Number(row.areasCount || 0);
    if (areas < 2) return false;

    const total = getTotalPackages(row);

    const thresholds = {
      2: 300,
      3: 400,
      4: 500,
      5: 600,
      6: 700,
    };

    const threshold = thresholds[areas];
    if (!threshold) return false;

    return total < threshold;
  }
  function getRowReadiness(row) {
    const minutesToCpt = getMinutesToCpt(row.cptMs);
    const totalPackages = getTotalPackages(row);

    if (isZeroRow(row) || isMultiAreaLowVolume(row)) {
      return 'ready';
    }

    if (
      (minutesToCpt !== null && minutesToCpt > 0 && minutesToCpt < 30) ||
      totalPackages <= 5
    ) {
      return 'monitor';
    }

    return '';
  }
  function rowMatchesActiveReadiness(row) {
    if (!state.activeReadiness || state.activeReadiness.size === 0) return true;
    const readiness = getRowReadiness(row);
    return readiness && state.activeReadiness.has(readiness);
  }

      function rowMatchesNextCptFilter(row) {
    if (!state.activeNextCptFilters || state.activeNextCptFilters.size === 0) return true;

    const minutesToCpt = getMinutesToCpt(row.cptMs);
    const isOver8h = minutesToCpt !== null && minutesToCpt > 480;

    if (state.activeNextCptFilters.has('nextOver8h')) {
      return isOver8h;
    }

    return true;
  }

  function computeReadinessCounts(rows) {
    let ready = 0;
    let monitor = 0;

    for (const row of rows) {
      const readiness = getRowReadiness(row);
      if (readiness === 'ready') ready += 1;
      else if (readiness === 'monitor') monitor += 1;
    }

    return { ready, monitor };
  }
  function injectStyles() {
    if (document.getElementById(IDS.style)) {
      log('Styles already injected');
      return;
    }

    const style = document.createElement('style');
    style.id = IDS.style;
    style.textContent = `
      :root {
        --ws-text: #16191f;
        --ws-text-secondary: #5f6b7a;
        --ws-border: #d5dbdb;
        --ws-border-soft: #eaeded;
        --ws-header-bg: #f2f3f3;
        --ws-panel-bg: #ffffff;
        --ws-hover: #f7f8fa;
        --ws-active: #0972d3;
        --ws-badge-bg: #f2f8fd;
        --ws-badge-border: #97c1e7;
        --ws-badge-text: #0073bb;
        --ws-font: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      }
///zoom
#${IDS.cptOverlay} {
  zoom: 0.50;
}

#${IDS.vastCard} {
  cursor: pointer;
  user-select: none;
}

#${IDS.vastCard}:hover {
  opacity: 0.96;
}

#${IDS.vastOverlay} {
  position: fixed;
  inset: 0;
  z-index: 999999;
  background: #f9fafb;
  color: var(--ws-text);
  display: none;
  flex-direction: column;
  font-family: var(--ws-font);
}

#${IDS.vastOverlay}.ws-open {
  display: flex;
}

.ws-vast-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding: 24px 24px 64px 24px;
  background: #f9fafb;
}

.ws-vast-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 24px;
  border-bottom: 1px solid var(--ws-border-soft);
  background: var(--ws-panel-bg);
}

.ws-vast-series-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.ws-vast-operator-wrap {
  border: 1px solid var(--ws-border);
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  margin-bottom: 18px;
}

.ws-vast-operator-title {
  padding: 14px 16px 8px;
  font-size: 16px;
  font-weight: 800;
  color: #b42318;
  background: var(--ws-header-bg);
}

.ws-vast-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 16px 12px;
  background: var(--ws-header-bg);
  border-bottom: 1px solid var(--ws-border-soft);
}

.ws-vast-alert-pill {
  appearance: none;
  border: 1px solid #f04438;
  background: #fff5f5;
  color: #b42318;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: var(--ws-font);
}

.ws-vast-alert-pill-active {
  background: #f04438;
  color: #fff;
  border-color: #f04438;
}

.ws-vast-cell-red {
  background: #fdecea !important;
  color: #b42318 !important;
  font-weight: 800;
}

.ws-vast-detail-row[hidden] {
  display: none;
}

.ws-vast-detail-row td {
  background: #fafafa !important;
}

.ws-vast-inline-detail {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  line-height: 1.5;
}

.ws-vast-detail-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.ws-vast-detail-sep {
  color: #98a2b3;
}

.ws-vast-full-details {
  margin-top: 16px;
}

.ws-vast-full-details > summary {
  cursor: pointer;
  font-weight: 800;
  margin-bottom: 12px;
}

      #${IDS.card} {

        cursor: pointer;
        user-select: none;
      }

      #${IDS.card}:hover {
        opacity: 0.96;
      }

#${IDS.overlay} {
  position: fixed;
  inset: 0;
  z-index: 999999;
  background: #f9fafb;
  color: var(--ws-text);
  display: none;
  flex-direction: column;
  font-family: var(--ws-font);
  overflow: hidden;
}

      #${IDS.overlay}.ws-open {
        display: flex;
      }

      .ws-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 14px 24px;
        border-bottom: 1px solid var(--ws-border);
        background: var(--ws-panel-bg);
      }

      .ws-header-left,
      .ws-header-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .ws-title-wrap {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .ws-title {
        font-size: 20px;
        font-weight: 700;
        line-height: 1.2;
        color: var(--ws-text);
      }

      .ws-subtitle {
        font-size: 12px;
        line-height: 1.4;
        color: var(--ws-text-secondary);
      }

      .ws-btn {
        appearance: none;
        border: 1px solid #879596;
        background: #fff;
        color: var(--ws-text);
        border-radius: 20px;
        padding: 7px 14px;
        font-size: 13px;
        line-height: 1.4;
        cursor: pointer;
        font-family: var(--ws-font);
      }

      .ws-btn:hover {
        background: var(--ws-hover);
        border-color: #5f6b7a;
      }

      .ws-btn:focus {
        outline: 2px solid #0972d3;
        outline-offset: 1px;
      }

      .ws-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 12px 24px;
        border-bottom: 1px solid var(--ws-border-soft);
        background: var(--ws-panel-bg);
      }

.ws-toolbar {
  flex: 0 0 auto;
}

.ws-table-wrap {
  flex: 0 0 auto;
}

.ws-logs-panel {
  flex: 0 0 auto;
}

      .ws-tabs {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px 0 24px;
        background: var(--ws-panel-bg);
      }

      .ws-tab-btn {
        appearance: none;
        border: 1px solid #879596;
        background: #fff;
        color: var(--ws-text);
        border-radius: 12px 12px 0 0;
        padding: 8px 14px;
        font-size: 13px;
        line-height: 1.2;
        cursor: pointer;
        font-family: var(--ws-font);
      }

      .ws-tab-btn:hover {
        background: var(--ws-hover);
        border-color: #5f6b7a;
      }

      .ws-tab-btn-active {
        background: rgb(1, 34, 45);
        color: #fff;
        border-color: rgb(1, 34, 45);
      }

.ws-tab-panel {
  display: none;
  flex: 1 1 auto;
  min-height: 0;
  flex-direction: column;
}

.ws-tab-panel.ws-tab-panel-open {
  display: flex;
}

      .ws-search-wrap {
        display: flex;
        align-items: center;
        min-width: 320px;
        width: 560px;
        max-width: 100%;
      }

      .ws-search-box {
        position: relative;
        width: 100%;
      }

      .ws-search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        pointer-events: none;
        color: var(--ws-text-secondary);
        opacity: 0.85;
      }

      .ws-search-icon svg {
        width: 16px;
        height: 16px;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.6;
      }

      .ws-search {
        width: 100%;
        height: 34px;
        border: 1px solid #879596;
        border-radius: 18px;
        padding: 0 14px 0 36px;
        font-size: 14px;
        line-height: 34px;
        outline: none;
        background: #fff;
        color: var(--ws-text);
        font-family: var(--ws-font);
      }

      .ws-search:hover {
        border-color: #5f6b7a;
      }

      .ws-search:focus {
        border-color: var(--ws-active);
        box-shadow: 0 0 0 2px rgba(9,114,211,0.18);
      }

      .ws-meta {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .ws-badge {
        display: inline-flex;
        align-items: center;
        min-height: 24px;
        padding: 2px 10px;
        border-radius: 999px;
        font-size: 12px;
        line-height: 1.4;
        color: var(--ws-badge-text);
        border: 1px solid var(--ws-badge-border);
        background: var(--ws-badge-bg);
        white-space: nowrap;
      }

.ws-watch-compact-summary {
  display: flex;
  align-items: stretch;
  gap: 10px;
  flex-wrap: wrap;
}

.ws-watch-compact-pill {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--ws-badge-border);
  background: var(--ws-badge-bg);
  border-radius: 999px;
  padding: 8px 12px;
  min-height: 38px;
  box-sizing: border-box;
}

.ws-watch-compact-title {
  font-size: 13px;
  font-weight: 900;
  color: var(--ws-badge-text);
  white-space: nowrap;
  padding-right: 10px;
  border-right: 1px solid var(--ws-badge-border);
}

.ws-watch-compact-types {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ws-watch-compact-type {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  white-space: nowrap;
}

.ws-watch-compact-type span {
  font-size: 12px;
  font-weight: 800;
  color: var(--ws-text-secondary);
}

.ws-watch-compact-type strong {
  font-size: 16px;
  font-weight: 900;
  color: var(--ws-text);
}

.ws-ops-summary {
  display: grid;
  grid-template-columns: repeat(5, minmax(160px, 1fr));
  gap: 14px;
  padding: 16px 24px 0 24px;
  background: var(--ws-panel-bg);
}

.ws-ops-card {
  border: 1px solid var(--ws-border);
  border-radius: 16px;
  background: #fff;
  padding: 24px 18px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 14px;
  box-sizing: border-box;
  text-align: center;
}

.ws-ops-value {
  font-size: 100px;
  line-height: 1;
  font-weight: 900;
  color: var(--ws-text);
  letter-spacing: -1px;
  text-align: center;
}

.ws-ops-label {
  font-size: 25px;
  line-height: 1.25;
  color: var(--ws-text);
  font-weight: 800;
  text-align: center;
}

.ws-ops-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 6px;
  width: 100%;
  text-align: center;
}

.ws-ops-meta-item {
  border-top: 1px solid var(--ws-border-soft);
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.ws-ops-meta-item span {
  font-size: 20px;
  line-height: 1.2;
  color: var(--ws-text-secondary);
  font-weight: 800;
  text-align: center;
}

.ws-ops-meta-item strong {
  font-size: 30px;
  line-height: 1.1;
  color: var(--ws-text);
  font-weight: 900;
  text-align: center;
}

@media (max-width: 1200px) {
  .ws-ops-summary {
    grid-template-columns: repeat(2, minmax(160px, 1fr));
  }
}

      .ws-content {
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
        padding: 24px 24px 64px 24px;
        background: #f9fafb;
      }

      .ws-series-bar-row {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 14px;
      }

      .ws-ready-series-wrap {
  border: 1px solid var(--ws-border);
  border-radius: 16px;
  background: #fff;
  padding: 14px 16px;
  margin-bottom: 14px;
}

.ws-ready-series-title {
  font-size: 13px;
  line-height: 1.3;
  font-weight: 800;
  color: var(--ws-text);
  margin-bottom: 12px;
}

.ws-ready-series-empty {
  font-size: 13px;
  color: var(--ws-text-secondary);
}

.ws-ready-series-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.ws-ready-series-group:last-child {
  margin-bottom: 0;
}

.ws-ready-series-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ws-ready-series-name {
  font-size: 13px;
  font-weight: 800;
  color: var(--ws-text);
}

.ws-ready-series-count {
  font-size: 12px;
  font-weight: 700;
  color: var(--ws-text-secondary);
}
.ws-ready-series-pill {
  gap: 6px;
}

.ws-ready-area-refresh-btn,
.ws-ready-area-deallocate-btn {
  appearance: none;
  border: 1px solid #b7dfc5;
  background: #fff;
  color: #1f5130;
  border-radius: 999px;
  min-height: 20px;
  padding: 1px 7px;
  font-size: 11px;
  line-height: 1.2;
  font-weight: 800;
  cursor: pointer;
  font-family: var(--ws-font);
}

.ws-ready-area-refresh-btn:hover,
.ws-ready-area-deallocate-btn:hover {
  background: #dcf3e6;
}

.ws-ready-area-refresh-btn:disabled,
.ws-ready-area-deallocate-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.ws-ready-area-refresh-spinning {
  display: inline-block;
  animation: ws-ready-spin 800ms linear infinite;
}

@keyframes ws-ready-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ws-ready-area-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1;
  font-weight: 900;
}

.ws-ready-area-status-ok {
  background: #1f7a3d;
  color: #fff;
}

.ws-ready-area-status-bad {
  background: #b42318;
  color: #fff;
}

.ws-ready-area-status-loading {
  background: #e5e7eb;
  color: #5f6b7a;
}
.ws-ready-series-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ws-ready-series-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #b7dfc5;
  background: #e8f7ee;
  color: #1f5130;
  font-size: 12px;
  line-height: 1.2;
  font-weight: 700;
}

.ws-additional-needed-pill {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  min-height: 28px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #e6b3b3;
  background: #fdecea;
  color: #b42318;
  font-size: 16px;
  line-height: 1.35;
  font-weight: 600;
  margin: 0 8px 8px 0;
  gap: 0;
}

.ws-pill-sep {
  margin: 0 8px;
  font-weight: 900;
  color: #b42318;
}

.ws-pill-sf {
  display: inline;
}

.ws-pill-copy-link {
  appearance: none;
  border: none;
  background: transparent;
  padding: 0;
  margin-left: 6px;
  color: #0f62fe;
  font-size: 16px;
  line-height: 1.2;
  text-decoration: none;
  cursor: pointer;
  font-weight: 600;
}

.ws-pill-copy-link:hover {
  color: #0846b8;
}

.ws-pill-copy-link:focus {
  outline: none;
  color: #0846b8;
}

.ws-nores-summary-bar {
  display: flex;
  align-items: stretch;
  gap: 10px;
  flex-wrap: wrap;
}

.ws-nores-summary-pill {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border: 1px solid var(--ws-badge-border);
  background: var(--ws-badge-bg);
  border-radius: 999px;
  color: var(--ws-text);
}
.ws-nores-summary-pill-allocated {
  border-color: #b7dfc5;
  background: #e8f7ee;
}

.ws-nores-summary-pill-allocated .ws-nores-summary-title {
  color: #1f7a3d;
}
.ws-nores-summary-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--ws-badge-text);
  white-space: nowrap;
}

.ws-nores-summary-metrics {
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}

.ws-nores-summary-metric {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
}

.ws-nores-summary-metric-label {
  font-size: 12px;
  font-weight: 800;
  color: var(--ws-text-secondary);
}

.ws-nores-summary-metric-value {
  font-size: 16px;
  font-weight: 900;
  color: var(--ws-text);
}

      .ws-series-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        flex: 1 1 auto;
      }
      .ws-readiness-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-left: auto;
        justify-content: flex-end;
      }

      .ws-readiness-pill {
        appearance: none;
        border-radius: 999px;
        padding: 6px 12px;
        font-size: 12px;
        line-height: 1.2;
        cursor: pointer;
        font-family: var(--ws-font);
        border: 1px solid transparent;
        color: var(--ws-text);
      }

      .ws-readiness-pill-ready {
        background: #e8f7ee;
        border-color: #b7dfc5;
        color: #1f5130;
      }

      .ws-readiness-pill-ready:hover {
        background: #dcf3e6;
        border-color: #9fcfb0;
      }

      .ws-readiness-pill-monitor {
        background: #fff8e1;
        border-color: #ecdca0;
        color: #7a5a00;
      }

      .ws-readiness-pill-monitor:hover {
        background: #fff1bf;
        border-color: #dfca74;
      }

      .ws-readiness-pill-active {
        color: #fff;
      }

      .ws-readiness-pill-ready.ws-readiness-pill-active {
        background: #2e7d32;
        border-color: #2e7d32;
        color: #fff;
      }

      .ws-readiness-pill-ready.ws-readiness-pill-active:hover {
        background: #1b5e20;
        border-color: #1b5e20;
      }

      .ws-readiness-pill-monitor.ws-readiness-pill-active {
        background: #d4a017;
        border-color: #d4a017;
        color: #fff;
      }

      .ws-readiness-pill-monitor.ws-readiness-pill-active:hover {
        background: #b28704;
        border-color: #b28704;
      }
      .ws-nextcpt-pill {
        background: #f3e8ff;
        border-color: #d8b4fe;
        color: #6b21a8;
      }

      .ws-nextcpt-pill:hover {
        background: #ead8ff;
        border-color: #c084fc;
      }

      .ws-nextcpt-pill-active {
        background: #7e22ce;
        border-color: #7e22ce;
        color: #fff;
      }

      .ws-nextcpt-pill-active:hover {
        background: #6b21a8;
        border-color: #6b21a8;
        color: #fff;
      }

      .ws-mirror-needed-pill {
  background: #fdecea;
  border-color: #e6b3b3;
  color: #b42318;
}

.ws-mirror-needed-pill:hover {
  background: #f9d9d6;
  border-color: #d79b9b;
}

.ws-mirror-needed-pill-active {
  background: #b42318;
  border-color: #b42318;
  color: #fff;
}

.ws-mirror-needed-pill-active:hover {
  background: #912018;
  border-color: #912018;
  color: #fff;
}

      .ws-series-pill {
        appearance: none;
        border: 1px solid #879596;
        background: #fff;
        color: var(--ws-text);
        border-radius: 999px;
        padding: 6px 12px;
        font-size: 12px;
        line-height: 1.2;
        cursor: pointer;
        font-family: var(--ws-font);
      }

      .ws-series-pill:hover {
        background: var(--ws-hover);
        border-color: #5f6b7a;
      }

      .ws-series-pill-active {
        background: #0972d3;
        color: #fff;
        border-color: #0972d3;
      }
            .ws-series-pill-active:hover {
        background: rgb(1, 34, 45);
        border-color: rgb(1, 34, 45);
        color: #fff;
      }

      .ws-table-wrap {
        border: 1px solid var(--ws-border);
        border-radius: 16px;
        overflow: hidden;
        background: #fff;
      }

.ws-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  font-family: var(--ws-font);
}

/* Make Recirculation + CPT Audit tables fit like VAST */
#ws-overlay .ws-table,
#ws-cpt-overlay .ws-table,
#ws-cpt-stage-overlay .ws-table {
  table-layout: fixed !important;
  width: 100% !important;
  min-width: 0 !important;
}

#ws-overlay .ws-table th,
#ws-overlay .ws-table td,
#ws-cpt-overlay .ws-table th,
#ws-cpt-overlay .ws-table td,
#ws-cpt-stage-overlay .ws-table th,
#ws-cpt-stage-overlay .ws-table td {
  white-space: normal !important;
  overflow-wrap: anywhere !important;
  word-break: break-word !important;
}

#ws-overlay .ws-table-wrap,
#ws-cpt-overlay .ws-table-wrap,
#ws-cpt-overlay .ws-cpt-table-wrap,
#ws-cpt-stage-overlay .ws-cpt-stage-table-wrap {
  width: 100% !important;
  max-width: 100% !important;
  overflow-x: hidden !important;
}

      .ws-table thead th {
        background: var(--ws-header-bg);
        font-size: 13px;
        font-weight: 700;
        color: var(--ws-text);
        text-align: left;
        padding: 10px 12px;
        border-bottom: 1px solid var(--ws-border);
        vertical-align: middle;
      }

      .ws-table tbody td {
        padding: 10px 12px;
        border-bottom: 1px solid var(--ws-border-soft);
        vertical-align: top;
        font-size: 13px;
        line-height: 1.45;
        color: var(--ws-text);
        background: #fff;
        transition: background-color 120ms ease;
      }

      .ws-row-green td {
        background: #e8f7ee !important;
      }

      .ws-row-yellow td {
        background: #fff8e1 !important;
      }

.ws-row-red td {
  background: #fdecea !important;
}

.ws-table tbody tr.ws-row-red:hover td {
  background: #f9d9d6 !important;
}

.ws-row-blue td {
  background: #e8f1fb !important;
}

.ws-table tbody tr.ws-row-blue:hover td {
  background: #dbe9f8 !important;
}

.ws-nores-row-valid td {
  background: #e8f7ee !important;
}

.ws-nores-row-valid:hover td {
  background: #dcf3e6 !important;
}

.ws-nores-row-urgent td {
  background: #ffe0b2 !important;
}

.ws-nores-row-urgent:hover td {
  background: #ffd39a !important;
}

.ws-nores-row-passed td {
  background: #fdecea !important;
}

.ws-nores-row-passed:hover td {
  background: #f9d9d6 !important;
}

.ws-nores-cpt-passed {
  color: #b42318 !important;
  font-weight: 800 !important;
}

.ws-nores-area-valid {
  background: #e8f7ee !important;
  color: #1f5130 !important;
  font-weight: 700;
}

.ws-nores-row-urgent td.ws-nores-area-valid {
  background: #e8f7ee !important;
  color: #1f5130 !important;
  font-weight: 700;
}

.ws-nores-cpt-urgent {
  color: #b35a00 !important;
  font-weight: 700 !important;
}

.ws-nores-row-urgent td.ws-nores-cpt-urgent {
  color: #b35a00 !important;
  font-weight: 700 !important;
}

.ws-nores-cpt-fallback {
  color: #b42318 !important;
  font-weight: 800 !important;
}

.ws-sorter-summary-bar {
  display: flex;
  align-items: stretch;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.ws-sorter-summary-pill {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border: 1px solid #b7dfc5;
  background: #e8f7ee;
  border-radius: 999px;
  color: var(--ws-text);
}

.ws-sorter-summary-title {
  font-size: 13px;
  font-weight: 800;
  color: #1f7a3d;
  white-space: nowrap;
}

.ws-sorter-summary-metrics {
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}

.ws-sorter-summary-metric {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
}

.ws-sorter-summary-metric-label {
  font-size: 12px;
  font-weight: 800;
  color: var(--ws-text-secondary);
}

.ws-sorter-summary-metric-value {
  font-size: 16px;
  font-weight: 900;
  color: var(--ws-text);
}

.ws-sorter-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ws-sorter-row {
  display: grid;
  grid-template-columns: 170px minmax(260px, 1fr) 180px 130px 430px 70px;
  gap: 14px;
  align-items: center;
  border: 1px solid var(--ws-border);
  border-radius: 14px;
  background: #fff;
  padding: 12px 14px;
}

.ws-sorter-row:hover {
  background: #fbfcfd;
}

.ws-sorter-area {
  font-size: 15px;
  font-weight: 800;
  color: var(--ws-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ws-sorter-chutes {
  font-size: 12px;
  color: var(--ws-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ws-sorter-cpt {
  font-size: 12px;
  color: var(--ws-text-secondary);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ws-sorter-bar {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-wrap: nowrap;
}

.ws-sorter-seg {
  width: 8px;
  height: 28px;
  border-radius: 3px;
  opacity: 0.18;
}

.ws-sorter-seg-lit {
  opacity: 1;
  box-shadow: 0 0 6px rgba(0,0,0,0.18) inset;
}

.ws-sorter-seg-green {
  background: linear-gradient(180deg, #8fdc7f 0%, #5aa85f 100%);
}

.ws-sorter-seg-orange {
  background: linear-gradient(180deg, #f3c44f 0%, #c7991d 100%);
}

.ws-sorter-seg-red {
  background: linear-gradient(180deg, #e05a6b 0%, #b22d45 100%);
}

.ws-sorter-count {
  font-size: 28px;
  line-height: 1;
  font-weight: 800;
  text-align: right;
}

.ws-sorter-count-green {
  color: #65b567;
}

.ws-sorter-count-orange {
  color: #d3a11b;
}

.ws-sorter-count-red {
  color: #e04b63;
}

      .ws-table tbody tr:hover td {
        background: #fbfcfd;
      }

      .ws-table tbody tr.ws-row-green:hover td {
        background: #dcf3e6 !important;
      }

      .ws-table tbody tr.ws-row-yellow:hover td {
        background: #fff1bf !important;
      }

      .ws-table tbody tr:last-child td {
        border-bottom: none;
      }

      .ws-col-filter { width: 240px; }
      .ws-col-areas-count { width: 76px; }
      .ws-col-areas { width: 240px; }
      .ws-col-metric { width: 120px; }
      .ws-col-cpt { width: 120px; }

      .ws-sortable {
        cursor: pointer;
        user-select: none;
      }

      .ws-sortable:hover {
        background: #e9ebed;
      }

.ws-area-link {
  color: inherit;
  text-decoration: none;
  font-weight: inherit;
}

.ws-area-link:hover {
  text-decoration: underline;
}

      .ws-areas-list {
        display: flex;
        flex-direction: column;
        gap: 3px;
        white-space: normal;
        word-break: break-word;
      }

      .ws-empty {
        padding: 28px;
        text-align: center;
        color: var(--ws-text-secondary);
        background: #fff;
      }

      .ws-logs-panel {
        margin-top: 16px;
        border: 1px solid var(--ws-border);
        border-radius: 16px;
        overflow: hidden;
        background: #fff;
        display: none;
      }

      .ws-logs-panel.ws-visible {
        display: block;
      }

      .ws-logs-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        border-bottom: 1px solid var(--ws-border-soft);
        background: var(--ws-header-bg);
      }

      .ws-logs-title {
        font-size: 13px;
        font-weight: 700;
        color: var(--ws-text);
      }

      .ws-logs-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .ws-logs-content {
        height: 220px;
        overflow: auto;
        padding: 12px 14px;
        margin: 0;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 12px;
        line-height: 1.45;
        white-space: pre-wrap;
        word-break: break-word;
        background: #fcfcfc;
        color: #1b2733;
      }

      #${IDS.footer} {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1000000;
        height: 42px;
        background: rgb(1, 34, 45);
        color: #fff;
        display: none;
        align-items: center;
        justify-content: space-between;
        padding: 0 18px;
        font-family: var(--ws-font);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.2px;
        box-sizing: border-box;
      }

      #${IDS.footer}.ws-open {
        display: flex;
      }

      .ws-footer-left,
      .ws-footer-center,
      .ws-footer-right {
        display: flex;
        align-items: center;
        min-width: 0;
        white-space: nowrap;
      }

      .ws-footer-center {
        justify-content: center;
        flex: 1 1 auto;
      }

      .ws-footer-left,
      .ws-footer-right {
        flex: 0 0 auto;
      }
	        #${IDS.cptCard} {
        cursor: pointer;
        user-select: none;
      }

      #${IDS.cptCard}:hover {
        opacity: 0.96;
      }

      #${IDS.cptOverlay} {
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: #f9fafb;
        color: var(--ws-text);
        display: none;
        flex-direction: column;
        font-family: var(--ws-font);
      }

      #${IDS.cptOverlay}.ws-open {
        display: flex;
      }

      .ws-cpt-content {
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
        padding: 24px 24px 64px 24px;
        background: #f9fafb;
      }

      .ws-cpt-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 12px 24px;
        border-bottom: 1px solid var(--ws-border-soft);
        background: var(--ws-panel-bg);
      }

.ws-cpt-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 150px;
  gap: 12px;
  align-items: start;
  position: relative;
}

      .ws-cpt-layout.ws-cpt-layout-table-hidden {
        grid-template-columns: minmax(0, 1fr);
      }

      .ws-cpt-layout.ws-cpt-layout-table-hidden .ws-cpt-table-wrap {
        display: none;
      }

.ws-cpt-layout.ws-cpt-layout-table-hidden .ws-cpt-summary-wrap {
  width: 100%;
  max-width: none;
}

      .ws-cpt-table-column {
        position: relative;
        min-width: 0;
      }

      .ws-cpt-table-wrap {
        border: 1px solid var(--ws-border);
        border-radius: 16px;
        overflow: hidden;
        background: #fff;
      }

      .ws-cpt-table-shell {
        min-width: 0;
      }

      .ws-cpt-table-tab {
        position: absolute;
        top: -18px;
        left: 14px;
        z-index: 5;
        appearance: none;
        border: 1px solid var(--ws-border);
        background: var(--ws-panel-bg);
        color: var(--ws-text-secondary);
        border-radius: 10px 10px 0 0;
        padding: 7px 12px;
        min-height: 30px;
        font-size: 11px;
        font-weight: 700;
        line-height: 1;
        cursor: pointer;
        box-shadow: 0 1px 2px rgba(0,0,0,0.06);
        transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease;
        white-space: nowrap;
      }

      .ws-cpt-table-tab:hover {
        background: var(--ws-hover);
        border-color: #5f6b7a;
        color: var(--ws-text);
      }

      .ws-cpt-table-tab:focus {
        outline: 2px solid #0972d3;
        outline-offset: 1px;
      }
      .ws-cpt-filters {
        display: flex;
        flex-direction: column;
        gap: 14px;
        margin-bottom: 16px;
      }

      .ws-cpt-filter-section {
        border: 1px solid var(--ws-border);
        border-radius: 16px;
        background: #fff;
        padding: 12px 14px;
      }

      .ws-cpt-filter-block {
        width: 100%;
      }

      .ws-cpt-filter-label {
        font-size: 13px;
        font-weight: 700;
        line-height: 1.3;
        color: var(--ws-text);
        margin-bottom: 8px;
      }

      .ws-cpt-filter-subgroup {
        margin-top: 8px;
      }

      .ws-cpt-filter-subgroup:first-child {
        margin-top: 0;
      }

      .ws-cpt-filter-subtitle {
        font-size: 12px;
        font-weight: 700;
        line-height: 1.3;
        color: var(--ws-text-secondary);
        margin-bottom: 6px;
      }

      .ws-cpt-pill-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .ws-cpt-filter-row {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 14px;
      }

      .ws-cpt-time-bar,
      .ws-cpt-series-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .ws-cpt-time-bar {
        flex: 1 1 auto;
      }

      .ws-cpt-series-bar {
        justify-content: flex-end;
      }

      .ws-cpt-pill {
        appearance: none;
        border: 1px solid #879596;
        background: #fff;
        color: var(--ws-text);
        border-radius: 18px;
        padding: 6px 12px;
        min-height: 30px;
        font-size: 12px;
        font-weight: 600;
        line-height: 1.2;
        cursor: pointer;
        font-family: var(--ws-font);
        transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease;
      }

      .ws-cpt-pill:hover {
        background: var(--ws-hover);
        border-color: #5f6b7a;
      }

.ws-cpt-pill-wrap {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.ws-cpt-pill-kind {
  font-size: 10px;
  line-height: 1;
  font-weight: 800;
  color: var(--ws-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.ws-cpt-pill-kind-sweeper {
  color: #6b21a8;
}

      .ws-cpt-pill-active {
        background: rgb(1, 34, 45);
        color: #fff;
        border-color: rgb(1, 34, 45);
      }

      .ws-cpt-pill-active:hover {
        background: rgb(1, 34, 45);
        border-color: rgb(1, 34, 45);
        color: #fff;
      }

      .ws-cpt-pill-sweeper {
  background: #f3e8ff;
  border-color: #d8b4fe;
  color: #6b21a8;
}

.ws-cpt-pill-sweeper:hover {
  background: #ead8ff;
  border-color: #c084fc;
}

.ws-cpt-pill-sweeper.ws-cpt-pill-active {
  background: #7e22ce;
  border-color: #7e22ce;
  color: #fff;
}

.ws-cpt-pill-sweeper.ws-cpt-pill-active:hover {
  background: #6b21a8;
  border-color: #6b21a8;
  color: #fff;
}

.ws-cpt-summary-wrap {
  border: 1px solid var(--ws-border);
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  padding: 0;
  width: 150px;
  max-width: 150px;
}
      .ws-cpt-summary-top-scroll {
        overflow-x: auto;
        overflow-y: hidden;
        height: 0;
        opacity: 0;
        background: transparent;
        border-bottom: none;
        transition: opacity 120ms ease, height 120ms ease;
      }

      .ws-cpt-summary-wrap:hover .ws-cpt-summary-top-scroll,
      .ws-cpt-summary-wrap:focus-within .ws-cpt-summary-top-scroll {
        height: 14px;
        opacity: 1;
        background: #fff;
        border-bottom: 1px solid var(--ws-border-soft);
      }

      .ws-cpt-summary-top-scroll-inner {
        height: 1px;
      }

      .ws-cpt-summary-main-scroll {
        overflow-x: auto;
        overflow-y: hidden;
        width: 100%;
      }

      .ws-cpt-summary-grid {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: max-content;
        gap: 0;
        align-items: start;
        width: max-content;
        min-width: 100%;
      }

.ws-cpt-summary-col {
  width: max-content;
  min-width: max-content;
  border-right: 1px solid var(--ws-border);
  background: #fff;
}

      .ws-cpt-summary-col:last-child {
        border-right: none;
      }

.ws-cpt-summary-title {
  margin: 0;
  padding: 8px 12px;
  background: var(--ws-header-bg);
  border-bottom: 1px solid var(--ws-border);
  color: var(--ws-text);
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ws-cpt-summary-title-sweeper {
  background: #f3e8ff;
  color: #6b21a8;
  border-bottom: 1px solid #d8b4fe;
}

.ws-cpt-summary-title-kind {
  font-size: 10px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: var(--ws-text-secondary);
}

.ws-cpt-summary-title-sweeper .ws-cpt-summary-title-kind {
  color: #6b21a8;
}

.ws-cpt-summary-title-time {
  font-size: 13px;
  line-height: 1.3;
  font-weight: 700;
  color: inherit;
}
      .ws-cpt-summary-body {
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .ws-cpt-summary-item {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: 8px;
        border-radius: 10px;
        padding: 8px 10px;
        font-size: 12px;
        line-height: 1.3;
        min-height: 36px;
        box-sizing: border-box;
      }

      .ws-cpt-summary-item span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .ws-cpt-summary-item strong {
        flex: 0 0 auto;
        font-weight: 700;
      }
      .ws-cpt-summary-item-green {
        background: #e8f7ee;
      }

      .ws-cpt-summary-item-yellow {
        background: #fff8e1;
      }

      .ws-cpt-summary-item-orange {
        background: #ffe0b2;
      }

      .ws-cpt-summary-item-red {
        background: #fdecea;
      }

      .ws-cpt-summary-item-blue {
        background: #e8f1fb;
      }

      .ws-cpt-row-green td {
        background: #e8f7ee !important;
      }

      .ws-cpt-row-yellow td {
        background: #fff8e1 !important;
      }

      .ws-cpt-row-orange td {
        background: #ffe0b2 !important;
      }
            .ws-cpt-table-wrap .ws-table {
        table-layout: fixed;
        width: 100%;
      }
.ws-cpt-layout {
  grid-template-columns: minmax(0, 1fr) 150px !important;
}

.ws-cpt-table-column,
.ws-cpt-table-shell,
.ws-cpt-table-wrap {
  min-width: 0 !important;
}
      .ws-cpt-table-wrap .ws-table th,
      .ws-cpt-table-wrap .ws-table td {
        padding: 8px 10px;
        font-size: 12px;
      }

.ws-cpt-col-filter   { width: 200px; }
.ws-cpt-col-lane     { width: 210px; }
.ws-cpt-col-sweeper  { width: 120px; }
.ws-cpt-col-cpt      { width: 120px; }
.ws-cpt-col-count { width: 90px; }
.ws-cpt-col-door     { width: 90px; }
.ws-cpt-col-metric   { width: 48px; }
.ws-cpt-col-detail   { width: 170px; }

.ws-cpt-detail-btn {
  appearance: none;
  border: 1px solid #879596;
  background: #fff;
  color: var(--ws-text);
  border-radius: 14px;
  padding: 4px 10px;
  min-height: 28px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: var(--ws-font);
}

.ws-cpt-action-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ws-cpt-stage-btn {
  appearance: none;
  border: 1px solid #879596;
  background: #fff;
  color: var(--ws-text);
  border-radius: 14px;
  padding: 4px 10px;
  min-height: 28px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: var(--ws-font);
}

.ws-cpt-stage-btn:hover {
  background: var(--ws-hover);
  border-color: #5f6b7a;
}

#${IDS.cptStageOverlay} {
  position: fixed;
  inset: 0;
  z-index: 1000001;
  background: rgba(15, 23, 42, 0.45);
  display: none;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  font-family: "Amazon Ember", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

#${IDS.cptPrintOverlay} {
  position: fixed;
  inset: 0;
  z-index: 1000001;
  background: rgba(15, 23, 42, 0.45);
  display: none;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  font-family: "Amazon Ember", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

#${IDS.cptPrintOverlay}.ws-open {
  display: flex;
}

#${IDS.cptStageOverlay}.ws-open {
  display: flex;
}

.ws-cpt-stage-modal {
  width: min(980px, 96vw);
  max-height: 85vh;
  overflow: hidden;
  border-radius: 18px;
  background: #fff;
  border: 1px solid var(--ws-border);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
}

#ws-cpt-print-overlay .ws-cpt-stage-modal {
  width: min(760px, 94vw);
  max-height: 78vh;
}

#ws-cpt-print-overlay .ws-cpt-stage-content {
  padding: 12px 14px 14px 14px;
}

.ws-cpt-stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid #d5dbdb;
  background: #f2f3f3;
}

.ws-cpt-stage-header-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 18px;
  align-items: center;
  flex: 1 1 auto;
  min-width: 0;
}

.ws-cpt-stage-meta-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
  flex-wrap: wrap;
}

.ws-cpt-stage-meta-label {
  font-size: 15px;
  line-height: 1.3;
  font-weight: 700;
  color: #111827;
  font-family: "Amazon Ember", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.ws-cpt-stage-meta-value {
  font-size: 15px;
  line-height: 1.3;
  font-weight: 400;
  color: #111827;
  word-break: break-word;
  font-family: "Amazon Ember", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.ws-cpt-stage-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--ws-text);
}

.ws-cpt-stage-content {
  padding: 18px 20px 20px 20px;
  overflow: auto;
  background: #f8fafc;
}

.ws-cpt-stage-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
  padding: 14px 16px;
  border: 1px solid var(--ws-border);
  border-radius: 14px;
  background: #f8fafc;
}

.ws-cpt-stage-summary > div {
  font-size: 13px;
  color: var(--ws-text);
}

.ws-cpt-stage-summary strong {
  font-weight: 800;
  color: var(--ws-text);
}

.ws-cpt-stage-table-wrap {
  border: 1px solid #d5dbdb;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

#${IDS.cptStageOverlay} .ws-table {
  font-family: "Amazon Ember", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

#${IDS.cptStageOverlay} .ws-table thead th {
  font-family: "Amazon Ember", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

#${IDS.cptStageOverlay} .ws-table tbody td {
  font-family: "Amazon Ember", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

#${IDS.cptStageOverlay} .ws-table thead th {
  font-size: 14px;
  font-weight: 800;
  padding: 12px 14px;
}

#${IDS.cptStageOverlay} .ws-table thead th.ws-sortable {
  cursor: pointer;
  user-select: none;
}

#${IDS.cptStageOverlay} .ws-table thead th.ws-sortable:hover {
  background: #e9ebed;
}

#${IDS.cptStageOverlay} .ws-table tbody td {
  font-size: 14px;
  padding: 12px 14px;
}

#${IDS.cptStageOverlay} .ws-btn {
  font-family: "Amazon Ember", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.ws-cpt-stage-empty {
  font-size: 13px;
  color: var(--ws-text-secondary);
}

.ws-cpt-detail-btn:hover {
  background: var(--ws-hover);
  border-color: #5f6b7a;
}

.ws-cpt-detail-row td {
  background: #f8fafc !important;
  border-top: 1px dashed var(--ws-border);
  padding: 12px 14px !important;
}

.ws-cpt-detail-inline-row td {
  background: #f8fafc !important;
  font-size: 12px;
  color: #3b4754;
  border-top: 1px dashed #dde6ee;
}

.ws-cpt-detail-row-green-text td {
  color: #1f7a3d !important;
  font-weight: 700;
}

.ws-cpt-detail-row-green-text td a {
  color: #1f7a3d !important;
}

.ws-cpt-detail-row-red-text td {
  color: #b42318 !important;
  font-weight: 700;
}

.ws-cpt-detail-row-red-text td a {
  color: #b42318 !important;
}

.ws-cpt-detail-row-orange-text td {
  color: #b35a00 !important;
  font-weight: 700;
}

.ws-cpt-detail-row-orange-text td a {
  color: #b35a00 !important;
}

.ws-cpt-detail-inline-row:hover td {
  background: #eef3f8 !important;
}

.ws-cpt-detail-inline-row td:first-child {
  background: #f8fafc !important;
}

.ws-cpt-detail-area-cell {
  position: relative;
  padding-left: 28px !important;
  font-weight: 700;
  color: #22303c;
  vertical-align: middle !important;
}

.ws-cpt-detail-area-cell::before {
  content: '';
  position: absolute;
  left: 12px;
  top: 50%;
  width: 8px;
  height: 8px;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: #c4d4e3;
  z-index: 1;
}

.ws-cpt-detail-area-cell::after {
  content: '';
  position: absolute;
  left: 12px;
  top: 0;
  bottom: 0;
  width: 2px;
  transform: translateX(-50%);
  background: linear-gradient(180deg, #d7e3ef 0%, #c6d6e5 100%);
  border-radius: 999px;
  opacity: 0.95;
}

.ws-cpt-detail-inline-row-last .ws-cpt-detail-area-cell::after {
  top: 0;
  bottom: 50%;
}
.ws-cpt-detail-inline-row td {
  vertical-align: middle !important;
}

.ws-cpt-detail-inline-row td {
  background: #f8fafc !important;
  font-size: 12px;
  color: #3b4754;
  border-top: 1px dashed #dde6ee;
}

.ws-cpt-detail-inline-row:hover td {
  background: #eef3f8 !important;
}

.ws-cpt-detail-inline-row:hover td:last-child {
  background: #eef3f8 !important;
}

.ws-cpt-detail-inline-row td:last-child {
  background: #f8fafc !important;
}

.ws-cpt-detail-inline-row td:nth-child(3) {
  color: #5f6b7a;
}

.ws-cpt-detail-inline-row td:last-child {
  background: #f8fafc !important;
}

.ws-cpt-detail-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ws-cpt-detail-title {
  font-size: 12px;
  font-weight: 800;
  color: var(--ws-text);
}

.ws-cpt-detail-empty {
  font-size: 12px;
  color: var(--ws-text-secondary);
}

.ws-skynet-table th,
.ws-skynet-table td {
  vertical-align: middle !important;
}

.ws-skynet-table th:last-child,
.ws-skynet-table td:last-child {
  width: 90px;
  text-align: center;
}

.ws-skynet-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.2;
  border: 1px solid transparent;
  white-space: nowrap;
}

.ws-skynet-status span {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
}

.ws-skynet-status-active {
  color: #b42318;
  border-color: #f04438;
  background: #fff;
}

.ws-skynet-status-active span {
  background: #e11d48;
}

.ws-skynet-status-solved {
  color: #2e7d32;
  border-color: #6aa84f;
  background: #fff;
}

.ws-skynet-status-solved span {
  background: #5aa85f;
}

.ws-skynet-solve-btn {
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 800;
}

.ws-skynet-solve-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.ws-skynet-table tbody tr td {
  border-bottom: 1px solid #d5dbdb !important;
}

.ws-skynet-table tbody tr:last-child td {
  border-bottom: none !important;
}

.ws-skynet-row-active td {
  background: #fdecea !important;
}

.ws-skynet-row-active:hover td {
  background: #f9d9d6 !important;
}

.ws-skynet-row-solved td {
  background: #e8f7ee !important;
}

.ws-skynet-row-solved:hover td {
  background: #dcf3e6 !important;
}

.ws-skynet-live-time {
  font-variant-numeric: tabular-nums;
  font-weight: 800;
}

    `;

    document.head.appendChild(style);
    log(`Styles injected by ${SCRIPT_AUTHOR}`);
  }

  function waitForElement(selector, timeoutMs = 20000) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(selector);
      if (existing) {
        log('waitForElement found immediately:', selector);
        resolve(existing);
        return;
      }

      const startedAt = Date.now();
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          log('waitForElement found via observer:', selector);
          resolve(element);
          return;
        }

        if (Date.now() - startedAt > timeoutMs) {
          observer.disconnect();
          reject(new Error(`Timeout waiting for selector: ${selector}`));
        }
      });

      observer.observe(document.documentElement, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        const lateElement = document.querySelector(selector);
        if (lateElement) {
          resolve(lateElement);
        } else {
          reject(new Error(`Timeout waiting for selector: ${selector}`));
        }
      }, timeoutMs);
    });
  }

  function loadStructureMap() {
    try {
      const raw = localStorage.getItem(state.storageKey);
      if (!raw) {
        log('No cached structure map found');
        return null;
      }

      const parsed = JSON.parse(raw);
      log('Loaded cached structure map:', parsed);
      return parsed;
    } catch (err) {
      error('Failed to load structure map from localStorage', err);
      return null;
    }
  }

  function saveStructureMap(map) {
    try {
      localStorage.setItem(state.storageKey, JSON.stringify(map));
      log('Saved structure map to localStorage:', map);
    } catch (err) {
      error('Failed to save structure map', err);
    }
  }

  function clearStructureMap() {
    try {
      localStorage.removeItem(state.storageKey);
      log('Cleared structure map');
    } catch (err) {
      error('Failed to clear structure map', err);
    }
  }

  function buildInitialStructureMap() {
    const map = {
      version: 1,
      host: window.location.hostname,
      facility: state.route.facility || '',
      sorterName: state.route.sorterName || '',
      nodeKey: state.route.nodeKey || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      areas: {},
      note: `Watch Sorter structure map by ${SCRIPT_AUTHOR}`,
      creator: SCRIPT_AUTHOR,
    };

    log('Built initial structure map:', map);
    return map;
  }

  function mergeAreasIntoStructureMap(discoveredAreas) {
    if (!state.structureMap) {
      state.structureMap = buildInitialStructureMap();
    }

    let changed = false;

    for (const area of discoveredAreas) {
      const key = area.name;
      if (!key) continue;

      if (!state.structureMap.areas[key]) {
        state.structureMap.areas[key] = {
          label: area.name,
          type: area.type,
          sortKey: area.sortKey,
          mirrored: area.mirrored,
          firstSeenAt: Date.now(),
          creator: SCRIPT_AUTHOR,
        };
        changed = true;
      }
    }

    if (changed) {
      state.structureMap.updatedAt = Date.now();
      saveStructureMap(state.structureMap);
      log('Structure map updated from live payload');
    }

    updateMapInfo();
  }

  function getTableHeaderHtml() {
    return `
      <th class="ws-col-filter">Stacking Filter</th>
      <th class="ws-col-areas-count ws-sortable" data-sort-key="areasCount">Areas${getSortIndicator('areasCount')}</th>
      <th class="ws-col-areas ws-sortable" data-sort-key="areas">Stacking Areas${getSortIndicator('areas')}</th>
      <th class="ws-col-metric ws-sortable" data-sort-key="onSorterNow">On sorter now${getSortIndicator('onSorterNow')}</th>
      <th class="ws-col-metric ws-sortable" data-sort-key="m15">15m${getSortIndicator('m15')}</th>
      <th class="ws-col-metric ws-sortable" data-sort-key="m30">30m${getSortIndicator('m30')}</th>
      <th class="ws-col-metric ws-sortable" data-sort-key="m60">60m${getSortIndicator('m60')}</th>
      <th class="ws-col-metric ws-sortable" data-sort-key="m120">120m${getSortIndicator('m120')}</th>
      <th class="ws-col-metric ws-sortable" data-sort-key="m240">240m${getSortIndicator('m240')}</th>
      <th class="ws-col-cpt ws-sortable" data-sort-key="cptMs">Next CPT${getSortIndicator('cptMs')}</th>
    `;
  }

  function bindSortableHeaders(root) {
    const sortableHeaders = root.querySelectorAll('[data-sort-key]');
    sortableHeaders.forEach((header) => {
      header.addEventListener('click', () => {
        const sortKey = header.getAttribute('data-sort-key') || '';
        if (!sortKey) return;
        toggleSort(sortKey);
      });
    });

    if (sortableHeaders.length) {
      log('Sortable headers bound:', sortableHeaders.length);
    }
  }

  function refreshTableHeaders() {
    const overlay = document.getElementById(IDS.overlay);
    if (!overlay) return;

    const theadRow = overlay.querySelector(`#${IDS.tableHeadRow}`);
    if (!theadRow) return;

    theadRow.innerHTML = getTableHeaderHtml();
    bindSortableHeaders(overlay);
  }

  function refreshSeriesBar() {
    const bar = document.getElementById(IDS.seriesBar);
    if (!bar) return;

    if (!state.seriesButtons.length) {
      bar.innerHTML = '';
      return;
    }

    bar.innerHTML = state.seriesButtons.map(series => {
      const isActive = state.activeSeries.has(series);
      return `
        <button
          type="button"
          class="ws-series-pill${isActive ? ' ws-series-pill-active' : ''}"
          data-series="${escapeHtml(series)}"
        >
          ${escapeHtml(series)}
        </button>
      `;
    }).join('');

bar.querySelectorAll('[data-series]').forEach(btn => {
  btn.addEventListener('click', () => {
    const series = btn.getAttribute('data-series') || '';
    if (!series) return;

    if (state.activeSeries.has(series)) {
      state.activeSeries.delete(series);
    } else {
      state.activeSeries.add(series);
    }

refreshSeriesBar();
applySearch(state.searchQuery || '');
renderAdditionalAreaNeededBlock();
renderReadySeriesBlock();
refreshMirrorNeededBar();
renderOperationalSummary();

  });
});
  }
  function refreshReadinessBar() {
    const bar = document.getElementById(IDS.readinessBar);
    if (!bar) return;

    const counts = state.readinessCounts || { ready: 0, monitor: 0 };

    const items = [
      { key: 'ready', label: 'Deallocate Ready', count: counts.ready, cls: 'ready' },
      { key: 'monitor', label: 'Needs Monitoring', count: counts.monitor, cls: 'monitor' },
    ];

    bar.innerHTML = items.map(item => {
      const isActive = state.activeReadiness.has(item.key);
      return `
        <button
          type="button"
          class="ws-readiness-pill ws-readiness-pill-${item.cls}${isActive ? ' ws-readiness-pill-active' : ''}"
          data-readiness="${item.key}"
        >
          ${escapeHtml(item.label)} ${item.count}
        </button>
      `;
    }).join('');

    bar.querySelectorAll('[data-readiness]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-readiness') || '';
        if (!key) return;

        if (state.activeReadiness.has(key)) {
          state.activeReadiness.delete(key);
        } else {
          state.activeReadiness.add(key);
        }

        refreshReadinessBar();
        applySearch(state.searchQuery || '');
      });
    });
  }

      function refreshNextCptBar() {
    const bar = document.getElementById(IDS.nextCptBar);
    if (!bar) return;

    const isActive = state.activeNextCptFilters.has('nextOver8h');

    bar.innerHTML = `
      <button
        type="button"
        class="ws-readiness-pill ws-nextcpt-pill${isActive ? ' ws-nextcpt-pill-active' : ''}"
        data-next-cpt="nextOver8h"
      >
        Fillter By Next &gt;8h Cpt
      </button>
    `;

    bar.querySelectorAll('[data-next-cpt]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.activeNextCptFilters.has('nextOver8h')) {
          state.activeNextCptFilters.delete('nextOver8h');
        } else {
          state.activeNextCptFilters.add('nextOver8h');
        }

        refreshNextCptBar();
        applySearch(state.searchQuery || '');
      });
    });
  }

    function refreshMirrorNeededBar() {
  const bar = document.getElementById('ws-mirror-needed-bar');
  if (!bar) return;

  const counts = getAdditionalAreaNeededCounts();
  const isActive = state.activeMirrorNeededFilters.has('mirrorNeeded');

  bar.innerHTML = `
    <button
      type="button"
      class="ws-readiness-pill ws-mirror-needed-pill${isActive ? ' ws-mirror-needed-pill-active' : ''}"
      data-mirror-needed="mirrorNeeded"
    >
      Mirror Needed ${counts.rows}
    </button>
  `;

  bar.querySelectorAll('[data-mirror-needed]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.activeMirrorNeededFilters.has('mirrorNeeded')) {
        state.activeMirrorNeededFilters.delete('mirrorNeeded');
      } else {
        state.activeMirrorNeededFilters.add('mirrorNeeded');
      }

      refreshMirrorNeededBar();
      applySearch(state.searchQuery || '');
    });
  });
}

  function setStatus(text) {
    const el = document.getElementById(IDS.statusText);
    if (el) {
      el.textContent = `Status: ${text}`;
    }
    log('Status updated:', text);
  }

    function setSharedSearchUi(tabName) {
  const input = document.getElementById(IDS.sharedSearchInput);
  const badge = document.getElementById(IDS.sharedSearchStatusText);
  if (!input || !badge) return;

  if (tabName === 'watchSorter') {
    input.placeholder = 'Search stacking filter or stacking area';
    input.value = state.searchQuery || '';
    badge.textContent = 'Search: Watch Sorter';
    input.style.display = '';
    return;
  }

  if (tabName === 'noResources') {
    input.placeholder = 'Search stacking filter';
    input.value = state.noResources.searchQuery || '';
    badge.textContent = 'Search: No Resources';
    input.style.display = '';
    return;
  }

  if (tabName === 'sorter') {
    input.placeholder = 'Search area, stacking filter or chute';
    input.value = state.sorterSearchQuery || '';
    badge.textContent = 'Search: Sorter';
    input.style.display = '';
    return;
  }

  if (tabName === 'stem') {
    input.placeholder = 'Search stem';
    input.value = state.stemSearchQuery || '';
    badge.textContent = 'Search: Stem';
    input.style.display = '';
    return;
  }

  input.value = '';
  badge.textContent = 'Search';
}

function applySharedTabSearch(value) {
  const activeTab = state.activeRecirculationTab || 'watchSorter';

  if (activeTab === 'watchSorter') {
    applySearch(value);
    return;
  }

  if (activeTab === 'noResources') {
    applyNoResourceSearch(value);
    return;
  }

  if (activeTab === 'sorter') {
    state.sorterSearchQuery = value || '';
    renderSorterRows();
    return;
  }

  if (activeTab === 'stem') {
    state.stemSearchQuery = value || '';
    renderStemView();
  }
}

    function appendStemActionLog(message, payload = null) {
  const ts = new Date().toLocaleTimeString();
  const line = payload
    ? `[${ts}] ${message} ${JSON.stringify(payload)}`
    : `[${ts}] ${message}`;

  state.stemAction.logs.push(line);

  if (state.stemAction.logs.length > 200) {
    state.stemAction.logs.shift();
  }

  renderStemActionLog();
}


function renderStemActionLog() {
  const el = document.getElementById('ws-stem-action-log');
  if (!el) return;

  el.textContent = state.stemAction.logs.join('\n');
  el.scrollTop = el.scrollHeight;
}

function isStemBusy() {
  return Boolean(state.stemAction.busy);
}

function isCurrentStemAction(actionKey) {
  return isStemBusy() && String(state.stemAction.busyActionKey || '') === String(actionKey || '');
}

function rerenderStemActionUi() {
  renderStemView();
  renderStemRequestAllocatePopup();

  if (state.overlayOpen && state.activeRecirculationTab === 'watchSorter') {
    renderReadySeriesBlock();
    renderAdditionalAreaNeededBlock();
  }

  if (state.overlayOpen && state.activeRecirculationTab === 'noResources') {
    renderNoResourceRows(state.noResources.filteredRows || []);
  }
}

async function runStemActionLocked(actionKey, busyText, fn) {
  if (state.stemAction.busy) {
    appendStemActionLog('STEM action already in progress', {
      active: state.stemAction.busyActionKey,
      requested: actionKey,
    });
    return null;
  }

  state.stemAction.busy = true;
  state.stemAction.busyActionKey = String(actionKey || '');
  state.stemAction.busyText = String(busyText || 'STEM action in progress...');
  rerenderStemActionUi();

  try {
    return await fn();
  } finally {
    state.stemAction.busy = false;
    state.stemAction.busyActionKey = '';
    state.stemAction.busyText = '';
    rerenderStemActionUi();
  }
}

    function getStemEquipmentUrl() {
  const nodeId = String(state?.route?.facility || '').trim();
  if (!nodeId) return '';

  return `https://stem-eu.corp.amazon.com/node/${encodeURIComponent(nodeId)}/equipment`;
}

    function isFreshStemHeartbeat(hb) {
  const text = String(hb?.bodyTextSample || hb?.dataFreshText || '').toLowerCase();

  if (text.includes('data from less than a minute ago')) {
    return true;
  }

  return false;
}

function shouldRequireFreshStemForAction(actionType) {
  return [
    'allocateDirectBootstrap',
    'requestAllocateAvailabilityBootstrap',
  ].includes(String(actionType || ''));
}

    async function getLiveStemHeartbeat(options = {}) {
  try {
    const hb = await GM_getValue(STEM_HEARTBEAT_KEY);
    const age = Date.now() - Number(hb?.ts || 0);
    const nodeId = String(state?.route?.facility || '').trim();

if (
  hb &&
  hb.alive === true &&
  age >= 0 &&
  age < STEM_HEARTBEAT_TTL_MS &&
  String(hb.nodeId || '') === nodeId
) {
  if (options.requireFresh && !isFreshStemHeartbeat(hb)) {
if (!window.__wsLastStaleStemHeartbeatLogAt || Date.now() - window.__wsLastStaleStemHeartbeatLogAt > 3000) {
  window.__wsLastStaleStemHeartbeatLogAt = Date.now();

  appendStemActionLog('Ignoring stale STEM tab heartbeat', {
    tabId: hb.tabId || '',
    href: hb.href || '',
    bodyTextSample: hb.bodyTextSample || '',
  });
}
    return null;
  }

  return hb;
}
  } catch {}

  return null;
}

async function waitForLiveStemHeartbeatAfterOpen(timeoutMs = 30000, pollMs = 500, options = {}) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const liveStem = await getLiveStemHeartbeat(options);

    if (liveStem?.tabId) {
      return liveStem;
    }

    await new Promise(resolve => setTimeout(resolve, pollMs));
  }

  return null;
}

    function gmPostStemGraphql(body, csrfToken) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'POST',
      url: STEM_GRAPHQL_URL,
      headers: {
        accept: '*/*',
        'content-type': 'application/json',
        'anti-csrftoken-a2z': csrfToken,
      },
      data: JSON.stringify(body),
      onload: response => {
        let json = null;
        const text = String(response?.responseText || '');

        try {
          json = JSON.parse(text);
        } catch {}

        resolve({
          status: Number(response?.status || 0),
          ok: Number(response?.status || 0) >= 200 && Number(response?.status || 0) < 300,
          json,
          text: json ? '' : text.slice(0, 1000),
        });
      },
      onerror: err => reject(err),
      ontimeout: err => reject(err),
    });
  });
}

async function waitForStemBootstrapResult(commandId, timeoutMs = 30000, pollMs = 500) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const result = await GM_getValue(STEM_BOOTSTRAP_RESULT_KEY);

    if (String(result?.commandId || '') === String(commandId || '')) {
      return result;
    }

    await new Promise(resolve => setTimeout(resolve, pollMs));
  }

  return null;
}

async function submitStemRemoveReservationsDirect(command, bootstrapResult) {
  const nodeId = String(command?.nodeId || '').trim();
  const area = String(command?.area || '').trim();
  const allocation = bootstrapResult?.allocation || {};
  const csrfToken = String(bootstrapResult?.csrfToken || '').trim();

  const resourceId = String(allocation?.resourceId || '').trim();
  const stackingFilters = Array.isArray(allocation?.stackingFilters)
    ? allocation.stackingFilters.map(x => String(x || '').trim()).filter(Boolean)
    : [String(allocation?.stackingFilter || '').trim()].filter(Boolean);

  if (!nodeId || !area || !resourceId || !stackingFilters.length || !csrfToken) {
    appendStemActionLog('ERROR: Direct RemoveReservations missing input', {
      nodeId,
      area,
      resourceId,
      stackingFilters,
      hasCsrfToken: Boolean(csrfToken),
      bootstrapResult,
    });
    return;
  }

  const body = [{
    operationName: 'RemoveReservations',
    variables: {
      allocationChangeInput: {
        nodeId,
        resourceId,
        stackingFilters,
      },
    },
    query: `mutation RemoveReservations($allocationChangeInput: RemoveReservationsInput!) {
  removeReservations(removeReservationsInput: $allocationChangeInput) {
    reservationId
    __typename
  }
}`,
  }];

  appendStemActionLog('Submitting Direct RemoveReservations from Foresight', {
    nodeId,
    area,
    resourceId,
    stackingFilters,
    reservationId: allocation?.reservationId || '',
  });

const response = await gmPostStemGraphql(body, csrfToken);

appendStemActionLog(
  response.ok ? 'Direct RemoveReservations response OK' : 'ERROR: Direct RemoveReservations failed',
  response
);

return response;
}



function getStemResponseItemsForAllocate(response) {
  const json = response?.json;
  if (Array.isArray(json)) return json;
  if (json && typeof json === 'object') return [json];
  return [];
}

function getStemErrorsForAllocate(response) {
  return getStemResponseItemsForAllocate(response)
    .flatMap(item => Array.isArray(item?.errors) ? item.errors : [])
    .map(err => ({
      message: String(err?.message || 'Unknown STEM error'),
      errorCode: String(err?.extensions?.errorCode || ''),
      classification: String(err?.extensions?.classification || ''),
      existingReservations: err?.extensions?.existingReservations || [],
      raw: err,
    }));
}

async function getStemAllocateDirectBootstrap(area, sf) {
  const command = await sendStemCommandToBridge('allocateDirectBootstrap', area, sf);

  if (!command?.id) {
    appendStemActionLog('ERROR: Allocate bootstrap command was not created');
    return null;
  }

  appendStemActionLog('Waiting for Allocate bootstrap result', {
    commandId: command.id,
    area,
    sf,
  });

  const bootstrapResult = await waitForStemBootstrapResult(command.id);

  if (!bootstrapResult) {
    appendStemActionLog('ERROR: Allocate bootstrap timeout', {
      commandId: command.id,
      area,
      sf,
    });
    return null;
  }

  appendStemActionLog(
    bootstrapResult.ok ? 'Allocate bootstrap received' : 'ERROR: Allocate bootstrap failed',
    bootstrapResult
  );

  if (!bootstrapResult.ok) return null;

  return { command, bootstrapResult };
}

async function submitStemAddReservationsDirect(command, bootstrapResult) {
  const nodeId = String(command?.nodeId || '').trim();
  const area = String(command?.area || '').trim();
  const sf = String(command?.sf || '').trim();
  const csrfToken = String(bootstrapResult?.csrfToken || '').trim();
  const resourceId = String(bootstrapResult?.resource?.resourceId || '').trim();
  const lane = getLaneForStackingFilter(sf);

  if (!nodeId || !area || !sf || !csrfToken || !resourceId || !lane || lane === '-') {
    appendStemActionLog('ERROR: AddReservations missing input', {
      nodeId,
      area,
      sf,
      hasCsrfToken: Boolean(csrfToken),
      resourceId,
      lane,
      bootstrapResult,
    });
    return null;
  }

  const body = [{
    operationName: 'AddReservations',
    variables: {
      allocationChangeInput: {
        nodeId,
        resourceId,
        sfWithLanes: [
          {
            stackingFilter: sf,
            lanes: [lane],
          },
        ],
      },
    },
    query: `mutation AddReservations($allocationChangeInput: AddReservationsInput!) {
  addReservations(addReservationsInput: $allocationChangeInput) {
    reservationId
    __typename
  }
}`,
  }];

  appendStemActionLog('Submitting AddReservations', {
    nodeId,
    area,
    sf,
    lane,
    resourceId,
  });

  const response = await gmPostStemGraphql(body, csrfToken);
  const errors = getStemErrorsForAllocate(response);

  if (errors.length) {
    appendStemActionLog('ERROR: AddReservations failed', {
      status: response.status,
      errors,
    });
  } else {
    appendStemActionLog('AddReservations OK', response);
  }

  return response;
}

async function handleStemAllocateDirect(area, sf) {
  const firstBoot = await getStemAllocateDirectBootstrap(area, sf);
  if (!firstBoot) return;

  const firstResponse = await submitStemAddReservationsDirect(
    firstBoot.command,
    firstBoot.bootstrapResult
  );

  if (firstResponse?.status === 403) {
    appendStemActionLog('AddReservations got 403, retrying with fresh bootstrap', {
      area,
      sf,
      firstCommandId: firstBoot.command.id,
    });

    const retryBoot = await getStemAllocateDirectBootstrap(area, sf);
    if (!retryBoot) return;

    await submitStemAddReservationsDirect(retryBoot.command, retryBoot.bootstrapResult);
  }
}

function getStemAreaResourceMapStorageKey() {
  const nodeId = String(state?.route?.facility || '').trim() || 'unknown-node';
  return `${STEM_AREA_RESOURCE_MAP_KEY}:${nodeId}`;
}

function readStemAreaResourceMapCache() {
  try {
    const raw = localStorage.getItem(getStemAreaResourceMapStorageKey());
    if (!raw) return null;

    const cached = JSON.parse(raw);
    const loadedAt = Number(cached?.loadedAt || 0);

    if (!loadedAt || Date.now() - loadedAt > STEM_AREA_RESOURCE_MAP_TTL_MS) {
      return null;
    }

    return cached;
  } catch {
    return null;
  }
}

function writeStemAreaResourceMapCache(payload) {
  try {
    localStorage.setItem(getStemAreaResourceMapStorageKey(), JSON.stringify(payload));
  } catch (err) {
    appendStemActionLog('ERROR: Failed to write STEM area resource cache', {
      message: err?.message || String(err),
    });
  }
}

function getStemResourceAttrForRequestAllocate(resource, key) {
  const attrs = Array.isArray(resource?.resourceAttributes) ? resource.resourceAttributes : [];
  const found = attrs.find(attr =>
    String(attr?.key || '').trim().toLowerCase() === String(key || '').trim().toLowerCase()
  );
  return String(found?.value || '').trim();
}

function buildWatchSorterAreaBaseMap() {
  const result = new Map();

  const addArea = areaName => {
    const label = String(areaName || '').trim();
    if (!label) return;

    const key = normalizeStemArea(label);
    if (!key || result.has(key)) return;

    result.set(key, {
      label,
      areaType: inferAreaType(label),
      sortKey: inferAreaSortKey(label),
      source: 'watchSorter',
    });
  };

  for (const row of Array.isArray(state.rows) ? state.rows : []) {
    for (const area of Array.isArray(row?.areas) ? row.areas : []) {
      addArea(area);
    }
  }

  const structureAreas = state.structureMap?.areas || {};
  for (const item of Object.values(structureAreas)) {
    addArea(item?.label);
  }

  return result;
}

function extractStemResourceMapFromConnectedData(data) {
  const result = {};

  const connections = Array.isArray(data?.getAllConnectedResources)
    ? data.getAllConnectedResources
    : [];

  for (const connection of connections) {
    const chuteId = String(connection?.chuteId || '').trim();

    for (const resource of Array.isArray(connection?.resources) ? connection.resources : []) {
      if (String(resource?.resourceType || '') !== 'STACKING_AREA') continue;

      const label = String(resource?.label || '').trim();
      const key = normalizeStemArea(label);
      if (!key) continue;

      result[key] = {
        label,
        resourceId: String(resource?.resourceId || '').trim(),
        resourceType: String(resource?.resourceType || '').trim(),
        status: getStemResourceAttrForRequestAllocate(resource, 'Status'),
        chuteId,
        sharingType: getStemResourceAttrForRequestAllocate(resource, 'SharingType'),
        containerTypes: getStemResourceAttrForRequestAllocate(resource, 'containerTypes'),
        bagOnly: getStemResourceAttrForRequestAllocate(resource, 'BagOnly'),
        restrictBag: getStemResourceAttrForRequestAllocate(resource, 'RestrictBag'),
      };
    }
  }

  return result;
}

async function refreshStemAreaResourceMapCache(nodeId, csrfToken) {
  const body = [{
    operationName: 'GetAllConnectedResources',
    variables: { nodeId },
    query: `query GetAllConnectedResources($nodeId: String!) {
  getAllConnectedResources(nodeId: $nodeId) {
    __typename
    chuteId
    resources {
      __typename
      resourceId
      resourceType
      label
      resourceAttributes {
        __typename
        key
        value
      }
    }
  }
}`,
  }];

  const response = await gmPostStemGraphql(body, csrfToken);
  const errors = getStemErrorsForAllocate(response);

  if (errors.length) {
    return {
      ok: false,
      errors,
      response,
    };
  }

  const json = response?.json;
  const data = Array.isArray(json) ? json[0]?.data : json?.data;
  const resourceMap = extractStemResourceMapFromConnectedData(data);

  const payload = {
    schemaVersion: 1,
    nodeId,
    loadedAt: Date.now(),
    resourcesByAreaKey: resourceMap,
  };

  writeStemAreaResourceMapCache(payload);

  return {
    ok: true,
    cache: payload,
  };
}

async function getStemAreaResourceMapCache(nodeId, csrfToken) {
  const cached = readStemAreaResourceMapCache();

  if (cached?.resourcesByAreaKey) {
    return {
      ok: true,
      cache: cached,
      fromCache: true,
    };
  }

  const fresh = await refreshStemAreaResourceMapCache(nodeId, csrfToken);
  return {
    ...fresh,
    fromCache: false,
  };
}

function buildEnrichedWatchSorterAreaMap(resourceCache) {
  const baseMap = buildWatchSorterAreaBaseMap();
  const resourcesByAreaKey = resourceCache?.resourcesByAreaKey || {};
  const result = [];

  for (const [areaKey, base] of baseMap.entries()) {
    const resource = resourcesByAreaKey[areaKey] || null;

    if (!resource?.resourceId) continue;

    result.push({
      ...base,
      ...resource,
      label: base.label,
      areaKey,
    });
  }

  return result.sort((a, b) => inferAreaSortKey(a.label).localeCompare(inferAreaSortKey(b.label)));
}

function addRequestAllocateUnavailableResource(target, resource) {
  if (String(resource?.resourceType || '') !== 'STACKING_AREA') return;

  const label = normalizeStemArea(resource?.label);
  const resourceId = String(resource?.resourceId || '').trim();

  if (label) target.labels.add(label);
  if (resourceId) target.resourceIds.add(resourceId);
}

function parseRequestAllocateLiveData(reservationsAtTimeData, pendingData, sf) {
  const unavailable = {
    labels: new Set(),
    resourceIds: new Set(),
  };

  const allocatedForSf = [];
  const sfKey = normalizeStackingFilterForBridge(sf);

  const reservations = Array.isArray(reservationsAtTimeData?.reservationsAtTime)
    ? reservationsAtTimeData.reservationsAtTime
    : [];

  for (const reservation of reservations) {
    const reservationSfs = Array.isArray(reservation?.stackingFilters)
      ? reservation.stackingFilters.map(x => String(x || '').trim()).filter(Boolean)
      : [];

    const hasCurrentSf = reservationSfs.some(x => normalizeStackingFilterForBridge(x) === sfKey);

    for (const resource of Array.isArray(reservation?.resources) ? reservation.resources : []) {
      addRequestAllocateUnavailableResource(unavailable, resource);

      if (hasCurrentSf && String(resource?.resourceType || '') === 'STACKING_AREA') {
        const label = String(resource?.label || '').trim();
        if (label) allocatedForSf.push(label);
      }
    }
  }

  const pendingAllocations = Array.isArray(pendingData?.pendingAllocations)
    ? pendingData.pendingAllocations
    : [];

  for (const pending of pendingAllocations) {
    if (String(pending?.status || '').toUpperCase() !== 'PENDING') continue;

    for (const resource of Array.isArray(pending?.resources) ? pending.resources : []) {
      addRequestAllocateUnavailableResource(unavailable, resource);
    }

    for (const resource of Array.isArray(pending?.currentResources) ? pending.currentResources : []) {
      addRequestAllocateUnavailableResource(unavailable, resource);
    }
  }

  return {
    unavailable,
    allocatedForSf: Array.from(new Set(allocatedForSf))
      .sort((a, b) => inferAreaSortKey(a).localeCompare(inferAreaSortKey(b))),
  };
}

async function fetchRequestAllocateLiveData(nodeId, csrfToken, sf) {
  const atTime = String(Date.now());

  const reservationsAtTimeBody = [{
    operationName: 'ReservationsAtTime',
    variables: { nodeId, atTime },
    query: `query ReservationsAtTime($nodeId: String!, $atTime: String!) {
  reservationsAtTime(nodeId: $nodeId, atTime: $atTime) {
    __typename
    reservationId
    stackingFilters
    startTime
    endTime
    lastUpdateTime
    userLogin
    reservationProperties {
      __typename
      key
      value
    }
    resources {
      __typename
      resourceId
      label
      resourceType
    }
  }
}`,
  }];

  const pendingBody = [{
    operationName: 'PendingAllocations',
    variables: { nodeId },
    query: `query PendingAllocations($nodeId: String!) {
  pendingAllocations(nodeId: $nodeId) {
    requestId
    reservationId
    stackingFilters
    startTime
    endTime
    lastUpdateTime
    userLogin
    reservationProperties {
      key
      value
      __typename
    }
    resources {
      label
      resourceId
      resourceType
      status
      __typename
    }
    currentResources {
      label
      resourceId
      resourceType
      status
      __typename
    }
    action
    status
    __typename
  }
}`,
  }];

  const [reservationsAtTimeResponse, pendingResponse] = await Promise.all([
    gmPostStemGraphql(reservationsAtTimeBody, csrfToken),
    gmPostStemGraphql(pendingBody, csrfToken),
  ]);

  const reservationErrors = getStemErrorsForAllocate(reservationsAtTimeResponse);
  const pendingErrors = getStemErrorsForAllocate(pendingResponse);

  if (reservationErrors.length || pendingErrors.length) {
    return {
      ok: false,
      reservationErrors,
      pendingErrors,
      reservationsAtTimeResponse,
      pendingResponse,
    };
  }

  const reservationsJson = reservationsAtTimeResponse?.json;
  const pendingJson = pendingResponse?.json;

  const reservationsAtTimeData = Array.isArray(reservationsJson)
    ? reservationsJson[0]?.data
    : reservationsJson?.data;

  const pendingData = Array.isArray(pendingJson)
    ? pendingJson[0]?.data
    : pendingJson?.data;

  return {
    ok: true,
    ...parseRequestAllocateLiveData(reservationsAtTimeData, pendingData, sf),
  };
}

async function loadStemRequestAllocatePopupData(command, bootstrapResult) {
  const sf = String(state.stemAction.stackingFilter || '').trim();
  const nodeId = String(command?.nodeId || '').trim();
  const csrfToken = String(bootstrapResult?.csrfToken || '').trim();

  try {
    const cacheResult = await getStemAreaResourceMapCache(nodeId, csrfToken);

    if (!cacheResult.ok) {
      state.stemAction.requestAllocateError = 'Failed to load area resourceId map';
      state.stemAction.requestAllocateLoading = false;
      renderStemRequestAllocatePopup();
      appendStemActionLog('ERROR: Request Allocate resource map failed', cacheResult);
      return;
    }

    const liveResult = await fetchRequestAllocateLiveData(nodeId, csrfToken, sf);

    if (!liveResult.ok) {
      state.stemAction.requestAllocateError = 'Failed to load reservationsAtTime / pendingAllocations';
      state.stemAction.requestAllocateLoading = false;
      renderStemRequestAllocatePopup();
      appendStemActionLog('ERROR: Request Allocate live data failed', liveResult);
      return;
    }

    const enrichedAreas = buildEnrichedWatchSorterAreaMap(cacheResult.cache);

    const availableAreas = enrichedAreas
      .filter(area => String(area.resourceType || '') === 'STACKING_AREA')
      .filter(area => String(area.status || '').toUpperCase() === 'ENABLED')
      .filter(area => !liveResult.unavailable.labels.has(normalizeStemArea(area.label)))
      .filter(area => !liveResult.unavailable.resourceIds.has(area.resourceId))
      .sort((a, b) => inferAreaSortKey(a.label).localeCompare(inferAreaSortKey(b.label)));

    state.stemAction.requestAllocateAreas = availableAreas;
    state.stemAction.requestAllocateSelectedArea = availableAreas[0]?.label || '';
    state.stemAction.requestAllocateAllocatedAreas = liveResult.allocatedForSf || [];
    state.stemAction.requestAllocateResourceCacheInfo = cacheResult.fromCache
      ? `resourceId cache: ${new Date(cacheResult.cache.loadedAt).toLocaleString()}`
      : 'resourceId cache: refreshed now';
    state.stemAction.requestAllocateLoading = false;
    state.stemAction.requestAllocateError = '';

    renderStemRequestAllocatePopup();

    appendStemActionLog('Request Allocate popup data loaded', {
      baseAreas: enrichedAreas.length,
      availableAreas: availableAreas.length,
      allocatedForSf: state.stemAction.requestAllocateAllocatedAreas,
      cache: state.stemAction.requestAllocateResourceCacheInfo,
    });
  } catch (err) {
    state.stemAction.requestAllocateError = err?.message || String(err);
    state.stemAction.requestAllocateLoading = false;
    renderStemRequestAllocatePopup();

    appendStemActionLog('ERROR: Request Allocate popup data crashed', {
      message: err?.message || String(err),
    });
  }
}

async function openStemRequestAllocatePopup() {
  const sf = String(state.stemAction.stackingFilter || '').trim();

  if (!sf) {
    appendStemActionLog('ERROR: SF is required for Request Allocate');
    return;
  }

  const lane = getLaneForStackingFilter(sf);
  if (!lane || lane === '-') {
    appendStemActionLog('ERROR: Lane not found in Vinyaas cache for SF', { sf });
    return;
  }

  state.stemAction.requestAllocatePopupOpen = true;
  state.stemAction.requestAllocateLoading = true;
  state.stemAction.requestAllocateError = '';
  state.stemAction.requestAllocateAreas = [];
  state.stemAction.requestAllocateSelectedArea = '';
  state.stemAction.requestAllocateAllocatedAreas = [];
  state.stemAction.requestAllocateResourceCacheInfo = '';
state.stemAction.requestAllocateSubmitting = false;
state.stemAction.requestAllocateResultType = '';
state.stemAction.requestAllocateResultMessage = '';
  renderStemRequestAllocatePopup();

  appendStemActionLog('Request Allocate popup opened', { sf, lane });

  const command = await sendStemCommandToBridge('requestAllocateAvailabilityBootstrap', '', sf);

  if (!command?.id) {
    state.stemAction.requestAllocateLoading = false;
    state.stemAction.requestAllocateError = 'Availability bootstrap command was not created';
    renderStemRequestAllocatePopup();
    appendStemActionLog('ERROR: Request Allocate availability command was not created');
    return;
  }

  appendStemActionLog('Waiting for Request Allocate availability bootstrap', {
    commandId: command.id,
  });

  const bootstrapResult = await waitForStemBootstrapResult(command.id);

  if (!bootstrapResult) {
    state.stemAction.requestAllocateLoading = false;
    state.stemAction.requestAllocateError = 'Availability bootstrap timeout';
    renderStemRequestAllocatePopup();
    appendStemActionLog('ERROR: Request Allocate availability bootstrap timeout', {
      commandId: command.id,
    });
    return;
  }

  appendStemActionLog(
    bootstrapResult.ok ? 'Request Allocate availability bootstrap received' : 'ERROR: Request Allocate availability bootstrap failed',
    bootstrapResult
  );

  if (!bootstrapResult.ok) {
    state.stemAction.requestAllocateLoading = false;
    state.stemAction.requestAllocateError = bootstrapResult.reason || 'Availability bootstrap failed';
    renderStemRequestAllocatePopup();
    return;
  }

  await loadStemRequestAllocatePopupData(command, bootstrapResult);
}

function ensureStemRequestAllocatePopup() {
  let overlay = document.getElementById('ws-stem-request-allocate-overlay');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'ws-stem-request-allocate-overlay';
  overlay.style.cssText = `
    position:fixed;
    inset:0;
    z-index:1000002;
    background:rgba(15,23,42,0.45);
    display:none;
    align-items:center;
    justify-content:center;
    padding:24px;
    box-sizing:border-box;
    font-family:var(--ws-font);
  `;

  overlay.innerHTML = `
    <div style="width:min(900px,94vw); max-height:84vh; background:#fff; border:1px solid #d5dbdb; border-radius:18px; box-shadow:0 18px 48px rgba(0,0,0,0.22); display:flex; flex-direction:column; overflow:hidden;">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; padding:14px 18px; border-bottom:1px solid #d5dbdb; background:#f2f3f3;">
        <div style="font-size:15px; font-weight:800;">Request Allocate</div>
        <button id="ws-stem-request-allocate-close" class="ws-btn" type="button">Close</button>
      </div>
      <div id="ws-stem-request-allocate-body" style="padding:16px 18px; overflow:auto;"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector('#ws-stem-request-allocate-close')?.addEventListener('click', () => {
    state.stemAction.requestAllocatePopupOpen = false;
    renderStemRequestAllocatePopup();
  });

  overlay.addEventListener('click', event => {
    if (event.target === overlay) {
      state.stemAction.requestAllocatePopupOpen = false;
      renderStemRequestAllocatePopup();
    }
  });

  return overlay;
}

    function getStemAllocateResultMessage(response) {
  const errors = getStemErrorsForAllocate(response);

  if (errors.length) {
    return errors
      .map(err => err.message || err.errorCode || 'Unknown STEM error')
      .join(' | ');
  }

  if (response?.ok) {
    return 'Submitted';
  }

  return `Failed with status ${response?.status || '-'}`;
}

async function handleStemRequestAllocateAccept(selectedArea, sf) {
  const actionKey = `allocate:${selectedArea}:${sf}`;

  return runStemActionLocked(actionKey, `Allocating ${selectedArea}...`, async () => {
    state.stemAction.requestAllocateSubmitting = true;
    state.stemAction.requestAllocateResultType = '';
    state.stemAction.requestAllocateResultMessage = 'Submitting...';
    renderStemRequestAllocatePopup();

    try {
      state.stemAction.area = selectedArea;

      const boot = await getStemAllocateDirectBootstrap(selectedArea, sf);

      if (!boot) {
        state.stemAction.requestAllocateResultType = 'error';
        state.stemAction.requestAllocateResultMessage = 'Bootstrap failed. Area may not be free or STEM token/resourceId is missing.';
        return;
      }

      const response = await submitStemAddReservationsDirect(boot.command, boot.bootstrapResult);
      const message = getStemAllocateResultMessage(response);

      if (response?.ok && !getStemErrorsForAllocate(response).length) {
        state.stemAction.requestAllocateResultType = 'success';
        state.stemAction.requestAllocateResultMessage = message;
      } else {
        state.stemAction.requestAllocateResultType = 'error';
        state.stemAction.requestAllocateResultMessage = message;
      }
    } catch (err) {
      state.stemAction.requestAllocateResultType = 'error';
      state.stemAction.requestAllocateResultMessage = err?.message || String(err);
    } finally {
      state.stemAction.requestAllocateSubmitting = false;
      renderStemRequestAllocatePopup();
      renderStemView();
    }
  });
}

async function refreshStemRequestAllocatePopup() {
  state.stemAction.requestAllocateLoading = true;
  state.stemAction.requestAllocateError = '';
  state.stemAction.requestAllocateResultType = '';
  state.stemAction.requestAllocateResultMessage = '';
  state.stemAction.requestAllocateAreas = [];
  state.stemAction.requestAllocateSelectedArea = '';
  renderStemRequestAllocatePopup();

  await openStemRequestAllocatePopup();
}

function renderStemRequestAllocatePopup() {
  const overlay = ensureStemRequestAllocatePopup();
  const body = overlay.querySelector('#ws-stem-request-allocate-body');
  if (!body) return;

  overlay.style.display = state.stemAction.requestAllocatePopupOpen ? 'flex' : 'none';
  if (!state.stemAction.requestAllocatePopupOpen) return;

  const sf = String(state.stemAction.stackingFilter || '').trim();
  const lane = getLaneForStackingFilter(sf);
  const areas = Array.isArray(state.stemAction.requestAllocateAreas)
    ? state.stemAction.requestAllocateAreas
    : [];
  const allocatedAreas = Array.isArray(state.stemAction.requestAllocateAllocatedAreas)
    ? state.stemAction.requestAllocateAllocatedAreas
    : [];

  const allocatedText = allocatedAreas.length ? allocatedAreas.join(', ') : '-';
  const isSubmitting = Boolean(state.stemAction.requestAllocateSubmitting);
  const resultType = String(state.stemAction.requestAllocateResultType || '');
  const resultMessage = String(state.stemAction.requestAllocateResultMessage || '');

  body.innerHTML = `
    <div style="background:#f2f3f3; border:1px solid #d5dbdb; border-radius:14px; padding:12px 14px; margin-bottom:14px;">
      <div style="display:grid; grid-template-columns:repeat(3,minmax(160px,1fr)); gap:12px; font-size:13px;">
        <div><strong>Lane:</strong> ${escapeHtml(lane || '-')}</div>
        <div><strong>SF:</strong> ${escapeHtml(sf || '-')}</div>
        <div><strong>Available:</strong> ${escapeHtml(areas.length)}</div>
      </div>
      <div style="margin-top:10px; font-size:13px;">
        <strong>Allocated Areas (${escapeHtml(allocatedAreas.length)}):</strong>
        ${escapeHtml(allocatedText)}
      </div>
      ${state.stemAction.requestAllocateResourceCacheInfo ? `<div style="margin-top:8px; font-size:12px; color:#5f6b7a;">${escapeHtml(state.stemAction.requestAllocateResourceCacheInfo)}</div>` : ''}
    </div>

    ${
      state.stemAction.requestAllocateLoading
        ? `<div class="ws-empty">Loading available areas...</div>`
        : state.stemAction.requestAllocateError
          ? `<div class="ws-empty" style="color:#b42318; font-weight:800;">${escapeHtml(state.stemAction.requestAllocateError)}</div>`
          : areas.length
            ? `
              <div style="border:1px solid #d5dbdb; border-radius:14px; overflow:hidden; background:#fff;">
                <table class="ws-table" style="table-layout:auto;">
                  <thead>
                    <tr>
                      <th style="width:52px;">Select</th>
                      <th>Area</th>
                      <th>Container Type</th>
                      <th>Chute</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${areas.map((area, index) => {
                      const checked =
                        area.label === state.stemAction.requestAllocateSelectedArea ||
                        (!state.stemAction.requestAllocateSelectedArea && index === 0);

                      return `
                        <tr>
                          <td>
                            <input
                              type="radio"
                              name="ws-stem-request-allocate-area"
                              value="${escapeHtml(area.label)}"
                              ${checked ? 'checked' : ''}
                              ${isSubmitting ? 'disabled' : ''}
                            />
                          </td>
                          <td>${escapeHtml(area.label)}</td>
                          <td>${escapeHtml(area.containerTypes || '-')}</td>
                          <td>${escapeHtml(area.chuteId || '-')}</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>

              <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px;">
                <button id="ws-stem-request-allocate-refresh" class="ws-btn" type="button" ${isSubmitting ? 'disabled' : ''}>Refresh</button>
                <button id="ws-stem-request-allocate-accept" class="ws-btn" type="button" ${isSubmitting ? 'disabled' : ''}>
                  ${isSubmitting ? 'Submitting...' : 'Accept Request Allocate'}
                </button>
              </div>
            `
            : `
              <div class="ws-empty">No free non-reserved/non-pending STACKING_AREA found.</div>
              <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px;">
                <button id="ws-stem-request-allocate-refresh" class="ws-btn" type="button">Refresh</button>
              </div>
            `
    }

    <div style="margin-top:14px; border:1px solid #d5dbdb; border-radius:14px; padding:12px 14px; background:#fff;">
      <div style="font-size:13px; font-weight:800; margin-bottom:6px;">Status</div>
      <div style="font-size:13px; font-weight:800; color:${
        resultType === 'success' ? '#1f7a3d' : resultType === 'error' ? '#b42318' : '#5f6b7a'
      };">
        ${escapeHtml(resultMessage || 'Waiting for action')}
      </div>
    </div>
  `;

  body.querySelectorAll('input[name="ws-stem-request-allocate-area"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.stemAction.requestAllocateSelectedArea = radio.value || '';
    });
  });

  const refreshBtn = body.querySelector('#ws-stem-request-allocate-refresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      await refreshStemRequestAllocatePopup();
    });
  }

  const acceptBtn = body.querySelector('#ws-stem-request-allocate-accept');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', async () => {
      const selectedRadio = body.querySelector('input[name="ws-stem-request-allocate-area"]:checked');
      const selectedArea = String(selectedRadio?.value || state.stemAction.requestAllocateSelectedArea || '').trim();

      if (!selectedArea) {
        state.stemAction.requestAllocateResultType = 'error';
        state.stemAction.requestAllocateResultMessage = 'Please select an area first.';
        renderStemRequestAllocatePopup();
        return;
      }

      await handleStemRequestAllocateAccept(selectedArea, sf);
    });
  }
}

    async function sendStemCommandToBridge(actionType, area, sf) {
  const requireFreshStem = shouldRequireFreshStemForAction(actionType);
let liveStem = await getLiveStemHeartbeat({ requireFresh: requireFreshStem });

  const command = {
    id: `stem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: actionType,
    area,
    sf,
    nodeId: String(state?.route?.facility || '').trim(),
    createdAt: Date.now(),
    sourceTabId: state.runtimeTabId,
    targetStemTabId: liveStem?.tabId || '',
    openedByWatchSorter: false,
  };

  const stemUrl = getStemEquipmentUrl();

  if (!stemUrl) {
    appendStemActionLog('ERROR: nodeId not found, cannot open STEM');
    return null;
  }

  if (!liveStem?.tabId) {
    command.openedByWatchSorter = true;

    if (typeof GM_openInTab === 'function') {
      GM_openInTab(stemUrl, {
        active: false,
        insert: true,
        setParent: true,
      });

      appendStemActionLog('STEM tab opened in background', { url: stemUrl });
    } else {
      window.open(stemUrl, 'watchSorterStemBridge');
      appendStemActionLog('STEM tab opened/focused fallback', { url: stemUrl });
    }

    liveStem = await waitForLiveStemHeartbeatAfterOpen(
  requireFreshStem ? 45000 : 30000,
  500,
  { requireFresh: requireFreshStem }
);

    if (!liveStem?.tabId) {
      appendStemActionLog('ERROR: STEM tab opened but heartbeat was not detected');
      return null;
    }

    command.targetStemTabId = liveStem.tabId;
  }

  appendStemActionLog('Sending STEM command', command);
  await GM_setValue(STEM_COMMAND_KEY, command);

  appendStemActionLog('STEM tab alive, command sent', liveStem);

  return command;
}

function installStemLogListener() {
  if (window.__wsStemLogListenerInstalled) return;
  window.__wsStemLogListenerInstalled = true;

  GM_addValueChangeListener(STEM_LOG_KEY, (_key, _oldValue, newValue) => {
    if (!newValue) return;

    const targetTabId = String(newValue?.targetTabId || '');
    if (targetTabId && targetTabId !== state.runtimeTabId) return;

    const level = String(newValue?.level || 'INFO');
    const message = String(newValue?.message || '');
    const payload = newValue?.payload || null;

    appendStemActionLog(`[STEM ${level}] ${message}`, payload);
  });
}

async function handleStemAction(actionType) {
  const area = String(state.stemAction.area || '').trim();
  const sf = String(state.stemAction.stackingFilter || '').trim();

if (actionType !== 'requestAllocate' && !area) {
    appendStemActionLog('ERROR: Area is required');
    return;
  }

  if ((actionType === 'allocate' || actionType === 'requestAllocate') && !sf) {
    appendStemActionLog('ERROR: SF is required for allocate', { area, sf });
    return;
  }

const actionKey =
  actionType === 'deallocateRequest'
    ? `deallocate:${area}`
    : actionType === 'requestAllocate'
      ? `requestAllocate:${sf}`
      : `allocate:${area}:${sf}`;

const busyText =
  actionType === 'deallocateRequest'
    ? `Deallocating ${area}...`
    : actionType === 'requestAllocate'
      ? `Loading allocate options for ${sf}...`
      : `Allocating ${area}...`;

return runStemActionLocked(actionKey, busyText, async () => {
  appendStemActionLog(`Clicked ${actionType}`, { area, sf });

try {

  if (actionType === 'allocate') {
    await handleStemAllocateDirect(area, sf);
    return;
  }


    if (actionType === 'requestAllocate') {
  await openStemRequestAllocatePopup();
  return;
}

  if (actionType === 'deallocateRequest') {
    const command = await sendStemCommandToBridge('deallocateRequestBootstrap', area, sf);

    if (!command?.id) {
      appendStemActionLog('ERROR: Bootstrap command was not created');
      return;
    }

    appendStemActionLog('Waiting for STEM bootstrap result', {
      commandId: command.id,
      openedByWatchSorter: command.openedByWatchSorter,
    });

    const bootstrapResult = await waitForStemBootstrapResult(command.id);

    if (!bootstrapResult) {
      appendStemActionLog('ERROR: STEM bootstrap result timeout', {
        commandId: command.id,
      });
      return;
    }

    appendStemActionLog(
      bootstrapResult.ok ? 'STEM bootstrap result received' : 'ERROR: STEM bootstrap failed',
      bootstrapResult
    );

    if (!bootstrapResult.ok) return;

const firstResponse = await submitStemRemoveReservationsDirect(command, bootstrapResult);
const firstErrors = getStemErrorsForAllocate(firstResponse);

if (firstResponse?.ok && !firstErrors.length) {
  state.stemAction.statusType = 'success';
  state.stemAction.statusMessage = 'Deallocate submitted';
  renderStemView();

  return {
    ok: true,
    message: 'Deallocate submitted',
  };
}

if (firstResponse?.status === 403) {
  appendStemActionLog('Direct RemoveReservations got 403, retrying with fresh STEM bootstrap', {
    area,
    firstCommandId: command.id,
  });

  const retryCommand = await sendStemCommandToBridge('deallocateRequestBootstrap', area, sf);

  if (!retryCommand?.id) {
    state.stemAction.statusType = 'error';
    state.stemAction.statusMessage = 'Retry bootstrap command was not created';
    renderStemView();

    return {
      ok: false,
      message: state.stemAction.statusMessage,
    };
  }

  appendStemActionLog('Waiting for retry STEM bootstrap result', {
    commandId: retryCommand.id,
    openedByWatchSorter: retryCommand.openedByWatchSorter,
  });

  const retryBootstrapResult = await waitForStemBootstrapResult(retryCommand.id);

  if (!retryBootstrapResult) {
    state.stemAction.statusType = 'error';
    state.stemAction.statusMessage = 'Retry STEM bootstrap result timeout';
    renderStemView();

    return {
      ok: false,
      message: state.stemAction.statusMessage,
    };
  }

  appendStemActionLog(
    retryBootstrapResult.ok ? 'Retry STEM bootstrap result received' : 'ERROR: Retry STEM bootstrap failed',
    retryBootstrapResult
  );

  if (!retryBootstrapResult.ok) {
    state.stemAction.statusType = 'error';
    state.stemAction.statusMessage = retryBootstrapResult.reason || 'Retry STEM bootstrap failed';
    renderStemView();

    return {
      ok: false,
      message: state.stemAction.statusMessage,
    };
  }

  const retryResponse = await submitStemRemoveReservationsDirect(retryCommand, retryBootstrapResult);
  const retryErrors = getStemErrorsForAllocate(retryResponse);

  if (retryResponse?.ok && !retryErrors.length) {
    state.stemAction.statusType = 'success';
    state.stemAction.statusMessage = 'Deallocate submitted';
    renderStemView();

    return {
      ok: true,
      message: 'Deallocate submitted',
    };
  }

  state.stemAction.statusType = 'error';
  state.stemAction.statusMessage = retryErrors.length
    ? retryErrors.map(err => err.message || err.errorCode || 'Unknown STEM error').join(' | ')
    : `Deallocate failed with status ${retryResponse?.status || '-'}`;

  renderStemView();

  return {
    ok: false,
    message: state.stemAction.statusMessage,
  };
}

state.stemAction.statusType = 'error';
state.stemAction.statusMessage = firstErrors.length
  ? firstErrors.map(err => err.message || err.errorCode || 'Unknown STEM error').join(' | ')
  : `Deallocate failed with status ${firstResponse?.status || '-'}`;

renderStemView();


  }

  await sendStemCommandToBridge(actionType, area, sf);
} catch (err) {
  appendStemActionLog('ERROR: failed to send STEM command', {
    message: err?.message || String(err),
  });
}
});
}

function renderStemView() {
  const body = document.getElementById(IDS.stemBody);
  if (!body) return;

  const rowsCount = Array.isArray(state.stemHierarchy.rows) ? state.stemHierarchy.rows.length : 0;
  const laneCount = state.stemHierarchy.lanesBySf?.size || 0;
  const syncedAt = state.stemHierarchy.lastSnapshotAt
    ? new Date(state.stemHierarchy.lastSnapshotAt).toLocaleString()
    : '-';

  const sampleRows = (state.stemHierarchy.rows || []).slice(0, 5);

  const vistaLaneMap = state.noResources?.vistaLaneByFilter || {};
  const vistaLaneCount = Object.keys(vistaLaneMap).length;
  const vistaLaneSample = Object.entries(vistaLaneMap).slice(0, 10);
    const hrzLaneMap = state.noResources?.hrzLaneToCpt || {};
const hrzLaneCount = Object.keys(hrzLaneMap).length;
const hrzLaneSample = Object.entries(hrzLaneMap).slice(0, 10);

  const noResRows = Array.isArray(state.noResources?.rows) ? state.noResources.rows : [];
  const noResWithVistaLane = noResRows.filter(row => {
    const value = row?.laneVista || getVistaLaneForStackingFilter(row?.stackingFilter);
    return value && value !== '-';
  }).length;

  const noResVistaSample = noResRows.slice(0, 10).map(row => ({
    stackingFilter: row?.stackingFilter || '',
    lane: row?.lane || '-',
    laneVista: row?.laneVista || getVistaLaneForStackingFilter(row?.stackingFilter) || '-',
  }));
const stemBusy = isStemBusy();
const stemBusyText = String(state.stemAction.busyText || '').trim();
const stemActionStatusText = stemBusy
  ? stemBusyText || 'STEM action in progress...'
  : (state.stemAction.statusMessage || 'Waiting for action');
  body.innerHTML = `
    <div class="ws-empty" style="text-align:left;">
          <div style="border:1px solid #d5dbdb; border-radius:14px; background:#fff; padding:14px; margin-bottom:18px;">
        <div style="font-size:15px; font-weight:800; margin-bottom:12px;">STEM Action Tester</div>

        <div style="display:flex; flex-direction:column; gap:12px; max-width:720px;">
          <label style="display:flex; flex-direction:column; gap:6px; font-size:12px; font-weight:800;">
            Area
            <input
              id="ws-stem-action-area"
              class="ws-search"
              type="text"
              value="${escapeHtml(state.stemAction.area || '')}"
              placeholder="Box-101-A"
              style="height:34px; padding-left:12px;"
            />
          </label>

          <label style="display:flex; flex-direction:column; gap:6px; font-size:12px; font-weight:800;">
            SF
            <input
              id="ws-stem-action-sf"
              class="ws-search"
              type="text"
              value="${escapeHtml(state.stemAction.stackingFilter || '')}"
              placeholder="LH-..."
              style="height:34px; padding-left:12px;"
            />
          </label>

<div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center;">
<button id="ws-stem-request-allocate-btn" class="ws-btn" type="button" ${stemBusy ? 'disabled' : ''}>
  ${isCurrentStemAction(`requestAllocate:${state.stemAction.stackingFilter}`) ? 'In progress...' : 'Allocate'}
</button>

<button id="ws-stem-deallocate-request-btn" class="ws-btn" type="button" ${stemBusy ? 'disabled' : ''}>
  ${isCurrentStemAction(`deallocate:${state.stemAction.area}`) ? 'In progress...' : 'Deallocate'}
</button>

  <button id="ws-stem-allocate-btn" class="ws-btn" type="button" style="display:none;">Allocate Manual</button>
  <button id="ws-stem-deallocate-btn" class="ws-btn" type="button" style="display:none;">Deallocate Manual</button>
</div>
        </div>

<div id="ws-stem-action-log-wrap" style="display:none; margin-top:16px;">
  <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
    <div style="font-size:13px; font-weight:800;">Log:</div>
    <button id="ws-stem-clear-log-btn" class="ws-btn" type="button">Clear Log</button>
  </div>

<pre
  id="ws-stem-action-log"
  style="height:180px; overflow:auto; margin-top:8px; padding:10px; background:#111827; color:#e5e7eb; border-radius:10px; font-size:12px; line-height:1.45; white-space:pre-wrap;"
></pre>
</div>

<div style="margin-top:14px; border:1px solid #d5dbdb; border-radius:14px; padding:12px 14px; background:#fff;">
  <div style="font-size:13px; font-weight:800; margin-bottom:6px;">Status</div>
  <div style="font-size:13px; font-weight:800; color:${
    state.stemAction.statusType === 'success' ? '#1f7a3d' :
    state.stemAction.statusType === 'error' ? '#b42318' :
    '#5f6b7a'
  };">
    ${escapeHtml(stemActionStatusText)}
  </div>
</div>

      </div>
    </div>
  `;

  const areaInput = body.querySelector('#ws-stem-action-area');
  const sfInput = body.querySelector('#ws-stem-action-sf');
const deallocateBtn = body.querySelector('#ws-stem-deallocate-btn');
const deallocateRequestBtn = body.querySelector('#ws-stem-deallocate-request-btn');
const allocateBtn = body.querySelector('#ws-stem-allocate-btn');
const requestAllocateBtn = body.querySelector('#ws-stem-request-allocate-btn');
  const clearLogBtn = body.querySelector('#ws-stem-clear-log-btn');

  if (areaInput) {
    areaInput.addEventListener('input', () => {
      state.stemAction.area = areaInput.value || '';
    });
  }

  if (sfInput) {
    sfInput.addEventListener('input', () => {
      state.stemAction.stackingFilter = sfInput.value || '';
    });
  }

if (deallocateRequestBtn) {
  deallocateRequestBtn.addEventListener('click', () => {
    handleStemAction('deallocateRequest');
  });
}

  if (allocateBtn) {
    allocateBtn.addEventListener('click', () => {
      handleStemAction('allocate');
    });
  }

if (requestAllocateBtn) {
  requestAllocateBtn.addEventListener('click', () => {
    handleStemAction('requestAllocate');
  });
}

  if (clearLogBtn) {
    clearLogBtn.addEventListener('click', () => {
      state.stemAction.logs = [];
      renderStemActionLog();
    });
  }

  renderStemActionLog();
  installStemLogListener();
}


function buildReadySeriesGroups() {
  const bySeries = new Map();
const sourceRows = (state.rows || []).filter(row => {
  const baseMatch =
    rowMatchesQuery(row, state.searchQuery || '') &&
    rowMatchesActiveReadiness(row) &&
    rowMatchesNextCptFilter(row);

  if (!baseMatch) return false;

  if (
    state.activeMirrorNeededFilters &&
    state.activeMirrorNeededFilters.size > 0 &&
    state.activeMirrorNeededFilters.has('mirrorNeeded')
  ) {
    return Boolean(getAdditionalAreaNeedForRow(row));
  }

  return true;
});

  for (const row of sourceRows) {
    if (isFreeWatchSorterRow(row)) continue;
    if (getRowReadiness(row) !== 'ready') continue;

    for (const area of Array.isArray(row?.areas) ? row.areas : []) {
      const areaName = String(area || '').trim();
      if (!areaName) continue;
      if (!areaMatchesActiveSeries(areaName)) continue;

      const series = inferAreaSeries(areaName);
      if (!series) continue;

      // FIX: اگه فیلتر series فعاله، فقط areaهایی که توی series فعال هستن اضافه بشن

      if (!bySeries.has(series)) {
        bySeries.set(series, new Set());
      }

      bySeries.get(series).add(areaName);
    }
  }

  return Array.from(bySeries.entries())
    .map(([series, areaSet]) => {
      const areas = Array.from(areaSet).sort((a, b) =>
        inferAreaSortKey(a).localeCompare(inferAreaSortKey(b))
      );

      return {
        series,
        count: areas.length,
        areas,
      };
    })
    .sort((a, b) => a.series.localeCompare(b.series));
}

    function getReadySeriesAllAreas(groups) {
  const set = new Set();

  for (const group of Array.isArray(groups) ? groups : []) {
    for (const area of Array.isArray(group?.areas) ? group.areas : []) {
      const safeArea = String(area || '').trim();
      if (safeArea) set.add(safeArea);
    }
  }

  return Array.from(set).sort((a, b) =>
    inferAreaSortKey(a).localeCompare(inferAreaSortKey(b))
  );
}

function getReadyAreaTanteiStatus(area) {
  const safeArea = String(area || '').trim();
  if (!safeArea) return 'loading';

  if (!Object.prototype.hasOwnProperty.call(state.readyAreaTantei.byArea || {}, safeArea)) {
    return 'loading';
  }

  return state.readyAreaTantei.byArea[safeArea] ? 'bad' : 'ok';
}

function renderReadyAreaPill(area) {
  const safeArea = String(area || '').trim();
  const status = getReadyAreaTanteiStatus(safeArea);
  const isRefreshing = state.readyAreaTantei.refreshingAreas?.has(safeArea);
    const isDeallocating = state.readyAreaTantei.deallocatingAreas?.has(safeArea);
  const isOk = status === 'ok';
const actionKey = `deallocate:${safeArea}`;
const stemBusy = isStemBusy();
const currentStemAction = isCurrentStemAction(actionKey);
const deallocateStatus =
  state.readyAreaTantei.deallocateStatusByArea?.[safeArea] || null;
  const iconHtml =
    status === 'bad'
      ? `<span class="ws-ready-area-status ws-ready-area-status-bad" title="Tantei item found">×</span>`
      : status === 'ok'
        ? `<span class="ws-ready-area-status ws-ready-area-status-ok" title="Nothing found in Tantei">✓</span>`
        : `<span class="ws-ready-area-status ws-ready-area-status-loading" title="Checking Tantei...">…</span>`;

  const refreshHtml = `
    <button
      type="button"
      class="ws-ready-area-refresh-btn"
      data-ready-area-refresh="${escapeHtml(safeArea)}"
      title="Refresh this area from Tantei"
      ${isRefreshing ? 'disabled' : ''}
    >
      <span class="${isRefreshing ? 'ws-ready-area-refresh-spinning' : ''}">↻</span>
    </button>
  `;

const deallocateHtml = isOk
  ? deallocateStatus?.type === 'success'
    ? `
      <span style="color:#1f7a3d; font-weight:900;">
        Deallocate submitted
      </span>
    `
    : `
      <button
        type="button"
        class="ws-ready-area-deallocate-btn"
        data-ready-area-deallocate="${escapeHtml(safeArea)}"
        title="Deallocate"
        ${stemBusy || isDeallocating ? 'disabled' : ''}
        style="${stemBusy && !currentStemAction ? 'opacity:0.55; cursor:not-allowed;' : ''}"
      >
        ${currentStemAction || isDeallocating ? 'In progress...' : 'Deallocate'}
      </button>
      ${
        deallocateStatus?.type === 'error'
          ? `<span style="color:#b42318; font-weight:900; margin-left:6px;">Failed: ${escapeHtml(deallocateStatus.message || 'Unknown error')}</span>`
          : ''
      }
    `
  : '';

  return `
    <span class="ws-ready-series-pill">
      <a
        class="ws-area-link"
        href="${escapeHtml(buildTanteiUrlForArea(safeArea))}"
        target="_blank"
        rel="noopener noreferrer"
      >
        ${escapeHtml(safeArea)}
      </a>
      ${iconHtml}
      ${refreshHtml}
      ${deallocateHtml}
    </span>
  `;
}

async function refreshReadyAreaTanteiStatus(groups, options = {}) {
  const force = Boolean(options.force);
  const areas = getReadySeriesAllAreas(groups);
  const cacheKey = areas.join('|');

  if (!areas.length) return;
  if (state.readyAreaTantei.loading) return;

if (!force) {
  const missingAreas = areas.filter(area =>
    !Object.prototype.hasOwnProperty.call(state.readyAreaTantei.byArea || {}, area)
  );

  if (
    !missingAreas.length &&
    state.readyAreaTantei.cacheKey === cacheKey &&
    state.readyAreaTantei.loadedAt &&
    Date.now() - state.readyAreaTantei.loadedAt < VAST_TANTEI_CACHE_TTL_MS
  ) {
    return;
  }
}

  state.readyAreaTantei.loading = true;
  state.readyAreaTantei.cacheKey = cacheKey;

  try {
    const nextMap = { ...(state.readyAreaTantei.byArea || {}) };
    const areasToFetch = force
  ? areas
  : areas.filter(area =>
      !Object.prototype.hasOwnProperty.call(state.readyAreaTantei.byArea || {}, area)
    );

const chunks = chunkArray(areasToFetch, VAST_TANTEI_BATCH_SIZE);

    for (const chunk of chunks) {
      const result = await fetchTanteiTroubleshootBatch(chunk);

      for (const area of chunk) {
        nextMap[area] = result[area] || null;
      }
    }

    state.readyAreaTantei.byArea = nextMap;
    state.readyAreaTantei.loadedAt = Date.now();

    if (state.overlayOpen && state.activeRecirculationTab === 'watchSorter') {
      renderReadySeriesBlock();
    }
  } catch (err) {
    error('Ready area Tantei check failed', err);
  } finally {
    state.readyAreaTantei.loading = false;
  }
}

    async function refreshSingleReadyAreaTanteiStatus(area) {
  const safeArea = String(area || '').trim();
  if (!safeArea) return;

  if (!state.readyAreaTantei.refreshingAreas) {
    state.readyAreaTantei.refreshingAreas = new Set();
  }

  if (state.readyAreaTantei.refreshingAreas.has(safeArea)) return;

  state.readyAreaTantei.refreshingAreas.add(safeArea);
  renderReadySeriesBlock();

  try {
    const result = await fetchTanteiTroubleshootBatch([safeArea]);

    state.readyAreaTantei.byArea = {
      ...(state.readyAreaTantei.byArea || {}),
      [safeArea]: result[safeArea] || null,
    };

    state.readyAreaTantei.loadedAt = Date.now();
  } catch (err) {
    error('Single ready area Tantei refresh failed', {
      area: safeArea,
      message: err?.message || String(err),
    });
  } finally {
    state.readyAreaTantei.refreshingAreas.delete(safeArea);

    if (state.overlayOpen && state.activeRecirculationTab === 'watchSorter') {
      renderReadySeriesBlock();
    }
  }
}

    async function handleReadyAreaDeallocate(area) {
  const safeArea = String(area || '').trim();
  if (!safeArea) return;

  if (!state.readyAreaTantei.deallocatingAreas) {
    state.readyAreaTantei.deallocatingAreas = new Set();
  }

  if (state.readyAreaTantei.deallocatingAreas.has(safeArea)) return;

  state.readyAreaTantei.deallocatingAreas.add(safeArea);
  renderReadySeriesBlock();

  try {
    installStemLogListener();

    state.stemAction.area = safeArea;
    state.stemAction.stackingFilter = '';

    const result = await handleStemAction('deallocateRequest');

state.readyAreaTantei.deallocateStatusByArea = {
  ...(state.readyAreaTantei.deallocateStatusByArea || {}),
  [safeArea]: result?.ok
    ? { type: 'success', message: 'Deallocate submitted' }
    : { type: 'error', message: result?.message || 'Failed' },
};
  } finally {
    state.readyAreaTantei.deallocatingAreas.delete(safeArea);

    if (state.overlayOpen && state.activeRecirculationTab === 'watchSorter') {
      renderReadySeriesBlock();
    }
  }
}

function bindReadyAreaPillEvents(root) {
  if (!root) return;

  root.querySelectorAll('[data-ready-area-refresh]').forEach(btn => {
    btn.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();

      const area = btn.getAttribute('data-ready-area-refresh') || '';
      refreshSingleReadyAreaTanteiStatus(area);
    });
  });

  root.querySelectorAll('[data-ready-area-deallocate]').forEach(btn => {
    btn.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();

const area = btn.getAttribute('data-ready-area-deallocate') || '';
handleReadyAreaDeallocate(area);
    });
  });
}

function renderReadySeriesBlock() {
  const wrap = document.getElementById(IDS.readySeriesWrap);
  const body = document.getElementById(IDS.readySeriesBody);
  if (!wrap || !body) return;

  const groups = buildReadySeriesGroups();

  if (!groups.length) {
    body.innerHTML = `<div class="ws-ready-series-empty">No deallocate-ready areas</div>`;
    return;
  }

  body.innerHTML = groups.map(group => {
    return `
      <div class="ws-ready-series-group">
        <div class="ws-ready-series-head">
          <div class="ws-ready-series-name">${escapeHtml(group.series)}</div>
          <div class="ws-ready-series-count">= ${escapeHtml(group.count)}</div>
        </div>
        <div class="ws-ready-series-pills">
          ${group.areas.map(area => renderReadyAreaPill(area)).join('')}
        </div>
      </div>
    `;
  }).join('');

  bindReadyAreaPillEvents(body);
  refreshReadyAreaTanteiStatus(groups);
  ensureReadyAreaTanteiBackgroundRefresh();
}

    function ensureReadyAreaTanteiBackgroundRefresh() {
  if (state.readyAreaTantei.refreshTimer) return;

  state.readyAreaTantei.refreshTimer = window.setInterval(() => {
    if (!state.overlayOpen || state.activeRecirculationTab !== 'watchSorter') return;

    const groups = buildReadySeriesGroups();
    refreshReadyAreaTanteiStatus(groups, { force: true });
  }, 5 * 60 * 1000);

  log('Ready area Tantei background refresh started', {
    everyMs: 5 * 60 * 1000,
  });
}

  function updateMapInfo() {
    const el = document.getElementById(IDS.mapInfo);
    if (!el) return;

    if (state.structureMap?.updatedAt) {
      const d = new Date(state.structureMap.updatedAt);
      el.textContent = `Map: ${d.toLocaleString()}`;
    } else {
      el.textContent = 'Map: not loaded';
    }
  }

    function getAreaMetricSignature(item) {
  const m = item?.metrics || {};
  return [
    Number(m.onSorterNow || 0),
    Number(m.m15 || 0),
    Number(m.m30 || 0),
    Number(m.m60 || 0),
    Number(m.m120 || 0),
    Number(m.m240 || 0),
  ].join('|');
}

function rowHasDifferentAreaMetrics(row) {
  const list = Array.isArray(row?.areaMetrics) ? row.areaMetrics : [];
  if (list.length <= 1) return false;

  const signatures = new Set(list.map(getAreaMetricSignature));
  return signatures.size > 1;
}

function renderMetricCell(row, metricKey) {
  return escapeHtml(row?.metrics?.[metricKey] ?? 0);
}

function renderRows(rows) {
  const tbody = document.getElementById(IDS.tableBody);
  if (!tbody) {
    warn('renderRows: table body not found');
    return;
  }

  if (!rows.length) {
    const emptyText = state.lastLiveUpdateAt
      ? 'No matching rows'
      : 'Waiting for live Foresight data...';

    tbody.innerHTML = `
      <tr>
        <td colspan="11" class="ws-empty">${escapeHtml(emptyText)}</td>
      </tr>
    `;
    log('Rendered empty state');
    return;
  }

  tbody.innerHTML = rows.map(row => {
const areasHtml = row.areas
  .map(area => `<div>${renderAreaLink(area, 'ws-area-link')}</div>`)
  .join('');

    const readiness = getRowReadiness(row);
    const isFree = isFreeWatchSorterRow(row);

    let rowClass = '';

const additionalNeed = getAdditionalAreaNeedForRow(row);

if (isFree) {
  rowClass = 'ws-row-blue';
} else if (additionalNeed) {
  rowClass = 'ws-row-red';
} else if (readiness === 'ready') {
  rowClass = 'ws-row-green';
} else if (readiness === 'monitor') {
  rowClass = 'ws-row-yellow';
}

    return `
      <tr class="${rowClass}">
        <td>${escapeHtml(row.stackingFilter)}</td>
        <td>${escapeHtml(row.areasCount)}</td>
        <td><div class="ws-areas-list">${areasHtml}</div></td>
<td>${renderMetricCell(row, 'onSorterNow')}</td>
<td>${renderMetricCell(row, 'm15')}</td>
<td>${renderMetricCell(row, 'm30')}</td>
<td>${renderMetricCell(row, 'm60')}</td>
<td>${renderMetricCell(row, 'm120')}</td>
<td>${renderMetricCell(row, 'm240')}</td>
        <td>${escapeHtml(formatCpt(row.cptMs))}</td>
      </tr>
    `;
  }).join('');

  log(`Rendered ${rows.length} rows`);
}
  function applySearch(query) {
    state.searchQuery = query;

    const searchedRows = filterRows(state.rows, query);
    const sortedRows = sortRows(searchedRows);

state.filteredRows = sortedRows;
renderRows(state.filteredRows);
renderWrongAllocationBlock();
renderAdditionalAreaNeededBlock();
renderReadySeriesBlock();

state.readinessCounts = computeReadinessCounts(state.filteredRows);
refreshReadinessBar();
refreshMirrorNeededBar();
renderOperationalSummary();
      if (state.vast.overlayOpen) {
  updateVastCardAlertCount(false);
}
    const statusPrefix = state.lastLiveUpdateAt ? 'filtered' : 'waiting';
    setStatus(`${statusPrefix} ${state.filteredRows.length}/${state.rows.length}`);

    log('Search/sort applied:', {
      query,
      total: state.rows.length,
      filtered: state.filteredRows.length,
      sortKey: state.sortKey,
      sortDir: state.sortDir,
      activeSeries: Array.from(state.activeSeries),
    });
  }

  function toggleSort(sortKey) {
    if (state.sortKey === sortKey) {
      state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      state.sortKey = sortKey;
      state.sortDir = 'desc';
    }

    log('Sort changed:', {
      sortKey: state.sortKey,
      sortDir: state.sortDir,
      creator: SCRIPT_AUTHOR,
    });

    refreshTableHeaders();
    applySearch(state.searchQuery || '');
  }

  function setLogsVisible(visible) {
    state.logsVisible = visible;
    const panel = document.getElementById(IDS.logsPanel);
    if (!panel) return;
    panel.classList.toggle('ws-visible', visible);
    log(`Logs panel ${visible ? 'shown' : 'hidden'} by ${SCRIPT_AUTHOR}`);
  }

  function toggleLogsPanel() {
    setLogsVisible(!state.logsVisible);
  }

  function bindGlobalShortcuts() {
    if (window.__watchSorterShortcutsBound) return;

    document.addEventListener('keydown', (event) => {
      const isC = String(event.key || '').toLowerCase() === 'c';
      if (event.ctrlKey && event.altKey && event.shiftKey && isC) {
        event.preventDefault();
        toggleLogsPanel();
        const stemLogWrap = document.getElementById('ws-stem-action-log-wrap');
        if (stemLogWrap && state.activeRecirculationTab === 'stem') {
          const isHidden = stemLogWrap.style.display === 'none';
          stemLogWrap.style.display = isHidden ? 'block' : 'none';
        }
      }
    });

    window.__watchSorterShortcutsBound = true;
    log(`Global shortcuts bound by ${SCRIPT_AUTHOR}`);
  }

  function bindOverlayEvents(overlay) {
const reportTabBtn = overlay.querySelector(`#${IDS.reportTabBtn}`);
const watchTabBtn = overlay.querySelector(`#${IDS.watchTabBtn}`);
const noResTabBtn = overlay.querySelector(`#${IDS.noResTabBtn}`);
const sorterTabBtn = overlay.querySelector(`#${IDS.sorterTabBtn}`);
const stemTabBtn = overlay.querySelector(`#${IDS.stemTabBtn}`);
const sharedSearchInput = overlay.querySelector(`#${IDS.sharedSearchInput}`);
    const closeBtn = overlay.querySelector(`#${IDS.closeBtn}`);
    const remapBtn = overlay.querySelector(`#${IDS.remapBtn}`);
    const copyLogsBtn = overlay.querySelector(`#${IDS.copyLogsBtn}`);
    const clearLogsBtn = overlay.querySelector(`#${IDS.clearLogsBtn}`);

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        closeOverlay();
      });
      log('Back button bound');
    }

    if (remapBtn) {
      remapBtn.addEventListener('click', () => {
        log('Remap button clicked');
        setStatus('remapping...');
        clearStructureMap();
        state.structureMap = buildInitialStructureMap();
        saveStructureMap(state.structureMap);
        updateMapInfo();
        setStatus('remap completed');
      });
      log('Remap button bound');
    }

      if (reportTabBtn) {
  reportTabBtn.addEventListener('click', () => {
    switchRecirculationTab('report');
  });
}

      if (watchTabBtn) {
  watchTabBtn.addEventListener('click', () => {
    switchRecirculationTab('watchSorter');
  });
}

if (noResTabBtn) {
  noResTabBtn.addEventListener('click', () => {
    switchRecirculationTab('noResources');
  });
}
if (sorterTabBtn) {
  sorterTabBtn.addEventListener('click', () => {
    switchRecirculationTab('sorter');
  });
}
if (stemTabBtn) {
  stemTabBtn.addEventListener('click', () => {
    switchRecirculationTab('stem');
  });
}
if (sharedSearchInput) {
  sharedSearchInput.addEventListener('input', (event) => {
    const value = event.target.value || '';
    applySharedTabSearch(value);
  });
}

    if (copyLogsBtn) {
      copyLogsBtn.addEventListener('click', async () => {
        try {
          const text = runtimeLogs.join('\n');
          await navigator.clipboard.writeText(text);
          log('Logs copied to clipboard');
          setStatus('logs copied');
        } catch (err) {
          error('Failed to copy logs', err);
          setStatus('copy logs failed');
        }
      });
      log('Copy Logs button bound');
    }

    if (clearLogsBtn) {
      clearLogsBtn.addEventListener('click', () => {
        runtimeLogs.length = 0;
        const logsContent = document.getElementById(IDS.logsContent);
        if (logsContent) logsContent.textContent = '';
        log('Logs cleared');
        setStatus('logs cleared');
      });
      log('Clear Logs button bound');
    }

if (!window.__wsCopyHandlerInstalled) {
  window.__wsCopyHandlerInstalled = true;

  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.ws-pill-copy-link');
    if (!btn) return;

    const text = btn.getAttribute('data-copy');
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = 'Copied';
      setTimeout(() => {
        btn.textContent = 'Copy';
      }, 800);
    } catch (err) {
      console.error('Copy failed', err);
    }
  });
}

    bindSortableHeaders(overlay);
      bindNoResourceSortableHeaders(overlay);
  }

  function ensureFooter() {
    let footer = document.getElementById(IDS.footer);
    if (footer) return footer;

    footer = document.createElement('div');
    footer.id = IDS.footer;
    footer.innerHTML = `
      <div class="ws-footer-left">Creators: @amimirsh</div>
      <div class="ws-footer-center">Version: v${SCRIPT_VERSION}</div>
      <div class="ws-footer-right">AMAZON</div>
    `;

    document.body.appendChild(footer);
    log(`Footer created by ${SCRIPT_AUTHOR}`);
    return footer;
  }

  function ensureOverlay() {
    let overlay = document.getElementById(IDS.overlay);
    if (overlay) {
      log('Overlay already exists');
      return overlay;
    }

    overlay = document.createElement('div');
    overlay.id = IDS.overlay;
overlay.innerHTML = `
  <div class="ws-header">
    <div class="ws-header-left">
      <button id="${IDS.closeBtn}" class="ws-btn" type="button">← Back</button>
      <div class="ws-title-wrap">
        <div class="ws-title">Recirculation</div>
        <div class="ws-subtitle">${escapeHtml(state.route.nodeKey || 'Unknown node')}</div>
      </div>
    </div>

    <div class="ws-header-right">
      <button id="${IDS.remapBtn}" class="ws-btn" type="button">Remap</button>
    </div>
  </div>



<div class="ws-tabs" id="${IDS.tabsBar}">
<button id="${IDS.watchTabBtn}" class="ws-tab-btn" type="button">Watch Sorter</button>
<button id="${IDS.noResTabBtn}" class="ws-tab-btn" type="button">No Resources</button>
<button id="${IDS.sorterTabBtn}" class="ws-tab-btn" type="button">Sorter</button>
<button id="${IDS.stemTabBtn}" class="ws-tab-btn" type="button">Stem</button>
<button id="${IDS.reportTabBtn}" class="ws-tab-btn" type="button">Report</button>
</div>
    <div class="ws-toolbar">
    <div class="ws-search-wrap">
      <div class="ws-search-box">
        <span class="ws-search-icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" focusable="false">
            <circle cx="7" cy="7" r="5"></circle>
            <path d="M15 15l-4.5-4.5"></path>
          </svg>
        </span>
        <input
          id="${IDS.sharedSearchInput}"
          class="ws-search"
          type="search"
          autocomplete="off"
          spellcheck="false"
          placeholder="Search"
        />
      </div>
    </div>

<div class="ws-meta">
  <span id="${IDS.sharedSearchStatusText}" class="ws-badge">Search: Watch Sorter</span>
  <span class="ws-badge">Node: ${escapeHtml(state.route.nodeKey || '-')}</span>
  <span id="${IDS.mapInfo}" class="ws-badge">Map: not loaded</span>
  <span id="${IDS.statusText}" class="ws-badge">Status: waiting</span>
</div>
  </div>

<div id="${IDS.reportTabPanel}" class="ws-tab-panel">
  <div class="ws-toolbar">
    <div class="ws-meta">
      <span class="ws-badge">Operational Report</span>
    </div>
  </div>

  <div class="ws-content">
    <div class="ws-ops-summary" id="${IDS.opsSummary}">
      <div class="ws-ops-card">
        <div class="ws-ops-label">Free Areas</div>
        <div class="ws-ops-value" id="${IDS.opsFreeAreasValue}">0</div>
        <div class="ws-ops-meta" id="${IDS.opsFreeAreasMeta}">
          <div class="ws-ops-meta-item"><span>Box</span><strong>0</strong></div>
          <div class="ws-ops-meta-item"><span>Flat</span><strong>0</strong></div>
          <div class="ws-ops-meta-item"><span>Bag</span><strong>0</strong></div>
        </div>
      </div>

      <div class="ws-ops-card">
        <div class="ws-ops-label">Mirrored Areas</div>
        <div class="ws-ops-value" id="${IDS.opsMirroredAreasValue}">0</div>
        <div class="ws-ops-meta" id="${IDS.opsMirroredAreasMeta}">
          <div class="ws-ops-meta-item"><span>Box</span><strong>0</strong></div>
          <div class="ws-ops-meta-item"><span>Flat</span><strong>0</strong></div>
          <div class="ws-ops-meta-item"><span>Bag</span><strong>0</strong></div>
        </div>
      </div>

      <div class="ws-ops-card">
        <div class="ws-ops-label">Needed Areas</div>
        <div class="ws-ops-value" id="${IDS.opsNeededAreasValue}">0</div>
        <div class="ws-ops-meta" id="${IDS.opsNeededAreasMeta}">
          <div class="ws-ops-meta-item"><span>Box</span><strong>0</strong></div>
          <div class="ws-ops-meta-item"><span>Flat</span><strong>0</strong></div>
          <div class="ws-ops-meta-item"><span>Bag</span><strong>0</strong></div>
        </div>
      </div>

      <div class="ws-ops-card">
        <div class="ws-ops-label">Deallocate Ready</div>
        <div class="ws-ops-value" id="${IDS.opsDeallocateReadyValue}">0</div>
        <div class="ws-ops-meta" id="${IDS.opsDeallocateReadyMeta}">
          <div class="ws-ops-meta-item"><span>Box</span><strong>0</strong></div>
          <div class="ws-ops-meta-item"><span>Flat</span><strong>0</strong></div>
          <div class="ws-ops-meta-item"><span>Bag</span><strong>0</strong></div>
        </div>
      </div>

      <div class="ws-ops-card">
        <div class="ws-ops-label">Wrong Allocation</div>
        <div class="ws-ops-value" id="${IDS.opsWrongAllocationValue}">0</div>
        <div class="ws-ops-meta" id="${IDS.opsWrongAllocationMeta}">
          <div class="ws-ops-meta-item"><span>Box</span><strong>0</strong></div>
          <div class="ws-ops-meta-item"><span>Flat</span><strong>0</strong></div>
          <div class="ws-ops-meta-item"><span>Bag</span><strong>0</strong></div>
        </div>
      </div>
    </div>

    <div id="${IDS.reportBody}"></div>
  </div>
</div>

  <div id="${IDS.watchTabPanel}" class="ws-tab-panel">
<div class="ws-toolbar">
  <div id="${IDS.watchCompactSummary}" class="ws-watch-compact-summary"></div>
</div>

    <div class="ws-content">
<div class="ws-series-bar-row">
  <div id="${IDS.seriesBar}" class="ws-series-bar"></div>
  <div id="${IDS.readinessBar}" class="ws-readiness-bar"></div>
  <div id="${IDS.nextCptBar}" class="ws-readiness-bar"></div>
  <div id="ws-mirror-needed-bar" class="ws-readiness-bar"></div>
</div>

<div id="ws-wrong-allocation-wrap" class="ws-ready-series-wrap">
  <div class="ws-ready-series-title">Wrong Allocation</div>
  <div id="ws-wrong-allocation-body"></div>
</div>

<div id="ws-additional-needed-wrap" class="ws-ready-series-wrap">
  <div class="ws-ready-series-title">Additional Areas Needed</div>
  <div id="ws-additional-needed-body"></div>
</div>

      <div id="${IDS.readySeriesWrap}" class="ws-ready-series-wrap">
        <div id="${IDS.readySeriesTitle}" class="ws-ready-series-title">Deallocate Ready by Series</div>
        <div id="${IDS.readySeriesBody}"></div>
      </div>

      <div class="ws-table-wrap">
        <table class="ws-table">
          <thead>
            <tr id="${IDS.tableHeadRow}">
              ${getTableHeaderHtml()}
            </tr>
          </thead>
          <tbody id="${IDS.tableBody}"></tbody>
        </table>
      </div>

      <div class="ws-logs-panel" id="${IDS.logsPanel}">
        <div class="ws-logs-header">
          <div class="ws-logs-title">Runtime Logs</div>
          <div class="ws-logs-actions">
            <button id="${IDS.copyLogsBtn}" class="ws-btn" type="button">Copy Logs</button>
            <button id="${IDS.clearLogsBtn}" class="ws-btn" type="button">Clear Logs</button>
          </div>
        </div>
        <pre id="${IDS.logsContent}" class="ws-logs-content"></pre>
      </div>
    </div>
  </div>

  <div id="${IDS.noResTabPanel}" class="ws-tab-panel">
    <div class="ws-toolbar">
<div id="${IDS.noResSummaryBar}" class="ws-nores-summary-bar">
  <div id="${IDS.noResSummaryNoRes}" class="ws-nores-summary-pill"></div>
  <div id="${IDS.noResSummaryJackpot}" class="ws-nores-summary-pill"></div>
  <div id="${IDS.noResSummaryAllocated}" class="ws-nores-summary-pill ws-nores-summary-pill-allocated"></div>
  <div id="${IDS.noResSummaryTotal}" class="ws-nores-summary-pill"></div>
</div>
    </div>

    <div class="ws-content">
      <div class="ws-table-wrap">
        <table class="ws-table">
          <thead>
            <tr id="ws-nores-table-head-row">
              ${getNoResourceTableHeaderHtml()}
            </tr>
          </thead>
          <tbody id="${IDS.noResTableBody}"></tbody>
        </table>
      </div>
    </div>
  </div>

  <div id="${IDS.sorterTabPanel}" class="ws-tab-panel">
    <div class="ws-toolbar">
      <div class="ws-meta">
        <span class="ws-badge">Sorter traffic view</span>
        <span id="${IDS.sorterStatusText}" class="ws-badge">Status: waiting</span>
      </div>
    </div>

<div class="ws-content">
  <div id="${IDS.sorterSummaryBar}" class="ws-sorter-summary-bar"></div>
  <div id="${IDS.sorterBody}" class="ws-sorter-wrap"></div>
</div>
  </div>

  <div id="${IDS.stemTabPanel}" class="ws-tab-panel">
    <div class="ws-toolbar">
      <div class="ws-meta">
        <span class="ws-badge">Stem workspace</span>
      </div>
    </div>

    <div class="ws-content">
      <div id="${IDS.stemBody}" class="ws-sorter-wrap"></div>
    </div>
  </div>
`;

    document.body.appendChild(overlay);
    ensureFooter();
    log(`Overlay created by ${SCRIPT_AUTHOR}`);

    const logsContent = overlay.querySelector(`#${IDS.logsContent}`);
    if (logsContent) {
      logsContent.textContent = runtimeLogs.join('\n');
    }

    bindOverlayEvents(overlay);
    setLogsVisible(false);
    return overlay;
  }

    function switchRecirculationTab(tabName) {
  state.activeRecirculationTab = tabName;
  setSharedSearchUi(tabName);
const reportBtn = document.getElementById(IDS.reportTabBtn);
const watchBtn = document.getElementById(IDS.watchTabBtn);
const noResBtn = document.getElementById(IDS.noResTabBtn);
const sorterBtn = document.getElementById(IDS.sorterTabBtn);
const stemBtn = document.getElementById(IDS.stemTabBtn);

const reportPanel = document.getElementById(IDS.reportTabPanel);
const watchPanel = document.getElementById(IDS.watchTabPanel);
const noResPanel = document.getElementById(IDS.noResTabPanel);
const sorterPanel = document.getElementById(IDS.sorterTabPanel);
const stemPanel = document.getElementById(IDS.stemTabPanel);

const isReport = tabName === 'report';
const isWatch = tabName === 'watchSorter';
const isNoRes = tabName === 'noResources';
const isSorter = tabName === 'sorter';
const isStem = tabName === 'stem';

if (reportBtn) reportBtn.classList.toggle('ws-tab-btn-active', isReport);
if (watchBtn) watchBtn.classList.toggle('ws-tab-btn-active', isWatch);
if (noResBtn) noResBtn.classList.toggle('ws-tab-btn-active', isNoRes);
if (sorterBtn) sorterBtn.classList.toggle('ws-tab-btn-active', isSorter);
if (stemBtn) stemBtn.classList.toggle('ws-tab-btn-active', isStem);

if (reportPanel) reportPanel.classList.toggle('ws-tab-panel-open', isReport);
if (watchPanel) watchPanel.classList.toggle('ws-tab-panel-open', isWatch);
if (noResPanel) noResPanel.classList.toggle('ws-tab-panel-open', isNoRes);
if (sorterPanel) sorterPanel.classList.toggle('ws-tab-panel-open', isSorter);
if (stemPanel) stemPanel.classList.toggle('ws-tab-panel-open', isStem);

if (isReport) {
  renderOperationalSummary();
} else if (isWatch) {
  applySearch(state.searchQuery || '');
} else if (isNoRes) {
  applyNoResourceSearch(state.noResources.searchQuery || '');
  renderNoResourceSummaryBar();
} else if (isSorter) {
  updateMapInfo();
  renderSorterSummaryBar();
  renderSorterRows();
} else if (isStem) {
  renderStemView();
}
}

function setCptAuditStatus(text) {
  const el = document.getElementById(IDS.cptStatusText);
  if (el) {
    el.textContent = `Status: ${text}`;
  }
  log('CPT Audit status updated:', text);
}
function syncCptAuditLayoutState() {
  const overlay = document.getElementById(IDS.cptOverlay);
  if (!overlay) return;

  const layout = overlay.querySelector('.ws-cpt-layout');
  if (layout) {
    layout.classList.toggle(
      'ws-cpt-layout-table-hidden',
      Boolean(state.cptAudit.leftTableHidden)
    );
  }

  const handle = overlay.querySelector(`#${IDS.cptTableHandle}`);
  if (handle) {
    const hidden = Boolean(state.cptAudit.leftTableHidden);
    handle.textContent = hidden ? 'Show Rows' : 'Hide Rows';
    handle.setAttribute('aria-label', hidden ? 'Show rows' : 'Hide rows');
    handle.setAttribute('title', hidden ? 'Show rows' : 'Hide rows');
  }
}
function renderCptAuditScopeBar() {
  const bar = document.getElementById(IDS.cptScopeBar);
  if (!bar) return;

  const options = [
    { label: '2h', value: 2 },
    { label: '4h', value: 4 },
    { label: '6h', value: 6 },
    { label: '12h', value: 12 },
    { label: 'All', value: null },
  ];

bar.innerHTML = `
  <div class="ws-cpt-filter-label">Time Scope</div>
  <div class="ws-cpt-pill-row">
    ${options.map(option => {
      const isActive = state.cptAudit.timeScopeHours === option.value;
      return `
        <button
          type="button"
          class="ws-cpt-pill${isActive ? ' ws-cpt-pill-active' : ''}"
          data-cpt-scope="${option.value == null ? 'all' : option.value}"
        >
          ${escapeHtml(option.label)}
        </button>
      `;
    }).join('')}
  </div>
`;

  bar.querySelectorAll('[data-cpt-scope]').forEach(btn => {
    btn.addEventListener('click', () => {
      const raw = btn.getAttribute('data-cpt-scope') || '';

      state.cptAudit.timeScopeHours = raw === 'all' ? null : Number(raw);

      state.cptAudit.activeCptTimes.clear();
      renderCptAudit();
    });
  });
}
function renderCptAuditTimeBar(rows) {
  const bar = document.getElementById(IDS.cptTimeBar);
  if (!bar) return;

  const times = getCptAuditTimeBuckets(rows);
  const grouped = {};

  for (const item of times) {
    const date = getDateFromCptLabel(item.label);
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(item);
  }

  bar.innerHTML = `
    <div class="ws-cpt-filter-label">CPT Time</div>
    ${Object.entries(grouped).map(([date, timeList]) => {
      return `
        <div class="ws-cpt-filter-subgroup">
          <div class="ws-cpt-filter-subtitle">${escapeHtml(date)}</div>
          <div class="ws-cpt-pill-row">
            ${timeList.map(item => {
const value = item.key;
const isActive = state.cptAudit.activeCptTimes.has(value);
              const timeOnly = String(item.label).split(' ')[1] || item.label;
              const isSweeper = item.kind === 'sweeper';

return `
  <div class="ws-cpt-pill-wrap">
    <div class="ws-cpt-pill-kind${isSweeper ? ' ws-cpt-pill-kind-sweeper' : ''}">
      ${escapeHtml(isSweeper ? 'Sweeper' : 'CPT')}
    </div>
    <button
      type="button"
      class="ws-cpt-pill${isSweeper ? ' ws-cpt-pill-sweeper' : ''}${isActive ? ' ws-cpt-pill-active' : ''}"
      data-cpt-time="${escapeHtml(value)}"
      title="${escapeHtml(isSweeper ? 'Sweeper time' : 'Next CPT time')}"
    >
      ${escapeHtml(timeOnly)}
    </button>
  </div>
`;
            }).join('')}
          </div>
        </div>
      `;
    }).join('')}
  `;

  bar.querySelectorAll('[data-cpt-time]').forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.getAttribute('data-cpt-time') || '';
      if (!value) return;

      if (state.cptAudit.activeCptTimes.has(value)) {
        state.cptAudit.activeCptTimes.delete(value);
      } else {
        state.cptAudit.activeCptTimes.add(value);
      }

      renderCptAudit();
    });
  });
}

function renderCptAuditSeriesBar(rows) {
  const bar = document.getElementById(IDS.cptSeriesBar);
  if (!bar) return;

  const seriesButtons = getCptAuditSeriesButtons(rows);

bar.innerHTML = `
  <div class="ws-cpt-filter-label">Stacking Series</div>
  <div class="ws-cpt-pill-row">
    ${seriesButtons.map(series => {
      const isActive = state.cptAudit.activeSeries.has(series);
      return `
        <button
          type="button"
          class="ws-cpt-pill${isActive ? ' ws-cpt-pill-active' : ''}"
          data-cpt-series="${escapeHtml(series)}"
        >
          ${escapeHtml(series)}
        </button>
      `;
    }).join('')}
  </div>
`;

  bar.querySelectorAll('[data-cpt-series]').forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.getAttribute('data-cpt-series') || '';
      if (!value) return;

      if (state.cptAudit.activeSeries.has(value)) {
        state.cptAudit.activeSeries.delete(value);
      } else {
        state.cptAudit.activeSeries.add(value);
      }

      renderCptAudit();
    });
  });
}

function getCptAuditRowKey(row) {
  return [
    String(row?.stackingFilter || '').trim(),
    String(row?.cptMs || 0),
  ].join('||');
}

function buildLaneBasedCptRows(rows) {
  const byLane = new Map();

  for (const row of Array.isArray(rows) ? rows : []) {
    const lane = String(row?.lane || '-').trim() || '-';
    const stackingFilter = String(row?.stackingFilter || '').trim();
    const areas = Array.isArray(row?.areas) ? row.areas : [];
const cptMs = Number(row?.cptMs || 0);
const laneSweeperMs = Number(getSweeperForCptRow({ lane, stackingFilter }) || 0);
const sweeperMs = laneSweeperMs;
    const door = String(row?.door || '-').trim() || '-';

    let laneRow = byLane.get(lane);
    if (!laneRow) {
      laneRow = {
        lane,
        areaCount: 0,
        stackingFilterCount: 0,
        stackingAreas: new Set(),
        stackingFilters: new Set(),
        sweeperMs,
        cptMs,
        door,
        metrics: {
          onSorterNow: 0,
          m15: 0,
          m30: 0,
          m60: 0,
        },
        children: [],
seenMetricSfKeys: new Set(),
      };
      byLane.set(lane, laneRow);
    }

    for (const area of areas) {
      const areaName = String(area || '').trim();
      if (areaName) laneRow.stackingAreas.add(areaName);
    }

    if (stackingFilter) {
      laneRow.stackingFilters.add(stackingFilter);
    }

const metricSfKey = String(stackingFilter || '').trim();

if (metricSfKey && !laneRow.seenMetricSfKeys.has(metricSfKey)) {
  laneRow.seenMetricSfKeys.add(metricSfKey);

  laneRow.metrics.onSorterNow += Number(row?.metrics?.onSorterNow || 0);
  laneRow.metrics.m15 += Number(row?.metrics?.m15 || 0);
  laneRow.metrics.m30 += Number(row?.metrics?.m30 || 0);
  laneRow.metrics.m60 += Number(row?.metrics?.m60 || 0);
}

    const resolvedLaneSweeperMs = Number(getSweeperForCptRow({ lane: laneRow.lane, stackingFilter }) || 0);
if (resolvedLaneSweeperMs > 0) {
  laneRow.sweeperMs = resolvedLaneSweeperMs;
}
    if (!laneRow.cptMs && cptMs) laneRow.cptMs = cptMs;
    if ((laneRow.door === '-' || !laneRow.door) && door) laneRow.door = door;

    laneRow.children.push({
      lane,
      stackingFilter,
      area: areas[0] || '-',
      areas: [...areas],
      sweeperMs,
      cptMs,
      door,
      metrics: {
        onSorterNow: Number(row?.metrics?.onSorterNow || 0),
        m15: Number(row?.metrics?.m15 || 0),
        m30: Number(row?.metrics?.m30 || 0),
        m60: Number(row?.metrics?.m60 || 0),
      },
    });
  }

return Array.from(byLane.values()).map(laneRow => {
  const detailRows = getVistaStackedChildrenForLaneRow({ lane: laneRow.lane });

  return {
    ...laneRow,
    areaCount: detailRows.length,
    stackingFilterCount: laneRow.stackingFilters.size,
  };
});
}

    function getCptAuditSweeperMs(row) {
  const direct = Number(row?.sweeperMs || 0);
  if (Number.isFinite(direct) && direct > 0) return direct;

  return Number(getSweeperForCptRow(row) || 0);
}

    function getCptAuditLaneOperationalSortMs(laneRow) {
  const now = Date.now();

  const candidates = [
    Number(laneRow?.cptMs || 0),
    Number(laneRow?.sweeperMs || 0),
  ].filter(ms => Number.isFinite(ms) && ms > now);

  if (!candidates.length) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.min(...candidates);
}

function renderCptAuditTable(rows) {
  const tbody = document.getElementById(IDS.cptTableBody);
  if (!tbody) return;

  let laneRows = buildLaneBasedCptRows(rows);

    laneRows.sort((a, b) => {
  const aSort = getCptAuditLaneOperationalSortMs(a);
  const bSort = getCptAuditLaneOperationalSortMs(b);

  if (aSort !== bSort) return aSort - bSort;

  return String(a?.lane || '').localeCompare(String(b?.lane || ''));
});

const hasActiveFilter =
  Boolean(state.cptAudit.searchQuery || '') ||
  (state.cptAudit.activeSeries && state.cptAudit.activeSeries.size > 0);

if (hasActiveFilter) {
  laneRows = laneRows.filter(laneRow => Number(laneRow.areaCount || 0) > 0);
}

  if (!laneRows.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" class="ws-empty">No matching CPT rows</td>
      </tr>
    `;
    return;
  }

  const html = [];

  for (const laneRow of laneRows) {
    const color = getCptAuditRowColor({ metrics: laneRow.metrics });

    let rowClass = '';
    if (color === 'green') rowClass = 'ws-cpt-row-green';
    else if (color === 'yellow') rowClass = 'ws-cpt-row-yellow';
    else rowClass = 'ws-cpt-row-orange';

    const rowKey = `${laneRow.lane}||${laneRow.cptMs || 0}`;
    const isExpanded = state.cptAudit.expandedRowKeys.has(rowKey);

const sweeperText =
  laneRow.sweeperMs > 0 &&
  laneRow.sweeperMs !== laneRow.cptMs &&
  laneRow.sweeperMs >= Date.now()
    ? formatCptTimeLabel(laneRow.sweeperMs)
    : '';

    const cptText = laneRow.cptMs > 0 ? formatCptTimeLabel(laneRow.cptMs) : '';
    const doorText = laneRow.door || '-';

    html.push(`
      <tr class="${rowClass}" data-cpt-row-key="${escapeHtml(rowKey)}">
        <td>${escapeHtml(laneRow.lane)}</td>
        <td>${escapeHtml(laneRow.areaCount)}</td>
        <td>${escapeHtml(laneRow.stackingFilterCount)}</td>
        <td>${escapeHtml(sweeperText)}</td>
        <td>${escapeHtml(cptText)}</td>
        <td>${escapeHtml(doorText)}</td>
<td>${escapeHtml(laneRow.metrics.onSorterNow)}</td>
<td>${escapeHtml(laneRow.metrics.m15)}</td>
<td>${escapeHtml(laneRow.metrics.m30)}</td>
<td>${escapeHtml(laneRow.metrics.m60)}</td>
<td>
  <div class="ws-cpt-action-group">
    <button
      type="button"
      class="ws-cpt-detail-btn"
      data-cpt-detail-toggle="${escapeHtml(rowKey)}"
    >
      ${isExpanded ? 'Hide' : 'Stacked'}
    </button>

    <button
      type="button"
      class="ws-cpt-stage-btn"
      data-cpt-stage-open="${escapeHtml(rowKey)}"
>
  Staged
</button>
<button
  type="button"
  class="ws-cpt-stage-btn"
  data-cpt-loaded-open="${escapeHtml(rowKey)}"
>
  Loaded
</button>
  </div>
</td>
      </tr>
    `);

if (isExpanded) {
  const vistaChildren = getVistaStackedChildrenForLaneRow(laneRow);

  if (!vistaChildren.length) {
    html.push(`
      <tr class="ws-cpt-detail-inline-row ws-cpt-detail-inline-row-last">
        <td></td>
        <td class="ws-cpt-detail-area-cell">-</td>
        <td colspan="9" style="color:#5f6b7a;">No Vista stacked containers for this lane</td>
      </tr>
    `);
  } else {
    for (let i = 0; i < vistaChildren.length; i += 1) {
      const child = vistaChildren[i];
      const isLastChild = i === vistaChildren.length - 1;

const childCount = Number(child?.childCount || 0);
const metricsEmpty =
  (child?.onSorterNow === '-' || Number(child?.onSorterNow || 0) === 0) &&
  (child?.m15 === '-' || Number(child?.m15 || 0) === 0) &&
  (child?.m30 === '-' || Number(child?.m30 || 0) === 0) &&
  (child?.m60 === '-' || Number(child?.m60 || 0) === 0);

const cptMsForColor = Number(child?.cptMsForesight || child?.cptMsVista || 0);
const minutesToCpt =
  Number.isFinite(cptMsForColor) && cptMsForColor > 0
    ? (cptMsForColor - Date.now()) / 60000
    : null;

const rowGreenClass = metricsEmpty && childCount === 0 ? ' ws-cpt-detail-row-green-text' : '';
const rowRedClass = metricsEmpty && childCount > 0 ? ' ws-cpt-detail-row-red-text' : '';
const rowOrangeClass =
  !metricsEmpty &&
  childCount > 0 &&
  minutesToCpt !== null &&
  minutesToCpt >= 0 &&
  minutesToCpt < 30
    ? ' ws-cpt-detail-row-orange-text'
    : '';

html.push(`
  <tr class="ws-cpt-detail-inline-row${isLastChild ? ' ws-cpt-detail-inline-row-last' : ''}${rowGreenClass}${rowRedClass}${rowOrangeClass}">
<td>${child.containerId && child.containerId !== '-' ? renderAreaLink(child.containerId, 'ws-area-link') : '-'}</td>
<td class="ws-cpt-detail-area-cell">${child.area && child.area !== '-' ? renderAreaLink(child.area, 'ws-area-link') : '-'}</td>
    <td>${escapeHtml(child.stackingFilter)}</td>
    <td>${escapeHtml(child.sweeperText)}</td>
    <td>${escapeHtml(child.cptText)}</td>
    <td>${escapeHtml(child.location)}</td>
    <td>${escapeHtml(child.onSorterNow)}</td>
    <td>${escapeHtml(child.m15)}</td>
    <td>${escapeHtml(child.m30)}</td>
    <td>${escapeHtml(child.m60)}</td>
    <td>${escapeHtml(child.detailText)}</td>
  </tr>
`);
    }
  }
}
  }

  tbody.innerHTML = html.join('');

  tbody.querySelectorAll('[data-cpt-detail-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-cpt-detail-toggle') || '';
      if (!key) return;

      if (state.cptAudit.expandedRowKeys.has(key)) {
        state.cptAudit.expandedRowKeys.delete(key);
      } else {
        state.cptAudit.expandedRowKeys.add(key);
      }

      renderCptAuditTable(state.cptAudit.filteredRows || []);
    });
  });
    tbody.querySelectorAll('[data-cpt-stage-open]').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.getAttribute('data-cpt-stage-open') || '';
    if (!key) return;
    openCptStagePopupByRowKey(key);
  });
});
    tbody.querySelectorAll('[data-cpt-loaded-open]').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.getAttribute('data-cpt-loaded-open') || '';
    if (!key) return;
    openCptLoadedPopupByRowKey(key);
  });
});
}

function buildCptAuditSummary(rows, compareRows = rows, options = {}) {
const currentMap = buildCurrentSummaryMap(rows, options);
const compareMap = buildCurrentSummaryMap(compareRows, options);

  const allKeys = new Set([
    ...currentMap.keys(),
    ...compareMap.keys(),
  ]);

  return Array.from(allKeys)
    .map((timeKey) => {
      const visibleBucket = currentMap.get(timeKey) || { key: timeKey, label: '', kind: 'cpt', items: new Map() };
      const compareBucket = compareMap.get(timeKey) || { key: timeKey, label: '', kind: 'cpt', items: new Map() };

      const visibleItems = visibleBucket.items || new Map();
      const compareItems = compareBucket.items || new Map();

      const items = Array.from(visibleItems.keys()).map(area => {
        const visibleItem = visibleItems.get(area) || null;
        const compareItem = compareItems.get(area) || null;

        return {
          area,
          incomingTo60: visibleItem?.incomingTo60 ?? compareItem?.incomingTo60 ?? '—',
          color: visibleItem?.baseColor || compareItem?.baseColor || 'orange',
        };
      });

      return {
        key: timeKey,
        label: visibleBucket.label,
        kind: visibleBucket.kind,
        items: items.sort((a, b) =>
          inferAreaSortKey(a.area).localeCompare(inferAreaSortKey(b.area))
        ),
      };
    })
    .filter(group => group.label && group.items.length > 0)
    .sort((a, b) => {
      const diff = parseCptTimeLabelToMs(a.label) - parseCptTimeLabelToMs(b.label);
      if (diff !== 0) return diff;
      if (a.kind === b.kind) return 0;
      return a.kind === 'cpt' ? -1 : 1;
    });
}

function renderCptAuditSummary(rows) {
  const el = document.getElementById(IDS.cptSummary);
  if (!el) return;

const groups = buildCptAuditSummary(rows, getCptAuditBaseRows(), {
  respectCptAuditScope: true,
});
  if (!groups.length) {
    el.innerHTML = `<div class="ws-empty">No summary data</div>`;
    return;
  }

  el.innerHTML = `
    <div class="ws-cpt-summary-top-scroll" id="ws-cpt-summary-top-scroll">
      <div class="ws-cpt-summary-top-scroll-inner" id="ws-cpt-summary-top-scroll-inner"></div>
    </div>

    <div class="ws-cpt-summary-main-scroll" id="ws-cpt-summary-main-scroll">
      <div class="ws-cpt-summary-grid" id="ws-cpt-summary-grid">
        ${groups.map(group => `
          <div class="ws-cpt-summary-col">
<div class="ws-cpt-summary-title${group.kind === 'sweeper' ? ' ws-cpt-summary-title-sweeper' : ''}">
  <div class="ws-cpt-summary-title-kind">
    ${escapeHtml(group.kind === 'sweeper' ? 'SWEEPER' : 'CPT')}
  </div>
  <div class="ws-cpt-summary-title-time">
    ${escapeHtml(group.label)}
  </div>
</div>
            <div class="ws-cpt-summary-body">
              ${group.items.map(item => `
                <div class="ws-cpt-summary-item ws-cpt-summary-item-${escapeHtml(item.color)}">
                  <span>${renderAreaLink(item.area, 'ws-area-link')}</span>
                  <strong>${escapeHtml(String(item.incomingTo60))}</strong>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const topScroll = el.querySelector('#ws-cpt-summary-top-scroll');
  const topScrollInner = el.querySelector('#ws-cpt-summary-top-scroll-inner');
  const mainScroll = el.querySelector('#ws-cpt-summary-main-scroll');
  const grid = el.querySelector('#ws-cpt-summary-grid');

  if (topScroll && topScrollInner && mainScroll && grid) {
    requestAnimationFrame(() => {
      const width = grid.scrollWidth;

      topScrollInner.style.width = width + 'px';
      topScroll.scrollLeft = mainScroll.scrollLeft;

      let syncingFromTop = false;
      let syncingFromBottom = false;

      topScroll.onscroll = () => {
        if (syncingFromBottom) return;
        syncingFromTop = true;
        mainScroll.scrollLeft = topScroll.scrollLeft;
        syncingFromTop = false;
      };

      mainScroll.onscroll = () => {
        if (syncingFromTop) return;
        syncingFromBottom = true;
        topScroll.scrollLeft = mainScroll.scrollLeft;
        syncingFromBottom = false;
      };
    });
  }
}

function printCptAuditSheet() {
  const baseRows = Array.isArray(state.cptAudit.printSnapshotRows) &&
    state.cptAudit.printSnapshotRows.length
      ? state.cptAudit.printSnapshotRows
      : getCptAuditBaseRows();
  const scopeHours = state.cptAudit.printScopeHours;
  const selectedSeriesSet = state.cptAudit.printSelectedSeries;
  const copiesBySeries = state.cptAudit.printCopiesBySeries || {};

  const inScope = (ms) => {
    const minutes = getMinutesToCpt(ms);
    if (minutes === null || minutes < 0) return false;
    if (scopeHours == null) return true;
    return minutes <= scopeHours * 60;
  };
const printGroupInScope = (group) => {
  const ms = parseCptTimeLabelToMs(group?.label);
  return Number.isFinite(ms) && inScope(ms);
};
  const scopedRows = baseRows.filter(row => {
    const cptMs = Number(row?.cptMs || 0);
    const sweeperMs = getCptAuditSweeperMs(row);
    return inScope(cptMs) || inScope(sweeperMs);
  });

  const allSeries = getCptAuditSeriesButtons(scopedRows);

  const seriesToPrint =
    selectedSeriesSet && selectedSeriesSet.size > 0
      ? allSeries.filter(series => selectedSeriesSet.has(series))
      : allSeries;

  if (!seriesToPrint.length && !state.cptAudit.printFullAuditor) {
    alert('No series selected to print');
    return;
  }



  const printablePages = [];
// 👉 Full Auditor page (اضافه به بقیه)
if (state.cptAudit.printFullAuditor) {
const fullGroups = buildCptAuditSummary(scopedRows)
  .filter(printGroupInScope)
  .map(group => ({
      ...group,
      items: (group.items || []).filter(item => item.color !== 'red' && item.color !== 'blue'),
    }))
    .filter(group => (group.items || []).length > 0);

  if (fullGroups.length) {
    printablePages.push({
      series: 'Full Auditor',
      groups: fullGroups,
    });
  }
}
  for (const series of seriesToPrint) {
    const seriesRows = scopedRows
      .map(row => {
        const filteredAreas = (Array.isArray(row?.areas) ? row.areas : []).filter(area => {
          return inferAreaSeries(area) === series;
        });

        if (!filteredAreas.length) return null;

        return {
          ...row,
          areas: filteredAreas,
          areasCount: filteredAreas.length,
        };
      })
      .filter(Boolean);

const groups = buildCptAuditSummary(seriesRows)
  .filter(printGroupInScope)
  .map(group => ({
        ...group,
        items: (group.items || []).filter(item => item.color !== 'red' && item.color !== 'blue'),
      }))
      .filter(group => (group.items || []).length > 0);

    if (!groups.length) continue;

    const copies = Math.max(1, Number(copiesBySeries?.[series] || 1));

    for (let copyIndex = 0; copyIndex < copies; copyIndex += 1) {
      printablePages.push({
        series,
        groups,
      });
    }
  }

  if (!printablePages.length) {
    alert('No data to print');
    return;
  }

  const node = (state.route.facility || '').slice(0, 4);
  const columnsPerPage = 10;

  const html = `
    <html>
      <head>
        <title>CPT Sheet</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 0; }
          .page { page-break-after: always; padding: 10mm; box-sizing: border-box; }
          .page:last-child { page-break-after: auto; }
          .header { font-weight: bold; margin-bottom: 10px; }
          .grid { display: grid; grid-template-columns: repeat(${columnsPerPage}, minmax(0, 1fr)); gap: 8px; align-items: start; }
          .col { border: 1px solid #ccc; padding: 6px; min-height: 100px; box-sizing: border-box; break-inside: avoid; page-break-inside: avoid; }
          .col-span-2 { grid-column: span 2; }
          .title { font-weight: bold; margin-bottom: 6px; text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
          .slot-parts { display: block; }
          .slot-parts-two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .items { display: block; }
          .items-second-slot { border-left: 1px dashed #ccc; padding-left: 8px; }
          .item { margin-bottom: 2px; break-inside: avoid; page-break-inside: avoid; }
        </style>
      </head>
      <body>
        ${printablePages.map(page => {
          const usedSlots = page.groups.reduce((sum, group) => {
            return sum + (((group.items || []).length > 32) ? 2 : 1);
          }, 0);

          const emptySlots = Math.max(0, columnsPerPage - usedSlots);

          return `
            <div class="page">
              <div class="header">CPT Sheet | Node: ${escapeHtml(node)} | Series: ${escapeHtml(page.series)}</div>
              <div class="grid">
                ${page.groups.map(group => {
                  const titlePrefix = group.kind === 'sweeper' ? 'SWEEPER' : 'CPT';
                  const time = group.label;
                  const items = group.items || [];
                  const splitIntoTwoSlots = items.length > 32;
                  const firstPart = splitIntoTwoSlots ? items.slice(0, 32) : items;
                  const secondPart = splitIntoTwoSlots ? items.slice(32) : [];

                  return `
                    <div class="col${splitIntoTwoSlots ? ' col-span-2' : ''}">
                      <div class="title">
  <div>${escapeHtml(titlePrefix)}</div>
  <div>${escapeHtml(time.split(' ')[0])}</div>
  <div>${escapeHtml(time.split(' ')[1] || '')}</div>
</div>
                      <div class="slot-parts${splitIntoTwoSlots ? ' slot-parts-two' : ''}">
                        <div class="items">
                          ${firstPart.map(item => `<div class="item">${escapeHtml(item.area)}</div>`).join('')}
                        </div>
                        ${secondPart.length ? `
                          <div class="items items-second-slot">
                            ${secondPart.map(item => `<div class="item">${escapeHtml(item.area)}</div>`).join('')}
                          </div>
                        ` : ''}
                      </div>
                    </div>
                  `;
                }).join('')}

                ${Array.from({ length: emptySlots }).map(() => `<div class="col"></div>`).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </body>
    </html>
  `;



  const win = window.open('', '_blank');
  if (!win) {
    alert('Popup blocked.');
    return;
  }

  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

function renderCptAudit() {
  const baseRows = getCptAuditBaseRows();
  const query = state.cptAudit.searchQuery || '';

  cleanupCptAuditSnapshots(baseRows);
  captureCptAuditSnapshots(baseRows);

renderCptAuditScopeBar();
renderCptAuditTimeBar(baseRows);
renderCptAuditSeriesBar(baseRows);

  const filteredRows = filterCptAuditRows(baseRows, query);
  state.cptAudit.filteredRows = filteredRows;

renderCptAuditTable(filteredRows);
renderCptAuditSummary(filteredRows);
syncCptAuditLayoutState();

setCptAuditStatus(`filtered ${filteredRows.length}/${baseRows.length}`);
}

function bindCptAuditOverlayEvents(overlay) {
  const closeBtn = overlay.querySelector(`#${IDS.cptCloseBtn}`);
  const searchInput = overlay.querySelector(`#${IDS.cptSearchInput}`);
    const tableHandle = overlay.querySelector(`#${IDS.cptTableHandle}`);

  if (closeBtn) {
    closeBtn.addEventListener('click', () => { closeCptAuditOverlay(); });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      state.cptAudit.searchQuery = event.target.value || '';
      renderCptAudit();
    });
  }

  if (tableHandle) {
    tableHandle.addEventListener('click', () => {
      state.cptAudit.leftTableHidden = !state.cptAudit.leftTableHidden;
      syncCptAuditLayoutState();
    });
  }

  const printBtn = overlay.querySelector('#ws-cpt-print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => { openCptPrintPopup(); });
  }
const debugBtn = overlay.querySelector('#ws-cpt-debug-btn');
if (debugBtn) {
  debugBtn.addEventListener('click', () => {
    closeCptAuditOverlay();

    const mainOverlay = ensureOverlay();
    const footer = ensureFooter();

    mainOverlay.classList.add('ws-open');
    footer.classList.add('ws-open');
    state.overlayOpen = true;

    switchRecirculationTab('watchSorter');
    setLogsVisible(true);
    setStatus('debug logs opened from CPT Audit');
  });
}
}

function ensureCptAuditOverlay() {
  let overlay = document.getElementById(IDS.cptOverlay);
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = IDS.cptOverlay;
  overlay.innerHTML = `
    <div class="ws-header">
      <div class="ws-header-left">
        <button id="${IDS.cptCloseBtn}" class="ws-btn" type="button">← Back</button>
        <div class="ws-title-wrap">
          <div class="ws-title">CPT Audit</div>
          <div class="ws-subtitle">${escapeHtml(state.route.nodeKey || 'Unknown node')}</div>
        </div>
      </div>
<div class="ws-header-right">
  <button id="ws-cpt-print-btn" class="ws-btn" type="button">Print</button>
  <button id="ws-cpt-debug-btn" class="ws-btn" type="button">Debug</button>
  <span id="${IDS.cptStatusText}" class="ws-badge">Status: waiting</span>
</div>
    </div>

    <div class="ws-cpt-toolbar">
      <div class="ws-search-wrap">
        <div class="ws-search-box">
          <span class="ws-search-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" focusable="false">
              <circle cx="7" cy="7" r="5"></circle>
              <path d="M15 15l-4.5-4.5"></path>
            </svg>
          </span>
          <input id="${IDS.cptSearchInput}" class="ws-search" type="search" autocomplete="off" spellcheck="false" placeholder="Search stacking filter or stacking area" />
        </div>
      </div>
    </div>

    <div class="ws-cpt-content">
      <div class="ws-cpt-filters">
        <div class="ws-cpt-filter-section">
          <div id="${IDS.cptScopeBar}" class="ws-cpt-filter-block"></div>
        </div>
        <div class="ws-cpt-filter-section">
          <div id="${IDS.cptTimeBar}" class="ws-cpt-filter-block"></div>
        </div>
        <div class="ws-cpt-filter-section">
          <div id="${IDS.cptSeriesBar}" class="ws-cpt-filter-block"></div>
        </div>
      </div>

      <div class="ws-cpt-layout">
        <div class="ws-cpt-table-column">
          <button id="${IDS.cptTableHandle}" class="ws-cpt-table-tab" type="button" aria-label="Hide rows" title="Hide rows">Hide Rows</button>
          <div class="ws-cpt-table-wrap">
            <div class="ws-cpt-table-shell">
<table class="ws-table">
<thead>
  <tr>
<th class="ws-cpt-col-lane">Lane / Container ID</th>
<th class="ws-cpt-col-count">Area</th>
<th class="ws-cpt-col-count">Stacking Filter</th>
<th class="ws-cpt-col-sweeper">Sweeper</th>
<th class="ws-cpt-col-cpt">Next CPT</th>
<th class="ws-cpt-col-door">Location</th>
<th class="ws-cpt-col-metric">Recirc</th>
<th class="ws-cpt-col-metric">15m</th>
<th class="ws-cpt-col-metric">30m</th>
<th class="ws-cpt-col-metric">60m</th>
<th class="ws-cpt-col-detail">Detail</th>
  </tr>
</thead>
  <tbody id="${IDS.cptTableBody}"></tbody>
</table>
            </div>
          </div>
        </div>
        <div class="ws-cpt-summary-wrap">
          <div id="${IDS.cptSummary}"></div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  bindCptAuditOverlayEvents(overlay);
  return overlay;
}

function getCptPrintSeriesOptions() {
  const baseRows = Array.isArray(state.cptAudit.printSnapshotRows) &&
    state.cptAudit.printSnapshotRows.length
      ? state.cptAudit.printSnapshotRows
      : getCptAuditBaseRows();

  const scopeHours = state.cptAudit.printScopeHours;

  const inScope = (ms) => {
    const minutes = getMinutesToCpt(ms);
    if (minutes === null || minutes < 0) return false;
    if (scopeHours == null) return true;
    return minutes <= scopeHours * 60;
  };

  const scopedRows = baseRows.filter(row => {
    const cptMs = Number(row?.cptMs || 0);
    const sweeperMs = Number(getSweeperForCptRow(row) || 0);
    return inScope(cptMs) || inScope(sweeperMs);
  });

  return getCptAuditSeriesButtons(scopedRows);
}

function renderCptPrintPopup() {
  const body = document.getElementById(IDS.cptPrintBody);
  if (!body) return;

  const scopeOptions = [
    { label: '2h', value: 2 },
    { label: '4h', value: 4 },
    { label: '6h', value: 6 },
    { label: '12h', value: 12 },
    { label: 'All', value: 'all' },
  ];

  const seriesOptions = getCptPrintSeriesOptions();

const groupedSeries = {
  BG: seriesOptions.filter(s => String(s).startsWith('BG-')),
  Box: seriesOptions.filter(s => String(s).startsWith('Box-')),
  Flat: seriesOptions.filter(s => String(s).startsWith('Flat-')),
};

  body.innerHTML = `
    <div class="ws-cpt-filter-section" style="margin-bottom:16px;">
      <div class="ws-cpt-filter-label">Print Time Scope</div>
      <div class="ws-cpt-pill-row">
        ${scopeOptions.map(opt => {
          const rawValue = opt.value === 'all' ? 'all' : String(opt.value);
          const isActive =
            opt.value === 'all'
              ? state.cptAudit.printScopeHours == null
              : state.cptAudit.printScopeHours === opt.value;

          return `
            <button
              type="button"
              class="ws-cpt-pill${isActive ? ' ws-cpt-pill-active' : ''}"
              data-print-scope="${escapeHtml(rawValue)}"
            >
              ${escapeHtml(opt.label)}
            </button>
          `;
        }).join('')}
      </div>
    </div>

<div class="ws-cpt-filter-section">
  <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:10px;">
    <div class="ws-cpt-filter-label" style="margin-bottom:0;">Series Groups</div>

    <div style="display:flex; align-items:center; gap:8px;">
      <button type="button" class="ws-btn" id="ws-cpt-print-select-all-btn">Select all</button>
      <button type="button" class="ws-btn" id="ws-cpt-print-deselect-all-btn">Deselect all</button>
    </div>
  </div>

  <label style="display:inline-flex; align-items:center; gap:8px; margin-bottom:12px; font-size:13px; font-weight:800;">
    <input type="checkbox" id="ws-cpt-print-full-auditor" ${state.cptAudit.printFullAuditor ? 'checked' : ''} />
    <span>Full auditor print</span>
  </label>
<div style="display:grid; grid-template-columns: repeat(3, minmax(190px, 1fr)); gap:18px;">
  ${Object.entries(groupedSeries).map(([groupName, list]) => `
    <div>
      <div style="font-size:12px; font-weight:800; margin-bottom:8px; color:#5f6b7a;">
        ${escapeHtml(groupName)}
      </div>

      <div style="display:flex; flex-direction:column; gap:3px;">
        ${list.map(series => {
          const checked = state.cptAudit.printSelectedSeries.has(series);
          const copies = Number(state.cptAudit.printCopiesBySeries?.[series] || 1);

          return `
            <label style="display:grid; grid-template-columns: 16px max-content 58px; align-items:center; gap:8px; padding:2px 0; min-width:0; justify-content:start;">
              <input type="checkbox" data-print-series="${escapeHtml(series)}" ${checked ? 'checked' : ''} />
              <span style="font-size:13px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(series)}</span>

              <input
                type="number"
                min="1"
                step="1"
                value="${escapeHtml(String(copies))}"
                data-print-copies="${escapeHtml(series)}"
                style="width:58px; max-width:58px; height:30px; padding:0 6px; border:1px solid #879596; border-radius:8px; font-size:14px; font-weight:700; box-sizing:border-box;"
              />
            </label>
          `;
        }).join('')}
      </div>
    </div>
  `).join('')}
</div>
    </div>

    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px;">
     <button
  type="button"
  class="ws-btn"
  id="ws-cpt-print-run-btn"
  ${(!state.cptAudit.printFullAuditor && state.cptAudit.printSelectedSeries.size === 0) ? 'disabled' : ''}
>
  Print
</button>
    </div>
  `;

    const fullAuditorInput = body.querySelector('#ws-cpt-print-full-auditor');
if (fullAuditorInput) {
  fullAuditorInput.addEventListener('change', () => {
    state.cptAudit.printFullAuditor = Boolean(fullAuditorInput.checked);
    renderCptPrintPopup();
  });
}

const selectAllBtn = body.querySelector('#ws-cpt-print-select-all-btn');
if (selectAllBtn) {
  selectAllBtn.addEventListener('click', () => {
    state.cptAudit.printSelectedSeries = new Set(getCptPrintSeriesOptions());
    renderCptPrintPopup();
  });
}

const deselectAllBtn = body.querySelector('#ws-cpt-print-deselect-all-btn');
if (deselectAllBtn) {
  deselectAllBtn.addEventListener('click', () => {
    state.cptAudit.printSelectedSeries.clear();
    renderCptPrintPopup();
  });
}

  body.querySelectorAll('[data-print-scope]').forEach(btn => {
    btn.addEventListener('click', () => {
      const raw = btn.getAttribute('data-print-scope') || '';
      state.cptAudit.printScopeHours = raw === 'all' ? null : Number(raw);
      renderCptPrintPopup();
    });
  });

body.querySelectorAll('[data-print-series]').forEach(input => {
  input.addEventListener('change', () => {
    const series = input.getAttribute('data-print-series') || '';
    if (!series) return;

    if (input.checked) {
      state.cptAudit.printSelectedSeries.add(series);
    } else {
      state.cptAudit.printSelectedSeries.delete(series);
    }

    renderCptPrintPopup();
  });
});

  body.querySelectorAll('[data-print-copies]').forEach(input => {
    input.addEventListener('input', () => {
      const series = input.getAttribute('data-print-copies') || '';
      if (!series) return;

      const value = Math.max(1, Number(input.value || 1));
      state.cptAudit.printCopiesBySeries[series] = value;
    });
  });

  const runBtn = body.querySelector('#ws-cpt-print-run-btn');
  if (runBtn) {
    runBtn.addEventListener('click', () => {
      printCptAuditSheet();
    });
  }
}

function ensureCptPrintPopup() {
  let overlay = document.getElementById(IDS.cptPrintOverlay);
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = IDS.cptPrintOverlay;
  overlay.innerHTML = `
    <div class="ws-cpt-stage-modal">
      <div class="ws-cpt-stage-header">
        <div class="ws-cpt-stage-title">Print CPT Audit</div>
        <button id="${IDS.cptPrintCloseBtn}" class="ws-btn" type="button">Close</button>
      </div>

      <div id="${IDS.cptPrintBody}" class="ws-cpt-stage-content"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector(`#${IDS.cptPrintCloseBtn}`);
  if (closeBtn) {
closeBtn.addEventListener('click', () => {
  overlay.classList.remove('ws-open');
  state.cptAudit.printPopupOpen = false;
  restoreCptFiltersAfterPrintPopup();
});
  }

overlay.addEventListener('click', (event) => {
  if (event.target === overlay) {
    overlay.classList.remove('ws-open');
    state.cptAudit.printPopupOpen = false;
    restoreCptFiltersAfterPrintPopup();
  }
});

  return overlay;
}

    function saveAndResetCptFiltersForPrint() {
  if (!state.cptAudit.printSavedFilters) {
    state.cptAudit.printSavedFilters = {
      searchQuery: state.cptAudit.searchQuery || '',
      activeCptTimes: new Set(state.cptAudit.activeCptTimes || []),
      activeSeries: new Set(state.cptAudit.activeSeries || []),
      timeScopeHours: state.cptAudit.timeScopeHours,
      expandedRowKeys: new Set(state.cptAudit.expandedRowKeys || []),
    };
  }

  state.cptAudit.searchQuery = '';
  state.cptAudit.activeCptTimes.clear();
  state.cptAudit.activeSeries.clear();
  state.cptAudit.timeScopeHours = null;

  const input = document.getElementById(IDS.cptSearchInput);
  if (input) input.value = '';

  renderCptAudit();
}

function restoreCptFiltersAfterPrintPopup() {
  const saved = state.cptAudit.printSavedFilters;
  if (!saved) return;

  state.cptAudit.searchQuery = saved.searchQuery || '';
  state.cptAudit.activeCptTimes = new Set(saved.activeCptTimes || []);
  state.cptAudit.activeSeries = new Set(saved.activeSeries || []);
  state.cptAudit.timeScopeHours = saved.timeScopeHours;
  state.cptAudit.expandedRowKeys = new Set(saved.expandedRowKeys || []);

  state.cptAudit.printSavedFilters = null;
state.cptAudit.printSnapshotRows = [];
state.cptAudit.printSnapshotCreatedAt = 0;


  const input = document.getElementById(IDS.cptSearchInput);
  if (input) input.value = state.cptAudit.searchQuery || '';

  renderCptAudit();
}

function openCptPrintPopup() {
  saveAndResetCptFiltersForPrint();

  state.cptAudit.printSnapshotRows = getCptAuditBaseRows();
  state.cptAudit.printSnapshotCreatedAt = Date.now();

  state.cptAudit.printScopeHours = 4;
  state.cptAudit.printFullAuditor = true;

const allPrintSeries = getCptPrintSeriesOptions();
state.cptAudit.printSelectedSeries = new Set(allPrintSeries);

  const overlay = ensureCptPrintPopup();
  state.cptAudit.printPopupOpen = true;
  renderCptPrintPopup();
  overlay.classList.add('ws-open');
}

    function inferVastAreaGroup(areaName) {
  const value = String(areaName || '').trim();
  const match = value.match(/^([A-Za-z]+)/);
  if (!match) return 'Other';

  const prefix = match[1].toLowerCase();
  if (prefix === 'flat') return 'Flat';
  if (prefix === 'bg' || prefix === 'bag') return 'Bg';
  if (prefix === 'box') return 'Box';

  return match[1];
}

function normalizeVastLocationKey(value) {
  return String(value || '').trim().toUpperCase();
}

function normalizeVastType(value) {
  return String(value || '').trim().toUpperCase();
}

function splitVastExpectedTypes(value) {
  return String(value || '')
    .split(',')
    .map(v => String(v || '').trim().toUpperCase())
    .filter(Boolean);
}

function getVastBaseRows() {
  const map = new Map();

  for (const row of Array.isArray(state.rows) ? state.rows : []) {
    const areas = Array.isArray(row?.areas) ? row.areas : [];
    for (const area of areas) {
      const areaName = String(area || '').trim();
      if (!areaName) continue;

      if (!map.has(areaName)) {
        map.set(areaName, {
          areaName,
          group: inferVastAreaGroup(areaName),
          stackingFilter: String(row?.stackingFilter || '').trim(),
          cptMs: Number(row?.cptMs || 0),
        });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    inferAreaSortKey(a.areaName).localeCompare(inferAreaSortKey(b.areaName))
  );
}

function getVastContainerId(vista) {
  return String(
    vista?.containerLabel ||
    vista?.containerId ||
    vista?.scannableId ||
    vista?.containerLabel ||
    vista?.id ||
    vista?.raw?.containerLabel ||
    vista?.raw?.containerId ||
    vista?.raw?.scannableId ||
    ''
  ).trim();
}

function getVastVistaPkgs(vista) {
  const direct = Number(vista?.childCount);
  if (Number.isFinite(direct)) return direct;

  const content = Number(vista?.contentCount);
  if (Number.isFinite(content)) return content;

  const rawChild = Number(vista?.raw?.childCount);
  if (Number.isFinite(rawChild)) return rawChild;

  const rawContent = Number(vista?.raw?.contentCount);
  if (Number.isFinite(rawContent)) return rawContent;

  return null;
}

function getVastActualContainerType(vista) {
  return String(
    vista?.containerType ||
    vista?.container_type ||
    vista?.type ||
    vista?.containerSubType ||
    vista?.containerSubtype ||
    vista?.raw?.containerType ||
    vista?.raw?.container_type ||
    vista?.raw?.type ||
    vista?.raw?.containerSubType ||
    vista?.raw?.containerSubtype ||
    ''
  ).trim();
}

function saveTanteiCsrfToken(token) {
  const safeToken = String(token || '').trim();
  if (!safeToken) return '';

  const ts = Date.now();

  try {
    GM_setValue(VAST_TANTEI_TOKEN_STORAGE_KEY, safeToken);
    GM_setValue(VAST_TANTEI_TOKEN_TS_STORAGE_KEY, ts);
  } catch (err) {
    warn('Failed to save Tantei token to GM storage', err);
  }

  if (state?.vast) {
    state.vast.tanteiToken = safeToken;
    state.vast.tanteiTokenLoadedAt = ts;
  }

  log('VAST Tantei token saved to GM storage', {
    length: safeToken.length,
    ts,
    host: location.hostname,
  });
try {
  const url = new URL(window.location.href);
  if (
    location.hostname.includes('trans-logistics-eu.amazon.com') &&
    url.searchParams.get('wsTanteiBootstrap') === '1'
  ) {
    setTimeout(() => {
      window.close();
    }, 500);
  }
} catch {}
  return safeToken;
}

function loadStoredTanteiCsrfToken() {
  try {
    const token = String(GM_getValue(VAST_TANTEI_TOKEN_STORAGE_KEY, '') || '').trim();
    const ts = Number(GM_getValue(VAST_TANTEI_TOKEN_TS_STORAGE_KEY, 0) || 0);

    if (!token || !ts) return '';

    if (Date.now() - ts > VAST_TANTEI_TOKEN_TTL_MS) {
      warn('Stored Tantei token expired', { ageMs: Date.now() - ts });
      return '';
    }

    if (state?.vast) {
      state.vast.tanteiToken = token;
      state.vast.tanteiTokenLoadedAt = ts;
    }

    return token;
  } catch (err) {
    warn('Failed to read Tantei token from GM storage', err);
    return '';
  }
}

function getHeaderValueFromHeaders(headers, name) {
  const wanted = String(name || '').toLowerCase();

  if (!headers) return '';

  if (headers instanceof Headers) {
    return String(headers.get(name) || '').trim();
  }

  if (Array.isArray(headers)) {
    const found = headers.find(([key]) => String(key || '').toLowerCase() === wanted);
    return String(found?.[1] || '').trim();
  }

  if (typeof headers === 'object') {
    const key = Object.keys(headers).find(k => String(k).toLowerCase() === wanted);
    return String(key ? headers[key] : '').trim();
  }

  return '';
}

    function buildTanteiBootstrapUrl(searchId = '') {
  const nodeId = String(state?.route?.facility || 'SCN2').trim() || 'SCN2';
  const id = String(searchId || 'BG-616-B').trim();

  const url = new URL('https://trans-logistics-eu.amazon.com/sortcenter/tantei');
  url.searchParams.set('nodeId', nodeId);
  url.searchParams.set('searchType', 'Container');
  url.searchParams.set('searchId', id);
url.searchParams.set('wsTanteiBootstrap', '1');
  return url.toString();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForStoredTanteiToken(timeoutMs = VAST_TANTEI_BOOTSTRAP_TIMEOUT_MS) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const token = loadStoredTanteiCsrfToken();

    if (token) {
      log('Tantei token found while waiting', {
        length: token.length,
        waitedMs: Date.now() - startedAt,
      });
      return token;
    }

    await sleep(VAST_TANTEI_BOOTSTRAP_POLL_MS);
  }

  return '';
}

async function bootstrapTanteiToken(searchId = '') {
  if (state.vast.tanteiBootstrapRunning) {
    return waitForStoredTanteiToken();
  }

  state.vast.tanteiBootstrapRunning = true;

  const url = buildTanteiBootstrapUrl(searchId);
  let tab = null;

  try {
    setVastStatus('opening Tantei to capture token...');
    log('Opening Tantei bootstrap tab', { url });

    tab = window.open(url, '_blank', 'width=900,height=700');

    const token = await waitForStoredTanteiToken();

    if (token) {
      setVastStatus('Tantei token captured');
      log('Tantei bootstrap token captured', { length: token.length });
    } else {
      warn('Tantei bootstrap timed out without token', { url });
      setVastStatus('Tantei token bootstrap timeout');
    }

    try {
      if (tab && !tab.closed) tab.close();
    } catch {}

    return token;
  } catch (err) {
    warn('Tantei bootstrap failed', err);
    return '';
  } finally {
    state.vast.tanteiBootstrapRunning = false;
  }
}


async function getTanteiCsrfToken(areaName = '') {
  const now = Date.now();

  if (
    state.vast.tanteiToken &&
    state.vast.tanteiTokenLoadedAt &&
    now - state.vast.tanteiTokenLoadedAt < VAST_TANTEI_TOKEN_TTL_MS
  ) {
    return state.vast.tanteiToken;
  }

  const stored = loadStoredTanteiCsrfToken();
  if (stored) return stored;

  warn('VAST Tantei token missing. Starting automatic bootstrap...', {
    exampleUrl: buildTanteiBootstrapUrl(areaName),
  });

  return bootstrapTanteiToken(areaName);
}

function chunkArray(items, size) {
  const result = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

function isValidTanteiContainer(item) {
  const type = String(item?.containerType || '').trim().toUpperCase();

  if (!type) return false;
  if (type === 'PACKAGE') return false;
  if (item?.isClosed === true) return false;

  return true;
}

function normalizeTanteiContainerForVast(item, areaName) {
  return {
    source: 'tantei',
    containerId: String(item?.containerLabel || item?.containerId || '').trim(),
    containerLabel: String(item?.containerLabel || '').trim(),
    containerType: String(item?.containerType || '').trim(),
    stackingFilter: String(item?.stackingFilter || '').trim(),
    criticalPullTime: item?.criticalPullTime || '',
    isEmpty: Boolean(item?.isEmpty),
    isClosed: Boolean(item?.isClosed),
    childCount: item?.isEmpty ? 0 : null,
    contentCount: item?.isEmpty ? 0 : null,
    location: String(areaName || '').trim(),
    raw: item,
  };
}

function getBestTanteiOpenContainer(contents) {
  if (!Array.isArray(contents)) return null;

  for (const item of contents) {
    const hasContainer = item?.containerId || item?.containerType;

    if (hasContainer) {
      return item; // هر چیزی پیدا شد = bad
    }
  }

  return null; // هیچ چیزی نبود = ok
}

async function fetchTanteiTroubleshootBatch(areaNames) {
  const nodeId = String(state?.route?.facility || '').trim();
  const token = await getTanteiCsrfToken(areaNames[0]);

  if (!nodeId || !areaNames.length) {
    return Promise.resolve({});
  }

  const query = `
query ($queryInput: [SearchTermInput!]!, $startIndex: String) {
  searchEntities(searchTerms: $queryInput) {
    searchTerm {
      nodeId
      nodeTimezone
      searchId
      searchIdType
      resolvedIdType
    }
    contents(pageSize: 60, startIndex: $startIndex, forwardNavigate: true) {
      contents {
        containerId
        containerLabel
        containerType
        stackingFilter
        criticalPullTime
        isEmpty
        isClosed
        isForcedMove
        associationReason
        associatedUser
        timeOfAssociation
        cleanupAllowed
      }
      endToken
    }
  }
}`;

  const variables = {
    queryInput: areaNames.map(area => ({
      nodeId,
      searchId: String(area || '').trim(),
      searchIdType: 'UNKNOWN',
    })),
    startIndex: '0',
  };

  return new Promise(resolve => {
    GM_xmlhttpRequest({
      method: 'POST',
      url: TANTEI_GRAPHQL_URL,
      headers: {
        Accept: '*/*',
        'content-type': 'application/json',
        ...(token ? { 'anti-csrftoken-a2z': token } : {}),
      },
      data: JSON.stringify({ query, variables }),
      onload: response => {
        try {
          const json = JSON.parse(String(response?.responseText || '{}'));
            log('VAST Tantei batch response', {
  status: response?.status,
  requested: areaNames.length,
  hasToken: Boolean(token),
  errors: json?.errors || null,
});
          const entities = json?.data?.searchEntities || [];
          const result = {};

          for (const entity of entities) {
            const area = String(entity?.searchTerm?.searchId || '').trim();
            if (!area) continue;

            const contents = entity?.contents?.contents || [];
            result[area] = getBestTanteiOpenContainer(contents, area);
          }

          resolve(result);
        } catch (err) {
          error('VAST Tantei parse failed', err);
          resolve({});
        }
      },
      onerror: err => {
        error('VAST Tantei request failed', err);
        resolve({});
      },
      ontimeout: err => {
        error('VAST Tantei request timeout', err);
        resolve({});
      },
    });
  });
}

async function refreshVastTroubleshootForAreas(areaNames, options = {}) {
  const force = Boolean(options.force);
  const now = Date.now();

  const uniqueAreas = Array.from(new Set(
    (Array.isArray(areaNames) ? areaNames : [])
      .map(area => String(area || '').trim())
      .filter(Boolean)
  ));

  if (!uniqueAreas.length) return;

  if (
    !force &&
    state.vast.troubleshootLoadedAt &&
    now - state.vast.troubleshootLoadedAt < VAST_TANTEI_CACHE_TTL_MS
  ) {
    const missing = uniqueAreas.filter(area =>
      !Object.prototype.hasOwnProperty.call(state.vast.troubleshootByArea || {}, area)
    );

    if (!missing.length) return;
  }

  if (state.vast.troubleshootLoading) return;

  state.vast.troubleshootLoading = true;
  setVastStatus(`checking Troubleshoot ${uniqueAreas.length} areas...`);

  try {
    const nextMap = { ...(state.vast.troubleshootByArea || {}) };
    const chunks = chunkArray(uniqueAreas, VAST_TANTEI_BATCH_SIZE);

    for (const chunk of chunks) {
      const batchResult = await fetchTanteiTroubleshootBatch(chunk);

      for (const area of chunk) {
        nextMap[area] = batchResult[area] || null;
      }
    }

    state.vast.troubleshootByArea = nextMap;
    state.vast.troubleshootLoadedAt = Date.now();
    state.vast.cacheKey = '';

    log('VAST Troubleshoot refreshed', {
      requested: uniqueAreas.length,
      found: uniqueAreas.filter(area => Boolean(nextMap[area])).length,
    });
  } finally {
    state.vast.troubleshootLoading = false;
  }
}

function getVastVistaRows() {
  return [
    ...(Array.isArray(state.stackedVista?.rows) ? state.stackedVista.rows : []),
    ...(Array.isArray(state.stageVista?.rows) ? state.stageVista.rows : []),
    ...(Array.isArray(state.loadedVista?.rows) ? state.loadedVista.rows : []),
  ];
}

function buildVastVistaLocationMap() {
  const map = {};

  for (const item of getVastVistaRows()) {
    const location = String(item?.location || item?.physicalLocation || item?.raw?.location || '').trim();
    if (!location) continue;

    const key = normalizeVastLocationKey(location);
    const existing = map[key];

    if (!existing) {
      map[key] = item;
      continue;
    }

    const existingOpen = !existing?.isClosed;
    const newOpen = !item?.isClosed;

    if (newOpen && !existingOpen) {
      map[key] = item;
      continue;
    }

    const existingPkgs = Number(getVastVistaPkgs(existing) || 0);
    const newPkgs = Number(getVastVistaPkgs(item) || 0);

    if (newOpen === existingOpen && newPkgs > existingPkgs) {
      map[key] = item;
    }
  }

  return map;
}

    function getVastCacheKey() {
return [
  state.rows?.length || 0,
  state.stackedVista?.rows?.length || 0,
  state.stageVista?.rows?.length || 0,
  state.loadedVista?.rows?.length || 0,
  state.vinyaasConfig?.loadedAt || 0,
  state.vast?.troubleshootLoadedAt || 0,
].join('|');
}

function refreshVastComputedCache(force = false) {
  const key = getVastCacheKey();

  if (!force && state.vast.cacheKey === key && state.vast.enrichedRowsCache.length) {
    return;
  }

  const baseRows = getVastBaseRows();
  const vistaMap = buildVastVistaLocationMap();

  state.vast.cacheKey = key;
  state.vast.baseRowsCache = baseRows;
  state.vast.vistaLocationMapCache = vistaMap;

  state.vast.enrichedRowsCache = baseRows.map(row => {
    const vistaFromVista = getVastVistaMatchFromMap(row.areaName, vistaMap);
const vistaFromTroubleshoot = !vistaFromVista
  ? state.vast.troubleshootByArea?.[row.areaName] || null
  : null;

const vista = vistaFromVista || vistaFromTroubleshoot;
    const expectedType = getVastExpectedContainerType(row);
    const actualType = getVastActualContainerType(vista);
    const op = getVastOperatorInfoFromValues(row, vista, expectedType, actualType);

    return {
      ...row,
      __vastVista: vista,
      __vastExpectedType: expectedType,
      __vastActualType: actualType,
      __vastOperator: op,
    };
  });
}

    function getVastVistaMatchFromMap(areaName, map) {
  const key = normalizeVastLocationKey(areaName);
  if (map[key]) return map[key];

  const partialKey = Object.keys(map).find(loc => loc.includes(key) || key.includes(loc));
  return partialKey ? map[partialKey] : null;
}

function getVastVistaMatch(areaName) {
  refreshVastComputedCache(false);
  return getVastVistaMatchFromMap(areaName, state.vast.vistaLocationMapCache || {});
}

function getVastVinyaasConfigForRow(row) {
  const key = normalizeVinyaasKey(row?.stackingFilter);
  if (!key) return null;

  return state.vinyaasConfig?.bySf?.get(key) || null;
}

function getVastExpectedContainerType(row) {
  const config = getVastVinyaasConfigForRow(row);

  return String(
    config?.outputContainerTypes ||
    config?.containerType ||
    ''
  ).trim();
}

function hasAnyVastExpectedType(expectedList, names) {
  const wanted = new Set(names.map(v => String(v).toUpperCase()));
  return expectedList.some(item => wanted.has(item));
}

    function getVastTypeAuditInfoFromValues(expectedRaw, actualRaw) {
  const expectedList = splitVastExpectedTypes(expectedRaw);
  const actual = normalizeVastType(actualRaw);

  if (!expectedList.length) {
    return { status: 'No Expected Type', className: '' };
  }

  if (!actual) {
    return { status: 'Unknown Actual Type', className: 'ws-vast-cell-red' };
  }

  if (expectedList.includes(actual)) {
    return { status: 'OK', className: '' };
  }

  const expectedHasCartOrAmpal = hasAnyVastExpectedType(expectedList, ['CART', 'AMPAL']);
  const expectedHasCart = hasAnyVastExpectedType(expectedList, ['CART']);

  const allowed = ['CART', 'AMPAL', 'PALLET', 'GAYLORD'];
  if (expectedHasCart) allowed.push('BAG');

  if (expectedHasCartOrAmpal && allowed.includes(actual)) {
    return { status: 'OK', className: '' };
  }

  return { status: 'Wrong Type', className: 'ws-vast-cell-red' };
}

function getVastTypeAuditInfo(row) {
  const expectedRaw = row?.__vastExpectedType ?? getVastExpectedContainerType(row);
  const actualRaw = row?.__vastActualType ?? getVastActualContainerType(row?.__vastVista || getVastVistaMatch(row.areaName));

  return getVastTypeAuditInfoFromValues(expectedRaw, actualRaw);
}

function getVastSfAllocationInfo(row) {
  const rawSf = String(row?.stackingFilter || '').trim();
  const sf = rawSf.toUpperCase();
  const group = String(row?.group || '').trim();

  if (!rawSf || rawSf === '-') {
    return {
      status: 'No SF',
      className: '',
    };
  }

  if (sf.endsWith('-MERGE') || sf.endsWith('-ALL')) {
    return {
      status: 'OK',
      className: '',
    };
  }

  if (group === 'Flat') {
    const ok = sf.endsWith('-VCRI') || sf.endsWith('-GS');
    return ok
      ? { status: 'OK', className: '' }
      : { status: 'Wrong Type', className: 'ws-vast-cell-red' };
  }

  if (group === 'Bg') {
    return sf.endsWith('-BAG')
      ? { status: 'OK', className: '' }
      : { status: 'Wrong Type', className: 'ws-vast-cell-red' };
  }

  if (group === 'Box') {
    const ok = !sf.endsWith('-VCRI') && !sf.endsWith('-BAG');
    return ok
      ? { status: 'OK', className: '' }
      : { status: 'Wrong Type', className: 'ws-vast-cell-red' };
  }

  return {
    status: 'Unknown Type',
    className: '',
  };
}

    function getVastContainerGroupAuditInfoFromValues(row, vista, actualRaw) {
  const actual = normalizeVastType(actualRaw);
  const group = String(row?.group || '').trim();

  if (!vista) {
    const hasSf = String(row?.stackingFilter || '').trim();
    return {
      status: hasSf ? 'No Container' : 'No SF / No Container',
      className: hasSf ? 'ws-vast-cell-red' : '',
    };
  }

  if (!actual) {
    return { status: 'Unknown Container Type', className: 'ws-vast-cell-red' };
  }

  if (group === 'Flat') {
    const ok = ['GAYLORD', 'CART', 'AMPAL'].includes(actual);
    return { status: ok ? 'OK' : 'Wrong Container', className: ok ? '' : 'ws-vast-cell-red' };
  }

  if (group === 'Bg') {
    const ok = actual === 'BAG';
    return { status: ok ? 'OK' : 'Wrong Container', className: ok ? '' : 'ws-vast-cell-red' };
  }

  if (group === 'Box') {
    const ok = ['PALLET', 'CART', 'AMPAL'].includes(actual);
    return { status: ok ? 'OK' : 'Wrong Container', className: ok ? '' : 'ws-vast-cell-red' };
  }

  return { status: 'Unknown Group', className: '' };
}

function getVastContainerGroupAuditInfo(row) {
  const vista = row?.__vastVista || getVastVistaMatch(row.areaName);
  const actual = row?.__vastActualType ?? getVastActualContainerType(vista);

  return getVastContainerGroupAuditInfoFromValues(row, vista, actual);
}

    function getVastAreaTypeForStackingFilter(stackingFilter) {
  const sf = String(stackingFilter || '').trim().toUpperCase();

  if (!sf || sf === '-') return '';

  if (sf.endsWith('-BAG')) return 'Bag/BG';
  if (sf.endsWith('-VCRI') || sf.endsWith('-GS')) return 'Flat';

  return 'Box';
}

function buildVastActionFromGroup(group) {
  if (group === 'Flat') return 'Open GAYLORD, CART, or AMPAL container';
  if (group === 'Bg') return 'Open BAG container';
  if (group === 'Box') return 'Open PALLET, CART, or AMPAL container';
  return 'Open correct container for this area';
}

function buildVastActionFromExpectedOrGroup(expectedType, group) {
  const expectedList = splitVastExpectedTypes(expectedType);
  if (expectedList.length) return `Open ${expectedList.join(' or ')} container`;
  return buildVastActionFromGroup(group);
}

    function getVastOperatorInfoFromValues(row, vista, expected, actual) {
  const group = String(row?.group || '').trim();

  if (!vista && String(row?.stackingFilter || '').trim()) {
    return {
      issue: 'No Container',
      reason: 'No container is open for this stacking area',
      action: buildVastActionFromExpectedOrGroup(expected, group),
      priority: 1,
    };
  }

  const containerAudit = getVastContainerGroupAuditInfoFromValues(row, vista, actual);
  if (containerAudit.className === 'ws-vast-cell-red') {
    return {
      issue: 'Wrong Container',
      reason: `${group} area cannot use ${actual || 'this container type'}`,
      action: buildVastActionFromGroup(group),
      priority: 2,
    };
  }

const sfInfo = getVastSfAllocationInfo(row);
if (sfInfo.className === 'ws-vast-cell-red') {
  const correctType = getVastAreaTypeForStackingFilter(row?.stackingFilter);

  return {
    issue: 'Wrong Stacking Filter',
    reason: 'Stacking filter does not match area type',
    action: correctType
      ? `Move this stacking filter to the correct area type (${correctType})`
      : 'Move this stacking filter to the correct area type',
    priority: 3,
  };
}

  const typeInfo = getVastTypeAuditInfoFromValues(expected, actual);
  if (typeInfo.className === 'ws-vast-cell-red') {
    return {
      issue: 'Wrong Actual Type',
      reason: `${actual || 'Unknown type'} is not allowed for expected type ${expected || '-'}`,
      action: buildVastActionFromExpectedOrGroup(expected, group),
      priority: 4,
    };
  }

  return null;
}

function getVastOperatorInfo(row) {
  if (row && Object.prototype.hasOwnProperty.call(row, '__vastOperator')) {
    return row.__vastOperator;
  }

  const vista = getVastVistaMatch(row.areaName);
  const expected = getVastExpectedContainerType(row);
  const actual = getVastActualContainerType(vista);

  return getVastOperatorInfoFromValues(row, vista, expected, actual);
}

function getVastAuditStatus(row) {
  const vista = getVastVistaMatch(row.areaName);

  if (!row.stackingFilter && !vista) return 'Unmapped / No Container';
  if (!row.stackingFilter && vista) return 'Unmapped / Container Found';
  if (row.stackingFilter && !vista) return 'Mapped / No Container';

  const vistaSf = String(vista?.stackingFilter || vista?.sortCode || vista?.raw?.stackingFilter || '').trim();
  const foresightSf = String(row?.stackingFilter || '').trim();

  if (vistaSf && foresightSf && vistaSf !== foresightSf) return 'SF Mismatch';

  if (Number(getVastVistaPkgs(vista) || 0) === 0) return 'Empty Open';

  return 'OK';
}

function rowMatchesVastQuery(row, queryRaw) {
  const query = normalizeText(queryRaw);
  if (!query) return true;

  return (
    tokenMatchesPrefix(row.areaName, query) ||
    tokenMatchesPrefix(row.group, query) ||
    tokenMatchesPrefix(row.stackingFilter, query)
  );
}

function rowMatchesVastSeries(row) {
  if (!state.vast.activeSeries.size) return true;
  const series = inferAreaSeries(row.areaName);
  return Boolean(series) && state.vast.activeSeries.has(series);
}

function rowMatchesVastIssue(row) {
  if (!state.vast.activeIssues.size) return true;
  const op = getVastOperatorInfo(row);
  return Boolean(op?.issue && state.vast.activeIssues.has(op.issue));
}

function getVastSeriesButtons(rows) {
  const set = new Set();

  for (const row of rows) {
    const series = inferAreaSeries(row.areaName);
    if (series) set.add(series);
  }

  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function refreshVastSeriesBar(rows) {
  const bar = document.getElementById(IDS.vastSeriesBar);
  if (!bar) return;

  const seriesButtons = getVastSeriesButtons(rows);

  bar.innerHTML = seriesButtons.map(series => {
    const active = state.vast.activeSeries.has(series);
    return `
      <button
        type="button"
        class="ws-series-pill${active ? ' ws-series-pill-active' : ''}"
        data-vast-series="${escapeHtml(series)}"
      >
        ${escapeHtml(series)}
      </button>
    `;
  }).join('');

  bar.querySelectorAll('[data-vast-series]').forEach(btn => {
    btn.addEventListener('click', () => {
      const series = btn.getAttribute('data-vast-series') || '';
      if (!series) return;

      if (state.vast.activeSeries.has(series)) {
        state.vast.activeSeries.delete(series);
      } else {
        state.vast.activeSeries.add(series);
      }

      renderVastAudit();
    });
  });
}

function getVastIssueCounts(rows) {
  const counts = new Map();

  for (const row of rows) {
    const op = getVastOperatorInfo(row);
    if (!op) continue;
    counts.set(op.issue, (counts.get(op.issue) || 0) + 1);
  }

  return Array.from(counts.entries()).map(([issue, count]) => ({ issue, count }));
}

function refreshVastIssueBar(rows) {
  const bar = document.getElementById(IDS.vastOperatorFilterBar);
  const title = document.getElementById(IDS.vastOperatorTitle);
  if (!bar || !title) return;

  const items = getVastIssueCounts(rows);
  const total = items.reduce((sum, item) => sum + item.count, 0);

  title.innerHTML = `Operator Alerts (<span style="color:#b42318;font-weight:900;">${escapeHtml(total)}</span>)`;

  if (!items.length) {
    bar.innerHTML = '';
    return;
  }

  const allActive = state.vast.activeIssues.size === 0;

  bar.innerHTML = `
    <button
      type="button"
      class="ws-vast-alert-pill${allActive ? ' ws-vast-alert-pill-active' : ''}"
      data-vast-issue=""
    >
      All (${escapeHtml(total)})
    </button>
    ${items.map(item => `
      <button
        type="button"
        class="ws-vast-alert-pill${state.vast.activeIssues.has(item.issue) ? ' ws-vast-alert-pill-active' : ''}"
        data-vast-issue="${escapeHtml(item.issue)}"
      >
        ${escapeHtml(item.issue)} (${escapeHtml(item.count)})
      </button>
    `).join('')}
  `;

  bar.querySelectorAll('[data-vast-issue]').forEach(btn => {
    btn.addEventListener('click', () => {
      const issue = btn.getAttribute('data-vast-issue') || '';

      if (!issue) {
        state.vast.activeIssues.clear();
      } else if (state.vast.activeIssues.has(issue)) {
        state.vast.activeIssues.delete(issue);
      } else {
        state.vast.activeIssues.add(issue);
      }

      renderVastAudit();
    });
  });
}

function renderVastOperatorRows(rows) {
  const tbody = document.getElementById(IDS.vastOperatorBody);
  if (!tbody) return;

  const items = rows
    .map(row => ({ row, op: getVastOperatorInfo(row) }))
    .filter(item => item.op)
    .sort((a, b) => {
      if (a.op.priority !== b.op.priority) return a.op.priority - b.op.priority;
      return inferAreaSortKey(a.row.areaName).localeCompare(inferAreaSortKey(b.row.areaName));
    });

  if (!items.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="ws-empty">No operator alerts</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = items.map(({ row, op }) => {
const vista = row.__vastVista || null;
const expectedType = row.__vastExpectedType || '-';
const actualType = row.__vastActualType || '-';
    const containerId = getVastContainerId(vista) || 'NO CONTAINER';
    const pkgs = getVastVistaPkgs(vista);

    const sfInfo = getVastSfAllocationInfo(row);
    const containerInfo = getVastContainerGroupAuditInfo(row);
    const typeInfo = getVastTypeAuditInfo(row);

    const detailId = `ws-vast-detail-${row.areaName.replace(/[^A-Za-z0-9_-]/g, '_')}`;
    const detailOpen = state.vast.openDetails.has(row.areaName);

    return `
      <tr>
        <td>${renderAreaLink(row.areaName, 'ws-area-link')}</td>
        <td>${escapeHtml(op.issue)}</td>
        <td>${escapeHtml(op.reason)}</td>
        <td>${escapeHtml(op.action)}</td>
        <td>
          <button
            type="button"
            class="ws-btn"
            data-vast-detail="${escapeHtml(row.areaName)}"
          >
            Details
          </button>
        </td>
      </tr>

      <tr id="${escapeHtml(detailId)}" class="ws-vast-detail-row"${detailOpen ? '' : ' hidden'}>
        <td colspan="5">
          <div class="ws-vast-inline-detail">
            <span class="ws-vast-detail-item">
              <strong>Foresight SF:</strong>
              <span class="${escapeHtml(sfInfo.className)}">${escapeHtml(row.stackingFilter || '-')}</span>
            </span>

            <span class="ws-vast-detail-sep">|</span>

            <span class="ws-vast-detail-item">
              <strong>Container:</strong>
              <span class="${escapeHtml(containerInfo.className)}">${escapeHtml(containerId)}</span>
            </span>

            <span class="ws-vast-detail-sep">|</span>

            <span class="ws-vast-detail-item">
              <strong>Pkgs:</strong>
              <span>${escapeHtml(pkgs == null ? '-' : String(pkgs))}</span>
            </span>

            <span class="ws-vast-detail-sep">|</span>

            <span class="ws-vast-detail-item">
              <strong>Actual Type:</strong>
              <span class="${escapeHtml(typeInfo.className)}">${escapeHtml(actualType)}</span>
            </span>

            <span class="ws-vast-detail-sep">|</span>

            <span class="ws-vast-detail-item">
              <strong>Expected Type:</strong>
              <span>${escapeHtml(expectedType)}</span>
            </span>

            <span class="ws-vast-detail-sep">|</span>

            <span class="ws-vast-detail-item">
              <strong>Group:</strong>
              <span>${escapeHtml(row.group || '-')}</span>
            </span>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('[data-vast-detail]').forEach(btn => {
    btn.addEventListener('click', () => {
      const area = btn.getAttribute('data-vast-detail') || '';
      if (!area) return;

      if (state.vast.openDetails.has(area)) {
        state.vast.openDetails.delete(area);
      } else {
        state.vast.openDetails.add(area);
      }

      renderVastAudit();
    });
  });
}

function renderVastDetailRows(rows) {
  const tbody = document.getElementById(IDS.vastTableBody);
  if (!tbody) return;

  if (!rows.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="ws-empty">No stacking areas found</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = rows.map(row => {
const vista = row.__vastVista || null;
const containerId = getVastContainerId(vista) || '-';
const pkgs = getVastVistaPkgs(vista);
const expectedType = row.__vastExpectedType || '-';
const actualType = row.__vastActualType || '-';

    const typeInfo = getVastTypeAuditInfo(row);
    const sfInfo = getVastSfAllocationInfo(row);
    const containerInfo = getVastContainerGroupAuditInfo(row);

    return `
      <tr>
        <td>${renderAreaLink(row.areaName, 'ws-area-link')}</td>
        <td>${escapeHtml(row.group || '-')}</td>
        <td class="${escapeHtml(sfInfo.className)}">${escapeHtml(row.stackingFilter || '-')}</td>
        <td>${escapeHtml(formatCpt(row.cptMs))}</td>
        <td class="${escapeHtml(containerInfo.className)}">${escapeHtml(containerId)}</td>
        <td>${escapeHtml(pkgs == null ? '-' : String(pkgs))}</td>
        <td>${escapeHtml(expectedType)}</td>
        <td class="${escapeHtml(typeInfo.className)}">${escapeHtml(actualType)}</td>
        <td>${escapeHtml(typeInfo.status)}</td>
        <td>${escapeHtml(getVastAuditStatus(row))}</td>
      </tr>
    `;
  }).join('');
}

function setVastStatus(text) {
  const el = document.getElementById(IDS.vastStatusText);
  if (el) el.textContent = `Status: ${text}`;
}

function getVastAlertCount() {
  return getVastBaseRows().filter(row => getVastOperatorInfo(row)).length;
}

function getSkynetVastFc() {
  return String(state?.route?.facility || '').trim();
}

function buildSkynetVastAlertsUrl() {
  const fc = getSkynetVastFc();
  const url = new URL(SKYNET_ALERTS_URL);
  url.searchParams.set('fc', fc);

  SKYNET_VAST_ALERT_NAMES.forEach(name => {
    url.searchParams.append('alert_name', name);
  });

  return url.toString();
}

function skynetRequestJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: options.method || 'GET',
      url,
      headers: options.headers || { Accept: '*/*' },
      data: options.body || undefined,
      anonymous: false,
      withCredentials: true,
      onload: response => {
        try {
          const text = String(response?.responseText || '');
          const data = text ? JSON.parse(text) : null;
          resolve(data);
        } catch (err) {
          reject(err);
        }
      },
      onerror: err => reject(err),
      ontimeout: err => reject(err),
    });
  });
}

function getSkynetAlertName(alert) {
  return String(alert?.labels?.alertname || '').trim();
}

    function isSkynetAlertSolved(alert) {
  const status = getSkynetAlertState(alert);
  return status === 'solved' || status === 'resolved';
}

function getSkynetVastRowClass(alert) {
  return isSkynetAlertSolved(alert)
    ? 'ws-skynet-row-solved'
    : 'ws-skynet-row-active';
}

function getSkynetAlertState(alert) {
  return String(
    alert?.computed_alert_state ||
    alert?.alert_state ||
    alert?.status?.state ||
    'active'
  ).trim().toLowerCase();
}

function isSkynetVastVisible(alert) {
  const name = getSkynetAlertName(alert);
  return SKYNET_VAST_ALERT_NAMES.includes(name);
}

function parseSkynetEpochMs(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return num < 1e12 ? Math.round(num * 1000) : Math.round(num);
}

function getSkynetFirstFlagMs(alert) {
  const t = new Date(alert?.startsAt || '').getTime();
  return Number.isFinite(t) ? t : 0;
}

function getSkynetDwellStartMs(alert) {
  const labels = alert?.labels || {};
  const name = getSkynetAlertName(alert);

  if (name === 'Chute VPM') {
    return parseSkynetEpochMs(labels.dwellingTime) || getSkynetFirstFlagMs(alert);
  }

  if (name === 'Failed Move') {
    return parseSkynetEpochMs(labels.failedMoveTime) || getSkynetFirstFlagMs(alert);
  }

  if (name === 'Dwelling Container') {
    return parseSkynetEpochMs(labels.dwellStartTime || labels.dwellingTime) || getSkynetFirstFlagMs(alert);
  }

  if (name === 'Missing Container') {
    return parseSkynetEpochMs(labels.dwellStartTime || labels.dwellingTime) || getSkynetFirstFlagMs(alert);
  }

  return getSkynetFirstFlagMs(alert);
}

function formatSkynetDurationFromMs(startMs) {
  if (!Number.isFinite(startMs) || startMs <= 0) return '-';

  const diff = Math.max(0, Date.now() - startMs);
  const totalSeconds = Math.floor(diff / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

    function renderSkynetLiveTime(startMs, mode = 'duration') {
  const safeMs = Number(startMs || 0);
  if (!Number.isFinite(safeMs) || safeMs <= 0) return '-';

  return `
    <span
      class="ws-skynet-live-time"
      data-skynet-start-ms="${escapeHtml(String(safeMs))}"
      data-skynet-time-mode="${escapeHtml(mode)}"
    >
      ${escapeHtml(formatSkynetDurationFromMs(safeMs))}
    </span>
  `;
}

function updateSkynetVastLiveTimes() {
  document.querySelectorAll('.ws-skynet-live-time').forEach(el => {
    const startMs = Number(el.getAttribute('data-skynet-start-ms') || 0);
    if (!Number.isFinite(startMs) || startMs <= 0) return;

    el.textContent = formatSkynetDurationFromMs(startMs);
  });
}

function formatSkynetClockFromMs(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return '-';

  const d = new Date(ms);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
}

function formatSkynetDateTimeFromMs(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return '-';

  const d = new Date(ms);
  const yyyy = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');

  return `${yyyy}-${MM}-${dd} ${hh}:${mm}`;
}

function getSkynetAlertCounts() {
  const counts = Object.fromEntries(SKYNET_VAST_ALERT_NAMES.map(name => [name, 0]));

  for (const alert of state.vast.alerts || []) {
    if (isSkynetAlertSolved(alert)) continue;

    const name = getSkynetAlertName(alert);
    if (Object.prototype.hasOwnProperty.call(counts, name)) {
      counts[name] += 1;
    }
  }

  return counts;
}

async function refreshSkynetVastAlerts(options = {}) {
  const forceRender = Boolean(options.render);
  const fc = getSkynetVastFc();

  if (!fc) {
    state.vast.error = 'No FC found';
    if (forceRender) renderVastAudit();
    return [];
  }

  if (state.vast.loading) return state.vast.alerts || [];

  state.vast.loading = true;
  state.vast.error = '';
  setVastStatus('loading Skynet alerts...');

  try {
    const data = await skynetRequestJson(buildSkynetVastAlertsUrl(), {
      method: 'GET',
      headers: { Accept: '*/*' },
    });

    const alerts = Array.isArray(data) ? data : (data?.alerts || data?.data || data?.results || []);

    state.vast.alerts = alerts
      .filter(isSkynetVastVisible)
      .sort((a, b) => getSkynetFirstFlagMs(a) - getSkynetFirstFlagMs(b));

    state.vast.loadedAt = Date.now();
    updateVastCardAlertCount(false);

    if (forceRender && state.vast.overlayOpen) {
      renderVastAudit();
    }

    setVastStatus(`loaded ${state.vast.alerts.length} Skynet alerts`);
    return state.vast.alerts;
  } catch (err) {
    state.vast.error = err?.message || String(err);
    error('Skynet VAST refresh failed', err);
    setVastStatus(`Skynet error: ${state.vast.error}`);
    return state.vast.alerts || [];
  } finally {
    state.vast.loading = false;
  }
}

function ensureSkynetVastPolling() {
  if (state.vast.refreshTimer) return;

  state.vast.refreshTimer = window.setInterval(() => {
    refreshSkynetVastAlerts({ render: state.vast.overlayOpen });
  }, SKYNET_VAST_REFRESH_MS);
}

function stopSkynetVastPolling() {
  if (!state.vast.refreshTimer) return;
  window.clearInterval(state.vast.refreshTimer);
  state.vast.refreshTimer = null;
}

function startSkynetVastLiveTimer() {
  if (state.vast.liveTimer) return;

  state.vast.liveTimer = window.setInterval(() => {
    if (!state.vast.overlayOpen) return;
    updateSkynetVastLiveTimes();
  }, 1000);
}

function stopSkynetVastLiveTimer() {
  if (!state.vast.liveTimer) return;

  window.clearInterval(state.vast.liveTimer);
  state.vast.liveTimer = null;
}

function updateVastCardAlertCount(force = false) {
  const card = document.getElementById(IDS.vastCard);
  if (!card) return;

  const valueEl = card.querySelector('.AttentionArea-value');
  if (!valueEl) return;

  if (force || !state.vast.loadedAt) {
    refreshSkynetVastAlerts({ render: false });
  }

  const count = (state.vast.alerts || []).filter(alert => !isSkynetAlertSolved(alert)).length;

  if (state.vast.loading && !state.vast.loadedAt) {
    valueEl.textContent = 'Loading';
    valueEl.style.color = '';
    return;
  }

  if (count > 0) {
    valueEl.textContent = `${count} Alerts`;
    valueEl.style.color = '#b42318';
  } else {
    valueEl.textContent = 'No Alerts';
    valueEl.style.color = '';
  }
}

function rowMatchesSkynetVastQuery(alert, queryRaw) {
  const query = normalizeText(queryRaw);
  if (!query) return true;

  const labels = alert?.labels || {};
  const text = [
    labels.alertname,
    labels.location,
    labels.containerLabel,
    labels.destinationContainerLabel,
    labels.clientContainerId,
    labels.vehicleRunId,
    labels.route,
    labels.packageLabel,
    labels.area,
    labels.stackingFilter,
    labels.stackingArea,
    labels.failureReason,
    labels.userLogin,
    alert?.fingerprint,
  ].filter(Boolean).join(' ');

  return normalizeText(text).includes(query);
}

function getSkynetTabAlerts(tabName) {
  return (state.vast.alerts || [])
    .filter(alert => getSkynetAlertName(alert) === tabName)
    .filter(alert => rowMatchesSkynetVastQuery(alert, state.vast.searchQuery || ''))
    .sort((a, b) => getSkynetFirstFlagMs(a) - getSkynetFirstFlagMs(b));
}

function renderSkynetStatusBadge(alert) {
  const status = getSkynetAlertState(alert);
  const label = status || 'active';
  const cls = status === 'solved' || status === 'resolved'
    ? 'ws-skynet-status-solved'
    : 'ws-skynet-status-active';

  return `<span class="ws-skynet-status ${cls}"><span></span>${escapeHtml(label)}</span>`;
}

function buildSkynetTargetLink(value) {
  const safe = String(value || '').trim();
  if (!safe) return '-';
  return renderAreaLink(safe, 'ws-area-link');
}

function renderSkynetSolveButton(alert) {
  const fp = String(alert?.fingerprint || '').trim();
  const status = getSkynetAlertState(alert);
  const solving = state.vast.solvingFingerprints.has(fp);
  const solved = status === 'solved' || status === 'resolved';

  return `
    <button
      type="button"
      class="ws-btn ws-skynet-solve-btn"
      data-skynet-solve="${escapeHtml(fp)}"
      ${!fp || solved || solving ? 'disabled' : ''}
    >
      ${solving ? 'Solving...' : solved ? 'Solved' : 'Solve'}
    </button>
  `;
}

function renderMissingContainerRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="10" class="ws-empty">No Missing Container alerts</td></tr>`;
  }

  return rows.map(alert => {
    const labels = alert.labels || {};
    const firstMs = getSkynetFirstFlagMs(alert);
    const dwellMs = getSkynetDwellStartMs(alert);

    return `
      <tr>
        <td>${renderSkynetLiveTime(firstMs)}</td>
        <td>${buildSkynetTargetLink(labels.containerLabel || labels.containerId || labels.clientContainerId)}</td>
        <td>${escapeHtml(labels.packageCount || alert.annotations?.packageCount || '-')}</td>
        <td>${renderSkynetLiveTime(dwellMs)}</td>
        <td>${escapeHtml(labels.stackingFilter || '-')}</td>
        <td>${buildSkynetTargetLink(labels.stackingArea || labels.location || labels.area)}</td>
        <td>${escapeHtml(formatSkynetDateTimeFromMs(parseSkynetEpochMs(labels.cpt || labels.sdt)))}</td>
        <td>${escapeHtml(String(labels.labelWasPrinted ?? labels.labelPrinted ?? '-'))}</td>
        <td>${renderSkynetStatusBadge(alert)}</td>
        <td>${renderSkynetSolveButton(alert)}</td>
      </tr>
    `;
  }).join('');
}

function renderDwellingContainerRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="8" class="ws-empty">No Dwelling Container alerts</td></tr>`;
  }

  return rows.map(alert => {
    const labels = alert.labels || {};
    const firstMs = getSkynetFirstFlagMs(alert);
    const dwellMs = getSkynetDwellStartMs(alert);

    return `
      <tr>
        <td>${renderSkynetLiveTime(firstMs)}</td>
        <td>${buildSkynetTargetLink(labels.clientContainerId || labels.containerLabel || labels.containerId)}</td>
        <td>${escapeHtml(labels.vehicleRunId || labels.vehicleRun || '-')}</td>
        <td>${renderSkynetLiveTime(dwellMs)}</td>
        <td>${escapeHtml(labels.route || labels.lane || '-')}</td>
        <td>${escapeHtml(formatSkynetDateTimeFromMs(parseSkynetEpochMs(labels.truckScheduledDepartureTime || labels.sdt || labels.cpt)))}</td>
        <td>${renderSkynetStatusBadge(alert)}</td>
        <td>${renderSkynetSolveButton(alert)}</td>
      </tr>
    `;
  }).join('');
}

function renderChuteVpmRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="7" class="ws-empty">No Chute VPM alerts</td></tr>`;
  }

  return rows.map(alert => {
    const labels = alert.labels || {};
    const firstMs = getSkynetFirstFlagMs(alert);
    const dwellMs = getSkynetDwellStartMs(alert);

return `
      <tr class="${getSkynetVastRowClass(alert)}">
        <td>${renderSkynetLiveTime(firstMs)}</td>
        <td>${buildSkynetTargetLink(labels.location)}</td>
        <td>${escapeHtml(formatSkynetDateTimeFromMs(parseSkynetEpochMs(labels.sdt)))}</td>
        <td>${escapeHtml(alert.annotations?.packageCount || '-')}</td>
        <td>${renderSkynetLiveTime(dwellMs)}</td>
        <td>${renderSkynetStatusBadge(alert)}</td>
        <td>${renderSkynetSolveButton(alert)}</td>
      </tr>
    `;
  }).join('');
}

function renderFailedMoveRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="8" class="ws-empty">No Failed Move alerts</td></tr>`;
  }

  return rows.map(alert => {
    const labels = alert.labels || {};
    const firstMs = getSkynetFirstFlagMs(alert);
    const failedMs = parseSkynetEpochMs(labels.failedMoveTime);
    const dwellMs = getSkynetDwellStartMs(alert);

return `
      <tr class="${getSkynetVastRowClass(alert)}">
        <td>${renderSkynetLiveTime(firstMs)}</td>
        <td>${buildSkynetTargetLink(labels.containerLabel || labels.containerId)}</td>
        <td>${escapeHtml(labels.failureReason || '-')}</td>
        <td>${escapeHtml(formatSkynetDateTimeFromMs(failedMs))}</td>
        <td>${buildSkynetTargetLink(labels.destinationContainerLabel)}</td>
        <td>${renderSkynetLiveTime(dwellMs)}</td>
        <td>${renderSkynetStatusBadge(alert)}</td>
        <td>${renderSkynetSolveButton(alert)}</td>
      </tr>
    `;
  }).join('');
}

function getSkynetVastTableHtml(tabName, rows) {
  if (tabName === 'Missing Container') {
    return `
      <table class="ws-table ws-skynet-table">
        <thead>
          <tr>
            <th>First flag time</th>
            <th>Container label</th>
            <th>Packages</th>
            <th>Dwelling Time</th>
            <th>Stacking filter</th>
            <th>Stacking area</th>
            <th>CPT</th>
            <th>Label was printed</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${renderMissingContainerRows(rows)}</tbody>
      </table>
    `;
  }

  if (tabName === 'Dwelling Container') {
    return `
      <table class="ws-table ws-skynet-table">
        <thead>
          <tr>
            <th>First flag time</th>
            <th>Client container ID</th>
            <th>Vehicle Run ID</th>
            <th>Dwelling Time</th>
            <th>Route</th>
            <th>Truck scheduled departure time</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${renderDwellingContainerRows(rows)}</tbody>
      </table>
    `;
  }

  if (tabName === 'Chute VPM') {
    return `
      <table class="ws-table ws-skynet-table">
        <thead>
          <tr>
            <th>First flag time</th>
            <th>Location</th>
            <th>Scheduled departure time</th>
            <th>Packages</th>
            <th>Dwelling time</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${renderChuteVpmRows(rows)}</tbody>
      </table>
    `;
  }

  return `
    <table class="ws-table ws-skynet-table">
      <thead>
        <tr>
          <th>First flag time</th>
          <th>Container label</th>
          <th>Failure reason</th>
          <th>Failed move time</th>
          <th>Destination container label</th>
          <th>Dwelling time</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>${renderFailedMoveRows(rows)}</tbody>
    </table>
  `;
}

function renderVastTabs() {
  const bar = document.getElementById(IDS.vastSeriesBar);
  if (!bar) return;

  const counts = getSkynetAlertCounts();
  const tabNames = [...SKYNET_VAST_ALERT_NAMES, 'Empty & Closed'];

  bar.innerHTML = tabNames.map(name => {
    const active = state.vast.activeTab === name;
    const count = name === 'Empty & Closed'
      ? Number(state.vast.areaAuditRows?.length || 0)
      : Number(counts[name] || 0);

    return `
      <button
        type="button"
        class="ws-series-pill${active ? ' ws-series-pill-active' : ''}"
        data-vast-tab="${escapeHtml(name)}"
      >
        ${escapeHtml(name)} ${escapeHtml(count)}
      </button>
    `;
  }).join('');

  bar.querySelectorAll('[data-vast-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.vast.activeTab = btn.getAttribute('data-vast-tab') || 'Missing Container';
      renderVastAudit();
    });
  });
}

async function solveSkynetVastAlert(fingerprint) {
  const fp = String(fingerprint || '').trim();
  if (!fp) return;

  const alert = (state.vast.alerts || []).find(item => item.fingerprint === fp);
  if (!alert) return;

  state.vast.solvingFingerprints.add(fp);
  renderVastAudit();

  try {
    const payload = JSON.stringify({
      action: 'solved',
      alerts: [alert],
    });

    const response = await skynetRequestJson(SKYNET_ACTION_URL, {
      method: 'POST',
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    const solvedAlerts = Array.isArray(response) ? response : [];
    const solved = solvedAlerts.find(item => item.fingerprint === fp);

    if (solved) {
      state.vast.alerts = state.vast.alerts.map(item =>
        item.fingerprint === fp ? solved : item
      );
    } else {
      state.vast.alerts = state.vast.alerts.filter(item => item.fingerprint !== fp);
    }

    await refreshSkynetVastAlerts({ render: false });
    updateVastCardAlertCount(false);
    renderVastAudit();
  } catch (err) {
    error('Skynet solve failed', err);
    alert(`Solve failed: ${err?.message || err}`);
  } finally {
    state.vast.solvingFingerprints.delete(fp);
    renderVastAudit();
  }
}

function isAreaAuditIssueRow(row) {
  const location = String(row?.location || row?.areaName || '').trim().toUpperCase();

  if (location === 'VAST_TRANSIT') return false;

  const pkgs = Number(row?.childCount ?? row?.contentCount ?? 0);

  return Boolean(row?.isClosed) && (Boolean(row?.isEmpty) || pkgs === 0);
}

function getAreaAuditRows() {
  const q = normalizeText(state.vast.searchQuery || '');

  return (state.vast.areaAuditRows || [])
    .filter(row => isAreaAuditIssueRow(row))
    .filter(row => {
      if (!q) return true;

      return normalizeText([
        row?.containerId,
        row?.location,
        row?.stackingFilter,
        row?.closedBy,
        row?.labelPrintedBy,
        row?.associatedUser,
      ].filter(Boolean).join(' ')).includes(q);
    })
    .sort((a, b) => {
      const aDwell = Number(a?.dwellTimeMinutes || 0);
      const bDwell = Number(b?.dwellTimeMinutes || 0);
      return bDwell - aDwell;
    });
}

function renderAreaAuditTable(rows) {
  if (state.vast.areaAuditLoading) {
    return `
      <table class="ws-table ws-skynet-table">
        <tbody>
          <tr><td class="ws-empty">Loading Empty & Closed...</td></tr>
        </tbody>
      </table>
    `;
  }

  if (!rows.length) {
    return `
      <table class="ws-table ws-skynet-table">
        <tbody>
          <tr><td class="ws-empty">No Empty & Closed rows</td></tr>
        </tbody>
      </table>
    `;
  }

  return `
    <table class="ws-table ws-skynet-table">
      <thead>
        <tr>
          <th>Container</th>
          <th>Pkgs</th>
          <th>Location</th>
          <th>Dwell</th>
          <th>Closed By</th>
          <th>Label Printed</th>
          <th>Stacking Filter</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => {
          const containerId = String(row?.containerId || '-').trim();
          const pkgs = Number(row?.childCount ?? row?.contentCount ?? 0);
          const location = String(row?.location || '-').trim();
          const dwell = Number(row?.dwellTimeMinutes || 0);
          const isEmptyClosed = true;

          return `
            <tr class="${isEmptyClosed ? 'ws-skynet-row-active' : ''}">
              <td>${containerId && containerId !== '-' ? renderAreaLink(containerId, 'ws-area-link') : '-'}</td>
              <td>${escapeHtml(pkgs)}</td>
              <td>${location && location !== '-' ? renderAreaLink(location, 'ws-area-link') : '-'}</td>
              <td>${escapeHtml(Number.isFinite(dwell) ? formatDwellTime(dwell) : '-')}</td>
              <td>${escapeHtml(row?.closedBy || row?.associatedUser || '-')}</td>
              <td>${escapeHtml(row?.labelPrintedBy || row?.labelPrinted || '-')}</td>
              <td>${escapeHtml(row?.stackingFilter || '-')}</td>
<td>${
  isEmptyClosed
    ? '<span>Send to VAST!</span>'
    : '<span class="ws-skynet-status ws-skynet-status-solved"><span></span>OK</span>'
}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

    function getAreaAuditAreaNamesFromMap() {
  const mapAreas = state?.structureMap?.areas || {};
  const fromMap = Object.values(mapAreas)
    .map(item => String(item?.label || item?.name || '').trim())
    .filter(Boolean);

  if (fromMap.length) {
    return Array.from(new Set(fromMap)).sort((a, b) =>
      inferAreaSortKey(a).localeCompare(inferAreaSortKey(b))
    );
  }

  const fromRows = [];
  for (const row of Array.isArray(state.rows) ? state.rows : []) {
    for (const area of Array.isArray(row?.areas) ? row.areas : []) {
      const name = String(area || '').trim();
      if (name) fromRows.push(name);
    }
  }

  return Array.from(new Set(fromRows)).sort((a, b) =>
    inferAreaSortKey(a).localeCompare(inferAreaSortKey(b))
  );
}

function parseTanteiTimeMs(value) {
  if (value == null) return 0;

  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value <= 0) return 0;
    return value < 1e12 ? Math.round(value * 1000) : value;
  }

  const raw = String(value || '').trim();
  if (!raw) return 0;

  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric < 1e12 ? Math.round(numeric * 1000) : numeric;
  }

  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getDwellMinutesFromTanteiItem(item) {
  const ts = parseTanteiTimeMs(
    item?.timeOfAssociation ||
    item?.lastActionTime ||
    item?.lastUpdateTime
  );

  if (!ts) return 0;

  return Math.max(0, Math.floor((Date.now() - ts) / 60000));
}

function normalizeAreaAuditTanteiContent(areaName, item) {
  const containerId = String(
    item?.containerLabel ||
    item?.containerId ||
    item?.scannableId ||
    ''
  ).trim();

  const isEmpty = Boolean(item?.isEmpty);
  const isClosed = Boolean(item?.isClosed);

  return {
    source: 'tantei',
    areaName: String(areaName || '').trim(),
    containerId,
    containerLabel: String(item?.containerLabel || '').trim(),
    containerType: String(item?.containerType || '').trim(),
    stackingFilter: String(item?.stackingFilter || '').trim(),
    location: String(areaName || '').trim(),
    childCount: isEmpty ? 0 : Number(item?.childCount ?? item?.contentCount ?? 0),
    contentCount: isEmpty ? 0 : Number(item?.contentCount ?? item?.childCount ?? 0),
    isEmpty,
    isClosed,
    isForcedMove: Boolean(item?.isForcedMove),
    associationReason: String(item?.associationReason || '').trim(),
    associatedUser: String(item?.associatedUser || '').trim(),
    timeOfAssociation: item?.timeOfAssociation || '',
    dwellTimeMinutes: getDwellMinutesFromTanteiItem(item),
    cleanupAllowed: Boolean(item?.cleanupAllowed),
    raw: item,
  };
}

function isAreaAuditTanteiIssueContent(row) {
  const location = String(row?.location || row?.areaName || '').trim().toUpperCase();
  if (location === 'VAST_TRANSIT') return false;

  const pkgs = Number(row?.childCount ?? row?.contentCount ?? 0);
  return Boolean(row?.isClosed) && (Boolean(row?.isEmpty) || pkgs === 0);
}

    function parseAreaAuditTanteiEvents(events) {
  let closedBy = '-';
  let labelPrintedBy = '-';
  let closedAt = 0;
  let labelPrintedAt = 0;

  for (const ev of Array.isArray(events) ? events : []) {
    const identifier = String(ev?.identifier || '').toUpperCase();
    const reason = String(ev?.description?.stateChangeReason || '').toUpperCase();
    const byUser = String(ev?.byUser || '').trim();
    const ts = Number(ev?.lastActionTime || ev?.lastUpdateTime || 0);

    if (
      byUser &&
      (identifier.includes('CLOSE') || reason.includes('CLOSE') || reason.includes('CLOSED'))
    ) {
      if (!closedAt || ts > closedAt) {
        closedBy = byUser;
        closedAt = ts;
      }
    }

    if (
      byUser &&
      (
        identifier.includes('PRINT') ||
        reason.includes('PRINT') ||
        String(JSON.stringify(ev?.properties || [])).toUpperCase().includes('PRINTED_ALL_LABELS')
      )
    ) {
      if (!labelPrintedAt || ts > labelPrintedAt) {
        labelPrintedBy = byUser;
        labelPrintedAt = ts;
      }
    }
  }

  return { closedBy, labelPrintedBy, closedAt, labelPrintedAt };
}

async function fetchAreaAuditTanteiEventsBatch(containerIds) {
  const nodeId = String(state?.route?.facility || '').trim();
  const ids = Array.from(new Set(
    (containerIds || []).map(x => String(x || '').trim()).filter(Boolean)
  ));

  if (!nodeId || !ids.length) return {};

  const token = await getTanteiCsrfToken(ids[0]);
log('Empty & Closed Tantei token/debug', {
  nodeId,
  ids: ids.length,
  firstId: ids[0],
  hasToken: Boolean(token),
  tokenLength: token ? token.length : 0,
});
  const query = `
query ($queryInput: [SearchTermInput!]!) {
  searchEntities(searchTerms: $queryInput) {
    searchTerm {
      nodeId
      searchId
      searchIdType
      resolvedIdType
    }
    events {
      identifier
      description {
        ... on ContainerAuditEventDescription {
          stateChangeReason
          currentStateId
          currentStateParentId
          currentStateParentLabel
          previousStateLocationId
          previousStateLocationLabel
        }
      }
      byUser
      toModule
      byModule
      properties {
        key
        oldValue
        newValue
      }
      lastActionTime
      lastUpdateTime
    }
  }
}`;

  const variables = {
    queryInput: ids.map(id => ({
      nodeId,
      searchId: id,
      searchIdType: 'UNKNOWN',
    })),
  };

  return new Promise(resolve => {
    GM_xmlhttpRequest({
      method: 'POST',
      url: TANTEI_GRAPHQL_URL,
      headers: {
        Accept: '*/*',
        'content-type': 'application/json',
        ...(token ? { 'anti-csrftoken-a2z': token } : {}),
      },
      data: JSON.stringify({ query, variables }),
      onload: response => {
        try {
          const json = JSON.parse(String(response?.responseText || '{}'));
            log('Empty & Closed Tantei response/debug', {
  status: response?.status,
  ids: ids.length,
  hasToken: Boolean(token),
  errors: json?.errors || null,
  entities: json?.data?.searchEntities?.length || 0,
  sample: json?.data?.searchEntities?.[0] || null,
});
          const entities = json?.data?.searchEntities || [];
          const result = {};

          for (const entity of entities) {
            const id = String(entity?.searchTerm?.searchId || '').trim();
            if (!id) continue;
            result[id] = parseAreaAuditTanteiEvents(entity?.events || []);
          }

          resolve(result);
        } catch (err) {
          error('Empty & Closed Tantei parse failed', err);
          resolve({});
        }
      },
      onerror: err => {
        error('Empty & Closed Tantei request failed', err);
        resolve({});
      },
      ontimeout: err => {
        error('Empty & Closed Tantei request timeout', err);
        resolve({});
      },
    });
  });
}

    async function fetchAreaAuditTanteiContentsBatch(areaNames) {
  const nodeId = String(state?.route?.facility || '').trim();
  const names = Array.from(new Set(
    (areaNames || []).map(x => String(x || '').trim()).filter(Boolean)
  ));

  if (!nodeId || !names.length) return [];

  const token = await getTanteiCsrfToken(names[0]);

  log('Empty & Closed Tantei contents token/debug', {
    nodeId,
    areas: names.length,
    firstArea: names[0],
    hasToken: Boolean(token),
    tokenLength: token ? token.length : 0,
  });

  const query = `
query ($queryInput: [SearchTermInput!]!, $startIndex: String) {
  searchEntities(searchTerms: $queryInput) {
    searchTerm {
      nodeId
      nodeTimezone
      searchId
      searchIdType
      resolvedIdType
    }
    contents(pageSize: 60, startIndex: $startIndex, forwardNavigate: true) {
      contents {
        containerId
        containerLabel
        containerType
        stackingFilter
        criticalPullTime
        isEmpty
        isClosed
        isForcedMove
        associationReason
        associatedUser
        timeOfAssociation
        cleanupAllowed
      }
      endToken
    }
  }
}`;

  const variables = {
    queryInput: names.map(area => ({
      nodeId,
      searchId: area,
      searchIdType: 'UNKNOWN',
    })),
    startIndex: '0',
  };

  return new Promise(resolve => {
    GM_xmlhttpRequest({
      method: 'POST',
      url: TANTEI_GRAPHQL_URL,
      headers: {
        Accept: '*/*',
        'content-type': 'application/json',
        ...(token ? { 'anti-csrftoken-a2z': token } : {}),
      },
      data: JSON.stringify({ query, variables }),
      onload: response => {
        try {
          const json = JSON.parse(String(response?.responseText || '{}'));

          log('Empty & Closed Tantei contents response/debug', {
            status: response?.status,
            requested: names.length,
            hasToken: Boolean(token),
            errors: json?.errors || null,
            entities: json?.data?.searchEntities?.length || 0,
            sample: json?.data?.searchEntities?.[0] || null,
          });

          const entities = json?.data?.searchEntities || [];
          const rows = [];

          for (const entity of entities) {
            const area = String(entity?.searchTerm?.searchId || '').trim();
            const contents = entity?.contents?.contents || [];

            for (const item of Array.isArray(contents) ? contents : []) {
              const row = normalizeAreaAuditTanteiContent(area, item);
              if (isAreaAuditTanteiIssueContent(row)) {
                rows.push(row);
              }
            }
          }

          resolve(rows);
        } catch (err) {
          error('Empty & Closed Tantei contents parse failed', err);
          resolve([]);
        }
      },
      onerror: err => {
        error('Empty & Closed Tantei contents request failed', err);
        resolve([]);
      },
      ontimeout: err => {
        error('Empty & Closed Tantei contents request timeout', err);
        resolve([]);
      },
    });
  });
}

async function fetchAreaAuditRowsFromTanteiAreas(areaNames) {
  const names = Array.from(new Set(
    (areaNames || []).map(x => String(x || '').trim()).filter(Boolean)
  ));

  if (!names.length) return [];

  const chunks = chunkArray(names, VAST_TANTEI_BATCH_SIZE);
  const rows = [];

  let done = 0;
  for (const chunk of chunks) {
    setVastStatus(`loading Empty & Closed from Tantei ${done}/${names.length}...`);

    const chunkRows = await fetchAreaAuditTanteiContentsBatch(chunk);
    rows.push(...chunkRows);

    done += chunk.length;

if (state.vast.overlayOpen && state.vast.activeTab === 'Empty & Closed') {
  setVastStatus(`Empty & Closed refreshing ${done}/${names.length}...`);
}
  }

  return rows;
}

async function enrichAreaAuditRowsWithTantei(rows) {
  const issueRows = (Array.isArray(rows) ? rows : []).filter(isAreaAuditIssueRow);
  const ids = issueRows
    .map(row => String(row?.containerId || '').trim())
    .filter(Boolean);

  if (!ids.length) return issueRows;

  const eventMap = {};
  const chunks = chunkArray(ids, 25);

  let done = 0;
  for (const chunk of chunks) {
    setVastStatus(`enriching Empty & Closed with Tantei ${done}/${ids.length}...`);
    Object.assign(eventMap, await fetchAreaAuditTanteiEventsBatch(chunk));
    done += chunk.length;
  }

  return issueRows.map(row => {
    const containerId = String(row?.containerId || '').trim();
    const info = eventMap[containerId] || {};

    return {
      ...row,
      closedBy: info.closedBy || row?.closedBy || row?.associatedUser || '-',
      labelPrintedBy: info.labelPrintedBy || row?.labelPrintedBy || row?.labelPrinted || '-',
      closedAt: info.closedAt || row?.closedAt || 0,
      labelPrintedAt: info.labelPrintedAt || row?.labelPrintedAt || 0,
    };
  });
}

async function refreshAreaAuditOnOpen() {
  if (state.vast.areaAuditLoading) return;

  state.vast.areaAuditLoading = true;
  state.vast.areaAuditError = '';

  try {
    const areaNames = getAreaAuditAreaNamesFromMap();

    if (!areaNames.length) {
      state.vast.areaAuditRows = [];
      state.vast.areaAuditLoadedAt = Date.now();
      state.vast.areaAuditError = 'No area map found';
      setVastStatus('Empty & Closed: no area map found');
      return;
    }



    setVastStatus(`Empty & Closed loading ${areaNames.length} areas from Tantei...`);

const tanteiRows = await fetchAreaAuditRowsFromTanteiAreas(areaNames);

if (Array.isArray(tanteiRows) && tanteiRows.length) {
  state.vast.areaAuditRows = tanteiRows;

  if (state.vast.overlayOpen && state.vast.activeTab === 'Empty & Closed') {
    renderVastAudit();
  }
}

    setVastStatus(`Empty & Closed found ${tanteiRows.length} issue rows; loading events...`);

    const enrichedRows = await enrichAreaAuditRowsWithTantei(tanteiRows);

    state.vast.areaAuditRows = enrichedRows;
    state.vast.areaAuditLoadedAt = Date.now();
    state.vast.areaAuditError = '';

if (state.vast.overlayOpen) {
  renderVastAudit();
}
    setVastStatus(`Empty & Closed ${enrichedRows.length} Tantei rows`);
  } catch (err) {
    state.vast.areaAuditError = err?.message || String(err);
    error('Empty & Closed Tantei-only load failed', err);
  } finally {
    state.vast.areaAuditLoading = false;
  }
}

    function ensureAreaAuditBackgroundRefresh() {
  if (state.vast.areaAuditRefreshTimer) return;

  refreshAreaAuditOnOpen();

  state.vast.areaAuditRefreshTimer = window.setInterval(() => {
    refreshAreaAuditOnOpen();
  }, VAST_AREA_AUDIT_REFRESH_MS);

  log('Empty & Closed background refresh started', {
    everyMs: VAST_AREA_AUDIT_REFRESH_MS,
  });
}

function stopAreaAuditBackgroundRefresh() {
  if (!state.vast.areaAuditRefreshTimer) return;

  window.clearInterval(state.vast.areaAuditRefreshTimer);
  state.vast.areaAuditRefreshTimer = null;

  log('Empty & Closed background refresh stopped');
}

async function renderVastAudit() {
  const tabName = state.vast.activeTab || 'Missing Container';

  if (tabName !== 'Empty & Closed' && !state.vast.loadedAt && !state.vast.loading) {
    await refreshSkynetVastAlerts({ render: false });
  }

  renderVastTabs();

  const body = document.getElementById(IDS.vastOperatorBody);
  const detailBody = document.getElementById(IDS.vastTableBody);
  const title = document.getElementById(IDS.vastOperatorTitle);
  const filterBar = document.getElementById(IDS.vastOperatorFilterBar);

  if (!body) return;

  if (tabName === 'Empty & Closed') {
    if (!state.vast.areaAuditLoadedAt && !state.vast.areaAuditLoading) {
      await refreshAreaAuditOnOpen();
    }

    const rows = getAreaAuditRows();

    if (title) {
      title.innerHTML = `Empty & Closed (<span style="color:#b42318;font-weight:900;">${escapeHtml(rows.length)}</span>)`;
    }

    if (filterBar) {
      filterBar.innerHTML = '';
    }

    body.innerHTML = `
      <tr>
        <td colspan="10" style="padding:0;border-bottom:none;">
          <div class="ws-table-wrap" style="border:none;border-radius:0;">
            ${renderAreaAuditTable(rows)}
          </div>
        </td>
      </tr>
    `;

    if (detailBody) {
      detailBody.innerHTML = '';
    }

    setVastStatus(
      state.vast.areaAuditError
        ? `Empty & Closed error: ${state.vast.areaAuditError}`
        : `Empty & Closed ${rows.length} rows`
    );

    renderVastTabs();
    return;
  }
  const rows = getSkynetTabAlerts(tabName);
  state.vast.filteredRows = rows;

  if (title) {
    title.innerHTML = `${escapeHtml(tabName)} (<span style="color:#b42318;font-weight:900;">${escapeHtml(rows.length)}</span>)`;
  }

if (filterBar) {
  filterBar.innerHTML = '';
}

  body.innerHTML = `
    <tr>
      <td colspan="10" style="padding:0;border-bottom:none;">
        <div class="ws-table-wrap" style="border:none;border-radius:0;">
          ${getSkynetVastTableHtml(tabName, rows)}
        </div>
      </td>
    </tr>
  `;

  if (detailBody) {
    detailBody.innerHTML = `
      <tr>
        <td colspan="10" class="ws-empty">
          Old VAST detail table removed. Data source: Skynet Alerts only.
        </td>
      </tr>
    `;
  }

  body.querySelectorAll('[data-skynet-solve]').forEach(btn => {
    btn.addEventListener('click', () => {
      const fp = btn.getAttribute('data-skynet-solve') || '';
      solveSkynetVastAlert(fp);
    });
  });

  const loadedText = state.vast.loadedAt
    ? new Date(state.vast.loadedAt).toLocaleTimeString()
    : '-';

  setVastStatus(
    state.vast.error
      ? `error: ${state.vast.error}`
      : `filtered ${rows.length}/${state.vast.alerts.length} • ${tabName} • last ${loadedText}`
  );

  updateVastCardAlertCount(false);
}

function bindVastOverlayEvents(overlay) {
  const closeBtn = overlay.querySelector(`#${IDS.vastCloseBtn}`);
  const searchInput = overlay.querySelector(`#${IDS.vastSearchInput}`);
  const refreshBtn = overlay.querySelector('#ws-vast-refresh-btn');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeVastOverlay();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', event => {
      state.vast.searchQuery = event.target.value || '';
      renderVastAudit();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      await refreshSkynetVastAlerts({ render: true });
    });
  }
}

function ensureVastOverlay() {
  let overlay = document.getElementById(IDS.vastOverlay);
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = IDS.vastOverlay;
  overlay.innerHTML = `
    <div class="ws-header">
      <div class="ws-header-left">
        <button id="${IDS.vastCloseBtn}" class="ws-btn" type="button">← Back</button>
        <div class="ws-title-wrap">
          <div class="ws-title">VAST - Skynet Alerts</div>
          <div class="ws-subtitle">${escapeHtml(state.route.nodeKey || 'Unknown node')}</div>
        </div>
      </div>

      <div class="ws-header-right">
        <button id="ws-vast-refresh-btn" class="ws-btn" type="button">Refresh</button>
        <span id="${IDS.vastStatusText}" class="ws-badge">Status: waiting</span>
      </div>
    </div>

    <div class="ws-vast-toolbar">
      <div class="ws-search-wrap">
        <div class="ws-search-box">
          <span class="ws-search-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" focusable="false">
              <circle cx="7" cy="7" r="5"></circle>
              <path d="M15 15l-4.5-4.5"></path>
            </svg>
          </span>
          <input
            id="${IDS.vastSearchInput}"
            class="ws-search"
            type="search"
            autocomplete="off"
            spellcheck="false"
            placeholder="Search Skynet alerts"
          />
        </div>
      </div>

      <div class="ws-meta">
        <span class="ws-badge">Source: Skynet</span>
        <span class="ws-badge">Auto refresh: ${escapeHtml(SKYNET_VAST_REFRESH_MS / 1000)}s</span>
      </div>
    </div>

    <div class="ws-vast-content">
      <div id="${IDS.vastSeriesBar}" class="ws-series-bar-row"></div>

      <div class="ws-vast-operator-wrap">
        <div id="${IDS.vastOperatorTitle}" class="ws-vast-operator-title">Skynet Alerts</div>
        <div id="${IDS.vastOperatorFilterBar}" class="ws-vast-filter-bar" style="display:none;"></div>

        <div class="ws-table-wrap" style="border-radius:0;border-left:none;border-right:none;border-bottom:none;">
          <table class="ws-table">
            <tbody id="${IDS.vastOperatorBody}"></tbody>
          </table>
        </div>
      </div>

      <details class="ws-vast-full-details" style="display:none;">
        <summary>Raw Details</summary>
        <div class="ws-table-wrap">
          <table class="ws-table">
            <tbody id="${IDS.vastTableBody}"></tbody>
          </table>
        </div>
      </details>
    </div>
  `;

  document.body.appendChild(overlay);
  bindVastOverlayEvents(overlay);
  return overlay;
}

    function startVastBackgroundDataLoad() {
  if (!isForesightPage) return;
  if (!state.route.isSorterDetail) return;

  ensureSkynetVastPolling();
  refreshSkynetVastAlerts({ render: false });

  ensureAreaAuditBackgroundRefresh();

  log('VAST background data load started');
}

function openVastOverlay() {
  const overlay = ensureVastOverlay();
  const footer = ensureFooter();

  overlay.classList.add('ws-open');
  footer.classList.add('ws-open');
  state.vast.overlayOpen = true;

  const input = overlay.querySelector(`#${IDS.vastSearchInput}`);
  if (input) input.value = state.vast.searchQuery || '';

startVastBackgroundDataLoad();
startSkynetVastLiveTimer();

requestAnimationFrame(() => {
  renderVastAudit();
});

setVastStatus('opened');
}

function closeVastOverlay() {
  const overlay = document.getElementById(IDS.vastOverlay);
  const footer = document.getElementById(IDS.footer);
  if (!overlay) return;

  overlay.classList.remove('ws-open');
  if (footer) footer.classList.remove('ws-open');

  state.vast.overlayOpen = false;
    stopSkynetVastLiveTimer();
  setVastStatus('closed');
}

function createVastCard() {
  const card = document.createElement('div');
  card.id = IDS.vastCard;
  card.className = 'AttentionArea';
  card.tabIndex = 0;
  card.innerHTML = `
    <h4 class="AttentionArea-header">VAST</h4>
    <h3 class="AttentionArea-value">Waiting</h3>
  `;

  card.addEventListener('click', () => {
    log('VAST card clicked');
    openVastOverlay();
  });

  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openVastOverlay();
    }
  });



  log(`VAST card created by ${SCRIPT_AUTHOR}`);
  return card;
}

function openCptAuditOverlay() {
  const overlay = ensureCptAuditOverlay();
  const footer = ensureFooter();

  overlay.classList.add('ws-open');
  footer.classList.add('ws-open');
  state.cptAudit.overlayOpen = true;

  const input = overlay.querySelector(`#${IDS.cptSearchInput}`);
  if (input) input.value = state.cptAudit.searchQuery || '';

  renderCptAudit();
  syncCptAuditLayoutState();

  setCptAuditStatus('opened');
}

function closeCptAuditOverlay() {
  const overlay = document.getElementById(IDS.cptOverlay);
  const footer = document.getElementById(IDS.footer);
  if (!overlay) return;
  overlay.classList.remove('ws-open');
  if (footer) footer.classList.remove('ws-open');
  state.cptAudit.overlayOpen = false;
  closeCptStagePopup();
  setCptAuditStatus('closed');
}

    function ensureCptStagePopup() {
  let overlay = document.getElementById(IDS.cptStageOverlay);
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = IDS.cptStageOverlay;
overlay.innerHTML = `
  <div class="ws-cpt-stage-modal">
    <div class="ws-cpt-stage-header">
      <div id="ws-cpt-stage-header-meta" class="ws-cpt-stage-header-meta">
        <div class="ws-cpt-stage-meta-item">
          <span class="ws-cpt-stage-meta-label">Lane:</span>
          <span id="ws-cpt-stage-header-lane" class="ws-cpt-stage-meta-value">-</span>
        </div>

        <div class="ws-cpt-stage-meta-item">
          <span class="ws-cpt-stage-meta-label">CPT:</span>
          <span id="ws-cpt-stage-header-cpt" class="ws-cpt-stage-meta-value">-</span>
        </div>

        <div class="ws-cpt-stage-meta-item">
          <span class="ws-cpt-stage-meta-label">Container count:</span>
          <span id="ws-cpt-stage-header-count" class="ws-cpt-stage-meta-value">0</span>
        </div>
      </div>

      <button id="${IDS.cptStageCloseBtn}" class="ws-btn" type="button">Close</button>
    </div>

    <div id="${IDS.cptStageBody}" class="ws-cpt-stage-content">
      <div class="ws-cpt-stage-table-wrap">
        <table class="ws-table">
<thead>
  <tr>
    <th>Container Id</th>
    <th>Location</th>
    <th>Content Count</th>
    <th>Stacking Filter</th>
    <th>Dwell Time</th>
  </tr>
</thead>
          <tbody>
            <tr>
              <td colspan="5" class="ws-empty">No stage data</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
`;

  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector(`#${IDS.cptStageCloseBtn}`);
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeCptStagePopup();
    });
  }

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeCptStagePopup();
    }
  });

  return overlay;
}

    function getVistaLoadedRowsForLaneRow(laneRow) {
  const lane = String(laneRow?.lane || '').trim();
  if (!lane || lane === '-') return [];

  const loadedRows = Array.isArray(state.loadedVista?.rows) ? state.loadedVista.rows : [];

  return loadedRows.filter(item => {
    const route = String(item?.route || '').trim();
    if (route && route === lane) return true;

    const sf = String(item?.stackingFilter || '').trim();
    const laneFromVista = String(getVistaLaneForStackingFilter(sf) || '').trim();
    const laneFromStem = String(getLaneForStackingFilter(sf) || '').trim();

    return laneFromVista === lane || laneFromStem === lane;
  });
}

function sortVistaLoadedRows(rows) {
  const sortKey = state.cptAudit.loadedSortKey || 'containerId';
  const sortDir = state.cptAudit.loadedSortDir || 'asc';

  return [...(Array.isArray(rows) ? rows : [])].sort((a, b) => {
    let aValue;
    let bValue;

    switch (sortKey) {
      case 'contentCount':
        aValue = Number(a?.contentCount || 0);
        bValue = Number(b?.contentCount || 0);
        break;
      case 'stackingFilter':
        aValue = String(a?.stackingFilter || '').trim();
        bValue = String(b?.stackingFilter || '').trim();
        break;
      case 'dwellTime':
        aValue = Number(a?.dwellTimeMinutes || 0);
        bValue = Number(b?.dwellTimeMinutes || 0);
        break;
      default:
        aValue = String(a?.containerId || '').trim();
        bValue = String(b?.containerId || '').trim();
        break;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDir === 'asc' ? aValue - bValue : bValue - aValue;
    }

    const cmp = String(aValue).localeCompare(String(bValue));
    return sortDir === 'asc' ? cmp : -cmp;
  });
}

function getLoadedSortIndicator(sortKey) {
  if (state.cptAudit.loadedSortKey !== sortKey) return ' ↕';
  return state.cptAudit.loadedSortDir === 'asc' ? ' ▲' : ' ▼';
}

function openCptStagePopupByRowKey(rowKey) {
  const overlay = ensureCptStagePopup();
  const body = document.getElementById(IDS.cptStageBody);
const headerMeta = document.getElementById('ws-cpt-stage-header-meta');
if (headerMeta) {
  headerMeta.innerHTML = `
    <div class="ws-cpt-stage-meta-item">
      <span class="ws-cpt-stage-meta-label">Lane:</span>
      <span id="ws-cpt-stage-header-lane" class="ws-cpt-stage-meta-value">-</span>
    </div>

    <div class="ws-cpt-stage-meta-item">
      <span class="ws-cpt-stage-meta-label">CPT:</span>
      <span id="ws-cpt-stage-header-cpt" class="ws-cpt-stage-meta-value">-</span>
    </div>

    <div class="ws-cpt-stage-meta-item">
      <span class="ws-cpt-stage-meta-label">Container count:</span>
      <span id="ws-cpt-stage-header-count" class="ws-cpt-stage-meta-value">0</span>
    </div>
  `;
}
  state.cptAudit.stageOpen = true;
  state.cptAudit.stageRowKey = rowKey;

  let laneRow = null;
  const laneRows = buildLaneBasedCptRows(state.cptAudit.filteredRows || []);

  for (const row of laneRows) {
    const key = `${row.lane}||${row.cptMs || 0}`;
    if (key === rowKey) {
      laneRow = row;
      break;
    }
  }

  const laneText = String(laneRow?.lane || '-').trim() || '-';
  const cptText = laneRow?.cptMs ? formatCptTimeLabel(laneRow.cptMs) : '-';
if (
  laneText &&
  laneText !== '-' &&
  state.stageVista.activeLane !== laneText
) {
  startStageLiveRefresh(laneText);
}
const stageRowsRaw = laneRow ? getVistaStageRowsForLaneRow(laneRow) : [];
const stageRows = sortVistaStageRows(stageRowsRaw);
const isStageLoading = Boolean(state.stageVista?.loading);
const stageErrorText = String(state.stageVista?.error || '').trim();
const containerCount = stageRows.length;

const laneEl = document.getElementById('ws-cpt-stage-header-lane');
const cptEl = document.getElementById('ws-cpt-stage-header-cpt');
const countEl = document.getElementById('ws-cpt-stage-header-count');

if (laneEl) laneEl.textContent = laneText;
if (cptEl) cptEl.textContent = cptText;
if (countEl) countEl.textContent = String(containerCount);

if (body) {
  body.innerHTML = `
    <div class="ws-cpt-stage-table-wrap">
      <table class="ws-table">
<thead>
  <tr>
    <th>Container Id</th>
    <th class="ws-sortable" data-stage-sort="location">Location${getStageSortIndicator('location')}</th>
    <th class="ws-sortable" data-stage-sort="contentCount">Content Count${getStageSortIndicator('contentCount')}</th>
    <th class="ws-sortable" data-stage-sort="stackingFilter">Stacking Filter${getStageSortIndicator('stackingFilter')}</th>
    <th class="ws-sortable" data-stage-sort="dwellTime">Dwell Time${getStageSortIndicator('dwellTime')}</th>
  </tr>
</thead>
        <tbody>
          ${
            stageRows.length
              ? stageRows.map(row => `
                  <tr>
<td>${row.containerId && row.containerId !== '-' ? renderAreaLink(row.containerId, 'ws-area-link') : '-'}</td>
<td>${row.location && row.location !== '-' ? renderAreaLink(row.location, 'ws-area-link') : '-'}</td>
<td>${escapeHtml(row.contentCount ?? '-')}</td>
<td>${escapeHtml(row.stackingFilter || '-')}</td>
<td>${escapeHtml(row.dwellTimeText || '-')}</td>
                  </tr>
                `).join('')
              : `
                <tr>
                  <td colspan="5" class="ws-empty">${
  stageErrorText
    ? escapeHtml(`Stage load failed: ${stageErrorText}`)
    : (isStageLoading ? 'Loading stage data...' : 'No staged containers for this lane')
}</td>
                </tr>
              `
          }
        </tbody>
      </table>
    </div>
  `;
}
if (body) {
  body.querySelectorAll('[data-stage-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const sortKey = th.getAttribute('data-stage-sort') || '';
      if (!sortKey) return;

      if (state.cptAudit.stageSortKey === sortKey) {
        state.cptAudit.stageSortDir =
          state.cptAudit.stageSortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.cptAudit.stageSortKey = sortKey;
        state.cptAudit.stageSortDir =
          sortKey === 'location' || sortKey === 'stackingFilter'
            ? 'asc'
            : 'desc';
      }

      openCptStagePopupByRowKey(rowKey);
    });
  });
}
  overlay.classList.add('ws-open');
}

    function renderCptStagePopupOnly() {
  const rowKey = state.cptAudit.stageRowKey;
  if (!rowKey) return;

  const laneRows = buildLaneBasedCptRows(state.cptAudit.filteredRows || []);
  const laneRow = laneRows.find(row => `${row.lane}||${row.cptMs || 0}` === rowKey);
  if (!laneRow) return;

  const body = document.getElementById(IDS.cptStageBody);
  if (!body) return;

  const stageRowsRaw = getVistaStageRowsForLaneRow(laneRow);
  const stageRows = sortVistaStageRows(stageRowsRaw);
  const isStageLoading = Boolean(state.stageVista?.loading);
  const stageErrorText = String(state.stageVista?.error || '').trim();

  const countEl = document.getElementById('ws-cpt-stage-header-count');
  if (countEl) countEl.textContent = String(stageRows.length);

  body.innerHTML = `
    <div class="ws-cpt-stage-table-wrap">
      <table class="ws-table">
        <thead>
          <tr>
            <th>Container Id</th>
            <th class="ws-sortable" data-stage-sort="location">Location${getStageSortIndicator('location')}</th>
            <th class="ws-sortable" data-stage-sort="contentCount">Content Count${getStageSortIndicator('contentCount')}</th>
            <th class="ws-sortable" data-stage-sort="stackingFilter">Stacking Filter${getStageSortIndicator('stackingFilter')}</th>
            <th class="ws-sortable" data-stage-sort="dwellTime">Dwell Time${getStageSortIndicator('dwellTime')}</th>
          </tr>
        </thead>
        <tbody>
          ${
            stageRows.length
              ? stageRows.map(row => `
                <tr>
<td>${row.containerId && row.containerId !== '-' ? renderAreaLink(row.containerId, 'ws-area-link') : '-'}</td>
<td>${row.location && row.location !== '-' ? renderAreaLink(row.location, 'ws-area-link') : '-'}</td>
                  <td>${escapeHtml(row.contentCount ?? '-')}</td>
                  <td>${escapeHtml(row.stackingFilter || '-')}</td>
                  <td>${escapeHtml(row.dwellTimeText || '-')}</td>
                </tr>
              `).join('')
              : `
                <tr>
                  <td colspan="5" class="ws-empty">${
                    stageErrorText
                      ? escapeHtml(`Stage load failed: ${stageErrorText}`)
                      : (isStageLoading ? 'Loading stage data...' : 'No stage data')
                  }</td>
                </tr>
              `
          }
        </tbody>
      </table>
    </div>
  `;
}

    function openCptLoadedPopupByRowKey(rowKey) {
  const overlay = ensureCptStagePopup();
  const body = document.getElementById(IDS.cptStageBody);

  state.cptAudit.loadedOpen = true;
  state.cptAudit.loadedRowKey = rowKey;

  let laneRow = null;
  const laneRows = buildLaneBasedCptRows(state.cptAudit.filteredRows || []);

  for (const row of laneRows) {
    const key = `${row.lane}||${row.cptMs || 0}`;
    if (key === rowKey) {
      laneRow = row;
      break;
    }
  }

  const laneText = String(laneRow?.lane || '-').trim() || '-';
  const cptText = laneRow?.cptMs ? formatCptTimeLabel(laneRow.cptMs) : '-';

  if (
    laneText &&
    laneText !== '-' &&
    state.loadedVista.activeLane !== laneText
  ) {
    startLoadedLiveRefresh(laneText);
  }

  renderCptLoadedPopupOnly();
  overlay.classList.add('ws-open');
}

function renderCptLoadedPopupOnly() {
  const rowKey = state.cptAudit.loadedRowKey;
  if (!rowKey) return;

  const laneRows = buildLaneBasedCptRows(state.cptAudit.filteredRows || []);
  const laneRow = laneRows.find(row => `${row.lane}||${row.cptMs || 0}` === rowKey);
  if (!laneRow) return;

  const body = document.getElementById(IDS.cptStageBody);
  if (!body) return;

  const laneText = String(laneRow?.lane || '-').trim() || '-';
  const cptText = laneRow?.cptMs ? formatCptTimeLabel(laneRow.cptMs) : '-';

  const loadedRowsRaw = getVistaLoadedRowsForLaneRow(laneRow);
  const loadedRows = sortVistaLoadedRows(loadedRowsRaw);
  const isLoading = Boolean(state.loadedVista?.loading);
  const errorText = String(state.loadedVista?.error || '').trim();

  const trailers = Array.from(new Set(
    loadedRows.map(row => String(row?.parentContainerId || '').trim()).filter(v => v && v !== '-')
  ));

  const doors = Array.from(new Set(
    loadedRows.map(row => String(row?.location || '').trim()).filter(v => v && v !== '-')
  ));

  const headerMeta = document.getElementById('ws-cpt-stage-header-meta');
  if (headerMeta) {
    headerMeta.innerHTML = `
      <div class="ws-cpt-stage-meta-item">
        <span class="ws-cpt-stage-meta-label">Lane:</span>
        <span class="ws-cpt-stage-meta-value">${escapeHtml(laneText)}</span>
      </div>

      <div class="ws-cpt-stage-meta-item">
        <span class="ws-cpt-stage-meta-label">TRAILER:</span>
        <span class="ws-cpt-stage-meta-value">${escapeHtml(trailers.length ? trailers.join(', ') : '-')}</span>
      </div>

      <div class="ws-cpt-stage-meta-item">
        <span class="ws-cpt-stage-meta-label">Door:</span>
        <span class="ws-cpt-stage-meta-value">${escapeHtml(doors.length ? doors.join(', ') : '-')}</span>
      </div>

      <div class="ws-cpt-stage-meta-item">
        <span class="ws-cpt-stage-meta-label">CPT:</span>
        <span class="ws-cpt-stage-meta-value">${escapeHtml(cptText)}</span>
      </div>

      <div class="ws-cpt-stage-meta-item">
        <span class="ws-cpt-stage-meta-label">Container count:</span>
        <span class="ws-cpt-stage-meta-value">${escapeHtml(String(loadedRows.length))}</span>
      </div>
    `;
  }

  body.innerHTML = `
    <div class="ws-cpt-stage-table-wrap">
      <table class="ws-table">
        <thead>
          <tr>
            <th class="ws-sortable" data-loaded-sort="containerId">Container Id${getLoadedSortIndicator('containerId')}</th>
            <th class="ws-sortable" data-loaded-sort="contentCount">Content Count${getLoadedSortIndicator('contentCount')}</th>
            <th class="ws-sortable" data-loaded-sort="stackingFilter">Stacking Filter${getLoadedSortIndicator('stackingFilter')}</th>
            <th class="ws-sortable" data-loaded-sort="dwellTime">Dwell Time${getLoadedSortIndicator('dwellTime')}</th>
          </tr>
        </thead>
        <tbody>
          ${
            loadedRows.length
              ? loadedRows.map(row => `
                  <tr>
                    <td>${row.containerId && row.containerId !== '-' ? renderAreaLink(row.containerId, 'ws-area-link') : '-'}</td>
                    <td>${escapeHtml(row.contentCount ?? '-')}</td>
                    <td>${escapeHtml(row.stackingFilter || '-')}</td>
                    <td>${escapeHtml(row.dwellTimeText || '-')}</td>
                  </tr>
                `).join('')
              : `
                <tr>
                  <td colspan="4" class="ws-empty">${
                    errorText
                      ? escapeHtml(`Loaded load failed: ${errorText}`)
                      : (isLoading ? 'Loading loaded data...' : 'No loaded containers for this lane')
                  }</td>
                </tr>
              `
          }
        </tbody>
      </table>
    </div>
  `;

  body.querySelectorAll('[data-loaded-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const sortKey = th.getAttribute('data-loaded-sort') || '';
      if (!sortKey) return;

      if (state.cptAudit.loadedSortKey === sortKey) {
        state.cptAudit.loadedSortDir =
          state.cptAudit.loadedSortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.cptAudit.loadedSortKey = sortKey;
        state.cptAudit.loadedSortDir =
          sortKey === 'containerId' || sortKey === 'stackingFilter'
            ? 'asc'
            : 'desc';
      }

      renderCptLoadedPopupOnly();
    });
  });
}

function closeCptStagePopup() {
  const overlay = document.getElementById(IDS.cptStageOverlay);
  if (overlay) {
    overlay.classList.remove('ws-open');
  }

  state.cptAudit.stageOpen = false;
  state.cptAudit.stageRowKey = '';

    stopStageLiveRefresh();
stopLoadedLiveRefresh();
}

  function openOverlay() {
    const overlay = ensureOverlay();
    const footer = ensureFooter();
    overlay.classList.add('ws-open');
    footer.classList.add('ws-open');
    state.overlayOpen = true;
    setStatus(state.lastLiveUpdateAt ? 'opened' : 'waiting for live graphql');
refreshTableHeaders();
refreshNoResourceTableHeaders();
refreshReadinessBar();
refreshNextCptBar();
refreshMirrorNeededBar();
refreshSeriesBar();
applySearch(state.searchQuery || '');
updateMapInfo();
renderOperationalSummary();
renderWatchCompactSummary();
renderAdditionalAreaNeededBlock();
renderReadySeriesBlock();
setSharedSearchUi(state.activeRecirculationTab || 'watchSorter');
switchRecirculationTab(state.activeRecirculationTab || 'watchSorter');
    log(`Overlay opened by ${SCRIPT_AUTHOR}`);
  }

  function closeOverlay() {
    const overlay = document.getElementById(IDS.overlay);
    const footer = document.getElementById(IDS.footer);
    if (!overlay) return;
    overlay.classList.remove('ws-open');
    if (footer) footer.classList.remove('ws-open');
    state.overlayOpen = false;
    setStatus('closed');
    log(`Overlay closed by ${SCRIPT_AUTHOR}`);
  }

  function createWatchSorterCard() {
    const card = document.createElement('div');
    card.id = IDS.card;
    card.className = 'AttentionArea';
    card.tabIndex = 0;
    card.innerHTML = `
      <h4 class="AttentionArea-header">Recirculation</h4>
      <h3 class="AttentionArea-value">Open</h3>
    `;
    card.addEventListener('click', () => { log('Watch Sorter card clicked'); openOverlay(); });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openOverlay(); }
    });
    log(`Watch Sorter card created by ${SCRIPT_AUTHOR}`);
    return card;
  }

  function createCptAuditCard() {
    const card = document.createElement('div');
    card.id = IDS.cptCard;
    card.className = 'AttentionArea';
    card.tabIndex = 0;
    card.innerHTML = `
      <h4 class="AttentionArea-header">CPT Audit</h4>
      <h3 class="AttentionArea-value">Open</h3>
    `;
    card.addEventListener('click', () => { log('CPT Audit card clicked'); openCptAuditOverlay(); });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openCptAuditOverlay(); }
    });
    log(`CPT Audit card created by ${SCRIPT_AUTHOR}`);
    return card;
  }

  function injectWatchSorterCard() {
    if (document.getElementById(IDS.card)) { log('Watch Sorter card already injected'); return true; }
    const list = document.querySelector(SELECTORS.attentionAreasList);
    if (!list) { warn('AttentionAreasGroup-list not found'); return false; }
    const card = createWatchSorterCard();
    list.appendChild(card);
    if (!document.getElementById(IDS.cptCard)) {
      const cptCard = createCptAuditCard();
      list.appendChild(cptCard);
    }
          if (!document.getElementById(IDS.vastCard)) {
      const vastCard = createVastCard();
      list.appendChild(vastCard);
    }
    log(`Watch Sorter card injected by ${SCRIPT_AUTHOR}`);
    return true;
  }

function collectFromChuteLevel(vertex, output) {
  if (!vertex || typeof vertex !== 'object') return;

  if (vertex.type === 'CHUTE') {
    const chuteMetricMap = createMetricMap(vertex.packages);
    const chuteName = String(vertex.name || '').trim();
    const chuteMetrics = {
      onSorterNow: getMetric(chuteMetricMap, 'POST_SLAM_PRE_DIVERT'),
      m15: getMetric(chuteMetricMap, 'NEXT_15_MIN'),
      m30: getMetric(chuteMetricMap, 'NEXT_30_MIN'),
      m60: getMetric(chuteMetricMap, 'NEXT_60_MIN'),
      m120: getMetric(chuteMetricMap, 'STACKING_FILTERS_120_MIN'),
      m240: getMetric(chuteMetricMap, 'STACKING_FILTERS_240_MIN'),
    };
    const cptMs = getCriticalPullTimeMs(vertex.criticalPullTime);
    const edges = vertex?.destinations?.edges || [];
    for (const edge of edges) {
      const area = edge?.vertex;
      if (!area || area.type !== 'STACKING_AREA') continue;
      const stackingFilter = String(area.stackingFilter || '').trim();
      const areaName = String(area.name || '').trim();
      if (!areaName) continue;
      output.push({ stackingFilter, areaName, chuteName, metrics: chuteMetrics, cptMs });
    }
  }

  const edges = vertex?.destinations?.edges || [];
  for (const edge of edges) { collectFromChuteLevel(edge?.vertex, output); }
}

  function collectStackingAreasFromVertex(vertex, output) {
    if (!vertex || typeof vertex !== 'object') return;

    if (vertex.type === 'STACKING_AREA') {
      const metricMap = createMetricMap(vertex.packages);
      const areaName = String(vertex.name || '').trim();
      const stackingFilter = String(vertex.stackingFilter || '').trim();

      output.push({
        name: areaName,
        stackingFilter,
        mirrored: Boolean(vertex.isMirroredResource),
        cptMs: getCriticalPullTimeMs(vertex.criticalPullTime),
        metrics: {
          onSorterNow: getMetric(metricMap, 'POST_SLAM_PRE_DIVERT'),
          m15: getMetric(metricMap, 'NEXT_15_MIN'),
          m30: getMetric(metricMap, 'NEXT_30_MIN'),
          m60: getMetric(metricMap, 'NEXT_60_MIN'),
          m120: getMetric(metricMap, 'STACKING_FILTERS_120_MIN'),
          m240: getMetric(metricMap, 'STACKING_FILTERS_240_MIN'),
        },
      });
    }

    const edges = vertex?.destinations?.edges;
    if (!Array.isArray(edges)) return;
    for (const edge of edges) { if (edge?.vertex) collectStackingAreasFromVertex(edge.vertex, output); }
  }

function extractRowsFromFacilityProjectionsPayload(payload) {
  const facilityProjection =
    payload?.data?.facilityProjections ||
    payload?.facilityProjections ||
    null;

  if (!facilityProjection) {
    warn('facilityProjections not found in payload');
    return { rows: [], discoveredAreas: [] };
  }

  const topEdges = facilityProjection?.destinations?.edges;

  if (!Array.isArray(topEdges)) {
    warn('facilityProjections.destinations.edges missing');
    return { rows: [], discoveredAreas: [] };
  }

  const entries = [];

  for (const edge of topEdges) {
    if (edge?.vertex) {
      collectStackingAreasFromVertex(edge.vertex, entries);
    }
  }

  log('Collected stacking-area entries from payload:', { count: entries.length });

  const discoveredAreas = [];
  const byFilter = new Map();
const metricsBySfArea = new Map();
const seenSfAreaMetricKeys = new Set();

  for (const entry of entries) {
    const areaName = String(entry?.name || entry?.areaName || '').trim();
    if (!areaName) continue;

    const stackingFilter = String(entry?.stackingFilter || '').trim();
    const sfKey = stackingFilter || `FREE__${areaName}`;

    let row = byFilter.get(sfKey);

    if (!row) {
      row = {
        stackingFilter: stackingFilter || '-',
        cptMs: entry.cptMs ?? null,
        areasCount: 0,
        areas: [],
chutes: [],
areaMetrics: [],
metrics: {
          onSorterNow: 0,
          m15: 0,
          m30: 0,
          m60: 0,
          m120: 0,
          m240: 0,
        },
      };

      byFilter.set(sfKey, row);
    }

    if (!row.areas.includes(areaName)) {
      row.areas.push(areaName);
    }

    discoveredAreas.push({
      name: areaName,
      type: inferAreaType(areaName),
      sortKey: inferAreaSortKey(areaName),
      mirrored: Boolean(entry?.mirrored),
    });

    if (!row.cptMs && entry?.cptMs) {
      row.cptMs = entry.cptMs;
    }

const incomingMetrics = {
  onSorterNow: Number(entry?.metrics?.onSorterNow || 0),
  m15: Number(entry?.metrics?.m15 || 0),
  m30: Number(entry?.metrics?.m30 || 0),
  m60: Number(entry?.metrics?.m60 || 0),
  m120: Number(entry?.metrics?.m120 || 0),
  m240: Number(entry?.metrics?.m240 || 0),
};

const metricSignature = [
  incomingMetrics.onSorterNow,
  incomingMetrics.m15,
  incomingMetrics.m30,
  incomingMetrics.m60,
  incomingMetrics.m120,
  incomingMetrics.m240,
].join('|');

const dedupeKey = `${sfKey}||${areaName}||${metricSignature}`;

if (!seenSfAreaMetricKeys.has(dedupeKey)) {
  seenSfAreaMetricKeys.add(dedupeKey);

  const sfAreaKey = `${sfKey}||${areaName}`;

  if (!metricsBySfArea.has(sfAreaKey)) {
    metricsBySfArea.set(sfAreaKey, {
      area: areaName,
      metrics: incomingMetrics,
    });
  } else {
    const current = metricsBySfArea.get(sfAreaKey).metrics;

    current.onSorterNow = Math.max(current.onSorterNow, incomingMetrics.onSorterNow);
    current.m15 = Math.max(current.m15, incomingMetrics.m15);
    current.m30 = Math.max(current.m30, incomingMetrics.m30);
    current.m60 = Math.max(current.m60, incomingMetrics.m60);
    current.m120 = Math.max(current.m120, incomingMetrics.m120);
    current.m240 = Math.max(current.m240, incomingMetrics.m240);
  }
}
  }

for (const [key, item] of metricsBySfArea.entries()) {
  const sfKey = key.split('||')[0];
  const row = byFilter.get(sfKey);
  if (!row) continue;

  row.areaMetrics.push({
    area: item.area,
    metrics: item.metrics,
  });
}

  const rows = Array.from(byFilter.values()).map(row => {
    row.areas.sort((a, b) => inferAreaSortKey(a).localeCompare(inferAreaSortKey(b)));
    row.chutes = Array.isArray(row.chutes)
      ? row.chutes.sort((a, b) => String(a).localeCompare(String(b)))
      : [];
row.areaMetrics.sort((a, b) =>
  inferAreaSortKey(a.area).localeCompare(inferAreaSortKey(b.area))
);


      const metricKeys = ['onSorterNow', 'm15', 'm30', 'm60', 'm120', 'm240'];

row.metrics = {
  onSorterNow: 0,
  m15: 0,
  m30: 0,
  m60: 0,
  m120: 0,
  m240: 0,
};

for (const key of metricKeys) {
  const values = row.areaMetrics
    .map(item => Number(item?.metrics?.[key] || 0))
    .filter(value => value > 0);

  row.metrics[key] = values.length ? Math.min(...values) : 0;
}

row.areasCount = row.areas.length;
return row;

  }).sort((a, b) => a.stackingFilter.localeCompare(b.stackingFilter));

  log('Built rows from live payload:', { filters: rows.length, entries: entries.length });

  return { rows, discoveredAreas };
}

  function handleFacilityProjectionsPayload(payload, meta = {}) {
    try {
      const { rows, discoveredAreas } = extractRowsFromFacilityProjectionsPayload(payload);
      state.rows = rows;
      state.seriesButtons = extractSeriesButtonsFromRows(rows);
      refreshSeriesBar();
      state.lastLiveUpdateAt = Date.now();
      state.lastLiveNodeId = String(meta.nodeId || state.route.facility || '');
      state.latestRawPayload = payload;

if (!state.noResources.vistaLoading) refreshNoResourcesVistaData();
refreshOutboundData();
refreshVistaStackedForCptAudit();
      mergeAreasIntoStructureMap(discoveredAreas);

      if (state.overlayOpen) {
refreshTableHeaders();
refreshSeriesBar();
refreshReadinessBar();
refreshNextCptBar();
refreshMirrorNeededBar();
applySearch(state.searchQuery || '');
renderOperationalSummary();
renderAdditionalAreaNeededBlock();
renderReadySeriesBlock();
renderSorterSummaryBar();
renderSorterRows();
      }
      if (state.cptAudit.overlayOpen) renderCptAudit();

      setStatus(`live update ${rows.length} filters`);
    } catch (err) {
      error('Failed to handle facility projections payload', err);
      setStatus('live parse failed');
    }
  }

function handleLoosePackagesPayload(payload) {
  try {
    const rows = extractNoResourceRowsFromPayload(payload);
state.noResources.rows = attachVinyaasLaneToNoResourceRows(
  buildUnifiedNoResourceRows(rows, state.noResources.vistaSummaryByFilter)
);

console.log('No Resources rows after Vista lane attach', {
  total: state.noResources.rows.length,
  withLaneVista: state.noResources.rows.filter(r => (r?.laneVista || '-') !== '-').length,
  sample: state.noResources.rows.slice(0, 15).map(r => ({
    stackingFilter: r?.stackingFilter || '',
    lane: r?.lane || '-',
    laneVista: r?.laneVista || '-',
  })),
});

    if (state.overlayOpen) {
      if (state.activeRecirculationTab === 'noResources') applyNoResourceSearch(state.noResources.searchQuery || '');
      renderNoResourceSummaryBar();
      renderOperationalSummary();
    }
    setNoResourceStatus(`live update ${state.noResources.rows.length} rows`);
  } catch (err) {
    error('Failed to handle loose packages payload', err);
    setNoResourceStatus('live parse failed');
  }
}

  function safeJsonParse(text) {
    try { return JSON.parse(text); } catch { return null; }
  }

    function gmRequest(details) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: details.method || 'GET',
      url: details.url,
      headers: details.headers || {},
      data: details.data || null,
      timeout: details.timeout || 30000,
      onload: (response) => resolve(response),
      onerror: (err) => reject(err),
      ontimeout: () => reject(new Error(`Request timeout: ${details.url}`)),
      onabort: () => reject(new Error(`Request aborted: ${details.url}`)),
    });
  });
}

function normalizeStackingFilter(value) {
  return String(value || '').trim().replace(/-MERGE$/i, '');
}

function normalizeVistaLaneSf(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/-MERGE$/i, '')
    .replace(/-ALL$/i, '')
    .replace(/-F-VCRI$/i, '');
}

function getVistaLaneForStackingFilter(stackingFilter) {
  const normalized = normalizeVistaLaneSf(stackingFilter);
  if (!normalized) return '-';
  return state.noResources.vistaLaneByFilter?.[normalized] || '-';
}

function getVistaCptForLane(lane) {
  if (!lane) return null;
  return state.noResources.vistaLaneToCpt?.[lane] || null;
}

function getHrzCptForLane(lane) {
  const rawLane = String(lane || '').trim();
  if (!rawLane) return null;

  const map = state.noResources.hrzLaneToCpt || {};

  // 1) exact match
  if (map[rawLane]) {
    return map[rawLane];
  }

  const upperLane = rawLane.toUpperCase();

  // 2) Mannheim exception:
  // if row lane contains MANNHEIM, any HRZ lane containing MANNHEIM is acceptable.
  if (upperLane.includes('MANNHEIM')) {
    let bestMs = 0;
    for (const [hrzLane, cptMs] of Object.entries(map)) {
      if (!String(hrzLane || '').toUpperCase().includes('MANNHEIM')) continue;
      const num = Number(cptMs || 0);
      if (!Number.isFinite(num) || num <= 0) continue;
      if (!bestMs || num < bestMs) bestMs = num;
    }
    if (bestMs > 0) return bestMs;
  }

  // 3) DR suffix exception:
  // SCN2->LH-DTM9 should match SCN2->LH-DTM9-DR1 / -DR2
  // SCN2->LH-CDG8 should match SCN2->LH-CDG8-DR1 / -DR2
  const drBase = upperLane.replace(/-DR\d+$/i, '');
  let bestDrMs = 0;

  for (const [hrzLane, cptMs] of Object.entries(map)) {
    const hrzUpper = String(hrzLane || '').trim().toUpperCase();
    const hrzBase = hrzUpper.replace(/-DR\d+$/i, '');
    if (hrzBase !== drBase) continue;

    const num = Number(cptMs || 0);
    if (!Number.isFinite(num) || num <= 0) continue;
    if (!bestDrMs || num < bestDrMs) bestDrMs = num;
  }

  if (bestDrMs > 0) {
    return bestDrMs;
  }

  return null;
}

    function getJackpotCptForLane(lane) {
  if (!lane) return null;
  return state.noResources.jackpotLaneToCpt?.[lane] || null;
}

    function getVistaCptTextForRow(row) {
  const lane = row?.laneVista || getVistaLaneForStackingFilter(row?.stackingFilter);
  const ms = Number(getVistaCptForLane(lane) || 0);
  return ms > 0 ? formatCpt(ms) : '-';
}

function getHrzCptTextForRow(row) {
  const lane =
    row?.laneVista ||
    row?.lane ||
    getVistaLaneForStackingFilter(row?.stackingFilter) ||
    getLaneForStackingFilter(row?.stackingFilter);

  const ms = Number(getHrzCptForLane(lane) || 0);
  return ms > 0 ? formatCpt(ms) : '-';
}

    function getJackpotLaneCptTextForRow(row) {
  const lane =
    row?.laneVista ||
    row?.lane ||
    getVistaLaneForStackingFilter(row?.stackingFilter) ||
    getLaneForStackingFilter(row?.stackingFilter);

  const ms = Number(getJackpotCptForLane(lane) || 0);
  return ms > 0 ? formatCpt(ms) : '-';
}

function getEffectiveCpt(row) {
  const lane =
    row?.laneVista ||
    row?.lane ||
    getVistaLaneForStackingFilter(row?.stackingFilter) ||
    getLaneForStackingFilter(row?.stackingFilter);

  const hrzCptMs = Number(getHrzCptForLane(lane) || 0);
  if (Number.isFinite(hrzCptMs) && hrzCptMs > 0) {
    return hrzCptMs;
  }

  const jackpotLaneCptMs = Number(getJackpotCptForLane(lane) || 0);
  if (Number.isFinite(jackpotLaneCptMs) && jackpotLaneCptMs > 0) {
    return jackpotLaneCptMs;
  }

  return 0;
}

    function isFallbackVistaCpt(row) {
  const directCptMs = Number(row?.cptMs || 0);
  if (Number.isFinite(directCptMs) && directCptMs > 0) return false;

  const laneVista = row?.laneVista || getVistaLaneForStackingFilter(row?.stackingFilter);
  const fallbackCptMs = Number(getVistaCptForLane(laneVista) || 0);

  return Number.isFinite(fallbackCptMs) && fallbackCptMs > 0;
}

function extractVistaLaneAndCptMaps(data) {
  const routeMap =
    data?.ret?.getOutboundDetailsOutput?.routeDispatchDetailMap ||
    data?.getOutboundDetailsOutput?.routeDispatchDetailMap ||
    data?.routeDispatchDetailMap ||
    {};

  const sfToLane = Object.create(null);
  const laneToCpt = Object.create(null);

  for (const [laneKey, laneItem] of Object.entries(routeMap)) {
    const lane = String(laneItem?.lane || laneKey || '').trim();
    const allSfs = Array.isArray(laneItem?.allSfs) ? laneItem.allSfs : [];

    const nextCpt = laneItem?.nextCpt;

    if (lane && nextCpt) {
      laneToCpt[lane] = Number(nextCpt);
    }

    for (const sf of allSfs) {
      const normalized = normalizeVistaLaneSf(sf);
      if (!normalized) continue;

      if (!sfToLane[normalized]) {
        sfToLane[normalized] = lane;
      }
    }
  }

  console.log('Vista lane+cpt map', {
    sfMapped: Object.keys(sfToLane).length,
    lanesWithCpt: Object.keys(laneToCpt).length,
  });

  return { sfToLane, laneToCpt };
}

    function extractVistaStackedRows(data) {
  const rawRows =
    data?.ret?.getContainersDetailByCriteriaOutput?.containerDetails?.[0]?.containerDetails || [];

  return rawRows
    .map(item => {
      const cptMs = Number(item?.cpt || 0);
      const childCount = Number(item?.childCount || 0);
      const stackingFilter = String(item?.stackingFilter || '').trim();
      const containerId = String(item?.id || '').trim();
      const location = String(item?.location || '').trim();
      const isClosed = Boolean(item?.isClosed ?? item?.closed);
      const locationType = String(item?.locationType || '').trim();
      const containerType = String(item?.type || item?.containerType || '').trim();
if (
  stackingFilter === 'LH-HAJ8-AMZL-DHH2-XD' ||
  location === 'Box-201-B'
) {
  debugVistaMatch({
    stage: 'extractVistaStackedRows:raw-item',
    containerId,
    stackingFilter,
    location,
    childCount,
    cptMs,
    isClosed,
    locationType,
    rawRoute: String(item?.route || '').trim(),
    rawExpectedLocations: Array.isArray(item?.expectedLocations) ? item.expectedLocations : [],
  });
}
return {
  containerId,
  stackingFilter,
  cptMs,
  childCount,
  location,
  isClosed,
  locationType,
  containerType,
  raw: item,
};
    })
.filter(row => {
  const keepContainer = !!row.containerId;
  const keepChild = Number.isFinite(row.childCount) && row.childCount >= 0;
  const keepLocation = !!String(row.location || '').trim();

  if (!keepContainer) return false;
  if (!keepChild) return false;
  if (!keepLocation) return false;
  return true;
});
}

    function extractVistaStageRows(data) {
  const rawRows =
    data?.ret?.getContainersDetailByCriteriaOutput?.containerDetails?.[0]?.containerDetails || [];

  return rawRows
    .map(item => {
return {
  containerId: String(item?.id || '').trim() || '-',
  location: String(item?.location || '').trim() || '-',
  contentCount: Number(item?.childCount || 0),
  stackingFilter: String(item?.stackingFilter || '').trim() || '-',
  dwellTimeMinutes: Number(item?.dwellTimeInMinutes || 0),
  dwellTimeText: formatDwellTime(item?.dwellTimeInMinutes),
  route: String(item?.route || '').trim() || '-',
  cptMs: Number(item?.cpt || 0),
  expectedLocations: Array.isArray(item?.expectedLocations) ? item.expectedLocations : [],
  isClosed: Boolean(item?.isClosed ?? item?.closed),
  raw: item,
};
    })
    .filter(row => row.containerId !== '-');
}

    function extractVistaLoadedRows(data) {
  const rawRows =
    data?.ret?.getContainersDetailByCriteriaOutput?.containerDetails?.[0]?.containerDetails || [];

  return rawRows
    .map(item => {
      return {
        containerId: String(item?.id || '').trim() || '-',
        parentContainerId: String(item?.parentContainerId || '').trim() || '-',
        location: String(item?.location || '').trim() || '-',
        contentCount: Number(item?.childCount || 0),
        stackingFilter: String(item?.stackingFilter || '').trim() || '-',
        dwellTimeMinutes: Number(item?.dwellTimeInMinutes || 0),
        dwellTimeText: formatDwellTime(item?.dwellTimeInMinutes),
        route: String(item?.route || '').trim() || '-',
        cptMs: Number(item?.cpt || 0),
        isClosed: Boolean(item?.isClosed ?? item?.closed),
        raw: item,
      };
    })
    .filter(row => row.containerId !== '-');
}

    function normalizeExpectedAt(value) {
  return String(value || '').trim().replace(/^Zone-/i, '');
}

    function parseHrzCptTime(value) {
  const text = String(value || '').trim();
  const m = text.match(/^(\d{2})-([A-Za-z]{3})-(\d{2}) (\d{2}):(\d{2})$/);
  if (!m) return 0;

  const [, dd, monText, yy, hh, mm] = m;
  const months = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };

  const mon = months[monText];
  if (mon == null) return 0;

  const year = 2000 + Number(yy);
  const dt = new Date(year, mon, Number(dd), Number(hh), Number(mm), 0, 0);
  const ms = dt.getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function formatVistaCpt(ms) {
  const num = Number(ms || 0);
  if (!Number.isFinite(num) || num <= 0) return '';
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date(num));
  } catch { return String(num); }
}

function inferNoResourceAreaType(areaName) {
  const value = String(areaName || '').trim().toUpperCase();
  if (value.startsWith('BOX-')) return 'BOX';
  if (value.startsWith('FLAT-')) return 'FLAT';
  if (value.startsWith('BG-') || value.startsWith('BAG-')) return 'BAG';
  return 'OTHER';
}

function getEligibleAreasForNoResourceRow(row) {
  const sf = String(row?.stackingFilter || '').trim().toUpperCase();
  const areas = getForesightAreasForStackingFilter(row?.stackingFilter);
  if (!areas.length) return [];
  if (sf.endsWith('-BAG')) return [...areas];
  if (sf.endsWith('-VCRI')) return areas.filter(area => { const type = inferNoResourceAreaType(area); return type === 'BOX' || type === 'FLAT'; });
  return areas.filter(area => inferNoResourceAreaType(area) === 'BOX');
}

    function getForesightAreasForStackingFilter(stackingFilter) {
  const normalizedTarget = normalizeStackingFilter(stackingFilter);
  if (!normalizedTarget) return [];
  const seen = new Set();
  const result = [];
  for (const row of state.rows || []) {
    if (isFreeWatchSorterRow(row)) continue;
    const normalizedRowSf = normalizeStackingFilter(row?.stackingFilter);
    if (normalizedRowSf !== normalizedTarget) continue;
    for (const area of Array.isArray(row?.areas) ? row.areas : []) {
      const name = String(area || '').trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);
      result.push(name);
    }
  }
  return result.sort((a, b) => inferAreaSortKey(a).localeCompare(inferAreaSortKey(b)));
}

function isNoResourceAreaValid(row) { return getEligibleAreasForNoResourceRow(row).length > 0; }

function isNoResourceCptUrgent(row) {
  const cptMs = Number(getEffectiveCpt(row) || 0);
  if (!Number.isFinite(cptMs) || cptMs <= 0) return false;
  const diffMin = (cptMs - Date.now()) / 60000;
  return diffMin >= 0 && diffMin < 120;
}

    function isNoResourceCptPassed(row) {
  const cptMs = Number(getEffectiveCpt(row) || 0);
  if (!Number.isFinite(cptMs) || cptMs <= 0) return false;
  return cptMs < Date.now();
}

function getNoResourceTotal(row) { return Number(row?.count || 0) + Number(row?.vistaCount || 0); }

   function isFreeWatchSorterRow(row) { return String(row?.stackingFilter || '').trim() === '-'; }

function getAreaTypeBucket(areaName) {
  const type = inferAreaType(areaName).toUpperCase();
  if (type === 'BOX') return 'box';
  if (type === 'FLAT') return 'flat';
  if (type === 'BG' || type === 'BAG') return 'bag';
  return 'other';
}

function createTypeBreakdown() { return { total: 0, box: 0, flat: 0, bag: 0 }; }

function addToBreakdown(target, typeKey, amount = 1) {
  const n = Number(amount || 0);
  if (!Number.isFinite(n) || n <= 0) return;
  target.total += n;
  if (typeKey === 'box') target.box += n;
  else if (typeKey === 'flat') target.flat += n;
  else if (typeKey === 'bag') target.bag += n;
}

function getPrimaryAreaTypeForRow(row) {
  const areas = Array.isArray(row?.areas) ? row.areas : [];
  if (!areas.length) return 'other';
  return getAreaTypeBucket(areas[0]);
}

function getNeededTypeFromStackingFilter(sf) {
  const value = String(sf || '').trim().toUpperCase();
  if (value.endsWith('-BAG')) return 'bag';
  if (value.endsWith('-VCRI')) return 'flat';
  return 'box';
}

function formatOpsMetaHtml(stats) {
  const safe = stats || { box: 0, flat: 0, bag: 0 };
  return `
    <div class="ws-ops-meta-item"><span>Box</span><strong>${escapeHtml(safe.box ?? 0)}</strong></div>
    <div class="ws-ops-meta-item"><span>Flat</span><strong>${escapeHtml(safe.flat ?? 0)}</strong></div>
    <div class="ws-ops-meta-item"><span>Bag</span><strong>${escapeHtml(safe.bag ?? 0)}</strong></div>
  `;
}

    function getAdditionalAreaNeedForRow(row) {
  if (isFreeWatchSorterRow(row)) return null;

  const areas = Array.isArray(row?.areas) ? row.areas : [];
  if (!areas.length) return null;

  const firstArea = String(areas[0] || '').trim();
  const type = getAreaTypeBucket(firstArea);
  const m60 = Number(row?.metrics?.m60 || 0);
  const currentAreas = Number(row?.areasCount || areas.length || 0);
///inja
  let requiredAreas = 0;
  if (type === 'box') {
    requiredAreas = Math.floor(m60 / 60);
  } else if (type === 'flat') {
    requiredAreas = Math.floor(m60 / 200);
  } else {
    return null;
  }

  const shortage = requiredAreas - currentAreas;
  if (shortage <= 0) return null;

  return {
    type,
    stackingFilter: String(row?.stackingFilter || '').trim(),
    currentAreas,
    requiredAreas,
    shortage,
    m60,
    areaLabel: firstArea,
areaLabels: areas.map(area => String(area || '').trim()).filter(Boolean),
  };
}

function getAdditionalAreaNeededRows() {
  const result = [];

  for (const row of state.rows || []) {
    const need = getAdditionalAreaNeedForRow(row);
    if (!need) continue;

    // Important:
    // Additional Areas Needed must always be calculated from ALL WatchSorter rows.
    // Do not apply search, series, readiness, next CPT, or mirror-needed filters here.
    result.push(need);
  }

  return result.sort((a, b) => {
    if (b.shortage !== a.shortage) return b.shortage - a.shortage;
    if (b.m60 !== a.m60) return b.m60 - a.m60;
    return a.stackingFilter.localeCompare(b.stackingFilter);
  });
}

function getAdditionalAreaNeededCounts() {
  const rows = getAdditionalAreaNeededRows();

  return rows.reduce((acc, item) => {
    acc.rows += 1;
    acc.areas += item.shortage;

    if (item.type === 'box') acc.box += item.shortage;
    else if (item.type === 'flat') acc.flat += item.shortage;

    return acc;
  }, {
    rows: 0,
    areas: 0,
    box: 0,
    flat: 0,
    bag: 0,
  });
}

   function normalizeWatchSorterContainerType(value) {
  const text = String(value || '').trim().toUpperCase();

  if (!text || text === '-') return '';

  if (text.includes('CART')) return 'CART';
  if (text.includes('BAG')) return 'BAG';
  if (text.includes('GAYLORD')) return 'GAYLORD';
  if (text.includes('PALLET')) return 'PALLET';
  if (text.includes('AMPAL')) return 'AMPAL';

  return text;
}

function getAllowedOutputContainerTypesForSf(sf) {
  const key = normalizeVinyaasKey(sf);
  const row = state.vinyaasConfig?.bySf?.get(key);

  const raw = String(row?.outputContainerTypes || '').trim();
  if (!raw || raw === '--' || raw === '-') return [];

  return raw
    .split(',')
    .map(x => normalizeWatchSorterContainerType(x))
    .filter(Boolean);
}

function getVinyaasParentFiltersForSf(sf) {
  const key = normalizeVinyaasKey(sf);
  if (!key) return [];

  const parents = state.vinyaasConfig?.parentFiltersBySf?.get(key);
  return Array.isArray(parents) ? parents : [];
}

function isWatchSorterSingleDestinationBagSf(sf) {
  const sfText = String(sf || '').trim().toUpperCase();
  if (!sfText.endsWith('-BAG')) return false;

  const parents = getVinyaasParentFiltersForSf(sfText);
  return parents.length === 1;
}

function isWatchSorterContainerTypeAllowed(actualType, allowedTypes, sf) {
  const actual = normalizeWatchSorterContainerType(actualType);
  const allowed = Array.isArray(allowedTypes) ? allowedTypes : [];
  const sfText = String(sf || '').toUpperCase();

  if (!actual || !allowed.length) return true;

  if (isWatchSorterSingleDestinationBagSf(sfText)) {
    return actual === 'BAG';
  }

  if (sfText.includes('AMZL') && actual === 'AMPAL') {
    return true;
  }

  if (
    (allowed.includes('CART') || allowed.includes('AMPAL')) &&
    (actual === 'PALLET' || actual === 'GAYLORD')
  ) {
    return true;
  }

  if (
    (allowed.includes('PALLET') || allowed.includes('GAYLORD')) &&
    (actual === 'PALLET' || actual === 'GAYLORD')
  ) {
    return true;
  }

  return allowed.includes(actual);
}

function getWrongAllocationRows() {
  const result = [];
  const seen = new Set();

  const rows = Array.isArray(state.stackedVista?.rows) ? state.stackedVista.rows : [];

  for (const item of rows) {
    const containerId = String(item?.containerId || '').trim();
    const area = String(item?.location || '').trim();
    const sf = String(item?.stackingFilter || '').trim();
    const actualType = normalizeWatchSorterContainerType(item?.containerType || item?.type || item?.raw?.type);

    if (!containerId || !area || !sf || !actualType) continue;
    if (area.toUpperCase() === 'VAST_TRANSIT') continue;
    if (item?.isClosed) continue;

    const allowedTypes = getAllowedOutputContainerTypesForSf(sf);
    if (!allowedTypes.length) continue;

    if (isWatchSorterContainerTypeAllowed(actualType, allowedTypes, sf)) continue;

    const key = `${containerId}||${area}||${sf}`;
    if (seen.has(key)) continue;
    seen.add(key);

    result.push({
      containerId,
      area,
      stackingFilter: sf,
      actualType,
      allowedTypes,
      childCount: Number(item?.childCount || 0),
    });
  }

  return result.sort((a, b) => {
    if (a.area !== b.area) {
      return inferAreaSortKey(a.area).localeCompare(inferAreaSortKey(b.area));
    }
    return a.stackingFilter.localeCompare(b.stackingFilter);
  });
}

function formatWrongAllocationPill(item) {
  return `
    <span class="ws-additional-needed-pill">
      <span>${renderAreaLink(item.area, 'ws-area-link')}</span>

      <span class="ws-pill-sep">•</span>

      <span>${escapeHtml(item.containerId)}</span>

      <span class="ws-pill-sep">•</span>

      <span class="ws-pill-sf">${escapeHtml(item.stackingFilter)}</span>

      <button
        type="button"
        class="ws-pill-copy-link"
        data-copy="${escapeHtml(item.stackingFilter)}"
      >
        Copy
      </button>

      <span class="ws-pill-sep">•</span>

      <span>
        Opened <strong>${escapeHtml(item.actualType)}</strong>
        but allowed:
        <strong>${escapeHtml(item.allowedTypes.join(', '))}</strong>
      </span>

      <span class="ws-pill-sep">•</span>

      <span>${escapeHtml(item.childCount)} Pkgs</span>
    </span>
  `;
}

function renderWrongAllocationBlock() {
  const body = document.getElementById('ws-wrong-allocation-body');
  if (!body) return;

  const rows = getWrongAllocationRows();

  if (!rows.length) {
    body.innerHTML = `<div class="ws-ready-series-empty">No wrong allocation found</div>`;
    return;
  }

  body.innerHTML = rows.map(item => formatWrongAllocationPill(item)).join('');
}

function formatAdditionalAreaNeededPill(item) {
  const typeLabel = Array.isArray(item.areaLabels) && item.areaLabels.length
    ? item.areaLabels.join(', ')
    : (
        String(item.areaLabel || '').trim() ||
        (item.type === 'box' ? 'Box' :
         item.type === 'flat' ? 'Flat' :
         'Other')
      );

  const areaWord = item.shortage === 1 ? 'Area' : 'Areas';

  const actionKey = `requestAllocate:${String(item.stackingFilter || '').trim()}`;
  const busy = isStemBusy();
  const current = isCurrentStemAction(actionKey);

  return `
    <span class="ws-additional-needed-pill">
      <span>${escapeHtml(typeLabel)}</span>
      <span class="ws-pill-sep">•</span>

      <span class="ws-pill-sf">${escapeHtml(item.stackingFilter)}</span>

      <button
        type="button"
        class="ws-pill-copy-link"
        data-copy="${escapeHtml(item.stackingFilter)}"
      >
        Copy
      </button>

      <span class="ws-pill-sep">•</span>

      <span>
        Need <strong>${escapeHtml(item.shortage)}</strong> ${escapeHtml(areaWord)}
      </span>

      <span class="ws-pill-sep">•</span>

      <span>${escapeHtml(item.m60)} Pkgs</span>

      <button
        type="button"
        class="ws-pill-copy-link ws-additional-allocate-link"
        data-additional-allocate-sf="${escapeHtml(item.stackingFilter)}"
        ${busy ? 'disabled' : ''}
        style="${busy ? 'color:#879596; cursor:not-allowed; pointer-events:none;' : ''}"
      >
        ${current ? 'In progress...' : 'Allocate'}
      </button>
    </span>
  `;
}

function renderAdditionalAreaNeededBlock() {
  const body = document.getElementById('ws-additional-needed-body');
  if (!body) return;

  const rows = getAdditionalAreaNeededRows();

  if (!rows.length) {
    body.innerHTML = `<div class="ws-ready-series-empty">No additional areas needed</div>`;
    return;
  }

  body.innerHTML = rows.map(item => formatAdditionalAreaNeededPill(item)).join('');
      body.querySelectorAll('[data-additional-allocate-sf]').forEach(btn => {
    btn.addEventListener('click', async event => {
      event.preventDefault();
      event.stopPropagation();

      const sf = String(btn.getAttribute('data-additional-allocate-sf') || '').trim();
      if (!sf) return;

      state.stemAction.area = '';
      state.stemAction.stackingFilter = sf;

installStemLogListener();
await handleStemAction('requestAllocate');
    });
  });
}

function getOperationalSummaryCounts() {
  const freeAreas = createTypeBreakdown();
  const mirroredAreas = createTypeBreakdown();
  const neededAreas = createTypeBreakdown();
  const deallocateReady = createTypeBreakdown();
  const wrongAllocation = createTypeBreakdown();

  for (const row of state.rows || []) {
    const areas = Array.isArray(row?.areas) ? row.areas : [];
    const primaryType = getPrimaryAreaTypeForRow(row);
    if (isFreeWatchSorterRow(row)) { for (const area of areas) addToBreakdown(freeAreas, getAreaTypeBucket(area), 1); continue; }
    if (areas.length > 1) addToBreakdown(mirroredAreas, primaryType, areas.length - 1);
    if (getRowReadiness(row) === 'ready') { for (const area of areas) addToBreakdown(deallocateReady, getAreaTypeBucket(area), 1); }
  }

for (const row of state.noResources.rows || []) {
  if (isNoResourceAreaValid(row)) continue;
  const totalPkgs = getNoResourceTotal(row);
  if (totalPkgs <= 5) continue;
  addToBreakdown(neededAreas, getNeededTypeFromStackingFilter(row?.stackingFilter), 1);
}

for (const row of state.rows || []) {
  const need = getAdditionalAreaNeedForRow(row);
  if (!need) continue;

  addToBreakdown(neededAreas, need.type, need.shortage);
}

return { freeAreas, mirroredAreas, neededAreas, deallocateReady, wrongAllocation };
}

    function formatWatchCompactSummaryPill(title, stats) {
  const safe = stats || { box: 0, flat: 0, bag: 0 };

  return `
    <div class="ws-watch-compact-pill">
      <div class="ws-watch-compact-title">${escapeHtml(title)}</div>
      <div class="ws-watch-compact-types">
        <div class="ws-watch-compact-type"><span>Box</span><strong>${escapeHtml(safe.box ?? 0)}</strong></div>
        <div class="ws-watch-compact-type"><span>Flat</span><strong>${escapeHtml(safe.flat ?? 0)}</strong></div>
        <div class="ws-watch-compact-type"><span>Bag</span><strong>${escapeHtml(safe.bag ?? 0)}</strong></div>
      </div>
    </div>
  `;
}

function renderWatchCompactSummary() {
  const el = document.getElementById(IDS.watchCompactSummary);
  if (!el) return;

  const counts = getOperationalSummaryCounts();

  el.innerHTML = [
    formatWatchCompactSummaryPill('Free Areas', counts.freeAreas),
    formatWatchCompactSummaryPill('Mirrored Areas', counts.mirroredAreas),
    formatWatchCompactSummaryPill('Needed Areas', counts.neededAreas),
    formatWatchCompactSummaryPill('Deallocate Ready', counts.deallocateReady),
  ].join('');
}

function renderOperationalSummary() {
  const summary = document.getElementById(IDS.opsSummary);
  if (!summary) return;
  const counts = getOperationalSummaryCounts();
  const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = String(value); };
  const setMeta = (id, stats) => { const el = document.getElementById(id); if (el) el.innerHTML = formatOpsMetaHtml(stats); };
  setText(IDS.opsFreeAreasValue, counts.freeAreas.total);
  setMeta(IDS.opsFreeAreasMeta, counts.freeAreas);
  setText(IDS.opsMirroredAreasValue, counts.mirroredAreas.total);
  setMeta(IDS.opsMirroredAreasMeta, counts.mirroredAreas);
  setText(IDS.opsNeededAreasValue, counts.neededAreas.total);
  setMeta(IDS.opsNeededAreasMeta, counts.neededAreas);
  setText(IDS.opsDeallocateReadyValue, counts.deallocateReady.total);
  setMeta(IDS.opsDeallocateReadyMeta, counts.deallocateReady);
  setText(IDS.opsWrongAllocationValue, counts.wrongAllocation.total);
  setMeta(IDS.opsWrongAllocationMeta, counts.wrongAllocation);

  renderWatchCompactSummary();
}

    function setSorterStatus(text) {
  const el = document.getElementById(IDS.sorterStatusText);
  if (el) el.textContent = `Status: ${text}`;
}

function getSorterThresholdsByArea(areaName) {
  const type = getAreaTypeBucket(areaName);
  if (type === 'flat') return { greenMax: 35, orangeMax: 50 };
  if (type === 'box') return { greenMax: 25, orangeMax: 40 };
  if (type === 'bag') return { greenMax: 10, orangeMax: 20 };
  return { greenMax: 25, orangeMax: 40 };
}

function getSorterAlertColor(areaName, count) {
  const safeCount = Number(count || 0);
  const { greenMax, orangeMax } = getSorterThresholdsByArea(areaName);
  if (safeCount <= greenMax) return 'green';
  if (safeCount <= orangeMax) return 'orange';
  return 'red';
}

function getSorterLitSegments(areaName, count) {
  const safeCount = Math.max(0, Number(count || 0));
  const { greenMax, orangeMax } = getSorterThresholdsByArea(areaName);
  const greenCapacity = Math.max(greenMax, 1);
  const orangeCapacity = Math.max(orangeMax - greenMax, 1);
  const greenValue = Math.min(safeCount, greenMax);
  const orangeValue = Math.min(Math.max(safeCount - greenMax, 0), orangeMax - greenMax);
  const redValue = Math.max(safeCount - orangeMax, 0);
  const greenLit = Math.max(0, Math.min(30, Math.ceil((greenValue / greenCapacity) * 30)));
  const orangeLit = Math.max(0, Math.min(10, Math.ceil((orangeValue / orangeCapacity) * 10)));
  const redLit = Math.max(0, Math.min(4, redValue > 0 ? Math.ceil((Math.min(redValue, 4) / 4) * 4) : 0));
  return { greenLit, orangeLit, redLit };
}

function buildSorterTabRows() {
  const result = [];
  const query = normalizeText(state.sorterSearchQuery || '');

  for (const row of state.rows || []) {
    if (isFreeWatchSorterRow(row)) continue;
    const onSorterNow = Number(row?.metrics?.onSorterNow || 0);
    if (onSorterNow <= 10) continue;
    const sf = String(row?.stackingFilter || '').trim();
    const areas = Array.isArray(row?.areas) ? row.areas : [];

    for (const area of areas) {
      const areaName = String(area || '').trim();
      if (!areaName) continue;
      const chutes = getSorterChutesForArea(areaName, sf);
      const haystack = [areaName, sf, ...chutes].join(' ').toLowerCase();
      if (query && !haystack.includes(query)) continue;
      result.push({
        area: areaName, stackingFilter: sf, chutes, cptMs: row?.cptMs ?? null, onSorterNow,
        color: getSorterAlertColor(areaName, onSorterNow),
        segments: getSorterLitSegments(areaName, onSorterNow),
      });
    }
  }

  return result.sort((a, b) => {
    const rank = { red: 3, orange: 2, green: 1 };
    const aSev = Number(rank[a.color] || 0);
    const bSev = Number(rank[b.color] || 0);
    if (bSev !== aSev) return bSev - aSev;
    if (b.onSorterNow !== a.onSorterNow) return b.onSorterNow - a.onSorterNow;
    return inferAreaSortKey(a.area).localeCompare(inferAreaSortKey(b.area));
  });
}


function buildSorterSummaryTotals() {
  const totals = {
    flat: 0,
    box: 0,
    bag: 0,
    total: 0,
  };

for (const row of state.rows || []) {
  if (isFreeWatchSorterRow(row)) continue;

  const onSorterNow = Number(row?.metrics?.onSorterNow || 0);
  if (onSorterNow <= 6) continue;
    const areas = Array.isArray(row?.areas) ? row.areas : [];
    if (!areas.length) continue;

    const firstArea = String(areas[0] || '').trim();
    const type = getAreaTypeBucket(firstArea);

    if (type === 'flat') totals.flat += onSorterNow;
    else if (type === 'box') totals.box += onSorterNow;
    else if (type === 'bag') totals.bag += onSorterNow;

    totals.total += onSorterNow;
  }

  return totals;
}

function formatSorterSummaryPillHtml(title, value) {
  return `
    <div class="ws-sorter-summary-title">${escapeHtml(title)}</div>
    <div class="ws-sorter-summary-metrics">
      <div class="ws-sorter-summary-metric">
        <span class="ws-sorter-summary-metric-value">${escapeHtml(value)}</span>
        <span class="ws-sorter-summary-metric-label">Pkgs</span>
      </div>
    </div>
  `;
}

function renderSorterSummaryBar() {
  const el = document.getElementById(IDS.sorterSummaryBar);
  if (!el) return;

  const totals = buildSorterSummaryTotals();

  el.innerHTML = `
    <div class="ws-sorter-summary-pill">
      ${formatSorterSummaryPillHtml('Flat', totals.flat)}
    </div>
    <div class="ws-sorter-summary-pill">
      ${formatSorterSummaryPillHtml('Box', totals.box)}
    </div>
    <div class="ws-sorter-summary-pill">
      ${formatSorterSummaryPillHtml('Bag', totals.bag)}
    </div>
    <div class="ws-sorter-summary-pill">
      ${formatSorterSummaryPillHtml('On Sorter', totals.total)}
    </div>
  `;
}

    function getSorterChutesForArea(areaName, stackingFilter) {
  const targetArea = String(areaName || '').trim();
  const targetSf = normalizeStackingFilter(stackingFilter);
  if (!targetArea || !targetSf) return [];
  const seen = new Set();
  const result = [];
  const payload = state.latestRawPayload?.data?.facilityProjections || state.latestRawPayload?.facilityProjections || null;
  const topEdges = payload?.destinations?.edges || [];

  function walk(vertex) {
    if (!vertex || typeof vertex !== 'object') return;
    if (vertex.type === 'CHUTE') {
      const chuteName = String(vertex.name || '').trim();
      const edges = vertex?.destinations?.edges || [];
      for (const edge of edges) {
        const area = edge?.vertex;
        if (!area || area.type !== 'STACKING_AREA') continue;
        if (String(area?.name || '').trim() !== targetArea) continue;
        if (normalizeStackingFilter(area?.stackingFilter) !== targetSf) continue;
        if (chuteName && !seen.has(chuteName)) { seen.add(chuteName); result.push(chuteName); }
      }
    }
    const edges = vertex?.destinations?.edges || [];
    for (const edge of edges) walk(edge?.vertex);
  }

  for (const edge of topEdges) walk(edge?.vertex);
  return result.sort((a, b) => String(a).localeCompare(String(b)));
}

function renderSorterBar(segments) {
  const greenLit = Number(segments?.greenLit || 0);
  const orangeLit = Number(segments?.orangeLit || 0);
  const redLit = Number(segments?.redLit || 0);

  const greenHtml = Array.from({ length: 30 }, (_, i) => `<span class="ws-sorter-seg ws-sorter-seg-green${i < greenLit ? ' ws-sorter-seg-lit' : ''}"></span>`).join('');
  const orangeHtml = Array.from({ length: 10 }, (_, i) => `<span class="ws-sorter-seg ws-sorter-seg-orange${i < orangeLit ? ' ws-sorter-seg-lit' : ''}"></span>`).join('');
  const redHtml = Array.from({ length: 4 }, (_, i) => `<span class="ws-sorter-seg ws-sorter-seg-red${i < redLit ? ' ws-sorter-seg-lit' : ''}"></span>`).join('');

  return `${greenHtml}${orangeHtml}${redHtml}`;
}

function renderSorterRows() {
  const body = document.getElementById(IDS.sorterBody);
  if (!body) return;
  const rows = buildSorterTabRows();

  if (!rows.length) {
    body.innerHTML = `<div class="ws-empty">No sorter rows above 10 packages</div>`;
    setSorterStatus('filtered 0/0');
    return;
  }

  body.innerHTML = rows.map(row => {
    const countClass = row.color === 'red' ? 'ws-sorter-count-red' : row.color === 'orange' ? 'ws-sorter-count-orange' : 'ws-sorter-count-green';
    const chutesText = Array.isArray(row.chutes) && row.chutes.length ? row.chutes.join(', ') : '-';
    return `
      <div class="ws-sorter-row">
        <div class="ws-sorter-area">${renderAreaLink(row.area, 'ws-area-link')}</div>
        <div class="ws-sorter-sf">${escapeHtml(row.stackingFilter)}</div>
        <div class="ws-sorter-chutes">${escapeHtml(chutesText)}</div>
        <div class="ws-sorter-cpt">${escapeHtml(formatCpt(row.cptMs))}</div>
        <div class="ws-sorter-bar">${renderSorterBar(row.segments)}</div>
        <div class="ws-sorter-count ${countClass}">${escapeHtml(row.onSorterNow)}</div>
      </div>
    `;
  }).join('');

  setSorterStatus(`filtered ${rows.length} rows`);
}

function getNoResourceSortValue(row, sortKey) {
  switch (sortKey) {
    case 'stackingFilter':
      return String(row?.stackingFilter || '');
    case 'lane':
    case 'laneStem':
      return String(row?.lane || getLaneForStackingFilter(row?.stackingFilter) || '');
    case 'laneVista':
      return String(row?.laneVista || getVistaLaneForStackingFilter(row?.stackingFilter) || '');
    case 'count':
      return Number(row?.count || 0);
    case 'vistaCount':
      return Number(row?.vistaCount || 0);
    case 'total':
      return getNoResourceTotal(row);
    case 'cptVista': {
      const lane = row?.laneVista || getVistaLaneForStackingFilter(row?.stackingFilter);
      const v = Number(getVistaCptForLane(lane) || 0);
      return v > 0 ? v : Number.MAX_SAFE_INTEGER;
    }
    case 'cptHrz': {
      const lane =
        row?.laneVista ||
        row?.lane ||
        getVistaLaneForStackingFilter(row?.stackingFilter) ||
        getLaneForStackingFilter(row?.stackingFilter);
      const v = Number(getHrzCptForLane(lane) || 0);
      return v > 0 ? v : Number.MAX_SAFE_INTEGER;
    }
    case 'cptMs': {
      const v = Number(getEffectiveCpt(row) || 0);
      return v > 0 ? v : Number.MAX_SAFE_INTEGER;
    }
    case 'area':
      return getEligibleAreasForNoResourceRow(row).join(', ');
    default:
      return '';
  }
}

function sortNoResourceRows(rows) {
  const sortKey = state.noResources.sortKey || 'total';
  const sortDir = state.noResources.sortDir || 'desc';

  return [...rows].sort((a, b) => {
    const aValue = getNoResourceSortValue(a, sortKey);
    const bValue = getNoResourceSortValue(b, sortKey);
    const bothNumbers = typeof aValue === 'number' && typeof bValue === 'number' && Number.isFinite(aValue) && Number.isFinite(bValue);
    if (bothNumbers) {
      if (aValue === bValue) return String(a?.stackingFilter || '').localeCompare(String(b?.stackingFilter || ''));
      return sortDir === 'asc' ? aValue - bValue : bValue - aValue;
    }
    const cmp = String(aValue ?? '').localeCompare(String(bValue ?? ''));
    if (cmp === 0) return String(a?.stackingFilter || '').localeCompare(String(b?.stackingFilter || ''));
    return sortDir === 'asc' ? cmp : -cmp;
  });
}

function getNoResourceSortIndicator(sortKey) {
  if (state.noResources.sortKey !== sortKey) return ' ↕';
  return state.noResources.sortDir === 'asc' ? ' ▲' : ' ▼';
}

function toggleNoResourceSort(sortKey) {
  if (state.noResources.sortKey === sortKey) {
    state.noResources.sortDir = state.noResources.sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    state.noResources.sortKey = sortKey;
state.noResources.sortDir =
  sortKey === 'stackingFilter' ||
  sortKey === 'lane' ||
  sortKey === 'laneStem' ||
  sortKey === 'laneVista' ||
  sortKey === 'area'
    ? 'asc'
    : 'desc';
  }
  refreshNoResourceTableHeaders();
  applyNoResourceSearch(state.noResources.searchQuery || '');
}

function getNoResourceTableHeaderHtml() {
  return `
    <th class="ws-sortable" data-nores-sort-key="stackingFilter">Stacking Filter${getNoResourceSortIndicator('stackingFilter')}</th>
    <th class="ws-sortable" data-nores-sort-key="laneStem" style="width:170px;${getNoResHiddenColumnStyle('laneStem')}">Lane Vinyaas${getNoResourceSortIndicator('laneStem')}</th>
    <th class="ws-sortable" data-nores-sort-key="laneVista" style="width:190px;${getNoResHiddenColumnStyle('laneVista')}">Lane Vista${getNoResourceSortIndicator('laneVista')}</th>
    <th class="ws-sortable" data-nores-sort-key="count" style="width:110px;">No Resource${getNoResourceSortIndicator('count')}</th>
    <th class="ws-sortable" data-nores-sort-key="vistaCount" style="width:110px;">Jackpot${getNoResourceSortIndicator('vistaCount')}</th>
    <th class="ws-sortable" data-nores-sort-key="total" style="width:100px;">Total${getNoResourceSortIndicator('total')}</th>
    <th class="ws-sortable" data-nores-sort-key="cptVista" style="width:150px;${getNoResHiddenColumnStyle('cptVista')}">CPT Vista${getNoResourceSortIndicator('cptVista')}</th>
    <th class="ws-sortable" data-nores-sort-key="cptHrz" style="width:150px;${getNoResHiddenColumnStyle('cptHrz')}">CPT HRZ${getNoResourceSortIndicator('cptHrz')}</th>
    <th class="ws-sortable" data-nores-sort-key="cptMs" style="width:150px;">CPT Effective${getNoResourceSortIndicator('cptMs')}</th>
    <th class="ws-sortable" data-nores-sort-key="area">Area${getNoResourceSortIndicator('area')}</th>
  `;
}

function bindNoResourceSortableHeaders(root) {
  root.querySelectorAll('[data-nores-sort-key]').forEach(header => {
    header.addEventListener('click', () => {
      const sortKey = header.getAttribute('data-nores-sort-key') || '';
      if (sortKey) toggleNoResourceSort(sortKey);
    });
  });
}

function refreshNoResourceTableHeaders() {
  const overlay = document.getElementById(IDS.overlay);
  if (!overlay) return;
  const headRow = overlay.querySelector('#ws-nores-table-head-row');
  if (!headRow) return;
  headRow.innerHTML = getNoResourceTableHeaderHtml();
  bindNoResourceSortableHeaders(overlay);
}

async function fetchVistaCsrfToken() {
  const res = await gmRequest({ method: 'GET', url: VISTA_FLOWRATE_URL, headers: { 'Accept': 'text/html,application/xhtml+xml', 'Cache-Control': 'no-cache' }, timeout: 30000 });
  const html = String(res.responseText || '');
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const input = doc.querySelector('input[name="anti-csrftoken-a2z"]');
  const token = input?.value?.trim();
  if (!token) throw new Error('Vista CSRF token not found');
  return token;
}

function buildVistaPayload(facility) {
  const now = Date.now();
  const from = now - VISTA_HOURS_BACK * 60 * 60 * 1000;
  return {
    entity: 'getContainersDetailByCriteria',
    nodeId: facility,
    timeBucket: { fieldName: 'physicalLocationMoveTimestamp', startTime: from, endTime: now },
    filterBy: { state: ['Diverted'], isMissing: [false] },
    containerTypes: ['PACKAGE'],
  };
}

    function buildVistaStackedPayload(facility) {
  const now = Date.now();
  const from = now - VISTA_HOURS_BACK * 60 * 60 * 1000;

  return {
    entity: 'getContainersDetailByCriteria',
    nodeId: facility,
    timeBucket: {
      fieldName: 'physicalLocationMoveTimestamp',
      startTime: from,
      endTime: now,
    },
    filterBy: {
      state: ['Stacked'],
      isMissing: [false],
    },
    containerTypes: ['PALLET', 'GAYLORD', 'BAG', 'CART'],
    fetchCompoundContainerDetails: true,
    includeCriticalCptEnclosingContainers: false,
  };
}

    function buildVistaStagePayload(facility) {
  const now = Date.now();
  const from = now - VISTA_HOURS_BACK * 60 * 60 * 1000;

  return {
    entity: 'getContainersDetailByCriteria',
    nodeId: facility,
    timeBucket: {
      fieldName: 'physicalLocationMoveTimestamp',
      startTime: from,
      endTime: now,
    },
    filterBy: {
      state: ['Staged'],
      isMissing: [false],
    },
    containerTypes: ['PALLET', 'GAYLORD', 'BAG', 'CART'],
    fetchCompoundContainerDetails: true,
    includeCriticalCptEnclosingContainers: false,
  };
}

function buildVistaOutboundPayload(facility) {
  const now = new Date();
  const searchTime = now.getTime();

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 2);

  return {
    nodeId: facility,
    searchTime,
    startTime: start.getTime(),
    endTime: end.getTime(),
    propertyName: 'LANE_CPT_SF',
    entity: 'getOutboundDetails',
  };
}

async function fetchVistaLaneByStackingFilter() {
  if (!state.route?.facility) throw new Error('facility missing from route');

  const token = await fetchVistaCsrfToken();
  const payload = buildVistaOutboundPayload(state.route.facility);

  console.log('Vista outbound request payload', payload);

  const form =
    'anti-csrftoken-a2z=' + encodeURIComponent(token) +
    '&jsonObj=' + encodeURIComponent(JSON.stringify(payload));

  const res = await gmRequest({
    method: 'POST',
    url: VISTA_OUTBOUND_URL,
    headers: {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
      'anti-csrftoken-a2z': token,
    },
    data: form,
    timeout: 30000,
  });

  const data = JSON.parse(res.responseText || '{}');
  console.log('Vista outbound raw response', data);
  console.log('Vista outbound response ok/path', {
    ok: data?.ok,
    hasRet: !!data?.ret,
    hasOutput: !!data?.ret?.getOutboundDetailsOutput,
    routeMapKeys: Object.keys(data?.ret?.getOutboundDetailsOutput?.routeDispatchDetailMap || {}).length,
  });

const maps = extractVistaLaneAndCptMaps(data);

console.log('Vista outbound lane map', {
  sfCount: Object.keys(maps.sfToLane || {}).length,
  cptLaneCount: Object.keys(maps.laneToCpt || {}).length,
  sample: Object.entries(maps.sfToLane || {}).slice(0, 20)
});

return maps;
}

    async function fetchVistaStackedData() {
  if (!state.route?.facility) throw new Error('facility missing from route');

  const token = await fetchVistaCsrfToken();
  const payload = buildVistaStackedPayload(state.route.facility);

  const form =
    'anti-csrftoken-a2z=' + encodeURIComponent(token) +
    '&jsonObj=' + encodeURIComponent(JSON.stringify(payload));

  const res = await gmRequest({
    method: 'POST',
    url: VISTA_DETAIL_URL,
    headers: {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
      'anti-csrftoken-a2z': token,
    },
    data: form,
    timeout: 30000,
  });

  const data = JSON.parse(res.responseText || '{}');
  return extractVistaStackedRows(data);
}

    async function fetchVistaStageData() {
  if (!state.route?.facility) throw new Error('facility missing from route');

  const token = await fetchVistaCsrfToken();
  const payload = buildVistaStagePayload(state.route.facility);

  const form =
    'anti-csrftoken-a2z=' + encodeURIComponent(token) +
    '&jsonObj=' + encodeURIComponent(JSON.stringify(payload));

  const res = await gmRequest({
    method: 'POST',
    url: VISTA_DETAIL_URL,
    headers: {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
      'anti-csrftoken-a2z': token,
    },
    data: form,
    timeout: 30000,
  });

  const data = JSON.parse(res.responseText || '{}');
  return extractVistaStageRows(data);
}

async function fetchVistaLoadedData() {
  if (!state.route?.facility) throw new Error('facility missing from route');

  const token = await fetchVistaCsrfToken();

  const now = Date.now();
  const from = now - VISTA_HOURS_BACK * 60 * 60 * 1000;

  const payload = {
    entity: 'getContainersDetailByCriteria',
    nodeId: state.route.facility,
    timeBucket: {
      fieldName: 'physicalLocationMoveTimestamp',
      startTime: from,
      endTime: now,
    },
    filterBy: {
      state: ['Loaded'],
      isMissing: [false],
    },
    containerTypes: ['PALLET', 'GAYLORD', 'BAG', 'CART'],
    fetchCompoundContainerDetails: true,
    includeCriticalCptEnclosingContainers: false,
  };

  const form =
    'anti-csrftoken-a2z=' + encodeURIComponent(token) +
    '&jsonObj=' + encodeURIComponent(JSON.stringify(payload));

  const res = await gmRequest({
    method: 'POST',
    url: VISTA_DETAIL_URL,
    headers: {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
      'anti-csrftoken-a2z': token,
    },
    data: form,
    timeout: 30000,
  });

  const data = JSON.parse(res.responseText || '{}');
  return extractVistaLoadedRows(data);
}

function extractHrzLaneToCptMap(data) {
  const rows = Array.isArray(data?.ret?.aaData) ? data.ret.aaData : [];
  const laneToCpt = Object.create(null);
  const now = Date.now();

  for (const row of rows) {
    const lane = String(row?.lane || '').trim();
    if (!lane) continue;

    let bestFutureMs = 0;
    const loads = Array.isArray(row?.load) ? row.load : [];

    for (const item of loads) {
      const cptText = String(item?.load?.cptTime || '').trim();
      const cptMs = parseHrzCptTime(cptText);
      if (!cptMs || cptMs <= now) continue;

      if (!bestFutureMs || cptMs < bestFutureMs) {
        bestFutureMs = cptMs;
      }
    }

    if (bestFutureMs > 0) {
      if (!laneToCpt[lane] || bestFutureMs < laneToCpt[lane]) {
        laneToCpt[lane] = bestFutureMs;
      }
    }
  }

  console.log('HRZ CPT lane map built', {
    laneCount: Object.keys(laneToCpt).length,
    sample: Object.entries(laneToCpt).slice(0, 20),
  });

  return laneToCpt;
}

    function buildJackpotLaneToCptMap(vistaSummaryByFilter) {
  const laneToCpt = Object.create(null);

  for (const [stackingFilter, item] of Object.entries(vistaSummaryByFilter || {})) {
    const cptMs = Number(item?.cptMs || 0);
    if (!Number.isFinite(cptMs) || cptMs <= 0) continue;

    const lane =
      getVistaLaneForStackingFilter(stackingFilter) ||
      getLaneForStackingFilter(stackingFilter);

    if (!lane || lane === '-') continue;

    if (!laneToCpt[lane] || cptMs < laneToCpt[lane]) {
      laneToCpt[lane] = cptMs;
    }
  }

  console.log('Jackpot lane CPT map built', {
    laneCount: Object.keys(laneToCpt).length,
    sample: Object.entries(laneToCpt).slice(0, 20),
  });

  return laneToCpt;
}

function extractVistaCountsByStackingFilter(data) {
  const rawRows = data?.ret?.getContainersDetailByCriteriaOutput?.containerDetails?.[0]?.containerDetails || [];
  const summary = Object.create(null);

  for (const row of rawRows) {
    const location = String(row?.location || '').trim();
    if (!location.startsWith('Jackpot:')) continue;
    const stackingFilter = normalizeStackingFilter(row?.stackingFilter);
    if (!stackingFilter) continue;
    if (!summary[stackingFilter]) summary[stackingFilter] = { vistaCount: 0, expectedToSet: new Set(), cptValues: [] };
    summary[stackingFilter].vistaCount += 1;
    for (const expected of Array.isArray(row?.expectedLocations) ? row.expectedLocations : []) {
      const normalized = normalizeExpectedAt(expected);
      if (normalized) summary[stackingFilter].expectedToSet.add(normalized);
    }
    const cpt = Number(row?.cpt || 0);
    if (Number.isFinite(cpt) && cpt > 0) summary[stackingFilter].cptValues.push(cpt);
  }

  const result = Object.create(null);
  for (const [stackingFilter, item] of Object.entries(summary)) {
    const cptMs = item.cptValues.length ? Math.min(...item.cptValues) : 0;
    result[stackingFilter] = {
      vistaCount: Number(item.vistaCount || 0),
      expectedTo: Array.from(item.expectedToSet).sort((a, b) => a.localeCompare(b)),
      cptMs,
      cptText: formatVistaCpt(cptMs),
    };
  }
  return result;
}

    async function fetchHrzLaneToCptMap() {
  if (!state.route?.facility) throw new Error('facility missing from route');

  const url =
    `${HRZ_CPT_URL}?entity=getCPTData` +
    `&nodeId=${encodeURIComponent(state.route.facility)}` +
    `&loadCategory=CPTS_LOADSINPROGRESS` +
    `&_=${Date.now()}`;

  const res = await gmRequest({
    method: 'GET',
    url,
    headers: {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
    },
    timeout: 30000,
  });

  const data = JSON.parse(res.responseText || '{}');

  console.log('HRZ CPT raw response', {
    hasRet: !!data?.ret,
    aaDataCount: Array.isArray(data?.ret?.aaData) ? data.ret.aaData.length : 0,
    sample: Array.isArray(data?.ret?.aaData) ? data.ret.aaData.slice(0, 3) : [],
  });

  return extractHrzLaneToCptMap(data);
}

    let hrzCache = null;
let hrzLastFetch = 0;

async function getCachedHrzLaneToCptMap() {
  const now = Date.now();

  if (hrzCache && (now - hrzLastFetch) < 60 * 60 * 1000) {
    return hrzCache;
  }

  hrzCache = await fetchHrzLaneToCptMap();
  hrzLastFetch = now;

  return hrzCache;
}

    async function fetchOutboundDockData(nodeId) {
  const res = await gmRequest({
    method: 'POST',
    url: 'https://trans-logistics-eu.amazon.com/ssp/dock/hrz/ob/fetchdata?',
    headers: {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
    },
    data: `entity=getDefaultOutboundDockView&nodeId=${encodeURIComponent(nodeId)}`,
    timeout: 30000,
  });

  return JSON.parse(res.responseText || '{}');
}

function parseOutboundDateTime(value) {
  const text = String(value || '').trim();
  const m = text.match(/^(\d{2})-([A-Za-z]{3})-(\d{2}) (\d{2}):(\d{2})$/);
  if (!m) return 0;

  const [, dd, monText, yy, hh, mm] = m;
  const months = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };

  const mon = months[monText];
  if (mon == null) return 0;

  const year = 2000 + Number(yy);
  const dt = new Date(year, mon, Number(dd), Number(hh), Number(mm), 0, 0);
  const ms = dt.getTime();
  return Number.isFinite(ms) ? ms : 0;
}

async function refreshOutboundData() {
  try {
    const nodeId = String(state?.route?.facility || '').trim();
    if (!nodeId) return;

    const raw = await fetchOutboundDockData(nodeId);
    const loads = extractOutboundLoads(raw);

    state.outbound.loads = loads;
    state.outbound.lastFetchTs = Date.now();

    console.log('Outbound loads loaded', {
      count: loads.length,
      sample: loads.slice(0, 10),
    });

    if (state.cptAudit?.overlayOpen) {
      renderCptAudit();
    }
  } catch (err) {
    error('Failed to refresh outbound data', err);
  }
}

function extractOutboundLoads(data) {
  const rows = Array.isArray(data?.ret?.aaData) ? data.ret.aaData : [];

  return rows.map(item => {
    const load = item?.load || {};
    const resources = Array.isArray(item?.resource) ? item.resource : [];

    return {
      lane: String(load?.route || '').trim(),
      sdtMs: parseOutboundDateTime(load?.scheduledDepartureTime),
      cptMs: parseOutboundDateTime(load?.criticalPullTime),
      door: String(resources?.[0]?.label || '').trim() || '-',
      vrId: String(load?.vrId || '').trim(),
      status: String(load?.status || '').trim(),
    };
  }).filter(row => row.lane);
}

async function fetchVistaCountsByStackingFilter() {
  if (!state.route?.facility) throw new Error('facility missing from route');
  const token = await fetchVistaCsrfToken();
  const payload = buildVistaPayload(state.route.facility);
  const res = await gmRequest({
    method: 'POST',
    url: VISTA_DETAIL_URL,
    headers: {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
      'anti-csrftoken-a2z': token,
    },
    data: 'jsonObj=' + JSON.stringify(payload),
    timeout: 30000,
  });
  const data = JSON.parse(res.responseText || '{}');
  return extractVistaCountsByStackingFilter(data);
}

function buildUnifiedNoResourceRows(foresightRows, vistaSummaryByFilter) {
  const map = new Map();

  for (const row of Array.isArray(foresightRows) ? foresightRows : []) {
    const normalizedFilter = normalizeStackingFilter(row?.stackingFilter);
    if (!normalizedFilter) continue;
    const vistaItem = vistaSummaryByFilter?.[normalizedFilter] || null;
map.set(normalizedFilter, {
  rawKey: row?.rawKey || normalizedFilter,
  sorterName: row?.sorterName || '',
  stackingFilter: normalizedFilter,
lane: getLaneForStackingFilter(normalizedFilter),
laneVista: getVistaLaneForStackingFilter(normalizedFilter),
count: Number(row?.count || 0),
  vistaCount: Number(vistaItem?.vistaCount || 0),
  expectedTo: Array.isArray(vistaItem?.expectedTo) ? vistaItem.expectedTo : [],
  cptMs: Number(vistaItem?.cptMs || 0),
  cptText: String(vistaItem?.cptText || ''),
});
  }

  for (const [stackingFilter, vistaItem] of Object.entries(vistaSummaryByFilter || {})) {
    const normalizedFilter = normalizeStackingFilter(stackingFilter);
    if (!normalizedFilter) continue;
    if (!map.has(normalizedFilter)) {
map.set(normalizedFilter, {
  rawKey: normalizedFilter,
  sorterName: '',
  stackingFilter: normalizedFilter,
lane: getLaneForStackingFilter(normalizedFilter),
laneVista: getVistaLaneForStackingFilter(normalizedFilter),
count: 0,
  vistaCount: Number(vistaItem?.vistaCount || 0),
  expectedTo: Array.isArray(vistaItem?.expectedTo) ? vistaItem.expectedTo : [],
  cptMs: Number(vistaItem?.cptMs || 0),
  cptText: String(vistaItem?.cptText || ''),
});
    } else {
      const existing = map.get(normalizedFilter);
      existing.vistaCount = Number(vistaItem?.vistaCount || 0);
      existing.expectedTo = Array.isArray(vistaItem?.expectedTo) ? vistaItem.expectedTo : [];
      existing.cptMs = Number(vistaItem?.cptMs || 0);
      existing.cptText = String(vistaItem?.cptText || '');
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const aMax = Math.max(Number(a.count || 0), Number(a.vistaCount || 0));
    const bMax = Math.max(Number(b.count || 0), Number(b.vistaCount || 0));
    if (bMax !== aMax) return bMax - aMax;
    return a.stackingFilter.localeCompare(b.stackingFilter);
  });
}

function setNoResourceVistaStatus(text) {
  const el = document.getElementById(IDS.noResVistaStatusText);
  if (el) el.textContent = `Vista: ${text}`;
}

async function refreshVistaStackedForCptAudit() {
  if (state.stackedVista.loading) return;

  state.stackedVista.loading = true;
  state.stackedVista.error = '';

  try {
    const rows = await fetchVistaStackedData();
      debugVistaMatch({
  stage: 'refreshVistaStackedForCptAudit:after-fetch',
  totalRows: Array.isArray(rows) ? rows.length : 0,
  targetRows: (Array.isArray(rows) ? rows : []).filter(row =>
    row?.stackingFilter === 'LH-HAJ8-AMZL-DHH2-XD' ||
    row?.location === 'Box-201-B'
  ),
});
    state.stackedVista.rows = rows;
    state.stackedVista.loadedAt = Date.now();

    if (state.cptAudit.overlayOpen) {
      renderCptAudit();
    }
  } catch (err) {
    state.stackedVista.error = String(err?.message || err || 'unknown error');
    error('Failed to refresh Vista stacked CPT data', err);
  } finally {
    state.stackedVista.loading = false;
  }
}

async function refreshVistaStageData() {
  if (state.stageVista.loading) return;

  state.stageVista.loading = true;
  state.stageVista.error = '';

  try {
    const rows = await fetchVistaStageData();
    state.stageVista.rows = rows;
    state.stageVista.loadedAt = Date.now();
  } catch (err) {
    state.stageVista.error = String(err?.message || err || 'unknown error');
    error('Failed to refresh Vista stage data', err);
  } finally {
    state.stageVista.loading = false;

    if (state.cptAudit.stageOpen && state.cptAudit.stageRowKey) {
      openCptStagePopupByRowKey(state.cptAudit.stageRowKey);
    }
  }
}

    function stopStageLiveRefresh() {
  if (state.stageVista.refreshTimer) {
    clearInterval(state.stageVista.refreshTimer);
    state.stageVista.refreshTimer = null;
  }

  state.stageVista.activeLane = '';
  state.stageVista.rows = [];
  state.stageVista.loadedAt = 0;
  state.stageVista.loading = false;
  state.stageVista.error = '';
}

async function refreshVistaStageDataForActiveLane() {
  const activeLane = String(state.stageVista.activeLane || '').trim();
  if (!activeLane) return;
  if (!state.cptAudit.stageOpen) return;
  if (state.stageVista.loading) return;

  state.stageVista.loading = true;
  state.stageVista.error = '';

  try {
    const allRows = await fetchVistaStageData();

    state.stageVista.rows = allRows.filter(item => {
      const route = String(item?.route || '').trim();
      if (route && route === activeLane) return true;

      const sf = String(item?.stackingFilter || '').trim();
      const laneFromVista = String(getVistaLaneForStackingFilter(sf) || '').trim();
      const laneFromStem = String(getLaneForStackingFilter(sf) || '').trim();

      return laneFromVista === activeLane || laneFromStem === activeLane;
    });

    state.stageVista.loadedAt = Date.now();

if (state.cptAudit.stageOpen && state.cptAudit.stageRowKey) {
  renderCptStagePopupOnly();
}
  } catch (err) {
    state.stageVista.error = String(err?.message || err || 'unknown error');
    error('Failed to refresh Vista stage data for active lane', err);
} finally {
  state.stageVista.loading = false;

  if (state.cptAudit.stageOpen && state.cptAudit.stageRowKey) {
    renderCptStagePopupOnly();
  }
}
}

function startStageLiveRefresh(lane) {
  stopStageLiveRefresh();

  state.stageVista.activeLane = String(lane || '').trim();

  refreshVistaStageDataForActiveLane();

  state.stageVista.refreshTimer = setInterval(() => {
    refreshVistaStageDataForActiveLane();
}, 5000);
}

    let loadedTimer = null;


function stopLoadedLiveRefresh() {
  if (state.loadedVista.refreshTimer) {
    clearInterval(state.loadedVista.refreshTimer);
    state.loadedVista.refreshTimer = null;
  }

  state.loadedVista.activeLane = '';
  state.loadedVista.rows = [];
  state.loadedVista.loadedAt = 0;
  state.loadedVista.loading = false;
  state.loadedVista.error = '';
}

async function refreshVistaLoadedDataForActiveLane() {
  const activeLane = String(state.loadedVista.activeLane || '').trim();
  if (!activeLane) return;
  if (!state.cptAudit.loadedOpen) return;
  if (state.loadedVista.loading) return;

  state.loadedVista.loading = true;
  state.loadedVista.error = '';

  try {
    const allRows = await fetchVistaLoadedData();

    state.loadedVista.rows = allRows.filter(item => {
      const route = String(item?.route || '').trim();
      if (route && route === activeLane) return true;

      const sf = String(item?.stackingFilter || '').trim();
      const laneFromVista = String(getVistaLaneForStackingFilter(sf) || '').trim();
      const laneFromStem = String(getLaneForStackingFilter(sf) || '').trim();

      return laneFromVista === activeLane || laneFromStem === activeLane;
    });

    state.loadedVista.loadedAt = Date.now();
  } catch (err) {
    state.loadedVista.error = String(err?.message || err || 'unknown error');
    error('Failed to refresh Vista loaded data for active lane', err);
  } finally {
    state.loadedVista.loading = false;

    if (state.cptAudit.loadedOpen && state.cptAudit.loadedRowKey) {
      renderCptLoadedPopupOnly();
    }
  }
}

function startLoadedLiveRefresh(lane) {
  stopLoadedLiveRefresh();

  state.loadedVista.activeLane = String(lane || '').trim();

  refreshVistaLoadedDataForActiveLane();

  state.loadedVista.refreshTimer = setInterval(() => {
    refreshVistaLoadedDataForActiveLane();
  }, 5000);
}

async function refreshNoResourcesVistaData() {
  if (state.noResources.vistaLoading) return;
  try {
    state.noResources.vistaLoading = true;
    state.noResources.vistaError = '';
    setNoResourceVistaStatus('loading...');
const [summary, vistaMaps, hrzLaneToCpt] = await Promise.all([
  fetchVistaCountsByStackingFilter(),
  fetchVistaLaneByStackingFilter(),
  getCachedHrzLaneToCptMap(),
]);

state.noResources.vistaSummaryByFilter = summary || {};
state.noResources.vistaLaneByFilter = vistaMaps?.sfToLane || {};
state.noResources.vistaLaneToCpt = vistaMaps?.laneToCpt || {};
state.noResources.hrzLaneToCpt = hrzLaneToCpt || {};
state.noResources.jackpotLaneToCpt = buildJackpotLaneToCptMap(summary || {});
state.noResources.vistaCountsByFilter = Object.fromEntries(
  Object.entries(summary || {}).map(([sf, item]) => [sf, Number(item?.vistaCount || 0)])
);
state.noResources.vistaCountsByFilter = Object.fromEntries(
  Object.entries(summary || {}).map(([sf, item]) => [sf, Number(item?.vistaCount || 0)])
);
    state.noResources.vistaLoadedAt = Date.now();
    state.noResources.vistaError = '';
    const foresightRows = extractNoResourceRowsFromPayload(state.latestRawPayload || {});
state.noResources.rows = attachVinyaasLaneToNoResourceRows(
  buildUnifiedNoResourceRows(foresightRows, state.noResources.vistaSummaryByFilter)
);
    applyNoResourceSearch(state.noResources.searchQuery || '');
    renderNoResourceSummaryBar();
    renderOperationalSummary();
setNoResourceVistaStatus(
  `loaded jackpot=${Object.keys(summary || {}).length} laneSf=${Object.keys(vistaMaps?.sfToLane || {}).length} laneCpt=${Object.keys(vistaMaps?.laneToCpt || {}).length} hrzLaneCpt=${Object.keys(hrzLaneToCpt || {}).length}`
);

if (state.overlayOpen && state.activeRecirculationTab === 'stem') {
  renderStemView();
}
  } catch (err) {
    state.noResources.vistaError = err?.message || String(err);
    setNoResourceVistaStatus(`failed: ${state.noResources.vistaError}`);
    error('Failed to refresh Vista No Resources data', err);
  } finally {
    state.noResources.vistaLoading = false;
  }
}

  function isGraphqlFacilityRequest(url, bodyObj) {
    if (!url || !String(url).includes('/graphql')) return false;
    if (!bodyObj || typeof bodyObj !== 'object') return false;
    return bodyObj.operationName === 'getFacilityProjections';
  }

function processGraphqlResponse(url, requestBodyObj, responsePayload) {
  try {


    if (isGraphqlFacilityRequest(url, requestBodyObj)) {
      const nodeId = requestBodyObj?.variables?.nodeId || '';
      if (state.route.facility && String(nodeId).trim() !== String(state.route.facility).trim()) {
        log('Ignoring getFacilityProjections for other nodeId:', nodeId);
        return;
      }
      handleFacilityProjectionsPayload(responsePayload, { nodeId });
      handleLoosePackagesPayload(responsePayload);
    }
  } catch (err) {
    error('processGraphqlResponse failed', err);
  }
}

function installTanteiTokenSniffer() {
  const targets = [];

  if (typeof unsafeWindow !== 'undefined' && unsafeWindow) {
    targets.push(unsafeWindow);
  }

  targets.push(window);

  for (const page of targets) {
    if (!page || page.__watchSorterTanteiTokenSnifferInstalled) continue;
    page.__watchSorterTanteiTokenSnifferInstalled = true;

    const originalFetch = page.fetch;

    if (typeof originalFetch === 'function') {
      page.fetch = async function watchSorterTanteiFetch(input, init = {}) {
        try {
          const url = typeof input === 'string'
            ? input
            : String(input?.url || '');

          if (url.includes('/sortcenter/tantei/graphql')) {
            const token =
              getHeaderValueFromHeaders(init?.headers, 'anti-csrftoken-a2z') ||
              getHeaderValueFromHeaders(input?.headers, 'anti-csrftoken-a2z');

            if (token) {
              saveTanteiCsrfToken(token);
            } else {
              warn('VAST Tantei fetch seen but token header missing', { url });
            }
          }
        } catch (err) {
          warn('VAST Tantei fetch token sniff failed', err);
        }

        return originalFetch.apply(this, arguments);
      };
    }

    const Xhr = page.XMLHttpRequest;
    if (Xhr && Xhr.prototype) {
      const originalOpen = Xhr.prototype.open;
      const originalSetRequestHeader = Xhr.prototype.setRequestHeader;
      const originalSend = Xhr.prototype.send;

      Xhr.prototype.open = function watchSorterTanteiXhrOpen(method, url) {
        this.__watchSorterTanteiUrl = String(url || '');
        this.__watchSorterTanteiHeaders = {};
        return originalOpen.apply(this, arguments);
      };

      Xhr.prototype.setRequestHeader = function watchSorterTanteiXhrHeader(name, value) {
        try {
          if (this.__watchSorterTanteiUrl?.includes('/sortcenter/tantei/graphql')) {
            this.__watchSorterTanteiHeaders[String(name || '').toLowerCase()] = String(value || '');
          }
        } catch (err) {
          warn('VAST Tantei XHR header sniff failed', err);
        }

        return originalSetRequestHeader.apply(this, arguments);
      };

      Xhr.prototype.send = function watchSorterTanteiXhrSend() {
        try {
          if (this.__watchSorterTanteiUrl?.includes('/sortcenter/tantei/graphql')) {
            const token = this.__watchSorterTanteiHeaders?.['anti-csrftoken-a2z'];
            if (token) {
              saveTanteiCsrfToken(token);
            } else {
              warn('VAST Tantei XHR seen but token header missing', {
                url: this.__watchSorterTanteiUrl,
              });
            }
          }
        } catch (err) {
          warn('VAST Tantei XHR send sniff failed', err);
        }

        return originalSend.apply(this, arguments);
      };
    }
  }

  log('VAST Tantei token sniffer installed on window/unsafeWindow');
}

function installFetchHook() {
  const page = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  if (page.__watchSorterFetchHookInstalled) { log('Fetch hook already installed'); return; }
  const originalFetch = page.fetch;
  if (typeof originalFetch !== 'function') { warn('page.fetch not available'); return; }

  page.fetch = async function (...args) {
    const requestInfo = args[0];
    const requestInit = args[1];
    let url = '', bodyText = '';

    try {
      if (typeof requestInfo === 'string') {
        url = requestInfo;
        bodyText = requestInit?.body ? String(requestInit.body) : '';
      } else if (requestInfo instanceof Request) {
        url = requestInfo.url || '';
        if (requestInit?.body) { bodyText = String(requestInit.body); }
        else { bodyText = await requestInfo.clone().text(); }
      } else {
        url = String(requestInfo || '');
        bodyText = requestInit?.body ? String(requestInit.body) : '';
      }
    } catch (err) { warn('Could not inspect fetch request before sending', err); }

    const response = await originalFetch.apply(this, args);

    try {
      const bodyObj = safeJsonParse(bodyText);
      if (url && String(url).includes('/graphql') && bodyObj && typeof bodyObj === 'object') {
        response.clone().json().then(json => processGraphqlResponse(url, bodyObj, json)).catch(err => error('Failed to parse fetch GraphQL response JSON', err));
      }
    } catch (err) { error('Fetch hook post-processing failed', err); }

    return response;
  };

  page.__watchSorterFetchHookInstalled = true;
  log(`Fetch hook installed by ${SCRIPT_AUTHOR}`);
}

function installXhrHook() {
  const page = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  if (page.__watchSorterXhrHookInstalled) { log('XHR hook already installed'); return; }
  const XHR = page.XMLHttpRequest;
  if (!XHR || !XHR.prototype) { warn('page.XMLHttpRequest not available'); return; }

  const originalOpen = XHR.prototype.open;
  const originalSend = XHR.prototype.send;

  XHR.prototype.open = function (method, url, ...rest) {
    this.__wsMethod = method;
    this.__wsUrl = url;
    return originalOpen.call(this, method, url, ...rest);
  };

  XHR.prototype.send = function (body) {
    this.__wsBody = body;
    this.addEventListener('load', function () {
      try {
        const url = String(this.__wsUrl || '');
        const bodyText = typeof this.__wsBody === 'string' ? this.__wsBody : '';
        const bodyObj = safeJsonParse(bodyText);
        if (!url || !String(url).includes('/graphql') || !bodyObj || typeof bodyObj !== 'object') return;
        const responsePayload = safeJsonParse(this.responseText);
        if (!responsePayload) { warn('XHR GraphQL response was not valid JSON'); return; }
        processGraphqlResponse(url, bodyObj, responsePayload);
      } catch (err) { error('XHR hook load handler failed', err); }
    });
    return originalSend.call(this, body);
  };

  page.__watchSorterXhrHookInstalled = true;
  log(`XHR hook installed by ${SCRIPT_AUTHOR}`);
}

  function bootstrapMap() {
    log('Bootstrapping map using storage key:', state.storageKey);
    const cached = loadStructureMap();
    if (cached) { state.structureMap = cached; updateMapInfo(); setStatus('cached map loaded'); return; }
    state.structureMap = buildInitialStructureMap();
    saveStructureMap(state.structureMap);
    updateMapInfo();
    setStatus('initial map created');
  }

  async function initUiWhenReady() {
    try {
      if (state.route.isForesightRoot) { log('On foresight root page.'); return; }
      if (!state.route.isSorterDetail) { warn('Not on sorter detail page.'); return; }

      log('Sorter detail page detected for node:', state.route.nodeKey);
      injectStyles();
      await waitForElement(SELECTORS.attentionAreasList, 20000);
      log('Attention areas list is ready');

      const injected = injectWatchSorterCard();
      if (!injected) { warn('Could not inject Watch Sorter card'); return; }

      bootstrapMap();
      loadCptAuditSnapshots();
ensureOverlay();
ensureCptAuditOverlay();
        ensureVastOverlay();
ensureFooter();
await refreshVinyaasConfig();
scheduleVinyaasRefresh();
refreshNoResourcesVistaData();
await refreshOutboundData();
renderRows([]);
        startVastBackgroundDataLoad();
bindGlobalShortcuts();
      log(`UI initialized successfully by ${SCRIPT_AUTHOR}`);
    } catch (err) {
      error('UI initialization failed', err);
    }
  }

function getStemCardNumberByTitle(titleText) {
  const target = String(titleText || '').trim().toLowerCase();
  if (!target) return 0;

  const cards = Array.from(document.querySelectorAll('[mdn-card]'));

  for (const card of cards) {
    const text = String(card.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text.toLowerCase().startsWith(target)) continue;

    const valueEl = card.querySelector('[mdn-card-children] [mdn-text]');
    const value = Number(String(valueEl?.textContent || '').trim());

    if (Number.isFinite(value)) return value;
  }

  return 0;
}

function waitForStemEquipmentReady(timeoutMs = 90000, pollMs = 500) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const timer = window.setInterval(() => {
      const chuteCount = getStemCardNumberByTitle('Chute');

        if (!window.__wsLastChuteDebugAt || Date.now() - window.__wsLastChuteDebugAt > 3000) {
  window.__wsLastChuteDebugAt = Date.now();

  sendStemBridgeLog({}, 'DEBUG', 'Checking Chute card in STEM UI', {
    href: location.href,
    chuteCount,
    mdnCards: document.querySelectorAll('[mdn-card]').length,
    bodyTextSample: String(document.body?.innerText || '').slice(0, 500),
  });
}

      if (chuteCount > 0) {
        window.clearInterval(timer);
        resolve({
          ready: true,
          chuteCount,
          waitedMs: Date.now() - startedAt,
        });
        return;
      }

      if (Date.now() - startedAt > timeoutMs) {
        window.clearInterval(timer);
        reject(new Error('Timeout waiting for STEM UI ready: Chute card value did not become > 0'));
      }
    }, pollMs);
  });
}

function sendStemBridgeLog(command, level, message, payload = null) {
  GM_setValue(STEM_LOG_KEY, {
    id: `stem_log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    commandId: command?.id || '',
    targetTabId: command?.sourceTabId || '',
    level,
    message,
    payload,
    createdAt: Date.now(),
  });
}

    function findDeepObjects(value, predicate, results = [], seen = new WeakSet()) {
  if (!value || typeof value !== 'object') return results;

  if (seen.has(value)) return results;
  seen.add(value);

  if (predicate(value)) {
    results.push(value);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      findDeepObjects(item, predicate, results, seen);
    }
  } else {
    for (const key of Object.keys(value)) {
      findDeepObjects(value[key], predicate, results, seen);
    }
  }

  return results;
}

function normalizeStemArea(value) {
  return String(value || '').trim().toUpperCase();
}

function getStemGraphqlCache() {
  return window.__wsStemGraphqlPayloads || [];
}

function findStemReservationForAreaInList(list, areaName) {
  const areaKey = normalizeStemArea(areaName);
  if (!areaKey || !Array.isArray(list)) return null;

  for (const reservation of list) {
    const resources = Array.isArray(reservation?.resources) ? reservation.resources : [];
    const matchedResource = resources.find(resource => {
      return normalizeStemArea(resource?.label) === areaKey;
    });

    if (!matchedResource) continue;

    const stackingFilters = Array.isArray(reservation?.stackingFilters)
      ? reservation.stackingFilters.map(x => String(x || '').trim()).filter(Boolean)
      : [];

    if (!stackingFilters.length) continue;

    return {
      area: areaName,
      stackingFilter: stackingFilters[0],
      stackingFilters,
      resourceId: String(matchedResource?.resourceId || '').trim(),
      reservationId: String(reservation?.reservationId || '').trim(),
      source: 'reservation',
      raw: reservation,
    };
  }

  return null;
}

function getStemAllocationForAreaFromGraphqlCache(areaName) {
  const areaKey = normalizeStemArea(areaName);
  if (!areaKey) return null;

  const payloads = getStemGraphqlCache();

  for (let i = payloads.length - 1; i >= 0; i -= 1) {
    const payload = payloads[i]?.json || payloads[i];

    const data = Array.isArray(payload) ? payload[0]?.data : payload?.data;

    const directReservations =
      data?.reservationsAtTime ||
      data?.reservations ||
      payload?.data?.reservationsAtTime ||
      payload?.data?.reservations ||
      [];

    const match = findStemReservationForAreaInList(directReservations, areaName);
    if (match) return match;
  }

  return null;
}

    function writeStemPendingSession(command) {
  try {
    sessionStorage.setItem(STEM_PENDING_SESSION_KEY, JSON.stringify(command || null));
  } catch {}
}

function readStemPendingSession() {
  try {
    const raw = sessionStorage.getItem(STEM_PENDING_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.id ? parsed : null;
  } catch {
    return null;
  }
}

function clearStemPendingSession() {
  try {
    sessionStorage.removeItem(STEM_PENDING_SESSION_KEY);
  } catch {}
}

async function clearStemPendingCommand(command) {
  const pending = await GM_getValue(STEM_PENDING_COMMAND_KEY);

  if (String(pending?.id || '') === String(command?.id || '')) {
    await GM_setValue(STEM_PENDING_COMMAND_KEY, null);
  }

  const sessionPending = readStemPendingSession();
  if (String(sessionPending?.id || '') === String(command?.id || '')) {
    clearStemPendingSession();
  }
}

    function getStemCsrfTokenFromGraphqlCache() {
  const payloads = getStemGraphqlCache();

  for (let i = payloads.length - 1; i >= 0; i -= 1) {
    const headers = payloads[i]?.requestHeaders || {};
    const token =
      headers['anti-csrftoken-a2z'] ||
      headers['Anti-CsrfToken-A2z'] ||
      headers['anti-csrftoken'] ||
      '';

    if (token) return token;
  }

  return '';
}

async function submitStemRemoveReservationsRequest(command, allocation) {
  const nodeId = String(command?.nodeId || '').trim();
  const area = String(command?.area || '').trim();
  const resourceId = String(allocation?.resourceId || '').trim();
  const stackingFilters = Array.isArray(allocation?.stackingFilters)
  ? allocation.stackingFilters.map(x => String(x || '').trim()).filter(Boolean)
  : [String(allocation?.stackingFilter || '').trim()].filter(Boolean);
  const csrfToken = getStemCsrfTokenFromGraphqlCache();

  if (!nodeId || !area || !resourceId || !stackingFilters.length) {
    sendStemBridgeLog(command, 'ERROR', 'Cannot submit RemoveReservations: missing input', {
      nodeId,
      area,
      resourceId,
      stackingFilters,
    });
    return;
  }

  if (!csrfToken) {
    sendStemBridgeLog(command, 'ERROR', 'Cannot submit RemoveReservations: CSRF token not captured yet');
    return;
  }

  const body = [{
    operationName: 'RemoveReservations',
    variables: {
      allocationChangeInput: {
        nodeId,
        resourceId,
        stackingFilters,
      },
    },
    query: `mutation RemoveReservations($allocationChangeInput: RemoveReservationsInput!) {
  removeReservations(removeReservationsInput: $allocationChangeInput) {
    reservationId
    __typename
  }
}`,
  }];

sendStemBridgeLog(command, 'INFO', 'Submitting RemoveReservations request', {
  nodeId,
  area,
  resourceId,
  stackingFilters,
  reservationId: allocation?.reservationId || '',
});

  const response = await fetch('/sortcenter/equipmentmanagement/graphql', {
    method: 'POST',
    credentials: 'include',
    headers: {
      accept: '*/*',
      'content-type': 'application/json',
      'anti-csrftoken-a2z': csrfToken,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let json = null;

  try {
    json = JSON.parse(text);
  } catch {}

  sendStemBridgeLog(command, response.ok ? 'INFO' : 'ERROR', 'RemoveReservations response', {
    status: response.status,
    ok: response.ok,
    json,
    text: json ? '' : text.slice(0, 1000),
  });
}

    async function publishStemBootstrapResult(command, payload) {
  await GM_setValue(STEM_BOOTSTRAP_RESULT_KEY, {
    commandId: command?.id || '',
    sourceTabId: command?.sourceTabId || '',
    targetTabId: command?.sourceTabId || '',
    nodeId: command?.nodeId || '',
    area: command?.area || '',
    createdAt: Date.now(),
    ...payload,
  });
}

async function runStemBridgeCommand(command) {
  const commandNodeId = String(command?.nodeId || '').trim();
  const currentNodeId = String(location.pathname.match(/\/node\/([^/]+)/)?.[1] || '').trim();

  if (commandNodeId && currentNodeId && commandNodeId !== currentNodeId) {
    return;
  }

  sendStemBridgeLog(command, 'INFO', 'Command received in STEM tab', command);

  try {
    sendStemBridgeLog(command, 'INFO', 'Waiting for STEM UI load by Chute card');

    const ready = await waitForStemEquipmentReady();

    sendStemBridgeLog(command, 'INFO', 'STEM UI load completed by Chute card', ready);

    await GM_setValue(STEM_PENDING_COMMAND_KEY, null);
    await GM_setValue(STEM_REFRESH_MARK_KEY, null);
    clearStemPendingSession();
if (command.type === 'requestAllocateAvailabilityBootstrap') {
  const csrfToken = getStemCsrfTokenFromGraphqlCache();

  if (!csrfToken) {
    sendStemBridgeLog(command, 'ERROR', 'Request Allocate availability bootstrap failed: CSRF token not captured');

    await publishStemBootstrapResult(command, {
      ok: false,
      reason: 'csrf_missing',
    });

    return;
  }

  sendStemBridgeLog(command, 'INFO', 'Request Allocate availability bootstrap OK', {
    sf: command.sf,
    hasCsrfToken: true,
  });

  await publishStemBootstrapResult(command, {
    ok: true,
    csrfToken,
  });

  if (command.openedByWatchSorter) {
    window.setTimeout(() => window.close(), 700);
  }

  return;
}
if (command.type === 'allocateDirectBootstrap') {
  const csrfToken = getStemCsrfTokenFromGraphqlCache();
  const allocation = getStemAllocationForAreaFromGraphqlCache(command.area);

  if (!csrfToken) {
    sendStemBridgeLog(command, 'ERROR', 'Allocate bootstrap failed: CSRF token not captured');

    await publishStemBootstrapResult(command, {
      ok: false,
      reason: 'csrf_missing',
      allocation,
    });

    return;
  }

  if (allocation?.stackingFilter) {
    sendStemBridgeLog(command, 'ERROR', 'Allocate rejected: area is not free', {
      area: command.area,
      sf: command.sf,
      allocation,
    });

    await publishStemBootstrapResult(command, {
      ok: false,
      reason: 'area_not_free',
      allocation,
    });

    return;
  }

let resource = null;
const areaKey = normalizeStemArea(command.area);

const connectedBody = [{
  operationName: 'GetAllConnectedResources',
  variables: { nodeId: command.nodeId },
  query: `query GetAllConnectedResources($nodeId: String!) {
  getAllConnectedResources(nodeId: $nodeId) {
    __typename
    chuteId
    resources {
      __typename
      resourceId
      resourceType
      label
      resourceAttributes {
        __typename
        key
        value
      }
    }
  }
}`,
}];

const connectedResponse = await gmPostStemGraphql(connectedBody, csrfToken);
const connectedJson = connectedResponse?.json;
const connectedData = Array.isArray(connectedJson)
  ? connectedJson[0]?.data
  : connectedJson?.data;

const connections = Array.isArray(connectedData?.getAllConnectedResources)
  ? connectedData.getAllConnectedResources
  : [];

for (const connection of connections) {
  for (const item of Array.isArray(connection?.resources) ? connection.resources : []) {
    if (
      String(item?.resourceType || '') === 'STACKING_AREA' &&
      normalizeStemArea(item?.label) === areaKey
    ) {
      resource = {
        label: String(item?.label || '').trim(),
        resourceId: String(item?.resourceId || '').trim(),
        resourceType: String(item?.resourceType || '').trim(),
        chuteId: String(connection?.chuteId || '').trim(),
        raw: item,
      };
      break;
    }
  }

  if (resource) break;
}

  if (!resource?.resourceId) {
    sendStemBridgeLog(command, 'ERROR', 'Allocate bootstrap failed: resourceId not found for area', {
      area: command.area,
      sf: command.sf,
    });

    await publishStemBootstrapResult(command, {
      ok: false,
      reason: 'resource_not_found',
      allocation,
    });

    return;
  }

  sendStemBridgeLog(command, 'INFO', 'Allocate bootstrap OK: area is free', {
    area: command.area,
    sf: command.sf,
    resource,
  });

  await publishStemBootstrapResult(command, {
    ok: true,
    csrfToken,
    resource,
    allocation: null,
  });

  if (command.openedByWatchSorter) {
    window.setTimeout(() => window.close(), 700);
  }

  return;
}



const allocation = getStemAllocationForAreaFromGraphqlCache(command.area);

if (!allocation?.stackingFilter) {
  sendStemBridgeLog(command, 'INFO', 'Area already is free', {
    area: command.area,
    allocation,
    type: command.type,
  });



  if (command.type === 'deallocateRequestBootstrap') {
    await publishStemBootstrapResult(command, {
      ok: false,
      reason: 'area_already_free',
      allocation,
    });

    if (command.openedByWatchSorter) {
      window.setTimeout(() => window.close(), 700);
    }
  }

  return;
}



if (command.type === 'deallocateRequestBootstrap') {
  const csrfToken = getStemCsrfTokenFromGraphqlCache();

  if (!csrfToken) {
    sendStemBridgeLog(command, 'ERROR', 'Bootstrap failed: CSRF token not captured');

    await publishStemBootstrapResult(command, {
      ok: false,
      reason: 'csrf_missing',
      allocation,
    });

    return;
  }

  sendStemBridgeLog(command, 'INFO', 'Bootstrap captured token and allocation', {
    area: command.area,
    resourceId: allocation.resourceId || '',
    stackingFilters: allocation.stackingFilters || [allocation.stackingFilter],
    reservationId: allocation.reservationId || '',
    openedByWatchSorter: Boolean(command.openedByWatchSorter),
  });

  await publishStemBootstrapResult(command, {
    ok: true,
    csrfToken,
    allocation,
  });

  if (command.openedByWatchSorter) {
    sendStemBridgeLog(command, 'INFO', 'Closing bootstrap STEM tab after successful capture');
    window.setTimeout(() => window.close(), 700);
  }

  return;
}

if (command.type === 'deallocateRequest') {
  await submitStemRemoveReservationsRequest(command, allocation);
  return;
}

sendStemBridgeLog(command, 'INFO', 'Area has allocation, ready for next deallocate step', {
  area: command.area,
  stackingFilter: allocation.stackingFilter,
  resourceId: allocation.resourceId || '',
  allocation,
});
  } catch (err) {
    sendStemBridgeLog(command, 'ERROR', 'STEM bridge failed', {
      message: err?.message || String(err),
    });
  }
}

function installStemHeartbeat() {
  if (!isStemPage) return;
  if (window.__wsStemHeartbeatInstalled) return;
  window.__wsStemHeartbeatInstalled = true;

  const tabId = state.runtimeTabId;

const writeHeartbeat = () => {
  const bodyTextSample = String(document.body?.innerText || '').slice(0, 1200);

  GM_setValue(STEM_HEARTBEAT_KEY, {
    tabId,
    nodeId: String(location.pathname.match(/\/node\/([^/]+)/)?.[1] || ''),
    href: location.href,
    ts: Date.now(),
    alive: true,
    bodyTextSample,
  });
};

  const clearHeartbeat = () => {
    GM_setValue(STEM_HEARTBEAT_KEY, {
      tabId,
      nodeId: String(location.pathname.match(/\/node\/([^/]+)/)?.[1] || ''),
      href: location.href,
      ts: 0,
      alive: false,
      closedAt: Date.now(),
    });
  };

  writeHeartbeat();
  window.setInterval(writeHeartbeat, 1000);

  window.addEventListener('pagehide', clearHeartbeat);
  window.addEventListener('beforeunload', clearHeartbeat);
}

    function normalizeHeadersToObject(headers) {
  const result = {};

  try {
    if (!headers) return result;

    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        result[String(key).toLowerCase()] = String(value || '');
      });
      return result;
    }

    if (Array.isArray(headers)) {
      headers.forEach(pair => {
        if (Array.isArray(pair) && pair.length >= 2) {
          result[String(pair[0]).toLowerCase()] = String(pair[1] || '');
        }
      });
      return result;
    }

    if (typeof headers === 'object') {
      Object.keys(headers).forEach(key => {
        result[String(key).toLowerCase()] = String(headers[key] || '');
      });
    }
  } catch {}

  return result;
}

function installStemGraphqlCapture() {
  if (!isStemPage) return;
  if (window.__wsStemGraphqlCaptureInstalled) return;
  window.__wsStemGraphqlCaptureInstalled = true;

  window.__wsStemGraphqlPayloads = window.__wsStemGraphqlPayloads || [];

  const pushPayload = (meta) => {
    window.__wsStemGraphqlPayloads.push({
      ...meta,
      ts: Date.now(),
    });

    if (window.__wsStemGraphqlPayloads.length > 100) {
      window.__wsStemGraphqlPayloads.shift();
    }
  };

  const originalFetch = unsafeWindow.fetch;
  if (typeof originalFetch === 'function') {
    unsafeWindow.fetch = async function (...args) {
      const input = args[0];
      const init = args[1] || {};
      const response = await originalFetch.apply(this, args);

      try {
        const url = String(input?.url || input || '');
        const requestHeaders = normalizeHeadersToObject(init?.headers || input?.headers);
        const clone = response.clone();

        clone.json().then(json => {
          pushPayload({
            source: 'fetch',
            url,
            requestHeaders,
            json,
          });
        }).catch(() => {});
      } catch {}

      return response;
    };
  }

  const OriginalXhr = unsafeWindow.XMLHttpRequest;
  if (typeof OriginalXhr === 'function') {
    unsafeWindow.XMLHttpRequest = function () {
      const xhr = new OriginalXhr();
      let requestUrl = '';
      const requestHeaders = {};

      const originalOpen = xhr.open;
      xhr.open = function (method, url, ...rest) {
        requestUrl = String(url || '');
        return originalOpen.call(xhr, method, url, ...rest);
      };

      const originalSetRequestHeader = xhr.setRequestHeader;
      xhr.setRequestHeader = function (key, value) {
        requestHeaders[String(key || '').toLowerCase()] = String(value || '');
        return originalSetRequestHeader.call(xhr, key, value);
      };

      xhr.addEventListener('load', () => {
        try {
          const text = String(xhr.responseText || '');
          if (!text || text[0] !== '{') return;

          const json = JSON.parse(text);
          pushPayload({
            source: 'xhr',
            url: requestUrl,
            requestHeaders,
            json,
          });
        } catch {}
      });

      return xhr;
    };
  }
}

function installStemCommandBridge() {
  if (!isStemPage) return;
  if (window.top !== window.self) return;
  installStemHeartbeat();

  try {
    installStemGraphqlCapture();
  } catch (err) {
    sendStemBridgeLog({}, 'ERROR', 'installStemGraphqlCapture failed, heartbeat still active', {
      message: err?.message || String(err),
      stack: err?.stack || '',
    });
  }

  if (window.__wsStemCommandBridgeInstalled) return;
  window.__wsStemCommandBridgeInstalled = true;

  const processedCommandIds = new Set();

  const receiveCommand = (command) => {
    if (!command || !command.id) return;

    const commandId = String(command.id);
    const isPendingAfterRefresh = Boolean(command.pendingAfterRefresh);

    if (processedCommandIds.has(commandId) && !isPendingAfterRefresh) return;

    processedCommandIds.add(commandId);

    if (processedCommandIds.size > 100) {
      const first = processedCommandIds.values().next().value;
      processedCommandIds.delete(first);
    }

    runStemBridgeCommand(command);
  };

  sendStemBridgeLog({}, 'DEBUG', 'STEM bridge installed', {
    href: location.href,
    runtimeTabId: state.runtimeTabId,
    nodeId: String(location.pathname.match(/\/node\/([^/]+)/)?.[1] || ''),
  });

  GM_addValueChangeListener(STEM_COMMAND_KEY, (_key, _oldValue, newValue) => {
    receiveCommand(newValue);
  });

GM_setValue(STEM_PENDING_COMMAND_KEY, null);
GM_setValue(STEM_REFRESH_MARK_KEY, null);
clearStemPendingSession();

GM_getValue(STEM_COMMAND_KEY).then(existing => {
  receiveCommand(existing);
});

  window.setInterval(() => {
    GM_getValue(STEM_COMMAND_KEY).then(cmd => {
      receiveCommand(cmd);
    });
  }, 800);
}

function init() {
  try {
    log(`Starting ${SCRIPT_NAME} v${SCRIPT_VERSION}`);
    log('Creator:', SCRIPT_AUTHOR);
    log('Route parsed:', state.route);
    log('Storage key:', state.storageKey);
installTanteiTokenSniffer();

if (location.href.includes('trans-logistics-eu.amazon.com/sortcenter/tantei')) {
  log('Tantei page detected. Waiting to capture token.');
  return;
}

installFetchHook();
installXhrHook();



    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initUiWhenReady, { once: true });
    } else {
      initUiWhenReady();
    }
  } catch (err) {
    error('Initialization failed', err);
  }
}

  if (isStemPage) {
    installStemCommandBridge();
    return;
  }

  init();
})();
