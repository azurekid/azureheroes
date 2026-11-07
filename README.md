# Microsoft Azure Heroes 2027

A 16-bit synthwave side-scrolling adventure built with **Phaser 3** (loaded from a CDN), plain HTML, CSS and JavaScript. There is no build step and no runtime image or audio assets: every sprite and background is drawn in code and every sound is synthesised with the Web Audio API.

The game runs in guest mode as a static site without a game server, but needs an internet connection to load Phaser from the CDN. When it is hosted with the small Node.js server in `server.js` (for example on Azure App Service), players can also register, sync their progress and compete on a global high score dashboard.

![Title screen](docs/screenshots/title.png)

## Play

Open `index.html` in a browser (an internet connection is needed for the Phaser CDN). This is guest mode: progress is saved in `localStorage`.

To play with accounts and the high score dashboard, run the server (Node.js 18 or later, no dependencies):

```bash
npm start            # http://localhost:8080 (PORT and DATA_DIR env vars are optional)
npm test             # gameplay, skills, security boundaries and API tests
```

## World map

Levels are picked on an **Azure world map**. Each pin is an Azure region. Cleared pins get a green tick and are joined by gold flight routes, and a plane flies the latest leg. Select a pin with the arrow keys or a tap, then press Enter or tap it again to deploy.

The game remembers where you left off. **C: Continue** on the title screen or map resumes the level you were playing, also after a game over (the score then restarts at zero so the high score table stays fair). Clearing a world chooses a **random uncleared world**, without repeats until all eleven are cleared. Continue saves that exact destination with your score and lives. Previously opened worlds remain replayable; existing saves keep their clears and access.

At each level's start a locally dressed guide explains the deployment key, relay,
two hidden gems and three enemy-carried boss tokens. Press **Enter / Space** or
tap **BEGIN MISSION** to start; the timer and physics wait. Review these tasks
with **Pause > MISSION** without resetting your progress.
**R**, **P** or **Esc** resumes a paused level without resetting position, missions or score.
In flying levels, **Left/A** turns you to shoot backward at birds behind you;
**Right/D** turns you forward again. Touch direction buttons work the same way.
Hold **E / SHIELD** to block front-facing attacks in flight as well as on foot.
Shielding cancels charging and disables Boost until released.
On foot, **J / PUNCH** and **K / KICK** add close-range attacks alongside blasts;
moving while holding Down/S slides into an open boss. Armor still blocks all
damage: bait a missed attack or shield-block attacks, then punish the green OPEN window.

![World map](docs/screenshots/world-map.png)

## Levels

| Level | Azure region | World | Boss | Mode |
|-------|--------------|-------|------|------|
| 1 | `westeurope` | Amsterdam Canal Run: blue/white trams, yellow trains, glass-roof canal cruises, Centraal Station, canal houses, Schiphol, Microsoft HQ | De Kraker: Access Broker (Muay Thai) | Run |
| 2 | `uksouth` | London Thames Run: Big Ben, Tower Bridge, an Underground sub-level, Stonehenge, Edinburgh, Glenfinnan, a secret phone box | The Phishing Kingpin (bare-knuckle) | Run |
| 3 | `francecentral` | Paris Seine Run: Eiffel Tower, Sacre-Coeur, Moulin Rouge, zinc rooftops, bakeries, bateaux-mouches, Louvre, Mont-Saint-Michel, a Metro sub-level and a ghost station | Madame Savate: Spoofer | Run |
| 4 | `japaneast` | Tokyo Skyway Pursuit: Ginza Line metro, Shibuya crowds, billboard streets, sakura, Mount Fuji, Tokyo Tower, Shinkansen | Ronin Rootkit (hovering) | Flight |
| 5 | `australiaeast` | Sydney Harbour Run: Sydney beach/surf, outback roadhouses and expedition 4x4s, Uluru, Opera House, Harbour Bridge, Twelve Apostles | The Botnet Brawler | Run |
| 6 | `italynorth` | Venice Lagoon Run: Rialto, St Mark's, gondolas, Colosseum, Leaning Tower of Pisa, a Trevi portal | Maximus the Ransomer | Run |
| 7 | `brazilsouth` | Rio Sugarloaf Pursuit: Christ the Redeemer, Sugarloaf, Brasilia, Iguazu | Capoeira Cryptojacker (hovering) | Flight |
| 8 | `mexicocentral` | Mexico City Skyway: Teotihuacan, Chichen Itza, Angel of Independence, hot air balloons | El Luchador Zero-Day (hovering) | Flight |
| 9 | `westus2` | Redmond Campus Lake Run: Microsoft campus, Pike Place Market, Starbucks, Link light rail, Space Needle, Mt Rainier, an Xbox bonus door | The DDoS Enforcer | Run |
| 10 | `eastus` | Virginia Data Center: Capitol, Washington Monument, hack terminals, Sec Gates | High-Risk CyberGuardian | Data center |
| 11 | `eastus2` | New York Hudson Run: Statue of Liberty, Empire State, Chrysler Building, Brooklyn Bridge, Times Square, brownstones, hot dog carts, yellow cabs, rats and pigeons | Zero Day Boxer | Run |

