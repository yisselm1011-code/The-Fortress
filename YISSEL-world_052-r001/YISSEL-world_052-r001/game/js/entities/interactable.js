// TEACHER-OWNED: objects the player can press E on (homes, NPCs, portals, etc.).
const INTERACTABLE_TYPES = {
  HOME_ENTRANCE: "homeEntrance",
  SIGN: "sign",
  NPC: "npc",
  PORTAL: "portal",
  EXIT: "exit",
  SAVE_POINT: "savePoint",
  SUBMIT_POINT: "submitPoint",
  COLORED_DOOR: "coloredDoor"
};

function getInteractionBox(player) {
  return {
    x: player.x - 4,
    y: player.y - 4,
    width: player.width + 8,
    height: player.height + 8
  };
}

function findClosestInteractable(player, interactables) {
  const box = getInteractionBox(player);
  let closest = null;
  let closestDistance = Infinity;

  for (let i = 0; i < interactables.length; i++) {
    const item = interactables[i];
    if (isColliding(box, item)) {
      const centerX = item.x + item.width / 2;
      const centerY = item.y + item.height / 2;
      const playerCenterX = player.x + player.width / 2;
      const playerCenterY = player.y + player.height / 2;
      const distance =
        Math.abs(centerX - playerCenterX) + Math.abs(centerY - playerCenterY);

      if (distance < closestDistance) {
        closestDistance = distance;
        closest = item;
      }
    }
  }

  return closest;
}
