/* Queen Land Group - price offer request form (catalog-driven selects + submit). */
(function () {
    'use strict';

    var form = document.querySelector('[data-quote-form]');
    if (!form) return;

    var categorySelect = form.querySelector('[data-quote-category]');
    var productSelect = form.querySelector('[data-quote-product]');
    var statusEl = form.querySelector('[data-quote-status]');
    var submitBtn = form.querySelector('[data-quote-submit]');

    var CATALOG_URL = '/data/products.json';
    var catalog = [];

    var statusKey = null;

    function currentLanguage() {
        return (
            (window.queenland && window.queenland.language) ||
            document.documentElement.lang ||
            'ar'
        );
    }

    function translate(key) {
        var store = window.queenland && window.queenland.translations;
        return (store && store[key]) || '';
    }

    function localizedName(name) {
        if (!name) return '';
        return name[currentLanguage()] || name.en || name.ar || '';
    }

    function isOrderable(product) {
        return product.orderable !== false;
    }

    function orderableCategories() {
        return catalog
            .map(function (category) {
                return {
                    id: category.id,
                    name: category.name,
                    products: (category.products || []).filter(isOrderable),
                };
            })
            .filter(function (category) {
                return category.products.length > 0;
            });
    }

    function buildOption(value, label, categoryId) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        option.setAttribute('data-catalog', '');
        if (categoryId) option.dataset.category = categoryId;
        return option;
    }

    function clearCatalogOptions(select) {
        Array.prototype.slice
            .call(select.querySelectorAll('option[data-catalog]'))
            .forEach(function (option) {
                option.remove();
            });
    }

    function renderCategories() {
        var previous = categorySelect.value;
        var categories = orderableCategories();

        clearCatalogOptions(categorySelect);
        categories.forEach(function (category) {
            categorySelect.appendChild(buildOption(category.id, localizedName(category.name)));
        });

        var stillValid = categories.some(function (category) {
            return category.id === previous;
        });
        categorySelect.value = stillValid ? previous : '';
    }

    function productsFor(categoryId) {
        var category = catalog.filter(function (item) {
            return item.id === categoryId;
        })[0];
        return category ? (category.products || []).filter(isOrderable) : [];
    }

    function applyRequestedProduct() {
        var requestedId = new URLSearchParams(window.location.search).get('product');
        if (!requestedId) return;

        var match = null;
        orderableCategories().forEach(function (category) {
            category.products.forEach(function (product) {
                if (product.id === requestedId) {
                    match = { categoryId: category.id, productId: product.id };
                }
            });
        });
        if (!match) return;

        categorySelect.value = match.categoryId;
        renderProducts();
        productSelect.value = match.productId;
    }

    function renderProducts() {
        var previous = productSelect.value;
        var categoryId = categorySelect.value;

        clearCatalogOptions(productSelect);
        productsFor(categoryId).forEach(function (product) {
            productSelect.appendChild(
                buildOption(product.id, localizedName(product.name), categoryId),
            );
        });

        var stillValid = Array.prototype.some.call(productSelect.options, function (option) {
            return option.value === previous;
        });
        productSelect.value = stillValid ? previous : '';
    }

    function setStatus(key, state) {
        statusKey = key;
        statusEl.textContent = translate(key);
        statusEl.dataset.state = state;
        statusEl.hidden = false;
    }

    function clearStatus() {
        statusKey = null;
        statusEl.hidden = true;
        statusEl.textContent = '';
        statusEl.removeAttribute('data-state');
    }

    categorySelect.addEventListener('change', function () {
        renderProducts();
        clearStatus();
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        var payload = {};
        new FormData(form).forEach(function (value, key) {
            payload[key] = value;
        });

        submitBtn.disabled = true;
        setStatus('formSending', 'pending');

        fetch('/api/quote-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then(function (response) {
                return response
                    .json()
                    .catch(function () {
                        return {};
                    })
                    .then(function (data) {
                        return { ok: response.ok, data: data };
                    });
            })
            .then(function (result) {
                if (result.ok) {
                    form.reset();
                    renderProducts();
                    setStatus('formSuccess', 'success');
                } else {
                    setStatus(result.data.errorKey || 'formError', 'error');
                }
            })
            .catch(function () {
                setStatus('formError', 'error');
            })
            .finally(function () {
                submitBtn.disabled = false;
            });
    });

    document.addEventListener('queenland:language', function () {
        renderCategories();
        renderProducts();
        if (statusKey) {
            statusEl.textContent = translate(statusKey);
        }
    });

    fetch(CATALOG_URL, { cache: 'no-cache' })
        .then(function (response) {
            if (!response.ok) throw new Error('catalog request failed');
            return response.json();
        })
        .then(function (data) {
            catalog = (data && data.categories) || [];
            renderCategories();
            renderProducts();
            applyRequestedProduct();
        })
        .catch(function () {
            clearCatalogOptions(categorySelect);
            clearCatalogOptions(productSelect);
        });
})();
