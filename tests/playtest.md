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

## 2026-11-04: cloud-room visual redesign

Local server with isolated guest storage; headless Chrome/WebGL at 1280x800.
Entry and middle views of all four themes were captured and visually inspected,
both normally and with `?touch=1`. This pass changes art/rendering, not room geometry.

| Check | Result | Evidence |
|-------|--------|----------|
| Docker and AKS docks | PASS - visual | Corrugated shipping-container stacks have locking bars, corner castings, stencils and wear. Cranes, harbour skyline, water and lamps replace the old panel grid. Background cargo stays inside each scenery strip to avoid duplicated labels at seams. |
| Actions and Pipelines workshops | PASS - visual | Glazed factory windows, roof trusses, hoists, assembly arms, runner workstations, conveyor catwalks and pipeline pressure vessels replace sparse monitor grids. Compact stage signs remain legible. |
| Platform dimensions and cache | PASS | Browser assertions checked every finite platform in each theme: texture dimensions divided by art density equal the collision width/height, and repeated requests reuse the same texture. Node regression verifies floor tiling and unchanged collision rectangles. |
| Room-only scenery | PASS | Parallax scrolls at the density-corrected offset. Opaque room skies cover regional scenery, road and time-of-day wash; outdoor weather particles hide while inside. Regression tests cover layer visibility during warps and immediate restoration on return/respawn. |
| Entry and return | PASS - assisted | Each theme entered through the documented existing `warpPipe` API and returned through its actual exit-pipe trigger. Setup teleported the hero to exit approaches and enabled Defender; this is integration testing, not unassisted traversal or combat balance. |
| Forced-touch layout | PASS - visual only | All four themes inspected at entry and middle with separate Duck/Shield and existing controls visible. No real device or touch-action retest in this pass. |
| Regression suite | PASS | All 10 `npm test` groups pass, including the 800 seeded world generations and API/security-boundary checks. Changed runtime JS passes `node --check`; diff passes whitespace checks. No uncaught browser page errors. |
| Contributor guidance | PASS | Contract and sprite-art skill describe exact-size materials, layered scenery and visual QA. README documents world IDs, direct world selection, randomly available room themes, touch layout and guest-save precautions. |

During visual iteration, street imagery initially showed through transparent room
scenery. Moving the room sky above regional ambience fixed it; an automated
depth/visibility regression now covers that boundary. Cargo stencils were also
aligned to native font pixels, and scenery-strip edge overlaps were removed.

Not signed off by this pass: full-level difficulty, renewed collision traversal,
real phones/Safari, audio or low-end-device performance. Existing gameplay geometry
and duck/slide mechanics were preserved; earlier assisted traversal evidence above
is historical, not a new unassisted playthrough.

## Hi-res heroes, help, quit, bullet shoot-down, shield, suits, nameplates

Chrome (Playwright, 1280x720 viewport). Keys held about 100 ms per press.

| Check | Result | Notes |
|---|---|---|
| Hi-res render | PASS | Canvas 1280x720, camera zoom 2, logic still 640x360. HUD, text and sprites crisp. |
| HD hero (title, Hero Lab, unlock banner) | PASS | Portrait reviewed in screenshots. |
| Help (H) | PASS | Title and in game. Three pages, Left/Right page, H/Esc/Enter close. From pause it returns to the pause menu. |
| Quit (Q) | PASS | Q in a level returns to the title screen. Pause menu has RESUME, HELP, WORLD MAP, QUIT. |
| Esc pause | PASS | Esc toggles pause in play. |
| Blast destroys bullets | PASS | Enemy bolt plus a blast, 3 of 3 runs: bolt removed, `stats.bolts` 1. |
| MFA Shield | PASS | Regression: Down was removed as a shield key when duck was added. E now shields on the ground and in the air; Down while standing still is a crouch guard. Unit test covers shield, crouch guard and slide. |
| Region suits | PASS | Locked suit cannot be saved (block sound, stays in the lab). Open suit saves. `lookOf` drops a locked suit. Clearing Amsterdam shows the ORANJE unlock banner. |
| Enemy nameplates | PASS | Category-coloured labels show near enemies and are removed with the enemy. |
| Cloud challenges | PASS - visual | AKS, Docker, GitHub Actions and Azure Pipelines rooms reviewed. No page errors. |
| SPACE confirm | FIXED | `AH.Input.read` consumed SPACE twice, so SPACE never confirmed. It is now read once. |

## Charged pickups, boss telegraphs, varied rooms and regional wardrobe

Local Chrome, isolated guest contexts, 1280x720 with `?touch=1`. No accounts or
leaderboard submissions. Browser automation uses held keys/pointer events.

