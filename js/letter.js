(function(global) {
  'use strict';

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  class FallingLetter {
    constructor(x, text, vowelId, speed) {
      this.originX = x;
      this.x = x;
      this.y = -80;
      this.text = text;
      this.vowelId = vowelId;
      this.speed = speed;
      this.size = 120;
      this.wobbleT = Math.random() * Math.PI * 2;
      this.wobbleAmp = 8;
      this.caught = false;
      this.missed = false;
      this.isTarget = false;
    }

    update(dt) {
      if (this.caught || this.missed) return;
      this.y += this.speed * dt;
      this.wobbleT += dt * 1.6;
      this.x = this.originX + Math.sin(this.wobbleT) * this.wobbleAmp;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      // Bubble background
      const w = this.size, h = this.size;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 4;
      roundRect(ctx, -w / 2, -h / 2, w, h, 24);
      ctx.fill();
      ctx.stroke();

      // Inner subtle ring
      ctx.strokeStyle = 'rgba(255, 209, 102, 0.35)';
      ctx.lineWidth = 2;
      roundRect(ctx, -w / 2 + 8, -h / 2 + 8, w - 16, h - 16, 18);
      ctx.stroke();

      // Letter
      ctx.fillStyle = '#1a2d4a';
      ctx.font = '700 78px "Frank Ruhl Libre", "Noto Sans Hebrew", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.direction = 'rtl';
      ctx.fillText(this.text, 0, 8);

      ctx.restore();
    }

    getBox() {
      const pad = 6;
      return {
        x: this.x - this.size / 2 + pad,
        y: this.y - this.size / 2 + pad,
        w: this.size - pad * 2,
        h: this.size - pad * 2,
      };
    }

    get bottom() { return this.y + this.size / 2; }
  }

  global.NikudLetter = FallingLetter;
})(window);
