// DORRIES'S RANCH: a timed, top-down calf-catching starter.
// Students edit level.ranch in pack.js. Centers and ranges are pixels; speeds use seconds.
function createRanch(level){
 const c=level.ranch;
 return {player:{x:level.spawn.x,y:level.spawn.y},calves:c.calves.map(calf=>{
   const angle=calf.heading*Math.PI/180;
   return {id:calf.id,x:calf.x,y:calf.y,dx:Math.cos(angle),dy:Math.sin(angle),caught:false};
  }),caught:0,throws:0,cooldown:0,remaining:c.seconds,started:false,won:false,expired:false,
  rope:null,message:"Enter starts. Move close, then tap Space when a calf glows green."};
}
function ranchNearest(level,state){
 // A single tap targets only the nearest uncaught calf whose CENTER is in the circle.
 // Ties follow pack order, so the same input always has the same result.
 let nearest=null,distance=level.ranch.catchRange;
 for(const calf of state.calves){
  const d=Math.hypot(calf.x-state.player.x,calf.y-state.player.y);
  if(!calf.caught&&d<=distance&&(!nearest||d<distance)){nearest=calf;distance=d;}
 }
 return nearest;
}
function ranchCatch(level,state){
 if(!state.started||state.won||state.expired||state.remaining<=0||state.cooldown>0)return;
 const calf=ranchNearest(level,state);state.throws++;state.cooldown=level.ranch.catchCooldown;
 // Capturing moves a calf to the illustrated safe pen, never damages it. No manual delivery needed.
 state.rope={x:calf?calf.x:state.player.x+level.ranch.catchRange,y:calf?calf.y:state.player.y,remaining:0.22,success:!!calf};
 if(!calf){state.message="Miss! Get a calf's center inside the circle, then tap Space again.";return;}
 calf.caught=true;state.caught++;state.won=state.caught>=level.ranch.targetCatches;
 state.message=state.won?"Calves safe! Enter saves your win.":"Caught! Find the next calf. Release Space before throwing again.";
}
function updateRanch(level,state,seconds,controls){
 if(state.won||state.expired)return;
 if(!state.started){if(!controls.start)return;state.started=true;state.message="Green calf = in range. Tap Space to catch; holding it does not repeat.";}
 // Resolve the fresh press at the current position, before simulating the next time slice.
 // A catch while time remains counts; once the clock reaches zero the round is frozen.
 if(controls.catch)ranchCatch(level,state);
 let time=Math.min(Math.max(0,seconds),state.remaining);const c=level.ranch;
 while(time>1e-9&&!state.won){
  const dt=Math.min(time,1/120);time-=dt;state.remaining=Math.max(0,state.remaining-dt);
  state.cooldown=Math.max(0,state.cooldown-dt);
  if(state.rope){state.rope.remaining-=dt;if(state.rope.remaining<=0)state.rope=null;}
  // Normalize diagonal movement so it is no faster than walking straight.
  const x=(controls.right?1:0)-(controls.left?1:0),y=(controls.down?1:0)-(controls.up?1:0),length=Math.hypot(x,y),p=state.player;
  if(length){p.x+=x/length*c.playerSpeed*dt;p.y+=y/length*c.playerSpeed*dt;}
  p.x=Math.max(74,Math.min(886,p.x));p.y=Math.max(164,Math.min(566,p.y));
  for(const calf of state.calves){
   if(calf.caught)continue;
   // Roam along a heading until a fence reflects it. Nearby calves flee the runner.
   // The player stays faster: anticipating a route helps, but a novice can still catch up.
   const dx=calf.x-p.x,dy=calf.y-p.y,d=Math.hypot(dx,dy);
   if(d>1e-6&&d<c.fleeRadius){calf.dx=dx/d;calf.dy=dy/d;}
   calf.x+=calf.dx*c.calfSpeed*dt;calf.y+=calf.dy*c.calfSpeed*dt;
   if(calf.x<74){calf.x=74;calf.dx=Math.abs(calf.dx);}if(calf.x>886){calf.x=886;calf.dx=-Math.abs(calf.dx);}
   if(calf.y<164){calf.y=164;calf.dy=Math.abs(calf.dy);}if(calf.y>566){calf.y=566;calf.dy=-Math.abs(calf.dy);}
  }
  if(state.remaining<=1e-9){state.remaining=0;state.expired=true;state.rope=null;state.message="Time is up. R retries the whole round; Escape returns home.";break;}
 }
}
function drawRanch(ctx,level,state){
 const c=level.ranch,p=state.player,target=ranchNearest(level,state);
 ctx.save();ctx.fillStyle="#222e25";ctx.fillRect(0,0,960,640);
 // Original canvas artwork keeps exports self-contained: grass, fence, barn and animal shapes.
 ctx.fillStyle="#638d42";ctx.fillRect(60,150,840,430);
 for(let y=176;y<570;y+=42)for(let x=83;x<890;x+=47){ctx.strokeStyle="#749c50";ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+3,y-6);ctx.lineTo(x+7,y);ctx.stroke();}
 ctx.strokeStyle="#dec596";ctx.lineWidth=5;ctx.strokeRect(60,150,840,430);
 ctx.fillStyle="#dec596";for(let x=60;x<=900;x+=60){ctx.fillRect(x-4,144,8,16);ctx.fillRect(x-4,572,8,16);}
 // The header pen is a score display, outside the playable pasture.
 ctx.fillStyle="#101827";ctx.fillRect(0,0,960,130);ctx.fillStyle="#a84f42";ctx.fillRect(764,48,168,70);ctx.fillStyle="#e1b886";ctx.beginPath();ctx.moveTo(752,48);ctx.lineTo(848,16);ctx.lineTo(944,48);ctx.fill();
 ctx.fillStyle="#e8dfc7";ctx.font="12px monospace";ctx.textAlign="center";ctx.fillText("SAFE PEN",848,65);
 function calfShape(x,y,highlight,label){
  if(highlight){ctx.strokeStyle="#b6ff9a";ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,22,0,Math.PI*2);ctx.stroke();}
  ctx.fillStyle="#efe3cb";ctx.beginPath();ctx.ellipse(x,y,15,10,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#80543a";ctx.fillRect(x-6,y-7,8,10);
  ctx.fillStyle="#dac2a0";ctx.beginPath();ctx.ellipse(x+13,y,7,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#392c26";ctx.fillRect(x+15,y-4,2,2);
  ctx.fillRect(x-10,y+8,4,5);ctx.fillRect(x+6,y+8,4,5);
  if(label){ctx.fillStyle="white";ctx.font="12px monospace";ctx.fillText(label,x,y-26);}
 }
 let safe=0;state.calves.forEach((calf,i)=>{if(calf.caught){calfShape(785+(safe%4)*38,86+Math.floor(safe/4)*20,false,"");safe++;}else calfShape(calf.x,calf.y,calf===target,String(i+1));});
 // The exact mechanical range is visible; green means a target is ready, amber means empty/cooldown.
 ctx.strokeStyle=target&&state.cooldown===0?"#b6ff9a":"#f3d48b";ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.arc(p.x,p.y,c.catchRange,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
 ctx.fillStyle="#75b7ec";ctx.beginPath();ctx.arc(p.x,p.y,14,0,Math.PI*2);ctx.fill();ctx.fillStyle="#c79753";ctx.beginPath();ctx.ellipse(p.x,p.y-4,20,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#8c602f";ctx.fillRect(p.x-8,p.y-12,16,9);
 if(state.rope){ctx.strokeStyle=state.rope.success?"#b6ff9a":"#f3d48b";ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(state.rope.x,state.rope.y);ctx.stroke();ctx.beginPath();ctx.arc(state.rope.x,state.rope.y,18,0,Math.PI*2);ctx.stroke();}
 ctx.textAlign="left";ctx.fillStyle="white";ctx.font="21px monospace";ctx.fillText("CELIYANO BARN | Caught "+state.caught+"/"+c.targetCatches+" | "+Math.ceil(state.remaining)+"s",22,29);
 ctx.font="14px monospace";ctx.fillText("WASD/arrows: move | Tap Space: catch | Enter: start/save win",22,55);
 ctx.fillText("Throws: "+state.throws+" | Lasso: "+(state.cooldown>0?state.cooldown.toFixed(1)+"s":"ready")+" | R: retry | Esc: home",22,79);
 ctx.fillText(state.message,22,110);ctx.fillText("Catch the calf's center inside your circle. Calves go directly to the safe pen.",22,616);ctx.restore();
}
