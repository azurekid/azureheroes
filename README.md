# Microsoft Azure Heroes 2027

A 16-bit synthwave side-scrolling adventure built with **Phaser 3** (loaded from a CDN), plain HTML, CSS and JavaScript. There is no build step, no backend and no image or audio files: every sprite and background is drawn in code and every sound is synthesised with the Web Audio API.

![Title screen](docs/screenshots/title.png)

## Play

Open `index.html` in a browser (an internet connection is needed for the Phaser CDN). You can also serve the folder with any static server:

```bash
python3 -m http.server 8080
# then browse to http://localhost:8080
```

## Levels

| Level | Azure region | World | Mode |
|-------|--------------|-------|------|
| 1 | `westeurope` | Amsterdam Canal Run: windmill, canal houses, Westerkerk | Run |
| 2 | `uksouth` | London Thames Run: Big Ben, Tower Bridge, London Eye, the Shard | Run |
| 3 | `japaneast` | Tokyo Skyway Pursuit: Mount Fuji, Tokyo Tower, torii, pagoda | Flight |
| 4 | `australiaeast` | Sydney Harbour Run: Opera House, Harbour Bridge | Run |
| 5 | `brazilsouth` | Rio Sugarloaf Pursuit: Christ the Redeemer, Sugarloaf | Flight |
| 6 | `eastus` | Virginia Data Center: Capitol, Washington Monument, hack terminals, Sec Gates and the High-Risk CyberGuardian boss | Data center |

Levels are generated at random each time a level starts, so platforms, lasers, enemies, coins and MFA tokens land in new places on every run. Each level is 9,000 to 13,000 px long.

Collect 5 MFA tokens for an extra life. Every enemy takes 2 hits and drops an Azure Credit. Best score and unlocked levels are stored in `localStorage`.

## Controls

| Action | Keyboard | Touch |
|--------|----------|-------|
| Move | Arrow keys / WASD | Left / Right buttons |
| Jump / Double jump | Space (double-tap for double jump), Up, W | Jump button |
| Azure Blast (costs Boost) | F | Attack button |
| Flight Boost | Shift | - |
| MFA Shield (blocks boss attacks) | E, S or Down | - |
| Pause / Restart / Mute | P / R / M | Pause button |

Add `?touch=1` to the URL to force the touch controls on a desktop browser.

## Project layout

The layout follows the project skills in `.github/skills/`.

```
index.html          entry point, Phaser config, script order
art/sprites.js      every sprite, tile, background and the pixel font
ui/hud.js           read-only HUD
levels/worlds.js    Azure region worlds and random level generators (see the game-contract skill)
systems/            audio and save, input, player, enemies, boss, scenes
tests/playtest.md   QA report
docs/               article and screenshots
```

## Deploy

The site is static, so no build configuration is needed.

- **GitHub Pages:** Settings > Pages > deploy from the `main` branch, root folder.
- **Azure Static Web Apps:** point the app location at the repository root, leave the API and output locations empty, and skip the build.

## Screenshots

![World 1](docs/screenshots/world1.png)
![World 2](docs/screenshots/world2.png)
![World 3](docs/screenshots/world3.png)
![World 4](docs/screenshots/world4.png)
![World 5](docs/screenshots/world5.png)
![World 6](docs/screenshots/world6.png)
![CyberGuardian boss](docs/screenshots/boss.png)

Read the write-up in [docs/article.md](docs/article.md).
