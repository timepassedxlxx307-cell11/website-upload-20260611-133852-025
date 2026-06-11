(function () {
  function getAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupSiteSearch() {
    getAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var query = input ? input.value.trim() : "";
        var target = "./search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero-slider]");
    if (!hero) {
      return;
    }
    var slides = getAll(".hero-slide", hero);
    var dots = getAll(".hero-dot", hero);
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var input = panel.querySelector(".js-filter-input");
    var selects = getAll(".js-filter-select", panel);
    var cards = getAll(".js-filter-card");
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q") || "";

    if (input && queryValue) {
      input.value = queryValue;
    }

    function normalize(value) {
      return (value || "").toString().trim().toLowerCase();
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      var active = {};
      selects.forEach(function (select) {
        active[select.getAttribute("data-filter")] = normalize(select.value);
      });

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var matchesText = !query || text.indexOf(query) !== -1;
        var matchesSelects = selects.every(function (select) {
          var key = select.getAttribute("data-filter");
          var selected = active[key];
          if (!selected) {
            return true;
          }
          return normalize(card.getAttribute("data-" + key)) === selected;
        });
        card.classList.toggle("hidden-card", !(matchesText && matchesSelects));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
    apply();
  }

  window.initMoviePlayer = function (streamUrl, videoId, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !streamUrl) {
      return;
    }

    var attached = false;
    var hlsPlayer = null;

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsPlayer = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsPlayer.loadSource(streamUrl);
        hlsPlayer.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function startPlayback() {
      attachStream();
      button.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        startPlayback();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hlsPlayer && typeof hlsPlayer.destroy === "function") {
        hlsPlayer.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupSiteSearch();
    setupHero();
    setupFilters();
  });
})();
