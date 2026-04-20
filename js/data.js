(function(global) {
  'use strict';

  // `phon` groups marks that sound identical in modern Hebrew. The round
  // generator only places letters from DIFFERENT phonetic groups on screen
  // at once, so the target audio is never ambiguous — but every round still
  // pulls a random mark within its group, so visual variety stays high.
  //
  // Cholam-male and shuruk include a vav (ו) before the mark; cholam-haser
  // is the same U+05B9 mark but sits on the consonant directly.
  const VOWELS = {
    patach:         { id: 'patach',         name: 'פַתָּח',         phon: 'a', mark: '\u05B7', appendVav: false },
    kamatz:         { id: 'kamatz',         name: 'קָמָץ',         phon: 'a', mark: '\u05B8', appendVav: false },
    chataf_patach:  { id: 'chataf_patach',  name: 'חֲטַף פַּתָּח', phon: 'a', mark: '\u05B2', appendVav: false },
    tzere:          { id: 'tzere',          name: 'צֵירֵי',        phon: 'e', mark: '\u05B5', appendVav: false },
    segol:          { id: 'segol',          name: 'סֶגוֹל',        phon: 'e', mark: '\u05B6', appendVav: false },
    chataf_segol:   { id: 'chataf_segol',   name: 'חֲטַף סֶגוֹל',   phon: 'e', mark: '\u05B1', appendVav: false },
    sheva:          { id: 'sheva',          name: 'שְׁוָא',         phon: 'e', mark: '\u05B0', appendVav: false },
    chirik:         { id: 'chirik',         name: 'חִירִיק',       phon: 'i', mark: '\u05B4', appendVav: false },
    cholam_male:    { id: 'cholam_male',    name: 'חוֹלָם מָלֵא',   phon: 'o', mark: '\u05B9', appendVav: true  },
    cholam_haser:   { id: 'cholam_haser',   name: 'חוֹלָם חָסֵר',   phon: 'o', mark: '\u05B9', appendVav: false },
    chataf_kamatz:  { id: 'chataf_kamatz',  name: 'חֲטַף קָמָץ',    phon: 'o', mark: '\u05B3', appendVav: false },
    shuruk:         { id: 'shuruk',         name: 'שׁוּרוּק',       phon: 'u', mark: '\u05BC', appendVav: true  },
    kubutz:         { id: 'kubutz',         name: 'קֻבּוּץ',        phon: 'u', mark: '\u05BB', appendVav: false },
  };

  const VAV = '\u05D5';

  function buildSyllable(consonant, vowelId) {
    const v = VOWELS[vowelId];
    if (!v) throw new Error('Unknown vowel: ' + vowelId);
    return v.appendVav ? consonant + VAV + v.mark : consonant + v.mark;
  }

  // Full Hebrew alphabet minus vav — vav as a consonant collides visually
  // with the vav used in cholam-male / shuruk.
  const CONSONANTS = [
    'א', 'ב', 'ג', 'ד', 'ה', 'ז', 'ח', 'ט', 'י', 'כ',
    'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת',
  ];

  const ALL_VOWEL_IDS = Object.keys(VOWELS);

  // Levels now only govern pace + simultaneous-letter count. The vowel and
  // consonant pool is always the full set — every round is freshly random.
  const LEVELS = [
    { id: 1, fallSpeed: 130, numLetters: 3, roundsToAdvance: 5 },
    { id: 2, fallSpeed: 160, numLetters: 3, roundsToAdvance: 6 },
    { id: 3, fallSpeed: 195, numLetters: 4, roundsToAdvance: 7 },
    { id: 4, fallSpeed: 230, numLetters: 4, roundsToAdvance: 8 },
    { id: 5, fallSpeed: 265, numLetters: 5, roundsToAdvance: 9 },
  ];

  // Beyond the last defined level, keep scaling speed forever.
  function getLevel(n) {
    n = Math.max(1, n | 0);
    if (n <= LEVELS.length) return LEVELS[n - 1];
    const last = LEVELS[LEVELS.length - 1];
    const extra = n - LEVELS.length;
    return {
      id: n,
      fallSpeed: last.fallSpeed + extra * 20,
      numLetters: last.numLetters,
      roundsToAdvance: last.roundsToAdvance,
    };
  }

  function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function groupByPhon(vowelIds) {
    const groups = {};
    for (const id of vowelIds) {
      const p = VOWELS[id].phon;
      (groups[p] = groups[p] || []).push(id);
    }
    return groups;
  }

  function generateRound(level) {
    const consonant = randomPick(CONSONANTS);
    const groups = groupByPhon(ALL_VOWEL_IDS);
    const phonKeys = shuffle(Object.keys(groups));
    const n = Math.min(level.numLetters, phonKeys.length);
    const chosenPhons = phonKeys.slice(0, n);
    const vowelIds = chosenPhons.map(p => randomPick(groups[p]));
    const targetIdx = Math.floor(Math.random() * vowelIds.length);
    return {
      consonant,
      targetVowel: vowelIds[targetIdx],
      vowels: vowelIds,
      fallSpeed: level.fallSpeed,
    };
  }

  global.NikudData = {
    VOWELS,
    CONSONANTS,
    LEVELS,
    buildSyllable,
    generateRound,
    getLevel,
    shuffle,
  };
})(window);
