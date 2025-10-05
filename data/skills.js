// Active and passive skill definitions
window.ACTIVE_SKILL_DATA = [
  {
    key:'berserk',
    name:'광폭화',
    desc:'5초간 공격력 x2',
    ae:90,
    cd:20,
  },
  {
    key:'timewarp',
    name:'타임워프',
    desc:'시간 +3초',
    ae:180,
    cd:20,
    autoToggleKey:'autoTimewarp',
    autoToggleLabel:'자동 사용',
  },
  {
    key:'meteor',
    name:'운석 낙하',
    desc:'모든 광석에 큰 피해',
    ae:320,
    cd:15,
    autoToggleKey:'autoMeteor',
    autoToggleLabel:'자동 사용',
  },
  {
    key:'haste',
    name:'가속',
    desc:'5초간 생성 속도 2배',
    ae:210,
    cd:20,
    autoToggleKey:'autoHaste',
    autoToggleLabel:'자동 사용',
  },
  {
    key:'sonic',
    name:'초음파',
    desc:'에테르 광석 중심으로 5연속 충격파',
    ae:200,
    cd:10,
    autoToggleKey:'autoSonic',
    autoToggleLabel:'자동 사용',
  },
];

window.PASSIVE_SKILL_DATA = [
  {
    key:'power',
    name:'강화 채굴',
    ae:180,
    once:true,
    maxLevel:50,
    apply: ({ state }) => {
      state.player.atkBase = (state.player.atkBase || 10) + 1;
    },
  },
  {
    key:'sharp',
    name:'예리함',
    ae:225,
    once:true,
    maxLevel:30,
    apply: ({ state }) => {
      const base = (typeof state.player.critChanceBase === 'number') ? state.player.critChanceBase : (state.player.critChance || 0.10);
      state.player.critChanceBase = Math.min(0.5, base + 0.03);
    },
  },
  {
    key:'merchant',
    name:'상인 감각',
    ae:270,
    once:false,
    maxLevel:20,
    apply: ({ state }) => {
      state.passive.sellBonus = (state.passive.sellBonus || 0) + 0.10;
    },
  },
  {
    key:'petmaster',
    name:'펫 조련',
    ae:320,
    once:false,
    maxLevel:20,
    apply: ({ state, spawnPets }) => {
      state.passive.petPlus = (state.passive.petPlus || 0) + 1;
      if(state.inRun && typeof spawnPets === 'function') spawnPets();
    },
  },
  {
    key:'berserkBoost',
    name:'광폭화 강화',
    desc:'남은시간 5초 이하 시 자동으로 광폭화 유지 (쿨타임 영향 없음)',
    ae:650,
    once:true,
    apply: ({ state }) => {
      state.passive = state.passive || {};
      state.passive.berserkUnlimit = true;
    },
  },
];
