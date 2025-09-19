// Upgrade metadata and defaults
window.UPGRADE_DEFAULTS = {
  atk:   { level: 1, baseCost: 90,  scale: 1.35 },
  crit:  { level: 0, baseCost: 150, scale: 1.7  },
  spawn: { level: 0, baseCost: 240, scale: 1.8  },
  pet:   { level: 0, baseCost: 450, scale: 2.0  },
};

window.UPGRADE_INFO = [
  {
    key: 'atk',
    title: '🗡️ 공격력',
    getDescription: (state) => `현재: ${state.player.atk} (레벨 ${state.upgrades.atk.level})`,
    getCost: (state) => Math.floor(state.upgrades.atk.baseCost * Math.pow(state.upgrades.atk.scale, state.upgrades.atk.level - 1)),
    canBuy: () => true,
    onBuy: ({ state }) => {
      state.upgrades.atk.level++;
    },
  },
  {
    key: 'crit',
    title: '🎯 치명타 확률',
    getDescription: (state) => `현재: ${(state.player.critChance * 100).toFixed(1)}%`,
    getCost: (state) => Math.floor(state.upgrades.crit.baseCost * Math.pow(state.upgrades.crit.scale, state.upgrades.crit.level)),
    canBuy: (state) => (state.player.critChance >= 0.5 ? '최대 50%' : true),
    onBuy: ({ state }) => {
      state.upgrades.crit.level++;
      state.player.critChance = Math.min(0.5, state.player.critChance + 0.02);
    },
  },
  {
    key: 'spawn',
    title: '⚙️ 생성 속도',
    getDescription: (state) => `레벨: ${state.upgrades.spawn.level}`,
    getCost: (state) => Math.floor(state.upgrades.spawn.baseCost * Math.pow(state.upgrades.spawn.scale, state.upgrades.spawn.level)),
    canBuy: () => true,
    onBuy: ({ state, restartSpawnTimer }) => {
      state.upgrades.spawn.level++;
      if (state.inRun) restartSpawnTimer();
    },
  },
  {
    key: 'pet',
    title: '🤖 자동채굴 펫',
    getDescription: (state) => `보유: ${(state.upgrades.pet.level + (state.passive?.petPlus || 0) + (state.aether?.petPlus || 0))}마리`,
    getCost: (state) => Math.floor(state.upgrades.pet.baseCost * Math.pow(state.upgrades.pet.scale, state.upgrades.pet.level)),
    canBuy: () => true,
    onBuy: ({ state, spawnPets }) => {
      state.upgrades.pet.level++;
      if (state.inRun) spawnPets();
    },
  },
];
