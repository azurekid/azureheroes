---
name: level-builder
description: 'Build Azure Heroes generated layouts, vertical streets, underground cloud challenges and pipe rooms. Use for height variation, platforms, AKS, Docker, GitHub Actions and data-center routes.'
---

- Read [game-contract](../game-contract/SKILL.md) and [game-security](../game-security/SKILL.md).
- Establish affected level IDs or shared generator scope from the request; ask only when unclear.
- Runtime layout changes belong in `levels/worlds.js`; coordinate other surfaces through [game-orchestrator](../game-orchestrator/SKILL.md). Related tests and documentation are in scope.
- Use only the Level format from game-contract.
- Verify reachability with actual jump/double-jump/boost physics, not platform spacing alone.
- Scale rewards and enemies to route length; preserve safe spawn/checkpoint/pipe/boss areas.
- Rooftop: lasers, double jump gaps, climb walls (wall jumps) and ledge stairs to high roofs. Sky Canyon: rings, drones. Data Center: hack terminal, sec gate, cables.
- Return: level ID, length, collectible count, and how you tested it.

## Generated worlds
- Levels are produced by `AH.Levels.make(id)` in `levels/worlds.js`; discover current worlds from `AH.Levels.worlds`, not a fixed count.
- Output still follows the game-contract Level format, plus `region`, `city`, `landmarks`, `hint`, `tint`.
- Keep gaps 100-195px, rise <=20 for gaps >140px, so every random layout stays completable.
- Landmark art lives only in `art/sprites.js`.

## Vertical streets and cloud challenges
1. Preserve distinct steps, drops and upper routes; check at least 60px street-height spread.
2. Reserve pipe pairs before placing hazards. Clear headroom above both pipes.
3. Keep underground zones disjoint, including their full width and any secret room.
4. Preserve theme-specific routes and tips in `CHALLENGES`: Pipelines, AKS, Actions,
   Docker, Entra and Functions in the shared pool, plus regional rooms such as the Paris
   Metro (`pipeTheme`, always the first pipe and never in the shared pool).
   New themes require matching tiles/backgrounds, safe entry/exit, rewards and time allowance.
   Shuffle distinct stage layouts and lesson order, varying geometry, encounters and
   rewards, not just decoration. Keep rooms within 3200..3840px and the reserved stride.
   Include reachable `spread` and `pierce` pickups in every world and room.
5. Service ducts must fit the 20px crouched body and block the 40px standing body.
   Offer a reachable roof route as well; do not trap players beneath overlapping solids.
6. Test multiple seeds in `tests/game.test.js` and traverse rooms in the browser.
