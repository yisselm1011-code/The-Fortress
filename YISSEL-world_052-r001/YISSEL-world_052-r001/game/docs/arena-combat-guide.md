# Build your first arena combat game

Copy `js/students/arena_sample/` to start. The annotated Training Arena contains a
home, coach, portal, one melee attack, five player health points and two robot waves.
It is a proposed teaching template, not a confirmed student game assignment.

## Play

In the Overworld, enter the orange **Training Arena** home. A standalone export
starts inside that home. Press E near the coach to hear the instructions, then use
the purple portal.

- Walk with WASD or arrow keys. Your last movement sets your facing direction.
- Face an enemy and **tap J or Space** to strike. Holding the key does not repeat.
- The yellow rectangle shows your attack reach. Enemy labels show remaining health.
- Robots follow you and cause damage on contact. A white player outline shows brief
  damage protection. Several overlapping robots cannot remove all health in one frame.
- Clear both waves, then touch the gold exit to finish and return home.
- At zero health the arena freezes: R retries, Escape returns home. These keys also
  work during a fight. The exit cannot award a victory while you are defeated.

The first prototype uses colored rectangles. Combat is functional; character art,
sprite animation, sound, projectiles, combos and multiplayer are later features.

## Understand your settings

| Setting | Meaning | Template value | Accepted range |
|---|---|---:|---|
| `combat.playerHealth` | Health at the start of an attempt | 5 | Whole number 1–20 |
| `combat.attackDamage` | Damage per strike | 1 | Whole number 1–10 |
| `combat.attackReach` | Pixels forward from player center | 56 | 16–96 |
| `combat.attackCooldown` | Seconds between strikes | 0.35 | 0.15–2 |
| `combat.invulnerabilitySeconds` | Protection after damage | 1 | 0.3–3 |
| Enemy `health` | Hits it can withstand, depending on damage | 2 | Whole number 1–20 |
| Enemy `damage` | Contact damage | 1 | Whole number 1–10 |
| Enemy `speed` | Pixels per second | 50 | 0–160 |

`speed: 0` makes a stationary practice target; touching it still causes damage.
Enemies choose the axis leading toward you and collide with walls. They do not plan
routes around complex obstacles. Keep the first arena open and playtest new walls.
Attacks cannot hit through walls or closed doors.

## Add or change a wave

```js
// Place this inside the level's waves array. Every enemy ID must be unique.
{ enemies: [
  { id: "practice_robot", x: 420, y: 300,
    width: 28, height: 28, health: 2, damage: 1, speed: 50 }
] }
```

The first wave spawns on entry. After its enemies are defeated, a short pause precedes
the next wave. The engine allows 1–10 waves and 1–8 enemies per wave; start small.
Enemy sizes are 8–64 pixels. Spawns must fit the level and cannot overlap the player
start, walls, hazards, locked doors or another enemy in the same wave. The validator
checks those rules. You still need to test whether the arena is fun and beatable.

The `goal` is the exit rectangle. Arena mode automatically locks it until every wave
is cleared. Optional collection objectives and `goal.requires` still work: both the
combat and collection requirements must be complete. Doors currently respond to
collection objectives, not enemy counts. Avoid hiding enemies behind inaccessible doors.

## Reset and save

R, re-entering the game, or touching a floor hazard restores the entire attempt:
health, enemies, wave number, cooldown, collectibles and doors. Death waits for R or
Escape instead of silently restarting. No partial combat progress is saved.

Reaching the exit after victory saves completion and awards the normal reward once.
Replaying does not generate extra completion coins. Standalone saves are isolated by
pack ID and do not automatically transfer to the Overworld or another computer.

## Where the code lives

`pack.js` is your editable design. `arenaCombat.js` runs health, timed strikes, enemy
movement, damage protection and waves. `arenaScene.js` selects arena mode.
`studentGameScene.js` shares drawing, restart, objectives, saves and return-home rules
with the platformer and adventure modes. Enemy objects are copied for each attempt,
so play never damages the original settings in your pack.

## Export and integrate (teacher)

Give the copied folder a unique `manifest.id`, `level.id`, `rewardId` and home position.
Update the manifest and portal `levelId` values to match `level.id`. Keep `mode: "arena"`.
Use engine 2.5.0 or newer, add the pack script to the class index, then run:

```text
npm test
npm run validate
npm run export:student -- arena_sample
```

Open `exports/arena_sample/index.html`, or upload the entire exported folder to a
static host. It includes the student pack, runtime and guides; no application server
or classroom sign-in is required. Review the student's changed pack folder before
importing it back into the Overworld. Do not replace the class engine with an export.

## First assignment and checks

Rename the arena, rewrite the coach instructions, and change one enemy value. Explain
what you changed and why. Verify the following before adding a third wave:

1. Walking and facing work; a strike in the wrong direction misses.
2. A successful strike reduces enemy health once; tapping too quickly respects cooldown.
3. Touching an enemy reduces player health with a grace period between hits.
4. Zero health shows defeat; R restores everything and Escape returns home.
5. The next wave starts only after the current one is cleared.
6. The exit remains locked until every wave is cleared.
7. Victory returns home, saves the reward once, and replay starts a fresh attempt.

Record a bug or challenge and your next revision in the project spreadsheet.
