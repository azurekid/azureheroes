---
name: game-contract
description: Use before any game code change. Defines the shared interfaces for Azure Heroes 2027.
---

- Player API: player.x, player.y, player.health, player.mfa, player.credits, player.boost
- Player methods: player.jump(), player.doubleJump(), player.azureBlast(), player.fly()
- Enemy API: enemy.type, enemy.health, enemy.x, enemy.y, enemy.update()
- Level format: { id, name, width, platforms: [], lasers: [], coins: [], mfaTokens: [], enemies: [], exit: {} }
- HUD reads only from game state, never changes it.
- No agent may change this contract without updating this file first.
- Drawing lives in shared `art/` modules and `worlds/<city>/` art modules, never inline
  in scene/gameplay code. Shared rigs must be reused, not copied per city.
- Community workflow: [game-orchestrator](../game-orchestrator/SKILL.md).
  Every change also follows [game-security](../game-security/SKILL.md).
- Extend this contract before consumers. Prefer optional fields with explicit defaults;
  preserve old levels, guest play, saved progress and stable level IDs. Update all affected
  skills, implementations, tests and player-facing controls together.

## Modular content ownership

- `worlds/catalogue.js` defines `AH.WorldOrder`, the explicit stable city ordering.
  City scripts extend `AH.Worlds[slug]` without replacing other fields. The slugs in
  order are `amsterdam`, `london`, `paris`, `tokyo`, `sydney`, `venice`, `rio`,
  `mexico-city`, `redmond`, `virginia`, `new-york`; IDs remain 1 through 11.
- `worlds/<city>/world.js` sets `.world`: existing world metadata/options plus
  `map: [longitude, latitude, dx, dy]`. Layout generation remains shared in `levels/`;
  map UI reads the city metadata instead of maintaining a second geography table.
- City artwork and rewards belong beside that metadata; shared canvas tools, hero/
  fighter rigs and cross-world assets live in `art/`. Preserve texture names,
  registration order, drawing algorithms, random consumption and saved wardrobe indexes.
- City `music.js` sets `.music`, original regional song data consumed by shared audio
  composition tools. Generic songs/styles, synthesis and scheduling remain shared.
  Save persistence belongs in `systems/save.js`, independent of audio.
- Scripts are loaded explicitly in dependency order by `index.html`, with no runtime
  discovery, remote imports, new packages or build step. Tests load the same ordered
  scripts; never recover modules by slicing text out of a source file.
- Adding a world extends its folder, the catalogue and explicit HTML entries, not
  scattered city switches in shared engines. Shared APIs remain `AH.Art`, `AH.Levels`
  and `AH.Audio`; preserve guest play, existing controls, saves and online contracts.
- Every new level, regional world, boss arena or sub-level requires the
  [music-producer](../music-producer/SKILL.md) workflow. City `.music.theme` may
  describe `{name, tonic, hook, colour, feel}`: an original four-bar semitone hook
  relative to the tonic (`.` rest, `-` hold, `|` bar separator), regional palette
  and groove. Shared composition builds trance/house/pop arrangements from
  it; legacy house/trance descriptors remain compatible. Audio quality
  requires actual renders plus human listening approval, not just unit tests.

## Contract revisions

### Regional starts, random destinations and mission briefing

- Sign-up offers the eleven represented regions, selected explicitly by the
  player, without geolocation/network lookup. Optional API `startLevel` is a
  validated represented-world ID, stored once on registration. Old clients
  omitting it keep their existing behavior.
- `Save.data.route = {start, available:[id], cleared:[id]}` records individual
  world access/completion. Migrate old `unlocked` prefixes without losing access,
  scores, resume or wardrobe. Merge bounded valid ID sets monotonically online;
  starting-world changes are not permissions. Catalogue IDs stay unchanged.
- Completion chooses one random uncleared world, excluding the world just
  completed, opens it, and saves that exact destination for Continue/reload.
  Replays remain available, but cleared worlds are not automatic destinations.
  After all worlds are cleared, return to the map. Sandbox routing is run-local.
- A locally dressed guide presents an explicit start-of-level briefing:
  deployment key, ground shield/flight blast relay, two gems, three enemy tokens,
  then boss. Play/timer/physics wait for acknowledgment. The pause menu can
  reopen the briefing without resetting mission state.

### Always-open textured hair and collection-only hats

- Afro, braids, curls, coils and waves (including borough waves) are base
  hairstyles, available without location/progression requirements.
- New York cap, cork hat and cowboy hat require an actual collected ID, even
  on legacy completed saves. Preserve all indexes; only these three hats override
  former grandfathering. Hijab remains always available.
- City rewards may include `collectibleHats: [[key,name,origin,regionIndex]]`.
  The cowboy hat shares one stable ID across Redmond, Virginia and New York;
  collecting it in any of those worlds unlocks it everywhere.

### Collected regional wardrobe, boss tokens and Hacker sandbox

