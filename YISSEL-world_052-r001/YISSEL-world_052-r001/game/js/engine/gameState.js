// TEACHER-OWNED: progress that survives scene changes (visited homes, rewards, coins, position).
const gameState = {
  currentScene: "title",
  playerName: "",
  visitedHomes: [],
  completedLevels: [],
  unlockedRewards: [],
  coins: 0,
  settings: {
    volume: 0.8,
    debugMode: true,
    showCollision: false,
    showPackReport: false
  },
  overworldPlayerPosition: {
    x: 160,
    y: 160
  }
};

const LEVEL_COMPLETE_COINS = 10;

function markHomeVisited(homeId) {
  if (!isHomeVisited(homeId)) {
    gameState.visitedHomes.push(homeId);
  }
}

function isHomeVisited(homeId) {
  return gameState.visitedHomes.includes(homeId);
}

function markLevelCompleted(levelId) {
  if (!isLevelCompleted(levelId)) {
    gameState.completedLevels.push(levelId);
  }
}

function isLevelCompleted(levelId) {
  return gameState.completedLevels.includes(levelId);
}

function unlockReward(rewardId) {
  if (!hasReward(rewardId)) {
    gameState.unlockedRewards.push(rewardId);
  }
}

function hasReward(rewardId) {
  return gameState.unlockedRewards.includes(rewardId);
}

function awardLevelCoins() {
  gameState.coins = (gameState.coins || 0) + LEVEL_COMPLETE_COINS;
}
