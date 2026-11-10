// SHARED SHOOTER: opt in with level.shooter in a platformer or top-down pack.
// The pack is a design. This copied state is one attempt, so R never edits the design.
function createShooter(level) {
  return {health:level.shooter.playerHealth, cooldown:0, invulnerable:0.8,
    bullets:[], enemies:level.shooter.enemies.map(e=>Object.assign({},e,{cooldown:e.fireInterval})),
    defeated:false, cleared:false, aim:{x:1,y:0}};
}
function shooterCenter(rect) {return {x:rect.x+rect.width/2,y:rect.y+rect.height/2};}

// Swept collision: find WHEN a moving bullet first touches a rectangle (0..1).
// Expanding the rectangle by the bullet radius prevents fast shots skipping thin walls.
function shooterHitTime(x,y,dx,dy,rect,radius) {
  let first=0,last=1;
  for(const [origin,delta,low,high] of [[x,dx,rect.x-radius,rect.x+rect.width+radius],[y,dy,rect.y-radius,rect.y+rect.height+radius]]) {
    if(delta===0){if(origin<low||origin>high)return null;}
    else {const a=(low-origin)/delta,b=(high-origin)/delta;
      first=Math.max(first,Math.min(a,b));last=Math.min(last,Math.max(a,b));
      if(first>last)return null;
    }
  }
  return first;
}
function shooterDirection(player,controls) {
  let x=(controls.aimRight?1:0)-(controls.aimLeft?1:0);
  let y=(controls.aimDown?1:0)-(controls.aimUp?1:0);
  if(!x&&!y){const facing={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]}[player.facing];[x,y]=facing||[1,0];}
  const length=Math.hypot(x,y);return {x:x/length,y:y/length};
}
function shooterAddBullet(state,from,direction,speed,damage,lifetime,team) {
  // A hard limit plus lifetime/bounds cleanup prevents an endless buildup of objects.
  if(state.bullets.length>=128)return;
  state.bullets.push({x:from.x,y:from.y,vx:direction.x*speed,vy:direction.y*speed,
    radius:4,damage,life:lifetime,team});
}
function shooterDamage(level,state,damage) {
  if(state.invulnerable>0)return;
  state.health=Math.max(0,state.health-damage);state.invulnerable=level.shooter.invulnerabilitySeconds;
  if(state.health===0){state.defeated=true;state.bullets=[];}
}
function updateShooter(level,state,player,walls,seconds,controls) {
  if(state.defeated||state.cleared)return;
  const config=level.shooter;
  state.cooldown=Math.max(0,state.cooldown-seconds);
  state.invulnerable=Math.max(0,state.invulnerable-seconds);
  state.aim=shooterDirection(player,controls);
  const center=shooterCenter(player);
  // Hold F to fire at a controlled rate. Space remains jump in the platformer.
  if(controls.fire&&state.cooldown===0){
    shooterAddBullet(state,center,state.aim,config.bulletSpeed,config.damage,config.bulletLifetime,"player");
    state.cooldown=config.fireInterval;
  }
  for(const enemy of state.enemies){
    enemy.cooldown=Math.max(0,enemy.cooldown-seconds);
    const from=shooterCenter(enemy),dx=center.x-from.x,dy=center.y-from.y,length=Math.hypot(dx,dy);
    // Turrets aim at the current position ONCE per shot; bullets never home afterward.
    // Walls and closed doors block sight. The yellow outline warns of an imminent shot.
    if(enemy.cooldown===0&&length>0&&!walls.some(w=>shooterHitTime(from.x,from.y,dx,dy,w,4)!==null)){
      shooterAddBullet(state,from,{x:dx/length,y:dy/length},enemy.bulletSpeed,enemy.damage,config.bulletLifetime,"enemy");
      enemy.cooldown=enemy.fireInterval;
    }
    if(isColliding(player,enemy))shooterDamage(level,state,enemy.damage);
    if(state.defeated)return;
  }
  const remaining=[];
  for(const bullet of state.bullets){
    const step=Math.min(seconds,bullet.life),dx=bullet.vx*step,dy=bullet.vy*step;
    let nearest=Infinity,target=null;
    // Check walls first so a tie cannot damage someone through cover.
    for(const wall of walls){const t=shooterHitTime(bullet.x,bullet.y,dx,dy,wall,bullet.radius);if(t!==null&&t<nearest){nearest=t;target="wall";}}
    const targets=bullet.team==="player"?state.enemies.filter(e=>e.health>0):[player];
    for(const actor of targets){const t=shooterHitTime(bullet.x,bullet.y,dx,dy,actor,bullet.radius);if(t!==null&&t<nearest){nearest=t;target=actor;}}
    if(target){
      if(target!=="wall"){
        if(bullet.team==="player")target.health-=bullet.damage;
        else shooterDamage(level,state,bullet.damage);
      }
      if(state.defeated)return;
      continue; // One projectile hits at most one actor. No unintended piercing.
    }
    bullet.x+=dx;bullet.y+=dy;bullet.life-=seconds;
    if(bullet.life>0&&bullet.x>=0&&bullet.x<=level.width&&bullet.y>=0&&bullet.y<=level.height)remaining.push(bullet);
  }
  state.bullets=remaining;state.enemies=state.enemies.filter(e=>e.health>0);
  if(state.enemies.length===0){state.cleared=true;state.bullets=[];}
}
function drawShooter(ctx,level,state,player){
  ctx.save();ctx.font="14px monospace";ctx.textAlign="left";ctx.textBaseline="top";
  for(const e of state.enemies){
    ctx.fillStyle="#e87956";ctx.fillRect(e.x,e.y,e.width,e.height);
    if(e.cooldown<0.35){ctx.strokeStyle="#fde047";ctx.lineWidth=3;ctx.strokeRect(e.x-2,e.y-2,e.width+4,e.height+4);}
    ctx.fillStyle="white";ctx.fillText("HP "+e.health,e.x,e.y-20);
  }
  for(const b of state.bullets){ctx.fillStyle=b.team==="player"?"#67e8f9":"#fb7185";ctx.beginPath();ctx.arc(b.x,b.y,b.radius,0,Math.PI*2);ctx.fill();}
  if(!state.defeated){const c=shooterCenter(player);ctx.strokeStyle="#67e8f9";ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(c.x+state.aim.x*26,c.y+state.aim.y*26);ctx.stroke();}
  if(state.invulnerable>0&&!state.defeated){ctx.strokeStyle="white";ctx.strokeRect(player.x-2,player.y-2,player.width+4,player.height+4);}
  ctx.fillStyle="#101827";ctx.fillRect(360,12,590,76);ctx.fillStyle="white";
  ctx.fillText("HP "+state.health+"/"+level.shooter.playerHealth+" | Targets "+state.enemies.length,370,20);
  ctx.fillText("Hold F: fire | I J K L: aim | Move: WASD/arrows",370,43);
  ctx.fillText(state.defeated?"Defeated: R to retry, Esc for home":state.cleared?"Targets cleared! Finish tasks and reach gold exit.":"Cyan = your shots. Pink = enemy shots. Use cover.",370,65);
  ctx.restore();
}
