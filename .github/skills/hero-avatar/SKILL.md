---
name: hero-avatar
description: 'Create two circular Azure Heroes avatars from a photo using bundled visual references: a faithful portrait and a varied game-world hero or speaker remix. Use for community headshots and WhatsApp avatars; confirm the remix and approve one pair before a batch.'
---

# Azure Heroes photo-based community avatars

Follow [game-security](../game-security/SKILL.md). This skill creates standalone
promotional images, not game sprites. Do not change runtime modules, saved wardrobe,
accounts or the code-drawn game-asset contract. Generated artwork must not be added
to runtime asset directories or loaded by the game.

## 1. Confirm the brief before generation

Use the assistant's structured question tool and wait for the answer. Ask only for
information not already supplied:

- The source photo or public image URL, if missing.
- Whether the second image should be a **random hero** or an **event speaker**.
  Hero is this entry point's suggested default, not an automatic selection.
- Any theme, topic, preferred colors, outfit/headwear, props or exclusions.
  Offer "Surprise me" for a varied original concept.
- Event/role details only when relevant, and any requested style reference.

If the user has not selected the second style, ask even when the request simply
says "make me a hero avatar." Do not generate until that selection is answered.
If the question is declined, do not silently select a style or incur generation
costs. A request to create this skill does not itself authorize generating images.

## 2. Lock the Azure Heroes style to actual references

Open and inspect both approved examples before composing prompts:

- [Classic portrait style](references/classic-style.png).
- [Hero remix style](references/hero-style.png).

Include the matching reference image in each generation call alongside the person's
source photo. Label their roles explicitly: the photo supplies identity; the example
supplies rendering, palette, composition and finish only. Never copy the reference
person's face onto someone else. These two examples are approved style references;
additional references need the user's request or approval.
When the user points back to an example, use it as the sole rendering authority.
Do not add generated portraits as competing style references; they can preserve
likeness only when explicitly approved for that purpose. Compare the reference
and output at the same final size, including facial pixel-cluster size, not just
palette and background.

The target is **Azure Heroes game artwork**, not generic "80s/90s retro" or a
hardware-accurate arcade portrait. Keep these shared invariants:

- Crisp, deliberately drawn pixel clusters and clean edges. Keep hair, clothing
  and scenery at the reference's detail density, but use simpler facial rendering:
  clear recognizable features, broad stepped planes and restrained skin texture.
  Avoid pores, dense wrinkle lines and other high-frequency facial detail. Keep
  the eyes, nose, mouth and expression recognizable; do not blur, mosaic or flatten
  the face into a generic sprite. Pixel-art style comes from drawing, not reducing output dimensions.
- Default to a direct-to-camera pose: head upright and level, face and eyes toward
  the viewer, chin neutral. Do not copy an upward/downward head tilt or off-camera
  gaze from the source photo; preserve identity and expression while reorienting
  naturally. Honor a different pose when the user explicitly requests one.
- Likeness takes priority over simplification: preserve the original photo's
  face geometry, head width-to-height ratio, hairline, apparent age and expression.
  Do not beautify, de-age, elongate the head or substitute the style example's face.
  The face must be pixel-drawn at the same scale as its clothing and scenery,
  not a photographic face with sharpness, blur or mosaic filters applied.
- Saturated Azure/electric blue, deep indigo and violet foundations, luminous cyan
  highlights, magenta accents and restrained warm sunset/gold contrast. Use painted
  dimensional depth, distinct highlight/shadow planes and dark contour edges.
- A close, large head-and-shoulders composition and a bold stepped cyan/magenta
  circular rim. Keep rim thickness and portrait scale consistent across the batch.
- Classic portraits use the example's sunset/grid backdrop. Hero remixes use
  the game's neon skyline, cloud-tech scenery and bright readable costume shapes.
  Small hearts, energy bars, coins or tech effects can support the hero, not bury it.

Do not prescribe a 320x320 logical grid, a fixed skin-shade count, heavy dithering
or a nearest-neighbor filter as a substitute for matching these examples. Do not
let "random" turn the art into sepia western paintings, generic fantasy cards,
smooth concept art or a different game's character-select screen.
Keep prompts concise: identify the source person, the matching style reference,
the chosen outfit and essential composition constraints. Do not accumulate
contradictory "softer", "sharper", shade-count or resolution instructions from
rejected attempts. Replace the rejected direction with the user's current target.

For a batch or a style correction, generate **one classic/remix pair first** and
use the structured question tool to obtain explicit style/likeness approval.
**Do not generate the remaining people until the sample pair is approved.**
Preserve choices already supplied; do not ask for the same remix assignment again.
If the sample misses the reference, explain the mismatch and obtain authorization
for another render rather than automatically paying for repeated batches.
If likeness is rejected, return to the original source photo for the next render,
not the last generated face. A local head-and-shoulders crop may improve the
likeness reference without altering it. Generate one classic likeness-check
portrait first and obtain approval before applying that face to the remix or
continuing the batch. Keep the approved style example separate from identity.

## 3. Establish two distinct outputs per person

**A. Classic portrait:** follow the approved synthwave portrait reference: a large,
recognizable head-and-shoulders likeness, original everyday clothing, dark purple
background, striped magenta sunset and cyan/purple perspective grid, framed by a
cyan-to-magenta circular arcade rim. No automatic armor, cape, visor or HUD here.
Preserve existing glasses and headwear. This is the consistent community style.

