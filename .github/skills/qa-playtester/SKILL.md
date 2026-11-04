---
name: qa-playtester
description: 'Verify Azure Heroes controls, procedural reachability, cloud rooms, duck/slide combat, saves, online behavior and security regressions. Use after any level, system or community skill change.'
---

- Read [game-contract](../game-contract/SKILL.md) and [game-security](../game-security/SKILL.md).
- Verification may add/update automated tests in `tests/` and evidence in `tests/playtest.md`.
  Do not change runtime code during the QA step; hand failures to the owning implementation step and retest.
- Test: start screen, all controls, jump reach, enemy hits, coin collection, checkpoint, boss, game over, restart, mobile touch buttons.
- Report each bug as: Level, Steps, Expected, Actual, File suspected.
- Mark PASS / FAIL per level, do not mark the game done if one level fails.
- Also test: world map (select, deploy, cleared routes), Continue after game over and after a clear, Hero Lab, warp pipes, secret rooms, and with `npm start`: register, login, score posting and the leaderboard. Run `npm test` for the API.
- Use one browser process per level in headless runs. Starting two levels on one page stalls the harness, not the game.
- Test Down/S duck versus E shield, low shots, once-per-slide damage, ceiling clearance,
  actual touch actions, all cloud-room themes, time grants, disjoint bounds and pipe returns.
- Use deterministic seeds for generation assertions and real Arcade collision traversal.
  Preserve physics frame synchronization in bots; reject implausible instant completions.
- Identify invulnerability, refilled Boost, teleporting or forced boss stun in reports.
  Those checks prove integration/reachability, not unassisted combat balance.
- Run `npm test` for gameplay, framework, security-boundary and server regressions.
  Verify skill discovery metadata, relative links and pinned CI/CDN integrity.
- Do not call browser emulation a real-device test or claim skills alone prevent backdoors.
