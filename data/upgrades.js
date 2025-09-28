// Upgrade metadata and defaults
const SPAWN_INTERVAL = {
  baseMs: 2200,
  reductionPerLevel: 50,
  minMs: 500,
};

window.SPAWN_INTERVAL = SPAWN_INTERVAL;

function spawnIntervalForLevel(level = 0) {
  const lvl = Math.max(0, Math.floor(level));
  const raw = SPAWN_INTERVAL.baseMs - (SPAWN_INTERVAL.reductionPerLevel * lvl);
  return Math.max(SPAWN_INTERVAL.minMs, raw);
}

window.spawnIntervalForLevel = spawnIntervalForLevel;

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
    maxLevel: 34,
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

function previewAtk(state, level){
  const lvl = Math.max(1, Math.floor(level));
  const passiveData = window.PASSIVE_SKILL_DATA || [];
  const powerPassive = passiveData.find((sk) => sk.key === 'power');
  const maxPowerLevel = powerPassive && typeof powerPassive.maxLevel === 'number' ? powerPassive.maxLevel : 0;
  const ownedPower = Math.min(maxPowerLevel || 0, state?.skillsOwnedPassive?.power || 0);
  const baseFloor = 10 + ownedPower;
  const storedBase = typeof state?.player?.atkBase === 'number' ? state.player.atkBase : 10;
  const base = Math.max(storedBase, baseFloor);
  const ATK_PER_LVL = 0.12;
  const ATK_MILE = 0.35;
  const per = Math.pow(1 + ATK_PER_LVL, Math.max(0, lvl - 1));
  const bonus = Math.pow(1 + ATK_MILE, Math.floor(Math.max(0, lvl - 1) / 10));
  return Math.max(1, Math.ceil(base * per * bonus));
}

function previewCritChance(state, level){
  const lvl = Math.max(0, Math.floor(level));
  const cfg = UPGRADE_CONFIG.crit || {};
  const baseStored = typeof state?.player?.critChanceBase === 'number'
    ? state.player.critChanceBase
    : (typeof state?.player?.critChance === 'number' ? state.player.critChance : 0.10);
  const perLevel = typeof cfg.effectPerLevel === 'number' ? cfg.effectPerLevel : 0;
  const totalRaw = baseStored + (perLevel * lvl);
  const fixed = +totalRaw.toFixed(4);
  return Math.max(0, Number.isFinite(fixed) ? fixed : 0);
}

function spawnUpgradeMaxLevel(){
  return UPGRADE_CONFIG?.spawn?.maxLevel || 0;
}

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
    getDescription: (state) => {
      const level = state.upgrades.atk.level;
      const current = previewAtk(state, level);
      const next = previewAtk(state, level + 1);
      const delta = Math.max(0, next - current);
      const suffix = delta > 0 ? ` (+${delta})` : '';
      return `현재 공격력: ${current}${suffix}`;
    },
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
    getDescription: (state) => {
      const level = state.upgrades.crit.level;
      const current = previewCritChance(state, level);
      const next = previewCritChance(state, level + 1);
      const delta = Math.max(0, next - current);
      const suffix = delta > 0 ? ` (+${(delta * 100).toFixed(1)})` : '';
      return `현재 치명타 확률: ${(current * 100).toFixed(1)}%${suffix}`;
    },
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
    getLevelLabel: (state) => {
      const level = state.upgrades.spawn.level;
      const max = spawnUpgradeMaxLevel();
      return max ? `Lv ${level}/${max}` : `Lv ${level}`;
    },
    getDescription: (state) => {
      const level = state.upgrades.spawn.level;
      const current = spawnIntervalForLevel(level);
      const max = spawnUpgradeMaxLevel();
      const next = spawnIntervalForLevel(level + 1);
      const delta = current - next;
      const hasNext = !max || level < max;
      const suffix = hasNext && delta > 0 ? ` (-${(delta / 1000).toFixed(2)})` : '';
      return `현재 생성 간격: ${(current / 1000).toFixed(2)}초${suffix}`;
    },
    getCost: (state) => upgradeCostLinear(state, 'spawn'),
    canBuy: (state) => {
      const max = spawnUpgradeMaxLevel();
      if (max && state.upgrades.spawn.level >= max) {
        return '이미 최대 레벨입니다.';
      }
      return true;
    },
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
    getDescription: (state) => {
      const level = state.upgrades.pet.level;
      const max = UPGRADE_CONFIG.pet.maxLevel || 0;
      const current = level + (state.passive?.petPlus || 0) + (state.aether?.petPlus || 0);
      const hasNext = !max || level < max;
      const suffix = hasNext ? ' (+1)' : '';
      return `보유: ${current}마리${suffix}`;
    },
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
