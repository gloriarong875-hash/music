(function () {
  /*
    中文脚注：全站上边栏注入脚本。
    - 修改导航文字：改 navItems 的 label。
    - 修改跳转目标：改 navItems 的 href。
    - 所有二级页面都在金声玉振根目录的子文件夹中，因此用 ../ 跳回根目录。
    - 当前上边栏保留首页、研物、观象、编年四个板块。
  */
  const navItems = [
    { key: "home", label: "首页", href: "index.html", match: /^\/?index\.html?$|\/$/ },
    { key: "study", label: "研物", href: "2.1研物-乐器制作-笙/index.html", match: /\/2\./ },
    { key: "observe", label: "观象", href: "3.1观象-部件桑基-笙/index.html", match: /\/3\./ },
    { key: "chronicle", label: "编年", href: "4.3编年-画作数据-笙/index.html", match: /\/4\./ }
  ];

  function getPrefix() {
    /* 中文脚注：根目录页面引用时不加 ../；二级页面引用时需要 ../ 回到“金声玉振”根目录。 */
    const path = decodeURIComponent(window.location.pathname).replace(/\\/g, "/");
    return /\/金声玉振\/index\.html?$|\/金声玉振\/?$/.test(path) ? "" : "../";
  }

  function getActiveKey() {
    /* 中文脚注：这里根据文件夹开头数字判断当前属于哪个板块，用于高亮当前导航文字。 */
    const path = decodeURIComponent(window.location.pathname).replace(/\\/g, "/");
    const currentFolder = path.split("/").slice(-2, -1)[0] || "";
    if (!currentFolder || currentFolder === "金声玉振") return "home";
    if (currentFolder.startsWith("2.")) return "study";
    if (currentFolder.startsWith("3.")) return "observe";
    if (currentFolder.startsWith("4.")) return "chronicle";
    return "";
  }

  function mountTopbar() {
    if (document.querySelector(".site-topbar")) return;
    const prefix = getPrefix();
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
          <a class="site-topbar__link${item.key === activeKey ? " active" : ""}" href="${prefix}${item.href}" ${item.key === activeKey ? 'aria-current="page"' : ""}>
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
