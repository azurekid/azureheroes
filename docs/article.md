# Building Microsoft Azure Heroes 2027 with no assets and no build step

Microsoft Azure Heroes 2027 is a retro side-scroller about a caped security hero: blue suit, glowing **A** on the chest, sunglasses. The hero runs across neon rooftops, flies through a sky canyon and infiltrates a data center, where a High-Risk CyberGuardian waits at the end.

The constraints shaped everything: HTML, CSS and JavaScript only, Phaser 3 from a CDN, no image files, no audio files, and the game must run by opening `index.html`.

![Title screen: Coming Soon becomes Press Start](screenshots/title.png)

## Everything is drawn in code

There are no sprite sheets. `art/sprites.js` draws each sprite on an offscreen canvas and hands the canvas to Phaser as a texture. Each sprite goes through the same pipeline:

1. Draw the shapes on a small pixel grid, then upscale 2x.
2. Run a lighting pass: a rim light on the top and left edges, shade on the bottom and right, a vertical gradient and a fine dither.
3. Add a navy outline.
4. For pickups and hazards, add a glow using canvas `shadowBlur`, which also works on mobile Safari.

Backgrounds are layered parallax skylines with neon signs, a sun with a halo, clouds and stars. Text uses a custom 5x7 bitmap font, so the HUD looks the same everywhere.

![Rooftop Run](screenshots/level2.png)

## Three levels, three ways to play

- **Rooftop Run** is a classic platformer. Gaps that need a double jump and timed red laser traps keep it varied.
- **Sky Canyon Pursuit** switches to an auto-scrolling flight mode. Drones chase the hero, rocks block the canyon and gold rings add score.
- **Data Center Infiltration** adds hack terminals that fill a Hack Progress bar, Sec Gates that stay closed until the hack is done, cables to jump over and spider bots.

![Sky Canyon Pursuit](screenshots/level3.png)

Levels are plain data objects (`platforms`, `lasers`, `coins`, `mfaTokens`, `enemies`, `exit`), so adding one means adding one file.

![Data Center Infiltration](screenshots/level4.png)

## The boss

The High-Risk CyberGuardian cannot be hit head-on. The player must hold the **MFA Shield** to block its bolts and charges. After enough blocks the boss is stunned, and only then does an Azure Blast hurt it. It has three attack phases and a health bar with a blinking **RISK LEVEL: HIGH** label.

![The CyberGuardian is stunned](screenshots/boss.png)

## Sound without files

`systems/audio.js` synthesises jump, coin, hit, block, boss and win effects, plus a looping music pattern, using oscillators and noise from the Web Audio API. A mute button is always available, and the setting is saved.

## Testing without a keyboard

Because the game exposes its state, a headless Chrome script can drive it. A simple bot steers the hero, jumps at pit edges, blasts enemies and uses the shield against the boss. Running it found real bugs. In one case, Azure Blasts passed straight through the boss because a Phaser rectangle was compared using the wrong property names. See [tests/playtest.md](../tests/playtest.md) for the report.

## Run it

Open `index.html`, or deploy the folder to GitHub Pages or Azure Static Web Apps. There is nothing to build. See the [README](../README.md) for controls and deployment.
