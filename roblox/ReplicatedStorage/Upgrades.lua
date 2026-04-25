local Upgrades = {}

Upgrades.UPGRADE_CONFIG = {
	atk = {
		defaultLevel = 0,
		baseCost = 90,
		costExponent = 1.2,
	},
	crit = {
		defaultLevel = 0,
		baseCost = 150,
		costExponent = 1.1,
		effectPerLevel = 0.02,
	},
	spawn = {
		defaultLevel = 0,
		baseCost = 240,
		costExponent = 1.15,
		maxLevel = 37,
	},
	pet = {
		defaultLevel = 0,
		baseCost = 450,
		costExponent = 1.1,
		maxLevel = 100,
	},
	petAi = {
		defaultLevel = 0,
		baseCost = 650,
		costExponent = 1.18,
	},
	etherLocator = {
		defaultLevel = 0,
		baseCost = 300,
		costExponent = 1.5,
		maxLevel = 10,
	},
	refinery = {
		defaultLevel = 0,
		baseCost = 520,
		costExponent = 1.17,
		maxLevel = 60,
	},
}

Upgrades.SPAWN_INTERVAL = {
	baseMs = 2200,
	reductionPerLevel = 50,
	minMs = 500,
}

Upgrades.ETHER_SPAWN_SETTINGS = {
	baseDelay = 15,
	reductionPerLevel = 0.5,
	maxLevel = 10,
}

Upgrades.ATK_GROWTH = {
	perLevel = 0.12,
	milestoneBonus = 0.35,
	milestoneStep = 10,
}

return Upgrades
