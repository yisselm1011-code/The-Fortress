// TEACHER-OWNED: a small 3-on-3 prototype. Debra edits the roster in her pack.js.
// The player's timing and roster stats both matter; no grade or real-person ability is inferred.
function createBasketball(level) {
  const players = [];
  level.basketball.teams.forEach((team,t) => team.players.forEach((p,i) => {
    players.push(Object.assign({},p,{team:t,index:i,x:t===0?(i===0?240:360):(i===0?720:600),y:i===0?350:i===1?235:465}));
  }));
  return {players,hero:players[0].id,owner:players[1].id,flight:null,meter:null,
    possessionTeam:0,possessionRemaining:14,buzzer:false,
    score:[0,0],remaining:level.basketball.seconds,age:0,actionAge:0,
    won:false,finished:false,roster:false,randomSeed:level.basketball.seed,
    message:"Teammates look for you. E calls for a pass; 1/2 passes to them.",lastShot:null};
}
function basketballPlayer(state,id) {return state.players.find(p=>p.id===id);}
function basketballRandom(state) {
  // A seeded generator makes classroom bugs reproducible after R restarts a match.
  state.randomSeed=(Math.imul(1664525,state.randomSeed)+1013904223)>>>0;
  return state.randomSeed/4294967296;
}
function basketballDistance(a,b) {return Math.hypot(a.x-b.x,a.y-b.y);}
function basketballHoop(team) {return {x:team===0?870:90,y:350};}
function basketballPressure(state,player) {
  return Math.min(1,state.players.filter(p=>p.team!==player.team).reduce((sum,p)=>{
    return sum+Math.max(0,1-basketballDistance(player,p)/95)*(0.4+p.defense/100*0.6);
  },0));
}
function basketballTimingWindow(player) {return 0.07+player.shooting*0.0013;}
function basketballNeedle(level,meter) {return Math.sin(meter.elapsed*Math.PI*2*level.basketball.meterCycles-Math.PI/2);}
function basketballShotChance(state,player,error) {
  const quality=Math.max(0,1-error/(basketballTimingWindow(player)*2));
  const distance=basketballDistance(player,basketballHoop(player.team));
  // Timing matters, but range matters too: full-court heaves should not beat working for a close shot.
  // Higher shooting stats improve the base chance AND make good timing more forgiving.
  return Math.max(0.03,Math.min(0.98,0.12+player.shooting/100*0.4+quality*0.45
    -Math.max(0,distance-150)/450-basketballPressure(state,player)*0.24));
}
function basketballGiveBall(state,id) {
  const player=basketballPlayer(state,id);
  // Passes do not reset the clock. A change of team starts a new 14-second possession.
  if(player&&player.team!==state.possessionTeam){state.possessionTeam=player.team;state.possessionRemaining=14;}
  state.owner=id;state.flight=null;state.meter=null;state.actionAge=0;
}
function basketballResetPositions(state) {
  state.players.forEach(p=>{p.x=p.team===0?(p.index===0?240:360):(p.index===0?720:600);p.y=p.index===0?350:p.index===1?235:465;});
}
function basketballPass(state,from,to) {
  if (!from || !to || from.team!==to.team || from.id===to.id) return;
  const distance=basketballDistance(from,to);
  // Defenders near the passing lane can intercept. Passing stats reduce that risk.
  const dx=to.x-from.x,dy=to.y-from.y,length2=dx*dx+dy*dy;
  let defender=null,best=Infinity;
  for (const p of state.players.filter(p=>p.team!==from.team)) {
    const t=length2?Math.max(0,Math.min(1,((p.x-from.x)*dx+(p.y-from.y)*dy)/length2)):0;
    const d=Math.hypot(p.x-(from.x+t*dx),p.y-(from.y+t*dy));
    if(t>0.08&&t<0.95&&d<38&&d<best){defender=p;best=d;}
  }
  const risk=defender?Math.max(0.02,0.45+defender.defense/250-from.passing/180):0;
  const target=defender&&basketballRandom(state)<risk?defender:to;
  state.flight={kind:"pass",from:{x:from.x,y:from.y},to:{x:to.x,y:to.y},target:target.id,
    elapsed:0,duration:Math.max(0.18,distance/(380+from.passing*3)),intercepted:target!==to};
  state.owner=null;state.meter=null;state.message=from.name+" passes to "+to.name+".";
}
function basketballShoot(level,state,player,error) {
  const chance=basketballShotChance(state,player,error),hoop=basketballHoop(player.team);
  const points=basketballDistance(player,hoop)>250?3:2;
  state.lastShot={shooter:player.id,error,chance,points,made:basketballRandom(state)<chance};
  state.flight={kind:"shot",from:{x:player.x,y:player.y},to:hoop,elapsed:0,duration:0.8,
    team:player.team,points,made:state.lastShot.made};
  // Reaching the basket earns a fresh clock on a rebound, for either team.
  state.possessionRemaining=14;
  state.owner=null;state.meter=null;state.message="Shot released: "+Math.round(chance*100)+"% chance.";
}
function basketballMove(player,x,y,seconds) {
  const distance=Math.hypot(x-player.x,y-player.y),step=Math.min(distance,(105+player.speed)*seconds);
  if(distance){player.x+=(x-player.x)/distance*step;player.y+=(y-player.y)/distance*step;}
  player.x=Math.max(58,Math.min(902,player.x));player.y=Math.max(148,Math.min(552,player.y));
}
function updateBasketball(level,state,seconds,controls) {
  if(controls.roster) state.roster=!state.roster;
  if(state.finished||state.roster)return;
  state.remaining=Math.max(0,state.remaining-seconds);state.age+=seconds;state.actionAge+=seconds;
  // A shot already in flight at the horn is allowed to finish; no new shot starts at zero.
  if(state.remaining===0)state.buzzer=true;
  if(!(state.flight&&state.flight.kind==="shot"))state.possessionRemaining=Math.max(0,state.possessionRemaining-seconds);
  if(state.possessionRemaining===0&&!state.buzzer){
    const next=state.players.find(p=>p.team!==state.possessionTeam&&p.index===0);
    basketballResetPositions(state);basketballGiveBall(state,next.id);
    state.message="14-second violation. Other team takes possession.";
  }
  const hero=basketballPlayer(state,state.hero),owner=basketballPlayer(state,state.owner);
  const dx=(controls.right?1:0)-(controls.left?1:0),dy=(controls.down?1:0)-(controls.up?1:0);
  if(!state.meter&& (dx||dy))basketballMove(hero,hero.x+dx*100,hero.y+dy*100,seconds);
  if(state.meter)state.meter.elapsed+=seconds;
  if(!state.buzzer&&!state.flight&&owner&&owner.id===hero.id){
    if(controls.pass1||controls.pass2){basketballPass(state,hero,state.players.find(p=>p.team===0&&p.index===(controls.pass1?1:2)));}
    else if(controls.shoot){
      if(state.meter)basketballShoot(level,state,hero,Math.abs(basketballNeedle(level,state.meter)));
      else {state.meter={elapsed:0};state.message="Click or Space when the white hand meets the red line.";}
    }
  } else if(controls.call&&owner&&owner.team===0&&!state.flight)basketballPass(state,owner,hero);

  // Offense spreads out for passes; defense marks its matching opponent.
  // During shots both teams move toward the rim so rebounds reward court position.
  for(const p of state.players){
    if(p.id===hero.id)continue;
    if(state.flight&&state.flight.kind==="shot"){
      basketballMove(p,state.flight.to.x+(p.team===0?-24:24),350+(p.index-1)*32,seconds);
    }else if(state.owner===p.id&&p.team===1){basketballMove(p,210,350,seconds);}
    else if(p.team===state.possessionTeam){
      basketballMove(p,p.team===0?Math.min(760,hero.x+105):Math.max(190,(owner?owner.x:480)-105),p.index===1?230:470,seconds);
    }else{
      const mark=state.players.find(q=>q.team!==p.team&&q.index===p.index);
      basketballMove(p,mark.x+(p.team===1?36:-36),mark.y,seconds);
    }
  }
  const current=basketballPlayer(state,state.owner);
  if(current&&!state.flight&&!state.buzzer){
    if(current.team===0&&current.id!==hero.id&&state.actionAge>0.85){
      // Favor the main player. If she is heavily guarded, make one support pass instead.
      const other=state.players.find(p=>p.team===0&&p.id!==hero.id&&p.id!==current.id);
      basketballPass(state,current,basketballPressure(state,hero)<0.85?hero:other);
    } else if(current.team===1&&state.actionAge>0.85&&basketballPressure(state,current)>0.45){
      // A guarded opponent can pass too: chasing one ball carrier should not guarantee a steal.
      const outlet=state.players.filter(p=>p.team===1&&p.id!==current.id)
        .sort((a,b)=>basketballPressure(state,a)-basketballPressure(state,b))[0];
      if(basketballPressure(state,outlet)+0.15<basketballPressure(state,current))basketballPass(state,current,outlet);
      else if(state.actionAge>1.2&&basketballDistance(current,basketballHoop(1))<190)
        basketballShoot(level,state,current,basketballRandom(state)*0.18);
    } else if(current.team===1&&state.actionAge>1.2&&basketballDistance(current,basketballHoop(1))<190){
      // NPCs use the same stats/pressure accuracy formula, with simulated timing.
      basketballShoot(level,state,current,basketballRandom(state)*0.18);
    }
    // Contact steals use elapsed time, avoiding a frame-rate advantage.
    if(state.owner&&state.actionAge>0.8){
      const guard=state.players.find(p=>p.team!==current.team&&basketballDistance(p,current)<36);
      if(guard&&basketballRandom(state)<1-Math.exp(-(0.15+guard.defense/100*0.35)*seconds)){
        basketballGiveBall(state,guard.id);state.message=guard.name+" steals the ball.";
      }
    }
  }
  if(state.buzzer&&state.flight&&state.flight.kind==="pass")state.flight=null;
  if(state.flight){
    const f=state.flight;f.elapsed+=seconds;
    if(f.elapsed>=f.duration){
      if(f.kind==="pass") {basketballGiveBall(state,f.target);state.message=f.intercepted?"Pass intercepted!":"Pass received.";}
      else if(f.made){
        state.score[f.team]+=f.points;basketballResetPositions(state);
        basketballGiveBall(state,state.players.find(p=>p.team!==f.team&&p.index===0).id);
        state.message=f.points+" points! Other team takes possession.";
      }else{
        const rebound=state.players.slice().sort((a,b)=>basketballDistance(a,f.to)-basketballDistance(b,f.to))[0];
        basketballGiveBall(state,rebound.id);state.message="Miss. "+rebound.name+" gets the rebound.";
      }
    }
  }
  // Separate overlapping player circles to keep possession and defense readable.
  for(let i=0;i<state.players.length;i++)for(let j=i+1;j<state.players.length;j++){
    const a=state.players[i],b=state.players[j],d=basketballDistance(a,b);
    if(d<28){const nx=d?(a.x-b.x)/d:1,ny=d?(a.y-b.y)/d:0,shift=(28-d)/2;
      a.x+=nx*shift;a.y+=ny*shift;b.x-=nx*shift;b.y-=ny*shift;}
  }
  state.players.forEach(p=>{p.x=Math.max(58,Math.min(902,p.x));p.y=Math.max(148,Math.min(552,p.y));});
  if(state.score.some(s=>s>=level.basketball.targetScore)||(state.buzzer&&!state.flight)){
    state.finished=true;state.won=state.score[0]>state.score[1];state.meter=null;state.flight=null;
    state.message=state.won?"You win! Enter saves the result and returns home.":state.score[0]===state.score[1]?"Tie game. R to retry, Esc for home.":"Match over. R to retry, Esc for home.";
  }
}