New York uses East US 2 as its Azure hosting-region mapping; this does not imply a
New York datacenter. Its map pin marks the city, with an offset to keep Virginia tappable.
Stronger sewer steam rises from street grates. Orange HOT plates warn for two
seconds before a three-second hot phase: the narrow plume core deals 8 damage,
even through Shield. Wait for cooldown or jump over it; spawn, mission items and
pipe returns stay safe. The secret manhole's steam is decorative. Steam freezes
when paused and disappears indoors or during boss fights.

Tokyo adds distant skyscrapers, neon Japanese signs, vending machines, narrow
storefront alleys, overhead wires, umbrella pedestrians and painted wet-street
reflections, while retaining its flight route. Amsterdam has rainy/overcast
stretches with wet roads and platform tops, separated by dry stretches. These
local code-drawn effects use layered parallax and additive light, not shaders;
landmarks, collision geometry and regional music stay unchanged.

Levels are generated at random each time a level starts, so platforms, lasers, enemies, coins, power-ups and MFA tokens land in new places on every run. Run levels mix gaps, steps up, drops and floating platforms at different heights, and every region has its own coins, enemy skins, scenery props, traffic, birds and sky objects (planes, balloons, blimps, helicopters). Outdoor worlds start at a random time of day, then smoothly cycle through night, sunrise, morning, day, afternoon and sunset every four minutes of active outdoor play. Pause/help, warps and underground visits freeze the outdoor clock; Virginia's data center keeps its indoor lighting.

Every region also has cyber-threat enemies: **Phishing hoppers** leap at you, **Ransomware chargers** wind up and dash, and **DDoS botnet clouds** follow you and drop bombs. Street and data-center levels also feature pipeline bugs, vulnerable container images, overprivileged RBAC robots, exposed-endpoint turrets, armed guest/stale-user shooters and **Rogue Hackers** who fire from handheld terminals. Their bolts can be blocked with the MFA Shield. Defeating them reveals tips about GitHub Actions, Defender for Cloud, Entra MFA and access reviews, least privilege and Azure Private Link.

### Missions and hidden Azure gems

Running to the finish is no longer enough. Each world has two required tasks:
recover its **deployment key**, then **secure the relay**. On ground, stay near the
relay and hold **E / SHIELD** for 1.5 seconds; in flight, hit it with a blast
after recovering the key. Collect **any two of six gems** and **three boss-access
tokens** dropped by clearly marked **TOKEN CARRIER** enemies to unlock the boss.
Every carrier guarantees its token; drops stay at safe marked collection points,
not down a pit. Ordinary enemies still drop their Azure Credit.
The HUD shows counts and the next task's direction; the arena entrance shows
whether access is locked. Extra gems and optional **duck-to-scan** caches award
bonus score. Watch for glints on side routes and in underground rooms.

Completed tasks, released tokens and collected gems/tokens survive losing a life, but restart/new layouts
reset them. They are run-local and do not change accounts or saved unlocks.
Flight scrolling waits before missed required objectives, needed gems and tokens; you
still need to steer, fight and finish before the timer expires. Underground
bonus gems are never the only way to satisfy the quota.

### Streets, water and secrets

**Checkpoints:** look for a flag and a friendly city guide standing on the path.
The marker turns green with **CHECKPOINT ACTIVE** when reached. Stand nearby to
read short Azure, Entra, Defender or Microsoft 365 tips; walk away to dismiss them.
Guides are non-solid and require no extra button. Checkpoints restore your
position after life loss, not an online save.

Run levels are not just rooftops. The ground matches the city: canal quays and brick bridges in Amsterdam, the Thames embankment promenade in London and harbour piers in Sydney. Fall in the water and you lose a life. Canal boats and ferries carry you across. Amsterdam's pull-up bridges lift on a timer, so watch for the flashing warning before you cross.

