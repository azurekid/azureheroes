# Playtest report - Microsoft Azure Heroes 2027

Method: headless Chrome (puppeteer) drove the game with a bot that sets the same input flags the keyboard sets. The bot ran each level start to finish and read the game state. Screenshots were reviewed by eye. No real phone or Safari was available.

| Level | Result | Evidence |
|-------|--------|----------|
| Title screen | PASS | Shows the title, COMING SOON, then PRESS START after about 2.3s. No console errors. |
| Level select | PASS | Level 2 open, Levels 3 and 4 locked until the previous level is completed. |
| Level 2 Rooftop Run | PASS | Bot completed it start to finish, losing 1 life to a bot mistake. No errors. |
| Level 3 Sky Canyon Pursuit | PASS | Bot completed it in about 61s, health 16% at the end. No errors. |
| Level 4 Data Center + boss | PASS | Bot completed it, defeating the boss in about 51s after the fix below. No errors. |

## Street, scenery and secrets (latest pass)

| Check | Result | Evidence |
|-------|--------|----------|
| All 6 levels load | PASS | No console errors. |
| No duplicate landmark on screen | PASS | Levels 1-5 scanned every 40px of camera travel. 0 frames had the same scenery key twice (before the fix: London 4, Tokyo 3, Sydney 13, Rio 14). |
| Amsterdam pull-up bridge | PASS | Leaves lift (rotation -1.24), the collider turns off while up and back on when down, and a warning flashes first. |
| Canal boats carry the player | PASS | The player rides at boat speed and does not slide. |
| Water death | PASS | Falling below the quay costs a life and respawns at the checkpoint. |
| Azure Bike | PASS | Mount, ram enemy, dismount on hit. |
| London phone box secret | PASS | Enter the bonus room and return to the level. |
| BSOD game over / Deployment succeeded panel | PASS | Screenshots reviewed. |

## Bugs found

### Bug 2 - FIXED
- Level: 2 (London)
- Steps: Run past Big Ben.
- Expected: One Big Ben on screen.
- Actual: Two Big Bens: one in the far skyline layer, one in the scenery strip.
- File suspected: `art/sprites.js` (`bg_far_*`), `systems/scenes.js` (`buildScenery`).
- Fix: landmark-free `bg_farp_*` far layers for levels, plus width-aware spacing in the strip.

### Bug 3 - FIXED
- Level: any, second attempt
- Steps: Play a level, then restart.
- Expected: Fresh drawbridges and achievements.
- Actual: State from the previous run survived the scene restart.
- File suspected: `systems/scenes.js` (`create`).
- Fix: reset `draws`, `achQ`, `warping` in `create`.


### Bug 1 - FIXED
- Level: 4 (boss)
- Steps: Reach the arena, block until the boss is stunned, fire Azure Blast.
- Expected: Boss health drops by 10 per blast.
- Actual: The blast passed through the boss and health stayed at 100%.
- File suspected: `systems/scenes.js` (blast loop). The boss rectangle is a Phaser Rectangle (`width`, `height`) but the overlap helper read `w`, `h`.
- Fix: convert the boss rectangle before the overlap test. Verified with a direct test (100 to 90) and a full Level 4 bot run.

## Not tested

- Real touch devices and mobile Safari. Only the `?touch=1` layout can be shown on desktop, and it has not been screenshotted.
- Game over and restart (R) were not exercised by the bot.
- Audio was not listened to, so only the absence of errors is confirmed.
- Frame-rate on low-end devices.

## Verdict

Levels 2, 3 and 4 are PASS in automated runs. The game is not signed off on mobile touch, game over and audio until those are checked by hand.

## Azure region worlds
Bot runs on all 6 generated worlds: levels 5 and 6 complete, levels 1 completes with lives lost; deaths in 2-4 come from bot timing at gaps. Manual playtest still recommended.

## Regional bosses, power-ups and hero choice

Headless Chrome (1280x720 and 1920x1080), all 6 levels, no console errors besides two 404 responses (probably the favicon):

- PASS: each level's boss arena starts when the trigger is crossed, the boss name shows in the HUD, and the region boss art renders.
- PASS: forcing the boss through stun and 10 blasts opens the exit on all 6 levels, and entering it shows the level complete panel.
- PASS: power-up orbs are picked up and the effect timers appear in the HUD (Copilot, Power BI seen live; Defender, Actions and Teams only code-reviewed).
- PASS: pressing H on the title swaps to the female hero, which renders in levels.
- NOT TESTED: a bot or human playing a boss fight unassisted, the Copilot sidekick killing enemies, Defender and Actions effects in play, and touch devices. The bosses were forced into the stunned state in these runs.
