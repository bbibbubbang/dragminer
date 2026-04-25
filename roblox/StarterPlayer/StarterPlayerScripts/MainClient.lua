local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local player = Players.LocalPlayer

local Ores = require(ReplicatedStorage:WaitForChild("Ores"))
local Skills = require(ReplicatedStorage:WaitForChild("Skills"))
local Upgrades = require(ReplicatedStorage:WaitForChild("Upgrades"))

print("Client initialized for " .. player.Name)
print("Loaded " .. #Ores .. " ores configurations.")

-- UI Setup Placeholders
-- local PlayerGui = player:WaitForChild("PlayerGui")
-- local MainUI = PlayerGui:WaitForChild("MainUI")

-- Function to update HUD
local function updateHUD()
	local leaderstats = player:WaitForChild("leaderstats")
	local gold = leaderstats:WaitForChild("Gold").Value
	local ether = leaderstats:WaitForChild("Ether").Value

	-- print("Gold: " .. gold .. " | Ether: " .. ether)
end

-- Hook up leaderstats changes
player:WaitForChild("leaderstats"):WaitForChild("Gold").Changed:Connect(updateHUD)
player:WaitForChild("leaderstats"):WaitForChild("Ether").Changed:Connect(updateHUD)

updateHUD()
