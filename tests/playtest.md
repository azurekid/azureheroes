# Playtest report - Microsoft Azure Heroes 2027

Method: headless Chrome (puppeteer) drove the game with a bot that sets the same input flags the keyboard sets. The bot ran each level start to finish and read the game state. Screenshots were reviewed by eye. No real phone or Safari was available.

| Level | Result | Evidence |
|-------|--------|----------|
| Title screen | PASS | Shows the title, COMING SOON, then PRESS START after about 2.3s. No console errors. |
| Level select | PASS | Level 2 open, Levels 3 and 4 locked until the previous level is completed. |
| Level 2 Rooftop Run | PASS | Bot completed it start to finish, losing 1 life to a bot mistake. No errors. |
| Level 3 Sky Canyon Pursuit | PASS | Bot completed it in about 61s, health 16% at the end. No errors. |
| Level 4 Data Center + boss | PASS | Bot completed it, defeating the boss in about 51s after the fix below. No errors. |

## Bugs found

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
