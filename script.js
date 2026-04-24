document.addEventListener('DOMContentLoaded', () => {
    // --- 0. Global Setup ---

    // --- 1. Initialization & Preloader ---
    if (window.lucide) lucide.createIcons();
    
    const preloader = document.getElementById('preloader');
    const loaderProgress = document.getElementById('loader-progress');
    
    if (preloader && loaderProgress) {
        let progress = 0;
        const loadInterval = setInterval(() => {
            progress += Math.random() * 40; // Faster progress
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadInterval);
                loaderProgress.style.width = '100%';
                setTimeout(() => {
                    preloader.classList.add('hidden');
                    document.body.classList.add('loaded');
                }, 300);
            } else {
                loaderProgress.style.width = `${progress}%`;
            }
        }, 80);
    } else {
        document.body.classList.add('loaded');
    }

    // --- 2. Theme Management ---
    const themeToggles = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile');
    const toggleTheme = () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };

    themeToggles.forEach(btn => btn.addEventListener('click', toggleTheme));
    if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }

    // --- 3. Custom Cursor ---
    const cursorDot = document.getElementById('cursor-dot');
    const cursorFollower = document.getElementById('cursor-follower');
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    let isMouseMoving = false;

    if (cursorDot && cursorFollower) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
            isMouseMoving = true;

            // Update mouse position for profile glow
            const profileContainer = document.querySelector('.group.cursor-none');
            if (profileContainer) {
                const rect = profileContainer.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                profileContainer.style.setProperty('--mouse-x', `${x}%`);
                profileContainer.style.setProperty('--mouse-y', `${y}%`);
            }
        }, { passive: true });

        const animateCursor = () => {
            if (isMouseMoving) {
                followerX += (mouseX - followerX) * 0.15;
                followerY += (mouseY - followerY) * 0.15;
                cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
            }
            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        document.querySelectorAll('a, button, .clickable, input, textarea').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    // --- 4. Page Transitions ---
    document.querySelectorAll('a').forEach(link => {
        if (link.hostname === window.location.hostname && !link.hash && link.target !== '_blank' && !link.href.includes('javascript:void(0)')) {
            link.addEventListener('click', (e) => {
                const target = link.href;
                if (!target || target === window.location.href) return;
                e.preventDefault();
                document.body.classList.add('fade-out');
                setTimeout(() => window.location.href = target, 250);
            });
        }
    });

    // --- 5. Mobile Menu & Active Link ---
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuToggle && mobileMenu) {
        const icons = {
            menu: mobileMenuToggle.querySelector('[data-lucide="menu"]'),
            close: mobileMenuToggle.querySelector('[data-lucide="x"]')
        };

        const toggleMenu = (forceClose = false) => {
            const isOpen = forceClose ? true : mobileMenu.classList.contains('menu-open');
            if (isOpen) {
                mobileMenu.classList.remove('menu-open');
                mobileMenu.style.maxHeight = '0px';
                icons.menu?.classList.remove('hidden');
                icons.close?.classList.add('hidden');
            } else {
                mobileMenu.classList.add('menu-open');
                mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
                icons.menu?.classList.add('hidden');
                icons.close?.classList.remove('hidden');
            }
        };

        mobileMenuToggle.addEventListener('click', () => toggleMenu());
        
        // Highlight active link
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath === currentPath) {
                link.classList.add('active');
            }
            link.addEventListener('click', () => toggleMenu(true));
        });
    }

    // --- 6. Scroll Logic (Progress & Navbar) ---
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scroll-progress');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                if (navbar) {
                    navbar.classList.toggle('nav-scrolled', scrolled > 20);
                }
                if (scrollProgress) {
                    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
                    scrollProgress.style.width = `${(scrolled / totalHeight) * 100}%`;
                }
                
                // Optimized Parallax Blobs
                const blobs = document.querySelectorAll('.blob');
                for (let i = 0; i < blobs.length; i++) {
                    const speed = (i + 1) * 0.05;
                    blobs[i].style.transform = `translate3d(0, ${scrolled * speed}px, 0)`;
                }

                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // --- 7. Enhanced Reveal Animations ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                target.style.willChange = 'opacity, transform';
                
                // Trigger reflow
                target.offsetHeight;
                
                target.classList.add('revealed');
                
                const onTransitionEnd = () => {
                    target.style.willChange = 'auto';
                    target.removeEventListener('transitionend', onTransitionEnd);
                };
                target.addEventListener('transitionend', onTransitionEnd);
                revealObserver.unobserve(target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal-y, .reveal-x, .reveal-scale').forEach(el => revealObserver.observe(el));

    // --- 8. Comparison Slider Logic (RTL Fix) ---
    const comparisonContainer = document.getElementById('comparison-container');
    if (comparisonContainer) {
        const afterImage = document.getElementById('after-image');
        const sliderHandle = document.getElementById('slider-handle');
        const isRTL = document.documentElement.dir === 'rtl';
        let isDragging = false;

        const updateSlider = (clientX) => {
            const rect = comparisonContainer.getBoundingClientRect();
            let x = clientX - rect.left;
            x = Math.max(0, Math.min(x, rect.width));
            const percent = (x / rect.width) * 100;
            
            if (isRTL) {
                afterImage.style.clipPath = `inset(0 0 0 ${percent}%)`;
            } else {
                afterImage.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
            }
            sliderHandle.style.left = `${percent}%`;
        };

        const start = (e) => { isDragging = true; updateSlider(e.touches ? e.touches[0].clientX : e.clientX); };
        const end = () => { isDragging = false; };
        const move = (e) => { if (isDragging) updateSlider(e.touches ? e.touches[0].clientX : e.clientX); };

        comparisonContainer.addEventListener('mousedown', start);
        comparisonContainer.addEventListener('touchstart', start, { passive: true });
        window.addEventListener('mousemove', move);
        window.addEventListener('touchmove', move, { passive: true });
        window.addEventListener('mouseup', end);
        window.addEventListener('touchend', end);
    }

    // --- 9. Contact Form ---
    const contactForm = document.getElementById('contact-form');
    let submissionTimeout;

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submit-btn');
            const btnSpan = submitBtn.querySelector('span');
            const originalHTML = submitBtn.innerHTML;

            if (submissionTimeout) clearTimeout(submissionTimeout);

            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            if (btnSpan) btnSpan.innerText = 'جاري الإرسال...';

            const formData = new FormData(contactForm);
            formData.append('form-name', 'contact');
            
            try {
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams(formData).toString()
                });

                if (response.ok) {
                    submitBtn.classList.add('bg-green-600');
                    if (btnSpan) btnSpan.innerText = 'تم الإرسال بنجاح!';
                    contactForm.reset();
                } else {
                    throw new Error('Netlify Error');
                }
            } catch (err) {
                if (btnSpan) btnSpan.innerText = 'خطأ في الإرسال';
            } finally {
                submissionTimeout = setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.classList.remove('bg-green-600');
                    if (window.lucide) lucide.createIcons();
                }, 4000);
            }
        });
    }

    // --- 10. Visual Upgrades: Ripple, Lazy Loading, Counters ---
    // Ripple Effect
    document.querySelectorAll('.bg-primary, .cta-link, button').forEach(button => {
        button.addEventListener('mousedown', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            const size = Math.max(this.offsetWidth, this.offsetHeight);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - this.getBoundingClientRect().left - size/2}px`;
            ripple.style.top = `${e.clientY - this.getBoundingClientRect().top - size/2}px`;
            ripple.addEventListener('animationend', () => ripple.remove());
        });
    });

    // Lazy Loading Images Fade-in
    const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loaded');
                imgObserver.unobserve(entry.target);
            }
        });
    });
    document.querySelectorAll('img').forEach(img => imgObserver.observe(img));

    // Animated Counters
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const countTo = parseInt(target.innerText.replace(/\D/g, ''));
                let count = 0;
                const duration = 2000;
                const step = (countTo / duration) * 10;
                const timer = setInterval(() => {
                    count += step;
                    if (count >= countTo) {
                        target.innerText = countTo + (target.innerText.includes('+') ? '+' : '');
                        clearInterval(timer);
                    } else {
                        target.innerText = Math.floor(count) + (target.innerText.includes('+') ? '+' : '');
                    }
                }, 10);
                counterObserver.unobserve(target);
            }
        });
    });
    document.querySelectorAll('.stat-number').forEach(num => counterObserver.observe(num));

    // Skill Bar Animation
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target.querySelector('.skill-bar-fill');
                if (fill) {
                    fill.style.width = fill.getAttribute('data-width') || '0%';
                }
                skillObserver.unobserve(entry.target);
            }
        });
    });
    document.querySelectorAll('.skill-item').forEach(item => skillObserver.observe(item));

    // Scroll to Top
    const stt = document.getElementById('scroll-to-top');
    if (stt) stt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});

// Water Savings Calculator
function calculateSavings() {
    const area = document.getElementById('area-input').value;
    const cropNeed = document.getElementById('crop-select').value;
    const resultDiv = document.getElementById('calc-result');
    const savingsSpan = document.getElementById('savings-value');

    if (area && area > 0) {
        // Simple logic: Traditional flooding uses ~40% more water than smart drip irrigation
        const targetSavings = Math.round(area * cropNeed * 0.4);
        
        resultDiv.classList.remove('hidden');
        
        // Animate counter
        let current = 0;
        const duration = 1500;
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            current = Math.floor(easedProgress * targetSavings);
            
            savingsSpan.innerText = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        requestAnimationFrame(updateCounter);
        
        // Scroll to result if on mobile
        if (window.innerWidth < 768) {
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    } else {
        alert('يرجى إدخال مساحة صحيحة');
    }
}

