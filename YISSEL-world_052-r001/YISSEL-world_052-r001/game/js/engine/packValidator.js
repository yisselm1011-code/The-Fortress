// TEACHER-OWNED: student pack checks shared by the in-game F3 report and scripts/validate-packs.js.
// Errors quarantine a pack (it will not load). Warnings still load but show up in the report.
const PACK_ICON_COLORS = ["purple", "blue", "orange", "gray", "green", "red", "yellow"];
const PACK_INTERACTABLE_TYPES = ["npc", "portal", "exit", "savePoint", "submitPoint"];
const PACK_LEVEL_MODES = ["platformer", "topdown", "arena", "sports", "basketball", "soccer", "football", "ranch"];
const PACK_ID_PATTERN = /^[a-z0-9_]+$/;
const PACK_MIN_ROOM_SIZE = 5;
const PACK_MAX_ROOM_SIZE = 40;

function packIsNumber(value) {
  return typeof value === "number" && isFinite(value);
}

function packIsPositive(value) {
  return packIsNumber(value) && value > 0;
}

function packIsText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function createPackReport(packId) {
  return {
    id: packId || "(unknown)",
    status: "loaded",
    errors: [],
    warnings: []
  };
}

function checkManifest(manifest, report) {
  if (!manifest || typeof manifest !== "object") {
    report.errors.push("manifest: missing manifest object");
    return;
  }

  if (!packIsText(manifest.id)) {
    report.errors.push("manifest.id: missing or not a string");
  } else if (!PACK_ID_PATTERN.test(manifest.id)) {
    report.errors.push(
      "manifest.id: '" + manifest.id + "' must be lowercase letters, numbers, and underscores only"
    );
  }

  // A missing position crashes the overworld draw loop for the whole class.
  const pos = manifest.position;
  if (!pos || typeof pos !== "object") {
    report.errors.push("manifest.position: missing (needs { x: number, y: number })");
  } else if (!packIsNumber(pos.x) || !packIsNumber(pos.y)) {
    report.errors.push("manifest.position: x and y must be numbers");
  }

  if (!packIsText(manifest.name)) {
    report.warnings.push("manifest.name: missing, prompts will show the id instead");
  }
  if (!packIsText(manifest.author)) {
    report.warnings.push("manifest.author: missing");
  }
  if (manifest.iconColor !== undefined && PACK_ICON_COLORS.indexOf(manifest.iconColor) === -1) {
    report.warnings.push(
      "manifest.iconColor: '" + manifest.iconColor + "' is not one of " + PACK_ICON_COLORS.join(", ")
    );
  }
  if (manifest.width !== undefined && !packIsPositive(manifest.width)) {
    report.warnings.push("manifest.width: must be a positive number, defaulting to 32");
  }
  if (manifest.height !== undefined && !packIsPositive(manifest.height)) {
    report.warnings.push("manifest.height: must be a positive number, defaulting to 32");
  }
}

function checkInteractable(item, index, pack, report) {
  const label = "home.interactables[" + index + "]";

  if (!item || typeof item !== "object") {
    report.errors.push(label + ": not an object");
    return null;
  }
  if (PACK_INTERACTABLE_TYPES.indexOf(item.type) === -1) {
    report.errors.push(
      label + ": type '" + item.type + "' is not one of " + PACK_INTERACTABLE_TYPES.join(", ")
    );
    return null;
  }
  if (!packIsNumber(item.tileX) || !packIsNumber(item.tileY)) {
    report.errors.push(label + " (" + item.type + "): tileX and tileY must be numbers");
    return null;
  }
  if (!packIsText(item.id)) {
    report.warnings.push(label + " (" + item.type + "): missing id");
  }
  if (item.width !== undefined && !packIsPositive(item.width)) {
    report.warnings.push(label + " (" + item.type + "): width must be positive, defaulting to 32");
  }
  if (item.height !== undefined && !packIsPositive(item.height)) {
    report.warnings.push(label + " (" + item.type + "): height must be positive, defaulting to 32");
  }

  if (item.type === "npc") {
    if (!packIsText(item.dialogueKey)) {
      report.warnings.push(label + " (npc): missing dialogueKey, this NPC will not talk");
    } else if (!pack.dialogue || !pack.dialogue[item.dialogueKey]) {
      report.warnings.push(
        label + " (npc): dialogueKey '" + item.dialogueKey + "' is not in this pack's dialogue block"
      );
    }
  }

  if (item.type === "portal") {
    const levelId = item.levelId || item.platformerLevelId || (pack.manifest && (pack.manifest.levelId || pack.manifest.platformerLevelId));
    if (!packIsText(levelId)) {
      report.warnings.push(label + " (portal): no levelId, portal shows a placeholder message");
    }
  }

  return item.type;
}

