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

    // 10. Creative Work — video lightbox
    const lightbox = document.getElementById('video-lightbox');
    const lightboxVideo = document.getElementById('lightbox-video');
    const lightboxClose = document.getElementById('video-lightbox-close');

    document.querySelectorAll('.creative-card--video').forEach(card => {
      card.addEventListener('click', () => {
        const src = card.dataset.video;
        if (!src) return;
        lightboxVideo.src = src;
        lightbox.classList.add('active');
        lightboxVideo.play();
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      lightboxVideo.pause();
      lightboxVideo.src = '';
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  });
})();
