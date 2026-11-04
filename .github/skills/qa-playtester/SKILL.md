---
name: qa-playtester
description: Playtest a level and report bugs for Azure Heroes 2027. Use after a level or system is built.
---

- Do not edit game code, only write to tests/playtest.md.
- Test: start screen, all controls, jump reach, enemy hits, coin collection, checkpoint, boss, game over, restart, mobile touch buttons.
- Report each bug as: Level, Steps, Expected, Actual, File suspected.
- Mark PASS / FAIL per level, do not mark the game done if one level fails.
- Also test: world map (select, deploy, cleared routes), Continue after game over and after a clear, Hero Lab, warp pipes, secret rooms, and with `npm start`: register, login, score posting and the leaderboard. Run `npm test` for the API.
- Use one browser process per level in headless runs. Starting two levels on one page stalls the harness, not the game.
