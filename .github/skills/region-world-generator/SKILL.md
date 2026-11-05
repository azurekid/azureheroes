---
name: region-world-generator
description: Add or change an Azure region world, landmarks, transit, scenic routes, local enemies, bosses or random level generation for Azure Heroes 2027. Use when adding a city or region (even from a one-line request such as 'add a New York level') or changing regional transport and scenery.
---

Design goal: every world must feel like its own place at a glance, the way each Subway Surfers city does. Change the setting, not just the colours.

Every new world must also use [music-producer](../music-producer/SKILL.md).
Derive its musical identity alongside its visual brief; city-owned music must
affect the selected trance/house/pop genre, not disappear into a generic worldwide loop.

Start at `worlds/catalogue.js`, then read only the affected `worlds/<city>/` folder
and the necessary shared helper API. City metadata/map, local drawing, rewards and
regional music belong together there. Shared rigs stay in `art/`, algorithms in
`levels/`, composition in `audio/`, and behavior in `systems/`. Do not add a city
switch to a shared engine or copy shared code into a city.
For concrete stage/context APIs and stable reward registration, follow the
[sprite-artist city registration recipe](../sprite-artist/SKILL.md#city-registration-recipe).
Local route/landmark parts are collected automatically; new drawing factories
still need explicit dependency-ordered stage calls in the art facade.

## From a one-line request ("add a New York level")
Contributors may only name a city. Do not ask them to list landmarks; build an identity brief
from well-known facts, show it in your plan or PR, then implement it. Fill every row:

| Brief row | Where it lands | New York example |
|---|---|---|
| Azure region | city `world.js` field `region`; suitable real, unused id (never invent one; one world per id) | New York world 11 uses `eastus2` (East US 2); hint explicitly calls it hosting, not a local datacenter |
| Skyline (3-4 icons) | painted `bg_far_<region>` + `panoramaLandmarks` | Statue of Liberty, Empire State, Chrysler, Brooklyn Bridge |
| Street-strip pieces (6+) | `sc_<prefix>_*`, signature ones in `sceneryRoutes` | Times Square billboards, brownstones with fire escapes, yellow-cab street, subway entrance, Central Park, skyscraper row |
| Food/market stand | `stand` + `regOb` art | hot dog / pretzel cart |
| Props and obstacles | `prop_*`, `opt.obstacles` | fire hydrant, newspaper box, steam vent |
| Traffic and transit | `ambient.road/rail/water/sky` (calm budget) | yellow cabs, MTA bus, elevated subway, Staten Island ferry, helicopter |
| Local creatures as enemy skins | `en_<region>_robot/drone/spider` | rat (crawler), pigeon (flyer), rogue street robot (walker) |
| Boss | new `fighterReg` kind + `bolt_<kind>` art and a `boss` row; `systems/boss.js` needs no change | a new boxer, not the existing `enforcer` |
| Currency, music, ground | city coin art, `music.js` original regional motifs for trance/house/pop, `world.js` ground/water | $ coin, funky house groove, sidewalk + Hudson piers |
| Microsoft touch | billboards via `billKeys` | Azure ad on a Times Square screen |
| Map and rewards | `world.js` map tuple, separated pin hit areas; local reward data at the new world index | New York pin beside Virginia; a varsity outfit reward bundle |

Rules for the brief:
- Prefer icons a visitor would recognise at a glance; mix landmarks, everyday architecture,
  street life and transport. Pick the ground/flight/data-center mode that fits the city.
- Creatures and pests are only skins: movement type, two-hit/one-credit rules and the cloud
  threat nameplate stay (a rat on the crawler type is still a cloud threat). Keep them cartoon-friendly.
- Reuse existing ambient kinds and art when they fit (`taxi`, `schoolbus`, `plane`); add new
  code-drawn ones only for missing icons. Never duplicate a landmark another world already owns
  unless the city is the real location (and then move it, do not copy it).
- Local secrets should fit the city: New York uses a manhole and a rat-filled
  sewer, not London's phone box or the shared Windows-style cloud room. Keep
  bonus descriptors/art city-owned, reserve their full width before pipe rooms,
  and reuse existing enemy behavior and regional underground music.
- Ask the contributor only when the region choice is genuinely ambiguous, the city overlaps
  an existing world, or a detail could be culturally sensitive. Otherwise state assumptions and proceed.
- Check the current world list before treating an example as a new region. New York already
  exists as world 11; improve it rather than appending another New York or reusing its region.
- Registration presents represented regions, not geographic inference. Keep IDs
  stable and API region bounds aligned with catalogue additions. Progression picks
  random uncleared worlds; never gate a new city behind a numeric predecessor.
  Redmond's scenic route includes Pike Place, Starbucks, Link and Microsoft campus;
  preserve grounded station/rail alignment and original code-drawn branding.

## Region identity checklist (all required for a new world)
1. **Azure region**: real region id, e.g. `westeurope`, plus a city. Set `AH.Worlds[slug].world` in its `world.js` (`id, region, regionName, city, name, mode, theme, tint, landmarks, hint, opt, boss, map`). Append the slug to the explicit catalogue and scripts to `index.html`; preserve IDs.
2. **Landmarks**: recognisable pieces in the scenery strip, plus a tinted sky, a painted far panorama (`bg_far_<region>`, also the map thumbnail) and near layers in the city's art modules. Reuse shared drawing helpers.
2b. **Scenery strip**: 6+ local landmark pieces `sc_<prefix>_<name>` plus Microsoft billboards, listed in `sceneryKeys`. Levels use the painted panorama `bg_far_<region>` (the map thumbnail) as the far layer, so the signature skyline is always visible. List every strip key that duplicates a painted landmark in `AH.Art.panoramaLandmarks[region]`; the strip skips those. Local architecture (canal houses, zinc roofs) stays full size and near-continuous; every 3-4 pieces a 110-190px sky window shows the sun and panorama. Never thin or shrink the strip to calm a level; reduce moving traffic instead. The strip never shows the same key twice on screen. Give run levels a matching `ground`/`water` style (quays, promenades, piers) instead of plain rooftops.
2c. **Painted depth**: apply the shared 2.5D contract to scenery, local surfaces,
    underground themes and city-owned secrets. Use locally appropriate roof/side
    returns, grounded foundations and receding quays, streets or interior aisles.
    Preserve signature silhouettes, sky windows, texture bounds and seeded drawing
    order; do not skew entire textures or move collision to fit the picture.
3. **Local enemies**: a skin for each enemy type the level uses (`robot` = walker, `drone` = flyer, `spider` = crawler). Textures `en_<region>_<type>_0/1`. Behaviour and stats never change, only the look. Every enemy still takes 2 hits and drops 1 Azure Credit.
4. **Local pickups**: regional currency glyph on the Azure Credit (`coin_<region>0..3`).
5. **Local props**: 2 decorative objects per world (`prop_<name>`), placed at random along the level, never solid.
6. **Local boss**: an adult street-fighter villain with a local fighting style and a cyber-threat role (e.g. Muay Thai access broker, savate spoofer, luchador zero-day), configured in city art using the shared fighter rig in `art/` (all eight fighter frames, see game-contract), a thrown projectile `bolt_<kind>`, and a `boss` entry `{ kind, name, proj, air }` in city `world.js`. Flight worlds use `air: true`. No mascots, animals or cartoon objects as bosses; keep them respectful, not national caricatures.
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
- Use optional city `environments_<region>` data for immersive full-background
  stretches such as Bondi/outback, rather than a floating scenic card. Follow the
  game-contract section bounds/fades, transparent-sky and 640x360 art requirements.
  Keep map panoramas, physics, layout RNG and regional music unchanged for purely
  visual sections. The shared outdoor clock cycles independently of progress.
- Fly: gap height >= 132px, successive gap centres differ by <= 120px.
- Length 8,000-13,000px so levels stay challenging. The timer scales with width.
- Reserve pipe entrances/returns and checkpoints first. Place hazards and enemies from shuffled eligible areas; keep the boss arena clear.
- Always end with a boss arena. Run arena: flat 760px platform. Fly arena: the last 640px, where scrolling stops.
- Output must still follow the game-contract Level format.

## Rules
- Local drawing lives in city art modules, shared tools/rigs in `art/` (see sprite-artist).
- Boss and enemy logic stays in `systems/` (see gameplay-systems); city data in `world.js`,
  regional songs in `music.js`, shared generation in `levels/`.
- Verify with a headless bot on the new level several times: it must be completable, show no console errors, and the boss must be beatable.
- Return: world id, region, length range, enemy skins, boss name, and how you tested it.

## World map and save data
- Set `map: [lon, lat, dx, dy]` in the city's `world.js` (dx/dy nudge crowded pins).
  The shared map UI reads this metadata; never maintain a second coordinate table.
- Pin the depicted city, not a guessed datacenter location. Explicitly label hosting-region
  mappings when the city has no local Azure region, and verify adjacent pins stay tappable.
- Appending a world keeps existing players' `unlocked` counts valid. Inserting one in the middle shifts level ids.
- Append one suit, hairstyle and accessory reward for the new world index. Preserve all old
  wardrobe indexes and test locks, old saves and every pose, including HD.
  Include local headwear and individual collectible placements in existing local
  secrets/sub-levels, not automatic clear rewards. Keep religious options open.
  Guides wear the city's reward outfit/headwear through the shared civilian rig.
- Landmarks can come from the whole country (e.g. Colosseum and Pisa for Italy), not only the region's city.
- Optional: `ambient` moving objects, `opt.secret` theme, and `opt.pipes` warp pipes (see game-contract).
- Optional local flavour (see game-contract "Regional rooms"): `stand` (a street stall such as
  `herring` or `bakery`), `pipeTheme` (a regional cloud room such as the Paris `metro`, with
  `pipe_<theme>`, `challenge_*_<theme>` and optional `challenge_train_<theme>` art),
  `ambient.water: ['region']` river boats, `AH.Art.sceneryStars` signature landmarks and a
  regional `main` music theme in city `music.js`, consumed by shared audio routing.
  Add a test for each.
- Preserve the shared cloud challenge pool, meaningful height variation, local street objects
  and accessible low combat routes. New country content must be welcoming, not stereotypes
  that demean people. Teach Microsoft/Azure secure practices through configuration threats.
- London reserves the first pipe for `tube`; Paris reserves `metro`. Tokyo remains
  a flight world: its station, trains, street traffic and blossom are decorative,
  never an implicit switch to ground controls. Use `ambient.rail` for moving trains.
- Use `AH.Art.sceneryRoutes` for requested highlights that must appear every run
  (Amsterdam transit, Tokyo street/metro/blossom, Australia's coast/outback/Uluru).
  Test their actual placement, not merely texture registration or random weights.
