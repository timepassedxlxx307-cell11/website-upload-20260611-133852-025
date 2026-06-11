import { H as Hls } from './hls-dru42stk.js';

var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var source = player.getAttribute('data-src');
    var hls = null;
    var ready = false;

    function markPlaying() {
        player.classList.add('playing');
    }

    function startPlayback() {
        markPlaying();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                player.classList.remove('playing');
            });
        }
    }

    function loadSource() {
        if (ready) {
            startPlayback();
            return;
        }
        ready = true;

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                startPlayback();
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                    return;
                }
                if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                    return;
                }
                player.classList.remove('playing');
            });
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', startPlayback, { once: true });
            return;
        }

        player.classList.remove('playing');
    }

    function togglePlayback() {
        if (!video) {
            return;
        }
        if (!ready) {
            loadSource();
            return;
        }
        if (video.paused) {
            startPlayback();
        } else {
            video.pause();
            player.classList.remove('playing');
        }
    }

    if (button) {
        button.addEventListener('click', togglePlayback);
    }
    video.addEventListener('click', togglePlayback);
    video.addEventListener('play', markPlaying);
    video.addEventListener('pause', function () {
        player.classList.remove('playing');
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
});
