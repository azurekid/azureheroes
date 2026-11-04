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
