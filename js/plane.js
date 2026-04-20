(function (global) {
  "use strict";

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

      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.beginPath();
      ctx.ellipse(0, 58, 50, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";

      // === MAIN WINGS (tapered) ===
      ctx.beginPath();
      ctx.moveTo(-75, 5);
      ctx.lineTo(-10, 0);
      ctx.lineTo(0, 8);
      ctx.lineTo(10, 0);
      ctx.lineTo(75, 5);
      ctx.lineTo(65, 15);
      ctx.lineTo(10, 10);
      ctx.lineTo(0, 14);
      ctx.lineTo(-10, 10);
      ctx.lineTo(-65, 15);
      ctx.closePath();
      ctx.fill();

      // === TAIL WINGS ===
      ctx.beginPath();
      ctx.moveTo(-30, 42);
      ctx.lineTo(30, 42);
      ctx.lineTo(22, 50);
      ctx.lineTo(-22, 50);
      ctx.closePath();
      ctx.fill();

      // === VERTICAL TAIL FIN ===
      ctx.beginPath();
      ctx.moveTo(0, 18);
      ctx.lineTo(10, 45);
      ctx.lineTo(-10, 45);
      ctx.closePath();
      ctx.fill();

      // === FUSELAGE (sleeker) ===
      ctx.beginPath();
      ctx.moveTo(0, -70); // nose
      ctx.quadraticCurveTo(14, -40, 12, -10);
      ctx.lineTo(10, 42);
      ctx.quadraticCurveTo(0, 58, -10, 42);
      ctx.lineTo(-12, -10);
      ctx.quadraticCurveTo(-14, -40, 0, -70);
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
