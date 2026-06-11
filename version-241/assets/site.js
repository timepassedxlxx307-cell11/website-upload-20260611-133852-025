
(function () {
    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        var nextButton = hero.querySelector('[data-hero-next]');
        var prevButton = hero.querySelector('[data-hero-prev]');

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        show(0);
        start();
    }

    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]')).forEach(function (form) {
        var scope = document.querySelector(form.getAttribute('data-local-filter'));
        if (!scope) {
            return;
        }
        var input = form.querySelector('[name="q"]');
        var select = form.querySelector('[name="type"]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var empty = document.querySelector('[data-empty-result]');

        function applyFilter() {
            var q = input ? input.value.trim().toLowerCase() : '';
            var type = select ? select.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-card') || '').toLowerCase();
                var cardType = card.getAttribute('data-type') || '';
                var matched = (!q || text.indexOf(q) !== -1) && (!type || cardType === type);
                card.classList.toggle('hidden-card', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });
        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (select) {
            select.addEventListener('change', applyFilter);
        }
        applyFilter();
    });

    var searchForm = document.querySelector('[data-global-search]');
    if (searchForm) {
        searchForm.addEventListener('submit', function (event) {
            var input = searchForm.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                input && input.focus();
            }
        });
    }

    var searchRoot = document.querySelector('[data-search-results]');
    if (searchRoot && window.MOVIE_INDEX) {
        var params = new URLSearchParams(window.location.search);
        var keyword = (params.get('q') || '').trim().toLowerCase();
        var titleNode = document.querySelector('[data-search-title]');
        var list = window.MOVIE_INDEX.filter(function (item) {
            if (!keyword) {
                return false;
            }
            return [item.title, item.region, item.type, item.year, item.genre, item.tags].join(' ').toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 120);

        if (titleNode && keyword) {
            titleNode.textContent = '搜索：' + params.get('q');
        }

        if (!keyword) {
            searchRoot.innerHTML = '<div class="empty-result is-visible">请输入片名、地区、年份或题材进行搜索。</div>';
        } else if (!list.length) {
            searchRoot.innerHTML = '<div class="empty-result is-visible">暂无匹配结果，可以换一个关键词继续查找。</div>';
        } else {
            searchRoot.innerHTML = list.map(function (item) {
                return '<a class="movie-card" href="' + item.url + '" data-card="' + escapeHtml([item.title, item.region, item.type, item.year, item.genre, item.tags].join(' ')) + '" data-type="' + escapeHtml(item.type) + '">' +
                    '<div class="movie-thumb">' +
                        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
                        '<span class="movie-year">' + escapeHtml(item.year) + '</span>' +
                        '<span class="movie-hover">立即观看</span>' +
                    '</div>' +
                    '<div class="movie-body">' +
                        '<h3>' + escapeHtml(item.title) + '</h3>' +
                        '<p>' + escapeHtml(item.oneLine) + '</p>' +
                        '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
                    '</div>' +
                '</a>';
            }).join('');
        }
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }
})();
