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

![London Thames promenade](screenshots/london-thames.png)

## Cities you can recognise

Each run level has ground that matches the city. In Amsterdam you run along canal quays, ride canal boats, cross pull-up bridges that lift on a timer and can grab an Azure Bike. Behind you scroll gabled canal houses with step, bell, neck and spout gables, Centraal Station, Schiphol, the Microsoft office at Schiphol, the Amstel Hotel and the red lanterns of the old centre. London has the Thames promenade, Big Ben, Buckingham Palace and the Tower of London, and a red phone box that hides a bonus room.

The scenery strip never shows the same landmark twice on one screen. The far skyline layer has no landmarks, so landmarks can't repeat there either.

![Amsterdam landmarks](screenshots/amsterdam-landmarks.png)
![Amsterdam pull-up bridge](screenshots/amsterdam-drawbridge.png)

## Three levels, three ways to play

- **Azure region worlds**: six levels, each themed on a region with recognisable landmarks (Amsterdam, London, Tokyo, Sydney, Rio, Virginia) and a randomly generated layout on every run.
- **Rooftop runs** are classic platformers. Gaps that need a double jump and timed red laser traps keep it varied.
- **Sky Canyon Pursuit** switches to an auto-scrolling flight mode. Drones chase the hero, rocks block the canyon and gold rings add score.
- **Data Center Infiltration** adds hack terminals that fill a Hack Progress bar, Sec Gates that stay closed until the hack is done, cables to jump over and spider bots.

![Sky Canyon Pursuit](screenshots/world3.png)

Levels are plain data objects (`platforms`, `lasers`, `coins`, `mfaTokens`, `enemies`, `exit`), so adding one means adding one file.

![Data Center Infiltration](screenshots/world6.png)

## Local bosses, local enemies, power-ups

Every region has its own boss in the local style: a Windmill Titan in Amsterdam, a Bearskin Sentinel in London, a hovering Sumo Shogun in Tokyo, a Boxing Roo in Sydney, Carnaval Rei in Rio and the original High-Risk CyberGuardian in Virginia. Enemies, coins and scenery props are re-skinned per region (sushi drones, emus and crocodiles, clog bots and so on).

Ground bosses cannot be hit head-on. The player holds the **MFA Shield** to block bolts and charges. After enough blocks the boss is stunned, and only then does an Azure Blast hurt it. Hovering bosses cannot be blocked, so the player dodges and blasts them in an exposed window. All have three attack phases and a health bar with a blinking **RISK LEVEL: HIGH** label.

![The Boxing Roo](screenshots/boss4.png)
![The Sumo Shogun](screenshots/boss3.png)

Floating orbs add Copilot (an auto-firing sidekick), Defender, GitHub Actions, Power BI and Teams power-ups, plus Clippy tips and achievement toasts. The hero can be male or female.

![Female hero](screenshots/title-female.png)

## Sound without files

`systems/audio.js` synthesises jump, coin, hit, block, boss and win effects, plus a looping music pattern, using oscillators and noise from the Web Audio API. A mute button is always available, and the setting is saved.

## Testing without a keyboard

Because the game exposes its state, a headless Chrome script can drive it. A simple bot steers the hero, jumps at pit edges, blasts enemies and uses the shield against the boss. Running it found real bugs. In one case, Azure Blasts passed straight through the boss because a Phaser rectangle was compared using the wrong property names. See [tests/playtest.md](../tests/playtest.md) for the report.

## Run it

Open `index.html`, or deploy the folder to GitHub Pages or Azure Static Web Apps. There is nothing to build. See the [README](../README.md) for controls and deployment.
