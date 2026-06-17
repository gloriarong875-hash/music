(function () {
  const INSTRUMENTS = [
    { key: "sheng", label: "\u7b19" },
    { key: "gu", label: "\u9f13" },
    { key: "qin", label: "\u7434" },
    { key: "di", label: "\u7b1b" },
    { key: "xun", label: "\u57d9" }
  ];

  const navItems = [
    { key: "home", label: "\u9996\u9875", href: "../0\u9996\u9875/index.html" },
    {
      key: "study",
      label: "\u7814\u7269",
      href: "../\u4e8c\u7ea7\u6807\u9898/select.html?section=yanwu"
    },
    {
      key: "observe",
      label: "\u89c2\u8c61",
      href: "../\u4e8c\u7ea7\u6807\u9898/select.html?section=guanxiang"
    },
    {
      key: "chronicle",
      label: "\u7f16\u5e74",
      href: "../\u4e8c\u7ea7\u6807\u9898/select.html?section=biannian"
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

  function getActiveKey() {
    const pathname = decodeURIComponent(window.location.pathname).replace(/\\/g, "/");

    if (pathname.endsWith("/guanxiang.html")) return "observe";
    if (pathname.endsWith("/biannian.html")) return "chronicle";
    if (pathname.endsWith("/yanwu.html")) return "study";

    const params = new URLSearchParams(window.location.search);
    const section = params.get("section") || "yanwu";

    if (section === "guanxiang") return "observe";
    if (section === "biannian") return "chronicle";
    return "study";
  }

  function mountTopbar() {
    if (document.querySelector(".site-topbar")) return;

    const activeKey = getActiveKey();

    const updateScale = () => {
      const topbarHeight =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--site-topbar-height")
        ) || 44;
      const scale = Math.max(0.82, (window.innerHeight - topbarHeight) / window.innerHeight);
      document.documentElement.style.setProperty("--site-page-scale", scale.toFixed(4));
      document.documentElement.style.setProperty(
        "--site-page-width",
        `${(100 / scale).toFixed(4)}%`
      );
    };

    const bar = document.createElement("header");
    bar.className = "site-topbar";
    bar.setAttribute("aria-label", "\u5168\u7ad9\u7d22\u5f15");
    bar.innerHTML = `
      <nav class="site-topbar__nav" aria-label="\u9996\u9875\u3001\u7814\u7269\u3001\u89c2\u8c61\u3001\u7f16\u5e74">
        ${navItems
          .map(
            (item) => `
          <a class="site-topbar__link${item.key === activeKey ? " active" : ""}" href="${item.href}" ${
              item.key === activeKey ? 'aria-current="page"' : ""
            }>
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
    document.body.insertBefore(bar, document.body.firstChild);
  }

  installInstrumentHelpers();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountTopbar, { once: true });
  } else {
    mountTopbar();
  }
})();
