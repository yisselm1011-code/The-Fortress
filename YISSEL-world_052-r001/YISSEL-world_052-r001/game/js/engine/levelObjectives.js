// TEACHER-OWNED: temporary progress for ONE attempt at a level.
// Students edit collectibles, objectives and doors in their own pack.js.
// Never change the pack itself during play: restart must restore every item.
function createLevelProgress() {
  return { collected: new Set(), interacted: new Set(), dialogue: null };
}

function collectLevelItems(level, progress, player) {
  for (const item of level.collectibles || []) {
    if (!progress.collected.has(item.id) && (!item.revealBy || progress.interacted.has(item.revealBy)) && isColliding(player, item)) {
      progress.collected.add(item.id);
    }
  }
}

// Objectives can require collected items, completed interactions, or both.
// Every listed ID is required; absent lists preserve older collection-only packs.
// IDs are local to this level, so two students can both name an item "key".
function isObjectiveComplete(level, progress, objectiveId) {
  const objective = (level.objectives || []).find(function (item) {
    return item.id === objectiveId;
  });
  return !!objective && (objective.collect || []).every(id => progress.collected.has(id)) &&
    (objective.interact || []).every(id => progress.interacted.has(id));
}

// Doors and the goal use the same rule. No requirements means always open.
// This default preserves packs created before objectives were introduced.
function areLevelRequirementsMet(level, progress, requirements) {
  return (requirements || []).every(function (id) {
    return isObjectiveComplete(level, progress, id);
  });
}

function getClosedLevelDoors(level, progress) {
  return (level.doors || []).filter(function (door) {
    return !areLevelRequirementsMet(level, progress, door.requires);
  });
}

// The HUD names the task and shows progress, so color is not the only clue.
function drawLevelObjectives(ctx, level, progress) {
  ctx.save();
  ctx.font = "16px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  (level.objectives || []).forEach(function (objective, index) {
    const found = (objective.collect || []).filter(id => progress.collected.has(id)).length +
      (objective.interact || []).filter(id => progress.interacted.has(id)).length;
    const total = (objective.collect || []).length + (objective.interact || []).length;
    const message = objective.label + ": " + found + "/" + total;
    // Keep tasks on the right so F1's teacher debug panel cannot cover them.
    const width = Math.min(610, ctx.measureText(message).width + 16);
    const left = canvas.width - width - 12;
    ctx.fillStyle = "#101827";
    ctx.fillRect(left, 12 + index * 26, width, 24);
    ctx.fillStyle = "white";
    ctx.fillText(message, left + 8, 16 + index * 26, width - 16);
  });
  ctx.restore();
}