- Pipe exits use `mission.pipeReturn(entry,back)`: if unfinished required work
  lies on the skipped street, return to the entry instead of bypassing it.
  Update the respawn checkpoint only after the return warp completes.
  `mission.recoveryTime(x,timeLeft)` offers a bounded backtracking reserve for
  missed tokens behind the hero: 60s plus round-trip travel at 150px/s and
  vertical climb allowance. Grant each token's reserve at most once per run,
  only when it increases remaining time; preserve it through life loss.
  Pipe returns, nearby revisited checkpoints and blocked boss entry use this
  same allowance. No unlimited checkpoint clock resets or free token awards.
- Mission placement varies deterministically with each newly generated layout:
  cache/relay, gems, carrier selection, weapons and wardrobe caches use varied
  safe candidates/route targets without consuming terrain RNG. Rebuilding a
  mission on the same layout remains idempotent. Gameplay terrain, encounters
  and objects continue to regenerate on every new game/restart; safe spawn,
  boss arenas and authored regional landmarks are deliberate stable anchors.

- Unfinished token carriers removed by falling or flight-camera cleanup return
  to their original safe position with remaining health; cleanup never destroys
  a required token. Released drops remain at their fixed anchors through death.
- Optional city `world.opt.skyClimb` adds a six/seven-platform cloud ascent to
  existing street levels. `level.skyRoute = {x,steps,top}` describes its camera
  ceiling; platform `skySummit` identifies the safe summit. One of the three
  required carriers and an MFA token are placed there. Main-world cameras can
  scroll above y=0; indoor rooms and boss arenas retain their original bounds.
  Existing IDs, controls, saves and soundtrack contexts remain unchanged.

- Each run marks three reachable main-world enemies with optional
  `bossToken: {id,x,y}`. These visibly labelled carriers release guaranteed access
  tokens on defeat at a safe fixed anchor, not random drops over gaps. Three tokens
  join (not replace) the existing objectives/gem quota. Token state belongs to
  `AH.Mission`, survives life loss, resets on restart and never goes into saves.
  Flight scrolling/checkpoint recovery must account for uncollected tokens.
- `L.wardrobeSpots` holds optional safe `{x,y,zone?,bonus?}` placements in existing
  rooms/secrets; flight worlds without rooms use hidden side-route caches.
  `AH.WardrobePickups` composes separate pickups using city reward metadata.
  `AH.Art.hero.regionalItems(index)` returns `{id,category,value,name,region}`
  for outfits, hairstyles, local hats and artefacts; stable IDs are
  `category:value`. Arrays/indexes are append-only. Religious headwear, including
  hijab, and base appearance choices are always available.
- `Save.data.wardrobe = {items: [id], legacyUnlocked, legacyClassic}` records
  collected cosmetics and a fixed migration snapshot. Existing players keep
  their former clear-earned rewards and formerly free local hats/artefacts,
  except collection-only New York/cork/cowboy hats (see revision above);
  later clears do not grant new wardrobe items. New saves start with no regional
  collection. Online merges union bounded validated cosmetic IDs and migration
  snapshots monotonically; these fields never grant account authority.
  Wardrobe APIs accept full progress objects; numeric legacy arguments preserve
  the old read-only compatibility behavior. Save/load, preview, randomization and
  UI all use the same ownership checks.
- Checkpoint guides use the local reward outfit/headwear through the shared
  civilian drawing rig, with no cosmetic ownership requirement or gameplay effect.
- The existing Konami sandbox is now presented as Hacker Mode, using Cloud Hacker
  instead of the gold hero. Internal `AH.Gold`/`Run.gold` compatibility names,
  all-world access, 30 lives and no-persistence/no-score-submission rules remain.
  No new cheat, account privilege or invulnerability is introduced. Sandbox
  wardrobe pickups never persist or upload collection progress.
- Faster firing: uncharged blast cooldown is 0.10s (previously 0.16s);
  fully charged cooldown is 0.30s. Keep 1.2s charge/release, Boost costs,
  projectile velocities, keyboard/touch parity and no held-fire auto-repeat.

### Outdoor environment sections and continuous lighting

- Optional city `atmosphere_<region>` exposes `{layers,rain?,overcast?,wet?}`
  via `AH.Art.atmospheres`. Layers are local tiled texture descriptors
  `{key,width,height,y,depth,scroll,alpha,additive?,night?}`; rain/overcast use
  `{key,sections:[{start,end,fade}]}` normalized route ranges. Wet textures
  decorate eligible platform tops and background roads, never gaps or clouds.
  `AH.Environment` owns persistent layers, section fades and rain animation;
  hide them indoors/warps and freeze time on pause/help. Additive neon and
  painted reflections emulate light without new shaders, dependencies or
  changing the renderer. Keep landmarks, threats, hero and HUD readable.
  Tokyo stays flight with its existing regional soundtrack; Amsterdam retains
  its canals, highlights and weather-free stretches. No layout/RNG/save changes.

- Optional city art part `environments_<region>` returns ordered descriptors
  `{key,start,end,fade}`: a local 640x360 background texture and normalized
  main-world camera-progress bounds, with fade distance in the same units.
  `AH.Art.environments[region]` collects these through the existing catalogue.
  Sections replace the harbour/city background across the viewport, not by
  stretching small landmark textures. Their sky area is transparent.
  Optional `replaces: [sceneryKey]` permanently hides the corresponding small
  strip vignettes without changing their placement/RNG or other landmarks.
