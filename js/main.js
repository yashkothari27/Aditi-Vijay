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

    // 10. Creative Work — shared lightbox
    const lightbox = document.getElementById('video-lightbox');
    const lightboxVideo = document.getElementById('lightbox-video');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxPdf = document.getElementById('lightbox-pdf');
    const lightboxClose = document.getElementById('video-lightbox-close');

    [lightboxVideo, lightboxImage, lightboxPdf].forEach((mediaEl) => {
      mediaEl?.addEventListener('contextmenu', (event) => {
        event.preventDefault();
      });
    });

    lightboxImage?.addEventListener('dragstart', (event) => {
      event.preventDefault();
    });

    function openVideoLightbox(src) {
      if (!src) return;
      lightboxImage.hidden = true;
      lightboxImage.src = '';
      lightboxImage.alt = '';
      lightboxPdf.hidden = true;
      lightboxPdf.src = '';
      lightboxVideo.hidden = false;
      lightboxVideo.src = src;
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');

      const playPromise = lightboxVideo.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    }

    function openImageLightbox(src, alt = '') {
      if (!src) return;
      lightboxVideo.pause();
      lightboxVideo.src = '';
      lightboxVideo.hidden = true;
      lightboxPdf.hidden = true;
      lightboxPdf.src = '';
      lightboxImage.src = src;
      lightboxImage.alt = alt;
      lightboxImage.hidden = false;
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
    }

    function openPdfLightbox(src) {
      if (!src) return;
      lightboxVideo.pause();
      lightboxVideo.src = '';
      lightboxVideo.hidden = true;
      lightboxImage.src = '';
      lightboxImage.alt = '';
      lightboxImage.hidden = true;
      lightboxPdf.src = `${src}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
      lightboxPdf.hidden = false;
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
    }

    window.openCreativeVideo = openVideoLightbox;

    document.querySelectorAll('.creative-card--video').forEach(card => {
      const playButton = card.querySelector('.creative-card__play-btn');

      card.addEventListener('click', () => {
        openVideoLightbox(card.dataset.video);
      });

      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openVideoLightbox(card.dataset.video);
        }
      });

      playButton?.addEventListener('click', (event) => {
        event.stopPropagation();
        openVideoLightbox(card.dataset.video);
      });
    });

    document.querySelectorAll('.creative-card--image').forEach(card => {
      const image = card.querySelector('img');
      card.addEventListener('click', () => {
        openImageLightbox(card.dataset.image, image?.alt || '');
      });

      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openImageLightbox(card.dataset.image, image?.alt || '');
        }
      });
    });

    document.querySelectorAll('.creative-card--pdf').forEach(card => {
      card.addEventListener('click', () => {
        openPdfLightbox(card.dataset.pdf);
      });

      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openPdfLightbox(card.dataset.pdf);
        }
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
      lightboxVideo.pause();
      lightboxVideo.src = '';
      lightboxVideo.hidden = true;
      lightboxImage.src = '';
      lightboxImage.alt = '';
      lightboxImage.hidden = true;
      lightboxPdf.src = '';
      lightboxPdf.hidden = true;
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
