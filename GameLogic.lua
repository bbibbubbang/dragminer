local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")
local Players = game:GetService("Players")
local player = Players.LocalPlayer

local state = {
    inRun = true,
    grid = {},
    pets = {},
    player = {
        critChance = 0.10,
        critMult = 2.0
    },
    skillAtkBuffUntil = 0,
    settings = {
        showDamageNumbers = true
    }
}

-- Initialize mock grid state based on the 25 UI cells created
for i = 1, 25 do
    state.grid[i] = {
        hp = 100,
        maxHp = 100,
        x = 0,
        y = 0
    }
end

local ORE_RADIUS = 26
local PET = {
    moveSpeed = 180,
    atkInterval = 0.5,
    atkRange = 18,
    swingRadius = 28
}

-- Mock calcAtk
local function calcAtk()
    return 10
end

-- Mock rollOverCritTier
local function rollOverCritTier(chance, baseMultiplier)
    if math.random() < chance then
        return { tier = 1, multiplier = baseMultiplier }
    end
    return { tier = 0, multiplier = 1 }
end

-- Mock onOreBroken
local function onOreBroken(idx, ore)
    -- handle breaking ore
end

local function clampPetToGrid(p)
    -- implement boundaries
end

-- Render top stub
local function renderTop() end

-- This expects StarterGui.lua logic to have populated game.StarterGui.MinerUI
-- In a real environment, this should wait for PlayerGui
local playerGui = player:WaitForChild("PlayerGui", 5)
local gridWrap = playerGui and playerGui:FindFirstChild("MinerUI") and playerGui.MinerUI:FindFirstChild("AppFrame")
                 and playerGui.MinerUI.AppFrame:FindFirstChild("Screen") and playerGui.MinerUI.AppFrame.Screen:FindFirstChild("TabDungeon")
                 and playerGui.MinerUI.AppFrame.Screen.TabDungeon:FindFirstChild("GridWrap")

