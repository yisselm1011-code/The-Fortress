# Jacento's football challenge

Cento's Island begins with a top-down ball-carrying drill. Score two touchdowns in four plays with 45 seconds of total active play. Each touchdown is six scoreboard points; completing the challenge grants the shared 10-coin reward once. This starter does not implement team matches, passing, kicking, seasons, or official football down-and-distance rules.

## Play

Open the home portal. Enter starts a play. WASD/arrows run; hold Space while moving to sprint. The bar holds two seconds of sprint and recovers when Space is released. Orange pads block movement; red defenders patrol and chase nearby runners. The football stays with you. Move your entire blue circle across the right goal line to score. A tackle ends the play, and both a tackle and a touchdown use one of the four attempts. Enter resets positions for the next play. The remaining clock carries over, but pauses between plays. Reach two touchdowns, then Enter saves and returns home. R resets the entire challenge. Escape returns home without awarding an unfinished attempt. A win at the buzzer counts; a tackle takes priority over a touchdown in the same simulation step.

## Customize your pack

Edit `js/students/jacento_football/pack.js`; each section is annotated. Positions are pixels measured from the canvas's top-left, using player centers. Home tile coordinates use 32-pixel tiles instead.

| Setting | Meaning | Allowed values |
|---|---|---|
| seconds | Total active-play time | 15–180 |
| targetTouchdowns / attempts | Win target / available plays | 1–5 / 1–10; target no greater than attempts |
| playerSpeed / sprintSpeed | Normal / sprint pixels per second | 120–220 / normal speed through 300 |
| sprintSeconds / recovery | Energy capacity / energy restored per second | 0.5–5 / 0.1–2 |
| defenderSpeed / noticeRadius | Chase speed / detection distance | 40–140, slower than runner / 60–250 |
| defenders | One to four starting centers and patrol directions | x300–740, y180–550, direction -1 or 1 |
| solids | Up to six rectangular training pads | x260–760, y180–550; max 100×150 each |

The goal stays at x810, y150, width90, height430. Keep spawn x90–180, y180–550. Leave gaps between pads; the validator checks bounds and settings, but playtesting is still needed to confirm a fun route. Defenders have simple direct pursuit, not maze pathfinding. Difficulty values are starter defaults for Jacento to refine.

## How the code works

`createFootball` copies temporary state. `footballResetPlay` resets positions and energy, preserving the overall clock and touchdown count. `footballMove` resolves barriers separately on each axis. `updateFootball` uses small time steps for movement, stamina, defenders, tackles and scoring. `drawFootball` draws the field and HUD. `footballScene` uses the shared scene for retries, saves and the home return. A retry/re-entry discards unsaved attempt progress; earned rewards remain saved.

## Standalone and Overworld

Teacher command: `node scripts/export-student.js jacento_football <new-output-folder>`. Open the exported `index.html` or host the whole folder on a static site. Only Jacento's pack is included, with local saves and no sign-in. Both the home and football field work offline. To integrate a customized copy, use engine 2.13.0 or newer, copy the student folder into `js/students/`, and include its pack script in `index.html` before home registration. Keep IDs unique; do not add a second copy of the same pack. Run `node scripts/validate-packs.js` and `node --test tests/*.test.js` before publishing.

## First student assignment

Play the default drill, record attempts and time, then change one difficulty setting. Explain the variable, your prediction and the result in your project spreadsheet. Add a field theme or coach dialogue next. Test a tackle, timeout, retry, two-touchdown win, and replay without duplicate coins in both launch modes.
