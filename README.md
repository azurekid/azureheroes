# Microsoft Azure Heroes 2027

A 16-bit synthwave side-scrolling adventure built with **Phaser 3** (loaded from a CDN), plain HTML, CSS and JavaScript. There is no build step and there are no image or audio files: every sprite and background is drawn in code and every sound is synthesised with the Web Audio API.

The game runs fully offline as a static site. When it is hosted with the small Node.js server in `server.js` (for example on Azure App Service), players can also register, sync their progress and compete on a global high score dashboard.

![Title screen](docs/screenshots/title.png)

## Play

Open `index.html` in a browser (an internet connection is needed for the Phaser CDN). This is guest mode: progress is saved in `localStorage`.

To play with accounts and the high score dashboard, run the server (Node.js 18 or later, no dependencies):

```bash
npm start            # http://localhost:8080 (PORT and DATA_DIR env vars are optional)
npm test             # API tests
```

## World map

Levels are picked on an **Azure world map**. Each pin is an Azure region. Cleared pins get a green tick and are joined by gold flight routes, and a plane flies the latest leg. Select a pin with the arrow keys or a tap, then press Enter or tap it again to deploy.

The game remembers where you left off. **C: Continue** on the title screen or map resumes the level you were playing, also after a game over (the score then restarts at zero so the high score table stays fair). After a cleared level, Continue takes you to the next one with your score and lives.

![World map](docs/screenshots/world-map.png)
![All regions cleared](docs/screenshots/world-map-cleared.png)

## Levels

| Level | Azure region | World | Boss | Mode |
|-------|--------------|-------|------|------|
| 1 | `westeurope` | Amsterdam Canal Run: canal houses, Centraal Station, Schiphol, Microsoft HQ, Kinderdijk, Rotterdam, The Hague | Windmill Titan | Run |
| 2 | `uksouth` | London Thames Run: Big Ben, Tower Bridge, Stonehenge, Edinburgh, Glenfinnan, a secret phone box | Bearskin Sentinel | Run |
| 3 | `francecentral` | Paris Seine Run: Eiffel Tower, Louvre, Mont-Saint-Michel, Carcassonne, a secret Metro entrance | Chef de Chaos | Run |
| 4 | `japaneast` | Tokyo Skyway Pursuit: Mount Fuji, Tokyo Tower, Himeji, Osaka Castle, Shinkansen | Sumo Shogun (hovering) | Flight |
| 5 | `australiaeast` | Sydney Harbour Run: Opera House, Harbour Bridge, Uluru, Twelve Apostles | Boxing Roo | Run |
| 6 | `italynorth` | Venice Lagoon Run: Rialto, St Mark's, gondolas, Colosseum, Leaning Tower of Pisa, a Trevi portal | Gladiator Maximus | Run |
| 7 | `brazilsouth` | Rio Sugarloaf Pursuit: Christ the Redeemer, Sugarloaf, Brasilia, Iguazu | Carnaval Rei (hovering) | Flight |
| 8 | `mexicocentral` | Mexico City Skyway: Teotihuacan, Chichen Itza, Angel of Independence, hot air balloons | El Luchador Supremo (hovering) | Flight |
| 9 | `westus2` | Redmond Campus Lake Run: Microsoft campus, Space Needle, Mt Rainier, an Xbox bonus door | The Blitz Linebacker | Run |
| 10 | `eastus` | Virginia Data Center: Capitol, Washington Monument, hack terminals, Sec Gates | High-Risk CyberGuardian | Data center |

Levels are generated at random each time a level starts, so platforms, lasers, enemies, coins, power-ups and MFA tokens land in new places on every run. Run levels mix gaps, steps up, drops and floating platforms at different heights, and every region has its own coins, enemy skins, scenery props, traffic, birds and sky objects (planes, balloons, blimps, helicopters). Each run also gets a random time of day, from sunrise to night.