function drawBasketball(ctx,level,state){
  ctx.save();ctx.fillStyle="#6e171e";ctx.fillRect(0,0,960,640);
  // Original Canvas court inspired by the supplied bird's-eye reference, not an embedded image.
  ctx.fillStyle="#cfa774";ctx.fillRect(40,130,880,440);
  for(let y=130;y<570;y+=22){ctx.fillStyle=(y/22|0)%2?"#d8b583":"#cba16c";ctx.fillRect(40,y,880,21);}
  ctx.fillStyle="#9b2630";ctx.fillRect(40,275,160,150);ctx.fillRect(760,275,160,150);
  ctx.strokeStyle="#fff1d9";ctx.lineWidth=3;ctx.strokeRect(40,130,880,440);
  ctx.beginPath();ctx.moveTo(480,130);ctx.lineTo(480,570);ctx.stroke();
  ctx.beginPath();ctx.arc(480,350,62,0,Math.PI*2);ctx.stroke();
  ctx.strokeRect(40,275,160,150);ctx.strokeRect(760,275,160,150);
  // Court markings stop at the sidelines, like the reference court diagram.
  ctx.save();ctx.beginPath();ctx.rect(40,130,880,440);ctx.clip();
  [0,1].forEach(team=>{const h=basketballHoop(team);ctx.beginPath();ctx.arc(h.x,h.y,250,team===0?Math.PI/2:-Math.PI/2,team===0?Math.PI*1.5:Math.PI/2);ctx.stroke();
    ctx.fillStyle="#eee";ctx.fillRect(team===0?896:58,322,6,56);ctx.strokeStyle="#ff9f32";ctx.beginPath();ctx.arc(h.x,h.y,14,0,Math.PI*2);ctx.stroke();ctx.strokeStyle="#fff1d9";});
  ctx.restore();
  for(const p of state.players){
    ctx.fillStyle=p.team===0?"#1769d2":"#ba233d";ctx.beginPath();ctx.arc(p.x,p.y,14,0,Math.PI*2);ctx.fill();
    if(p.id===state.hero){ctx.strokeStyle="#fff";ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,19,0,Math.PI*2);ctx.stroke();}
    ctx.font="12px monospace";ctx.textAlign="center";ctx.fillStyle="white";ctx.fillText(p.index===0?(p.team===0?"YOU":"1"):String(p.index+1),p.x,p.y+4);
    ctx.fillStyle="#101827";ctx.fillText(p.name,p.x,p.y-22);
  }
  let ball=basketballPlayer(state,state.owner);
  if(state.flight){const f=state.flight,t=Math.min(1,f.elapsed/f.duration);ball={x:f.from.x+(f.to.x-f.from.x)*t,y:f.from.y+(f.to.y-f.from.y)*t-Math.sin(t*Math.PI)*(f.kind==="shot"?65:15)};}
  if(ball){ctx.fillStyle="#fb923c";ctx.strokeStyle="#7c2d12";ctx.lineWidth=2;ctx.beginPath();ctx.arc(ball.x+9,ball.y+9,7,0,Math.PI*2);ctx.fill();ctx.stroke();}
  ctx.fillStyle="#101827";ctx.fillRect(0,0,960,118);ctx.fillStyle="white";ctx.textAlign="left";ctx.font="19px monospace";
  ctx.fillText("BASKETBALL CHAMP  |  Blue "+state.score[0]+" : "+state.score[1]+" Red  |  "+Math.ceil(state.remaining)+"s  | Ball "+Math.ceil(state.possessionRemaining)+"s",24,32);
  ctx.font="14px monospace";ctx.fillText("Move: WASD/arrows | E: call | 1/2: pass | Click/Space: shoot & release",24,60);
  ctx.fillText("Tab: roster (pauses) | R: restart | Esc: home | Blue attacks RIGHT",24,84);
  ctx.fillText(state.message,24,108);
  if(state.meter){
    const hero=basketballPlayer(state,state.hero),needle=basketballNeedle(level,state.meter),window=basketballTimingWindow(hero);
    const cx=480,cy=535,angle=-Math.PI/2+needle*1.05;
    ctx.fillStyle="rgba(10,18,33,0.95)";ctx.fillRect(270,382,420,210);
    ctx.strokeStyle="#3b556c";ctx.lineWidth=6;ctx.beginPath();ctx.arc(cx,cy,90,-Math.PI/2-1.05,-Math.PI/2+1.05);ctx.stroke();
    ctx.strokeStyle="#4ade80";ctx.lineWidth=10;ctx.beginPath();ctx.arc(cx,cy,90,-Math.PI/2-window*1.05,-Math.PI/2+window*1.05);ctx.stroke();
    ctx.strokeStyle="#ff4545";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(cx,cy-65);ctx.lineTo(cx,cy-103);ctx.stroke();
    ctx.strokeStyle="white";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(angle)*92,cy+Math.sin(angle)*92);ctx.stroke();
    ctx.fillStyle="white";ctx.textAlign="center";ctx.font="16px monospace";ctx.fillText("Click when the hand meets RED",cx,410);
    ctx.fillText("Shot chance: "+Math.round(basketballShotChance(state,hero,Math.abs(needle))*100)+"%",cx,565);
  }
  if(state.roster){ctx.fillStyle="rgba(10,18,33,0.97)";ctx.fillRect(160,170,640,330);ctx.fillStyle="white";ctx.textAlign="left";ctx.font="17px monospace";
    ctx.fillText("ROSTER — edit individual stats in pack.js",184,204);ctx.fillText("Name             Shoot  Pass  Speed  Defense",184,240);
    state.players.forEach((p,i)=>ctx.fillText(p.name.padEnd(17)+String(p.shooting).padEnd(7)+String(p.passing).padEnd(6)+String(p.speed).padEnd(7)+p.defense,184,274+i*29));
    ctx.fillText("Placeholder stats; Debra chooses the final values.",184,480);
  }
  ctx.restore();
}
