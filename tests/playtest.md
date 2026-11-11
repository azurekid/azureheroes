# Playtest report - Microsoft Azure Heroes 2027

## Translucent touch overlays and visible ground

- Bug: Amsterdam on phones/tablets. Start a street run with touch controls.
  Expected: visible hero feet and platform tops show where walking is possible.
  Actual: in-canvas buttons at y=222-296 obscure the hero above ground at y=300.
  Owners: `systems/input.js` and the canvas layout in `index.html`.
- Fixed: translucent circular DOM buttons at the canvas edges, replacing the
  initially tested square dock at the maintainer's request. Normal fill opacity
  is 0.12, with a subtle ring and stronger pressed feedback; targets are 44-56px.
  Ground controls sit above the walking contact line and clear the starting hero;
  flight controls use a separate arrangement. The full logical 640x360 view and
  terrain/body coordinates stay unchanged. Phaser alone centers the touch canvas;
  overlays follow actual canvas bounds through resize and are removed on shutdown.
  Pointer capture retains simultaneous holds and clears inputs on cancel, lost
  capture, blur, hiding and shutdown.
- Amsterdam integration PASS: Chrome touch emulation at 852x393, DPR 3, density 1.
  Real multi-touch moved x=60 to 117, combined right/jump raised feet from 300 to
  239.5, and release landed back at 300. Ground artwork top, static body top and
  hero feet all measured 300; painted/body widths both measured 420. Two additional
  fresh documents generated distinct layouts and repeated walking/jumping/landing
  checks. Forced-touch density 2 also retained top=300, width=420, 32x48 hero
  display size and a 640x360 camera.
- Final overlay/layout PASS: phone 852x393 and 393x852, tablet 1024x768 and 768x1024.
  Measured overlays match canvas bounds; all circular targets stay inside the canvas,
  do not overlap each other and clear the spawn hero. Street controls end above the
  y=300 contact line, leaving the ground and bottom HUD exposed. Minimum target
  diameter is 44px, border radius 50%, background alpha 0.12. Inspected final phone
  street and tablet flight screenshots. Portrait preserves the complete view but
  is smaller; landscape is recommended.
- Ground actions PASS: actual touch DUCK, PUNCH, KICK, full 1.2s BLAST charge/release,
  SHIELD, PAUSE/resume and HELP. Pause/resume kept position and health; quitting
  removed controls and restored the title layout. These actions were tested with
  the initial input variant; the final circular-overlay retest also verified
  simultaneous RIGHT/JUMP, landing at y=300, full charge/release and PAUSE.
- Tokyo integration PASS: fresh document, forced touch at density 2. Simultaneous
  UP/LEFT raised the hero and turned facing backward. SHIELD blocked BOOST, and
  touch cancellation released both actions. The final circular-overlay retest
  verified all four viewport layouts, UP/LEFT and SHIELD blocking BOOST.
  Flight has nine controls and no melee.
- Automated PASS: `npm test` 185/185, final focused input/combat suite 26/26.
  Added actual-module tests for all ground/flight actions, multi-pointer holds,
  cancellation, consumed press flags, blur/visibility cleanup and idempotent shutdown.
- Assistance/gaps: browser scripts selected levels and acknowledged briefings;
  movement/actions used browser-generated touch input and real Arcade physics.
  No teleports, invulnerability, refills or boss stuns. These are entry-area
  integration tests, not full-world/room/boss completion or physical iPad/iPhone
  Safari tests. Existing favicon 404 remains; no runtime exceptions occurred in
  the   final scenarios. Development reloads encountered stale cached input code; the
  final checks explicitly fetched the updated module. Maintainer review and
  real-device verification remain required.

## On-demand artwork and mobile startup

- Report: iPhone 17 Pro repeatedly reloads the entire page during startup. Desktop
  browser measurements found roughly 433 MiB of retained artwork canvases plus
  433 MiB of GPU textures. This suggests memory pressure, not a proven device
  crash diagnosis; no physical iPhone crash log was available.
- Backgrounds, region scenery, indoor layers and the world map now register local
  lazy drawing factories. Texture requests draw/upload only requested artwork.
  Scene shutdown releases unreferenced lazy textures after display-list teardown,
  retaining container, TileSprite and sleeping-scene references. Returning redraws
  from local seeded factories. Hero/fighter look-dependent drawing remains eager.
  Readback-friendly canvas contexts and coarse-pointer 1x density reduce mobile
  memory further; desktop remains 2x. No new image downloads, imports or dependencies.
- Browser checks: desktop title used about 76 MiB of artwork canvases and 77 MiB of
  textures instead of 433 MiB each. Mobile Chrome emulation (852x393, touch, DPR 3,
  4x CPU slowdown) used about 19 MiB of canvases and 20 MiB of textures on the title;
  measured load event was 2.06s. Only the title's three lazy backgrounds were drawn.
  Three starts of Amsterdam produced three distinct platform layouts. Returning
  from the level to title evicted regional/indoor artwork.
- Automated PASS: `npm test` 184/184, changed JavaScript syntax checks and diff
  checks. New tests cover deferred allocation, repeat-request reuse, deterministic
  redraw, upload recursion, container/TileSprite retention, teardown eviction,
  mobile memory bounds and matching artwork/camera density. Existing seeded
  layout, drawing-order, account, security and save checks remain intact.
- Assistance/gaps: browser scripts selected scenes and restarted the level for
  these checks. An earlier mobile scenario acknowledged the briefing and emitted
  touch-button pointer events, moving the hero with unchanged health. The final
  lazy-artwork scenario likewise moved the hero via touch, retained a 640x360
  logical camera and returned to title with only its three lazy layers remaining. These are
  integration checks, not unassisted completion, all-world visual review, real
  iPhone testing or music approval. No gameplay cheats or persistence bypasses
  were introduced. Physical Safari verification remains required after deployment.

## Pipe-safe tokens, recovery time and varied mission placement

- Bug: in street worlds, enter a pipe with an undefeated token carrier between
  its entry and forward return. Expected: required work remains on the route,
  with enough recovery time. Previously: the exit always skipped ahead and
  immediately moved the checkpoint; revisits offered no time. Owners:
  `systems/scenes.js` pipe return/checkpoints and `systems/mission.js`.
- Fixed: pending required street work sends the exit back to the entry. Fully
  completed work retains the forward shortcut. The checkpoint changes only when
  the warp completes. Low-time pipe returns, nearby checkpoint revisits and
  blocked boss entry share a distance/climb-based allowance, used at most once
  per missed token per run. The HUD prioritizes missed carriers and released
  drops. Token requirements, life-loss preservation and normal enemy combat stay.
- Mission targets and nearby safe candidates vary from generated geometry:
  cache/relay, gems, carrier assignments, wardrobe caches and weapon drops.
  The existing terrain, encounters and objects already regenerate at each new
  game/restart. No terrain RNG, legacy seeded-output digest, landmark art, music,
  world IDs, account boundary or save schema changed.
- Automated PASS: final `npm test` **171/171**. Includes all eleven worlds across
  100 seeds (1,100 layouts), safe/reachable markers, idempotent mission rebuilding
  and unchanged terrain RNG. Twelve successive new games in each world verify
  at least ten distinct terrain/enemy/reward/object layouts, varied cache route
  fractions and token carriers; Virginia intentionally uses racks, not props.
  Focused checks cover undefeated/released/collected tokens, required versus
  optional objectives, post-warp checkpoints, allowance distance/climb thresholds,
  repeated grants, collected/ahead tokens, room/pause suppression and read-only HUD.
