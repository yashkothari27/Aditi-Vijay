/**
 * Loader — Preload Manager & UI
 * Shows a percentage counter with cycling marketing messages,
 * then reveals the page with a smooth animation.
 */
class Loader {
  constructor() {
    this.el = document.getElementById('loader');
    this.percentageEl = document.getElementById('loader-percentage');
    this.messageEl = document.getElementById('loader-message');
    this.progress = 0;
    this.targetProgress = 100;
    this.messages = [
      'Optimizing keywords...',
      'Analyzing engagement...',
      'Boosting reach...',
      'Crafting the perfect CTA...',
      'A/B testing layouts...',
      'Syncing analytics...',
      'Calibrating conversions...',
      'Loading brand assets...',
    ];
    this.messageIndex = 0;
    this.messageInterval = null;
    this.onComplete = null;
  }

  start() {
    return new Promise((resolve) => {
      this.onComplete = resolve;
      this.cycleMessages();
      this.animate();
    });
  }

  cycleMessages() {
    this.messageInterval = setInterval(() => {
      this.messageIndex = (this.messageIndex + 1) % this.messages.length;
      this.messageEl.style.opacity = '0';
      setTimeout(() => {
        this.messageEl.textContent = this.messages[this.messageIndex];
        this.messageEl.style.opacity = '1';
      }, 200);
    }, 800);
  }

  animate() {
    const duration = 2000; // 2 seconds total
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Ease out quad
      const eased = 1 - (1 - t) * (1 - t);
      this.progress = Math.round(eased * this.targetProgress);
      this.percentageEl.textContent = this.progress + '%';

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        this.finish();
      }
    };

    requestAnimationFrame(tick);
  }

  finish() {
    clearInterval(this.messageInterval);
    this.percentageEl.textContent = '100%';
    
    setTimeout(() => {
      this.el.classList.add('loaded');
      setTimeout(() => {
        this.el.style.display = 'none';
        if (this.onComplete) this.onComplete();
      }, 1200);
    }, 300);
  }
}
