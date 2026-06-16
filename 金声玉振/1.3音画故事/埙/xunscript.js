const sections = [...document.querySelectorAll('.story-section')];
const previousButton = document.getElementById('prevScene');
const nextButton = document.getElementById('nextScene');
const hotspot = document.getElementById('paintingHotspot');
const detailImage = document.getElementById('detailImage');

let current = 0;
let changing = false;

function updateControls() {
  previousButton?.classList.toggle('disabled', current === 0);
  nextButton?.classList.toggle('disabled', current === sections.length - 1);
}

function activate(index, options = {}) {
  const targetIndex = Math.max(0, Math.min(index, sections.length - 1));
  if (targetIndex === current && !options.force) return;

  current = targetIndex;
  sections.forEach((section, sectionIndex) => {
    section.classList.toggle('is-active', sectionIndex === current);
  });
  document.body.classList.toggle('detail-open', current === 1);
  if (!options.skipHistory) history.replaceState(null, '', current === 1 ? '#detail' : location.pathname + location.search);
  updateControls();
}

function openDetail() {
  if (changing || current === 1) return;
  changing = true;
  document.body.classList.add('zooming-in');
  window.setTimeout(() => {
    activate(1);
    document.body.classList.remove('zooming-in');
    changing = false;
  }, 780);
}

function closeDetail() {
  if (changing || current === 0) return;
  changing = true;
  activate(0);
  window.setTimeout(() => { changing = false; }, 760);
}

function goTo(index) {
  if (index > current) openDetail();
  else if (index < current) closeDetail();
}

hotspot?.addEventListener('click', openDetail);
detailImage?.addEventListener('click', closeDetail);
previousButton?.addEventListener('click', () => goTo(current - 1));
nextButton?.addEventListener('click', () => goTo(current + 1));

window.addEventListener('keydown', event => {
  if (['ArrowRight', 'ArrowDown', 'PageDown', 'Enter'].includes(event.key) && current === 0) {
    event.preventDefault();
    openDetail();
  }
  if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Escape'].includes(event.key) && current === 1) {
    event.preventDefault();
    closeDetail();
  }
});

window.addEventListener('wheel', event => {
  if (window.matchMedia('(max-width: 1120px)').matches || changing) return;
  if (Math.abs(event.deltaY) < 16) return;
  event.preventDefault();
  goTo(current + Math.sign(event.deltaY));
}, { passive: false });

activate(location.hash === '#detail' ? 1 : 0, { force: true, skipHistory: true });
