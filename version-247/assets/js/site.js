(function () {
    var header = document.querySelector('[data-header]');
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 12) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (menuButton && mobileNav && header) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
            header.classList.toggle('menu-open', mobileNav.classList.contains('open'));
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('active', idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle('active', idx === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    var yearFilters = Array.prototype.slice.call(document.querySelectorAll('[data-year-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .ranking-row'));
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var keyword = normalize(searchInputs.map(function (input) {
            return input.value;
        }).join(' '));
        var selectedYear = yearFilters.map(function (select) {
            return select.value;
        }).filter(Boolean)[0] || '';
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-region'),
                card.textContent
            ].join(' '));
            var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
            var isVisible = matchKeyword && matchYear;
            card.classList.toggle('hidden-by-filter', !isVisible);
            if (isVisible) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('show', visible === 0);
        }
    }

    searchInputs.forEach(function (input) {
        input.addEventListener('input', applyFilters);
    });
    yearFilters.forEach(function (select) {
        select.addEventListener('change', applyFilters);
    });
})();
