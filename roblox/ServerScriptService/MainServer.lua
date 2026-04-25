local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Ores = require(ReplicatedStorage:WaitForChild("Ores"))
local Skills = require(ReplicatedStorage:WaitForChild("Skills"))
local Upgrades = require(ReplicatedStorage:WaitForChild("Upgrades"))

Players.PlayerAdded:Connect(function(player)
	local leaderstats = Instance.new("Folder")
	leaderstats.Name = "leaderstats"
	leaderstats.Parent = player

	local gold = Instance.new("IntValue")
	gold.Name = "Gold"
	gold.Value = 0
	gold.Parent = leaderstats

	local ether = Instance.new("IntValue")
	ether.Name = "Ether"
	ether.Value = 0
	ether.Parent = leaderstats

	local playerStats = Instance.new("Folder")
	playerStats.Name = "PlayerStats"
	playerStats.Parent = player

	local floor = Instance.new("IntValue")
	floor.Name = "Floor"
	floor.Value = 1
	floor.Parent = playerStats

	local highestFloor = Instance.new("IntValue")
	highestFloor.Name = "HighestFloor"
	highestFloor.Value = 1
	highestFloor.Parent = playerStats

	print("Initialized stats for " .. player.Name)
end)
