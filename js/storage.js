(function(global) {
  'use strict';

  const HS_KEY = 'nikud-learner:highscore';
  const LB_KEY = 'nikud-learner:leaderboard';
  const NAME_KEY = 'nikud-learner:playerName';
  const MAX_LEADERBOARD = 10;

  function getHighScore() {
    try { return parseInt(localStorage.getItem(HS_KEY), 10) || 0; }
    catch (e) { return 0; }
  }

  function setHighScore(score) {
    try { localStorage.setItem(HS_KEY, String(score)); }
    catch (e) { /* storage may be unavailable */ }
  }

  function getPlayerName() {
    try { return localStorage.getItem(NAME_KEY) || ''; }
    catch (e) { return ''; }
  }

  function setPlayerName(name) {
    try { localStorage.setItem(NAME_KEY, name); }
    catch (e) { /* storage may be unavailable */ }
  }

  function getLeaderboard() {
    try {
      const raw = localStorage.getItem(LB_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function addLeaderboardEntry(name, score) {
    try {
      const board = getLeaderboard();
      const date = new Date().toLocaleDateString('he-IL');
      board.push({ name, score, date });
      board.sort((a, b) => b.score - a.score);
      if (board.length > MAX_LEADERBOARD) board.length = MAX_LEADERBOARD;
      localStorage.setItem(LB_KEY, JSON.stringify(board));
      return board;
    } catch (e) { return []; }
  }

  global.NikudStorage = {
    getHighScore,
    setHighScore,
    getPlayerName,
    setPlayerName,
    getLeaderboard,
    addLeaderboardEntry,
  };
})(window);
