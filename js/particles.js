(function(global) {
  'use strict';

  class ParticleSystem {
    constructor() {
      this.particles = [];
    }

    burst(x, y, color, count) {
      count = count || 24;
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 120 + Math.random() * 220;
        this.particles.push({
          x, y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - 80,
          life: 0.85,
          maxLife: 0.85,
          color,
          size: 3 + Math.random() * 4,
        });
      }
    }

    update(dt) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 480 * dt;
        p.life -= dt;
        if (p.life <= 0) this.particles.splice(i, 1);
      }
    }

    draw(ctx) {
      for (const p of this.particles) {
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  global.NikudParticles = ParticleSystem;
})(window);
