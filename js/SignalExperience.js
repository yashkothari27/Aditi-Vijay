/**
 * SignalExperience — Dual-Canvas Procedural Signal Engine
 * Renders an animated particle network with marketing iconography.
 * Foreground canvas: sharp, masked. Ambient canvas: zoomed, blurred.
 * Scroll progress drives animation state via GSAP ScrollTrigger.
 */
class SignalExperience {
  constructor() {
    this.fgCanvas = document.getElementById('signal-canvas');
    this.bgCanvas = document.getElementById('ambient-canvas');
    this.fgCtx = this.fgCanvas.getContext('2d');
    this.bgCtx = this.bgCanvas.getContext('2d');
    this.scrollCue = document.getElementById('hero-scroll-cue');
    this.particles = [];
    this.connections = [];
    this.progress = 0;
    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.particleCount = 120;
    this.icons = ['◉', '⬡', '△', '◇', '▢', '⊕', '⊗', '⊙', '⬢', '⬟'];
    this.animId = null;
    this.time = 0;
  }

  init() {
    this.resize();
    this.createParticles();
    this.setupScrollTrigger();
    this.render();
    
    window.addEventListener('resize', this.debounce(() => this.resize(), 200));
  }

  debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Foreground canvas
    this.fgCanvas.width = this.width * this.dpr;
    this.fgCanvas.height = this.height * this.dpr;
    this.fgCanvas.style.width = this.width + 'px';
    this.fgCanvas.style.height = this.height + 'px';
    this.fgCtx.scale(this.dpr, this.dpr);

