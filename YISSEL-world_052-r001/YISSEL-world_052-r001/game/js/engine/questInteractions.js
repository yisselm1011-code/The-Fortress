// PUZZLE / QUEST interactions share the existing objective and door system.
// Students author level.interactions and objectives. Only progress changes during play.
function nearestQuestInteraction(level,progress,player){
  const walls=(level.solids||[]).concat(getClosedLevelDoors(level,progress));
  let target=null,distance=Infinity;
  for(const item of level.interactions||[]){
    const d=Math.hypot(player.x+player.width/2-item.x-item.width/2,player.y+player.height/2-item.y-item.height/2);
    // The closest visible interaction wins; authored order breaks ties predictably.
    if(d<=56&&d<distance&&!arenaWallBetween(player,item,walls)){target=item;distance=d;}
  }
  return target;
}
function activateQuestInteraction(level,progress,item){
  let text;
  if(progress.interacted.has(item.id))text=item.doneText;
  else if(!areLevelRequirementsMet(level,progress,item.requires)||!(item.needs||[]).every(id=>progress.collected.has(id)))text=item.lockedText;
  else{
    // Switches latch ON, clues stay read, deliveries stay complete. No soft-locking toggle.
    // Delivery uses the collection journal, not a consumable inventory: items remain recorded.
    progress.interacted.add(item.id);text=item.text;
  }
  progress.dialogue={title:item.label,text};
}
function drawQuestInteractions(ctx,level,progress,player){
  ctx.save();ctx.font="13px monospace";ctx.textAlign="left";ctx.textBaseline="bottom";
  for(const item of level.interactions||[]){
    const done=progress.interacted.has(item.id);
    ctx.fillStyle=done?"#4ade80":item.type==="npc"?"#60a5fa":item.type==="clue"?"#facc15":"#fb923c";
    ctx.fillRect(item.x,item.y,item.width,item.height);ctx.fillStyle="white";
    ctx.fillText(item.label+(done?" (done)":""),item.x,item.y-5);
  }
  const nearby=nearestQuestInteraction(level,progress,player);
  if(nearby&&!progress.dialogue){ctx.fillStyle="#101827";ctx.fillRect(180,540,600,32);ctx.fillStyle="white";ctx.textAlign="center";ctx.fillText("E: "+nearby.label,480,563);}
  if(progress.dialogue){
    ctx.fillStyle="rgba(10,18,33,0.98)";ctx.fillRect(48,390,864,190);ctx.strokeStyle="#94a3b8";ctx.strokeRect(48,390,864,190);
    ctx.fillStyle="white";ctx.textAlign="left";ctx.textBaseline="top";ctx.font="18px monospace";ctx.fillText(progress.dialogue.title,68,406);
    ctx.font="16px monospace";
    // Wrap by actual measured width; bounded text prevents the panel spilling off screen.
    const words=progress.dialogue.text.split(/\s+/);let line="",y=438;
    for(const word of words){const next=line?line+" "+word:word;if(ctx.measureText(next).width>820&&line){ctx.fillText(line,68,y);y+=21;line=word;}else line=next;}
    if(line)ctx.fillText(line,68,y);
    ctx.fillStyle="#93c5fd";ctx.fillText("E / Enter: close | R: restart | Esc: home",68,550);
  }
  ctx.restore();
}
