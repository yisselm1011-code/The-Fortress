// BEGINNER PROJECT: YISSEL | r001 | engine 2.14.0
// Teacher-supplied starter code; not evidence that the student wrote this code.
// Play first, describe the controls and goal, then prompt and log one asset.
// Keep IDs fixed. Teacher helps with one small explained change at a time.
// manifest = identity; home = room; dialogue = guide; level = game rules.
// STUDENT TEMPLATE: Core Patrol. Edit this design; the shared engine handles the rules.
// Home positions use tiles; the level uses pixels. Keep IDs unique when copying this folder.
registerStudentPack({
  "schemaVersion": 1,
  "manifest": {
    "id": "world_052",
    "name": "YISSEL — Starter Project",
    "author": "Teacher starter for YISSEL",
    "description": "Recover the repair core, clear two turrets and reach the exit.",
    "iconColor": "yellow",
    "position": {"x":640,"y":320},
    "width": 32,
    "height": 32,
    "levelId": "world_052_level",
    "rewardId": "key_world_052"
  },
  "home": {
    "tileSize": 32,
    "width": 20,
    "height": 12,
    "spawnTile": {
      "x": 5,
      "y": 8
    },
    "interactables": [
      {
        "type": "npc",
        "id": "coach",
        "name": "Mechanic",
        "dialogueKey": "mission",
        "tileX": 4,
        "tileY": 2
      },
      {
        "type": "portal",
        "id": "mission",
        "name": "Core Patrol",
        "levelId": "world_052_level",
        "tileX": 14,
        "tileY": 4,
        "width": 48,
        "height": 48
      },
      {
        "type": "savePoint",
        "id": "save",
        "name": "Save",
        "tileX": 12,
        "tileY": 8
      },
      {
        "type": "submitPoint",
        "id": "review",
        "name": "Review",
        "tileX": 16,
        "tileY": 8
      },
      {
        "type": "exit",
        "id": "exit",
        "name": "Exit",
        "tileX": 4,
        "tileY": 9,
        "width": 64,
        "height": 32
      }
    ]
  },
  "dialogue": {
    "mission": {
      "speaker": "Mechanic",
      "lines": [
        "hello! Hold F to fire. Aim with I/up, J/left, K/down, L/right; combine for diagonals.",
        "Without aim keys you shoot where you face. Move with WASD or arrows.",
        "Walk around cover; this mode has no jumping.",
        "Turrets flash yellow before firing. Their pink shots hurt; cyan shots are yours.",
        "Collect the repair core, clear both turrets and reach the gold exit.",
        "R resets health, enemies and items. Escape returns home without a reward."
      ]
    }
  },
  "level": {
    "id": "world_052_level",
    "mode": "topdown",
    "name": "Core Patrol",
    "width": 960,
    "height": 640,
    "spawn": {
      "x": 96,
      "y": 320
    },
    // Solid cover blocks walking AND shots. Platformers need a floor.
    "solids": [
      {
        "x": 0,
        "y": 0,
        "width": 960,
        "height": 32
      },
      {
        "x": 0,
        "y": 608,
        "width": 960,
        "height": 32
      },
      {
        "x": 0,
        "y": 32,
        "width": 32,
        "height": 576
      },
      {
        "x": 928,
        "y": 32,
        "width": 32,
        "height": 576
      },
      {
        "x": 280,
        "y": 240,
        "width": 32,
        "height": 60
      },
      {
        "x": 560,
        "y": 320,
        "width": 32,
        "height": 140
      }
    ],
    "hazards": [],
    "collectibles": [
      {
        "id": "core",
        "label": "Repair core",
        "x": 220,
        "y": 320,
        "width": 24,
        "height": 24
      }
    ],
    "objectives": [
      {
        "id": "recover_core",
        "label": "Recover the repair core",
        "collect": [
          "core"
        ]
      }
    ],
    "doors": [
      {
        "id": "core_gate",
        "label": "Core gate",
        "x": 820,
        "y": 280,
        "width": 24,
        "height": 80,
        "requires": [
          "recover_core"
        ]
      }
    ],
    // The exit also waits until every turret is cleared. Collection rules still apply.
    "goal": {
      "x": 880,
      "y": 320,
      "width": 32,
      "height": 28,
      "requires": [
        "recover_core"
      ]
    },
    // OPTIONAL MODULE: remove this entire shooter block for a non-combat adventure.
    "shooter": {
      // HP and damage are whole numbers. Speed = pixels/second; intervals/lifetime = seconds.
      "playerHealth": 5,
      "damage": 1,
      "bulletSpeed": 560,
      "fireInterval": 0.25,
      "bulletLifetime": 2,
      "invulnerabilitySeconds": 1,
      // Stationary turrets aim at you at launch. Yellow means a shot is nearly ready.
      // Position each turret off walls/doors and away from the player spawn.
      "enemies": [
        {
          "id": "turret_one",
          "x": 430,
          "y": 320,
          "width": 28,
          "height": 28,
          "health": 2,
          "damage": 1,
          "bulletSpeed": 180,
          "fireInterval": 1.8
        },
        {
          "id": "turret_two",
          "x": 720,
          "y": 320,
          "width": 28,
          "height": 28,
          "health": 3,
          "damage": 1,
          "bulletSpeed": 200,
          "fireInterval": 2.2
        }
      ]
    }
  }
});
