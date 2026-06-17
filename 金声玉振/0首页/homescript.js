/*
  中文脚注（首页交互说明）
  - 当前已去除加载页，页面打开后直接进入 page1 并播放视频。
  - 修改翻页速度/灵敏度：调整 WHEEL_LOCK_MS 和 goPage() 内的逻辑。
  - 修改 page1 背景图自动轮播速度：到 homestyle.css 搜索 heroPanoramaDrift。
  - 修改 page2 乐器自动轮播速度：调整 INSTRUMENT_AUTO_MS，数值越大越慢。
*/

const WHEEL_LOCK_MS = 760;
const INSTRUMENT_AUTO_MS = 2500;
const LIGHTBOX_ZOOM_MIN = .7;
const LIGHTBOX_ZOOM_MAX = 4;
const LIGHTBOX_ZOOM_STEP = .18;
const ASSET = "首页assets/";

const instruments = [
  {
    name: "古筝",
    en: "Guzheng",
    image: "2乐器古筝.png",
    text: [
      "古筝是中国传统弹拨乐器，琴身修长，设有多根琴弦，演奏时以指拨弦发声。",
      "其音色清越流动，既能表现宫廷宴乐的华美，也能营造文人雅集中的闲适情调。"
    ]
  },
  {
    name: "二胡",
    en: "Erhu",
    image: "2乐器二胡.png",
    text: [
      "二胡属于弓弦乐器，以弓擦弦发声，音色柔婉、含蓄而富于歌唱性。",
      "它在古代绘画中常与民间艺人、宴饮奏乐或世俗生活场景相联系，表现出悠长婉转的音乐氛围。"
    ]
  },
  {
    name: "鼓",
    en: "Drum",
    image: "2乐器鼓.png",
    text: [
      "鼓是中国古代最具节奏感的打击乐器之一，以槌击鼓面发声，声音洪亮有力。",
      "它广泛出现于礼仪、军阵、歌舞、节庆和民间百戏中，常在画面中承担引导节奏、烘托气氛的作用。"
    ]
  },
  {
    name: "琵琶",
    en: "Pipa",
    image: "2乐器琵琶.png",
    text: [
      "琵琶是中国传统弹拨乐器，梨形音箱、曲颈设弦，演奏姿态优雅。",
      "其音色清脆而富变化，既可表现宫廷乐舞的华丽，也可传达旅途、宴饮与人物情感中的悠扬意韵。"
    ]
  },
  {
    name: "琴",
    en: "Qin",
    image: "2乐器琴.png",
    text: [
      "琴多指古琴，是中国文人精神生活的重要象征。",
      "它形制修长，音色沉静幽远，常与山水、书斋、松石、隐逸人物相伴出现，寄托士人修身养性、寄情林泉的审美理想。"
    ]
  },
  {
    name: "笙",
    en: "Sheng",
    image: "2乐器笙.png",
    text: [
      "笙是中国古老的簧管乐器，由笙斗、吹嘴和多根笙苗组成，吹吸皆可发声。",
      "其音色清亮和融，常用于雅乐、燕乐与宫廷宴饮场景，在绘画中多表现祥和、清雅的音乐氛围。"
    ]
  },
  {
    name: "萧",
    en: "Xiao",
    image: "2乐器萧.png",
    text: [
      "萧是竖吹竹管乐器，音色低回、悠远而含蓄。",
      "它常与山水、月夜、行旅或文人独处场景相结合，适合表现清寂、空灵的意境，是古代绘画中富有诗意的乐器形象。"
    ]
  },
  {
    name: "埙",
    en: "Xun",
    image: "2乐器埙.png",
    text: [
      "埙是中国古老的陶土吹奏乐器，形体浑圆，多以按孔控制音高。",
      "其声音深沉朴厚，带有远古礼乐与土地气息，在传统文化中常被视为古朴、幽远与祭祀音乐的象征。"
    ]
  },
  {
    name: "编钟",
    en: "Bianzhong",
    image: "2乐器编钟.png",
    text: [
      "编钟是中国古代重要的青铜打击乐器，由大小不同的钟按音高排列成组，悬挂于钟架之上击奏发声。",
      "其音色庄重悠远，常用于祭祀、朝会与宫廷礼乐之中，象征礼制秩序与王朝威仪。"
    ]
  },
  {
    name: "笛",
    en: "Dizi",
    image: "2乐器笛.png",
    text: [
      "笛是中国传统吹奏乐器，多以竹制成，音色清亮、流畅而富有穿透力。",
      "它既能表现山水田园的清雅意境，也常见于宴乐、出游、民间节庆等画面之中，是古代绘画中极具生活气息的乐器。"
    ]
  }
];

