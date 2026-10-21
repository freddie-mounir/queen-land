(function () {
    'use strict';

    var url = new URL(window.location.href);
    var productId = url.searchParams.get('id');

    var nameEl = document.querySelector('[data-product-name]');
    var taglineEl = document.querySelector('[data-product-tagline]');
    var overviewEl = document.querySelector('[data-product-overview]');
    var imageEl = document.querySelector('[data-product-image]');
    var compositionEl = document.querySelector('[data-product-composition]');
    var benefitsEl = document.querySelector('[data-product-benefits]');
    var usageEl = document.querySelector('[data-product-usage]');
    var bodyEl = document.querySelector('[data-product-body]');
    var notFoundEl = document.querySelector('[data-product-notfound]');
    var relatedSection = document.querySelector('[data-related-section]');
    var relatedGrid = document.querySelector('[data-related-grid]');
    var requestQuoteLink = document.querySelector('[data-request-quote]');

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

    function allProducts() {
        var list = [];
        (catalog.categories || []).forEach(function (category) {
            (category.products || []).forEach(function (product) {
                list.push({ category: category, product: product });
            });
        });
        return list;
    }

    function findEntry(id) {
        var result = null;
        allProducts().forEach(function (entry) {
            if (entry.product.id === id) result = entry;
        });
        return result;
    }

    function createIcon(iconClass, extraClass) {
        var i = document.createElement('i');
        i.className = iconClass + (extraClass ? ' ' + extraClass : '');
        i.setAttribute('aria-hidden', 'true');
        return i;
    }

    function renderList(container, items, iconClass, extraClass) {
        container.innerHTML = '';
        (items || []).forEach(function (item) {
            var li = document.createElement('li');
            li.className = 'flex gap-3';
            li.appendChild(createIcon(iconClass, extraClass));
            var span = document.createElement('span');
            span.className = 'leading-7 text-queen-body';
            span.textContent = pick(item);
            li.appendChild(span);
            container.appendChild(li);
        });
    }

    function renderComposition(container, items) {
        container.innerHTML = '';
        (items || []).forEach(function (item) {
            var li = document.createElement('li');
            li.className = 'rounded-full border border-queen-gold/40 bg-queen-gold/10 px-4 py-2 text-sm font-bold text-queen-ink';
            li.textContent = pick(item);
            container.appendChild(li);
        });
    }

    function renderRelated(entry) {
        if (!relatedGrid) return;
        var candidates = allProducts().filter(function (item) {
            return item.product.image && item.product.id !== entry.product.id;
        });
        var sameCategory = candidates.filter(function (item) {
            return item.category.id === entry.category.id;
        });
        var others = candidates.filter(function (item) {
            return item.category.id !== entry.category.id;
        });
        var related = sameCategory.concat(others).slice(0, 4);

        relatedGrid.innerHTML = '';
        related.forEach(function (item) {
            var card = document.createElement('a');
            card.href = './product.html?id=' + encodeURIComponent(item.product.id);
            card.className = 'hover-card overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md';

            var img = document.createElement('img');
            img.src = './' + item.product.image;
            img.alt = pick(item.product.name);
            img.loading = 'lazy';
            img.className = 'h-44 w-full object-contain bg-queen-mist p-2';
            card.appendChild(img);

            var info = document.createElement('div');
            info.className = 'p-4';
            var title = document.createElement('h3');
            title.className = 'text-base font-extrabold text-queen-ink';
            title.textContent = pick(item.product.name);
            var tag = document.createElement('p');
            tag.className = 'mt-1 text-sm text-queen-body';
            tag.textContent = pick(item.product.tagline);
            info.appendChild(title);
            info.appendChild(tag);
            card.appendChild(info);

            relatedGrid.appendChild(card);
        });

        if (relatedSection) relatedSection.hidden = related.length === 0;
    }

    function showNotFound() {
        if (bodyEl) bodyEl.hidden = true;
        if (notFoundEl) notFoundEl.hidden = false;
        if (relatedSection) relatedSection.hidden = true;
        if (nameEl) nameEl.textContent = t('productNotFound', 'Product not found');
        if (taglineEl) taglineEl.textContent = '';
        document.title = t('productNotFound', 'Product not found') + ' | ' + t('brand', 'Queen Land Group');
    }

    function render() {
        var entry = findEntry(productId);
        if (!entry) {
            showNotFound();
            return;
        }

        var product = entry.product;
        if (bodyEl) bodyEl.hidden = false;
        if (notFoundEl) notFoundEl.hidden = true;

        if (nameEl) nameEl.textContent = pick(product.name);
        if (taglineEl) taglineEl.textContent = pick(product.tagline);

        if (imageEl) {
            imageEl.src = './' + product.image;
            imageEl.alt = pick(product.name);
        }

        if (overviewEl) {
            overviewEl.textContent = pick(product.overview);
            overviewEl.hidden = !product.overview;
        }

        if (requestQuoteLink) {
            requestQuoteLink.href = './products.html?product=' + encodeURIComponent(product.id) + '#quote';
        }

        renderComposition(compositionEl, product.composition);
        renderList(benefitsEl, product.benefits, 'fa-solid fa-circle-check', 'mt-1 text-sm text-queen-gold');
        renderList(usageEl, product.usage, 'fa-solid fa-circle-dot', 'mt-1 text-sm text-queen-gold');

        var compositionBlock = compositionEl && compositionEl.closest('div');
        if (compositionBlock) compositionBlock.hidden = !(product.composition && product.composition.length);
        var benefitsBlock = benefitsEl && benefitsEl.closest('div');
        if (benefitsBlock) benefitsBlock.hidden = !(product.benefits && product.benefits.length);
        var usageBlock = usageEl && usageEl.closest('div');
        if (usageBlock) usageBlock.hidden = !(product.usage && product.usage.length);

        var brand = t('brand', 'Queen Land Group');
        var productName = pick(product.name);
        document.title = productName + ' | ' + brand;
        var desc = product.overview ? pick(product.overview) : pick(product.tagline);
        var meta = document.querySelector('meta[name="description"]');
        if (meta && desc) meta.content = desc.length > 155 ? desc.slice(0, 152) + '...' : desc;

        renderRelated(entry);

        var url2 = new URL(window.location.href);
        if (url2.searchParams.get('id') !== product.id) {
            url2.searchParams.set('id', product.id);
            window.history.replaceState(null, '', url2.toString());
        }
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
                showNotFound();
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
