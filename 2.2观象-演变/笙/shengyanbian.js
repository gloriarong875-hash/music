/**
 * 笙历史演变 — 三时期滚轮翻页 + 白色圆形按钮悬浮提示
 * 命名：shengyanbian.js
 * 滚轮向上 → 上一时期；滚轮向下 → 下一时期
 * 键盘 ↑← → 上一页；↓→ PageDown → 下一页
 * 悬浮白色圆形按钮 → 显示 tooltip 提示文字
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

  /* ========== Tooltip 文字定义 ========== */
  var TOOLTIP_TEXTS = {
    shangzhou: '笙的雏形诞生于商周，以竹管葫芦制成，用于祭祀与礼乐。是世界上最早使用自由簧的古老乐器。',
    tang: '唐代笙得到空前发展，出现多种形制。曾侯乙墓出土14管笙已有2400年历史。笙曲目丰富，技法成熟。',
    ming: '明代笙发展为十三簧，音域大幅扩展。十三簧笙在宫廷音乐和民间戏曲中不可或缺，《明会典》详细记录其形制规范。'
  };

  var currentIndex = -1;
  var scenes = {};
  var scrollTimer = null;
  var SCROLL_COOLDOWN = 800; // 滚轮冷却（ms），防连续触发

  // Tooltip 状态
  var currentCircleBtn = null;
  var currentCircleTL = null;
  var currentCircleTt = null;

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

    // Tooltip 事件委托
    setupTooltipListeners();

    // 窗口大小改变时重新定位 tooltip
    window.addEventListener('resize', function () {
      if (currentCircleBtn && currentCircleTL && currentCircleTt) {
        posTooltip();
      }
    });
  }

  /* ========== 滚轮 ========== */
  function handleWheel(e) {
    // 如果鼠标在 tooltip 或按钮上，允许正常滚动行为（但场景切换优先）
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

    if (scenes[prevId]) {
      scenes[prevId].classList.remove('active');
      scenes[prevId].classList.remove('hovered');
    }
    if (scenes[nextId]) scenes[nextId].classList.add('active');

    currentIndex = index;

    // 重新绑定当前场景的圆形按钮
    var sceneId = SCENES[index];
    currentCircleBtn = document.getElementById('circleBtn-' + sceneId);
    currentCircleTL = document.getElementById('circleTooltip-' + sceneId);
    currentCircleTt = document.getElementById('circleTtText-' + sceneId);

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

  /* ========== Tooltip 悬浮逻辑（参考 di-script.js posTooltip 模式） ========== */

  function setupTooltipListeners() {
    // mouseover — 使用捕获阶段（mouseenter 不冒泡）
    document.addEventListener('mouseover', function (e) {
      var btn = e.target.closest('.circle-btn');
      if (!btn) {
        // 鼠标离开按钮 → 隐藏 tooltip + 移除 hovered 状态
        if (currentCircleTL && (!e.relatedTarget || !e.relatedTarget.closest('.circle-btn'))) {
          hideTooltip();
          // 移除当前场景的 hovered 类
          var activeScene = document.querySelector('.scene.active');
          if (activeScene) activeScene.classList.remove('hovered');
        }
        return;
      }

      // 找到按钮所在的场景
      var sceneEl = btn.closest('.scene');
      if (!sceneEl || !sceneEl.classList.contains('active')) return;

      currentCircleBtn = btn;
      currentCircleTL = sceneEl.querySelector('.circle-tooltip');
      currentCircleTt = sceneEl.querySelector('.tt-text');

      // 添加 hovered 类 → 触发 Frame 1 → Frame 2 过渡
      sceneEl.classList.add('hovered');

      posTooltip();
      if (currentCircleTL) currentCircleTL.classList.add('visible');
    }, true);

    // mouseout — 隐藏 tooltip + 移除 hovered 状态
    document.addEventListener('mouseout', function (e) {
      var btn = e.target.closest('.circle-btn');
      if (!btn) return;
      // 检查是否真的离开了按钮（而不是进入子元素）
      if (e.relatedTarget && e.relatedTarget.closest('.circle-btn')) return;
      hideTooltip();
      // 移除 hovered 类，恢复 Frame 1 布局
      var sceneEl = btn.closest('.scene');
      if (sceneEl) sceneEl.classList.remove('hovered');
    }, true);

    // mousemove — 跟随鼠标更新 tooltip 位置
    document.addEventListener('mousemove', function (e) {
      var btn = e.target.closest('.circle-btn');
      if (!btn) return;

      var sceneEl = btn.closest('.scene');
      if (!sceneEl || !sceneEl.classList.contains('active')) return;

      currentCircleBtn = btn;
      currentCircleTL = sceneEl.querySelector('.circle-tooltip');
      currentCircleTt = sceneEl.querySelector('.tt-text');

      posTooltip();
    });
  }

  function posTooltip() {
    if (!currentCircleBtn || !currentCircleTL || !currentCircleTt) return;

    var sceneId = SCENES[currentIndex];
    if (sceneId && TOOLTIP_TEXTS[sceneId]) {
      currentCircleTt.textContent = TOOLTIP_TEXTS[sceneId];
    }

    var r = currentCircleBtn.getBoundingClientRect();
    currentCircleTL.style.left = (r.left + r.width / 2) + 'px';
    currentCircleTL.style.top = (r.top - 16) + 'px';
    currentCircleTL.style.transform = 'translate(-50%, -100%)';
  }

  function hideTooltip() {
    if (currentCircleTL) {
      currentCircleTL.classList.remove('visible');
    }
    // 不立即清除引用，以便 resize 时仍可重新定位
  }

  /* ========== 启动 ========== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
