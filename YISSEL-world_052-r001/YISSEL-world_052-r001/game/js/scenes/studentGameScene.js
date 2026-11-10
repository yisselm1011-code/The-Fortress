// TEACHER-OWNED: shared game scene for platformer, adventure, arena and sports levels.
// Each call creates independent attempt state. All modes share objective/reward rules.
// Students customize pack.js; they do not need to copy or change these engine functions.
function createStudentGameScene(mode) {
return {
  name: mode,
  level: null,
  player: null,
  pendingLevelId: null,
  pendingRewardId: null,
  returnScene: "overworld",
  completed: false,
  progress: null,
  combat: null,
  challenge: null,
  basketball: null,
  soccer: null,
  football: null,
  ranch: null,
  shooter: null,
  pursuit: null,

  create() {
    const levelId = this.pendingLevelId;
    this.level = getStudentLevel(levelId);
    if (!this.level || (this.level.mode || "platformer") !== mode) {
      console.warn("Missing level or wrong game mode:", levelId);
      sceneManager.changeSceneImmediate("overworld");
      return;
    }
    this.progress = createLevelProgress();
    this.shooter = this.level.shooter ? createShooter(this.level) : null;
    this.pursuit = this.level.pursuit ? createPursuit(this.level) : null;
    this.combat = this.level.combat ? createArenaCombat(this.level) : null;
    this.challenge = mode === "sports" ? createSkillChallenge(this.level) : null;
    this.basketball = mode === "basketball" ? createBasketball(this.level) : null;
    this.soccer = mode === "soccer" ? createSoccer(this.level) : null;
    this.football = mode === "football" ? createFootball(this.level) : null;
    this.ranch = mode === "ranch" ? createRanch(this.level) : null;
    this.player = new Player(this.level.spawn.x, this.level.spawn.y);
    if(this.shooter || (this.combat && mode === "platformer")) this.player.facing="right";
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.onGround = false;
    this.player.jumpCount = 0;
    this.completed = false;
    gameState.currentScene = mode;
    if (typeof logEvent === "function") {
      logEvent("started_" + mode, levelId, { mode: mode });
    }
  },

  update(deltaTime) {
    if (isTransitionBlockingInput()) return;
    if (input.isPressed("Escape")) {
      sceneManager.changeScene(this.returnScene || "overworld");
      return;
    }
    if (input.isPressed("KeyR")) {
      this.restartAttempt();
      return;
    }
    // Reading a clue/NPC pauses this attempt, including enemies and countdowns.
    // E/Enter closes the message; that press never triggers a second interaction.
    if(this.progress.dialogue){
      if(input.isPressed("KeyE") || input.isPressed("Enter"))this.progress.dialogue=null;
      return;
    }
    if(this.ranch){
      const seconds=Number.isFinite(deltaTime)?Math.max(0,Math.min(deltaTime/1000,0.05)):1/60;
      if(this.ranch.won&&input.isPressed("Enter")){this.completeLevel();return;}
      updateRanch(this.level,this.ranch,seconds,{
        up:input.isDown("ArrowUp")||input.isDown("KeyW"),down:input.isDown("ArrowDown")||input.isDown("KeyS"),
        left:input.isDown("ArrowLeft")||input.isDown("KeyA"),right:input.isDown("ArrowRight")||input.isDown("KeyD"),
        start:input.isPressed("Enter"),catch:input.isPressed("Space")
      });
      return;
    }
    if(this.football){
      const seconds=Number.isFinite(deltaTime)?Math.max(0,Math.min(deltaTime/1000,0.05)):1/60;
      // Confirm an existing win before updating; starting a play never also confirms its result.
      if(this.football.won&&input.isPressed("Enter")){this.completeLevel();return;}
      updateFootball(this.level,this.football,seconds,{
        up:input.isDown("ArrowUp")||input.isDown("KeyW"),down:input.isDown("ArrowDown")||input.isDown("KeyS"),
        left:input.isDown("ArrowLeft")||input.isDown("KeyA"),right:input.isDown("ArrowRight")||input.isDown("KeyD"),
        sprint:input.isDown("Space"),start:input.isPressed("Enter")
      });
      return;
    }
    if(this.soccer){
      const seconds=Number.isFinite(deltaTime)?Math.max(0,Math.min(deltaTime/1000,0.05)):1/60;
      updateSoccer(this.level,this.soccer,seconds,{
        up:input.isDown("ArrowUp")||input.isDown("KeyW"),down:input.isDown("ArrowDown")||input.isDown("KeyS"),
        left:input.isDown("ArrowLeft")||input.isDown("KeyA"),right:input.isDown("ArrowRight")||input.isDown("KeyD"),
        aimUp:input.isDown("KeyI"),aimDown:input.isDown("KeyK"),weaker:input.isDown("KeyJ"),stronger:input.isDown("KeyL"),kick:input.isPressed("Space")
      });
      if(this.soccer.won&&input.isPressed("Enter"))this.completeLevel();
      return;
    }
    if(this.basketball){
      const seconds=Number.isFinite(deltaTime)?Math.max(0,Math.min(deltaTime/1000,0.05)):1/60;
      updateBasketball(this.level,this.basketball,seconds,{
        up:input.isDown("ArrowUp")||input.isDown("KeyW"),down:input.isDown("ArrowDown")||input.isDown("KeyS"),
        left:input.isDown("ArrowLeft")||input.isDown("KeyA"),right:input.isDown("ArrowRight")||input.isDown("KeyD"),
        call:input.isPressed("KeyE"),pass1:input.isPressed("Digit1"),pass2:input.isPressed("Digit2"),
        shoot:input.isPressed("Space")||input.pointerPressed,roster:input.isPressed("Tab")
      });
      if(this.basketball.won&&input.isPressed("Enter"))this.completeLevel();
      return;
    }
    if (this.challenge) {
      const seconds = Number.isFinite(deltaTime) ? Math.max(0,Math.min(deltaTime/1000,0.05)) : 1/60;
      updateSkillChallenge(this.level,this.challenge,seconds,{
        up:input.isPressed("ArrowUp") || input.isPressed("KeyW"),
        down:input.isPressed("ArrowDown") || input.isPressed("KeyS"),
        left:input.isPressed("ArrowLeft") || input.isPressed("KeyA"),
        right:input.isPressed("ArrowRight") || input.isPressed("KeyD"),
        shoot:input.isPressed("Space")
      });
      // Show the final score until Enter confirms the win. Esc never awards a result.
      if (this.challenge.won && input.isPressed("Enter")) this.completeLevel();
      return;
    }
    // A defeated player can only restart or leave. No movement or reward can slip through.
    if ((this.combat && this.combat.defeated) || (this.shooter && this.shooter.defeated) || (this.pursuit && this.pursuit.defeated)) return;
    // Closed doors participate in the same collision system as platforms.
    // Make a temporary level view; never mutate the student's saved design.
    const movementLevel = Object.assign({}, this.level, {
      solids: (this.level.solids || []).concat(getClosedLevelDoors(this.level, this.progress))
    });
    const hiding = this.pursuit && pursuitHidden(this.level,this.player,input.isDown("KeyH"));
    if (!hiding && this.updateMovement(movementLevel)) {
      this.restartAttempt();
      return;
    }
    if (this.combat) {
      // Combat timers use seconds; cap long frame gaps so returning to a tab is safe.
      const seconds = Number.isFinite(deltaTime) ? Math.max(0, Math.min(deltaTime / 1000, 0.05)) : 1 / 60;
      updateArenaCombat(this.level, this.combat, this.player, movementLevel.solids, seconds,
        input.isPressed("KeyJ") || (mode !== "platformer" && input.isPressed("Space")));
      if (this.combat.defeated) return;
    }
    if(this.shooter){
      const seconds=Number.isFinite(deltaTime)?Math.max(0,Math.min(deltaTime/1000,0.05)):1/60;
      updateShooter(this.level,this.shooter,this.player,movementLevel.solids,seconds,{
        fire:input.isDown("KeyF"),aimUp:input.isDown("KeyI"),aimLeft:input.isDown("KeyJ"),
        aimDown:input.isDown("KeyK"),aimRight:input.isDown("KeyL")
      });
      if(this.shooter.defeated)return;
    }
    if(this.pursuit){
      const seconds=Number.isFinite(deltaTime)?Math.max(0,Math.min(deltaTime/1000,0.05)):1/60;
      updatePursuit(this.level,this.pursuit,this.player,movementLevel.solids,seconds,{hide:input.isDown("KeyH"),stun:input.isPressed("KeyQ")});
      if(this.pursuit.defeated)return;
    }
    collectLevelItems(this.level, this.progress, this.player);
    if(this.level.interactions && input.isPressed("KeyE")){
      const target = nearestQuestInteraction(this.level,this.progress,this.player);
      if(target){activateQuestInteraction(this.level,this.progress,target);return;}
    }
    const goal = this.level.goal;
    if (
      !this.completed && (!this.combat || this.combat.cleared) && (!this.shooter || this.shooter.cleared) &&
      areLevelRequirementsMet(this.level, this.progress, goal.requires) &&
      isColliding(this.player, goal)
    ) {
      this.completeLevel();
    }
  },

  // Shared by every mode: one completion record, one reward, then the owning home.
  completeLevel() {
    if (this.completed) return;
    this.completed = true;
    const firstClear = !isLevelCompleted(this.level.id);
    markLevelCompleted(this.level.id);
    const rewardId = this.pendingRewardId || this.level.rewardId;
    if (rewardId) {
      unlockReward(rewardId);
    }
    if (firstClear) {
      awardLevelCoins();
    }
    if (typeof logEvent === "function") {
      logEvent("completed_level", this.level.id, { rewardId: rewardId, coins: firstClear ? LEVEL_COMPLETE_COINS : 0 });
    }
    saveGameProgress();
    sceneManager.changeScene(this.returnScene || "overworld");
  },

  // Only movement differs. A top-down player walks in four directions without gravity.
  updateMovement(level) {
    if (mode === "platformer") return this.player.updatePlatformer(level);
    this.player.updateTopDown(level.solids, false);
    // The first template is one screen. Bounds remain solid even without border tiles.
    this.player.x = Math.max(0, Math.min(level.width - this.player.width, this.player.x));
    this.player.y = Math.max(0, Math.min(level.height - this.player.height, this.player.y));
    return (level.hazards || []).some(hazard => isColliding(this.player, hazard));
  },

  // R, hazards and falling all restart temporary progress. Saved rewards stay saved.
  restartAttempt() {
    this.progress = createLevelProgress();
    this.shooter = this.level.shooter ? createShooter(this.level) : null;
    this.pursuit = this.level.pursuit ? createPursuit(this.level) : null;
    this.combat = this.level.combat ? createArenaCombat(this.level) : null;
    this.challenge = mode === "sports" ? createSkillChallenge(this.level) : null;
    this.basketball = mode === "basketball" ? createBasketball(this.level) : null;
    this.soccer = mode === "soccer" ? createSoccer(this.level) : null;
    this.football = mode === "football" ? createFootball(this.level) : null;
    this.ranch = mode === "ranch" ? createRanch(this.level) : null;
    this.player = new Player(this.level.spawn.x, this.level.spawn.y);
    if(this.shooter || (this.combat && mode === "platformer")) this.player.facing="right";
    this.completed = false;
  },

  draw(ctx) {
    if(this.ranch){drawRanch(ctx,this.level,this.ranch);return;}
    if(this.football){drawFootball(ctx,this.level,this.football);return;}
    if(this.soccer){drawSoccer(ctx,this.level,this.soccer);return;}
    if(this.basketball){drawBasketball(ctx,this.level,this.basketball);return;}
    if (this.challenge) {
      drawSkillChallenge(ctx,this.level,this.challenge);
      drawDebugOverlay(ctx,{sceneName:this.name,playerX:this.level.spawn.x,playerY:this.level.spawn.y,cameraX:0,cameraY:0,collisionCount:0,homeCount:homeRegistry.length});
      return;
    }
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const solids = this.level.solids || [];
    ctx.fillStyle = "#5d4e37";
    for (let i = 0; i < solids.length; i++) {
      const s = solids[i];
      ctx.fillRect(s.x, s.y, s.width, s.height);
    }

    const hazards = this.level.hazards || [];
    ctx.fillStyle = "#c0392b";
    for (let h = 0; h < hazards.length; h++) {
      const hz = hazards[h];
      ctx.fillRect(hz.x, hz.y, hz.width, hz.height);
    }

    // Items disappear after pickup; open doors are outlines instead of solid walls.
    ctx.save();
    ctx.font = "13px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    for (const item of this.level.collectibles || []) {
      if (!this.progress.collected.has(item.id) && (!item.revealBy || this.progress.interacted.has(item.revealBy))) {
        ctx.fillStyle = "#5eead4";
        ctx.fillRect(item.x, item.y, item.width, item.height);
        ctx.fillStyle = "white";
        ctx.fillText(item.label || item.id, item.x, item.y - 3);
      }
    }
    for (const door of this.level.doors || []) {
      const open = areLevelRequirementsMet(this.level, this.progress, door.requires);
      ctx.fillStyle = "#a78bfa";
      ctx.strokeStyle = "#a78bfa";
      if (open) ctx.strokeRect(door.x, door.y, door.width, door.height);
      else ctx.fillRect(door.x, door.y, door.width, door.height);
      ctx.fillStyle = "white";
      ctx.fillText((door.label || door.id) + (open ? " (open)" : " (locked)"), door.x, door.y - 3);
    }
    ctx.restore();
    const goalOpen = (!this.combat || this.combat.cleared) && (!this.shooter || this.shooter.cleared) && areLevelRequirementsMet(this.level, this.progress, this.level.goal.requires);
    ctx.fillStyle = goalOpen ? "#f39c12" : "#64748b";
    ctx.fillRect(
      this.level.goal.x,
      this.level.goal.y,
      this.level.goal.width,
      this.level.goal.height
    );

    // The light marker shows which direction the character faces.
    this.player.draw(ctx);

    drawLevelObjectives(ctx, this.level, this.progress);
    if (this.combat) drawArenaCombat(ctx, this.level, this.combat, this.player);
    if(this.shooter)drawShooter(ctx,this.level,this.shooter,this.player);
    if(this.pursuit)drawPursuit(ctx,this.level,this.pursuit,this.player);
    drawInteractionPrompt(ctx, ((this.combat && this.combat.defeated) || (this.shooter && this.shooter.defeated) || (this.pursuit && this.pursuit.defeated) ? "Defeated" : goalOpen ? "Reach the exit" : this.shooter ? "Clear targets and tasks" : this.combat ? "Clear enemies and tasks" : "Complete tasks") + " | R: restart | Esc: home");

    if(this.level.interactions)drawQuestInteractions(ctx,this.level,this.progress,this.player);
    drawDebugOverlay(ctx, {
      sceneName: this.name,
      playerX: this.player.x,
      playerY: this.player.y,
      cameraX: 0,
      cameraY: 0,
      collisionCount: solids.length,
      homeCount: homeRegistry.length
    });
  },

  exit() {
    this.pendingLevelId = null;
    this.pendingRewardId = null;
    this.progress = null;
    this.combat = null;
    this.challenge = null;
    this.basketball = null;
    this.soccer = null;
    this.football = null;
    this.ranch = null;
    this.shooter = null;
    this.pursuit = null;
  }
};

}