- **Azure Bike** (Amsterdam, London): run into it to ride. It doubles your running speed (about 360 instead of 190 px/s, with a speed trail and wider look-ahead) and rams enemies, but one hit knocks you off.
- **Secret phone box** (London): stand inside for a moment to warp to a bonus room full of credits.
- **Shooting enemies**: some walkers fire bolts back at you. Streets have denser patrols, including low cloud threats that can be slide-attacked or blasted while ducking.
- **Vertical routes**: taller steps, deeper drops and more upper walkways reward jumping between street and rooftop routes. Pipe entrances and returns are reserved before hazards are placed.
- **Amsterdam street life**: blue/white articulated trams, moving yellow commuter trains and glass-roof canal cruises join Hollandse Haring stands and bicycles. Centraal and a canal-cruise vista are guaranteed scenic stops.
- **Tokyo street life**: moving silver/orange metro trains on elevated tracks, a Shibuya station, denser road traffic, pedestrian crossings and Azure/Copilot/GitHub/Xbox billboards. Detailed sakura groves and falling petals accompany the existing flight controls; the metro is scenery, not a ground-mode room.
- **Australian coast and outback**: Bondi's ocean, surf club and curved beach,
  red-earth roadhouses and Uluru become full-viewport environment stretches, with
  smooth transitions back to Sydney Harbour rather than floating scenery cards.
  City strips and decorative traffic fade away inside these sections. Playable
  piers, ferries, gaps, vehicles, enemies and objectives remain unchanged.
- **Continuous lighting**: outdoor skies, background colours and illumination
  blend through a four-minute day/night cycle. Add `?tod=day` (or `night`,
  `sunrise`, `morning`, `afternoon`, `sunset`) to choose the starting phase for
  testing; the cycle still runs. Pause/help and indoor visits preserve its phase.
- **Paris street life**: boulangerie stalls on the quays, Haussmann zinc rooftops, bateaux-mouches on the Seine and Guimard Metro entrances. The Eiffel Tower, Sacre-Coeur and Moulin Rouge appear more often than other local landmarks.
- **Painted 2.5D throughout**: all eleven worlds use grounded foundations,
  shaded architectural returns and receding terrain, keeping their local identity:
  Dutch gables, Parisian zinc roofs, Tokyo streets, coastal scenery and datacenter
  aisles. All eight underground themes and the cloud, retro, Xbox and New York
  sewer secrets also have dimensional platforms and interior or terrain planes.
  New York retains tall skyscrapers and angled Times Square billboards.
  This is visual depth, not a new movement mode: scenery widths/routes, collision,
  combat and objectives are unchanged. No new engine, models or dependencies.
- **No repeats**: a scenery strip of local landmarks and Microsoft billboards scrolls behind the street. The same landmark never shows twice on screen.
- **Landmarks first**: decorative roads, slim rail decks, trains and trams sit behind
  the landmark strip, with more space between arrivals. Facades and signs stay
  unobstructed; rideable bikes, solid vehicles and platform heights are unchanged.

Microsoft touches: the Microsoft logo in the HUD and title, Microsoft HQ and Azure/Copilot/Xbox signs in the scenery, a Bliss-style hill, a Blue Screen game over and an Azure portal "Deployment succeeded" level-complete panel.

Every level ends in a street-fighter style showdown with that region's boss: a cyber-criminal fighter who faces you, walks in and out of range and mixes thrown projectiles with three-hit combos, jump kicks, anti-air uppercuts and a round 3 super move. The fight runs in three ROUNDs (one per third of health) and ends in a K.O. Bosses attack faster as their health drops; every move has a readable windup and an on-screen cue. **A missed combo, jump kick or uppercut leaves the boss off balance: WHIFF / OPEN means punish it.** **Red health bar / ARMORED means shots cannot damage the boss. Green bar, target brackets and OPEN countdown mean fire now.** Ground bosses open after you block two shots, two combo strikes or a charge with the MFA Shield. Jump or dodge a charge and the boss slams into the arena wall, dazed for over three seconds. All bosses overheat after three attacks, so there is always a damage opportunity. Hovering bosses must be dodged. Old bullets clear when the damage window opens. The exit opens when the boss is down. Losing a life restores defeated enemies, except those close to the checkpoint.

### Power-ups

| Orb | Effect |
|-----|--------|
| Copilot | A sidekick auto-fires Azure Blasts at nearby enemies for 12 s |
| Defender | Invincible for 8 s |
| GitHub Actions | Turbo speed for 9 s |
| Power BI | Coin magnet and double score for 12 s |
| Teams | Instant +30 health |
| Event Grid Spread | Replaces the blaster for 25 s: three fan shots, five when charged |
| Cosmos Beam | Replaces the blaster for 25 s: pierces three enemies, five when charged; stops at walls |

**Tap F and release for a quick shot; hold F up to 1.2 seconds, then release for a stronger shot.**
Quick shots have a **0.10-second cooldown**; full-charge cooldown is 0.30 seconds.
Holding fire still charges for 1.2 seconds, rather than auto-firing. Projectile speed
and Boost costs are unchanged. Four additional spread/beam pickups are distributed
along each main route; weapons still expire after 25 seconds.