- Real Chrome/Arcade/input scenario PASS: separate processes in Amsterdam
  (seed 1), Paris (42) and New York (2027). Each selected a generated pipe whose
  shortcut crossed an actual token carrier, landed on the pipe and used held S
  to enter. Held S on the actual room exit returned to the original entry with
  that safe checkpoint, zero free tokens and all three live carriers intact.
  With 12s remaining before exit, returns left about 65s, 66s and 70s respectively.
  Repeated recovery calls did not refill time. A second pipe in each world used
  its normal forward return after required work was marked complete.
- Assistance/gaps: the harness positioned the hero on entry/exit pipes and set
  low time; it did not traverse entire rooms. The completed-shortcut branch used
  explicitly assigned completed mission flags, not legitimate token collection.
  No invulnerability, forced boss stun or production bypass was added. The
  existing pinned Phaser artifact was supplied only to its exact CDN request.
  Successful runs had no runtime exceptions; initial concurrent browser runs
  timed out during the full suite, then passed on retry without runtime changes.
  Return captures pause mid-fade. This is integration evidence, not unassisted
  traversal/balance, real-device testing or an audition of unchanged music.

## Hot steam and regional weather

- New York now uses eight reusable, warm-white puffs per vent, rising about
  100 logical pixels. HOT plates pulse before a timed, narrow 8-damage core;
  the secret manhole remains decorative. Tokyo adds slow skyscraper parallax,
  Japanese vertical neon signs, convenience shops, vending machines, tactile
  paving, bike markings, umbrellas and sparse foreground wires/poles. Amsterdam
  adds two rainy/overcast stretches with wet surface reflections and dry gaps.
- Browser scenario checks PASS, not whole-level completion: separate headless
  Chrome processes loaded seed 2027 New York, Tokyo and Amsterdam through the
  actual script loader. A cached copy of the existing pinned Phaser artifact
  replaced only its exact CDN request in the harness; production loading is
  unchanged. No runtime exceptions occurred in the successful runs.
- Assisted camera/clock positioning captured Tokyo and Amsterdam at day/night,
  plus route fractions 0.12, 0.34, 0.50, 0.72 and 0.85. Inspected rainy Amsterdam
  surfaces and its dry late stretch; Tokyo storefronts, signs, sparse framing,
  tower silhouette, birds and pickups remain readable. Forced-touch captures
  show the actual flight shield and ground melee controls above the effects.
  Small street details remain background decoration, not flight obstacles.
- In the real New York scene, placing the hero in an active vent reduced health
  100 -> 92; a repeated same-frame check stayed at 92. Three sources were present
  in this layout after safety filtering; the secret source was never hot.
  The measured puff rise was 97.67 logical pixels. Pause froze steam and rain;
  toggling bonus-room state hid/restored the weather layers.
- Automated coverage checks warning/hot/cool phases, safe spawn/checkpoints,
  mission items, tokens and pipe returns, normal damage invulnerability, shield
  behavior, jumping above the core, pause/help/warp/boss suppression, weather
  fades, wet-top alignment/exclusions and persistent allocation. Tests load
  actual modules in explicit browser order. Eight seeded New York layouts
  retained safe anchors and decorative manholes. Final `npm test` passed
  **164/164**; changed JavaScript syntax checks and `git diff --check` passed.
- Assistance/limitations: cameras, clocks, body position and active heat phase
  were set directly; physics was paused for captures. This does not establish
  unassisted hazard traversal, balance, every generated layout, actual warp
  traversal or real-device behavior. Initial captures retained an unfinished
  intro fade and two harness runs timed out at browser shutdown; camera FX and
  exact-process cleanup were corrected and all five final runs exited normally.
  Regional music is unchanged. Earlier new songs still await human listening.

## Named songs, sewer steam, resume and player melee

- Changes: N/MUSIC cycles Trance, House, Pop, Night Drive and Soft Skies.
  The two named songs have independent original four-bar hooks and response
  melodies, rather than regional melody reskins. New York has decorative,
  reusable sewer steam. R resumes pause without resetting the run. Flight
  direction controls aim backward/forward, and E/touch SHIELD now works in
  flight. J/PUNCH, K/KICK and slides punish open ground bosses alongside blasts.
- Automated: `npm test` passed **158/158**; changed JavaScript syntax checks and
  `git diff --check` passed. Subsequent ground-boss OPEN wording and soft-alpha
  refinements passed 24 focused combat/resume and 11 street-art tests respectively.
  Added coverage includes named-song
  persistence, malformed/blocked storage, mute/stop/context compatibility,
  actual ordered module loading, steam bounds/freeze/suppression, pause-run
  preservation, flight facing/shielding, shared melee cooldowns, once-per-target
  damage, walls and the existing boss armor gate. Wardrobe rendering tests now
  include punch/kick in both bodies, all regional bundles and headwear cases;
  the expanded wardrobe suite separately passed 13/13.
- Browser integration checks PASS for the tested scenarios, not whole levels:
  separate Chrome processes opened New York, Tokyo, Rio and Mexico with
  randomized layouts and forced-touch controls. Actual held keyboard R preserved
  the generated layout, health, mission tokens and score. N visited all five
  choices in order while paused; pointer events used the real MUSIC target.
  Named choices persisted through preference reload and retained their selected
  song across pipe/boss context routing.
- New York: ground puffs visibly rise and fade; daytime/night screenshots used
  assisted camera/clock positioning without the pause overlay. Seven sources
  in the inspected layouts used four reusable puffs each. Paused time stayed
  fixed, bonus-room flags hid all puffs/vents and returning restored them.
  Actual canvas inspection verified 78 alpha levels, maximum 179/255 and no
  opaque pixels: puffs retain soft edges instead of crisp opaque discs.
  Keyboard punch/kick/slide changed boss HP 100 -> 90 -> 76 -> 64.
  Actual mouse clicks on forced-touch PUNCH/KICK then changed HP to 54 and 40.
  Cooldown waits used simulation time, not elapsed wall time.
- Tokyo/Rio/Mexico: actual Left/F presses fired backward and defeated a trailing
  regional bird with two hits, then damaged a trailing air boss from 100 to 90 HP.
  E blocked a front-facing enemy bolt. Direct integration calls to the actual
  air-boss bolt handler preserved 100 player HP for a front hit and reduced it
  to 85 for a rear hit. SHIELD was present in each flight touch layout.
- Assistance/gaps: bird targets were positioned behind the hero, other enemies
  removed and hazard rectangles cleared to isolate firing. Boss targets used
  assisted placement and an explicitly forced recovery window; New York boss
  setup temporarily bypassed the mission gate only inside the browser harness.
  No production bypass was added. These are real rendering/Arcade/input
  integration checks, **not unassisted traversal, boss balance or natural-window
  completion**. Forced-touch/mouse is not a real-device test. New steam warp/boss
  suppression is regression-tested, but actual room/warp traversal, browser
  account flows and every other world's new melee combat were not replayed.
  Early harness runs raced title startup or used wall-clock cooldown waits;
  those harness errors were corrected before the successful integration checks.
