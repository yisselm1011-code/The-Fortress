# Build your first top-down adventure

Start with `js/students/topdown_sample/pack.js`. It contains the annotated **Lost
Archive** example: a home, an archivist, two rooms, a key, a door, a page and an exit.
This is a working starter, not a confirmed assignment for any particular student.

## Play the example

In the Overworld, enter the green **The Lost Archive** home. In a standalone export,
you begin inside that home. Talk to the archivist using E, then use the purple portal.

1. Walk with WASD or the arrow keys. There is no gravity, jumping or diagonal movement.
2. Touch the key in the west room. The study door opens automatically.
3. Walk through the doorway and collect the page in the east room.
4. Reach the gold exit to complete the task and return home.

R restarts the attempt. Escape returns home without completing it. Touching the red
spill resets the player, key, page and door. Completion rewards are saved only once
per level. Standalone saves remain separate from class-game saves.

## Make one change at a time

| Code section | Meaning | Safe first change |
|---|---|---|
| `manifest.name` | Title displayed in the home list | Give your adventure a title |
| `dialogue.mission.lines` | Instructions spoken by the NPC | Explain your character's reason to explore |
| `level.mode` | Selects movement rules | Keep `"topdown"` for this template |
| `level.spawn` | Where the player starts | Move it into clear floor space |
| `level.solids` | Walls and obstacles | Move a wall without blocking the only route |
| `level.collectibles` | Items picked up by touch | Turn the page into a supply or clue |
| `level.objectives` | Tasks listing required item IDs | Require two clues instead of one |
| `level.doors` | Walls that open when tasks are done | Change which objective opens the door |
| `level.goal.requires` | Tasks needed to finish | Require every essential task |

Home positions are **tiles**. Game positions are **pixels**. Every rectangle has
`x`, `y`, `width` and `height`; x increases right, y increases down. The blue player is
28 × 28 pixels, so make passages comfortably wider than 28 pixels. This template fits
within 960 × 640 pixels and does not scroll. The validator checks screen bounds and
rejects a spawn inside a wall, hazard or locked door.

Three kinds of names connect your design:

```js
// An ITEM is something the player touches.
{ id: "archive_key", label: "Archive key", x: 208, y: 224, width: 24, height: 24 }

// An OBJECTIVE lists item IDs. All listed items must be collected.
{ id: "find_key", label: "Find the archive key", collect: ["archive_key"] }

// A DOOR lists objective IDs. It opens when those objectives are finished.
{ id: "study_door", label: "Study door", x: 464, y: 300,
  width: 32, height: 96, requires: ["find_key"] }
```

Keep spelling consistent. A readable `label` can contain spaces; IDs use lowercase
letters, numbers and underscores. Do not put a key behind the only door that requires
that key. The validator catches missing IDs, but you must playtest the route.

## Copy, export and reconnect (teacher)

Copy `js/students/topdown_sample/` into the student's own folder. Change `manifest.id`
to match the folder name, set a unique `level.id`, and update both `manifest.levelId`
and the portal's `levelId` to match it. Assign a unique reward ID and home position.
Old platformer packs can keep `platformerLevelId`; the engine accepts that alias.
If both aliases are supplied, they must agree. A pack-local portal targets its own
level, which keeps its standalone export independent of other students' projects.

Add its pack script to the class `index.html` and run:

```text
npm test
npm run validate
npm run export:student -- topdown_sample
```

Open `exports/topdown_sample/index.html`, or upload the entire folder to a static host.
No application server or classroom login is required. The exported project contains
this guide and the [shared export/objective reference](standalone-and-objectives.md).
Return only the student's pack folder to the class engine after reviewing changes.

## What the shared engine does

`studentGameScene.js` handles objectives, doors, hazards, restart, drawing and rewards
for both modes. `topdownScene.js` selects walking; `platformerScene.js` selects gravity
and jumping. The home portal reads `level.mode` and sends the player to the correct
scene. Each scene has independent temporary state. This avoids students maintaining
different copies of the reward or saving code.

Included: one-screen exploration, home dialogue, pickups, collection tasks, doors,
hazards, completion, return-home routing and local save support.

Not yet included: combat, enemy AI, inventory menus, crafting, branching dialogue,
game-area switches, scrolling maps, sprite animation or audio. The rectangles are
intentional placeholders while students test the design.

## Your first assignment

Rename the adventure, rewrite the NPC instructions, and customize one collectible.
Play from the beginning, finish, restart and replay. In your project log, record what
you changed, what you expected, what happened, and one fix you made. Keep the original
working copy until your revised version passes those checks.
