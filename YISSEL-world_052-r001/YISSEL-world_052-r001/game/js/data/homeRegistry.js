// TEACHER-OWNED: builds the overworld home list from student packs + locked plots.
const HOME_ICON_COLORS = {
  purple: "#9b59b6",
  blue: "#3498db",
  orange: "#e67e22",
  gray: "#7f8c8d",
  green: "#27ae60",
  red: "#e74c3c",
  yellow: "#f1c40f"
};

// Plot placeholders until students are approved and registered.
const plotHomes = [
  {
    id: "locked_home",
    name: "Locked Home",
    author: "Future Student",
    description: "Placeholder home for a future student submission.",
    iconColor: "gray",
    position: { x: 768, y: 256 },
    width: 32,
    height: 32,
    locked: true
  },
  {
    id: "plot_home_a",
    name: "Home Plot A",
    author: "Future Student",
    description: "Reserved home plot.",
    iconColor: "blue",
    position: { x: 320, y: 640 },
    width: 32,
    height: 32,
    locked: true
  },
  {
    id: "plot_home_b",
    name: "Home Plot B",
    author: "Future Student",
    description: "Reserved home plot.",
    iconColor: "orange",
    position: { x: 768, y: 640 },
    width: 32,
    height: 32,
    locked: true
  },
  {
    id: "plot_home_c",
    name: "Home Plot C",
    author: "Future Student",
    description: "Reserved home plot.",
    iconColor: "green",
    position: { x: 544, y: 448 },
    width: 32,
    height: 32,
    locked: true
  }
];

// Every pack that ships a level gets its own key, so the six hand-written rewards
// below do not have to stretch across a full class roster.
function ensurePackRewards() {
  for (let i = 0; i < studentManifests.length; i++) {
    const m = studentManifests[i].manifest;
    if (!m.rewardId || rewardRegistry[m.rewardId]) {
      continue;
    }
    rewardRegistry[m.rewardId] = {
      type: "key",
      color: HOME_ICON_COLORS[m.iconColor] || "#ffffff",
      label: m.name + " Key"
    };
  }
}

function buildHomeRegistryFromManifests() {
  const registry = [];

  for (let i = 0; i < studentManifests.length; i++) {
    const m = studentManifests[i].manifest;
    if (!m.position) {
      continue;
    }
    registry.push({
      id: m.id,
      name: m.name,
      author: m.author,
      description: m.description,
      iconColor: m.iconColor,
      position: m.position,
      width: m.width || 32,
      height: m.height || 32,
      homeScene: "home_" + m.id,
      locked: !!m.locked,
      platformerLevelId: m.platformerLevelId,
      rewardId: m.rewardId
    });
  }

  for (let j = 0; j < plotHomes.length; j++) {
    const plot = plotHomes[j];
    const already = registry.some(function (h) { return h.id === plot.id; });
    if (!already) {
      registry.push({
        ...plot,
        homeScene: null,
        locked: true
      });
    }
  }

  return registry;
}

let homeRegistry = [];

function refreshHomeRegistry() {
  ensurePackRewards();
  homeRegistry = buildHomeRegistryFromManifests();
}

refreshHomeRegistry();

function validateHomeRegistry(registry) {
  const seenIds = {};
  for (let i = 0; i < registry.length; i++) {
    const home = registry[i];
    const label = "Home registry entry " + i;
    if (!home.id) {
      console.warn(label + ": missing id");
      continue;
    }
    if (seenIds[home.id]) {
      console.warn(label + ": duplicate id '" + home.id + "'");
    }
    seenIds[home.id] = true;
    if (!home.name) console.warn(label + " (" + home.id + "): missing name");
    if (!home.locked && !home.homeScene) {
      console.warn(label + " (" + home.id + "): missing homeScene");
    }
    if (!home.position) console.warn(label + " (" + home.id + "): missing position");
    if (!home.width || !home.height || home.width <= 0 || home.height <= 0) {
      console.warn(label + " (" + home.id + "): invalid dimensions");
    }
  }
}

function drawHomeIcons(ctx, registry, camera) {
  const camX = camera ? camera.x : 0;
  const camY = camera ? camera.y : 0;

  for (let i = 0; i < registry.length; i++) {
    const home = registry[i];
    if (!home.position) {
      continue;
    }
    const color = HOME_ICON_COLORS[home.iconColor] || "#ffffff";
    ctx.fillStyle = color;
    ctx.fillRect(
      home.position.x - camX,
      home.position.y - camY,
      home.width,
      home.height
    );
    if (home.locked) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.fillRect(
        home.position.x - camX,
        home.position.y - camY,
        home.width,
        home.height
      );
    }
    if (typeof isHomeVisited === "function" && isHomeVisited(home.id)) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px monospace";
      ctx.fillText("*", home.position.x - camX + 4, home.position.y - camY + 14);
    }
  }
}

function buildHomeInteractables(registry) {
  const interactables = [];

  for (let i = 0; i < registry.length; i++) {
    const home = registry[i];
    if (!home.position) {
      continue;
    }
    interactables.push({
      type: INTERACTABLE_TYPES.HOME_ENTRANCE,
      id: home.id,
      name: home.name,
      homeScene: home.homeScene,
      locked: !!home.locked,
      x: home.position.x,
      y: home.position.y,
      width: home.width,
      height: home.height
    });
  }

  interactables.push({
    type: INTERACTABLE_TYPES.SIGN,
    id: "hub_sign",
    name: "Class Hub Sign",
    dialogueKey: "hubSign",
    x: overworldMap.signPosition.x,
    y: overworldMap.signPosition.y,
    width: overworldMap.signPosition.width,
    height: overworldMap.signPosition.height
  });

  if (typeof overworldDoors !== "undefined") {
    for (let d = 0; d < overworldDoors.length; d++) {
      const door = overworldDoors[d];
      interactables.push({
        type: INTERACTABLE_TYPES.COLORED_DOOR,
        id: door.id,
        name: door.name,
        requires: door.requires,
        dialogueKeyLocked: door.dialogueKeyLocked || "doorLocked",
        x: door.x,
        y: door.y,
        width: door.width,
        height: door.height
      });
    }
  }

  return interactables;
}
