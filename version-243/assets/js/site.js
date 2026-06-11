(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-mobile-toggle]');
        var menu = document.querySelector('[data-mobile-nav]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('open');
            button.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(index);
                start();
            });
        });

        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var scopeName = panel.getAttribute('data-filter-panel');
            var scope = scopeName ? document.querySelector(scopeName) : document;
            if (!scope) {
                scope = document;
            }
            var input = panel.querySelector('[data-search-input]');
            var typeSelect = panel.querySelector('[data-type-select]');
            var yearSelect = panel.querySelector('[data-year-select]');
            var emptyState = document.querySelector('[data-empty-state="' + (scopeName || 'document') + '"]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));

            function apply() {
                var keyword = normalize(input ? input.value : '');
                var typeValue = typeSelect ? typeSelect.value : '';
                var yearValue = yearSelect ? yearSelect.value : '';
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year')
                    ].join(' '));
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
                    var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
                    var visible = matchKeyword && matchType && matchYear;
                    card.style.display = visible ? '' : 'none';
                    if (visible) {
                        visibleCount += 1;
                    }
                });

                if (emptyState) {
                    emptyState.style.display = visibleCount ? 'none' : 'block';
                }
            }

            [input, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var streamUrl = player.getAttribute('data-stream-url');
            var loaded = false;
            var readyCallbacks = [];
            var hlsInstance = null;

            if (!video || !button || !streamUrl) {
                return;
            }

            function runReadyCallbacks() {
                var callbacks = readyCallbacks.slice();
                readyCallbacks.length = 0;
                callbacks.forEach(function (callback) {
                    callback();
                });
            }

            function fallbackReady() {
                window.setTimeout(function () {
                    if (readyCallbacks.length) {
                        runReadyCallbacks();
                    }
                }, 600);
            }

            function attachStream(callback) {
                if (callback) {
                    readyCallbacks.push(callback);
                }
                if (loaded) {
                    runReadyCallbacks();
                    return;
                }
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                    video.addEventListener('loadedmetadata', runReadyCallbacks, { once: true });
                    video.load();
                    fallbackReady();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, runReadyCallbacks);
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                hlsInstance.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                hlsInstance.recoverMediaError();
                            }
                        }
                    });
                    fallbackReady();
                    return;
                }
                video.src = streamUrl;
                video.addEventListener('loadedmetadata', runReadyCallbacks, { once: true });
                video.load();
                fallbackReady();
            }

            function playVideo() {
                button.hidden = true;
                video.controls = true;
                attachStream(function () {
                    var result = video.play();
                    if (result && typeof result.catch === 'function') {
                        result.catch(function () {
                            button.hidden = false;
                        });
                    }
                });
            }

            button.addEventListener('click', playVideo);
            player.addEventListener('click', function (event) {
                if (event.target === video && video.paused) {
                    playVideo();
                }
            });
            video.addEventListener('play', function () {
                button.hidden = true;
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
}());
