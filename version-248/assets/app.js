(function () {
    function bySelector(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('.hero');
        if (!hero) {
            return;
        }
        var slides = bySelector('.hero-slide', hero);
        var dots = bySelector('.hero-dot', hero);
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        function show(next) {
            slides[index].classList.remove('active');
            dots[index].classList.remove('active');
            index = next;
            slides[index].classList.add('active');
            dots[index].classList.add('active');
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
            });
        });
        window.setInterval(function () {
            show((index + 1) % slides.length);
        }, 5600);
    }

    function matchesCard(card, query, type) {
        var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var queryMatch = !query || text.indexOf(query) !== -1;
        var typeMatch = type === 'all' || cardType === type;
        return queryMatch && typeMatch;
    }

    function filterGrid(root) {
        var input = root.querySelector('[data-filter-input]');
        var cards = bySelector('.movie-card, .ranking-item', root);
        var buttons = bySelector('[data-filter-type]', root);
        var empty = root.querySelector('[data-empty]');
        var activeType = 'all';
        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;
            cards.forEach(function (card) {
                var ok = matchesCard(card, query, activeType);
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }
        if (input) {
            input.addEventListener('input', apply);
        }
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                buttons.forEach(function (item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                activeType = button.getAttribute('data-filter-type') || 'all';
                apply();
            });
        });
        apply();
    }

    function initFilters() {
        bySelector('[data-filter-scope]').forEach(filterGrid);
    }

    function initSearchPage() {
        var page = document.querySelector('[data-search-page]');
        if (!page) {
            return;
        }
        var input = page.querySelector('[data-filter-input]');
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            input.value = q;
            input.dispatchEvent(new Event('input'));
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initSearchPage();
    });
})();
