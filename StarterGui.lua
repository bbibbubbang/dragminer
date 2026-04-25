local starterGui = game:GetService("StarterGui")

-- Create ScreenGui
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "MinerUI"
screenGui.ResetOnSpawn = false
screenGui.Parent = starterGui

-- Create Main App Frame (mimics body/app)
local appFrame = Instance.new("Frame")
appFrame.Name = "AppFrame"
appFrame.Size = UDim2.new(1, 0, 1, 0)
appFrame.BackgroundColor3 = Color3.fromHex("#0f1220") -- --bg
appFrame.BorderSizePixel = 0
appFrame.Parent = screenGui

-- Create Header Frame
local headerFrame = Instance.new("Frame")
headerFrame.Name = "Header"
headerFrame.Size = UDim2.new(1, 0, 0, 100) -- Approx height
headerFrame.BackgroundColor3 = Color3.fromRGB(15, 18, 32)
headerFrame.BackgroundTransparency = 0.1 -- For rgba(15,18,32,0.9)
headerFrame.BorderSizePixel = 0
headerFrame.Parent = appFrame

-- Topbar
local topbarFrame = Instance.new("Frame")
topbarFrame.Name = "Topbar"
topbarFrame.Size = UDim2.new(1, 0, 0, 50)
topbarFrame.BackgroundTransparency = 1
topbarFrame.Parent = headerFrame

-- HUD
local hud1 = Instance.new("TextLabel")
hud1.Name = "HUD1"
hud1.Size = UDim2.new(0.5, 0, 0.5, 0)
hud1.Position = UDim2.new(0, 10, 0, 5)
hud1.BackgroundTransparency = 1
hud1.TextColor3 = Color3.fromHex("#eaf2ff") -- --text
hud1.TextXAlignment = Enum.TextXAlignment.Left
hud1.Text = "💰 0 · ✨ 0"
hud1.Font = Enum.Font.Code
hud1.TextSize = 14
hud1.Parent = topbarFrame

local hud2 = Instance.new("TextLabel")
hud2.Name = "HUD2"
hud2.Size = UDim2.new(0.5, 0, 0.5, 0)
hud2.Position = UDim2.new(0, 10, 0.5, 0)
hud2.BackgroundTransparency = 1
hud2.TextColor3 = Color3.fromHex("#eaf2ff")
hud2.TextXAlignment = Enum.TextXAlignment.Left
hud2.Text = "🗡️ 1 · 🗼 지하 1층"
hud2.Font = Enum.Font.Code
hud2.TextSize = 14
hud2.Parent = topbarFrame

-- Toggle Run Button
local toggleRunBtn = Instance.new("TextButton")
toggleRunBtn.Name = "ToggleRunBtn"
toggleRunBtn.Size = UDim2.new(0, 100, 0, 30)
toggleRunBtn.Position = UDim2.new(1, -180, 0, 10)
toggleRunBtn.BackgroundColor3 = Color3.fromHex("#a78bfa") -- --accent2
toggleRunBtn.TextColor3 = Color3.fromHex("#0b0e1a")
toggleRunBtn.Text = "던전 도전"
toggleRunBtn.Font = Enum.Font.SourceSansBold
toggleRunBtn.TextSize = 14
local toggleUICorner = Instance.new("UICorner", toggleRunBtn)
toggleUICorner.CornerRadius = UDim.new(0, 12)
toggleRunBtn.Parent = topbarFrame

-- Exit Button
local exitBtn = Instance.new("TextButton")
exitBtn.Name = "ExitBtn"
exitBtn.Size = UDim2.new(0, 60, 0, 30)
exitBtn.Position = UDim2.new(1, -70, 0, 10)
exitBtn.BackgroundColor3 = Color3.fromHex("#ff6b6b") -- --danger
exitBtn.TextColor3 = Color3.new(1, 1, 1)
exitBtn.Text = "나가기"
exitBtn.Font = Enum.Font.SourceSansBold
exitBtn.TextSize = 14
local exitUICorner = Instance.new("UICorner", exitBtn)
exitUICorner.CornerRadius = UDim.new(0, 12)
exitBtn.Parent = topbarFrame

-- Tabs Frame
local tabsFrame = Instance.new("Frame")
tabsFrame.Name = "Tabs"
tabsFrame.Size = UDim2.new(1, 0, 0, 40)
tabsFrame.Position = UDim2.new(0, 0, 1, -40)
tabsFrame.BackgroundColor3 = Color3.fromHex("#0d1020")
tabsFrame.BorderSizePixel = 0
tabsFrame.Parent = headerFrame

