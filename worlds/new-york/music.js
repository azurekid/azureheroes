(function () {
  'use strict';
  const AH = window.AH;
  AH.Worlds['new-york'].music = {
    key: 'newyork', order: 4,
    name: 'HUDSON HOUSE', bpm: 128, style: 'house',
    progression: 'Dm7 Dm7 G7 G7 Cmaj7 Cmaj7 Am7 Am7',
    hook: '. 0 . 2 1 . 2 -', lift: '3 . 2 . 1 2 0 -',
    theme: {
      name: 'HUDSON SIGNAL', tonic: 'D4', colour: 'glass', feel: 'syncopated',
      hook: '. 3 7 10 9 7 . 5 | 2 . 3 5 0 - . . | 7 10 12 . 10 9 7 . | 5 3 2 . 0 - . .'
    }
  };
})();
