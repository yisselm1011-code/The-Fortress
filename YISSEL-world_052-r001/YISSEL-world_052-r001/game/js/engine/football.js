// JACENTO'S FOOTBALL: a ball-carrying drill, with independent state for each attempt.
// Students tune level.football in their pack. Positions are centers; speeds are pixels/second.
function createFootball(level){
 const c=level.football;
 const state={touchdowns:0,attempt:1,remaining:c.seconds,phase:"ready",won:false,expired:false};
 footballResetPlay(level,state);return state;
}
function footballResetPlay(level,state){
 // Copy design data so retry and replay never change the student's saved pack.
 state.player={x:level.spawn.x,y:level.spawn.y};state.stamina=level.football.sprintSeconds;
 state.defenders=level.football.defenders.map(d=>({x:d.x,y:d.y,homeX:d.x,direction:d.direction||1}));
 state.message="Enter starts the play. Carry the ball into the right end zone.";
}
function footballCircleHits(p,r,box){
 const x=Math.max(box.x,Math.min(p.x,box.x+box.width)),y=Math.max(box.y,Math.min(p.y,box.y+box.height));
 return Math.hypot(p.x-x,p.y-y)<r;
}
function footballMove(level,p,dx,dy,r){
 // Move one axis at a time: hitting a training barrier lets you slide along its edge.
 // Small simulation steps prevent fast players or defenders from skipping through barriers.
 const oldX=p.x;p.x=Math.max(60+r,Math.min(900-r,p.x+dx));
 if(level.solids.some(b=>footballCircleHits(p,r,b)))p.x=oldX;
 const oldY=p.y;p.y=Math.max(150+r,Math.min(580-r,p.y+dy));
 if(level.solids.some(b=>footballCircleHits(p,r,b)))p.y=oldY;
}
function footballFinishPlay(level,state,touchdown){
 if(touchdown)state.touchdowns++;
 state.won=state.touchdowns>=level.football.targetTouchdowns;
 state.phase=state.won?"won":state.attempt>=level.football.attempts?"lost":"between";
 state.message=state.won?"Challenge won! Enter saves your result.":
  state.phase==="lost"?"Attempts used. R retries the whole challenge.":
  touchdown?"TOUCHDOWN! Enter sets up the next play.":"Tackled! Change your route. Enter starts a new play.";
}
function updateFootball(level,state,seconds,controls){
 if(state.won||state.expired||state.phase==="lost")return;
 const c=level.football;
 // Enter explicitly starts each play. Reading the instructions never spends clock time.
 if(state.phase==="ready"||state.phase==="between"){
  if(!controls.start)return;
  if(state.phase==="between"){state.attempt++;footballResetPlay(level,state);}
  state.phase="running";state.message="Find a gap. Hold Space while moving to sprint.";
 }
 let time=Math.min(Math.max(0,seconds),state.remaining);
 while(time>1e-9&&state.phase==="running"){
  const dt=Math.min(time,1/120);time-=dt;state.remaining=Math.max(0,state.remaining-dt);
  const p=state.player,x=(controls.right?1:0)-(controls.left?1:0),y=(controls.down?1:0)-(controls.up?1:0),length=Math.hypot(x,y);
  // Sprint uses an energy budget. Once empty, release Space to recover before sprinting again.
  const sprint=controls.sprint&&length>0&&state.stamina>0;
  const sprintTime=sprint?Math.min(dt,state.stamina):0;
  const distance=c.playerSpeed*dt+(c.sprintSpeed-c.playerSpeed)*sprintTime;
  if(sprint)state.stamina=Math.max(0,state.stamina-dt);
  else if(!controls.sprint)state.stamina=Math.min(c.sprintSeconds,state.stamina+c.recovery*dt);
  if(length)footballMove(level,p,x/length*distance,y/length*distance,14);
  for(const d of state.defenders){
   // Defenders patrol a lane, then pursue nearby runners at a slower speed.
   // They see current position only, never teleport, and obey the same barriers.
   const dx=p.x-d.x,dy=p.y-d.y,range=Math.hypot(dx,dy);
   if(range<c.noticeRadius&&range>0)footballMove(level,d,dx/range*c.defenderSpeed*dt,dy/range*c.defenderSpeed*dt,14);
   else{
    footballMove(level,d,Math.sign(d.homeX-d.x)*Math.min(Math.abs(d.homeX-d.x),c.defenderSpeed*dt),d.direction*c.defenderSpeed*0.65*dt,14);
    if(d.y<=170)d.direction=1;if(d.y>=560)d.direction=-1;
   }
  }
  // A tackle wins ties with a touchdown. Reach the goal with your entire player circle.
  if(state.defenders.some(d=>Math.hypot(p.x-d.x,p.y-d.y)<=28)){footballFinishPlay(level,state,false);}
  else if(p.x-14>=level.goal.x){footballFinishPlay(level,state,true);}
  // A completed winning run at the buzzer counts; every other unfinished challenge expires.
  if(state.remaining<=1e-9&&!state.won){state.remaining=0;state.expired=true;state.phase="lost";state.message="Time is up. R retries; Escape returns home.";}
 }
}
function drawFootball(ctx,level,state){
 const c=level.football;ctx.save();ctx.fillStyle="#102b28";ctx.fillRect(0,0,960,640);
 ctx.fillStyle="#287347";ctx.fillRect(60,150,840,430);
 ctx.fillStyle="#164e63";ctx.fillRect(level.goal.x,150,900-level.goal.x,430);
 ctx.strokeStyle="#e6f5df";ctx.lineWidth=2;ctx.strokeRect(60,150,840,430);
 ctx.font="14px monospace";ctx.textAlign="center";
 for(let x=140;x<810;x+=84){ctx.beginPath();ctx.moveTo(x,150);ctx.lineTo(x,580);ctx.stroke();ctx.fillStyle="#d9eddb";ctx.fillText(String(Math.round((x-60)/8.4)),x,170);}
 ctx.save();ctx.translate(866,365);ctx.rotate(-Math.PI/2);ctx.font="24px monospace";ctx.fillStyle="white";ctx.fillText("END ZONE",0,0);ctx.restore();
 // Orange striped pads are solid training obstacles, not collectible objects.
 for(const b of level.solids){ctx.fillStyle="#c66a18";ctx.fillRect(b.x,b.y,b.width,b.height);ctx.strokeStyle="#ffe5a0";ctx.strokeRect(b.x,b.y,b.width,b.height);}
 function player(p,color,label){ctx.fillStyle=color;ctx.beginPath();ctx.arc(p.x,p.y,14,0,Math.PI*2);ctx.fill();ctx.strokeStyle="white";ctx.stroke();ctx.fillStyle="white";ctx.font="12px monospace";ctx.fillText(label,p.x,p.y-22);}
 state.defenders.forEach((d,i)=>player(d,"#e85d75",String(i+1)));
 player(state.player,"#60a5fa","YOU");
 // The football stays in the runner's hands: this drill has no throwing or loose-ball rules.
 ctx.fillStyle="#9a572c";ctx.beginPath();ctx.ellipse(state.player.x+12,state.player.y,9,5,0.5,0,Math.PI*2);ctx.fill();ctx.strokeStyle="white";ctx.beginPath();ctx.moveTo(state.player.x+8,state.player.y);ctx.lineTo(state.player.x+16,state.player.y);ctx.stroke();
 ctx.fillStyle="#101827";ctx.fillRect(0,0,960,132);ctx.fillStyle="white";ctx.textAlign="left";ctx.font="21px monospace";
 ctx.fillText("CENTO'S ISLAND | TD "+state.touchdowns+"/"+c.targetTouchdowns+" | Play "+state.attempt+"/"+c.attempts+" | "+Math.ceil(state.remaining)+"s",22,29);
 ctx.font="14px monospace";ctx.fillText("WASD/arrows: run | Hold Space: sprint | Enter: start/next play | R: retry | Esc: home",22,56);
 ctx.fillText("Sprint",22,81);ctx.fillStyle="#334155";ctx.fillRect(85,69,150,14);ctx.fillStyle="#5eead4";ctx.fillRect(85,69,150*state.stamina/c.sprintSeconds,14);
 ctx.fillStyle="white";ctx.fillText("Score: "+state.touchdowns*6,260,81);ctx.fillText(state.message,22,110);
 ctx.fillText("Avoid red defenders and orange pads. Clock pauses between plays; retry resets everything.",22,615);ctx.restore();
}
