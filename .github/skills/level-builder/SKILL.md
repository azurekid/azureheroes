---
name: level-builder
description: Build or edit one side-scrolling level for Azure Heroes 2027. Use for Rooftop Run, Sky Canyon, Data Center.
---

- Ask which level ID you own, build only that file in levels/.
- Use only the Level format from game-contract.
- Level must be completable: start, platforms every 200-350px, no impossible jumps, exit reachable.
- Place 8-12 Azure Credits, 3 MFA tokens, 3-5 enemies per level.
- Rooftop: lasers, double jump gaps. Sky Canyon: rings, drones. Data Center: hack terminal, sec gate, cables.
- Return: level ID, length, collectible count, and how you tested it.

## Generated worlds
- Levels are produced by `AH.Levels.make(id)` in `levels/worlds.js`; each of the 6 worlds maps to an Azure region (westeurope, uksouth, japaneast, australiaeast, brazilsouth, eastus).
- Output still follows the game-contract Level format, plus `region`, `city`, `landmarks`, `hint`, `tint`.
- Keep gaps 100-195px, rise <=20 for gaps >140px, so every random layout stays completable.
- Landmark art lives only in `art/sprites.js`.
