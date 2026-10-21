(function () {
    'use strict';

    var grid = document.querySelector('[data-product-grid]');
    if (!grid) return;

    var catalog = null;

    function currentLanguage() {
        return document.documentElement.lang === 'en' ? 'en' : 'ar';
    }

    function pick(value) {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return value[currentLanguage()] || value.ar || value.en || '';
    }

    function t(key, fallback) {
        var q = window.queenland || {};
        var dict = q.translations || {};
        var lang = q.language || currentLanguage();
        if (dict[lang] && typeof dict[lang] === 'object') dict = dict[lang];
        return dict[key] || fallback || '';
    }

    function whenTranslationsReady(callback) {
        if (window.queenland && window.queenland.translations) {
            callback();
            return;
        }
        var handler = function () {
            document.removeEventListener('queenland:language', handler);
            callback();
        };
        document.addEventListener('queenland:language', handler);
    }

    function imageProducts() {
        var list = [];
        (catalog.categories || []).forEach(function (category) {
            (category.products || []).forEach(function (product) {
                if (product.image) list.push({ category: category, product: product });
            });
        });
        return list;
    }

    function buildCard(entry) {
        var product = entry.product;

        var card = document.createElement('a');
        card.href = './product.html?id=' + encodeURIComponent(product.id);
        card.className = 'hover-card group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg';

        var media = document.createElement('div');
        media.className = 'overflow-hidden bg-queen-mist';
        var img = document.createElement('img');
        img.src = './' + product.image;
        img.alt = pick(product.name);
        img.loading = 'lazy';
        img.className = 'h-52 w-full object-contain p-3 transition duration-500 group-hover:scale-105';
        media.appendChild(img);
        card.appendChild(media);

        var body = document.createElement('div');
        body.className = 'flex flex-1 flex-col p-5';

        var category = document.createElement('p');
        category.className = 'text-xs font-bold uppercase tracking-widest text-queen-gold';
        category.textContent = pick(entry.category.name);
        body.appendChild(category);

        var title = document.createElement('h2');
        title.className = 'mt-1 text-lg font-extrabold leading-snug text-queen-ink';
        title.textContent = pick(product.name);
        body.appendChild(title);

        var tagline = document.createElement('p');
        tagline.className = 'mt-1 text-sm leading-6 text-queen-body';
        tagline.textContent = pick(product.tagline);
        body.appendChild(tagline);

        var link = document.createElement('span');
        link.className = 'mt-4 inline-flex items-center gap-2 text-sm font-bold text-queen-ink transition group-hover:text-queen-gold';
        link.textContent = t('viewDetails', 'View Details');
        var arrow = document.createElement('i');
        arrow.className = 'fa-solid fa-arrow-left rtl:rotate-0 ltr:rotate-180';
        arrow.setAttribute('aria-hidden', 'true');
        link.appendChild(arrow);
        body.appendChild(link);

        card.appendChild(body);
        return card;
    }

    function render() {
        var items = imageProducts();
        grid.innerHTML = '';
        if (!items.length) {
            var empty = document.createElement('p');
            empty.className = 'col-span-full text-center text-queen-body';
            empty.textContent = t('productsError', 'Products are unavailable right now.');
            grid.appendChild(empty);
            return;
        }
        items.forEach(function (entry) {
            grid.appendChild(buildCard(entry));
        });
    }

    function load() {
        fetch('./data/products.json', { cache: 'no-cache' })
            .then(function (response) {
                if (!response.ok) throw new Error('Failed to load catalog');
                return response.json();
            })
            .then(function (data) {
                catalog = data;
                render();
                whenTranslationsReady(render);
            })
            .catch(function () {
                grid.innerHTML = '';
                var empty = document.createElement('p');
                empty.className = 'col-span-full text-center text-queen-body';
                empty.textContent = t('productsError', 'Products are unavailable right now.');
                grid.appendChild(empty);
            });
    }

    document.addEventListener('queenland:language', function () {
        if (catalog) render();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', load);
    } else {
        load();
    }
})();
