// Active and passive skill definitions
window.ACTIVE_SKILL_DATA = [
  { key:'berserk',  name:'광폭화',   desc:'5초간 공격력 x2',         ae:150, cd:20 },
  { key:'timewarp', name:'타임워프', desc:'시간 +3초(최대 20초)',    ae:120, cd:25 },
  { key:'meteor',   name:'운석 낙하', desc:'모든 광석에 큰 피해',    ae:200, cd:30 },
  { key:'haste',    name:'가속',     desc:'5초간 생성 속도 2배',     ae:140, cd:25 },
  { key:'sonic',    name:'초음파',   desc:'가까운 광석에 즉시 큰 피해', ae:130, cd:18 },
];

window.PASSIVE_SKILL_DATA = [
  {
    key:'power',
    name:'강화 채굴',
    desc:'공격력 +1(기초)',
    ae:120,
    once:true,
    apply: ({ state }) => {
      state.player.atkBase = (state.player.atkBase || 10) + 1;
    },
  },
  {
    key:'sharp',
    name:'예리함',
    desc:'치명타 확률 +3% (최대 50%)',
    ae:150,
    once:true,
    apply: ({ state }) => {
      state.player.critChance = Math.min(0.5, state.player.critChance + 0.03);
    },
  },
  {
    key:'merchant',
    name:'상인 감각',
    desc:'판매가 +10%',
    ae:180,
    once:false,
    apply: ({ state }) => {
      state.passive.sellBonus = (state.passive.sellBonus || 0) + 0.10;
    },
  },
  {
    key:'petmaster',
    name:'펫 조련',
    desc:'펫 +1',
    ae:200,
    once:false,
    apply: ({ state, spawnPets }) => {
      state.passive.petPlus = (state.passive.petPlus || 0) + 1;
      if(state.inRun && typeof spawnPets === 'function') spawnPets();
    },
  },
];
