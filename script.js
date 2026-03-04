/* ============================================================
   QuestDo — Promotional Landing Page
   Interactive Scripts
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isMobileViewport = () => window.innerWidth <= 768;

  // ──────────── Particle Canvas Background ────────────
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let particles = [];

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
    const particleDensity = isMobileViewport() ? 24000 : 15000;
    const particleCap = isMobileViewport() ? 32 : 80;
    const count = Math.min(Math.floor((canvas.width * canvas.height) / particleDensity), particleCap);
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
    if (prefersReducedMotion.matches) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => p.draw());
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    if (!isMobileViewport()) {
      drawConnections();
    }
    requestAnimationFrame(animateParticles);
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    // Re-init particles on significant resize
    const expectedCount = Math.min(
      Math.floor((canvas.width * canvas.height) / (isMobileViewport() ? 24000 : 15000)),
      isMobileViewport() ? 32 : 80
    );
    if (Math.abs(particles.length - expectedCount) > 4) {
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
  const mobileProgressBar = document.getElementById('mobile-progress-bar');
  const mobileDock = document.getElementById('mobile-dock');
  const mobileDockLinks = mobileDock ? Array.from(mobileDock.querySelectorAll('.mobile-dock__link')) : [];
  const mobileSections = ['hero', 'features', 'showcase', 'how-it-works', 'testimonials', 'download']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  let lastScrollY = 0;

  function setActiveMobileDock(targetId) {
    if (!mobileDockLinks.length) return;
    mobileDockLinks.forEach(link => {
      const isActive = link.dataset.target === targetId;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function updateMobileHud(scrollY, prevScrollY) {
    if (!isMobileViewport()) {
      const wrapper = document.getElementById('mobile-dock-wrapper');
      if (wrapper) wrapper.classList.remove('mobile-dock--hidden');
      return;
    }

    if (mobileProgressBar) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
      mobileProgressBar.style.transform = `scaleX(${progress})`;
    }

    // The mobile dock is toggled manually now via the side button,
    // so we don't auto-hide it on scroll anymore.
    const wrapper = document.getElementById('mobile-dock-wrapper');
    if (wrapper) {
      if (document.body.classList.contains('menu-open')) {
        wrapper.classList.add('mobile-dock--hidden');
      } else {
        wrapper.classList.remove('mobile-dock--hidden');
      }
    }

    if (mobileSections.length) {
      const marker = scrollY + window.innerHeight * 0.38;
      let activeSectionId = mobileSections[0].id;
      mobileSections.forEach(section => {
        if (marker >= section.offsetTop) {
          activeSectionId = section.id;
        }
      });
      setActiveMobileDock(activeSectionId);
    }
  }

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const prevScrollY = lastScrollY;

    if (nav && scrollY > 50) {
      nav.classList.add('scrolled');
    } else if (nav) {
      nav.classList.remove('scrolled');
    }

    updateMobileHud(scrollY, prevScrollY);
    lastScrollY = scrollY;
  }, { passive: true });

  updateMobileHud(window.scrollY, window.scrollY);

  window.addEventListener('resize', () => {
    updateMobileHud(window.scrollY, lastScrollY);
  }, { passive: true });

  mobileDockLinks.forEach(link => {
    link.addEventListener('click', () => {
      const wrapper = document.getElementById('mobile-dock-wrapper');
      if (wrapper) wrapper.classList.remove('is-open');
    });
  });

  // ──────────── Mobile Dock Toggle ────────────
  const mobileDockToggle = document.getElementById('mobile-dock-toggle');
  const mobileDockWrapperElement = document.getElementById('mobile-dock-wrapper');
  if (mobileDockToggle && mobileDockWrapperElement) {
    mobileDockToggle.addEventListener('click', () => {
      mobileDockWrapperElement.classList.toggle('is-open');
    });

    // Close on backdrop/outside click
    document.addEventListener('click', (e) => {
      if (mobileDockWrapperElement.classList.contains('is-open') && !mobileDockWrapperElement.contains(e.target)) {
        mobileDockWrapperElement.classList.remove('is-open');
      }
    });

    // Close on touchstart outside (for mobile responsiveness)
    document.addEventListener('touchstart', (e) => {
      if (mobileDockWrapperElement.classList.contains('is-open') && !mobileDockWrapperElement.contains(e.target)) {
        mobileDockWrapperElement.classList.remove('is-open');
      }
    }, { passive: true });
  }

  // ──────────── Mobile Nav Toggle ────────────
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileBackdrop = document.getElementById('mobile-backdrop');

  function openMobileMenu() {
    mobileMenu.classList.add('open');
    if (mobileBackdrop) mobileBackdrop.classList.add('open');
    navToggle.classList.add('active');
    document.body.classList.add('menu-open');
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    if (mobileBackdrop) mobileBackdrop.classList.remove('open');
    navToggle.classList.remove('active');
    document.body.classList.remove('menu-open');
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      if (mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close on backdrop click
    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', closeMobileMenu);
    }

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
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

  // ──────────── Mobile Hero Slideshow ────────────
  let heroSlideshowTimer = null;
  let currentSlideIndex = 0;

  function initMobileHeroSlideshow() {
    if (!heroScreens.length) return;

    if (window.innerWidth > 768) {
      if (heroSlideshowTimer) {
        clearInterval(heroSlideshowTimer);
        heroSlideshowTimer = null;
        // Clear active classes so desktop scroll works
        heroScreens.forEach(screen => {
          screen.classList.remove('active');
        });
      }
      return;
    }

    if (!heroSlideshowTimer) {
      // Initial setup for mobile
      heroScreens.forEach((screen, index) => {
        screen.style.transform = '';
        screen.style.opacity = '';
        screen.style.visibility = '';
        screen.style.zIndex = '';
        if (index === currentSlideIndex) {
          screen.classList.add('active');
        } else {
          screen.classList.remove('active');
        }
      });

      heroSlideshowTimer = setInterval(() => {
        heroScreens[currentSlideIndex].classList.remove('active');
        currentSlideIndex = (currentSlideIndex + 1) % heroScreens.length;
        heroScreens[currentSlideIndex].classList.add('active');
      }, 3000);
    }
  }

  initMobileHeroSlideshow();
  window.addEventListener('resize', initMobileHeroSlideshow, { passive: true });

  // ──────────── Device Orientation (Gyroscope) ────────────
  const phoneMockup = document.getElementById('hero-phone');
  let gyroEnabled = false;

  function handleOrientation(event) {
    if (window.innerWidth > 768 || prefersReducedMotion.matches || !phoneMockup) return;

    let gamma = event.gamma; // In degree in the range [-90,90]
    let beta = event.beta;   // In degree in the range [-180,180]

    if (gamma === null || beta === null) return;

    // Constrain the angles to prevent extreme flipping
    // Typical mobile holding angle beta is around 30 to 60. Let's make 45 the "flat" center.
    let xOffset = beta - 45;
    let yOffset = gamma;

    const maxRotation = 15; // Max 15 degrees of rotation

    // Normalize roughly between -1 and 1
    const xNormalized = Math.max(-1, Math.min(1, xOffset / 45));
    const yNormalized = Math.max(-1, Math.min(1, yOffset / 45));

    // Calculate rotation and translation based on device tilt
    // rotateX is driven by device's vertical tilt (beta)
    // rotateY is driven by device's horizontal tilt (gamma)
    const rotateX = xNormalized * -maxRotation + 4; // Add base 4deg from original CSS
    const rotateY = yNormalized * maxRotation - 8;  // Add base -8deg from original CSS
    const translateY = xNormalized * 15 + 10;       // Add base 10px from original CSS

    phoneMockup.style.transform = `perspective(800px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateY(${translateY}px)`;
  }

  function initGyroscope() {
    if (gyroEnabled) return;

    // Feature detect iOS 13+ permission API
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, { passive: true });
            gyroEnabled = true;
          }
        })
        .catch(console.error);
    } else {
      // Non-iOS 13+ devices
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
      gyroEnabled = true;
    }
  }

  // Attempt to start gyro immediately (works on Android without prompt)
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function') {
    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    gyroEnabled = true;
  }

  // For iOS, bind to the first user interaction on the phone mockup to request permission
  if (phoneMockup) {
    phoneMockup.addEventListener('click', initGyroscope, { once: true });
    phoneMockup.addEventListener('touchstart', initGyroscope, { once: true, passive: true });
  }

  function updateHeroAnimation() {
    if (!heroScrollWrapper || heroScreens.length === 0) return;

    if (window.innerWidth <= 768) {
      // Mobile is handled by slideshow interval now
      if (prefersReducedMotion.matches) {
        heroScreens.forEach((screen, index) => {
          screen.style.opacity = index === 0 ? 1 : 0;
          screen.style.transform = 'none';
          screen.style.zIndex = index === 0 ? 10 : 1;
        });
      }
      heroTicking = false;
      return;
    }

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
        screen.style.visibility = 'visible';
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
        screen.style.visibility = 'visible';
        // next screen sliding in from bottom
        screen.style.opacity = segmentProgress < 0.5 ? segmentProgress * 2 : 1;
        screen.style.transform = `translateY(${(1 - segmentProgress) * 15}%) scale(${0.95 + segmentProgress * 0.05})`;
        screen.style.zIndex = 10;
      } else if (index < activeIndex) {
        screen.style.visibility = 'hidden';
        screen.style.opacity = 0;
        screen.style.transform = `translateY(-15%) scale(0.95)`;
        screen.style.zIndex = 1;
      } else {
        screen.style.visibility = 'hidden';
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
    window.addEventListener('resize', updateHeroAnimation, { passive: true });
    prefersReducedMotion.addEventListener('change', updateHeroAnimation);
  }

})();
