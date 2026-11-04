---
name: sprite-artist
description: 'Create Azure Heroes code-drawn pixel art, duck/slide poses, cloud threats, challenge tiles, regional props, vehicles, landmarks, wardrobe and read-only HUD.'
---

- Read [game-contract](../game-contract/SKILL.md) and [game-security](../game-security/SKILL.md).
- Runtime art belongs only in `art/sprites.js` and read-only UI in `ui/hud.js`. Related tests/docs are in scope; coordinate consumers via [game-orchestrator](../game-orchestrator/SKILL.md).
- Hero: blue suit, blue cape, glowing A, sunglasses, 32x48px, frames: idle, run0-3, jump, fly, attack, shield, duck, slide. Preserve wardrobe in every pose and register frames in `HERO_FRAMES`; Cloud Hacker is capeless.
- Enemies: patrol robot, drone, spider bot, boss CyberGuardian, all in same neon sunset palette.
- Draw with code / pixel arrays, no external image files.
- Keep the HUD from the mockups: Health, Score, MFA, Credits, Lives, Time on top, ability + level name at bottom.
- The world map (`world_map`, `map_plane`) is drawn from lon/lat polygons in `MAP`/`LAND`. Use `AH.Art.MAP.proj(lon, lat)` to place pins for new regions.
- Hero Lab wardrobe: add headwear to `HERO_HATS` and draw it in `heroHat` (head space, canvas top is y 0). Hats must cover the top of the hair: give each new hat a `HAT_LINE` band y (hair above it is clipped by `underHat`); only headbands may leave hair showing above. Full head coverings (hijab) use a `HAT_LINE` of 99 to hide all hair and draw their back drape in `hatBack`; the heroine bust stays a modest contour (`heroBust`, no cleavage) on suits and outfits. Add extras to `HERO_GEAR` and draw them in `heroGear` (`stand` and `fly` poses). Each entry is `[key, NAME, ORIGIN]` using the pixel font charset.
- The `CLOUD HACKER` hero's dark hood is part of the outfit, not a saved hat:
  show it only when no headwear is selected. Explicit hats and the hijab replace it.
  Match the Rogue Hacker's enclosed dark face, red visor, red-accented zip hoodie
  and handheld terminal; the built-in hood hides hair without changing the saved look.
  Keep the face and visor with every headwear choice, and omit the cape in every pose,
  including flight, without changing abilities.
- The bowler's rounded crown must meet its band and brim without exposing a scalp gap.
  Check hair coverage with afro, bun and long styles in both gameplay and HD poses.
- HD hero: hero frames are drawn at density `DEN`; extra detail goes behind the `HDX` flag (`heroHDTorso`, `heroHead`) so in-game frames stay readable. Preview with `AH.Art.buildHeroHD`.
- Regional rewards: add outfit, hairstyle and accessory together through the
  game-contract wardrobe APIs. Outfits must change garment structure (Japan: kimono
  and obi), not only palette. Keep classic items open, honor locks in preview/save,
  and render both bodies and every gameplay/HD pose without clipping.
- Enemies must read as their threat at a glance: give each a distinct silhouette and a cue of its cloud resource (padlock, RBAC badge, container, endpoint).
- Cyber-threat enemies (`phish_*`, `ram_*`, `botnet_*`, `ebomb`) are shared by every region.
- Cloud threats (`bug_*`, `image_*`, `rbac_*`, `endpoint_*`, `guest_*`) have two shared frames. Draw the real thing:
  `bug` is a six-legged beetle (faces right), `endpoint` an open laptop broadcasting a public globe with its port on the
  left (faces left, bolts leave at that port).
- The rogue `hacker_*` enemy has a red-accented hood and a handheld terminal facing left.
  Its laptop port aligns with shooter bolts; its nameplate identifies it as an enemy.
  Reuse its hood, visor and terminal art for the playable Cloud Hacker where practical.
- Faces stay natural at hi-res: subtle mouth lines and soft blush, no glossy or saturated lips.
- Climb walls use `climb_face` (tiling grip rail) and `climb_sign` (up arrow) so wall-jump spots read at a glance.
- Challenge art must match regional-world detail: recognizable shipping containers
  with corrugation, locking bars and weathering; docks with cranes, water and lamps;
  runner workshops with machinery, roof trusses, workstations and conveyors.
- Use `AH.Art.buildCloudPlatform(scene,p)` for exact-size cargo/catwalks, not tiny
  repeated boxes. Floors use `cloud_floor_<theme>`. Three `challenge_bg_<theme>`
  variants (base, `_1`, `_2`) sit above room-only `challenge_far_<theme>` parallax.
  Keep scenery lower-contrast than solid platforms, enemies and pickups.
- Entra vault and Functions reactor art must be distinct from cargo docks/workshops;
  include matching cabinets, backgrounds, signs and floor textures.
- Regional rooms (Paris `metro`) need the full set: floor, sign, far layer, three
  backgrounds, `buildCloudPlatform` branch, plus optional `pipe_<theme>` /
  `pipe_<theme>_top` entrances and `challenge_train_<theme>`. Keep painted plates and
  posters below y 150 clear of stage signs at y 98..134. Landmarks must read at
  strip scale: Eiffel lattice and galleries, Sacre-Coeur domes, Moulin Rouge sails.
- Weapon pickup icons and projectile silhouettes must distinguish spread from beam.
  Charge glow and green boss brackets are drawn here, never inline in gameplay.
- Verify all six themes at entry and mid-room in desktop and forced-touch layouts.
  Preserve collision geometry, low-duct clearance, font legibility and exit visibility.
- Register text-bearing sprites only after the font/glyph cache is initialized.
- Honor `AH.Art.D` texture density; keep physical obstacle sizes in `obSize` aligned with rendered dimensions. Check vehicles against the hero and local stands against the street.
