(function(global) {
  'use strict';

  // Minimal all-white plane, facing up. Three overlapping shapes (wings,
  // tail, fuselage) that read clearly as a silhouette against the night sky.
  class Plane {
    constructor(canvas) {
      this.canvas = canvas;
      this.width = 130;
      this.height = 130;
      this.x = canvas.width / 2;
      this.targetX = this.x;
      this.y = canvas.height - 95;
      this.smoothing = 0.22;
    }

    setTargetX(x) {
      const margin = this.width / 2;
      this.targetX = Math.max(margin, Math.min(this.canvas.width - margin, x));
    }

    update(dt) {
      this.x += (this.targetX - this.x) * this.smoothing;
      this.y = this.canvas.height - 95;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      // Subtle ground shadow — only dark element, keeps the plane popping white
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.ellipse(0, 54, 48, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';

      // Main wings — horizontal ellipse across the middle
      ctx.beginPath();
      ctx.ellipse(0, 6, 62, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tail wings — small horizontal ellipse near the bottom
      ctx.beginPath();
      ctx.ellipse(0, 44, 24, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fuselage with pointed nose — a teardrop pill running vertically
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.quadraticCurveTo(12, -42, 12, -18);
      ctx.lineTo(12, 40);
      ctx.quadraticCurveTo(12, 54, 0, 54);
      ctx.quadraticCurveTo(-12, 54, -12, 40);
      ctx.lineTo(-12, -18);
      ctx.quadraticCurveTo(-12, -42, 0, -60);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // Narrow catch zone along the nose/fuselage so the player aims
    // intentionally — wings won't accidentally scoop adjacent letters.
    getCatchBox() {
      const w = 38;
      return {
        x: this.x - w / 2,
        y: this.y - this.height / 2,
        w,
        h: this.height * 0.55,
      };
    }
  }

  global.NikudPlane = Plane;
})(window);
