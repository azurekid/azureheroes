---
name: qa-playtester
description: 'Verify Azure Heroes controls, procedural reachability, cloud rooms, duck/slide combat, saves, online behavior and security regressions. Use after any level, system or community skill change.'
---

- Read [game-contract](../game-contract/SKILL.md) and [game-security](../game-security/SKILL.md).
- Verification may add/update automated tests in `tests/` and evidence in `tests/playtest.md`.
  Do not change runtime code during the QA step; hand failures to the owning implementation step and retest.
- Test: start screen, all controls, jump reach, enemy hits, coin collection, checkpoint, boss, game over, restart, mobile touch buttons.
- Report each bug as: Level, Steps, Expected, Actual, File suspected.
- Mark PASS / FAIL per level, do not mark the game done if one level fails.
- Also test: world map (select, deploy, cleared routes), Continue after game over and after a clear, Hero Lab, warp pipes, secret rooms, and with `npm start`: register, login, score posting and the leaderboard. Run `npm test` for the API.
- Use one browser process per level in headless runs. Starting two levels on one page stalls the harness, not the game.
- Test H help (title and in game, page with Left/Right), Q quit, Esc/P pause menu, blasts destroying enemy bullets, suit unlock banner and locked suits in the Hero Lab, enemy nameplates.
- Playwright `keyboard.press` can be shorter than one frame; Phaser drops it. Hold keys about 100 ms (`down`, wait, `up`).
- Verify quick-release and 1.2s charge on keyboard and touch, no premature shot,
  Boost costs, replacement/expiry/respawn and charge cancellation on state changes.
  Test per-target beam hits, wall collisions and spread fan counts.
- Observe natural ground/air boss windows, armor rejection, phase pressure and
  synchronized OPEN text/green marker/countdown; distinguish this from forcing stun.
- Exercise all seven room layout templates with real Arcade physics, token collection
and return pipes. Test all eight room themes: six shared, Paris `metro`, and
London `tube`. Check seeded diversity, not only object counts. Verify guaranteed
scenic-route stops, moving road/rail/water transit, Tokyo's unchanged flight,
and Australian 4x4 sizes.
- For transit changes, inspect overlapping landmarks at entry and later scenic
  stops in desktop and forced-touch layouts. Roads, rail decks and land traffic
  must stay behind landmark facades and signs; compare with transit hidden where
  possible rather than treating texture registration as visual verification.
- For global painted-depth changes, inspect entry/later/scenic stops in all eleven
  worlds, all eight underground themes and their three variants, and all four
  secret-room themes. Check actual datacenter aisles as well as city strips.
  Verify roof/side contact, receding terrain, readable hazards/exits and unchanged
  texture/collision bounds. Camera scroll uses logical coordinates even at 2x output;
  scenery scroll factors must be accounted for when centering landmarks.
- Outdoor atmosphere: verify the continuous 240-second cycle, wrap continuity,
  deterministic `?tod` starting phase, pause/help/warp freeze and room-return
  restoration. Indoor art and HUD keep their authored lighting. For full-background
  sections inspect each fade boundary and centre, city/transit suppression and
  harbour return at day/sunset/night/sunrise, including forced-touch layout.
  Assisted camera/clock positioning is visual evidence, not unassisted completion.
- Music checks: follow [music-producer](../music-producer/SKILL.md)'s actual-render and human
  listening gates; do not approve timbre from fake Web Audio nodes.
  Select trance, house and pop by keyboard and touch; check migration of old styles.
  Verify the choice persists locally across reloads, all scene contexts follow it,
  old/invalid preferences fall back safely, and selecting music or muting in Gold
  Mode never pushes progress.
  Preserve house/trance beat timing and synth-only ducking; test genre-specific
  rhythms/voices, mute/resume and node cleanup. Offline waveform/headroom checks do
  not substitute for listening feedback.
- Verify every world's wardrobe bundle in every pose, locked hair/accessories as well
  as outfits, old-save fallback and unlocked-only randomization.
- Verify individual wardrobe stashes, room scoping, permanent ownership/reload/cloud
  union, frozen legacy entitlements and always-open hijab. Clearing new worlds must
  not grant clothing. Hacker Mode must use Cloud Hacker and never save collections.
  Check local guide garments/headwear, guaranteed three-token carrier drops,
  collision collection, death/checkpoint recovery and boss gating. Tap cooldown
  is 0.16s with unchanged charge/Boost costs and keyboard/touch release behavior.
- Verify textured hair without progress and New York/cork/cowboy hats locked
  even on legacy completed saves; collect cowboy in each eligible US world.
- Regional routing: select each represented sign-up region, preserve old saves,
  randomize only uncleared destinations, persist exact Continue destination,
  and mark only actual clears on the map. Test all-cleared and sandbox no-writes.
  Check account-form focus restoration and desktop/touch guide acknowledgment,
  frozen timer/physics and pause-menu mission review.
- Test Down/S duck versus E shield (ground, air and crouch guard), low shots, once-per-slide damage, ceiling clearance,
  actual touch actions, all cloud-room themes, time grants, disjoint bounds and pipe returns.
- Use deterministic seeds for generation assertions and real Arcade collision traversal.
  Preserve physics frame synchronization in bots; reject implausible instant completions.
- Identify invulnerability, refilled Boost, teleporting or forced boss stun in reports.
- After a death, count live enemies against `L.enemies`; fire Down+F tap and Down+F hold.
- Let a ground boss charge past you and confirm the wall BONK opens a full window.
- Step back from a fighter combo, run under a jump kick and stay grounded under an
  uppercut: each whiff must show WHIFF/OPEN and accept blasts. Check ROUND 2/3 banners,
  the boss turning to face you on both sides, and the K.O. topple.
  Those checks prove integration/reachability, not unassisted combat balance.
- Run `npm test` for gameplay, framework, security-boundary and server regressions.
  Load real modules using `tests/helpers/load-game.js` and browser script order,
  never extract/evaluate source fragments. Verify catalogue completeness, unique
  world IDs/regions, local ownership, saved indexes and static script delivery.
  Verify skill discovery metadata, relative links and pinned CI/CDN integrity.
- Do not call browser emulation a real-device test or claim skills alone prevent backdoors.
- Missions: verify key-before-relay, held ground shield versus flight blast,
  optional duck scan, hidden gem quota, inaccessible boss/exit while incomplete,
  no duplicate scoring and unchanged saved progress. Die before/after objectives;
  verify flight camera recovery and underground bonus gems with actual collisions.
- Check grounded flag/guide/terminal feet and pipe bases against platform tops,
  active checkpoint labels and readable Azure/Entra/Defender/Microsoft 365 lessons.
  Rooms must not activate main-world checkpoints. Konami Gold Mode opens all map
  worlds without marking them cleared or persisting unlocks.
