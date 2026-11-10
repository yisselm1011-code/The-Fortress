// TEACHER-OWNED: rectangle overlap and wall sliding.
function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Horizontal and vertical movement are resolved separately so the player
// can slide along walls instead of getting stuck in corners.
function moveWithCollision(entity, dx, dy, solids) {
  if (!solids || solids.length === 0) {
    entity.x += dx;
    entity.y += dy;
    return;
  }

  entity.x += dx;
  for (let i = 0; i < solids.length; i++) {
    const solid = solids[i];
    if (isColliding(entity, solid)) {
      if (dx > 0) {
        entity.x = solid.x - entity.width;
      } else if (dx < 0) {
        entity.x = solid.x + solid.width;
      }
    }
  }

  entity.y += dy;
  for (let i = 0; i < solids.length; i++) {
    const solid = solids[i];
    if (isColliding(entity, solid)) {
      if (dy > 0) {
        entity.y = solid.y - entity.height;
      } else if (dy < 0) {
        entity.y = solid.y + solid.height;
      }
    }
  }
}

function drawCollisionBox(ctx, rect, camera) {
  if (!gameState.settings.showCollision) {
    return;
  }

  const camX = camera ? camera.x : 0;
  const camY = camera ? camera.y : 0;

  ctx.strokeStyle = "#ff4444";
  ctx.lineWidth = 1;
  ctx.strokeRect(rect.x - camX, rect.y - camY, rect.width, rect.height);
}