- `AH.Environment` in `systems/environment.js` owns outdoor background blending
  and a continuous 240-second day/night cycle starting at the run's chosen time.
  Pause/help and indoor/secret-room visits freeze the outdoor clock; indoor art
  and HUD are not darkened. Returning restores the same outdoor state.
  Scene wiring only composes existing art; all drawing remains city-owned.
  No physics, terrain, route, RNG, save, music or account changes.

### Painted 2.5D world rendering

- All city scenery, underground challenges and secret rooms use local painted
  depth: grounded contact edges, visible side/roof returns and receding terrain
  or interior planes. Existing silhouettes, architectural detail and sky windows
  take priority over decorative traffic. No global skew/extruded texture filter.
- Shared drawing-only helpers `C.depthFace(g,x,top,width,base,depth,side,roof)`
  and `C.depthGround(g,x,base,width,depth,front,top)` stay inside supplied bounds.
  Cities choose placement/materials; no city switch in shared engines. Drawing
  consumes no random numbers. Collision tops, controls, route widths, IDs, saves,
  room generation and music remain unchanged.

### Optional close-range foreground layer

- Optional city art `steam_<region>` returns `{puff,vent,warning?,heat?}` registered
  texture keys and optional heat flag, exposed in `AH.Art.steam`. Scenes place
  non-solid vents on eligible outdoor ground and the existing secret manhole.
  Eight reusable puffs per vent rise, expand and fade using outdoor play time.
  Puff textures preserve graduated transparency, not opaque crisped discs.
  Hide steam indoors, during warps and boss fights; pause freezes animation.
  Heat-enabled vents cycle 7s: 0-1s cool, 1-3s orange warning, 3-6s active hot
  plume, 6-7s cooldown. Active core (34px wide, 64px high) deals 8 damage through
  normal `player.hurt` invulnerability; shield does not block environmental heat.
  Keep spawn/checkpoints, mission items, pipe returns and entrances safe; the
  secret manhole plume is decorative. Existing descriptors without heat stay
  decorative. No solid collision, progress, music or control changes.

- City art `foreground_<region>` optionally returns `{roof,wall,light,accent,
  shape,detail}` for shared `C.registerForeground`, a deterministic 960x200
  near-building layer. City descriptors select local facade silhouettes and props;
  no city switches in shared drawing/runtime. Registered `bg_fore_<region>`
  works in street, flight and data-center worlds. `AH.Art.foregrounds` exposes
  the optional descriptors; these shared layers use depth -18.2, behind landmark
  facades (-18), with unchanged parallax, lighting and section/room suppression.
  New York's hand-drawn layer
  is retained. This is drawing only; no routes, physics or music changes.
- A city may directly register `bg_fore_<region>` (horizontally repeating, bottom-aligned,
  drawn without random numbers). Levels tile it at scroll factor 0.75, depth
  -17.4: in front of the scenery strip, behind every platform, hazard, pickup and
  character. It fades out under `environments_<region>` sections and takes the
  outdoor tint. Purely visual: no collision, route, RNG, save or music change.
  New York is the first adopter (rooftops, water towers, neon signs, palms).
- Optional city art part `groundFace_<region>` names a registered repeating
  texture for the visible face of ordinary regional ground platforms. Its top
  edge, collision geometry and other platform types still use existing assets.
  Cities without it retain their original ground face.
- Shared drawing-only `C.sprayTag(g,text,x,y,scale,paint,outline)` draws original
  painted lettering, deterministic overspray and drips without consuming RNG.
- City art part `graffiti_<region>` returns `{tags:[string,string,string],paint,
  accent,glyphs?}`. Shared `C.registerGraffiti` creates three 320x64 transparent
  painted decals containing AZUREKID, AZURE HEROES and an Octocat, plus local tags.
  Each key also has a 320x24 `_front` variant with side-by-side lettering above
  the bottom HUD. Faces at least 200px wide receive a complete decal, fitted to
  the face width without cropping any brand, local phrase or figure; smaller
  ledges, cloud silhouettes, pipes and bridges retain their original art.
  Variants use rounded bubble letters, cut stencil letters and angular wildstyle
  lettering. Main-world fronts cycle variants without RNG; the entry tag reads
  AZURE HEROES, followed by AZUREKID. These are decorative styles, not UI fonts.
  Copilot figures join Octocats on the stencil variant. Decal offsets, later-face
  selection and flight panel placement are hashed from generated geometry, giving
  each randomized layout different decoration without consuming gameplay RNG.
  `AH.Art.graffiti[region]` lists their texture keys. Solid fronts receive decals
  without changing collision; flight worlds use non-solid wall panels between
  columns. Decorative glyphs may be city-owned pixel arrays (Tokyo Japanese,
  explicitly approved); the UI font and supported gameplay strings are unchanged.

### City-owned secret rooms

