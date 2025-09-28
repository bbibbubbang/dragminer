// Aether-related rebirth perk data
window.REBIRTH_PERK_DATA = [
  {
    key: 'luck',
    name: '행운 촉매',
    desc: '희귀 광물 가중치 상승',
    base: 30,
    scale: 1.6,
    max: 20,
    getLevel: (state) => state.aether.luck || 0,
    apply: ({ state }) => {
      state.aether.luck = (state.aether.luck || 0) + 1;
    },
  },
  {
    key: 'petPlus',
    name: '차원 펫',
    desc: '특별 펫 +1',
    base: 48,
    scale: 1.8,
    max: 5,
    getLevel: (state) => state.aether.petPlus || 0,
    apply: ({ state }) => {
      state.aether.petPlus = (state.aether.petPlus || 0) + 1;
    },
  },
  {
    key: 'etherHaste',
    name: '에테르 공명',
    desc: '에테르 등장 -0.5초',
    base: 36,
    scale: 1.6,
    max: 10,
    getLevel: (state) => state.aether.etherHaste || 0,
    apply: ({ state }) => {
      state.aether.etherHaste = (state.aether.etherHaste || 0) + 1;
    },
  },
];
