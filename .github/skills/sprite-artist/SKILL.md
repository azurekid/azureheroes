---
name: sprite-artist
description: Create 16-bit pixel art sprites and HUD for Azure Heroes 2027. Use for hero, enemies, boss, tokens.
---

- Work only in art/sprites.js and ui/hud.js.
- Hero: blue suit, blue cape, glowing A, sunglasses, 32x48px, frames: idle, run, jump, fly, attack, shield.
- Enemies: patrol robot, drone, spider bot, boss CyberGuardian, all in same neon sunset palette.
- Draw with code / pixel arrays, no external image files.
- Keep the HUD from the mockups: Health, Score, MFA, Credits, Lives, Time on top, ability + level name at bottom.
- The world map (`world_map`, `map_plane`) is drawn from lon/lat polygons in `MAP`/`LAND`. Use `AH.Art.MAP.proj(lon, lat)` to place pins for new regions.
- Hero Lab wardrobe: add headwear to `HERO_HATS` and draw it in `heroHat` (head space, canvas top is y 0). Add extras to `HERO_GEAR` and draw them in `heroGear` (`stand` and `fly` poses). Each entry is `[key, NAME, ORIGIN]` using the pixel font charset.
- Cyber-threat enemies (`phish_*`, `ram_*`, `botnet_*`, `ebomb`) are shared by every region.