**B. Remix:** follow the confirmed hero or speaker choice. Preserve the same person's
likeness while varying the concept, silhouette, clothing, accent palette, setting
details and prop within the shared Azure Heroes visual language.
For an event-speaker remix, follow
[speaker-avatar](../speaker-avatar/SKILL.md#speaker-remix-direction) as well.

Both use retro pixel illustration with deliberate edges, layered pixel shading
and recognizable but intentionally restrained facial detail. Avoid photographic
skin pasted onto pixel art and coarse, oversized blocks or simplistic sprite faces.
Keep distinctive hair, facial hair, expression and facial proportions recognizable;
do not infer identity or invent personal traits from the photo.

## 4. Make the remix varied within the game world

Unless the user specifies the design, choose a fresh combination across at least
three axes below. Check the current batch or conversation for repetition; do not
keep a persistent personal profile to track variety.

| Axis | Possible original directions |
|------|------------------------------|
| Role | cloud explorer, cyber defender, inventor, space pilot, arcade ranger, speaker |
| Clothing | blue/cyan flight jacket, violet techwear, utility vest, stage outfit, distinct armor |
| Accent palette | cyan/gold, violet/lime, blue/coral, indigo/teal; retain the shared blue-purple foundation |
| Setting details | neon cloud-city rooftops, game-world stage, blue-lit lab, skyline observatory |
| Prop | hologram, presentation remote, shield, toolkit, microphone, floating diagrams |

These are examples, not a fixed sequence or mandatory costume list. Vary garment
structure, silhouette and role-specific props, not just the color of one suit.
The blue suit, cape and glowing A in the reference are allowed, but do not repeat
that exact outfit on every person. Keep the rendering and game-world palette
consistent even when the outfit changes. A remix must differ meaningfully from
portrait A, not just recolor it.
For a cowboy, add the hat and western details to a game-world outfit; do not
replace Azure Heroes with a brown desert-western art style. For a hacker, use
dark blue/violet techwear and a terminal in the same neon game world, not a
photorealistic security portrait.
Do not add hats, sunglasses or face-obscuring equipment by default. Honor requested
items (for example a cowboy hat) without hiding the face or clipping the rim.
Use original archetypes rather than named franchise costumes. Do not imply
unrequested corporate endorsement or add logos, names or event text by default.

## 5. Generate from authorized references

- Use the available image-generation/editing tool only for an explicit image request.
  Use the supplied person's photo as the likeness reference for **both** outputs.
  An approved existing avatar may be an additional reference, not a replacement
  for the source photo when that photo is available.
- Include the matching bundled style reference in every generation call. Tell the
  image model which image controls likeness and which controls style, so faces do
  not mix. Request unavailable source photos again; the bundled examples do not
  replace a person's photo.
- Download only the user-supplied public image, checking format and successful
  retrieval. Never scrape profiles, use credentials or send repository code,
  private files or unrelated attachments to the image tool. Private or sensitive
  sources require an approved workflow; do not work around access controls.
- Make two separate images per person, not a collage. State portrait A's direction
  and remix B's chosen concept in the generation prompts.
- Keep each complete circular rim inside a square canvas with a small safety margin.
  Keep the face and key props comfortably within the circular crop. Default to no text.
- Save deliverables outside game/runtime directories, preferably in the session
  artifact area. Do not overwrite source photos or read-only attachments, or commit
  portraits to the repository without explicit permission.
- If generation is unavailable or fails, report it explicitly. Never claim a render
  exists or automatically retry paid generation without authorization.

## 6. Export, inspect and hand off

Retain the generated full-resolution masters and export **two separate 600x600 PNG**
files per person, named distinctly (for example `portrait-classic.png` and
`portrait-hero.png` or `portrait-speaker.png`). Use existing image tools; do not
install dependencies solely for resizing. Preserve aspect ratio; pad a nonsquare
render rather than stretching the face. Do not upscale a coarse face as a quality fix.
Default avatar deliveries must not exceed 600x600. Keep higher-resolution masters
separate, and only provide larger avatar exports when the user explicitly asks.

Inspect the actual masters and 600x600 exports beside the matching bundled
reference at the same displayed size. Check the level, direct-to-camera gaze,
restrained facial detail, likeness, dimensional shading, blue-purple palette,
cyan/magenta rim and game-world coherence.
Reject blurred, smeared or photographic faces and visibly stretched proportions.
Inspect at final avatar size as well as master size; do not approve based on a
thumbnail alone. Use the untouched native master for style approval, not a
downsampled preview enlarged by the viewer.
Preview a circular crop: the face,
headwear, rim and main prop must not be cut off. Verify actual PNG format and exact
600x600 dimensions, recognizable likeness, medium-fine detail, no unintended text
and meaningful variation. Fix a failed export locally; obtain approval before an
additional paid render. Report unverified checks honestly.
Preserve the native master unchanged. Resizing is only for delivery, never a style
correction. Do not blur, mosaic, downsample/re-enlarge or selectively pixelate a face
to approximate the reference. For these small exports use whole-image
nearest-neighbor reduction without averaging, smoothing or subsequent enlargement.
Inspect the real 600x600 PNG at native size, not a smoothed enlarged preview.
If the user requests a different resolution, confirm the intended file size
rather than applying a face-only pixel filter. File dimensions alone cannot
repair a photographically rendered face; that needs a reference-matched redraw.

Deliver both labeled download links and a brief remix description. Ask for human
approval of likeness/style before calling the artwork approved or publishing it.
Generation-tool artifacts may already be displayed; do not duplicate their registration.
Use [qa-playtester](../qa-playtester/SKILL.md) for skill/framework changes; automated
metadata tests cannot certify the visual quality of a future image.
