/**
 * KeywordCatchGame — The SEO Mini-Game
 * Player controls a search bar to catch good keywords and avoid spam.
 * Full game loop with touch support, scoring, particle effects, and share.
 */

// Polyfill for roundRect (older browsers)
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
    const r = typeof radii === 'number' ? radii : (Array.isArray(radii) ? radii[0] : 0);
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
  };
}
class KeywordCatchGame {
  constructor(smoothScroller) {
    this.scroller = smoothScroller;
    this.overlay = document.getElementById('game-overlay');
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.scoreEl = document.getElementById('game-score');
    this.gameOverEl = document.getElementById('game-over');
    this.finalScoreEl = document.getElementById('game-final-score');
    this.gameOverMessage = document.getElementById('game-over-message');
    this.shareLink = document.getElementById('game-share');
    this.playBtn = document.getElementById('game-play-btn');
    this.closeBtn = document.getElementById('game-close');
    this.restartBtn = document.getElementById('game-restart');
    
    // Game state
    this.isRunning = false;
    this.isPaused = false;
    this.score = 0;
    this.animId = null;
    this.lastTime = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 1200;
    this.difficulty = 1;
    
    // Game objects
    this.player = { x: 0, y: 0, width: 140, height: 40, targetX: 0 };
    this.keywords = [];
    this.particles = [];
    
    // Input
    this.keys = { left: false, right: false };
    this.touchStartX = 0;
    this.touchCurrentX = 0;
    this.isTouching = false;
    
    // Keyword pools
    this.goodKeywords = [
      { text: 'SEO', value: 10 },
      { text: 'ROI', value: 10 },
      { text: 'CTR', value: 10 },
      { text: 'Engagement', value: 10 },
      { text: 'Conversion', value: 10 },
      { text: 'Analytics', value: 10 },
      { text: 'Content', value: 10 },
      { text: 'Strategy', value: 10 },
      { text: 'Growth', value: 10 },
      { text: 'Reach', value: 10 },
      { text: 'Leads', value: 10 },
      { text: 'Revenue', value: 10 },
    ];
    
    this.badKeywords = [
      { text: 'Clickbait' },
      { text: 'Bot Traffic' },
      { text: 'Spam' },
      { text: '404 Error' },
      { text: 'Ad Blocker' },
      { text: 'Bounce Rate' },
      { text: 'Fake Clicks' },
    ];
    
    // Leaderboard
    this.leaderboardKey = 'aditi_keyword_catch_scores';
    this.width = 0;
    this.height = 0;
  }

  init() {
    this.setupEventListeners();
    this.updateLeaderboardPreview();
  }

