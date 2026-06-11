(function () {
    function initPlayer(player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.player-start');
        var overlay = player.querySelector('.player-overlay');
        var src = player.getAttribute('data-play');
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached || !src || !video) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        function start() {
            attach();
            player.classList.add('playing');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    player.classList.remove('playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                start();
            });
        }
        if (overlay) {
            overlay.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('playing');
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(initPlayer);
    });
})();
