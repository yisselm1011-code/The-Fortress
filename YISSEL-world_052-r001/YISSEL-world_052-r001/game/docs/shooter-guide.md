# Shooter / run-and-gun student guide

Two examples use the SAME shooting module:
- `js/students/run_gun_sample/pack.js`: Repair Run, with gravity and jumping.
- `js/students/topdown_shooter_sample/pack.js`: Core Patrol, with four-direction walking.

Both include a home, coach, save/review points and an exit to the Overworld. Each can
also be exported alone. Existing non-shooter templates remain unchanged.

## Controls

Move with WASD or arrows. Hold **F** to fire. Hold **I/J/K/L** to aim up/left/down/right;
combine two aim keys for diagonals. Without aim keys you fire in the direction you
last moved. A cyan line shows your aim. The initial facing is right.
Space (or W/up) jumps in the platformer; Space does not shoot or jump in top-down.
You can aim independently while running or jumping.

Cyan bullets belong to you; pink bullets belong to turrets. A yellow turret outline
warns that it is nearly ready to fire. Shots aim at your position when fired and
then travel straight, so you can dodge. Walls and locked doors block both sides'
shots and enemy sight. Collect the repair core, defeat both turrets, then touch the
gold exit. The exit stays gray until enemies AND collection tasks are finished.

HP is health. After damage, a white outline marks a short invulnerability period.
Touching an enemy also hurts. At zero HP, movement and completion stop: R retries
and Escape returns home. R resets health, enemies, bullets, timers and collected
items. Hazards/falling also restart the attempt. Leaving does not award a win.
Completing a level saves the normal reward once, so replay cannot farm coins.

## Customize one mechanic at a time

The optional `level.shooter` block enables shooting in `platformer` or `topdown`.
Do not change the mode to `shooter`; mode selects movement, shooter adds combat.
Copy the whole sample folder and assign unique pack, level, reward and enemy IDs.

| Setting | Meaning | Allowed range |
|---|---|---|
| `playerHealth` | Starting HP | Whole number 1–20 |
| `damage` | Damage per player shot | Whole number 1–10 |
| `bulletSpeed` | Player shot pixels per second | 80–1200 |
| `fireInterval` | Seconds between player shots | 0.12–3 |
| `bulletLifetime` | Seconds before ANY shot disappears | 0.2–5 |
| `invulnerabilitySeconds` | Grace period after damage | 0.3–3 |
| Enemy `health` / `damage` | Enemy HP / damage | Whole numbers 1–20 / 1–10 |
| Enemy `bulletSpeed` | Enemy shot pixels per second | 60–600 |
| Enemy `fireInterval` | Seconds between enemy shots | 0.6–5 |

Supply 1–16 stationary turrets in `enemies`, each with unique `id`, pixel position,
width/height (16–64), health, damage, bulletSpeed and fireInterval. Do not overlap
walls, hazards, doors, the player spawn or other enemies. This first version fits
one screen, at most 960 by 640 pixels. A smaller lifetime limits weapon range:
**range = bulletSpeed × bulletLifetime**. Check that enemies are reachable!

The sample has five player HP, slower enemy shots, unlimited ammunition, and no
reload. Try changing one number and record how it affects fairness. Making every
number bigger does not necessarily make the game better.

## How the annotated code works

`js/engine/shooter.js` copies the design into attempt state, updates firing timers,
and draws health, enemies and projectiles. `shooterHitTime` checks the entire path
of a shot against an expanded rectangle, so even fast shots hit thin cover. The
closest collision wins, walls win ties, and each shot hits at most one target.
Bullets disappear on impact, at the screen edge or after their lifetime. There is
a 128-projectile safety cap. Clearing the last enemy also clears remaining shots.

`studentGameScene.js` supplies movement and closed doors, then runs shooting before
checking objectives and completion. `packValidator.js` checks student settings.
A bad shooter pack is rejected without breaking the rest of the class's games.
Original pack data is never damaged during play; restarting makes fresh copies.

This is an introductory shooter, not yet a full weapon system: no enemy patrols,
pathfinding, scrolling, destructible terrain, ammo/reload, weapon switching or online
multiplayer. Platformer movement still uses the engine's existing per-frame physics;
shooting timers and projectile speed use elapsed seconds.

## Export and share

Run `node scripts/export-student.js run_gun_sample` or
`node scripts/export-student.js topdown_shooter_sample`. Choose a new output folder
if one already exists. Open the exported `index.html`, or host the whole folder.
The export includes only that student's pack and local saves, with no cloud sign-in
or classroom submission services. Use the class Overworld for those services.
Run `node --test tests/*.test.js` and `node scripts/validate-packs.js` before sharing.
