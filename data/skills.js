// Active and passive skill definitions
window.ACTIVE_SKILL_DATA = [
  { key:'berserk',  name:'광폭화',   desc:'5초간 공격력 x2',         ae:50,  cd:20 },
  { key:'timewarp', name:'타임워프', desc:'시간 +3초',              ae:120, cd:20, autoToggleKey:'autoTimewarp', autoToggleLabel:'자동 사용' },
  { key:'meteor',   name:'운석 낙하', desc:'모든 광석에 큰 피해',    ae:200, cd:30 },
  { key:'haste',    name:'가속',     desc:'5초간 생성 속도 2배',     ae:140, cd:20, autoToggleKey:'autoHaste', autoToggleLabel:'자동 사용' },
  { key:'sonic',    name:'초음파',   desc:'가까운 광석에 즉시 큰 피해', ae:130, cd:18 },
];

window.PASSIVE_SKILL_DATA = [
  {
    key:'power',
    name:'강화 채굴',
    ae:120,
    once:true,
    maxLevel:50,
    apply: ({ state }) => {
      state.player.atkBase = (state.player.atkBase || 10) + 1;
    },
  },
  {
    key:'sharp',
    name:'예리함',
    ae:150,
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
    ae:180,
    once:false,
    maxLevel:20,
    apply: ({ state }) => {
      state.passive.sellBonus = (state.passive.sellBonus || 0) + 0.10;
    },
  },
  {
    key:'petmaster',
    name:'펫 조련',
    ae:200,
    once:false,
    maxLevel:20,
    apply: ({ state, spawnPets }) => {
      state.passive.petPlus = (state.passive.petPlus || 0) + 1;
      if(state.inRun && typeof spawnPets === 'function') spawnPets();
    },
  },
  {
    key:'berserkAuto',
    name:'광폭화 자동 발동',
    desc:'남은시간 5초 이하 시 광폭화 자동 발동',
    ae:300,
    once:true,
    toggleKey:'berserkAutoEnabled',
    toggleLabel:'자동 발동',
    apply: ({ state }) => {
      state.passive = state.passive || {};
      state.passive.berserkAutoEnabled = true;
    },
  },
  {
    key:'berserkBoost',
    name:'광폭화 강화',
    desc:'남은시간 5초 이하 시 쿨타임 무시 & 무제한 지속',
    ae:500,
    once:true,
    apply: ({ state }) => {
      state.passive = state.passive || {};
      state.passive.berserkUnlimit = true;
    },
  },
];
