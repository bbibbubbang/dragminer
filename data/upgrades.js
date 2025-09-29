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

const ATK_GROWTH = {
  perLevel: 0.12,
  milestoneBonus: 0.35,
  milestoneStep: 10,
};

window.ATK_GROWTH = ATK_GROWTH;

function computeAtkMultiplier(level = 0) {
  const lvl = Math.max(0, Math.floor(level));
  const per = Math.pow(1 + ATK_GROWTH.perLevel, lvl);
  const bonusCount = Math.floor(lvl / ATK_GROWTH.milestoneStep);
  const bonus = Math.pow(1 + ATK_GROWTH.milestoneBonus, bonusCount);
  return per * bonus;
}

window.computeAtkMultiplier = computeAtkMultiplier;

const UPGRADE_CONFIG = {
  atk: {
    defaultLevel: 0,
    baseCost: 90,
    costExponent: 1.2,
  },
  crit: {
    defaultLevel: 0,
    baseCost: 150,
    costExponent: 1.1,
    effectPerLevel: 0.02,
  },
  spawn: {
    defaultLevel: 0,
    baseCost: 240,
    costExponent: 1.15,
    maxLevel: 34,
  },
  pet: {
    defaultLevel: 0,
    baseCost: 450,
    costExponent: 1.1,
    maxLevel: 100,
  },
};

window.UPGRADE_CONFIG = UPGRADE_CONFIG;

function normalizeLevel(value, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }
  if (value && typeof value.level === 'number' && Number.isFinite(value.level)) {
    return Math.max(0, Math.floor(value.level));
  }
  return Math.max(0, Math.floor(fallback));
}

function getUpgradeLevel(state, key) {
  const cfg = UPGRADE_CONFIG?.[key] || {};
  const defaultLevel = cfg.defaultLevel || 0;
  if (!state || !state.upgrades) {
    return normalizeLevel(undefined, defaultLevel);
  }
  return normalizeLevel(state.upgrades[key], defaultLevel);
}

function setUpgradeLevel(state, key, level) {
  if (!state || !state.upgrades) return;
  const nextLevel = normalizeLevel(level, 0);
  const entry = state.upgrades[key];
  if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
    entry.level = nextLevel;
  } else {
    state.upgrades[key] = { level: nextLevel };
  }
}

window.getUpgradeLevel = getUpgradeLevel;
window.setUpgradeLevel = setUpgradeLevel;

window.UPGRADE_DEFAULTS = Object.fromEntries(
  Object.entries(UPGRADE_CONFIG).map(([key, cfg]) => [key, { level: normalizeLevel(cfg.defaultLevel || 0) }])
);

function previewAtk(state, level){
  const lvl = Math.max(0, Math.floor(level));
  const passiveData = window.PASSIVE_SKILL_DATA || [];
  const powerPassive = passiveData.find((sk) => sk.key === 'power');
  const maxPowerLevel = powerPassive && typeof powerPassive.maxLevel === 'number' ? powerPassive.maxLevel : 0;
  const ownedPower = Math.min(maxPowerLevel || 0, state?.skillsOwnedPassive?.power || 0);
  const baseFloor = 10 + ownedPower;
  const storedBase = typeof state?.player?.atkBase === 'number' ? state.player.atkBase : 10;
  const base = Math.max(storedBase, baseFloor);
  const multiplier = computeAtkMultiplier(lvl);
  return Math.max(1, Math.ceil(base * multiplier));
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
  const currentLevel = getUpgradeLevel(state, key);
  const baseLevel = Math.max(0, Math.floor(cfg.defaultLevel || 0));
  const steps = Math.max(0, currentLevel - baseLevel);
  const exponent = typeof cfg.costExponent === 'number' ? cfg.costExponent : 1;
  const baseMultiplier = Number.isFinite(exponent) && exponent > 0 ? exponent : 1;
  const stepCount = Math.max(0, steps);
  // Upgrade costs grow multiplicatively: each level multiplies the base cost by
  // the configured `costExponent`. With the default exponent of `1.1`, ten
  // levels would cost `baseCost * 1.1^10 ≈ baseCost * 2.59`. Raising the
  // exponent makes prices scale faster, while values between 0 and 1 make the
  // curve gentler.
  const scaled = Math.pow(baseMultiplier, stepCount);
  return Math.floor(cfg.baseCost * scaled);
}

