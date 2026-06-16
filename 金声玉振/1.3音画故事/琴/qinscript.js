/*
  中文脚注：页面交互脚本
  - 本脚本负责四件事：
    1. 识别当前是哪一屏，并给当前屏添加 .is-active。
    2. 鼠标滚轮平滑切换上一屏/下一屏。
    3. 右上角圆形按钮切换上一屏/下一屏。
    4. 键盘方向键/PageUp/PageDown 切换页面。
  - 如果新增或删除 section，不需要改大部分 JS；脚本会自动读取所有 .story-section。
*/

/* 滚动容器，对应 index.html 里的 id="storyScroll"。 */
const shell = document.getElementById("storyScroll");

/* 所有页面屏幕：每个 .story-section 就是一屏。 */
const sections = [...document.querySelectorAll(".story-section")];

/* 右上角上一页/下一页按钮。 */
const prev = document.getElementById("prevScene");
const next = document.getElementById("nextScene");

/*
  current 是当前屏序号。
  wheelLock 用来防止一次滚轮触发多次切屏。
  leaveTimer 用来清理上一屏的 .is-leaving，避免离场类名长期残留。
*/
let current = 0;
let wheelLock = false;
let leaveTimer = null;

function setActive(index) {
  /*
    设置当前屏：
    1. 把 index 限制在 0 到最后一屏之间；
    2. 给旧屏添加 .is-leaving，触发 CSS 的放大淡出离场动画；
    3. 给新屏添加 .is-active，触发 CSS 入场动画；
    4. 按切换方向给 body 添加 scene-forward / scene-back，控制图片从哪边进入；
    5. 第一屏禁用上一页按钮，最后一屏禁用下一页按钮。
  */
  const nextIndex = Math.max(0, Math.min(index, sections.length - 1));
  const oldIndex = current;
  const oldSection = sections[oldIndex];
  const direction = nextIndex >= oldIndex ? "forward" : "back";

  if (leaveTimer) {
    window.clearTimeout(leaveTimer);
    leaveTimer = null;
  }

  document.body.classList.toggle("scene-forward", direction === "forward");
  document.body.classList.toggle("scene-back", direction === "back");

  if (oldSection && oldIndex !== nextIndex) {
    oldSection.classList.add("is-leaving");
    leaveTimer = window.setTimeout(() => {
      oldSection.classList.remove("is-leaving");
    }, 760);
  }

  current = nextIndex;
  sections.forEach((section, sceneIndex) => {
    section.classList.toggle("is-active", sceneIndex === current);
    if (sceneIndex === current) section.classList.remove("is-leaving");
  });
  if (prev) prev.classList.toggle("disabled", current === 0);
  if (next) next.classList.toggle("disabled", current === sections.length - 1);
}

function goTo(index) {
  /*
    跳转到指定屏幕：
    - shell.scrollTo 只滚动内部容器，避免 scrollIntoView 带动外层页面后底部露出黑条；
    - setActive(index) 控制图片和文字的进入/离开动画。
  */
  const target = sections[index];
  if (!target) return;
  shell.scrollTo({ top: target.offsetTop, behavior: "smooth" });
  setActive(index);
}

if ("IntersectionObserver" in window) {
  /*
    监听当前屏幕：
    当某个 section 可见面积达到阈值时，自动把它设为当前屏。
    threshold 数值越高，越需要滚到屏幕中央才算激活。
  */
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible) {
      setActive(sections.indexOf(visible.target));
    }
  }, {
    root: shell,
    threshold: [0.55, 0.72]
  });

  sections.forEach((section) => observer.observe(section));
}

shell.addEventListener("wheel", (event) => {
  /*
    桌面端滚轮切屏：
    - preventDefault 阻止普通滚动；
    - deltaY > 0 下一屏，deltaY < 0 上一屏；
    - 980ms 锁定时间对应一次切屏动画节奏，可按需要加快/放慢。
  */
  if (window.matchMedia("(max-width: 1180px)").matches) return;
  event.preventDefault();
  if (wheelLock) return;

  const direction = Math.sign(event.deltaY);
  if (!direction) return;

  wheelLock = true;
  goTo(current + direction);
  window.setTimeout(() => {
    wheelLock = false;
  }, 980);
}, { passive: false });

/* 右上角按钮切屏。 */
if (prev) prev.addEventListener("click", () => goTo(current - 1));
if (next) next.addEventListener("click", () => goTo(current + 1));

window.addEventListener("keydown", (event) => {
  /* 键盘切屏：向下/PageDown 下一屏，向上/PageUp 上一屏。 */
  if (event.key === "ArrowDown" || event.key === "PageDown") {
    event.preventDefault();
    goTo(current + 1);
  }
  if (event.key === "ArrowUp" || event.key === "PageUp") {
    event.preventDefault();
    goTo(current - 1);
  }
});

/* 初始进入页面时，激活第 1 屏。 */
setActive(0);
