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
    if (!document.body || document.querySelector(".site-topbar")) return;

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
  }

  installInstrumentHelpers();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountTopbar, { once: true });
  } else {
    mountTopbar();
  }
})();
