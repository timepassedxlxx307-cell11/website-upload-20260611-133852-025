
(function () {
    var panel = document.querySelector('[data-player]');
    if (!panel) {
        return;
    }

    var video = panel.querySelector('video');
    var cover = panel.querySelector('[data-play]');
    var streamUrl = panel.getAttribute('data-stream');
    var ready = false;
    var hls = null;

    function setupStream() {
        if (ready || !video || !streamUrl) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            ready = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            ready = true;
            return;
        }

        video.src = streamUrl;
        ready = true;
    }

    function startPlayback() {
        setupStream();
        if (cover) {
            cover.classList.add('is-hidden');
        }
        if (video) {
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    video.controls = true;
                });
            }
        }
    }

    if (cover) {
        cover.addEventListener('click', startPlayback);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
    }

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
        }
    });
})();
