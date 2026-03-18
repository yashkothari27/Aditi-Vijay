/**
 * VisitorManager — Visitor Counting, Greeting, and Time Personalization
 * Uses localStorage for visitor counter persistence.
 * Personalizes hero text based on time-of-day.
 */
class VisitorManager {
  constructor() {
    this.visitorCount = 0;
    this.storageKey = 'aditi_portfolio_visitor_count';
    this.visitedKey = 'aditi_portfolio_visited';
    this.pill = document.getElementById('visitor-pill');
    this.toast = document.getElementById('visitor-toast');
    this.heroGreeting = document.getElementById('hero-greeting');
    this.heroLine1 = document.getElementById('hero-line1');
  }

  init() {
    this.loadVisitorCount();
    this.updatePill();
    this.personalizeHero();
    this.showGreeting();
  }

  loadVisitorCount() {
    let count = parseInt(localStorage.getItem(this.storageKey) || '0', 10);
    const visited = localStorage.getItem(this.visitedKey);
    
    if (!visited) {
      count++;
      localStorage.setItem(this.storageKey, count.toString());
      localStorage.setItem(this.visitedKey, 'true');
    }
    
    this.visitorCount = count;
  }

  updatePill() {
    if (this.pill) {
      this.pill.textContent = `Visitors: ${this.visitorCount}`;
    }
  }

  getVisitorCount() {
    return this.visitorCount;
  }

  personalizeHero() {
    const hour = new Date().getHours();
    let greeting;

    if (hour >= 5 && hour < 12) {
      greeting = 'GOOD MORNING, EXPLORER';
    } else if (hour >= 12 && hour < 17) {
      greeting = 'GOOD AFTERNOON, EXPLORER';
    } else if (hour >= 17 && hour < 21) {
      greeting = 'GOOD EVENING, EXPLORER';
    } else {
      greeting = 'BURNING THE MIDNIGHT OIL?';
    }

    if (this.heroGreeting) {
      this.heroGreeting.textContent = greeting;
    }
    if (this.heroLine1) {
      this.heroLine1.textContent = greeting;
    }
  }

  showGreeting() {
    const visited = localStorage.getItem(this.visitedKey + '_shown');
    if (visited) return;
    
    localStorage.setItem(this.visitedKey + '_shown', 'true');

    if (this.toast) {
      this.toast.textContent = `Welcome! You're visitor #${this.visitorCount}. Explore Aditi's world of digital marketing.`;
      
      setTimeout(() => {
        this.toast.classList.add('visible');
        
        setTimeout(() => {
          this.toast.classList.remove('visible');
        }, 5000);
      }, 3000);
    }
  }
}
