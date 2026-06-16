(function () {
  /*
    中文脚注：全站上边栏注入脚本。
    - 修改导航文字：改 navItems 的 label。
    - 修改跳转目标：改 navItems 的 href。
    - 页面可能在项目根目录的一层或两层子目录中，因此跳转前会自动计算回到根目录的前缀。
    - 当前上边栏保留首页、研物、观象、编年四个板块。
  */
  const navItems = [
    { key: "home", label: "首页" },
    { key: "study", label: "研物" },
    { key: "observe", label: "观象" },
    { key: "chronicle", label: "编年" }
  ];

  const navTargets = {
    home: { default: "金声玉振/index.html" },
    study: {
      "琴": "2.1研物/琴/index.html",
      "古琴": "2.1研物/琴/index.html",
      "笛": "2.1研物/笛/index.html",
      default: "2.1研物/笛/index.html"
    },
    observe: {
      "琴": "2.2观象-演变/古琴/qinyanbian.html",
      "古琴": "2.2观象-演变/古琴/qinyanbian.html",
      "笛": "2.2观象-演变/笛/diyanbian.html",
      "笙": "2.2观象-演变/笙/shengyanbian.html",
      "鼓": "2.2观象-演变/鼓/guyanbian.html",
      "埙": "2.2观象-演变/埙/xunyanbian.html",
      default: "2.2观象-演变/笛/diyanbian.html"
    },
    chronicle: { default: "4.2-4.4编年-声形纪整合版/index.html" }
  };

  function getPathParts() {
    return decodeURIComponent(window.location.pathname)
      .replace(/\\/g, "/")
      .split("/")
      .filter(Boolean);
  }

  function getPrefix() {
    /* 中文脚注：根据当前页面层级自动回到项目根目录，兼容 2.1/2.2/4.x 等目录。 */
    const parts = getPathParts();
    const rootMarkers = ["2.1研物", "2.2观象-演变", "4.1流派可视化", "4.2-4.4编年-声形纪整合版", "4.3编年-画作数据-笙", "4.4编年 大事纪", "金声玉振"];
    const markerIndex = parts.findIndex((part) => rootMarkers.includes(part));
    if (markerIndex === -1) return "";
    return "../".repeat(Math.max(0, parts.length - markerIndex - 1));
  }

  function getCurrentInstrument() {
    const parts = getPathParts();
    const sectionIndex = parts.findIndex((part) => part === "2.1研物" || part === "2.2观象-演变");
    if (sectionIndex === -1) return "";
    return parts[sectionIndex + 1] || "";
  }

  function getActiveKey() {
    /* 中文脚注：这里根据文件夹开头数字判断当前属于哪个板块，用于高亮当前导航文字。 */
    const path = decodeURIComponent(window.location.pathname).replace(/\\/g, "/");
    if (/\/金声玉振\/index\.html?$|\/金声玉振\/?$/.test(path)) return "home";
    if (path.includes("/2.1研物/")) return "study";
    if (path.includes("/2.2观象-演变/") || path.includes("/3.")) return "observe";
    if (path.includes("/4.")) return "chronicle";
    return "";
  }

  function getHref(item) {
    const targets = navTargets[item.key] || {};
    const instrument = getCurrentInstrument();
    return `${getPrefix()}${targets[instrument] || targets.default || "#"}`;
  }

  function mountTopbar() {
    if (document.querySelector(".site-topbar")) return;
    const activeKey = getActiveKey();
    const updateScale = () => {
      /*
        中文脚注：这里自动计算“加上边栏后页面整体缩放比例”。
        上边栏高度来自 site-nav.css 的 --site-topbar-height，页面会按剩余高度轻微缩放，避免底部超出屏幕。
      */
      const topbarHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--site-topbar-height")) || 44;
      const scale = Math.max(0.82, (window.innerHeight - topbarHeight) / window.innerHeight);
      document.documentElement.style.setProperty("--site-page-scale", scale.toFixed(4));
      document.documentElement.style.setProperty("--site-page-width", `${(100 / scale).toFixed(4)}%`);
    };
    const bar = document.createElement("header");
    bar.className = "site-topbar";
    bar.setAttribute("aria-label", "全站索引");
    bar.innerHTML = `
      <nav class="site-topbar__nav" aria-label="首页、研物、观象、编年">
        ${navItems.map((item) => `
          <a class="site-topbar__link${item.key === activeKey ? " active" : ""}" href="${getHref(item)}" ${item.key === activeKey ? 'aria-current="page"' : ""}>
            <h2>${item.label}</h2>
          </a>
        `).join("")}
      </nav>
    `;
    updateScale();
    window.addEventListener("resize", updateScale);
    document.body.classList.add("has-site-topbar");
    document.body.insertBefore(bar, document.body.firstChild);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountTopbar);
  } else {
    mountTopbar();
  }
})();
