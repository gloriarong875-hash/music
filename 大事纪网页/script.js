const state = {
  data: null,
  activeEra: "pre-qin",
  activeArtifact: 0,
};

const content = document.querySelector("#timelineContent");
const scroller = document.querySelector("#archiveScroll");
const artifactStage = document.querySelector("#artifactStage");
const artifactIndex = document.querySelector("#artifactIndex");
const artifactCount = document.querySelector("#artifactCount");
const progress = document.querySelector("#scrollProgress");

const visualMarkup = (event) => {
  if (event.visual === "image") {
    const wide = event.image.includes("陶俑") || event.image.includes("起源");
    return `<div class="event-visual ${wide ? "image-wide" : ""}">
      <img src="${event.image}" alt="${event.caption}" loading="lazy">
      <span class="visual-caption">${event.caption}</span>
    </div>`;
  }

  if (event.visual === "scroll") {
    return `<div class="event-visual visual-scroll"><div class="scroll-lines"></div><span class="visual-caption">${event.caption}</span></div>`;
  }
  if (event.visual === "ensemble") {
    return `<div class="event-visual visual-ensemble"><span class="visual-caption">${event.caption}</span></div>`;
  }
  if (event.visual === "transition") {
    return `<div class="event-visual visual-transition">
      ${instrumentGlyph("竽", true)}
      <i class="break-line"></i>
      ${instrumentGlyph("笙", false)}
      <span class="visual-caption">${event.caption}</span>
    </div>`;
  }
  if (event.visual === "opera") {
    return `<div class="event-visual visual-opera"><span class="visual-caption">${event.caption}</span></div>`;
  }
  return `<div class="event-visual visual-spread">
    <div class="spread-route"><span>笙</span><i></i><span>口琴</span><i></i><span>手风琴</span></div>
    <span class="visual-caption">${event.caption}</span>
  </div>`;
};

function instrumentGlyph(name, fading = false) {
  return `<div class="instrument-glyph ${fading ? "fading" : ""}">
    <div class="pipes"><i></i><i></i><i></i><i></i></div><span>${name}</span>
  </div>`;
}

function renderTimeline() {
  content.innerHTML = state.data.eras.map((era) => `
    <section class="era-section" id="${era.id}" data-era="${era.id}">
      <header class="era-heading">
        <h2>${era.name}</h2><span class="rule"></span><time>${era.range}</time>
      </header>
      <p class="era-summary">${era.summary}</p>
      <div class="event-list">
        ${era.events.map((event) => `
          <article class="event-card" data-type="${event.type}">
            <div class="event-copy">
              <span class="event-type">${event.type}</span>
              <h3>${event.title}</h3>
              <p class="event-description">${event.description}</p>
              <div class="card-actions">
                <button class="link-sound" type="button">关联声脉 ↗</button>
                <span class="date-seal">${event.date}</span>
              </div>
            </div>
            ${visualMarkup(event)}
          </article>
        `).join("")}
      </div>
    </section>
  `).join("");
}

function renderArtifacts(eraId, selected = 0) {
  const era = state.data.eras.find((item) => item.id === eraId);
  const artifact = era.artifacts[selected] || era.artifacts[0];
  state.activeArtifact = selected;
  artifactCount.textContent = `${String(state.data.eras.findIndex((item) => item.id === eraId) + 1).padStart(2, "0")} / 04`;

  if (artifact.image) {
    artifactStage.innerHTML = `<img src="${artifact.image}" alt="${artifact.name}"><span class="artifact-label">${era.name} · ${artifact.name}</span>`;
  } else {
    const label = artifact.kind === "yu" ? "竽" : artifact.kind === "sheng" ? "笙" : artifact.kind === "opera" ? "戏" : "簧";
    artifactStage.innerHTML = `<div class="artifact-placeholder">${instrumentGlyph(label, artifact.kind === "yu")}</div><span class="artifact-label">${era.name} · ${artifact.name}</span>`;
  }

  artifactIndex.innerHTML = era.artifacts.map((item, index) => `
    <button type="button" class="${index === selected ? "active" : ""}" data-artifact="${index}">
      <span>${String(index + 1).padStart(2, "0")}</span><span>${item.name}</span>
    </button>
  `).join("");
}

function setActiveEra(eraId) {
  if (state.activeEra === eraId) return;
  state.activeEra = eraId;
  document.querySelectorAll(".era-node").forEach((node) => {
    node.classList.toggle("active", node.dataset.era === eraId);
  });
  renderArtifacts(eraId);
}

function updateFromScroll() {
  const sections = [...document.querySelectorAll(".era-section")];
  const marker = scroller.scrollTop + scroller.clientHeight * .24;
  let current = sections[0]?.dataset.era;
  sections.forEach((section) => {
    if (section.offsetTop <= marker) current = section.dataset.era;
  });
  if (current) setActiveEra(current);
  const max = scroller.scrollHeight - scroller.clientHeight;
  progress.style.height = `${max > 0 ? (scroller.scrollTop / max) * 100 : 0}%`;
}

document.addEventListener("click", (event) => {
  const eraButton = event.target.closest(".era-node");
  if (eraButton) {
    document.querySelector(`#${eraButton.dataset.era}`).scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const artifactButton = event.target.closest("[data-artifact]");
  if (artifactButton) renderArtifacts(state.activeEra, Number(artifactButton.dataset.artifact));
});

fetch("timeline-data.json")
  .then((response) => {
    if (!response.ok) throw new Error("无法读取大事纪数据");
    return response.json();
  })
  .then((data) => {
    state.data = data;
    renderTimeline();
    renderArtifacts(state.activeEra);
    scroller.addEventListener("scroll", updateFromScroll, { passive: true });
    updateFromScroll();
  })
  .catch((error) => {
    content.innerHTML = `<p class="load-error">${error.message}</p>`;
  });