Every region also has cyber-threat enemies: **Phishing hoppers** leap at you, **Ransomware chargers** wind up and dash, and **DDoS botnet clouds** follow you and drop bombs.

### Streets, water and secrets

Run levels are not just rooftops. The ground matches the city: canal quays and brick bridges in Amsterdam, the Thames embankment promenade in London and harbour piers in Sydney. Fall in the water and you lose a life. Canal boats and ferries carry you across. Amsterdam's pull-up bridges lift on a timer, so watch for the flashing warning before you cross.

- **Azure Bike** (Amsterdam, London): run into it to ride. It is faster and rams enemies, but one hit knocks you off.
- **Secret phone box** (London): stand inside for a moment to warp to a bonus room full of credits.
- **Shooting enemies**: some walkers fire bolts back at you, and each level has around 15-20 enemies.
- **No repeats**: a scenery strip of local landmarks and Microsoft billboards scrolls behind the street. The same landmark never shows twice on screen.

Microsoft touches: the Microsoft logo in the HUD and title, Microsoft HQ and Azure/Copilot/Xbox signs in the scenery, a Bliss-style hill, a Blue Screen game over and an Azure portal "Deployment succeeded" level-complete panel.

Every level ends in an arena with that region's boss. Ground bosses must be blocked with the MFA Shield until they are stunned. Hovering bosses (Tokyo, Rio) cannot be blocked: dodge their volleys, then blast them while they are exposed. The exit opens when the boss is down.

### Power-ups

| Orb | Effect |
|-----|--------|
| Copilot | A sidekick auto-fires Azure Blasts at nearby enemies for 12 s |
| Defender | Invincible for 8 s |
| GitHub Actions | Turbo speed for 9 s |
| Power BI | Coin magnet and double score for 12 s |
| Teams | Instant +30 health |

Clippy warns you when health is low, and Xbox-style achievements pop up for firsts. Open the **Hero Lab** on the title screen with **H** to choose a male or female hero, skin tone, hair style, hair colour and suit colour. The choice is saved.

Some levels have **Azure Pipelines** warp pipes: press Down (or stand still) on a pipe to drop into an underground bonus zone with extra coins and enemies, then take the exit pipe back up further along the level.

Collect 5 MFA tokens for an extra life. Every enemy takes 2 hits and drops an Azure Credit. Best score, unlocked levels and the resume point are stored in `localStorage`, and synced to your account when you are logged in.

## Controls

| Action | Keyboard | Touch |
|--------|----------|-------|
| Move | Arrow keys / WASD | Left / Right buttons |
| Jump / Double jump | Space (double-tap for double jump), Up, W | Jump button |
| Azure Blast (costs Boost) | F | Attack button |
| Flight Boost | Shift | - |
| MFA Shield (blocks boss attacks) | E, S or Down | - |
| Pause / Restart / Mute | P / R / M | Pause button |
| Enter pipe | Down on a pipe | Stand still on the pipe |
| Continue / High scores / Log in | C / B / L (title and map) | Tap the menu item |
| Hero Lab | H (title) | Tap the hero |

Add `?touch=1` to the URL to force the touch controls on a desktop browser.

## Project layout

The layout follows the project skills in `.github/skills/`.

```
index.html          entry point, Phaser config, account form, script order
art/sprites.js      every sprite, tile, background, the world map and the pixel font
ui/hud.js           read-only HUD
levels/worlds.js    Azure region worlds and random level generators (see the game-contract skill)
systems/            audio and save, online accounts, input, player, enemies, boss, scenes
server.js           optional Node.js server: static files + accounts + leaderboard API
tests/              API tests (npm test) and the QA report
docs/               article and screenshots
```

## High scores and accounts

Press **L** on the title screen to register or log in with a hero name (3-15 letters or digits), a password and a location shown on the dashboard. Progress (unlocked levels, best scores and resume point) syncs to the account, so you can continue on another device. Press **B** for the dashboard with rank, player name, location, best score and furthest level.

