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
            navLinks.classList.toggle('active');
            // Toggle icon if desired, though simple is fine
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



    // 5. Hero Animation & Content Initialization
    const heroSection = document.getElementById('hero-section');
    const heroContent = document.getElementById('hero-content');
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const heroCompany = document.getElementById('hero-company');
    const paginationContainer = document.getElementById('hero-pagination');

    // Define the content initialization separately
    function initHeroContent() {
        if (heroSection && heroContent && paginationContainer) {
            const slideTexts = [
                {
                    title: '플랜트·기계설비 배관·탱크 보온 시공 전문 파트너',
                    subtitle: '최고의 기술력과 정밀한 품질 관리로 에너지 효율을 극대화하며, 신뢰와 안전을 바탕으로 고객과 함께 성장합니다.',
                    company: 'TAEJIN INS Co., Ltd.'
                }
            ];

            // Generate 9 slides using hero1-hero9
            const slides = Array.from({ length: 9 }, (_, i) => ({
                image: `hero${i + 1}.jpeg`,
                ...slideTexts[0] // Use the unified text for all slides
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
            paginationContainer.innerHTML = ''; // Clear just in case
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
                    if (heroCompany) heroCompany.textContent = slides[index].company;

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

            function startImageSlideshow() {
                heroSection.style.backgroundImage = `url('img/main/${slides[0].image}')`;
                dots.forEach(d => d.classList.remove('active'));
                if (dots[0]) dots[0].classList.add('active');
                slideInterval = setInterval(nextSlide, slideIntervalTime);
            }

            // Check for Video Container
            const videoContainer = document.getElementById('hero-video-container');
            const videos = ['video/Veo3AI%EB%8F%99%EC%98%81%EC%83%81.mp4', 'video/%EA%B7%B8%EB%A1%9DAI%EB%8F%99%EC%98%81%EC%83%81.mp4'];

            if (videoContainer) {
                videoContainer.innerHTML = ''; // Clear if anything
                let videoIndex = 0;
                const videoElement = document.createElement('video');
                videoElement.muted = true; // Required for autoplay
                videoElement.autoplay = true;
                videoElement.playsInline = true;
                videoElement.style.width = '100%';
                videoElement.style.height = '100%';
                videoElement.style.objectFit = 'cover';

                videoContainer.appendChild(videoElement);

                const playNextVideo = () => {
                    if (videoIndex < videos.length) {
                        videoElement.src = videos[videoIndex];
                        const playPromise = videoElement.play();

                        if (playPromise !== undefined) {
                            playPromise.catch(error => {
                                console.error("Video play failed:", error);
                                videoIndex++;
                                playNextVideo();
                            });
                        }

                        videoIndex++;
                        videoElement.onended = playNextVideo;
                    } else {
                        // All videos done
                        videoContainer.style.display = 'none';
                        startImageSlideshow();
                    }
                };

                playNextVideo();
            } else {
                startImageSlideshow();
            }
        }
    }

    // 5.5 Hero Playback Control
    let heroStarted = false;
    function startHeroFlow() {
        if (heroStarted) return;
        heroStarted = true;

        // Initialize Index.html content (JS driven)
        initHeroContent();

        // Initialize Index2/3.html content (Iframe driven)
        const iframes = document.querySelectorAll('iframe[data-src]');
        iframes.forEach(iframe => {
            if (iframe.dataset.src) {
                iframe.src = iframe.dataset.src;
            }
        });
    }

    // Run Animation if overlay exists
    const animeOverlay = document.getElementById('anime-overlay');
    const skipBtn = document.getElementById('anime-skip-btn');

    // Remove immediate initHeroContent call
    // initHeroContent();

    if (animeOverlay && window.anime) {
        // 2. Lock Scroll
        document.body.classList.add('no-scroll');

        const rows = [
            document.getElementById('anime-row-0'),
            document.getElementById('anime-row-1'),
            document.getElementById('anime-row-2')
        ];

        // Skip Functionality
        const finishAnimation = () => {
            if (window.animeOverlayTimeline) window.animeOverlayTimeline.pause();
            anime.remove(animeOverlay);
            anime.remove('.anime-letter');
            anime.remove('#anime-logo-container');

            animeOverlay.style.display = 'none';
            document.body.classList.remove('no-scroll');
            startHeroFlow(); // Start hero content on skip
        };

        if (skipBtn) {
            skipBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                finishAnimation();
            });
        }

        if (rows[0]) {
            rows.forEach(row => {
                const text = row.textContent;
                row.innerHTML = '';
                [...text].forEach(char => {
                    const span = document.createElement('span');
                    span.classList.add('anime-letter');
                    span.textContent = char;
                    if (char === ' ') {
                        span.style.width = '0.3em';
                    }
                    row.appendChild(span);
                });
            });

            const allLetters = document.querySelectorAll('.anime-letter');
            const staggerDelay = 60;
            const strokeDuration = 800;
            const fillDuration = 1200;
            const totalThickeningTime = (allLetters.length * staggerDelay) + strokeDuration;

            const tl = anime.timeline({
                easing: 'easeInOutQuad',
                complete: function () {
                    startHeroFlow(); // Start hero content when animation sequence completes
                    // Fade out overlay finally
                    anime({
                        targets: '#anime-overlay',
                        opacity: 0,
                        duration: 800,
                        easing: 'linear',
                        complete: function () {
                            animeOverlay.style.display = 'none';
                            document.body.classList.remove('no-scroll');
                        }
                    });
                }
            });
            window.animeOverlayTimeline = tl;

            // 1. PHASE 1: Background Black to Blue
            tl.add({
                targets: '#anime-overlay',
                backgroundColor: ['#000000', '#1a365d'],
                duration: totalThickeningTime,
                easing: 'linear'
            }, 0);

            // Letter-by-letter thick border transition
            const strokeTarget = window.innerWidth <= 768 ? '3px' : '8px';
            tl.add({
                targets: '.anime-letter',
                webkitTextStrokeWidth: ['0.5px', strokeTarget],
                duration: strokeDuration,
                delay: anime.stagger(staggerDelay),
                easing: 'easeOutQuart'
            }, 0);

            // 2. PHASE 2: First Shine
            tl.add({
                targets: '#anime-shine-layer',
                opacity: [0, 1, 0],
                duration: 1200,
                easing: 'linear',
                begin: () => {
                    anime({
                        targets: '#anime-shine-mover',
                        translateX: ['-100%', '100%'],
                        duration: 1200,
                        easing: 'easeInOutSine'
                    });
                }
            });

            // 3. PHASE 3: Background Blue to Red
            tl.add({
                targets: '#anime-overlay',
                backgroundColor: ['#1a365d', '#c53030'],
                duration: fillDuration,
                easing: 'linear'
            });

            // Transition to White Fill
            tl.add({
                targets: '.anime-letter',
                color: 'rgba(255, 255, 255, 1)',
                webkitTextStrokeWidth: '1.5px',
                duration: fillDuration,
                easing: 'easeOutQuad'
            }, '-=' + fillDuration);

            // 4. PHASE 4: Second Shine
            tl.add({
                targets: '#anime-shine-layer',
                opacity: [0, 1, 0],
                duration: 1200,
                easing: 'linear',
                begin: () => {
                    anime({
                        targets: '#anime-shine-mover',
                        translateX: ['-100%', '100%'],
                        duration: 1200,
                        easing: 'easeInOutSine'
                    });
                }
            });

            // 5. PHASE 5: Transition to White BG & Show Logo
            tl.add({
                targets: '#anime-overlay',
                backgroundColor: '#ffffff',
                duration: 1000,
                easing: 'easeInOutQuad'
            });

            tl.add({
                targets: '.anime-text-wrapper',
                opacity: 0,
                duration: 500,
                easing: 'easeOutQuad'
            }, '-=1000');

            tl.add({
                targets: '#anime-logo-container',
                opacity: [0, 1],
                translateX: ['-50%', '-50%'], // Force fixed position (no movement)
                translateY: ['-50%', '-50%'], // Force fixed position (no movement)
                duration: 2000,
                easing: 'linear'
            }, '-=500');

            // Hold Logo
            tl.add({
                targets: '#anime-logo-container',
                duration: 1500, // Display logo for 1.5s
                opacity: 1
            });

        } else {
            // No text rows found?
            // Already init content.
            startHeroFlow();
        }
    } else {
        // No overlay or no anime
        // Already init content.
        startHeroFlow();
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

    // 6-B. Product Section (Background & Slider)
    const productSection = document.getElementById('product');
    const productSliderTrack = document.getElementById('product-slider-track');

    if (productSection) {
        // --- Background Slideshow ---
        // Using images from img/main/product#.webp as requested
        const productBgImages = [
            'product1.webp',
            'product2.webp',
            'product3.webp'
        ];
        let currentProductBg = 0;

        // Preload
        productBgImages.forEach(img => {
            const tempImg = new Image();
            tempImg.src = `img/main/${img}`;
        });

        // Initial bg
        productSection.style.backgroundImage = `url('img/main/${productBgImages[0]}')`;

        // Interval
        setInterval(() => {
            currentProductBg = (currentProductBg + 1) % productBgImages.length;
            productSection.style.backgroundImage = `url('img/main/${productBgImages[currentProductBg]}')`;
        }, 5000);

        // --- Product Card Slider ---
        if (productSliderTrack) {
            const products = [
                {
                    file: 'flange_cover.webp',
                    titleEn: 'Flange Cover', titleKo: '플랜지 커버',
                    descEn: 'Prevent energy loss effectively.', descKo: '열 손실을 효과적으로 방지합니다.',
                    tagsEn: ['Energy Saving', 'Protection'], tagsKo: ['에너지 절감', '보호']
                },
                {
                    file: 'valve_cover.webp',
                    titleEn: 'Valve Cover', titleKo: '밸브 커버',
                    descEn: 'Easy maintenance and insulation.', descKo: '유지보수가 쉽고 단열이 우수합니다.',
                    tagsEn: ['Maintenance', 'Safety'], tagsKo: ['유지보수', '안전']
                },
                {
                    file: 'pipe_cover.webp',
                    titleEn: 'Pipe Cover', titleKo: '파이프 커버',
                    descEn: 'Superior thermal insulation.', descKo: '뛰어난 단열 성능을 자랑합니다.',
                    tagsEn: ['Thermal', 'Durable'], tagsKo: ['단열', '내구력']
                },
                {
                    file: 'pump_cover.webp',
                    titleEn: 'Pump Cover', titleKo: '펌프 커버',
                    descEn: 'Noise reduction and protection.', descKo: '소음 감소 및 장비 보호에 탁월합니다.',
                    tagsEn: ['Noise Control', 'Protection'], tagsKo: ['소음 제어', '보호']
                },
                {
                    file: 'tankhead_cover.webp',
                    titleEn: 'Tank Head Cover', titleKo: '탱크헤드 커버',
                    descEn: 'Custom fit for large tanks.', descKo: '대형 탱크에 꼭 맞는 맞춤형 커버입니다.',
                    tagsEn: ['Industrial', 'Custom'], tagsKo: ['산업용', '주문제작']
                },
                {
                    file: 'long_elbow_cover1.webp',
                    titleEn: 'Elbow Cover', titleKo: '엘보 커버',
                    descEn: 'Perfect fit for corner pipes.', descKo: '코너 배관에 완벽하게 밀착됩니다.',
                    tagsEn: ['Fitting', 'Efficiency'], tagsKo: ['피팅', '효율성']
                },
                {
                    file: 't_cover1.webp',
                    titleEn: 'T-Cover', titleKo: 'T 커버',
                    descEn: 'T-junction insulation handling.', descKo: 'T자형 배관 단열도 문제없습니다.',
                    tagsEn: ['Complex Shape', 'Insulation'], tagsKo: ['특수 형상', '단열']
                }
            ];

            const renderProductSlider = (lang) => {
                const isEn = lang === 'en';
                productSliderTrack.innerHTML = products.map(p => {
                    const title = isEn ? p.titleEn : p.titleKo;
                    const desc = isEn ? p.descEn : p.descKo;
                    const tags = isEn ? p.tagsEn : p.tagsKo;
                    const btnText = isEn ? 'Load More' : '자세히 보기';

                    return `
                    <div class="product-card">
                        <div class="product-card-img">
                            <img src="img/product/${p.file}" alt="${title}" onerror="this.src='img/taejinins_logo2.png'">
                        </div>
                        <div class="product-card-body">
                            <div>
                                <h4 class="product-card-title">${title}</h4>
                                <p class="product-card-desc">${desc}</p>
                            </div>
                            <div>
                                <div class="product-tags">
                                    ${tags.map(t => `<span class="product-tag">${t}</span>`).join('')}
                                </div>
                                <a href="products.html#detail" class="product-btn" onclick="event.stopPropagation();">${btnText}</a>
                            </div>
                        </div>
                    </div>
                    `;
                }).join('');
            };

            // Initial Render
            renderProductSlider(localStorage.getItem('preferredLang') || 'ko');

            // Re-render on click of lang buttons
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const newLang = e.currentTarget.getAttribute('data-lang');
                    if (newLang) renderProductSlider(newLang);
                });
            });

            // Slider Nav Events
            const prevBtn = document.querySelector('.product-slider-wrapper .prev');
            const nextBtn = document.querySelector('.product-slider-wrapper .next');

            if (prevBtn && nextBtn) {
                prevBtn.addEventListener('click', () => {
                    productSliderTrack.scrollBy({ left: -280, behavior: 'smooth' });
                });
                nextBtn.addEventListener('click', () => {
                    productSliderTrack.scrollBy({ left: 280, behavior: 'smooth' });
                });
            }
        }
    }

    // 6-C. Project Section Background Slideshow (DISABLED for Redesign)
    /*
    const projectSection = document.getElementById('project');
    if (projectSection) {
        // Encoding Korean filenames if necessary, but modern browsers handle it. 
        // Using encodeURI is safer for CSS url().
        const projectImages = [
            'plant/플랜트사업부_제작사례3.png',
            'plant/플랜트사업부_제작사례6.png',
            'plant/플랜트사업부_제작사례7.png'
        ];
        let currentProjectSlide = 0;

        // Preload
        projectImages.forEach(img => {
            const tempImg = new Image();
            tempImg.src = `img/${img}`;
        });

        projectSection.style.webkitTransition = 'background-image 1s ease-in-out';
        projectSection.style.transition = 'background-image 1s ease-in-out';
        projectSection.style.backgroundImage = `url('img/${projectImages[0]}')`;
        projectSection.style.backgroundSize = 'cover';
        projectSection.style.backgroundPosition = 'center';

        setInterval(() => {
            currentProjectSlide = (currentProjectSlide + 1) % projectImages.length;
            projectSection.style.backgroundImage = `url('img/${projectImages[currentProjectSlide]}')`;
        }, 5000);
    }
    */

    // NEW: Project Card Grid Observer
    const projectGrid = document.querySelector('.project-card-grid');
    if (projectGrid) {
        const gridObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    gridObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        gridObserver.observe(projectGrid);
    }

    // 7. Vertical Navigation Scroll Spy
    const verticalDots = document.querySelectorAll('.vertical-dot');
    const sections = document.querySelectorAll('section[id]');

    if (verticalDots.length > 0 && sections.length > 0) {
        const observerOptions = {
            root: null,
            threshold: 0.3 // Trigger when 30% visible
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    verticalDots.forEach(dot => {
                        // Match exactly OR match partial if needed, but exact is best
                        if (dot.getAttribute('href') === `#${id}`) {
                            dot.classList.add('active');
                        } else {
                            dot.classList.remove('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    }
});
