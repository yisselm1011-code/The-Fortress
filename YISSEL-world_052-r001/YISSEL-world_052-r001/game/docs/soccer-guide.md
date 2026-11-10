# Simone's soccer starter

This is the first playable stage of Simone's Magic Fighting Soccer idea: one attacker,
one goalkeeper, and three goals to score in 60 seconds. It is a top-down soccer skill
challenge, not yet a full team match or battle RPG. The pitch and characters use simple
Canvas shapes so the mechanics work before students add artwork.

## Play

- WASD/arrows: move and dribble. The player stops at the yellow shooting line.
- Hold I/K: aim upward/downward, from -50 to +50 degrees relative to the right goal.
- Hold J/L: lower/raise kick power, between 320 and 720 pixels per second.
- Space: kick once. Holding Space does not keep kicking. Only one ball can fly at once.
- R: restart the entire challenge. Escape: return home without a win.
- Enter after reaching the target: save the win and return home.

The clock waits for the first kick, giving time to read and practice positioning.
The arrow previews direction, not a guaranteed goal. Move near a corner of the goal,
watch the keeper, and kick toward space. A central shot can be saved. The goalkeeper
patrols when you have the ball and follows its current height after a kick, at a limited
speed. It does not teleport or predict the final impact point.

The ball slows on grass. A weak, distant shot can stop before reaching the goal. A
save, wide shot or stopped ball returns possession after a short 0.65-second reset.
You can reposition while a shot travels. Aim/power changes then affect only the next
kick. There are no rebounds, fouls or tackles in this first challenge.

The WHOLE ball must cross the goal line between the posts. One shot counts at most
once. A valid crossing at the buzzer counts; a shot still traveling after time expires
does not. R resets the player, keeper, aim, power, score, time and ball. Winning twice
does not duplicate the shared completion reward.

## Change the annotated pack

Edit `js/students/simone_soccer/pack.js`, especially `level.soccer`. Settings are starting
values for Simone to choose, not final player ratings. All distances are pixels.

| Setting | Meaning | Allowed range |
|---|---|---|
| `seconds` | Active play time, from first kick | 15–180 |
| `targetScore` | Goals needed | Whole number 1–20 |
| `playerSpeed` | Movement speed in pixels/second | 100–260 |
| `startPower` | Initial kick speed | 320–720 |
| `drag` | Speed lost each second on grass | 40–240 |
| `ballRadius` | Ball size | 6–12 |
| `keeperSpeed` | Keeper tracking speed; patrol uses 70% | 30–180 |
| `keeperHeight` | Goalkeeper collision height | 24–90 |
| `shootingLine` | Furthest player X position | 500–700 |

The pitch is 960 by 640. `spawn` is the player's center, not its top-left corner.
Keep spawn x between 60 and shootingLine, y between 160 and 570. The goal uses x=880,
width=8, height=100–260 and must fit between y=180 and y=550. Leave at least 32 pixels
of opening beyond the keeper's height. Other level solids/hazards/objectives are not
used here; use soccer settings instead. Do not mix other game modules into this mode.

Try increasing keeper speed or narrowing the goal only after scoring is comfortable.
Change one setting at a time, record your results and make sure three goals remain
achievable. Easier settings should help a beginner learn positioning, not require
frame-perfect input.

## How the code works

`soccer.js` copies the starting state, updates normalized movement, limits shot rate,
tracks goalkeeper position, and integrates rolling drag in small time steps. It reuses
`shooterHitTime` for swept keeper collision so fast kicks do not skip through a save.
Goal scoring checks where the ball crosses the line, rather than whether it merely
ends a frame near the net. Timers and movement use elapsed seconds.

`soccerScene.js` selects this mode. The shared scene handles retry, Escape, win
confirmation, once-only rewards and home routing. The pack validator rejects settings
that do not fit the pitch. A running game never changes the original pack settings.

## Standalone and Overworld

Simone has a unique home, coach, portal, save/review points, level and reward ID. Run
`node scripts/export-student.js simone_soccer` to export it alone, choosing a fresh
output folder if needed. Open its index.html or host the entire folder. The exported
copy has isolated local saves and no classroom sign-in/submission services.

Run `node --test tests/*.test.js` and `node scripts/validate-packs.js` before sharing.
Test a goal, save, wide shot, timeout, retry, winning and re-entry. Full teams, passing,
magic abilities, RPG stats, ball rebounds and multiplayer are future design choices.
