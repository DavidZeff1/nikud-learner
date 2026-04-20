(function() {
  'use strict';

  const canvas = document.getElementById('game-canvas');

  NikudUI.register('title', 'title-screen');
  NikudUI.register('name', 'name-screen');
  NikudUI.register('instructions', 'instructions-screen');
  NikudUI.register('game', 'game-screen');
  NikudUI.register('pause', 'pause-screen');
  NikudUI.register('gameover', 'gameover-screen');
  NikudUI.register('leaderboard', 'leaderboard-screen');

  let game = null;
  let currentPlayerName = '';
  let _leaderboardReturnTo = 'title'; // which screen to go back to

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (game) game.resize();
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function updateHighScoreDisplays() {
    const hs = NikudStorage.getHighScore();
    NikudUI.setText('title-highscore', hs);
    NikudUI.setText('gameover-highscore', hs);
  }
  updateHighScoreDisplays();

  // --- Name entry ---
  const nameInput = document.getElementById('player-name-input');

  // Pre-fill with last-used name
  const savedName = NikudStorage.getPlayerName();
  if (savedName) nameInput.value = savedName;

  function showNameScreen() {
    NikudUI.show('name');
    nameInput.focus();
  }

  function confirmNameAndStart() {
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.classList.add('shake');
      nameInput.focus();
      setTimeout(() => nameInput.classList.remove('shake'), 500);
      return;
    }
    currentPlayerName = name;
    NikudStorage.setPlayerName(name);
    startGame();
  }

  // --- Game ---
  function startGame() {
    NikudUI.show('game');
    if (!game) {
      game = new NikudGame(canvas, { onGameOver: handleGameOver });
    }
    game.start();
  }

  function handleGameOver(score) {
    const prevHs = NikudStorage.getHighScore();
    const isNewHigh = score > prevHs;
    if (isNewHigh) NikudStorage.setHighScore(score);

    // Save to leaderboard
    NikudStorage.addLeaderboardEntry(currentPlayerName, score);

    NikudUI.setText('final-score', score);
    updateHighScoreDisplays();

    // New highscore badge
    const badge = document.getElementById('new-highscore-badge');
    badge.style.display = isNewHigh ? 'block' : 'none';

    NikudUI.show('gameover');
  }

  // --- Leaderboard ---
  function renderLeaderboard() {
    const board = NikudStorage.getLeaderboard();
    const tbody = document.getElementById('leaderboard-body');
    const emptyMsg = document.getElementById('leaderboard-empty');
    const table = document.getElementById('leaderboard-table');

    tbody.innerHTML = '';

    if (board.length === 0) {
      emptyMsg.style.display = 'block';
      table.style.display = 'none';
      return;
    }

    emptyMsg.style.display = 'none';
    table.style.display = 'table';

    const medals = ['🥇', '🥈', '🥉'];
    board.forEach((entry, i) => {
      const tr = document.createElement('tr');
      if (i < 3) tr.classList.add('top-' + (i + 1));

      const rankTd = document.createElement('td');
      rankTd.textContent = medals[i] || (i + 1);
      rankTd.className = 'lb-rank';

      const nameTd = document.createElement('td');
      nameTd.textContent = entry.name;
      nameTd.className = 'lb-name';

      const scoreTd = document.createElement('td');
      scoreTd.textContent = entry.score;
      scoreTd.className = 'lb-score';

      const dateTd = document.createElement('td');
      dateTd.textContent = entry.date || '';
      dateTd.className = 'lb-date';

      tr.appendChild(rankTd);
      tr.appendChild(nameTd);
      tr.appendChild(scoreTd);
      tr.appendChild(dateTd);
      tbody.appendChild(tr);
    });
  }

  function showLeaderboard(returnTo) {
    _leaderboardReturnTo = returnTo || 'title';
    renderLeaderboard();
    NikudUI.show('leaderboard');
  }

  // Plane follows cursor across the whole window so the player's focus is never
  // "trapped" by the HUD/overlay regions.
  window.addEventListener('mousemove', (e) => {
    if (game && game.running && !game.paused) {
      game.setPlaneTarget(e.clientX);
    }
  });
  window.addEventListener('touchmove', (e) => {
    if (game && game.running && !game.paused && e.touches[0]) {
      game.setPlaneTarget(e.touches[0].clientX);
    }
  }, { passive: true });

  // --- Button wiring ---
  document.getElementById('btn-start').addEventListener('click', showNameScreen);
  document.getElementById('btn-instructions').addEventListener('click', () => NikudUI.show('instructions'));
  document.getElementById('btn-back-from-instructions').addEventListener('click', () => NikudUI.show('title'));

  // Name screen
  document.getElementById('btn-play').addEventListener('click', confirmNameAndStart);
  document.getElementById('btn-back-from-name').addEventListener('click', () => NikudUI.show('title'));
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmNameAndStart();
  });

  // Leaderboard
  document.getElementById('btn-leaderboard').addEventListener('click', () => showLeaderboard('title'));
  document.getElementById('btn-gameover-leaderboard').addEventListener('click', () => showLeaderboard('gameover'));
  document.getElementById('btn-back-from-leaderboard').addEventListener('click', () => {
    NikudUI.show(_leaderboardReturnTo);
  });

  document.getElementById('btn-replay').addEventListener('click', (e) => {
    e.stopPropagation();
    if (game) game.replayAudio();
  });
  document.getElementById('btn-pause').addEventListener('click', (e) => {
    e.stopPropagation();
    if (!game || !game.running) return;
    game.pause();
    NikudUI.show('pause');
  });
  document.getElementById('btn-resume').addEventListener('click', () => {
    NikudUI.show('game');
    if (game) game.resume();
  });
  document.getElementById('btn-quit').addEventListener('click', () => {
    if (game) game.stop();
    NikudUI.show('title');
    updateHighScoreDisplays();
  });
  document.getElementById('btn-restart').addEventListener('click', startGame);
  document.getElementById('btn-main-menu').addEventListener('click', () => {
    NikudUI.show('title');
    updateHighScoreDisplays();
  });

  document.addEventListener('keydown', (e) => {
    if (!game || !game.running) return;
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      if (game.paused) {
        NikudUI.show('game');
        game.resume();
      } else {
        game.pause();
        NikudUI.show('pause');
      }
    } else if (e.key === ' ' && !game.paused) {
      e.preventDefault();
      game.replayAudio();
    }
  });
})();
