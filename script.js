document.addEventListener('DOMContentLoaded', () => {
    // 1. Language Handling
    const langBtns = document.querySelectorAll('.lang-btn:not(#theme-toggle)'); // Exclude theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    let currentLang = 'ko'; // Default language

    // 1-A. Theme Handling
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    function updateThemeIcon(theme) {
        if (!themeToggle) return;
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    // Initialize Theme immediately
    initTheme();

    async function loadTranslations(lang) {
        try {
            const response = await fetch(`./lang/${lang}.json`);
            if (!response.ok) throw new Error(`Could not load ${lang}.json`);
            return await response.json();
        } catch (error) {
            console.error('Translation load error:', error);
            return null;
        }
    }

    async function applyTranslations(lang) {
        const translations = await loadTranslations(lang);
        if (!translations) return;

        document.querySelectorAll('[data-i18n]').forEach(element => {
            const keys = element.getAttribute('data-i18n').split('.');
            let value = translations;
            keys.forEach(key => {
                value = value ? value[key] : null;
            });

            if (value) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = value;
                } else {
                    element.innerHTML = value;
                }
            }
        });

        // Dynamic Section Rendering
        renderHistory(translations);
        renderProducts(translations);
        renderProcess(translations);
        renderProjects(translations);

        // Update active button state
        langBtns.forEach(btn => {
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        currentLang = lang;
        document.documentElement.lang = lang;
        localStorage.setItem('preferredLang', lang);
    }

    // Rendering Helpers
    function renderHistory(data) {
        const container = document.getElementById('history-target');
        if (!container || !data.history || !data.history.items) return;

        container.innerHTML = data.history.items.map(item => `
            <li class="fade-up" style="margin-bottom: 20px; display: flex; gap: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px;">
                <span style="color: var(--primary-color); font-weight: bold; min-width: 80px;">${item.date}</span>
                <span>${item.content}</span>
            </li>
        `).join('');

        // Retrigger animations for new content
        observeElements();
    }

    function renderProducts(data) {
        const container = document.getElementById('product-grid');
        if (!container || !data.products || !data.products.items) return;

        container.innerHTML = data.products.items.map(item => `
            <div class="card fade-up">
                <div style="height: 200px; background-color: #222; margin-bottom: 15px; border-radius: 8px; overflow: hidden;">
                    <img src="${item.img}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <h3 style="color: var(--primary-color); margin-bottom: 10px;">${item.name}</h3>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 5px;"><strong>Material:</strong> ${item.material}</p>
                <p style="font-size: 0.9rem;">${item.usage}</p>
            </div>
        `).join('');
        observeElements();
    }

    function renderProcess(data) {
        const container = document.getElementById('process-list');
        if (container && data.process && data.process.steps) {
            container.innerHTML = data.process.steps.map((step, index) => `
                <div class="step-card fade-up" style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; margin-bottom: 15px; display: flex; align-items: center; gap: 20px;">
                    <div style="background: var(--primary-color); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; flex-shrink: 0;">${index + 1}</div>
                    <div style="font-size: 1.1rem;">${step}</div>
                </div>
            `).join('');
        }

        const exportContainer = document.getElementById('export-process-list'); // If separated
        // Using the same list for now as prompt only gave one "Export Work Process" list in detail.

        observeElements();
    }

    function renderProjects(data) {
        // Export Status
        const exportStatusContainer = document.getElementById('export-status-list');
        if (exportStatusContainer && data.projects && data.projects.export_status) {
            document.getElementById('export-status-title').innerText = data.projects.export_status.title;
            exportStatusContainer.innerHTML = data.projects.export_status.items.map(item => `
                <li style="margin-bottom: 10px;">${item}</li>
            `).join('');
        }

        // Lists
        ['smartfarm', 'fuelcell', 'insulation'].forEach(type => {
            const listContainer = document.getElementById(`${type}-list`);
            const titleEl = document.getElementById(`${type}-title`);
            if (listContainer && data.projects && data.projects[`${type}_items`]) {
                if (titleEl && data.projects.lists) titleEl.innerText = data.projects.lists[type];

                listContainer.innerHTML = data.projects[`${type}_items`].map(item => `
                    <div class="project-item fade-up" style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding: 10px 0;">
                        <span>${item.name}</span>
                        <span style="color: var(--text-secondary); white-space: nowrap; margin-left: 20px;">${item.date}</span>
                    </div>
                `).join('');
            }
        });
        observeElements();
    }

    function observeElements() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.fade-up').forEach(el => {
            observer.observe(el);
        });
    }

    // Initialize Language
    const savedLang = localStorage.getItem('preferredLang') || 'ko';
    applyTranslations(savedLang);

    // Language Switcher Events
    langBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.target.dataset.lang;
            applyTranslations(lang);
        });
    });

    // 2. Mobile Menu Handling
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            if (navLinks.style.display === 'flex') {
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'var(--bg-secondary)';
                navLinks.style.padding = '20px';
                navLinks.style.borderBottom = '1px solid var(--border-color)';
            }
        });
    }

    // 3. Scroll Header Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 4. Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                if (window.innerWidth <= 768 && navLinks.style.display === 'flex') {
                    navLinks.style.display = 'none';
                }
            }
        });
    });



    // 5. Hero Background Slideshow with Pagination and Text
    const heroSection = document.getElementById('hero-section');
    const heroContent = document.getElementById('hero-content');
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const paginationContainer = document.getElementById('hero-pagination');

    if (heroSection && heroContent && paginationContainer) {
        const slideTexts = [
            {
                title: '기계설비·배관 보온공사 시공 전문기업',
                subtitle: '최고의 기술력과 노하우로 기계·배관 보온 공사의 새로운 기준을 제시합니다.'
            },
            {
                title: '반도체 / 플랜트 단열 시공 전문',
                subtitle: '정밀한 시공과 철저한 품질 관리로 에너지 효율을 극대화합니다.'
            },
            {
                title: '고객과 함께 성장하는 파트너',
                subtitle: '신뢰와 정직을 바탕으로 안전하고 완벽한 시공을 약속드립니다.'
            }
        ];

        // Generate 9 slides using hero1-hero9
        const slides = Array.from({ length: 9 }, (_, i) => ({
            image: `hero${i + 1}.jpeg`,
            ...slideTexts[i % 3]
        }));

        let currentSlide = 0;
        const slideIntervalTime = 5000;
        let slideInterval;

        // Preload hero images
        slides.forEach(slide => {
            const tempImg = new Image();
            tempImg.src = `img/main/${slide.image}`;
        });

        // Create Dots
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('hero-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                goToSlide(index);
                resetInterval();
            });
            paginationContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.hero-dot');

        function updateSlide(index) {
            heroContent.classList.add('fade-out');
            setTimeout(() => {
                heroSection.style.backgroundImage = `url('img/main/${slides[index].image}')`;
                heroTitle.textContent = slides[index].title;
                heroSubtitle.textContent = slides[index].subtitle;

                dots.forEach(d => d.classList.remove('active'));
                dots[index].classList.add('active');

                heroContent.classList.remove('fade-out');
            }, 500);
        }

        function goToSlide(index) {
            currentSlide = index;
            updateSlide(currentSlide);
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            updateSlide(currentSlide);
        }

        function resetInterval() {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, slideIntervalTime);
        }

        heroSection.style.backgroundImage = `url('img/main/${slides[0].image}')`;
        slideInterval = setInterval(nextSlide, slideIntervalTime);
    }

    // 6. Intro Section Background Slideshow
    const introSection = document.getElementById('intro');
    if (introSection) {
        const introImages = Array.from({ length: 6 }, (_, i) => `intro${i + 1}.jpeg`);
        let currentIntroSlide = 0;

        // Preload intro images
        introImages.forEach(img => {
            const tempImg = new Image();
            tempImg.src = `img/main/${img}`;
        });

        introSection.style.webkitTransition = 'background-image 1s ease-in-out';
        introSection.style.transition = 'background-image 1s ease-in-out';
        introSection.style.backgroundImage = `url('img/main/${introImages[0]}')`;
        introSection.style.backgroundSize = 'cover';
        introSection.style.backgroundPosition = 'center';

        setInterval(() => {
            currentIntroSlide = (currentIntroSlide + 1) % introImages.length;
            introSection.style.backgroundImage = `url('img/main/${introImages[currentIntroSlide]}')`;
        }, 5000);
    }
});