- Optional city `.bonus` describes `{theme, floor, platform, width, title, y,
  shadow, sub, subShadow, ach, music, threats}`. Themes are explicit local data,
  not executable manifests. `threats` are room-relative enemy definitions.
- Generated `bonus` may additionally contain `enemies`, `presentation` (title,
  label colors/position and achievement), and `music` (existing audio context).
  Room enemies join `L.enemies`, gaining the existing city skin and respawn rules.
  Rooms without these fields retain existing behavior.
- New York's `sewer` uses a bottom-aligned `secret_eastus2` manhole, tiled
  `bonus_bg_sewer`, `sewer`/`sewer_top` floors and `sewer_plat` maintenance ledges.
  Rats reuse the spider enemy behavior/skin. Sewer music uses New York's original
  regional `pipe` arrangement in trance/house/pop; returning restores street music.

### Grounded checkpoints and friendly guides

- Ground checkpoint flags, terminals and pipe bodies use unpadded artwork so their visible
  bases meet the existing collision surface; do not move terrain or pipe triggers.
- Ground checkpoints include a non-solid friendly local guide, a readable
  CHECKPOINT / ACTIVE marker and a proximity lesson about Azure, Entra, Defender
  or Microsoft 365. Lessons are informational, require no new controls and never
  open links, change accounts or grant permissions.
- Checkpoints activate only in the main world; underground/bonus coordinates
  must not activate main-world checkpoints. Flight retains its airborne markers.

### Electronic soundtrack policy

- N and the MUSIC button cycle selections `trance`, `house`, `pop`,
  `night-drive`, `soft-skies`. The last two are original named House songs,
  not new genres or alternative instrumentation of a regional hook.
  `AH.Audio.selection` and `SELECTIONS` track the device-local choice;
  `setSelection`, `nextSelection` and `selectionLabel` expose selection.
  Existing `style`, `STYLES`, `setStyle` and `nextStyle` keep genre-only
  compatibility. Selecting a genre restores contextual regional arrangements.
  Named songs continue across world/room/boss contexts until changed; `music(null)`
  still stops. The existing music preference key stores an allowlisted selection,
  with legacy genre values and migration behavior preserved. No progress writes.

- House arrangements use 134 BPM main routes and 142 BPM bosses; title, pipe and
  bonus contexts use gentler 104/108/112 BPM lounge arrangements. Original city
  hooks and legacy compositions remain intact. Optional composition arrays
  `arpPat` and `drumPatterns` develop four-bar grooves; `production.lounge` marks
  quieter keys, seventh chords and sparse hats, without adding a selectable style.
  Music changes require actual renders and human listening approval.

- The only selectable styles are `trance`, `house` and `pop`, default `trance`.
  Legacy `dance` preferences migrate to `trance`; removed jazz/country/blues/rock
  preferences explicitly warn and reset to `trance`. No game-progress changes.
- City `.music.theme` replaces `.music.band` for reusable original electronic
  motifs/palettes. Regional main/pipe/boss arrangements retain local identity.
  Hooks must be original: recognizable within this game's soundtrack, never
  copied from commercial songs, recordings or artist melodies.

### Tactical missions and hidden gems

- Optional `level.mission = {objectives, gems, gemQuota}` is generated by shared
  `levels/missions.js` after terrain, without altering prior terrain/random draws.
  Objectives are `{id,kind:'cache'|'relay'|'scan',x,y,label,tip,required,zone?}`;
  gems are `{id,x,y,zone?}` with unique IDs. `zone` is the pipe-zone index when
  present. Two required objectives: recover a deployment cache, then stabilize
  a relay. Optional crouched scans award bonus score. Two of six hidden gems
  are required to unlock the boss; all gems award score once.
- Ground relay: hold E/MFA Shield nearby for 1.5 seconds after obtaining the cache.
  Flight relay: blast it after obtaining the cache. Cache/gems collect on contact;
  scan holds S/Down (duck) nearby for one second on ground, contact in flight.
  Existing keyboard/touch controls are reused. Markers and HUD explain order and
  missing requirements; gems glow and have readable approach clues.
- Mission state belongs to `AH.Mission` in `systems/mission.js`, not HUD or saves.
  It persists across life loss but resets on restart/new layout. Each objective
  and gem scores only once. No account/save schema changes; Gold Mode safeguards
  still apply. Levels omitting missions retain their old completion behavior.
- Boss entry and exit require mission readiness; blocked entry leaves ground
  backtracking open. Flight scrolling pauses before an uncompleted required
  pickup/relay (and before needed gems) so objectives cannot be permanently missed.
  Physics, timer, threats and manual movement continue while the camera waits.
- HUD snapshot adds optional `mission: {done,total,gems,quota,bonus,ready,next}`.
  HUD reads only; it shows the next task and counts without hiding existing bars.
  Mission textures `mission_cache`, `mission_relay`, `mission_scan`, `mission_gem`
  are shared code-drawn assets registered in `art/`.

Rev 1 (before first code): the base Level format above cannot express rings, hack terminals,
sec gates, cables, checkpoints or the boss arena. These OPTIONAL keys are added to the Level
format. Levels that do not need them omit them or leave them empty.

