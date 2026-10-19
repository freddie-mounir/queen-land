const siteHeaderTemplate = `
    <nav class="fixed inset-x-0 top-0 z-50 glass-nav shadow-sm">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="flex h-20 items-center justify-between">
                <a href="./index.html" class="flex items-center gap-3" aria-label="كوين لاند جروب - الصفحة الرئيسية">
                    <img data-i18n-alt="brand" src="https://queenland-group.com/assets/img/logo.jpg" alt="كوين لاند" class="h-12 w-auto">
                </a>
                <div id="site-menu" class="hidden items-center gap-5 lg:gap-7 md:flex">
                    <a data-i18n="home" data-page-nav="home" href="./index.html" class="nav-link transition-colors hover:text-queen-gold">الصفحة الرئيسية</a>
                    <a data-i18n="about" data-page-nav="about" href="./about.html" class="nav-link transition-colors hover:text-queen-gold">من نحن</a>
                    <a data-i18n="products" data-page-nav="products" href="./products.html" class="nav-link transition-colors hover:text-queen-gold">المنتجات</a>
                    <a data-i18n="services" data-page-nav="services" href="./services.html" class="nav-link transition-colors hover:text-queen-gold">الخدمات</a>
                    <a data-i18n="media" data-page-nav="media" href="./media.html" class="nav-link transition-colors hover:text-queen-gold">المركز الأعلامى</a>
                    <a data-i18n="contact" data-page-nav="contact" href="./contact.html" class="rounded-full bg-queen-gold px-5 py-2 font-bold text-queen-ink transition hover:bg-yellow-400">تواصل معنا</a>
                    <button class="language-toggle rounded-full border border-queen-gold px-3 py-2 text-sm font-bold text-queen-ink transition hover:bg-queen-gold" type="button" aria-label="Switch to English">EN</button>
                    <button class="theme-toggle rounded-full p-2 text-queen-ink transition hover:bg-queen-gold/20" type="button" aria-label="Switch to dark mode"><i class="fa-solid fa-moon" aria-hidden="true"></i></button>
                </div>
                <button id="menu-toggle" class="rounded p-2 text-queen-ink md:hidden" type="button" aria-label="فتح القائمة" aria-expanded="false" aria-controls="mobile-menu">
                    <i class="fa-solid fa-bars text-2xl" aria-hidden="true"></i>
                </button>
            </div>
            <div id="mobile-menu" class="hidden border-t border-gray-200 py-3 md:hidden">
                <a data-i18n="home" data-page-nav="home" href="./index.html" class="block py-2">الصفحة الرئيسية</a>
                <a data-i18n="about" data-page-nav="about" href="./about.html" class="block py-2">من نحن</a>
                <a data-i18n="products" data-page-nav="products" href="./products.html" class="block py-2">المنتجات</a>
                <a data-i18n="services" data-page-nav="services" href="./services.html" class="block py-2">الخدمات</a>
                <a data-i18n="media" data-page-nav="media" href="./media.html" class="block py-2">المركز الأعلامى</a>
                <a data-i18n="contact" data-page-nav="contact" href="./contact.html" class="block py-2">تواصل معنا</a>
                <div class="mt-2 flex items-center gap-3 border-t border-gray-200 pt-3">
                    <button class="language-toggle rounded-full border border-queen-gold px-4 py-2 text-sm font-bold text-queen-ink" type="button" aria-label="Switch to English">EN</button>
                    <button class="theme-toggle rounded-full p-2 text-queen-ink" type="button" aria-label="Switch to dark mode"><i class="fa-solid fa-moon" aria-hidden="true"></i></button>
                </div>
            </div>
        </div>
    </nav>
    <div id="language-error" class="fixed inset-x-4 top-24 z-[60] hidden rounded-lg bg-red-700 px-4 py-3 text-center text-white shadow-lg" role="alert"></div>
`;

const siteFooterTemplate = `
    <footer class="bg-queen-footer py-12 text-white">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-3">
                <div>
                    <a data-i18n="brand" href="./index.html" class="mb-4 inline-block text-2xl font-extrabold text-white">كوين لاند</a>
                    <p data-i18n="footerAbout" class="max-w-md leading-7 text-white/65">
                        إحدى شركات كوين لاند جروب للاستثمار والتنمية الرائدة في صناعة الأسمدة في مصر منذ عام ٢٠١٠.
                    </p>
                </div>
                <div>
                    <h2 data-i18n="usefulLinks" class="mb-4 text-lg font-bold">روابط مفيدة</h2>
                    <ul class="space-y-2 text-white/65">
                        <li><a data-i18n="home" data-page-nav="home" href="./index.html" class="transition hover:text-queen-gold">الصفحة الرئيسية</a></li>
                        <li><a data-i18n="about" data-page-nav="about" href="./about.html" class="transition hover:text-queen-gold">من نحن</a></li>
                        <li><a data-i18n="categories" data-page-nav="products" href="./products.html" class="transition hover:text-queen-gold">التصنيفات</a></li>
                        <li><a data-i18n="services" data-page-nav="services" href="./services.html" class="transition hover:text-queen-gold">الخدمات</a></li>
                        <li><a data-i18n="media" data-page-nav="media" href="./media.html" class="transition hover:text-queen-gold">المركز الأعلامى</a></li>
                        <li><a data-i18n="faq" data-page-nav="faq" href="./faq.html" class="transition hover:text-queen-gold">أسئلة وأجوبة</a></li>
                        <li><a data-i18n="privacy" data-page-nav="privacy" href="./privacy.html" class="transition hover:text-queen-gold">سياسة الخصوصية</a></li>
                    </ul>
                </div>
                <div>
                    <h2 data-i18n="contact" class="mb-4 text-lg font-bold">تواصل معنا</h2>
                    <ul class="space-y-3 text-white/65">
                        <li data-i18n="address">الجيزة - ٣٣٨ شارع الهرم</li>
                        <li dir="ltr" class="text-right">01110005585 - 01110005565</li>
                        <li dir="ltr" class="text-right">02-35869574 - 093-4792105</li>
                        <li><a href="mailto:info@queenland-group.com" class="transition hover:text-queen-gold">info@queenland-group.com</a></li>
                    </ul>
                </div>
            </div>
            <div class="flex flex-col items-center justify-between gap-3 pt-6 text-sm text-white/50 sm:flex-row">
                <p data-i18n="copyright">جميع الحقوق محفوظة لشركة كوين لاند © 2026</p>
                <div class="flex gap-4">
                    <a data-i18n="helpDesk" data-page-nav="faq" href="./faq.html" class="transition hover:text-white">مكتب المساعدة</a>
                    <a data-i18n="privacy" data-page-nav="privacy" href="./privacy.html" class="transition hover:text-white">سياسة الخصوصية</a>
                </div>
            </div>
        </div>
    </footer>
    <button id="back-to-top" type="button" class="back-to-top" data-i18n-aria-label="backToTop" aria-label="Back to top">
        <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
    </button>
`;

class SiteHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = siteHeaderTemplate;
    }
}

class SiteFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = siteFooterTemplate;
    }
}

customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);
