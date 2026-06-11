(function () {
    function setupPlayer(box) {
        var video = box.querySelector('video');
        var overlay = box.querySelector('[data-player-overlay]');
        var message = box.querySelector('[data-player-message]');
        var url = box.getAttribute('data-video-url');
        var started = false;
        var hls = null;

        function setMessage(text) {
            if (message) {
                message.textContent = text || '';
            }
        }

        function start() {
            if (!video || !url) {
                setMessage('播放暂时无法加载，请稍后重试。');
                return;
            }
            if (!started) {
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                        backBufferLength: 60
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                } else {
                    setMessage('请使用主流浏览器观看。');
                    return;
                }
            }
            if (overlay) {
                overlay.classList.add('hidden');
            }
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    setMessage('点击播放按钮继续观看。');
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!started) {
                    start();
                }
            });
            video.addEventListener('error', function () {
                setMessage('播放暂时无法加载，请稍后重试。');
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(setupPlayer);
})();