Amsterdam, London and New York include six/seven-step cloud climbs with an MFA
token and a required token carrier at the summit. Follow the CLOUD TOKENS sign;
the camera follows upward and you can descend the same platforms. These existing
worlds retain their regional music. Fallen unfinished carriers return to their
posts instead of permanently removing a boss requirement. Trench-coated snooping
detectives reuse rogue-shooter behavior.

Every world has localized spray tags alongside AZUREKID, AZURE HEROES, Octocats
and Copilot figures in bubble, stencil and angular wildstyle lettering. Their
positions and later-wall selection vary with generated layouts without changing
gameplay randomness. Compact street tags sit above the HUD and fit narrower
walls without cropping. Tokyo uses a small code-drawn Japanese graffiti glyph set, separate from the
UI font; Mexico City uses Spanish, Rio Brazilian Portuguese and Paris French.
The other worlds use local phrases and palettes. Ground/room fronts carry painted
decals; flight routes have non-solid wall panels between rock columns. Regional
near-building layers add depth behind landmark facades, keeping Centraal Station,
Erasmus Bridge and other highlights visible. New York retains its authored art.

Stale users and unreviewed guests are now the same size as rogue hackers. Stale
users carry long energy rifles; guests carry compact energy pistols. Both patrol
and fire shield-blockable bolts. They are tall targets: blast, shield or stomp them
instead of relying on a low slide attack. Worms and bugs retain their low silhouettes.
The touch BLAST button works the same way. The HUD shows the weapon, remaining pickup
time and charge; a glowing muzzle signals charge readiness. Charged Azure/Cosmos shots
deal up to three normal hits and use up to 20 extra Boost. Spread pellets each deal one
hit. A new weapon pickup replaces the previous one; expiry or respawn restores Azure
Blast. Shielding with E, taking damage, pausing, opening Help or warping cancels a held charge. Hold Down and F to charge a low shot: pressing F lowers the crouch guard.
Every world offers both weapon pickups, including flight and data-center levels.

Clippy warns you when health is low, and Xbox-style achievements pop up for firsts. Open the **Hero Lab** on the title screen with **E** to choose a male or female hero, skin tone, hair style, hair colour and suit colour, plus **local wardrobe** from the game's regions: a Texas cowboy hat, Mexican sombrero, London bowler, Paris beret, Dutch King's Day crown, Japanese hachimaki, Australian cork hat, Venetian gondolier hat, Rio carnaval plumes, a Redmond Azure cap, a Virginia tricorn or a hijab (its scarf colour is set on the colour row), and extras such as Dutch wooden clogs, a football scarf, a serape, a flower garland or a bandana. The choice is saved and shows in every pose, including flight.

The game renders at 1280x720 (`AH.VIEW_SCALE = 2`) while game logic stays at 640x360, so the hero, HUD and text stay sharp. The Hero Lab and title screen use a high-detail hero portrait.

**Regional wardrobe.** Find separate outfit, hairstyle, local-hat and artefact
caches in the matching world's secrets/sub-levels. Flight worlds and
Virginia's datacenter, which have no underground rooms, use hidden side-route
stashes instead. Clearing a world alone no longer grants its clothes. Pickups
permanently unlock that item in Hero Lab, locally and in signed-in cloud progress.
Locked items can be previewed, but not saved or randomly equipped.
Existing players retain their previously earned outfits and formerly free local
hats/artefacts, **except the New York cap, cork hat and cowboy hat: these always
require collection**, including on legacy saves. Find the New York cap in New York,
the cork hat in Sydney, and the shared cowboy hat in any US world: Redmond,
Virginia or New York. Virginia uses side-route stashes; the other two use secrets.
Afro, braids, curls, coils and waves (including Borough Waves) are **available
from the start**, without regional requirements. Religious headwear such as the
**hijab is always available**.
Checkpoint helpers wear the local outfit and headwear without requiring collection.
The **Cowboy** (denim western shirt,
leather vest, sheriff star, buckle), **India Kurta** (long kurta under a Nehru
jacket) and **Cloud Hacker** (capeless, with the Rogue Hacker's hood, red visor,
dark zip hoodie and portable terminal) outfits are open from the start. Cloud
Hacker has the normal abilities; choose `NONE` on the headwear row for its hood,
which hides the selected hair, or choose a hat or hijab to wear that instead.

