(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function openSearch(form) {
        var input = qs('input[name="q"]', form);
        var target = form.getAttribute('data-search-target') || 'search.html';
        var value = input ? input.value.trim() : '';
        if (value) {
            window.location.href = target + '?q=' + encodeURIComponent(value);
        }
    }

    qsa('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            openSearch(form);
        });
    });

    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    var current = 0;
    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }
    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });
    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }
    showSlide(0);

    var filterPanel = qs('[data-filter-panel]');
    if (filterPanel) {
        var keywordInput = qs('[data-filter-keyword]', filterPanel);
        var yearSelect = qs('[data-filter-year]', filterPanel);
        var typeSelect = qs('[data-filter-type]', filterPanel);
        var resetButton = qs('[data-filter-reset]', filterPanel);
        var cards = qsa('[data-movie-card]');
        var emptyState = qs('[data-empty-state]');

        function applyFilter() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var year = normalize(yearSelect && yearSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var visible = 0;
            cards.forEach(function (card) {
                var content = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var okKeyword = !keyword || content.indexOf(keyword) !== -1;
                var okYear = !year || normalize(card.getAttribute('data-year')) === year;
                var okType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
                var show = okKeyword && okYear && okType;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle('show', visible === 0);
            }
        }

        [keywordInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (keywordInput) {
                    keywordInput.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                applyFilter();
            });
        }
    }

    var searchPage = qs('[data-search-page]');
    if (searchPage && window.SEARCH_INDEX) {
        var searchInput = qs('[data-site-search-input]');
        var resultBox = qs('[data-search-results]');
        var searchEmpty = qs('[data-search-empty]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        if (searchInput) {
            searchInput.value = initialQuery;
        }

        function createResult(item) {
            var tags = (item.tags || []).slice(0, 4).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            return [
                '<article class="search-result">',
                '<a href="' + item.url + '"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></a>',
                '<div>',
                '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
                '<p>' + escapeHtml(item.region + ' · ' + item.year + ' · ' + item.type + ' · ' + item.genre) + '</p>',
                '<p>' + escapeHtml(item.oneLine) + '</p>',
                '<div class="tag-row">' + tags + '</div>',
                '</div>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return (value || '').toString()
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function performSearch() {
            var query = normalize(searchInput && searchInput.value);
            var results = [];
            if (query) {
                results = window.SEARCH_INDEX.filter(function (item) {
                    var haystack = normalize([
                        item.title,
                        item.region,
                        item.year,
                        item.type,
                        item.genre,
                        item.oneLine,
                        (item.tags || []).join(' ')
                    ].join(' '));
                    return haystack.indexOf(query) !== -1;
                }).slice(0, 80);
            }
            if (resultBox) {
                resultBox.innerHTML = results.map(createResult).join('');
            }
            if (searchEmpty) {
                searchEmpty.classList.toggle('show', results.length === 0);
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', performSearch);
        }
        performSearch();
    }
})();