| Key | Shape | Used by |
|-----|-------|---------|
| mode | `'run'` or `'fly'` | all (run = gravity platformer, fly = auto-scroll) |
| theme | `'roof'`, `'rock'`, `'rack'` | tile set + background |
| time | seconds | all |
| height | px (360) | all |
| scroll | px/s (fly only) | Sky Canyon |
| spawn | `{x,y}` | all |
| checkpoints | `[{x,y}]` | all |
| rings | `[{x,y,r}]` | Sky Canyon |
| cables | `[{x,y,w}]` | Data Center |
| terminals | `[{id,x,y}]` | Data Center |
| gates | `[{id,x,y,w,h}]` (opened by terminal with same id) | Data Center |
| boss | `{trigger,left,right,floor}` | Data Center |
| ground | `'quay'`, `'embank'`, `'pier'` | street run levels (ground tile style) |
| water | `true` | street run levels: water below y=304, falling in costs a life |
| rail | style string | railing drawn on ground platforms |
| movers | `[{x0,x1,y,w,speed}]` | boats / ferries that carry the player |
| obstacles | `[{kind,x,y,w,h}]` | street obstacles (solid) |
| vehicles | `[{kind:'bike',x,y}]` | rideable Azure Bike |
| deco | `[{key,x,y}]` | non-solid street props |
| secret | `{x,y}` | phone box that warps to `bonus` |
| bonus | `{x,w,floor,clouds,coins,token,power,exit}` | bonus room past the level end |

Extra platform flags: `bridge:true`, `draw:true` (pull-up bridge that lifts on a cycle), `cloud`, `bliss`.
Extra enemy flag: `shoot:true` (walker fires bolts).

Shapes of the base keys:
- platform `{x,y,w,h}` (y = top edge). In fly mode platforms are rock hazards (damage on touch).
- laser `{x,y,w,h,on,off,phase}` (ms cycle).
- coin / mfaToken `{x,y}`.
- enemy `{type:'robot'|'drone'|'spider', x, y, range}` (ground units: y = feet, drone: y = centre).
- exit `{x,y,w,h}`.

Runtime state shape read by the HUD (`scene.snapshot()`):
`{levelId, levelName, health, score, mfa, credits, lives, time, boost, blastReady, hack, boss, mode}`.

Input contract: Arrows/WASD move, Space jump (press again in the air = double jump; airborne while
pushing into a wall = wall slide, Space then wall-jumps away and restores the double jump),
F Azure Blast (low while ducking; blasts also destroy enemy and boss bullets), Shift Flight Boost,
E = MFA Shield (ground and air), S / Down = duck (standing still = crouch guard with the shield,
moving starts a slide attack), P / Esc pause, H help overlay, Q quit to title,
R resumes when paused and restarts otherwise, M mute, N cycle music selection.
In flight, Left/A and Right/D turn the hero and aim blasts in that direction;
releasing horizontal input preserves facing, including vertical-only movement.
E / touch SHIELD also works in flight, blocks only front-facing hits, cancels
charged fire and prevents boosting while held; free directional flight remains.
Ground combat adds J / touch PUNCH and K / touch KICK, alongside existing blasts.
`AH.Input.read()` adds `punch` and `kick` press flags. `player.melee(kind)`
starts a short attack (punch 0.18s, kick 0.26s) with a shared 0.4s / 0.6s
cooldown, one hit per target, no Boost cost, and cancels held blasts.
`scene.hitMelee(player,kind,hits)` resolves directional, wall-blocked reach
(punch 38px, kick 52px) against enemies and bosses. Damage is one enemy hit,
10 boss HP for punch and 14 for kick. Sliding can hit an open ground boss
once per slide for 12 HP. Boss armor/open-window rules remain unchanged.
Flight has ranged combat and shield, not ground melee. New hero `punch` and
`kick` frames preserve the shared rig, all wardrobes and collision dimensions.
`AH.Input.read()` returns `help`, `quit`, `esc` and `nav` (-1/0/1 page turns) besides the movement flags.
Touch run controls include DUCK, SHIELD, PAUSE and HELP. On the title screen E opens the Hero Lab and H opens help.

## Addendum: rendering, hero art, suits, threat identity

- The canvas is `640 * AH.VIEW_SCALE` by `360 * AH.VIEW_SCALE`; a camera patch in `systems/scenes.js` zooms every camera so all game logic,
  layouts and coordinates stay in the 640x360 space. Never hard-code the physical canvas size.
- `AH.Art.buildHeroHD(scene, look, frame)` returns a high-detail hero texture key; it is not auto-scaled, so callers use `setScale(size / AH.Art.HD)`.
- `HERO_SUIT` entries have `name` and `unlock` (owning world index, -1 = always open).
  `AH.Art.hero.suitOpen(i, progress)` uses collected ownership or a fixed legacy
  snapshot; numeric legacy arguments retain `unlocked >= unlock + 2` compatibility.
  `lookOf` falls back to the default suit for a locked suit; Hero Lab refuses to save one.
