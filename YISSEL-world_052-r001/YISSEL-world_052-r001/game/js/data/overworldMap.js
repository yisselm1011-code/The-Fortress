// TEACHER-OWNED: Main Plaza tilemap. Home icons are placed by homeRegistry, not this file.
const TILE_SIZE = 32;

const TILE_COLORS = {
  0: null,
  1: "#4caf50",
  2: "#d2b48c",
  3: "#3a83c4",
  4: "#1b5e20",
  5: "#8d5524",
  6: "#777777"
};

// Collision tiles: water, trees, buildings, and walls block movement.
const COLLISION_TILE_IDS = [3, 4, 5, 6];

function createEmptyLayer(width, height, fillValue) {
  const layer = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      layer.push(fillValue);
    }
  }
  return layer;
}

function setTile(layer, width, x, y, value) {
  layer[y * width + x] = value;
}

function fillRect(layer, width, x, y, w, h, value) {
  for (let row = y; row < y + h; row++) {
    for (let col = x; col < x + w; col++) {
      setTile(layer, width, col, row, value);
    }
  }
}

function buildMainPlazaLayers(width, height) {
  const ground = createEmptyLayer(width, height, 1);
  const collision = createEmptyLayer(width, height, 0);

  // Border trees around the plaza.
  for (let x = 0; x < width; x++) {
    setTile(ground, width, x, 0, 4);
    setTile(collision, width, x, 0, 4);
    setTile(ground, width, x, height - 1, 4);
    setTile(collision, width, x, height - 1, 4);
  }
  for (let y = 0; y < height; y++) {
    setTile(ground, width, 0, y, 4);
    setTile(collision, width, 0, y, 4);
    setTile(ground, width, width - 1, y, 4);
    setTile(collision, width, width - 1, y, 4);
  }

  // Water corners for visual framing.
  fillRect(ground, width, 1, 1, 3, 2, 3);
  fillRect(collision, width, 1, 1, 3, 2, 3);
  fillRect(ground, width, width - 4, 1, 3, 2, 3);
  fillRect(collision, width, width - 4, 1, 3, 2, 3);

  // Main cross paths through the plaza.
  fillRect(ground, width, 8, 4, 24, 3, 2);
  fillRect(ground, width, 18, 6, 4, 18, 2);

  // District gate placeholder on the right edge (wall tiles).
  fillRect(ground, width, width - 3, 12, 2, 4, 6);
  fillRect(collision, width, width - 3, 12, 2, 4, 6);

  // Hub sign area near spawn.
  fillRect(ground, width, 14, 10, 2, 2, 6);
  fillRect(collision, width, 14, 10, 2, 2, 6);

  // Building footprints only. Home icons and lock state come from pack.js / plotHomes.
  const homePlots = [
    { x: 10, y: 8, w: 2, h: 2 },
    { x: 24, y: 8, w: 2, h: 2 },
    { x: 10, y: 20, w: 2, h: 2 },
    { x: 24, y: 20, w: 2, h: 2 },
    { x: 17, y: 14, w: 2, h: 2 }
  ];

  for (let i = 0; i < homePlots.length; i++) {
    const plot = homePlots[i];
    fillRect(ground, width, plot.x, plot.y, plot.w, plot.h, 5);
    fillRect(collision, width, plot.x, plot.y, plot.w, plot.h, 5);
  }

  return { ground: ground, collision: collision };
}

const MAP_WIDTH = 40;
const MAP_HEIGHT = 30;
const mainPlazaLayers = buildMainPlazaLayers(MAP_WIDTH, MAP_HEIGHT);

const overworldMap = {
  tileSize: TILE_SIZE,
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
  layers: mainPlazaLayers,
  spawn: {
    x: 18 * TILE_SIZE + 8,
    y: 14 * TILE_SIZE + 8
  },
  signPosition: {
    x: 14 * TILE_SIZE,
    y: 10 * TILE_SIZE,
    width: 64,
    height: 64
  }
};

function getTileColor(tileId) {
  return TILE_COLORS[tileId] || "#222222";
}

function buildCollisionFromMap(map) {
  const solids = [];
  const layer = map.layers.collision;
  const tileSize = map.tileSize;

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const tileId = layer[y * map.width + x];
      if (COLLISION_TILE_IDS.includes(tileId)) {
        solids.push({
          x: x * tileSize,
          y: y * tileSize,
          width: tileSize,
          height: tileSize
        });
      }
    }
  }

  return solids;
}

function drawTilemapLayer(ctx, map, camera) {
  const camX = camera ? camera.x : 0;
  const camY = camera ? camera.y : 0;
  const layer = map.layers.ground;
  const tileSize = map.tileSize;

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const tileId = layer[y * map.width + x];
      const color = getTileColor(tileId);
      if (!color) {
        continue;
      }

      ctx.fillStyle = color;
      ctx.fillRect(
        x * tileSize - camX,
        y * tileSize - camY,
        tileSize,
        tileSize
      );
    }
  }
}
