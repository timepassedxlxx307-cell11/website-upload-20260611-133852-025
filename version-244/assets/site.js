(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !mobileNav) return;
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '×' : '☰';
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
        dot.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    if (prev) prev.addEventListener('click', function () { show(index - 1); start(); });
    if (next) next.addEventListener('click', function () { show(index + 1); start(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); start(); });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-search]'));
    var groups = Array.prototype.slice.call(document.querySelectorAll('[data-filter-group]'));
    if (!inputs.length && !groups.length) return;
    var activeFilter = 'all';

    function normalize(value) {
      return (value || '').toString().toLowerCase().replace(/\s+/g, '');
    }

    function queryValue() {
      return normalize(inputs.map(function (input) { return input.value; }).join(' '));
    }

    function apply() {
      var query = queryValue();
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var filterText = normalize(card.getAttribute('data-filter'));
        var queryMatch = !query || text.indexOf(query) !== -1;
        var filterMatch = activeFilter === 'all' || filterText.indexOf(normalize(activeFilter)) !== -1;
        card.classList.toggle('is-hidden', !(queryMatch && filterMatch));
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', apply);
    });

    groups.forEach(function (group) {
      var buttons = Array.prototype.slice.call(group.querySelectorAll('[data-filter]'));
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeFilter = button.getAttribute('data-filter') || 'all';
          buttons.forEach(function (item) { item.classList.remove('is-active'); });
          button.classList.add('is-active');
          apply();
        });
      });
    });
  }

  function initMoviePlayer(source) {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('player-overlay');
    var button = document.getElementById('play-button');
    if (!video || !source) return;
    var attached = false;
    var hls = null;

    function attach(autoPlay) {
      if (!attached) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ maxBufferLength: 30 });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        attached = true;
      }
      if (autoPlay) {
        var action = video.play();
        if (action && typeof action.catch === 'function') action.catch(function () {});
      }
    }

    function start() {
      attach(true);
      if (overlay) overlay.classList.add('is-hidden');
    }

    if (button) button.addEventListener('click', start);
    if (overlay) overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!attached) start();
    });
    video.addEventListener('play', function () {
      if (overlay) overlay.classList.add('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) hls.destroy();
    });
  }

  window.setupMoviePlayer = initMoviePlayer;

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
  });
})();
