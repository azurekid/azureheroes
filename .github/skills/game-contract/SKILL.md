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

Input contract: Arrows/WASD move, Space jump (press again in the air = double jump),
F Azure Blast, Shift Flight Boost, E / S / Down = MFA Shield, P pause, R restart, M mute.

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
- `AH.Save.data = { best, unlocked, bests: {id: score}, muted, hero, look, resume: {id, score, lives} | null, updated }`. `unlocked` is `n + 1` when all n levels are cleared.
- Resume rules: level start saves `{id, startScore, startLives}`. Game over saves `{id, 0, 3}`. Level complete saves the next level with the current score and lives, or `null` after the last level. Call `AH.Save.setResume(id, score, lives)`. Never write `resume` directly.
- `AH.Online` (`systems/online.js`) is only active when `/api/health` answers. Otherwise the game is in guest mode and nothing breaks. `save()` pushes progress when logged in. `submitScore(score, level, city)` returns `{best, rank}` or `null`.
- Server API (`server.js`, see README): `health`, `leaderboard`, `register`, `login`, `me`, `logout`, `progress` (merge: unlocks never go backwards; newer `updated` wins for resume), `score`. Names: 3-15 chars `A-Z 0-9`. Locations are limited to the pixel font charset (max 20 chars).
- Every on-screen string must use the pixel font charset: A-Z, 0-9, space and `- . ! ' : / + , ?`.
