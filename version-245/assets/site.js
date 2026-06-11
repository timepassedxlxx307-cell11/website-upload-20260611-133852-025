(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('.menu-toggle');
    var panel = qs('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initImages() {
    qsa('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-missing');
        img.removeAttribute('src');
      }, { once: true });
    });
  }

  function initCardList() {
    qsa('[data-list-toolbar]').forEach(function (toolbar) {
      var input = qs('[data-list-query]', toolbar);
      var select = qs('[data-list-sort]', toolbar);
      var list = qs('[data-card-list]');
      if (!list) {
        return;
      }
      var cards = qsa('.movie-card', list);
      function render() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var sorted = cards.slice();
        if (select && select.value === 'heat') {
          sorted.sort(function (a, b) {
            return Number(b.dataset.heat || 0) - Number(a.dataset.heat || 0);
          });
        }
        if (select && select.value === 'year') {
          sorted.sort(function (a, b) {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          });
        }
        sorted.forEach(function (card) {
          var hay = [card.dataset.title, card.dataset.category, card.dataset.year, card.dataset.region, card.dataset.type].join(' ').toLowerCase();
          var ok = !keyword || hay.indexOf(keyword) !== -1;
          card.style.display = ok ? '' : 'none';
          list.appendChild(card);
        });
      }
      if (input) {
        input.addEventListener('input', render);
      }
      if (select) {
        select.addEventListener('change', render);
      }
    });
  }

  function initPlayer() {
    qsa('.watch-box').forEach(function (box) {
      var video = qs('video', box);
      var button = qs('.play-overlay', box);
      var source = qs('source', video);
      var hls;
      var ready = false;
      if (!video || !button || !source) {
        return;
      }
      function prepare() {
        var url = source.getAttribute('src');
        if (ready || !url) {
          return Promise.resolve();
        }
        ready = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          return new Promise(function (resolve) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
          });
        }
        video.src = url;
        video.load();
        return Promise.resolve();
      }
      function start() {
        prepare().then(function () {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.then === 'function') {
            playPromise.then(function () {
              box.classList.add('is-playing');
            }).catch(function () {
              box.classList.remove('is-playing');
            });
          } else {
            box.classList.add('is-playing');
          }
        });
      }
      button.addEventListener('click', start);
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          box.classList.remove('is-playing');
        }
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[ch];
    });
  }

  function initSearch() {
    var form = qs('[data-search-form]');
    var results = qs('[data-search-results]');
    var title = qs('[data-search-title]');
    var filters = qs('[data-search-filters]');
    var list = window.searchIndex || [];
    if (!form || !results || !list.length) {
      return;
    }
    var input = qs('input[name="q"]', form);
    var category = filters ? qs('select[name="category"]', filters) : null;
    var type = filters ? qs('select[name="type"]', filters) : null;
    var year = filters ? qs('select[name="year"]', filters) : null;
    var params = new URLSearchParams(window.location.search);
    if (params.get('q')) {
      input.value = params.get('q');
    }
    function card(item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card">'
        + '<a class="poster-wrap" href="' + item.url + '" aria-label="观看 ' + escapeHtml(item.title) + '">'
        + '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">'
        + '<span class="badge">' + escapeHtml(item.category) + '</span>'
        + '<span class="duration">' + escapeHtml(item.duration) + '</span>'
        + '</a>'
        + '<div class="movie-info">'
        + '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>'
        + '<p>' + escapeHtml(item.oneLine) + '</p>'
        + '<div class="meta-row"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>热度 ' + escapeHtml(item.heatText) + '</span></div>'
        + '<div class="tag-row">' + tags + '</div>'
        + '</div>'
        + '</article>';
    }
    function render() {
      var q = input.value.trim().toLowerCase();
      var cat = category ? category.value : '';
      var typ = type ? type.value : '';
      var yr = year ? year.value : '';
      var matched = list.filter(function (item) {
        var hay = [item.title, item.category, item.region, item.type, item.year, item.genre, item.oneLine, (item.tags || []).join(' ')].join(' ').toLowerCase();
        return (!q || hay.indexOf(q) !== -1) && (!cat || item.category === cat) && (!typ || item.type === typ) && (!yr || item.year === yr);
      }).slice(0, 80);
      if (title) {
        title.textContent = q ? '搜索结果：' + input.value.trim() : '搜索结果';
      }
      if (!matched.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
        return;
      }
      results.innerHTML = matched.map(card).join('');
      initImages();
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
      var url = new URL(window.location.href);
      if (input.value.trim()) {
        url.searchParams.set('q', input.value.trim());
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState(null, '', url.toString());
    });
    [input, category, type, year].forEach(function (element) {
      if (element) {
        element.addEventListener('input', render);
        element.addEventListener('change', render);
      }
    });
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initImages();
    initCardList();
    initPlayer();
    initSearch();
  });
}());