- Every enemy type in `AH.Enemy.SPEC` needs `label` (pixel-font charset), `cat` (`malware`, `network`, `identity`, `devops`, see `AH.Enemy.CATS`) and a short `info` tip.
  The nameplate and the Hero Handbook (`AH.UI.help(scene, onClose)`) read these fields.
- Remove enemies with `enemy.remove()` (or `die()`), never by destroying the sprite only, so the nameplate is cleaned up.

## Level generation addendum
- `AH.Levels.make(id)` returns a freshly randomised level in the Level format, with extra fields `region`, `regionName`, `city`, `landmarks`, `hint`, `tint`, `mode`.

## Addendum: optional level fields

- `powerups: [{ kind, x, y }]` with kind in `copilot`, `defender`, `actions`, `powerbi`, `teams`. Icons are shared `pu_<kind>` textures in `art/`.
- `props: [{ kind, x, y, float }]` decorative scenery (`prop_<kind>` textures).
- `boss: { kind, name, proj, air, trigger, left, right, floor }` the regional boss arena. Use the region-world-generator skill.
- Player API additions: `player.speedMul`, `player.defender` (seconds of invincibility), `AH.Save.data.hero` (`'m'` or `'f'`, textures `hero_*` or `hero_f_*`).

## Addendum: regions, pipes, threats and online play

- Enemy types (behaviour in `systems/enemies.js` SPEC): `robot`, `drone`, `spider`, plus the region-neutral cyber threats `phish` (hopper), `ram` (Ransomware: walk, wind up, dash) and `botnet` (DDoS cloud, no gravity, drops `ebomb` bombs). All still take 2 hits and drop 1 Azure Credit.
- The shared ground `hacker` enemy uses `hacker_0`, `hacker_1` and `hacker_walk`, with the
  existing patrol/shoot behavior. It appears in generated street and data-center levels,
  takes two hits, drops one Azure Credit and teaches Entra MFA; flight-only worlds are unchanged.
- `pipes: [{ x, y, zone }]` entry pipes. `pipeZones: [{ x, w, platforms, coins, enemies, lasers, token, entry, exit, back: {x,y} }]` underground bonus zones past the level end. Down (or standing still) on an entry pipe warps to the zone, and its exit pipe returns to `back`.
- `secret` is `{ x, y, name }` and `bonus.theme` is `'cloud'`, `'retro'` or `'xbox'`. The world row's `opt.secret` is `true` or a theme name.
- World rows may set `ambient: { sky, birds, road, balls, fx }` (moving background objects). The time of day is chosen at random per run (`sunrise`, `morning`, `day`, `afternoon`, `sunset`, `night`).
- Landmarks may come from anywhere in the country, not only the region's city.

### Save, resume and online contract
- Konami Hacker Mode (formerly Gold Mode) opens every world on the map for the browser session only.
  Map availability uses `AH.Gold.armed` without changing saved `unlocked`, cleared
  states or wardrobe rewards. Deployments remain sandbox runs with no saved or
  submitted progress; reloading restores normal world locks.
- `AH.Save.data = { best, unlocked, bests: {id: score}, muted, hero, look: {body, skin, hair, hairCol, suit, hat, gear}, resume: {id, score, lives} | null, updated, wardrobe, route }`. `unlocked` is a frozen legacy prefix snapshot; individual world access/clears now come from `route`, never inferred from the highest ID or best score.
- Resume rules: level start saves `{id, startScore, startLives}`. Game over saves `{id, 0, 3}`. Level complete saves the next level with the current score and lives, or `null` after the last level. Call `AH.Save.setResume(id, score, lives)`. Never write `resume` directly.
- `AH.Save.save()` may persist general preferences locally during Gold Mode, but
  must not push progress online while `AH.Gold.run()` is true. Gold run scores,
  unlocks and resume data must never be written.
- `AH.Online` (`systems/online.js`) is only active when `/api/health` answers. Otherwise the game is in guest mode and nothing breaks. `save()` pushes progress when logged in. `submitScore(score, level, city)` returns `{best, rank}` or `null`.
- Server API (`server.js`, see README): `health`, `leaderboard`, `register`, `login`, `me`, `logout`, `progress` (merge: unlocks never go backwards; newer `updated` wins for resume), `score`. Names: 3-15 chars `A-Z 0-9`. Locations are limited to the pixel font charset (max 20 chars).
- Every on-screen string must use the pixel font charset: A-Z, 0-9, space and `- . ! ' : / + , ?`.

### Cloud challenge and low combat revision
- Additional two-hit enemy types: `bug` (pipeline hopper), `image` (vulnerable container charger),
  `rbac` (overprivileged role shooter), `endpoint` (stationary exposed-endpoint turret),
  `guest` (unreviewed or stale account shooter; see the charged weapons revision).
  Shared textures/animations use the type as prefix.
- Player additions: `ducking`, `sliding` booleans. Ducking shrinks the collision body while
  preserving feet position; standing is blocked under solid ceilings. Slides hit each low
  enemy once per slide; F fires at feet height while ducking.
