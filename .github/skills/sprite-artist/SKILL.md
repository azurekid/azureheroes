---
name: sprite-artist
description: 'Create Azure Heroes code-drawn pixel art, duck/slide poses, cloud threats, challenge tiles, regional props, vehicles, landmarks, wardrobe and read-only HUD.'
---

- Read [game-contract](../game-contract/SKILL.md) and [game-security](../game-security/SKILL.md).
- Runtime art belongs only in `art/sprites.js` and read-only UI in `ui/hud.js`. Related tests/docs are in scope; coordinate consumers via [game-orchestrator](../game-orchestrator/SKILL.md).
- Hero: blue suit, blue cape, glowing A, sunglasses, 32x48px, frames: idle, run0-3, jump, fly, attack, shield, duck, slide. Preserve wardrobe in every pose and register frames in `HERO_FRAMES`.
- Enemies: patrol robot, drone, spider bot, boss CyberGuardian, all in same neon sunset palette.
- Draw with code / pixel arrays, no external image files.
- Keep the HUD from the mockups: Health, Score, MFA, Credits, Lives, Time on top, ability + level name at bottom.
- The world map (`world_map`, `map_plane`) is drawn from lon/lat polygons in `MAP`/`LAND`. Use `AH.Art.MAP.proj(lon, lat)` to place pins for new regions.
- Hero Lab wardrobe: add headwear to `HERO_HATS` and draw it in `heroHat` (head space, canvas top is y 0). Add extras to `HERO_GEAR` and draw them in `heroGear` (`stand` and `fly` poses). Each entry is `[key, NAME, ORIGIN]` using the pixel font charset.
- Cyber-threat enemies (`phish_*`, `ram_*`, `botnet_*`, `ebomb`) are shared by every region.
- Cloud threats (`bug_*`, `image_*`, `rbac_*`, `endpoint_*`, `guest_*`) have two shared frames.
- Challenge textures use `cloud_tile_<theme>` and `challenge_bg_<theme>`.
- Register text-bearing sprites only after the font/glyph cache is initialized.
- Honor `AH.Art.D` texture density; keep physical obstacle sizes in `obSize` aligned with rendered dimensions. Check vehicles against the hero and local stands against the street.
