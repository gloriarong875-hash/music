(function () {
  const INSTRUMENTS = [
    { key: "sheng", label: "\u7b19" },
    { key: "gu", label: "\u9f13" },
    { key: "qin", label: "\u7434" },
    { key: "di", label: "\u7b1b" },
    { key: "xun", label: "\u57d9" }
  ];

  const navItems = [
    { key: "home", label: "\u9996\u9875", href: "0\u9996\u9875/index.html" },
    {
      key: "study",
      label: "\u7814\u7269",
      href: "\u4e8c\u7ea7\u6807\u9898/select.html?section=yanwu"
    },
    {
      key: "observe",
      label: "\u89c2\u8c61",
      href: "\u4e8c\u7ea7\u6807\u9898/select.html?section=guanxiang"
    },
    {
      key: "chronicle",
      label: "\u7f16\u5e74",
      href: "\u4e8c\u7ea7\u6807\u9898/select.html?section=biannian"
    }
  ];

  function installInstrumentHelpers() {
    window.INSTRUMENTS = INSTRUMENTS.slice();

    window.getCurrentInstrument = function () {
      const params = new URLSearchParams(window.location.search);
      const instrument = params.get("instrument");
      const matched = INSTRUMENTS.find((item) => item.key === instrument);
      return matched ? matched.key : "sheng";
    };

    window.getCurrentInstrumentLabel = function () {
      const currentInstrument = window.getCurrentInstrument();
      const matched = INSTRUMENTS.find((item) => item.key === currentInstrument);
      return matched ? matched.label : "\u7b19";
    };

    window.addInstrumentParam = function (path, instrument) {
      const instrumentKey = INSTRUMENTS.some((item) => item.key === instrument)
        ? instrument
        : window.getCurrentInstrument();
      const separator = path.includes("?") ? "&" : "?";
      return `${path}${separator}instrument=${encodeURIComponent(instrumentKey)}`;
    };
  }

  function getCurrentScriptUrl() {
    if (document.currentScript && document.currentScript.src) {
      return new URL(document.currentScript.src, window.location.href);
    }

    const fallbackScript = Array.from(document.scripts).find((script) =>
      /site-nav\.js(?:\?|$)/.test(script.src || "")
    );

    return fallbackScript && fallbackScript.src
      ? new URL(fallbackScript.src, window.location.href)
      : new URL("./site-nav.js", window.location.href);
  }

  function normalizePathname(pathname) {
    return decodeURIComponent(pathname).replace(/\\/g, "/");
  }

  function getRootUrl() {
    return new URL("../", getCurrentScriptUrl());
  }

  function getPageRelativePath(rootUrl) {
    const pageUrl = new URL(window.location.href);
    const rootPath = normalizePathname(rootUrl.pathname);
    const pagePath = normalizePathname(pageUrl.pathname);

    if (!pagePath.startsWith(rootPath)) {
      return "";
    }

    return pagePath.slice(rootPath.length).replace(/^\/+/, "");
  }

  function getSelectorActiveKey() {
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section") || "yanwu";

    if (section === "guanxiang") return "observe";
    if (section === "biannian") return "chronicle";
    return "study";
  }

  function getActiveKey(pageRelativePath) {
    if (!pageRelativePath || pageRelativePath.startsWith("0\u9996\u9875/")) return "home";

    if (
      pageRelativePath.startsWith("\u4e8c\u7ea7\u6807\u9898/select.html") ||
      pageRelativePath.startsWith("\u4e8c\u7ea7\u6807\u9898/yanwu.html") ||
      pageRelativePath.startsWith("\u4e8c\u7ea7\u6807\u9898/guanxiang.html") ||
      pageRelativePath.startsWith("\u4e8c\u7ea7\u6807\u9898/biannian.html")
    ) {
      if (pageRelativePath.startsWith("\u4e8c\u7ea7\u6807\u9898/guanxiang.html")) return "observe";
      if (pageRelativePath.startsWith("\u4e8c\u7ea7\u6807\u9898/biannian.html")) return "chronicle";
      return getSelectorActiveKey();
    }

    if (
      pageRelativePath.startsWith("1.1\u5236\u4f5c/") ||
      pageRelativePath.startsWith("1.2\u58f0\u7eb9-all/") ||
      pageRelativePath.startsWith("1.3\u97f3\u753b\u6545\u4e8b/")
    ) {
      return "study";
    }

    if (
      pageRelativePath.startsWith("2.1\u90e8\u4ef6\u6851\u57fa\u56fe/") ||
      pageRelativePath.startsWith("2.2\u5f62\u5236\u6f14\u53d8/")
    ) {
      return "observe";
    }

    if (
      pageRelativePath.startsWith("3.1\u5730\u57df\u6d41\u6d3e/") ||
      pageRelativePath.startsWith("3.2\u753b\u4f5c\u6570\u636e/") ||
      pageRelativePath.startsWith("3.3\u5927\u4e8b\u7eaa\u5e74/")
    ) {
      return "chronicle";
    }

    return "";
  }

  function updateScale() {
    const topbarHeight =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--site-topbar-height")
      ) || 44;
    const scale = Math.max(0.82, (window.innerHeight - topbarHeight) / window.innerHeight);
    document.documentElement.style.setProperty("--site-page-scale", scale.toFixed(4));
    document.documentElement.style.setProperty("--site-page-width", `${(100 / scale).toFixed(4)}%`);
  }

  function buildHref(rootUrl, href) {
    return new URL(href, rootUrl).href;
  }

  function installGlobalBgm() {
    if (window.__JSYZGlobalBgmInstalled) return;
    window.__JSYZGlobalBgmInstalled = true;

    const bgmUrl = new URL("assets/bgm.m4a", getCurrentScriptUrl()).href;
    const normalVolume = 0.28;
    const duckVolume = 0.025;
    const fadeMs = 420;
    const retryDelays = [250, 800, 1600, 3200];
    const activePageMedia = new Set();
    const watchedMedia = new WeakSet();
    let fadeFrame = 0;
    let restoreTimer = 0;
    let hasUserGesture = false;
    let manualDuckUntil = 0;

    const bgm = document.createElement("audio");
    const preloadLink = document.createElement("link");
    preloadLink.rel = "preload";
    preloadLink.as = "audio";
    preloadLink.href = bgmUrl;
    document.head.appendChild(preloadLink);

    bgm.src = bgmUrl;
    bgm.autoplay = true;
    bgm.loop = true;
    bgm.preload = "auto";
    bgm.volume = normalVolume;
    bgm.setAttribute("autoplay", "");
    bgm.setAttribute("playsinline", "");
    bgm.dataset.globalBgm = "true";
    bgm.setAttribute("aria-hidden", "true");
    bgm.style.display = "none";

    function getSavedBgmTime() {
      try {
        return Number(sessionStorage.getItem("jsyz-bgm-time") || "0");
      } catch (error) {
        return 0;
      }
    }

    function saveBgmTime() {
      try {
        const savedTime = Number(sessionStorage.getItem("jsyz-bgm-time") || "0");
        sessionStorage.setItem("jsyz-bgm-time", String(bgm.currentTime || savedTime || 0));
      } catch (error) {
        // Ignore storage issues in privacy-restricted browsers.
      }
    }

    function applySavedBgmTime() {
      const savedTime = getSavedBgmTime();
      if (Number.isFinite(savedTime) && savedTime > 0 && Math.abs(bgm.currentTime - savedTime) > 1) {
        bgm.currentTime = savedTime;
      }
    }

    try {
      applySavedBgmTime();
    } catch (error) {
      // Ignore storage issues in privacy-restricted browsers.
    }

    bgm.addEventListener("loadedmetadata", () => {
      try {
        applySavedBgmTime();
      } catch (error) {
        // Some browsers reject early seeking until enough media metadata is available.
      }
    });

    function isBgmMedia(media) {
      return media && media.dataset && media.dataset.globalBgm === "true";
    }

    function isAudibleMedia(media) {
      return (
        media &&
        !isBgmMedia(media) &&
        !media.paused &&
        !media.ended &&
        !media.muted &&
        media.volume > 0
      );
    }

    function getTargetVolume() {
      const hasManualDuck = Date.now() < manualDuckUntil;
      const hasPageSound = Array.from(activePageMedia).some(isAudibleMedia);
      return hasManualDuck || hasPageSound ? duckVolume : normalVolume;
    }

    function fadeBgmTo(targetVolume) {
      window.cancelAnimationFrame(fadeFrame);
      if (Math.abs(bgm.volume - targetVolume) < 0.004) {
        bgm.volume = targetVolume;
        return;
      }

      const startVolume = bgm.volume;
      const startedAt = performance.now();

      function step(now) {
        const progress = Math.min(1, (now - startedAt) / fadeMs);
        bgm.volume = startVolume + (targetVolume - startVolume) * progress;
        if (progress >= 1) {
          bgm.volume = targetVolume;
          return;
        }
        fadeFrame = window.requestAnimationFrame(step);
      }

      fadeFrame = window.requestAnimationFrame(step);
    }

    function refreshDuckState() {
      activePageMedia.forEach((media) => {
        if (!isAudibleMedia(media)) activePageMedia.delete(media);
      });
      fadeBgmTo(getTargetVolume());
    }

    function scheduleRestoreCheck(duration) {
      window.clearTimeout(restoreTimer);
      restoreTimer = window.setTimeout(refreshDuckState, duration + 80);
    }

    function scanPageMedia() {
      document.querySelectorAll("audio, video").forEach((media) => {
        if (isBgmMedia(media)) return;
        watchMedia(media);
        if (isAudibleMedia(media)) {
          activePageMedia.add(media);
          manualDuckUntil = Math.max(manualDuckUntil, Date.now() + 900);
          scheduleRestoreCheck(900);
        } else {
          activePageMedia.delete(media);
        }
      });
      refreshDuckState();
    }

    function watchMedia(media) {
      if (!media || isBgmMedia(media) || watchedMedia.has(media)) return;
      watchedMedia.add(media);
      ["play", "playing"].forEach((eventName) => {
        media.addEventListener(eventName, handleMediaPlay);
      });
      ["pause", "ended", "emptied", "abort"].forEach((eventName) => {
        media.addEventListener(eventName, handleMediaQuiet);
      });
      media.addEventListener("volumechange", refreshDuckState);
    }

    function tryPlayBgm(force) {
      if (!force && !hasUserGesture) return;
      if (bgm.readyState === 0) {
        bgm.load();
      }
      bgm.play().catch(() => {
        // Browsers may still block autoplay; the next gesture will retry.
      });
    }

    function retryPlayBgm() {
      retryDelays.forEach((delay) => {
        window.setTimeout(() => tryPlayBgm(true), delay);
      });
    }

    function unlockBgm() {
      hasUserGesture = true;
      tryPlayBgm();
    }

    function observePageMedia() {
      scanPageMedia();

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType !== 1) return;
            if (node.matches && node.matches("audio, video")) {
              watchMedia(node);
            }
            if (node.querySelectorAll) {
              node.querySelectorAll("audio, video").forEach(watchMedia);
            }
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    function handleMediaPlay(event) {
      const media = event.target;
      if (isBgmMedia(media)) return;
      watchMedia(media);
      activePageMedia.add(media);
      manualDuckUntil = Math.max(manualDuckUntil, Date.now() + 1200);
      scheduleRestoreCheck(1200);
      unlockBgm();
      refreshDuckState();
    }

    function handleMediaQuiet(event) {
      const media = event.target;
      if (isBgmMedia(media)) return;
      activePageMedia.delete(media);
      refreshDuckState();
    }

    ["pointerdown", "click", "keydown", "touchstart"].forEach((eventName) => {
      document.addEventListener(eventName, unlockBgm, { passive: true });
    });

    document.addEventListener(
      "pointerdown",
      (event) => {
        if (event.target.closest && event.target.closest(".site-topbar__link")) {
          saveBgmTime();
        }
      },
      true
    );

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) tryPlayBgm(true);
    });

    window.addEventListener("pageshow", () => tryPlayBgm(true));

    ["play", "playing"].forEach((eventName) => {
      document.addEventListener(eventName, handleMediaPlay, true);
    });

    ["pause", "ended", "emptied", "abort"].forEach((eventName) => {
      document.addEventListener(eventName, handleMediaQuiet, true);
    });

    document.addEventListener(
      "volumechange",
      (event) => {
        if (!isBgmMedia(event.target)) refreshDuckState();
      },
      true
    );

    const nativePlay = HTMLMediaElement.prototype.play;
    const nativePause = HTMLMediaElement.prototype.pause;

    HTMLMediaElement.prototype.play = function (...args) {
      if (!isBgmMedia(this)) {
        watchMedia(this);
        activePageMedia.add(this);
        unlockBgm();
        refreshDuckState();
      }
      const result = nativePlay.apply(this, args);
      if (result && typeof result.catch === "function") {
        result.catch(() => {
          activePageMedia.delete(this);
          refreshDuckState();
        });
      }
      return result;
    };

    HTMLMediaElement.prototype.pause = function (...args) {
      const result = nativePause.apply(this, args);
      if (!isBgmMedia(this)) {
        activePageMedia.delete(this);
        refreshDuckState();
      }
      return result;
    };

    window.setInterval(saveBgmTime, 1800);
    window.addEventListener("pagehide", saveBgmTime);
    window.addEventListener("beforeunload", saveBgmTime);

    document.body.appendChild(bgm);
    bgm.load();
    window.JSYZBgm = {
      audio: bgm,
      play: () => {
        hasUserGesture = true;
        return bgm.play();
      },
      pause: () => bgm.pause(),
      duck: (duration = 3000) => {
        manualDuckUntil = Math.max(manualDuckUntil, Date.now() + duration);
        scheduleRestoreCheck(duration);
        fadeBgmTo(duckVolume);
      },
      restore: () => {
        manualDuckUntil = 0;
        refreshDuckState();
      }
    };
    tryPlayBgm(true);
    window.setTimeout(() => tryPlayBgm(true), 0);
    retryPlayBgm();
    observePageMedia();
  }

  function ensureHost() {
    let host = document.getElementById("siteNav");

    if (!host) {
      host = document.createElement("div");
      host.id = "siteNav";
      document.body.insertBefore(host, document.body.firstChild);
    }

    return host;
  }

  function mountTopbar() {
    if (!document.body) return;
    if (document.querySelector(".site-topbar")) {
      installGlobalBgm();
      return;
    }

    const rootUrl = getRootUrl();
    const pageRelativePath = getPageRelativePath(rootUrl);
    const activeKey = getActiveKey(pageRelativePath);
    const host = ensureHost();

    const bar = document.createElement("header");
    bar.className = "site-topbar";
    bar.setAttribute("aria-label", "\u5168\u7ad9\u7d22\u5f15");
    bar.innerHTML = `
      <nav class="site-topbar__nav" aria-label="\u9996\u9875\u3001\u7814\u7269\u3001\u89c2\u8c61\u3001\u7f16\u5e74">
        ${navItems
          .map(
            (item) => `
          <a class="site-topbar__link${item.key === activeKey ? " active" : ""}" href="${buildHref(
              rootUrl,
              item.href
            )}" ${item.key === activeKey ? 'aria-current="page"' : ""}>
            <h2>${item.label}</h2>
          </a>
        `
          )
          .join("")}
      </nav>
    `;

    updateScale();
    window.addEventListener("resize", updateScale);
    document.body.classList.add("has-site-topbar");
    if (pageRelativePath.startsWith("1.1\u5236\u4f5c/")) {
      document.body.classList.add("site-section-make");
    }
    host.innerHTML = "";
    host.appendChild(bar);
    installGlobalBgm();
  }

  installInstrumentHelpers();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountTopbar, { once: true });
  } else {
    mountTopbar();
  }
})();
