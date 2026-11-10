# Debra's Basketball Champ prototype

This is a separate bird's-eye basketball game. The original **Hoop Challenge** remains
unchanged as a free-throw activity in `js/students/sports_sample/`. This prototype does
not automatically trigger that activity after fouls; foul/free-throw integration can
be a later addition.

The court is drawn in Canvas using the attached court picture as a layout reference.
There are three Blue players and three Red players. Debra controls Blue's first player,
marked YOU with a white ring. Blue attacks right; Red attacks left. The other players
are NPCs. This deliberately starts smaller than the proposed full 5-on-5 game.

## Controls and flow

| Input | Action |
|---|---|
| WASD / arrows | Move the main player |
| E | Call for the ball when a Blue teammate has it |
| 1 / 2 | Pass to teammate 2 / teammate 3 when you have the ball |
| Click/tap court or Space | Start aiming; click/tap/press again to release |
| Tab | Show the roster and pause/resume |
| R | Restart the match, including scores, timer and random sequence |
| Escape | Return home without completing the match |
| Enter after winning | Save the win, award the normal reward once and return home |

Teammates move into support positions and favor passing to the main player. If she is
heavily guarded, they may pass to another teammate; E explicitly requests the ball.
Both teams mark opponents on defense and move toward the rim for rebounds.
Opponents can intercept or steal, advance toward their basket, and pass out of pressure.
Shots and passes are animated. Missed shots go to the nearest player as a simplified
rebound. A made basket resets positions and gives possession to the other team.

Each team has **14 seconds to shoot**, shown as Ball in the scoreboard. Passing does
not reset this clock. A violation resets positions and gives the other team the ball.
A shot reaching the basket allows a fresh clock on the rebound. Tab pauses both clocks.

## The stopwatch-style meter

While the main player has the ball, click or press Space to open the meter. A white
hand swings back and forth across a fixed red target line. Click again when they line
up. The green region shows the timing window. Higher shooting stats widen that region.
The main player stands still while aiming; NPCs keep moving and can contest or steal.

Accuracy is a probability, not a guaranteed result. The displayed chance combines:

- Shooting stat: a higher base chance and a wider timing window.
- Timing: a release nearer the red line improves the chance.
- Distance: distant shots are harder.
- Defense: nearby opponents with strong defense make shots harder.

A close, well-timed shot is much easier than an open-court heave. A well-timed release
can still miss. Shots beyond the drawn 250-pixel arc count for three; closer shots
count for two. NPC shooters use the same accuracy calculation with simulated timing.

## Let Debra choose each player

Edit `js/students/debra_basketball/pack.js`, under `level.basketball.teams`. Every name
and stat is a placeholder, not a final choice or an assessment of a real person's ability.
Keep exactly three players per team in this version. The first Blue player is controlled
by the student. Use unique lowercase IDs and names up to 16 characters.

```js
// Debra can rename this player and choose each stat independently.
{ id: "main_player", name: "Main Player",
  shooting: 75, passing: 75, speed: 75, defense: 65 }
```

All stats are whole numbers from 1 to 100:

| Stat | What it changes |
|---|---|
| `shooting` | Shot probability and timing tolerance |
| `passing` | Pass speed and resistance to lane interceptions |
| `speed` | Movement speed |
| `defense` | Nearby shot pressure, interception risk and contact-steal strength |

The Tab roster displays those settings; edit them in the annotated pack file, then
reload the game. It is a review screen, not an in-game roster editor.

`seconds` sets match time (30â€“600), `targetScore` sets the winning target (2â€“50), and
`meterCycles` sets swing speed (0.3â€“2 cycles per second). `seed` makes random results
repeatable for bug reports. Changing the seed changes the sequence; it does not remove
the effect of stats. Record your changes and playtest them before changing several more.

## Rules and current limits

The match starts on entering the court. Reaching the score target or running out of
time ends it; a tie is a retry, not a win. A shot released before the final horn is
allowed to finish and score. No new shot may start at zero. A pass at the horn does
not extend the match.
This is not an official-rules simulation: no fouls, dribble violations, substitutions,
quarters, advanced play calling, loose-ball physics or online multiplayer.
NPC support, movement, defense and rebounds are deliberately simple. All players are
currently circles with names/numbers; art and animation can follow once the rules work.

`basketball.js` owns the team simulation, seeded outcomes, meter and court drawing.
`basketballScene.js` selects the mode. The existing shared scene handles reset, saved
completion and return to the correct home. The original free-throw code is separate.

## Export / Overworld

Use engine 2.7.0 or newer. Both the new basketball home and existing Hoop Challenge are
registered in the class index. The new pack keeps unique level/reward IDs. Export with:

```text
npm test
npm run validate
npm run export:student -- debra_basketball
```

Open the resulting `index.html`, or host the entire exported folder. Its local saves
are isolated from the class game and other packs. Review changes to Debra's pack before
copying it back to the Overworld; do not replace the shared engine with a student export.

## First design decisions for Debra

Choose six player names and their individual stats. Try high and low shooting values
to compare the meter window, then compare a close shot with a long shot. Test a pass,
an NPC return pass, a miss/rebound, and the end-of-match screen. Keep free-throw practice
as a separate activity until the team-game rules are ready for foul integration.

## Balance notes (November 1, 2026)

The starting difficulty is intentionally forgiving for learning. The main player
retains a small stat advantage; Red now has 65 shooting/speed and 70 passing, with
55 defense. Debra can still change every individual stat. The meter runs at 0.55
cycles per second, giving more time to line up the hand.

The accuracy formula in `basketballShotChance` combines a 12% base, up to 40% from
shooting stats and up to 45% from timing. Range beyond 150 pixels subtracts
(distance - 150) / 450, and defenders subtract up to 24%. Results are clamped to
3–98%. These terms are probabilities: 0.1 means ten percentage points. A close
well-timed shot is reliable; shooting from your own end is a desperation attempt.

NPCs spread out on offense, mark players on defense, and approach the rim during
shots. Red prefers closer shots and passes to a less-guarded teammate under pressure.
Contact steals use an elapsed-time probability instead of one chance per frame.
There is no hidden score-based boost or guaranteed winner.

Try several matches before editing the balance. Compare close shots, contested
shots, passing, and defending. Automated controllers can check that these choices
matter, but Debra's own playtesting should decide what feels fun.
