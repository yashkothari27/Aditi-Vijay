/**
 * Guestbook — Interactive "Wall of Connections"
 * Allows visitors to leave name + message, stored in localStorage.
 * Displays entries as a horizontal scrolling ticker.
 */
class Guestbook {
  constructor() {
    this.storageKey = 'aditi_portfolio_guestbook';
    this.form = document.getElementById('guestbook-form');
    this.nameInput = document.getElementById('guestbook-name');
    this.messageInput = document.getElementById('guestbook-message');
    this.countEl = document.getElementById('guestbook-count');
    this.tickerEl = document.getElementById('guestbook-ticker');
    this.tickerWrapper = document.getElementById('guestbook-ticker-wrapper');
    this.entries = [];
  }

  init() {
    this.loadEntries();
    this.renderTicker();
    this.updateCount();
    this.setupForm();
  }

  loadEntries() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.entries = stored ? JSON.parse(stored) : [];
    } catch (e) {
      this.entries = [];
    }
    
    // If empty, add some starter entries
    if (this.entries.length === 0) {
      this.entries = [
        { name: 'Yash K.', message: 'Amazing portfolio! The game is addictive.', time: Date.now() - 86400000 },
        { name: 'Priya S.', message: 'Love the Signal Engine animation!', time: Date.now() - 43200000 },
        { name: 'Arjun M.', message: 'Clean design. Great work, Aditi!', time: Date.now() - 21600000 },
      ];
      this.saveEntries();
    }
  }

  saveEntries() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
    } catch (e) {
      // Storage full or unavailable
    }
  }

  updateCount() {
    if (this.countEl) {
      this.countEl.textContent = `${this.entries.length} professionals have connected`;
    }
  }

  renderTicker() {
    if (!this.tickerEl || this.entries.length === 0) {
      if (this.tickerWrapper) this.tickerWrapper.style.display = 'none';
      return;
    }

    if (this.tickerWrapper) this.tickerWrapper.style.display = 'block';

    // Duplicate entries for seamless loop
    const allEntries = [...this.entries, ...this.entries];
    
    this.tickerEl.innerHTML = allEntries.map(entry => 
      `<div class="guestbook__entry">
        <span class="guestbook__entry-name">${this.escapeHTML(entry.name)}</span>: 
        ${this.escapeHTML(entry.message)}
      </div>`
    ).join('');

    // Adjust animation duration based on entry count
    const duration = Math.max(20, this.entries.length * 5);
    this.tickerEl.style.animationDuration = duration + 's';
  }

  escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  setupForm() {
    if (!this.form) return;

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = this.nameInput.value.trim();
      const message = this.messageInput.value.trim();
      
      if (!name || !message) return;
      if (message.length > 100) return;

      this.entries.push({
        name,
        message,
        time: Date.now()
      });

      this.saveEntries();
      this.updateCount();
      this.renderTicker();

      // Clear form
      this.nameInput.value = '';
      this.messageInput.value = '';

      // Brief visual feedback
      this.form.style.transform = 'scale(1.02)';
      setTimeout(() => {
        this.form.style.transform = '';
      }, 200);
    });
  }
}
