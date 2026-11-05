# Contributing to Azure Heroes

Contributors from every region are welcome. You can add a local world, improve cloud
challenges, design code-drawn sprites, fix mechanics, write tests or improve accessibility.
You do not need an Azure subscription or player account to develop the game.

## Shared skill framework

Start with [AGENTS.md](AGENTS.md) and
[game-orchestrator](.github/skills/game-orchestrator/SKILL.md).
The orchestrator routes work to the contract, level, region, gameplay, art, music, QA and
security skills. These repository-local skills are shared with the community; no
personal agent configuration or proprietary tool is required to follow them.
In an assistant that supports repository skills, request `game-orchestrator` or select
it from the skills menu. Otherwise follow its checklist manually.

Every new world, boss arena or sub-level must use
[music-producer](.github/skills/music-producer/SKILL.md). Its brief covers regional
influences, an original hook, instrumentation, groove and gameplay/SFX balance.
Actual audio renders and human listening approval are required before calling a
score release-ready; unit tests cannot judge whether music sounds good.

If `game-orchestrator` exists here but is missing from your assistant's skills list,
open **Chat: Open Customizations** in VS Code and check that the workspace skill is
listed and enabled for your agent. Start a new chat after adding skills; if it is
still absent, try **Developer: Reload Window**. In the meantime, ask the assistant
to read [.github/skills/game-orchestrator/SKILL.md](.github/skills/game-orchestrator/SKILL.md)
directly and follow the full workflow. This does not bypass its checks.

1. Open a focused issue or draft PR describing the intended experience and acceptance checks.
   Never publish a suspected vulnerability in a public issue; follow [SECURITY.md](SECURITY.md).
2. Read the applicable skills and locate the city in `worlds/catalogue.js`.
   Start with that city's `worlds/<city>/` files, not a whole-engine read. Local
   metadata/map, scenery, sprites, rewards and music live together. Shared generation
   stays in `levels/`, shared drawing in `art/`, composition in `audio/`, behavior
   and persistence in `systems/`, read-only HUD in `ui/hud.js`, hosting in `server.js`.
3. Evolve the contract first if needed. Prefer optional additions and preserve saves and
   existing level IDs; append worlds rather than inserting them into the progression.
4. Implement the whole experience, including keyboard/touch controls, respawn, scene wiring,
   documentation and tests. Do not copy behavior or draw sprites inline in scene logic.
5. Run `npm test` and `node --check path/to/changed.js`. Start locally with `npm start`,
   then test the changed routes and controls in a browser. Use several generated layouts.
   Keep temporary browser output out of the repository; `.playwright-mcp/` is ignored.
   Add documentation screenshots only when they are current and referenced.
6. Submit a focused PR with the checklist below. A maintainer must review the diff,
   including workflows, skills, tests, network access and any executable additions.

## Prompting the skills

You do not need to know the code to get a good result. Describe the experience you want,
name the skill (or let `game-orchestrator` route it) and say how you will judge success.
The skills fill in structure, art style, security rules and tests.

**Good prompts:**
- state the outcome, not the implementation ("Tokyo should feel busy", not "edit line 531");
- mention anything that must not change ("keep the Paris rooftops");
- say what evidence you want back (tests, screenshots of specific worlds);
- add details only where you care. A city name is enough for a new world: the
  [region-world-generator](.github/skills/region-world-generator/SKILL.md) derives
  landmarks, street life, traffic, local creatures, boss and music itself.

**Example: a new world.**

```text
Use game-orchestrator to add a New York level.
```

New York is now world 11. This illustrates the original creation prompt; when the
city already exists, the assistant should ask what to extend rather than duplicate it.

The assistant should reply with an identity brief before coding, for example:
Azure hosting region `eastus2` (not a New York datacenter); a city map pin and regional
wardrobe rewards; Statue of Liberty, Empire
State and Brooklyn Bridge in the skyline; Times Square billboards, brownstones and a
subway entrance in the street strip; a hot dog cart stand; yellow cabs and an MTA bus;
rats as crawlers and pigeons as flyers (still cloud threats); a new street-fighter boss.
Correct the brief if you want something else, then let it build, test and screenshot.
Add preferences in the same prompt when you have them:

```text
Use game-orchestrator to add a New York level. Run mode, night skyline,
include Coney Island, and make the boss a boxer from Brooklyn.
```

**Other examples:**

| Goal | Prompt |
|------|--------|
| New cloud room | `Use level-builder to add a Key Vault sub-level with its own layout and threats.` |
| New enemy | `Use gameplay-systems and sprite-artist to add a leaked-secret enemy that teaches Key Vault.` |
| Visual polish | `Use sprite-artist: Sydney's beach looks flat, add surf and lifeguard huts. Screenshot level 5.` |
| Regional soundtrack | `Use music-producer to score Tokyo with city-pop harmony and an original hook. Offer only trance, house and pop, and provide listening previews without copying existing songs.` |
| Bug | `Use qa-playtester: I fall through the second boat in Amsterdam. Reproduce, fix and add a test.` |
| Review | `Use game-security to review my branch before I open a PR.` |

If a result misses the mark, give concrete feedback ("the canal houses lost their gables")
rather than starting over; the skills keep what already works.

### Keeping changes small and agent-friendly

- For a city change, read its folder and the relevant shared API first. For example,
  New York scenery work starts in [worlds/new-york/](worlds/new-york/), not every world.
- Change shared rigs/generators only for reusable behavior that existing options
  cannot express. Do not copy a fighter, hero rig, synth or generator into a city.
- City identity and map coordinates belong in `world.js`; local drawing/rewards
  and regional song data belong beside it. Shared playback and saves do not.
- Add a city to the explicit catalogue and script list; append its ID and wardrobe
  rewards without shifting existing saves. Preserve registration and random order.
- Keep modules focused rather than replacing one global monolith with a city monolith.
  Update the same city's tests; integration tests use actual browser script order.
- Follow the [city art registration recipe](.github/skills/sprite-artist/SKILL.md#city-registration-recipe)
  for shared drawing helpers, explicit stage dependencies and append-only rewards.
  Scenery-route registries collect local city parts automatically; rendering factories
  still have explicit calls in the art facade rather than runtime discovery.

## Pull request checklist

- [ ] Scope, affected levels/systems, and relevant skills are identified.
- [ ] Contract, backward compatibility, saves and guest mode are preserved or explicitly covered.
- [ ] New regions have local identity, map position, original code-drawn art and a reachable boss.
- [ ] Mechanics and layout changes have regression tests and browser evidence.
- [ ] New levels use music-producer; regional music, SFX balance, actual renders and human listening approval are documented.
- [ ] Test results distinguish automated smoke checks, assisted bots and unassisted play.
- [ ] No secrets, hidden routes, cheats, account bypasses, obfuscated code or unapproved services.
- [ ] CI/dependency/CDN changes have been reviewed under the security workflow.
- [ ] Documentation and directly affected skills are updated.
- [ ] Remaining gaps are disclosed; no untested behavior is marked PASS.

## Add a skill

Create `.github/skills/<kebab-name>/SKILL.md` with matching `name` and a descriptive
`description` in YAML frontmatter. State when to use it, runtime ownership, ordered
steps, contract invariants and required validation. Link shared rules rather than
duplicating schemas. Register it in the orchestration skill and run `npm test`.
Do not add machine-specific paths, secret-dependent instructions, install hooks or
commands that execute downloaded code.

Skills guide contributors; they do not replace sandboxing, CI or human review.
