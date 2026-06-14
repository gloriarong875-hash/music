/**
 * 笙历史演变 — 三时期滚轮翻页
 * 命名：shengyanbian.js
 * 滚轮向上 → 上一时期；滚轮向下 → 下一时期
 * 键盘 ↑← → 上一页；↓→ PageDown → 下一页
 */

(function () {
  'use strict';

  /* ========== 场景定义 ========== */
  var SCENES = ['shangzhou', 'tang', 'ming'];
  var SCENE_LABELS = {
    shangzhou: '商周·雏形',
    tang: '唐代·多种形制',
    ming: '明代·十三簧'
  };

  var currentIndex = -1;
  var scenes = {};
  var scrollTimer = null;
  var SCROLL_COOLDOWN = 800; // 滚轮冷却（ms），防连续触发

  /* ========== 初始化 ========== */
  function init() {
    for (var i = 0; i < SCENES.length; i++) {
      scenes[SCENES[i]] = document.getElementById('scene-' + SCENES[i]);
    }

    showScene(0);

    // 滚轮翻页
    document.addEventListener('wheel', handleWheel, { passive: false });

    // 键盘备用
    document.addEventListener('keydown', handleKeyboard);

    // 触摸手势（移动端）
    var touchStartY = 0;
    document.addEventListener('touchstart', function (e) {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
      var deltaY = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(deltaY) > 50) {
        if (deltaY > 0) navigateNext();
        else navigatePrev();
      }
    });
  }

  /* ========== 滚轮 ========== */
  function handleWheel(e) {
    e.preventDefault();
    if (scrollTimer) return;

    if (e.deltaY > 0) navigateNext();
    else if (e.deltaY < 0) navigatePrev();

    scrollTimer = setTimeout(function () {
      scrollTimer = null;
    }, SCROLL_COOLDOWN);
  }

  /* ========== 导航 ========== */
  function navigatePrev() {
    if (currentIndex > 0) showScene(currentIndex - 1);
  }

  function navigateNext() {
    if (currentIndex < SCENES.length - 1) showScene(currentIndex + 1);
  }

  function showScene(index) {
    if (index < 0 || index >= SCENES.length) return;
    if (index === currentIndex) return;

    var prevId = SCENES[currentIndex];
    var nextId = SCENES[index];

    if (scenes[prevId]) scenes[prevId].classList.remove('active');
    if (scenes[nextId]) scenes[nextId].classList.add('active');

    currentIndex = index;

    document.title = '观象·演变 — ' + SCENE_LABELS[SCENES[index]];
  }

  /* ========== 键盘 ========== */
  function handleKeyboard(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        navigatePrev();
        break;
      case 'ArrowDown':
      case 'ArrowRight':
      case 'PageDown':
        e.preventDefault();
        navigateNext();
        break;
      case 'PageUp':
        e.preventDefault();
        navigatePrev();
        break;
      case 'Home':
        e.preventDefault();
        showScene(0);
        break;
      case 'End':
        e.preventDefault();
        showScene(SCENES.length - 1);
        break;
    }
  }

  /* ========== 启动 ========== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
