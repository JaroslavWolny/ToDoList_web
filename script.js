/* ============================================================
   QuestDo — Promotional Landing Page
   Interactive Scripts
   ============================================================ */

(function () {
  'use strict';

  // ──────────── Particle Canvas Background ────────────
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.hue = Math.random() > 0.5 ? 250 : 220; // purple or blue
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.opacity})`;
      ctx.fill();
    }
  }

  function initParticles() {
    resizeCanvas();
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 15000), 80);
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          const opacity = (1 - distance / 120) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124, 92, 252, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    drawConnections();
    animationId = requestAnimationFrame(animateParticles);
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    // Re-init particles on significant resize
    if (Math.abs(particles.length - Math.floor((canvas.width * canvas.height) / 15000)) > 10) {
      initParticles();
    }
  });

  initParticles();
  animateParticles();

  // ──────────── Scroll-Reveal (Intersection Observer) ────────────
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  revealElements.forEach(el => revealObserver.observe(el));

  // ──────────── Navbar Scroll Effect ────────────
  const nav = document.getElementById('nav');
  let lastScrollY = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    lastScrollY = scrollY;
  }, { passive: true });

  // ──────────── Mobile Nav Toggle ────────────
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      navToggle.classList.toggle('active');
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        navToggle.classList.remove('active');
      });
    });
  }

  // ──────────── Showcase Carousel Dots ────────────
  const showcaseTrack = document.getElementById('showcase-track');
  const showcaseDots = document.querySelectorAll('.showcase__dot');

  if (showcaseTrack && showcaseDots.length) {
    const updateDots = () => {
      const items = showcaseTrack.querySelectorAll('.showcase__item');
      if (!items.length) return;

      const scrollLeft = showcaseTrack.scrollLeft;
      const itemWidth = items[0].offsetWidth + 32; // gap
      const activeIndex = Math.round(scrollLeft / itemWidth);

      showcaseDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIndex);
      });
    };

    showcaseTrack.addEventListener('scroll', updateDots, { passive: true });

    showcaseDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.dataset.index, 10);
        const items = showcaseTrack.querySelectorAll('.showcase__item');
        if (items[index]) {
          items[index].scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest',
          });
        }
      });
    });
  }

  // ──────────── Smooth Scroll for Anchor Links ────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ──────────── Stat Counter Animation ────────────
  const statValues = document.querySelectorAll('.hero__stat-value');

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const finalText = el.textContent;
          const match = finalText.match(/^([\d.]+)([K+★%]*)$/);

          if (match) {
            const target = parseFloat(match[1]);
            const suffix = match[2];
            let current = 0;
            const increment = target / 60;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              el.textContent = (current % 1 === 0 ? Math.floor(current) : current.toFixed(1)) + suffix;
            }, 25);
          }

          counterObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  statValues.forEach(el => counterObserver.observe(el));

  // ──────────── Hero Scroll-Driven Animation ────────────
  const heroScrollWrapper = document.getElementById('hero-scroll-wrapper');
  const heroScreens = document.querySelectorAll('.hero-screen');
  let heroTicking = false;

  function updateHeroAnimation() {
    if (!heroScrollWrapper || heroScreens.length === 0) return;

    const rect = heroScrollWrapper.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const scrollableDistance = heroScrollWrapper.offsetHeight - windowHeight;

    // progress is 0 when the wrapper top is at viewport top, 1 when viewport reaches the wrapper bottom
    let progress = -rect.top / scrollableDistance;
    progress = Math.max(0, Math.min(1, progress));

    const totalTransitions = heroScreens.length - 1;
    const currentSegment = progress * totalTransitions;
    const activeIndex = Math.floor(currentSegment);
    const segmentProgress = currentSegment - activeIndex;

    heroScreens.forEach((screen, index) => {
      // We want previous images to slide up and fade out, next to slide up and fade in
      if (index === activeIndex) {
        // active screen fading out as we scroll down to next segment
        screen.style.opacity = 1; // It's visible, starts fading out halfway maybe? Actually let's keep it visible and just slide
        screen.style.transform = `translateY(${-segmentProgress * 10}%) scale(${1 - segmentProgress * 0.05})`;
        screen.style.zIndex = Math.round(5 - segmentProgress);
        // fade out slightly near the end of segment
        if (segmentProgress > 0.5) {
          screen.style.opacity = 1 - (segmentProgress - 0.5) * 2;
        } else {
          screen.style.opacity = 1;
        }
      } else if (index === activeIndex + 1) {
        // next screen sliding in from bottom
        screen.style.opacity = segmentProgress < 0.5 ? segmentProgress * 2 : 1;
        screen.style.transform = `translateY(${(1 - segmentProgress) * 15}%) scale(${0.95 + segmentProgress * 0.05})`;
        screen.style.zIndex = 10;
      } else if (index < activeIndex) {
        screen.style.opacity = 0;
        screen.style.transform = `translateY(-15%) scale(0.95)`;
        screen.style.zIndex = 1;
      } else {
        screen.style.opacity = 0;
        screen.style.transform = `translateY(15%) scale(0.95)`;
        screen.style.zIndex = 1;
      }
    });

    heroTicking = false;
  }

  if (heroScrollWrapper && heroScreens.length > 0) {
    updateHeroAnimation();
    window.addEventListener('scroll', () => {
      if (!heroTicking) {
        window.requestAnimationFrame(updateHeroAnimation);
        heroTicking = true;
      }
    }, { passive: true });
  }

})();
