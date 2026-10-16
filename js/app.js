/* =====================================================================
   RADIK DROP — логика сайта
   ---------------------------------------------------------------------
   Здесь ничего менять не нужно: цены, шансы, лимиты, промокоды и скины
   настраиваются в js/config.js.

   Устройство файла:
     1. Утилиты
     2. Данные из CONFIG (скины, кейсы, ценность предметов)
     3. Сохранение прогресса (localStorage с обработкой ошибок)
     4. Токены (начисление за время на вкладке, дневной лимит)
     5. Шансы и выпадение предметов
     6. Общие элементы интерфейса (карточки, окна, лента дропов)
     7. Экраны: кейсы, кейс, апгрейд, контракты, батл, инвентарь, промокоды
     8. Навигация и запуск
   ===================================================================== */
(() => {
  'use strict';

  /* ── 1. Утилиты ─────────────────────────────────────────────────── */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ESC[c]);
  const nf = new Intl.NumberFormat('ru-RU');
  const nf2 = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmt = (n) => nf.format(n);
  const pct = (n) => `${nf2.format(n)}%`;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const sum = (arr, fn) => arr.reduce((acc, x) => acc + fn(x), 0);

  // Случайные числа: криптографический генератор браузера, запасной — Math.random.
  const rand = (() => {
    if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
      const buf = new Uint32Array(1);
      return () => { window.crypto.getRandomValues(buf); return buf[0] / 4294967296; };
    }
    return Math.random;
  })();
  const randInt = (n) => Math.floor(rand() * n);

  const motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const reducedMotion = () => !!(motionQuery && motionQuery.matches);

  function plural(n, one, few, many) {
    const a = Math.abs(n) % 100;
    const b = a % 10;
    if (a > 10 && a < 20) return many;
    if (b > 1 && b < 5) return few;
    if (b === 1) return one;
    return many;
  }
  const itemsWord = (n) => plural(n, 'предмет', 'предмета', 'предметов');
  const tokensWord = (n) => plural(n, 'токен', 'токена', 'токенов');

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  const timeHM = (ts) => new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  // Хэш для секретных промокодов (cyrb53). Не криптография, но код не виден в файле.
  function hashCode(str) {
    let h1 = 0xdeadbeef ^ 1337;
    let h2 = 0x41c6ce57 ^ 1337;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0');
  }
  const normCode = (s) => String(s || '').trim().toUpperCase().replace(/\s+/g, '');
  // Путь к картинке. В предпросмотре картинки подгружаются архивом, и путь подменяется.
  const imgUrl = (path) => (window.RADIK_IMAGES && window.RADIK_IMAGES.get(path)) || path;

  /* ── Иконки ─────────────────────────────────────────────────────── */
  const svgIco = (d) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const ICON = {
    cases: svgIco('<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>'),
    upgrade: svgIco('<circle cx="12" cy="12" r="9"/><path d="M12 16.5v-9M8.5 11 12 7.5l3.5 3.5"/>'),
    contracts: svgIco('<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h5"/>'),
    battle: svgIco('<path d="M5 4l9.5 9.5M5 4h3.5M5 4v3.5M19 4l-9.5 9.5M19 4h-3.5M19 4v3.5M7.5 15.5 4 19l1 1 3.5-3.5M16.5 15.5 20 19l-1 1-3.5-3.5"/>'),
    inventory: svgIco('<rect x="3.5" y="3.5" width="7" height="7"/><rect x="13.5" y="3.5" width="7" height="7"/><rect x="3.5" y="13.5" width="7" height="7"/><rect x="13.5" y="13.5" width="7" height="7"/>'),
    promo: svgIco('<path d="M3 7.5h18v3a1.5 1.5 0 0 0 0 3v3H3v-3a1.5 1.5 0 0 0 0-3z"/><path d="M14.5 7.5v9" stroke-dasharray="1.6 1.8"/>'),
    back: svgIco('<path d="M15 5l-7 7 7 7"/>'),
    close: svgIco('<path d="M6 6l12 12M18 6 6 18"/>'),
    arrow: svgIco('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  };
  const COIN = '<svg class="coin" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9"/><path d="M10 4.8 14.5 7.4v5.2L10 15.2 5.5 12.6V7.4z"/></svg>';

  const NAV = [
    { id: 'cases', title: 'Кейсы' },
    { id: 'upgrade', title: 'Апгрейд' },
    { id: 'contracts', title: 'Контракты' },
    { id: 'battle', title: 'Батл' },
    { id: 'inventory', title: 'Инвентарь' },
    { id: 'promo', title: 'Промокоды' },
  ];

  /* ── 2. Данные из CONFIG ────────────────────────────────────────── */
  const RAR = CONFIG.rarities;
  const ORDER = CONFIG.rarityOrder.filter((r) => RAR[r]);
  const rankOf = (r) => ORDER.indexOf(r);
  const nextRarity = (r) => {
    const i = rankOf(r);
    return i >= 0 && i < ORDER.length - 1 ? ORDER[i + 1] : null;
  };

  // Цвета редкостей из CONFIG → CSS-переменные.
  for (const [key, r] of Object.entries(RAR)) {
    if (r.color) document.documentElement.style.setProperty(`--r-${key}`, r.color);
  }

  const caseById = new Map();
  const skinById = new Map();
  const skinsByCase = new Map();
  for (const c of CONFIG.cases) {
    caseById.set(c.id, c);
    skinsByCase.set(c.id, []);
  }
  for (const s of CONFIG.skins) {
    if (!s || !s.id || !RAR[s.rarity]) {
      console.warn('[RADIK DROP] Скин пропущен: нет id или неизвестная редкость', s);
      continue;
    }
    if (skinById.has(s.id)) {
      console.warn('[RADIK DROP] Повторяющийся id скина, второй пропущен:', s.id);
      continue;
    }
    skinById.set(s.id, s);
    for (const cid of Array.isArray(s.case) ? s.case : [s.case]) {
      if (skinsByCase.has(cid)) skinsByCase.get(cid).push(s);
      else console.warn('[RADIK DROP] Скин ссылается на несуществующий кейс:', s.id, cid);
    }
  }
  const casesOf = (s) => (Array.isArray(s.case) ? s.case : [s.case]).map((id) => caseById.get(id)).filter(Boolean);
  const playableCases = CONFIG.cases.filter((c) => skinsByCase.get(c.id).length > 0);

  const tiersCache = new Map();
  function tiersOf(c) {
    if (!c) return {};
    if (!tiersCache.has(c.id)) {
      const tiers = {};
      for (const s of skinsByCase.get(c.id) || []) (tiers[s.rarity] = tiers[s.rarity] || []).push(s);
      tiersCache.set(c.id, tiers);
    }
    return tiersCache.get(c.id);
  }

  // Ценность: значение редкости × множитель кейса. Множитель подобран так, чтобы средняя
  // ценность дропа была пропорциональна цене кейса при любых шансах и наборе редкостей.
  // Для обычного кейса он равен «цена / базовая цена». Можно задать вручную полем value.
  const multCache = new Map();
  let baseUnit = null;
  const unitOf = (rows) => sum(rows, (r) => (r.pct / 100) * RAR[r.rarity].value);
  function valueMult(c) {
    if (!multCache.has(c.id)) {
      if (baseUnit === null) {
        const keys = Object.keys(CONFIG.odds).filter((r) => RAR[r] && Number(CONFIG.odds[r]) > 0);
        const total = sum(keys, (r) => Number(CONFIG.odds[r]));
        baseUnit = unitOf(keys.map((r) => ({ rarity: r, pct: (Number(CONFIG.odds[r]) / total) * 100 })));
      }
      const unit = unitOf(oddsRows(c, c.odds || CONFIG.odds));
      const priceMult = c.price / CONFIG.economy.basePrice;
      multCache.set(c.id, unit > 0 && baseUnit > 0 ? priceMult * (baseUnit / unit) : priceMult);
    }
    return multCache.get(c.id);
  }
  // Ценность по редкости — только для скинов без рыночной цены (поля price).
  function legacyValue(skin) {
    const c = casesOf(skin)[0];
    return Math.max(1, Math.round(RAR[skin.rarity].value * (c ? valueMult(c) : 1)));
  }
  // Рыночная цена в токенах для износа wi (0 = FN … 4 = BS). Если для этого износа цены нет,
  // берётся ближайший износ с ценой.
  function priceAt(skin, wi) {
    const p = skin.price;
    if (typeof p === 'number') return p > 0 ? p : null;
    if (!Array.isArray(p)) return null;
    for (let d = 0; d < 5; d++) {
      for (const j of d ? [wi - d, wi + d] : [wi]) if (p[j] > 0) return p[j];
    }
    return null;
  }
  // Износ «по умолчанию»: Field-Tested, если он у скина бывает, иначе самый частый.
  // Ценность в каталогах и цель апгрейда считаются для этого износа.
  const defWearCache = new Map();
  function defaultWear(skin) {
    if (defWearCache.has(skin.id)) return defWearCache.get(skin.id);
    const [lo, hi] = Array.isArray(skin.float) ? skin.float : [0, 1];
    let best = 2;
    let cov = 0;
    let from = 0;
    WEARS.forEach(([to], i) => {
      const ov = Math.min(hi, Math.min(to, 1)) - Math.max(lo, from);
      if (ov > cov) { cov = ov; best = i; }
      from = to;
    });
    if (cov <= 0) best = wearIndex(lo);
    if (Math.min(hi, WEARS[2][0]) - Math.max(lo, WEARS[1][0]) > 0) best = 2;
    defWearCache.set(skin.id, best);
    return best;
  }
  function skinValue(skin) {
    if (typeof skin.value === 'number') return skin.value;
    return priceAt(skin, defaultWear(skin)) ?? legacyValue(skin);
  }
  // Цена продажи предмета в токенах.
  const sellPrice = (it) => Math.max(1, Math.floor(itemValue(it) * (Number(CONFIG.economy.sellRate) || 1)));
  function itemValue(it) {
    const s = it && skinById.get(it.s);
    if (!s) return 0;
    const base = typeof s.value === 'number' ? s.value : (priceAt(s, wearIndex(it.f)) ?? legacyValue(s));
    return Math.max(1, Math.round(base * (it.st ? CONFIG.economy.statTrakValue : 1)));
  }

  function splitName(name) {
    const i = name.indexOf('|');
    if (i < 0) return { weapon: name, finish: '' };
    return { weapon: name.slice(0, i).trim(), finish: name.slice(i + 1).trim() };
  }
  const WEARS = [
    [0.07, 'Factory New', 'FN'],
    [0.15, 'Minimal Wear', 'MW'],
    [0.38, 'Field-Tested', 'FT'],
    [0.45, 'Well-Worn', 'WW'],
    [Infinity, 'Battle-Scarred', 'BS'],
  ];
  function wearOf(f) {
    const w = WEARS.find((x) => f < x[0]) || WEARS[WEARS.length - 1];
    return { name: w[1], short: w[2] };
  }
  function wearIndex(f) {
    const i = WEARS.findIndex((x) => f < x[0]);
    return i < 0 ? WEARS.length - 1 : i;
  }

  /* ── 3. Сохранение прогресса ────────────────────────────────────── */
  const KEY = 'radikdrop:v1';
  const LOCK_KEY = 'radikdrop:tick';
  const TAB_ID = Math.random().toString(36).slice(2);

  let storageOk = true;
  try {
    localStorage.setItem('radikdrop:probe', '1');
    localStorage.removeItem('radikdrop:probe');
  } catch (e) {
    storageOk = false;
  }
  function storageGet(key) {
    if (!storageOk) return null;
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(key, value) {
    if (!storageOk) return false;
    try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
  }

  function freshState() {
    const start = CONFIG.tokens.startBalance;
    return {
      v: 1,
      seq: 0,                 // счётчик для уникальных номеров предметов
      balance: start,
      day: todayKey(),
      earnedToday: 0,         // начислено за сегодня (для дневного лимита)
      tickMs: 0,              // накопленное время до следующего токена
      opens: 0,               // обычные открытия кейсов (для бонуса новичка)
      inventory: [],          // { u, s, f, st, t, src }
      drops: [],              // последние дропы для ленты: { u, s, st }
      usedCodes: [],          // хэши использованных одноразовых промокодов
      boost: null,            // { until, odds }
      stats: {
        cases: 0, tokensEarned: start, tokensSpent: 0, best: null, sold: 0, soldFor: 0,
        upgrades: 0, upgradesWon: 0, contracts: 0, battles: 0, battlesWon: 0,
      },
    };
  }

  function loadState() {
    const raw = storageGet(KEY);
    if (!raw) return freshState();
    try {
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') throw new Error('bad data');
      const base = freshState();
      const st = Object.assign(base, data);
      st.stats = Object.assign(freshState().stats, data.stats || {});
      for (const k of ['inventory', 'drops', 'usedCodes']) if (!Array.isArray(st[k])) st[k] = [];
      st.inventory = st.inventory.filter((it) => it && typeof it.s === 'string' && Number.isFinite(it.u));
      for (const k of ['seq', 'balance', 'earnedToday', 'tickMs', 'opens']) {
        if (!Number.isFinite(st[k]) || st[k] < 0) st[k] = base[k];
      }
      st.balance = Math.floor(st.balance);
      st.seq = Math.max(st.seq, ...st.inventory.map((it) => it.u), 0);
      if (st.boost && !(st.boost.until > 0 && st.boost.odds)) st.boost = null;
      return st;
    } catch (e) {
      console.warn('[RADIK DROP] Сохранение повреждено, начинаем заново', e);
      return freshState();
    }
  }

  let state = loadState();
  let saveFailed = false;
  function save() {
    if (!storageOk) return;
    if (!storageSet(KEY, JSON.stringify(state)) && !saveFailed) {
      saveFailed = true;
      $('#storage-notice').hidden = false;
      toast('Не получилось сохранить прогресс: хранилище браузера заполнено или недоступно', 'bad');
    }
  }

  const findItem = (u) => state.inventory.find((it) => it.u === u) || null;
  const ownedItems = () => state.inventory.filter((it) => skinById.has(it.s));

  /* ── 4. Токены ──────────────────────────────────────────────────── */
  let lastTick = Date.now();
  let tickCount = 0;

  function rollDay() {
    const d = todayKey();
    if (state.day !== d) {
      state.day = d;
      state.earnedToday = 0;
      save();
    }
  }

  // Если сайт открыт в нескольких вкладках, токены считает только одна.
  function holdTickLock(now) {
    if (!storageOk) return true;
    let lock = null;
    try { lock = JSON.parse(storageGet(LOCK_KEY) || 'null'); } catch (e) { lock = null; }
    if (!lock || lock.id === TAB_ID || now - lock.ts > 4000) {
      storageSet(LOCK_KEY, JSON.stringify({ id: TAB_ID, ts: now }));
      return true;
    }
    return false;
  }

  function tokenTick() {
    const now = Date.now();
    const dt = clamp(now - lastTick, 0, 2000);
    lastTick = now;
    rollDay();
    const T = CONFIG.tokens;
    const visible = !T.onlyVisibleTab || document.visibilityState === 'visible';
    if (visible && state.earnedToday < T.dailyLimit && holdTickLock(now)) {
      const need = T.tickSeconds * 1000;
      let changed = false;
      state.tickMs += dt;
      while (state.tickMs >= need && state.earnedToday < T.dailyLimit) {
        state.tickMs -= need;
        const add = Math.min(T.perTick, T.dailyLimit - state.earnedToday);
        state.balance += add;
        state.earnedToday += add;
        state.stats.tokensEarned += add;
        changed = true;
      }
      if (state.earnedToday >= T.dailyLimit) state.tickMs = 0;
      if (changed) {
        save();
        refreshView('balance');
      } else if (++tickCount % 5 === 0) {
        save();
      }
    }
    if (state.boost && state.boost.until <= now) {
      state.boost = null;
      save();
      refreshView();
    }
    renderHeader();
  }

  function tokenProgress() {
    const T = CONFIG.tokens;
    if (state.earnedToday >= T.dailyLimit) return 1;
    return clamp(state.tickMs / (T.tickSeconds * 1000), 0, 1);
  }

  function renderHeader() {
    $('#tokens-val').textContent = fmt(state.balance);
    const full = state.earnedToday >= CONFIG.tokens.dailyLimit;
    $('#tokens-bar').style.width = `${(tokenProgress() * 100).toFixed(1)}%`;
    const btn = $('#tokens-btn');
    btn.classList.toggle('is-full', full);
    btn.setAttribute('aria-label', `Токены: ${state.balance}. Подробнее`);
    if (!$('#drawer-wrap').hidden) renderDrawerTokens();
    const meter = $('#token-meter');
    if (meter) updateTokenModal();
  }

  function tokenInfoHtml() {
    const T = CONFIG.tokens;
    const full = state.earnedToday >= T.dailyLimit;
    return `
      <div class="kv"><span>Сегодня начислено</span><span id="tm-today">${state.earnedToday} из ${T.dailyLimit}</span></div>
      <div class="meter" aria-hidden="true"><i id="token-meter" style="width:${(tokenProgress() * 100).toFixed(1)}%"></i></div>
      <p class="hint" id="tm-next">${full ? 'Дневной лимит набран. Новые токены начнут капать завтра.' : `Следующий токен — через ${T.tickSeconds} секунд на открытой вкладке.`}</p>`;
  }
  function renderDrawerTokens() {
    $('#drawer-tokens').innerHTML = `<p class="token-info__big" style="font-size:1.8rem">${COIN}${fmt(state.balance)}</p>${tokenInfoHtml()}`;
  }
  function openTokenModal() {
    const T = CONFIG.tokens;
    openModal(`
      <div class="token-info">
        <h2 class="h2">Токены</h2>
        <p class="token-info__big">${COIN}<span id="tm-balance">${fmt(state.balance)}</span></p>
        <div>${tokenInfoHtml()}</div>
        <ul>
          <li>Токены начисляются, пока сайт открыт на экране: ${T.perTick} ${tokensWord(T.perTick)} каждые ${T.tickSeconds} секунд.</li>
          <li>За сутки можно получить до ${T.dailyLimit} ${tokensWord(T.dailyLimit)}. Потом начисление останавливается до завтра.</li>
          <li>Токены виртуальные: их нельзя купить, продать, вывести или обменять на что-то реальное.</li>
        </ul>
        <button class="btn" type="button" data-close>Понятно</button>
      </div>`);
  }
  function updateTokenModal() {
    const T = CONFIG.tokens;
    const full = state.earnedToday >= T.dailyLimit;
    $$('#token-meter').forEach((m) => { m.style.width = `${(tokenProgress() * 100).toFixed(1)}%`; });
    $$('#tm-today').forEach((m) => { m.textContent = `${state.earnedToday} из ${T.dailyLimit}`; });
    $$('#tm-next').forEach((m) => {
      m.textContent = full ? 'Дневной лимит набран. Новые токены начнут капать завтра.' : `Следующий токен — через ${T.tickSeconds} секунд на открытой вкладке.`;
    });
    const bal = $('#tm-balance');
    if (bal) bal.textContent = fmt(state.balance);
  }

  /* ── 5. Шансы и выпадение ───────────────────────────────────────── */
  const boostActive = () => !!(state.boost && state.boost.until > Date.now());
  const beginnerActive = () => !!(CONFIG.beginnerBonus && CONFIG.beginnerBonus.enabled && state.opens < CONFIG.beginnerBonus.opens);

  // ctx: 'display' — шансы на странице кейса; 'case' — обычное открытие;
  //      'battle' — ваши открытия в батле; 'base' — бот и декоративная лента.
  function oddsFor(c, ctx) {
    if (ctx !== 'base' && boostActive()) return state.boost.odds;
    if (ctx === 'case' && beginnerActive()) return CONFIG.beginnerBonus.odds;
    return c.odds || CONFIG.odds;
  }

  // Шансы только по редкостям, которые есть в кейсе, приведённые к сумме 100 %.
  function oddsRows(c, odds) {
    const tiers = tiersOf(c);
    const present = ORDER.filter((r) => tiers[r] && tiers[r].length);
    let rows = present.map((r) => ({ rarity: r, w: Math.max(0, Number(odds[r]) || 0) }));
    let total = sum(rows, (r) => r.w);
    if (total <= 0) {
      rows = present.map((r) => ({ rarity: r, w: 1 }));
      total = rows.length;
    }
    return rows.filter((r) => r.w > 0).map((r) => ({ rarity: r.rarity, pct: (r.w / total) * 100 }));
  }
  function pickRarity(rows) {
    let x = rand() * 100;
    for (const r of rows) {
      x -= r.pct;
      if (x < 0) return r.rarity;
    }
    return rows[rows.length - 1].rarity;
  }
  function makeItem(skin) {
    const [lo, hi] = Array.isArray(skin.float) ? skin.float : [0, 1];
    const f = Number((lo + rand() * (hi - lo)).toFixed(4));
    const st = skin.st !== false && rand() < CONFIG.economy.statTrakChance;
    return { s: skin.id, f, st };
  }
  function makeItemInWear(skin, wi) {
    const it = makeItem(skin);
    const [lo, hi] = Array.isArray(skin.float) ? skin.float : [0, 1];
    const a = Math.max(lo, wi > 0 ? WEARS[wi - 1][0] : 0);
    const b = Math.min(hi, Math.min(WEARS[wi][0], 1));
    if (b > a) it.f = clamp(Math.floor((a + rand() * (b - a)) * 10000) / 10000, Math.ceil(a * 10000) / 10000, b);
    return it;
  }
  function rollItem(c, ctx) {
    const rarity = pickRarity(oddsRows(c, oddsFor(c, ctx)));
    const pool = tiersOf(c)[rarity];
    return makeItem(pool[randInt(pool.length)]);
  }

  /* ── 6. Общие элементы интерфейса ───────────────────────────────── */
  // Предметы, которые уже в инвентаре, но ещё «крутятся» на экране.
  const pending = new Set();

  function addItems(items, src, { hidden = false } = {}) {
    const now = Date.now();
    for (const it of items) {
      state.seq += 1;
      it.u = state.seq;
      it.t = now;
      it.src = src;
      state.inventory.push(it);
      state.drops.unshift({ u: it.u, s: it.s, st: !!it.st });
      if (hidden) pending.add(it.u);
      const best = state.stats.best;
      if (!best || isBetter(it, best)) state.stats.best = { s: it.s, st: !!it.st, f: it.f };
    }
    state.drops = state.drops.slice(0, CONFIG.ui.liveDrops);
  }
  function isBetter(a, b) {
    const sa = skinById.get(a.s);
    const sb = skinById.get(b.s);
    if (!sb) return true;
    if (!sa) return false;
    const d = rankOf(sa.rarity) - rankOf(sb.rarity);
    return d !== 0 ? d > 0 : itemValue(a) > itemValue(b);
  }
  function removeItems(uids) {
    const set = new Set(uids);
    state.inventory = state.inventory.filter((it) => !set.has(it.u));
  }
  function reveal(uids) {
    uids.forEach((u) => pending.delete(u));
    renderLive(uids);
  }
  function flushPending() {
    if (!pending.size) return;
    const uids = [...pending];
    pending.clear();
    renderLive(uids);
  }

  function renderLive(fresh = []) {
    const list = state.drops.filter((d) => !pending.has(d.u) && skinById.has(d.s));
    const el = $('#live-list');
    if (!list.length) {
      el.innerHTML = '<span class="live__empty">Здесь появятся ваши дропы</span>';
      return;
    }
    el.innerHTML = list.map((d) => {
      const s = skinById.get(d.s);
      const isNew = fresh.includes(d.u) && !reducedMotion();
      return `<span class="drop r-${s.rarity}${isNew ? ' is-new' : ''}" title="${esc((d.st ? 'StatTrak™ ' : '') + s.name)}"><img src="${esc(imgUrl(s.image))}" alt="${esc(s.name)}" decoding="async"></span>`;
    }).join('');
  }

  // Карточка предмета из инвентаря (с износом и ценностью).
  function itemCard(it, { button = false, attrs = '', check = false, extra = '', wear = true } = {}) {
    const s = skinById.get(it.s);
    if (!s) return '';
    const { weapon, finish } = splitName(s.name);
    const w = wearOf(it.f);
    const tag = button ? 'button' : 'div';
    return `<${tag} class="item r-${s.rarity}"${button ? ' type="button"' : ''} ${attrs}>
      ${it.st ? '<span class="tag-st">StatTrak™</span>' : ''}
      ${check ? '<span class="item__check" aria-hidden="true"></span>' : ''}
      <img class="item__img" src="${esc(imgUrl(s.image))}" alt="" loading="lazy" decoding="async">
      <span class="item__weapon">${esc(weapon)}</span>
      <span class="item__name">${esc(finish || weapon)}</span>
      <span class="item__meta"><span>${wear ? `${w.short} · ${it.f.toFixed(3)}` : ''}</span><span class="val">◆ ${fmt(itemValue(it))}</span></span>
      ${extra}
    </${tag}>`;
  }
  // Карточка скина из каталога (без износа).
  function skinCard(s, { button = false, attrs = '', extra = '' } = {}) {
    const { weapon, finish } = splitName(s.name);
    const tag = button ? 'button' : 'div';
    return `<${tag} class="item r-${s.rarity}"${button ? ' type="button"' : ''} ${attrs}>
      <img class="item__img" src="${esc(imgUrl(s.image))}" alt="" loading="lazy" decoding="async">
      <span class="item__weapon">${esc(weapon)}</span>
      <span class="item__name">${esc(finish || weapon)}</span>
      <span class="item__meta"><span>${esc(RAR[s.rarity].name)} · ${WEARS[defaultWear(s)][2]}</span><span class="val">◆ ${fmt(skinValue(s))}</span></span>
      ${extra}
    </${tag}>`;
  }

  // Временная картинка кейса: нарисованный ящик в цвете кейса + скин-обложка.
  let artSeq = 0;
  function crateSvg(color) {
    const id = `crate${++artSeq}`;
    return `<svg class="crate" viewBox="0 0 240 180" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".92"/><stop offset="1" stop-color="#10131b"/></linearGradient>
        <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4258"/><stop offset=".55" stop-color="#232938"/><stop offset="1" stop-color="#151922"/></linearGradient>
        <pattern id="${id}p" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="9" fill="#ffffff" fill-opacity=".05"/></pattern>
      </defs>
      <path d="M38 14h164a8 8 0 0 1 8 8v80H30V22a8 8 0 0 1 8-8z" fill="url(#${id}l)"/>
      <path d="M38 14h164a8 8 0 0 1 8 8v80H30V22a8 8 0 0 1 8-8z" fill="url(#${id}p)" stroke="${color}" stroke-opacity=".6" stroke-width="1.5"/>
      <rect x="40" y="24" width="160" height="70" rx="3" fill="none" stroke="#ffffff" stroke-opacity=".07"/>
      <path d="M14 104h212l-9 60a8 8 0 0 1-8 7H31a8 8 0 0 1-8-7z" fill="url(#${id}b)" stroke="#06080c" stroke-opacity=".6"/>
      <rect x="12" y="97" width="216" height="11" rx="3" fill="${color}"/>
      <rect x="12" y="97" width="216" height="4" rx="2" fill="#ffffff" fill-opacity=".22"/>
      <rect x="54" y="116" width="20" height="26" rx="3" fill="#0e1117" stroke="${color}" stroke-opacity=".8"/>
      <rect x="166" y="116" width="20" height="26" rx="3" fill="#0e1117" stroke="${color}" stroke-opacity=".8"/>
      <rect x="88" y="139" width="64" height="18" rx="2" fill="#0e1117"/>
      <text x="120" y="152.5" text-anchor="middle" font-family="Oswald, 'Arial Narrow', sans-serif" font-size="11" font-weight="600" letter-spacing="1.6" fill="${color}">RADIK</text>
    </svg>`;
  }
  function caseCover(c) {
    const cover = skinById.get(c.cover);
    if (cover) return cover;
    const list = (skinsByCase.get(c.id) || []).filter((s) => s.rarity !== 'gold');
    return list.sort((a, b) => rankOf(b.rarity) - rankOf(a.rarity))[0] || null;
  }
  function caseArt(c) {
    const color = /^#[0-9a-f]{3,8}$/i.test(c.color || '') ? c.color : '#f08236';
    if (c.image) {
      const kind = c.imageStyle === 'plain' ? 'case-art--plain' : 'case-art--image';
      return `<span class="case-art ${kind}" style="--case-color:${color}"><img class="case-art__custom" src="${esc(imgUrl(c.image))}" alt="" loading="lazy" decoding="async"></span>`;
    }
    const cover = caseCover(c);
    return `<span class="case-art">${crateSvg(color)}${cover ? `<img class="crate-skin" src="${esc(imgUrl(cover.image))}" alt="" loading="lazy" decoding="async">` : ''}</span>`;
  }

  /* Модальное окно */
  let modalOnClose = null;
  let modalReturnFocus = null;
  function openModal(html, { wide = false, label = '', onClose = null } = {}) {
    const m = $('#modal');
    const box = $('.modal__box', m);
    if (!m.hidden) closeModal({ silent: true });
    box.className = `modal__box${wide ? ' modal__box--wide' : ''}`;
    box.setAttribute('aria-label', label || 'Окно');
    $('.modal__body', m).innerHTML = html;
    modalOnClose = onClose;
    modalReturnFocus = document.activeElement;
    m.hidden = false;
    m.classList.add('is-open');
    document.body.classList.add('no-scroll');
    box.scrollTop = 0;
    const focusTarget = $('[data-autofocus]', box) || $('.modal__body button, .modal__body a[href], .modal__body input', box) || $('.modal__close', box);
    if (focusTarget) focusTarget.focus({ preventScroll: true });
  }
  function closeModal({ silent = false } = {}) {
    const m = $('#modal');
    if (m.hidden) return;
    m.hidden = true;
    m.classList.remove('is-open');
    $('.modal__body', m).innerHTML = '';
    document.body.classList.remove('no-scroll');
    const cb = modalOnClose;
    modalOnClose = null;
    if (cb && !silent) cb();
    if (!silent && modalReturnFocus && document.contains(modalReturnFocus)) modalReturnFocus.focus({ preventScroll: true });
  }

  /* Всплывающее сообщение */
  let toastTimer = 0;
  function toast(text, type = '') {
    const t = $('#toast');
    t.textContent = text;
    t.className = `toast${type ? ` is-${type}` : ''}`;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2800);
  }

  /* Окно с выпавшим предметом */
  function showDrop(it, { title = 'Ваш дроп' } = {}) {
    const s = skinById.get(it.s);
    if (!s) return;
    const { weapon, finish } = splitName(s.name);
    const w = wearOf(it.f);
    openModal(`
      <div class="drop-view r-${s.rarity}">
        <p class="drop-view__title">${esc(title)}</p>
        <div class="drop-view__stage"><img src="${esc(imgUrl(s.image))}" alt="${esc(s.name)}"></div>
        <p class="drop-view__rarity">${esc(RAR[s.rarity].name)}${it.st ? ' · StatTrak™' : ''}</p>
        <h2 class="drop-view__name"><span>${esc(weapon)}</span>${esc(finish || weapon)}</h2>
        <p class="drop-view__meta">${w.name} · float ${it.f.toFixed(4)} · ценность ◆ ${fmt(itemValue(it))}</p>
        <div class="drop-view__bar"></div>
        <p class="hint" style="margin-inline:auto">Предмет добавлен в инвентарь.</p>
        <div class="drop-view__actions">
          <button class="btn" type="button" data-close data-autofocus>Готово</button>
          <button class="btn btn--ghost" type="button" data-to-upgrade="${it.u}">В апгрейд</button>
          <button class="btn btn--ghost" type="button" data-sell="${it.u}">Продать за ${fmt(sellPrice(it))} ${COIN}</button>
        </div>
      </div>`, { label: `${title}: ${s.name}` });
  }

  /* Окно с несколькими предметами (открытие нескольких кейсов за раз) */
  function showDrops(items, { title = 'Ваш дроп' } = {}) {
    const list = items.filter((it) => skinById.has(it.s));
    const total = sum(list, itemValue);
    const forUpgrade = list.slice(0, CONFIG.upgrade.maxItems).map((it) => it.u).join(',');
    openModal(`
      <div class="drop-view">
        <p class="drop-view__title">${esc(title)} · ${list.length} ${itemsWord(list.length)}</p>
        <div class="mini-list">${list.map((it) => itemCard(it)).join('')}</div>
        <p class="drop-view__meta" style="margin-top:14px">Общая ценность ◆ ${fmt(total)}</p>
        <p class="hint" style="margin-inline:auto">Все предметы добавлены в инвентарь.</p>
        <div class="drop-view__actions">
          <button class="btn" type="button" data-close data-autofocus>Готово</button>
          <button class="btn btn--ghost" type="button" data-to-upgrade="${forUpgrade}">В апгрейд</button>
          <button class="btn btn--ghost" type="button" data-sell="${list.map((it) => it.u).join(',')}">Продать всё за ${fmt(sum(list, sellPrice))} ${COIN}</button>
        </div>
      </div>`, { wide: list.length > 3, label: `${title}: ${list.length} ${itemsWord(list.length)}` });
  }

  /* Пауза между открытиями и «занятость» во время анимаций */
  let busy = false;
  let pauseUntil = 0;
  let pauseTimer = 0;
  const canAct = () => !busy && Date.now() >= pauseUntil;
  function startPause() {
    pauseUntil = Date.now() + CONFIG.ui.pauseMs;
    clearTimeout(pauseTimer);
    pauseTimer = setTimeout(() => refreshView(), CONFIG.ui.pauseMs + 30);
    refreshView();
  }
  // Общая логика главной кнопки действия: идёт анимация → пауза → не хватает ресурса → можно.
  function setActionButton(btn, { ready, label, blocked, busyLabel = 'Крутится…' }) {
    let mode;
    let text;
    if (busy) { mode = 'busy'; text = busyLabel; }
    else if (Date.now() < pauseUntil) { mode = 'pause'; text = 'Пауза…'; }
    else if (!ready) { mode = 'blocked'; text = blocked; }
    else { mode = 'ready'; text = label; }
    btn.disabled = mode !== 'ready';
    if (btn.dataset.mode !== mode) {
      btn.classList.toggle('is-paused', mode === 'pause');
      if (mode === 'pause') btn.style.setProperty('--pause', `${Math.max(0, pauseUntil - Date.now())}ms`);
      btn.dataset.mode = mode;
    }
    if (btn.dataset.text !== text) {
      btn.innerHTML = text;
      btn.dataset.text = text;
    }
  }

  /* Лента прокрутки (кейс и батл) */
  const REEL_LEN = 60;
  const REEL_WIN = 52;
  function reelTiles(items) {
    return items.map((it) => {
      const s = skinById.get(it.s);
      return `<div class="tile r-${s.rarity}"><img src="${esc(imgUrl(s.image))}" alt="" decoding="async"></div>`;
    }).join('');
  }
  function prepareReel(reel, c) {
    const track = $('.reel__track', reel);
    const items = Array.from({ length: 16 }, () => rollItem(c, 'base'));
    reel._rest = items;
    reel._start = null;
    track.innerHTML = reelTiles(items);
    track.style.transform = 'translate3d(0,0,0)';
  }
  // Декоративные предметы ленты выпадают по обычным шансам. Выигрыш стоит на
  // позиции REEL_WIN; рядом специально ничего «почти выпавшего» не подкладывается.
  function spinReel(reel, c, winItem, duration) {
    const track = $('.reel__track', reel);
    const keep = (reel._rest || []).slice(0, 10);
    const items = Array.from({ length: REEL_LEN }, (_, i) => {
      if (i === REEL_WIN) return winItem;
      if (i < keep.length) return keep[i];
      return rollItem(c, 'base');
    });
    if (typeof track.getAnimations === 'function') track.getAnimations().forEach((a) => a.cancel());
    // Новая лента начинается с тех же плиток, что видны сейчас, чтобы не было скачка.
    const viewW = reel.clientWidth;
    const startX = reel._start && reel._start.w === viewW ? reel._start.x : 0;
    track.style.transform = `translate3d(${startX}px,0,0)`;
    track.innerHTML = reelTiles(items);
    const first = track.children[0];
    const step = track.children[1].offsetLeft - first.offsetLeft;
    const tileW = first.offsetWidth;
    const inner = (0.14 + rand() * 0.72) * tileW;
    const endX = -(REEL_WIN * step + inner - viewW / 2);
    const finish = () => {
      track.style.transform = `translate3d(${endX}px,0,0)`;
      track.children[REEL_WIN].classList.add('is-win');
      reel._rest = items.slice(REEL_WIN - 4, REEL_WIN + 12);
      reel._start = { x: -(4 * step + inner - viewW / 2), w: viewW };
    };
    if (reducedMotion() || duration <= 0 || typeof track.animate !== 'function') {
      finish();
      return Promise.resolve();
    }
    const anim = track.animate(
      [{ transform: `translate3d(${startX}px,0,0)` }, { transform: `translate3d(${endX}px,0,0)` }],
      { duration, easing: 'cubic-bezier(0.08, 0.62, 0.1, 1)', fill: 'forwards' },
    );
    return anim.finished.then(() => { finish(); anim.cancel(); }, () => {});
  }

  /* ── 7. Экраны ──────────────────────────────────────────────────── */
  const view = { name: '', gen: 0, refresh: null };
  // reason: 'balance' — изменился только баланс токенов; без reason — обновить всё.
  function refreshView(reason) {
    if (typeof view.refresh === 'function') view.refresh(reason);
  }

  /* 7.1 Главная — список кейсов */
  function caseCard(c) {
    const n = (skinsByCase.get(c.id) || []).length;
    return `<a class="case-card" href="#case-${esc(c.id)}">
      <span class="case-card__head"><span class="case-card__name">${esc(c.name)}</span><span class="case-card__count">${n} ${itemsWord(n)}</span></span>
      ${caseArt(c)}
      <span class="price-tag">${fmt(c.price)} ${COIN}</span>
    </a>`;
  }
  function viewCases(main) {
    const known = new Set(CONFIG.sections.map((s) => s.id));
    const sections = CONFIG.sections.map((sec) => ({ title: sec.title, featured: !!sec.featured, list: playableCases.filter((c) => c.section === sec.id) }));
    const rest = playableCases.filter((c) => !known.has(c.section));
    if (rest.length) sections.push({ title: 'Другие кейсы', list: rest });
    const T = CONFIG.tokens;
    main.innerHTML = `
      <h1 class="sr-only">Кейсы</h1>
      <p class="home-note">Открывайте кейсы за токены. Токены капают, пока сайт открыт: ${T.perTick} каждые ${T.tickSeconds} секунд, до ${T.dailyLimit} в день.</p>
      ${sections.filter((s) => s.list.length).map((s) => `
        <section class="shelf">
          <h2 class="section-title"><span>${esc(s.title)}</span></h2>
          <div class="case-grid${s.featured ? ' case-grid--featured' : ''}">${s.list.map(caseCard).join('')}</div>
        </section>`).join('')}
      ${playableCases.length ? '' : '<p class="empty">В CONFIG нет ни одного кейса со скинами.</p>'}`;
  }

  /* 7.2 Страница кейса */
  const byRarityDesc = (a, b) => rankOf(b.rarity) - rankOf(a.rarity) || skinValue(b) - skinValue(a) || a.name.localeCompare(b.name);
  function viewCase(main, id) {
    const c = caseById.get(id);
    const list = c ? skinsByCase.get(c.id) : null;
    if (!c || !list || !list.length) {
      main.innerHTML = `<a class="back" href="#cases">${ICON.back}Все кейсы</a><p class="empty">Такого кейса нет.</p>`;
      return;
    }
    const regular = list.filter((s) => s.rarity !== 'gold').sort(byRarityDesc);
    const gold = list.filter((s) => s.rarity === 'gold').sort(byRarityDesc);
    main.innerHTML = `
      <a class="back" href="#cases">${ICON.back}Все кейсы</a>
      <div class="case-hero">
        <div class="case-hero__art">${caseArt(c)}</div>
        <div class="case-hero__info">
          <h1 class="page-title">${esc(c.name)}</h1>
          <p>${list.length} ${itemsWord(list.length)} · цена ${fmt(c.price)} ${tokensWord(c.price)}</p>
        </div>
      </div>
      <div class="reels" id="reels"></div>
      <div class="open-row">
        ${maxOpen() > 1 ? `<div class="chips open-count" id="open-count" role="group" aria-label="Сколько кейсов открыть за раз">
          ${Array.from({ length: maxOpen() }, (_, i) => `<button class="chip" type="button" data-count="${i + 1}" aria-pressed="false">×${i + 1}</button>`).join('')}
        </div>` : ''}
        <button class="btn btn--big" id="open-btn" type="button"></button>
        <p class="hint" id="open-hint"></p>
      </div>
      <div class="case-info">
        <section class="panel" aria-labelledby="odds-h">
          <h2 class="h2" id="odds-h">Шансы</h2>
          <ul class="odds__list" id="odds-list"></ul>
        </section>
        <section aria-labelledby="contents-h">
          <h2 class="h2" id="contents-h">Содержимое кейса</h2>
          <div class="item-grid">${regular.map((s) => skinCard(s)).join('')}</div>
          ${gold.length ? `<h3 class="h3 gold-title">★ Редкие особые предметы</h3><div class="item-grid">${gold.map((s) => skinCard(s)).join('')}</div>` : ''}
        </section>
      </div>`;
    openCount = Math.min(openCount, maxOpen());
    renderReels(c);
    const countEl = $('#open-count');
    if (countEl) {
      countEl.addEventListener('click', (e) => {
        const b = e.target.closest('[data-count]');
        if (!b || busy) return;
        openCount = Number(b.dataset.count);
        renderReels(c);
        renderCaseControls(c);
      });
    }
    $('#open-btn').addEventListener('click', () => openCase(c));
    view.refresh = () => renderCaseControls(c);
    renderCaseControls(c);
  }

  // Сколько кейсов открыть за раз (кнопки ×1…×N). Запоминается до перезагрузки страницы.
  let openCount = 1;
  const maxOpen = () => clamp(Math.floor(Number(CONFIG.ui.maxOpen) || 1), 1, 10);
  function renderReels(c) {
    const box = $('#reels');
    if (!box) return;
    const n = openCount;
    box.classList.toggle('is-multi', n > 1);
    box.innerHTML = Array.from({ length: n }, () => `<div class="reel${n > 1 ? ' reel--multi' : ''}" aria-hidden="true"><div class="reel__track"></div><span class="reel__marker"></span></div>`).join('');
    $$('.reel', box).forEach((r) => prepareReel(r, c));
  }
  function renderCaseControls(c) {
    const btn = $('#open-btn');
    if (!btn) return;
    const n = openCount;
    const cost = c.price * n;
    const lack = cost - state.balance;
    setActionButton(btn, {
      ready: lack <= 0,
      label: n > 1 ? `Открыть ${n} за ${fmt(cost)} ${COIN}` : `Открыть за ${fmt(cost)} ${COIN}`,
      blocked: `Нужно ещё ${fmt(lack)} ${COIN}`,
    });
    $$('#open-count [data-count]').forEach((b) => {
      b.setAttribute('aria-pressed', String(Number(b.dataset.count) === n));
      b.disabled = busy;
    });
    const hint = $('#open-hint');
    hint.textContent = lack > 0 && !busy
      ? `Токены капают, пока сайт открыт: ${CONFIG.tokens.perTick} каждые ${CONFIG.tokens.tickSeconds} секунд.`
      : '';
    const rows = oddsRows(c, oddsFor(c, 'display'));
    const tiers = tiersOf(c);
    $('#odds-list').innerHTML = rows.map((r) => `
      <li class="r-${r.rarity}"><span class="dot"></span><span class="odds__name">${esc(RAR[r.rarity].name)}</span><span class="odds__count">${tiers[r.rarity].length} шт.</span><span class="odds__pct">${pct(r.pct)}</span></li>`).join('');
  }
  function openCase(c) {
    const n = openCount;
    const cost = c.price * n;
    if (!canAct() || state.balance < cost) return;
    // Каждый кейс разыгрывается отдельно; счётчик открытий растёт после каждого.
    const items = [];
    for (let i = 0; i < n; i++) {
      items.push(rollItem(c, 'case'));
      state.opens += 1;
    }
    state.balance -= cost;
    state.stats.tokensSpent += cost;
    state.stats.cases += n;
    addItems(items, 'case', { hidden: true });
    save();
    busy = true;
    renderHeader();
    renderCaseControls(c);
    if ($$('#reels .reel').length !== n) renderReels(c);
    const reels = $$('#reels .reel');
    // Если ленты не помещаются в видимую часть экрана, прокручиваем к ним.
    const box = $('#reels');
    const rect = box.getBoundingClientRect();
    const headerBottom = $('.topbar').getBoundingClientRect().bottom;
    if (rect.top < headerBottom || rect.bottom > window.innerHeight) {
      box.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
    }
    const gen = view.gen;
    Promise.all(items.map((it, i) => spinReel(reels[i], c, it, CONFIG.ui.spinMs))).then(async () => {
      if (gen !== view.gen) return;
      await sleep(reducedMotion() ? 0 : 350);
      if (gen !== view.gen) return;
      busy = false;
      reveal(items.map((it) => it.u));
      if (n === 1) showDrop(items[0]);
      else showDrops(items);
      startPause();
    });
  }

  /* 7.3 Апгрейд */
  const upg = { input: [], target: null, running: null };
  let dialDeg = 0;
  const DIAL_R = 118;
  const DIAL_C = 2 * Math.PI * DIAL_R;

  function dialSvg() {
    const ticks = [];
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const long = i % 6 === 0;
      const r1 = long ? 135 : 139;
      const r2 = 146;
      ticks.push(`<line x1="${(150 + r1 * Math.sin(a)).toFixed(2)}" y1="${(150 - r1 * Math.cos(a)).toFixed(2)}" x2="${(150 + r2 * Math.sin(a)).toFixed(2)}" y2="${(150 - r2 * Math.cos(a)).toFixed(2)}"${long ? ' class="long"' : ''}/>`);
    }
    return `<svg viewBox="0 0 300 300" aria-hidden="true">
      <g class="dial__ticks">${ticks.join('')}</g>
      <circle class="dial__track" cx="150" cy="150" r="${DIAL_R}"/>
      <circle class="dial__arc" id="dial-arc" cx="150" cy="150" r="${DIAL_R}" transform="rotate(-90 150 150)" stroke-dasharray="0 ${DIAL_C.toFixed(2)}"/>
      <circle class="dial__ring" cx="150" cy="150" r="${DIAL_R + 13}"/>
      <circle class="dial__ring" cx="150" cy="150" r="${DIAL_R - 13}"/>
    </svg>`;
  }

  function upgradeCalc() {
    if (upg.running) return upg.running;
    const items = upg.input.map(findItem).filter((it) => it && skinById.has(it.s));
    const inVal = sum(items, itemValue);
    const t = upg.target ? skinById.get(upg.target) || null : null;
    const tVal = t ? skinValue(t) : 0;
    let chance = 0;
    if (inVal > 0 && tVal > 0) chance = Math.min(CONFIG.upgrade.maxChance, (inVal / tVal) * 100);
    const valid = items.length > 0 && !!t && tVal > inVal && chance >= CONFIG.upgrade.minChance;
    return { items, inVal, t, tVal, chance, valid };
  }

  function viewUpgrade(main, arg) {
    upg.running = null;
    upg.input = upg.input.filter((u) => findItem(u));
    dialDeg = 0;
    main.innerHTML = `
      <h1 class="page-title">Апгрейд</h1>
      <p class="lead">Поставьте свои предметы ради более ценного. Шанс зависит от ценности предметов и показан честно.</p>
      <div class="upgrade">
        <div class="dial" id="dial">
          ${dialSvg()}
          <div class="dial__pointer" id="dial-pointer"></div>
          <div class="dial__center"><span class="dial__pct" id="dial-pct">0%</span><span class="dial__label">шанс</span></div>
        </div>
        <div class="upgrade__side">
          <div class="slots">
            <button class="slot" id="slot-in" type="button"></button>
            <span class="slot-arrow">${ICON.arrow}</span>
            <button class="slot" id="slot-target" type="button"></button>
          </div>
          <div class="chips mults" id="mults" aria-label="Подобрать цель по множителю">
            ${[1.5, 2, 3, 5, 10].map((k) => `<button class="chip" type="button" data-mult="${k}">×${String(k).replace('.', ',')}</button>`).join('')}
          </div>
          <button class="btn btn--big" id="upg-btn" type="button"></button>
          <p class="hint">Шанс = ценность ваших предметов ÷ ценность цели, но не больше ${CONFIG.upgrade.maxChance}%. Если не повезёт, поставленные предметы пропадут. ◆ — ценность предмета. В инвентаре предмет можно продать за токены.</p>
        </div>
      </div>`;
    $('#slot-in').addEventListener('click', pickUpgradeInput);
    $('#slot-target').addEventListener('click', pickUpgradeTarget);
    $('#mults').addEventListener('click', (e) => {
      const b = e.target.closest('[data-mult]');
      if (b) autoTarget(Number(b.dataset.mult));
    });
    $('#upg-btn').addEventListener('click', doUpgrade);
    view.refresh = renderUpgrade;
    renderUpgrade();
  }

  function renderUpgrade() {
    const slotIn = $('#slot-in');
    if (!slotIn) return;
    const calc = upgradeCalc();
    const { items, inVal, t, tVal, chance } = calc;

    slotIn.disabled = busy;
    if (items.length === 1) {
      const s = skinById.get(items[0].s);
      const { weapon, finish } = splitName(s.name);
      slotIn.classList.add('is-filled');
      slotIn.style.setProperty('--rc', `var(--r-${s.rarity})`);
      slotIn.innerHTML = `
        <img class="slot__img" src="${esc(imgUrl(s.image))}" alt="">
        <span class="slot__sub">${items[0].st ? 'StatTrak™ ' : ''}${esc(weapon)}</span>
        <span class="slot__label">${esc(finish || weapon)}</span>
        <span class="slot__value">◆ ${fmt(inVal)}</span>`;
    } else if (items.length) {
      const shown = items.slice(0, items.length > 4 ? 3 : 4);
      slotIn.classList.add('is-filled');
      slotIn.style.removeProperty('--rc');
      slotIn.innerHTML = `
        <span class="slot__thumbs">${shown.map((it) => { const s = skinById.get(it.s); return `<img class="r-${s.rarity}" src="${esc(imgUrl(s.image))}" alt="${esc(s.name)}">`; }).join('')}${items.length > 4 ? `<span class="slot__more">+${items.length - 3}</span>` : ''}</span>
        <span class="slot__sub">${items.length} ${itemsWord(items.length)}</span>
        <span class="slot__value">◆ ${fmt(inVal)}</span>`;
    } else {
      slotIn.classList.remove('is-filled');
      slotIn.innerHTML = '<span class="slot__plus">+</span><span class="slot__label">Ваши предметы</span><span class="slot__sub">Нажмите, чтобы выбрать</span>';
    }

    const slotT = $('#slot-target');
    slotT.disabled = busy;
    if (t) {
      const { weapon, finish } = splitName(t.name);
      slotT.classList.add('is-filled');
      slotT.style.setProperty('--rc', `var(--r-${t.rarity})`);
      slotT.innerHTML = `
        <img class="slot__img" src="${esc(imgUrl(t.image))}" alt="">
        <span class="slot__sub">${esc(weapon)} · ${WEARS[defaultWear(t)][1]}</span>
        <span class="slot__label">${esc(finish || weapon)}</span>
        <span class="slot__value">◆ ${fmt(tVal)}</span>`;
    } else {
      slotT.classList.remove('is-filled');
      slotT.style.removeProperty('--rc');
      slotT.innerHTML = '<span class="slot__plus">+</span><span class="slot__label">Цель</span><span class="slot__sub">Выберите предмет</span>';
    }

    if (!upg.running && !busy && items.length) $('#dial').classList.remove('is-win');
    const shownChance = items.length && t ? chance : 0;
    $('#dial-pct').textContent = items.length && t ? pct(shownChance) : '—';
    $('#dial-arc').setAttribute('stroke-dasharray', `${((shownChance / 100) * DIAL_C).toFixed(2)} ${DIAL_C.toFixed(2)}`);
    $$('#mults .chip').forEach((b) => { b.disabled = busy || !items.length; });

    let blocked = 'Выберите предметы';
    if (items.length && !t) blocked = 'Выберите цель';
    else if (items.length && t && tVal <= inVal) blocked = 'Цель должна быть ценнее';
    else if (items.length && t && chance < CONFIG.upgrade.minChance) blocked = `Шанс меньше ${CONFIG.upgrade.minChance}%`;
    setActionButton($('#upg-btn'), { ready: calc.valid, label: `Апгрейд · ${pct(chance)}`, blocked });
  }

  function emptyInventoryHtml(text) {
    return `<div class="empty"><p>${esc(text)}</p><a class="btn" href="#cases">К кейсам</a></div>`;
  }

  function pickUpgradeInput() {
    if (busy) return;
    const items = ownedItems().sort((a, b) => itemValue(b) - itemValue(a));
    if (!items.length) {
      openModal(`<h2 class="h2">Ваши предметы</h2>${emptyInventoryHtml('Инвентарь пуст. Откройте кейс, и предмет появится здесь.')}`);
      return;
    }
    const max = CONFIG.upgrade.maxItems;
    const sel = new Set(upg.input.filter((u) => findItem(u)));
    openModal(`
      <h2 class="h2">Ваши предметы</h2>
      <p class="hint" style="margin:0 0 12px">Можно выбрать до ${max}. Сначала самые ценные.</p>
      <div class="item-grid" id="pick-grid">${items.map((it) => itemCard(it, { button: true, check: true, attrs: `data-u="${it.u}"` })).join('')}</div>
      <div class="modal__foot"><span id="pick-sum"></span><button class="btn" type="button" data-close>Готово</button></div>`,
    { wide: true, label: 'Выбор предметов для апгрейда', onClose: () => { upg.input = [...sel]; renderUpgrade(); } });
    const grid = $('#pick-grid');
    const sync = () => {
      $$('[data-u]', grid).forEach((b) => {
        const on = sel.has(Number(b.dataset.u));
        b.classList.toggle('is-selected', on);
        b.setAttribute('aria-pressed', String(on));
      });
      const v = sum([...sel], (u) => itemValue(findItem(u)));
      $('#pick-sum').textContent = `Выбрано ${sel.size} из ${max} · ◆ ${fmt(v)}`;
    };
    grid.addEventListener('click', (e) => {
      const b = e.target.closest('[data-u]');
      if (!b) return;
      const u = Number(b.dataset.u);
      if (sel.has(u)) sel.delete(u);
      else if (sel.size < max) sel.add(u);
      else toast(`Можно поставить не больше ${max} предметов`);
      sync();
    });
    sync();
  }

  function pickUpgradeTarget() {
    if (busy) return;
    const { inVal } = upgradeCalc();
    const all = [...skinById.values()].filter((s) => skinValue(s) > inVal).sort((a, b) => skinValue(a) - skinValue(b) || a.name.localeCompare(b.name));
    const rarities = ORDER.filter((r) => all.some((s) => s.rarity === r));
    let filter = 'all';
    let query = '';
    openModal(`
      <h2 class="h2">Цель апгрейда</h2>
      <div class="picker-tools">
        <label class="sr-only" for="tgt-search">Поиск по названию</label>
        <input class="input" id="tgt-search" type="search" placeholder="Поиск: AK-47, Fade, Karambit…" autocomplete="off">
        <div class="chips" id="tgt-chips">
          <button class="chip" type="button" data-r="all" aria-pressed="true">Все</button>
          ${rarities.map((r) => `<button class="chip r-${r}" type="button" data-r="${r}" aria-pressed="false"><span class="dot"></span>${esc(RAR[r].name)}</button>`).join('')}
        </div>
      </div>
      <div class="item-grid" id="tgt-grid"></div>`, { wide: true, label: 'Выбор цели апгрейда' });
    const grid = $('#tgt-grid');
    const render = () => {
      const q = query.trim().toLowerCase();
      const list = all.filter((s) => (filter === 'all' || s.rarity === filter) && (!q || s.name.toLowerCase().includes(q)));
      const LIMIT = 150;
      grid.innerHTML = list.length
        ? list.slice(0, LIMIT).map((s) => {
          const ch = inVal > 0 ? Math.min(CONFIG.upgrade.maxChance, (inVal / skinValue(s)) * 100) : null;
          const extra = ch === null ? '' : `<span class="item__pct">${ch < CONFIG.upgrade.minChance ? `< ${CONFIG.upgrade.minChance}%` : pct(ch)}</span>`;
          return skinCard(s, { button: true, attrs: `data-id="${esc(s.id)}"${upg.target === s.id ? ' aria-pressed="true"' : ''}`, extra });
        }).join('') + (list.length > LIMIT ? `<p class="hint" style="grid-column:1/-1">Показаны ${LIMIT} из ${fmt(list.length)}. Уточните поиск, чтобы найти нужный скин.</p>` : '')
        : '<p class="empty" style="grid-column:1/-1">Ничего не найдено.</p>';
    };
    $('#tgt-search').addEventListener('input', (e) => { query = e.target.value; render(); });
    $('#tgt-chips').addEventListener('click', (e) => {
      const b = e.target.closest('[data-r]');
      if (!b) return;
      filter = b.dataset.r;
      $$('[data-r]', $('#tgt-chips')).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      render();
    });
    grid.addEventListener('click', (e) => {
      const b = e.target.closest('[data-id]');
      if (!b) return;
      upg.target = b.dataset.id;
      closeModal();
      renderUpgrade();
    });
    render();
  }

  function autoTarget(k) {
    if (busy) return;
    const { inVal } = upgradeCalc();
    if (!inVal) {
      toast('Сначала выберите свои предметы');
      return;
    }
    const goal = inVal * k;
    let best = null;
    let bestDiff = Infinity;
    for (const s of skinById.values()) {
      const v = skinValue(s);
      if (v <= inVal) continue;
      const diff = Math.abs(Math.log(v / goal));
      if (diff < bestDiff) { best = s; bestDiff = diff; }
    }
    if (!best) {
      toast('Ценнее ваших предметов ничего нет');
      return;
    }
    upg.target = best.id;
    renderUpgrade();
  }

  function spinDial(pointer, targetDeg, duration) {
    const from = dialDeg;
    const to = from - (from % 360) + 360 * 5 + targetDeg;
    const done = () => {
      dialDeg = to % 360;
      pointer.style.transform = `rotate(${dialDeg}deg)`;
    };
    if (reducedMotion() || typeof pointer.animate !== 'function') {
      done();
      return Promise.resolve();
    }
    const anim = pointer.animate(
      [{ transform: `rotate(${from}deg)` }, { transform: `rotate(${to}deg)` }],
      { duration, easing: 'cubic-bezier(0.12, 0.7, 0.1, 1)', fill: 'forwards' },
    );
    return anim.finished.then(() => { done(); anim.cancel(); }, () => {});
  }

  function doUpgrade() {
    const calc = upgradeCalc();
    if (!canAct() || !calc.valid) return;
    const win = rand() * 100 < calc.chance;
    removeItems(calc.items.map((it) => it.u));
    upg.input = [];
    state.stats.upgrades += 1;
    let prize = null;
    if (win) {
      prize = makeItemInWear(calc.t, defaultWear(calc.t));
      prize.st = false;
      addItems([prize], 'upgrade', { hidden: true });
      state.stats.upgradesWon += 1;
    }
    save();
    upg.running = calc;
    busy = true;
    $('#dial').classList.remove('is-win');
    renderUpgrade();
    // Стрелка останавливается в случайной точке своего сектора.
    const span = (calc.chance / 100) * 360;
    const deg = win ? span * (0.04 + rand() * 0.92) : span + (360 - span) * (0.04 + rand() * 0.92);
    const gen = view.gen;
    spinDial($('#dial-pointer'), deg, CONFIG.ui.upgradeSpinMs).then(async () => {
      if (gen !== view.gen) return;
      if (win) $('#dial').classList.add('is-win');
      await sleep(reducedMotion() ? 0 : 350);
      if (gen !== view.gen) return;
      busy = false;
      upg.running = null;
      if (win) {
        reveal([prize.u]);
        showDrop(prize, { title: 'Апгрейд удался' });
      } else {
        openModal(`
          <h2 class="h2">Апгрейд не удался</h2>
          <p class="hint" style="margin-top:0">Эти предметы сгорели:</p>
          <div class="mini-list">${calc.items.map((it) => itemCard(it)).join('')}</div>
          <div class="confirm-actions"><button class="btn" type="button" data-close data-autofocus>Понятно</button></div>`, { label: 'Апгрейд не удался' });
      }
      startPause();
      renderUpgrade();
    });
  }

  /* 7.4 Контракты */
  const con = { sel: [], filter: 'all' };
  const contractNeed = (r) => (r === 'covert' ? CONFIG.contract.coverToGold : CONFIG.contract.items);
  function conRarity() {
    const it = findItem(con.sel[0]);
    const s = it && skinById.get(it.s);
    return s ? s.rarity : null;
  }
  // Возможные результаты: каждый отданный предмет «голосует» за свой кейс.
  function contractOutcomes(items) {
    const r = skinById.get(items[0].s).rarity;
    const next = nextRarity(r);
    const odds = new Map();
    for (const it of items) {
      const s = skinById.get(it.s);
      let pool = [...new Set(casesOf(s).flatMap((c) => tiersOf(c)[next] || []))];
      if (!pool.length) pool = [...skinById.values()].filter((x) => x.rarity === next);
      for (const p of pool) odds.set(p.id, (odds.get(p.id) || 0) + 1 / items.length / pool.length);
    }
    return [...odds.entries()].map(([id, p]) => ({ s: skinById.get(id), p })).sort((a, b) => b.p - a.p || byRarityDesc(a.s, b.s));
  }
  const contractEligible = (it) => {
    const s = skinById.get(it.s);
    return !!(s && nextRarity(s.rarity));
  };

  function viewContracts(main) {
    con.sel = con.sel.filter((u) => findItem(u));
    main.innerHTML = `
      <h1 class="page-title">Контракты</h1>
      <p class="lead">Отдайте ${CONFIG.contract.items} предметов одной редкости и получите 1 предмет следующей редкости. Он выпадет из тех же кейсов, что и отданные предметы. Чтобы получить ★ из Covert, нужно ${CONFIG.contract.coverToGold}.</p>
      <div class="contract">
        <div class="contract__slots" id="con-slots"></div>
        <div class="contract__side">
          <p class="contract__status" id="con-status"></p>
          <div class="contract__btns">
            <button class="btn btn--big" id="con-sign" type="button"></button>
            <button class="btn btn--ghost" id="con-auto" type="button">Заполнить</button>
            <button class="btn btn--ghost" id="con-clear" type="button">Очистить</button>
          </div>
          <div class="outcomes" id="con-out"></div>
        </div>
      </div>
      <h2 class="h2">Ваши предметы</h2>
      <div class="inv-tools"><div class="chips" id="con-chips"></div></div>
      <div class="item-grid" id="con-grid"></div>`;
    $('#con-grid').addEventListener('click', (e) => {
      const b = e.target.closest('[data-u]');
      if (b) toggleContractItem(Number(b.dataset.u));
    });
    $('#con-slots').addEventListener('click', (e) => {
      const b = e.target.closest('[data-u]');
      if (b) toggleContractItem(Number(b.dataset.u));
    });
    $('#con-chips').addEventListener('click', (e) => {
      const b = e.target.closest('[data-r]');
      if (!b) return;
      con.filter = b.dataset.r;
      renderContract();
    });
    $('#con-sign').addEventListener('click', signContract);
    $('#con-auto').addEventListener('click', autoFillContract);
    $('#con-clear').addEventListener('click', () => { if (!busy) { con.sel = []; renderContract(); } });
    view.refresh = (reason) => { if (reason !== 'balance') renderContract(); };
    renderContract();
  }

  function toggleContractItem(u) {
    if (busy) return;
    const it = findItem(u);
    if (!it || !contractEligible(it)) return;
    const i = con.sel.indexOf(u);
    if (i >= 0) {
      con.sel.splice(i, 1);
    } else {
      const r = conRarity();
      const s = skinById.get(it.s);
      if (r && s.rarity !== r) {
        toast('В контракте все предметы должны быть одной редкости');
        return;
      }
      if (con.sel.length >= contractNeed(s.rarity)) {
        toast('Контракт уже заполнен');
        return;
      }
      con.sel.push(u);
    }
    renderContract();
  }

  function autoFillContract() {
    if (busy) return;
    const items = ownedItems().filter(contractEligible);
    const counts = {};
    for (const it of items) {
      const r = skinById.get(it.s).rarity;
      counts[r] = (counts[r] || 0) + 1;
    }
    let r = conRarity() || (con.filter !== 'all' ? con.filter : null);
    if (!r) r = ORDER.find((x) => (counts[x] || 0) >= contractNeed(x)) || null;
    if (!r) {
      toast('Не хватает предметов одной редкости для контракта');
      return;
    }
    const need = contractNeed(r);
    const pool = items
      .filter((it) => skinById.get(it.s).rarity === r && !con.sel.includes(it.u))
      .sort((a, b) => itemValue(a) - itemValue(b));
    while (con.sel.length < need && pool.length) con.sel.push(pool.shift().u);
    if (con.sel.length < need) toast(`Нужно ${need} ${RAR[r].name}, а у вас ${con.sel.length}`);
    renderContract();
  }

  function renderContract() {
    const slotsEl = $('#con-slots');
    if (!slotsEl) return;
    con.sel = con.sel.filter((u) => findItem(u));
    const r = conRarity();
    const need = r ? contractNeed(r) : CONFIG.contract.items;
    const next = r ? nextRarity(r) : null;
    const selItems = con.sel.map(findItem);

    slotsEl.innerHTML = Array.from({ length: need }, (_, i) => {
      const it = selItems[i];
      if (!it) return `<span class="cslot">${i + 1}</span>`;
      const s = skinById.get(it.s);
      return `<button class="cslot is-filled r-${s.rarity}" type="button" data-u="${it.u}" title="Убрать: ${esc(s.name)}" aria-label="Убрать ${esc(s.name)}"><img src="${esc(imgUrl(s.image))}" alt=""></button>`;
    }).join('');

    $('#con-status').innerHTML = r
      ? `<span style="color:var(--r-${r})">${esc(RAR[r].name)}</span> <span class="arrow">→</span> <span style="color:var(--r-${next})">${esc(RAR[next].name)}</span> · ${con.sel.length}/${need}`
      : 'Выберите предметы ниже';

    const outEl = $('#con-out');
    if (r && selItems.length) {
      const outs = contractOutcomes(selItems);
      outEl.innerHTML = `<h3 class="h3" style="margin-top:4px">Возможные результаты</h3>
        <div class="item-grid">${outs.slice(0, 24).map((o) => skinCard(o.s, { extra: `<span class="item__pct">${pct(o.p * 100)}</span>` })).join('')}</div>
        ${outs.length > 24 ? `<p class="hint">И ещё ${outs.length - 24} ${itemsWord(outs.length - 24)}.</p>` : ''}`;
    } else {
      outEl.innerHTML = '<p class="hint" style="margin:0">Здесь появятся предметы, которые могут выпасть, и их шансы.</p>';
    }

    const items = ownedItems().filter(contractEligible);
    const counts = {};
    for (const it of items) {
      const rr = skinById.get(it.s).rarity;
      counts[rr] = (counts[rr] || 0) + 1;
    }
    const present = ORDER.filter((x) => counts[x]);
    if (con.filter !== 'all' && !counts[con.filter]) con.filter = 'all';
    $('#con-chips').innerHTML = items.length
      ? `<button class="chip" type="button" data-r="all" aria-pressed="${con.filter === 'all'}">Все <span class="n">${items.length}</span></button>
         ${present.map((x) => `<button class="chip r-${x}" type="button" data-r="${x}" aria-pressed="${con.filter === x}"><span class="dot"></span>${esc(RAR[x].name)} <span class="n">${counts[x]}</span></button>`).join('')}`
      : '';

    const shown = items
      .filter((it) => con.filter === 'all' || skinById.get(it.s).rarity === con.filter)
      .sort((a, b) => rankOf(skinById.get(a.s).rarity) - rankOf(skinById.get(b.s).rarity) || itemValue(a) - itemValue(b));
    $('#con-grid').innerHTML = shown.length
      ? shown.map((it) => {
        const s = skinById.get(it.s);
        const on = con.sel.includes(it.u);
        const dim = !on && r && s.rarity !== r;
        return itemCard(it, { button: true, check: true, attrs: `data-u="${it.u}" aria-pressed="${on}"${on ? ' data-on' : ''}${dim ? ' data-dim' : ''}` });
      }).join('')
      : `<div style="grid-column:1/-1">${emptyInventoryHtml('Для контракта нужны предметы из кейсов. Ножи и перчатки в контракт не идут.')}</div>`;
    $$('#con-grid [data-on]').forEach((b) => b.classList.add('is-selected'));
    $$('#con-grid [data-dim]').forEach((b) => b.classList.add('is-dim'));

    const full = !!r && con.sel.length === need;
    setActionButton($('#con-sign'), {
      ready: full,
      label: 'Подписать контракт',
      blocked: r ? `Добавьте ещё ${need - con.sel.length}` : 'Подписать контракт',
      busyLabel: 'Подписываем…',
    });
    $('#con-auto').disabled = busy || (!!r && con.sel.length >= need);
    $('#con-clear').disabled = busy || !con.sel.length;
  }

  function signContract() {
    const r = conRarity();
    const items = con.sel.map(findItem).filter(Boolean);
    if (!canAct() || !r || items.length !== contractNeed(r)) return;
    const outs = contractOutcomes(items);
    let x = rand();
    let pick = outs[outs.length - 1].s;
    for (const o of outs) {
      x -= o.p;
      if (x < 0) { pick = o.s; break; }
    }
    const prize = makeItem(pick);
    // StatTrak™ на выходе, только если все отданные предметы были StatTrak™.
    prize.st = pick.st !== false && items.every((it) => it.st);
    removeItems(items.map((it) => it.u));
    con.sel = [];
    addItems([prize], 'contract', { hidden: true });
    state.stats.contracts += 1;
    save();
    busy = true;
    const slots = $('#con-slots');
    slots.classList.add('is-signing');
    slots.style.setProperty('--sign', `${CONFIG.ui.contractMs}ms`);
    renderContractButtonsOnly();
    const gen = view.gen;
    sleep(reducedMotion() ? 0 : CONFIG.ui.contractMs).then(() => {
      if (gen !== view.gen) return;
      busy = false;
      slots.classList.remove('is-signing');
      reveal([prize.u]);
      showDrop(prize, { title: 'Контракт выполнен' });
      startPause();
    });
  }
  function renderContractButtonsOnly() {
    setActionButton($('#con-sign'), { ready: false, label: '', blocked: '', busyLabel: 'Подписываем…' });
    $('#con-auto').disabled = true;
    $('#con-clear').disabled = true;
  }

  /* 7.5 Батл с ботом */
  const bat = { sel: [], run: null };

  function viewBattle(main) {
    bat.run = null;
    bat.sel = bat.sel.filter((id) => caseById.has(id) && playableCases.includes(caseById.get(id)));
    const botName = CONFIG.battle.botName;
    main.innerHTML = `
      <h1 class="page-title">Батл</h1>
      <p class="lead">Вы и ${esc(botName)} открываете одинаковые кейсы. У кого общая ценность дропа выше, тот забирает все предметы. При ничьей каждый оставляет своё. Кейсы оплачиваете только вы.</p>
      <div class="battle-setup">
        <section aria-labelledby="bat-pick-h">
          <h2 class="h2" id="bat-pick-h">Добавьте кейсы</h2>
          <div class="battle-cases" id="bat-cases">${playableCases.map((c) => `
            <button class="bcase" type="button" data-add="${esc(c.id)}" aria-label="Добавить ${esc(c.name)}">
              ${caseArt(c)}
              <span class="bcase__name">${esc(c.name)}</span>
              <span class="bcase__price">${fmt(c.price)} ${COIN}</span>
              <span class="bcase__add" aria-hidden="true">+</span>
            </button>`).join('')}</div>
        </section>
        <aside class="panel battle-sum" aria-labelledby="bat-sum-h">
          <h2 class="h2" id="bat-sum-h">Раунды</h2>
          <ol class="rounds" id="bat-rounds"></ol>
          <p class="battle-total"><span>Итого</span><span id="bat-total"></span></p>
          <button class="btn btn--big" id="bat-start" type="button"></button>
          <p class="hint" id="bat-hint"></p>
        </aside>
      </div>`;
    $('#bat-cases').addEventListener('click', (e) => {
      const b = e.target.closest('[data-add]');
      if (!b || busy) return;
      if (bat.sel.length >= CONFIG.battle.maxRounds) {
        toast(`В батле не больше ${CONFIG.battle.maxRounds} раундов`);
        return;
      }
      bat.sel.push(b.dataset.add);
      renderBattleSum();
    });
    $('#bat-rounds').addEventListener('click', (e) => {
      const b = e.target.closest('[data-rm]');
      if (!b || busy) return;
      bat.sel.splice(Number(b.dataset.rm), 1);
      renderBattleSum();
    });
    $('#bat-start').addEventListener('click', startBattle);
    view.refresh = renderBattleSum;
    renderBattleSum();
  }

  function renderBattleSum() {
    const roundsEl = $('#bat-rounds');
    if (!roundsEl) return;
    const cases = bat.sel.map((id) => caseById.get(id));
    const cost = sum(cases, (c) => c.price);
    roundsEl.innerHTML = cases.length
      ? cases.map((c, i) => `<li><span class="r-name">${esc(c.name)}</span><span class="r-price">${fmt(c.price)} ${COIN}</span><button class="icon-btn" type="button" data-rm="${i}" aria-label="Убрать раунд ${i + 1}">${ICON.close}</button></li>`).join('')
      : '<li class="rounds-empty">Нажмите на кейс, чтобы добавить раунд.</li>';
    $('#bat-total').innerHTML = `${fmt(cost)} ${COIN}`;
    const lack = cost - state.balance;
    setActionButton($('#bat-start'), {
      ready: cases.length > 0 && lack <= 0,
      label: 'Начать батл',
      blocked: cases.length ? `Нужно ещё ${fmt(lack)} ${COIN}` : 'Добавьте кейсы',
    });
    $('#bat-hint').textContent = '';
  }

  function startBattle() {
    const cases = bat.sel.map((id) => caseById.get(id)).filter(Boolean);
    const cost = sum(cases, (c) => c.price);
    if (!cases.length || !canAct() || state.balance < cost) return;
    const rounds = cases.map((c) => ({ c, you: rollItem(c, 'battle'), bot: rollItem(c, 'base') }));
    const youV = sum(rounds, (r) => itemValue(r.you));
    const botV = sum(rounds, (r) => itemValue(r.bot));
    const outcome = youV > botV ? 'win' : youV < botV ? 'lose' : 'tie';
    let gained = [];
    if (outcome === 'win') gained = rounds.flatMap((r) => [r.you, r.bot]);
    else if (outcome === 'tie') gained = rounds.map((r) => r.you);
    state.balance -= cost;
    state.stats.tokensSpent += cost;
    state.stats.cases += cases.length;
    state.stats.battles += 1;
    if (outcome === 'win') state.stats.battlesWon += 1;
    addItems(gained, 'battle', { hidden: true });
    save();
    renderHeader();
    bat.run = { rounds, outcome, youV, botV, gained };
    busy = true;
    renderArena();
    playBattle(bat.run);
  }

  function renderArena() {
    const main = $('#view');
    const n = bat.run.rounds.length;
    const lane = (id, title) => `
      <section class="lane" id="lane-${id}" aria-label="${esc(title)}">
        <div class="lane__head"><span>${esc(title)}</span><span class="lane__total" id="tot-${id}">◆ 0</span></div>
        <div class="reel reel--sm" id="reel-${id}" aria-hidden="true"><div class="reel__track"></div><span class="reel__marker"></span></div>
        <div class="lane__items" id="items-${id}"></div>
      </section>`;
    main.innerHTML = `
      <h1 class="page-title">Батл</h1>
      <p class="battle-round" id="bat-round" aria-live="polite">Раунд 1 из ${n}</p>
      <div class="arena">
        ${lane('you', 'Вы')}
        <div class="vs" aria-hidden="true">VS</div>
        ${lane('bot', CONFIG.battle.botName)}
      </div>
      <div class="panel verdict" id="bat-verdict" hidden></div>`;
    prepareReel($('#reel-you'), bat.run.rounds[0].c);
    prepareReel($('#reel-bot'), bat.run.rounds[0].c);
    view.refresh = null;
  }

  async function playBattle(run) {
    const gen = view.gen;
    let tYou = 0;
    let tBot = 0;
    for (let i = 0; i < run.rounds.length; i++) {
      const r = run.rounds[i];
      $('#bat-round').textContent = `Раунд ${i + 1} из ${run.rounds.length} · ${r.c.name}`;
      await Promise.all([
        spinReel($('#reel-you'), r.c, r.you, CONFIG.ui.battleSpinMs),
        spinReel($('#reel-bot'), r.c, r.bot, CONFIG.ui.battleSpinMs),
      ]);
      if (gen !== view.gen) return;
      tYou += itemValue(r.you);
      tBot += itemValue(r.bot);
      $('#items-you').insertAdjacentHTML('beforeend', itemCard(r.you, { wear: false }));
      $('#items-bot').insertAdjacentHTML('beforeend', itemCard(r.bot, { wear: false }));
      $('#tot-you').textContent = `◆ ${fmt(tYou)}`;
      $('#tot-bot').textContent = `◆ ${fmt(tBot)}`;
      $('#lane-you').classList.toggle('is-leading', tYou > tBot);
      $('#lane-bot').classList.toggle('is-leading', tBot > tYou);
      if (i < run.rounds.length - 1) {
        await sleep(reducedMotion() ? 0 : 700);
        if (gen !== view.gen) return;
      }
    }
    busy = false;
    reveal(run.gained.map((it) => it.u));
    const total = run.gained.length;
    const texts = {
      win: ['Победа', `Все ${total} ${itemsWord(total)} ваши: ◆ ${fmt(run.youV)} против ◆ ${fmt(run.botV)}.`],
      lose: [`Победил ${CONFIG.battle.botName.toLowerCase()}`, `◆ ${fmt(run.youV)} против ◆ ${fmt(run.botV)}. Предметы забирает соперник.`],
      tie: ['Ничья', `По ◆ ${fmt(run.youV)} у каждого. Вы оставляете свои ${total} ${itemsWord(total)}.`],
    }[run.outcome];
    const v = $('#bat-verdict');
    v.innerHTML = `
      <p class="verdict__title${run.outcome === 'win' ? ' is-win' : ''}">${esc(texts[0])}</p>
      <p>${esc(texts[1])}</p>
      <div class="confirm-actions">
        <button class="btn" type="button" id="bat-again">Новый батл</button>
        <a class="btn btn--ghost" href="#inventory">Инвентарь</a>
      </div>`;
    v.hidden = false;
    $('#bat-again').addEventListener('click', () => {
      bat.run = null;
      route(true);
    });
    startPause();
  }

  /* 7.6 Инвентарь и статистика */
  const inv = { filter: 'all', sort: 'new', limit: 60 };
  const SORTS = {
    new: ['Сначала новые', (a, b) => b.t - a.t || b.u - a.u],
    old: ['Сначала старые', (a, b) => a.t - b.t || a.u - b.u],
    rarity: ['Сначала редкие', (a, b) => byRarityDesc(skinById.get(a.s), skinById.get(b.s)) || itemValue(b) - itemValue(a)],
    rarityAsc: ['Сначала простые', (a, b) => byRarityDesc(skinById.get(b.s), skinById.get(a.s)) || itemValue(a) - itemValue(b)],
    value: ['Сначала ценные', (a, b) => itemValue(b) - itemValue(a) || b.u - a.u],
    valueAsc: ['Сначала дешёвые', (a, b) => itemValue(a) - itemValue(b) || b.u - a.u],
    name: ['По названию', (a, b) => skinById.get(a.s).name.localeCompare(skinById.get(b.s).name)],
  };

  function viewInventory(main) {
    main.innerHTML = `
      <h1 class="page-title">Инвентарь</h1>
      <div class="stats-wrap" id="stats"></div>
      <div class="inv-tools">
        <div class="chips" id="inv-chips"></div>
        <label class="select"><span class="sr-only">Сортировка</span>
          <select id="inv-sort">${Object.entries(SORTS).map(([k, v]) => `<option value="${k}"${inv.sort === k ? ' selected' : ''}>${v[0]}</option>`).join('')}</select>
        </label>
      </div>
      <div class="inv-sell"><button class="btn btn--ghost" id="inv-sell" type="button" hidden></button></div>
      <div class="item-grid" id="inv-grid"></div>
      <div class="inv-more"><button class="btn btn--ghost" id="inv-more" type="button">Показать ещё</button></div>
      <section class="danger" aria-labelledby="reset-h">
        <h2 class="h3" id="reset-h">Сброс прогресса</h2>
        <p class="hint">Удалит инвентарь, статистику и токены в этом браузере. Отменить будет нельзя.</p>
        <button class="btn btn--danger" id="reset-btn" type="button">Сбросить прогресс</button>
      </section>`;
    $('#inv-chips').addEventListener('click', (e) => {
      const b = e.target.closest('[data-r]');
      if (!b) return;
      inv.filter = b.dataset.r;
      inv.limit = 60;
      renderInventory();
    });
    $('#inv-sort').addEventListener('change', (e) => {
      inv.sort = e.target.value;
      inv.limit = 60;
      renderInventory();
    });
    $('#inv-grid').addEventListener('click', (e) => {
      const b = e.target.closest('[data-u]');
      if (b) openItemModal(Number(b.dataset.u));
    });
    $('#inv-more').addEventListener('click', () => {
      inv.limit += 60;
      renderInventory();
    });
    $('#reset-btn').addEventListener('click', confirmReset);
    $('#inv-sell').addEventListener('click', confirmSellShown);
    view.refresh = (reason) => { if (reason !== 'balance') renderInventory(); };
    renderInventory();
  }

  function renderInventory() {
    const grid = $('#inv-grid');
    if (!grid) return;
    const items = ownedItems().filter((it) => !pending.has(it.u));
    const st = state.stats;
    const best = st.best && skinById.get(st.best.s);
    const totalValue = sum(items, itemValue);
    const bestHtml = best
      ? `<div class="best r-${best.rarity}"><img src="${esc(imgUrl(best.image))}" alt=""><div><div class="stat__label">Самый редкий дроп</div><div class="best__rar">${esc(RAR[best.rarity].name)}${st.best.st ? ' · StatTrak™' : ''}</div><div class="best__name">${esc(best.name)}</div></div></div>`
      : '<div class="best"><div class="empty" style="grid-column:1/-1;padding:18px">Самый редкий дроп появится после первого открытия.</div></div>';
    $('#stats').innerHTML = `
      ${bestHtml}
      <div class="stats">
        <div class="stat"><div class="stat__label">Кейсов открыто</div><div class="stat__value">${fmt(st.cases)}</div></div>
        <div class="stat"><div class="stat__label">Токенов получено</div><div class="stat__value">${fmt(st.tokensEarned)}${st.soldFor ? ` <small>+${fmt(st.soldFor)} с продаж</small>` : ''}</div></div>
        <div class="stat"><div class="stat__label">Предметов сейчас</div><div class="stat__value">${fmt(items.length)} <small>◆ ${fmt(totalValue)}</small></div></div>
        <div class="stat"><div class="stat__label">Апгрейды</div><div class="stat__value">${fmt(st.upgradesWon)} <small>из ${fmt(st.upgrades)}</small></div></div>
        <div class="stat"><div class="stat__label">Контракты</div><div class="stat__value">${fmt(st.contracts)}</div></div>
        <div class="stat"><div class="stat__label">Батлы</div><div class="stat__value">${fmt(st.battlesWon)} <small>побед из ${fmt(st.battles)}</small></div></div>
      </div>`;

    const counts = {};
    for (const it of items) {
      const r = skinById.get(it.s).rarity;
      counts[r] = (counts[r] || 0) + 1;
    }
    const present = ORDER.slice().reverse().filter((r) => counts[r]);
    if (inv.filter !== 'all' && !counts[inv.filter]) inv.filter = 'all';
    $('#inv-chips').innerHTML = `<button class="chip" type="button" data-r="all" aria-pressed="${inv.filter === 'all'}">Все <span class="n">${items.length}</span></button>
      ${present.map((r) => `<button class="chip r-${r}" type="button" data-r="${r}" aria-pressed="${inv.filter === r}"><span class="dot"></span>${esc(RAR[r].name)} <span class="n">${counts[r]}</span></button>`).join('')}`;

    const list = items.filter((it) => inv.filter === 'all' || skinById.get(it.s).rarity === inv.filter).sort(SORTS[inv.sort][1]);
    grid.innerHTML = list.length
      ? list.slice(0, inv.limit).map((it) => itemCard(it, { button: true, attrs: `data-u="${it.u}" aria-label="${esc(skinById.get(it.s).name)}: подробнее"` })).join('')
      : `<div style="grid-column:1/-1">${emptyInventoryHtml('Инвентарь пуст. Откройте первый кейс, и предмет появится здесь.')}</div>`;
    $('#inv-more').hidden = list.length <= inv.limit;
    const sellBtn = $('#inv-sell');
    sellBtn.hidden = !list.length;
    if (list.length) {
      const what = inv.filter === 'all' ? 'всё' : `все ${RAR[inv.filter].name}`;
      sellBtn.innerHTML = `Продать ${esc(what)} · ${list.length} шт. за ${fmt(sum(list, sellPrice))} ${COIN}`;
    }
  }

  const SRC_NAMES = { case: 'кейса', upgrade: 'апгрейда', contract: 'контракта', battle: 'батла' };
  function openItemModal(u) {
    const it = findItem(u);
    const s = it && skinById.get(it.s);
    if (!s) return;
    const { weapon, finish } = splitName(s.name);
    const w = wearOf(it.f);
    const canContract = !!nextRarity(s.rarity);
    const when = new Date(it.t).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    openModal(`
      <div class="drop-view r-${s.rarity}">
        <div class="drop-view__stage"><img src="${esc(imgUrl(s.image))}" alt="${esc(s.name)}"></div>
        <p class="drop-view__rarity">${esc(RAR[s.rarity].name)}${it.st ? ' · StatTrak™' : ''}</p>
        <h2 class="drop-view__name"><span>${esc(weapon)}</span>${esc(finish || weapon)}</h2>
        <p class="drop-view__meta">${w.name} · float ${it.f.toFixed(4)} · ценность ◆ ${fmt(itemValue(it))}</p>
        <p class="hint" style="margin-inline:auto">Получен из ${SRC_NAMES[it.src] || 'кейса'}, ${esc(when)}</p>
        <div class="drop-view__actions">
          <button class="btn" type="button" data-to-upgrade="${it.u}">В апгрейд</button>
          ${canContract ? `<button class="btn btn--ghost" type="button" data-to-contract="${it.u}">В контракт</button>` : ''}
          <button class="btn btn--ghost" type="button" data-sell="${it.u}">Продать за ${fmt(sellPrice(it))} ${COIN}</button>
        </div>
      </div>`, { label: s.name });
  }

  /* Продажа предметов за токены */
  function sellItems(uids) {
    const items = uids.map(findItem).filter((it) => it && skinById.has(it.s) && !pending.has(it.u));
    if (!items.length) return;
    const total = sum(items, sellPrice);
    removeItems(items.map((it) => it.u));
    state.balance += total;
    state.stats.sold += items.length;
    state.stats.soldFor += total;
    save();
    renderHeader();
    toast(`Продано: ${items.length} ${itemsWord(items.length)} за ${fmt(total)} ${tokensWord(total)}`, 'ok');
    refreshView();
  }
  function confirmSellShown() {
    const list = ownedItems().filter((it) => !pending.has(it.u) && (inv.filter === 'all' || skinById.get(it.s).rarity === inv.filter));
    if (!list.length) return;
    const total = sum(list, sellPrice);
    const rare = list.filter((it) => ['covert', 'gold'].includes(skinById.get(it.s).rarity)).length;
    openModal(`
      <h2 class="h2">Продать ${list.length} ${itemsWord(list.length)}?</h2>
      <p class="hint" style="margin-top:0">Вы получите ${fmt(total)} ${tokensWord(total)}. Предметы пропадут из инвентаря, отменить продажу нельзя.${rare ? ` Среди них ${rare} Covert или ★.` : ''}</p>
      <div class="confirm-actions">
        <button class="btn btn--ghost" type="button" data-close data-autofocus>Отмена</button>
        <button class="btn" type="button" id="sell-yes">Продать за ${fmt(total)} ${COIN}</button>
      </div>`, { label: 'Продажа предметов' });
    $('#sell-yes').addEventListener('click', () => {
      closeModal({ silent: true });
      sellItems(list.map((it) => it.u));
    });
  }

  function confirmReset() {
    openModal(`
      <h2 class="h2">Сбросить прогресс?</h2>
      <p class="hint" style="margin-top:0">Инвентарь, статистика и токены в этом браузере вернутся к началу. Отменить сброс нельзя.</p>
      <div class="confirm-actions">
        <button class="btn btn--ghost" type="button" data-close data-autofocus>Отмена</button>
        <button class="btn btn--danger-solid" type="button" id="reset-yes">Сбросить</button>
      </div>`, { label: 'Сброс прогресса' });
    $('#reset-yes').addEventListener('click', () => {
      state = freshState();
      upg.input = [];
      upg.target = null;
      con.sel = [];
      bat.sel = [];
      pending.clear();
      save();
      closeModal({ silent: true });
      renderHeader();
      renderLive();
      toast('Прогресс сброшен', 'ok');
      route(true);
    });
  }

  /* 7.7 Промокоды */
  function viewPromo(main) {
    main.innerHTML = `
      <h1 class="page-title">Промокоды</h1>
      <p class="lead">Введите промокод, если он у вас есть.</p>
      <form class="promo" id="promo-form" novalidate>
        <label for="promo-input">Промокод</label>
        <div class="promo__row">
          <input class="input" id="promo-input" name="promo" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Например, START50" maxlength="40">
          <button class="btn" type="submit">Активировать</button>
        </div>
        <p class="msg" id="promo-msg" role="status" aria-live="polite"></p>
      </form>`;
    $('#promo-form').addEventListener('submit', (e) => {
      e.preventDefault();
      redeemCode($('#promo-input').value);
    });
  }
  function redeemCode(raw) {
    const msg = $('#promo-msg');
    const say = (text, type) => {
      msg.textContent = text;
      msg.className = `msg${type ? ` is-${type}` : ''}`;
    };
    const code = normCode(raw);
    if (!code) {
      say('Введите промокод.', 'bad');
      return;
    }
    const h = hashCode(code);
    const entry = (CONFIG.promoCodes || []).find((p) => (p.code && normCode(p.code) === code) || (p.hash && String(p.hash).toLowerCase() === h));
    if (!entry) {
      say('Такого промокода нет. Проверьте, нет ли опечатки.', 'bad');
      return;
    }
    const once = entry.once !== undefined ? !!entry.once : entry.type === 'tokens';
    if (once && state.usedCodes.includes(h)) {
      say('Этот промокод уже использован.', 'bad');
      return;
    }
    if (entry.type === 'tokens') {
      const amount = Math.max(0, Math.floor(Number(entry.amount) || 0));
      state.balance += amount;
      state.stats.tokensEarned += amount;
      say(`Готово: +${fmt(amount)} ${tokensWord(amount)}.`, 'ok');
    } else if (entry.type === 'boost') {
      const minutes = Math.max(1, Number(entry.minutes) || 30);
      state.boost = { until: Date.now() + minutes * 60000, odds: entry.odds || CONFIG.odds };
      say('Промокод активирован.', 'ok');
    } else {
      say('Этот промокод настроен с ошибкой: неизвестный type.', 'bad');
      return;
    }
    if (once) state.usedCodes.push(h);
    save();
    $('#promo-input').value = '';
    renderHeader();
  }

  /* ── 8. Навигация и запуск ──────────────────────────────────────── */
  const ROUTES = {
    cases: viewCases,
    case: viewCase,
    upgrade: viewUpgrade,
    contracts: viewContracts,
    battle: viewBattle,
    inventory: viewInventory,
    promo: viewPromo,
  };

  function parseHash() {
    let h = location.hash.replace(/^#/, '');
    try { h = decodeURIComponent(h); } catch (e) { h = ''; }
    if (h.startsWith('case-')) return { name: 'case', arg: h.slice(5) };
    if (ROUTES[h] && h !== 'case') return { name: h, arg: null };
    return { name: 'cases', arg: null };
  }

  function route(keepScroll = false) {
    const { name, arg } = parseHash();
    view.gen += 1;
    view.refresh = null;
    view.name = name;
    if (busy) {
      // Ушли посреди анимации: результат уже в инвентаре, просто показываем его в ленте.
      busy = false;
      upg.running = null;
      startPause();
    }
    flushPending();
    closeModal({ silent: true });
    closeDrawer();
    const main = $('#view');
    ROUTES[name](main, arg);
    const navName = name === 'case' ? 'cases' : name;
    $$('[data-nav]').forEach((a) => {
      if (a.dataset.nav === navName) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    if (keepScroll !== true) window.scrollTo(0, 0);
  }

  function go(hash) {
    if (location.hash === hash) route();
    else location.hash = hash;
  }

  /* Боковое меню */
  function openDrawer() {
    $('#drawer-nav').innerHTML = NAV.map((n) => `<a href="#${n.id}" data-nav="${n.id}"${(view.name === 'case' ? 'cases' : view.name) === n.id ? ' aria-current="page"' : ''}>${ICON[n.id]}${esc(n.title)}</a>`).join('');
    renderDrawerTokens();
    $('#drawer-wrap').hidden = false;
    $('#menu-btn').setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
    const first = $('#drawer-nav a');
    if (first) first.focus({ preventScroll: true });
  }
  function closeDrawer() {
    const wrap = $('#drawer-wrap');
    if (wrap.hidden) return;
    wrap.hidden = true;
    $('#menu-btn').setAttribute('aria-expanded', 'false');
    if ($('#modal').hidden) document.body.classList.remove('no-scroll');
  }

  /* Глобальные обработчики */
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('[data-close]')) {
      closeModal();
      return;
    }
    if (t.id === 'modal') {
      closeModal();
      return;
    }
    if (t.closest('[data-close-drawer]')) {
      closeDrawer();
      return;
    }
    if (t.closest('#drawer-nav a')) {
      closeDrawer();
      return;
    }
    const sell = t.closest('[data-sell]');
    if (sell) {
      const uids = String(sell.dataset.sell).split(',').map(Number);
      closeModal({ silent: true });
      sellItems(uids);
      return;
    }
    const up = t.closest('[data-to-upgrade]');
    if (up) {
      const uids = String(up.dataset.toUpgrade).split(',').map(Number).filter((u) => findItem(u));
      if (uids.length) upg.input = uids.slice(0, CONFIG.upgrade.maxItems);
      go('#upgrade');
      return;
    }
    const tc = t.closest('[data-to-contract]');
    if (tc) {
      const u = Number(tc.dataset.toContract);
      const it = findItem(u);
      if (it) {
        con.sel = [u];
        con.filter = skinById.get(it.s).rarity;
      }
      go('#contracts');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$('#modal').hidden) closeModal();
    else closeDrawer();
  });
  $('#menu-btn').addEventListener('click', openDrawer);
  $('#tokens-btn').addEventListener('click', openTokenModal);
  window.addEventListener('hashchange', () => route());

  // Вернулись на вкладку — подхватываем изменения из других вкладок.
  document.addEventListener('visibilitychange', () => {
    lastTick = Date.now();
    if (document.visibilityState === 'visible' && !busy && storageOk) {
      state = loadState();
      renderHeader();
      renderLive();
      refreshView();
    }
  });
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY || busy) return;
    state = loadState();
    renderHeader();
    renderLive();
    if (document.visibilityState === 'visible') refreshView();
  });

  // Консольный помощник: RADIK.hash('КОД') — получить хэш для секретного промокода.
  window.RADIK = Object.freeze({
    hash: (code) => hashCode(normCode(code)),
  });

  // Запуск
  if (!storageOk) $('#storage-notice').hidden = false;
  save();
  renderHeader();
  renderLive();
  route(true);
  setInterval(tokenTick, 1000);
})();
