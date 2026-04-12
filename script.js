document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Initialization ---
    lucide.createIcons();

    // --- 2. Core Layout Initialization ---
    const initLayout = () => {
        const html = document.documentElement;
        html.lang = 'ar';
        html.dir = 'rtl';
        document.body.style.fontFamily = "'Readex Pro', sans-serif";
    };

    initLayout();

    // --- 3. Theme Management ---
    const themeToggles = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile');
    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    };

    themeToggles.forEach(btn => btn.addEventListener('click', toggleTheme));

    if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }

    // --- 4. Mobile Menu Navigation ---
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
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => toggleMenu(true));
        });
    }

    // --- 5. Performance Optimized Scroll (Throttle) ---
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scroll-progress');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                if (navbar) {
                    navbar.classList.toggle('nav-scrolled', scrolled > 50);
                }
                if (scrollProgress) {
                    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
                    scrollProgress.style.width = `${(scrolled / totalHeight) * 100}%`;
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    // --- 6. Smooth Reveal Animations ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal-y, .reveal-x, .reveal-scale').forEach(el => revealObserver.observe(el));

    // --- 7. Comparison Slider Logic ---
    const comparisonContainer = document.getElementById('comparison-container');
    if (comparisonContainer) {
        const afterImage = document.getElementById('after-image');
        const sliderHandle = document.getElementById('slider-handle');
        let isDragging = false;

        const updateSlider = (clientX) => {
            const rect = comparisonContainer.getBoundingClientRect();
            let x = clientX - rect.left;
            x = Math.max(0, Math.min(x, rect.width));
            const percent = (x / rect.width) * 100;
            afterImage.style.clipPath = `inset(0 ${document.documentElement.dir === 'rtl' ? percent : 100 - percent}% 0 0)`;
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

    // --- 8. Contact Form (Professional AJAX Response) ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submit-btn');
            const btnSpan = submitBtn.querySelector('span');
            const originalHTML = submitBtn.innerHTML;

            // Loading state
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            if (btnSpan) btnSpan.innerText = 'جاري الإرسال...';

            const formData = new FormData(contactForm);
            const object = Object.fromEntries(formData);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(object)
                });
                const result = await response.json();

                if (result.success) {
                    submitBtn.classList.replace('bg-primary', 'bg-green-600');
                    if (btnSpan) btnSpan.innerText = 'تم الإرسال بنجاح!';
                    contactForm.reset();
                } else {
                    throw new Error('API Error');
                }
            } catch (err) {
                if (btnSpan) btnSpan.innerText = 'خطأ في الإرسال';
            } finally {
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.classList.replace('bg-green-600', 'bg-primary');
                    lucide.createIcons();
                }, 3000);
            }
        });
    }

    // Final Init
});