const paintingInfo = {
  "观舞仕女图": {
    title: "观舞仕女图",
    body: "周文矩《观舞仕女图》描绘庭院仕女歌舞奏乐，舞者居中起势，旁侧乐伎以笙、笛、鼓、钹等相和。鼓在画中承担击节助舞作用，烘托华贵热烈的宴乐氛围。"
  },
  "松阴策杖图": {
    title: "松阴策杖图",
    body: "《松阴策杖图》绘白衣高士松下策杖而行，童子抱琴随侍，松荫与山径构成清雅游赏场景，突出携琴访幽的文人趣味。"
  },
  "荷亭婴戏图": {
    title: "荷亭婴戏图",
    body: "《荷亭婴戏图》描绘荷亭旁儿童仿作戏曲表演，有童子戴面具、扮角色，旁人敲鼓击钹相和。鼓声连接游戏与表演，呈现宋代儿童娱乐和市井戏乐的生动一面。"
  },
  "群仙祝寿图": {
    title: "群仙祝寿图",
    body: "《群仙祝寿图》为元颜辉（传）作品，画面属宗教神话题材，可见笛、鼓、板等乐器，适合作为相关乐器图像资料。"
  }
};

const heroVideo = document.getElementById("heroVideo");
const replayVideoBtn = document.getElementById("replayVideoBtn");
const instrumentTrack = document.getElementById("instrumentTrack");
const instrumentCopy = document.getElementById("instrumentCopy");
const sections = [...document.querySelectorAll(".home-section")];
const heroSection = sections[0];
const heroTitleImages = [...document.querySelectorAll(".hero-title-stack img")];

let currentPage = 0;
let wheelLocked = false;
let heroReady = false;
let instrumentIndex = 2;
let instrumentTimer = null;
let lightboxZoom = 1;
let lightboxPanX = 0;
let lightboxPanY = 0;
let heroTitleTimers = [];
const lightboxPan = { dragging: false, lastX: 0, lastY: 0 };

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clearHeroTitleTimers() {
  heroTitleTimers.forEach((timer) => window.clearTimeout(timer));
  heroTitleTimers = [];
}

function resetHeroTitles() {
  clearHeroTitleTimers();
  heroTitleImages.forEach((img) => {
    img.classList.remove("is-visible");
  });
}

function scheduleHeroTitles() {
  clearHeroTitleTimers();
  heroTitleImages.forEach((img, index) => {
    const timer = window.setTimeout(() => {
      img.classList.add("is-visible");
    }, 9000 + index * 1000);
    heroTitleTimers.push(timer);
  });
}

function playHeroVideo() {
  if (!heroVideo) return;
  heroReady = false;
  heroSection.classList.remove("video-ended");
  resetHeroTitles();
  heroVideo.currentTime = 0;
  const playPromise = heroVideo.play();
  if (playPromise && playPromise.then) {
    playPromise.then(scheduleHeroTitles).catch(() => {
      /* 中文脚注：如果浏览器阻止自动播放，直接进入背景图状态。 */
      finishHeroVideo();
    });
  } else {
    scheduleHeroTitles();
  }
}

function finishHeroVideo() {
  heroReady = true;
  heroSection.classList.add("video-ended");
}

if (heroVideo) {
  heroVideo.addEventListener("ended", finishHeroVideo);
}

if (replayVideoBtn) {
  replayVideoBtn.addEventListener("click", () => {
    /*
      中文脚注：点击左上角按钮会重新播放 page1 视频；
      视频结束后自动回到“1切换背景图”的循环轮播。
    */
    playHeroVideo();
  });
}

function renderInstruments() {
  instrumentTrack.innerHTML = instruments.map((item, index) => `
    <article class="instrument-card" data-index="${index}" tabindex="0">
      <img src="${ASSET}${item.image}" alt="${item.name}" loading="${index < 5 ? "eager" : "lazy"}" />
      <h2><span>${item.name}</span><small>${item.en}</small></h2>
    </article>
  `).join("");

  instrumentTrack.querySelectorAll(".instrument-card").forEach((card) => {
    const index = Number(card.dataset.index);
    card.addEventListener("focus", () => setInstrument(index));
    card.addEventListener("click", () => setInstrument(index));
  });
  setInstrument(instrumentIndex, false);
}

