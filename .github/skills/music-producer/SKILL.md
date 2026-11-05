---
name: music-producer
description: 'Required when building any Azure Heroes level, region, boss or sub-level, and when composing, reviewing or fixing music, genre arrangements, synth instruments or sound effects. Produce original, region-aware game scores with audible quality gates.'
---

# Game music production

Read [game-contract](../game-contract/SKILL.md) and
[game-security](../game-security/SKILL.md). This is a required part of every new
level, not an optional polish step. Follow this workflow even if skill discovery
fails; read this file directly. Do not equate passing tests with good music.

## Ownership and brief

Start with the affected `worlds/<city>/music.js`. Regional motifs and production
identity belong there; reusable composition/voices/SFX belong in `audio/`, and
playback, preferences and scheduling in `systems/audio.js`. Reuse these APIs;
do not copy a synth into a city or add city switches to playback.

Derive a short musical brief without asking users to choose every note:
- place, setting, gameplay energy and relevant contemporary/local musical influences;
- tonic/mode, tempo range, groove, lead/bass/percussion palette and a singable hook;
- quieter exploration/underground contrast, boss escalation and a clean loop point;
- which SFX communicate danger, success, impact and interaction over the mix.

Use respectful musical influences, not a national caricature or a random
"ethnic" instrument. Never copy a song, artist's melody or commercial recording.
All composition and synthesis remain original, local and dependency-free.

## Composition and production

1. Write a memorable two/four-bar motif in a stable tonal centre. Develop it through
   call/response, deliberate rests, inversions/register changes and a resolving
   turnaround. Do not regenerate a melody by indexing each chord's tones or stack
   random scale notes over a drum loop.
2. Arrange an intro, statement, contrast and return. Change density and register,
   not just instrument labels. Leave room for gameplay cues and a seamless return.
3. Only trance, house and pop are selectable. Trance: melodic builds, rolling
   arpeggios, controlled supersaw width and a resolving drop. House: warm keys,
   four-on-the-floor groove, offbeat bass and restrained syncopated chords.
   Pop: original repeated hook, verse/chorus contrast, clean bright lead and a
   straight backbeat with room for gameplay cues. Do not reintroduce jazz, blues,
   rock or country, or pretend synthesizers are a live acoustic band.
4. Shape transients, decay, release, filtering and velocity per instrument.
   Avoid harsh upper partials, continuous high hats, clicks, low-mid chord mud,
   excessive echo and note tails crossing every rest. Preserve oscillator/source
   cleanup and bound CPU, polyphony and sample caches.
5. Balance the mix around the hook. SFX remain intelligible; failure cues must
   differ from rewards. Use short original cues with smooth edges, no painfully
   sharp spikes. No new loudness/visual/audio preference may alter game progress.

## Required acceptance evidence

- Test every genre/context and the changed city's routing, including room return,
  boss, style cycling, mute/resume, preference persistence and stopped music.
- Render actual Web Audio output, not fake-node counts, for at least one full
  phrase and a loop join of each changed genre. Inspect finite samples, peak below
  -1 dBFS, audible signal, no hard clipping/DC offset/clicking and bounded tails.
  Check quiet/loud sections and SFX over music; report measured values.
- Audition those renders on headphones and ordinary speakers, including two loops.
  Compare before/after for melody, groove, timbre, fatigue and region identity.
  Obtain human listening approval before calling the music polished or release-ready.
  If the assistant cannot hear, supply playable previews and explicitly mark
  listening approval pending; never invent an audition or guarantee artistic quality.
- Add focused regressions for musical intent (phrase rests/resolution, voicing,
  dynamics, distinct regions), not only hashes or minimum note counts. Preserve
  compatible house/trance arrangements, saves, controls, offline play and security boundaries.
- Update player/contributor documentation and [playtest evidence](../../../tests/playtest.md).
  Disclose synthesis limitations and any untested mobile/browser listening.
