/**
 * ============================================================================
 * === 鼓历史演变页面交互脚本 ===
 * === 功能：四时期滚轮翻页 + 入场自动演变 ===
 * === 滚轮向上 → 上一时期；滚轮向下 → 下一时期 ===
 * === 键盘 ↑← → 上一页；↓→ PageDown → 下一页 ===
 * === 每个时期进入后，标题先放大展示，再自动展开图文内容 ===
 * ============================================================================
 */

(function () {
'use strict';

/* ========== 场景配置 ========== */
var SCENES = ['yuangu', 'shangzhou', 'hantang', 'songyuan'];  // 四个时期ID
var SCENE_LABELS = {
    yuangu: '远古·起源 — Ancient · Origin',
    shangzhou: '商周·青铜鼓 — ShangZhou · Bronze Drum',
    hantang: '汉唐·繁荣 — HanTang · Flourishing',
    songyuan: '宋元·民间鼓乐 — SongYuan · Folk Drum'
};

// 状态变量
var currentIndex = -1;      // 当前场景索引
var scenes = {};            // 场景DOM元素映射
var scrollTimer = null;     // 滚轮冷却计时器
var evolutionTimer = null;  // 当前时期自动演变计时器
var SCROLL_COOLDOWN = 800;  // 滚轮冷却时间（毫秒），防止连续触发
var EVOLUTION_DELAY = 1600; // 标题独立展示时长

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
    scenes[prevId].classList.remove('evolved');
    }
    // 显示下一个场景
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

/* ========== 启动脚本 ========== */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
})();