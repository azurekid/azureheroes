---
name: region-world-generator
description: Add or change an Azure region world, landmarks, transit, scenic routes, local enemies, bosses or random level generation for Azure Heroes 2027. Use when adding a region or changing regional transport and scenery.
---

Design goal: every world must feel like its own place at a glance, the way each Subway Surfers city does. Change the setting, not just the colours.

## Region identity checklist (all required for a new world)
1. **Azure region**: real region id, e.g. `westeurope`, plus a city. One row in the `WORLDS` table in `levels/worlds.js` (`id, region, regionName, city, name, mode, theme, tint, landmarks, hint, opt, boss`).
2. **Landmarks**: recognisable pieces in the scenery strip, plus a tinted sky, a painted far panorama (`bg_far_<region>`, also the map thumbnail) and a near layers (`SKIES`, `PAL`, `bg_farp_<region>`, `bg_near_<region>` in `art/sprites.js`).
2b. **Scenery strip**: 6+ local landmark pieces `sc_<prefix>_<name>` plus Microsoft billboards, listed in `sceneryKeys`. Levels use the painted panorama `bg_far_<region>` (the map thumbnail) as the far layer, so the signature skyline is always visible. List every strip key that duplicates a painted landmark in `AH.Art.panoramaLandmarks[region]`; the strip skips those. Local architecture (canal houses, zinc roofs) stays full size and near-continuous; every 3-4 pieces a 110-190px sky window shows the sun and panorama. Never thin or shrink the strip to calm a level; reduce moving traffic instead. The strip never shows the same key twice on screen. Give run levels a matching `ground`/`water` style (quays, promenades, piers) instead of plain rooftops.
3. **Local enemies**: a skin for each enemy type the level uses (`robot` = walker, `drone` = flyer, `spider` = crawler). Textures `en_<region>_<type>_0/1`. Behaviour and stats never change, only the look. Every enemy still takes 2 hits and drops 1 Azure Credit.
4. **Local pickups**: regional currency glyph on the Azure Credit (`coin_<region>0..3`).
5. **Local props**: 2 decorative objects per world (`prop_<name>`), placed at random along the level, never solid.
6. **Local boss**: an adult street-fighter villain with a local fighting style and a cyber-threat role (e.g. Muay Thai access broker, savate spoofer, luchador zero-day), drawn with the shared `fighterReg(kind, {...})` rig in art/sprites.js (all eight fighter frames, see game-contract), a thrown projectile `bolt_<kind>`, and a `boss` entry `{ kind, name, proj, air }` in the world row. Flight worlds use `air: true`. No mascots, animals or cartoon objects as bosses; keep them respectful, not national caricatures.
7. **Hint text**: intro line `AZURE REGION: <name>` and a one-line `hint` with local flavour.

## Generation rules
- Layouts come from `AH.Levels.make(id)`; nothing in a level is hand-placed. Every call must give a new layout.
- Read [game-contract](../game-contract/SKILL.md), [game-security](../game-security/SKILL.md) and [level-builder](../level-builder/SKILL.md). Coordinate cross-file work via [game-orchestrator](../game-orchestrator/SKILL.md).
- Reuse `makeRun` (streets), `makeFly` (flight) or `makeDataCenter`; prefer tuning `opt`. Extend shared generators only when the requested mechanic cannot be expressed by existing options.
- Unspanned run gaps: 100-195px, gaps over 130px need a double jump, rise <= 20 when the gap is over 140px, unless the gap
  holds two `ledge` stairs (each hop <= 60px). Wider boat/bridge gaps need a reachable carrier/deck.
- Verticality: `makeRun` mixes `wall` segments (zero gap, 150-186px rise, platform flagged `climb` + `wallFrom`, drawn with
  `climb_face`/`climb_sign`, needs a wall jump) and `stairs` segments (ledges up to a high roof). Tune with `opt.wallRate` /
  `opt.stairRate` (defaults 0.16 / 0.1). Rooftops stay at y >= 106 (below the HUD), items at y >= 60, and the last rooftops return to y >= 200.
- Street baseline: the walkway starts at `STREET_Y` (300) without a forced opening step, ordinary steps/gaps stay at
  y >= 220, and the segment after a climb drops back toward the street. Keep about half of the walkway at y >= 270 so
  ground blocks do not hide the landmark strip.
- Scenic routes (`AH.Art.sceneryRoutes`) must keep a region's signature landmarks, not just transit pieces. Amsterdam
  opens with the detailed `sc_we_centraal` and includes `sc_we_schiphol` with its planes; one design per real landmark.
- Fly: gap height >= 132px, successive gap centres differ by <= 120px.
- Length 8,000-13,000px so levels stay challenging. The timer scales with width.
- Reserve pipe entrances/returns and checkpoints first. Place hazards and enemies from shuffled eligible areas; keep the boss arena clear.
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
- Optional local flavour (see game-contract "Regional rooms"): `stand` (a street stall such as
  `herring` or `bakery`), `pipeTheme` (a regional cloud room such as the Paris `metro`, with
  `pipe_<theme>`, `challenge_*_<theme>` and optional `challenge_train_<theme>` art),
  `ambient.water: ['region']` river boats, `AH.Art.sceneryStars` signature landmarks and a
  regional `main` music theme in `AH.Audio.REGION_SONG`. Add a test for each.
- Preserve the shared cloud challenge pool, meaningful height variation, local street objects
  and accessible low combat routes. New country content must be welcoming, not stereotypes
  that demean people. Teach Microsoft/Azure secure practices through configuration threats.
- London reserves the first pipe for `tube`; Paris reserves `metro`. Tokyo remains
  a flight world: its station, trains, street traffic and blossom are decorative,
  never an implicit switch to ground controls. Use `ambient.rail` for moving trains.
- Use `AH.Art.sceneryRoutes` for requested highlights that must appear every run
  (Amsterdam transit, Tokyo street/metro/blossom, Australia's coast/outback/Uluru).
  Test their actual placement, not merely texture registration or random weights.
