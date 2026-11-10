// TEACHER-OWNED: turns a student pack (js/students/<id>/pack.js) into a playable home.
// Students should not edit this file — copy the sample pack instead.
function clampSpawnTile(value, fallback, max) {
  if (typeof value !== "number" || !isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(1, Math.round(value)), max);
}

function buildRoomFromConfig(homeConfig) {
  const config = homeConfig || {};
  const tileSize = config.tileSize > 0 ? config.tileSize : 32;
  const width = Math.max(5, config.width > 0 ? config.width : 20);
  const height = Math.max(5, config.height > 0 ? config.height : 12);
  const ground = [];
  const collision = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const isBorder = x === 0 || y === 0 || x === width - 1 || y === height - 1;
      ground.push(isBorder ? 6 : 2);
      collision.push(isBorder ? 6 : 0);
    }
  }

  const spawnTile = config.spawnTile || {};
  const spawnX = clampSpawnTile(spawnTile.x, Math.floor(width / 2), width - 2);
  const spawnY = clampSpawnTile(spawnTile.y, Math.floor(height / 2), height - 2);

  return {
    tileSize: tileSize,
    width: width,
    height: height,
    pixelWidth: width * tileSize,
    pixelHeight: height * tileSize,
    layers: { ground: ground, collision: collision },
    spawn: {
      x: spawnX * tileSize + 2,
      y: spawnY * tileSize + 2
    }
  };
}

function buildInteractablesFromConfig(homeConfig, manifest) {
  const config = homeConfig || {};
  const tileSize = config.tileSize > 0 ? config.tileSize : 32;
  const source = Array.isArray(config.interactables) ? config.interactables : [];
  const list = [];

  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    if (!item || typeof item.tileX !== "number" || typeof item.tileY !== "number") {
      continue;
    }

    const base = {
      id: item.id || manifest.id + "_item_" + i,
      name: item.name || item.type,
      x: item.tileX * tileSize,
      y: item.tileY * tileSize,
      width: item.width > 0 ? item.width : 32,
      height: item.height > 0 ? item.height : 32
    };

    if (item.type === "npc") {
      list.push({
        type: INTERACTABLE_TYPES.NPC,
        dialogueKey: item.dialogueKey,
        worldId: manifest.id,
        ...base
      });
    } else if (item.type === "portal") {
      list.push({
        type: INTERACTABLE_TYPES.PORTAL,
        levelId: item.levelId || item.platformerLevelId || manifest.levelId || manifest.platformerLevelId,
        rewardId: manifest.rewardId,
        worldId: manifest.id,
        ...base
      });
    } else if (item.type === "exit") {
      list.push({
        type: INTERACTABLE_TYPES.EXIT,
        ...base
      });
    } else if (item.type === "savePoint") {
      list.push({
        type: INTERACTABLE_TYPES.SAVE_POINT,
        worldId: manifest.id,
        ...base
      });
    } else if (item.type === "submitPoint") {
      list.push({
        type: INTERACTABLE_TYPES.SUBMIT_POINT,
        worldId: manifest.id,
        submissionType: item.submissionType || "full",
        ...base
      });
    }
  }

  return list;
}

