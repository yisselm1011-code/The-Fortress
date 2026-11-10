# Dorries's Celiyano Barn starter

Catch three moving calves within 45 seconds. This prototype uses a bird's-eye camera and a walking rancher; review the camera and artwork with Dorries. Horses, upgrades, escalating calf tiers and a throwing physics simulation are later design choices.

## Controls and scoring

Open the pasture portal in your home. Enter starts the round; movement and the clock wait until then. WASD/arrows move in any direction. Your dashed circle marks the center-to-center catch range. The nearest uncaught calf inside it glows green. Tap Space to catch that calf. Each throw, including a miss, uses a 0.8-second cooldown; release and press again for another throw. One press catches at most one calf. Caught calves appear in the safe pen automatically. Reach the target, then Enter saves the win and returns home. Completing the level grants 10 coins once; replays cannot farm coins.

R resets the entire round, including calves, throws and time. Escape returns home without awarding unfinished progress. The clock runs continuously after starting, including while standing still. Once time reaches zero, catching and movement stop. A catch pressed while time remains counts before the next simulation step. Unsaved partial catches are not kept across retries or visits.

## Edit your pack

Edit `js/students/dorries_ranch/pack.js`. Positions are centers in pixels from the top-left. Home positions marked tileX/tileY use tiles instead.

| Setting | Meaning | Allowed values |
|---|---|---|
| seconds | Round duration | 15–180 |
| targetCatches | Calves needed for a win | 1–6, no more than the calf count |
| playerSpeed | Player pixels per second | 140–260 |
| calfSpeed | Calf pixels per second | 40–130, slower than player |
| catchRange | Center-to-center lasso range | 40–100 pixels |
| catchCooldown | Time between fresh throws | 0.3–2 seconds |
| fleeRadius | Distance at which calves move away | 80–220 pixels, at least catchRange |
| calves | Unique IDs, centers and roaming headings | 1–6 calves; x74–886, y164–566, heading0–360 |

Heading 0 moves right, 90 down, 180 left and 270 up. Calves start outside the player's catch range. They reflect off the fence and turn away when you approach. A calf can be cornered; this is intentional beginner-friendly behavior. Calves do not collide with one another or damage the rancher. The pasture is open, so solids and hazards must remain empty. The goal rectangle describes the safe-pen display, not a place you must walk to.

## Read the annotated code

`createRanch` copies the pack into temporary play state. `ranchNearest` finds the closest eligible calf. `ranchCatch` records one throw, applies cooldown and updates catches. `updateRanch` moves the player and calves in small time steps, then checks the clock. `drawRanch` draws original canvas artwork, the exact range circle and the pen. `ranchScene` uses the shared scene for retries, home routing and once-only saved rewards.

## Standalone and Overworld

Teacher export command: `node scripts/export-student.js dorries_ranch <new-output-folder>`. Open the exported `index.html`, or host the entire folder on a static site. The export contains this student's home and game, works offline and saves locally without sign-in.

For Overworld use, run engine 2.14.0 or newer, place the pack under `js/students/dorries_ranch/`, and include its pack script in `index.html` before home registration. Keep folder/manifest IDs matched and avoid duplicate pack IDs. Run `node scripts/validate-packs.js` and `node --test tests/*.test.js` before publishing.

## First student assignment

Play the default round and record time remaining and throws used. Change one setting, predict its effect, and compare results in the project spreadsheet. Customize coach dialogue and calf names next. Test a miss, cooldown, win, timeout, retry, leaving the game and replaying without extra coins in both launch modes.
