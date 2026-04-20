(function(global) {
  'use strict';

  const HS_KEY = 'nikud-learner:highscore';
  const LB_KEY = 'nikud-learner:leaderboard';
  const NAME_KEY = 'nikud-learner:playerName';
  const MAX_LEADERBOARD = 10;
  const API_BASE = '/api/leaderboard';

  // --- Local-only helpers (personal highscore & player name) ---

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

  // --- Leaderboard (global API, localStorage fallback) ---

  function _getLocalBoard() {
    try {
      const raw = localStorage.getItem(LB_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function _setLocalBoard(board) {
    try { localStorage.setItem(LB_KEY, JSON.stringify(board)); }
    catch (e) { /* ignore */ }
  }

  async function getLeaderboard() {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('API error');
      const board = await res.json();
      _setLocalBoard(board); // cache locally
      return board;
    } catch (e) {
      // Fallback to local storage
      return _getLocalBoard();
    }
  }

  async function addLeaderboardEntry(name, score) {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score }),
      });
      if (!res.ok) throw new Error('API error');
      const board = await res.json();
      _setLocalBoard(board);
      return board;
    } catch (e) {
      // Fallback to local storage
      const board = _getLocalBoard();
      const date = new Date().toLocaleDateString('he-IL');
      board.push({ name, score, date });
      board.sort((a, b) => b.score - a.score);
      if (board.length > MAX_LEADERBOARD) board.length = MAX_LEADERBOARD;
      _setLocalBoard(board);
      return board;
    }
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
