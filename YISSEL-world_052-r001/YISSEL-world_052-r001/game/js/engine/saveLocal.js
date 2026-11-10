// TEACHER-OWNED: save progress in the browser (localStorage), one key per file slot.
const SAVE_SCHEMA_VERSION = 2;
// Standalone projects on the same website must not overwrite one another or the hub.
const SAVE_STORAGE_PREFIX = typeof window !== "undefined" && window.FVGD_STANDALONE
  ? "fvgd.standalone." + window.FVGD_STANDALONE.packId + ".slot."
  : "fvgd.save.slot.";

function slotStorageKey(slotIndex) {
  const slot = slotIndex || authState.activeSlot || 1;
  return SAVE_STORAGE_PREFIX + slot;
}

function defaultOverworldPosition() {
  return { x: 160, y: 160 };
}

function resetGameProgress() {
  gameState.visitedHomes = [];
  gameState.completedLevels = [];
  gameState.unlockedRewards = [];
  gameState.coins = 0;
  gameState.overworldPlayerPosition = defaultOverworldPosition();
  if (authState.displayName) {
    gameState.playerName = authState.displayName;
  }
}

function buildSavePayload() {
  return {
    schema_version: SAVE_SCHEMA_VERSION,
    visitedHomes: gameState.visitedHomes.slice(),
    completedLevels: gameState.completedLevels.slice(),
    unlockedRewards: gameState.unlockedRewards.slice(),
    coins: gameState.coins || 0,
    overworldPlayerPosition: {
      x: gameState.overworldPlayerPosition.x,
      y: gameState.overworldPlayerPosition.y
    },
    settings: {
      volume: gameState.settings.volume,
      debugMode: gameState.settings.debugMode,
      showCollision: gameState.settings.showCollision
    },
    playerName: gameState.playerName,
    updatedAt: new Date().toISOString()
  };
}

function applySavePayload(payload) {
  if (!payload) return false;
  gameState.visitedHomes = payload.visitedHomes || [];
  gameState.completedLevels = payload.completedLevels || [];
  gameState.unlockedRewards = payload.unlockedRewards || [];
  gameState.coins = typeof payload.coins === "number" ? payload.coins : 0;
  gameState.overworldPlayerPosition = payload.overworldPlayerPosition || defaultOverworldPosition();
  if (payload.settings) {
    gameState.settings.volume = payload.settings.volume ?? gameState.settings.volume;
    gameState.settings.debugMode = payload.settings.debugMode ?? gameState.settings.debugMode;
    gameState.settings.showCollision = payload.settings.showCollision ?? gameState.settings.showCollision;
  }
  if (payload.playerName) {
    gameState.playerName = payload.playerName;
  }
  return true;
}

function isOccupiedSave(payload) {
  if (!payload) {
    return false;
  }
  return (
    (payload.visitedHomes && payload.visitedHomes.length > 0) ||
    (payload.completedLevels && payload.completedLevels.length > 0) ||
    (payload.unlockedRewards && payload.unlockedRewards.length > 0) ||
    (payload.coins || 0) > 0
  );
}

function saveLocal() {
  try {
    localStorage.setItem(slotStorageKey(), JSON.stringify(buildSavePayload()));
    return true;
  } catch (err) {
    console.warn("saveLocal failed:", err);
    return false;
  }
}

function loadLocal(slotIndex) {
  try {
    const raw = localStorage.getItem(slotStorageKey(slotIndex));
    if (!raw) return false;
    return applySavePayload(JSON.parse(raw));
  } catch (err) {
    console.warn("loadLocal failed:", err);
    return false;
  }
}

function readLocalSlot(slotIndex) {
  try {
    const raw = localStorage.getItem(slotStorageKey(slotIndex));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function clearLocal(slotIndex) {
  localStorage.removeItem(slotStorageKey(slotIndex));
}

function saveGameProgress() {
  saveLocal();
  if (typeof saveCloud === "function") {
    saveCloud();
  }
}
