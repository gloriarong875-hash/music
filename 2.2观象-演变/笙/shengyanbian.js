/**
 * ============================================================================
 * === 笙历史演变页面交互脚本 ===
 * === 功能：三时期滚轮翻页 + 白色圆形按钮悬停联动 ===
 * === 滚轮向上 → 上一时期；滚轮向下 → 下一时期 ===
 * === 键盘 ↑← → 上一页；↓→ PageDown → 下一页 ===
 * === 悬停白色圆形按钮 → 标题/副标题同步上移 + 描述文字显现 ===
 * ============================================================================
 */

(function () {
'use strict';

/* ========== 场景配置 ========== */
var SCENES = ['shangzhou', 'tang', 'ming'];  // 三个时期ID
var SCENE_LABELS = {
    shangzhou: '商周·雏形',
    tang: '唐代·多种形制',
    ming: '明代·十三簧'
};

// 状态变量
var currentIndex = -1;      // 当前场景索引
var scenes = {};            // 场景DOM元素映射
var scrollTimer = null;     // 滚轮冷却计时器
var SCROLL_COOLDOWN = 800;  // 滚轮冷却时间（毫秒），防止连续触发

/* ========== 初始化函数 ========== */
function init() {
    // 1. 获取所有场景DOM元素
    for (var i = 0; i < SCENES.length; i++) {
    scenes[SCENES[i]] = document.getElementById('scene-' + SCENES[i]);
    }

    // 2. 显示第一个场景
    showScene(0);

    // 3. 绑定滚轮翻页事件
    document.addEventListener('wheel', handleWheel, { passive: false });

    // 4. 绑定键盘导航事件
    document.addEventListener('keydown', handleKeyboard);

    // 5. 绑定触摸手势（移动端）
    var touchStartY = 0;
    document.addEventListener('touchstart', function (e) {
    touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
    var deltaY = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(deltaY) > 50) {  // 滑动距离超过50px才触发
        if (deltaY > 0) navigateNext();  // 向上滑动 → 下一页
        else navigatePrev();             // 向下滑动 → 上一页
    }
    });

    // 6. 绑定圆形按钮悬停事件
    setupHoverListeners();
}

/* ========== 滚轮事件处理 ========== */
function handleWheel(e) {
    if (scrollTimer) return;  // 冷却期间忽略

    // 根据滚动方向导航
    if (e.deltaY > 0) navigateNext();   // 向下滚动 → 下一页
    else if (e.deltaY < 0) navigatePrev(); // 向上滚动 → 上一页

    // 设置冷却计时器
    scrollTimer = setTimeout(function () {
    scrollTimer = null;
    }, SCROLL_COOLDOWN);
}

/* ========== 导航函数 ========== */
function navigatePrev() {
    if (currentIndex > 0) showScene(currentIndex - 1);
}

function navigateNext() {
    if (currentIndex < SCENES.length - 1) showScene(currentIndex + 1);
}

// 显示指定场景
function showScene(index) {
    if (index < 0 || index >= SCENES.length) return;  // 边界检查
    if (index === currentIndex) return;                // 相同场景不切换

    var prevId = SCENES[currentIndex];
    var nextId = SCENES[index];

    // 隐藏上一个场景
    if (scenes[prevId]) {
    scenes[prevId].classList.remove('active');
    scenes[prevId].classList.remove('hovered');
    }
    // 显示下一个场景
    if (scenes[nextId]) scenes[nextId].classList.add('active');

    // 更新当前索引
    currentIndex = index;

    // 更新页面标题
    document.title = '观象·演变 — ' + SCENE_LABELS[SCENES[index]];
}

/* ========== 键盘事件处理 ========== */
function handleKeyboard(e) {
    // 输入框内不响应键盘导航
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
        showScene(0);           // 跳转到第一页
        break;
    case 'End':
        e.preventDefault();
        showScene(SCENES.length - 1);  // 跳转到最后一页
        break;
    }
}

/* ========== 悬停监听：切换场景 .hovered 类 ========== */
function setupHoverListeners() {
    // mouseover → 添加 .hovered 类
    document.addEventListener('mouseover', function (e) {
    var btn = e.target.closest('.circle-btn');
    if (!btn) {
        // 离开按钮区域 → 移除当前活跃场景的 hovered
        var activeScene = document.querySelector('.scene.active');
        if (activeScene && (!e.relatedTarget || !e.relatedTarget.closest('.circle-btn'))) {
        activeScene.classList.remove('hovered');
        }
        return;
    }

    var sceneEl = btn.closest('.scene');
    if (!sceneEl || !sceneEl.classList.contains('active')) return;

    sceneEl.classList.add('hovered');
    }, true);

    // mouseout → 移除 .hovered 类
    document.addEventListener('mouseout', function (e) {
    var btn = e.target.closest('.circle-btn');
    if (!btn) return;
    if (e.relatedTarget && e.relatedTarget.closest('.circle-btn')) return;

    var sceneEl = btn.closest('.scene');
    if (sceneEl) sceneEl.classList.remove('hovered');
    }, true);
}

/* ========== 启动脚本 ========== */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
})();