function setInstrument(index, animate = true) {
  instrumentIndex = clamp(index, 0, instruments.length - 1);
  const cards = [...instrumentTrack.querySelectorAll(".instrument-card")];
  cards.forEach((card, i) => card.classList.toggle("is-center", i === instrumentIndex));
  const card = cards[instrumentIndex];
  if (!card) return;
  const stage = document.getElementById("instrumentStage");
  const stageRect = stage.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const currentX = Number((getComputedStyle(instrumentTrack).getPropertyValue("--instrument-x") || "0px").replace("px", "")) || 0;
  const delta = (stageRect.left + stageRect.width / 2) - (cardRect.left + cardRect.width / 2);
  instrumentTrack.style.transitionDuration = animate ? ".72s" : "0s";
  instrumentTrack.style.setProperty("--instrument-x", `${currentX + delta}px`);
  const active = instruments[instrumentIndex];
  /* 中文脚注：page2 乐器介绍正文使用 h2 层级，样式在 homestyle.css 的 `.instrument-copy h2` 中修改。 */
  instrumentCopy.innerHTML = `<h2>${active.text.map((line) => `<span>${line}</span>`).join("")}</h2>`;
  requestAnimationFrame(() => {
    instrumentTrack.style.transitionDuration = "";
  });
}

function advanceInstrument() {
  /*
    中文脚注：page2 自动向左轮播的顺序。
    - +1 表示从左往右依次切换居中乐器，视觉上轨道向左移动。
    - 想反向轮播可改成 instrumentIndex - 1。
  */
  setInstrument((instrumentIndex + 1) % instruments.length);
}

function startInstrumentAuto() {
  if (instrumentTimer) return;
  instrumentTimer = window.setInterval(advanceInstrument, INSTRUMENT_AUTO_MS);
}

function stopInstrumentAuto() {
  if (!instrumentTimer) return;
  window.clearInterval(instrumentTimer);
  instrumentTimer = null;
}

function goPage(index) {
  const next = clamp(index, 0, sections.length - 1);
  if (next === currentPage) return;
  sections[currentPage].classList.remove("is-active");
  currentPage = next;
  sections[currentPage].classList.add("is-active");
  if (currentPage === 1) {
    setInstrument(instrumentIndex, false);
    startInstrumentAuto();
  } else {
    stopInstrumentAuto();
  }
}

function lockWheel() {
  wheelLocked = true;
  window.setTimeout(() => {
    wheelLocked = false;
  }, WHEEL_LOCK_MS);
}

function handleHeroWheel(event) {
  if (!heroReady) {
    /* 中文脚注：第一页视频播放完成前锁住滚轮，避免用户提前跳到 page2。 */
    return;
  }

  /*
    中文脚注：page1 背景图现在自动轮播，鼠标滚轮不再控制左右查看。
    - 向下滚动进入 page2。
    - 向上滚动停留在 page1。
  */
  if (event.deltaY > 0 && Math.abs(event.deltaY) > 18 && !wheelLocked) {
    goPage(1);
    lockWheel();
  }
}

function handlePageWheel(event) {
  if (document.querySelector(".image-lightbox.visible")) {
    event.preventDefault();
    return;
  }
  event.preventDefault();
  if (wheelLocked && currentPage !== 0) return;
  if (currentPage === 0) {
    handleHeroWheel(event);
    return;
  }
  const direction = event.deltaY > 0 ? 1 : -1;
  if (Math.abs(event.deltaY) < 18) return;
  goPage(currentPage + direction);
  lockWheel();
}

function initTypeCards() {
  document.querySelectorAll(".type-card").forEach((card) => {
    card.tabIndex = 0;
    const painting = card.dataset.painting;
    const info = paintingInfo[painting] || {
      title: painting || "画作信息",
      body: "暂无作品详情"
    };
    card.addEventListener("click", () => openLightbox(card, info));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(card, info);
      }
    });
  });
}

