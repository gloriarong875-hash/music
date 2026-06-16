/**
 * 编钟历史演变页面：滚轮、键盘与触摸翻页，进入时期后自动展开图文。
 */
(function () {
'use strict';

var SCENES = ['zhanguo', 'han'];
var SCENE_LABELS = {
    zhanguo: '战国·曾侯乙钟',
    han: '汉代·礼器功能',
};
var currentIndex = -1;
var scenes = {};
var scrollTimer = null;
var evolutionTimer = null;
var SCROLL_COOLDOWN = 800;
var EVOLUTION_DELAY = 1600;

function init() {
    for (var i = 0; i < SCENES.length; i++) {
        scenes[SCENES[i]] = document.getElementById('scene-' + SCENES[i]);
    }
    showScene(0);
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKeyboard);

    var touchStartY = 0;
    document.addEventListener('touchstart', function (event) {
        touchStartY = event.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', function (event) {
        var deltaY = touchStartY - event.changedTouches[0].clientY;
        if (Math.abs(deltaY) > 50) {
            if (deltaY > 0) navigateNext();
            else navigatePrev();
        }
    });
}

function handleWheel(event) {
    if (scrollTimer) return;
    if (event.deltaY > 0) navigateNext();
    else if (event.deltaY < 0) navigatePrev();
    scrollTimer = setTimeout(function () { scrollTimer = null; }, SCROLL_COOLDOWN);
}

function navigatePrev() {
    if (currentIndex > 0) showScene(currentIndex - 1);
}

function navigateNext() {
    if (currentIndex < SCENES.length - 1) showScene(currentIndex + 1);
}

function showScene(index) {
    if (index < 0 || index >= SCENES.length || index === currentIndex) return;
    var previousId = SCENES[currentIndex];
    var nextId = SCENES[index];

    if (scenes[previousId]) {
        scenes[previousId].classList.remove('active');
        scenes[previousId].classList.remove('evolved');
    }
    if (scenes[nextId]) {
        scenes[nextId].classList.remove('evolved');
        scenes[nextId].classList.add('active');
    }

    clearTimeout(evolutionTimer);
    evolutionTimer = setTimeout(function () {
        if (scenes[nextId] && scenes[nextId].classList.contains('active')) {
            scenes[nextId].classList.add('evolved');
        }
    }, EVOLUTION_DELAY);

    currentIndex = index;
    document.title = '观象·演变 — 编钟·' + SCENE_LABELS[nextId];
}

function handleKeyboard(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) return;
    switch (event.key) {
    case 'ArrowUp':
    case 'ArrowLeft':
    case 'PageUp':
        event.preventDefault();
        navigatePrev();
        break;
    case 'ArrowDown':
    case 'ArrowRight':
    case 'PageDown':
        event.preventDefault();
        navigateNext();
        break;
    case 'Home':
        event.preventDefault();
        showScene(0);
        break;
    case 'End':
        event.preventDefault();
        showScene(SCENES.length - 1);
        break;
    }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
})();