function checkHome(pack, report) {
  const home = pack.home;

  if (!home || typeof home !== "object") {
    report.errors.push("home: missing home object");
    return;
  }

  const width = home.width === undefined ? 20 : home.width;
  const height = home.height === undefined ? 12 : home.height;

  if (!packIsPositive(width) || !packIsPositive(height)) {
    report.errors.push("home.width / home.height: must be positive numbers");
  } else if (width < PACK_MIN_ROOM_SIZE || height < PACK_MIN_ROOM_SIZE) {
    report.warnings.push(
      "home: room is smaller than " + PACK_MIN_ROOM_SIZE + " tiles, walls may trap the player"
    );
  } else if (width > PACK_MAX_ROOM_SIZE || height > PACK_MAX_ROOM_SIZE) {
    report.warnings.push("home: room is larger than " + PACK_MAX_ROOM_SIZE + " tiles and will overflow the canvas");
  }

  const spawn = home.spawnTile;
  if (spawn && (!packIsNumber(spawn.x) || !packIsNumber(spawn.y))) {
    report.warnings.push("home.spawnTile: x and y must be numbers, using the default spawn");
  } else if (spawn && (spawn.x < 1 || spawn.y < 1 || spawn.x > width - 2 || spawn.y > height - 2)) {
    report.warnings.push("home.spawnTile: outside the walls, the spawn will be moved inside");
  }

  if (!Array.isArray(home.interactables)) {
    report.errors.push("home.interactables: missing or not an array");
    return;
  }

  const seen = {};
  for (let i = 0; i < home.interactables.length; i++) {
    const type = checkInteractable(home.interactables[i], i, pack, report);
    if (type) {
      seen[type] = (seen[type] || 0) + 1;
    }
  }

  if (!seen.exit) {
    report.warnings.push("home: no working exit tile, players can only leave with Escape");
  }
  if (!seen.npc) {
    report.warnings.push("home: no working npc tile");
  }
  if (!seen.portal) {
    report.warnings.push("home: no working portal tile, the game cannot be reached");
  }
  if (!seen.savePoint) {
    report.warnings.push("home: no working savePoint tile");
  }
  if (!seen.submitPoint) {
    report.warnings.push("home: no working submitPoint tile, work cannot be submitted for review");
  }
}

function checkDialogue(pack, report) {
  const dialogue = pack.dialogue;
  if (dialogue === undefined) {
    return;
  }
  if (typeof dialogue !== "object" || dialogue === null || Array.isArray(dialogue)) {
    report.errors.push("dialogue: must be an object of { key: { speaker, lines } }");
    return;
  }

  const keys = Object.keys(dialogue);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const entry = dialogue[key];
    const label = "dialogue." + key;

    if (!entry || typeof entry !== "object") {
      report.errors.push(label + ": not an object");
      continue;
    }
    if (!packIsText(entry.speaker)) {
      report.warnings.push(label + ": missing speaker name");
    }
    if (!Array.isArray(entry.lines) || entry.lines.length === 0) {
      report.errors.push(label + ": lines must be a non-empty array of strings");
      continue;
    }
    for (let j = 0; j < entry.lines.length; j++) {
      if (!packIsText(entry.lines[j])) {
        report.warnings.push(label + ": line " + j + " is empty");
      }
    }
  }
}

function checkRect(rect, label, report, required) {
  if (!rect || typeof rect !== "object") {
    if (required) {
      report.errors.push(label + ": missing");
    }
    return false;
  }
  if (!packIsNumber(rect.x) || !packIsNumber(rect.y)) {
    report.errors.push(label + ": x and y must be numbers");
    return false;
  }
  if (!packIsPositive(rect.width) || !packIsPositive(rect.height)) {
    report.errors.push(label + ": width and height must be positive numbers");
    return false;
  }
  return true;
}

function checkLevel(pack, report) {
  const level = pack.level;
  if (level === undefined) {
    return;
  }
  if (typeof level !== "object" || level === null) {
    report.errors.push("level: must be an object");
    return;
  }

  const mode = level.mode === undefined ? "platformer" : level.mode;
  if (PACK_LEVEL_MODES.indexOf(mode) === -1) {
    report.errors.push(
      "level.mode: '" + mode + "' is not supported yet, use one of " + PACK_LEVEL_MODES.join(", ")
    );
  }

  if (!level.spawn || !packIsNumber(level.spawn.x) || !packIsNumber(level.spawn.y)) {
    report.errors.push("level.spawn: missing (needs { x: number, y: number })");
  }

  checkRect(level.goal, "level.goal", report, true);

  if (!Array.isArray(level.solids) || (mode === "platformer" && level.solids.length === 0)) {
    report.errors.push("level.solids: must be an array (platformers need at least one platform)");
  } else {
    for (let i = 0; i < level.solids.length; i++) {
      checkRect(level.solids[i], "level.solids[" + i + "]", report, true);
    }
  }

  if (level.hazards !== undefined) {
    if (!Array.isArray(level.hazards)) {
      report.errors.push("level.hazards: must be an array");
    } else {
      for (let h = 0; h < level.hazards.length; h++) {
        checkRect(level.hazards[h], "level.hazards[" + h + "]", report, true);
      }
    }
  }
}

