// 页面状态与数据缓存。
const state = {
  data: null,
  pages: [],
  activePage: -1,
  particles: [],
};

const content = document.querySelector("#timelineContent");
const timelineItems = document.querySelector("#timelineItems");
const timelineProgress = document.querySelector("#timelineProgress");
const scroller = document.querySelector("#archiveScroll");
const canvas = document.querySelector("#inkCanvas");
const ctx = canvas.getContext("2d");
const timelinePositions = [[47, 8], [31, 29], [51, 50], [32, 71], [48, 92]];

// 根据埙事件数据生成文物或史料图片。
function visualMarkup(event) {
  const imageClass = event.imageClass || "";
  return `<figure class="artifact dizi-artifact ${imageClass}">
    <img src="${event.image}" alt="${event.caption}" loading="lazy">
    <figcaption>${event.caption}</figcaption>
  </figure>`;
}

// 生成每段历史事件的正文卡片结构。
function eventMarkup(event) {
  return `<article class="event-block">
    <span class="event-type">${event.type}</span>
    <h3>${event.title}</h3>
    <p class="event-description">${event.description}</p>
    <span class="event-date">${event.date}</span>
  </article>`;
}

// 把时间线数据按两条事件一页的方式拆分成页面。
function buildPages() {
  state.pages = [];
  state.data.eras.forEach((era) => {
    for (let start = 0; start < era.events.length; start += 2) {
      state.pages.push({
        era,
        events: era.events.slice(start, start + 2),
        continuation: start > 0,
      });
    }
  });
}

// 渲染左侧时间轴导航按钮。
function renderNavigation() {
  timelineItems.innerHTML = state.data.eras.map((era, index) => {
    const compactPositions = [[47, 10], [31, 50], [48, 90]];
    const positions = state.data.eras.length === 3 ? compactPositions : timelinePositions;
    const [x, y] = positions[index];
    return `<button class="timeline__button" type="button" data-era="${era.id}"
      data-index="${index}" style="--x:${x}%;--y:${y}%">
      <span>${era.name}</span>
    </button>
  `;
  }).join("");
}

// 渲染所有故事页和每页的内容布局。
function renderTimeline() {
  content.innerHTML = state.pages.map((page, pageIndex) => {
    const body = page.events.map((event, eventIndex) => {
      const alignment = eventIndex % 2 === 0 ? "visual-left" : "visual-right";
      const imageClass = event.imageClass || "";
      return `<div class="story-entry ${alignment} ${imageClass}">
        ${visualMarkup(event)}
        ${eventMarkup(event)}
      </div>`;
    }).join("");

    const eraClass = `era-${page.era.id}`;
    const volumeClass = page.continuation ? "volume-continuation" : "volume-opening";
    return `<section class="story-page ${eraClass} ${volumeClass} ${pageIndex === 0 ? "active" : ""}"
      id="page-${pageIndex}" data-page="${pageIndex}" data-era="${page.era.id}" data-ghost="${page.era.name}">
      <header class="page-heading">
        <h2>${page.era.name}</h2>
        ${page.continuation ? '<span class="continuation">续卷</span>' : ""}
        <time>${page.era.range}</time>
      </header>
      <div class="page-body count-${page.events.length}">${body}</div>
    </section>`;
  }).join("");
}

// 切换到指定页面，并同步高亮时间轴与墨迹效果。
function setActivePage(index) {
  if (index === state.activePage && document.querySelector(".story-page.active")) return;
  state.activePage = index;
  const page = state.pages[index];
  const eraIndex = state.data.eras.findIndex((era) => era.id === page.era.id);

  document.querySelectorAll(".story-page").forEach((section, sectionIndex) => {
    section.classList.toggle("active", sectionIndex === index);
  });
  document.querySelectorAll(".timeline__button").forEach((button, buttonIndex) => {
    button.classList.toggle("is-active", buttonIndex === eraIndex);
    button.classList.toggle("is-near", Math.abs(buttonIndex - eraIndex) === 1);
    button.setAttribute("aria-current", buttonIndex === eraIndex ? "step" : "false");
  });
  timelineProgress.style.strokeDasharray = `${(eraIndex + 1) / state.data.eras.length} 1`;
  window.dispatchEvent(new CustomEvent("timeline-change", {
    detail: { index: eraIndex, item: page.era },
  }));
  scatterInk();
}

// 根据滚动位置同步当前激活页。
function syncScroll() {
  const index = Math.max(0, Math.min(
    state.pages.length - 1,
    Math.round(scroller.scrollTop / scroller.clientHeight),
  ));
  setActivePage(index);
}

