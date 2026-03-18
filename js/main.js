/**
 * Main App — Entry Point
 * Orchestrates initialization of all modules in sequence.
 */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', async () => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // 1. Loader — show loading screen
    const loader = new Loader();
    await loader.start();

    // 2. Smooth Scroller (Lenis)
    const scroller = new SmoothScroller();
    scroller.init();
    // Expose for nav link scrolling
    window.__scroller = scroller;

    // 3. Signal Experience (Dual-Canvas Hero)
    const signal = new SignalExperience();
    signal.init();

    // 4. Custom Cursor
    const cursor = new Cursor();
    cursor.init();

    // 5. UI Animations (GSAP reveals, magnetic, skills, copy email)
    const uiAnimations = new UIAnimations();
    uiAnimations.init();

    // 6. Visitor Manager
    const visitorManager = new VisitorManager();
    visitorManager.init();

    // 7. Guestbook
    const guestbook = new Guestbook();
    guestbook.init();

    // 8. Marketing Pulse Widget
    const pulse = new MarketingPulse();
    pulse.init(visitorManager.getVisitorCount());

    // 9. Keyword Catch Game
    const game = new KeywordCatchGame(scroller);
    game.init();
  });
})();