- Actual Web Audio: OfflineAudioContext rendered two loops, a loop join and SFX
  at 22050 Hz. Night Drive: peak 0.29436, RMS 0.02825, absolute DC < 0.000001,
  maximum adjacent delta 0.25907, loop delta 0.000086. Soft Skies: peak 0.20554,
  RMS 0.01510, absolute DC < 0.000003, maximum delta 0.25397, loop delta 0.000134.
  Both passed the existing finite/headroom/loop numerical gates. WAV previews
  and render reports are session artifacts, not downloaded game assets.
  **Human headphone/speaker listening approval remains pending.** Numerical
  rendering does not certify timbre, artistic quality or release readiness.
  Maintainer review is required before merge; no deployment was performed.

## Worldwide street art, armed guests and house arrangements

- Scope: localized city tags in all eleven worlds, Japanese decorative glyphs,
  AZURE HEROES/AZUREKID lettering, Octocats and Copilot figures in three spray
  styles. Compact decals fit eligible walking-path fronts; flight worlds use
  non-solid wall panels. Geometry-based placement does not consume gameplay RNG.
  Shared city facades render behind landmark strips; New York keeps its authored
  foreground. Guests and stale users are hacker-sized shooters with distinct
  pistol/rifle art. House has faster main/boss grooves and softer menu/room
  arrangements; regional hooks, styles and audio preferences remain in place.
- Automated: focused tests exercise the real ordered modules, all city
  descriptors/variants, decorative glyph coverage, collision rectangles and
  visible-width placements across 20 seeded layouts per world. Both variants
  fire, retain hacker-sized bodies, take two hits and clean up correctly. Audio
  tests check house tempos, seventh chords, sparse lounge percussion, varied
  rhythms, distinct scene hooks, regional routing, mute and persistence.
- Visual integration: separate bounded Chrome processes opened each of eleven
  worlds with seed 2027; desktop screenshots used assisted camera repositioning,
  clock changes and paused physics. Inspected entry/day and later/night views.
  All registered regions had three decal variants and a foreground; Centraal
  Station is visible in the Amsterdam entry screenshot. Virginia's rack uses
  its real gameplay layer. All eleven worlds were rechecked after the 200px
  fitting change.
  Eight synthetic generated challenge themes, three sections each, and cloud,
  retro, Xbox and sewer secrets were inspected in New York with assisted camera
  placement. They are art/composition checks, not room traversal or warp tests.
- Enemy integration: in Amsterdam actual Arcade world stepping verified both
  guest appearances have 32x37 art and 20x34 bodies, fire bolts, take 10 damage
  unshielded and are blocked by a correctly facing shield, and die on two hits.
  Fourteen guests were spawned into synthetic rooms across the eight themes;
  after 60 physics steps their bodies were clear of solids. This is assisted,
  stationary integration, not unassisted combat or all possible patrol routes.
- Audio: actual OfflineAudioContext renders contain two loops and a loop join,
  with coin/blast/hit SFX, for shared house title/main/pipe/boss/bonus, London
  house main/pipe/boss, and unchanged London trance/pop main. All samples were
  finite; peaks 0.194-0.303, RMS 0.0150-0.0289, absolute DC below 0.00020,
  maximum adjacent delta below 0.269, loop delta below 0.00024. Live routing
  switched all three styles through London main/pipe/boss, toggled mute and
  stopped playback. Before-change London house main/pipe reference renders were
  also generated. Browser QA used the existing Phaser distribution verified against
  the unchanged SRI; production loading and network permissions were not changed.
- Remaining gaps: human headphone/speaker listening and comparison are required
  before music approval; the assistant did not audition the recordings. Rendered
  WAVs are session artifacts under `files/house-audio/` and `files/house-before/`.
  Full unassisted play, mobile/touch hardware, room traversal/return, additional
  random seeds with live physics, and human visual review remain unverified.

## Street spray art, cloud climbs and recoverable boss tokens

- Scope: Amsterdam (1), London (2), New York (11) have city-owned painted
  walking-path faces and six/seven-step extensions to existing cloud stairways.
  Each summit has an MFA token and one of the three required enemy tokens.
  Existing objectives, six gems, quota, level IDs, saves and regional music remain.
  All worlds receive four additional alternating spread/beam pickups. Tap fire
  cooldown is 0.10s, fully charged 0.30s; charge/release and Boost costs are unchanged.
  Stale guests are crouched people with expired badges. Shared detective artwork
  changes a rogue shooter's appearance, not its two-hit combat rules.
- Automated evidence: full `npm test` (142/142 passing), plus changed/new JavaScript syntax and
  whitespace checks. Focused tests load actual modules in HTML order and check
  90 seeded cloud routes using numerical ascending/descending collision
  trajectories; 330 world layouts check safe, distributed weapons. The existing
  1,100 mission-layout checks and historical opt-out generation digest remain.
  Actual scene cleanup tests reproduce falling and flight-offscreen carriers:
  unfinished carriers return alive with remaining health, without granting a
  token; released tokens persist and no longer require carrier recovery.
- Browser evidence: the normal CDN was unavailable. QA intercepted only the
  existing Phaser request with the exact 3.80.1 distribution obtained from its
  public upstream repository and verified against the unchanged SHA-384/SRI.
  No dependency, CDN URL or production loader was changed.
- Separate bounded Chrome processes tested all three cities using actual Arcade
  world updates and Player.update at manually stepped 60Hz: Amsterdam 7/7,
  London 6/6, New York 7/7 ascending landings, plus all intervening descending
  landings. Each required summit carrier was hit once, forced below the cleanup
  threshold, recovered at its post with one health, then defeated. The released
  token collected through actual mission-body overlap; incomplete missions still
  kept the boss locked. The MFA token and safe summit anchor were also inspected.
- Assistance: each trajectory began by positioning the hero on its preceding
  platform with a running start. Enemies were parked offscreen; invulnerability,
  time refill and automatic briefing acknowledgment isolated geometry. Carrier
  hits/fall and final camera placement were scripted. These are real collision
  integration checks, not unassisted combat completions or real-device tests.
  Earlier wall-clock browser bots missed landings when several physics steps ran
  per rendered frame; the bounded fixed-step checks above replaced that evidence.
- Visual review: actual registered canvases show brick/stone surfaces, original
  slanted lettering, overspray, speckles and drips in all three cities, plus human
  guests and trench-coated/fedora detectives. Final summit screenshots confirm
  an above-street viewport and anchored HUD. Regional tracks/SFX were not changed;
  no new musical arrangement or listening approval is claimed.
- Remaining gaps: unassisted full-route combat, live continuous traversal across
  many seeds, keyboard/touch play on real mobile devices, new-route room/secret
  round trips and human visual/listening approval. Existing automated room,
  camera, combat, save, online and security-boundary checks remain enabled.
  Preview browsers and server are stopped after QA.

## New York walkway and bridges

- The New York ground face now carries storefront details and large graffiti;
  its shared collision top and all platform dimensions remain unchanged.
  The formerly missing `bridge_eastus2` texture now depicts the existing solid
  bridges. PR 2's close-range city layer is included.
- Automated checks exercise actual ordered art modules and 30 seeded New York
  layouts, including generated bridge texture references and unchanged collision
  rectangles; they also check other cities and special platforms keep their art.
- An assisted browser canvas composite displayed the registered New York sky,
  foreground, walking-path wall and bridge at logical gameplay scale. This is
  an artwork preview, not a live playtest or a collision-traversal test.
- Live gameplay, other times of day and touch layout were not checked: the
  local browser could not load the existing Phaser CDN script. Human visual
  review and live playtesting are still required.

