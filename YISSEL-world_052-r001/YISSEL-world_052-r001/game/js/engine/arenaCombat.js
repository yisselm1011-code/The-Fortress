// SHARED MELEE: arena, platformer and top-down adventure use this combat module.
// Movement mode still controls the player. Space stays jump in platformers; J strikes.
// Students edit level.combat and level.waves in pack.js, not this runtime state.
function createArenaCombat(level) {
  const state = {
    health: level.combat.playerHealth, wave: 0, enemies: [],
    cooldown: 0, attackTime: 0, attackBox: null, invulnerable: 0.8,
    waveDelay: 0, defeated: false, cleared: false
  };
  spawnArenaWave(level, state);
  return state;
}

function spawnArenaWave(level, state) {
  // Copy every enemy so damage never changes the student's original design.
  state.enemies = level.waves[state.wave].enemies.map(enemy => Object.assign({}, enemy, {hitStun:0}));
  state.invulnerable = Math.max(state.invulnerable, 0.8);
}

// The attack reaches in the direction the player last walked. It is not a projectile.
function arenaAttackBox(player, reach) {
  const cx = player.x + player.width / 2, cy = player.y + player.height / 2;
  if (player.facing === "left") return {x:cx-reach,y:player.y-6,width:reach,height:player.height+12};
  if (player.facing === "right") return {x:cx,y:player.y-6,width:reach,height:player.height+12};
  if (player.facing === "up") return {x:player.x-6,y:cy-reach,width:player.width+12,height:reach};
  return {x:player.x-6,y:cy,width:player.width+12,height:reach};
}

// A segment/rectangle test prevents melee damage through walls and locked doors.
function arenaWallBetween(player, enemy, walls) {
  const x = player.x + player.width / 2, y = player.y + player.height / 2;
  const dx = enemy.x + enemy.width / 2 - x, dy = enemy.y + enemy.height / 2 - y;
  return walls.some(wall => {
    let start = 0, end = 1;
    for (const [origin, delta, low, high] of [[x,dx,wall.x,wall.x+wall.width],[y,dy,wall.y,wall.y+wall.height]]) {
      if (delta === 0) { if (origin < low || origin > high) return false; }
      else {
        const a = (low-origin)/delta, b = (high-origin)/delta;
        start = Math.max(start, Math.min(a,b)); end = Math.min(end, Math.max(a,b));
        if (start > end) return false;
      }
    }
    return true;
  });
}

function updateArenaCombat(level, state, player, walls, seconds, attackPressed) {
  if (state.defeated || state.cleared) return;
  state.cooldown = Math.max(0, state.cooldown-seconds);
  state.attackTime = Math.max(0, state.attackTime-seconds);
  state.invulnerable = Math.max(0, state.invulnerable-seconds);
  if (state.waveDelay > 0) {
    state.waveDelay = Math.max(0, state.waveDelay-seconds);
    if (state.waveDelay === 0) { state.wave += 1; spawnArenaWave(level,state); }
    return;
  }
  // One press produces one strike. Holding the key never causes automatic damage.
  if (attackPressed && state.cooldown === 0) {
    state.cooldown = level.combat.attackCooldown;
    state.attackTime = 0.12;
    state.attackBox = arenaAttackBox(player, level.combat.attackReach);
    for (const enemy of state.enemies) {
      if (isColliding(state.attackBox,enemy) && !arenaWallBetween(player,enemy,walls)) {
        enemy.health -= level.combat.attackDamage;
        // A successful hit briefly interrupts contact damage, giving the player room to retreat.
        enemy.hitStun = 0.18;
      }
    }
    state.enemies = state.enemies.filter(enemy => enemy.health > 0);
  }
  // Enemies follow the player on one axis, sliding against walls. This is not maze AI.
  for (const enemy of state.enemies) {
    if(enemy.hitStun>0){enemy.hitStun=Math.max(0,enemy.hitStun-seconds);continue;}
    const dx = player.x+player.width/2 - (enemy.x+enemy.width/2);
    const dy = player.y+player.height/2 - (enemy.y+enemy.height/2);
    const step = enemy.speed * seconds;
    if((level.mode || "platformer") === "platformer"){
      // Ground guards walk horizontally, never fly toward a jumping player.
      // Check the leading foot so guards stop at ledges instead of floating over gaps.
      const move=Math.sign(dx)*Math.min(step,Math.abs(dx));
      const foot={x:move>=0?enemy.x+move+enemy.width-2:enemy.x+move,y:enemy.y+enemy.height,width:2,height:2};
      if(walls.some(w=>isColliding(foot,w)))moveWithCollision(enemy,move,0,walls);
    }else if (Math.abs(dx) > Math.abs(dy)) moveWithCollision(enemy,Math.sign(dx)*Math.min(step,Math.abs(dx)),0,walls);
    else moveWithCollision(enemy,0,Math.sign(dy)*Math.min(step,Math.abs(dy)),walls);
    enemy.x = Math.max(0,Math.min(level.width-enemy.width,enemy.x));
    enemy.y = Math.max(0,Math.min(level.height-enemy.height,enemy.y));
    // A grace period prevents several overlapping enemies from draining health instantly.
    if (state.invulnerable === 0 && isColliding(player,enemy)) {
      state.health = Math.max(0,state.health-enemy.damage);
      state.invulnerable = level.combat.invulnerabilitySeconds;
      if (state.health === 0) { state.defeated = true; return; }
    }
  }
  if (state.enemies.length === 0) {
    if (state.wave + 1 === level.waves.length) state.cleared = true;
    else state.waveDelay = 0.8;
  }
}

function drawArenaCombat(ctx, level, state, player) {
  ctx.save();
  ctx.font = "14px monospace"; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
  for (const enemy of state.enemies) {
    ctx.fillStyle = enemy.hitStun>0 ? "#fde047" : "#e87956";ctx.fillRect(enemy.x,enemy.y,enemy.width,enemy.height);
    ctx.fillStyle = "white";ctx.fillText("HP " + enemy.health,enemy.x,enemy.y-4);
  }
  if (state.attackTime > 0 && state.attackBox && !state.cleared && !state.defeated) {
    const box = state.attackBox;ctx.fillStyle = "rgba(253,224,71,0.55)";
    ctx.fillRect(box.x,box.y,box.width,box.height);
  }
  if (state.invulnerable > 0 && !state.defeated) {
    ctx.strokeStyle = "white";ctx.strokeRect(player.x-2,player.y-2,player.width+4,player.height+4);
  }
  // Keep the combat HUD below any collection objectives and clear of F1 debug text.
  const y = 16 + (level.objectives || []).length*26;
  const message = "HP " + state.health + "/" + level.combat.playerHealth + " | Wave " + (state.wave+1) + "/" + level.waves.length + " | Enemies " + state.enemies.length;
  ctx.fillStyle = "#101827";ctx.fillRect(420,y,528,54);
  ctx.fillStyle = "white";ctx.textBaseline = "top";ctx.fillText(message,430,y+5);
  ctx.fillText(state.defeated ? "Defeated: R to retry, Esc for home" : state.cleared ? "Enemies cleared! Finish tasks and reach exit." : state.waveDelay > 0 ? "Next wave incoming..." : ((level.mode || "platformer") === "platformer" ? "Tap J: strike | Space: jump | Face your target." : "Face a rival; tap J or Space to strike."),430,y+29);
  ctx.restore();
}
