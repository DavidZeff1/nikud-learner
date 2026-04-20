(function(global) {
  'use strict';

  const { VOWELS, buildSyllable, generateRound, getLevel, shuffle } = global.NikudData;

  function letterPositions(n, width) {
    const margin = Math.max(90, width * 0.1);
    if (n <= 1) return [width / 2];
    const inner = width - margin * 2;
    const step = inner / (n - 1);
    const out = [];
    for (let i = 0; i < n; i++) out.push(margin + step * i);
    return out;
  }

  class Game {
    constructor(canvas, callbacks) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.callbacks = callbacks || {};
      this.plane = new global.NikudPlane(canvas);
      this.particles = new global.NikudParticles();
      this.letters = [];
      this.score = 0;
      this.lives = 3;
      this.levelNum = 1;
      this.roundsInLevel = 0;
      this.running = false;
      this.paused = false;
      this.currentRound = null;
      this.lastTime = 0;
      this._rafId = null;
      this._tickBound = this._tick.bind(this);
      this._stars = null;
      this._roundPending = false;
    }

    start() {
      this.score = 0;
      this.lives = 3;
      this.levelNum = 1;
      this.roundsInLevel = 0;
      this.letters = [];
      this.running = true;
      this.paused = false;
      this._roundPending = false;
      this.plane.x = this.plane.targetX = this.canvas.width / 2;
      this._updateHUD();
      this._beginRound();
      this.lastTime = performance.now();
      this._rafId = requestAnimationFrame(this._tickBound);
    }

    stop() {
      this.running = false;
      this.paused = false;
      if (this._rafId) cancelAnimationFrame(this._rafId);
      this._rafId = null;
      this.letters = [];
      if ('speechSynthesis' in window) speechSynthesis.cancel();
    }

    pause() {
      if (!this.running) return;
      this.paused = true;
    }

    resume() {
      if (!this.running || !this.paused) return;
      this.paused = false;
      this.lastTime = performance.now();
      this._rafId = requestAnimationFrame(this._tickBound);
    }

    setPlaneTarget(x) { this.plane.setTargetX(x); }

    replayAudio() {
      if (this.currentRound) this._speakTarget(this.currentRound);
    }

    _beginRound() {
      const level = getLevel(this.levelNum);
      const round = generateRound(level);
      this.currentRound = round;
      this._roundPending = false;

      const shuffled = shuffle(round.vowels);
      const positions = letterPositions(shuffled.length, this.canvas.width);

      this.letters = shuffled.map((vId, i) => {
        const text = buildSyllable(round.consonant, vId);
        const L = new global.NikudLetter(positions[i], text, vId, round.fallSpeed);
        L.isTarget = (vId === round.targetVowel);
        return L;
      });

      this._speakTarget(round);
    }

    _speakTarget(round) {
      const syllable = buildSyllable(round.consonant, round.targetVowel);
      const spoke = global.NikudAudio.speak(syllable);
      if (!spoke) {
        // No Hebrew TTS voice — show the vowel name as a fallback cue.
        const v = VOWELS[round.targetVowel];
        global.NikudUI.flashVowelName(v.name);
      }
    }

    _endRound(success) {
      if (this._roundPending) return;
      this._roundPending = true;

      if (success) {
        this.score += 10 * this.levelNum;
        this.roundsInLevel++;
        const level = getLevel(this.levelNum);
        if (this.roundsInLevel >= level.roundsToAdvance) {
          this.levelNum++;
          this.roundsInLevel = 0;
        }
      } else {
        this.lives--;
      }
      this._updateHUD();

      this.letters = [];

      if (this.lives <= 0) {
        this.running = false;
        if (this._rafId) cancelAnimationFrame(this._rafId);
        this._rafId = null;
        if (this.callbacks.onGameOver) this.callbacks.onGameOver(this.score);
        return;
      }

      setTimeout(() => {
        if (this.running && !this.paused) this._beginRound();
      }, 700);
    }

    _updateHUD() {
      global.NikudUI.setText('score', this.score);
      global.NikudUI.setText('lives', this.lives);
      global.NikudUI.setText('level', this.levelNum);
    }

    _tick(now) {
      if (!this.running) return;
      if (this.paused) return;
      const dt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;

      this._update(dt);
      this._render();

      this._rafId = requestAnimationFrame(this._tickBound);
    }

    _update(dt) {
      this.plane.update(dt);
      this.particles.update(dt);

      if (this._roundPending) return;

      const catchBox = this.plane.getCatchBox();
      const bottom = this.canvas.height;
      let resolution = null;

      for (let i = this.letters.length - 1; i >= 0; i--) {
        const L = this.letters[i];
        L.update(dt);

        if (!L.caught && !L.missed && this._intersects(L.getBox(), catchBox)) {
          L.caught = true;
          if (L.isTarget) {
            this.particles.burst(L.x, L.y, '#06d6a0', 34);
            resolution = 'win';
          } else {
            this.particles.burst(L.x, L.y, '#ef476f', 28);
            resolution = 'lose';
          }
          this.letters.splice(i, 1);
          continue;
        }

        if (L.bottom >= bottom) {
          L.missed = true;
          if (L.isTarget) {
            this.particles.burst(L.x, bottom - 20, '#ef476f', 22);
            resolution = 'lose';
          }
          this.letters.splice(i, 1);
        }
      }

      if (resolution) this._endRound(resolution === 'win');
    }

    _intersects(a, b) {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    _render() {
      const ctx = this.ctx;
      const w = this.canvas.width, h = this.canvas.height;
      ctx.clearRect(0, 0, w, h);
      this._drawBackground();
      for (const L of this.letters) L.draw(ctx);
      this.plane.draw(ctx);
      this.particles.draw(ctx);
    }

    _drawBackground() {
      const ctx = this.ctx;
      const w = this.canvas.width, h = this.canvas.height;

      if (!this._stars) {
        this._stars = [];
        for (let i = 0; i < 50; i++) {
          this._stars.push({
            x: Math.random() * w,
            y: Math.random() * h * 0.75,
            r: Math.random() * 1.6 + 0.4,
            a: 0.25 + Math.random() * 0.5,
          });
        }
      }
      for (const s of this._stars) {
        ctx.fillStyle = 'rgba(255,255,255,' + s.a + ')';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ground line
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.setLineDash([6, 10]);
      ctx.beginPath();
      ctx.moveTo(0, h - 34);
      ctx.lineTo(w, h - 34);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this._stars = null;
    }
  }

  global.NikudGame = Game;
})(window);