## Regional routes, mission briefings and inclusive wardrobe defaults

- Redmond's guaranteed scenic stops now include Microsoft campus, Pike Place
  Market, Starbucks, Link light rail, Commons and Building 92. New transit/art
  remains decorative; terrain, collision and music are unchanged.
- Registration explicitly selects one of eleven represented regions as the
  starting world, without location tracking. A pristine guest's default Amsterdam
  access is replaced; actual guest progress is retained. Clears choose random
  uncleared destinations, persist the exact Continue target and record individual
  map clears rather than a numeric prefix. Existing saves migrate without loss.
- Local-guide briefings explain the key, mode-specific relay, two gems and three
  enemy tokens. Physics/timer wait for acknowledgment; pause-menu review preserves
  mission state. The modal covers underlying controls and restores play on Enter,
  Space or the visible button.
- Afro, braids, curls, coils and waves are always available. New York/cork/cowboy
  hats require collected IDs, even on legacy saves. Cowboy is a shared pickup in
  Redmond, Virginia and New York; hijab remains open. Stable indexes are preserved.
- PASS all 131 automated tests, changed/new JavaScript syntax checks and
  `git diff --check`. Tests cover every starting region across multiple seeds,
  no-repeat routes through all worlds, legacy/non-prefix merges, immutable API
  starts, invalid/oversized requests, unauthorized writes, scene completion,
  all-cleared and sandbox no-writes. Wardrobe tests cover free hair, legacy hat
  locks, shared pickup eligibility, save fallback and unlocked-only randomization.
- PASS separate Chrome processes for Redmond desktop, Redmond forced-touch and
  Tokyo forced-touch. Real registration selects Redmond, Continue starts there,
  guide acknowledgment/review work, and physics/time stay frozen during briefing.
  The flight guide correctly asks for a blast rather than a held ground shield.
- PASS assisted Redmond secret-room entry and actual collision collection of
  cowboy; Hero Lab refuses uncollected New York/cork hats, accepts free coils
  with collected cowboy, and saves the look. An assisted clear opens a different
  world, marks only Redmond cleared, and reload retains the chosen destination.
  Desktop and touch runs selected different next destinations. No runtime exceptions.
- Reviewed actual screenshots of the registration form, guide panels, Hero Lab
  and Redmond scenic stops. Camera placement, pickup positioning and mission
  completion are assisted. This is not unassisted combat/traversal, full mobile
  responsive-form coverage or real-device touch certification.

## Local guides, collectible wardrobe, boss tokens and faster firing

- Checkpoint guides use each world's local outfit/headwear through the shared
  civilian rig, with grounded feet and no cape/emblem. Flight retains its
  airborne checkpoint markers.
- Three visibly marked existing enemies guarantee boss-access tokens, alongside
  the deployment key, relay and two-gem requirements. Fixed drop anchors avoid
  solids, obstacles, lasers and cables. Collected/released tokens survive death;
  required carriers return even when normal checkpoint respawn exclusions apply.
  Restart/new layouts reset mission tokens; they never become saved currency.
- Separate optional outfit, hair, local-hat and artefact caches live in existing
  matching-world sub-levels/secrets. Flight worlds and Virginia have no such rooms
  and use side-route stashes. Pickups unlock individual Hero Lab choices; clears
  alone no longer grant clothes. Old entitlements migrate as a fixed snapshot.
  New hats still need collection, even on old completed saves. Hijab/base choices
  remain available. Signed-in progress unions bounded cosmetic IDs; these never
  grant account permissions. Sandbox collections never save or upload.
- Konami now displays Cloud Hacker, not the gold hero. All-world selection,
  30 lives and no saved/submitted run progress remain; no invulnerability added.
- Quick-release cooldown: 0.16 seconds instead of 0.30; full-charge cooldown:
  0.36 seconds. Preserve 1.2-second charging, Boost costs and projectile speed.
- PASS browser integration, all eleven worlds, seed 2027, one Chrome process per
  world: real enemy defeat callbacks release tokens, real Arcade body overlaps
  collect all three, and losing a life preserves a collected token plus an
  uncollected released token while restoring the remaining carrier. Each world
  also collects and saves a wardrobe item through collision. Existing pipe
  rooms use the actual warp animation. No runtime exceptions.
- PASS actual Hero Lab lock/refused-save, always-open hijab and real Konami
  keyboard sequence in Amsterdam, Tokyo and New York; reload preserves the
  collected outfit. Captured each ground world's local guide, pickup locations,
  locked Hero Lab and Hacker title. Amsterdam's forced-touch layout also passes
  death/token/wardrobe checks and actual pointer presses on BLAST. Keyboard and
  touch each emit three quick-release shots without refilling Boost.
- Browser camera/player placement and enemy hits are assisted; death is triggered
  deliberately. These checks do not certify natural carrier combat, unassisted
  completion/difficulty, every optional stash's physical traversal, or real-device
  touch. Frame-aware waits account for headless rendering; unit tests establish
  the exact cooldown threshold rather than wall-clock browser timing.
- PASS all 122 automated tests, changed-JavaScript syntax checks and
  `git diff --check`. Generation covers 100 seeds across all eleven worlds
  (1,100 layouts), including hazard-free token anchors and unchanged terrain/RNG;
  repeated mission decoration is idempotent. Save/API tests cover ownership
  union, frozen migration, malformed/oversized IDs and unauthorized writes.

## Continuous outdoor lighting and full-background Australian sections

- Bondi, the outback roadhouse and Uluru now occupy full 640x360 environment
  plates with transparent sky, rather than oversized landmark cards. Normal city
  strips and decorative surface transit fade out within each section; the harbour
  returns between/after sections. Replaced miniature beach/outback/Uluru pieces
  remain hidden even between sections. Map art, generated layouts, physical piers,
  water gaps, boats, enemies, objectives, rewards and music are unchanged.
- Shared outdoor atmosphere runs a smooth 240-second cycle. `?tod=day` and the
  other allowlisted phases select its starting point, not a frozen sky.
  Pause/help, warps and pipe/secret visits freeze the outdoor phase. Indoor art
  and the HUD retain their lighting; return restores the outdoor atmosphere.
- PASS 114 automated tests: cycle endpoints/midpoints/wrap, section boundaries,
  sustained coverage, viewport dimensions, persistent layer allocation,
  transit restoration, state/room freeze and datacenter exclusion, plus the
  existing terrain/RNG/save/audio/framework/server/security-boundary regressions.
- PASS actual Chrome rendering at 1280x720, one process per world: day, sunset,
  night and sunrise for all eleven worlds (Virginia remains indoors). Sydney
  additionally captured Bondi centre/exit, harbour gap, outback, Uluru and harbour
  return, on desktop and with forced-touch controls. No runtime exceptions.
- PASS live outdoor clock advances; actual pause freezes it. Assisted animated
  pipe round trips (Sydney, Amsterdam and New York) hide outdoor darkness and
  freeze the phase; returning restores it. New York's animated sewer-secret
  entry/return also preserves the phase and the room's authored lighting.
  These are visual/integration checks with assisted camera/clock/room positioning,
  not unassisted world completions, natural entrance testing or physical-device
  touch verification. Human visual acceptance remains pending.
- Reproduce visually: select world 5 from the map in Gold Mode, start with
  `?tod=day`, and traverse the coast/outback/Uluru stretches. Use pause to inspect;
  wait four active outdoor minutes for a complete lighting cycle. Existing
  world-selection and gameplay controls are unchanged.

