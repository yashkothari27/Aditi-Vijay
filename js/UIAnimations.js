/**
 * UIAnimations — GSAP ScrollTrigger Reveal Animations
 * Handles text reveals, section entries, staggered card animations,
 * project hover effects, magnetic buttons, and skills slider nav.
 */
class UIAnimations {
  constructor() {
    this.magneticElements = [];
  }

  init() {
    this.setupReveals();
    this.setupStaggerReveals();
    this.setupSkillsSlider();
    this.setupMagneticButtons();
    this.setupCopyEmail();
    this.setupCinematicCanvas();
    this.setupNavSmooth();
  }

  setupReveals() {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          el.classList.add('revealed');
        }
      });
    });
  }

  setupStaggerReveals() {
    const staggerGroups = document.querySelectorAll('.reveal-stagger');
    staggerGroups.forEach((group) => {
      const children = group.children;
      ScrollTrigger.create({
        trigger: group,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          group.classList.add('revealed');
          Array.from(children).forEach((child, i) => {
            child.style.transitionDelay = (i * 0.08) + 's';
          });
        }
      });
    });
  }

  setupSkillsSlider() {
    const slider = document.getElementById('skills-slider');
    const prevBtn = document.getElementById('skills-prev');
    const nextBtn = document.getElementById('skills-next');
    if (!slider || !prevBtn || !nextBtn) return;

    const scrollAmount = 320;

    prevBtn.addEventListener('click', () => {
      slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  }

  setupMagneticButtons() {
    const magneticEls = document.querySelectorAll('.magnetic');
    
    // Only on non-touch devices
    if ('ontouchstart' in window) return;

    magneticEls.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.05)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  setupCopyEmail() {
    const copyBtn = document.getElementById('copy-email-btn');
    if (!copyBtn) return;

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('aditivijay642@gmail.com').then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = 'aditivijay642@gmail.com';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy Email';
          copyBtn.classList.remove('copied');
        }, 2000);
      });
    });
  }

  setupCinematicCanvas() {
    const canvas = document.getElementById('cinematic-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animId;

    function resize() {
      width = canvas.parentElement.offsetWidth;
      height = canvas.parentElement.offsetHeight;
      canvas.width = width * (Math.min(window.devicePixelRatio, 2));
      canvas.height = height * (Math.min(window.devicePixelRatio, 2));
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(Math.min(window.devicePixelRatio, 2), Math.min(window.devicePixelRatio, 2));
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < 60; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.4 + 0.1,
          hue: Math.random() > 0.5 ? 0 : 300,
        });
      }
    }

    function render() {
      ctx.clearRect(0, 0, width, height);
      
      // Dark gradient bg
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, 'rgba(10, 10, 10, 1)');
      grad.addColorStop(0.5, 'rgba(20, 10, 15, 1)');
      grad.addColorStop(1, 'rgba(10, 10, 10, 1)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Particles
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.hue === 0 ? '#ff6b6b' : '#d946ef';
        ctx.fill();
        
        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = p.hue === 0 
          ? `rgba(255, 107, 107, ${p.opacity * 0.15})` 
          : `rgba(217, 70, 239, ${p.opacity * 0.15})`;
        ctx.fill();
        ctx.restore();
      }

      // Draw some subtle light streaks
      ctx.save();
      ctx.globalAlpha = 0.08;
      const time = Date.now() * 0.0002;
      for (let i = 0; i < 3; i++) {
        const sx = Math.sin(time + i * 2) * width * 0.4 + width * 0.5;
        const sy = 0;
        const ex = Math.cos(time + i * 1.5) * width * 0.4 + width * 0.5;
        const ey = height;
        
        const lineGrad = ctx.createLinearGradient(sx, sy, ex, ey);
        lineGrad.addColorStop(0, 'rgba(255, 107, 107, 0)');
        lineGrad.addColorStop(0.5, i % 2 === 0 ? 'rgba(255, 107, 107, 1)' : 'rgba(217, 70, 239, 1)');
        lineGrad.addColorStop(1, 'rgba(255, 107, 107, 0)');
        
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    }

    resize();
    createParticles();

    // Only animate when in view
    ScrollTrigger.create({
      trigger: canvas.parentElement,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => { if (!animId) render(); },
      onLeave: () => { cancelAnimationFrame(animId); animId = null; },
      onEnterBack: () => { if (!animId) render(); },
      onLeaveBack: () => { cancelAnimationFrame(animId); animId = null; },
    });

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });
  }

  setupNavSmooth() {
    const navLinks = document.querySelectorAll('.nav__links a, .footer__column a[href^="#"]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            // Use Lenis if available through global
            if (window.__scroller && window.__scroller.lenis) {
              window.__scroller.scrollTo(target);
            } else {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      });
    });
  }
}