- Pipe zones additionally expose `theme` (`pipelines`, `aks`, `actions`, `docker`), `name`,
  `hint`, `stages: [{x, name, tip}]`, `powerups: [{kind,x,y}]` and `timeBonus` seconds.
  Their disjoint bounds accommodate rooms up to 3840px. Each zone grants its time bonus once.
- Optional platform `cloudKind` selects a cloud challenge material; `lowTunnel` marks a
  duck-height overhead beam. Street obstacle `herring` is an Amsterdam haring stand.
- Cloud-room art: `AH.Art.buildCloudPlatform(scene, platform)` returns a cached,
  exact-size cargo/catwalk texture without changing collision geometry. Dock floors
  use `cloud_floor_<theme>`. `challenge_far_<theme>` is a room-only parallax layer;
  `challenge_bg_<theme>` and suffixes `_1`, `_2` are transparent scenery variations.
  `challenge_sign_<theme>` backs compact stage labels. All drawing remains in art.

### Charged weapons, boss signals and varied rooms
- Optional powerup kinds `spread` and `pierce` equip a temporary weapon for 25 seconds;
  replacement refreshes the timer, expiry and respawn restore Azure Blast. No save changes.
- Optional `weaponDrops: [{kind:'spread'|'pierce',x,y}]` distributes four additional
  safe main-route weapons through each level, separate from legacy powerups.
- Optional enemy `appearance:'detective'` renders a trench-coated, fedora-wearing
  rogue investigator using the hacker's existing two-hit patrol/shooter behavior;
  its nameplate identifies it as a SNOOPING DETECTIVE, not a friendly guide.
  Guest/stale-user enemies use hacker-sized 32x37 art and 20x34 collision bodies,
  existing robot patrol/shoot behavior and two-hit/one-credit rules. Optional
  `appearance:'stale-user'` selects a rifle and STALE USER label; other guests
  carry a compact pistol. Both fire existing shield-blockable energy bolts.
  They are now tall targets, not low slide targets; low worms/bugs remain.
- Input adds `fireHeld` alongside `fire` (press). Tap fires on release; hold up to 1.2s
  for a charged shot, then release. Cancel charge on hurt, shield, pause/help and warp.
  Keyboard F and the touch BLAST button share these rules.
- `player.azureBlast(charge = 0)` accepts 0..1. `spawnBlast(x,y,dir,options)` accepts
  optional `weapon` (`azure`, `spread`, `pierce`) and `charge`. Default shots preserve
  existing callers. Projectile damage and pierced-target tracking belong to scene state.
- HUD snapshot adds `weapon`, `weaponTime`, `charge`; boss snapshots add `state`,
  `vulnerable`, `window` and `cue`. Boss damage is allowed only while vulnerable;
  green OPEN text/countdown and an overhead marker must agree with the hit check.
- Boss snapshots also expose `round` (1-3, same as `phase`); the HUD shows `ROUND n`.
  Regional fighter bosses use textures `boss_<kind>_0`, `_1`, `_walk`, `_attack`, `_kick`,
  `_jump`, `_upper`, `_stun` (64x80, art faces left, feet at the bottom); missing frames
  fall back to idle/attack, so the guardian keeps `boss_0/_attack/_stun`. Boss states:
  `intro`, `idle`, `windup`, `charge`, `lunge`, `strike`, `leap`, `upper`, `recover`,
  `stunned`, `dying`; `vulnerable` stays `stunned || recover`.
- Pipe themes also include `entra` (identity/access vault) and `functions` (event reactor).
  Every theme needs floor, sign, far scenery and three background textures. Optional
  stage `layout` names identify shuffled room templates; geometry, enemy placement,
  rewards and hazards vary per template, not just colours or labels.

### Regional wardrobe rewards
- Classic outfits are appended to `HERO_SUIT` with `unlock: -1` (Cowboy, India Kurta)
  so saved suit indexes stay valid. The hijab is headwear (`hat: 'hijab'`), not a
  hairstyle; `lookOf` migrates old `hair: 'hijab'` saves. The Gold Mode suit
  (`suit: 'gold'`) is runtime-only and never opens through saves or Hero Lab.
- The always-open `CLOUD HACKER` outfit is an appended playable hero style with the
  normal abilities. Its built-in hood is shown when headwear is `none`; explicitly
  selected headwear replaces the hood without changing the saved look or hair. Its
  dark, red-accented zip hoodie, enclosed face, red visor and portable terminal match
  the Rogue Hacker enemy. The built-in hood conceals the hair; other headwear still
  follows its own hair-coverage rules. No pose, including flight, draws a cape or
  changes the hero's abilities.
- Regional rewards now require individual matching-world pickups (see collected
  wardrobe revision). Legacy clear thresholds apply only to migration snapshots.
  Base styles and religious headwear stay open; old entitlements are preserved.
- `AH.Art.hero` exposes `hairNames`, `hairUnlock`, `gearUnlock`, `wardrobeOpen(category, value, progress)`,
  `wardrobeFor(regionIndex)` (`{suit, hair, gear}`), `wardrobeRegions(category,value)`
  (all matching region indexes) and `lookOpen(look, progress)`.
  Categories are `suit`, `hair`, `hat`, `gear`; unknown selections are never open.
