/**
 * SmoothScroller — Lenis Wrapper
 * Provides buttery smooth scrolling with pause/resume API for game state.
 */
class SmoothScroller {
  constructor() {
    this.lenis = null;
    this.isActive = true;
  }

  init() {
    this.lenis = new Lenis({
      lerp: 0.07,
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    // Sync with GSAP ScrollTrigger
    this.lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  pause() {
    if (this.lenis) {
      this.lenis.stop();
      this.isActive = false;
    }
  }

  resume() {
    if (this.lenis) {
      this.lenis.start();
      this.isActive = true;
    }
  }

  scrollTo(target, options = {}) {
    if (this.lenis) {
      this.lenis.scrollTo(target, options);
    }
  }

  destroy() {
    if (this.lenis) {
      this.lenis.destroy();
    }
  }
}
