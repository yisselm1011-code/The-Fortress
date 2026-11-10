# Build your first sports / skill challenge

Start with `js/students/sports_sample/pack.js`. **Hoop Challenge** is a basketball-style
shooting station: aim, choose power, shoot, and make three baskets in 45 seconds.
The annotated pack includes a home, coach, portal and court. It is a teaching starter,
not a full basketball simulation or a confirmed assignment for a particular student.

## Play

In the Overworld, enter the yellow **Hoop Challenge** home. A standalone export starts
inside that home. Press E near the coach for instructions, then use the purple portal.

| Input | Action |
|---|---|
| Up / W | Raise the shot angle by one degree |
| Down / S | Lower the angle by one degree |
| Right / D | Increase power by 10 |
| Left / A | Decrease power by 10 |
| Space | Shoot one ball |
| R | Restart the round, including score, timer and shot settings |
| Escape | Return home without awarding a completion |
| Enter after success | Save the win, award the normal reward once and return home |

Tap to adjust: holding an adjustment key does not repeatedly change its value.
Only one ball can fly at a time. Angle/power changes apply between shots, not during
flight. The dotted line previews the free-flight arc; backboard rebounds are not
included in that preview. The supplied starting angle and power can make a basket.

The timer waits until the first shot. It then continues between shots. Time advances
with active game simulation; this is a classroom challenge, not a competitive online
clock. A valid basket at the buzzer counts. Reaching the target freezes the result
until you press Enter, R or Escape. Time running out freezes a failed result: use R
to retry. Leaving with Escape, even after reaching the target, does not save a win.

## How scoring works

A ball scores only when its center crosses the hoop's top from above while moving
downward. The whole ball must fit between the rim endpoints. Passing under the hoop,
moving upward through it, or landing on the floor does not score. A scored ball is
removed immediately, so it cannot count twice. Each successful shot earns one point.

Gravity curves the flight. A ball can rebound from the sides of the backboard. This
first template does not simulate rim bounces, player movement, dribbling, defenders,
teams, fouls or a full match. Soccer, football and ranch-catching ideas will need
their own rules; renaming this template does not implement those sports.

## Customize one setting at a time

Home coordinates are tiles. Court coordinates are pixels: x increases right and y
increases down. The court stays 960 × 640 pixels. In this mode, `level.spawn` means the
ball launch point and `level.goal` defines the hoop rim, rather than a walking exit.

| Setting | Meaning | Starter value | Accepted range |
|---|---|---:|---|
| `challenge.targetScore` | Baskets required | 3 | Whole number 1–20 |
| `challenge.timeLimit` | Seconds after the first shot | 45 | 5–180 |
| `challenge.startAngle` | Degrees above horizontal | 60 | Whole number 20–80 |
| `challenge.startPower` | Launch speed in pixels/second | 700 | Whole number 300–900 |
| `challenge.gravity` | Downward acceleration | 600 | 100–1200 |
| `challenge.ballRadius` | Ball size in pixels | 10 | 6–18 |
| `challenge.floorY` | Top of the floor | 580 | 500–620 |

Move the hoop by changing `goal.x` and `goal.y`; change its width to adjust precision.
The board follows the hoop automatically. Keep the launcher left and the hoop right.
Validation checks dimensions, settings and unsupported fields. It cannot guarantee
that every combination is reachable or that a target score fits its time limit:
playtest every change. Keep solids, hazards, collectibles, objectives, doors and waves
empty in this mode; their walking/combat rules do not apply to the shooting station.

## Code reference

- `pack.js`: your editable home, instructions, hoop and challenge settings.
- `skillChallenge.js`: shot controls, timer, gravity, backboard rebound, scoring and drawing.
- `sportsScene.js`: selects the sports mode.
- `studentGameScene.js`: shares restart, completion rewards, saves and return-home routing.

The physics uses small time steps so a fast ball cannot skip the rim. It checks the
crossing between the previous and current positions, rather than guessing from a
single picture. The pack data stays unchanged while runtime score and timer change.

## Export and integrate (teacher)

Copy the template folder. Assign a unique folder/manifest ID, level ID, reward ID and
home location. Match the portal and manifest `levelId` values to `level.id`. Keep
`mode: "sports"`, and use engine 2.6.0 or newer. Add the pack script to the class index:

```text
npm test
npm run validate
npm run export:student -- sports_sample
```

Open `exports/sports_sample/index.html`, or upload the entire export to a static host.
No application server or classroom login is needed. Local saves are separate by pack
ID and do not transfer automatically to the Overworld or another computer. Review
the student's pack folder before importing it back; do not replace the class engine
with their standalone runtime.

## First assignment

Rename the challenge, rewrite the coach instructions, and change one shot or hoop
setting. Predict what will happen, test it, then record the result and revision.

Check that misses do not score, a basket counts once, the timer starts on the first
shot, timeout permits retry, and Enter after success returns home. Replay a completed
challenge to verify it does not award extra completion coins. Keep a working copy.
