---
name: gameplay-systems
description: 'Build Azure Heroes movement, charged shots, duck/slide combat, cloud-threat AI, bosses, wardrobe/save compatibility, Gold Mode, local preferences, mute and selectable Web Audio music styles.'
---

- Read [game-contract](../game-contract/SKILL.md) and [game-security](../game-security/SKILL.md).
- Runtime gameplay belongs in `systems/`; account hosting belongs in `server.js`. Related tests and docs are in scope. Coordinate art/layout/UI via [game-orchestrator](../game-orchestrator/SKILL.md).
- Movement: Arrow/WASD, Space jump, double jump, Shift flight boost, F Azure Blast.
- Wall slide / wall jump (`systems/player.js`): airborne + pushing into a solid side caps the fall at `WALL_SLIDE`;
  jump within the 0.14s `wallT` grace calls `wallJump()` (kick away, `wallLock` 0.12s, `jumps = 1`). Priority:
  ground/coyote jump, then wall jump, then double jump. Not while riding, ducking or shielding.
- Azure Bike: `BIKE_SPEED` (1.9x RUN) in `systems/scenes.js`; keep it clearly faster than running and show it
  (speed trail, camera look-ahead). Riding jumps are 1.1x higher.
- Down/S ducks; standing still while ducking is a crouch guard (low shield), moving starts a slide. F (press, hold or pending charge) lowers the crouch guard so ducking shots and charges fire; low shots rise with charge to clear the floor. E shields on the ground and in the air. Keep touch equivalents.
- Blasts destroy enemy bolts and boss bolts (`LevelScene.shootDownBolt`). A front-facing shield blocks boss contact (`player.guardT`).
- F/touch BLAST charge while held and fire on release. Preserve `fireHeld`, cancel held
  charges on hurt/shield/pause/help/warp, and require release before another charge.
  `spread` and `pierce` pickups replace the weapon for 25s; expiry/respawn restore Azure.
- Projectile damage, fan trajectories and per-projectile hit sets live in
  `spawnBlast`/`updateBlasts`; beams hit each target once and never bypass solid walls.
- H opens help and Q quits from any play state; keep `help`, `quit`, `esc`, `nav` routing in `LevelScene.update`.
- New enemies need `label`, `cat` and `info` in `SPEC` (see game-contract) so nameplates and the Hero Handbook stay complete.
- Shrinking the collision body must preserve feet and physics previous-position deltas.
  Do not stand inside ceilings; verify this with live Arcade physics, not mocks alone.
- Slides hit each low enemy once per slide; low blasts originate near the feet.
- Cloud threats reuse shared AI behaviors without changing the two-hit/one-credit invariant.
  Keep remediation tips educational: fix insecure configuration, do not portray guest access itself as malicious.
- The ground `hacker` is a rogue shooter using the existing robot patrol and bolt logic;
  its identity-category defeat tip recommends Entra MFA. Do not change the playable
  Cloud Hacker's abilities or add account permissions for either character.
- Boss: three escalating phases, fair windup, and guaranteed open windows after three
  volleys. Block two shots/a charge, or dodge a charge, for earlier windows. Clear old
  projectiles on exposure. `boss.vulnerable` drives damage, HUD OPEN countdown and
  overhead target marker together; test locked and open states, not forced stuns only.
  Every ground charge ends in a stun: blocked by the shield, or a wall BONK when dodged.
- Regional bosses are street fighters (`systems/boss.js`): they always face the hero
  (`setFlipX`, except mid-commit), walk in and out of range, and mix projectiles with a
  3-hit combo (jab high, kick low, jab high), a jump kick, a round-2+ anti-air uppercut
  and a round-3 super. Air fighters hover, volley, dash and fan. Every melee move that
  misses ends in `recover` (WHIFF, about 1.5s open); two shield blocks of a combo parry
  it into a stun. Each move has a readable windup and per-attack cue. Phases are
  announced as ROUND 1-3, defeat is a K.O.; snapshot `round` feeds the HUD.
- Respawn calls `respawnEnemies()`: rebuild all `L.enemies` except within 200px of the hero
  (fly mode: only ahead of the camera). Never respawn the hero into an empty level.
- 5 MFA tokens = +1 life. Azure Blast uses Boost meter.
- No level layout changes, use placeholder platforms for testing.
- Accounts and leaderboard: client in `systems/online.js`, server in `server.js` (zero dependencies, Node 18+). Any API change needs a test in `tests/server.test.js` and must keep guest mode (no server) working.
- Resume and save rules are in the game-contract skill. Use `AH.Save.setResume`.
- Audio lives in `systems/audio.js`: dance keeps the original house/trance tracks;
  selectable jazz, country, blues and rock have distinct original rhythms, voices
  and lounge/world/challenge/boss arrangements. Keep dance kick-ducking off other
  styles, preserve context routing and store the validated choice locally without
  changing game progress. N and the MUSIC button cycle styles. Preserve mute,
  suspended-context resume, SFX and node cleanup; muting during Gold Mode may
  persist the preference locally but must never push run progress online.
  Add no downloaded tracks, dependencies or outbound services. Validate timing,
  released nodes and offline waveform headroom; distinguish that from human listening.
