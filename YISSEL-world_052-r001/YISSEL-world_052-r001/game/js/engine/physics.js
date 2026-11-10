// TEACHER-OWNED: gravity and ground checks for platformer levels.
function applyGravity(entity, gravity, maxFallSpeed) {
  entity.vy += gravity;
  if (entity.vy > maxFallSpeed) {
    entity.vy = maxFallSpeed;
  }
}

function isOnGround(entity, solids) {
  const probe = {
    x: entity.x + 2,
    y: entity.y + entity.height,
    width: entity.width - 4,
    height: 2
  };
  for (let i = 0; i < solids.length; i++) {
    if (isColliding(probe, solids[i])) {
      return true;
    }
  }
  return false;
}
