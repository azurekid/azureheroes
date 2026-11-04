---
name: region-world-generator
description: Add or change an Azure region world (landmarks, local enemies, local boss, random level generation) for Azure Heroes 2027. Use when adding a new region level or reworking an existing one.
---

Design goal: every world must feel like its own place at a glance, the way each Subway Surfers city does. Change the setting, not just the colours.

## Region identity checklist (all required for a new world)
1. **Azure region**: real region id, e.g. `westeurope`, plus a city. One row in the `WORLDS` table in `levels/worlds.js` (`id, region, regionName, city, name, mode, theme, tint, landmarks, hint, opt, boss`).
2. **Landmarks**: 3-4 recognisable skyline pieces in the far layer, plus a tinted sky and near layer (`SKIES`, `PAL`, `farLayer`, `bg_near_<region>` in `art/sprites.js`).
2b. **Scenery strip**: 6+ local landmark pieces `sc_<prefix>_<name>` plus Microsoft billboards, listed in `sceneryKeys`. Far layers used in levels (`bg_farp_<region>`) must contain NO landmarks; landmarks only live in the strip, which never shows the same key twice on screen. Give run levels a matching `ground`/`water` style (quays, promenades, piers) instead of plain rooftops.
3. **Local enemies**: a skin for each enemy type the level uses (`robot` = walker, `drone` = flyer, `spider` = crawler). Textures `en_<region>_<type>_0/1`. Behaviour and stats never change, only the look. Every enemy still takes 2 hits and drops 1 Azure Credit.
4. **Local pickups**: regional currency glyph on the Azure Credit (`coin_<region>0..3`).
5. **Local props**: 2 decorative objects per world (`prop_<name>`), placed at random along the level, never solid.
6. **Local boss**: a character from the country (e.g. sumo, boxing kangaroo) with textures `boss_<kind>_0/_attack/_stun`, a thrown projectile `bolt_<kind>`, and a `boss` entry `{ kind, name, proj, air }` in the world row. Flight worlds use `air: true`.
7. **Hint text**: intro line `AZURE REGION: <name>` and a one-line `hint` with local flavour.

## Generation rules
- Layouts come from `AH.Levels.make(id)`; nothing in a level is hand-placed. Every call must give a new layout.
- Use `makeRun` (rooftops), `makeFly` (flight) or `makeDataCenter`. Tune with `opt` only.
- Run: gaps 100-195px, gaps over 130px need a double jump, rise <= 20 when the gap is over 140px.
- Fly: gap height >= 132px, successive gap centres differ by <= 120px.
- Length 8,000-13,000px so levels stay challenging. The timer scales with width.
- Spawn hazards, enemies, coins, MFA tokens and props from the shuffled free list so they never overlap checkpoints or the boss arena.
- Always end with a boss arena. Run arena: flat 760px platform. Fly arena: the last 640px, where scrolling stops.
- Output must still follow the game-contract Level format.

## Rules
- All sprites live in `art/sprites.js` only (see sprite-artist).
- Boss and enemy logic stays in `systems/` (see gameplay-systems); only data goes in `levels/worlds.js`.
- Verify with a headless bot on the new level several times: it must be completable, show no console errors, and the boss must be beatable.
- Return: world id, region, length range, enemy skins, boss name, and how you tested it.

## World map and save data
- Add the region id with `[lon, lat, dx, dy]` (dx/dy nudge the pin in crowded areas) to `GEO` in `systems/scenes.js`, so its pin appears on the world map.
- Appending a world keeps existing players' `unlocked` counts valid. Inserting one in the middle shifts level ids.
- Landmarks can come from the whole country (e.g. Colosseum and Pisa for Italy), not only the region's city.
- Optional: `ambient` moving objects, `opt.secret` theme, and `opt.pipes` warp pipes (see game-contract).
