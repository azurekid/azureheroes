---
name: speaker-avatar
description: 'Create paired Azure Heroes-style event-speaker avatars from a photo using the shared approved image references. Use for conference portraits and WhatsApp headshots; confirm speaker/hero remix and approve a sample pair before generating a batch.'
---

# Event-speaker avatars

Follow [game-security](../game-security/SKILL.md) and the complete shared
[hero-avatar workflow](../hero-avatar/SKILL.md). This is an event-focused entry
point to that workflow, not an extra generation pass: create exactly two styles
per person, not two pairs. These are standalone promotional images, not runtime sprites.

## Confirm the choice

Use the structured question tool before generation. Ask whether the second style
should be an **event speaker** or a **random hero**, unless explicitly answered.
Suggest speaker for this entry point, but wait for the selection. Collect the photo
if missing, plus optional talk topic, event palette, props and exclusions in the
same form. Offer "Surprise me"; do not assume everyone wants armor or blue suits.
An event-speaker request alone does not waive the shared second-style question.
Inspect and attach the shared
[classic](../hero-avatar/references/classic-style.png) and
[hero](../hero-avatar/references/hero-style.png) references as directed by the shared
workflow. Keep the Azure Heroes rendering, blue-purple foundation and cyan/magenta
rim rather than substituting a generic arcade or smooth illustrated event style.
Obtain approval of one sample pair before generating the remaining people.

## Speaker remix direction

Output A is always the shared classic portrait: faithful everyday clothing,
recognizable but intentionally restrained pixel-drawn facial detail, a level
direct-to-camera pose by default, synthwave sunset/grid and circular neon rim.
Follow the shared likeness and quality gates: no blurred, smoothed or selectively
pixelated face against a sharp game-world outfit.

For output B when **speaker** is selected:

- Make a stylized presenter, not automatically a superhero. Vary stage clothing
  (jacket, casual shirt, blazer, techwear or a user-specified look), composition
  and palette while preserving the face.
- Use one clear presentation prop such as a microphone, remote or holographic
  display. Keep hands/props subordinate to a large recognizable face.
- Derive visual themes from the supplied talk topic, never assumed employment
  or expertise: security may use a shield/network diagram, cloud a floating
  architecture model, developer tooling a code-panel motif, and AI an abstract
  node constellation. Without a topic, use a varied neutral retro stage.
- Rotate game-world stage details, poses, props and garment structures across a
  batch using the shared variation rule. Keep dimensional shading, pixel detail
  and blue/cyan/violet visual identity consistent. Do not reuse the same blue A
  suit, HUD, visor or cape for every speaker.
- No invented talk titles, qualifications, affiliation logos or readable badges.
  Add names/event text only when explicitly requested and verify spelling.

When **hero** is selected, use the shared hero remix procedure instead; do not
also generate a speaker remix. Preserve the classic-plus-remix two-output count.

## Acceptance and delivery

Follow the shared consent/reference boundaries, circular-crop inspection,
full-resolution master retention, default **two separate 200x200 PNG** exports
(or the explicitly requested smaller native size under the shared workflow),
distinct names and labeled download links. Inspect both real exports; report
missing checks and request human likeness/style approval before publication.
Skill changes follow [qa-playtester](../qa-playtester/SKILL.md); image quality
requires actual visual review, not only passing framework tests.