// Structural checks for a single pack, with no knowledge of the rest of the class.
function validatePack(pack) {
  const report = createPackReport(pack && pack.manifest ? pack.manifest.id : null);

  if (!pack || typeof pack !== "object") {
    report.errors.push("pack: registerStudentPack needs an object");
    report.status = "rejected";
    return report;
  }

  checkManifest(pack.manifest, report);
  checkHome(pack, report);
  checkDialogue(pack, report);
  checkLevel(pack, report);
  checkLevelObjectives(pack, report);
  checkGameRoutingAndBounds(pack, report);
  checkArenaCombat(pack, report);
  checkSportsChallenge(pack, report);
  checkBasketball(pack, report);
  checkSoccer(pack, report);
  checkFootball(pack, report);
  checkRanch(pack, report);
  checkShooter(pack, report);
  checkPursuit(pack, report);
  checkQuestInteractions(pack, report);

  report.status = report.errors.length > 0 ? "rejected" : "loaded";
  return report;
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Cross-pack checks that only make sense once the whole class is loaded.
function validatePackRegistry(packs) {
  const problems = [];
  const byId = {};
  const levelIds = {};
  const icons = [];

  for (let i = 0; i < packs.length; i++) {
    const manifest = packs[i].manifest;
    if (!manifest || !manifest.id) {
      continue;
    }

    if (byId[manifest.id]) {
      problems.push({
        id: manifest.id,
        message: "duplicate manifest.id '" + manifest.id + "' (ids must be unique across the class)"
      });
    }
    byId[manifest.id] = true;

    const levelId = manifest.levelId || manifest.platformerLevelId || (packs[i].level && packs[i].level.id);
    if (levelId) {
      if (levelIds[levelId]) {
        problems.push({
          id: manifest.id,
          message: "platformerLevelId '" + levelId + "' is already used by " + levelIds[levelId]
        });
      } else {
        levelIds[levelId] = manifest.id;
      }
    }

    if (manifest.position && packIsNumber(manifest.position.x)) {
      icons.push({
        id: manifest.id,
        x: manifest.position.x,
        y: manifest.position.y,
        width: manifest.width || 32,
        height: manifest.height || 32
      });
    }
  }

  for (let a = 0; a < icons.length; a++) {
    for (let b = a + 1; b < icons.length; b++) {
      if (rectsOverlap(icons[a], icons[b])) {
        problems.push({
          id: icons[a].id,
          message: "overworld icon overlaps " + icons[b].id + " — give one of them a new manifest.position"
        });
      }
    }
  }

  return problems;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { validatePack: validatePack, validatePackRegistry: validatePackRegistry };
}

// Optional version-1 objective fields. Old packs may omit every one of these.
// Validate references before play so a misspelled key cannot silently lock a game.
function checkLevelObjectives(pack, report) {
  if (pack.schemaVersion !== undefined && pack.schemaVersion !== 1) {
    report.errors.push("schemaVersion: only version 1 is supported");
  }
  const level = pack.level;
  if (!level || typeof level !== "object") return;
  function list(name) {
    if (level[name] === undefined) return [];
    if (!Array.isArray(level[name])) {
      report.errors.push("level." + name + ": must be an array");
      return [];
    }
    return level[name];
  }
  function ids(items, name, rectangles) {
    const known = new Set();
    items.forEach(function (item, index) {
      const label = "level." + name + "[" + index + "]";
      if (!item || !packIsText(item.id) || !PACK_ID_PATTERN.test(item.id)) {
        report.errors.push(label + ": needs an ID using lowercase letters, numbers and underscores");
        return;
      }
      if (known.has(item.id)) report.errors.push(label + ": duplicate id " + item.id);
      known.add(item.id);
      if (rectangles) checkRect(item, label, report, true);
    });
    return known;
  }
  function references(refs, known, label, required) {
    if (refs === undefined && !required) return;
    if (!Array.isArray(refs) || (required && refs.length === 0)) {
      report.errors.push(label + ": must be " + (required ? "a non-empty" : "an") + " array of IDs");
      return;
    }
    if (new Set(refs).size !== refs.length) report.errors.push(label + ": repeated IDs");
    refs.forEach(function (id) {
      if (!known.has(id)) report.errors.push(label + ": unknown ID " + id);
    });
  }
  const collectibles = list("collectibles");
  const objectives = list("objectives");
  const doors = list("doors");
  const interactions = list("interactions");
  const interactionIds = ids(interactions,"interactions",true);
  const itemIds = ids(collectibles, "collectibles", true);
  const objectiveIds = ids(objectives, "objectives", false);
  ids(doors, "doors", true);
  objectives.forEach(function (objective, index) {
    if (!objective || typeof objective !== "object") return;
    if (!packIsText(objective.label)) report.errors.push("objective " + index + ": needs a readable label");
    references(objective.collect, itemIds, "objective " + index + ".collect", !(Array.isArray(objective.interact) && objective.interact.length));
    references(objective.interact, interactionIds, "objective " + index + ".interact", !(Array.isArray(objective.collect) && objective.collect.length));
  });
  doors.forEach(function (door, index) {
    if (door && typeof door === "object") references(door.requires, objectiveIds, "door " + index + ".requires", false);
  });
  interactions.forEach((item,index)=>{
    if(!item||typeof item!=="object")return;
    references(item.requires,objectiveIds,"interaction "+index+".requires",false);
    references(item.needs,itemIds,"interaction "+index+".needs",false);
  });
  collectibles.forEach(item=>{if(item&&item.revealBy!==undefined&&!interactionIds.has(item.revealBy))report.errors.push("collectible.revealBy: unknown interaction ID");});
  if (level.goal) references(level.goal.requires, objectiveIds, "goal.requires", false);
}

// New mode-neutral IDs must not disagree with a legacy alias or the pack's level.
function checkGameRoutingAndBounds(pack, report) {
  const manifest = pack.manifest || {};
  const level = pack.level;
  const expected = level && (level.id || manifest.id + "_level");
  function checkRoute(item, label) {
    if (!item) return;
    if (item.levelId !== undefined && !packIsText(item.levelId)) report.errors.push(label + ".levelId: must be text");
    if (item.levelId && item.platformerLevelId && item.levelId !== item.platformerLevelId) {
      report.errors.push(label + ": levelId disagrees with platformerLevelId");
    }
    const target = item.levelId || item.platformerLevelId;
    if (expected && target && target !== expected) report.errors.push(label + ": portal target must match this pack's level.id");
  }
  checkRoute(manifest, "manifest");
  ((pack.home && Array.isArray(pack.home.interactables)) ? pack.home.interactables : []).forEach(function (item) {
    if (item && item.type === "portal") checkRoute(item, "portal");
  });
  if (!level || (level.mode !== "topdown" && level.mode !== "arena")) return;
  // This template has no scrolling camera. Reject hidden/out-of-screen objectives.
  if (!Number.isInteger(level.width) || level.width < 64 || level.width > 960 ||
      !Number.isInteger(level.height) || level.height < 64 || level.height > 640) {
    report.errors.push("walking modes: width must be 64..960 and height 64..640, in whole pixels");
    return;
  }
  function inside(rect, label) {
    if (!rect || !packIsNumber(rect.x) || !packIsNumber(rect.y) || !packIsPositive(rect.width) || !packIsPositive(rect.height)) return;
    if (rect.x < 0 || rect.y < 0 || rect.x + rect.width > level.width || rect.y + rect.height > level.height) {
      report.errors.push(label + ": rectangle must fit inside the level");
    }
  }
  inside(level.goal, "goal");
  const spawn = level.spawn && {x:level.spawn.x, y:level.spawn.y, width:28, height:28};
  inside(spawn, "spawn");
  ["solids", "hazards", "collectibles", "doors"].forEach(function (name) {
    if (Array.isArray(level[name])) level[name].forEach((rect,index) => inside(rect,name + "[" + index + "]"));
  });
  // Avoid spawning inside a wall, hazard or initially closed door.
  const blockers = [].concat(Array.isArray(level.solids) ? level.solids : [],
    Array.isArray(level.hazards) ? level.hazards : [],
    Array.isArray(level.doors) ? level.doors.filter(d => d && Array.isArray(d.requires) && d.requires.length) : []);
  if (spawn && blockers.some(rect => rect && rectsOverlap(spawn,rect))) report.errors.push("spawn: overlaps a wall, hazard or locked door");
}

// Arena settings are deliberately bounded so a typo cannot create an unplayable wave.
function checkArenaCombat(pack, report) {
  const level = pack.level;
  if (!level || (level.mode !== "arena" && level.combat === undefined)) return;
  const mode=level.mode || "platformer";
  if(!["arena","platformer","topdown"].includes(mode))report.errors.push("combat: use arena, platformer or topdown mode");
  if(level.shooter || level.pursuit)report.errors.push("combat: do not mix with shooter/pursuit in this version");
  const combat = level.combat;
  function number(value, min, max, label, integer) {
    if (!packIsNumber(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
      report.errors.push(label + ": use " + (integer ? "a whole number " : "a number ") + min + ".." + max);
    }
  }
  if (!combat || typeof combat !== "object" || Array.isArray(combat)) report.errors.push("combat: missing settings object");
  else {
    number(combat.playerHealth,1,20,"combat.playerHealth",true);
    number(combat.attackDamage,1,10,"combat.attackDamage",true);
    number(combat.attackReach,16,96,"combat.attackReach",false);
    number(combat.attackCooldown,0.15,2,"combat.attackCooldown",false);
    number(combat.invulnerabilitySeconds,0.3,3,"combat.invulnerabilitySeconds",false);
  }
  if (!Array.isArray(level.waves) || level.waves.length < 1 || level.waves.length > 10) {
    report.errors.push("arena.waves: supply 1..10 waves");return;
  }
  const ids = new Set();
  const blockers = [].concat(Array.isArray(level.solids) ? level.solids : [],
    Array.isArray(level.hazards) ? level.hazards : [],
    Array.isArray(level.doors) ? level.doors.filter(d => d && Array.isArray(d.requires) && d.requires.length) : []);
  const spawn = level.spawn && {x:level.spawn.x,y:level.spawn.y,width:28,height:28};
  // Combat adventures are one screen too. Validate platformer layouts as strictly as walking ones.
  number(level.width,64,960,"combat level.width",true);number(level.height,64,640,"combat level.height",true);
  const rectangles=[spawn,level.goal].concat(blockers,Array.isArray(level.collectibles)?level.collectibles:[]);
  rectangles.forEach(rect=>{if(rect&&(rect.x<0||rect.y<0||rect.x+rect.width>level.width||rect.y+rect.height>level.height))report.errors.push("combat: layout rectangle outside level");});
  if(spawn&&blockers.some(rect=>rect&&rectsOverlap(spawn,rect)))report.errors.push("combat: player spawn overlaps blocker");
  level.waves.forEach(function (wave, w) {
    if (!wave || !Array.isArray(wave.enemies) || wave.enemies.length < 1 || wave.enemies.length > 8) {
      report.errors.push("wave " + w + ": supply 1..8 enemies");return;
    }
    wave.enemies.forEach(function (enemy, i) {
      const label = "wave " + w + " enemy " + i;
      if (!checkRect(enemy,label,report,true)) return;
      if (!packIsText(enemy.id) || !PACK_ID_PATTERN.test(enemy.id) || ids.has(enemy.id)) report.errors.push(label + ": use a unique lowercase enemy ID");
      ids.add(enemy.id);
      number(enemy.width,8,64,label + ".width",false);number(enemy.height,8,64,label + ".height",false);
      number(enemy.health,1,20,label + ".health",true);number(enemy.damage,1,10,label + ".damage",true);
      number(enemy.speed,0,160,label + ".speed",false);
      if(mode==="platformer" && !(Array.isArray(level.solids)?level.solids:[]).some(w=>w&&Math.abs(enemy.y+enemy.height-w.y)<0.1&&enemy.x>=w.x&&enemy.x+enemy.width<=w.x+w.width))report.errors.push(label+": platformer guard must start on solid ground");
      if (enemy.x < 0 || enemy.y < 0 || enemy.x + enemy.width > level.width || enemy.y + enemy.height > level.height) report.errors.push(label + ": spawn outside level");
      if (blockers.some(rect => rect && rectsOverlap(enemy,rect)) || (spawn && rectsOverlap(enemy,spawn))) report.errors.push(label + ": spawn overlaps a wall, hazard, locked door or player start");
      if (wave.enemies.slice(0,i).some(other => other && rectsOverlap(enemy,other))) report.errors.push(label + ": overlaps another enemy spawn in this wave");
    });
  });
}

// Sports uses spawn as the BALL launch point and goal as the hoop rim.
function checkSportsChallenge(pack, report) {
  const level = pack.level;
  if (!level || level.mode !== "sports") return;
  function range(value,min,max,label,integer) {
    if (!packIsNumber(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
      report.errors.push(label + ": use " + (integer ? "a whole number " : "a number ") + min + ".." + max);
      return false;
    }
    return true;
  }
  // Keep this version one screen. Its background/scoreboard uses a 960x640 court.
  if (level.width !== 960 || level.height !== 640) report.errors.push("sports: use a 960 by 640 court");
  const c = level.challenge;
  if (!c || typeof c !== "object") {report.errors.push("sports: missing challenge settings");return;}
  range(c.targetScore,1,20,"challenge.targetScore",true);
  range(c.timeLimit,5,180,"challenge.timeLimit",false);
  range(c.startAngle,20,80,"challenge.startAngle",true);
  range(c.startPower,300,900,"challenge.startPower",true);
  range(c.gravity,100,1200,"challenge.gravity",false);
  range(c.ballRadius,6,18,"challenge.ballRadius",false);
  range(c.floorY,500,620,"challenge.floorY",false);
  const spawn=level.spawn, goal=level.goal;
  if (spawn && packIsNumber(spawn.x) && packIsNumber(spawn.y)) {
    if (spawn.x < 40 || spawn.x > 400 || spawn.y < 160 || spawn.y + c.ballRadius >= c.floorY-30) report.errors.push("sports.spawn: launch from x 40..400, below the HUD and above the floor");
  }
  if (goal && checkRect(goal,"sports.goal",report,true)) {
    if (goal.width < 2*c.ballRadius+16 || goal.width > 180 || goal.height > 24 || goal.x < 450 || goal.x+goal.width+26 > 950 || goal.y < 200 || goal.y+42 >= c.floorY) report.errors.push("sports.goal: fit a reachable-width hoop and backboard on the right side, between the HUD and floor");
    if (goal.requires && goal.requires.length) report.errors.push("sports.goal: collection requirements are not supported in this mode");
  }
  ["solids","hazards","collectibles","objectives","doors","waves"].forEach(name => {
    if (level[name] !== undefined && (!Array.isArray(level[name]) || level[name].length)) report.errors.push("sports: " + name + " must be empty; use challenge settings instead");
  });
  if (level.combat !== undefined) report.errors.push("sports: combat settings are not supported");
}

// Team basketball deliberately starts with three players per side and bounded stats.
function checkBasketball(pack,report){
  const level=pack.level;if(!level||level.mode!=="basketball")return;
  if(level.width!==960||level.height!==640)report.errors.push("basketball: use the 960x640 court");
  const b=level.basketball;if(!b||typeof b!=="object"){report.errors.push("basketball: missing settings");return;}
  function number(v,min,max,label,integer){if(!packIsNumber(v)||v<min||v>max||(integer&&!Number.isInteger(v)))report.errors.push(label+": use "+min+".."+max);}
  number(b.seconds,30,600,"basketball.seconds",true);number(b.targetScore,2,50,"basketball.targetScore",true);
  number(b.meterCycles,0.3,2,"basketball.meterCycles",false);number(b.seed,1,4294967295,"basketball.seed",true);
  if(!Array.isArray(b.teams)||b.teams.length!==2){report.errors.push("basketball: exactly two teams required");return;}
  const ids=new Set();
  b.teams.forEach((team,t)=>{
    if(!team||!Array.isArray(team.players)||team.players.length!==3){report.errors.push("team "+t+": exactly three players required");return;}
    team.players.forEach((p,i)=>{
      if(!p||typeof p!=="object"){report.errors.push("team player missing");return;}
      if(!packIsText(p.id)||!PACK_ID_PATTERN.test(p.id)||ids.has(p.id))report.errors.push("player: unique lowercase ID required");ids.add(p.id);
      if(!packIsText(p.name)||p.name.length>16)report.errors.push("player name: use 1..16 characters");
      ["shooting","passing","speed","defense"].forEach(stat=>number(p[stat],1,100,"team "+t+" player "+i+" "+stat,true));
    });
  });
  ["solids","hazards","collectibles","objectives","doors","waves"].forEach(name=>{if(level[name]!==undefined&&(!Array.isArray(level[name])||level[name].length))report.errors.push("basketball: "+name+" must be empty");});
  if(level.goal&&level.goal.requires&&level.goal.requires.length)report.errors.push("basketball: goal requirements are not used");
  if(level.combat||level.challenge)report.errors.push("basketball: use basketball settings instead of another mode's settings");
}
// Optional shooter settings work in both movement templates; old packs need no changes.
function checkShooter(pack,report){
  const l=pack.level;if(!l||l.shooter===undefined)return;
  const mode=l.mode||"platformer",s=l.shooter;
  if(!["platformer","topdown"].includes(mode))report.errors.push("shooter: use platformer or topdown mode");
  if(!s||typeof s!=="object"||Array.isArray(s)){report.errors.push("shooter: settings object required");return;}
  function range(v,min,max,label,integer=false){if(!packIsNumber(v)||v<min||v>max||(integer&&!Number.isInteger(v)))report.errors.push("shooter."+label+": use "+min+".."+max+(integer?" whole numbers":""));}
  range(l.width,64,960,"level width",true);range(l.height,64,640,"level height",true);
  range(s.playerHealth,1,20,"playerHealth",true);range(s.damage,1,10,"damage",true);
  range(s.bulletSpeed,80,1200,"bulletSpeed");range(s.fireInterval,0.12,3,"fireInterval");
  range(s.bulletLifetime,0.2,5,"bulletLifetime");range(s.invulnerabilitySeconds,0.3,3,"invulnerabilitySeconds");
  if(!Array.isArray(s.enemies)||s.enemies.length<1||s.enemies.length>16){report.errors.push("shooter.enemies: use 1..16 turrets");return;}
  const walls=[...(Array.isArray(l.solids)?l.solids:[]),...(Array.isArray(l.doors)?l.doors:[]),...(Array.isArray(l.hazards)?l.hazards:[])];
  const spawn=l.spawn&&{x:l.spawn.x,y:l.spawn.y,width:28,height:28},ids=new Set();
  // Validate platformer bounds too: this first shooter version is deliberately one screen.
  for(const [label,rect] of [["spawn",spawn],["goal",l.goal],...walls.map(w=>["wall/hazard",w]),...(Array.isArray(l.collectibles)?l.collectibles:[]).map(w=>["item",w])]){
    if(rect&&(rect.x<0||rect.y<0||rect.x+rect.width>l.width||rect.y+rect.height>l.height))report.errors.push("shooter."+label+": outside level");
  }
  if(spawn&&walls.some(w=>w&&rectsOverlap(spawn,w)))report.errors.push("shooter.spawn: overlaps wall, door or hazard");
  s.enemies.forEach((e,i)=>{
    if(!checkRect(e,"shooter enemy "+i,report,true))return;
    if(!packIsText(e.id)||!PACK_ID_PATTERN.test(e.id)||ids.has(e.id))report.errors.push("shooter enemy: unique lowercase ID required");ids.add(e.id);
    range(e.width,16,64,"enemy width");range(e.height,16,64,"enemy height");
    range(e.health,1,20,"enemy health",true);range(e.damage,1,10,"enemy damage",true);
    range(e.bulletSpeed,60,600,"enemy bulletSpeed");range(e.fireInterval,0.6,5,"enemy fireInterval");
    if(e.x<0||e.y<0||e.x+e.width>l.width||e.y+e.height>l.height)report.errors.push("shooter enemy: outside level");
    if(walls.some(w=>w&&rectsOverlap(e,w))||(spawn&&rectsOverlap(e,spawn))||s.enemies.slice(0,i).some(p=>p&&rectsOverlap(e,p)))report.errors.push("shooter enemy: overlapping spawn or blocker");
  });
}
// Pursuit uses bounded, editable settings and cannot be mixed with another combat module yet.
function checkPursuit(pack,report){
 const l=pack.level;if(!l||l.pursuit===undefined)return;const c=l.pursuit,mode=l.mode||"platformer";
 if(!["platformer","topdown"].includes(mode))report.errors.push("pursuit: use platformer or topdown");
 if(l.shooter||l.combat)report.errors.push("pursuit: use separately from shooter/combat in this version");
 if(!c||typeof c!=="object"||Array.isArray(c)){report.errors.push("pursuit: settings object required");return;}
 function range(v,min,max,label){if(!packIsNumber(v)||v<min||v>max)report.errors.push("pursuit."+label+": use "+min+".."+max);}
 range(l.width,64,960,"width");range(l.height,64,640,"height");range(c.seconds,15,300,"seconds");
 range(c.stunCooldown,2,15,"stunCooldown");range(c.stunSeconds,0.5,4,"stunSeconds");range(c.stunRadius,32,180,"stunRadius");range(c.memorySeconds,0.5,6,"memorySeconds");
 if(c.stunCooldown<=c.stunSeconds)report.errors.push("pursuit: stun cooldown must exceed stun duration");
 const solids=Array.isArray(l.solids)?l.solids:[],walls=[...solids,...(Array.isArray(l.doors)?l.doors:[]),...(Array.isArray(l.hazards)?l.hazards:[])];
 const spawn=l.spawn&&{x:l.spawn.x,y:l.spawn.y,width:28,height:28};
 function inside(rect,label){if(rect&&(rect.x<0||rect.y<0||rect.x+rect.width>l.width||rect.y+rect.height>l.height))report.errors.push("pursuit "+label+": outside level");}
 inside(spawn,"spawn");inside(l.goal,"goal");walls.forEach(r=>inside(r,"blocker"));(Array.isArray(l.collectibles)?l.collectibles:[]).forEach(r=>inside(r,"item"));
 if(spawn&&walls.some(w=>w&&rectsOverlap(spawn,w)))report.errors.push("pursuit: player starts in blocker");
 for(const [key,max] of [["enemies",6],["hidingSpots",8]]){
  const list=c[key];if(!Array.isArray(list)||list.length<1||list.length>max){report.errors.push("pursuit."+key+": use 1.."+max);continue;}
  const ids=new Set();list.forEach((e,i)=>{
   if(!checkRect(e,"pursuit "+key+" "+i,report,true))return;
   if(!packIsText(e.id)||!PACK_ID_PATTERN.test(e.id)||ids.has(e.id))report.errors.push("pursuit: unique lowercase IDs required in "+key);ids.add(e.id);inside(e,key);
   if(walls.some(w=>w&&rectsOverlap(e,w)))report.errors.push("pursuit "+key+": overlaps blocker");
   if(key==="enemies"){
    range(e.width,16,48,"enemy width");range(e.height,16,48,"enemy height");range(e.speed,20,200,"speed");range(e.noticeRadius,64,600,"noticeRadius");
    if((spawn&&rectsOverlap(e,spawn))||list.slice(0,i).some(other=>other&&rectsOverlap(e,other)))report.errors.push("pursuit: enemy overlaps player/another enemy");
    if(mode==="platformer"&&!solids.some(w=>w&&Math.abs(e.y+e.height-w.y)<0.1&&e.x>=w.x&&e.x+e.width<=w.x+w.width))report.errors.push("pursuit: platformer enemy must start on solid ground");
   }else{range(e.width,32,180,"hiding width");range(e.height,32,180,"hiding height");}
  });
 }
}
// Quest references form a dependency graph. Reject cycles before a student gets stuck.
function checkQuestInteractions(pack,report){
 const l=pack.level;if(!l||l.interactions===undefined)return;
 if(!["platformer","topdown"].includes(l.mode||"platformer"))report.errors.push("interactions: use platformer or topdown");
 if(!Array.isArray(l.interactions))return;
 if(l.interactions.length>16)report.errors.push("interactions: at most 16 per level");
 if(!Number.isInteger(l.width)||l.width<64||l.width>960||!Number.isInteger(l.height)||l.height<64||l.height>640)report.errors.push("quest: use a one-screen level within 960x640");
 const list=name=>Array.isArray(l[name])?l[name]:[];
 const walls=[...list("solids"),...list("doors"),...list("hazards")];
 for(const [i,a] of l.interactions.entries()){
  if(!a||typeof a!=="object")continue;
  if(!["switch","clue","npc"].includes(a.type))report.errors.push("interaction "+i+": type must be switch, clue or npc");
  if(!packIsText(a.label)||a.label.length>24)report.errors.push("interaction label: use 1..24 characters");
  for(const name of ["text","lockedText","doneText"])if(!packIsText(a[name])||a[name].length>220||/\S{61}/.test(a[name]))report.errors.push("interaction "+name+": use 1..220 characters and words up to 60 characters");
  if(!packIsNumber(a.width)||a.width<16||a.width>64||!packIsNumber(a.height)||a.height<16||a.height>80)report.errors.push("interaction: width 16..64, height 16..80");
  if(walls.some(w=>w&&rectsOverlap(a,w)))report.errors.push("interaction: overlaps wall, door or hazard");
  if(l.interactions.slice(0,i).some(b=>b&&rectsOverlap(a,b)))report.errors.push("interaction: overlaps another interaction");
 }
 const spawn=l.spawn&&{x:l.spawn.x,y:l.spawn.y,width:28,height:28};
 for(const rect of [spawn,l.goal,...walls,...list("collectibles"),...l.interactions])if(rect&&(rect.x<0||rect.y<0||rect.x+rect.width>l.width||rect.y+rect.height>l.height))report.errors.push("quest: rectangle outside level");
 if(spawn&&walls.some(w=>w&&rectsOverlap(spawn,w)))report.errors.push("quest: player starts in a blocker");
 const graph=new Map(),array=v=>Array.isArray(v)?v:[];
 for(const item of list("collectibles"))if(item)graph.set("item:"+item.id,item.revealBy?["action:"+item.revealBy]:[]);
 for(const a of l.interactions)if(a)graph.set("action:"+a.id,[...array(a.requires).map(id=>"objective:"+id),...array(a.needs).map(id=>"item:"+id)]);
 for(const o of list("objectives"))if(o)graph.set("objective:"+o.id,[...array(o.collect).map(id=>"item:"+id),...array(o.interact).map(id=>"action:"+id)]);
 const visiting=new Set(),visited=new Set();
 function cycle(node){if(visiting.has(node))return true;if(visited.has(node))return false;visiting.add(node);for(const next of graph.get(node)||[])if(cycle(next))return true;visiting.delete(node);visited.add(node);return false;}
 if([...graph.keys()].some(cycle))report.errors.push("quest: circular requirements/reveal chain would block progress");
}
// Soccer is a one-screen shooting challenge; keep configuration bounded and readable.
function checkSoccer(pack,report){
 const l=pack.level;if(!l||l.mode!=="soccer")return;
 if(l.width!==960||l.height!==640)report.errors.push("soccer: use a 960x640 pitch");
 const c=l.soccer;if(!c||typeof c!=="object"||Array.isArray(c)){report.errors.push("soccer: settings object required");return;}
 function range(v,min,max,label,integer=false){if(!packIsNumber(v)||v<min||v>max||(integer&&!Number.isInteger(v)))report.errors.push("soccer."+label+": use "+min+".."+max);}
 range(c.seconds,15,180,"seconds");range(c.targetScore,1,20,"targetScore",true);
 range(c.playerSpeed,100,260,"playerSpeed");range(c.startPower,320,720,"startPower");range(c.drag,40,240,"drag");
 range(c.ballRadius,6,12,"ballRadius");range(c.keeperSpeed,30,180,"keeperSpeed");range(c.keeperHeight,24,90,"keeperHeight");range(c.shootingLine,500,700,"shootingLine");
 if(l.spawn){range(l.spawn.x,60,c.shootingLine,"spawn.x");range(l.spawn.y,160,570,"spawn.y");}
 if(l.goal&&checkRect(l.goal,"soccer.goal",report,true)){
  if(l.goal.x!==880||l.goal.width!==8||l.goal.y<180||l.goal.height<100||l.goal.height>260||l.goal.y+l.goal.height>550)report.errors.push("soccer.goal: x 880, width 8, height 100..260, between y 180 and 550");
  if(c.keeperHeight>l.goal.height-32)report.errors.push("soccer: leave space beside the keeper");
  if(l.goal.requires&&l.goal.requires.length)report.errors.push("soccer: goal requirements are not used");
 }
 for(const name of ["solids","hazards","collectibles","objectives","doors","waves","interactions"]){if(l[name]!==undefined&&(!Array.isArray(l[name])||l[name].length))report.errors.push("soccer: "+name+" must be empty");}
 for(const name of ["combat","shooter","pursuit","basketball","challenge"])if(l[name]!==undefined)report.errors.push("soccer: use soccer settings, not "+name);
}

// Football uses a fixed field. Validate tunable difficulty and reject unsupported systems.
function checkFootball(pack,report){
 const l=pack.level;if(!l||l.mode!=="football")return;
 if(l.width!==960||l.height!==640)report.errors.push("football: use a 960x640 field");
 const c=l.football;if(!c||typeof c!=="object"||Array.isArray(c)){report.errors.push("football: settings object required");return;}
 function range(v,min,max,label,integer=false){if(!packIsNumber(v)||v<min||v>max||(integer&&!Number.isInteger(v)))report.errors.push("football."+label+": use "+min+".."+max);}
 range(c.seconds,15,180,"seconds");range(c.targetTouchdowns,1,5,"targetTouchdowns",true);range(c.attempts,1,10,"attempts",true);
 if(c.targetTouchdowns>c.attempts)report.errors.push("football: target cannot exceed attempts");
 range(c.playerSpeed,120,220,"playerSpeed");range(c.sprintSpeed,c.playerSpeed,300,"sprintSpeed");range(c.sprintSeconds,0.5,5,"sprintSeconds");range(c.recovery,0.1,2,"recovery");range(c.defenderSpeed,40,140,"defenderSpeed");range(c.noticeRadius,60,250,"noticeRadius");
 if(c.defenderSpeed>=c.playerSpeed)report.errors.push("football: defenders must be slower than the runner");
 if(l.spawn){range(l.spawn.x,90,180,"spawn.x");range(l.spawn.y,180,550,"spawn.y");}
 if(l.goal&&(l.goal.x!==810||l.goal.y!==150||l.goal.width!==90||l.goal.height!==430||l.goal.requires?.length))report.errors.push("football.goal: use x810 y150 width90 height430 without requirements");
 const solids=Array.isArray(l.solids)?l.solids:[];
 if(solids.length>6)report.errors.push("football: use at most six training pads");
 for(const b of solids){if(b&&checkRect(b,"football.pad",report,true)&&(b.x<260||b.x+b.width>760||b.y<180||b.y+b.height>550||b.width>100||b.height>150))report.errors.push("football: pads must fit x260..760, y180..550, max 100x150");}
 if(!Array.isArray(c.defenders)||c.defenders.length<1||c.defenders.length>4)report.errors.push("football: use one to four defenders");
 else for(const d of c.defenders){
  if(!d||typeof d!=="object"){report.errors.push("football: defender object required");continue;}
  range(d.x,300,740,"defender.x");range(d.y,180,550,"defender.y");
  if(d.direction!==undefined&&d.direction!==-1&&d.direction!==1)report.errors.push("football: direction must be -1 or 1");
  if(solids.some(b=>b&&d.x+14>b.x&&d.x-14<b.x+b.width&&d.y+14>b.y&&d.y-14<b.y+b.height))report.errors.push("football: defender starts inside a pad");
 }
 for(const name of ["hazards","collectibles","objectives","doors","waves","interactions"])if(l[name]!==undefined&&(!Array.isArray(l[name])||l[name].length))report.errors.push("football: "+name+" must be empty");
 for(const name of ["combat","shooter","pursuit","soccer","basketball","challenge"])if(l[name]!==undefined)report.errors.push("football: use football settings, not "+name);
}

// Ranch is an open paddock. Reject settings this mode cannot honor rather than ignore them.
function checkRanch(pack,report){
 const l=pack.level;if(!l)return;
 if(l.mode!=="ranch"){if(l.ranch!==undefined)report.errors.push("ranch settings require ranch mode");return;}
 if(l.width!==960||l.height!==640)report.errors.push("ranch: use a 960x640 canvas");
 const c=l.ranch;if(!c||typeof c!=="object"||Array.isArray(c)){report.errors.push("ranch: settings object required");return;}
 function range(v,min,max,label,integer=false){if(!packIsNumber(v)||v<min||v>max||(integer&&!Number.isInteger(v)))report.errors.push("ranch."+label+": use "+min+".."+max);}
 range(c.seconds,15,180,"seconds");range(c.targetCatches,1,6,"targetCatches",true);range(c.playerSpeed,140,260,"playerSpeed");range(c.calfSpeed,40,130,"calfSpeed");
 range(c.catchRange,40,100,"catchRange");range(c.catchCooldown,0.3,2,"catchCooldown");range(c.fleeRadius,80,220,"fleeRadius");
 if(c.calfSpeed>=c.playerSpeed)report.errors.push("ranch: player must be faster than calves");
 if(c.fleeRadius<c.catchRange)report.errors.push("ranch: fleeRadius must be at least catchRange");
 if(l.spawn){range(l.spawn.x,74,886,"spawn.x");range(l.spawn.y,164,566,"spawn.y");}
 if(l.goal&&(l.goal.x!==760||l.goal.y!==40||l.goal.width!==180||l.goal.height!==80||l.goal.requires?.length))report.errors.push("ranch.goal: safe pen uses x760 y40 width180 height80, no requirements");
 if(!Array.isArray(c.calves)||c.calves.length<1||c.calves.length>6)report.errors.push("ranch: one to six calves required");
 else{
  if(c.targetCatches>c.calves.length)report.errors.push("ranch: target cannot exceed calf count");
  const ids=new Set();
  for(const calf of c.calves){
   if(!calf||typeof calf!=="object"){report.errors.push("ranch: calf object required");continue;}
   if(!packIsText(calf.id)||!PACK_ID_PATTERN.test(calf.id)||ids.has(calf.id))report.errors.push("ranch: calf IDs must be unique lowercase IDs");ids.add(calf.id);
   range(calf.x,74,886,"calf.x");range(calf.y,164,566,"calf.y");range(calf.heading,0,360,"calf.heading");
   if(l.spawn&&Math.hypot(calf.x-l.spawn.x,calf.y-l.spawn.y)<=c.catchRange)report.errors.push("ranch: start calves outside the player's catch range");
  }
 }
 for(const name of ["solids","hazards","collectibles","objectives","doors","waves","interactions"])if(l[name]!==undefined&&(!Array.isArray(l[name])||l[name].length))report.errors.push("ranch: "+name+" must be empty");
 for(const name of ["combat","shooter","pursuit","soccer","football","basketball","challenge"])if(l[name]!==undefined)report.errors.push("ranch: unsupported settings "+name);
}