local tabsLayout = Instance.new("UIListLayout")
tabsLayout.FillDirection = Enum.FillDirection.Horizontal
tabsLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center
tabsLayout.VerticalAlignment = Enum.VerticalAlignment.Center
tabsLayout.Padding = UDim.new(0, 8)
tabsLayout.Parent = tabsFrame

-- Tab Buttons
local tabNames = {"⛏️ 던전", "🎒 인벤토리", "📈 업그레이드", "🪄 스킬", "🔮 에테르", "⚙️ 설정"}
for i, name in ipairs(tabNames) do
    local tabBtn = Instance.new("TextButton")
    tabBtn.Name = "Tab" .. i
    tabBtn.Size = UDim2.new(0, 80, 0, 30)
    tabBtn.BackgroundColor3 = Color3.fromHex("#1a2040")
    tabBtn.TextColor3 = Color3.fromHex("#b9c3ff")
    tabBtn.Text = name
    tabBtn.Font = Enum.Font.SourceSansBold
    tabBtn.TextSize = 14
    local tabUICorner = Instance.new("UICorner", tabBtn)
    tabUICorner.CornerRadius = UDim.new(0, 12)
    tabBtn.Parent = tabsFrame
end

-- Screen/Main Content Area
local screenFrame = Instance.new("Frame")
screenFrame.Name = "Screen"
screenFrame.Size = UDim2.new(1, -24, 1, -120) -- Adjust for header and padding
screenFrame.Position = UDim2.new(0, 12, 0, 110)
screenFrame.BackgroundTransparency = 1
screenFrame.Parent = appFrame

-- Tab Dungeon Panel
local tabDungeon = Instance.new("Frame")
tabDungeon.Name = "TabDungeon"
tabDungeon.Size = UDim2.new(1, 0, 1, 0)
tabDungeon.BackgroundColor3 = Color3.fromHex("#161a2e") -- --panel
local panelUICorner = Instance.new("UICorner", tabDungeon)
panelUICorner.CornerRadius = UDim.new(0, 16)
tabDungeon.Parent = screenFrame

-- Grid View
local gridWrap = Instance.new("Frame")
gridWrap.Name = "GridWrap"
gridWrap.Size = UDim2.new(1, -20, 1, -40)
gridWrap.Position = UDim2.new(0, 10, 0, 30)
gridWrap.BackgroundColor3 = Color3.fromHex("#0e1328")
local gridUICorner = Instance.new("UICorner", gridWrap)
gridUICorner.CornerRadius = UDim.new(0, 16)
gridWrap.Parent = tabDungeon

local gridLayout = Instance.new("UIGridLayout")
gridLayout.CellSize = UDim2.new(0, 52, 0, 52)
gridLayout.CellPadding = UDim2.new(0, 6, 0, 6)
gridLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center
gridLayout.VerticalAlignment = Enum.VerticalAlignment.Center
gridLayout.Parent = gridWrap

for i = 1, 25 do
    local cellBtn = Instance.new("TextButton")
    cellBtn.Name = "OreCell_" .. tostring(i)
    cellBtn.BackgroundColor3 = Color3.fromHex("#a3a3a3")
    cellBtn.Text = ""
    local cellCorner = Instance.new("UICorner", cellBtn)
    cellCorner.CornerRadius = UDim.new(0, 16)
    cellBtn.Parent = gridWrap

    local hpBg = Instance.new("Frame")
    hpBg.Name = "HpBg"
    hpBg.Size = UDim2.new(1, -12, 0, 8)
    hpBg.Position = UDim2.new(0, 6, 0, 6)
    hpBg.BackgroundColor3 = Color3.new(0, 0, 0)
    hpBg.BackgroundTransparency = 0.65
    hpBg.BorderSizePixel = 0
    local hpBgCorner = Instance.new("UICorner", hpBg)
    hpBgCorner.CornerRadius = UDim.new(1, 0)
    hpBg.Parent = cellBtn

    local hpFill = Instance.new("Frame")
    hpFill.Name = "HpFill"
    hpFill.Size = UDim2.new(1, 0, 1, 0)
    hpFill.BackgroundColor3 = Color3.new(1, 1, 1)
    hpFill.BorderSizePixel = 0
    local hpFillCorner = Instance.new("UICorner", hpFill)
    hpFillCorner.CornerRadius = UDim.new(1, 0)
    hpFill.Parent = hpBg

    local gradient = Instance.new("UIGradient")
    gradient.Color = ColorSequence.new({
        ColorSequenceKeypoint.new(0, Color3.fromHex("#34d399")),
        ColorSequenceKeypoint.new(1, Color3.fromHex("#f59e0b"))
    })
    gradient.Parent = hpFill
end
