# Puzzle and quest interactions

**Signal Tower Delivery** (`puzzle_platformer_sample`) and **Archive Mystery**
(`quest_adventure_sample`) demonstrate the same four-step quest in platformer and
top-down movement. Restore power, inspect the note, find the revealed parcel, and
deliver it to the archivist before using the gold exit.

## Play

Move with WASD/arrows. Space jumps in the platformer only. Press **E** near a switch,
clue or NPC. The closest visible interaction within 56 pixels of the player's center
is selected; walls and closed doors block interactions. The on-screen prompt names it.
Press E or Enter to close a message. Closing never activates another interaction.

Reading pauses movement, enemies and countdowns for that attempt. R still restarts;
Escape still returns home. Switches stay on, clues stay read, and delivered tasks
stay completed until a restart. A repeated conversation shows the object's doneText.

Delivery is recorded in a collection journal. It does NOT consume the item or remove
its collection objective. This keeps multi-step tasks from undoing earlier progress.
Items are hidden and cannot be collected until their reveal interaction is completed.
The gold exit waits for its required objectives, plus combat clearing if combat exists.

## Design the steps in pack.js

`level.interactions` contains up to 16 objects. Each needs:
- Unique lowercase `id`; `type` of `switch`, `clue` or `npc`.
- `label` (1–24 characters), x/y, width (16–64), height (16–80), in pixels.
- `text`: message after first successful activation.
- `lockedText`: message when prerequisites or needed items are missing.
- `doneText`: message after this interaction has already been completed.
- Optional `requires`: OBJECTIVE IDs that must already be complete.
- Optional `needs`: ITEM IDs that must already have been collected, for deliveries.

Messages are plain text, 1–220 characters, with words no longer than 60 characters.
The panel wraps them automatically. Keep interaction rectangles off walls, doors,
hazards and each other. They are interaction markers, not solid collision objects.
The level must fit one screen (up to 960 by 640).

Objectives now accept `collect` (item IDs), `interact` (interaction IDs), or both.
At least one nonempty list is required. Every listed ID must be completed. Old
collection-only objectives continue working without changes.

```js
// An action completes this objective; the door uses the objective ID.
{ id: "power_on", label: "Restore power", interact: ["power_switch"] }
// A collectible remains hidden until the clue action succeeds.
{ id: "parcel", label: "Parcel", x: 660, y: 220,
  width: 24, height: 24, revealBy: "archive_note" }
```

Doors and goals still use `requires` with OBJECTIVE IDs. For example, the sample's
power gate requires `power_on`, and its goal requires `delivered`. A prerequisite
objective can itself require another interaction, forming a multi-step chain.

The validator rejects unknown IDs, repeated references, malformed settings and
circular requirements (including a clue needing the item it must reveal). It does
not solve physical puzzles: a valid ID chain can still be unreachable if you place
its switch behind its own locked door. Playtest the actual route.

## Read the annotated engine code

`levelObjectives.js` stores per-attempt `collected` and `interacted` sets and checks
mixed objectives. `questInteractions.js` finds the nearest unobstructed target,
checks prerequisites, records one successful activation, and draws objects/messages.
`studentGameScene.js` routes E and pauses the attempt while reading. All state resets
on R, hazards/falling or re-entry; original pack data stays unchanged. A win uses the
existing once-only reward/save system. Mid-quest progress is not saved between visits.

Interactions work in platformer and top-down games. They can coexist with one of the
existing combat/shooter/pursuit modules; reading pauses those systems too. These
examples deliberately have no enemies so students can first understand quest logic.
There are no branching dialogue choices, item consumption, toggling switches, crate
pushing, code-entry puzzles, full inventories or persistent quest journals yet.

## Standalone and Overworld

Each example has an independent home, guide, save/review points and reward ID. Export:
`node scripts/export-student.js puzzle_platformer_sample` or
`node scripts/export-student.js quest_adventure_sample`. Use a new output folder.
Open its index.html or host the entire folder. Exported saves are local and isolated;
class cloud/submission services remain in the Overworld.

Run `node --test tests/*.test.js` and `node scripts/validate-packs.js` before sharing.
Test talking before and after delivery, hidden-item pickup, a closed gate, reset,
normal completion and replay without duplicate rewards.
