// TEACHER-OWNED: a one-player shooting challenge, not a full team-sports simulator.
// Students customize the hoop and challenge settings in pack.js.
function createSkillChallenge(level) {
  return {
    angle: level.challenge.startAngle, power: level.challenge.startPower,
    score: 0, shots: 0, remaining: level.challenge.timeLimit,
    started: false, won: false, expired: false, ball: null,
    message: "Set your angle and power, then tap Space."
  };
}

function sportsBackboard(level) {
  // The board is derived from the hoop, so students only move one target rectangle.
  return {x:level.goal.x+level.goal.width+14,y:level.goal.y-80,width:12,height:100};
}

function launchSportsBall(level, state) {
  const radians = state.angle * Math.PI / 180;
  state.ball = {x:level.spawn.x,y:level.spawn.y,
    vx:Math.cos(radians)*state.power,vy:-Math.sin(radians)*state.power};
  state.started = true;state.shots += 1;state.message = "Shot in flight...";
}

function updateSkillChallenge(level, state, seconds, controls) {
  if (state.won || state.expired) return;
  const config = level.challenge;
  if (!state.ball) {
    // One key press makes one adjustment. Settings stay fixed while a ball is flying.
    state.angle = Math.max(20,Math.min(80,state.angle + (controls.up ? 1 : 0) - (controls.down ? 1 : 0)));
    state.power = Math.max(300,Math.min(900,state.power + (controls.right ? 10 : 0) - (controls.left ? 10 : 0)));
    if (controls.shoot) launchSportsBall(level,state);
  }
  if (!state.started) return; // No time pressure while the player reads the instructions.
  // Small physics steps prevent a fast ball skipping the rim or backboard.
  // Exact constant-gravity integration keeps identical shots consistent across frame rates.
  let time = Math.min(Math.max(0,seconds),state.remaining);
  while (time > 0 && !state.won && !state.expired) {
    const dt = Math.min(time,1/120);
    state.remaining = Math.max(0,state.remaining-dt);time -= dt;
    if (state.ball) stepSportsBall(level,state,dt);
    // A basket at the buzzer counts: process its crossing before declaring time out.
    if (state.remaining <= 1e-9 && !state.won) {
      state.remaining = 0;state.expired = true;state.ball = null;
      state.message = "Time is up. Press R to try again.";
    }
  }
}

function stepSportsBall(level, state, dt) {
  const ball = state.ball, config = level.challenge, goal = level.goal;
  const radius = config.ballRadius, oldX = ball.x, oldY = ball.y;
  ball.x += ball.vx*dt;
  ball.y += ball.vy*dt + 0.5*config.gravity*dt*dt;
  ball.vy += config.gravity*dt;
  // A basket must cross the rim from ABOVE while descending; touching from below misses.
  if (oldY < goal.y && ball.y >= goal.y && ball.vy > 0) {
    const fraction = (goal.y-oldY)/(ball.y-oldY);
    const crossingX = oldX + (ball.x-oldX)*fraction;
    if (crossingX >= goal.x+radius && crossingX <= goal.x+goal.width-radius) {
      state.score += 1;state.ball = null;
      state.won = state.score >= config.targetScore;
      state.message = state.won ? "Target reached! Press Enter to finish." : "Basket! Set up your next shot.";
      return; // Removing the ball prevents a single shot from scoring twice.
    }
  }
  const board = sportsBackboard(level);
  if (ball.y+radius > board.y && ball.y-radius < board.y+board.height) {
    if (ball.vx > 0 && oldX+radius <= board.x && ball.x+radius >= board.x) {
      ball.x = board.x-radius;ball.vx *= -0.6;
    } else if (ball.vx < 0 && oldX-radius >= board.x+board.width && ball.x-radius <= board.x+board.width) {
      ball.x = board.x+board.width+radius;ball.vx *= -0.6;
    }
  }
  if (ball.y+radius >= config.floorY || ball.x+radius < 0 || ball.x-radius > level.width) {
    state.ball = null;state.message = "Miss. Adjust angle or power and try again.";
  }
}

function drawSkillChallenge(ctx, level, state) {
  const config = level.challenge, goal = level.goal, board = sportsBackboard(level);
  ctx.save();ctx.fillStyle = "#142139";ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "#986746";ctx.fillRect(0,config.floorY,level.width,level.height-config.floorY);
  // Hoop and net: only a downward crossing inside the rim scores.
  ctx.fillStyle = "#e2e8f0";ctx.fillRect(board.x,board.y,board.width,board.height);
  ctx.strokeStyle = "#e2e8f0";ctx.lineWidth = 2;
  ctx.beginPath();ctx.moveTo(goal.x,goal.y);ctx.lineTo(goal.x+18,goal.y+42);
  ctx.lineTo(goal.x+goal.width-18,goal.y+42);ctx.lineTo(goal.x+goal.width,goal.y);ctx.stroke();
  ctx.strokeStyle = "#fb923c";ctx.lineWidth = 5;
  ctx.beginPath();ctx.moveTo(goal.x,goal.y);ctx.lineTo(goal.x+goal.width,goal.y);ctx.stroke();
  // A dotted preview teaches how angle and power affect the arc. Board rebounds are not previewed.
  if (!state.ball && !state.won && !state.expired) {
    const a = state.angle*Math.PI/180;ctx.fillStyle = "#94a3b8";
    for (let t=0;t<3;t+=0.12) {
      const x=level.spawn.x+Math.cos(a)*state.power*t;
      const y=level.spawn.y-Math.sin(a)*state.power*t+0.5*config.gravity*t*t;
      if (x>level.width || y>config.floorY) break;
      if (y>120) {ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill();}
    }
  }
  // The shooter stays at a fixed station. This prototype focuses on shooting skill.
  ctx.fillStyle = "#60a5fa";ctx.fillRect(level.spawn.x-24,level.spawn.y+18,26,config.floorY-level.spawn.y-18);
  ctx.beginPath();ctx.arc(level.spawn.x-10,level.spawn.y+6,13,0,Math.PI*2);ctx.fill();
  const ball = state.ball || (!state.won && !state.expired ? level.spawn : null);
  if (ball) {ctx.fillStyle = "#fb923c";ctx.beginPath();ctx.arc(ball.x,ball.y,config.ballRadius,0,Math.PI*2);ctx.fill();}
  // Keep instructions on the right, clear of the optional teacher debug overlay.
  ctx.fillStyle = "#0b1323";ctx.fillRect(350,12,598,112);
  ctx.fillStyle = "white";ctx.font = "17px monospace";ctx.textAlign = "left";ctx.textBaseline = "top";
  ctx.fillText("Score " + state.score + "/" + config.targetScore + " | Time " + Math.ceil(state.remaining) + "s | Shots " + state.shots,364,24);
  ctx.fillText("Angle " + state.angle + " degrees | Power " + state.power,364,50);
  ctx.font = "14px monospace";ctx.fillText("Up/Down: angle | Left/Right: power | Space: shoot",364,76);
  ctx.fillText(state.message,364,100);
  ctx.restore();
  drawInteractionPrompt(ctx, state.won ? "Enter: finish | R: retry | Esc: home" : "R: retry | Esc: home");
}