## Worldwide painted 2.5D rollout

- Applied bounded local roof/side returns, grounded foundations and receding
  terrain to all eleven worlds. City modules retain their architectural identity,
  texture registration order, widths, route fractions and seeded drawing order.
  Shared helpers draw geometry only; no global skew/filter or replacement engine.
- All eight underground themes retain far scenery and three foreground variants:
  Azure Pipelines, GitHub Actions, Docker, AKS, Entra, Functions, London Tube and
  Paris Metro. Shipping-container roofs/ends, workshop machinery, vault/reactor
  casings, station pillars and platform edges gain material-specific depth.
- Cloud Nine, Retro Desktop, Xbox and New York sewer secrets retain their layouts,
  rewards and controls, with receding paths/interiors and dimensional fixtures.
  Shared and regional floor-top textures keep their original collision-aligned
  dimensions; exact-size challenge solids retain low-duct warnings and cache keys.
- Visual verification uses actual Chrome rendering at 1280x720, seed 2027 and
  sunset (datacenter lighting remains its own), one browser process per world.
  Entry, middle, late-world and available guaranteed scenic stops are captured.
  All underground themes are captured at entry/mid-room; all 24 background
  variants are also exported from real rendered canvases for a contact-sheet review.
- Camera/player placement for captures is assisted and scenes are paused. Live
  room checks use the real warp animation and Arcade floor collisions, followed
  by keyboard jump/duck checks; this is integration smoke coverage, not an
  unassisted world completion or difficulty certification. Forced-touch layouts
  are not physical-device tests or touch-button interaction tests.
- User review caught Sydney's outback rendering as a floating rectangular card
  over the harbour. Replaced its broad opaque red backplate with a lower, tapered
  terrain silhouette, scaled the roadside vignette to its surroundings, and
  grounded the outback/coast decorative anchors at street level. The beach also
  loses its rectangular blue/sand card. Route fractions, widths and physics are
  unchanged; the two decorative vertical anchors intentionally change.
- Removed Redmond's opaque near-layer sky fill, which had covered the regional
  panorama with a dark rectangle. Virginia's active `bg_dc_near` layer also gains
  cabinet/beam returns and receding aisle planes, rather than relying only on
  scenery strips that rack gameplay does not render.
- PASS desktop and forced-touch-layout world/room sweeps: all eleven generated
  layouts remain unchanged during assisted visual inspection, with no runtime
  exceptions. All eight themes pass actual animated warp, floor landing at
  y=300, jump and duck checks; room smoke routes finish at 100 health without
  invulnerability or refills. Input checks wait for actual ground contact rather
  than assuming a fixed jump duration.
- PASS all 108 integrated tests, including preserved all-world generation digest,
  scenery registration/dimensions/random consumption, all 24 underground variants,
  exact-size solids, all four secret backgrounds, active datacenter layer and
  Sydney/Redmond backplate regressions. Real-device and final human visual
  approval remain pending.
- No new gameplay, layout, soundtrack, dependencies, outbound services, saves,
  accounts or permissions are part of this visual rollout. Existing audio
  listening-approval and real-device testing limitations remain.

## New York birds, neighborhoods and sewer secret

- Pigeons now use the same shared flying-bird rig as London's ravens, with a
  separate head/beak, tail and two wing poses, rather than overlapping round
  shapes. Ambient pigeons also have a distinct head and unclipped wingbeats.
  Rats have four feet, rounded ears and a curved tail; their existing crawler
  behavior, two-hit health, threat labels and credit drops remain unchanged.
- Brownstones now have flat cornices, masonry, stoops and iron fire escapes with
  diagonal stairs, treads, landings and railings. The near background also includes
  smaller brownstones/fire escapes and a park interval. Central Park's guaranteed
  stop adds a lake, pale arched Bow Bridge, skyline and visible park sign.
- Replaced New York's phone box/cloud secret with a grounded manhole and a
  1,280px brick sewer: eight maintenance ledges, 38 coins, one MFA token, one
  powerup, five rat patrols and an exit manhole. The whole room is reserved before
  pipe zones, with a 160px buffer; other cities retain their existing secrets.
- PASS actual Chrome desktop and forced-touch layout, seed 2027, 1280x720,
  sunrise. Reviewed neighborhood, bird contact-sheet and sewer captures.
  After assisted positioning on the street manhole, normal contact triggered
  the warp. Keyboard duck/run and repeated tap blasts crossed the sewer,
  defeated all five rats and returned via the exit without losing a life.
  Entry health 88, final 76; three lives remained. No invulnerability, health
  refill or combat teleportation. No runtime exceptions.
- The forced-touch run checks layout but still uses keyboard input; it is not
  a physical-device or touch-button interaction test. These are assisted local
  routes, not an unassisted full-world balance/completion claim.
- Sewer music reuses the original Hudson hook in the quieter/slower regional
  pipe arrangement: D minor, syncopated electronic exploration, with space for
  danger and reward cues. Live trance/house/pop cycling, mute/resume and restoring
  New York street music on exit passed in both runs.
- Real Web Audio renders include each full underground arrangement and a loop
  join. Trance/house/pop peaks: 0.2091/0.1996/0.2093 (all below -13.5 dBFS);
  RMS: 0.01977/0.01970/0.01403; absolute DC below 0.000014; loop deltas below
  0.0001; finite samples with no clipping. Human listening approval remains
  pending; these engineering checks do not certify artistic quality.
- All 95 integrated tests pass, including five sewer seeds, isolation/safe
  patrols, real-module bird/scenery registration, music entry/return and the
  historical generator digest using the legacy secret fixture. Changed JS
  syntax and whitespace checks pass. No dependencies, network destinations,
  accounts, saves or permissions changed.

## Grounded New York and Amsterdam city depth

- Times Square's previously disconnected central tower now extends to the same
  solid street foundation as its neighbors. Times Square and Midtown canvases
  are 330px high; their unchanged widths keep scenic spacing intact. Taller
  windowed facades, street-level entrances and dark contact edges replace the
  floating appearance. No terrain was moved to hide the problem.
- Amsterdam's five canal-house rows have 24px more headroom, shallow roof/side
  returns and continuous paved quays. Narrow facades, ornate gables, window
  mullions, hoists and original seeded random consumption remain intact.
- PASS actual isolated Chrome, one process per world, seed 2027, 1280x720:
  New York Times Square/Midtown (sunset) and Amsterdam two canal rows/Centraal
  (night). Reviewed captures for visible foundations, skyline height and local
  identity. No runtime exceptions; full generated layout JSON unchanged.
  Camera/player positioning was assisted and scenes paused, not full playthroughs.
- Automated coverage checks facade-to-ground contact, continuous quays, preserved
  scenery widths/routes and the existing all-world seeded terrain digest.
  All 92 tests, city JavaScript syntax and diff whitespace checks pass.
  No physics, objectives, audio, dependency, save or account changes.
- Real-device touch appearance and user visual approval remain pending.
  New York's phone booth and additional requested landmarks remain outside this
  art correction.

## Initial Times Square painted 2.5D pilot (historical)

- Changed only New York's existing `sc_ny_times` drawing: shaded facade returns,
  billboards on angled sides, atmospheric distant frontage, a vanishing-point
  plaza, red steps, lamps and restrained reflected sign light. TIMES SQUARE and
  BROADWAY signs add place identity alongside Azure/Copilot screens.