**Hacker Mode (formerly Gold Mode, easter egg).** On the title screen type Up, Up, Down, Down, Left,
Right, Left, Right, A. You get access to every world, the Cloud Hacker outfit and 30 lives
for that browser session. Worlds are not marked cleared and wardrobe rewards
are not unlocked.
Hacker runs are a sandbox: their scores are never submitted to the leaderboard and
run progress is not saved (no bests, wardrobe collection, unlocks or continue point).
This changes the appearance, not account permissions or invulnerability. General device
preferences, such as music style, remain separate. Reload the page to leave Hacker Mode.

| Collection region | Outfit | Hairstyle (textured base styles are always open) | Accessory |
|---|---|---|---|
| Amsterdam | Canal Jacket | Canal Braid | Tulip Pin |
| London | Formal Coat | Tailored Part | Pocket Watch |
| Paris | Breton Top | Seine Waves | Silk Neckerchief |
| Tokyo | Kimono | Tidy Bun | Obi Cord |
| Sydney | Reef Vest | Surf Crop | Shell Pendant |
| Venice | Gondolier | Lagoon Sweep | Lagoon Ribbon |
| Rio | Rio Tracksuit | Rio Curls | Sport Wristbands |
| Mexico City | Charro Jacket | Ribbon Braid | Silver Bow |
| Redmond | Campus Hoodie | Campus Undercut | Campus Satchel |
| Virginia | Trail Coat | Crown Coils | Trail Compass |
| New York | City Varsity | Borough Waves | Messenger Bag |

**Know your threat.** Every enemy carries a nameplate coloured by category: red = malware, orange = network, pink = identity, yellow = DevOps. Press **H** for the Hero Handbook, which lists every threat and how to beat it.

Street levels have two warp pipes into different randomly selected **cloud challenges**. Press Down (or stand still) on a pipe to enter; its label names the destination. Each underground room is 3,200-3,840 pixels long with five shuffled sections, at least ten enemies, upper rewards, an MFA token and weapon/support pickups:

| Challenge | Route and mission |
|-----------|-------------------|
| Azure Pipelines | Build, test, scan, approve and deploy through steps and timed lasers; fix pipeline bugs. |
| AKS Container Cluster | Climb node pools and pods; clear RBAC issues and exposed ingress. |
| GitHub Actions | Follow upper runner platforms over lasers; review guest identities before release. |
| Docker Image Dock | Climb container stacks, patch unsafe images and ship through Azure Container Registry to Container Apps. |
| Entra Access Vault | Navigate an identity vault, verify identities, review access and apply least privilege. |
| Azure Functions Reactor | Route events through a reactor, secure triggers and bindings, and monitor workloads. |
| Paris Metro - Ligne 14 (Paris only) | Ride through tiled stations with passing trains; route traffic with Front Door, WAF, DDoS Protection and Private Endpoints. |
| London Underground (London only) | Deep Tube tunnels, red roundels, red/white/blue trains, tiled stations, route maps and MIND THE GAP platforms; secure identities and private network routes. |

Rooms shuffle seven distinct layout types: steps, catwalks, ducts, split-level routes,
security-laser crossings, encounter arenas and switchbacks. Bay widths, lesson order,
threats and rewards vary, and layouts do not repeat within a room. Duck or slide under
ducts, or jump onto their roofs. Each room grants extra time once on entry. The exit
pipe returns you farther along the street and sets a checkpoint.

Docker and AKS rooms are shipping-container docks with corrugated cargo stacks,
locking bars, cranes, harbour water and work lights. GitHub Actions and Azure
Pipelines use industrial runner workshops with assembly arms, conveyors and
workstations. Entra adds circular vault doors, identity cabinets and access circuits;
Functions adds reactor cores, trigger conduits and event-processing machinery.
Layered scenery and three background variations give the rooms depth.
Paris always opens the Metro behind its first pipe (a Guimard entrance); London
always opens the Underground (a red-roundel entrance). Their second pipes use
shared themes. Regional rooms never appear in other countries.

### Testing a specific world or challenge

For normal play, select its region on the world map (world IDs are in the table
above). For development, run `npm start` and use a separate browser guest profile:
starting a level updates local resume progress. Do not sign in or submit test scores.
After changing art, hard-refresh the browser: the local server caches static assets
for up to an hour.

After the title screen loads, open the browser developer console:

```js
console.table(AH.Levels.worlds.map(({ id, city }) => ({ id, city })));
const active = AHGame.scene.getScenes(true)[0];
active.scene.start('Level', { id: 1 }); // Amsterdam; replace 1 with any world ID
```