    // Ambient canvas
    this.bgCanvas.width = this.width * this.dpr;
    this.bgCanvas.height = this.height * this.dpr;
    this.bgCanvas.style.width = (this.width * 1.1) + 'px';
    this.bgCanvas.style.height = (this.height * 1.1) + 'px';
    this.bgCtx.scale(this.dpr, this.dpr);
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        baseX: Math.random() * this.width,
        baseY: Math.random() * this.height,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.1,
        angle: Math.random() * Math.PI * 2,
        orbit: Math.random() * 60 + 20,
        icon: this.icons[Math.floor(Math.random() * this.icons.length)],
        isIcon: Math.random() > 0.7,
        opacity: 0,
        targetOpacity: Math.random() * 0.6 + 0.2,
        hue: Math.random() > 0.5 ? 0 : 300, // coral or magenta
        activateAt: Math.random() * 0.6, // scroll progress when this appears
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  setupScrollTrigger() {
    ScrollTrigger.create({
      trigger: '#signal-section',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        this.progress = self.progress;
        
        // Show scroll cue around midway
        if (this.scrollCue) {
          if (this.progress > 0.02 && this.progress < 0.5) {
            this.scrollCue.classList.add('visible');
          } else {
            this.scrollCue.classList.remove('visible');
          }
        }
      }
    });
  }

  drawParticle(ctx, p) {
    if (p.opacity < 0.01) return;
    
    if (p.isIcon && this.progress > 0.3) {
      ctx.save();
      ctx.globalAlpha = p.opacity * Math.min(1, (this.progress - 0.3) * 3);
      ctx.font = `${p.size * 5}px Arial`;
      ctx.fillStyle = p.hue === 0 
        ? `rgba(255, 107, 107, ${p.opacity})` 
        : `rgba(217, 70, 239, ${p.opacity})`;
      ctx.fillText(p.icon, p.x, p.y);
      ctx.restore();
    } else {
      // Glow
      ctx.save();
      ctx.globalAlpha = p.opacity * 0.3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      ctx.fillStyle = p.hue === 0 
        ? `rgba(255, 107, 107, 0.15)` 
        : `rgba(217, 70, 239, 0.15)`;
      ctx.fill();
      ctx.restore();

      // Core
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.hue === 0 
        ? `rgb(255, 107, 107)` 
        : `rgb(217, 70, 239)`;
      ctx.fill();
      ctx.restore();
    }
  }

  drawConnections(ctx) {
    const maxDist = 150 + this.progress * 100;
    const activeParticles = this.particles.filter(p => p.opacity > 0.1);
    
    for (let i = 0; i < activeParticles.length; i++) {
      for (let j = i + 1; j < activeParticles.length; j++) {
        const a = activeParticles[i];
        const b = activeParticles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < maxDist) {
          const lineOpacity = (1 - dist / maxDist) * 0.15 * Math.min(a.opacity, b.opacity);
          ctx.save();
          ctx.globalAlpha = lineOpacity;
          ctx.strokeStyle = a.hue === 0 
            ? `rgb(255, 107, 107)` 
            : `rgb(217, 70, 239)`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  drawEnergyTrails(ctx) {
    if (this.progress < 0.1) return;
    
    const trailCount = Math.floor(this.progress * 8);
    const trailOpacity = Math.min(this.progress * 0.5, 0.25);

    for (let i = 0; i < trailCount; i++) {
      const startX = (Math.sin(this.time * 0.3 + i * 1.7) * 0.3 + 0.5) * this.width;
      const startY = (Math.cos(this.time * 0.2 + i * 2.1) * 0.3 + 0.5) * this.height;
      const cpX = this.width * 0.5 + Math.sin(this.time * 0.1 + i) * this.width * 0.3;
      const cpY = this.height * 0.5 + Math.cos(this.time * 0.15 + i) * this.height * 0.3;
      const endX = (Math.cos(this.time * 0.25 + i * 1.3) * 0.4 + 0.5) * this.width;
      const endY = (Math.sin(this.time * 0.35 + i * 0.9) * 0.4 + 0.5) * this.height;

      ctx.save();
      ctx.globalAlpha = trailOpacity;
      ctx.strokeStyle = i % 2 === 0 
        ? `rgba(255, 107, 107, 0.6)` 
        : `rgba(217, 70, 239, 0.6)`;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(cpX, cpY, endX, endY);
      ctx.stroke();
      ctx.restore();
    }
  }

  update() {
    this.time += 0.008;
    
    for (const p of this.particles) {
      // Activate based on scroll progress
      if (this.progress > p.activateAt) {
        p.opacity += (p.targetOpacity - p.opacity) * 0.02;
      } else {
        p.opacity += (0 - p.opacity) * 0.05;
      }

      // Orbit motion
      p.angle += p.speed * 0.02;
      const pulse = Math.sin(this.time * 2 + p.pulsePhase) * 0.3 + 0.7;
      const orbitScale = p.orbit * (0.5 + this.progress * 0.5) * pulse;
      
      p.x = p.baseX + Math.cos(p.angle) * orbitScale;
      p.y = p.baseY + Math.sin(p.angle) * orbitScale;

      // Converge toward center as progress increases
      if (this.progress > 0.5) {
        const converge = (this.progress - 0.5) * 0.3;
        p.x += (this.width * 0.5 - p.x) * converge * 0.01;
        p.y += (this.height * 0.5 - p.y) * converge * 0.01;
      }
    }
  }

  render() {
    this.update();

    // Clear both canvases
    this.fgCtx.clearRect(0, 0, this.width, this.height);
    this.bgCtx.clearRect(0, 0, this.width, this.height);

    // Draw ambient background
    this.bgCtx.fillStyle = 'rgba(10, 10, 10, 0.92)';
    this.bgCtx.fillRect(0, 0, this.width, this.height);

    // Draw energy trails on both
    this.drawEnergyTrails(this.fgCtx);
    this.drawEnergyTrails(this.bgCtx);

    // Draw connections
    this.drawConnections(this.fgCtx);
    this.drawConnections(this.bgCtx);

    // Draw particles
    for (const p of this.particles) {
      this.drawParticle(this.fgCtx, p);
      this.drawParticle(this.bgCtx, p);
    }

    // Vignette on background
    const grad = this.bgCtx.createRadialGradient(
      this.width * 0.5, this.height * 0.5, this.width * 0.2,
      this.width * 0.5, this.height * 0.5, this.width * 0.7
    );
    grad.addColorStop(0, 'rgba(10, 10, 10, 0)');
    grad.addColorStop(1, 'rgba(10, 10, 10, 0.5)');
    this.bgCtx.fillStyle = grad;
    this.bgCtx.fillRect(0, 0, this.width, this.height);

    this.animId = requestAnimationFrame(() => this.render());
  }

  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
  }
}