function createHomeScene(pack) {
  const manifest = pack.manifest;
  const sceneName = "home_" + manifest.id;

  return {
    name: sceneName,
    pack: pack,
    room: null,
    player: null,
    collisionObjects: [],
    interactables: [],
    roomOffset: { x: 0, y: 0 },
    currentInteractable: null,
    dialogue: { active: false, key: null, lineIndex: 0 },
    lastSaveMessage: "",
    hasExit: false,

    create() {
      this.room = buildRoomFromConfig(pack.home);
      this.collisionObjects = buildCollisionFromMap(this.room);
      this.player = new Player(this.room.spawn.x, this.room.spawn.y);
      this.interactables = buildInteractablesFromConfig(pack.home, manifest);
      this.hasExit = this.interactables.some(function (item) {
        return item.type === INTERACTABLE_TYPES.EXIT;
      });
      this.roomOffset.x = (canvas.width - this.room.pixelWidth) / 2;
      this.roomOffset.y = (canvas.height - this.room.pixelHeight) / 2;
      this.lastSaveMessage = "";
      gameState.currentScene = sceneName;
    },

    resolveDialogue(dialogueKey) {
      return getDialogueEntry(dialogueKey, pack);
    },

    openDialogue(dialogueKey) {
      this.dialogue.active = true;
      this.dialogue.key = dialogueKey;
      this.dialogue.lineIndex = 0;
    },

    closeDialogue() {
      this.dialogue.active = false;
      this.dialogue.key = null;
      this.dialogue.lineIndex = 0;
    },

    updateDialogue() {
      const data = this.resolveDialogue(this.dialogue.key);
      if (!data) {
        this.closeDialogue();
        return;
      }
      if (input.isPressed("Escape")) {
        this.closeDialogue();
        return;
      }
      if (input.isPressed("Enter") || input.isPressed("KeyE")) {
        this.dialogue.lineIndex += 1;
        if (this.dialogue.lineIndex >= data.lines.length) {
          this.closeDialogue();
        }
      }
    },

    handleInteract(interactable) {
      if (interactable.type === INTERACTABLE_TYPES.EXIT) {
        sceneManager.changeScene(typeof window !== "undefined" && window.FVGD_STANDALONE ? "standaloneMenu" : "overworld");
        return;
      }
      if (interactable.type === INTERACTABLE_TYPES.PORTAL) {
        const level = getStudentLevel(interactable.levelId);
        if (level) {
          // Read the mode from the level, so one home portal supports either template.
          const gameScene = level.mode === "ranch" ? ranchScene : level.mode === "football" ? footballScene : level.mode === "soccer" ? soccerScene : level.mode === "basketball" ? basketballScene : level.mode === "sports" ? sportsScene : level.mode === "arena" ? arenaScene : level.mode === "topdown" ? topdownScene : platformerScene;
          gameScene.pendingRewardId = interactable.rewardId || manifest.rewardId;
          gameScene.pendingLevelId = interactable.levelId;
          gameScene.returnScene = sceneName;
          sceneManager.changeScene(gameScene.name);
        } else if (interactable.dialogueKey) {
          this.openDialogue(interactable.dialogueKey);
        } else {
          this.openDialogue("portalNotReady");
        }
        return;
      }
      if (interactable.type === INTERACTABLE_TYPES.SAVE_POINT) {
        saveGameProgress();
        this.lastSaveMessage = "Game saved!";
        if (typeof logEvent === "function") {
          logEvent("save", interactable.worldId || manifest.id, {});
        }
        return;
      }
      if (interactable.type === INTERACTABLE_TYPES.SUBMIT_POINT) {
        if (typeof window !== "undefined" && window.FVGD_STANDALONE) {
          this.lastSaveMessage = "Local copy: share your project folder with your teacher.";
        } else if (typeof submitWorldForReview === "function") {
          submitWorldForReview(manifest, "full");
          this.lastSaveMessage = "Submitted for teacher review!";
        } else {
          this.lastSaveMessage = "Submit (connect Supabase to sync)";
        }
        return;
      }
      if (interactable.type === INTERACTABLE_TYPES.NPC && interactable.dialogueKey) {
        this.openDialogue(interactable.dialogueKey);
      }
    },

    update() {
      if (isTransitionBlockingInput()) {
        return;
      }
      if (this.dialogue.active) {
        this.updateDialogue();
        return;
      }
      // Safety net for a home that forgot its exit tile.
      if (!this.hasExit && input.isPressed("Escape")) {
        sceneManager.changeScene(typeof window !== "undefined" && window.FVGD_STANDALONE ? "standaloneMenu" : "overworld");
        return;
      }
      this.player.updateTopDown(this.collisionObjects, false);
      this.currentInteractable = findClosestInteractable(this.player, this.interactables);
      if (this.currentInteractable && input.isPressed("KeyE")) {
        this.handleInteract(this.currentInteractable);
      }
      if (this.lastSaveMessage) {
        this._saveMsgTimer = (this._saveMsgTimer || 0) + 1;
        if (this._saveMsgTimer > 120) {
          this.lastSaveMessage = "";
          this._saveMsgTimer = 0;
        }
      }
    },

    draw(ctx) {
      ctx.fillStyle = "#0d0d1a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const ox = this.roomOffset.x;
      const oy = this.roomOffset.y;
      const layer = this.room.layers.ground;
      const tileSize = this.room.tileSize;

      for (let y = 0; y < this.room.height; y++) {
        for (let x = 0; x < this.room.width; x++) {
          const tileId = layer[y * this.room.width + x];
          const color = getTileColor(tileId);
          if (!color) continue;
          ctx.fillStyle = color;
          ctx.fillRect(ox + x * tileSize, oy + y * tileSize, tileSize, tileSize);
        }
      }

      for (let i = 0; i < this.interactables.length; i++) {
        const item = this.interactables[i];
        let color = "#cccccc";
        if (item.type === INTERACTABLE_TYPES.NPC) color = "#f1c40f";
        else if (item.type === INTERACTABLE_TYPES.PORTAL) color = "#8e44ad";
        else if (item.type === INTERACTABLE_TYPES.EXIT) color = "#e74c3c";
        else if (item.type === INTERACTABLE_TYPES.SAVE_POINT) color = "#2ecc71";
        else if (item.type === INTERACTABLE_TYPES.SUBMIT_POINT) color = "#1abc9c";
        ctx.fillStyle = color;
        ctx.fillRect(ox + item.x, oy + item.y, item.width, item.height);
      }

      const px = ox + this.player.x;
      const py = oy + this.player.y;
      ctx.fillStyle = "#3a7bd5";
      ctx.fillRect(px, py, this.player.width, this.player.height);

      if (this.currentInteractable && !this.dialogue.active) {
        let prompt = "Press E to interact";
        const t = this.currentInteractable.type;
        if (t === INTERACTABLE_TYPES.EXIT) prompt = typeof window !== "undefined" && window.FVGD_STANDALONE ? "Press E for the game menu" : "Press E to exit to overworld";
        else if (t === INTERACTABLE_TYPES.NPC) prompt = "Press E to talk to " + this.currentInteractable.name;
        else if (t === INTERACTABLE_TYPES.PORTAL) prompt = "Press E to enter your game";
        else if (t === INTERACTABLE_TYPES.SAVE_POINT) prompt = "Press E to save game";
        else if (t === INTERACTABLE_TYPES.SUBMIT_POINT) prompt = "Press E to submit for review";
        drawInteractionPrompt(ctx, prompt);
      } else if (!this.hasExit && !this.dialogue.active) {
        drawInteractionPrompt(ctx, "No exit placed in this home — press Esc to leave");
      }

      if (this.lastSaveMessage) {
        drawInteractionPrompt(ctx, this.lastSaveMessage);
      }

      if (this.dialogue.active) {
        const data = this.resolveDialogue(this.dialogue.key);
        if (data) {
          drawDialogueBox(ctx, data.speaker, data.lines[this.dialogue.lineIndex]);
        }
      }

      drawDebugOverlay(ctx, {
        sceneName: this.name,
        playerX: this.player.x,
        playerY: this.player.y,
        cameraX: 0,
        cameraY: 0,
        collisionCount: this.collisionObjects.length,
        homeCount: homeRegistry.length
      });
    },

    // Dialogue must not stay open when this home is entered again.
    exit() { this.closeDialogue(); }
  };
}

function registerStudentHomeScenes() {
  for (let i = 0; i < studentManifests.length; i++) {
    const pack = studentManifests[i];
    try {
      sceneManager.register(createHomeScene(pack));
    } catch (err) {
      console.error("Could not register home scene for '" + pack.manifest.id + "':", err);
    }
  }
}