// 重置墨迹画布尺寸，适配当前窗口大小。
function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const height = window.innerHeight - 58;
  canvas.width = window.innerWidth * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

// 生成墨迹粒子，模拟页面上的墨汁飞散效果。
function scatterInk() {
  const section = document.querySelector(".story-page.active");
  if (!section) return;
  const rect = section.getBoundingClientRect();
  const x = rect.left + rect.width * (.35 + Math.random() * .36);
  const y = rect.top - 58 + rect.height * (.28 + Math.random() * .4);
  state.particles = Array.from({ length: 72 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = .3 + Math.random() * 1.8;
    return {
      x: x + (Math.random() - .5) * 30,
      y: y + (Math.random() - .5) * 24,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: .5 + Math.random() * 3.3,
      alpha: .08 + Math.random() * .22,
      life: 0,
      maxLife: 50 + Math.random() * 50,
      gold: Math.random() > .84,
    };
  });
}

// 持续绘制墨迹动画。
function drawInk() {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  state.particles = state.particles.filter((particle) => particle.life < particle.maxLife);
  state.particles.forEach((particle) => {
    particle.life += 1;
    const progress = particle.life / particle.maxLife;
    particle.vx *= progress > .58 ? .91 : .985;
    particle.vy *= progress > .58 ? .91 : .985;
    particle.x += particle.vx;
    particle.y += particle.vy;
    const fade = Math.sin(progress * Math.PI);
    ctx.beginPath();
    ctx.fillStyle = particle.gold
      ? `rgba(201,169,110,${particle.alpha * fade})`
      : `rgba(13,11,9,${particle.alpha * 1.5 * fade})`;
    ctx.arc(particle.x, particle.y, particle.radius * (1 + progress * .45), 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(drawInk);
}

// 点击时间轴按钮时平滑滚动到对应页面。
document.addEventListener("click", (event) => {
  const button = event.target.closest(".timeline__button");
  if (!button) return;
  const pageIndex = state.pages.findIndex((page) => page.era.id === button.dataset.era);
  scroller.scrollTo({ top: pageIndex * scroller.clientHeight, behavior: "smooth" });
});

// 键盘方向键可切换时间轴页面。
window.addEventListener("keydown", (event) => {
  if (event.target.closest?.(".page-switcher")) return;
  if (!state.data || !["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(event.key)) return;
  const activeEraId = state.pages[state.activePage].era.id;
  const eraIndex = state.data.eras.findIndex((era) => era.id === activeEraId);
  const delta = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
  const nextEraIndex = Math.max(0, Math.min(state.data.eras.length - 1, eraIndex + delta));
  if (nextEraIndex === eraIndex) return;
  const pageIndex = state.pages.findIndex((page) => page.era.id === state.data.eras[nextEraIndex].id);
  scroller.scrollTo({ top: pageIndex * scroller.clientHeight, behavior: "smooth" });
});

// 初始化页面：加载数据、渲染页面、启动画布与滚动监听。
function initialize(data) {
  state.data = data;
  buildPages();
  renderNavigation();
  renderTimeline();
  installVisibleImageHover();
  resizeCanvas();
  drawInk();
  scatterInk();
  scroller.addEventListener("scroll", syncScroll, { passive: true });
  window.addEventListener("resize", resizeCanvas);
}

if (window.shengTimelineData) {
  initialize(window.shengTimelineData);
} else {
  content.innerHTML = '<p class="load-error">无法读取大事纪数据</p>';
}

// 顶部声/形/纪切换器的逻辑。
const pageSwitcher = document.querySelector("#pageSwitcher");
if (pageSwitcher) {
  const switchButtons = [...pageSwitcher.querySelectorAll(".switch-item")];
  const switchOrder = ["sound", "form", "chronicle"];

  function layoutPageSwitcher(activePage, emit = true) {
    const activeIndex = switchOrder.indexOf(activePage);
    switchButtons.forEach((button) => {
      const itemIndex = switchOrder.indexOf(button.dataset.page);
      const offset = itemIndex - activeIndex;
      button.style.setProperty("--x", `calc(${offset} * var(--step))`);
      const isActive = button.dataset.page === activePage;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-current", isActive ? "page" : "false");
      button.tabIndex = isActive ? 0 : -1;
    });

    if (emit) {
      pageSwitcher.dispatchEvent(new CustomEvent("pagechange", {
        bubbles: true,
        detail: { page: activePage },
      }));
    }
  }

  switchButtons.forEach((button) => {
    button.addEventListener("pointerdown", () => button.classList.add("pressed"));
    button.addEventListener("pointerup", () => button.classList.remove("pressed"));
    button.addEventListener("pointercancel", () => button.classList.remove("pressed"));
    button.addEventListener("click", () => layoutPageSwitcher(button.dataset.page));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const current = switchOrder.indexOf(button.dataset.page);
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextPage = switchOrder[
        (current + direction + switchOrder.length) % switchOrder.length
      ];
      layoutPageSwitcher(nextPage);
      pageSwitcher.querySelector(`[data-page="${nextPage}"]`)?.focus();
    });
  });

  window.shengPageSwitcher = {
    setPage: (page) => {
      if (switchOrder.includes(page)) layoutPageSwitcher(page);
    },
    getPage: () => pageSwitcher.querySelector(".active")?.dataset.page,
  };

  layoutPageSwitcher("chronicle", false);
}

function installVisibleImageHover() {
  const cache = new WeakMap();
  let activeArtifact = null;

  function prepareImage(img) {
    const artifact = img.closest(".artifact");
    if (!artifact || cache.has(img)) return;
    const computed = getComputedStyle(img);
    artifact.style.setProperty("--image-base-transform", computed.transform === "none" ? "none" : computed.transform);
    artifact.style.setProperty("--image-base-filter", computed.filter === "none" ? "none" : computed.filter);
    artifact.style.setProperty("--image-base-opacity", computed.opacity || "1");
    cache.set(img, { canvas: null, context: null, failed: false });
  }

  function maskForImage(img) {
    const masks = window.instrumentHoverMasks || {};
    const rawSrc = img.getAttribute("src") || "";
    return masks[rawSrc] || masks[decodeURIComponent(rawSrc)] || null;
  }

  function imagePoint(img, event) {
    if (!img.complete || !img.naturalWidth || !img.naturalHeight) return null;
    const rect = img.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;

    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    if (px < 0 || py < 0 || px > rect.width || py > rect.height) return null;

    const style = getComputedStyle(img);
    const naturalRatio = img.naturalWidth / img.naturalHeight;
    const boxRatio = rect.width / rect.height;
    let drawWidth = rect.width;
    let drawHeight = rect.height;

    if (style.objectFit === "contain" || style.objectFit === "scale-down") {
      if (naturalRatio > boxRatio) drawHeight = rect.width / naturalRatio;
      else drawWidth = rect.height * naturalRatio;
    } else if (style.objectFit === "cover") {
      if (naturalRatio > boxRatio) drawWidth = rect.height * naturalRatio;
      else drawHeight = rect.width / naturalRatio;
    }

    const offsetX = (rect.width - drawWidth) / 2;
    const offsetY = (rect.height - drawHeight) / 2;
    if (px < offsetX || py < offsetY || px > offsetX + drawWidth || py > offsetY + drawHeight) return null;

    return {
      x: Math.max(0, Math.min(img.naturalWidth - 1, Math.floor((px - offsetX) / drawWidth * img.naturalWidth))),
      y: Math.max(0, Math.min(img.naturalHeight - 1, Math.floor((py - offsetY) / drawHeight * img.naturalHeight))),
    };
  }

  function isVisibleImagePixel(img, event) {
    const point = imagePoint(img, event);
    if (!point) return false;

    const mask = maskForImage(img);
    if (!mask || !mask.rows || !mask.grid) return false;

    const gx = Math.max(0, Math.min(mask.grid - 1, Math.floor(point.x / img.naturalWidth * mask.grid)));
    const gy = Math.max(0, Math.min(mask.grid - 1, Math.floor(point.y / img.naturalHeight * mask.grid)));
    const row = mask.rows[gy] || "";
    const nibble = parseInt(row[Math.floor(gx / 4)] || "0", 16);
    const bit = 3 - (gx % 4);
    return ((nibble >> bit) & 1) === 1;
  }

  function clearActive() {
    if (activeArtifact) activeArtifact.classList.remove("is-visible-hover");
    activeArtifact = null;
  }

  document.querySelectorAll(".artifact img").forEach(prepareImage);
  document.addEventListener("pointermove", (event) => {
    const img = event.target.closest?.(".artifact img");
    if (!img) {
      clearActive();
      return;
    }
    prepareImage(img);
    const artifact = img.closest(".artifact");
    const isVisiblePixel = isVisibleImagePixel(img, event);
    if (activeArtifact && activeArtifact !== artifact) activeArtifact.classList.remove("is-visible-hover");
    artifact.classList.toggle("is-visible-hover", isVisiblePixel);
    activeArtifact = isVisiblePixel ? artifact : null;
  }, { passive: true });
  document.addEventListener("pointerleave", clearActive);
  window.addEventListener("blur", clearActive);
  scroller.addEventListener("scroll", clearActive, { passive: true });
}