- Existing 300x235 logical size, 0.1 scenic-route stop, script registration and
  parallax remain unchanged. No engine/dependency, gameplay, physics, layout,
  music, save or other-city changes are part of this pilot. The New York phone
  booth and additional requested landmarks are not included in this trial.
- PASS isolated Chrome A/B: seed 2027, 1280x720, sunset, camera x=924.
  The original callback was replayed in the paused comparison scene for the
  before image; only its texture changed. Frozen camera fade was cleared for
  both shots. The complete layout JSON stayed equal; no runtime exceptions.
  Reviewed both captures for depth, sign legibility and unobscured gameplay.
- Both views use identical assisted camera/player positioning and paused scenes;
  this is visual evidence, not an unassisted playthrough or performance benchmark.
- 91 integrated tests pass, including the original terrain digest and a focused
  perspective/footprint/route regression. Changed JavaScript syntax and
  whitespace checks pass. Mobile-device appearance and user approval are pending;
  this initial result predates the taller, grounded city treatment above.

## Grounded checkpoints, guides and Konami map access

- Removed transparent glow padding from flags, terminals and the standard pipe.
  Bottom anchors and pipe display bounds now match the drawn body, without
  moving terrain or changing collision/warp geometry.
- Ground checkpoints have non-solid friendly guides, CHECKPOINT / ACTIVE labels
  and proximity lessons covering Azure managed identity, Entra MFA/least privilege,
  Defender alerts/patching and Microsoft 365 sharing. Leaving hides the lesson.
  Pipe/bonus visits cannot activate main-world checkpoints.
- PASS assisted Amsterdam Chrome check: hero feet, guide feet and flag bottom
  all meet the y=287 platform. Screenshot reviewed for readable lesson panel,
  grounded guide/flag and retained canal-house detail. Teleports,
  invulnerability and paused physics were used for this visual inspection.
- PASS Chrome Konami sequence through real keyboard events after title readiness:
  all 11 pins open, saved unlocked stays 1 and cleared count stays 0.
  New York deployment is Gold Mode with 30 lives.
- PASS New York pipe inspection: drawn bounds y=254..300 match the 46px solid
  body and its supporting street. Normal progression, wardrobe locks and Gold
  Mode's no-save/no-score-submission rules have automated regressions.
- 90 integrated tests pass, including four new checkpoint tests and an all-world
  Gold Mode deployment test. Real-device touch testing remains outstanding.

## Electronic-only soundtrack

- Supersedes the rejected band-style rework. Only trance, house and pop are
  selectable; removed preferences warn and reset to trance without changing
  game progress. Legacy dance migrates to trance.
- All 11 cities supply original regional themes for main, pipe and boss
  arrangements. Existing club compositions retain their baseline event data.
  Hooks are recurring game themes, not copied commercial melodies or recordings.
- The mandatory `music-producer` workflow now enforces this policy and requires
  actual renders plus human listening approval for every new level.
- Chrome OfflineAudioContext rendered all nine New York style/context combinations:
  full loops plus returns and coin/blast/hit overlays, 22,050Hz.
  Finite samples, peak 0.194-0.290 (below -10 dBFS), RMS 0.0140-0.0282,
  absolute DC below 0.000290, maximum adjacent-sample delta below 0.265
  and loop-boundary delta below 0.000327. All nine engineering gates pass.
- Live Chrome AudioContext passes all nine London style/context routes,
  mute/resume and stop. Automated tests cover cycling, preference migration,
  local-only persistence, Gold Mode boundaries, regional hooks and node cleanup.
- **Listening approval pending:** the assistant did not hear these previews.
  Human headphone/speaker auditions must assess melody, groove, fatigue and
  regional identity before approval. Mobile/Safari listening remains untested;
  original composition is not a legal copyright-clearance guarantee.

## Tactical missions and hidden gems

- Two required ordered tasks (deployment cache then relay), two-of-six gem quota,
  optional crouched security scan and extra gems for bonus score. State survives
  life loss, never enters account/save data, and resets with a new run.
- Generated objectives prefer existing upper routes without changing terrain or
  random draws. 1,100 seeded layouts pass placement checks; over 100 seeds,
  527/800 street caches use upper routes. Time allowances: +90s ground, +45s flight.
  Normalizing only mission data/time reproduces the original terrain digest.
- PASS Amsterdam assisted Chrome integration: incomplete boss approach blocks;
  cache contact, actual held E relay and held S bonus scan work; gem quota opens
  the arena; life loss preserves completions and score. Teleports and
  invulnerability were used, not an unassisted difficulty assessment.
- PASS Tokyo assisted Chrome integration: camera waits at a missed gem without
  completing it. Cache contact and a real F press/release activate the relay;
  two gem contacts release scrolling. A later-checkpoint death rewinds to the
  pending gem, preserving completed tasks and allowing recovery.
- PASS fresh Amsterdam layout: cache at y=85 collects through actual body
  overlap. Using the existing room-warp API, a zone-0 gem at y=156 collects
  through Arcade physics. Natural room entry/exit traversal was not established.
- PASS Virginia assisted Chrome integration: the existing first terminal reaches
  100% by standing nearby while mission progress remains incomplete.
- `npm test`: 85 passing regressions, including ordered task gates, optional
  zone pickups, one-time scoring, legacy levels and art registration.
  Nested JavaScript syntax and whitespace checks pass.
- Remaining manual checks: unassisted balance, complete underground pickup/return
  traversal, touch mission interactions and real-device play. Seeded placement and
  assisted tests do not prove every generated route is enjoyable.

## Modular content migration (2026-11-05)

- All 78 integrated tests pass using actual ordered modules, including world
  generation, cloud rooms, map metadata, wardrobe rendering and account boundaries.
- Shared audio composition/playback matches the pre-migration baseline: all 27
  compiled songs and deterministic synthesis, routing, noise and random consumption.
- Art verification compares the pre-migration snapshot with the extracted modules:
  all 713 registered texture keys/order/drawing hashes and 1,758 dynamic
  hero/HD/platform drawing hashes match.
- Seeded layout regression preserves the exact pre-migration output digest across
  all 11 worlds and five seeds (55 generated layouts).
- Public script delivery is tested against the Node server; account data, server
  source, tests and traversal paths remain inaccessible.
- All 120 JavaScript files, including nested city modules and test helpers, pass
  `node --check`. CI now checks nested tracked JavaScript instead of shallow globs.
- Node-hosted isolated Chrome smoke: all 11 worlds reach `play` with no JavaScript
  exceptions or missing-texture warnings; regional wardrobe HD previews render.
  The map shows all 11 pins and the New York preview. Amsterdam, London, Paris
  and New York entry screenshots were reviewed for retained architecture and skies.
- The initial temporary Python host failed to deliver some city scripts, causing
  downstream art-registration errors. The actual Node host loads the modules;
  no drawing callbacks were changed to mask delivery failures.
- This is a structure-only migration, not a new unassisted difficulty assessment.

## New York world 11 integration (2026-11-05)

- Seeded generation: 100 layouts are distinct, within 8,000–13,000px, include a hot
  dog cart, two distinct shared cloud rooms, regional enemy skins and both weapons.
  Existing world IDs and region mappings are unchanged.
- Map: New York city coordinates are registered with an offset beside Virginia;
  East US 2 is explicitly a hosting-region mapping, not a local datacenter claim.
  Live map verification shows 11 pins, the New York panorama preview, correct
  Virginia-clear unlock text and non-overlapping 22px pin hit areas.