function ensureLightbox() {
  let box = document.getElementById("imageLightbox");
  if (box) return box;
  box = document.createElement("div");
  box.id = "imageLightbox";
  box.className = "image-lightbox";
  box.setAttribute("aria-modal", "true");
  box.setAttribute("role", "dialog");
  box.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="关闭大图">×</button>
    <div class="lightbox-image-wrap"><img alt="" /></div>
    <div class="lightbox-info">
      <h3></h3>
      <div class="painting-intro"></div>
    </div>
  `;
  document.body.appendChild(box);
  box.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  box.querySelector(".lightbox-image-wrap").addEventListener("wheel", (event) => {
    /* 中文脚注：在大图区域滚轮缩放图片；stopPropagation 避免触发首页上下翻页。 */
    event.preventDefault();
    event.stopPropagation();
    setLightboxZoom(lightboxZoom + (event.deltaY < 0 ? LIGHTBOX_ZOOM_STEP : -LIGHTBOX_ZOOM_STEP));
  }, { passive: false });
  initLightboxPan(box.querySelector(".lightbox-image-wrap"));
  box.addEventListener("click", (event) => {
    if (event.target === box) closeLightbox();
  });
  return box;
}

function setLightboxZoom(value) {
  /* 中文脚注：修改大图滚轮缩放范围，调 LIGHTBOX_ZOOM_MIN / LIGHTBOX_ZOOM_MAX。 */
  lightboxZoom = Math.max(LIGHTBOX_ZOOM_MIN, Math.min(LIGHTBOX_ZOOM_MAX, value));
  if (lightboxZoom <= 1) setLightboxPan(0, 0);
  const img = document.querySelector("#imageLightbox img");
  if (img) img.style.setProperty("--lightbox-zoom", lightboxZoom);
}

function setLightboxPan(x, y) {
  /* 中文脚注：这里控制大图放大后的拖拽位移。 */
  lightboxPanX = x;
  lightboxPanY = y;
  const img = document.querySelector("#imageLightbox img");
  if (!img) return;
  img.style.setProperty("--lightbox-pan-x", `${lightboxPanX}px`);
  img.style.setProperty("--lightbox-pan-y", `${lightboxPanY}px`);
}

function initLightboxPan(wrap) {
  if (!wrap) return;
  wrap.addEventListener("pointerdown", (event) => {
    if (lightboxZoom <= 1 || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    lightboxPan.dragging = true;
    lightboxPan.lastX = event.clientX;
    lightboxPan.lastY = event.clientY;
    wrap.classList.add("is-panning");
    wrap.setPointerCapture(event.pointerId);
  });
  wrap.addEventListener("pointermove", (event) => {
    if (!lightboxPan.dragging) return;
    const dx = event.clientX - lightboxPan.lastX;
    const dy = event.clientY - lightboxPan.lastY;
    lightboxPan.lastX = event.clientX;
    lightboxPan.lastY = event.clientY;
    setLightboxPan(lightboxPanX + dx, lightboxPanY + dy);
  });
  const stopPan = (event) => {
    lightboxPan.dragging = false;
    wrap.classList.remove("is-panning");
    if (event && wrap.hasPointerCapture(event.pointerId)) wrap.releasePointerCapture(event.pointerId);
  };
  wrap.addEventListener("pointerup", stopPan);
  wrap.addEventListener("pointercancel", stopPan);
}

function openLightbox(card, info) {
  const box = ensureLightbox();
  const img = box.querySelector("img");
  const source = card.querySelector("img");
  setLightboxPan(0, 0);
  setLightboxZoom(1);
  img.src = source.src;
  img.alt = info.title;
  box.querySelector(".lightbox-info h3").textContent = info.title;
  box.querySelector(".lightbox-info .painting-intro").textContent = info.body;
  box.classList.add("visible");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  const box = document.getElementById("imageLightbox");
  if (!box) return;
  box.classList.remove("visible");
  setLightboxPan(0, 0);
  setLightboxZoom(1);
  document.body.style.overflow = "";
}

window.addEventListener("wheel", handlePageWheel, { passive: false });
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.querySelector(".image-lightbox.visible")) {
    closeLightbox();
    return;
  }
  if (event.key === "ArrowDown" || event.key === "PageDown") goPage(currentPage + 1);
  if (event.key === "ArrowUp" || event.key === "PageUp") goPage(currentPage - 1);
  if (event.key === "ArrowRight" && currentPage === 1) setInstrument(instrumentIndex + 1);
  if (event.key === "ArrowLeft" && currentPage === 1) setInstrument(instrumentIndex - 1);
});
window.addEventListener("resize", () => {
  if (currentPage === 1) setInstrument(instrumentIndex, false);
});

renderInstruments();
initTypeCards();
/* 中文脚注：首页不再显示加载页，初始化完成后直接播放 page1 视频。 */
playHeroVideo();
