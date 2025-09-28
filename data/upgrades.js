// Upgrade metadata and defaults
const UPGRADE_CONFIG = {
  atk: {
    defaultLevel: 1,
    baseCost: 90,
    costScale: 0.45,
  },
  crit: {
    defaultLevel: 0,
    baseCost: 150,
    costScale: 0.5,
    effectPerLevel: 0.02,
  },
  spawn: {
    defaultLevel: 0,
    baseCost: 240,
    costScale: 0.55,
  },
  pet: {
    defaultLevel: 0,
    baseCost: 450,
    costScale: 0.6,
    maxLevel: 100,
  },
};

window.UPGRADE_CONFIG = UPGRADE_CONFIG;

window.UPGRADE_DEFAULTS = Object.fromEntries(
  Object.entries(UPGRADE_CONFIG).map(([key, cfg]) => [key, { level: cfg.defaultLevel || 0 }])
);

function upgradeCostLinear(state, key) {
  const cfg = UPGRADE_CONFIG[key];
  if (!cfg) return 0;
  const entry = state.upgrades[key] || {};
  const currentLevel = typeof entry.level === 'number' ? entry.level : (cfg.defaultLevel || 0);
  const baseLevel = cfg.defaultLevel || 0;
  const steps = Math.max(0, currentLevel - baseLevel);
  const scale = typeof cfg.costScale === 'number' ? cfg.costScale : 0;
  return Math.floor(cfg.baseCost * (1 + steps * scale));
}

window.UPGRADE_INFO = [
  {
    key: 'atk',
    title: '🗡️ 공격력',
    getLevel: (state) => state.upgrades.atk.level,
    getLevelLabel: (state) => `Lv ${state.upgrades.atk.level}`,
    getDescription: (state) => `현재 공격력: ${state.player.atk}`,
    getCost: (state) => upgradeCostLinear(state, 'atk'),
    canBuy: () => true,
    onBuy: ({ state }) => {
      state.upgrades.atk.level++;
    },
  },
  {
    key: 'crit',
    title: '🎯 치명타 확률',
    getLevel: (state) => state.upgrades.crit.level,
    getLevelLabel: (state) => `Lv ${state.upgrades.crit.level}`,
    getDescription: (state) => `현재 치명타 확률: ${(state.player.critChance * 100).toFixed(1)}%`,
    getCost: (state) => upgradeCostLinear(state, 'crit'),
    canBuy: () => true,
    onBuy: ({ state }) => {
      state.upgrades.crit.level++;
    },
  },
  {
    key: 'spawn',
    title: '⚙️ 생성 속도',
    getLevel: (state) => state.upgrades.spawn.level,
    getLevelLabel: (state) => `Lv ${state.upgrades.spawn.level}`,
    getDescription: (state) => {
      const level = state.upgrades.spawn.level;
      const baseMs = 2200;
      let interval = baseMs * Math.pow(0.94, level);
      if (interval < 600) interval = 600;
      return `현재 생성 간격: ${(interval / 1000).toFixed(2)}초`;
    },
    getCost: (state) => upgradeCostLinear(state, 'spawn'),
    canBuy: () => true,
    onBuy: ({ state, restartSpawnTimer }) => {
      state.upgrades.spawn.level++;
      if (state.inRun) restartSpawnTimer();
    },
  },
  {
    key: 'pet',
    title: '🤖 자동채굴 펫',
    getLevel: (state) => state.upgrades.pet.level,
    getLevelLabel: (state) => {
      const level = state.upgrades.pet.level;
      const max = UPGRADE_CONFIG.pet.maxLevel || 0;
      return max ? `Lv ${level}/${max}` : `Lv ${level}`;
    },
    getDescription: (state) => `보유: ${(state.upgrades.pet.level + (state.passive?.petPlus || 0) + (state.aether?.petPlus || 0))}마리`,
    getCost: (state) => upgradeCostLinear(state, 'pet'),
    canBuy: (state) => {
      const max = UPGRADE_CONFIG.pet.maxLevel || Infinity;
      const current = state.upgrades.pet.level || 0;
      if (current >= max) {
        return `최대 ${max}마리까지 구매 가능합니다.`;
      }
      return true;
    },
    onBuy: ({ state, spawnPets }) => {
      state.upgrades.pet.level++;
      if (state.inRun) spawnPets();
    },
  },
];