- Isolated headless Chrome: New York reaches `play` with no JavaScript exceptions.
  Final reload finds all required regional textures, including the subway train.
  Entry and map screenshots were reviewed: brownstone facades, Liberty, Empire
  State, Chrysler and raised Brooklyn Bridge towers remain identifiable.
- Assisted physics traversal: an 11,305px layout reached the arena approach in
  79.7 seconds with zero deaths, 16 wall jumps and normal movement/jump commands.
  Invulnerability and Boost refills were enabled; no route teleport was used.
- Boss integration: Zero Day Boxer reached K.O. through natural vulnerability
  windows in rounds 1–3. The test teleported to the arena, granted invulnerability
  and refilled Boost; it did not force stuns. This is not an unassisted difficulty
  assessment. The browser reported no JavaScript exceptions.
- The shared browser tool crashed on entry; an isolated Chrome process loaded the
  level successfully. Static guest hosting returns expected 404s for `/api/health`
  and the favicon, distinct from game exceptions.
- Not yet signed off: unassisted full-route difficulty, human listening feedback
  for Hudson House, real-device touch and mobile Safari.
- Regression suite: `npm test` passes all 68 tests, including all 11 wardrobe bundles
  in every pose, 100 seeded New York layouts, scenery placement and audio routing.

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
| Gold Mode | PASS | The full key sequence entered through the browser keyboard on Title showed a gold portrait and toast; Enter then reached Select and launched a level with `AH.Run.gold === true` and 30 lives. Key events accept `code` or `key`, ignore held-key repeats and swallow interrupted partial sequences. The unit test checks there is no submit, record, unlock or resume, that restart keeps 30 lives, and that `suit: 'gold'` cannot load from a save. |
| Declined | N/A | The request for a nude mode was declined; Gold Mode was built instead. |

## Round: bowler fit and hacker characters

Chrome, isolated guest profiles, Hero Lab, Amsterdam and Virginia. Level selection
and encounter positioning used existing scene APIs; the player was teleported for the
encounter checks. The shooter's cooldown was shortened for the shield check.

| Check | Result | Notes |
|-------|--------|-------|
| Bowler fit | FIXED | The crown clip ended above the brim, exposing a gap. The fuller dome now reaches its band and brim. Reviewed six hairstyles on both bodies in HD, plus afro and ponytail across gameplay and HD poses. Automated tests cover all eleven poses and hair clipping. |
| Cloud Hacker hero | PASS - scoped | The hood is loose and open at the neck, with visible hair and hoodie drawstrings rather than a chin wrap. After loading fresh art, checked both bodies, six hairstyles and bowler/hijab overrides in Hero Lab or HD previews, plus all eleven gameplay poses in a texture sheet. Pixel comparisons confirmed visible hair-colour changes for seven classic styles on both bodies. Set a look with scene APIs, switched hijab/hood and saved with the keyboard, then reloaded and confirmed the saved look. In Amsterdam, the saved hoodie appeared in idle, duck and slide; no teleport was used for those checks. Automated tests cover both bodies, five hairstyles, five headwear choices and all gameplay/HD frames. |
| Rogue Hacker | PASS | In Virginia, the nameplate and terminal are visible; an actual fired bolt was blocked by E, with health remaining 100. Two ordinary keyboard-fired blasts reduced health 2 to 1 to 0, produced one Azure Credit and showed the Entra MFA tip. |
| Threat guide | PASS | H and Right opened the guide; the new identity entry and its shield advice fit in the existing panel. |
| Generated placement | PASS | 800 seeded world generations check street/data-center hackers, safe patrols and separation from ground enemies, obstacles, bikes, racks, spawn, checkpoints and boss arenas. Flight-only worlds have none. |
| Browser errors | PASS - scoped | No JavaScript page errors in the final Amsterdam encounter; the existing missing favicon returned 404. |

Not tested in this round: full unassisted level completion, real touch devices or
mobile Safari. The teleported checks verify integration, not overall combat balance.

## Round: anonymous, capeless Cloud Hacker

Chrome, isolated guest profiles with fresh art. Looks and level starts were set
through existing scene APIs; no teleport, account login or score submission was used.

| Check | Result | Notes |
|-------|--------|-------|
| Hero Lab | PASS - scoped | Black pullover and hood, drawstrings, chest `>_` logo, face mask and dark lenses; no cape. Reviewed both bodies with five hairstyles, bowler and hijab overrides, and a classic hero control in HD previews. A texture sheet covered all eleven gameplay poses. |
| Amsterdam | PASS - visual | Female long-haired hacker appeared capeless at the level start; abilities remained available. |
| Tokyo | PASS - visual | Male hacker used the capeless flight texture; automatic flight continued while the level was running. |
| Automated | PASS | Wardrobe tests cover both bodies, five hairstyles, five headwear choices and all normal/HD poses, with classic, regional and Gold Mode cape controls. `npm test` passed all 43 tests. |

These are scoped visual checks, not complete level playthroughs or real-device tests.
The existing missing favicon produced a 404; no other console errors were observed.

## Round: enemy-style Cloud Hacker

Chrome guest profiles with fresh art. Amsterdam was entered through the keyboard;
Tokyo and its look were selected through scene APIs. The player was teleported
next to the existing Amsterdam hacker for the side-by-side encounter check.

| Check | Result | Notes |
|-------|--------|-------|
| Enemy appearance | PASS - scoped | The hero uses the enemy's enclosed hood, red visor and terminal, with a matching dark zip hoodie and no cape. Pixel hashes for both enemy frames were unchanged by the shared-art refactor. |
| Hero Lab | PASS - scoped | Selected Cloud Hacker with the keyboard, saved it and reloaded; the title portrait retained the selection. Compared both bodies, all eleven gameplay poses, and bowler/hijab overrides in previews. |
| Amsterdam | PASS - scoped | Keyboard movement and a quick-release blast worked; the teleported encounter showed the hero beside the named Rogue Hacker. No invulnerability was applied, and the player took damage. |
| Tokyo | PASS - scoped | The capeless flight texture advanced with the level, and a quick-release blast consumed Boost and spawned a projectile. |
| Automated | PASS | Tests cover normal and HD textures for every pose, both bodies, five hairstyles and five headwear choices, old saves and caped controls. Pixel comparisons of 80 generated images confirmed the built-in hood hides hair; the bowler still shows hair colour. `npm test` passed all 44 tests. |

These are scoped visual and control checks, not complete level playthroughs or
real-device tests. The Tokyo browser console reported only the existing favicon 404.

## Regional transit and house/trance soundtrack

Method: fresh isolated Chromium guest contexts per world, no accounts or score
submissions. Keyboard movement was checked in Amsterdam, Tokyo and Sydney.
London entry/exit used the actual Down-on-pipe interaction after teleporting to
the pipe tops; jumping was checked inside the room. Mid-room and scenic inspection
used teleports or paused camera positioning, with the hero hidden for landscape
screenshots. No invulnerability, refilled Boost or forced boss stun was applied.