New York is world **11**: use `{ id: 11 }` in the snippet above. In normal
progression it can be your selected sign-up start or a random next destination.
Check the skyline at entry, Times Square
and the brownstones' iron fire escapes, Central Park's lake and Bow Bridge,
both pipe rooms, hot dog carts and the Zero Day Boxer arena. The marked manhole
replaces the phone-booth secret: stand on it to enter a 1,280px sewer with rat
patrols, maintenance ledges and rewards. Crouch/slide and use low blasts; stand
at the far manhole to return to the same street. The optional sewer uses New York's
regional underground music, not the Windows-style cloud bonus.
Press R for a fresh layout; N switches the music style.

Once the level appears, inspect its two randomly selected pipe destinations:

```js
const level = AHGame.scene.getScene('Level');
console.table(level.L.pipeZones.map(({ theme, name }) => ({ theme, name })));
const room = level.L.pipeZones.find(z => z.theme === 'docker');
if (room) level.warpPipe(
  level.player.x, level.player.y, room.entry.x, room.entry.y,
  [room.x, room.w], room
);
```

Theme names are `docker`, `aks`, `actions`, `pipelines`, `entra`, `functions`, and
`metro` (Paris, `{ id: 3 }`, first pipe), and `tube` (London, `{ id: 2 }`, first pipe). If the desired theme is
absent, press R to regenerate the world, then rerun the room snippet. Flight worlds
and Virginia have no pipe rooms. Use the actual exit pipe to check the return.
Append `?touch=1` to the local URL to check the touch layout; this does not replace
real-device testing. These are developer-console calls to existing scene APIs;
no diagnostic routes or cheats are added to the shipped game.

For the new scenery, test Amsterdam **1**, Tokyo **4** and Sydney **5**. Transit
starts on entry and continues during play. Tokyo keeps flight controls.
Australia's beach opens the scenic route; outback and Uluru appear farther along,
then the coast returns. `AH.Art.sceneryRoutes[level.L.region]` lists the guaranteed
stops as `[fractionOfSceneryStrip, textureKey, optionalBaseY]`; they are not collision platforms.

To find a Rogue Hacker, start a street world or Virginia (`{ id: 10 }`) and use
`console.table(AHGame.scene.getScene('Level').L.enemies.filter(e => e.type === 'hacker'))`
after the level loads. Virginia always has one in its first section; their exact
positions vary.

To hear a specific track, run `AH.Audio.music('metro')` (see Music below).

To inspect a world's boss approach, start the world as above, then run
`const L = AHGame.scene.getScene('Level'); L.player.sprite.body.reset(L.L.boss.trigger + 30, 200);`
(flight worlds: `L.startBoss()`). Boss access still requires both mission objectives
and two gems; teleporting does not complete them. Once unlocked, step back from a combo, move away from a jump kick
or stay on the ground under an uppercut: the boss should show WHIFF / OPEN and take hits.

Collect 5 MFA tokens for an extra life. Every enemy takes 2 hits and drops an Azure Credit. Best score, unlocked levels and the resume point are stored in `localStorage`, and synced to your account when you are logged in.

## Music

Press **N** or tap the **MUSIC** button to cycle **Trance → House → Pop →
Night Drive → Soft Skies → Trance**. Night Drive is a new 134 BPM House song
with a syncopated hook and a contrasting response; Soft Skies is a separate
108 BPM lounge tune with spacious keys and sparse percussion. They have original
melodies, not just different instruments playing the same notes.
Named songs continue across worlds, rooms and bosses until you select another
option; selecting a genre restores the region's contextual soundtrack.

Choose music using the
**MUSIC** button on the title screen, world map, Hero Lab, leaderboard, or during a
level (including pause). The button shows the current style and cycles through the
choices, including the named song. The selection is saved on this device only, separately from game progress;
it is not synced to an online account. If browser storage is unavailable, the
selection lasts for the current session.

The original soundtrack is synthesised locally with Web Audio; no audio files are
downloaded. **Trance** is the default: melodic arpeggios, builds and drops.
**House** uses warm keys, four-on-the-floor grooves and offbeat bass, with
faster street/boss beats and quieter lounge arrangements for menus and rooms.
**Pop** uses
original repeated hooks, verse/chorus contrast and a straight backbeat.
All 11 cities retain local motifs through streets, underground rooms and boss
fights. We no longer offer simulated rock, jazz, blues or country.
Previously saved removed styles reset safely to trance; game progress is unchanged.
Hooks are recognizable as recurring themes within the game, not copies of
commercial songs or recordings.

| Track | Where |
|-------|-------|
| `title` | Title screen and world map |
| `main` | World-specific electronic arrangements and original local motifs |
| `pipe` | Cloud challenge rooms |
| `metro` | Paris Metro and London Underground |
| `bonus` | Secret bonus rooms |
| `boss` | Boss arenas |

