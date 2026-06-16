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
const timelinePositions = [[47, 10], [31, 36], [51, 63], [34, 89]];

function glyph(name, fading = false) {
  return `<div class="instrument-glyph ${fading ? "fading" : ""}">
    <div class="pipes"><i></i><i></i><i></i><i></i></div><b>${name}</b>
  </div>`;
}

function visualMarkup(event, index) {
  if (event.image) {
    const isOrigin = event.image.includes("起源");
    const isRelic = event.image.includes("曾侯乙") || event.image.includes("辛追");
    const imageClass = event.image.includes("辛追")
      ? "image-yu"
      : event.image.includes("曾侯乙")
        ? "image-zenghouyi"
        : event.image.includes("正仓院")
          ? "image-shosoin"
          : event.image.includes("陶俑")
            ? "image-tang-figures"
            : event.image.includes("诗经")
              ? "image-shijing"
              : event.image.includes("十三部色")
                ? "image-song-colors"
            : isOrigin
              ? "image-origin"
              : "";
    return `<figure class="artifact ${isOrigin ? "paper" : ""} ${isRelic ? "relic-roundel" : ""} ${imageClass}">
      <img src="${event.image}" alt="${event.caption}" loading="lazy">
      <figcaption>${event.caption}</figcaption>
    </figure>`;
  }
  if (event.visual === "scroll") {
    return `<div class="ink-illustration visual-${index}"><div class="verse">我有嘉宾<br>鼓瑟吹笙</div></div>`;
  }
  if (event.visual === "transition") {
    return `<div class="ink-illustration transition-art visual-${index}">
      ${glyph("竽", true)}${glyph("笙")}
    </div>`;
  }
  if (event.visual === "opera") {
    return `<div class="ink-illustration opera-art visual-${index}"></div>`;
  }
  if (event.visual === "spread") {
    return `<div class="ink-illustration visual-${index}">
      <div class="spread-route"><span>笙</span><i></i><span>口琴</span><i></i><span>手风琴</span></div>
    </div>`;
  }
  return `<div class="ink-illustration visual-${index}"><div class="verse">燕乐流光<br>梵音相和</div></div>`;
}

function eventMarkup(event) {
  return `<article class="event-block">
    <h2 class="event-type">${event.type}</h2>
    <h3>${event.title}</h3>
    <p class="event-description">${event.description}</p>
    <span class="event-date">${event.date}</span>
  </article>`;
}

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

function renderNavigation() {
  timelineItems.innerHTML = state.data.eras.map((era, index) => {
    const [x, y] = timelinePositions[index];
    return `<button class="timeline__button" type="button" data-era="${era.id}"
      data-index="${index}" style="--x:${x}%;--y:${y}%">
      <span>${era.name}</span>
    </button>
  `;
  }).join("");
}

function renderTimeline() {
  content.innerHTML = state.pages.map((page, pageIndex) => {
    const body = page.events.map((event, eventIndex) => {
      const alignment = eventIndex % 2 === 0 ? "visual-left" : "visual-right";
      return `<div class="story-entry ${alignment}">
        ${visualMarkup(event, eventIndex + 1)}
        ${eventMarkup(event)}
      </div>`;
    }).join("");

    const eraClass = `era-${page.era.id}`;
    const volumeClass = page.continuation ? "volume-continuation" : "volume-opening";
    const featureClasses = [
      page.events.some((event) => event.title === "东传日本") ? "page-eastward" : "",
      page.events.some((event) => event.title === "竽失传") ? "page-song-transition" : "",
    ].filter(Boolean).join(" ");
    return `<section class="story-page ${eraClass} ${volumeClass} ${featureClasses} ${pageIndex === 0 ? "active" : ""}"
      id="page-${pageIndex}" data-page="${pageIndex}" data-era="${page.era.id}" data-ghost="${page.era.name}">
      <header class="page-heading">
        <h1>${page.era.name}</h1>
        ${page.continuation ? '<span class="continuation">续卷</span>' : ""}
        <time>${page.era.range}</time>
      </header>
      <div class="page-body count-${page.events.length}">${body}</div>
    </section>`;
  }).join("");
}

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

function syncScroll() {
  const index = Math.max(0, Math.min(
    state.pages.length - 1,
    Math.round(scroller.scrollTop / scroller.clientHeight),
  ));
  setActivePage(index);
}

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const height = window.innerHeight - 58;
  canvas.width = window.innerWidth * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

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

document.addEventListener("click", (event) => {
  const button = event.target.closest(".timeline__button");
  if (!button) return;
  const pageIndex = state.pages.findIndex((page) => page.era.id === button.dataset.era);
  scroller.scrollTo({ top: pageIndex * scroller.clientHeight, behavior: "smooth" });
});

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

function initialize(data) {
  state.data = data;
  buildPages();
  renderNavigation();
  renderTimeline();
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