| Check | Result | Evidence |
|-------|--------|----------|
| Amsterdam (1) | PASS - scoped | Art and moving blue/white trams, yellow trains and glass-roof canal boats loaded without runtime errors. Centraal and the canal-cruise stop were placed on the scenic route. |
| London (2) | PASS - scoped | First pipe entered `tube`; tiled stations, roundels, journey maps, eight-theme platform materials and two passing trains were registered. Arcade jump worked. The real exit restored world bounds, a street checkpoint and London music. |
| London touch layout | PASS - scoped | Forced-touch browser layout showed the room at mid-route; pointer-down on DUCK crouched the hero. All seven action/direction buttons were present. This was not a real-device test. |
| Tokyo (4) | PASS - scoped | Flight and keyboard movement remained intact. Metro trains, elevated rails, street traffic and petals moved; billboard streets, Shibuya station and two blossom groves appeared at guaranteed stops. |
| Sydney/Australia (5) | PASS - scoped | Beach sand, surf, umbrellas, outback roadhouses and larger red-rock Uluru were visually inspected. Expedition traffic appeared; solid 4x4 dimensions were 88x44. |
| Music | PASS - technical | Original 32-bar 126-138 BPM house/trance tracks replace novelty/chiptune songs. Browser M mute/unmute set gain to 0/0.5 and resumed a running AudioContext. Eight-second drop excerpts from Paris, Amsterdam and boss tracks rendered with finite samples, peaks 0.202-0.211 and RMS about 0.038 (below clipping). This is not a listening-quality judgment. |
| Automated | PASS | `npm test`: 48 tests. Thirty scenic-placement seeds per changed region, 80 room seeds across Amsterdam/London/Paris, all eight themes, all seven layouts, baseline alignment, transit movement, offbeat bass/four-on-floor timing, synth-only ducking and node cleanup. Existing combat, wardrobe, API and contribution-boundary tests also passed. |

### QA-found scenic alignment issue - fixed
- Level: Amsterdam, Tokyo and Australia.
- Steps: inspect the station, beach and Uluru behind foreground platforms.
- Expected: station trains align with rails and low landscape details remain visible.
- Actual: the old universal strip baseline hid beach sand and placed Tokyo's
  station train below the moving rail line.
- File suspected: [scenes.js](../systems/scenes.js) and [sprites.js](../art/sprites.js).
- Fix: optional per-highlight baselines, tested in deterministic placement and
  re-inspected in fresh browser contexts. Uluru also gained a larger red-rock silhouette.

No full-world completion, boss-balance pass, Safari test or human music-listening
session was performed for this change.

## Selectable music styles

Method: isolated local guest sessions in Chromium. Keyboard input and browser-
emulated touch events were exercised on the canvas. Amsterdam pipe entry/return
and the boss trigger used teleports; there was no invulnerability or forced stun.
The static server's `/api/health` and favicon requests returned the expected 404s;
no JavaScript page errors were observed in the scoped touch and reload checks.

| Check | Result | Evidence |
|-------|--------|----------|
| Selector | PASS - scoped | N and the MUSIC touch target cycle dance, jazz, country, blues and rock on title, map and level screens, including pause. N was also checked in Hero Lab and the leaderboard. Title/help targets do not overlap; the hidden selector does not react while help is open. |
| Local preference | PASS | Selection survives reload without changing the saved run. An invalid stored style warns and defaults to dance; unavailable storage retains the choice for the session. |
| Scene routing | PASS - scoped | Amsterdam's world track switched styles, a real Down-on-pipe interaction entered an Actions room and returned to world music, and the boss trigger selected a boss track. The setup teleported to each trigger; this is not a full playthrough. Automated tests also cover Metro, bonus, regional dance tracks and all other contexts. |
| Mute and Gold Mode | PASS | Mute stayed active while switching genres and resumed normally. In a real Gold run, changing genre made no save or progress push; muting saved only the preference locally and made no push. Normal-mode mute still invoked progress sync. |
| Audio output | PASS - technical | Eight-second offline renders of the title, world, challenge and boss arrangement for all five styles produced finite samples. Peaks were 0.153-0.220 and RMS 0.032-0.037, below clipping. These measurements do not judge how the music sounds. |
| Automated | PASS | `npm test`: 57 tests, including genre rhythms and voices, swung eighth timing, contextual routing, storage failures, Gold Mode, node cleanup and the existing gameplay, API and contribution checks. |

### QA-found Gold Mode mute issue - fixed
- Level: any Gold Mode run.
- Steps: mute while a Gold run is active.
- Expected: change the local sound preference without pushing progress.
- Actual before the fix: the shared save helper invoked the online progress push.
- File suspected: [audio.js](../systems/audio.js).
- Fix: suppress progress pushes from the shared save helper during Gold runs;
  verified both Gold and normal behavior.

No human listening assessment, real-phone/Safari test, full-world playthrough or
unassisted boss-balance check was performed for this music change.

## Documentation screenshot refresh

Method: isolated local guest sessions. The title, map and Hero Lab were captured
in a browser; Amsterdam, London, Paris, Tokyo and Sydney were started with the
documented scene API in separate headless browser processes. Cloud and transit
rooms were entered with `warpPipe` teleports. Daytime was selected with `?tod=day`;
no invulnerability or forced boss stun was used.

| Check | Result | Evidence |
|-------|--------|----------|
| Current screenshots | PASS - scoped | Visually inspected the title, map, Hero Lab, Amsterdam, Tokyo, Sydney, GitHub Actions, Docker, London Underground and Paris Metro captures at 1280x720. |
| Links and artifacts | PASS - automated | Framework tests check local documentation links, PNG signatures, referenced screenshots and the temporary browser-output ignore rule. |

The tool-managed headless WebGL target crashed when starting a level; fresh
software-rendered browser processes were used for the gameplay captures. The
cause of that capture failure was not established. These screenshots are not
full playthroughs, real-device tests or evidence of gameplay balance.

## Landmark-first transit composition

Method: separate isolated guest browser processes for Amsterdam, Tokyo and Sydney,
using the Canvas renderer after the integrated browser's WebGL target became
unavailable during level startup. Inspected entry and later scenic stops at
1280x720, plus Amsterdam at night with forced-touch controls. Scenes were paused
for pixel comparisons; later views used camera positioning and extra decorative
traffic spawned through existing scene methods, not an unassisted playthrough.

| Check | Result | Evidence |
|-------|--------|----------|
| Amsterdam 1 | PASS - scoped | Centraal's facade and sign and the later canal scenery remain in front of trains, trams and infrastructure. Inspected both captures. |
| Tokyo 4 | PASS - scoped | Billboard details and the Shibuya station sign/train remain visible; flight mode is unchanged. Inspected entry and station captures. |
| Sydney 5 | PASS - scoped | Beach and outback artwork are no longer crossed by the road or traffic. Inspected entry and roadhouse captures. |
| Actual overlap | PASS | Across seven sampled views, 1,426,448 opaque landmark pixels were identical with land transit visible versus hidden. Moving the same transit temporarily to the old foreground side changed 8,117-22,564 landmark pixels per view, confirming the check detects real occlusion. |
| Night / forced touch | PASS - scoped | Amsterdam's night facade and sign stayed readable; the overlap check passed with the touch overlay visible. This is browser emulation, not a real-phone test. |
| Regression | PASS | `npm test`: 59 tests. Transit tests cover all seven road worlds, slimmer bands, reduced tram/train display sizes, traffic spacing, seeded movement and Tokyo flight. Changed JavaScript syntax checks also passed. |

No page exceptions were observed in the scoped Canvas checks. No full-world
playthrough, unassisted combat-balance check or hardware-WebGL validation was
performed. Playable vehicles, collision geometry and saved progress are unchanged.
