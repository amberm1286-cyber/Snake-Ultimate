console.log("NEW VERSION LOADED");

(function () {
  // ---------------------------------------------------------------------------
  // CONFIG
  // ---------------------------------------------------------------------------

  var POWERUP_DURATION_MS = 7000;
  var COMBO_WINDOW_MS = 2200;

  var THEMES = {
    emerald: {
      unlock: { type: "default", text: "Unlocked." },
      titleTop: "#d7ffab",
      titleMid: "#9af26a",
      titleBottom: "#158a3e",
      snakeOuter: "#27d567",
      snakeInner: "#7bffab",
      snakeDark: "#0f5a2a",
      headGlow: "rgba(102,242,143,0.4)",
      boardGlow: "rgba(30,220,100,0.08)",
      scorePopup: "#ffd36a",
      bg: "#071222"
    },
    neon: {
      unlock: { type: "score", value: 80, text: "Reach Best Score 80" },
      titleTop: "#d8f7ff",
      titleMid: "#67f6ff",
      titleBottom: "#00c6d7",
      snakeOuter: "#28d7ff",
      snakeInner: "#95f7ff",
      snakeDark: "#0b4f5b",
      headGlow: "rgba(40,215,255,0.42)",
      boardGlow: "rgba(40,215,255,0.08)",
      scorePopup: "#8ef7ff",
      bg: "#041828"
    },
    gold: {
      unlock: { type: "score", value: 140, text: "Reach Best Score 140" },
      titleTop: "#fff0b0",
      titleMid: "#ffd36a",
      titleBottom: "#d59a1d",
      snakeOuter: "#f2c84b",
      snakeInner: "#ffe28e",
      snakeDark: "#7a5a11",
      headGlow: "rgba(255,211,106,0.36)",
      boardGlow: "rgba(255,211,106,0.07)",
      scorePopup: "#ffe28e",
      bg: "#171208"
    },
    shadow: {
      unlock: { type: "mission", id: "shadowSkin", text: "Mission: Reach Level 4 and score 120 in one run" },
      titleTop: "#e8e8ef",
      titleMid: "#9fa8be",
      titleBottom: "#41485c",
      snakeOuter: "#5f6b86",
      snakeInner: "#aeb7cf",
      snakeDark: "#111521",
      headGlow: "rgba(100,110,160,0.34)",
      boardGlow: "rgba(132,142,200,0.07)",
      scorePopup: "#dfe5ff",
      bg: "#06080f"
    },
    frost: {
      unlock: { type: "mission", id: "frostSkin", text: "Mission: Collect 3 ice foods in one run" },
      titleTop: "#f5ffff",
      titleMid: "#bcefff",
      titleBottom: "#79d7ff",
      snakeOuter: "#a7eeff",
      snakeInner: "#e8fdff",
      snakeDark: "#5da8c2",
      headGlow: "rgba(170,240,255,0.48)",
      boardGlow: "rgba(170,240,255,0.12)",
      scorePopup: "#f4ffff",
      bg: "#081a24"
    },
    inferno: {
      unlock: { type: "mission", id: "infernoSkin", text: "Mission: Survive 60 seconds on Hard" },
      titleTop: "#ffd2a6",
      titleMid: "#ff8b3d",
      titleBottom: "#c52f00",
      snakeOuter: "#ff7d3c",
      snakeInner: "#ffc88c",
      snakeDark: "#742300",
      headGlow: "rgba(255,110,40,0.45)",
      boardGlow: "rgba(255,100,35,0.12)",
      scorePopup: "#ffe5b8",
      bg: "#1a0903"
    },
    void: {
      unlock: { type: "mission", id: "voidSkin", text: "Mission: Beat Boss Chapter" },
      titleTop: "#f1d2ff",
      titleMid: "#b95fff",
      titleBottom: "#4b157d",
      snakeOuter: "#b05cff",
      snakeInner: "#ebc8ff",
      snakeDark: "#2c0d4d",
      headGlow: "rgba(185,95,255,0.5)",
      boardGlow: "rgba(185,95,255,0.1)",
      scorePopup: "#f0dbff",
      bg: "#09030f"
    },
    crystal: {
      unlock: { type: "mission", id: "crystalSkin", text: "Mission: Complete all main skin missions" },
      titleTop: "#ffffff",
      titleMid: "#8ffff2",
      titleBottom: "#56a9ff",
      snakeOuter: "#87fff1",
      snakeInner: "#ffffff",
      snakeDark: "#4aa1cc",
      headGlow: "rgba(130,255,235,0.55)",
      boardGlow: "rgba(130,255,235,0.12)",
      scorePopup: "#ffffff",
      bg: "#07111f"
    }
  };

  var THEME_ORDER = ["emerald", "neon", "gold", "shadow", "frost", "inferno", "void", "crystal"];

  var MISSIONS = [
    { id: "shadowSkin", title: "Unlock Shadow", desc: "Reach Level 4 and score at least 120 in one run.", doneText: "Shadow unlocked." },
    { id: "frostSkin", title: "Unlock Frost", desc: "Collect 3 ice foods in one run.", doneText: "Frost unlocked." },
    { id: "infernoSkin", title: "Unlock Inferno", desc: "Survive 60 seconds on Hard.", doneText: "Inferno unlocked." },
    { id: "voidSkin", title: "Unlock Void", desc: "Defeat the Boss Chapter.", doneText: "Void unlocked." },
    { id: "crystalSkin", title: "Unlock Crystal", desc: "Complete Shadow, Frost, Inferno and Void missions.", doneText: "Crystal unlocked." }
  ];

  var CAMPAIGN = [
    { id: "c1", title: "Chapter 1 · Starter", target: 25, boss: false },
    { id: "c2", title: "Chapter 2 · Hazards", target: 55, boss: false },
    { id: "c3", title: "Chapter 3 · Boss", target: 90, boss: true }
  ];

  var ACHIEVEMENT_DEFS = [
    { id: "first10", label: "10 Apples", check: function (s) { return s.applesEaten >= 10; } },
    { id: "first25", label: "25 Apples", check: function (s) { return s.applesEaten >= 25; } },
    { id: "score100", label: "100 Score", check: function (s) { return s.score >= 100; } },
    { id: "survivor", label: "Survivor", check: function (_, meta) { return meta.survivalMs >= 60000; } },
    { id: "combo3", label: "Combo x3", check: function (_, meta) { return meta.maxCombo >= 3; } },
    { id: "level5", label: "Level 5", check: function (_, meta) { return meta.level >= 5; } }
  ];

  // ---------------------------------------------------------------------------
  // DOM
  // ---------------------------------------------------------------------------

  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");

  var overlay = document.getElementById("overlay");
  var overlayCard = document.getElementById("overlay-card");
  var panelMenu = document.getElementById("panel-menu");
  var panelStatus = document.getElementById("panel-status");
  var panelSettings = document.getElementById("panel-settings");
  var panelHelp = document.getElementById("panel-help");
  var panelMissions = document.getElementById("panel-missions");
  var panelCampaign = document.getElementById("panel-campaign");
  var panelEditor = document.getElementById("panel-editor");
  var overlayTitleNode = document.querySelector("#panel-status #overlay-title");
  var overlayTextNode = document.querySelector("#panel-status #overlay-text");

  var scoreEl = document.getElementById("score");
  var bestEl = document.getElementById("best");
  var sizeEl = document.getElementById("size");
  var modeLabel = document.getElementById("mode-label");
  var levelLabel = document.getElementById("level-label");
  var difficultyStageLabel = document.getElementById("difficulty-stage-label");
  var chapterLabel = document.getElementById("chapter-label");
  var hazardLabel = document.getElementById("hazard-label");
  var survivalTimeLabel = document.getElementById("survival-time-label");
  var pressureLabel = document.getElementById("pressure-label");
  var survivalBonusLabel = document.getElementById("survival-bonus-label");
  var comboBadge = document.getElementById("combo-badge");
  var demoBanner = document.getElementById("demo-banner");

  function startDemoTips() {
    if (!demoBanner) return;

    clearInterval(demoTipTimer);

    demoTipIndex = 0;
    demoBanner.textContent = demoTips[demoTipIndex];

    demoTipTimer = setInterval(function () {
      demoTipIndex = (demoTipIndex + 1) % demoTips.length;
      demoBanner.textContent = demoTips[demoTipIndex];
    }, 3000);
  }

  function stopDemoTips() {
    clearInterval(demoTipTimer);
  }

  var multiplayerCard = document.getElementById("multiplayer-card");
  var p1ScoreLabel = document.getElementById("p1-score-label");
  var p2ScoreLabel = document.getElementById("p2-score-label");
  var roundLabel = document.getElementById("round-label");
  var matchScoreLabel = document.getElementById("match-score-label");
  var roundHistory = document.getElementById("round-history");
  var powerupStatus = document.getElementById("powerup-status");
  var achievementsList = document.getElementById("achievements-list");
  var leaderboardList = document.getElementById("leaderboard-list");
  var missionsList = document.getElementById("missions-list");
  var campaignList = document.getElementById("campaign-list");
  var skinHint = document.getElementById("skin-hint");
  var shareCodeBox = document.getElementById("share-code-box");

  var achievementToast = document.getElementById("achievement-toast");
  var achievementToastText = document.getElementById("achievement-toast-text");
  var levelToast = document.getElementById("level-toast");
  var levelToastText = document.getElementById("level-toast-text");

  var themeSelect = document.getElementById("theme-select");
  var difficultySelect = document.getElementById("difficulty-select");
  var boardSelect = document.getElementById("board-select");
  var slotSelect = document.getElementById("slot-select");
  var modeSelect = document.getElementById("mode-select");
  var obstacleToggle = document.getElementById("obstacle-toggle");
  var dailyToggle = document.getElementById("daily-toggle");
  var aiToggle = document.getElementById("ai-toggle");

  var mapNameInput = document.getElementById("map-name-input");
  var mapSelect = document.getElementById("map-select");
  var mapCodeBox = document.getElementById("map-code-box");
  var editorSaveBtn = document.getElementById("editor-save-btn");
  var editorLoadBtn = document.getElementById("editor-load-btn");
  var editorDeleteBtn = document.getElementById("editor-delete-btn");
  var editorExportBtn = document.getElementById("editor-export-btn");
  var editorImportBtn = document.getElementById("editor-import-btn");
  var editorDrawBtn = document.getElementById("editor-draw-btn");
  var editorDoneBtn = document.getElementById("editor-done-btn");
  var editorReturnBtn = document.getElementById("editor-return-btn");

  var menuPlayBtn = document.getElementById("menu-play-btn");
  var menuDemoBtn = document.getElementById("menu-demo-btn");
  var menuReplayBtn = document.getElementById("menu-replay-btn");
  var menuCampaignBtn = document.getElementById("menu-campaign-btn");
  var menuMissionsBtn = document.getElementById("menu-missions-btn");
  var menuEditorBtn = document.getElementById("menu-editor-btn");
  var menuSettingsBtn = document.getElementById("menu-settings-btn");
  var menuHelpBtn = document.getElementById("menu-help-btn");
  var settingsBackBtn = document.getElementById("settings-back-btn");
  var helpBackBtn = document.getElementById("help-back-btn");
  var missionsBackBtn = document.getElementById("missions-back-btn");
  var campaignBackBtn = document.getElementById("campaign-back-btn");
  var campaignStartBtn = document.getElementById("campaign-start-btn");
  var editorBackBtn = document.getElementById("editor-back-btn");
  var editorClearBtn = document.getElementById("editor-clear-btn");
  var editorStartBtn = document.getElementById("editor-start-btn");
  var statusPrimaryBtn = document.getElementById("status-primary-btn");
  var statusSecondaryBtn = document.getElementById("status-secondary-btn");
  var statusReplayBtn = document.getElementById("status-replay-btn");
  var newMatchBtn = document.getElementById("new-match-btn");
  var pauseBtn = document.getElementById("pause-btn");
  var restartBtn = document.getElementById("restart-btn");
  var fullscreenBtn = document.getElementById("fullscreen-btn");
  var shareBtn = document.getElementById("share-btn");
  var moreBtn = document.getElementById("more-btn");
  var drawer = document.getElementById("drawer");
  var closeDrawerBtn = document.getElementById("close-drawer-btn");

  var panelMobileMenu = document.getElementById("panel-mobile-menu");
  var panelMobileSettings = document.getElementById("panel-mobile-settings");
  var panelMobileRunInfo = document.getElementById("panel-mobile-run-info");

  var mobileMenuBtn = document.getElementById("mobile-menu-btn");
  var mobilePauseBtn = document.getElementById("mobile-pause-btn");
  var mobileQuickRestartBtn = document.getElementById("mobile-quick-restart-btn");

  var mobileResumeBtn = document.getElementById("mobile-resume-btn");
  var mobileRestartBtn = document.getElementById("mobile-restart-btn");
  var mobileSettingsBtn = document.getElementById("mobile-settings-btn");
  var mobileModesBtn = document.getElementById("mobile-modes-btn");
  var mobileMissionsBtn = document.getElementById("mobile-missions-btn");
  var mobileCampaignBtn = document.getElementById("mobile-campaign-btn");
  var mobileHelpBtn = document.getElementById("mobile-help-btn");
  var mobileMoreBtn = document.getElementById("mobile-more-btn");

  var mobileSettingsBackBtn = document.getElementById("mobile-settings-back-btn");
  var mobileSettingsResumeBtn = document.getElementById("mobile-settings-resume-btn");
  var mobileRunInfoBtn = document.getElementById("mobile-run-info-btn");
  var mobileRunBackBtn = document.getElementById("mobile-run-back-btn");

  var mobileObstaclesBtn = document.getElementById("mobile-obstacles-btn");
  var mobileDailyBtn = document.getElementById("mobile-daily-btn");
  var mobileAutopilotBtn = document.getElementById("mobile-autopilot-btn");
  var mobileControlsBtn = document.getElementById("mobile-controls-btn");

  var mobileThemeSelect = document.getElementById("mobile-theme-select");
  var mobileDifficultySelect = document.getElementById("mobile-difficulty-select");
  var mobileBoardSelect = document.getElementById("mobile-board-select");
  var mobileSlotSelect = document.getElementById("mobile-slot-select");

  var mobileComboLabel = document.getElementById("mobile-combo-label");
  var mobileScoreLabel = document.getElementById("mobile-score-label");
  var mobileBestLabel = document.getElementById("mobile-best-label");
  var mobileModeLabel = document.getElementById("mobile-mode-label");
  var mobileMultiplayerCard = document.getElementById("mobile-multiplayer-card");
  var mobileMultiplayerLabel = document.getElementById("mobile-multiplayer-label");

  var mobileRunSize = document.getElementById("mobile-run-size");
  var mobileRunLevel = document.getElementById("mobile-run-level");
  var mobileRunSpeed = document.getElementById("mobile-run-speed");
  var mobileRunTime = document.getElementById("mobile-run-time");
  var mobileRunPressure = document.getElementById("mobile-run-pressure");
  var mobileRunBonus = document.getElementById("mobile-run-bonus");
  var mobileRunChapter = document.getElementById("mobile-run-chapter");
  var mobileRunDanger = document.getElementById("mobile-run-danger");
  var mobileDpadUp = document.getElementById("mobile-dpad-up");
  var mobileDpadDown = document.getElementById("mobile-dpad-down");
  var mobileDpadLeft = document.getElementById("mobile-dpad-left");
  var mobileDpadRight = document.getElementById("mobile-dpad-right");

  var quickMissionsBtn = document.getElementById("quick-missions-btn");
  var quickCampaignBtn = document.getElementById("quick-campaign-btn");
  var quickHelpBtn = document.getElementById("quick-help-btn");

  var appShell = document.querySelector(".app-shell");
  var boardStage = document.querySelector(".board-stage");

  // ---------------------------------------------------------------------------
  // APP STATE
  // ---------------------------------------------------------------------------

  var activeSlot = "slot1";
  var settings = loadSlotSettings(activeSlot);
  var achievementsState = loadLocal("snake_achievements", {});
  var missionState = loadLocal("snake_missions", {});
  var leaderboard = loadLocal("snake_leaderboard", []);
  var customMapCells = loadLocal("snake_custom_map", []);
  var bestScore = Number(loadLocal("snake_best_" + activeSlot, 0));
  var savedMaps = loadSavedMaps();
  var selectedMapId = "";

  var phase = "menu";
  var paused = false;
  var aiEnabled = false;
  var demoModeActive = false;
  var demoTips = [
    "Watch Demo: The snake is auto-playing.",
    "Tip: Eat food to grow and increase your score.",
    "Tip: Avoid walls, obstacles, and hazards.",
    "Tip: The snake always looks for the safest path.",
    "Tip: Difficulty affects speed and hazard intensity.",
    "Tip: Try different modes like Survival and Boss Challenge."
  ];

  var demoTipIndex = 0;
  var demoTipTimer = null;
  var countdownActive = false;
  var editorMode = false;
  var campaignMode = false;
  var isDrawingMap = false;
  var editorTool = "draw";
  var editorPointerDown = false;
  var editorHoverCell = null;
  var editorLastPaintedKey = "";
  var editorFeedbackTimer = null;
  var editorEffects = [];
  var editorModeToggleBtn = null;
  var editorFeedbackEl = null;
  var campaignChapter = 0;

  var tickTimer = null;
  var countdownTimer = null;
  var achievementToastTimer = null;
  var levelToastTimer = null;
  var lastTimeAttackTickSecond = null;

  var pulse = 0;
  var eatFlash = 0;
  var screenShake = 0;
  var swipeStart = null;
  var gamepadCooldown = 0;
  var lastStepAt = performance.now();
  var lastAppleTime = 0;
  var comboCount = 1;
  var maxCombo = 1;
  var startTime = performance.now();
  var survivalMs = 0;

  var runStats = { iceFoods: 0 };
  var inputQueue = [];
  var player2 = null;
  var player2Queue = [];
  var player2Score = 0;
  var multiplayerRound = 1;
  var player1RoundsWon = 0;
  var player2RoundsWon = 0;
  var roundHistoryLog = [];
  var player2PreviousSnake = [];
  var appleTrail = [];
  var particles = [];
  var scorePopups = [];
  var previousSnake = [];

  var replayRecording = false;
  var replayPlayback = false;
  var replayStartTime = 0;
  var replayInputs = [];
  var replayFrames = [];
  var replayPlaybackFrames = [];
  var replayPlaybackIndex = 0;
  var replayPlaybackTimer = null;
  var lastReplay = loadLocal("snake_last_replay", null);

  var sprites = createSpriteManager();
  var activeTheme = THEMES[settings.theme] || THEMES.emerald;
  var state = createFreshState(false);

  // ---------------------------------------------------------------------------
  // STORAGE HELPERS
  // ---------------------------------------------------------------------------

  function loadLocal(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveLocal(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function cloneForReplay(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function isReplaySupportedMode() {
    return currentMode() === "classic" || isTimeAttackMode();
  }

  function replaySupportedModeText() {
    return "Classic, Time Attack 60s, and Time Attack 120s";
  }

  function canRecordReplay() {
    return (
      isReplaySupportedMode() &&
      !isMultiplayerMode() &&
      !isBossChallengeMode() &&
      !editorMode &&
      !campaignMode &&
      !aiEnabled &&
      !demoModeActive
    );
  }

  function setReplayButtonVisible(visible) {
    if (statusReplayBtn) {
      statusReplayBtn.classList.toggle("hidden", !visible);
    }
  }

  function hasSavedReplay() {
    return Boolean(lastReplay && lastReplay.frames && lastReplay.frames.length);
  }

  function startReplayRecording() {
    replayPlayback = false;

    if (!canRecordReplay()) {
      replayRecording = false;
      replayInputs = [];
      replayFrames = [];
      setReplayButtonVisible(hasSavedReplay());
      return;
    }

    replayRecording = true;
    replayStartTime = performance.now();
    replayInputs = [];
    replayFrames = [];

    recordReplayFrame("start");
    setReplayButtonVisible(false);
  }

  function stopReplayRecording(saveIt) {
    if (!replayRecording) return;

    replayRecording = false;

    if (!saveIt || replayFrames.length < 2) {
      setReplayButtonVisible(hasSavedReplay());
      return;
    }

    lastReplay = {
      version: 1,
      savedAt: new Date().toISOString(),
      meta: {
        mode: currentMode(),
        difficulty: settings.difficulty,
        boardSize: settings.boardSize,
        obstacles: Boolean(settings.obstacles),
        daily: Boolean(settings.daily),
        theme: settings.theme,
        score: getDisplayScore(),
        length: state && state.snake ? state.snake.length : 0,
        durationMs: Math.max(0, Math.round(performance.now() - replayStartTime))
      },
      inputs: replayInputs.slice(),
      frames: replayFrames.slice()
    };

    saveLocal("snake_last_replay", lastReplay);
    setReplayButtonVisible(true);
  }

  function recordReplayInput(direction) {
    if (!replayRecording || replayPlayback || !direction) return;

    replayInputs.push({
      t: Math.max(0, Math.round(performance.now() - replayStartTime)),
      direction: direction
    });
  }

  function recordReplayFrame(reason) {
    if (!replayRecording || replayPlayback || !state) return;

    replayFrames.push({
      t: Math.max(0, Math.round(performance.now() - replayStartTime)),
      reason: reason || "step",
      state: cloneForReplay(state),
      previousSnake: cloneForReplay(previousSnake),
      survivalMs: survivalMs,
      comboCount: comboCount,
      maxCombo: maxCombo,
      powerUp: state.powerUp ? cloneForReplay(state.powerUp) : null
    });

    if (replayFrames.length > 900) {
      replayFrames.shift();
    }
  }

  function stopReplayPlayback() {
    replayPlayback = false;

    if (replayPlaybackTimer !== null) {
      clearInterval(replayPlaybackTimer);
      replayPlaybackTimer = null;
    }

    replayPlaybackFrames = [];
    replayPlaybackIndex = 0;
  }

  function applyReplayFrame(frame) {
    if (!frame || !frame.state) return;

    state = cloneForReplay(frame.state);
    previousSnake = cloneForReplay(frame.previousSnake || frame.state.snake || []);
    survivalMs = frame.survivalMs || 0;
    comboCount = frame.comboCount || 1;
    maxCombo = frame.maxCombo || comboCount;

    if (frame.powerUp) {
      state.powerUp = cloneForReplay(frame.powerUp);
    }

    updateComboBadge();
    updateHud();
    updateModeLabel();
  }

  function playLastReplay() {
    if (!hasSavedReplay()) {
      showStatus(
        "No Replay Saved",
        "Replay is currently supported for " + replaySupportedModeText() + ".\nPlay one supported single-player run first. After Game Over or Time Up, the replay will be saved automatically.",
        "Play",
        "Menu"
      );
      setReplayButtonVisible(false);
      return;
    }

    stopTimers();
    stopReplayRecording(false);
    stopReplayPlayback();

    replayPlayback = true;
    paused = false;
    phase = "playing";
    countdownActive = false;
    inputQueue = [];
    editorMode = false;
    campaignMode = false;
    aiEnabled = false;
    demoModeActive = false;

    if (aiToggle) aiToggle.checked = false;

    replayPlaybackFrames = lastReplay.frames.slice();
    replayPlaybackIndex = 0;

    appleTrail = [];
    particles = [];
    scorePopups = [];
    screenShake = 0;
    eatFlash = 0;

    hideOverlay();

    applyReplayFrame(replayPlaybackFrames[0]);

    replayPlaybackTimer = setInterval(function () {
      replayPlaybackIndex += 1;

      if (replayPlaybackIndex >= replayPlaybackFrames.length) {
        stopReplayPlayback();
        phase = "dead";
        showStatus(
          "Replay Complete",
          "Score: " + (lastReplay.meta ? lastReplay.meta.score : state.score) +
            "\nInputs recorded: " + (lastReplay.inputs ? lastReplay.inputs.length : 0),
          "Play Again",
          "Menu"
        );
        setReplayButtonVisible(true);
        return;
      }

    applyReplayFrame(replayPlaybackFrames[replayPlaybackIndex]);
  }, 90);
}

  function loadSlotSettings(slot) {
    return loadLocal("snake_settings_" + slot, {
      theme: "emerald",
      difficulty: "normal",
      boardSize: 18,
      mode: "classic",
      obstacles: true,
      daily: false
    });
  }

  function saveSlotSettings() {
    saveLocal("snake_settings_" + activeSlot, settings);
    saveLocal("snake_best_" + activeSlot, bestScore);
  }

  function getSavedMapsKey() {
    return "snake_saved_maps_" + activeSlot;
  }

  function loadSavedMaps() {
    return loadLocal(getSavedMapsKey(), []);
  }

  function saveSavedMaps() {
    saveLocal(getSavedMapsKey(), savedMaps);
  }

  // ---------------------------------------------------------------------------
  // BASIC HELPERS
  // ---------------------------------------------------------------------------

  function cloneCell(cell) {
    return { x: cell.x, y: cell.y };
  }

  function cloneSnake(snake) {
    return snake.map(cloneCell);
  }

  function cloneCells(cells) {
    return (cells || []).map(cloneCell);
  }

  function currentLevel() {
    return window.SnakeLogic.getLevel(state.applesEaten);
  }

  function difficultyStageText(level) {
    return window.SnakeLogic.getDifficultyStage(level);
  }

  function currentMode() {
    return settings.mode || "classic";
  }

  function isSurvivalMode() {
    return currentMode() === "survival";
  }

  function isTimeAttackMode() {
    return currentMode() === "timeAttack60" || currentMode() === "timeAttack120";
  }

  function isMultiplayerMode() {
    return currentMode() === "multiplayer";
  }

  function isBossChallengeMode() {
    return currentMode() === "bossChallenge";
  }

  function getTimeAttackDurationMs() {
    if (currentMode() === "timeAttack120") return 120000;
    if (currentMode() === "timeAttack60") return 60000;
    return 0;
  }

  function getTimeAttackRemainingMs() {
    if (!isTimeAttackMode()) return 0;
    return Math.max(0, getTimeAttackDurationMs() - survivalMs);
  }

  function modeDisplayName() {
    if (currentMode() === "survival") return "Survival";
    if (currentMode() === "timeAttack60") return "Time Attack 60s";
    if (currentMode() === "timeAttack120") return "Time Attack 120s";
    if (currentMode() === "multiplayer") return "Multiplayer";
    if (currentMode() === "bossChallenge") return "Boss Challenge";
    return "Classic";
  }

  function getTimeAttackPressureStage() {
    var remaining = Math.ceil(getTimeAttackRemainingMs() / 1000);

    if (remaining > 60) return "Warming Up";
    if (remaining > 30) return "Getting Hot";
    if (remaining > 15) return "INTENSE";
    if (remaining > 5) return "CRITICAL";
    return "FINAL SECONDS";
  }

  function formatRunTime(ms) {
    var totalSeconds = Math.max(0, Math.floor((ms || 0) / 1000));
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    return minutes + ":" + String(seconds).padStart(2, "0");
  }

  function getSurvivalPressureStage(ms) {
    var seconds = Math.floor((ms || 0) / 1000);

    if (seconds < 20) return "Calm";
    if (seconds < 40) return "Rising";
    if (seconds < 60) return "Tense";
    if (seconds < 90) return "Danger";
    if (seconds < 120) return "Savage";
    return "Extreme";
  }

  function getSurvivalBonus(ms) {
    if (!isSurvivalMode()) return 0;
    return Math.floor((ms || 0) / 1000);
  }

  function getSurvivalSpeedReduction(ms) {
    if (!isSurvivalMode()) return 0;

    var seconds = Math.floor((ms || 0) / 1000);

    if (seconds < 15) return 0;
    if (seconds < 30) return 8;
    if (seconds < 45) return 16;
    if (seconds < 60) return 24;
    if (seconds < 75) return 32;
    if (seconds < 90) return 40;
    if (seconds < 110) return 48;
    if (seconds < 130) return 56;
    return 64;
  }

  function getDisplayScore() {
    return state.score + getSurvivalBonus(survivalMs);
  }

  function getNextCellFrom(cell, direction) {
    if (direction === "UP") return { x: cell.x, y: cell.y - 1 };
    if (direction === "DOWN") return { x: cell.x, y: cell.y + 1 };
    if (direction === "LEFT") return { x: cell.x - 1, y: cell.y };
    if (direction === "RIGHT") return { x: cell.x + 1, y: cell.y };
    return { x: cell.x, y: cell.y };
  }

  function sameCell(a, b) {
    return Boolean(a) && Boolean(b) && a.x === b.x && a.y === b.y;
  }

  function createPlayer2State() {
  var midY = Math.floor(state.rows / 2);
  var startX = state.cols - 3;

  return {
    snake: [
      { x: startX, y: midY },
      { x: startX + 1, y: midY },
      { x: startX + 2, y: midY }
    ],
    direction: "LEFT",
    alive: true
  };
}

  function resetMultiplayerState() {
    player2 = createPlayer2State();
    player2Queue = [];
    player2Score = 0;
    player2PreviousSnake = cloneSnake(player2.snake);
  }

  function getFoodBlockedForMultiplayer() {
    return (state.obstacles || [])
      .concat((state.movingHazards || []).map(function (hazard) {
        return { x: hazard.x, y: hazard.y };
      }))
      .concat(state.boss ? [{ x: state.boss.x, y: state.boss.y }] : [])
      .concat(state.snake || [])
      .concat(player2 ? player2.snake : []);
  }

  function placeMultiplayerFood() {
    state.food = window.SnakeLogic.placeFood(
      (state.snake || []).concat(player2 ? player2.snake : []),
      state.cols,
      state.rows,
      Math.random,
      getFoodBlockedForMultiplayer()
    );
  }

  function foodIsOnPlayer2() {
    if (!state.food || !player2) return false;

    return player2.snake.some(function (segment) {
      return sameCell(segment, state.food);
    });
  }

  function resetMultiplayerMatch() {
    multiplayerRound = 1;
    player1RoundsWon = 0;
    player2RoundsWon = 0;
    roundHistoryLog = [];
  }

  function addRoundHistoryEntry(roundNumber, winnerText) {
    roundHistoryLog.push({
      round: roundNumber,
      winner: winnerText
    });
  }

  function renderRoundHistory() {
    if (!roundHistory) return;

    roundHistory.innerHTML = "";

    if (!roundHistoryLog.length) {
      var empty = document.createElement("div");
      empty.className = "round-history-empty";
      empty.textContent = "No rounds played yet";
      roundHistory.appendChild(empty);
      return;
    }

    roundHistoryLog.forEach(function (entry) {
      var item = document.createElement("div");
      item.className = "round-history-item";
      item.textContent = "Round " + entry.round + ": " + entry.winner;
      roundHistory.appendChild(item);
    });
  }

  function syncMultiplayerHud() {
    if (multiplayerCard) {
      multiplayerCard.classList.toggle("show", isMultiplayerMode());
    }

    if (p1ScoreLabel) {
      p1ScoreLabel.textContent = String(state.score);
    }

    if (p2ScoreLabel) {
      p2ScoreLabel.textContent = String(player2Score);
    }

    if (roundLabel) {
      roundLabel.textContent = "Round " + multiplayerRound;
    }

    if (matchScoreLabel) {
      matchScoreLabel.textContent = "Match: P1 " + player1RoundsWon + " · P2 " + player2RoundsWon;
    }

    renderRoundHistory();
  }

  function getLeaderboardModeLabel() {
    var parts = [];

    parts.push(modeDisplayName());

    if (campaignMode) parts.push("Campaign");
    if (editorMode) parts.push("Custom");
    if (settings.daily) parts.push("Daily");
    parts.push(settings.difficulty.charAt(0).toUpperCase() + settings.difficulty.slice(1));
    parts.push(settings.boardSize + "x" + settings.boardSize);

    return parts.join(" · ");
  }

  function createEngineConfig(options) {
    var opts = options || {};
    return {
      boardSize: settings.boardSize,
      difficulty: settings.difficulty,
      obstaclesEnabled: Boolean(settings.obstacles),
      dailySeed: settings.daily ? dailySeed() : null,
      useCustomMap: Boolean(opts.useCustomMap),
      customMapCells: opts.useCustomMap ? customMapCells : [],
      bossEnabled: Boolean(opts.bossEnabled)
    };
  }

  function isThemeUnlocked(key) {
    var unlock = THEMES[key].unlock;
    if (unlock.type === "default") return true;
    if (unlock.type === "score") return bestScore >= unlock.value;
    if (unlock.type === "mission") return Boolean(missionState[unlock.id]);
    return false;
  }

  function themeUnlockText(key) {
    return THEMES[key].unlock.text || "Locked.";
  }

  function normalizeMapName(name) {
    return String(name || "")
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 32);
  }

  function makeMapId(name) {
    return normalizeMapName(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || ("map-" + Date.now());
  }

  function dailySeed() {
    var d = new Date();
    return Number(
      String(d.getUTCFullYear()) +
      String(d.getUTCMonth() + 1).padStart(2, "0") +
      String(d.getUTCDate()).padStart(2, "0")
    );
  }

  function createFreshState(useCustom) {
    return window.SnakeLogic.createRunState(
      createEngineConfig({
        useCustomMap: useCustom,
        bossEnabled:
          isBossChallengeMode() ||
          (campaignMode && CAMPAIGN[campaignChapter] && CAMPAIGN[campaignChapter].boss)
      })
    );
  }

  function popNode(node) {
    if (!node) return;
    node.classList.remove("pop");
    void node.offsetWidth;
    node.classList.add("pop");
    setTimeout(function () {
      node.classList.remove("pop");
    }, 180);
  }

  function showAchievementToast(text) {
    if (!achievementToast || !achievementToastText) return;
    clearTimeout(achievementToastTimer);
    achievementToastText.textContent = text;
    achievementToast.classList.add("show");
    achievementToastTimer = setTimeout(function () {
      achievementToast.classList.remove("show");
    }, 1900);
  }

  function showLevelToast(level) {
    if (!levelToast || !levelToastText) return;
    clearTimeout(levelToastTimer);
    levelToastText.textContent = "Level " + level + " · " + difficultyStageText(level);
    levelToast.classList.add("show");
    levelToastTimer = setTimeout(function () {
      levelToast.classList.remove("show");
    }, 1500);
  }

  // ---------------------------------------------------------------------------
  // UI HELPERS
  // ---------------------------------------------------------------------------

  function syncSettingsUi() {
    themeSelect.value = settings.theme || "emerald";
    difficultySelect.value = settings.difficulty || "normal";
    boardSelect.value = String(settings.boardSize || 18);
    if (modeSelect) modeSelect.value = settings.mode || "classic";
    obstacleToggle.checked = Boolean(settings.obstacles);
    dailyToggle.checked = Boolean(settings.daily);
    slotSelect.value = activeSlot;
  }

  function syncSkinUnlocks() {
    Array.prototype.forEach.call(themeSelect.options, function (option) {
      var unlocked = isThemeUnlocked(option.value);
      option.disabled = !unlocked;
      option.textContent = unlocked
        ? option.value.charAt(0).toUpperCase() + option.value.slice(1)
        : option.value.charAt(0).toUpperCase() + option.value.slice(1) + " 🔒";
    });

    if (themeSelect.options[themeSelect.selectedIndex] && themeSelect.options[themeSelect.selectedIndex].disabled) {
      settings.theme = "emerald";
      themeSelect.value = "emerald";
    }
  }

  function updateSkinHint() {
    var key = themeSelect.value;
    skinHint.textContent = isThemeUnlocked(key) ? "Unlocked." : themeUnlockText(key);
  }

  function applyTheme() {
    activeTheme = THEMES[settings.theme] || THEMES.emerald;
    var style = document.documentElement.style;
    style.setProperty("--snake-title-top", activeTheme.titleTop);
    style.setProperty("--snake-title-mid", activeTheme.titleMid);
    style.setProperty("--snake-title-bottom", activeTheme.titleBottom);
  }

  function updateHazardLabel() {
    if (!hazardLabel) return;

    // 🔥 Boss Challenge override
    if (isBossChallengeMode()) {
      hazardLabel.textContent = "Boss Active";
      return;
    }

    var movingCount = state && state.movingHazards ? state.movingHazards.length : 0;

    if (!settings.obstacles) {
      hazardLabel.textContent = "Off";
      return;
    }

    if (movingCount > 0) {
      hazardLabel.textContent = "Moving x" + movingCount;
      return;
    }

    if (state && state.obstacles && state.obstacles.length > 0) {
      hazardLabel.textContent = "Walls";
      return;
    }

    hazardLabel.textContent = "Safe";
  }

  function updateModeLabel() {
    var parts = [];
    var baseMode = modeDisplayName();

    parts.push(baseMode);

    if (campaignMode) parts.push("Campaign");
    if (settings.daily) parts.push("Daily");
    if (settings.obstacles) parts.push("Obstacles");
    if (editorMode) parts.push("Custom Map");
    parts.push(settings.difficulty.charAt(0).toUpperCase() + settings.difficulty.slice(1));
    parts.push(settings.boardSize + "×" + settings.boardSize);

    var level = currentLevel();

    modeLabel.textContent = parts.join(" · ");

    var aiToggleWrapper = document.getElementById("ai-toggle-wrapper");

    if (aiToggleWrapper) {
      aiToggleWrapper.style.display = isMultiplayerMode() ? "none" : "";
    }

    levelLabel.textContent = String(level);
    difficultyStageLabel.textContent = difficultyStageText(level);
    chapterLabel.textContent = campaignMode
      ? CAMPAIGN[campaignChapter].title.split(" · ")[0].replace("Chapter ", "")
      : "Free";

    if (survivalTimeLabel) {
      var remaining = isTimeAttackMode()
        ? getTimeAttackRemainingMs()
        : survivalMs;

      survivalTimeLabel.textContent = formatRunTime(remaining);

      if (isTimeAttackMode()) {
        var seconds = Math.ceil(remaining / 1000);

        survivalTimeLabel.classList.remove("time-warning", "time-critical");

        if (seconds <= 10) {
          survivalTimeLabel.classList.add("time-critical");
        } else if (seconds <= 20) {
          survivalTimeLabel.classList.add("time-warning");
        }
      } else {
        survivalTimeLabel.classList.remove("time-warning", "time-critical");
      }
    }

    if (pressureLabel) {
      pressureLabel.textContent = isTimeAttackMode()
        ? getTimeAttackPressureStage()
        : isSurvivalMode()
          ? getSurvivalPressureStage(survivalMs)
          : "Standard";
    }

    if (survivalBonusLabel) {
      survivalBonusLabel.textContent = "+" + getSurvivalBonus(survivalMs);
    }
  }

  function updatePowerupLabel() {
    if (!state.powerUp) {
      powerupStatus.textContent = "None";
      return;
    }
    var left = Math.max(0, Math.ceil((state.powerUp.endsAt - performance.now()) / 1000));
    powerupStatus.textContent = state.powerUp.type + " · " + left + "s";
  }

  function updateHud(prevScore, prevSize) {
    var displayScore = getDisplayScore();

    scoreEl.textContent = String(displayScore);
    sizeEl.textContent = String(state.snake.length);

    if (displayScore > bestScore) {
      bestScore = displayScore;
      saveSlotSettings();
      syncSkinUnlocks();
      renderMissions();
    }

    bestEl.textContent = String(bestScore);

    if (typeof prevScore === "number" && displayScore > prevScore) popNode(scoreEl.parentElement);
    if (typeof prevSize === "number" && state.snake.length > prevSize) popNode(sizeEl.parentElement);

    updateModeLabel();
    updatePowerupLabel();
    updateHazardLabel();
    syncMultiplayerHud();
    syncMobileHud();

    if (demoBanner) {
      if (demoModeActive && aiEnabled && !isMultiplayerMode() && phase === "playing") {
        demoBanner.classList.remove("hidden");
        demoBanner.classList.add("show");
      } else {
        demoBanner.classList.remove("show");
        demoBanner.classList.add("hidden");
      }
    }
  }

  function updateComboBadge() {
    comboBadge.textContent = "Combo x" + comboCount;
    comboBadge.classList.toggle("is-hot", comboCount > 1);

    if (mobileComboLabel) {
      mobileComboLabel.textContent = "Combo x" + comboCount;
    }
  }

  function syncMobileControls() {
    if (mobileThemeSelect) mobileThemeSelect.value = settings.theme || "emerald";
    if (mobileDifficultySelect) mobileDifficultySelect.value = settings.difficulty || "normal";
    if (mobileBoardSelect) mobileBoardSelect.value = String(settings.boardSize || 18);
    if (mobileSlotSelect) mobileSlotSelect.value = activeSlot;

    if (mobileObstaclesBtn) {
      mobileObstaclesBtn.classList.toggle("is-on", Boolean(settings.obstacles));
      mobileObstaclesBtn.textContent = settings.obstacles ? "Obstacles: On" : "Obstacles: Off";
    }

    if (mobileDailyBtn) {
      mobileDailyBtn.classList.toggle("is-on", Boolean(settings.daily));
      mobileDailyBtn.textContent = settings.daily ? "Daily: On" : "Daily: Off";
    }

    if (mobileAutopilotBtn) {
      mobileAutopilotBtn.classList.toggle("is-on", Boolean(aiEnabled));
      mobileAutopilotBtn.textContent = aiEnabled ? "Auto Pilot: On" : "Auto Pilot: Off";
    }
  }

  function syncMobileHud() {
    var displayScore = getDisplayScore();
    var level = currentLevel();

    if (mobileScoreLabel) mobileScoreLabel.textContent = String(displayScore);
    if (mobileBestLabel) mobileBestLabel.textContent = String(bestScore);
    if (mobileModeLabel) mobileModeLabel.textContent = getLeaderboardModeLabel();

    if (mobileMultiplayerCard) {
      mobileMultiplayerCard.classList.toggle("hidden", !isMultiplayerMode());
    }

    if (mobileMultiplayerLabel) {
      mobileMultiplayerLabel.textContent = "P1 " + state.score + " · P2 " + player2Score;
    }

    if (mobileRunSize) mobileRunSize.textContent = String(state.snake.length);
    if (mobileRunLevel) mobileRunLevel.textContent = String(level);
    if (mobileRunSpeed) mobileRunSpeed.textContent = difficultyStageText(level);

    if (mobileRunTime) {
      var remaining = isTimeAttackMode()
        ? getTimeAttackRemainingMs()
        : survivalMs;

      mobileRunTime.textContent = formatRunTime(remaining);
    }

    if (mobileRunPressure) {
      mobileRunPressure.textContent = isTimeAttackMode()
        ? getTimeAttackPressureStage()
        : isSurvivalMode()
          ? getSurvivalPressureStage(survivalMs)
          : "Standard";
    }

    if (mobileRunBonus) mobileRunBonus.textContent = "+" + getSurvivalBonus(survivalMs);

    if (mobileRunChapter) {
      mobileRunChapter.textContent = campaignMode
        ? CAMPAIGN[campaignChapter].title.split(" · ")[0].replace("Chapter ", "")
        : "Free";
    }

    if (mobileRunDanger) {
      mobileRunDanger.textContent = hazardLabel ? hazardLabel.textContent : "Safe";
    }

    syncMobileControls();
  }

  function openMobileGameMenu() {
    stopTimers();
    paused = true;
    syncMobileControls();
    syncMobileHud();
    showPanel("mobileMenu");
  }

  function resumeFromMobileMenu() {
    paused = false;
    hideOverlay();
    restartTickingIfNeeded();
  }

  function mirrorSelectChange(sourceSelect, targetSelect) {
    if (!sourceSelect || !targetSelect) return;

    targetSelect.value = sourceSelect.value;
    targetSelect.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function renderAchievements() {
    achievementsList.innerHTML = "";

    ACHIEVEMENT_DEFS
      .filter(function (a) { return achievementsState[a.id]; })
      .forEach(function (a) {
        var el = document.createElement("div");
        el.className = "achievement-pill";
        el.textContent = a.label;
        achievementsList.appendChild(el);
      });

    if (!achievementsList.children.length) {
      var empty = document.createElement("div");
      empty.className = "achievement-pill";
      empty.textContent = "No achievements yet";
      achievementsList.appendChild(empty);
    }
  }

  function renderLeaderboard() {
    leaderboardList.innerHTML = "";

    var activeMode = currentMode();

    function entryModeKey(entry) {
      if (entry.modeKey) return entry.modeKey;

      var text = String(entry.mode || "").toLowerCase();

      if (text.includes("boss")) return "bossChallenge";
      if (text.includes("multiplayer")) return "multiplayer";
      if (text.includes("time attack 120")) return "timeAttack120";
      if (text.includes("time attack 60")) return "timeAttack60";
      if (text.includes("survival")) return "survival";

      return "classic";
    }

    function cleanOldModeText(text) {
      return String(text || "Classic")
        .replace(/\bnormal\b/gi, "Normal")
        .replace(/\beasy\b/gi, "Easy")
        .replace(/\bhard\b/gi, "Hard")
        .replace(/(\d+)x(\d+)/g, "$1×$2")
        .replace(/\s+/g, " ")
        .trim();
    }

    var filtered = leaderboard.filter(function (entry) {
      return entryModeKey(entry) === activeMode;
    });

    var header = document.createElement("div");
    header.className = "leaderboard-mode-header";

    header.innerHTML =
      "<div>" +
        "<strong>" + modeDisplayName() + "</strong>" +
        "<span>" + filtered.length + " saved run" + (filtered.length === 1 ? "" : "s") + "</span>" +
      "</div>" +
      "<div class='leaderboard-actions'>" +
        "<button type='button' class='leaderboard-export-btn'>Export</button>" +
        "<button type='button' class='leaderboard-import-btn'>Import</button>" +
        "<button type='button' class='leaderboard-reset-btn'>Reset</button>" +
      "</div>";

    leaderboardList.appendChild(header);

    var resetBtn = header.querySelector(".leaderboard-reset-btn");
    var exportBtn = header.querySelector(".leaderboard-export-btn");
    var importBtn = header.querySelector(".leaderboard-import-btn");

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (!filtered.length) return;

        var ok = window.confirm(
          "Reset " + modeDisplayName() + " leaderboard? This will only delete scores for this mode."
        );

        if (!ok) return;

        leaderboard = leaderboard.filter(function (entry) {
          return entryModeKey(entry) !== activeMode;
        });

        saveLocal("snake_leaderboard", leaderboard);
        renderLeaderboard();
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        var data = {
          version: 1,
          exportedAt: Date.now(),
          leaderboard: leaderboard
        };

        var text = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
        window.prompt("Copy your leaderboard backup code:", text);
      });
    }

    if (importBtn) {
      importBtn.addEventListener("click", function () {
        var text = window.prompt("Paste your leaderboard backup code:");

        if (!text) return;

        try {
          var data = JSON.parse(decodeURIComponent(escape(atob(text))));

          if (!data || !Array.isArray(data.leaderboard)) {
            throw new Error("Invalid leaderboard backup.");
          }

          var ok = window.confirm(
            "Import leaderboard backup? This will merge imported scores with your current scores."
          );

          if (!ok) return;

          leaderboard = leaderboard
            .concat(data.leaderboard)
            .filter(function (entry) {
              return entry && typeof entry.score === "number";
            })
            .sort(function (a, b) {
              if (b.score !== a.score) return b.score - a.score;
              return (b.createdAt || 0) - (a.createdAt || 0);
            })
            .slice(0, 50);

          saveLocal("snake_leaderboard", leaderboard);
          renderLeaderboard();
        } catch (error) {
          window.alert("Invalid leaderboard backup code.");
        }
      });
    }

    if (!filtered.length) {
      var empty = document.createElement("div");
      empty.className = "leaderboard-entry leaderboard-empty";
      empty.innerHTML =
        "<strong>No scores yet</strong>" +
        "<span>Play one " + modeDisplayName() + " run to create a record.</span>";
      leaderboardList.appendChild(empty);
      return;
    }

    filtered.slice(0, 8).forEach(function (entry, index) {
      var el = document.createElement("div");
      el.className = "leaderboard-entry";

      var dateText = entry.createdAt
        ? new Date(entry.createdAt).toLocaleDateString()
        : "Old run";

      var modeText = cleanOldModeText(entry.mode || modeDisplayName());
      var timeText = entry.survivalMs ? formatRunTime(entry.survivalMs) : "";
      var applesText = typeof entry.apples === "number" ? entry.apples + " apples" : "";
      var comboText = entry.maxCombo && entry.maxCombo > 1 ? "Combo x" + entry.maxCombo : "";

      var details = [modeText, timeText, applesText, comboText, dateText]
        .filter(Boolean)
        .join(" · ");

      el.innerHTML =
        "<strong>#" + (index + 1) + " · " + entry.score + "</strong>" +
        "<span>" + details + "</span>";

      leaderboardList.appendChild(el);
    });
  }

  function renderMissions() {
    missionsList.innerHTML = "";
    MISSIONS.forEach(function (m) {
      var done = Boolean(missionState[m.id]);
      var el = document.createElement("div");
      el.className = "mission-card" + (done ? " done" : "");
      el.innerHTML =
        '<div class="mission-title">' + m.title + (done ? " ✓" : "") + "</div>" +
        '<div class="mission-desc">' + (done ? m.doneText : m.desc) + "</div>";
      missionsList.appendChild(el);
    });
  }

  function renderCampaign() {
    campaignList.innerHTML = "";
    CAMPAIGN.forEach(function (c, index) {
      var el = document.createElement("div");
      el.className = "mission-card" + (index < campaignChapter ? " done" : "");
      el.innerHTML =
        '<div class="mission-title">' + c.title + "</div>" +
        '<div class="mission-desc">Target score: ' + c.target + (c.boss ? " · Boss fight" : "") + "</div>";
      campaignList.appendChild(el);
    });
  }

  function refreshMapSelect() {
    if (!mapSelect) return;

    mapSelect.innerHTML = "";

    if (!savedMaps.length) {
      var emptyOption = document.createElement("option");
      emptyOption.value = "";
      emptyOption.textContent = "No saved maps";
      mapSelect.appendChild(emptyOption);
      selectedMapId = "";
      return;
    }

    savedMaps
      .slice()
      .sort(function (a, b) { return b.updatedAt - a.updatedAt; })
      .forEach(function (map) {
        var option = document.createElement("option");
        option.value = map.id;
        option.textContent = map.name;
        mapSelect.appendChild(option);
      });

    if (!selectedMapId || !savedMaps.some(function (m) { return m.id === selectedMapId; })) {
      selectedMapId = savedMaps[0].id;
    }

    mapSelect.value = selectedMapId;
  }

  function loadMapIntoEditor(map) {
    if (!map) return;
    customMapCells = cloneCells(map.cells);
    selectedMapId = map.id;
    if (mapNameInput) mapNameInput.value = map.name;
    if (mapSelect) mapSelect.value = map.id;
    if (mapCodeBox) mapCodeBox.value = "";
    saveLocal("snake_custom_map", customMapCells);
  }

  function syncEditorButtons() {
    if (editorDrawBtn) editorDrawBtn.style.display = isDrawingMap ? "none" : "";
    if (editorDoneBtn) editorDoneBtn.style.display = isDrawingMap ? "" : "none";
    if (editorReturnBtn) editorReturnBtn.classList.toggle("show", isDrawingMap);
  }

  function setEditorControlsDisabled(disabled) {
    var controls = [
      editorSaveBtn,
      editorLoadBtn,
      editorDeleteBtn,
      editorExportBtn,
      editorImportBtn,
      editorDrawBtn,
      editorDoneBtn,
      editorClearBtn,
      editorStartBtn,
      editorBackBtn,
      mapNameInput,
      mapSelect,
      mapCodeBox
    ];

    controls.forEach(function (el) {
      if (!el) return;
      if (el === editorDoneBtn && disabled) return;
      el.disabled = disabled;
    });
  }

  function showPanel(name) {
    [
      panelMenu,
      panelStatus,
      panelMobileMenu,
      panelMobileSettings,
      panelMobileRunInfo,
      panelSettings,
      panelHelp,
      panelMissions,
      panelCampaign,
      panelEditor
    ].forEach(function (panel) {
      if (panel) panel.classList.remove("is-active");
    });

    overlay.classList.add("show");
    overlay.classList.remove("editor-open");

    if (name === "menu") panelMenu.classList.add("is-active");
    if (name === "status") panelStatus.classList.add("is-active");
    if (name === "mobileMenu" && panelMobileMenu) panelMobileMenu.classList.add("is-active");
    if (name === "mobileSettings" && panelMobileSettings) panelMobileSettings.classList.add("is-active");
    if (name === "mobileRunInfo" && panelMobileRunInfo) panelMobileRunInfo.classList.add("is-active");
    if (name === "settings") panelSettings.classList.add("is-active");
    if (name === "help") panelHelp.classList.add("is-active");
    if (name === "missions") panelMissions.classList.add("is-active");
    if (name === "campaign") panelCampaign.classList.add("is-active");

    if (name === "editor") {
      panelEditor.classList.add("is-active");
      overlay.classList.add("editor-open");
      refreshMapSelect();
      ensureEditorUpgradeUi();
      syncEditorButtons();
      syncEditorToolUi();
      setTimeout(resizeCanvas, 0);
    }
  }

  function hideOverlay() {
    overlay.classList.remove("show");
    overlay.classList.remove("editor-open");
  }

  function setNewMatchButtonVisible(visible) {
    if (!newMatchBtn) return;
    newMatchBtn.classList.toggle("hidden", !visible);
  }

  setReplayButtonVisible(hasSavedReplay());

  function showStatus(title, text, primaryText, secondaryText) {
    overlayTitleNode.textContent = title;
    overlayTextNode.textContent = text;
    statusPrimaryBtn.textContent = primaryText || "Play";
    statusSecondaryBtn.textContent = secondaryText || "Menu";

    setNewMatchButtonVisible(false);

    overlay.classList.add("show");

    [
      panelMenu,
      panelStatus,
      panelSettings,
      panelHelp,
      panelMissions,
      panelCampaign,
      panelEditor
    ].forEach(function (panel) {
      if (panel) panel.classList.remove("is-active");
    });

    panelStatus.classList.add("is-active");
  }
    // ---------------------------------------------------------------------------
  // MAP EDITOR
  // ---------------------------------------------------------------------------

  function ensureEditorUpgradeUi() {
    if (!panelEditor) return;

    if (!editorModeToggleBtn) {
      editorModeToggleBtn = document.createElement("button");
      editorModeToggleBtn.type = "button";
      editorModeToggleBtn.id = "editor-mode-toggle-btn";
      editorModeToggleBtn.textContent = "Draw Mode";
      editorModeToggleBtn.addEventListener("click", function () {
        if (!editorMode) return;

        editorTool = editorTool === "draw" ? "erase" : "draw";
        syncEditorToolUi();
        showEditorFeedback(editorTool === "draw" ? "Draw Mode ON" : "Erase Mode ON");
      });
    }

    if (!editorFeedbackEl) {
      editorFeedbackEl = document.createElement("div");
      editorFeedbackEl.id = "editor-feedback-text";
      editorFeedbackEl.style.marginTop = "4px";
      editorFeedbackEl.style.textAlign = "center";
      editorFeedbackEl.style.fontSize = "0.88rem";
      editorFeedbackEl.style.fontWeight = "700";
      editorFeedbackEl.style.color = "#9ed6ff";
      editorFeedbackEl.textContent = "Draw Mode ON";
    }

    var actionRows = panelEditor.querySelectorAll(".panel-actions");
    if (actionRows.length) {
      var firstRow = actionRows[0];

      if (firstRow && !document.getElementById("editor-mode-toggle-btn")) {
        firstRow.appendChild(editorModeToggleBtn);
      }

      if (firstRow && !document.getElementById("editor-feedback-text")) {
        var feedbackWrap = document.createElement("div");
        feedbackWrap.style.width = "100%";
        feedbackWrap.appendChild(editorFeedbackEl);
        panelEditor.insertBefore(feedbackWrap, firstRow.nextSibling);
      }
    }

    syncEditorToolUi();
  }
 
  function syncEditorToolUi() {
    if (editorModeToggleBtn) {
      editorModeToggleBtn.textContent = editorTool === "draw" ? "Draw Mode" : "Erase Mode";

      editorModeToggleBtn.style.borderColor =
        editorTool === "draw"
          ? "rgba(110, 255, 170, 0.45)"
          : "rgba(255, 120, 120, 0.45)";

      editorModeToggleBtn.style.boxShadow =
        editorTool === "draw"
          ? "0 0 18px rgba(110,255,170,0.12)"
          : "0 0 18px rgba(255,120,120,0.12)";
    }

    if (editorFeedbackEl) {
      editorFeedbackEl.textContent = editorTool === "draw" ? "Draw Mode ON" : "Erase Mode ON";
      editorFeedbackEl.style.color = editorTool === "draw" ? "#8fffc0" : "#ff9d9d";
    }

    if (canvas) {
      canvas.style.cursor = isDrawingMap ? "crosshair" : "default";
    }
  }

  function showEditorFeedback(text) {
    if (!editorFeedbackEl) return;

    editorFeedbackEl.textContent = text;
    editorFeedbackEl.style.opacity = "1";

    clearTimeout(editorFeedbackTimer);
    editorFeedbackTimer = setTimeout(function () {
      syncEditorToolUi();
    }, 1000);
  }

  function getEditorCellKey(x, y) {
    return x + "," + y;
  }

  function isProtectedEditorCell(x, y) {
    var boardSize = state && state.cols ? state.cols : settings.boardSize;
    var midX = Math.floor(boardSize / 2);
    var midY = Math.floor(boardSize / 2);

    return (
      (x === midX && y === midY) ||
      (x === midX - 1 && y === midY) ||
      (x === midX - 2 && y === midY) ||
      (x === midX + 1 && y === midY) ||
      (x === midX && y === midY + 1) ||
      (x === midX && y === midY - 1)
    );
  }

  function findEditorCellFromPointer(event) {
    var boardSize = state && state.cols ? state.cols : settings.boardSize;
    var rect = canvas.getBoundingClientRect();

    var localX;
    var localY;

    if (typeof event.offsetX === "number" && typeof event.offsetY === "number") {
      localX = event.offsetX;
      localY = event.offsetY;
    } else {
      localX = event.clientX - rect.left;
      localY = event.clientY - rect.top;
    }

    if (localX < 0 || localY < 0 || localX > rect.width || localY > rect.height) {
      return null;
    }

    var cellSizeX = rect.width / boardSize;
    var cellSizeY = rect.height / boardSize;

    var cellX = Math.floor(localX / cellSizeX);
    var cellY = Math.floor(localY / cellSizeY);

    if (
      cellX < 0 ||
      cellY < 0 ||
      cellX >= boardSize ||
      cellY >= boardSize
    ) {
      return null;
    }

    return { x: cellX, y: cellY };
  }

  function findEditorCellFromTouch(clientX, clientY) {
    var boardSize = state && state.cols ? state.cols : settings.boardSize;
    var rect = canvas.getBoundingClientRect();

    var localX = clientX - rect.left;
    var localY = clientY - rect.top;

    if (localX < 0 || localY < 0 || localX > rect.width || localY > rect.height) {
      return null;
    }

    var cellSizeX = rect.width / boardSize;
    var cellSizeY = rect.height / boardSize;

    var cellX = Math.floor(localX / cellSizeX);
    var cellY = Math.floor(localY / cellSizeY);

    if (
      cellX < 0 ||
      cellY < 0 ||
      cellX >= boardSize ||
      cellY >= boardSize
    ) {
      return null;
    }

    return { x: cellX, y: cellY };
  }

  function findEditorCellFromMouse(event) {
    var boardSize = state && state.cols ? state.cols : settings.boardSize;
    var rect = canvas.getBoundingClientRect();

    var localX = event.clientX - rect.left;
    var localY = event.clientY - rect.top;

    if (localX < 0 || localY < 0 || localX > rect.width || localY > rect.height) {
      return null;
    }

    var cellSizeX = rect.width / boardSize;
    var cellSizeY = rect.height / boardSize;

    var cellX = Math.floor(localX / cellSizeX);
    var cellY = Math.floor(localY / cellSizeY);

    if (
      cellX < 0 ||
      cellY < 0 ||
      cellX >= boardSize ||
      cellY >= boardSize
    ) {
      return null;
    }

    return { x: cellX, y: cellY };
  }

  function hasCustomMapCell(x, y) {
    return customMapCells.some(function (cell) {
      return cell.x === x && cell.y === y;
    });
  }

  function addEditorEffect(x, y, kind) {
    editorEffects.push({
      x: x,
      y: y,
      kind: kind,
      life: 1
    });
  }

  function applyEditorToolAtCell(cell) {
    if (!cell) return;

    var key = getEditorCellKey(cell.x, cell.y);
    if (editorLastPaintedKey === key) return;

    editorLastPaintedKey = key;

    if (isProtectedEditorCell(cell.x, cell.y)) {
      showEditorFeedback("Protected Spawn Area");
      return;
    }

    var exists = hasCustomMapCell(cell.x, cell.y);

    if (editorTool === "draw") {
      if (!exists) {
        customMapCells.push({ x: cell.x, y: cell.y });
        saveLocal("snake_custom_map", customMapCells);
        addEditorEffect(cell.x, cell.y, "draw");
      }
    } else {
      if (exists) {
        customMapCells = customMapCells.filter(function (item) {
          return !(item.x === cell.x && item.y === cell.y);
        });
        saveLocal("snake_custom_map", customMapCells);
        addEditorEffect(cell.x, cell.y, "erase");
      }
    }
  }

  function syncEditorBoardState() {
    state = window.SnakeLogic.createRunState(
      createEngineConfig({
        useCustomMap: false,
        bossEnabled: false
      })
    );
    previousSnake = cloneSnake(state.snake);
  }

  function startDrawMapMode() {
    if (!editorMode) return;

    syncEditorBoardState();
    ensureEditorUpgradeUi();

    isDrawingMap = true;
    editorPointerDown = false;
    editorHoverCell = null;
    editorLastPaintedKey = "";
    syncEditorButtons();
    setEditorControlsDisabled(true);
    syncEditorToolUi();
    showEditorFeedback(editorTool === "draw" ? "Draw Mode ON" : "Erase Mode ON");

    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }

    overlay.classList.remove("show");
    overlay.classList.remove("editor-open");
  }

  function stopDrawMapMode() {
    isDrawingMap = false;
    editorPointerDown = false;
    editorHoverCell = null;
    editorLastPaintedKey = "";
    setEditorControlsDisabled(false);
    syncEditorButtons();
    syncEditorToolUi();
  }

  function reopenEditorPanel() {
    isDrawingMap = false;
    editorPointerDown = false;
    editorHoverCell = null;
    editorLastPaintedKey = "";
    setEditorControlsDisabled(false);
    syncEditorButtons();
    syncEditorToolUi();
    showPanel("editor");
  }

  function saveCurrentMap() {
    var name = normalizeMapName(mapNameInput ? mapNameInput.value : "");
    if (!name) {
      showStatus("Map Name Needed", "Please enter a map name before saving.", "OK", "Menu");
      return;
    }

    if (!customMapCells.length) {
      showStatus("Map Empty", "Add at least one wall before saving the map.", "OK", "Menu");
      return;
    }

    var id = makeMapId(name);
    var existingIndex = savedMaps.findIndex(function (map) {
      return map.id === id || map.name.toLowerCase() === name.toLowerCase();
    });

    var payload = {
      id: existingIndex >= 0 ? savedMaps[existingIndex].id : id,
      name: name,
      cells: cloneCells(customMapCells),
      updatedAt: Date.now()
    };

    if (existingIndex >= 0) savedMaps[existingIndex] = payload;
    else savedMaps.push(payload);

    selectedMapId = payload.id;
    saveSavedMaps();
    refreshMapSelect();
  }

  function loadSelectedSavedMap() {
    if (!mapSelect || !mapSelect.value) {
      showStatus("No Map Selected", "Choose a saved map first.", "OK", "Menu");
      return;
    }

    var map = savedMaps.find(function (item) {
      return item.id === mapSelect.value;
    });

    if (!map) {
      showStatus("Map Missing", "That saved map could not be found.", "OK", "Menu");
      return;
    }

    loadMapIntoEditor(map);
  }

  function deleteSelectedSavedMap() {
    if (!mapSelect || !mapSelect.value) {
      showStatus("No Map Selected", "Choose a saved map first.", "OK", "Menu");
      return;
    }

    var map = savedMaps.find(function (item) {
      return item.id === mapSelect.value;
    });

    if (!map) {
      showStatus("Map Missing", "That saved map could not be found.", "OK", "Menu");
      return;
    }

    savedMaps = savedMaps.filter(function (item) {
      return item.id !== map.id;
    });

    if (selectedMapId === map.id) {
      selectedMapId = "";
      customMapCells = [];
      saveLocal("snake_custom_map", customMapCells);

      if (mapNameInput) mapNameInput.value = "";
      if (mapCodeBox) mapCodeBox.value = "";
    }

    saveSavedMaps();
    refreshMapSelect();
  }

  function exportCurrentMap() {
    var name = normalizeMapName(mapNameInput ? mapNameInput.value : "") || "Custom Map";
    if (!customMapCells.length) {
      showStatus("Map Empty", "Build a map before exporting it.", "OK", "Menu");
      return;
    }

    var payload = {
      type: "snake_map",
      version: 1,
      name: name,
      boardSize: settings.boardSize,
      cells: cloneCells(customMapCells)
    };

    var encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    if (mapCodeBox) mapCodeBox.value = encoded;

    try {
      navigator.clipboard.writeText(encoded).then(function () {
        showStatus("Map Code Ready", "Map code copied to clipboard.", "OK", "Menu");
      }).catch(function () {
        showStatus("Map Code Ready", "Map code generated. Copy it from the box.", "OK", "Menu");
      });
    } catch (e) {
      showStatus("Map Code Ready", "Map code generated. Copy it from the box.", "OK", "Menu");
    }
  }

  function importMapCode() {
    var code = mapCodeBox ? mapCodeBox.value.trim() : "";
    if (!code) {
      showStatus("No Map Code", "Paste a map code first.", "OK", "Menu");
      return;
    }

    try {
      var parsed = JSON.parse(decodeURIComponent(escape(atob(code))));
      if (!parsed || parsed.type !== "snake_map" || !Array.isArray(parsed.cells)) {
        throw new Error("Invalid map payload");
      }

      var importedName = normalizeMapName(parsed.name || "Imported Map");
      customMapCells = cloneCells(parsed.cells);
      saveLocal("snake_custom_map", customMapCells);

      if (typeof parsed.boardSize === "number" && [16, 18, 20, 22].indexOf(parsed.boardSize) >= 0) {
        settings.boardSize = parsed.boardSize;
        saveSlotSettings();
        syncSettingsUi();
        resizeCanvas();
      }

      if (mapNameInput) mapNameInput.value = importedName;
      selectedMapId = "";
    } catch (e) {
      showStatus("Import Failed", "That map code is invalid.", "OK", "Menu");
    }
  }

  // ---------------------------------------------------------------------------
  // AUDIO
  // ---------------------------------------------------------------------------

  function playTone(freq, duration, type, volume) {
    try {
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!playTone.ctx) playTone.ctx = new AudioContextClass();

      var ac = playTone.ctx;
      var osc = ac.createOscillator();
      var gain = ac.createGain();

      osc.type = type || "sine";
      osc.frequency.value = freq;
      gain.gain.value = volume || 0.03;

      osc.connect(gain);
      gain.connect(ac.destination);

      var now = ac.currentTime;
      gain.gain.setValueAtTime(volume || 0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  function soundEat() {
    playTone(720, 0.08, "triangle", 0.035);
    playTone(900, 0.06, "sine", 0.02);
  }

  function soundGameOver() {
    playTone(220, 0.2, "sawtooth", 0.04);
    playTone(160, 0.25, "triangle", 0.03);
  }

  function soundPause() {
    playTone(420, 0.06, "square", 0.02);
  }

  function soundCountdown(value) {
    var freq = value > 0 ? 500 + value * 70 : 880;
    playTone(freq, 0.08, "triangle", 0.03);
  }

  function soundTimeAttackTick(secondsLeft) {
    var freq = secondsLeft <= 3 ? 1150 : 850;
    playTone(freq, 0.06, "square", 0.025);
  }

  function soundLevelUp() {
    playTone(650, 0.08, "triangle", 0.03);
    playTone(880, 0.1, "sine", 0.02);
  }

  function soundAchievement() {
    playTone(980, 0.06, "sine", 0.025);
    playTone(1180, 0.08, "triangle", 0.025);
  }

  // ---------------------------------------------------------------------------
  // GAME FLOW
  // ---------------------------------------------------------------------------

  function getTickSpeed() {
    var baseSpeed = window.SnakeLogic.getTickSpeed(settings.difficulty, state.applesEaten, state.powerUp);

    if (isTimeAttackMode()) {
      var remaining = getTimeAttackRemainingMs();

      if (remaining <= 10000) {
        return Math.max(65, baseSpeed - 35);
      }

      if (remaining <= 20000) {
        return Math.max(75, baseSpeed - 20);
      }

      return baseSpeed;
    }

    if (!isSurvivalMode()) return baseSpeed;

    return Math.max(65, baseSpeed - getSurvivalSpeedReduction(survivalMs));
  }

  function choosePowerFromFood(type) {
    if (type === "ice") return "ice";
    if (type === "fire") return "fire";
    if (type === "ghost") return "ghost";
    return null;
  }

  function applyPowerUp(type) {
    if (!type) return;
    state.powerUp = {
      type: type,
      endsAt: performance.now() + POWERUP_DURATION_MS
    };
    updatePowerupLabel();
  }

  function maybeExpirePowerUp() {
    if (state.powerUp && performance.now() >= state.powerUp.endsAt) {
      state.powerUp = null;
      updatePowerupLabel();
    }
  }

  function stopTimers() {
    if (tickTimer !== null) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
    if (countdownTimer !== null) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  function restartTickingIfNeeded() {
    if (tickTimer !== null) clearInterval(tickTimer);

    if (phase !== "playing" || paused || !state.alive || countdownActive) {
      tickTimer = null;
      return;
    }

    lastStepAt = performance.now();
    tickTimer = setInterval(stepGame, getTickSpeed());
  }

  function startCountdownThenPlay() {
    countdownActive = true;
    var count = 3;

    showStatus(String(count), "Get ready...", "", "");
    soundCountdown(count);

    countdownTimer = setInterval(function () {
      count -= 1;

      if (count > 0) {
        showStatus(String(count), "Get ready...", "", "");
        soundCountdown(count);
        return;
      }

      if (count === 0) {
        var goText = "Eat the food.";
        if (editorMode) goText = "Custom map loaded.";
        if (isSurvivalMode()) goText = "Survive as long as possible.";
        if (isTimeAttackMode()) goText = "Score as much as possible before time runs out.";
        if (isBossChallengeMode()) goText = "Survive the boss and score as high as possible.";

        showStatus("Go!", goText, "", "");
        soundCountdown(0);
        return;
      }

      clearInterval(countdownTimer);
      countdownTimer = null;
      countdownActive = false;
      phase = "playing";
      hideOverlay();
      restartTickingIfNeeded();
    }, 500);
  }

  function startNewRun(useCustomMap) {
    stopDrawMapMode();
    if (editorReturnBtn) editorReturnBtn.classList.remove("show");

    phase = "countdown";
    paused = false;
    inputQueue = [];
    editorMode = Boolean(useCustomMap);
    startTime = performance.now();
    survivalMs = 0;
    lastStepAt = performance.now();
    lastTimeAttackTickSecond = null;
    comboCount = 1;
    maxCombo = 1;
    runStats = { iceFoods: 0 };

    appleTrail = [];
    particles = [];
    scorePopups = [];
    screenShake = 0;

    state = createFreshState(editorMode);
    previousSnake = cloneSnake(state.snake);

    if (isMultiplayerMode()) {
      var midY = Math.floor(state.rows / 2);

      state.snake = [
        { x: 2, y: midY },
        { x: 1, y: midY },
        { x: 0, y: midY }
      ];

      state.direction = "RIGHT";
    }

    if (isMultiplayerMode()) {
      resetMultiplayerState();
      placeMultiplayerFood();
    }

    updateComboBadge();
    updateHud();
    updateModeLabel();
    startReplayRecording();
    startCountdownThenPlay();
  }

  function restartGame() {
    stopReplayPlayback();
    stopReplayRecording(false);
    stopTimers();
    stopDrawMapMode();
    if (editorReturnBtn) editorReturnBtn.classList.remove("show");

    paused = false;
    phase = "menu";
    comboCount = 1;
    updateComboBadge();
    inputQueue = [];
    editorMode = false;
    campaignMode = false;
    runStats = { iceFoods: 0 };
    startTime = performance.now();
    survivalMs = 0;
    lastTimeAttackTickSecond = null;

    state = createFreshState(false);
    previousSnake = cloneSnake(state.snake);

    if (isMultiplayerMode()) {
      resetMultiplayerState();
      placeMultiplayerFood();
    } else {
      player2 = null;
      player2Queue = [];
      player2Score = 0;
      player2PreviousSnake = [];
    }

    appleTrail = [];
    particles = [];
    scorePopups = [];
    screenShake = 0;
    lastStepAt = performance.now();

    updateHud();
    updateModeLabel();
    updatePowerupLabel();
    showPanel("menu");
  }

  function handleCombo() {
    var now = performance.now();
    if (now - lastAppleTime <= COMBO_WINDOW_MS) comboCount += 1;
    else comboCount = 1;

    if (comboCount > maxCombo) maxCombo = comboCount;
    lastAppleTime = now;
    updateComboBadge();
  }

  function addAppleTrail(food) {
    if (!food) return;
    appleTrail.push({ x: food.x, y: food.y, life: 1 });
    if (appleTrail.length > 10) appleTrail.shift();
  }

  function addParticlesAt(x, y, colorA, colorB) {
    var burstCount = comboCount > 1 ? 24 : 20;
    var baseSpeed = comboCount > 1 ? 0.075 : 0.06;
    var extraSpeed = comboCount > 1 ? 0.11 : 0.09;

    for (var i = 0; i < burstCount; i += 1) {
      var angle = (Math.PI * 2 * i) / burstCount + Math.random() * 0.35;
      var speed = baseSpeed + Math.random() * extraSpeed;

      particles.push({
        x: x + 0.5,
        y: y + 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: 0.07 + Math.random() * 0.1,
        color: i % 4 === 0 ? "#ffffff" : i % 2 === 0 ? colorA : colorB
      });
    }

    if (comboCount > 1) {
      addScorePopup(x, y - 0.2, "COMBO x" + comboCount);
    }

    screenShake = Math.max(screenShake, comboCount > 1 ? 4 : 2.5);
  }

  function addScorePopup(x, y, text) {
    scorePopups.push({ x: x + 0.5, y: y + 0.35, text: text, life: 1 });
  }

  function maybeLevelUp(previousApples) {
    var oldLevel = window.SnakeLogic.getLevel(previousApples);
    var newLevel = currentLevel();

    if (newLevel > oldLevel) {
      soundLevelUp();
      addScorePopup(state.snake[0].x, state.snake[0].y, "LEVEL " + newLevel);
      showLevelToast(newLevel);

      window.SnakeLogic.refreshWorldForLevel(
        state,
        createEngineConfig({
          useCustomMap: editorMode,
          bossEnabled: campaignMode && CAMPAIGN[campaignChapter] && CAMPAIGN[campaignChapter].boss
        }),
        newLevel
      );
    }
  }

  function addLeaderboardEntry() {
    var entry = {
      id: Date.now() + "-" + Math.floor(Math.random() * 10000),
      score: getDisplayScore(),
      rawScore: state.score,
      mode: getLeaderboardModeLabel(),
      modeKey: currentMode(),
      difficulty: settings.difficulty,
      boardSize: settings.boardSize,
      survivalMs: survivalMs,
      apples: state.applesEaten,
      maxCombo: maxCombo,
      createdAt: Date.now()
    };

    leaderboard.unshift(entry);

    leaderboard = leaderboard
      .sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return b.createdAt - a.createdAt;
      })
      .slice(0, 15);

    saveLocal("snake_leaderboard", leaderboard);
    renderLeaderboard();
  }

  function updateMissionProgress() {
    var changed = false;

    if (!missionState.shadowSkin && currentLevel() >= 4 && state.score >= 120) {
      missionState.shadowSkin = true;
      changed = true;
    }

    if (!missionState.frostSkin && runStats.iceFoods >= 3) {
      missionState.frostSkin = true;
      changed = true;
    }

    if (!missionState.infernoSkin && settings.difficulty === "hard" && survivalMs >= 60000) {
      missionState.infernoSkin = true;
      changed = true;
    }

    if (!missionState.voidSkin && campaignMode && campaignChapter === 2 && state.score >= CAMPAIGN[2].target) {
      missionState.voidSkin = true;
      changed = true;
    }

    if (
      !missionState.crystalSkin &&
      missionState.shadowSkin &&
      missionState.frostSkin &&
      missionState.infernoSkin &&
      missionState.voidSkin
    ) {
      missionState.crystalSkin = true;
      changed = true;
    }

    if (changed) {
      saveLocal("snake_missions", missionState);
      syncSkinUnlocks();
      renderMissions();
    }
  }

  function unlockAchievements() {
    var meta = { survivalMs: survivalMs, maxCombo: maxCombo, level: currentLevel() };
    var changed = false;

    ACHIEVEMENT_DEFS.forEach(function (a) {
      if (!achievementsState[a.id] && a.check(state, meta)) {
        achievementsState[a.id] = true;
        changed = true;
        showAchievementToast(a.label);
        soundAchievement();
      }
    });

    if (changed) {
      saveLocal("snake_achievements", achievementsState);
      renderAchievements();
    }
  }

  function completeBossChallengeIfNeeded() {
    if (!isBossChallengeMode()) return false;

    if (state.score >= 50) {
      handleDeathOrWin(true, "Boss Challenge cleared.");
      return true;
    }

    return false;
  }

  function completeCampaignIfNeeded() {
    if (!campaignMode) return false;

    var chapter = CAMPAIGN[campaignChapter];
    if (state.score >= chapter.target) {
      if (campaignChapter < CAMPAIGN.length - 1) {
        campaignChapter += 1;
        renderCampaign();
        showStatus("Chapter Clear", "Starting next chapter...", "Continue", "Menu");
        stopTimers();
        setTimeout(function () {
          startNewRun(false);
        }, 600);
      } else {
        missionState.voidSkin = true;
        saveLocal("snake_missions", missionState);
        syncSkinUnlocks();
        renderMissions();
        handleDeathOrWin(true, "Campaign completed.");
      }
      return true;
    }

    return false;
  }

  function handleDeathOrWin(isWin, message) {
    phase = isWin ? "won" : "dead";
    stopTimers();
    survivalMs = performance.now() - startTime;

    var finalMessage = message;

    if (isSurvivalMode()) {
      finalMessage +=
        " Time: " + formatRunTime(survivalMs) +
        " · Bonus: +" + getSurvivalBonus(survivalMs) +
        " · Final Score: " + getDisplayScore();
    }

    // Show Game Over FIRST so popup cannot be blocked
    showStatus(
      isTimeAttackMode() && isWin ? "Time Up" : isWin ? "Victory" : "Game Over",
      finalMessage,
      "Play Again",
      "Menu"
    );

    // Run extra saving/unlock work AFTER popup
    try {
      unlockAchievements();
      updateMissionProgress();
      addLeaderboardEntry();
    } catch (error) {
      console.warn("Post-game update failed:", error);
    }
  }

  function player2HitsBlockedCell(cell) {
    if (!cell || !player2) return true;

    if (cell.x < 0 || cell.x >= state.cols || cell.y < 0 || cell.y >= state.rows) {
      return true;
    }

    if ((state.obstacles || []).some(function (obstacle) {
      return sameCell(cell, obstacle);
    })) {
      return true;
    }

    if ((state.movingHazards || []).some(function (hazard) {
      return sameCell(cell, hazard);
    })) {
      return true;
    }

    if (state.boss && sameCell(cell, state.boss)) {
      return true;
    }

    if ((player2.snake || []).slice(1).some(function (segment) {
      return sameCell(cell, segment);
    })) {
      return true;
    }

    if ((state.snake || []).some(function (segment) {
      return sameCell(cell, segment);
    })) {
      return true;
    }

    return false;
  }

  function player1HitsPlayer2() {
    if (!player2 || !state.snake.length) return false;

    var head = state.snake[0];

    return player2.snake.some(function (segment) {
      return sameCell(head, segment);
    });
  }

  function movePlayer2() {
    if (!player2 || !player2.alive) return;

    var nextDirection = takePlayer2Direction();
    player2.direction = nextDirection;

    var nextHead = getNextCellFrom(player2.snake[0], nextDirection);

    if (player2HitsBlockedCell(nextHead)) {
      player2.alive = false;
      return;
    }

    player2.snake.unshift(nextHead);

    if (state.food && sameCell(nextHead, state.food)) {
      var points = window.SnakeLogic.foodPoints(state.food.type);
      player2Score += points;
      soundEat();
      eatFlash = 1;
      addAppleTrail(state.food);
      addParticlesAt(state.food.x, state.food.y, "#7eb6ff", "#d7e8ff");
      addScorePopup(state.food.x, state.food.y, "P2 +" + points);
      placeMultiplayerFood();
    } else {
      player2.snake.pop();
    }
  }

  function stepMultiplayerGame() {
    if (!state.alive || !player2 || !player2.alive || paused || phase !== "playing" || countdownActive) return;

    var previousScore = state.score;
    var previousSize = state.snake.length;
    var previousApples = state.applesEaten;
    var previousFood = state.food ? { x: state.food.x, y: state.food.y, type: state.food.type } : null;

    previousSnake = cloneSnake(state.snake);
    player2PreviousSnake = cloneSnake(player2.snake);

    var nextDirection = takeDirection();

    state = window.SnakeLogic.advanceState(state, nextDirection, {
      useObstacles: settings.obstacles,
      useMovingHazards: settings.obstacles,
      useBoss: false,
      dailySeed: settings.daily ? dailySeed() : null
    });

    if (foodIsOnPlayer2()) {
      placeMultiplayerFood();
    }

    movePlayer2();

    lastStepAt = performance.now();

    if (!state.alive || !player2.alive || player1HitsPlayer2()) {
      screenShake = 14;
      soundGameOver();

      var winnerText = "Draw";

      if (state.score > player2Score) {
        winnerText = "Player 1 Wins";
      } else if (player2Score > state.score) {
        winnerText = "Player 2 Wins";
      } else {
        if (!state.alive && player2.alive) {
          winnerText = "Player 2 Wins (Survived)";
        } else if (state.alive && !player2.alive) {
          winnerText = "Player 1 Wins (Survived)";
        }
      }

      var roundWinnerLabel = "Draw";

      if (winnerText.indexOf("Player 1") === 0) {
        player1RoundsWon += 1;
        roundWinnerLabel = "Player 1";
      } else if (winnerText.indexOf("Player 2") === 0) {
        player2RoundsWon += 1;
        roundWinnerLabel = "Player 2";
      }

      addRoundHistoryEntry(multiplayerRound, roundWinnerLabel);

      var matchOver = player1RoundsWon >= 2 || player2RoundsWon >= 2;
      var matchWinnerText = "";

      if (matchOver) {
        matchWinnerText = player1RoundsWon > player2RoundsWon
          ? "\nMatch Winner: Player 1"
          : "\nMatch Winner: Player 2";
      } else {
        multiplayerRound += 1;
      }

      handleDeathOrWin(
        false,
        winnerText +
          "\nP1: " + state.score + " | P2: " + player2Score +
          matchWinnerText
      );

      setNewMatchButtonVisible(matchOver);

      updateHud(previousScore, previousSize);
      return;
    }

    if (state.lastEvent && state.lastEvent.type === "food" && previousFood) {
      soundEat();
      eatFlash = 1;
      addAppleTrail(previousFood);
      addParticlesAt(previousFood.x, previousFood.y, activeTheme.snakeOuter, activeTheme.snakeInner);
      addScorePopup(previousFood.x, previousFood.y, "P1 +" + state.lastEvent.points);
      handleCombo();
      applyPowerUp(choosePowerFromFood(previousFood.type));
      if (previousFood.type === "ice") runStats.iceFoods += 1;
      maybeLevelUp(previousApples);
    }

    survivalMs = performance.now() - startTime;
    updateHud(previousScore, previousSize);
    restartTickingIfNeeded();
  }

  function stepGame() {
    if (!state.alive || paused || phase !== "playing" || countdownActive) return;

    if (isMultiplayerMode()) {
      stepMultiplayerGame();
      return;
    }

    maybeExpirePowerUp();

    var nextDirection = aiEnabled ? getAIDirection() : takeDirection();
    var previousScore = getDisplayScore();
    var previousSize = state.snake.length;
    var previousApples = state.applesEaten;
    var previousFood = state.food ? { x: state.food.x, y: state.food.y, type: state.food.type } : null;

    previousSnake = cloneSnake(state.snake);

    state = window.SnakeLogic.advanceState(state, nextDirection, {
      useObstacles: settings.obstacles && !(state.powerUp && state.powerUp.type === "ghost"),
      useMovingHazards: settings.obstacles && !(state.powerUp && state.powerUp.type === "ghost"),
      useBoss:
        isBossChallengeMode() ||
        (campaignMode && CAMPAIGN[campaignChapter] && CAMPAIGN[campaignChapter].boss),
      dailySeed: settings.daily ? dailySeed() : null
    });

    lastStepAt = performance.now();

    if (!state.alive) {
      screenShake = 14;

      var head = state.snake[0];
      addParticlesAt(head.x, head.y, "#ff4444", "#ffaa44");

      soundGameOver();
      demoModeActive = false;
      stopDemoTips();
      recordReplayFrame("game-over");
      stopReplayRecording(true);
      handleDeathOrWin(false, "Press Enter or Restart to play again.");
      updateHud(previousScore, previousSize);
      return;
    }

    if (state.lastEvent && state.lastEvent.type === "food" && previousFood) {
      soundEat();
      eatFlash = 1;
      addAppleTrail(previousFood);
      addParticlesAt(previousFood.x, previousFood.y, activeTheme.snakeOuter, activeTheme.snakeInner);
      addScorePopup(previousFood.x, previousFood.y, (state.lastEvent.points > 0 ? "+" : "") + state.lastEvent.points);
      handleCombo();
      applyPowerUp(choosePowerFromFood(previousFood.type));
      if (previousFood.type === "ice") runStats.iceFoods += 1;
      maybeLevelUp(previousApples);
    }

    survivalMs = performance.now() - startTime;

    if (isTimeAttackMode()) {
      var secondsLeft = Math.ceil(getTimeAttackRemainingMs() / 1000);

      if (secondsLeft <= 10 && secondsLeft > 0 && secondsLeft !== lastTimeAttackTickSecond) {
        lastTimeAttackTickSecond = secondsLeft;
        soundTimeAttackTick(secondsLeft);
      }
    }

    if (isTimeAttackMode() && getTimeAttackRemainingMs() <= 0) {
      updateHud(previousScore, previousSize);
      recordReplayFrame("time-up");
      stopReplayRecording(true);
      handleDeathOrWin(true, "Time Up! You scored " + getDisplayScore());
      return;
    }

    updateMissionProgress();
    unlockAchievements();
    updateHud(previousScore, previousSize);
    recordReplayFrame("step");

    if (completeBossChallengeIfNeeded()) {
      stopReplayRecording(true);
      return;
    }

    if (completeCampaignIfNeeded()) {
      stopReplayRecording(true);
      return;
    }

    restartTickingIfNeeded();
  }

  function takeDirection() {
    if (!inputQueue.length) return state.direction;
    var nextDirection = inputQueue.shift();
    if (!window.SnakeLogic.canQueueDirection(state.direction, nextDirection)) {
      return state.direction;
    }
    return nextDirection;
  }

  function getAIDirection() {
    var head = state.snake[0];
    var food = state.food;

    if (!head || !food) return state.direction;

    var directions = ["UP", "DOWN", "LEFT", "RIGHT"];

    function getNextCellFrom(cell, dir) {
      if (dir === "UP") return { x: cell.x, y: cell.y - 1 };
      if (dir === "DOWN") return { x: cell.x, y: cell.y + 1 };
      if (dir === "LEFT") return { x: cell.x - 1, y: cell.y };
      if (dir === "RIGHT") return { x: cell.x + 1, y: cell.y };
      return { x: cell.x, y: cell.y };
    }

    function cellKey(cell) {
      return cell.x + "," + cell.y;
    }

    function isSameCell(a, b) {
      return a && b && a.x === b.x && a.y === b.y;
    }

    function isBlockedCell(cell) {
      if (cell.x < 0 || cell.y < 0 || cell.x >= state.cols || cell.y >= state.rows) {
        return true;
      }

      if ((state.obstacles || []).some(function (obstacle) {
        return isSameCell(cell, obstacle);
      })) {
        return true;
      }

      if ((state.movingHazards || []).some(function (hazard) {
        return isSameCell(cell, hazard);
      })) {
        return true;
      }

      if (state.boss && isSameCell(cell, state.boss)) {
        return true;
      }

      /*
        We ignore the last tail segment because it usually moves away
        on the next step, so it is normally safe to move into that cell.
      */
      if ((state.snake || []).slice(0, -1).some(function (segment) {
        return isSameCell(cell, segment);
      })) {
        return true;
      }

      return false;
    }

    function canMove(dir) {
      return window.SnakeLogic.canQueueDirection(state.direction, dir);
    }

    function findPathToFood() {
      var queue = [];
      var visited = {};
      var parent = {};

      queue.push(head);
      visited[cellKey(head)] = true;

      while (queue.length) {
        var current = queue.shift();

        if (isSameCell(current, food)) {
          var path = [];
          var key = cellKey(current);

          while (parent[key]) {
            path.unshift(parent[key].dir);
            key = parent[key].from;
          }

          return path;
        }

        for (var i = 0; i < directions.length; i += 1) {
          var dir = directions[i];

          var next = getNextCellFrom(current, dir);
          var nextKey = cellKey(next);

          if (visited[nextKey]) continue;
          if (isBlockedCell(next)) continue;

          visited[nextKey] = true;
          parent[nextKey] = {
            from: cellKey(current),
            dir: dir
          };

          queue.push(next);
        }
      }

      return [];
    }

    function countOpenSpace(startCell) {
      var queue = [startCell];
      var visited = {};
      var count = 0;

      visited[cellKey(startCell)] = true;

      while (queue.length) {
        var current = queue.shift();
        count += 1;

        for (var i = 0; i < directions.length; i += 1) {
          var next = getNextCellFrom(current, directions[i]);
          var key = cellKey(next);

          if (visited[key]) continue;
          if (isBlockedCell(next)) continue;

          visited[key] = true;
          queue.push(next);
        }
      }

      return count;
    }

    var path = findPathToFood();

    if (path.length && canMove(path[0])) {
      return path[0];
    }

    /*
      Fallback:
      If food path is blocked, choose the move that gives the snake
      the largest open area instead of blindly chasing food.
    */
    var bestDir = state.direction;
    var bestSpace = -1;

    for (var i = 0; i < directions.length; i += 1) {
      var dir = directions[i];

      if (!canMove(dir)) continue;

      var nextCell = getNextCellFrom(head, dir);

      if (isBlockedCell(nextCell)) continue;

      var openSpace = countOpenSpace(nextCell);

      if (openSpace > bestSpace) {
        bestSpace = openSpace;
        bestDir = dir;
      }
    }

    return bestDir;
  }

  function pushInput(direction) {
    if (!window.SnakeLogic.DIRECTIONS[direction]) return;
    var last = inputQueue.length ? inputQueue[inputQueue.length - 1] : state.direction;
    if (!window.SnakeLogic.canQueueDirection(last, direction)) return;
    if (inputQueue.length < 2) inputQueue.push(direction);
  }

  function pushPlayer2Input(direction) {
    if (!player2) return;
    if (!window.SnakeLogic.DIRECTIONS[direction]) return;

    var last = player2Queue.length ? player2Queue[player2Queue.length - 1] : player2.direction;

    if (!window.SnakeLogic.canQueueDirection(last, direction)) return;
    if (player2Queue.length < 2) player2Queue.push(direction);
  }

  function takePlayer2Direction() {
    if (!player2 || !player2Queue.length) return player2 ? player2.direction : "LEFT";

    var nextDirection = player2Queue.shift();

    if (!window.SnakeLogic.canQueueDirection(player2.direction, nextDirection)) {
      return player2.direction;
    }

    return nextDirection;
  }

  function handleDirection(direction) {
    recordReplayInput(direction);

    if (phase === "menu" && !editorMode) {
      startNewRun(false);
      pushInput(direction);
      return;
    }

    if (phase === "dead" || phase === "won") {
      startNewRun(false);
      pushInput(direction);
      return;
    }

    if (phase === "playing" || phase === "countdown") {
      pushInput(direction);
    }
  }

  function handlePlayer2Direction(direction) {
    if (!isMultiplayerMode()) return;

    if (phase === "menu" && !editorMode) {
      startNewRun(false);
      pushPlayer2Input(direction);
      return;
    }

    if (phase === "dead" || phase === "won") {
      startNewRun(false);
      pushPlayer2Input(direction);
      return;
    }

    if (phase === "playing" || phase === "countdown") {
      pushPlayer2Input(direction);
    }
  }

  function togglePause() {
    if (phase !== "playing" && phase !== "countdown") return;
    if (phase === "countdown") return;

    paused = !paused;
    soundPause();

    if (paused) {
      stopTimers();
      showStatus("Paused", "Press pause again or Space to continue.", "Resume", "Menu");
    } else {
      hideOverlay();
      restartTickingIfNeeded();
    }
  }

  function requestFullscreen() {
    var target = appShell || document.documentElement;

    if (!document.fullscreenElement && target.requestFullscreen) {
      target.requestFullscreen().catch(function () {});
      return;
    }

    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(function () {});
    }
  }

  function openDrawer() {
    drawer.classList.add("open");
  }

  function closeDrawer() {
    drawer.classList.remove("open");
  }

  function cycleTheme(direction) {
    var currentIndex = THEME_ORDER.indexOf(settings.theme);
    if (currentIndex < 0) currentIndex = 0;

    var nextIndex = currentIndex;
    for (var i = 0; i < THEME_ORDER.length; i += 1) {
      nextIndex = (nextIndex + direction + THEME_ORDER.length) % THEME_ORDER.length;
      if (isThemeUnlocked(THEME_ORDER[nextIndex])) break;
    }

    settings.theme = THEME_ORDER[nextIndex];
    themeSelect.value = settings.theme;
    saveSlotSettings();
    applyTheme();
    updateSkinHint();
  }

  function handleEditorClick(clientX, clientY) {
    if (!editorMode || !isDrawingMap) return false;

    var cell = findEditorCellFromPointer({
      clientX: clientX,
      clientY: clientY
    });

    if (!cell) return false;

    applyEditorToolAtCell(cell);
    return true;
  }

  function pollGamepad() {
    if (!navigator.getGamepads) return;

    if (gamepadCooldown > 0) {
      gamepadCooldown -= 1;
      return;
    }

    var pads = navigator.getGamepads();
    if (!pads) return;

    for (var i = 0; i < pads.length; i += 1) {
      var pad = pads[i];
      if (!pad) continue;

      if (pad.axes[1] < -0.5) {
        handleDirection("UP");
        gamepadCooldown = 8;
        return;
      }
      if (pad.axes[1] > 0.5) {
        handleDirection("DOWN");
        gamepadCooldown = 8;
        return;
      }
      if (pad.axes[0] < -0.5) {
        handleDirection("LEFT");
        gamepadCooldown = 8;
        return;
      }
      if (pad.axes[0] > 0.5) {
        handleDirection("RIGHT");
        gamepadCooldown = 8;
        return;
      }
    }
  }

  function mapKeyToDirection(key) {
    if (key === "ArrowUp" || key === "w" || key === "W") return "UP";
    if (key === "ArrowDown" || key === "s" || key === "S") return "DOWN";
    if (key === "ArrowLeft" || key === "a" || key === "A") return "LEFT";
    if (key === "ArrowRight" || key === "d" || key === "D") return "RIGHT";
    return null;
  }

  function bindUi() {
    themeSelect.addEventListener("change", function () {
      if (!isThemeUnlocked(themeSelect.value)) {
        themeSelect.value = settings.theme;
        updateSkinHint();
        return;
      }

      settings.theme = themeSelect.value;
      saveSlotSettings();
      applyTheme();
      updateSkinHint();
    });

    difficultySelect.addEventListener("change", function () {
      settings.difficulty = difficultySelect.value;
      saveSlotSettings();
      updateModeLabel();
      restartTickingIfNeeded();
    });

    boardSelect.addEventListener("change", function () {
      settings.boardSize = Number(boardSelect.value);
      saveSlotSettings();
      restartGame();
      resizeCanvas();
    });

    if (modeSelect) {
      modeSelect.addEventListener("change", function () {
        settings.mode = modeSelect.value;
        saveSlotSettings();
        updateModeLabel();

        if (isMultiplayerMode()) {
          aiEnabled = false;
          if (aiToggle) aiToggle.checked = false;
          resetMultiplayerMatch();
        }

        if (phase === "playing" || phase === "countdown" || phase === "dead" || phase === "won") {
          restartGame();
        }
      });
    }

    slotSelect.addEventListener("change", function () {
      activeSlot = slotSelect.value;
      settings = loadSlotSettings(activeSlot);
      if (!settings.mode) settings.mode = "classic";
      bestScore = Number(loadLocal("snake_best_" + activeSlot, 0));
      savedMaps = loadSavedMaps();
      selectedMapId = "";

      syncSettingsUi();
      syncSkinUnlocks();
      applyTheme();
      updateSkinHint();
      refreshMapSelect();
      restartGame();
    });

    obstacleToggle.addEventListener("change", function () {
      settings.obstacles = obstacleToggle.checked;
      saveSlotSettings();
      updateModeLabel();
    });

    dailyToggle.addEventListener("change", function () {
      settings.daily = dailyToggle.checked;
      saveSlotSettings();
      updateModeLabel();
    });

    if (aiToggle) {
      aiToggle.addEventListener("change", function () {
        if (isMultiplayerMode()) {
          aiToggle.checked = false;
          aiEnabled = false;
          demoModeActive = false;
          stopDemoTips();
          return;
        }

        aiEnabled = aiToggle.checked;
        demoModeActive = false;
        stopDemoTips();
        updateHud();
      });
    }

    if (mapSelect) {
      mapSelect.addEventListener("change", function () {
        selectedMapId = mapSelect.value;
        var selectedMap = savedMaps.find(function (map) {
          return map.id === selectedMapId;
        });
        if (selectedMap && mapNameInput) {
          mapNameInput.value = selectedMap.name;
        }
      });
    }

    if (editorSaveBtn) editorSaveBtn.addEventListener("click", saveCurrentMap);
    if (editorLoadBtn) editorLoadBtn.addEventListener("click", loadSelectedSavedMap);
    if (editorDeleteBtn) editorDeleteBtn.addEventListener("click", deleteSelectedSavedMap);
    if (editorExportBtn) editorExportBtn.addEventListener("click", exportCurrentMap);
    if (editorImportBtn) editorImportBtn.addEventListener("click", importMapCode);
    if (editorDrawBtn) editorDrawBtn.addEventListener("click", startDrawMapMode);
    if (editorDoneBtn) editorDoneBtn.addEventListener("click", stopDrawMapMode);
    if (editorReturnBtn) {
      editorReturnBtn.addEventListener("click", function () {
        reopenEditorPanel();
      });
    }

    menuPlayBtn.addEventListener("click", function () {
      aiEnabled = false;
      demoModeActive = false;
      stopDemoTips();
      if (aiToggle) aiToggle.checked = false;

      editorMode = false;
      campaignMode = false;
      startNewRun(false);
    });

    if (menuReplayBtn) {
      menuReplayBtn.addEventListener("click", function () {
        playLastReplay();
      });
    }

    if (statusReplayBtn) {
      statusReplayBtn.addEventListener("click", function () {
        playLastReplay();
      });
    }

    if (menuDemoBtn) {
      menuDemoBtn.addEventListener("click", function () {
        if (modeSelect) {
          settings.mode = "classic";
          modeSelect.value = "classic";
          saveSlotSettings();
        }

        aiEnabled = true;
        demoModeActive = true;
        if (aiToggle) aiToggle.checked = true;

        editorMode = false;
        campaignMode = false;
        paused = false;

        startNewRun(false);
        startDemoTips();
      });
    }

    menuCampaignBtn.addEventListener("click", function () {
      showPanel("campaign");
    });

    menuMissionsBtn.addEventListener("click", function () {
      showPanel("missions");
    });

    menuEditorBtn.addEventListener("click", function () {
      editorMode = true;
      campaignMode = false;
      stopDrawMapMode();
      refreshMapSelect();
      showPanel("editor");
    });

    menuSettingsBtn.addEventListener("click", function () {
      showPanel("settings");
    });

    menuHelpBtn.addEventListener("click", function () {
      showPanel("help");
    });

    settingsBackBtn.addEventListener("click", function () {
      showPanel("menu");
    });

    helpBackBtn.addEventListener("click", function () {
      showPanel("menu");
    });

    missionsBackBtn.addEventListener("click", function () {
      showPanel("menu");
    });

    campaignBackBtn.addEventListener("click", function () {
      showPanel("menu");
    });

    campaignStartBtn.addEventListener("click", function () {
      campaignMode = true;
      campaignChapter = 0;
      renderCampaign();
      startNewRun(false);
    });

    editorBackBtn.addEventListener("click", function () {
      stopDrawMapMode();
      editorMode = false;
      if (editorReturnBtn) editorReturnBtn.classList.remove("show");
      showPanel("menu");
    });

    editorClearBtn.addEventListener("click", function () {
      customMapCells = [];
      saveLocal("snake_custom_map", customMapCells);
      selectedMapId = "";
      if (mapNameInput) mapNameInput.value = "";
      if (mapCodeBox) mapCodeBox.value = "";
      if (mapSelect && savedMaps.length) mapSelect.value = selectedMapId;
    });

    editorStartBtn.addEventListener("click", function () {
      campaignMode = false;
      stopDrawMapMode();
      if (editorReturnBtn) editorReturnBtn.classList.remove("show");
      startNewRun(true);
    });

    statusPrimaryBtn.addEventListener("click", function () {
      if (phase === "dead" || phase === "won") {
        startNewRun(false);
        return;
      }

      if (paused) {
        paused = false;
        hideOverlay();
        restartTickingIfNeeded();
        return;
      }

      if (phase === "menu" || phase === "countdown") {
        startNewRun(false);
      }
    });

    statusSecondaryBtn.addEventListener("click", function () {
      stopTimers();
      paused = false;
      restartGame();
      showPanel("menu");
    });

    if (newMatchBtn) {
      newMatchBtn.addEventListener("click", function () {
        resetMultiplayerMatch();
        startNewRun(false);
        setNewMatchButtonVisible(false);
      });
    }

    pauseBtn.addEventListener("click", togglePause);
    restartBtn.addEventListener("click", function () {
      restartGame();
    });

    fullscreenBtn.addEventListener("click", requestFullscreen);
    shareBtn.addEventListener("click", exportShareCode);
    moreBtn.addEventListener("click", openDrawer);
    closeDrawerBtn.addEventListener("click", closeDrawer);

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", openMobileGameMenu);
    }

    if (mobilePauseBtn) {
      mobilePauseBtn.addEventListener("click", openMobileGameMenu);
    }

    if (mobileQuickRestartBtn) {
      mobileQuickRestartBtn.addEventListener("click", function () {
        paused = false;
        restartGame();
      });
    }

    if (mobileResumeBtn) {
      mobileResumeBtn.addEventListener("click", resumeFromMobileMenu);
    }

    if (mobileRestartBtn) {
      mobileRestartBtn.addEventListener("click", function () {
        paused = false;
        restartGame();
      });
    }

    if (mobileSettingsBtn) {
      mobileSettingsBtn.addEventListener("click", function () {
        syncMobileControls();
        showPanel("mobileSettings");
      });
    }

    if (mobileSettingsBackBtn) {
      mobileSettingsBackBtn.addEventListener("click", function () {
        showPanel("mobileMenu");
      });
    }

    if (mobileSettingsResumeBtn) {
      mobileSettingsResumeBtn.addEventListener("click", resumeFromMobileMenu);
    }

    if (mobileRunInfoBtn) {
      mobileRunInfoBtn.addEventListener("click", function () {
        syncMobileHud();
        showPanel("mobileRunInfo");
      });
    }

    if (mobileRunBackBtn) {
      mobileRunBackBtn.addEventListener("click", function () {
        showPanel("mobileMenu");
      });
    }

    if (mobileModesBtn) {
      mobileModesBtn.addEventListener("click", function () {
        showPanel("menu");
      });
    }

    if (mobileMissionsBtn) {
      mobileMissionsBtn.addEventListener("click", function () {
        showPanel("missions");
      });
    }

    if (mobileCampaignBtn) {
      mobileCampaignBtn.addEventListener("click", function () {
        showPanel("campaign");
      });
    }

    if (mobileHelpBtn) {
      mobileHelpBtn.addEventListener("click", function () {
        showPanel("help");
      });
    }

    if (mobileMoreBtn) {
      mobileMoreBtn.addEventListener("click", function () {
        openDrawer();
      });
    }

    if (mobileThemeSelect) {
      mobileThemeSelect.addEventListener("change", function () {
        mirrorSelectChange(mobileThemeSelect, themeSelect);
        syncMobileControls();
      });
    }

    if (mobileDifficultySelect) {
      mobileDifficultySelect.addEventListener("change", function () {
        mirrorSelectChange(mobileDifficultySelect, difficultySelect);
        syncMobileControls();
      });
    }

    if (mobileBoardSelect) {
      mobileBoardSelect.addEventListener("change", function () {
        mirrorSelectChange(mobileBoardSelect, boardSelect);
        syncMobileControls();
      });
    }

    if (mobileSlotSelect) {
      mobileSlotSelect.addEventListener("change", function () {
        mirrorSelectChange(mobileSlotSelect, slotSelect);
        syncMobileControls();
      });
    }

    if (mobileObstaclesBtn) {
      mobileObstaclesBtn.addEventListener("click", function () {
        if (obstacleToggle) obstacleToggle.click();
        syncMobileControls();
        syncMobileHud();
      });
    }

    if (mobileDailyBtn) {
      mobileDailyBtn.addEventListener("click", function () {
        if (dailyToggle) dailyToggle.click();
        syncMobileControls();
        syncMobileHud();
      });
    }

    if (mobileAutopilotBtn) {
      mobileAutopilotBtn.addEventListener("click", function () {
        if (aiToggle) aiToggle.click();
        syncMobileControls();
        syncMobileHud();
      });
    }

    if (mobileControlsBtn) {
      mobileControlsBtn.addEventListener("click", function () {
        showStatus(
          "Controls",
          "Use swipe gestures on the board or the on-screen arrow buttons at the bottom.",
          "OK",
          "Menu"
        );
      });
    }

    if (mobileDpadUp) {
      mobileDpadUp.addEventListener("click", function () {
        handleDirection("UP");
      });
    }

    if (mobileDpadDown) {
      mobileDpadDown.addEventListener("click", function () {
        handleDirection("DOWN");
      });
    }

    if (mobileDpadLeft) {
      mobileDpadLeft.addEventListener("click", function () {
        handleDirection("LEFT");
      });
    }

    if (mobileDpadRight) {
      mobileDpadRight.addEventListener("click", function () {
        handleDirection("RIGHT");
      });
    }

    quickMissionsBtn.addEventListener("click", function () {
      openDrawer();
      showPanel("missions");
    });

    quickCampaignBtn.addEventListener("click", function () {
      openDrawer();
      showPanel("campaign");
    });

    quickHelpBtn.addEventListener("click", function () {
      openDrawer();
      showPanel("help");
    });

    document.addEventListener("keydown", function (event) {
      var target = event.target;
      var tag = target && target.tagName ? target.tagName.toLowerCase() : "";
      var isTypingField =
        tag === "input" ||
        tag === "textarea" ||
        target.isContentEditable;

      if (isTypingField) return;

      if (replayPlayback) {
        event.preventDefault();
        return;
      }

      if (isMultiplayerMode()) {
        if (event.key === "w" || event.key === "W") {
          event.preventDefault();
          handleDirection("UP");
          return;
        }

        if (event.key === "s" || event.key === "S") {
          event.preventDefault();
          handleDirection("DOWN");
          return;
        }

        if (event.key === "a" || event.key === "A") {
          event.preventDefault();
          handleDirection("LEFT");
          return;
        }

        if (event.key === "d" || event.key === "D") {
          event.preventDefault();
          handleDirection("RIGHT");
          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          handlePlayer2Direction("UP");
          return;
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          handlePlayer2Direction("DOWN");
          return;
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          handlePlayer2Direction("LEFT");
          return;
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          handlePlayer2Direction("RIGHT");
          return;
        }
      }

      var direction = mapKeyToDirection(event.key);

      if (direction) {
        event.preventDefault();
        handleDirection(direction);
        return;
      }

      if (event.key === " ") {
        event.preventDefault();
        togglePause();
        return;
      }

      if (event.key === "Enter" && (phase === "dead" || phase === "won")) {
        event.preventDefault();
        startNewRun(false);
        return;
      }

      if (event.key === "PageUp" || event.key === "]") {
        event.preventDefault();
        cycleTheme(1);
        return;
      }

      if (event.key === "PageDown" || event.key === "[") {
        event.preventDefault();
        cycleTheme(-1);
        return;
      }

      if (event.key === "f" || event.key === "F") {
        event.preventDefault();
        requestFullscreen();
      }
    });

    canvas.addEventListener("mousedown", function (event) {
      if (!editorMode || !isDrawingMap) return;

      var cell = findEditorCellFromMouse(event);
      if (!cell) return;

      editorPointerDown = true;
      editorHoverCell = cell;
      applyEditorToolAtCell(cell);
    });

    canvas.addEventListener("mousemove", function (event) {
      if (!editorMode || !isDrawingMap) return;

      var cell = findEditorCellFromMouse(event);
      editorHoverCell = cell;

      if (editorPointerDown) {
        applyEditorToolAtCell(cell);
      }
    });

    window.addEventListener("mouseup", function () {
      editorPointerDown = false;
      editorLastPaintedKey = "";
    });

    canvas.addEventListener("mouseleave", function () {
      editorHoverCell = null;
      if (!editorPointerDown) {
        editorLastPaintedKey = "";
      }
    });

    canvas.addEventListener("touchstart", function (event) {
      if (!event.touches || !event.touches.length) return;

      var touch = event.touches[0];
      swipeStart = { x: touch.clientX, y: touch.clientY };

      if (editorMode && isDrawingMap) {
        event.preventDefault();

        var cell = findEditorCellFromTouch(touch.clientX, touch.clientY);

        if (!cell) return;

        editorPointerDown = true;
        editorHoverCell = cell;
        applyEditorToolAtCell(cell);
        return;
      }

      if (phase === "playing" && !paused && !aiEnabled) {
        event.preventDefault();

        var rect = canvas.getBoundingClientRect();
        var localX = touch.clientX - rect.left;
        var localY = touch.clientY - rect.top;

        var isInsideCanvas =
          localX >= 0 &&
          localX <= rect.width &&
          localY >= 0 &&
          localY <= rect.height;

        if (isInsideCanvas) {
          if (localX < rect.width / 2) {
            handleDirection("LEFT");
          } else {
            handleDirection("RIGHT");
          }
        }
      }
    }, { passive: false });

    canvas.addEventListener("touchmove", function (event) {
      if (!event.touches || !event.touches.length) return;

      if (editorMode && isDrawingMap) {
        event.preventDefault();

        var touch = event.touches[0];
        var cell = findEditorCellFromTouch(touch.clientX, touch.clientY);

        editorHoverCell = cell;

        if (editorPointerDown) {
          applyEditorToolAtCell(cell);
        }

        return;
      }

      if (phase === "playing" && !paused) {
        event.preventDefault();
      }
    }, { passive: false });

    canvas.addEventListener("touchend", function (event) {
      if (editorMode && isDrawingMap) {
        event.preventDefault();

        editorPointerDown = false;
        editorLastPaintedKey = "";
        editorHoverCell = null;
        swipeStart = null;
        return;
      }

      if (!swipeStart || !event.changedTouches || !event.changedTouches.length) return;

      var touch = event.changedTouches[0];
      var dx = touch.clientX - swipeStart.x;
      var dy = touch.clientY - swipeStart.y;
      var absX = Math.abs(dx);
      var absY = Math.abs(dy);

      if (Math.max(absX, absY) > 24) {
        event.preventDefault();

        if (absX > absY) {
          handleDirection(dx > 0 ? "RIGHT" : "LEFT");
        } else {
          handleDirection(dy > 0 ? "DOWN" : "UP");
        }
      }

      swipeStart = null;
    }, { passive: false });

    Array.prototype.forEach.call(document.querySelectorAll(".dpad [data-dir]"), function (button) {
      button.addEventListener("click", function () {
        handleDirection(button.getAttribute("data-dir"));
      });
    });

    window.addEventListener("resize", resizeCanvas);

    if (shareCodeBox) {
      shareCodeBox.addEventListener("blur", function () {
        var value = shareCodeBox.value.trim();
        if (!value) return;

        try {
          atob(value);
        } catch (e) {
          return;
        }

        importShareCode(value);
      });
    }
  }

  // ---------------------------------------------------------------------------
  // SHARE CODE
  // ---------------------------------------------------------------------------

  function exportShareCode() {
    var payload = {
      slot: activeSlot,
      settings: settings,
      bestScore: bestScore,
      achievementsState: achievementsState,
      missionState: missionState,
      leaderboard: leaderboard,
      customMapCells: customMapCells
    };

    var encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    shareCodeBox.value = encoded;
    openDrawer();

    if (shareCodeBox.select) shareCodeBox.select();

    try {
      navigator.clipboard.writeText(encoded).then(function () {
        showStatus("Share Code", "Code copied to clipboard.", "OK", "Menu");
      }).catch(function () {
        showStatus("Share Code", "Code generated. Copy it from the box.", "OK", "Menu");
      });
    } catch (e) {
      showStatus("Share Code", "Code generated. Copy it from the box.", "OK", "Menu");
    }
  }

  function importShareCode(code) {
    try {
      var parsed = JSON.parse(decodeURIComponent(escape(atob(code))));

      if (parsed.settings) settings = parsed.settings;
      if (typeof parsed.bestScore === "number") bestScore = parsed.bestScore;
      if (parsed.achievementsState) achievementsState = parsed.achievementsState;
      if (parsed.missionState) missionState = parsed.missionState;
      if (Array.isArray(parsed.leaderboard)) leaderboard = parsed.leaderboard;
      if (Array.isArray(parsed.customMapCells)) customMapCells = parsed.customMapCells;

      saveSlotSettings();
      saveLocal("snake_achievements", achievementsState);
      saveLocal("snake_missions", missionState);
      saveLocal("snake_leaderboard", leaderboard);
      saveLocal("snake_custom_map", customMapCells);

      syncSettingsUi();
      syncSkinUnlocks();
      applyTheme();
      renderAchievements();
      renderLeaderboard();
      renderMissions();
      renderCampaign();
      updateHud();
      updateSkinHint();
      restartGame();
      showStatus("Imported", "Save data imported successfully.", "Play", "Menu");
    } catch (e) {
      showStatus("Import Failed", "That share code is invalid.", "OK", "Menu");
    }
  }

  // ---------------------------------------------------------------------------
  // SPRITES
  // ---------------------------------------------------------------------------

  function createSpriteManager() {
    var sources = {
      normal: "./sprites/apple.png",
      golden: "./sprites/golden.png",
      cherry: "./sprites/cherry.png",
      poison: "./sprites/poison.png",
      ghost: "./sprites/ghost.png",
      fire: "./sprites/fire.png",
      ice: "./sprites/ice.png",
      snakeHead: "./sprites/snake-head.png",
      snakeBody: "./sprites/snake-body.png",
      wall: "./sprites/wall.png",
      hazard: "./sprites/hazard.png",
      boss: "./sprites/boss.png"
    };

    var items = {};

    Object.keys(sources).forEach(function (key) {
      var image = new Image();
      var entry = { image: image, loaded: false, failed: false };

      image.onload = function () {
        entry.loaded = true;
      };

      image.onerror = function () {
        entry.failed = true;
      };

      image.src = sources[key];
      items[key] = entry;
    });

    return {
      get: function (key) {
        return items[key] || null;
      }
    };
  }

  function drawImageOrFallback(sprite, x, y, w, h, fallback) {
    if (sprite && sprite.loaded && sprite.image) {
      ctx.drawImage(sprite.image, x, y, w, h);
      return;
    }
    fallback();
  }

  // ---------------------------------------------------------------------------
  // DRAW HELPERS
  // ---------------------------------------------------------------------------

  function getFoodSpriteKey(foodType) {
    if (foodType === "golden") return "golden";
    if (foodType === "cherry") return "cherry";
    if (foodType === "ice") return "ice";
    if (foodType === "fire") return "fire";
    if (foodType === "ghost") return "ghost";
    if (foodType === "poison") return "poison";
    return "normal";
  }

  function drawFoodFallback(food, cell) {
    var x = food.x * cell;
    var y = food.y * cell;
    var cx = x + cell / 2;
    var cy = y + cell / 2;

    ctx.save();

    if (food.type === "golden") {
      ctx.shadowColor = "rgba(255,211,106,0.5)";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#ffd36a";
      ctx.beginPath();
      ctx.arc(cx, cy, cell * 0.24, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    if (food.type === "cherry") {
      ctx.fillStyle = "#ff4f7b";
      ctx.beginPath();
      ctx.arc(cx - cell * 0.08, cy + cell * 0.02, cell * 0.14, 0, Math.PI * 2);
      ctx.arc(cx + cell * 0.08, cy + cell * 0.02, cell * 0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    if (food.type === "poison") {
      ctx.shadowColor = "rgba(140,80,255,0.35)";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#8c50ff";
      ctx.beginPath();
      ctx.arc(cx, cy, cell * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold " + Math.max(10, cell * 0.34) + "px Inter, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("!", cx, cy + 1);
      ctx.restore();
      return;
    }

    if (food.type === "ghost") {
      ctx.shadowColor = "rgba(220,240,255,0.45)";
      ctx.shadowBlur = 16;
      ctx.fillStyle = "rgba(220,240,255,0.9)";
      ctx.beginPath();
      ctx.arc(cx, cy - cell * 0.06, cell * 0.18, Math.PI, 0);
      ctx.lineTo(cx + cell * 0.18, cy + cell * 0.16);
      ctx.lineTo(cx + cell * 0.08, cy + cell * 0.1);
      ctx.lineTo(cx, cy + cell * 0.16);
      ctx.lineTo(cx - cell * 0.08, cy + cell * 0.1);
      ctx.lineTo(cx - cell * 0.18, cy + cell * 0.16);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }

    if (food.type === "fire") {
      ctx.shadowColor = "rgba(255,122,40,0.45)";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#ff7a28";
      ctx.beginPath();
      ctx.moveTo(cx, cy - cell * 0.22);
      ctx.quadraticCurveTo(cx + cell * 0.18, cy - cell * 0.04, cx, cy + cell * 0.22);
      ctx.quadraticCurveTo(cx - cell * 0.18, cy - cell * 0.04, cx, cy - cell * 0.22);
      ctx.fill();
      ctx.restore();
      return;
    }

    if (food.type === "ice") {
      ctx.shadowColor = "rgba(170,240,255,0.45)";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#bdf4ff";
      ctx.beginPath();
      ctx.moveTo(cx, cy - cell * 0.22);
      ctx.lineTo(cx + cell * 0.14, cy);
      ctx.lineTo(cx, cy + cell * 0.22);
      ctx.lineTo(cx - cell * 0.14, cy);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.shadowColor = "rgba(255,92,92,0.38)";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "#ff5c5c";
    ctx.beginPath();
    ctx.arc(cx, cy, cell * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawSnakeBodyFallback(x, y, cell, depth) {
    var cx = x + cell / 2;
    var cy = y + cell / 2;
    var shrink = depth * 0.018;
    var outerInset = cell * (0.1 + shrink);
    var outerSize = cell * (0.8 - shrink * 2.2);
    var innerInset = cell * (0.2 + shrink * 0.9);
    var innerSize = cell * (0.6 - shrink * 1.7);

    ctx.save();
    ctx.shadowColor = activeTheme.headGlow;
    ctx.shadowBlur = Math.max(6, 14 - depth * 0.7);
    ctx.globalAlpha = Math.max(0.62, 1 - depth * 0.035);

    ctx.fillStyle = activeTheme.snakeOuter;
    ctx.beginPath();
    ctx.roundRect(x + outerInset, y + outerInset, outerSize, outerSize, Math.max(6, cell * (0.24 - shrink * 0.2)));
    ctx.fill();

    var innerGradient = ctx.createLinearGradient(x, y, x + cell, y + cell);
    innerGradient.addColorStop(0, activeTheme.snakeInner);
    innerGradient.addColorStop(1, activeTheme.snakeOuter);
    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.roundRect(x + innerInset, y + innerInset, innerSize, innerSize, Math.max(4, cell * (0.18 - shrink * 0.15)));
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.beginPath();
    ctx.arc(cx - cell * 0.08, cy - cell * 0.08, Math.max(2, cell * (0.05 - shrink * 0.1)), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawSnakeHeadFallback(x, y, cell) {
    var cx = x + cell / 2;
    var cy = y + cell / 2;

    ctx.save();
    ctx.shadowColor = activeTheme.headGlow;
    ctx.shadowBlur = 30;
    ctx.fillStyle = activeTheme.snakeOuter;
    ctx.beginPath();
    ctx.roundRect(x + cell * 0.07, y + cell * 0.07, cell * 0.86, cell * 0.86, cell * 0.28);
    ctx.fill();

    var innerGradient = ctx.createLinearGradient(x, y, x + cell, y + cell);
    innerGradient.addColorStop(0, "#ffffff");
    innerGradient.addColorStop(0.25, activeTheme.snakeInner);
    innerGradient.addColorStop(1, activeTheme.snakeOuter);
    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.roundRect(x + cell * 0.17, y + cell * 0.17, cell * 0.66, cell * 0.66, cell * 0.22);
    ctx.fill();

    ctx.fillStyle = activeTheme.snakeDark;
    ctx.beginPath();
    ctx.arc(cx - cell * 0.12, cy - cell * 0.08, cell * 0.05, 0, Math.PI * 2);
    ctx.arc(cx + cell * 0.12, cy - cell * 0.08, cell * 0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath();
    ctx.arc(cx - cell * 0.11, cy - cell * 0.14, cell * 0.045, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawStoneFallback(x, y, cell) {
    ctx.save();
    var gradient = ctx.createLinearGradient(x, y, x + cell, y + cell);
    gradient.addColorStop(0, "#8994a9");
    gradient.addColorStop(1, "#4b5568");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x + cell * 0.08, y + cell * 0.08, cell * 0.84, cell * 0.84, cell * 0.18);
    ctx.fill();
    ctx.restore();
  }

  function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getRenderSnake() {
    var progress = 1;

    if (phase === "playing" && !paused && state.alive) {
      var raw = (performance.now() - lastStepAt) / getTickSpeed();
      progress = clamp(raw, 0, 1);
    }
  
    var current = state.snake || [];
    var previous = previousSnake || [];

    if (!current.length) return [];

    var maxLen = Math.max(previous.length, current.length);
    var renderSnake = [];

    for (var i = 0; i < maxLen; i += 1) {
      var curr = current[i] || current[current.length - 1];
      var prev = previous[i] || previous[previous.length - 1] || curr;

      var lag = i === 0 ? 0 : Math.min(0.22, i * 0.045);
      var segmentProgress = clamp(progress - lag, 0, 1);
      var eased = easeInOutSine(segmentProgress);

      renderSnake.push({
        x: prev.x + (curr.x - prev.x) * eased,
        y: prev.y + (curr.y - prev.y) * eased,
        depth: i
      });
    }

    return renderSnake;
  }

  function getRenderPlayer2Snake() {
    if (!player2 || !player2.snake || !player2.snake.length) return [];

    var progress = 1;

    if (phase === "playing" && !paused && player2.alive) {
      var raw = (performance.now() - lastStepAt) / getTickSpeed();
      progress = clamp(raw, 0, 1);
    }

    var current = player2.snake || [];
    var previous = player2PreviousSnake || [];

    var maxLen = Math.max(previous.length, current.length);
    var renderSnake = [];

    for (var i = 0; i < maxLen; i += 1) {
      var curr = current[i] || current[current.length - 1];
      var prev = previous[i] || previous[previous.length - 1] || curr;

      var lag = i === 0 ? 0 : Math.min(0.18, i * 0.035);
      var segmentProgress = clamp(progress - lag, 0, 1);
      var eased = easeInOutSine(segmentProgress);

      renderSnake.push({
        x: prev.x + (curr.x - prev.x) * eased,
        y: prev.y + (curr.y - prev.y) * eased,
        depth: i
      });
    }

    return renderSnake;
  }

  function drawBackgroundGlow(cell) {
    var time = pulse * 0.4;
    var zones = [
      { x: state.cols * 0.22 + Math.sin(time) * 1.2, y: state.rows * 0.22 + Math.cos(time * 0.8) * 1.1, r: 3.5 },
      { x: state.cols * 0.72 + Math.cos(time * 0.9) * 1.3, y: state.rows * 0.33 + Math.sin(time) * 1.0, r: 2.9 },
      { x: state.cols * 0.5 + Math.sin(time * 0.7) * 1.6, y: state.rows * 0.77 + Math.cos(time * 0.85) * 1.2, r: 3.2 }
    ];

    zones.forEach(function (z) {
      var cx = z.x * cell;
      var cy = z.y * cell;
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, z.r * cell);
      g.addColorStop(0, activeTheme.boardGlow);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, z.r * cell, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawGrid(cell) {
    ctx.strokeStyle = "rgba(140, 180, 235, 0.09)";
    ctx.lineWidth = 1;

    for (var x = 0; x <= state.cols; x += 1) {
      ctx.beginPath();
      ctx.moveTo(x * cell, 0);
      ctx.lineTo(x * cell, canvas.height);
      ctx.stroke();
    }
        for (var y = 0; y <= state.rows; y += 1) {
      ctx.beginPath();
      ctx.moveTo(0, y * cell);
      ctx.lineTo(canvas.width, y * cell);
      ctx.stroke();
    }
  }

  function drawObstacles(cell) {
    var wallSprite = sprites.get("wall");
    (state.obstacles || []).forEach(function (o) {
      var x = o.x * cell;
      var y = o.y * cell;
      drawImageOrFallback(
        wallSprite,
        x + cell * 0.04,
        y + cell * 0.04,
        cell * 0.92,
        cell * 0.92,
        function () { drawStoneFallback(x, y, cell); }
      );
    });
  }

  function drawMovingHazards(cell) {
    var hazardSprite = sprites.get("hazard");
    var now = performance.now();
    var pulseAmount = Math.sin(now / 75) * 0.5 + 0.5;

    (state.movingHazards || []).forEach(function (h, index) {
      var x = h.x * cell;
      var y = h.y * cell;
      var cx = x + cell / 2;
      var cy = y + cell / 2;

      var glowSize = cell * (1.25 + pulseAmount * 0.45);
      var coreScale = 0.72 + pulseAmount * 0.2;

      ctx.save();

      // Outer danger aura
      var aura = ctx.createRadialGradient(cx, cy, cell * 0.1, cx, cy, glowSize);
      aura.addColorStop(0, "rgba(255, 40, 40, 0.52)");
      aura.addColorStop(0.45, "rgba(255, 40, 40, 0.22)");
      aura.addColorStop(1, "rgba(255, 40, 40, 0)");

      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Rotating warning diamond outline
      ctx.translate(cx, cy);
      ctx.rotate((now / 420) + index);
      ctx.strokeStyle = "rgba(255, 70, 70, " + (0.45 + pulseAmount * 0.35) + ")";
      ctx.lineWidth = Math.max(2, cell * 0.08);
      ctx.beginPath();
      ctx.moveTo(0, -cell * 0.42);
      ctx.lineTo(cell * 0.42, 0);
      ctx.lineTo(0, cell * 0.42);
      ctx.lineTo(-cell * 0.42, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      ctx.save();

      // Strong sprite/fallback glow
      ctx.shadowColor = "rgba(255, 20, 20, " + (0.65 + pulseAmount * 0.35) + ")";
      ctx.shadowBlur = 24 + pulseAmount * 36;

      drawImageOrFallback(
        hazardSprite,
        x + cell * (1 - coreScale) / 2,
        y + cell * (1 - coreScale) / 2,
        cell * coreScale,
        cell * coreScale,
        function () {
          ctx.fillStyle = "rgba(255, 55, 55, 0.95)";
          ctx.beginPath();
          ctx.moveTo(cx, cy - cell * 0.32);
          ctx.lineTo(cx + cell * 0.32, cy);
          ctx.lineTo(cx, cy + cell * 0.32);
          ctx.lineTo(cx - cell * 0.32, cy);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
          ctx.fillRect(cx - cell * 0.035, cy - cell * 0.16, cell * 0.07, cell * 0.2);
          ctx.beginPath();
          ctx.arc(cx, cy + cell * 0.13, cell * 0.04, 0, Math.PI * 2);
          ctx.fill();
        }
      );

      ctx.restore();
    });
  }

  function drawHazardWarningBorder() {
    if (!state || !state.snake || !state.snake.length) return;
    if (!state.movingHazards || !state.movingHazards.length) return;

    var head = state.snake[0];
    var dangerNearby = state.movingHazards.some(function (hazard) {
      var dx = Math.abs(hazard.x - head.x);
      var dy = Math.abs(hazard.y - head.y);
      return dx <= 2 && dy <= 2;
    });

    if (!dangerNearby) return;

    var pulseAmount = Math.sin(performance.now() / 120) * 0.5 + 0.5;

    ctx.save();
    ctx.strokeStyle = "rgba(255, 70, 70, " + (0.22 + pulseAmount * 0.22) + ")";
    ctx.lineWidth = 4 + pulseAmount * 2;
    ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
    ctx.restore();
  }

  function drawTimedHazards(cell) {
    if (!state.timedHazards || !state.timedHazards.length) return;

    var now = performance.now();

    state.timedHazards.forEach(function (tile) {
      var x = tile.x * cell;
      var y = tile.y * cell;
      var phase = tile.phaseIndex;
      var pulseAmount = Math.sin(now / 110 + tile.x + tile.y) * 0.5 + 0.5;

      ctx.save();

      if (phase === 0) {
        // Early warning: soft boss telegraph
        ctx.fillStyle = "rgba(255, 190, 40, " + (0.18 + pulseAmount * 0.16) + ")";
        ctx.strokeStyle = "rgba(255, 210, 70, " + (0.42 + pulseAmount * 0.24) + ")";
        ctx.shadowColor = "rgba(255, 190, 40, 0.35)";
        ctx.shadowBlur = 8 + pulseAmount * 8;
        ctx.lineWidth = 2;
      } else if (phase === 1) {
        // Final warning: stronger blink
        var blink = Math.floor(now / 100) % 2 === 0;
        ctx.fillStyle = blink
          ? "rgba(255, 215, 65, 0.58)"
          : "rgba(255, 150, 35, 0.22)";
        ctx.strokeStyle = "rgba(255, 235, 120, 0.85)";
        ctx.shadowColor = "rgba(255, 210, 60, 0.65)";
        ctx.shadowBlur = 12 + pulseAmount * 12;
        ctx.lineWidth = 3;
      } else {
        // Active danger
        ctx.fillStyle = "rgba(255, 45, 45, " + (0.58 + pulseAmount * 0.18) + ")";
        ctx.strokeStyle = "rgba(255, 95, 95, 0.95)";
        ctx.shadowColor = "rgba(255, 35, 35, 0.95)";
        ctx.shadowBlur = 20 + pulseAmount * 18;
        ctx.lineWidth = 3;
      }

      ctx.beginPath();
      ctx.roundRect(
        x + cell * 0.08,
        y + cell * 0.08,
        cell * 0.84,
        cell * 0.84,
        cell * 0.18
      );
      ctx.fill();
      ctx.stroke();

      // Small inner warning mark
      if (phase < 2) {
        ctx.globalAlpha = 0.35 + pulseAmount * 0.35;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + cell / 2, y + cell / 2, cell * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  function drawBoss(cell) {
    if (!state.boss) return;

    var boss = state.boss;

    var x = boss.x * cell;
    var y = boss.y * cell;
    var cx = x + cell / 2;
    var cy = y + cell / 2;

    var now = performance.now();
    var pulse = Math.sin(now / 120) * 0.5 + 0.5;
    var isDash = boss.mode === "dash";

    var auraRadius = isDash
      ? cell * (1.8 + pulse * 0.55)
      : cell * (1.4 + pulse * 0.4);

    ctx.save();

    // 🔴 Outer aura
    var gradient = ctx.createRadialGradient(cx, cy, cell * 0.1, cx, cy, auraRadius);

    if (isDash) {
      gradient.addColorStop(0, "rgba(255, 120, 40, 0.75)");
      gradient.addColorStop(0.45, "rgba(255, 30, 30, 0.34)");
      gradient.addColorStop(1, "rgba(255, 0, 0, 0)");
    } else {
      gradient.addColorStop(0, "rgba(255, 60, 60, 0.6)");
      gradient.addColorStop(0.5, "rgba(255, 40, 40, 0.25)");
      gradient.addColorStop(1, "rgba(255, 0, 0, 0)");
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    // ⚡ Dash trail
    if (isDash && boss.dashDir) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = "rgba(255, 120, 40, 0.35)";
      ctx.shadowColor = "rgba(255, 80, 40, 0.9)";
      ctx.shadowBlur = 22;

      var trailX = -boss.dashDir.x * cell * 0.65;
      var trailY = -boss.dashDir.y * cell * 0.65;

      ctx.beginPath();
      ctx.ellipse(
        cx + trailX,
        cy + trailY,
        boss.dashDir.x !== 0 ? cell * 0.8 : cell * 0.35,
        boss.dashDir.y !== 0 ? cell * 0.8 : cell * 0.35,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    }

    // 🔁 Rotating ring
    ctx.translate(cx, cy);
    ctx.rotate(isDash ? now / 220 : now / 500);

    ctx.strokeStyle = isDash
      ? "rgba(255, 180, 80, 0.95)"
      : "rgba(255, 80, 80, 0.8)";
    ctx.lineWidth = Math.max(2, cell * (isDash ? 0.11 : 0.08));

    ctx.beginPath();
    ctx.arc(0, 0, cell * (isDash ? 0.72 : 0.6), 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    ctx.save();

    // 🔥 Core glow
    ctx.shadowColor = isDash
      ? "rgba(255, 120, 20, 1)"
      : "rgba(255, 0, 0, 0.9)";
    ctx.shadowBlur = isDash
      ? 38 + pulse * 34
      : 25 + pulse * 25;

    ctx.fillStyle = isDash
      ? "rgba(255, 90, 30, 0.98)"
      : "rgba(255, 50, 50, 0.95)";

    ctx.beginPath();
    ctx.arc(cx, cy, cell * (isDash ? 0.44 + pulse * 0.12 : 0.35 + pulse * 0.1), 0, Math.PI * 2);
    ctx.fill();

    // ⚪ Inner highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.beginPath();
    ctx.arc(cx - cell * 0.08, cy - cell * 0.08, cell * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Dash warning slash
    if (isDash) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
      ctx.lineWidth = Math.max(2, cell * 0.06);
      ctx.beginPath();
      ctx.moveTo(cx - cell * 0.22, cy + cell * 0.18);
      ctx.lineTo(cx + cell * 0.22, cy - cell * 0.18);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawEditorCells(cell) {
    if (!editorMode) return;

    var wallSprite = sprites.get("wall");
    customMapCells.forEach(function (c) {
      var x = c.x * cell;
      var y = c.y * cell;
      drawImageOrFallback(
        wallSprite,
        x + cell * 0.04,
        y + cell * 0.04,
        cell * 0.92,
        cell * 0.92,
        function () { drawStoneFallback(x, y, cell); }
      );
    });
  }

  function drawAppleTrail(cell) {
    appleTrail.forEach(function (trail) {
      var cx = trail.x * cell + cell / 2;
      var cy = trail.y * cell + cell / 2;
      ctx.save();
      ctx.globalAlpha = trail.life * 0.22;
      ctx.shadowColor = activeTheme.snakeOuter;
      ctx.shadowBlur = 12;
      ctx.fillStyle = activeTheme.snakeOuter;
      ctx.beginPath();
      ctx.arc(cx, cy, cell * 0.18 * trail.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawParticles(cell) {
    particles.forEach(function (p) {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x * cell, p.y * cell, p.size * cell, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawScorePopups(cell) {
    scorePopups.forEach(function (popup) {
      ctx.save();
      ctx.globalAlpha = popup.life;
      ctx.fillStyle = activeTheme.scorePopup;
      ctx.font = "bold " + Math.max(14, cell * 0.45) + "px Inter, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(popup.text, popup.x * cell, popup.y * cell);
      ctx.restore();
    });
  }

  function drawFood(food, cell) {
    if (!food) return;

    var sprite = sprites.get(getFoodSpriteKey(food.type));
    var x = food.x * cell;
    var y = food.y * cell;

    drawImageOrFallback(
      sprite,
      x + cell * 0.08,
      y + cell * 0.08,
      cell * 0.84,
      cell * 0.84,
      function () { drawFoodFallback(food, cell); }
    );
  }

  function drawSnake(cell) {
    var snake = getRenderSnake();
    if (!snake.length) return;

    var headSprite = sprites.get("snakeHead");
    var bodySprite = sprites.get("snakeBody");
    var now = performance.now();
    var headPulse = Math.sin(now / 180) * 0.5 + 0.5;

    snake.forEach(function (segment, index) {
      var x = segment.x * cell;
      var y = segment.y * cell;

      if (index === 0) {
        var cx = x + cell / 2;
        var cy = y + cell / 2;
        var auraRadius = cell * (0.68 + headPulse * 0.18);

        ctx.save();
        ctx.globalAlpha = 0.18 + headPulse * 0.16;
        ctx.shadowColor = activeTheme.headGlow;
        ctx.shadowBlur = 18 + headPulse * 18;
        ctx.fillStyle = activeTheme.snakeOuter;
        ctx.beginPath();
        ctx.arc(cx, cy, auraRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        drawImageOrFallback(
          headSprite,
          x + cell * 0.02,
          y + cell * 0.02,
          cell * 0.96,
          cell * 0.96,
          function () { drawSnakeHeadFallback(x, y, cell); }
        );
      } else {
        drawImageOrFallback(
          bodySprite,
          x + cell * 0.06,
          y + cell * 0.06,
          cell * 0.88,
          cell * 0.88,
          function () { drawSnakeBodyFallback(x, y, cell, segment.depth || index); }
        );
      }
    });
  }

  function drawPlayer2Snake(cell) {
    if (!isMultiplayerMode() || !player2 || !player2.snake.length) return;

    var snake = getRenderPlayer2Snake();
    if (!snake.length) return;

    var headSprite = sprites.get("snakeHead");
    var bodySprite = sprites.get("snakeBody");

    var p2PaletteMap = {
      emerald: { main: "#eaff8f", glow: "rgba(220, 255, 120, 0.9)" },
      neon: { main: "#ff6ee7", glow: "rgba(255, 110, 231, 0.9)" },
      gold: { main: "#fff3a0", glow: "rgba(255, 240, 140, 0.9)" },
      shadow: { main: "#c9d2ff", glow: "rgba(190, 205, 255, 0.85)" },
      frost: { main: "#ffffff", glow: "rgba(240, 255, 255, 0.95)" },
      inferno: { main: "#ff2b2b", glow: "rgba(255, 45, 25, 0.95)" },
      void: { main: "#ff75d8", glow: "rgba(255, 117, 216, 0.95)" },
      crystal: { main: "#ffd6ff", glow: "rgba(255, 214, 255, 0.95)" }
    };

    var p2 = p2PaletteMap[settings.theme] || p2PaletteMap.emerald;

    var now = performance.now();
    var pulseAmount = Math.sin(now / 180) * 0.5 + 0.5;

    snake.forEach(function (segment, index) {
      var x = segment.x * cell;
      var y = segment.y * cell;

      if (index === 0) {
        var cx = x + cell / 2;
        var cy = y + cell / 2;

        // Strong Player 2 aura
        ctx.save();
        ctx.globalAlpha = 0.28 + pulseAmount * 0.22;
        ctx.shadowColor = p2.glow;
        ctx.shadowBlur = 22 + pulseAmount * 22;
        ctx.fillStyle = p2.main;
        ctx.beginPath();
        ctx.arc(cx, cy, cell * (0.75 + pulseAmount * 0.18), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Same snake head style as Player 1
        drawImageOrFallback(
          headSprite,
          x + cell * 0.02,
          y + cell * 0.02,
          cell * 0.96,
          cell * 0.96,
          function () { drawSnakeHeadFallback(x, y, cell); }
        );

        // Strong color tint over Player 2 head
        ctx.save();
        ctx.globalAlpha = 0.42;
        ctx.fillStyle = p2.main;
        ctx.shadowColor = p2.glow;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(
          x + cell * 0.08,
          y + cell * 0.08,
          cell * 0.84,
          cell * 0.84,
          cell * 0.24
        );
        ctx.fill();

        // Player 2 badge mark
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + cell * 0.72, y + cell * 0.28, cell * 0.11, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = p2.main;
        ctx.lineWidth = Math.max(1, cell * 0.045);
        ctx.beginPath();
        ctx.arc(x + cell * 0.72, y + cell * 0.28, cell * 0.16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else {
        // Same body/tail style as Player 1
        drawImageOrFallback(
          bodySprite,
          x + cell * 0.06,
          y + cell * 0.06,
          cell * 0.88,
          cell * 0.88,
          function () { drawSnakeBodyFallback(x, y, cell, segment.depth || index); }
        );

        // Strong Player 2 body tint
        ctx.save();
        ctx.globalAlpha = 0.36;
        ctx.fillStyle = p2.main;
        ctx.shadowColor = p2.glow;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(
          x + cell * 0.10,
          y + cell * 0.10,
          cell * 0.80,
          cell * 0.80,
          cell * 0.18
        );
        ctx.fill();
        ctx.restore();
      }
    });
  }
 
  function renderEditorOverlay(cell) {
    var x;
    var y;
    var hx;
    var hy;
    var pad;

    if (!editorMode || !isDrawingMap) return;

    for (y = 0; y < settings.boardSize; y += 1) {
      for (x = 0; x < settings.boardSize; x += 1) {
        if (!isProtectedEditorCell(x, y)) continue;

        ctx.save();
        ctx.fillStyle = "rgba(255, 90, 90, 0.08)";
        ctx.fillRect(x * cell, y * cell, cell, cell);

        ctx.strokeStyle = "rgba(255, 110, 110, 0.18)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
        ctx.restore();
      }
    }

    if (editorHoverCell) {
      hx = editorHoverCell.x;
      hy = editorHoverCell.y;

      ctx.save();

      if (isProtectedEditorCell(hx, hy)) {
        ctx.fillStyle = "rgba(255, 80, 80, 0.28)";
        ctx.strokeStyle = "rgba(255, 130, 130, 0.6)";
      } else if (editorTool === "draw") {
        ctx.fillStyle = "rgba(110, 255, 170, 0.24)";
        ctx.strokeStyle = "rgba(110, 255, 170, 0.75)";
      } else {
        ctx.fillStyle = "rgba(255, 120, 120, 0.20)";
        ctx.strokeStyle = "rgba(255, 120, 120, 0.72)";
      }

      ctx.fillRect(hx * cell, hy * cell, cell, cell);
      ctx.lineWidth = 2;
      ctx.strokeRect(hx * cell + 1, hy * cell + 1, cell - 2, cell - 2);
      ctx.restore();
    }

    editorEffects = editorEffects.filter(function (effect) {
      effect.life -= 0.08;
      if (effect.life <= 0) return false;

      ctx.save();
      ctx.globalAlpha = Math.max(0, effect.life);

      if (effect.kind === "draw") {
        ctx.fillStyle = "rgba(120, 255, 180, 0.22)";
        ctx.strokeStyle = "rgba(120, 255, 180, 0.55)";
      } else {
        ctx.fillStyle = "rgba(255, 120, 120, 0.16)";
        ctx.strokeStyle = "rgba(255, 120, 120, 0.42)";
      }

      pad = (1 - effect.life) * 10;

      ctx.fillRect(
        effect.x * cell + pad / 2,
        effect.y * cell + pad / 2,
        cell - pad,
        cell - pad
      );

      ctx.strokeRect(
        effect.x * cell + pad / 2,
        effect.y * cell + pad / 2,
        cell - pad,
        cell - pad
      );

      ctx.restore();
      return true;
    });
  }

  function render() {
    var cell = canvas.width / state.cols;
    var shakeX = 0;
    var shakeY = 0;

    if (screenShake > 0) {
      shakeX = (Math.random() - 0.5) * screenShake;
      shakeY = (Math.random() - 0.5) * screenShake;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(shakeX, shakeY);

    ctx.fillStyle = activeTheme.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBackgroundGlow(cell);
    drawGrid(cell);

    if (editorMode && isDrawingMap) {
      drawEditorCells(cell);
      renderEditorOverlay(cell);
      ctx.restore();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      return;
    }

    drawObstacles(cell);
    drawMovingHazards(cell);
    drawHazardWarningBorder();
    drawTimedHazards(cell);
    drawBoss(cell);
    drawAppleTrail(cell);
    drawParticles(cell);
    drawFood(state.food, cell);
    drawSnake(cell);
    drawPlayer2Snake(cell);
    drawScorePopups(cell);

    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // ---------------------------------------------------------------------------
  // ANIMATION / CANVAS
  // ---------------------------------------------------------------------------

  function resizeCanvas() {
    var availableWidth = boardStage.clientWidth - 8;
    var availableHeight = boardStage.clientHeight - 8;
    var size = Math.floor(Math.min(availableWidth, availableHeight, 860));
    size = Math.max(280, size);
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
  }

  function animationLoop() {
    pulse += 0.09;
    eatFlash *= 0.9;
    screenShake *= 0.86;

    if (eatFlash < 0.01) eatFlash = 0;
    if (screenShake < 0.2) screenShake = 0;

    appleTrail = appleTrail.map(function (trail) {
      return { x: trail.x, y: trail.y, life: trail.life * 0.88 };
    }).filter(function (trail) {
      return trail.life > 0.05;
    });

    particles = particles.map(function (p) {
      return {
        x: p.x + p.vx,
        y: p.y + p.vy,
        vx: p.vx * 0.98,
        vy: p.vy * 0.98,
        life: p.life * 0.92,
        size: p.size,
        color: p.color
      };
    }).filter(function (p) {
      return p.life > 0.06;
    });

    scorePopups = scorePopups.map(function (popup) {
      return {
        x: popup.x,
        y: popup.y - 0.01,
        text: popup.text,
        life: popup.life * 0.94
      };
    }).filter(function (popup) {
      return popup.life > 0.05;
    });

    if (performance.now() - lastAppleTime > COMBO_WINDOW_MS && comboCount !== 1) {
      comboCount = 1;
      updateComboBadge();
    }

    pollGamepad();
    maybeExpirePowerUp();
    updatePowerupLabel();
    render();
    requestAnimationFrame(animationLoop);
  }

  // ---------------------------------------------------------------------------
  // INIT
  // ---------------------------------------------------------------------------

  function init() {
    previousSnake = cloneSnake(state.snake);

    syncSettingsUi();
    applyTheme();
    syncSkinUnlocks();
    renderAchievements();
    renderLeaderboard();
    renderMissions();
    renderCampaign();
    refreshMapSelect();
    updateHud();
    updateModeLabel();
    updatePowerupLabel();
    updateSkinHint();
    updateComboBadge();
    syncMultiplayerHud();
    syncEditorButtons();
    showPanel("menu");
    setReplayButtonVisible(hasSavedReplay());
    bindUi();
    resizeCanvas();
    animationLoop();
  }

  init();
})();