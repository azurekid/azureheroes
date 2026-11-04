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
- All sprites must be drawn in art/sprites.js, no inline sprite code elsewhere.
- Community workflow: [game-orchestrator](../game-orchestrator/SKILL.md).
  Every change also follows [game-security](../game-security/SKILL.md).
- Extend this contract before consumers. Prefer optional fields with explicit defaults;
  preserve old levels, guest play, saved progress and stable level IDs. Update all affected
  skills, implementations, tests and player-facing controls together.

## Contract revisions

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
moving starts a slide attack), P / Esc pause, H help overlay, Q quit to title, R restart, M mute.
`AH.Input.read()` returns `help`, `quit`, `esc` and `nav` (-1/0/1 page turns) besides the movement flags.
Touch run controls include DUCK, SHIELD, PAUSE and HELP. On the title screen E opens the Hero Lab and H opens help.

## Addendum: rendering, hero art, suits, threat identity

- The canvas is `640 * AH.VIEW_SCALE` by `360 * AH.VIEW_SCALE`; a camera patch in `systems/scenes.js` zooms every camera so all game logic,
  layouts and coordinates stay in the 640x360 space. Never hard-code the physical canvas size.
- `AH.Art.buildHeroHD(scene, look, frame)` returns a high-detail hero texture key; it is not auto-scaled, so callers use `setScale(size / AH.Art.HD)`.
- `HERO_SUIT` entries have `name` and `unlock` (level index, -1 = always open). `AH.Art.hero.suitOpen(i, unlocked)` is true when
  `unlocked >= unlock + 2`. `lookOf` falls back to the default suit for a locked suit; the Hero Lab must refuse to save one.
- Every enemy type in `AH.Enemy.SPEC` needs `label` (pixel-font charset), `cat` (`malware`, `network`, `identity`, `devops`, see `AH.Enemy.CATS`) and a short `info` tip.
  The nameplate and the Hero Handbook (`AH.UI.help(scene, onClose)`) read these fields.
- Remove enemies with `enemy.remove()` (or `die()`), never by destroying the sprite only, so the nameplate is cleaned up.

## Level generation addendum
- `AH.Levels.make(id)` returns a freshly randomised level in the Level format, with extra fields `region`, `regionName`, `city`, `landmarks`, `hint`, `tint`, `mode`.

## Addendum: optional level fields

- `powerups: [{ kind, x, y }]` with kind in `copilot`, `defender`, `actions`, `powerbi`, `teams`. Icons are `pu_<kind>` in art/sprites.js.
- `props: [{ kind, x, y, float }]` decorative scenery (`prop_<kind>` textures).
- `boss: { kind, name, proj, air, trigger, left, right, floor }` the regional boss arena. Use the region-world-generator skill.
- Player API additions: `player.speedMul`, `player.defender` (seconds of invincibility), `AH.Save.data.hero` (`'m'` or `'f'`, textures `hero_*` or `hero_f_*`).

## Addendum: regions, pipes, threats and online play

- Enemy types (behaviour in `systems/enemies.js` SPEC): `robot`, `drone`, `spider`, plus the region-neutral cyber threats `phish` (hopper), `ram` (Ransomware: walk, wind up, dash) and `botnet` (DDoS cloud, no gravity, drops `ebomb` bombs). All still take 2 hits and drop 1 Azure Credit.
- `pipes: [{ x, y, zone }]` entry pipes. `pipeZones: [{ x, w, platforms, coins, enemies, lasers, token, entry, exit, back: {x,y} }]` underground bonus zones past the level end. Down (or standing still) on an entry pipe warps to the zone, and its exit pipe returns to `back`.
- `secret` is `{ x, y, name }` and `bonus.theme` is `'cloud'`, `'retro'` or `'xbox'`. The world row's `opt.secret` is `true` or a theme name.
- World rows may set `ambient: { sky, birds, road, balls, fx }` (moving background objects). The time of day is chosen at random per run (`sunrise`, `morning`, `day`, `afternoon`, `sunset`, `night`).
- Landmarks may come from anywhere in the country, not only the region's city.

