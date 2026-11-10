// CHASE / SURVIVAL: optional level.pursuit module for platformer or top-down movement.
// Copy design data into attempt state: R resets enemies, the clock, and stun cooldown.
function createPursuit(level){return {enemies:level.pursuit.enemies.map(e=>Object.assign({},e,{memory:0,target:null,stunned:0})),remaining:level.pursuit.seconds,cooldown:0,flash:0,grace:1,hiding:false,defeated:false,reason:""};}
function pursuitHidden(level,player,hold){
  // Hide only when the WHOLE player is inside a marked refuge. No midair hiding.
  if(!hold||((level.mode||"platformer")==="platformer"&&!player.onGround))return false;
  return level.pursuit.hidingSpots.some(z=>player.x>=z.x&&player.y>=z.y&&player.x+player.width<=z.x+z.width&&player.y+player.height<=z.y+z.height);
}
function pursuitDistance(a,b){return Math.hypot(a.x+a.width/2-b.x-b.width/2,a.y+a.height/2-b.y-b.height/2);}
function updatePursuit(level,state,player,walls,seconds,controls){
  if(state.defeated)return;
  const c=level.pursuit;
  state.remaining=Math.max(0,state.remaining-seconds);state.cooldown=Math.max(0,state.cooldown-seconds);
  state.flash=Math.max(0,state.flash-seconds);state.grace=Math.max(0,state.grace-seconds);
  state.hiding=pursuitHidden(level,player,controls.hide);
  if(controls.stun&&state.cooldown===0){
    // You can flash from a refuge before releasing H, avoiding a frame-perfect escape.
    // A flash cannot pass through cover. Pressing Q spends the cooldown even on a miss.
    state.cooldown=c.stunCooldown;state.flash=0.25;
    for(const e of state.enemies)if(pursuitDistance(player,e)<=c.stunRadius&&!arenaWallBetween(player,e,walls)){
      e.stunned=c.stunSeconds;e.memory=0;e.target=null;
    }
  }
  for(const e of state.enemies){
    if(e.stunned>0){e.stunned=Math.max(0,e.stunned-seconds);continue;}
    const sees=!state.hiding&&pursuitDistance(player,e)<=e.noticeRadius&&!arenaWallBetween(player,e,walls);
    if(sees){e.target={x:player.x,y:player.y};e.memory=c.memorySeconds;}
    else e.memory=Math.max(0,e.memory-seconds);
    if(e.memory===0)e.target=null;
    if(e.target){
      const dx=e.target.x-e.x,dy=e.target.y-e.y,step=e.speed*seconds;
      if((level.mode||"platformer")==="platformer"){
        // Ground pursuers stop at walls and ledges; they do not fly or auto-jump gaps.
        const move=Math.sign(dx)*Math.min(step,Math.abs(dx));
        const probe={x:e.x+move,y:e.y,width:e.width,height:e.height};
        // Check the leading foot, not just any overlap beneath the body.
        const foot={x:move>=0?probe.x+probe.width-2:probe.x,y:probe.y+probe.height,width:2,height:2};
        if(walls.some(w=>isColliding(foot,w)))moveWithCollision(e,move,0,walls);
      }else{
        // Simple line-of-sight pursuit with wall sliding, not full maze pathfinding.
        const distance=Math.hypot(dx,dy);
        if(distance){const travel=Math.min(step,distance);moveWithCollision(e,dx/distance*travel,0,walls);moveWithCollision(e,0,dy/distance*travel,walls);}
      }
      e.x=Math.max(0,Math.min(level.width-e.width,e.x));e.y=Math.max(0,Math.min(level.height-e.height,e.y));
    }
    // Hiding keeps the player safe while holding H, even if a pursuer reaches the refuge.
    if(!state.hiding&&state.grace===0&&isColliding(player,e)){state.defeated=true;state.reason="Caught! R to retry, Esc for home.";return;}
  }
  if(state.remaining===0){state.defeated=true;state.reason="Time expired. R to retry, Esc for home.";}
}
function drawPursuit(ctx,level,state,player){
  ctx.save();ctx.textAlign="left";ctx.textBaseline="top";ctx.font="14px monospace";
  for(const z of level.pursuit.hidingSpots){ctx.fillStyle="rgba(52,211,153,0.2)";ctx.fillRect(z.x,z.y,z.width,z.height);ctx.strokeStyle="#34d399";ctx.strokeRect(z.x,z.y,z.width,z.height);ctx.fillStyle="white";ctx.fillText("Hold H: hide",z.x,z.y-20);}
  for(const e of state.enemies){ctx.fillStyle=e.stunned>0?"#a78bfa":e.target?"#fb7185":"#f59e0b";ctx.fillRect(e.x,e.y,e.width,e.height);ctx.fillStyle="white";ctx.fillText(e.stunned>0?"Stunned":e.target?"Chasing":"Watching",e.x,e.y-20);}
  if(state.flash>0){ctx.strokeStyle="#fef08a";ctx.lineWidth=3;ctx.beginPath();ctx.arc(player.x+player.width/2,player.y+player.height/2,level.pursuit.stunRadius,0,Math.PI*2);ctx.stroke();}
  ctx.fillStyle="#101827";ctx.fillRect(360,12,590,76);ctx.fillStyle="white";
  ctx.fillText("Escape: "+Math.ceil(state.remaining)+"s | Flash: "+(state.cooldown>0?Math.ceil(state.cooldown)+"s":"READY"),370,20);
  ctx.fillText("Q: stun nearby threat | Hold H inside green refuge",370,43);
  ctx.fillText(state.defeated?state.reason:state.hiding?"Hidden. The escape clock keeps running!":"Collect the key, avoid pursuit, reach the gold exit.",370,65);ctx.restore();
}
