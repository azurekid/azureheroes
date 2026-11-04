---
name: gameplay-systems
description: 'Build Azure Heroes player movement, ducking, sliding, low Azure Blast, cloud-threat AI, MFA shield, bosses, save/resume and online accounts.'
---

- Read [game-contract](../game-contract/SKILL.md) and [game-security](../game-security/SKILL.md).
- Runtime gameplay belongs in `systems/`; account hosting belongs in `server.js`. Related tests and docs are in scope. Coordinate art/layout/UI via [game-orchestrator](../game-orchestrator/SKILL.md).
- Movement: Arrow/WASD, Space jump, double jump, Shift flight boost, F Azure Blast.
- Down/S ducks; moving while ducking starts a slide. E shields independently. Keep touch equivalents.
- Shrinking the collision body must preserve feet and physics previous-position deltas.
  Do not stand inside ceilings; verify this with live Arcade physics, not mocks alone.
- Slides hit each low enemy once per slide; low blasts originate near the feet.
- Cloud threats reuse shared AI behaviors without changing the two-hit/one-credit invariant.
  Keep remediation tips educational: fix insecure configuration, do not portray guest access itself as malicious.
- Boss: health bar on top, stunned state after MFA Shield block, 3 attack phases.
- 5 MFA tokens = +1 life. Azure Blast uses Boost meter.
- No level layout changes, use placeholder platforms for testing.
- Accounts and leaderboard: client in `systems/online.js`, server in `server.js` (zero dependencies, Node 18+). Any API change needs a test in `tests/server.test.js` and must keep guest mode (no server) working.
- Resume and save rules are in the game-contract skill. Use `AH.Save.setResume`.
