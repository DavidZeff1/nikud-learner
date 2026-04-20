(function (global) {
  "use strict";

  // Emoji-style plane: swept-back wings, sleek fuselage, cockpit window.
  class Plane {
    constructor(canvas) {
      this.canvas = canvas;
      this.width = 140;
      this.height = 140;
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

      // Soft ground shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.beginPath();
      ctx.ellipse(0, 64, 50, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // === MAIN WINGS (swept back from nose toward tail) ===
      ctx.fillStyle = "#e8ecf1";
      ctx.beginPath();
      ctx.moveTo(0, -22); // wing root near cockpit
      ctx.lineTo(-82, 30); // left wingtip (swept)
      ctx.lineTo(-78, 36); // trailing edge
      ctx.lineTo(-10, 20); // trailing edge inner
      ctx.lineTo(0, 24);
      ctx.lineTo(10, 20);
      ctx.lineTo(78, 36);
      ctx.lineTo(82, 30);
      ctx.closePath();
      ctx.fill();

      // Wing leading-edge highlight
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(-80, 30);
      ctx.lineTo(-76, 32);
      ctx.lineTo(0, -14);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(80, 30);
      ctx.lineTo(76, 32);
      ctx.lineTo(0, -14);
      ctx.closePath();
      ctx.fill();

      // === TAIL WINGS (horizontal stabilizers) ===
      ctx.fillStyle = "#e8ecf1";
      ctx.beginPath();
      ctx.moveTo(0, 32);
      ctx.lineTo(-30, 52);
      ctx.lineTo(-27, 56);
      ctx.lineTo(-5, 48);
      ctx.lineTo(0, 50);
      ctx.lineTo(5, 48);
      ctx.lineTo(27, 56);
      ctx.lineTo(30, 52);
      ctx.closePath();
      ctx.fill();

      // Tail wing highlight
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(0, 32);
      ctx.lineTo(-29, 52);
      ctx.lineTo(-27, 53);
      ctx.lineTo(0, 35);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, 32);
      ctx.lineTo(29, 52);
      ctx.lineTo(27, 53);
      ctx.lineTo(0, 35);
      ctx.closePath();
      ctx.fill();

      // === FUSELAGE (sleek teardrop) ===
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(0, -74); // nose tip
      ctx.bezierCurveTo(12, -60, 13, -30, 12, -10);
      ctx.bezierCurveTo(13, 15, 11, 40, 9, 52);
      ctx.quadraticCurveTo(5, 60, 0, 60); // tail cone
      ctx.quadraticCurveTo(-5, 60, -9, 52);
      ctx.bezierCurveTo(-11, 40, -13, 15, -12, -10);
      ctx.bezierCurveTo(-13, -30, -12, -60, 0, -74);
      ctx.closePath();
      ctx.fill();

      // Fuselage side shading for depth
      const grad = ctx.createLinearGradient(-13, 0, 13, 0);
      grad.addColorStop(0, "rgba(160, 175, 195, 0.55)");
      grad.addColorStop(0.35, "rgba(255, 255, 255, 0)");
      grad.addColorStop(0.65, "rgba(255, 255, 255, 0)");
      grad.addColorStop(1, "rgba(160, 175, 195, 0.55)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, -74);
      ctx.bezierCurveTo(12, -60, 13, -30, 12, -10);
      ctx.bezierCurveTo(13, 15, 11, 40, 9, 52);
      ctx.quadraticCurveTo(5, 60, 0, 60);
      ctx.quadraticCurveTo(-5, 60, -9, 52);
      ctx.bezierCurveTo(-11, 40, -13, 15, -12, -10);
      ctx.bezierCurveTo(-13, -30, -12, -60, 0, -74);
      ctx.closePath();
      ctx.fill();

      // === COCKPIT WINDOW ===
      ctx.fillStyle = "#3a6a95";
      ctx.beginPath();
      ctx.ellipse(0, -48, 5.5, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cockpit glass shine
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.beginPath();
      ctx.ellipse(-1.8, -52, 1.6, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Nose highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.beginPath();
      ctx.ellipse(-2, -65, 1.5, 5, -0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    getCatchBox() {
      const w = 40;
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
