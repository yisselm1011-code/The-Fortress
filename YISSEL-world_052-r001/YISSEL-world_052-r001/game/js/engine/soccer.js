// SIMONE'S SOCCER STARTER: top-down dribbling and a timed shooting challenge.
// Students edit level.soccer. This first version is one attacker versus one goalkeeper.
function createSoccer(level){
 const c=level.soccer,g=level.goal;
 return {player:{x:level.spawn.x,y:level.spawn.y},keeper:{x:g.x-46,y:g.y+g.height/2-c.keeperHeight/2,width:18,height:c.keeperHeight,direction:1},
   angle:0,power:c.startPower,ball:null,recovery:0,score:0,shots:0,saves:0,remaining:c.seconds,started:false,won:false,expired:false,
   message:"Move into position. The clock starts with your first kick."};
}
function soccerKick(level,state){
 const radians=state.angle*Math.PI/180;
 state.ball={x:state.player.x+20,y:state.player.y,vx:Math.cos(radians)*state.power,vy:Math.sin(radians)*state.power};
 state.shots++;state.started=true;state.message="Kick in flight. Aim away from the keeper!";
}
function soccerEndShot(state,message){state.ball=null;state.recovery=0.65;state.message=message;}
function stepSoccer(level,state,dt){
 const c=level.soccer,g=level.goal,k=state.keeper;
 // The keeper patrols before a shot, then tracks its current Y position at a limited speed.
 // It cannot teleport or know the shot's future path. Try aiming for the opposite corner.
 if(state.ball){const target=state.ball.y-k.height/2;k.y+=Math.sign(target-k.y)*Math.min(Math.abs(target-k.y),c.keeperSpeed*dt);}
 else k.y+=k.direction*c.keeperSpeed*0.7*dt;
 if(k.y<=g.y){k.y=g.y;k.direction=1;}if(k.y+k.height>=g.y+g.height){k.y=g.y+g.height-k.height;k.direction=-1;}
 if(!state.ball)return;
 const b=state.ball,r=c.ballRadius,oldX=b.x,oldY=b.y,speed=Math.hypot(b.vx,b.vy);
 const movingTime=Math.min(dt,speed/c.drag),distance=speed*movingTime-0.5*c.drag*movingTime*movingTime;
 const dx=speed?b.vx/speed*distance:0,dy=speed?b.vy/speed*distance:0;
 // Reuse the shared swept rectangle check: fast kicks cannot jump through the keeper.
 if(shooterHitTime(oldX,oldY,dx,dy,k,r)!==null){state.saves++;soccerEndShot(state,"Saved! Move or aim toward an open corner.");return;}
 b.x+=dx;b.y+=dy;const nextSpeed=Math.max(0,speed-c.drag*dt);
 if(speed){b.vx=b.vx/speed*nextSpeed;b.vy=b.vy/speed*nextSpeed;}
 // The WHOLE ball must cross the goal line, inside both posts. Each shot counts once.
 if(oldX-r<g.x&&b.x-r>=g.x){
  const t=(g.x+r-oldX)/dx,crossY=oldY+dy*t;
  if(crossY-r>=g.y&&crossY+r<=g.y+g.height){
   state.score++;state.won=state.score>=c.targetScore;
   soccerEndShot(state,state.won?"Target reached! Enter saves your win.":"GOAL! Find space for your next shot.");
  }else soccerEndShot(state,"Wide of the posts. Adjust your aim.");
  return;
 }
 if(b.y-r<140||b.y+r>590||b.x<40||nextSpeed<35)soccerEndShot(state,"Out or stopped. Try a closer or stronger kick.");
}
function updateSoccer(level,state,seconds,controls){
 if(state.won||state.expired)return;
 const c=level.soccer;
 // Movement and aiming are independent; diagonal walking is normalized.
 const x=(controls.right?1:0)-(controls.left?1:0),y=(controls.down?1:0)-(controls.up?1:0),length=Math.hypot(x,y);
 if(length){state.player.x+=x/length*c.playerSpeed*seconds;state.player.y+=y/length*c.playerSpeed*seconds;}
 state.player.x=Math.max(60,Math.min(c.shootingLine,state.player.x));state.player.y=Math.max(160,Math.min(570,state.player.y));
 state.angle=Math.max(-50,Math.min(50,state.angle+((controls.aimDown?1:0)-(controls.aimUp?1:0))*45*seconds));
 state.power=Math.max(320,Math.min(720,state.power+((controls.stronger?1:0)-(controls.weaker?1:0))*180*seconds));
 state.recovery=Math.max(0,state.recovery-seconds);
 if(controls.kick&&!state.ball&&state.recovery===0)soccerKick(level,state);
 let time=state.started?Math.min(Math.max(0,seconds),state.remaining):Math.max(0,seconds);
 // Fixed small steps and exact drag integration keep the shot consistent at different frame rates.
 while(time>1e-9&&!state.won&&!state.expired){
  const dt=Math.min(time,1/120);time-=dt;if(state.started)state.remaining=Math.max(0,state.remaining-dt);
  stepSoccer(level,state,dt);
  // A crossing at the buzzer counts, but an unfinished kick is not extended after time expires.
  if(state.started&&state.remaining<=1e-9&&!state.won){state.remaining=0;state.expired=true;state.ball=null;state.message="Time is up. R retries; Escape returns home.";}
 }
}
function drawSoccer(ctx,level,state){
 const c=level.soccer,g=level.goal,k=state.keeper;
 ctx.save();ctx.fillStyle="#102c24";ctx.fillRect(0,0,960,640);
 for(let x=40;x<880;x+=70){ctx.fillStyle=(x-40)/70%2?"#237448":"#286f43";ctx.fillRect(x,140,70,450);}
 ctx.strokeStyle="#e5f5df";ctx.lineWidth=3;ctx.strokeRect(40,140,g.x-40,450);
 ctx.beginPath();ctx.moveTo(460,140);ctx.lineTo(460,590);ctx.stroke();ctx.beginPath();ctx.arc(460,365,65,0,Math.PI*2);ctx.stroke();
 ctx.strokeRect(g.x-145,g.y-35,145,g.height+70);
 ctx.fillStyle="#172b34";ctx.fillRect(g.x,g.y,40,g.height);ctx.strokeRect(g.x,g.y,40,g.height);
 ctx.lineWidth=1;for(let y=g.y;y<g.y+g.height;y+=20){ctx.beginPath();ctx.moveTo(g.x,y);ctx.lineTo(g.x+40,y);ctx.stroke();}
 ctx.setLineDash([7,7]);ctx.strokeStyle="#fde68a";ctx.beginPath();ctx.moveTo(c.shootingLine,140);ctx.lineTo(c.shootingLine,590);ctx.stroke();ctx.setLineDash([]);
 ctx.fillStyle="#fb7185";ctx.fillRect(k.x,k.y,k.width,k.height);ctx.fillStyle="white";ctx.font="13px monospace";ctx.textAlign="center";ctx.fillText("Keeper",k.x+k.width/2,k.y-10);
 const p=state.player;ctx.fillStyle="#60a5fa";ctx.beginPath();ctx.arc(p.x,p.y,14,0,Math.PI*2);ctx.fill();ctx.strokeStyle="white";ctx.stroke();
 if(!state.ball&&!state.won&&!state.expired){
  const angle=state.angle*Math.PI/180;ctx.strokeStyle="#fde68a";ctx.beginPath();ctx.moveTo(p.x+20,p.y);ctx.lineTo(p.x+20+Math.cos(angle)*90,p.y+Math.sin(angle)*90);ctx.stroke();
 }
 const b=state.ball||(!state.won&&!state.expired?{x:p.x+20,y:p.y}:null);
 if(b){ctx.fillStyle="white";ctx.beginPath();ctx.arc(b.x,b.y,c.ballRadius,0,Math.PI*2);ctx.fill();ctx.fillStyle="#172b34";ctx.fillRect(b.x-3,b.y-3,6,6);}
 ctx.fillStyle="#101827";ctx.fillRect(0,0,960,128);ctx.fillStyle="white";ctx.textAlign="left";ctx.font="21px monospace";
 ctx.fillText("SIMONE'S SOCCER | Goals "+state.score+"/"+c.targetScore+" | "+Math.ceil(state.remaining)+"s | Shots "+state.shots,22,29);
 ctx.font="14px monospace";ctx.fillText("WASD/arrows: dribble | I/K: aim up/down | J/L: power | Space: kick",22,56);
 ctx.fillText("Aim "+Math.round(state.angle)+" degrees | Power "+Math.round(state.power)+" | R: retry | Esc: home",22,80);
 ctx.fillText(state.message,22,108);ctx.fillText("Shoot before the yellow line. Reach the goal target, then Enter to finish.",22,620);ctx.restore();
}
