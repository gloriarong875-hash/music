(function () {
  /*
    中文脚注：全站上边栏注入脚本。
    - 修改导航文字：改 navItems 的 label。
    - 修改跳转目标：改 navItems 的 href。
    - 当前上边栏保留首页、研物、观象、编年四个板块。
    - 视觉样式保持 site-nav 原版，只把路径判断改成当前项目结构可用的写法。
  */
  const navItems = [
    { key: "home", label: "首页", href: "0首页/index.html" },
    { key: "study", label: "研物", href: "1.1制作/笙/index.html" },
    { key: "observe", label: "观象", href: "2.1部件桑基图/笙/index.html" },
    { key: "chronicle", label: "编年", href: "3.3大事纪年/笙/index.html" }
  ];

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

  function getActiveKey(pageRelativePath) {
    /* 中文脚注：这里根据当前目录前缀判断当前属于哪个板块，用于高亮当前导航文字。 */
    if (!pageRelativePath || pageRelativePath.startsWith("0首页/")) return "home";
    if (
      pageRelativePath.startsWith("1.1制作/") ||
      pageRelativePath.startsWith("1.2声纹-all/") ||
      pageRelativePath.startsWith("1.3音画故事/")
    ) return "study";
    if (
      pageRelativePath.startsWith("2.1部件桑基图/") ||
      pageRelativePath.startsWith("2.2形制演变/") ||
      pageRelativePath.startsWith("3.1地域流派/")
    ) return "observe";
    if (
      pageRelativePath.startsWith("3.2画作数据/") ||
      pageRelativePath.startsWith("3.3大事纪年/")
    ) return "chronicle";
    return "";
  }

  function updateScale() {
    /*
      中文脚注：这里自动计算“加上边栏后页面整体缩放比例”。
      上边栏高度来自 site-nav.css 的 --site-topbar-height，页面会按剩余高度轻微缩放，避免底部超出屏幕。
    */
    const topbarHeight = parseFloat(
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
    bar.setAttribute("aria-label", "全站索引");
    bar.innerHTML = `
      <nav class="site-topbar__nav" aria-label="首页、研物、观象、编年">
        ${navItems.map((item) => `
          <a class="site-topbar__link${item.key === activeKey ? " active" : ""}" href="${buildHref(rootUrl, item.href)}" ${item.key === activeKey ? 'aria-current="page"' : ""}>
            <h2>${item.label}</h2>
          </a>
        `).join("")}
      </nav>
    `;

    updateScale();
    window.addEventListener("resize", updateScale);
    document.body.classList.add("has-site-topbar");
    host.innerHTML = "";
    host.appendChild(bar);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountTopbar, { once: true });
  } else {
    mountTopbar();
  }
})();