Accounts only appear when the page is served by `server.js`. On a static host the game quietly stays in guest mode.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Detects online mode |
| GET | `/api/leaderboard?limit=20` | Top scores |
| POST | `/api/register` | `{ name, password, location, progress }` returns a token |
| POST | `/api/login` | `{ name, password }` returns a token and the profile |
| GET | `/api/me` | Current profile (Bearer token) |
| POST | `/api/logout` | Revokes the token |
| PUT | `/api/progress` | Merges saved progress (unlocks never go backwards) |
| POST | `/api/score` | `{ score, level, city }` returns best and rank |

Passwords are hashed with salted scrypt, tokens are random, stored as SHA-256 hashes and expire after 30 days. Requests are rate limited, input is validated and only the game files are served. Data is stored in `DATA_DIR/heroes.json`.

![Leaderboard](docs/screenshots/leaderboard.png)
![Log in or register](docs/screenshots/login.png)

## Deploy

### Azure App Service (accounts + leaderboard)

1. Create a Linux Web App with the **Node 20 LTS** runtime, for example:

   ```bash
   az webapp up --name <app-name> --resource-group <rg> --runtime "NODE:20-lts" --sku B1
   ```

2. Set the app setting `DATA_DIR=/home/data` so the store lives on persistent storage (`az webapp config appsettings set --name <app-name> --resource-group <rg> --settings DATA_DIR=/home/data`).
3. The startup command is `npm start` (App Service runs it by default because `package.json` has a `start` script). App Service provides `PORT`.
4. For continuous deployment, `.github/workflows/azure-app-service.yml` runs the tests and deploys on every push to `main`. Add the repository variable `AZURE_WEBAPP_NAME` and the secret `AZURE_WEBAPP_PUBLISH_PROFILE`.

The JSON store is designed for a single instance. To scale out to more instances, move the store to Azure Table Storage or Cosmos DB.

### Static hosting (guest mode)

- **GitHub Pages:** Settings > Pages > deploy from the `main` branch, root folder.
- **Azure Static Web Apps:** point the app location at the repository root, leave the API and output locations empty, and skip the build.

## Screenshots

![Title with Continue](docs/screenshots/title-continue.png)
![Hero Lab](docs/screenshots/hero-lab.png)
![Female hero on the title screen](docs/screenshots/title-female.png)
![Amsterdam](docs/screenshots/world1.png)
![Amsterdam landmarks](docs/screenshots/amsterdam-landmarks.png)
![Amsterdam pull-up bridge](docs/screenshots/amsterdam-drawbridge.png)
![London Thames](docs/screenshots/london-thames.png)
![London](docs/screenshots/world2.png)
![Paris](docs/screenshots/world3.png)
![Paris secret Metro bonus](docs/screenshots/secret-paris.png)
![Tokyo](docs/screenshots/world4.png)
![Sydney](docs/screenshots/world5.png)
![Venice](docs/screenshots/world6.png)
![Rio](docs/screenshots/world7.png)
![Mexico City](docs/screenshots/world8.png)
![Redmond](docs/screenshots/world9.png)
![Virginia Data Center](docs/screenshots/world10.png)
![Sunrise](docs/screenshots/tod-sunrise.png)
![Night](docs/screenshots/tod-night.png)
![Azure Pipelines bonus zone](docs/screenshots/pipe-zone.png)
![Ransomware charger](docs/screenshots/enemy-ransomware.png)
![DDoS botnet](docs/screenshots/enemy-botnet.png)
![Game over with world rank](docs/screenshots/game-over-rank.png)
![Windmill Titan](docs/screenshots/boss1.png)
![Bearskin Sentinel](docs/screenshots/boss2.png)
![Sumo Shogun](docs/screenshots/boss3.png)
![Boxing Roo](docs/screenshots/boss4.png)
![Carnaval Rei](docs/screenshots/boss5.png)
![CyberGuardian](docs/screenshots/boss6.png)

Read the write-up in [docs/article.md](docs/article.md).