| Check | Result | Evidence / limits |
|---|---|---|
| Charged Azure Blast | PASS | Hold F 1.4s: charge reaches 1 with no shot; release emits one damage-3 projectile. |
| Touch spread weapon | PASS - pointer emulation | Equip Event Grid Spread, hold/release BLAST: five fan projectiles. Not a real-device test. |
| Weapon lifecycle | PASS - automated | Boost costs, charge caps, replacement, expiry, respawn, shield/state-change cancellation and bike-hit cancellation. |
| Beam and spread | PASS - automated | Distinct fan trajectories/counts, charged damage, per-target beam tracking, boss hit once and solid walls block beams. |
| Ground boss signals | PASS - assisted integration | Windmill Titan's real charged projectile leaves armored HP at 100, then reduces HP to 70 during natural OPEN window. Green target and HUD match damage gate. |
| Air boss signals | PASS - assisted integration | Same real-fire result for Sumo Shogun. Both boss checks use Defender and deterministic shoot selection; no forced stun. These checks do not certify unassisted combat balance. |
| Escalating pressure | PASS - automated | Lower health reduces cooldowns; every phase retains about 0.5s shot windup. Three volleys guarantee exposure without shield deadlocks. |
| Pipeline room | PASS - assisted traversal | World 1, generation LCG seed 1, zone 0: duct/arena/switchback/security/split. Actual Arcade movement, jumps and ducking collect token and return through exit. |
| Entra vault | PASS - assisted traversal | Seed 1, zone 1: arena/split/duct/catwalk/security. Token collected and return reached. Entry/middle artwork reviewed. |
| Functions reactor | PASS - assisted traversal | Seed 2, zone 0: split/arena/security/duct/steps. Token collected and return reached. Entry/middle artwork reviewed. |
| Traversal assistance | DISCLOSED | Normal entry warp, synthetic per-frame movement/jump commands and extended Defender; no through-wall movement or waypoint teleporting inside rooms. Tests establish real-physics reachability, not combat difficulty. All seven layout types exercised across the three rooms. |
| Seed diversity | PASS - automated | 80 deterministic room seeds, six themes, distinct per-room layouts, bounds, ducts, rewards and collision-aware route checks; 20 seeds across all worlds verify both weapon pickups. |
| Regional wardrobe | PASS | Ten outfit/hair/accessory bundles reviewed as HD contact sheet. Automated drawing coverage includes both bodies and all gameplay poses; Japan's kimono/bun/obi inspected in Hero Lab and unlock banner. |
| Locked wardrobe | PASS | Browser save attempts reject locked outfit, hair and accessory independently. Automated tests cover every clear threshold, unknown/locked save fallback and unlocked-only randomization. |
| Browser errors | PASS with pre-existing advisories | No uncaught page errors in isolated checks. Existing favicon 404 and Canvas2D readback advisories are unrelated and unchanged. |

Runtime and docs introduce no dependencies, network destinations, privileged routes
or save-schema changes. The browser test dependency was installed only in temporary
session storage. Security/API/framework regressions remain part of `npm test`.
Final validation: all 28 test groups pass; changed runtime JavaScript passes
`node --check`, and `git diff --check` passes.

## Region wardrobe rewards through the live clear flow

Chrome, one page per region. Each world started with `unlocked = index + 1`; then `LevelScene.levelComplete()` ran.

| Check | Result | Notes |
|---|---|---|
| Rewards locked before a clear | PASS | For all 10 regions, outfit, hairstyle and accessory were locked. |
| Rewards unlocked by the clear | PASS | For all 10 regions, all three opened, and `lookOf` kept them in the saved look. |
| Reward banner | PASS | Tokyo shows KIMONO, TIDY BUN and OBI CORD. Virginia shows TRAIL COAT, CROWN COILS and TRAIL COMPASS. No page errors. |

## Verticality, wall jumps, bike speed, threat art and natural faces

Chrome, one page per scenario (page reload between attempts), Amsterdam (level 1).

| Check | Result | Notes |
|---|---|---|
| Climb wall rendering | PASS | Grip rail (`climb_face`) and up-arrow sign (`climb_sign`) are visible on a 175px wall; Clippy explains the wall jump on approach. |
| Live wall jump | PASS - assisted | Hero placed at the foot of the wall with Defender on and nearby enemies removed. Holding Right and tapping Space (110ms) climbed onto the roof after 3 presses (1 wall jump plus jump/double jump). |
| Generator verticality | PASS - automated | Each run world gets about 3 climb walls or ledge stairs on average. Rises stay within reach, roofs stay at y >= 106 and stair hops are <= 60px. |
| Bike speed | PASS | Running speed is 190 px/s; riding reaches 361 px/s, with a speed trail and wider camera look-ahead. |
| Threat art | PASS | `bug` reads as a six-legged beetle; `endpoint` reads as an open laptop with a public globe and an exposed port. |
| Heroine face | PASS | Lips are a soft rose line with a faint tint (no glossy pink ellipse); blush reduced. |
| Browser errors | PASS | No page errors. |

## Round: London landmarks, respawn, UK boss windows, charged shots

Chrome, London Thames Run (level index 1), Playwright harness.

