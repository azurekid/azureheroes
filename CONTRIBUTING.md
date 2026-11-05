# Contributing to Azure Heroes

Contributors from every region are welcome. You can add a local world, improve cloud
challenges, design code-drawn sprites, fix mechanics, write tests or improve accessibility.
You do not need an Azure subscription or player account to develop the game.

## Shared skill framework

Start with [AGENTS.md](AGENTS.md) and
[game-orchestrator](.github/skills/game-orchestrator/SKILL.md).
The orchestrator routes work to the contract, level, region, gameplay, art, QA and
security skills. These repository-local skills are shared with the community; no
personal agent configuration or proprietary tool is required to follow them.
In an assistant that supports repository skills, request `game-orchestrator` or select
it from the skills menu. Otherwise follow its checklist manually.

1. Open a focused issue or draft PR describing the intended experience and acceptance checks.
   Never publish a suspected vulnerability in a public issue; follow [SECURITY.md](SECURITY.md).
2. Read the applicable skills and existing implementation. Keep runtime ownership boundaries:
   level generation in `levels/`, sprites in `art/sprites.js`, behavior in `systems/`,
   read-only HUD in `ui/hud.js`, and account hosting in `server.js`.
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

## Pull request checklist

- [ ] Scope, affected levels/systems, and relevant skills are identified.
- [ ] Contract, backward compatibility, saves and guest mode are preserved or explicitly covered.
- [ ] New regions have local identity, map position, original code-drawn art and a reachable boss.
- [ ] Mechanics and layout changes have regression tests and browser evidence.
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
