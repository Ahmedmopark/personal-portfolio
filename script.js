/* ============================================================
   AHMED MUBARAK PORTFOLIO — script.js v3.0
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════════════════
     1. PRELOADER
  ══════════════════════════════════════════════════ */
  const preloader = document.getElementById('preloader');
  const loaderProgress = document.getElementById('loader-progress');

  if (preloader && loaderProgress) {
    let progress = 0;
    const tick = setInterval(() => {
      progress += Math.random() * 35 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(tick);
        loaderProgress.style.width = '100%';
        setTimeout(() => {
          preloader.classList.add('hidden');
          document.body.classList.add('loaded');
          startTyping();
        }, 400);
      } else {
        loaderProgress.style.width = `${progress}%`;
      }
    }, 70);
  } else {
    document.body.classList.add('loaded');
    startTyping();
  }

  /* ══════════════════════════════════════════════════
     2. THEME MANAGEMENT
  ══════════════════════════════════════════════════ */
  const themeToggles = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile');

  const applyTheme = (dark) => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  };

  // Init theme
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme === 'dark' || (!savedTheme && prefersDark));

  themeToggles.forEach(btn => btn.addEventListener('click', () => {
    applyTheme(!document.documentElement.classList.contains('dark'));
  }));

  /* ══════════════════════════════════════════════════
     3. LUCIDE ICONS
  ══════════════════════════════════════════════════ */
  if (window.lucide) lucide.createIcons();

  /* ══════════════════════════════════════════════════
     4. TYPING ANIMATION (Hero)
  ══════════════════════════════════════════════════ */
  function startTyping() {
    const el = document.getElementById('typing-text');
    if (!el) return;

    const phrases = [
      'أصمم أنظمة ري موفّرة للمياه',
      'أحسب الاحتياجات المائية بدقة',
      'أصمم شبكات التنقيط والرش',
      'أبتكر حلول الري المستدامة',
    ];

    let phraseIdx = 0, charIdx = 0, deleting = false;

    const type = () => {
      const current = phrases[phraseIdx];
      if (deleting) {
        el.textContent = current.substring(0, charIdx--);
      } else {
        el.textContent = current.substring(0, charIdx++);
      }

      let delay = deleting ? 40 : 80;

      if (!deleting && charIdx > current.length) {
        delay = 2000;
        deleting = true;
      } else if (deleting && charIdx < 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        charIdx = 0;
        delay = 400;
      }

      setTimeout(type, delay);
    };

    setTimeout(type, 600);
  }

  /* ══════════════════════════════════════════════════
     5. CUSTOM CURSOR
  ══════════════════════════════════════════════════ */
  const cursorDot = document.getElementById('cursor-dot');
  const cursorFollower = document.getElementById('cursor-follower');
  let mouseX = 0, mouseY = 0, fX = 0, fY = 0, cursorRAF;

  if (cursorDot && cursorFollower && window.matchMedia('(pointer: fine)').matches) {
    cursorDot.classList.remove('hidden');
    cursorFollower.classList.remove('hidden');

    const moveCursor = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%,-50%)`;

      // Profile glow
      const profileEl = document.querySelector('.profile-zone');
      if (profileEl) {
        const r = profileEl.getBoundingClientRect();
        profileEl.style.setProperty('--mouse-x', `${((e.clientX - r.left) / r.width) * 100}%`);
        profileEl.style.setProperty('--mouse-y', `${((e.clientY - r.top) / r.height) * 100}%`);
      }
    };

    const animateFollower = () => {
      fX += (mouseX - fX) * 0.12;
      fY += (mouseY - fY) * 0.12;
      cursorFollower.style.transform = `translate3d(${fX}px, ${fY}px, 0) translate(-50%,-50%)`;
      cursorRAF = requestAnimationFrame(animateFollower);
    };

    window.addEventListener('mousemove', moveCursor, { passive: true });
    animateFollower();

    document.querySelectorAll('a, button, input, textarea, select, [role="button"]').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* ══════════════════════════════════════════════════
     6. PAGE TRANSITIONS
  ══════════════════════════════════════════════════ */
  document.querySelectorAll('a[href]').forEach(link => {
    if (
      link.hostname === window.location.hostname &&
      !link.hash &&
      link.target !== '_blank' &&
      !link.getAttribute('download') &&
      !link.href.startsWith('mailto:') &&
      !link.href.startsWith('tel:') &&
      !link.href.startsWith('javascript:')
    ) {
      link.addEventListener('click', (e) => {
        const target = link.href;
        if (!target || target === window.location.href) return;
        e.preventDefault();
        document.body.classList.add('fade-out');
        setTimeout(() => { window.location.href = target; }, 260);
      });
    }
  });

  /* ══════════════════════════════════════════════════
     7. MOBILE MENU
  ══════════════════════════════════════════════════ */
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileToggle && mobileMenu) {
    const iconMenu = mobileToggle.querySelector('[data-lucide="menu"]');
    const iconX = mobileToggle.querySelector('[data-lucide="x"]');
    let menuOpen = false;

    const toggleMenu = (forceClose = false) => {
      menuOpen = forceClose ? false : !menuOpen;
      mobileMenu.style.maxHeight = menuOpen ? mobileMenu.scrollHeight + 'px' : '0px';
      mobileMenu.style.opacity = menuOpen ? '1' : '0';
      iconMenu?.classList.toggle('hidden', menuOpen);
      iconX?.classList.toggle('hidden', !menuOpen);
    };

    mobileToggle.addEventListener('click', () => toggleMenu());
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(true)));

    // Active link highlight
    const path = window.location.pathname.split('/').pop() || 'index.html';
    mobileMenu.querySelectorAll('a').forEach(a => {
      if (a.getAttribute('href') === path) a.classList.add('active');
    });
  }

  // Desktop active link
  const desktopPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link-item').forEach(a => {
    if (a.getAttribute('href') === desktopPath) a.classList.add('active');
  });

  /* ══════════════════════════════════════════════════
     8. SCROLL LOGIC (Progress + Navbar + Parallax)
  ══════════════════════════════════════════════════ */
  const navbar = document.getElementById('navbar');
  const scrollBar = document.getElementById('scroll-progress');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      const totalH = document.documentElement.scrollHeight - window.innerHeight;

      if (navbar) navbar.classList.toggle('nav-scrolled', sy > 20);
      if (scrollBar) scrollBar.style.width = `${(sy / totalH) * 100}%`;

      // Subtle parallax on blobs
      document.querySelectorAll('.blob').forEach((b, i) => {
        const spd = (i + 1) * 0.04;
        b.style.transform = `translate3d(0, ${sy * spd}px, 0)`;
      });

      ticking = false;
    });
  }, { passive: true });

  /* ══════════════════════════════════════════════════
     9. REVEAL ANIMATIONS (Intersection Observer)
  ══════════════════════════════════════════════════ */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseFloat(el.style.transitionDelay || el.dataset.delay || 0);
        setTimeout(() => {
          el.classList.add('revealed');
          el.style.willChange = 'auto';
        }, delay * 1000);
        revealObs.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal-y, .reveal-x, .reveal-scale, .reveal-left, .reveal-right').forEach(el => {
    revealObs.observe(el);
  });

  /* ══════════════════════════════════════════════════
     10. ANIMATED COUNTERS
  ══════════════════════════════════════════════════ */
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const rawText = el.dataset.target || el.innerText;
      const hasPlus = rawText.includes('+');
      const hasPercent = rawText.includes('%');
      const target = parseInt(rawText.replace(/\D/g, ''), 10);
      if (isNaN(target)) return;

      const suffix = hasPlus ? '+' : hasPercent ? '%' : '';
      const duration = 1800;
      const start = performance.now();

      const update = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-number').forEach(el => counterObs.observe(el));

  /* ══════════════════════════════════════════════════
     11. SKILL BAR ANIMATION
  ══════════════════════════════════════════════════ */
  const skillObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const fill = entry.target.querySelector('.skill-bar-fill');
      if (fill) {
        setTimeout(() => {
          fill.style.width = fill.dataset.width || '0%';
        }, 200);
      }
      skillObs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.skill-item').forEach(el => skillObs.observe(el));

  /* ══════════════════════════════════════════════════
     12. CARD TILT EFFECT (3D Hover)
  ══════════════════════════════════════════════════ */
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rx = ((y - cy) / cy) * 6;
      const ry = ((x - cx) / cx) * -6;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
    });
  });

  /* ══════════════════════════════════════════════════
     13. RIPPLE EFFECT
  ══════════════════════════════════════════════════ */
  document.querySelectorAll('.btn-primary, .btn-secondary, button.ripple-btn').forEach(btn => {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.addEventListener('mousedown', (e) => {
      const r = document.createElement('span');
      r.className = 'ripple';
      const size = Math.max(btn.offsetWidth, btn.offsetHeight);
      const rect = btn.getBoundingClientRect();
      r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px;position:absolute;border-radius:50%;pointer-events:none;`;
      btn.appendChild(r);
      r.addEventListener('animationend', () => r.remove());
    });
  });

  /* ══════════════════════════════════════════════════
     14. LAZY IMAGE LOADING
  ══════════════════════════════════════════════════ */
  const imgObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) img.src = img.dataset.src;
        img.classList.add('loaded');
        imgObs.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('img').forEach(img => imgObs.observe(img));

  /* ══════════════════════════════════════════════════
     15. COMPARISON SLIDER (Portfolio)
  ══════════════════════════════════════════════════ */
  const compContainer = document.getElementById('comparison-container');
  if (compContainer) {
    const afterImg = document.getElementById('after-image');
    const handle = document.getElementById('slider-handle');
    const isRTL = document.documentElement.dir === 'rtl';
    let dragging = false;

    const update = (clientX) => {
      const r = compContainer.getBoundingClientRect();
      const pct = Math.max(0, Math.min((clientX - r.left) / r.width, 1)) * 100;
      afterImg.style.clipPath = isRTL ? `inset(0 0 0 ${pct}%)` : `inset(0 ${100 - pct}% 0 0)`;
      handle.style.left = `${pct}%`;
    };

    compContainer.addEventListener('mousedown', (e) => { dragging = true; update(e.clientX); });
    compContainer.addEventListener('touchstart', (e) => { dragging = true; update(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('mousemove', (e) => { if (dragging) update(e.clientX); });
    window.addEventListener('touchmove', (e) => { if (dragging) update(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('mouseup', () => { dragging = false; });
    window.addEventListener('touchend', () => { dragging = false; });
  }

  /* ══════════════════════════════════════════════════
     16. CONTACT FORM
  ══════════════════════════════════════════════════ */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    let submissionTimeout;
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('submit-btn');
      if (!btn) return;
      const span = btn.querySelector('span');
      const origHTML = btn.innerHTML;

      if (submissionTimeout) clearTimeout(submissionTimeout);
      btn.disabled = true;
      btn.style.opacity = '0.7';
      if (span) span.textContent = 'جاري الإرسال...';

      try {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(contactForm)).toString(),
        });
        if (res.ok) {
          btn.classList.add('!bg-green-500');
          if (span) span.textContent = '✓ تم الإرسال بنجاح';
          contactForm.reset();
        } else throw new Error();
      } catch {
        if (span) span.textContent = '✗ خطأ في الإرسال';
      } finally {
        submissionTimeout = setTimeout(() => {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.innerHTML = origHTML;
          btn.classList.remove('!bg-green-500');
          if (window.lucide) lucide.createIcons();
        }, 4000);
      }
    });
  }

  /* ══════════════════════════════════════════════════
     17. SCROLL TO TOP
  ══════════════════════════════════════════════════ */
  const stt = document.getElementById('scroll-to-top');
  if (stt) stt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ══════════════════════════════════════════════════
     18. MAGNETIC BUTTONS
  ══════════════════════════════════════════════════ */
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0,0)';
    });
  });

  /* ══════════════════════════════════════════════════
     19. SECTION ACTIVE HIGHLIGHT (Scrollspy)
  ══════════════════════════════════════════════════ */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link-item');

  if (sections.length && navLinks.length) {
    const spyObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
        }
      });
    }, { threshold: 0.35 });
    sections.forEach(s => spyObs.observe(s));
  }

  /* ══════════════════════════════════════════════════
     20. TOOL CARDS HOVER GLOW
  ══════════════════════════════════════════════════ */
  document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--gx', `${e.clientX - r.left}px`);
      card.style.setProperty('--gy', `${e.clientY - r.top}px`);
    });
  });

  /* ══════════════════════════════════════════════════
     21. KEYBOARD NAVIGATION SHORTCUT
  ══════════════════════════════════════════════════ */
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.querySelector('[href="contact.html"]')?.click();
    }
    if (e.key === 'Escape') {
      const mm = document.getElementById('mobile-menu');
      if (mm && mm.style.maxHeight !== '0px') {
        document.getElementById('mobile-menu-toggle')?.click();
      }
    }
  });

}); // end DOMContentLoaded