| Check | Result | Notes |
|-------|--------|-------|
| Charged shot while ducking | FIXED | Root cause: Down while standing still raised the crouch guard, and shielding cancels the charge every frame (the guard also returned on the release frame). F now lowers the guard. Also, a full-charge low blast (22px tall) overlapped the floor and died on frame one; the low muzzle now rises with charge. Down+F 1.4s hold fires damage 3, and a tap fires damage 1. |
| Enemies after respawn | FIXED | Root cause: enemies were only created at level start. Killing 8 of 61 and then losing a life restored all 61; the nearest one was 1275px from the checkpoint. `respawnEnemies()` keeps a 200px safe gap (fly mode: ahead of the camera only). |
| UK boss vulnerability | FIXED | Root cause: a dodged charge gave only a 1.8s window at the far wall and reset the three-attack counter, so windows were rare and short. A charge now always ends in a stun (shield block, or a 3.5s wall BONK). The trace showed 5 OPEN windows in 40s, with real blasts damaging from 40 to 500px. |
| Arena death in trace | NOT A BUG | The idle harness hero (Defender expired) lost its health to boss hits; it did not fall or drown. |
| Tower Bridge / London Eye / Big Ben | PASS | Redrawn: gothic towers with turrets, blue and white chains, latticed walkways and bascule deck; trussed Eye rim with 32 capsules, cable spokes, A-frame and pier; gilded Elizabeth Tower clock stage, arcaded belfry, ribbed spire, lantern, and Westminster bays with Victoria Tower. Checked as textures and in game. |
| Known issue | OPEN | The RBAC enemy badge text renders mirrored when the sprite is flipped to face left. |

## Round: Paris landmarks, Metro sub-level, music

Chrome, Paris Seine Run (level index 2, world id 3), Playwright harness.

| Check | Result | Notes |
|-------|--------|-------|
| Eiffel Tower, Sacre-Coeur, Moulin Rouge | PASS - visual | Redrawn: lattice tower with arch, two galleries and beacon; white domes on the butte with campanile and stair; red facade with lit marquee and turning-sail windmill. Signature landmarks open the strip; one run had 5 Eiffel, 3 Sacre-Coeur and 2 Moulin Rouge pieces. |
| Paris rooftops, bakeries, boats | PASS - visual | Zinc mansards with dormers and chimney pots; a boulangerie building and a bakery street stall (seeded tests require one per Paris level); glass-roofed bateaux-mouches sail the Seine gaps. |
| Metro sub-level | PASS - visual | The first Paris pipe is a Guimard METROPOLITAIN entrance into PARIS METRO - LIGNE 14: tiled vault, posters, station plates, ticket machines, tiled pillars and two Ligne 14 trains on the rails. Station plates moved below the stage signs after an overlap. Second pipe stays a shared theme. |
| Music | PASS - scheduling | Title, regional main, pipe, metro, bonus and boss songs switch at the right moments (`AH.Audio.musicKind` was `metro` inside the room). Audio unit tests cover song data, no-restart and fallbacks. Listening by ear remains a manual check. |
| Page errors | PASS | None during street, room and boat checks. |

## Round: headwear over hair

| Check | Result | Notes |
|-------|--------|-------|
| Hats cover the hair | FIXED | Root cause: hair was drawn in full before the hat, so swoop, afro, bun and wave tops stuck out above and beside brims and crowns. `underHat` now clips hair above each hat's `HAT_LINE`. Hachimaki and plumes are headbands, so hair stays visible above them. The sombrero crown was widened to avoid a bare sliver. Checked 6 hairstyles x 12 hats in HD and idle/run/jump/fly/duck/slide/shield frames in Chrome; no page errors. |

## Round: cap fit, hijab headwear, Cowboy and India Kurta outfits, Gold Mode

Chrome, Title, Hero Lab and Amsterdam Canal Run, Playwright harness.

| Check | Result | Notes |
|-------|--------|-------|
| Azure Cap fit | FIXED | Root cause: a small dome clipped at y 5.6 sat on top of the head, leaving scalp showing and the visor floating. The crown is now full-width, with a slanted band (brow 5.7, nape 7.4), panel seams and a curved visor over the glasses. `HAT_LINE.cap` is 5.8. Checked with swoop, bun, long, afro and buzz. |
| Hijab | MOVED | It is headwear now (WORLDWIDE), not a hairstyle. It hides all hair (afro included), drapes behind the shoulders and uses the SCARF COLOUR row. Old `hair: 'hijab'` saves migrate to `hat: 'hijab'`. |
| Cowboy / India Kurta outfits | PASS - visual | Open from the start. Checked in Hero Lab, idle, run, jump, duck, slide and fly, for both bodies. Fixed the base belt peeking below the cowboy belt. |
| Heroine bust | PASS - visual | Modest contour, volume shading and an underbust line on the suit and on every outfit; no cleavage. |
| Gold Mode | PASS | The Konami code on the Title screen shows a gold portrait and a toast; the level HUD showed X30 lives and resume stayed null. The unit test checks there is no submit, record, unlock or resume, that restart keeps 30 lives, and that `suit: 'gold'` cannot load from a save. |
| Declined | N/A | The request for a nude mode was declined; Gold Mode was built instead. |