window.UPGRADE_INFO = [
  {
    key: 'atk',
    title: '🗡️ 공격력',
    getLevel: (state) => getUpgradeLevel(state, 'atk'),
    getLevelLabel: (state) => `Lv ${getUpgradeLevel(state, 'atk')}`,
    getDescription: (state) => {
      const level = getUpgradeLevel(state, 'atk');
      const current = previewAtk(state, level);
      const next = previewAtk(state, level + 1);
      const delta = Math.max(0, next - current);
      const suffix = delta > 0 ? ` (+${delta})` : '';
      return `현재 공격력: ${current}${suffix}`;
    },
    getCost: (state) => upgradeCostLinear(state, 'atk'),
    canBuy: () => true,
    onBuy: ({ state }) => {
      const next = getUpgradeLevel(state, 'atk') + 1;
      setUpgradeLevel(state, 'atk', next);
    },
  },
  {
    key: 'crit',
    title: '🎯 치명타 확률',
    getLevel: (state) => getUpgradeLevel(state, 'crit'),
    getLevelLabel: (state) => `Lv ${getUpgradeLevel(state, 'crit')}`,
    getDescription: (state) => {
      const level = getUpgradeLevel(state, 'crit');
      const current = previewCritChance(state, level);
      const next = previewCritChance(state, level + 1);
      const delta = Math.max(0, next - current);
      const suffix = delta > 0 ? ` (+${(delta * 100).toFixed(1)})` : '';
      return `현재 치명타 확률: ${(current * 100).toFixed(1)}%${suffix}`;
    },
    getCost: (state) => upgradeCostLinear(state, 'crit'),
    canBuy: () => true,
    onBuy: ({ state }) => {
      const next = getUpgradeLevel(state, 'crit') + 1;
      setUpgradeLevel(state, 'crit', next);
    },
  },
  {
    key: 'spawn',
    title: '⚙️ 생성 속도',
    getLevel: (state) => getUpgradeLevel(state, 'spawn'),
    getLevelLabel: (state) => {
      const level = getUpgradeLevel(state, 'spawn');
      const max = spawnUpgradeMaxLevel();
      return max ? `Lv ${level}/${max}` : `Lv ${level}`;
    },
    getDescription: (state) => {
      const level = getUpgradeLevel(state, 'spawn');
      const current = spawnIntervalForLevel(level);
      const max = spawnUpgradeMaxLevel();
      const next = spawnIntervalForLevel(level + 1);
      const delta = current - next;
      const hasNext = !max || level < max;
      const suffix = hasNext && delta > 0 ? ` (-${(delta / 1000).toFixed(2)})` : '';
      const formatSeconds = (ms) => {
        if(typeof ms !== 'number' || !Number.isFinite(ms)) return '--';
        return (ms / 1000).toFixed(2);
      };
      let desc = `현재 생성 간격: ${formatSeconds(current)}초${suffix}`;
      if(state && state.inRun){
        const active = (typeof state.currentSpawnIntervalMs === 'number' && Number.isFinite(state.currentSpawnIntervalMs))
          ? state.currentSpawnIntervalMs
          : current;
        const diff = Math.abs(active - current);
        if(diff > 1){
          desc += ` (실제: ${formatSeconds(active)}초)`;
        }
      }
      return desc;
    },
    getCost: (state) => upgradeCostLinear(state, 'spawn'),
    canBuy: (state) => {
      const max = spawnUpgradeMaxLevel();
      const level = getUpgradeLevel(state, 'spawn');
      if (max && level >= max) {
        return '이미 최대 레벨입니다.';
      }
      return true;
    },
    onBuy: ({ state, restartSpawnTimer }) => {
      const next = getUpgradeLevel(state, 'spawn') + 1;
      setUpgradeLevel(state, 'spawn', next);
      if (state.inRun) restartSpawnTimer();
    },
  },
  {
    key: 'pet',
    title: '🤖 자동채굴 펫',
    getLevel: (state) => getUpgradeLevel(state, 'pet'),
    getLevelLabel: (state) => {
      const level = getUpgradeLevel(state, 'pet');
      const max = UPGRADE_CONFIG.pet.maxLevel || 0;
      return max ? `Lv ${level}/${max}` : `Lv ${level}`;
    },
    getDescription: (state) => {
      const level = getUpgradeLevel(state, 'pet');
      const max = UPGRADE_CONFIG.pet.maxLevel || 0;
      const current = level + (state.passive?.petPlus || 0);
      const hasNext = !max || level < max;
      const suffix = hasNext ? ' (+1)' : '';
      return `보유: ${current}마리${suffix}`;
    },
    getCost: (state) => upgradeCostLinear(state, 'pet'),
    canBuy: (state) => {
      const max = UPGRADE_CONFIG.pet.maxLevel || Infinity;
      const current = getUpgradeLevel(state, 'pet');
      if (current >= max) {
        return `최대 ${max}마리까지 구매 가능합니다.`;
      }
      return true;
    },
    onBuy: ({ state, spawnPets }) => {
      const next = getUpgradeLevel(state, 'pet') + 1;
      setUpgradeLevel(state, 'pet', next);
      if (state.inRun) spawnPets();
    },
  },
];
