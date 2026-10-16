/* =====================================================================
   RADIK DROP — настройки сайта
   ---------------------------------------------------------------------
   Всё, что можно менять без программирования, собрано в этом файле:
   токены, цены кейсов, шансы, промокоды и полный список скинов.
   Поменяли значение → сохранили файл → обновили страницу.

   Проценты пишутся числами без знака %: 79.9 значит 79,9 %.
   ===================================================================== */
const CONFIG = {

  /* ── Токены ─────────────────────────────────────────────────────────
     Токены виртуальные: их нельзя купить, продать или вывести.        */
  tokens: {
    startBalance: 20,     // сколько токенов дать при первом заходе
    perTick: 1,           // сколько токенов начислять за один интервал
    tickSeconds: 30,      // интервал начисления в секундах
    dailyLimit: 100,      // максимум токенов за сутки (промокоды сюда не входят)
    onlyVisibleTab: true, // true — время считается, только пока вкладка на экране
  },

  /* ── Кейсы ──────────────────────────────────────────────────────────
     id       — внутреннее имя (латиница, без пробелов), на него ссылаются скины
     name     — название на сайте
     price    — цена в токенах
     section  — в каком разделе главной показывать (см. sections ниже)
     color    — цвет временной картинки кейса
     cover    — id скина, который лежит на кейсе (пока нет своей картинки)
     image    — путь к своей картинке кейса, например 'img/cases/ak47.webp'
                (квадратная картинка). Пока пусто, рисуется временный кейс
                с обложкой-скином.
     odds     — (необязательно) свои шансы для этого кейса, формат как у odds ниже */
  // featured: true — раздел с крупными карточками (для кейсов со своими картинками)
  sections: [
    { id: 'legendary', title: 'Легендарные кейсы', featured: true },
    { id: 'popular', title: 'Популярные кейсы' },
    { id: 'weapons', title: 'Оружейные кейсы' },
  ],
  cases: [
    // Легендарные кейсы: только Restricted и выше, поэтому у них свои шансы.
    { id: 'burger', name: 'Radioactive Burger', price: 200, section: 'legendary', color: '#9be22d', cover: 'awp-containment-breach', image: 'img/cases/radioactive-burger.webp',
      odds: { restricted: 79.9, classified: 16, covert: 3.2, gold: 0.9 } },
    { id: 'cyber', name: 'Cyber Psycho', price: 200, section: 'legendary', color: '#c04dff', cover: 'ak-47-neon-rider', image: 'img/cases/cyber-psycho.webp',
      odds: { restricted: 79.9, classified: 16, covert: 3.2, gold: 0.9 } },
    { id: 'aram', name: 'Aramzamzam', price: 200, section: 'legendary', color: '#f2b632', cover: 'awp-dragon-lore', image: 'img/cases/aramzamzam.webp',
      odds: { restricted: 79.9, classified: 16, covert: 3.2, gold: 0.9 } },
    { id: 'starter', name: 'Новичок',      price: 10, section: 'popular', color: '#5e98d9', cover: 'ak-47-fuel-injector', image: '' },
    { id: 'ak47',    name: 'AK-47',        price: 25, section: 'popular', color: '#d9534f', cover: 'ak-47-fire-serpent', image: '' },
    { id: 'awp',     name: 'AWP',          price: 25, section: 'popular', color: '#3fb37f', cover: 'awp-man-o-war', image: '' },
    { id: 'm4',      name: 'M4',           price: 20, section: 'popular', color: '#4b8bff', cover: 'm4a4-temukau', image: '' },
    { id: 'gloves',  name: 'Перчатки',     price: 30, section: 'popular', color: '#e4ae39', cover: 'sport-gloves-vice', image: '' },
    { id: 'pistols', name: 'Пистолеты',    price: 10, section: 'weapons', color: '#8a6cff', cover: 'glock-18-bullet-queen', image: '' },
    { id: 'deagle',  name: 'Desert Eagle', price: 15, section: 'weapons', color: '#c0703a', cover: 'desert-eagle-golden-koi', image: '' },
    { id: 'smg',     name: 'SMG',          price: 10, section: 'weapons', color: '#2bb3c0', cover: 'mac-10-stalker', image: '' },
    { id: 'rifles',  name: 'Винтовки',     price: 15, section: 'weapons', color: '#7fa650', cover: 'famas-commemoration', image: '' },
    { id: 'heavy',   name: 'Тяжёлое',      price: 10, section: 'weapons', color: '#9c7a54', cover: 'mp7-bloodsport', image: '' },
  ],

  /* ── Шансы выпадения по редкостям, в процентах (сумма = 100) ─────────
     Эти шансы показываются на странице каждого кейса.                 */
  odds: { milspec: 79.9, restricted: 16, classified: 3.2, covert: 0.64, gold: 0.26 },

  /* ── Бонус новичка (скрытый) ────────────────────────────────────────
     Первые `opens` открытий кейсов идут с этими шансами. На сайте об этом
     не пишется, в кейсе показываются обычные шансы из `odds`.
     Чтобы выключить, поставьте enabled: false.                        */
  beginnerBonus: {
    enabled: true,
    opens: 5,
    odds: { milspec: 40, restricted: 30, classified: 18, covert: 8, gold: 4 },
  },

  /* ── Промокоды ──────────────────────────────────────────────────────
     type: 'tokens' — добавляет amount токенов (по умолчанию один раз на браузер)
     type: 'boost'  — на minutes минут включает шансы odds. Отдельного значка
                      на сайте нет, но шансы на странице кейса, пока код действует,
                      показываются настоящие (повышенные).
     once: true/false — можно ли ввести код повторно (false — без ограничений).

     Код можно написать открыто (code: 'START50') или спрятать в виде хэша
     (hash: '…'), чтобы его не нашли, заглянув в этот файл. Хэш для своего
     кода: откройте сайт, нажмите F12 → Console и введите RADIK.hash('ВАШКОД').
     Регистр и пробелы в коде не важны.                                */
  promoCodes: [
    // Секретный буст: можно вводить сколько угодно раз, каждый ввод даёт
    // 30 минут с текущего момента. Сам код в файле не хранится, только его хэш.
    { hash: '0b7897c47b4f85', type: 'boost', minutes: 30, once: false,
      odds: { milspec: 30, restricted: 30, classified: 20, covert: 12, gold: 8 } },
    // Обычный код на токены.
    { code: 'START50', type: 'tokens', amount: 50 },
    // Коды на токены. Сами коды в файле не хранятся, только их хэши.
    // +100 токенов, каждый код — один раз на браузер
    { hash: '14384ec9de1edd', type: 'tokens', amount: 100 },
    { hash: '0e2f34978c66c0', type: 'tokens', amount: 100 },
    { hash: '017ef53160b912', type: 'tokens', amount: 100 },
    { hash: '151050870ce8da', type: 'tokens', amount: 100 },
    { hash: '0ba35c3d3cba8a', type: 'tokens', amount: 100 },
    // +200 токенов, каждый код — один раз на браузер
    { hash: '08ef4a953abee2', type: 'tokens', amount: 200 },
    { hash: '099801577c34f5', type: 'tokens', amount: 200 },
    { hash: '1458d1d57ec038', type: 'tokens', amount: 200 },
    { hash: '15c286974e17c7', type: 'tokens', amount: 200 },
    { hash: '08e96dcb50a4d6', type: 'tokens', amount: 200 },
    // +500 токенов, каждый код — один раз на браузер
    { hash: '199939f46c597a', type: 'tokens', amount: 500 },
    { hash: '02ce3e832cfe40', type: 'tokens', amount: 500 },
    { hash: '0edd8a4c014d8e', type: 'tokens', amount: 500 },
    { hash: '06269d813b5c6e', type: 'tokens', amount: 500 },
    { hash: '11fafeb761d764', type: 'tokens', amount: 500 },
  ],

  /* ── Редкости ───────────────────────────────────────────────────────
     name  — подпись на сайте, color — цвет редкости,
     value — «ценность» предмета из кейса за basePrice токенов. Ценность
     нужна для апгрейда, батлов, сортировки и продажи.                  */
  rarities: {
    consumer:   { name: 'Consumer',     color: '#b0c3d9', value: 1 },
    industrial: { name: 'Industrial',   color: '#5e98d9', value: 2 },
    milspec:    { name: 'Mil-spec',     color: '#4b69ff', value: 3 },
    restricted: { name: 'Restricted',   color: '#8847ff', value: 12 },
    classified: { name: 'Classified',   color: '#d32ce6', value: 50 },
    covert:     { name: 'Covert',       color: '#eb4b4b', value: 200 },
    gold:       { name: 'Rare Special', color: '#e4ae39', value: 1000 },
  },
  // Порядок редкостей от простой к самой редкой (нужен для контрактов).
  rarityOrder: ['consumer', 'industrial', 'milspec', 'restricted', 'classified', 'covert', 'gold'],

  /* ── Экономика предметов ─────────────────────────────────────────── */
  economy: {
    basePrice: 10,        // кейс за 10 токенов даёт ценность ровно как в rarities.value.
                          // Ценность остальных подбирается так, чтобы средний дроп был
                          // пропорционален цене: кейс за 25 — в 2,5 раза ценнее и т. д.
    sellRate: 0.9,        // продажа предмета: столько токенов за 1 ◆ ценности (1 — по полной цене)
    statTrakChance: 0.10, // шанс StatTrak™ при открытии (в CS2 тоже 10 %)
    statTrakValue: 1.5,   // во сколько раз StatTrak™ ценнее обычного
  },

  /* ── Режимы ─────────────────────────────────────────────────────── */
  upgrade: {
    maxChance: 90,  // потолок шанса апгрейда, %
    minChance: 1,   // апгрейд с шансом ниже этого запрещён, %
    maxItems: 6,    // сколько своих предметов можно поставить за раз
  },
  contract: {
    items: 10,      // сколько предметов одной редкости нужно для контракта
    coverToGold: 5, // сколько Covert нужно, чтобы получить ★ (нож или перчатки)
  },
  battle: {
    maxRounds: 5,   // сколько кейсов можно добавить в один батл
    botName: 'Бот',
  },

  /* ── Интерфейс ──────────────────────────────────────────────────── */
  ui: {
    maxOpen: 6,           // сколько кейсов можно открыть за раз (от 1 до 10)
    pauseMs: 2500,        // пауза между открытиями, мс (2–3 секунды)
    spinMs: 6000,         // длительность прокрутки ленты в кейсе, мс
    battleSpinMs: 4000,   // длительность раунда в батле, мс
    upgradeSpinMs: 4500,  // длительность вращения апгрейда, мс
    contractMs: 1200,     // длительность подписания контракта, мс
    liveDrops: 20,        // сколько последних дропов показывать в ленте сверху
  },

  /* ── Скины ──────────────────────────────────────────────────────────
     Один скин — одна строка:
       id     — уникальное имя (латиница); на него ссылается инвентарь,
                поэтому у существующего скина id лучше не менять
       name   — название в формате «Оружие | Раскраска»
       rarity — consumer, industrial, milspec, restricted, classified, covert, gold
       case   — id кейса, в котором лежит скин
       image  — путь к картинке. Чтобы заменить картинку, положите свой файл
                в img/skins/ и поменяйте путь
       float  — (необязательно) диапазон износа [от, до], как в CS2
       st     — (необязательно) st: false, если StatTrak™ у скина не бывает
       value  — (необязательно) своя ценность вместо расчётной
     Картинки скинов принадлежат Valve.                                */
  skins: [
  // ── Кейс «AK-47» ─────────────────────────────
  { id: 'karambit-crimson-web', name: '★ Karambit | Crimson Web', rarity: 'gold', case: 'ak47', image: 'img/skins/karambit-crimson-web.webp', float: [0.06, 0.80] },
  { id: 'karambit-doppler', name: '★ Karambit | Doppler', rarity: 'gold', case: 'ak47', image: 'img/skins/karambit-doppler.webp', float: [0.00, 0.08] },
  { id: 'karambit-fade', name: '★ Karambit | Fade', rarity: 'gold', case: 'ak47', image: 'img/skins/karambit-fade.webp', float: [0.00, 0.08] },
  { id: 'karambit-marble-fade', name: '★ Karambit | Marble Fade', rarity: 'gold', case: 'ak47', image: 'img/skins/karambit-marble-fade.webp', float: [0.00, 0.08] },
  { id: 'karambit-tiger-tooth', name: '★ Karambit | Tiger Tooth', rarity: 'gold', case: 'ak47', image: 'img/skins/karambit-tiger-tooth.webp', float: [0.00, 0.08] },
  { id: 'ak-47-fire-serpent', name: 'AK-47 | Fire Serpent', rarity: 'covert', case: 'ak47', image: 'img/skins/ak-47-fire-serpent.webp', float: [0.06, 0.76] },
  { id: 'ak-47-legion-of-anubis', name: 'AK-47 | Legion of Anubis', rarity: 'covert', case: 'ak47', image: 'img/skins/ak-47-legion-of-anubis.webp', float: [0.00, 0.70] },
  { id: 'ak-47-cartel', name: 'AK-47 | Cartel', rarity: 'classified', case: 'ak47', image: 'img/skins/ak-47-cartel.webp', float: [0.00, 0.75] },
  { id: 'ak-47-point-disarray', name: 'AK-47 | Point Disarray', rarity: 'classified', case: 'ak47', image: 'img/skins/ak-47-point-disarray.webp', float: [0.00, 0.67] },
  { id: 'ak-47-red-laminate', name: 'AK-47 | Red Laminate', rarity: 'classified', case: 'ak47', image: 'img/skins/ak-47-red-laminate.webp', float: [0.06, 0.80] },
  { id: 'ak-47-blue-laminate', name: 'AK-47 | Blue Laminate', rarity: 'restricted', case: 'ak47', image: 'img/skins/ak-47-blue-laminate.webp', float: [0.02, 0.40] },
  { id: 'ak-47-orbit-mk01', name: 'AK-47 | Orbit Mk01', rarity: 'restricted', case: 'ak47', image: 'img/skins/ak-47-orbit-mk01.webp', float: [0.00, 0.55] },
  { id: 'ak-47-rat-rod', name: 'AK-47 | Rat Rod', rarity: 'restricted', case: 'ak47', image: 'img/skins/ak-47-rat-rod.webp', float: [0.00, 1.00] },
  { id: 'ak-47-slate', name: 'AK-47 | Slate', rarity: 'restricted', case: 'ak47', image: 'img/skins/ak-47-slate.webp', float: [0.00, 1.00] },
  { id: 'ak-47-black-laminate', name: 'AK-47 | Black Laminate', rarity: 'milspec', case: 'ak47', image: 'img/skins/ak-47-black-laminate.webp', float: [0.06, 0.80], st: false },
  { id: 'ak-47-crossfade', name: 'AK-47 | Crossfade', rarity: 'milspec', case: 'ak47', image: 'img/skins/ak-47-crossfade.webp', float: [0.00, 0.50], st: false },
  { id: 'ak-47-elite-build', name: 'AK-47 | Elite Build', rarity: 'milspec', case: 'ak47', image: 'img/skins/ak-47-elite-build.webp', float: [0.00, 1.00] },
  { id: 'ak-47-green-laminate', name: 'AK-47 | Green Laminate', rarity: 'milspec', case: 'ak47', image: 'img/skins/ak-47-green-laminate.webp', float: [0.02, 0.40], st: false },
  { id: 'ak-47-steel-delta', name: 'AK-47 | Steel Delta', rarity: 'milspec', case: 'ak47', image: 'img/skins/ak-47-steel-delta.webp', float: [0.00, 0.73], st: false },
  { id: 'ak-47-uncharted', name: 'AK-47 | Uncharted', rarity: 'milspec', case: 'ak47', image: 'img/skins/ak-47-uncharted.webp', float: [0.00, 0.75] },
  // ── Кейс «AWP» ─────────────────────────────
  { id: 'm9-bayonet-crimson-web', name: '★ M9 Bayonet | Crimson Web', rarity: 'gold', case: 'awp', image: 'img/skins/m9-bayonet-crimson-web.webp', float: [0.06, 0.80] },
  { id: 'm9-bayonet-doppler', name: '★ M9 Bayonet | Doppler', rarity: 'gold', case: 'awp', image: 'img/skins/m9-bayonet-doppler.webp', float: [0.00, 0.08] },
  { id: 'm9-bayonet-fade', name: '★ M9 Bayonet | Fade', rarity: 'gold', case: 'awp', image: 'img/skins/m9-bayonet-fade.webp', float: [0.00, 0.08] },
  { id: 'm9-bayonet-marble-fade', name: '★ M9 Bayonet | Marble Fade', rarity: 'gold', case: 'awp', image: 'img/skins/m9-bayonet-marble-fade.webp', float: [0.00, 0.08] },
  { id: 'm9-bayonet-tiger-tooth', name: '★ M9 Bayonet | Tiger Tooth', rarity: 'gold', case: 'awp', image: 'img/skins/m9-bayonet-tiger-tooth.webp', float: [0.00, 0.08] },
  { id: 'awp-man-o-war', name: 'AWP | Man-o\'-war', rarity: 'covert', case: 'awp', image: 'img/skins/awp-man-o-war.webp', float: [0.10, 0.20] },
  { id: 'awp-wildfire', name: 'AWP | Wildfire', rarity: 'covert', case: 'awp', image: 'img/skins/awp-wildfire.webp', float: [0.01, 0.70] },
  { id: 'awp-corticera', name: 'AWP | Corticera', rarity: 'classified', case: 'awp', image: 'img/skins/awp-corticera.webp', float: [0.06, 0.30] },
  { id: 'awp-duality', name: 'AWP | Duality', rarity: 'classified', case: 'awp', image: 'img/skins/awp-duality.webp', float: [0.00, 0.80] },
  { id: 'awp-fever-dream', name: 'AWP | Fever Dream', rarity: 'classified', case: 'awp', image: 'img/skins/awp-fever-dream.webp', float: [0.00, 0.55] },
  { id: 'awp-atheris', name: 'AWP | Atheris', rarity: 'restricted', case: 'awp', image: 'img/skins/awp-atheris.webp', float: [0.00, 1.00] },
  { id: 'awp-exoskeleton', name: 'AWP | Exoskeleton', rarity: 'restricted', case: 'awp', image: 'img/skins/awp-exoskeleton.webp', float: [0.00, 1.00] },
  { id: 'awp-paw', name: 'AWP | PAW', rarity: 'restricted', case: 'awp', image: 'img/skins/awp-paw.webp', float: [0.00, 0.50] },
  { id: 'awp-worm-god', name: 'AWP | Worm God', rarity: 'restricted', case: 'awp', image: 'img/skins/awp-worm-god.webp', float: [0.00, 0.45] },
  { id: 'awp-acheron', name: 'AWP | Acheron', rarity: 'milspec', case: 'awp', image: 'img/skins/awp-acheron.webp', float: [0.00, 0.83], st: false },
  { id: 'awp-arsenic-spill', name: 'AWP | Arsenic Spill', rarity: 'milspec', case: 'awp', image: 'img/skins/awp-arsenic-spill.webp', float: [0.00, 0.50], st: false },
  { id: 'awp-black-nile', name: 'AWP | Black Nile', rarity: 'milspec', case: 'awp', image: 'img/skins/awp-black-nile.webp', float: [0.00, 0.75], st: false },
  { id: 'awp-capillary', name: 'AWP | Capillary', rarity: 'milspec', case: 'awp', image: 'img/skins/awp-capillary.webp', float: [0.05, 0.70] },
  { id: 'awp-snake-camo', name: 'AWP | Snake Camo', rarity: 'milspec', case: 'awp', image: 'img/skins/awp-snake-camo.webp', float: [0.06, 0.80], st: false },
  { id: 'scar-20-poultrygeist', name: 'SCAR-20 | Poultrygeist', rarity: 'milspec', case: 'awp', image: 'img/skins/scar-20-poultrygeist.webp', float: [0.00, 0.57] },
  // ── Кейс «M4» ─────────────────────────────
  { id: 'bayonet-crimson-web', name: '★ Bayonet | Crimson Web', rarity: 'gold', case: 'm4', image: 'img/skins/bayonet-crimson-web.webp', float: [0.06, 0.80] },
  { id: 'bayonet-doppler', name: '★ Bayonet | Doppler', rarity: 'gold', case: 'm4', image: 'img/skins/bayonet-doppler.webp', float: [0.00, 0.08] },
  { id: 'bayonet-fade', name: '★ Bayonet | Fade', rarity: 'gold', case: 'm4', image: 'img/skins/bayonet-fade.webp', float: [0.00, 0.08] },
  { id: 'bayonet-marble-fade', name: '★ Bayonet | Marble Fade', rarity: 'gold', case: 'm4', image: 'img/skins/bayonet-marble-fade.webp', float: [0.00, 0.08] },
  { id: 'bayonet-tiger-tooth', name: '★ Bayonet | Tiger Tooth', rarity: 'gold', case: 'm4', image: 'img/skins/bayonet-tiger-tooth.webp', float: [0.00, 0.08] },
  { id: 'm4a4-temukau', name: 'M4A4 | Temukau', rarity: 'covert', case: 'm4', image: 'img/skins/m4a4-temukau.webp', float: [0.00, 0.80] },
  { id: 'm4a4-the-battlestar', name: 'M4A4 | The Battlestar', rarity: 'covert', case: 'm4', image: 'img/skins/m4a4-the-battlestar.webp', float: [0.00, 0.64] },
  { id: 'm4a1-s-atomic-alloy', name: 'M4A1-S | Atomic Alloy', rarity: 'classified', case: 'm4', image: 'img/skins/m4a1-s-atomic-alloy.webp', float: [0.00, 0.90] },
  { id: 'm4a1-s-guardian', name: 'M4A1-S | Guardian', rarity: 'classified', case: 'm4', image: 'img/skins/m4a1-s-guardian.webp', float: [0.00, 0.50] },
  { id: 'm4a4-dragon-king', name: 'M4A4 | 龍王 (Dragon King)', rarity: 'classified', case: 'm4', image: 'img/skins/m4a4-dragon-king.webp', float: [0.00, 0.75] },
  { id: 'm4a1-s-bright-water', name: 'M4A1-S | Bright Water', rarity: 'restricted', case: 'm4', image: 'img/skins/m4a1-s-bright-water.webp', float: [0.10, 0.22] },
  { id: 'm4a1-s-dark-water', name: 'M4A1-S | Dark Water', rarity: 'restricted', case: 'm4', image: 'img/skins/m4a1-s-dark-water.webp', float: [0.10, 0.26] },
  { id: 'm4a4-spider-lily', name: 'M4A4 | Spider Lily', rarity: 'restricted', case: 'm4', image: 'img/skins/m4a4-spider-lily.webp', float: [0.00, 1.00] },
  { id: 'm4a4-zirka', name: 'M4A4 | Zirka', rarity: 'restricted', case: 'm4', image: 'img/skins/m4a4-zirka.webp', float: [0.06, 0.42] },
  { id: 'm4a1-s-blood-tiger', name: 'M4A1-S | Blood Tiger', rarity: 'milspec', case: 'm4', image: 'img/skins/m4a1-s-blood-tiger.webp', float: [0.00, 0.30] },
  { id: 'm4a1-s-briefing', name: 'M4A1-S | Briefing', rarity: 'milspec', case: 'm4', image: 'img/skins/m4a1-s-briefing.webp', float: [0.00, 0.80] },
  { id: 'm4a4-choppa', name: 'M4A4 | Choppa', rarity: 'milspec', case: 'm4', image: 'img/skins/m4a4-choppa.webp', float: [0.00, 1.00] },
  { id: 'm4a4-faded-zebra', name: 'M4A4 | Faded Zebra', rarity: 'milspec', case: 'm4', image: 'img/skins/m4a4-faded-zebra.webp', float: [0.06, 0.80] },
  { id: 'm4a4-magnesium', name: 'M4A4 | Magnesium', rarity: 'milspec', case: 'm4', image: 'img/skins/m4a4-magnesium.webp', float: [0.00, 1.00] },
  { id: 'm4a4-poly-mag', name: 'M4A4 | Poly Mag', rarity: 'milspec', case: 'm4', image: 'img/skins/m4a4-poly-mag.webp', float: [0.00, 1.00] },
  // ── Кейс «Desert Eagle» ─────────────────────────────
  { id: 'butterfly-knife-crimson-web', name: '★ Butterfly Knife | Crimson Web', rarity: 'gold', case: 'deagle', image: 'img/skins/butterfly-knife-crimson-web.webp', float: [0.06, 0.80] },
  { id: 'butterfly-knife-doppler', name: '★ Butterfly Knife | Doppler', rarity: 'gold', case: 'deagle', image: 'img/skins/butterfly-knife-doppler.webp', float: [0.00, 0.08] },
  { id: 'butterfly-knife-fade', name: '★ Butterfly Knife | Fade', rarity: 'gold', case: 'deagle', image: 'img/skins/butterfly-knife-fade.webp', float: [0.00, 0.08] },
  { id: 'butterfly-knife-marble-fade', name: '★ Butterfly Knife | Marble Fade', rarity: 'gold', case: 'deagle', image: 'img/skins/butterfly-knife-marble-fade.webp', float: [0.00, 0.08] },
  { id: 'butterfly-knife-tiger-tooth', name: '★ Butterfly Knife | Tiger Tooth', rarity: 'gold', case: 'deagle', image: 'img/skins/butterfly-knife-tiger-tooth.webp', float: [0.00, 0.08] },
  { id: 'desert-eagle-golden-koi', name: 'Desert Eagle | Golden Koi', rarity: 'covert', case: 'deagle', image: 'img/skins/desert-eagle-golden-koi.webp', float: [0.00, 0.12] },
  { id: 'desert-eagle-ocean-drive', name: 'Desert Eagle | Ocean Drive', rarity: 'covert', case: 'deagle', image: 'img/skins/desert-eagle-ocean-drive.webp', float: [0.00, 1.00] },
  { id: 'desert-eagle-cobalt-disruption', name: 'Desert Eagle | Cobalt Disruption', rarity: 'classified', case: 'deagle', image: 'img/skins/desert-eagle-cobalt-disruption.webp', float: [0.00, 0.20] },
  { id: 'desert-eagle-kumicho-dragon', name: 'Desert Eagle | Kumicho Dragon', rarity: 'classified', case: 'deagle', image: 'img/skins/desert-eagle-kumicho-dragon.webp', float: [0.00, 0.76] },
  { id: 'desert-eagle-mecha-industries', name: 'Desert Eagle | Mecha Industries', rarity: 'classified', case: 'deagle', image: 'img/skins/desert-eagle-mecha-industries.webp', float: [0.00, 0.60] },
  { id: 'desert-eagle-heirloom', name: 'Desert Eagle | Heirloom', rarity: 'restricted', case: 'deagle', image: 'img/skins/desert-eagle-heirloom.webp', float: [0.00, 0.80] },
  { id: 'desert-eagle-light-rail', name: 'Desert Eagle | Light Rail', rarity: 'restricted', case: 'deagle', image: 'img/skins/desert-eagle-light-rail.webp', float: [0.00, 0.90] },
  { id: 'desert-eagle-naga', name: 'Desert Eagle | Naga', rarity: 'restricted', case: 'deagle', image: 'img/skins/desert-eagle-naga.webp', float: [0.00, 1.00] },
  { id: 'desert-eagle-serpent-strike', name: 'Desert Eagle | Serpent Strike', rarity: 'restricted', case: 'deagle', image: 'img/skins/desert-eagle-serpent-strike.webp', float: [0.00, 0.57] },
  { id: 'desert-eagle-blue-ply', name: 'Desert Eagle | Blue Ply', rarity: 'milspec', case: 'deagle', image: 'img/skins/desert-eagle-blue-ply.webp', float: [0.00, 1.00] },
  { id: 'desert-eagle-bronze-deco', name: 'Desert Eagle | Bronze Deco', rarity: 'milspec', case: 'deagle', image: 'img/skins/desert-eagle-bronze-deco.webp', float: [0.00, 0.46] },
  { id: 'desert-eagle-calligraffiti', name: 'Desert Eagle | Calligraffiti', rarity: 'milspec', case: 'deagle', image: 'img/skins/desert-eagle-calligraffiti.webp', float: [0.00, 1.00] },
  { id: 'desert-eagle-corinthian', name: 'Desert Eagle | Corinthian', rarity: 'milspec', case: 'deagle', image: 'img/skins/desert-eagle-corinthian.webp', float: [0.00, 0.44] },
  { id: 'desert-eagle-oxide-blaze', name: 'Desert Eagle | Oxide Blaze', rarity: 'milspec', case: 'deagle', image: 'img/skins/desert-eagle-oxide-blaze.webp', float: [0.00, 0.50] },
  { id: 'desert-eagle-urban-rubble', name: 'Desert Eagle | Urban Rubble', rarity: 'milspec', case: 'deagle', image: 'img/skins/desert-eagle-urban-rubble.webp', float: [0.00, 0.50], st: false },
  // ── Кейс «Пистолеты» ─────────────────────────────
  { id: 'flip-knife-crimson-web', name: '★ Flip Knife | Crimson Web', rarity: 'gold', case: 'pistols', image: 'img/skins/flip-knife-crimson-web.webp', float: [0.06, 0.80] },
  { id: 'flip-knife-doppler', name: '★ Flip Knife | Doppler', rarity: 'gold', case: 'pistols', image: 'img/skins/flip-knife-doppler.webp', float: [0.00, 0.08] },
  { id: 'flip-knife-fade', name: '★ Flip Knife | Fade', rarity: 'gold', case: 'pistols', image: 'img/skins/flip-knife-fade.webp', float: [0.00, 0.08] },
  { id: 'flip-knife-marble-fade', name: '★ Flip Knife | Marble Fade', rarity: 'gold', case: 'pistols', image: 'img/skins/flip-knife-marble-fade.webp', float: [0.00, 0.08] },
  { id: 'flip-knife-tiger-tooth', name: '★ Flip Knife | Tiger Tooth', rarity: 'gold', case: 'pistols', image: 'img/skins/flip-knife-tiger-tooth.webp', float: [0.00, 0.08] },
  { id: 'glock-18-bullet-queen', name: 'Glock-18 | Bullet Queen', rarity: 'covert', case: 'pistols', image: 'img/skins/glock-18-bullet-queen.webp', float: [0.00, 1.00] },
  { id: 'usp-s-the-traitor', name: 'USP-S | The Traitor', rarity: 'covert', case: 'pistols', image: 'img/skins/usp-s-the-traitor.webp', float: [0.00, 1.00] },
  { id: 'p250-undertow', name: 'P250 | Undertow', rarity: 'classified', case: 'pistols', image: 'img/skins/p250-undertow.webp', float: [0.00, 0.20] },
  { id: 'tec-9-fuel-injector', name: 'Tec-9 | Fuel Injector', rarity: 'classified', case: 'pistols', image: 'img/skins/tec-9-fuel-injector.webp', float: [0.00, 1.00] },
  { id: 'usp-s-cortex', name: 'USP-S | Cortex', rarity: 'classified', case: 'pistols', image: 'img/skins/usp-s-cortex.webp', float: [0.00, 1.00] },
  { id: 'dual-berettas-hemoglobin', name: 'Dual Berettas | Hemoglobin', rarity: 'restricted', case: 'pistols', image: 'img/skins/dual-berettas-hemoglobin.webp', float: [0.00, 0.20] },
  { id: 'dual-berettas-royal-consorts', name: 'Dual Berettas | Royal Consorts', rarity: 'restricted', case: 'pistols', image: 'img/skins/dual-berettas-royal-consorts.webp', float: [0.00, 1.00] },
  { id: 'five-seven-retrobution', name: 'Five-SeveN | Retrobution', rarity: 'restricted', case: 'pistols', image: 'img/skins/five-seven-retrobution.webp', float: [0.00, 1.00] },
  { id: 'p2000-handgun', name: 'P2000 | Handgun', rarity: 'restricted', case: 'pistols', image: 'img/skins/p2000-handgun.webp', float: [0.00, 1.00] },
  { id: 'five-seven-capillary', name: 'Five-SeveN | Capillary', rarity: 'milspec', case: 'pistols', image: 'img/skins/five-seven-capillary.webp', float: [0.00, 0.70] },
  { id: 'p2000-red-fragcam', name: 'P2000 | Red FragCam', rarity: 'milspec', case: 'pistols', image: 'img/skins/p2000-red-fragcam.webp', float: [0.00, 0.70] },
  { id: 'p250-ripple', name: 'P250 | Ripple', rarity: 'milspec', case: 'pistols', image: 'img/skins/p250-ripple.webp', float: [0.00, 0.50] },
  { id: 'tec-9-cracked-opal', name: 'Tec-9 | Cracked Opal', rarity: 'milspec', case: 'pistols', image: 'img/skins/tec-9-cracked-opal.webp', float: [0.00, 1.00] },
  { id: 'usp-s-blood-tiger', name: 'USP-S | Blood Tiger', rarity: 'milspec', case: 'pistols', image: 'img/skins/usp-s-blood-tiger.webp', float: [0.00, 0.30] },
  { id: 'usp-s-lead-conduit', name: 'USP-S | Lead Conduit', rarity: 'milspec', case: 'pistols', image: 'img/skins/usp-s-lead-conduit.webp', float: [0.00, 1.00] },
  // ── Кейс «SMG» ─────────────────────────────
  { id: 'falchion-knife-doppler', name: '★ Falchion Knife | Doppler', rarity: 'gold', case: 'smg', image: 'img/skins/falchion-knife-doppler.webp', float: [0.00, 0.08] },
  { id: 'falchion-knife-fade', name: '★ Falchion Knife | Fade', rarity: 'gold', case: 'smg', image: 'img/skins/falchion-knife-fade.webp', float: [0.00, 0.08] },
  { id: 'falchion-knife-tiger-tooth', name: '★ Falchion Knife | Tiger Tooth', rarity: 'gold', case: 'smg', image: 'img/skins/falchion-knife-tiger-tooth.webp', float: [0.00, 0.08] },
  { id: 'gut-knife-doppler', name: '★ Gut Knife | Doppler', rarity: 'gold', case: 'smg', image: 'img/skins/gut-knife-doppler.webp', float: [0.00, 0.08] },
  { id: 'gut-knife-fade', name: '★ Gut Knife | Fade', rarity: 'gold', case: 'smg', image: 'img/skins/gut-knife-fade.webp', float: [0.00, 0.08] },
  { id: 'mac-10-stalker', name: 'MAC-10 | Stalker', rarity: 'covert', case: 'smg', image: 'img/skins/mac-10-stalker.webp', float: [0.00, 1.00] },
  { id: 'p90-death-by-kitty', name: 'P90 | Death by Kitty', rarity: 'covert', case: 'smg', image: 'img/skins/p90-death-by-kitty.webp', float: [0.08, 0.32] },
  { id: 'p90-shapewood', name: 'P90 | Shapewood', rarity: 'classified', case: 'smg', image: 'img/skins/p90-shapewood.webp', float: [0.00, 1.00] },
  { id: 'ump-45-momentum', name: 'UMP-45 | Momentum', rarity: 'classified', case: 'smg', image: 'img/skins/ump-45-momentum.webp', float: [0.00, 0.50] },
  { id: 'ump-45-neo-noir', name: 'UMP-45 | Neo-Noir', rarity: 'classified', case: 'smg', image: 'img/skins/ump-45-neo-noir.webp', float: [0.00, 1.00] },
  { id: 'mac-10-button-masher', name: 'MAC-10 | Button Masher', rarity: 'restricted', case: 'smg', image: 'img/skins/mac-10-button-masher.webp', float: [0.00, 1.00] },
  { id: 'mac-10-heat', name: 'MAC-10 | Heat', rarity: 'restricted', case: 'smg', image: 'img/skins/mac-10-heat.webp', float: [0.00, 1.00] },
  { id: 'pp-bizon-space-cat', name: 'PP-Bizon | Space Cat', rarity: 'restricted', case: 'smg', image: 'img/skins/pp-bizon-space-cat.webp', float: [0.00, 0.67] },
  { id: 'ump-45-scaffold', name: 'UMP-45 | Scaffold', rarity: 'restricted', case: 'smg', image: 'img/skins/ump-45-scaffold.webp', float: [0.00, 1.00] },
  { id: 'mac-10-light-box', name: 'MAC-10 | Light Box', rarity: 'milspec', case: 'smg', image: 'img/skins/mac-10-light-box.webp', float: [0.00, 1.00] },
  { id: 'mp5-sd-acid-wash', name: 'MP5-SD | Acid Wash', rarity: 'milspec', case: 'smg', image: 'img/skins/mp5-sd-acid-wash.webp', float: [0.00, 0.68] },
  { id: 'mp5-sd-necro-jr', name: 'MP5-SD | Necro Jr.', rarity: 'milspec', case: 'smg', image: 'img/skins/mp5-sd-necro-jr.webp', float: [0.00, 1.00] },
  { id: 'ump-45-briefing', name: 'UMP-45 | Briefing', rarity: 'milspec', case: 'smg', image: 'img/skins/ump-45-briefing.webp', float: [0.00, 1.00] },
  { id: 'ump-45-motorized', name: 'UMP-45 | Motorized', rarity: 'milspec', case: 'smg', image: 'img/skins/ump-45-motorized.webp', float: [0.00, 0.80] },
  { id: 'ump-45-roadblock', name: 'UMP-45 | Roadblock', rarity: 'milspec', case: 'smg', image: 'img/skins/ump-45-roadblock.webp', float: [0.00, 1.00] },
  // ── Кейс «Винтовки» ─────────────────────────────
  { id: 'huntsman-knife-crimson-web', name: '★ Huntsman Knife | Crimson Web', rarity: 'gold', case: 'rifles', image: 'img/skins/huntsman-knife-crimson-web.webp', float: [0.06, 0.80] },
  { id: 'huntsman-knife-doppler', name: '★ Huntsman Knife | Doppler', rarity: 'gold', case: 'rifles', image: 'img/skins/huntsman-knife-doppler.webp', float: [0.00, 0.08] },
  { id: 'huntsman-knife-fade', name: '★ Huntsman Knife | Fade', rarity: 'gold', case: 'rifles', image: 'img/skins/huntsman-knife-fade.webp', float: [0.00, 0.08] },
  { id: 'huntsman-knife-marble-fade', name: '★ Huntsman Knife | Marble Fade', rarity: 'gold', case: 'rifles', image: 'img/skins/huntsman-knife-marble-fade.webp', float: [0.00, 0.08] },
  { id: 'huntsman-knife-tiger-tooth', name: '★ Huntsman Knife | Tiger Tooth', rarity: 'gold', case: 'rifles', image: 'img/skins/huntsman-knife-tiger-tooth.webp', float: [0.00, 0.08] },
  { id: 'famas-commemoration', name: 'FAMAS | Commemoration', rarity: 'covert', case: 'rifles', image: 'img/skins/famas-commemoration.webp', float: [0.00, 0.50] },
  { id: 'galil-ar-chatterbox', name: 'Galil AR | Chatterbox', rarity: 'covert', case: 'rifles', image: 'img/skins/galil-ar-chatterbox.webp', float: [0.35, 0.85] },
  { id: 'g3sg1-flux', name: 'G3SG1 | Flux', rarity: 'classified', case: 'rifles', image: 'img/skins/g3sg1-flux.webp', float: [0.00, 0.90] },
  { id: 'g3sg1-the-executioner', name: 'G3SG1 | The Executioner', rarity: 'classified', case: 'rifles', image: 'img/skins/g3sg1-the-executioner.webp', float: [0.14, 0.85] },
  { id: 'galil-ar-chromatic-aberration', name: 'Galil AR | Chromatic Aberration', rarity: 'classified', case: 'rifles', image: 'img/skins/galil-ar-chromatic-aberration.webp', float: [0.00, 1.00] },
  { id: 'aug-aristocrat', name: 'AUG | Aristocrat', rarity: 'restricted', case: 'rifles', image: 'img/skins/aug-aristocrat.webp', float: [0.00, 0.66] },
  { id: 'famas-pulse', name: 'FAMAS | Pulse', rarity: 'restricted', case: 'rifles', image: 'img/skins/famas-pulse.webp', float: [0.00, 0.40] },
  { id: 'galil-ar-stone-cold', name: 'Galil AR | Stone Cold', rarity: 'restricted', case: 'rifles', image: 'img/skins/galil-ar-stone-cold.webp', float: [0.00, 0.90] },
  { id: 'ssg-08-parallax', name: 'SSG 08 | Parallax', rarity: 'restricted', case: 'rifles', image: 'img/skins/ssg-08-parallax.webp', float: [0.00, 1.00] },
  { id: 'aug-triqua', name: 'AUG | Triqua', rarity: 'milspec', case: 'rifles', image: 'img/skins/aug-triqua.webp', float: [0.00, 1.00] },
  { id: 'famas-macabre', name: 'FAMAS | Macabre', rarity: 'milspec', case: 'rifles', image: 'img/skins/famas-macabre.webp', float: [0.00, 0.60] },
  { id: 'g3sg1-ventilator', name: 'G3SG1 | Ventilator', rarity: 'milspec', case: 'rifles', image: 'img/skins/g3sg1-ventilator.webp', float: [0.00, 0.45] },
  { id: 'scar-20-assault', name: 'SCAR-20 | Assault', rarity: 'milspec', case: 'rifles', image: 'img/skins/scar-20-assault.webp', float: [0.00, 0.62] },
  { id: 'scar-20-blueprint', name: 'SCAR-20 | Blueprint', rarity: 'milspec', case: 'rifles', image: 'img/skins/scar-20-blueprint.webp', float: [0.00, 0.75] },
  { id: 'sg-553-ultraviolet', name: 'SG 553 | Ultraviolet', rarity: 'milspec', case: 'rifles', image: 'img/skins/sg-553-ultraviolet.webp', float: [0.06, 0.80] },
  // ── Кейс «Тяжёлый» ─────────────────────────────
  { id: 'stiletto-knife-doppler', name: '★ Stiletto Knife | Doppler', rarity: 'gold', case: 'heavy', image: 'img/skins/stiletto-knife-doppler.webp', float: [0.00, 0.08] },
  { id: 'stiletto-knife-fade', name: '★ Stiletto Knife | Fade', rarity: 'gold', case: 'heavy', image: 'img/skins/stiletto-knife-fade.webp', float: [0.00, 0.08] },
  { id: 'stiletto-knife-tiger-tooth', name: '★ Stiletto Knife | Tiger Tooth', rarity: 'gold', case: 'heavy', image: 'img/skins/stiletto-knife-tiger-tooth.webp', float: [0.00, 0.08] },
  { id: 'ursus-knife-doppler', name: '★ Ursus Knife | Doppler', rarity: 'gold', case: 'heavy', image: 'img/skins/ursus-knife-doppler.webp', float: [0.00, 0.08] },
  { id: 'ursus-knife-fade', name: '★ Ursus Knife | Fade', rarity: 'gold', case: 'heavy', image: 'img/skins/ursus-knife-fade.webp', float: [0.00, 0.08] },
  { id: 'mp7-bloodsport', name: 'MP7 | Bloodsport', rarity: 'covert', case: 'heavy', image: 'img/skins/mp7-bloodsport.webp', float: [0.00, 0.65] },
  { id: 'sawed-off-the-kraken', name: 'Sawed-Off | The Kraken', rarity: 'covert', case: 'heavy', image: 'img/skins/sawed-off-the-kraken.webp', float: [0.00, 0.40] },
  { id: 'nova-antique', name: 'Nova | Antique', rarity: 'classified', case: 'heavy', image: 'img/skins/nova-antique.webp', float: [0.00, 0.30] },
  { id: 'xm1014-entombed', name: 'XM1014 | Entombed', rarity: 'classified', case: 'heavy', image: 'img/skins/xm1014-entombed.webp', float: [0.00, 0.50] },
  { id: 'xm1014-incinegator', name: 'XM1014 | Incinegator', rarity: 'classified', case: 'heavy', image: 'img/skins/xm1014-incinegator.webp', float: [0.14, 0.65] },
  { id: 'nova-koi', name: 'Nova | Koi', rarity: 'restricted', case: 'heavy', image: 'img/skins/nova-koi.webp', float: [0.00, 0.30] },
  { id: 'sawed-off-analog-input', name: 'Sawed-Off | Analog Input', rarity: 'restricted', case: 'heavy', image: 'img/skins/sawed-off-analog-input.webp', float: [0.00, 0.62] },
  { id: 'sawed-off-highwayman', name: 'Sawed-Off | Highwayman', rarity: 'restricted', case: 'heavy', image: 'img/skins/sawed-off-highwayman.webp', float: [0.00, 1.00] },
  { id: 'xm1014-ziggy', name: 'XM1014 | Ziggy', rarity: 'restricted', case: 'heavy', image: 'img/skins/xm1014-ziggy.webp', float: [0.00, 0.72] },
  { id: 'm249-hypnosis', name: 'M249 | Hypnosis', rarity: 'milspec', case: 'heavy', image: 'img/skins/m249-hypnosis.webp', float: [0.00, 1.00] },
  { id: 'm249-warbird', name: 'M249 | Warbird', rarity: 'milspec', case: 'heavy', image: 'img/skins/m249-warbird.webp', float: [0.05, 0.65] },
  { id: 'mag-7-foresight', name: 'MAG-7 | Foresight', rarity: 'milspec', case: 'heavy', image: 'img/skins/mag-7-foresight.webp', float: [0.00, 0.70] },
  { id: 'nova-dark-sigil', name: 'Nova | Dark Sigil', rarity: 'milspec', case: 'heavy', image: 'img/skins/nova-dark-sigil.webp', float: [0.00, 0.70] },
  { id: 'sawed-off-spirit-board', name: 'Sawed-Off | Spirit Board', rarity: 'milspec', case: 'heavy', image: 'img/skins/sawed-off-spirit-board.webp', float: [0.00, 1.00] },
  { id: 'xm1014-quicksilver', name: 'XM1014 | Quicksilver', rarity: 'milspec', case: 'heavy', image: 'img/skins/xm1014-quicksilver.webp', float: [0.00, 0.50] },
  // ── Кейс «Перчатки» ─────────────────────────────
  { id: 'bloodhound-gloves-bronzed', name: '★ Bloodhound Gloves | Bronzed', rarity: 'gold', case: 'gloves', image: 'img/skins/bloodhound-gloves-bronzed.webp', float: [0.06, 0.80], st: false },
  { id: 'broken-fang-gloves-jade', name: '★ Broken Fang Gloves | Jade', rarity: 'gold', case: 'gloves', image: 'img/skins/broken-fang-gloves-jade.webp', float: [0.06, 0.80], st: false },
  { id: 'driver-gloves-king-snake', name: '★ Driver Gloves | King Snake', rarity: 'gold', case: 'gloves', image: 'img/skins/driver-gloves-king-snake.webp', float: [0.06, 0.80], st: false },
  { id: 'hand-wraps-cobalt-skulls', name: '★ Hand Wraps | Cobalt Skulls', rarity: 'gold', case: 'gloves', image: 'img/skins/hand-wraps-cobalt-skulls.webp', float: [0.06, 0.80], st: false },
  { id: 'specialist-gloves-crimson-kimono', name: '★ Specialist Gloves | Crimson Kimono', rarity: 'gold', case: 'gloves', image: 'img/skins/specialist-gloves-crimson-kimono.webp', float: [0.06, 0.80], st: false },
  { id: 'sport-gloves-vice', name: '★ Sport Gloves | Vice', rarity: 'gold', case: 'gloves', image: 'img/skins/sport-gloves-vice.webp', float: [0.06, 0.80], st: false },
  { id: 'ak-47-asiimov', name: 'AK-47 | Asiimov', rarity: 'covert', case: 'gloves', image: 'img/skins/ak-47-asiimov.webp', float: [0.05, 0.70] },
  { id: 'm4a1-s-chantico-s-fire', name: 'M4A1-S | Chantico\'s Fire', rarity: 'covert', case: 'gloves', image: 'img/skins/m4a1-s-chantico-s-fire.webp', float: [0.00, 0.99] },
  { id: 'ak-47-frontside-misty', name: 'AK-47 | Frontside Misty', rarity: 'classified', case: 'gloves', image: 'img/skins/ak-47-frontside-misty.webp', float: [0.02, 0.87] },
  { id: 'p250-visions', name: 'P250 | Visions', rarity: 'classified', case: 'gloves', image: 'img/skins/p250-visions.webp', float: [0.00, 0.70] },
  { id: 'scar-20-bloodsport', name: 'SCAR-20 | Bloodsport', rarity: 'classified', case: 'gloves', image: 'img/skins/scar-20-bloodsport.webp', float: [0.00, 0.45] },
  { id: 'galil-ar-connexion', name: 'Galil AR | Connexion', rarity: 'restricted', case: 'gloves', image: 'img/skins/galil-ar-connexion.webp', float: [0.00, 0.80] },
  { id: 'mp7-powercore', name: 'MP7 | Powercore', rarity: 'restricted', case: 'gloves', image: 'img/skins/mp7-powercore.webp', float: [0.00, 0.80] },
  { id: 'mp9-goo', name: 'MP9 | Goo', rarity: 'restricted', case: 'gloves', image: 'img/skins/mp9-goo.webp', float: [0.00, 0.60] },
  { id: 'zeus-x27-tosai', name: 'Zeus x27 | Tosai', rarity: 'restricted', case: 'gloves', image: 'img/skins/zeus-x27-tosai.webp', float: [0.00, 0.70] },
  { id: 'famas-survivor-z', name: 'FAMAS | Survivor Z', rarity: 'milspec', case: 'gloves', image: 'img/skins/famas-survivor-z.webp', float: [0.00, 0.60] },
  { id: 'mag-7-resupply', name: 'MAG-7 | Resupply', rarity: 'milspec', case: 'gloves', image: 'img/skins/mag-7-resupply.webp', float: [0.00, 1.00] },
  { id: 'p2000-sure-grip', name: 'P2000 | Sure Grip', rarity: 'milspec', case: 'gloves', image: 'img/skins/p2000-sure-grip.webp', float: [0.00, 0.90] },
  { id: 'p250-cassette', name: 'P250 | Cassette', rarity: 'milspec', case: 'gloves', image: 'img/skins/p250-cassette.webp', float: [0.00, 0.60] },
  { id: 'sawed-off-yorick', name: 'Sawed-Off | Yorick', rarity: 'milspec', case: 'gloves', image: 'img/skins/sawed-off-yorick.webp', float: [0.00, 1.00] },
  { id: 'tec-9-ice-cap', name: 'Tec-9 | Ice Cap', rarity: 'milspec', case: 'gloves', image: 'img/skins/tec-9-ice-cap.webp', float: [0.00, 0.50] },
  // ── Кейс «Новичок» ─────────────────────────────
  { id: 'navaja-knife-doppler', name: '★ Navaja Knife | Doppler', rarity: 'gold', case: 'starter', image: 'img/skins/navaja-knife-doppler.webp', float: [0.00, 0.08] },
  { id: 'navaja-knife-fade', name: '★ Navaja Knife | Fade', rarity: 'gold', case: 'starter', image: 'img/skins/navaja-knife-fade.webp', float: [0.00, 0.08] },
  { id: 'navaja-knife-tiger-tooth', name: '★ Navaja Knife | Tiger Tooth', rarity: 'gold', case: 'starter', image: 'img/skins/navaja-knife-tiger-tooth.webp', float: [0.00, 0.08] },
  { id: 'shadow-daggers-doppler', name: '★ Shadow Daggers | Doppler', rarity: 'gold', case: 'starter', image: 'img/skins/shadow-daggers-doppler.webp', float: [0.00, 0.08] },
  { id: 'shadow-daggers-fade', name: '★ Shadow Daggers | Fade', rarity: 'gold', case: 'starter', image: 'img/skins/shadow-daggers-fade.webp', float: [0.00, 0.08] },
  { id: 'ak-47-fuel-injector', name: 'AK-47 | Fuel Injector', rarity: 'covert', case: 'starter', image: 'img/skins/ak-47-fuel-injector.webp', float: [0.00, 1.00] },
  { id: 'm4a4-x-ray', name: 'M4A4 | X-Ray', rarity: 'covert', case: 'starter', image: 'img/skins/m4a4-x-ray.webp', float: [0.00, 0.30] },
  { id: 'famas-afterimage', name: 'FAMAS | Afterimage', rarity: 'classified', case: 'starter', image: 'img/skins/famas-afterimage.webp', float: [0.02, 0.40] },
  { id: 'p2000-wicked-sick', name: 'P2000 | Wicked Sick', rarity: 'classified', case: 'starter', image: 'img/skins/p2000-wicked-sick.webp', float: [0.00, 1.00] },
  { id: 'p90-cold-blooded', name: 'P90 | Cold Blooded', rarity: 'classified', case: 'starter', image: 'img/skins/p90-cold-blooded.webp', float: [0.00, 0.08] },
  { id: 'famas-zx-spectron', name: 'FAMAS | ZX Spectron', rarity: 'restricted', case: 'starter', image: 'img/skins/famas-zx-spectron.webp', float: [0.00, 1.00] },
  { id: 'glock-18-dragon-tattoo', name: 'Glock-18 | Dragon Tattoo', rarity: 'restricted', case: 'starter', image: 'img/skins/glock-18-dragon-tattoo.webp', float: [0.00, 0.08] },
  { id: 'glock-18-moonrise', name: 'Glock-18 | Moonrise', rarity: 'restricted', case: 'starter', image: 'img/skins/glock-18-moonrise.webp', float: [0.00, 0.65] },
  { id: 'm4a1-s-basilisk', name: 'M4A1-S | Basilisk', rarity: 'restricted', case: 'starter', image: 'img/skins/m4a1-s-basilisk.webp', float: [0.00, 0.68] },
  { id: 'cz75-auto-twist', name: 'CZ75-Auto | Twist', rarity: 'milspec', case: 'starter', image: 'img/skins/cz75-auto-twist.webp', float: [0.00, 1.00] },
  { id: 'five-seven-flame-test', name: 'Five-SeveN | Flame Test', rarity: 'milspec', case: 'starter', image: 'img/skins/five-seven-flame-test.webp', float: [0.00, 0.65] },
  { id: 'g3sg1-demeter', name: 'G3SG1 | Demeter', rarity: 'milspec', case: 'starter', image: 'img/skins/g3sg1-demeter.webp', float: [0.06, 0.80] },
  { id: 'mac-10-oceanic', name: 'MAC-10 | Oceanic', rarity: 'milspec', case: 'starter', image: 'img/skins/mac-10-oceanic.webp', float: [0.00, 0.60] },
  { id: 'scar-20-crimson-web', name: 'SCAR-20 | Crimson Web', rarity: 'milspec', case: 'starter', image: 'img/skins/scar-20-crimson-web.webp', float: [0.06, 0.80] },
  { id: 'scar-20-outbreak', name: 'SCAR-20 | Outbreak', rarity: 'milspec', case: 'starter', image: 'img/skins/scar-20-outbreak.webp', float: [0.00, 0.50] },
  // ── Кейс «Radioactive Burger», «Cyber Psycho», «Aramzamzam» ниже ──
  // ── Кейс «Radioactive Burger» ─────────────────────────────
  { id: 'karambit-gamma-doppler', name: '★ Karambit | Gamma Doppler', rarity: 'gold', case: 'burger', image: 'img/skins/karambit-gamma-doppler.webp', float: [0.00, 0.08] },
  { id: 'butterfly-knife-gamma-doppler', name: '★ Butterfly Knife | Gamma Doppler', rarity: 'gold', case: 'burger', image: 'img/skins/butterfly-knife-gamma-doppler.webp', float: [0.00, 0.08] },
  { id: 'm9-bayonet-gamma-doppler', name: '★ M9 Bayonet | Gamma Doppler', rarity: 'gold', case: 'burger', image: 'img/skins/m9-bayonet-gamma-doppler.webp', float: [0.00, 0.08] },
  { id: 'sport-gloves-hedge-maze', name: '★ Sport Gloves | Hedge Maze', rarity: 'gold', case: 'burger', image: 'img/skins/sport-gloves-hedge-maze.webp', float: [0.06, 0.80], st: false },
  { id: 'specialist-gloves-emerald-web', name: '★ Specialist Gloves | Emerald Web', rarity: 'gold', case: 'burger', image: 'img/skins/specialist-gloves-emerald-web.webp', float: [0.06, 0.80], st: false },
  { id: 'hydra-gloves-emerald', name: '★ Hydra Gloves | Emerald', rarity: 'gold', case: 'burger', image: 'img/skins/hydra-gloves-emerald.webp', float: [0.06, 0.80], st: false },
  { id: 'awp-containment-breach', name: 'AWP | Containment Breach', rarity: 'covert', case: 'burger', image: 'img/skins/awp-containment-breach.webp', float: [0.00, 1.00] },
  { id: 'ak-47-wild-lotus', name: 'AK-47 | Wild Lotus', rarity: 'covert', case: 'burger', image: 'img/skins/ak-47-wild-lotus.webp', float: [0.00, 1.00], st: false },
  { id: 'glock-18-gamma-doppler', name: 'Glock-18 | Gamma Doppler', rarity: 'covert', case: 'burger', image: 'img/skins/glock-18-gamma-doppler.webp', float: [0.00, 0.50], st: false },
  { id: 'm4a1-s-welcome-to-the-jungle', name: 'M4A1-S | Welcome to the Jungle', rarity: 'covert', case: 'burger', image: 'img/skins/m4a1-s-welcome-to-the-jungle.webp', float: [0.00, 1.00], st: false },
  { id: 'm4a1-s-hyper-beast', name: 'M4A1-S | Hyper Beast', rarity: 'covert', case: 'burger', image: 'img/skins/m4a1-s-hyper-beast.webp', float: [0.00, 1.00] },
  { id: 'ak-47-hydroponic', name: 'AK-47 | Hydroponic', rarity: 'classified', case: 'burger', image: 'img/skins/ak-47-hydroponic.webp', float: [0.00, 0.80], st: false },
  { id: 'p90-emerald-dragon', name: 'P90 | Emerald Dragon', rarity: 'classified', case: 'burger', image: 'img/skins/p90-emerald-dragon.webp', float: [0.06, 0.52] },
  { id: 'sg-553-hazard-pay', name: 'SG 553 | Hazard Pay', rarity: 'classified', case: 'burger', image: 'img/skins/sg-553-hazard-pay.webp', float: [0.00, 0.48], st: false },
  { id: 'five-seven-fall-hazard', name: 'Five-SeveN | Fall Hazard', rarity: 'classified', case: 'burger', image: 'img/skins/five-seven-fall-hazard.webp', float: [0.01, 0.52], st: false },
  { id: 'p250-nuclear-threat', name: 'P250 | Nuclear Threat', rarity: 'restricted', case: 'burger', image: 'img/skins/p250-nuclear-threat.webp', float: [0.06, 0.80], st: false },
  { id: 'glock-18-nuclear-garden', name: 'Glock-18 | Nuclear Garden', rarity: 'restricted', case: 'burger', image: 'img/skins/glock-18-nuclear-garden.webp', float: [0.00, 0.70], st: false },
  { id: 'desert-eagle-emerald-jormungandr', name: 'Desert Eagle | Emerald Jörmungandr', rarity: 'restricted', case: 'burger', image: 'img/skins/desert-eagle-emerald-jormungandr.webp', float: [0.00, 0.50], st: false },
  { id: 'tec-9-nuclear-threat', name: 'Tec-9 | Nuclear Threat', rarity: 'restricted', case: 'burger', image: 'img/skins/tec-9-nuclear-threat.webp', float: [0.06, 0.80], st: false },
  // ── Кейс «Cyber Psycho» ─────────────────────────────
  { id: 'sport-gloves-superconductor', name: '★ Sport Gloves | Superconductor', rarity: 'gold', case: 'cyber', image: 'img/skins/sport-gloves-superconductor.webp', float: [0.06, 0.80], st: false },
  { id: 'sport-gloves-pandora-s-box', name: '★ Sport Gloves | Pandora\'s Box', rarity: 'gold', case: 'cyber', image: 'img/skins/sport-gloves-pandora-s-box.webp', float: [0.06, 0.80], st: false },
  { id: 'hand-wraps-overprint', name: '★ Hand Wraps | Overprint', rarity: 'gold', case: 'cyber', image: 'img/skins/hand-wraps-overprint.webp', float: [0.06, 0.80], st: false },
  { id: 'karambit-ultraviolet', name: '★ Karambit | Ultraviolet', rarity: 'gold', case: 'cyber', image: 'img/skins/karambit-ultraviolet.webp', float: [0.06, 0.80] },
  { id: 'butterfly-knife-ultraviolet', name: '★ Butterfly Knife | Ultraviolet', rarity: 'gold', case: 'cyber', image: 'img/skins/butterfly-knife-ultraviolet.webp', float: [0.06, 0.80] },
  { id: 'talon-knife-ultraviolet', name: '★ Talon Knife | Ultraviolet', rarity: 'gold', case: 'cyber', image: 'img/skins/talon-knife-ultraviolet.webp', float: [0.06, 0.80] },
  { id: 'ak-47-neon-rider', name: 'AK-47 | Neon Rider', rarity: 'covert', case: 'cyber', image: 'img/skins/ak-47-neon-rider.webp', float: [0.00, 0.80] },
  { id: 'ak-47-neon-revolution', name: 'AK-47 | Neon Revolution', rarity: 'covert', case: 'cyber', image: 'img/skins/ak-47-neon-revolution.webp', float: [0.00, 0.80] },
  { id: 'awp-neo-noir', name: 'AWP | Neo-Noir', rarity: 'covert', case: 'cyber', image: 'img/skins/awp-neo-noir.webp', float: [0.00, 0.50] },
  { id: 'm4a1-s-printstream', name: 'M4A1-S | Printstream', rarity: 'covert', case: 'cyber', image: 'img/skins/m4a1-s-printstream.webp', float: [0.00, 0.80] },
  { id: 'desert-eagle-printstream', name: 'Desert Eagle | Printstream', rarity: 'covert', case: 'cyber', image: 'img/skins/desert-eagle-printstream.webp', float: [0.00, 0.80] },
  { id: 'm4a4-cyber-security', name: 'M4A4 | Cyber Security', rarity: 'classified', case: 'cyber', image: 'img/skins/m4a4-cyber-security.webp', float: [0.00, 0.98] },
  { id: 'm4a1-s-fatal-glitch', name: 'M4A1-S | Fatal Glitch', rarity: 'classified', case: 'cyber', image: 'img/skins/m4a1-s-fatal-glitch.webp', float: [0.00, 1.00], st: false },
  { id: 'awp-electric-hive', name: 'AWP | Electric Hive', rarity: 'classified', case: 'cyber', image: 'img/skins/awp-electric-hive.webp', float: [0.00, 0.40] },
  { id: 'usp-s-spiral-glitch', name: 'USP-S | Spiral Glitch', rarity: 'classified', case: 'cyber', image: 'img/skins/usp-s-spiral-glitch.webp', float: [0.00, 1.00], st: false },
  { id: 'p250-cyber-shell', name: 'P250 | Cyber Shell', rarity: 'restricted', case: 'cyber', image: 'img/skins/p250-cyber-shell.webp', float: [0.00, 0.85] },
  { id: 'mp7-neon-ply', name: 'MP7 | Neon Ply', rarity: 'restricted', case: 'cyber', image: 'img/skins/mp7-neon-ply.webp', float: [0.00, 1.00] },
  { id: 'm4a1-s-glitched-paint', name: 'M4A1-S | Glitched Paint', rarity: 'restricted', case: 'cyber', image: 'img/skins/m4a1-s-glitched-paint.webp', float: [0.00, 0.67], st: false },
  { id: 'usp-s-cyrex', name: 'USP-S | Cyrex', rarity: 'restricted', case: 'cyber', image: 'img/skins/usp-s-cyrex.webp', float: [0.00, 0.55] },
  // ── Кейс «Aramzamzam» ─────────────────────────────
  { id: 'karambit-lore', name: '★ Karambit | Lore', rarity: 'gold', case: 'aram', image: 'img/skins/karambit-lore.webp', float: [0.00, 0.65] },
  { id: 'butterfly-knife-lore', name: '★ Butterfly Knife | Lore', rarity: 'gold', case: 'aram', image: 'img/skins/butterfly-knife-lore.webp', float: [0.00, 1.00] },
  { id: 'm9-bayonet-lore', name: '★ M9 Bayonet | Lore', rarity: 'gold', case: 'aram', image: 'img/skins/m9-bayonet-lore.webp', float: [0.00, 0.65] },
  { id: 'kukri-knife-case-hardened', name: '★ Kukri Knife | Case Hardened', rarity: 'gold', case: 'aram', image: 'img/skins/kukri-knife-case-hardened.webp', float: [0.00, 1.00] },
  { id: 'hand-wraps-desert-shamagh', name: '★ Hand Wraps | Desert Shamagh', rarity: 'gold', case: 'aram', image: 'img/skins/hand-wraps-desert-shamagh.webp', float: [0.06, 0.80], st: false },
  { id: 'sport-gloves-blaze', name: '★ Sport Gloves | Blaze', rarity: 'gold', case: 'aram', image: 'img/skins/sport-gloves-blaze.webp', float: [0.06, 0.80], st: false },
  { id: 'awp-dragon-lore', name: 'AWP | Dragon Lore', rarity: 'covert', case: 'aram', image: 'img/skins/awp-dragon-lore.webp', float: [0.00, 0.70], st: false },
  { id: 'm4a4-howl', name: 'M4A4 | Howl', rarity: 'covert', case: 'aram', image: 'img/skins/m4a4-howl.webp', float: [0.00, 0.40] },
  { id: 'ak-47-gold-arabesque', name: 'AK-47 | Gold Arabesque', rarity: 'covert', case: 'aram', image: 'img/skins/ak-47-gold-arabesque.webp', float: [0.00, 0.70], st: false },
  { id: 'awp-gungnir', name: 'AWP | Gungnir', rarity: 'covert', case: 'aram', image: 'img/skins/awp-gungnir.webp', float: [0.00, 0.60], st: false },
  { id: 'awp-medusa', name: 'AWP | Medusa', rarity: 'covert', case: 'aram', image: 'img/skins/awp-medusa.webp', float: [0.00, 1.00], st: false },
  { id: 'm4a1-s-golden-coil', name: 'M4A1-S | Golden Coil', rarity: 'covert', case: 'aram', image: 'img/skins/m4a1-s-golden-coil.webp', float: [0.00, 1.00] },
  { id: 'm4a1-s-knight', name: 'M4A1-S | Knight', rarity: 'classified', case: 'aram', image: 'img/skins/m4a1-s-knight.webp', float: [0.00, 0.10], st: false },
  { id: 'ak-47-case-hardened', name: 'AK-47 | Case Hardened', rarity: 'classified', case: 'aram', image: 'img/skins/ak-47-case-hardened.webp', float: [0.00, 1.00] },
  { id: 'sawed-off-wasteland-princess', name: 'Sawed-Off | Wasteland Princess', rarity: 'classified', case: 'aram', image: 'img/skins/sawed-off-wasteland-princess.webp', float: [0.00, 0.70] },
  { id: 'desert-eagle-blaze', name: 'Desert Eagle | Blaze', rarity: 'restricted', case: 'aram', image: 'img/skins/desert-eagle-blaze.webp', float: [0.00, 0.08], st: false },
  { id: 'mac-10-gold-brick', name: 'MAC-10 | Gold Brick', rarity: 'restricted', case: 'aram', image: 'img/skins/mac-10-gold-brick.webp', float: [0.00, 0.70], st: false },
  { id: 'xm1014-ancient-lore', name: 'XM1014 | Ancient Lore', rarity: 'restricted', case: 'aram', image: 'img/skins/xm1014-ancient-lore.webp', float: [0.00, 0.50], st: false },
  { id: 'glock-18-royal-legion', name: 'Glock-18 | Royal Legion', rarity: 'restricted', case: 'aram', image: 'img/skins/glock-18-royal-legion.webp', float: [0.00, 1.00] },
  ],
};
