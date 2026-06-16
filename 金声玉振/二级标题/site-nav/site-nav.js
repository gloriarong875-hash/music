(function () {
  /*
    本地导航说明：
    - 当前文件夹里，index.html 是“研物”页；
    - guanxiang.html 是“观象”页；
    - biannian.html 是“编年”页。
  */
  const navItems = [
    { key: "home", label: "首页", href: "#" },
    { key: "study", label: "研物", href: "index.html" },
    { key: "observe", label: "观象", href: "guanxiang.html" },
    { key: "chronicle", label: "编年", href: "biannian.html" }
  ];

  function getActiveKey() {
    return document.body.dataset.section || "study";
  }

  function mountTopbar() {
    if (document.querySelector(".site-topbar")) return;
    const activeKey = getActiveKey();

    const updateScale = () => {
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
          <a class="site-topbar__link${item.key === activeKey ? " active" : ""}" href="${item.href}" ${item.key === activeKey ? 'aria-current="page"' : ""}>
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
