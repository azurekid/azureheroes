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

## 10 regions, world map, accounts and resume (latest pass)

Headless Chrome, 1280x720. One browser process per level.

| Check | Result | Evidence |
|-------|--------|----------|
| All 10 levels load and play | PASS | Each level reached the `play` state with the player teleported 2,500px in. No console errors. |
| All 10 bosses beatable | PASS | Boss forced through stun and blasts in each level. The exit opens and the level complete panel shows. |
| New enemies (phish, ransomware, botnet) | PASS | They spawn, damage the player, die in 2 hits and drop a credit. Botnet bombs can be blocked with the MFA Shield. |
| Secret rooms and warp pipes | PASS | Paris Metro secret and pipe round trips on levels 3, 5 and 9. |
| World map | PASS | Pins, gold routes for cleared legs, plane on the latest leg. Arrow keys plus Enter, and tap twice to deploy, both start the chosen level. |
| All regions cleared | PASS | Clearing level 10 sets `unlocked` to 11, every pin shows a tick and the resume point is cleared. |
| Resume / continue | PASS | Continue starts the saved level with the saved score and lives. After a game over it restarts that level with score 0. |
| Complete, then WORLD MAP, then deploy | PASS | The next level reaches `play` with no errors. |
| Register, play, game over, world rank | PASS | Against `server.js`: register on the HTML form, game over posts the score, and the panel shows WORLD RANK. The leaderboard lists name, location and score. |
| Server API | PASS | `npm test`: register, duplicate name, login, wrong password, progress merge, score and rank, leaderboard, logout, static whitelist. |
| Hero Lab wardrobe | PASS | 11 hats and 5 extras render in idle, run and flight frames (contact sheet reviewed). The keyboard changes the new rows, the look saves, survives a reload and shows in levels 1, 8 and 10 with no errors. |
| Static host / file:// | PASS | No `/api/health`, so the game stays in guest mode with no account menu and no errors. |

Not tested: real phones and mobile Safari, App Service itself (only the same Node server locally), and many concurrent users.

## 2026-11-04: cloud challenges, low combat and community framework

Local Node server and isolated headless Chrome processes; 1280x720 screenshots reviewed.
These results supersede earlier sections only for the checks listed here.

| Check | Result | Evidence |
|-------|--------|----------|
| Random generation | PASS | 800 seeded world generations; street worlds reserve two different, disjoint cloud rooms, have at least 60px height spread and upper routes. Tests check unspanned gaps/rises, room bounds, duct clearances, safe pipe pairs and reward integration. |
| All ten worlds | PASS - smoke | Each loaded to `play` in a separate Chrome process with no page errors. Boss death was tested with forced stuns/blasts, not an unassisted fight. |
| Duck and low Blast | PASS | Actual Down and F keyboard events: body shrinks from 40px to 20px without moving feet off the floor; shot originates 10px above feet. Releasing Down restores standing clearance. |
| MFA Shield | PASS | E still shields independently; Down no longer shields. |
| Slide attack | PASS | Moving + Down hits a guest crawler once per slide and does not damage the hero during that contact. |
| Low ceiling | PASS | Releasing Down beneath a solid beam keeps the hero crouched rather than expanding into the ceiling. |
| Pipe round trip | PASS | Actual Down input enters and returns; room-specific name, expanded bounds and one-time time grant verified. Test setup teleported to entry/exit pipes; traversal was tested separately below. |
| Underground traversal | PASS - assisted | Eight rooms across four deterministic seeds, covering Pipelines, AKS, Actions and Docker. Bot used real Arcade collision frames, jump/double-jump, duck/slide and auto-fire; it reached each exit approach in 970-1154 frames. Invulnerability was enabled: this verifies routes, not combat balance. No traversal teleports or Boost refills. |
| Touch controls | PASS - pointer emulation | Forced-touch layout includes separate Duck and Shield buttons, plus existing movement/jump/Blast/Boost. Pointer holds on Duck and Shield verified independently in Chrome; real touch devices were not exercised. |
| Amsterdam stands and vehicle dimensions | PASS - data/render integration | Seeded tests require a haring stand; its street rendering was inspected in Chrome. Obstacle art sizes drive physical sizes. Bikes, taxis, small cars and road traffic are enlarged. Unassisted street play and real-device visual balance remain manual checks. |
| Community skill framework | PASS | All eight skills have matching discovery metadata, valid local references and security routing; the orchestration skill links every specialist. |
| Security-boundary regression tests | PASS | Private APIs reject missing/invalid/revoked sessions; malformed JSON rejected; public profiles/leaderboard omit credential fields; source/data/config paths remain inaccessible. These tests are not a vulnerability audit or proof of no backdoors. |
| CI and CDN safeguards | PASS - local checks | Workflow actions pinned to verified upstream commits; unprivileged PR workflow has no secrets; versioned Phaser SRI boots in Chrome. Hosted branch/environment protections were not changed or verified. |
| Regression suite | PASS | `npm test`: 8 test groups pass. Changed JS passes `node --check`; diff passes whitespace checks. |

### Bugs found and fixed in this pass

- Level: all run levels.
  Steps: hold Down while standing on a platform.
  Expected: feet stay on the platform.
  Actual before fix: Arcade post-update treated body resizing as movement and pushed
  the hero through the floor.
  File suspected: `systems/player.js`.
  Fix verified: preserve body position deltas (`prev` and `prevFrame`) while resizing;
  real keyboard/physics test and a focused regression both pass.
- Level: generated streets.
  Steps: generate many random runs.
  Expected: two safe, different cloud rooms and meaningful terrain variation.
  Actual before fix: hazard allocation could leave only one room, and some runs stayed flat.
  File suspected: `levels/worlds.js`.
  Fix verified: reserve pipe platforms before hazards; guarantee an opening elevation change;
  seeded generation tests pass.

Not signed off: unassisted full-level difficulty, extended combat balance, all touch
interactions, real phones/Safari, audio quality or low-end-device performance. The skill
framework is guidance plus local checks; maintainers still need to enable the hosted
protections documented in `SECURITY.md`.