  setupEventListeners() {
    // Play button
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.open());
    }

    // Close button
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Restart button
    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => this.restart());
    }

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (!this.isRunning) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = true;
      if (e.key === 'Escape') this.close();
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = false;
    });

    // Touch
    if (this.canvas) {
      this.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.isTouching = true;
        this.touchStartX = e.touches[0].clientX;
        this.touchCurrentX = e.touches[0].clientX;
      }, { passive: false });

      this.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (this.isTouching) {
          this.touchCurrentX = e.touches[0].clientX;
        }
      }, { passive: false });

      this.canvas.addEventListener('touchend', () => {
        this.isTouching = false;
      });
    }
  }

  open() {
    if (!this.overlay) return;
    
    // Pause smooth scroll
    if (this.scroller) this.scroller.pause();
    
    this.overlay.classList.add('active');
    this.resize();
    this.reset();
    this.start();
  }

  close() {
    if (!this.overlay) return;
    
    this.stop();
    this.overlay.classList.remove('active');
    
    // Resume smooth scroll
    if (this.scroller) this.scroller.resume();
  }

  resize() {
    const maxW = Math.min(window.innerWidth - 40, 600);
    const maxH = Math.min(window.innerHeight * 0.7, 700);
    
    this.width = maxW;
    this.height = maxH;
    
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.scale(dpr, dpr);
  }

  reset() {
    this.score = 0;
    this.difficulty = 1;
    this.spawnTimer = 0;
    this.spawnInterval = 1200;
    this.keywords = [];
    this.particles = [];
    this.player.width = 140;
    this.player.height = 40;
    this.player.x = this.width / 2 - this.player.width / 2;
    this.player.y = this.height - 60;
    this.player.targetX = this.player.x;
    this.gameOverEl.classList.remove('active');
    this.updateScore();
  }

  start() {
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  restart() {
    this.gameOverEl.classList.remove('active');
    this.reset();
    this.start();
  }

  loop(now = performance.now()) {
    if (!this.isRunning) return;
    
    const dt = Math.min(now - this.lastTime, 50); // Cap delta
    this.lastTime = now;
    
    this.update(dt);
    this.draw();
    
    this.animId = requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    // Player movement
    const speed = 0.5;
    if (this.keys.left) {
      this.player.targetX -= speed * dt;
    }
    if (this.keys.right) {
      this.player.targetX += speed * dt;
    }

    // Touch movement
    if (this.isTouching) {
      const rect = this.canvas.getBoundingClientRect();
      const touchX = this.touchCurrentX - rect.left;
      this.player.targetX = touchX - this.player.width / 2;
    }

    // Clamp
    this.player.targetX = Math.max(0, Math.min(this.width - this.player.width, this.player.targetX));
    
    // Smooth movement
    this.player.x += (this.player.targetX - this.player.x) * 0.15;

    // Spawn keywords
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnKeyword();
      
      // Increase difficulty
      this.difficulty += 0.02;
      this.spawnInterval = Math.max(400, 1200 - this.difficulty * 40);
    }

    // Update keywords
    for (let i = this.keywords.length - 1; i >= 0; i--) {
      const kw = this.keywords[i];
      kw.y += kw.speed * dt * 0.06;
      kw.glow = Math.sin(performance.now() * 0.003 + i) * 0.3 + 0.7;

      // Check collision with player
      if (this.checkCollision(kw)) {
        if (kw.isGood) {
          this.score += kw.value;
          this.updateScore();
          this.spawnParticles(kw.x + kw.width / 2, kw.y, kw.color);
        } else {
          this.gameOver();
          return;
        }
        this.keywords.splice(i, 1);
        continue;
      }

      // Remove if off screen
      if (kw.y > this.height + 20) {
        this.keywords.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
      p.life -= dt * 0.003;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  spawnKeyword() {
    const isGood = Math.random() > 0.3;
    const pool = isGood ? this.goodKeywords : this.badKeywords;
    const item = pool[Math.floor(Math.random() * pool.length)];
    
    this.ctx.font = '600 14px "Archivo Narrow", sans-serif';
    const textWidth = this.ctx.measureText(item.text).width;
    const kwWidth = textWidth + 24;
    const kwHeight = 30;
    
    const x = Math.random() * (this.width - kwWidth);
    
    this.keywords.push({
      text: item.text,
      x,
      y: -kwHeight,
      width: kwWidth,
      height: kwHeight,
      speed: (1.5 + this.difficulty * 0.3 + Math.random()) * (isGood ? 1 : 1.2),
      isGood,
      value: item.value || 0,
      color: isGood 
        ? (Math.random() > 0.5 ? '#ff6b6b' : '#22c55e') 
        : '#ef4444',
      glow: 1,
    });
  }

  checkCollision(kw) {
    return (
      kw.x < this.player.x + this.player.width &&
      kw.x + kw.width > this.player.x &&
      kw.y < this.player.y + this.player.height &&
      kw.y + kw.height > this.player.y
    );
  }

  spawnParticles(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 3 + 1,
        color,
        life: 1,
      });
    }
  }

  draw() {
    const ctx = this.ctx;
    
    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle grid background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // Draw particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    }

    // Draw keywords
    for (const kw of this.keywords) {
      // Trail effect
      ctx.save();
      ctx.globalAlpha = 0.15 * kw.glow;
      ctx.fillStyle = kw.color;
      ctx.beginPath();
      const trailH = 15;
      ctx.roundRect(kw.x - 2, kw.y - trailH, kw.width + 4, kw.height + trailH, 8);
      ctx.fill();
      ctx.restore();

      // Keyword pill
      ctx.save();
      ctx.globalAlpha = 0.9;
      
      // Background
      ctx.fillStyle = kw.isGood ? 'rgba(255, 255, 255, 0.08)' : 'rgba(239, 68, 68, 0.15)';
      ctx.beginPath();
      ctx.roundRect(kw.x, kw.y, kw.width, kw.height, 8);
      ctx.fill();
      
      // Border
      ctx.strokeStyle = kw.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(kw.x, kw.y, kw.width, kw.height, 8);
      ctx.stroke();
      
      // Text
      ctx.fillStyle = kw.color;
      ctx.font = '600 14px "Archivo Narrow", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(kw.text, kw.x + kw.width / 2, kw.y + kw.height / 2);
      ctx.restore();
    }

    // Draw player (search bar)
    this.drawPlayer(ctx);
  }

  drawPlayer(ctx) {
    const p = this.player;
    const pulse = Math.sin(performance.now() * 0.004) * 0.15 + 0.85;

    // Aura glow
    ctx.save();
    ctx.globalAlpha = 0.15 * pulse;
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.roundRect(p.x - 8, p.y - 8, p.width + 16, p.height + 16, 16);
    ctx.fill();
    ctx.restore();

    // Search bar body
    ctx.save();
    ctx.fillStyle = 'rgba(255, 107, 107, 0.1)';
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.width, p.height, 10);
    ctx.fill();
    
    ctx.strokeStyle = `rgba(255, 107, 107, ${0.6 + pulse * 0.4})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.width, p.height, 10);
    ctx.stroke();
    ctx.restore();

    // Magnifying glass icon
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 107, 107, 0.8)';
    ctx.lineWidth = 2;
    const iconX = p.x + 16;
    const iconY = p.y + p.height / 2;
    ctx.beginPath();
    ctx.arc(iconX, iconY - 1, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(iconX + 4.5, iconY + 3.5);
    ctx.lineTo(iconX + 8, iconY + 7);
    ctx.stroke();
    ctx.restore();

    // Search text
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '400 12px "JetBrains Mono", monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText('catch keywords...', p.x + 32, p.y + p.height / 2);
    ctx.restore();
  }

  updateScore() {
    if (this.scoreEl) {
      this.scoreEl.textContent = this.score;
    }
  }

  gameOver() {
    this.isRunning = false;
    
    // Save score
    this.saveScore(this.score);
    this.updateLeaderboardPreview();

    // Show game over screen
    if (this.finalScoreEl) {
      this.finalScoreEl.textContent = `Score: ${this.score}`;
    }

    // High score message
    let message = '';
    if (this.score >= 100) {
      message = `You'd make a great SEO strategist! <a href="#contact">Let's connect.</a>`;
    } else if (this.score >= 50) {
      message = 'Great run! Your marketing instincts are sharp.';
    } else {
      message = 'The keyword game is tough! Give it another shot.';
    }
    if (this.gameOverMessage) {
      this.gameOverMessage.innerHTML = message;
    }

    // Share link
    if (this.shareLink) {
      const tweet = encodeURIComponent(
        `I scored ${this.score} on Aditi Vijay's Keyword Catch game! Can you beat it? #DigitalMarketing #SEO`
      );
      this.shareLink.href = `https://twitter.com/intent/tweet?text=${tweet}`;
    }

    this.gameOverEl.classList.add('active');
  }

  saveScore(score) {
    try {
      let scores = JSON.parse(localStorage.getItem(this.leaderboardKey) || '[]');
      scores.push({ score, time: Date.now() });
      scores.sort((a, b) => b.score - a.score);
      scores = scores.slice(0, 10); // Keep top 10
      localStorage.setItem(this.leaderboardKey, JSON.stringify(scores));
    } catch (e) {
      // Storage unavailable
    }
  }

  getTopScores(count = 3) {
    try {
      const scores = JSON.parse(localStorage.getItem(this.leaderboardKey) || '[]');
      return scores.slice(0, count);
    } catch (e) {
      return [];
    }
  }

  updateLeaderboardPreview() {
    const container = document.getElementById('leaderboard-entries');
    if (!container) return;

    const scores = this.getTopScores(3);
    if (scores.length === 0) {
      container.innerHTML = '<p class="leaderboard-entry" style="color: var(--color-text-muted);">No scores yet. Be the first!</p>';
      return;
    }

    container.innerHTML = scores.map((s, i) => 
      `<p class="leaderboard-entry"><span class="rank">#${i + 1}</span> <span class="score">${s.score} pts</span></p>`
    ).join('');
  }
}
