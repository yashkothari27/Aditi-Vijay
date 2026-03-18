/**
 * MarketingPulse — Live HQ Clock, Session Timer, and Metrics Widget
 * Displays IST (Jaipur) time, session duration, and coffee counter.
 */
class MarketingPulse {
  constructor() {
    this.el = document.getElementById('marketing-pulse');
    this.sessionStart = Date.now();
    this.intervalId = null;
    this.visitorCount = 0;
    this.coffeeCount = 847;
  }

  init(visitorCount) {
    this.visitorCount = visitorCount || 0;
    this.update();
    this.intervalId = setInterval(() => this.update(), 1000);
  }

  update() {
    if (!this.el) return;

    // IST Time (UTC+5:30)
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const ist = new Date(utc + 5.5 * 3600000);
    const hours = ist.getHours().toString().padStart(2, '0');
    const minutes = ist.getMinutes().toString().padStart(2, '0');
    const seconds = ist.getSeconds().toString().padStart(2, '0');

    // Session Duration
    const elapsed = Math.floor((Date.now() - this.sessionStart) / 1000);
    const sessionMin = Math.floor(elapsed / 60);
    const sessionSec = elapsed % 60;

    this.el.innerHTML = 
      `IST: ${hours}:${minutes}:${seconds}` +
      `<span>|</span>` +
      `Session: ${sessionMin}m ${sessionSec}s` +
      `<span>|</span>` +
      `Fueled by ${this.coffeeCount} cups of coffee`;
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