`AH.Audio.music(kind, region)` starts the selected style's track; calling it again
with the same track does not restart it, and `music(null)` stops. For debugging,
`AH.Audio.setStyle('pop')` switches styles without changing the current context.
M mutes both music and effects.

To compare a city's music without unlocking its level, use the browser console:

```js
AH.Audio.init();
AH.Audio.setStyle('pop'); // also trance, house
AH.Audio.music('main', 'francecentral'); // Paris; use pipe or boss for its other arrangements
```

### Audio quality checks and previews

Every new level follows [music-producer](.github/skills/music-producer/SKILL.md).
The workflow requires real audio rendering and human listening approval; automated
measurements alone do not certify artistic quality.

With `npm start` running, the optional dependency-free Chrome renderer produces
WAV previews of a full loop plus its return, with coin/blast/hit cues mixed in:

```bash
# Requires Node 22+ and Chrome, not required for normal play or npm test.
node tests/render-audio.js /tmp/azureheroes-audio
# Optional individual style/city/context:
node tests/render-audio.js /tmp/azureheroes-audio pop_new-york_main
```

Set `CHROME_BIN` if Chrome is not at its usual macOS path or available as
`google-chrome`; set `PORT` to match your local server. Output contains WAV files
and a measurement report (peak, RMS, DC, continuity and finite samples).
The default renders all nine New York style/context combinations. Keys use
`{trance|house|pop}_{city-slug}_{main|pipe|boss}`.
Audition on headphones and speakers before approving a score; mobile/browser
listening and musical taste remain human checks.

## Controls

| Action | Keyboard | Touch |
|--------|----------|-------|
| Move | Arrow keys / WASD | Left / Right buttons |
| Jump / Double jump | Space (double-tap for double jump), Up, W | Jump button |
| Wall slide / Wall jump | In the air, hold toward a wall to slide; press Jump to kick off (repeat to climb) | Direction + Jump |
| Quick shot / charged shot (also destroys enemy bullets) | Tap F / hold F then release | Tap / hold BLAST then release |
| Flight Boost | Shift | - |
| Duck / Slide attack | S or Down; hold while moving to slide | Duck + direction |
| Low Azure Blast | F while ducking | Duck + Blast |
| MFA Shield (blocks shots and boss hits from the front, works in the air) | E | Shield button |
| Crouch guard (low shield) | Down / S while standing still | Duck button |
| Pause / Resume / Restart / Mute | P or Esc / R while paused / R during play / M | Pause button; Resume in menu |
| Change music style | N | MUSIC button |
| Help (Hero Handbook) | H (title and in game) | HELP button |
| Quit to title | Q, or QUIT in the pause menu | Pause > QUIT |
| Enter pipe | Down on a pipe | Stand still on the pipe |
| Continue / High scores / Log in | C / B / L (title and map) | Tap the menu item |
| Hero Lab | E (title) | Tap the hero |

Add `?touch=1` to the URL to force the touch controls on a desktop browser.

## Project layout

The layout follows the project skills in `.github/skills/`.

```
index.html          entry point, Phaser config, account form, script order
worlds/catalogue.js stable city order (world IDs and saved progression)
worlds/<city>/     metadata/map, scenery, local sprites, wardrobe rewards and music
art/               shared canvas tools, hero/fighter rigs, common assets and font
audio/             music composition, shared arrangements and synth tools
ui/hud.js           read-only HUD
levels/             shared run/flight/data-center and challenge generators
levels/worlds.js    small AH.Levels facade over city definitions
systems/            playback, save, online accounts, input, player, enemies, boss, scenes
server.js           optional Node.js server: static files + accounts + leaderboard API
tests/              API and gameplay regression tests (npm test), plus the QA report
docs/               article and screenshots
```

For city-only changes, start in its folder (for example
[New York](worlds/new-york/)) and read shared APIs only as needed. City content
registers through an explicit, ordered script list; there is no runtime directory
scan, code download, bundler or build step. Drawing stays outside gameplay scenes.
Texture names, world IDs, saved wardrobe indexes and generation behavior remain stable.

Each city folder uses the same filenames:

| File | Owns |
|---|---|
| `world.js` | identity, Azure region, map position, generator options |
| `scenery.js` | panorama, landmarks, street architecture |
| `sprites.js` | local enemies and fighter appearance |
| `art.js` | local props, transit, stands and regional room drawing |
| `rewards.js` | local wardrobe reward data/drawing |
| `music.js` | regional electronic descriptor, original theme, palette and groove |

Empty city-specific extensions stay small; do not copy shared implementations just
to fill a file. Rendering helpers, hero/fighter rigs and room generators stay reusable.
The larger scene coordinator remains in `systems/scenes.js`; city content should not
be added there.

