/* Queen Land Group - GSAP scroll animations (shared across all pages) */
(function () {
    'use strict';

    var root = document.documentElement;

    function revealPage() {
        root.classList.remove('gsap-init');
    }

    if (!window.gsap || !window.ScrollTrigger) {
        revealPage();
        return;
    }

    var prefersReduced =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    gsap.registerPlugin(ScrollTrigger);

    if (prefersReduced) {
        revealPage();
        return;
    }

    window.setTimeout(revealPage, 2500);
    window.addEventListener('load', function () {
        ScrollTrigger.refresh();
        revealPage();
    });

    try {
        gsap.defaults({ ease: 'power3.out', duration: 0.8 });

        /* ---------------- Hero entrance + parallax ---------------- */
        var hero = document.querySelector('.hero-section');
        if (hero) {
            var heroInner = hero.querySelector(':scope > div');
            var heroBits = [];
            if (heroInner) {
                heroBits = heroBits.concat(gsap.utils.toArray(heroInner.children));
            }
            heroBits = heroBits.concat(gsap.utils.toArray(hero.querySelectorAll(':scope > a')));
            if (heroBits.length) {
                gsap.from(heroBits, {
                    opacity: 0,
                    y: 45,
                    duration: 1,
                    delay: 0.15,
                    stagger: 0.14,
                    clearProps: 'transform',
                });
            }
            if (heroInner) {
                gsap.to(heroInner, {
                    yPercent: 26,
                    autoAlpha: 0,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: hero,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true,
                    },
                });
            }
            gsap.fromTo(
                hero,
                { backgroundPositionY: '50%' },
                {
                    backgroundPositionY: '82%',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: hero,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true,
                    },
                },
            );
        }

        /* ---------------- Reveal on scroll ---------------- */
        var targets = [];
        var targetSet = new Set();

        function owned(el) {
            var parent = el.parentElement;
            return !!(parent && parent.closest('[data-aos]'));
        }

        function add(selector, filter) {
            gsap.utils.toArray(selector).forEach(function (el) {
                if (el.closest('.hero-section')) return;
                if (el.closest('site-header') || el.closest('site-footer')) return;
                if (el.closest('#news-grid')) return;
                if (el.closest('[data-marquee]') && !el.hasAttribute('data-marquee')) return;
                if (el.classList.contains('back-to-top')) return;
                if (filter && !filter(el)) return;
                if (targetSet.has(el)) return;
                targetSet.add(el);
                targets.push(el);
            });
        }

        add('[data-aos]');
        add('main article', function (el) {
            return !el.hasAttribute('data-aos') && !owned(el);
        });
        add('main .hover-card, main .photo-card', function (el) {
            return !el.hasAttribute('data-aos') && !owned(el);
        });
        add('main details', function (el) {
            return !owned(el);
        });
        add('main > section:not(.hero-section) h2, main > section:not(.hero-section) h3', function (el) {
            return !owned(el) && !el.closest('article, .hover-card, .photo-card');
        });
        add('main > section:not(.hero-section) p', function (el) {
            return !owned(el) && !el.closest('article, .hover-card, .photo-card');
        });

        gsap.utils.toArray('site-footer .grid > *').forEach(function (el) {
            if (targetSet.has(el)) return;
            targetSet.add(el);
            targets.push(el);
        });

        targets.forEach(function (el) {
            var type = el.getAttribute('data-aos');
            if (type === 'fade-left') gsap.set(el, { opacity: 0, x: 64 });
            else if (type === 'fade-right') gsap.set(el, { opacity: 0, x: -64 });
            else if (type === 'fade-down') gsap.set(el, { opacity: 0, y: -64 });
            else if (type === 'zoom-in') gsap.set(el, { opacity: 0, scale: 0.82 });
            else gsap.set(el, { opacity: 0, y: 72 });
        });

        if (targets.length) {
            ScrollTrigger.batch(targets, {
                start: 'top 88%',
                once: true,
                interval: 0.12,
                batchMax: 6,
                onEnter: function (batch) {
                    gsap.to(batch, {
                        opacity: 1,
                        x: 0,
                        y: 0,
                        scale: 1,
                        duration: 0.95,
                        stagger: 0.15,
                        overwrite: true,
                        clearProps: 'transform',
                    });
                },
            });
        }

        /* ---------------- Photo section parallax ---------------- */
        gsap.utils.toArray('.photo-section').forEach(function (section) {
            gsap.fromTo(
                section,
                { backgroundPositionY: '50%' },
                {
                    backgroundPositionY: '88%',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                    },
                },
            );
        });

        /* ---------------- Featured image parallax ---------------- */
        gsap.utils.toArray('main .hover-card > div.relative > img').forEach(function (image) {
            gsap.set(image, { scale: 1.3 });
            gsap.fromTo(
                image,
                { yPercent: -8 },
                {
                    yPercent: 8,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: image,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                    },
                },
            );
        });

        /* ---------------- Gentle float for gold accents ---------------- */
        gsap.utils.toArray('main .border-2.border-queen-gold').forEach(function (el) {
            gsap.to(el, {
                y: -12,
                duration: 2.6,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
            });
        });

        /* ---------------- Number counters ---------------- */
        gsap.utils.toArray('[data-counter]').forEach(function (el) {
            var target = parseFloat(el.getAttribute('data-counter'));
            if (isNaN(target)) return;
            var raw = el.hasAttribute('data-counter-raw');
            var state = { value: 0 };
            el.textContent = '0';
            ScrollTrigger.create({
                trigger: el,
                start: 'top 92%',
                once: true,
                onEnter: function () {
                    gsap.to(state, {
                        value: target,
                        duration: 1.8,
                        ease: 'power2.out',
                        onUpdate: function () {
                            var value = Math.round(state.value);
                            el.textContent = raw ? String(value) : value.toLocaleString('en-US');
                        },
                    });
                },
            });
        });

        /* ---------------- Header show / hide ---------------- */
        var nav = document.querySelector('.glass-nav');
        if (nav) {
            ScrollTrigger.create({
                start: 'top -8',
                end: 99999,
                toggleClass: { targets: nav, className: 'nav-scrolled' },
            });
            ScrollTrigger.create({
                start: 'top -8',
                end: 99999,
                onUpdate: function (self) {
                    if (self.direction === 1 && self.scroll() > 420) {
                        gsap.to(nav, { yPercent: -110, duration: 0.3, overwrite: true });
                    } else {
                        gsap.to(nav, { yPercent: 0, duration: 0.3, overwrite: true });
                    }
                },
                onLeaveBack: function () {
                    gsap.to(nav, { yPercent: 0, duration: 0.3, overwrite: true });
                },
            });
        }

        /* ---------------- Banana mouse follower ---------------- */
        var finePointer =
            window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (finePointer && !('ontouchstart' in window)) {
            var follower = document.createElement('div');
            follower.className = 'mouse-follower';
            follower.setAttribute('aria-hidden', 'true');
            follower.textContent = '\uD83C\uDF4C';
            document.body.appendChild(follower);

            gsap.set(follower, { xPercent: -50, yPercent: -50 });
            var followerX = gsap.quickTo(follower, 'x', { duration: 0.28, ease: 'power3' });
            var followerY = gsap.quickTo(follower, 'y', { duration: 0.28, ease: 'power3' });
            var followerRotate = gsap.quickTo(follower, 'rotation', { duration: 0.4, ease: 'power3' });

            var hoverSelector = 'a, button, summary, .hover-card, .flip-card, input, textarea, select, label';
            var lastX = null;
            var activated = false;

            function activateFollower() {
                if (activated) return;
                activated = true;
                root.classList.add('has-custom-cursor');
                follower.classList.add('is-active');
            }

            window.addEventListener(
                'mousemove',
                function (event) {
                    activateFollower();
                    followerX(event.clientX);
                    followerY(event.clientY);
                    if (lastX !== null) {
                        var delta = event.clientX - lastX;
                        followerRotate(gsap.utils.clamp(-18, 18, delta * 1.2));
                    }
                    lastX = event.clientX;
                },
                { passive: true },
            );

            document.addEventListener('mouseleave', function () {
                follower.classList.remove('is-active');
            });
            document.addEventListener('mouseenter', function () {
                if (activated) follower.classList.add('is-active');
            });

            document.addEventListener('mouseover', function (event) {
                if (event.target.closest && event.target.closest(hoverSelector)) {
                    gsap.to(follower, { scale: 1.25, duration: 0.25, overwrite: 'auto' });
                }
            });
            document.addEventListener('mouseout', function (event) {
                if (event.target.closest && event.target.closest(hoverSelector)) {
                    gsap.to(follower, { scale: 1, duration: 0.25, overwrite: 'auto' });
                }
            });

            window.addEventListener(
                'mousedown',
                function () {
                    gsap.to(follower, { scale: 0.8, duration: 0.12, overwrite: 'auto' });
                },
                { passive: true },
            );
            window.addEventListener(
                'mouseup',
                function () {
                    gsap.to(follower, { scale: 1, duration: 0.2, overwrite: 'auto' });
                },
                { passive: true },
            );
        }

        /* ---------------- Keep triggers accurate ---------------- */
        document.addEventListener('queenland:language', function () {
            ScrollTrigger.refresh();
        });
        document.addEventListener('queenland:news-filter', function () {
            ScrollTrigger.refresh();
        });
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () {
                ScrollTrigger.refresh();
            });
        }

        ScrollTrigger.refresh();
    } catch (error) {
        console.error('Animation setup failed:', error);
    } finally {
        revealPage();
    }
})();