### Save, resume and online contract
- `AH.Save.data = { best, unlocked, bests: {id: score}, muted, hero, look: {body, skin, hair, hairCol, suit, hat, gear}, resume: {id, score, lives} | null, updated }`. `unlocked` is `n + 1` when all n levels are cleared.
- Resume rules: level start saves `{id, startScore, startLives}`. Game over saves `{id, 0, 3}`. Level complete saves the next level with the current score and lives, or `null` after the last level. Call `AH.Save.setResume(id, score, lives)`. Never write `resume` directly.
- `AH.Online` (`systems/online.js`) is only active when `/api/health` answers. Otherwise the game is in guest mode and nothing breaks. `save()` pushes progress when logged in. `submitScore(score, level, city)` returns `{best, rank}` or `null`.
- Server API (`server.js`, see README): `health`, `leaderboard`, `register`, `login`, `me`, `logout`, `progress` (merge: unlocks never go backwards; newer `updated` wins for resume), `score`. Names: 3-15 chars `A-Z 0-9`. Locations are limited to the pixel font charset (max 20 chars).
- Every on-screen string must use the pixel font charset: A-Z, 0-9, space and `- . ! ' : / + , ?`.

### Cloud challenge and low combat revision
- Additional two-hit enemy types: `bug` (pipeline hopper), `image` (vulnerable container charger),
  `rbac` (overprivileged role shooter), `endpoint` (stationary exposed-endpoint turret),
  `guest` (stale guest-account crawler). Shared textures/animations use the type as prefix.
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
- Input adds `fireHeld` alongside `fire` (press). Tap fires on release; hold up to 1.2s
  for a charged shot, then release. Cancel charge on hurt, shield, pause/help and warp.
  Keyboard F and the touch BLAST button share these rules.
- `player.azureBlast(charge = 0)` accepts 0..1. `spawnBlast(x,y,dir,options)` accepts
  optional `weapon` (`azure`, `spread`, `pierce`) and `charge`. Default shots preserve
  existing callers. Projectile damage and pierced-target tracking belong to scene state.
- HUD snapshot adds `weapon`, `weaponTime`, `charge`; boss snapshots add `state`,
  `vulnerable`, `window` and `cue`. Boss damage is allowed only while vulnerable;
  green OPEN text/countdown and an overhead marker must agree with the hit check.
- Pipe themes also include `entra` (identity/access vault) and `functions` (event reactor).
  Every theme needs floor, sign, far scenery and three background textures. Optional
  stage `layout` names identify shuffled room templates; geometry, enemy placement,
  rewards and hazards vary per template, not just colours or labels.

### Regional wardrobe rewards
- Classic outfits are appended to `HERO_SUIT` with `unlock: -1` (Cowboy, India Kurta)
  so saved suit indexes stay valid. The hijab is headwear (`hat: 'hijab'`), not a
  hairstyle; `lookOf` migrates old `hair: 'hijab'` saves. The Gold Mode suit
  (`suit: 'gold'`) is runtime-only and never opens through saves or Hero Lab.
- Clearing each region grants one outfit, hairstyle and accessory at
  `Save.unlocked >= regionIndex + 2`. Existing classic styles, hats and extras stay open.
- `AH.Art.hero` exposes `hairNames`, `hairUnlock`, `gearUnlock`, `wardrobeOpen(category, value, unlocked)`,
  `wardrobeFor(regionIndex)` (`{suit, hair, gear}`) and `lookOpen(look, unlocked)`.
  Categories are `suit`, `hair`, `hat`, `gear`; unknown selections are never open.
- `lookOf(data)` replaces locked/unknown suit, hair and gear with the saved body's
  classic defaults, without mutating saved data. Hero Lab can preview locked rewards,
  but refuses to save any locked selection; randomization only chooses open entries.
- Regional outfits change garment structure, not only colours. Japan's reward is a
  kimono with an obi sash; all outfits, hair and extras retain every hero frame,
  32x48 collision-independent canvas and HD rendering. Rewards are respectful wearable
  adaptations, not claims to represent every person in a region.
- Hero Lab explains the selected reward's required region clear; completion announces
  all three reward names. Labels use the existing pixel-font charset.

### Regional rooms, street stands and music
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
  `null` stops. Only `main` uses the region (`AH.Audio.REGION_SONG`); unknown kinds or
  regions fall back to `main`. Repeating the same resolved song never restarts it.
  Levels call `levelMusic()` on start and when leaving rooms, bonus areas and boss resets.
  Songs are code-only data (`AH.Audio.SONGS`), never fetched or loaded from files.
