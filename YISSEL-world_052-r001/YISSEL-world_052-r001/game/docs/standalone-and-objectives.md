# Your home, game, keys and doors

The same `js/students/<your_id>/pack.js` runs in your exported game and in the class
Overworld. Keep your ID and level ID unchanged when moving between them. Your teacher
maintains the engine; you customize the annotated data in your own student folder.

## Play and edit

Open the exported `index.html` in a browser. You start in your home. Move with WASD or
arrow keys and press E near a portal. In the game, use A/D or left/right to move and
Space, W or Up to jump. Touch a collectible to pick it up. R restarts the attempt;
Escape returns home. Your home's exit opens the standalone menu, or returns to the
Overworld when playing the class version.

The sample asks you to collect a key, jump over a hazard and reach the gold goal.
Purple doors are solid until their requirements are met. The objective text shows
what remains; the door label also changes from locked to open.

## What the pack sections mean

| Section | Purpose | Example change |
|---|---|---|
| `schemaVersion: 1` | Identifies this supported data format | Leave at 1 |
| `manifest` | Identifies your project and its Overworld home | Name and description |
| `home` | Places your NPC, portal and exit | Move an NPC using tile coordinates |
| `dialogue` | Contains the NPC's words | Explain why the player enters your game |
| `level` | Describes your playable area | Move platforms, key, door and goal |

Home positions use **tiles**. Level positions use **pixels**. The game canvas is
960 by 640; x increases to the right and y increases downward. Keep this first
version within that screen: scrolling levels are not implemented by this change.

## Connect an item, objective and door

Add these fields inside `level`, alongside `spawn`, `solids` and `hazards`:

```js
// A collectible is a rectangle the player touches. IDs must be unique in this list.
collectibles: [
  { id: "lab_key", label: "Key", x: 250, y: 530, width: 24, height: 24 }
],
// collect lists ITEM IDs. All listed items must be collected in the same attempt.
objectives: [
  { id: "find_key", label: "Find the lab key", collect: ["lab_key"] }
],
// requires lists OBJECTIVE IDs. The engine opens this door automatically.
doors: [
  { id: "lab_door", label: "Lab door", x: 760, y: 440,
    width: 24, height: 120, requires: ["find_key"] }
],
// Also lock the goal so jumping over a door cannot bypass the task.
goal: { x: 820, y: 480, width: 40, height: 80, requires: ["find_key"] }
```

To collect three supplies, create three collectible rectangles with different IDs,
then put all three IDs in one objective's `collect` array. Use meaningful IDs such as
`wood`, `food` and `water`. These are story items, not the persistent completion coins.
Multiple doors can depend on the same objective. Items are not consumed when doors
open. A door or goal without `requires` is always open. A level without these optional
fields behaves like an earlier platformer pack.

An objective is currently a **collection task**. Switch puzzles and additional genre modes are later additions; they are not silently
enabled by naming an objective after them.

## Restart and save rules

Collectibles and door states last for one attempt. A hazard, falling out of bounds,
pressing R, or leaving and re-entering the level resets them. Finishing a level saves
its completion and reward. Repeating it does not award the completion coins twice.
Local save data is stored in this browser. Standalone saves have a namespace for your
pack ID and are separate from Overworld saves; they do not automatically transfer
between computers, domains or the class game. Browsers can restrict storage for files
opened directly, so use a static web host when you need reliable local persistence.

## Export and return to the Overworld (teacher)

From the engine folder, run:

```text
npm run validate
npm test
npm run export:student -- sample
```

The exporter writes `exports/sample/`. It refuses an existing destination rather than
overwriting edits. To export another revision, provide a new folder:

```text
node scripts/export-student.js sample exports/sample-revision-2
```

Upload the **whole generated folder** to a static host, or distribute it as a ZIP.
It contains no teacher admin pages, other student packs, classroom authentication,
cloud credentials or submission service. No application server is required for this
offline single-player build. Assets must live inside `js/students/<id>/` and use paths
relative to the root `index.html`, for example `js/students/sample/assets/key.png`.
The exporter copies those assets; this milestone still renders placeholder rectangles.
Do not reference another student's folder or an external URL for a self-contained game.
Executable pack JavaScript is trusted classroom code and should be reviewed before use.

To import revisions into the class game:

1. Use engine version 2.3.0 or newer with this schema support.
2. Copy only the student's folder back into `js/students/<id>/` after reviewing the diff.
3. Preserve unique pack/level IDs and teacher-assigned map coordinates.
4. Add one script tag for its `pack.js` to the class `index.html` if not already present.
5. Run validation; test home → game → completion/quit → same home → Overworld.

Do not replace the class engine with a student's exported runtime or copy
`standalone-settings.js` into the class build. No import/upload happens automatically.

## Check your game

- Touch the goal before finding the key: it must stay locked.
- Touch the key once: the objective changes to 1/1 and the door opens.
- Touch a hazard: the key reappears and the door locks again.
- Press R: the same reset happens without earning a reward.
- Complete the objective and reach the goal: you return to your own home.
- Replay and finish again: completion coins are not duplicated.
- Press Escape during a level: return home without completing it.
- Use F3 to see misspelled IDs or invalid rectangles, then fix your pack.

Describe one change, why you made it, and how you tested it in your project log.

Top-down adventures are available in engine 2.4.0. See the [top-down guide](topdown-adventure-guide.md). Export and objective rules are shared; walking replaces jumping.

Arena combat is available in engine 2.5.0. See the [arena combat guide](arena-combat-guide.md). Collection objectives remain optional alongside the required enemy waves.

Timed shooting challenges are available in engine 2.6.0. See the [sports / skill guide](sports-skill-guide.md). Sports mode uses score and time instead of collection objectives.