local function renderGrid()
    if not gridWrap then return end
    for i = 1, 25 do
        local cellBtn = gridWrap:FindFirstChild("OreCell_" .. tostring(i))
        local ore = state.grid[i]
        if cellBtn and ore then
            local hpFill = cellBtn:FindFirstChild("HpBg") and cellBtn.HpBg:FindFirstChild("HpFill")
            if hpFill then
                local ratio = math.clamp(ore.hp / ore.maxHp, 0, 1)
                -- Tween the HP bar width
                local tweenInfo = TweenInfo.new(0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
                local tween = TweenService:Create(hpFill, tweenInfo, {
                    Size = UDim2.new(ratio, 0, 1, 0)
                })
                tween:Play()
            end
        end
    end
end

local function createDamageText(oreCell, dmg, isCrit)
    if not oreCell then return end

    local dmgLabel = Instance.new("TextLabel")
    dmgLabel.Text = (isCrit and "CRIT " or "") .. "-" .. tostring(dmg)
    dmgLabel.Size = UDim2.new(0, 50, 0, 20)
    dmgLabel.Position = UDim2.new(0.5, -25, 0.38, -10)
    dmgLabel.BackgroundTransparency = 1
    dmgLabel.TextColor3 = isCrit and Color3.fromRGB(255, 209, 220) or Color3.fromRGB(253, 247, 216)
    dmgLabel.TextStrokeTransparency = 0
    dmgLabel.Font = Enum.Font.SourceSansBold
    dmgLabel.TextSize = 18
    dmgLabel.Parent = oreCell

    -- Tween for float animation
    local tweenInfo = TweenInfo.new(0.6, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
    local tween = TweenService:Create(dmgLabel, tweenInfo, {
        Position = UDim2.new(0.5, -25, 0.38, -34),
        TextTransparency = 1,
        TextStrokeTransparency = 1
    })
    tween:Play()
    tween.Completed:Connect(function()
        dmgLabel:Destroy()
    end)
end

local function hit(idx, source, opts)
    source = source or "tap"
    opts = opts or {}

    if not state.inRun then return end
    local ore = state.grid[idx]
    if not ore then return end

    local atk = calcAtk()
    local dmgMul = opts.damageMul or 1
    local dmg = math.floor(atk * (state.skillAtkBuffUntil > tick() and 2 or 1) * dmgMul + 0.5)

    local canCrit = (source == "tap" or source == "pet")
    local critInfo = canCrit and rollOverCritTier(state.player.critChance, state.player.critMult) or { tier = 0, multiplier = 1 }
    local isCrit = critInfo.tier > 0

    if isCrit then
        dmg = math.floor(dmg * critInfo.multiplier)
    end

    ore.hp = ore.hp - dmg
    local alive = ore.hp > 0

    if not alive then
        onOreBroken(idx, ore)
        renderTop()
    end

    renderGrid()

    local cell = gridWrap and gridWrap:FindFirstChild("OreCell_" .. tostring(idx))
    local canShowDamage = state.settings.showDamageNumbers ~= false
    if alive and cell and canShowDamage then
        createDamageText(cell, dmg, isCrit)
    end
end

-- Connect UI buttons to hit function
if gridWrap then
    for i = 1, 25 do
        local cellBtn = gridWrap:FindFirstChild("OreCell_" .. tostring(i))
        if cellBtn then
            cellBtn.Activated:Connect(function()
                hit(i, "tap")
            end)
        end
    end
end

local function updatePetOrbitMotion(p, ore, dt, ts)
    if not p or not ore then return end

    local maxRadius = math.max(ORE_RADIUS + 8, p.maxRadius or PET.swingRadius)
    local followStrength = math.max(3, p.followStrength or (PET.moveSpeed / 24))
    local orbitSpeed = math.max(0.3, p.orbitSpeed or ((PET.moveSpeed / math.max(ORE_RADIUS + 8, maxRadius)) * 0.55))
    local dir = (p.orbitDir and p.orbitDir < 0) and -1 or 1

    local baseX = p.x or ore.x
    local baseY = p.y or ore.y
    local currentAngle = p.orbitAngle or math.atan2(baseY - ore.y, baseX - ore.x)
    local nextAngle = currentAngle + orbitSpeed * dt * dir
    p.orbitAngle = nextAngle

    local petalCount = math.max(1, p.petalCount and math.floor(p.petalCount + 0.5) or 3)
    local radialPhase = (p.radialOffset or 0) + petalCount * nextAngle
    local attackExtendFactor = p.attackExtend or 1.12
    local radial = math.cos(radialPhase) * maxRadius * attackExtendFactor

    local dirX = math.cos(nextAngle)
    local dirY = math.sin(nextAngle)

    local targetX = ore.x + dirX * radial
    local targetY = ore.y + dirY * radial

    local lerpFactor = 1 - math.exp(-followStrength * dt)
    local maxStep = math.max(0, PET.moveSpeed * dt)

    local currentX = p.x or targetX
    local currentY = p.y or targetY

    local nextX = currentX + (targetX - currentX) * lerpFactor
    local nextY = currentY + (targetY - currentY) * lerpFactor

    local stepX = nextX - currentX
    local stepY = nextY - currentY
    local stepDist = math.sqrt(stepX * stepX + stepY * stepY)

    if stepDist > maxStep and stepDist > 0 then
        local scale = maxStep / stepDist
        nextX = currentX + stepX * scale
        nextY = currentY + stepY * scale
    end

    p.x = nextX
    p.y = nextY

    clampPetToGrid(p)

    local prevContact = p.prevContact and true or false
    local contactRadius = math.max(ORE_RADIUS + 2, p.contactRadius or (ORE_RADIUS + math.min(2, PET.atkRange * 0.25)))

    local dx = p.x - ore.x
    local dy = p.y - ore.y
    local distance = math.sqrt(dx * dx + dy * dy)

    local timeSinceHit = p.lastHitMs and (ts - p.lastHitMs) or math.huge
    local contactNow = distance <= contactRadius

    if contactNow and not prevContact and timeSinceHit >= math.max(0.1, PET.atkInterval * 0.35) and p.targetIdx and p.targetIdx >= 0 then
        hit(p.targetIdx, "pet", { damageMul = p.damageMul or 1 })
        p.lastHitMs = ts
    end

    p.prevContact = contactNow
    p.prevRadial = radial
end

RunService.RenderStepped:Connect(function(dt)
    if not state.inRun then return end
    local ts = tick()

    for _, p in ipairs(state.pets) do
        local ore = (p.targetIdx and p.targetIdx >= 0) and state.grid[p.targetIdx] or nil
        if ore then
            updatePetOrbitMotion(p, ore, dt, ts)
        end
    end
end)