## Community development

Start with [CONTRIBUTING.md](CONTRIBUTING.md) and the shared
[game-orchestrator skill](.github/skills/game-orchestrator/SKILL.md). It coordinates
contract-first changes across level design, regions, gameplay, art, QA and security.
All skills are repository-local and can also be followed manually.

[AGENTS.md](AGENTS.md) defines architecture and contribution boundaries.
[SECURITY.md](SECURITY.md) covers private reporting, backdoor prevention and the GitHub
protections maintainers must enable. PR CI checks tests, skill metadata/links and
security-sensitive hosting/workflow invariants; skills alone cannot guarantee security.

## High scores and accounts

Press **L** on the title screen to register or log in with a hero name (3-15 letters or digits), a password and a location shown on the dashboard. At registration, choose the closest of the **eleven represented Azure regions** as your starting world; no geolocation or location lookup is performed. This is a game-world mapping, not a claim that every landmark has a datacenter. Progress (individual opened/cleared worlds, best scores, collected wardrobe and resume point) syncs to the account, so you can continue on another device. Existing progress is preserved. Press **B** for the dashboard with rank, player name, location, best score and furthest level.

Accounts only appear when the page is served by `server.js`. On a static host the game quietly stays in guest mode.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Detects online mode |
| GET | `/api/leaderboard?limit=20` | Top scores |
| POST | `/api/register` | `{ name, password, location, startLevel, progress }` returns a token; optional `startLevel` must be a represented world ID (1-11) |
| POST | `/api/login` | `{ name, password }` returns a token and the profile |
| GET | `/api/me` | Current profile (requires a Bearer token) |
| POST | `/api/logout` | Revokes the token |
| PUT | `/api/progress` | Merges saved progress, including `route: {start, available: [id], cleared: [id]}` and wardrobe; access/clears never go backwards and registration start is immutable |
| POST | `/api/score` | `{ score, level, city }` returns best and rank |

Passwords are hashed with salted scrypt, tokens are random, stored as SHA-256 hashes and expire after 30 days. Requests are rate limited, input is validated and only the game files are served. Data is stored in `DATA_DIR/heroes.json`.

## Deploy

### Azure App Service (accounts + leaderboard)

Follow the [Azure Web App deployment guide](docs/deployment-azure-web-app.md)
for resource setup, persistent storage, GitHub credentials/approvals, manual ZIP
deployment, smoke tests, backups, rollback and troubleshooting.

Use a **Linux Node 22 LTS Web App**, one instance and one Node process, with
`DATA_DIR=/home/data` for the **legacy JSON-backed server only**. The existing
[deployment workflow](.github/workflows/azure-app-service.yml) runs tests before
publishing the complete game. It requires `AZURE_WEBAPP_NAME`, a protected
`production` environment and `AZURE_WEBAPP_PUBLISH_PROFILE`.

The in-memory JSON store is not safe for scale-out or overlapping writers.
Persistent storage is not a backup. Before adding instances, workers or deployment
slots sharing data, migrate to a concurrency-safe database.

**New infrastructure:** [infra/main.bicep](infra/main.bicep) creates a new Web App,
managed identity and private Azure Table Storage for accounts, sessions, progress
and leaderboard entries. No storage keys or Key Vault are needed. **The server
adapter and data migration are not implemented:** the app is stopped by default.
The templates disable SCM basic authentication, so the existing publish-profile
workflow must be replaced with a reviewed OIDC deployment before use with this
app. See the [integration gates](docs/deployment-azure-web-app.md#server-integration-and-migration-required-before-enabling-accounts).

### Static hosting (guest mode)

- **GitHub Pages:** Settings > Pages > deploy from the `main` branch, root folder.
- **Azure Static Web Apps:** point the app location at the repository root, leave the API and output locations empty, and skip the build.

## Screenshots

These guest-mode captures show a selection of worlds and challenges; generated
layouts vary. Some rooms were entered using the documented developer-console
teleport rather than a full playthrough.

![Hero Lab with the Cloud Hacker outfit](docs/screenshots/hero-lab.png)
![Amsterdam Canal Run](docs/screenshots/world1.png)
![Tokyo Skyway Pursuit](docs/screenshots/world4.png)
![Sydney Harbour Run](docs/screenshots/world5.png)
![GitHub Actions challenge](docs/screenshots/cloud-actions.png)
![Docker Image Dock challenge](docs/screenshots/cloud-docker.png)
![London Underground challenge](docs/screenshots/london-underground.png)
![Paris Metro challenge](docs/screenshots/paris-metro.png)

Read the write-up in [docs/article.md](docs/article.md).
