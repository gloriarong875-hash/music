/**
 * 笙历史演变 — 三时期场景导航
 * 命名：shengyanbian.js
 * 配合 general.js 的全局 go/order/current 模式
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
  var allNavBtns = [];

  /* ========== 初始化 ========== */
  function init() {
    // 收集所有场景 DOM
    for (var i = 0; i < SCENES.length; i++) {
      var id = SCENES[i];
      scenes[id] = document.getElementById('scene-' + id);
    }

    // 收集所有导航按钮
    allNavBtns = document.querySelectorAll('.navBtn');

    // 绑定导航按钮事件
    bindNavButtons();

    // 显示初始场景（无动画）
    showScene(0, false);

    // 挂载全局导航接口（兼容 general.js）
    window.order = SCENES;
    window.current = SCENES[0];
    window.go = function (target) {
      var idx = SCENES.indexOf(target);
      if (idx >= 0) {
        showScene(idx, true);
      }
    };

    // 键盘导航
    document.addEventListener('keydown', handleKeyboard);
  }

  /* ========== 绑定导航按钮 ========== */
  function bindNavButtons() {
    for (var i = 0; i < allNavBtns.length; i++) {
      var btn = allNavBtns[i];
      var id = btn.id || '';

      if (id.indexOf('prevScene') === 0) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          navigatePrev();
        });
      } else if (id.indexOf('nextScene') === 0) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          navigateNext();
        });
      }
    }
  }

  /* ========== 导航逻辑 ========== */
  function navigatePrev() {
    if (currentIndex > 0) {
      showScene(currentIndex - 1, true);
    }
  }

  function navigateNext() {
    if (currentIndex < SCENES.length - 1) {
      showScene(currentIndex + 1, true);
    }
  }

  function showScene(index, animate) {
    if (index < 0 || index >= SCENES.length) return;
    if (index === currentIndex) return;

    var prevId = SCENES[currentIndex];
    var nextId = SCENES[index];

    // 隐藏当前
    if (scenes[prevId]) {
      scenes[prevId].classList.remove('active');
    }

    // 显示目标
    if (scenes[nextId]) {
      scenes[nextId].classList.add('active');
    }

    currentIndex = index;
    window.current = SCENES[index];

    // 更新导航按钮状态
    updateNavButtonStates();

    // 更新页面标题
    document.title = '观象·演变 — ' + SCENE_LABELS[SCENES[index]];
  }

  /* ========== 导航按钮状态 ========== */
  function updateNavButtonStates() {
    var atFirst = currentIndex === 0;
    var atLast = currentIndex === SCENES.length - 1;

    for (var i = 0; i < allNavBtns.length; i++) {
      var btn = allNavBtns[i];
      var id = btn.id || '';
      var sceneEl = btn.closest('.scene');
      if (!sceneEl) continue;
      var sceneId = sceneEl.getAttribute('data-scene');

      // 只有当前活跃场景的按钮才需要处理
      if (sceneId !== SCENES[currentIndex]) continue;

      if (id.indexOf('prevScene') === 0) {
        if (atFirst) {
          btn.classList.add('disabled');
        } else {
          btn.classList.remove('disabled');
        }
      } else if (id.indexOf('nextScene') === 0) {
        if (atLast) {
          btn.classList.add('disabled');
        } else {
          btn.classList.remove('disabled');
        }
      }
    }
  }

  /* ========== 键盘导航 ========== */
  function handleKeyboard(e) {
    // 避免在输入框中触发
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        navigatePrev();
        break;
      case 'ArrowRight':
        e.preventDefault();
        navigateNext();
        break;
      case 'Home':
        e.preventDefault();
        showScene(0, true);
        break;
      case 'End':
        e.preventDefault();
        showScene(SCENES.length - 1, true);
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