/* ══════════════════════════════════════════════════
   WATER SAVINGS CALCULATOR
══════════════════════════════════════════════════ */
function calculateSavings() {
  const areaEl = document.getElementById('area-input');
  const cropEl = document.getElementById('crop-select');
  const resultDiv = document.getElementById('calc-result');
  const savingsSpan = document.getElementById('savings-value');
  const percentSpan = document.getElementById('savings-percent');
  const costSpan = document.getElementById('savings-cost');

  const area = parseFloat(areaEl?.value);
  const cropNeed = parseInt(cropEl?.value, 10);

  if (!area || area <= 0) {
    areaEl?.focus();
    areaEl?.classList.add('!border-red-500');
    setTimeout(() => areaEl?.classList.remove('!border-red-500'), 2000);
    return;
  }

  const saved = Math.round(area * cropNeed * 0.4);
  const percent = 40;
  const costSaved = Math.round(saved * 0.85); // EGP per m³ approx

  resultDiv?.classList.remove('hidden');

  const animateNum = (el, target, suffix = '') => {
    if (!el) return;
    const duration = 1600;
    const start = performance.now();
    const update = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target).toLocaleString('ar-EG') + suffix;
      if (p < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  };

  animateNum(savingsSpan, saved, ' م³');
  animateNum(percentSpan, percent, '%');
  animateNum(costSpan, costSaved, ' جنيه');

  if (window.innerWidth < 768) {
    resultDiv?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
