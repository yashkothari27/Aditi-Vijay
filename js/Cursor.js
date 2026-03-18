/**
 * Cursor — Custom Cursor with Multi-State Support
 * Renders a dot + outline circle that follows the mouse on desktop.
 * States: default, pointer (links/buttons), crosshair (game play button).
 */
class Cursor {
  constructor() {
    this.dot = document.getElementById('cursor-dot');
    this.outline = document.getElementById('cursor-outline');
    this.mouseX = 0;
    this.mouseY = 0;
    this.dotX = 0;
    this.dotY = 0;
    this.outlineX = 0;
    this.outlineY = 0;
    this.isTouch = false;
  }

  init() {
    // Detect touch device
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      this.isTouch = true;
      return;
    }

    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    // Set cursor states for interactive elements
    this.setupHoverStates();

    // Start render loop
    this.render();
  }

  setupHoverStates() {
    // Pointer state for links and buttons
    const interactiveEls = document.querySelectorAll('a, button, .btn, .project-block, .skill-card, input, textarea');
    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', () => this.setState('pointer'));
      el.addEventListener('mouseleave', () => this.setState('default'));
    });

    // Crosshair state for game play button
    const gameBtn = document.getElementById('game-play-btn');
    if (gameBtn) {
      gameBtn.addEventListener('mouseenter', () => this.setState('crosshair'));
      gameBtn.addEventListener('mouseleave', () => this.setState('default'));
    }
  }

  setState(state) {
    this.dot.className = 'cursor-dot';
    this.outline.className = 'cursor-outline';
    if (state !== 'default') {
      this.dot.classList.add(state);
      this.outline.classList.add(state);
    }
  }

  render() {
    // Smooth lerp for dot (fast)
    this.dotX += (this.mouseX - this.dotX) * 0.25;
    this.dotY += (this.mouseY - this.dotY) * 0.25;
    
    // Smooth lerp for outline (slower, creates trail effect)
    this.outlineX += (this.mouseX - this.outlineX) * 0.12;
    this.outlineY += (this.mouseY - this.outlineY) * 0.12;

    this.dot.style.left = this.dotX + 'px';
    this.dot.style.top = this.dotY + 'px';
    this.outline.style.left = this.outlineX + 'px';
    this.outline.style.top = this.outlineY + 'px';

    requestAnimationFrame(() => this.render());
  }
}
