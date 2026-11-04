---
name: gameplay-systems
description: Build player movement, enemies, boss, and combat for Azure Heroes 2027. Use for movement, MFA shield, Azure Blast, boss fight.
---

- Work only in systems/.
- Movement: Arrow/WASD, Space jump, double jump, Shift flight boost, F Azure Blast.
- Boss: health bar on top, stunned state after MFA Shield block, 3 attack phases.
- 5 MFA tokens = +1 life. Azure Blast uses Boost meter.
- No level layout changes, use placeholder platforms for testing.
- Accounts and leaderboard: client in `systems/online.js`, server in `server.js` (zero dependencies, Node 18+). Any API change needs a test in `tests/server.test.js` and must keep guest mode (no server) working.
- Resume and save rules are in the game-contract skill. Use `AH.Save.setResume`.
