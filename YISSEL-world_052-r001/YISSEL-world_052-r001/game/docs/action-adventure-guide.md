# Action-adventure / beat 'em up guide

**Castle Guard Run** (`beat_em_up_sample`) combines platformer movement and melee.
**Relic Courtyard** (`action_adventure_sample`) combines top-down exploration and melee.
Both reuse the arena combat engine, so students learn one system across three modes.
They each contain a home, guide NPC, save/review points, key, relic, locked gate and exit.

## Controls and goals

Move with WASD/arrows. **Tap J** to strike in the direction you face. The light marker
on the player shows that direction. Platformers start facing right. **Space jumps**
in platformers and never attacks there. In top-down games, Space is an alternative
attack button; it does not jump. Tap again after the cooldown: holding J is not auto-fire.

A yellow rectangle briefly shows the reach of an attack. An enemy hit flashes yellow
and pauses for 0.18 seconds, letting you retreat before contact damage resumes. A
strike can hit multiple enemies in its rectangle, once each, but never through a wall
or closed door. This is melee, not a projectile or a full sword-animation system.

Collect the gate key and relic, clear all enemies/waves, then touch the gold exit.
The gate opens after collecting the key; the exit stays gray until BOTH combat and
collection requirements are complete. You do not have to kill an enemy to pick up an item.

White outlines mean temporary damage protection. At zero HP the attempt freezes;
R retries and Escape leaves without a reward. R resets health, enemies, waves, timers,
items and doors. Hazards/falling also restart the whole attempt. Winning saves the
normal reward once; completing the same level again does not award extra coins.

## Add combat to a student design

Keep `level.mode` as `platformer` or `topdown`, and add `level.combat` and `level.waves`.
The existing arena mode continues to use these same fields. Without `combat`, the
original platformer and adventure remain non-combat. Do not mix combat with `shooter`
or `pursuit` in this version; their controls and damage rules need a separate design.

| Combat setting | Meaning | Allowed range |
|---|---|---|
| `playerHealth` | Starting HP | Whole number 1–20 |
| `attackDamage` | Damage per enemy per strike | Whole number 1–10 |
| `attackReach` | Distance of the strike rectangle | 16–96 pixels |
| `attackCooldown` | Time between accepted presses | 0.15–2 seconds |
| `invulnerabilitySeconds` | Protection after damage | 0.3–3 seconds |

`waves` contains 1–10 objects, each with an `enemies` array of 1–8 guards. An enemy
needs a unique lowercase `id`, x/y, width/height (8–64 pixels), health (1–20), damage
(1–10) and speed (0–160 pixels per second). Health/damage must be whole numbers.
Start with one wave and two guards. More waves arrive 0.8 seconds after the prior wave
is cleared, with a brief player grace period. Repeated waves reuse their authored
positions, so design those positions away from likely player routes.

The sample gives the player five HP, a 64-pixel strike, a 0.35-second cooldown and
one second of protection after contact. Change one number at a time and test whether
the player can safely attack, retreat and collect the items.

## Layout and behavior limits

Keep the level within one screen, at most 960 by 640. Enemy spawns cannot overlap
walls, hazards, locked doors, the player start or another guard in the same wave.
Platformer guards must start on solid ground. They move horizontally, stop at walls
and ledges, and do not jump, climb, fall or fly toward an airborne player. Give the
player an accessible route to fight each guard.

Top-down and arena guards follow on one axis and slide against walls. They do not
perform maze pathfinding. Use simple layouts; complex rooms may require authored
encounters or navigation later. There are no combos, blocking, enemy ranged attacks,
knockback, weapon inventory, scrolling or multiplayer in this first melee extension.
Player movement retains the engine's per-frame physics; combat timers/enemy speed
use elapsed seconds. Test difficulty on classroom devices.

## Read the annotated code

`arenaCombat.js` owns copied enemy state, attack geometry, damage protection, wave
progression and HUD. `arenaWallBetween` checks sight between centers to prevent hits
through cover. A successful strike sets a short `hitStun` timer; damage never edits
the student's saved pack. `studentGameScene.js` chooses movement, keeps platformer
Space separate from attack, and requires combat plus collection before completion.
`packValidator.js` checks both arena packs and combat-enabled adventure packs.

Copy a whole student folder, then assign unique pack, level and reward IDs. Edit the
annotated pack first; avoid copying engine functions into each student's project.

## Export and Overworld

Run `node scripts/export-student.js beat_em_up_sample` or
`node scripts/export-student.js action_adventure_sample`, choosing a new output folder
if needed. Open the exported index.html or host the entire folder. Exports include
only the selected pack, its guide and local saves. Class cloud/review services remain
in the Overworld. Both home portals route to the correct movement mode and return home.

Before sharing: run `node --test tests/*.test.js` and `node scripts/validate-packs.js`.
Play through defeat/retry, a wall-blocked strike, jumping without attacking, both
collection tasks, the win, and a replay to check that rewards do not duplicate.