- `lookOf(data)` replaces locked/unknown suit, hair and gear with the saved body's
  classic defaults, without mutating saved data. Hero Lab can preview locked rewards,
  but refuses to save any locked selection; randomization only chooses open entries.
- Regional outfits change garment structure, not only colours. Japan's reward is a
  kimono with an obi sash; all outfits, hair and extras retain every hero frame,
  32x48 collision-independent canvas and HD rendering. Rewards are respectful wearable
  adaptations, not claims to represent every person in a region.
- Hero Lab explains the selected reward's matching-world stash requirement.
  Collection announces each item; world completion does not grant clothing.
  Labels use the existing pixel-font charset.

### Regional rooms, street stands and music
- New York is appended as world 11 (`eastus2`, a hosting-region mapping, not a New York
  datacenter). Its map pin uses New York's city coordinates, offset from Virginia.
  Its optional street stand `hotdog` is 64x52 in both obstacle-size registries; local
  props are `hydrant` and `newsbox`. The `broker` boxer uses the existing fighter API.
  Regional wardrobe rewards use index 10 and append entries without shifting saved indexes.
- London uses regional room `tube` (UK South only); Paris keeps `metro`. Both
  have optional zone `music: 'metro'`; rooms omitting it use `pipe` music.
- Optional `ambient.rail: [kind]` uses `amb_train_<kind>` and `amb_rail` behind
  gameplay. `railY` (default 218) and `roadY` (default 256) are background baselines;
  `roadRate` is the minimum traffic spawn interval in seconds (default 2.2).
  Explicit road/rail scenery works in run and fly worlds without changing physics.
  Vehicles and boats are seeded on entry as well as spawned during play.
  Decorative roads, rail decks and land traffic render behind the landmark strip
  (depth below -18), never across its facades or signs. Keep infrastructure slim
  and transit spaced out; playable vehicles and collision geometry are unaffected.
- `AH.Art.sceneryRoutes[region]` is an ordered array of `[fraction, textureKey, baseY?]`
  scenic highlights (fractions 0..0.85 of the parallax strip). Scenes reserve
  those keys from random selection and place each highlight once at its stop,
  retaining the no-same-landmark-on-screen rule. This is decorative, not solid
  geometry. Keep enough room between stops for the actual texture widths.
  Optional `baseY` raises low coastal/landscape art above the foreground and aligns
  station platforms with background rails; omitted values use the world's base.
- Levels use the painted `bg_far_<region>` panorama (shared with the map thumbnail).
  `AH.Art.panoramaLandmarks[region]` lists strip keys already painted in it; scenes never
  place those in the strip. Local strip architecture stays full size and near-continuous;
  occasional sky windows preserve the panorama. Reduce traffic, not architectural detail.
- Australia's solid `outback4x4` is 88x44 in both `OB_SIZE` and `obSize`.
- World option `pipeTheme` names a regional `CHALLENGES` entry (Paris: `metro`). It always
  sits behind the first pipe; the second pipe takes a distinct shared theme. Regional
  themes never enter the shared pool. Pipe platforms carry `theme`.
- World option `stand` names the local street obstacle guaranteed once per level
  (`herring` in Amsterdam, `bakery` in Paris); its size lives in `OB_SIZE`/`obSize`.
- Optional room art: `pipe_<theme>` replaces the pipe body, `pipe_<theme>_top` overlays the
  entrance, and `challenge_train_<theme>` adds passing background trains. Scenes check
  `textures.exists` so themes without them keep the default pipe.
- `ambient.water: ['region']` sails `boat_<region>` along the river. `AH.Art.sceneryStars[region]`
  lists signature landmarks that open the strip and appear about twice as often.
- `AH.Audio.music(kind, region)`: kinds `title`, `main`, `pipe`, `metro`, `bonus`, `boss`;
  `null` stops. Selected electronic genres retain regional motifs for main,
  pipe/metro and boss contexts; missing regions use shared context arrangements.
  Repeating the same resolved song never restarts it.
  Levels call `levelMusic()` on start and when leaving rooms, bonus areas and boss resets.
  Songs are code-only data (`AH.Audio.SONGS`), never fetched or loaded from files.
- Music style is a device-local preference, independent of saved game progress:
  `AH.Audio.style` is `trance` (default), `house` or `pop`.
  `loadStyle()` reads an allowlisted value from `azureheroes2027_music`; invalid or
  unavailable storage falls back to trance with a warning. `setStyle(style)` rejects
  invalid values, persists locally where possible and switches the current music
  context without changing mute, scores, progress or online accounts.
  `nextStyle()` cycles the genre-only list; N/MUSIC use `nextSelection()` as
  described in the electronic soundtrack revision. The controls work
  on the title, map, Hero Lab, leaderboard and during play or pause.
- All three styles have original scene and regional arrangements.
  All sounds are synthesised locally. Kick-ducking applies to house/trance only.
  Preserve track routing, mute, sound effects, scheduling and node cleanup.
