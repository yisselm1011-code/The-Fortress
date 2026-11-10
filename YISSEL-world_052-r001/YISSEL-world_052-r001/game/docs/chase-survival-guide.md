# Chase / survival student guide

`chase_platformer_sample` (Museum Escape) and `horror_escape_sample` (Night Hall
Escape) share the optional `level.pursuit` module. Use these for a dinosaur chase,
haunted school, laboratory escape or another survival story. Rename the characters
and setting; no horror artwork or sounds are required to learn the mechanics.

## Play

Move with WASD/arrows. Space jumps only in the platformer. Collect the exit key and
reach the gold exit before the 90-second clock expires. Orange means watching;
pink means chasing; purple means stunned. Touching an active threat ends the attempt.

Press **Q** to flash threats within 120 pixels, provided no wall or locked door blocks
the flash. A flash lasts 1.5 seconds and recharges in four seconds. A missed flash
still costs its cooldown. It does not destroy enemies.

Stand fully inside a green refuge and hold **H** to hide. Hiding stops your movement,
blocks detection and protects against contact. It does not stop the escape clock.
Use Q before releasing H if a threat is waiting nearby, then release H to move. You cannot hide in midair.

R resets the entire attempt: key, doors, threat positions, clock and flash recharge.
Escape returns home without awarding completion. Catch/timeout freezes play until
R or Escape. The saved completion reward is awarded only once, as in other templates.

## Design settings

Keep `level.mode` as `platformer` or `topdown`. Add a `pursuit` block; omit it for a
normal non-chase level. This version intentionally rejects mixing pursuit with
`shooter` or arena `combat`, avoiding conflicting health/catch rules.

| Setting | Meaning / allowed range |
|---|---|
| `seconds` | Escape time, 15–300 seconds |
| `stunCooldown` | Time between flashes, 2–15 seconds; longer than stun duration |
| `stunSeconds` | How long a threat freezes, 0.5–4 seconds |
| `stunRadius` | Flash reach, 32–180 pixels |
| `memorySeconds` | How long a threat remembers the last seen position, 0.5–6 seconds |
| `enemies` | 1–6 pursuers, each with unique ID and rectangle |
| Enemy `speed` | 20–200 pixels/second; start below player speed |
| Enemy `noticeRadius` | Sight distance, 64–600 pixels |
| `hidingSpots` | 1–8 refuges, unique IDs, rectangles 32–180 pixels wide/high |

Enemy rectangles are 16–48 pixels wide/high. Place them off walls, doors, hazards,
other enemies and the player spawn. A platformer enemy must start on solid ground.
Refuges must fit the player and cannot overlap blockers. Levels fit one screen
(up to 960 by 640). Keep the initial layout simple enough to test the escape route.

## What the annotated runtime teaches

`pursuit.js` creates fresh attempt state and updates timers using elapsed seconds.
An unobstructed view records the player's position. After losing sight, the enemy
moves toward that remembered position briefly, then stops watching there. Hiding
and cover break sight. The shared segment/rectangle check prevents seeing or flashing
through walls and locked doors. Stun clears the old target, allowing an escape.

Top-down enemies follow directly and slide against walls. This is NOT maze pathfinding:
they do not automatically search around corners or find routes through complex mazes.
Platformer enemies stay on their starting floor, stop at ledges/walls, and do not
jump or fall between platforms. These limits make the first examples readable and
editable. Add patrols or navigation later if a specific student project needs them.

The existing player movement still uses per-frame movement; pursuit timers and enemy
speed use seconds. Test on classroom devices before making enemies faster. Change
one setting at a time and record whether the escape is still possible.

## Standalone and Overworld

Both packs have their own home, coach, save/review points and unique reward IDs.
Export with `node scripts/export-student.js chase_platformer_sample` or
`node scripts/export-student.js horror_escape_sample`. Choose a fresh output folder.
Open its index.html or host the whole folder. Exports contain only the selected pack
and local saves; the Overworld retains classroom cloud/submission services.

Run `node --test tests/*.test.js` and `node scripts/validate-packs.js` before sharing.
Test a capture, a missed flash, a hiding escape, timeout, retry, and winning twice.
