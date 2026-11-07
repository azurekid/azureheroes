/* Original electronic scene tracks and city-owned hooks. */
(function () {
  'use strict';
  const AH = window.AH, M = AH.Music, danceSong = M.danceSong;
  M.styles = Object.freeze(['trance', 'house', 'pop']);
  M.selections = Object.freeze(['trance', 'house', 'pop', 'night-drive', 'soft-skies']);
  M.selectedSongs = Object.freeze({
    'night-drive': Object.freeze({ key: 'house_night_drive', label: 'NIGHT DRIVE', style: 'house' }),
    'soft-skies': Object.freeze({ key: 'house_soft_skies', label: 'SOFT SKIES', style: 'house' })
  });
  // Retain the eleven original club compositions as stable catalogue entries.
  const RAW = {
    title: danceSong('HORIZON CLUB', 126, 'house', 'Am7 Am7 Fmaj7 Fmaj7 Cmaj7 Cmaj7 G G', '0 . 2 - . 1 . 2', '2 - 3 . 2 . 1 -'),
    main: danceSong('CLOUD NINE', 134, 'trance', 'Am Am F F C C G G', '0 . 2 3 . 2 1 -', '3 2 1 . 2 - 0 .'),
    boss: danceSong('THREAT PULSE', 138, 'trance', 'Dm Dm Bb Bb Gm Gm C A', '0 0 . 2 0 . 1 2', '3 . 2 1 0 1 2 -'),
    pipe: danceSong('DEPLOY AFTER DARK', 130, 'house', 'Em7 Em7 Cmaj7 Cmaj7 Am7 Am7 Bm7 Bm7', '. 0 . 2 - . 1 .', '2 . 3 - 1 . 0 .'),
    metro: danceSong('UNDERGROUND FREQUENCY', 132, 'trance', 'Dm Dm Bb Bb F F C C', '0 . 1 2 . 3 2 .', '3 - 2 . 1 2 0 -'),
    bonus: danceSong('GOLDEN HOUR', 128, 'house', 'Fmaj7 Fmaj7 Am7 Am7 Dm7 Dm7 G G', '2 . 0 - 1 . 2 .', '3 . 2 . 1 - 0 .')
  };
  const REGION_SONG = {}, REGION_STYLES = {};
  AH.WorldOrder.map((slug) => AH.Worlds[slug]).filter((city) => city.music?.key)
    .sort((a, b) => a.music.order - b.music.order).forEach((city) => {
      const m = city.music;
      RAW[m.key] = danceSong(m.name, m.bpm, m.style, m.progression, m.hook, m.lift);
      REGION_SONG[city.world.region] = m.key;
    });
  const shared = {
    name: 'CLOUD SIGNAL', tonic: 'A3', colour: 'glow', feel: 'straight',
    hook: '0 . 7 10 7 - 3 . | 5 . 3 2 0 - . . | 0 3 . 7 12 - 10 . | 7 5 3 . 0 - . .'
  };
  const houseThemes = {
    title: { name: 'SOFT CIRCUITS', tonic: 'F4', colour: 'glass', feel: 'syncopated',
      hook: '. 0 - 3 7 - . . | . 5 3 . 2 - . . | 0 . 3 7 10 - 7 . | 5 3 . 2 0 - . .' },
    main: { name: 'DEPLOY THE GROOVE', tonic: 'A3', colour: 'glow', feel: 'syncopated',
      hook: '. 0 7 . 10 7 3 . | 5 . 7 3 2 - . . | 0 3 . 7 12 - 10 . | 7 . 5 3 0 - . .' },
    pipe: { name: 'AFTER HOURS ACCESS', tonic: 'D4', colour: 'air', feel: 'straight',
      hook: '0 - . 7 5 - . . | 3 . 5 - 2 - . . | . 0 3 7 10 - . . | 7 5 . 3 0 - . .' },
    boss: { name: 'PEAK TIME DEFENDER', tonic: 'E4', colour: 'pulse', feel: 'syncopated',
      hook: '0 7 . 0 10 7 . 3 | 5 7 . 3 2 - . . | 0 . 7 12 10 7 . 5 | 7 5 3 2 0 - . .' },
    bonus: { name: 'CLOUD TERRACE', tonic: 'G4', colour: 'bell', feel: 'straight',
      hook: '. 0 3 - 7 - . . | 5 - 3 . 2 - . . | . 3 7 10 7 - 5 . | 3 2 . 3 0 - . .' }
  };
  M.styles.forEach((style) => {
    ['title', 'main', 'pipe', 'boss', 'bonus'].forEach((context) => {
      const theme = style === 'house' ? houseThemes[context]
        : context === 'bonus' ? { ...shared, name: 'GOLD SIGNAL', tonic: 'D4' } : shared;
      RAW[style + '_' + context] = M.electronicSong(theme, style, context);
    });
  });
  AH.WorldOrder.forEach((slug) => {
    const city = AH.Worlds[slug], theme = city.music?.theme;
    if (!theme) throw new Error(slug + ': missing original electronic theme');
    if (!['glow', 'glass', 'bell', 'air', 'pulse'].includes(theme.colour)
      || !['straight', 'syncopated'].includes(theme.feel)) throw new Error(slug + ': unsupported electronic palette');
    const mapping = REGION_STYLES[city.world.region] = {};
    M.styles.forEach((style) => {
      mapping[style] = {};
      ['main', 'pipe', 'boss'].forEach((context) => {
        const key = style + '_' + slug + '_' + context;
        RAW[key] = M.electronicSong(theme, style, context);
        mapping[style][context] = key;
      });
    });
  });
  const selectedThemes = [
    { key: 'house_night_drive', context: 'main', name: 'NIGHT DRIVE', tonic: 'E4', colour: 'pulse', feel: 'syncopated',
      hook: '0 . 3 7 . 10 7 . | 2 3 . 5 7 - 3 . | . 7 10 12 10 . 7 5 | 3 . 2 3 0 - . .',
      response: '7 . 5 3 . 2 0 . | . 3 5 7 5 - 2 . | 10 7 . 5 3 . 2 . | 3 5 2 . 0 - . .' },
    { key: 'house_soft_skies', context: 'pipe', name: 'SOFT SKIES', tonic: 'C4', colour: 'air', feel: 'straight',
      hook: '0 - . . 3 - 2 . | . 7 - 5 3 - . . | 5 - 7 . 10 - 7 . | 3 2 . . 0 - . .',
      response: '. 3 - 5 7 - . . | 10 - 7 . 5 - 3 . | . 2 3 - 5 . 2 . | 3 - 2 . 0 - . .' }
  ];
  selectedThemes.forEach((theme) => {
    const song = M.electronicSong(theme, 'house', theme.context);
    const response = M.electronicSong({ ...theme, hook: theme.response }, 'house', theme.context);
    song.name = theme.name;
    song.sections.B = response.sections.B;
    RAW[theme.key] = song;
  });
  const SONGS = {};
  Object.keys(RAW).forEach((key) => { SONGS[key] = M.buildSong(key, RAW[key]); });
  Object.assign(M, { SONGS, REGION_SONG, REGION_STYLES });
})();
