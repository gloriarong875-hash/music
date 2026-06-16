const scenes = [...document.querySelectorAll(".scene")];
const buttons = [...document.querySelectorAll(".switch-item")];
const caption = document.querySelector(".scene-caption");
const order = ["sound", "form", "chronicle"];
const labels = {
  sound: ["01", "声", "SHENG · SOUND"],
  form: ["02", "形", "SHENG · FORM"],
  chronicle: ["03", "纪", "SHENG · CHRONICLE"],
};
let activePage = "sound";
let switching = false;

function updateCaption(page) {
  const [number, title, english] = labels[page];
  caption.innerHTML = `<span>${number}</span><b>${title}</b><small>${english}</small>`;
}

function setActiveState(page) {
  scenes.forEach((scene) => {
    scene.classList.toggle("is-active", scene.dataset.page === page);
    scene.classList.remove("is-leaving", "is-entering");
    scene.setAttribute("aria-hidden", scene.dataset.page === page ? "false" : "true");
  });
  buttons.forEach((button) => {
    const isActive = button.dataset.page === page;
    const itemIndex = order.indexOf(button.dataset.page);
    const activeIndex = order.indexOf(page);
    button.style.setProperty("--x", `${(itemIndex - activeIndex) * 58}px`);
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
    button.tabIndex = isActive ? 0 : -1;
  });
  updateCaption(page);
}

function switchPage(nextPage) {
  if (switching || nextPage === activePage || !order.includes(nextPage)) return;

  const leavingScene = scenes.find((scene) => scene.dataset.page === activePage);
  const enteringScene = scenes.find((scene) => scene.dataset.page === nextPage);

  switching = true;
  leavingScene?.classList.add("is-leaving");
  enteringScene?.classList.add("is-entering");
  enteringScene?.setAttribute("aria-hidden", "false");
  buttons.forEach((button) => button.disabled = true);

  window.setTimeout(() => {
    activePage = nextPage;
    setActiveState(nextPage);
    buttons.forEach((button) => button.disabled = false);
    switching = false;
    buttons.find((button) => button.dataset.page === activePage)?.focus({ preventScroll: true });
  }, 620);
}

buttons.forEach((button) => {
  button.addEventListener("pointerdown", () => button.classList.add("pressed"));
  button.addEventListener("pointerup", () => button.classList.remove("pressed"));
  button.addEventListener("pointercancel", () => button.classList.remove("pressed"));
  button.addEventListener("click", () => switchPage(button.dataset.page));
  button.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (order.indexOf(activePage) + direction + order.length) % order.length;
    switchPage(order[nextIndex]);
  });
});

scenes.forEach((scene) => {
  scene.addEventListener("load", () => scene.dataset.ready = "true", { once: true });
});

setActiveState(activePage);
