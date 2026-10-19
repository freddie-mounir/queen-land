(() => {
    const translations = {};
    const languageToggleButtons = document.querySelectorAll('.language-toggle');
    const themeToggleButtons = document.querySelectorAll('.theme-toggle');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const languageError = document.getElementById('language-error');

    async function loadTranslations(language) {
        if (translations[language]) return translations[language];

        const response = await fetch(`./translations/${language}.json`);
        if (!response.ok) {
            throw new Error(`Could not load ${language}.json (${response.status})`);
        }

        const data = await response.json();
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error(`Invalid translation data in ${language}.json`);
        }
        translations[language] = data;
        return data;
    }

    async function setLanguage(language) {
        const selectedLanguage = language === 'en' ? 'en' : 'ar';
        const isEnglish = selectedLanguage === 'en';
        const languageData = await loadTranslations(selectedLanguage);
        document.documentElement.lang = selectedLanguage;
        document.documentElement.dir = isEnglish ? 'ltr' : 'rtl';

        const pageTitleKey = document.body.dataset.pageTitle || 'homePageTitle';
        const pageDescriptionKey = document.body.dataset.pageDescription || 'homePageDescription';
        document.title = languageData[pageTitleKey] || languageData.homePageTitle;
        document.querySelector('meta[name="description"]').content =
            languageData[pageDescriptionKey] || languageData.homePageDescription;

        document.querySelector('nav > div > div > a').setAttribute(
            'aria-label',
            isEnglish ? 'Queen Land Group - Home' : 'كوين لاند جروب - الصفحة الرئيسية',
        );
        menuToggle.setAttribute('aria-label', isEnglish ? 'Open menu' : 'فتح القائمة');
        const heroScrollLink = document.querySelector('.hero-section > a[aria-label]');
        if (heroScrollLink) {
            heroScrollLink.setAttribute('aria-label', isEnglish ? 'Scroll to About Us' : 'انتقل إلى من نحن');
        }

        document.querySelectorAll('[data-i18n]').forEach((element) => {
            const translation = languageData[element.dataset.i18n];
            if (translation !== undefined) element.textContent = translation;
        });
        document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
            const translation = languageData[element.dataset.i18nAlt];
            if (translation !== undefined) element.alt = translation;
        });
        document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
            const translation = languageData[element.dataset.i18nAriaLabel];
            if (translation !== undefined) element.setAttribute('aria-label', translation);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
            const translation = languageData[element.dataset.i18nPlaceholder];
            if (translation !== undefined) element.placeholder = translation;
        });
        languageToggleButtons.forEach((button) => {
            button.textContent = isEnglish ? 'عربي' : 'EN';
            button.setAttribute('aria-label', isEnglish ? 'Switch to Arabic' : 'Switch to English');
        });

        const selectedPage = document.body.dataset.page;
        document.querySelectorAll('[data-page-nav]').forEach((link) => {
            const isCurrentPage = link.dataset.pageNav === selectedPage;
            link.classList.toggle('nav-current', isCurrentPage);
            if (isCurrentPage) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });

        localStorage.setItem('queenland-language', selectedLanguage);
        languageError.classList.add('hidden');
        window.queenland = Object.assign(window.queenland || {}, {
            language: selectedLanguage,
            translations: languageData,
        });
        document.dispatchEvent(new CustomEvent('queenland:language', { detail: selectedLanguage }));
    }

    function setTheme(theme) {
        const isDark = theme === 'dark';
        document.body.classList.toggle('dark-mode', isDark);
        themeToggleButtons.forEach((button) => {
            button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
            button.innerHTML = `<i class="fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}" aria-hidden="true"></i>`;
        });
        localStorage.setItem('queenland-theme', isDark ? 'dark' : 'light');
    }

    function reportLanguageError(error) {
        console.error('Unable to load page translations:', error);
        languageError.textContent = 'Language files could not be loaded. Please run this site through a local web server.';
        languageError.classList.remove('hidden');
    }

    languageToggleButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                await setLanguage(document.documentElement.lang === 'ar' ? 'en' : 'ar');
            } catch (error) {
                reportLanguageError(error);
            }
        });
    });

    themeToggleButtons.forEach((button) => {
        button.addEventListener('click', () => {
            setTheme(document.body.classList.contains('dark-mode') ? 'light' : 'dark');
        });
    });

    const newsFilters = document.querySelectorAll('[data-news-filter]');
    const newsPanels = document.querySelectorAll('[data-news-panel]');
    newsFilters.forEach((button) => {
        button.addEventListener('click', () => {
            const selectedCategory = button.dataset.newsFilter;
            newsFilters.forEach((filter) => {
                const isSelected = filter === button;
                filter.setAttribute('aria-pressed', String(isSelected));
                filter.classList.toggle('bg-queen-gold', isSelected);
                filter.classList.toggle('text-queen-ink', isSelected);
                filter.classList.toggle('border-gray-200', !isSelected);
                filter.classList.toggle('bg-white', !isSelected);
                filter.classList.toggle('text-queen-body', !isSelected);
            });
            newsPanels.forEach((panel) => {
                panel.classList.toggle('hidden', panel.dataset.newsPanel !== selectedCategory);
            });
            document.dispatchEvent(new CustomEvent('queenland:news-filter', { detail: selectedCategory }));
        });
    });

    const marquee = document.querySelector('[data-marquee]');
    if (marquee) {
        const track = marquee.querySelector('[data-marquee-track]');
        const originals = track ? Array.from(track.children) : [];
        const prefersReducedMotion =
            window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const speed = 60;

        const buildMarquee = () => {
            if (!track || originals.length === 0) return;

            track.querySelectorAll('.marquee-extra').forEach((node) => node.remove());

            const containerWidth = marquee.clientWidth;
            const itemStyle = getComputedStyle(originals[0]);
            const slotWidth =
                originals[0].getBoundingClientRect().width + (parseFloat(itemStyle.marginInlineEnd) || 0);
            const setWidth = slotWidth * originals.length;

            const setsPerHalf = Math.max(1, Math.ceil(containerWidth / setWidth));
            const extraSets = setsPerHalf * 2 - 1;

            const fragment = document.createDocumentFragment();
            for (let i = 0; i < extraSets; i += 1) {
                originals.forEach((item) => {
                    const clone = item.cloneNode(true);
                    clone.classList.add('marquee-extra');
                    clone.setAttribute('aria-hidden', 'true');
                    clone.querySelectorAll('a, button').forEach((el) => el.setAttribute('tabindex', '-1'));
                    fragment.appendChild(clone);
                });
            }
            track.appendChild(fragment);

            const trackWidth = track.getBoundingClientRect().width || setWidth * (setsPerHalf * 2);
            marquee.style.setProperty('--marquee-duration', `${Math.max(18, trackWidth / 2 / speed)}s`);
        };

        if (prefersReducedMotion) {
            marquee.classList.add('marquee-static');
        } else {
            buildMarquee();
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(buildMarquee, 250);
            });
        }
    }

    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!isExpanded));
        mobileMenu.classList.toggle('hidden', isExpanded);
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        const toggleBackToTop = () => {
            backToTop.classList.toggle('is-visible', window.scrollY > 300);
        };
        toggleBackToTop();
        window.addEventListener('scroll', toggleBackToTop, { passive: true });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    setTheme(localStorage.getItem('queenland-theme') || 'light');
    setLanguage(localStorage.getItem('queenland-language') || 'ar').catch(reportLanguageError);
})();
