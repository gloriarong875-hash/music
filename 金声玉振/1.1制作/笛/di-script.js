/*
 * 竹笛制作页交互说明
 * --------------------------------------------------------------------------
 * currentNavStage 表示全流程步骤：0 择竹、1 汗青、2 开孔、3 试音。
 * phase 表示共用舞台内部状态：bake -> drill -> tone。步骤 2 烘烤完成后直接进入
 * 步骤 3，不再保留旧版 clear/clearing/done 通节凿穿状态。
 * 切换全流程步骤时统一调用 setNavStage()，它同时更新视觉类与 aria-current。
 * 步骤 1 使用 requestAnimationFrame 平滑插值视差；步骤 2 使用长按计时烘烤；
 * 步骤 3 只开放最后两个孔。点击右下角按钮后，本地凿子图片会跟随 Pointer
 * Events 提供的坐标移动；步骤 4 根据膜材参数合成不同音色。
 *
 * 状态与数据约定：
 * 1. currentNavStage 只描述四个页面步骤，phase 描述当前可执行的交互模式。
 * 2. showParallaxStage/showBakeStage/showDrillStage/showToneStage 是四个主要入口；
 *    每个入口必须完整恢复自己的 DOM 状态，确保前进、后退结果一致。
 * 3. bakeProgress 范围为 0..1，长按时按 BAKE_HOLD_DURATION 线性增长，松开暂停。
 * 4. drillTargets 始终取 holes 的最后两个元素；TOTAL_HOLES 因而自动等于 2。
 * 5. drillChiselPickedUp 决定孔位是否可点击以及本地凿子是否响应 pointermove。
 * 6. 跟随图片使用 clientX/clientY，与 CSS fixed 定位处于同一视口坐标系。
 * 7. 进入试音或返回其他步骤时必须移除 visible/picked-up，防止工具残留。
 * 8. Web Audio 必须由用户手势触发，所有入口先调用 initAudio() 再播放声音。
 */

// ============================================================
// === SHARED AUDIO HELPERS ===
// ============================================================
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function initAudio() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playBakeSound() {
    if (!audioCtx) return;
    const noise = audioCtx.createBufferSource();
    const bufferSize = audioCtx.sampleRate * 0.1;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
    noise.buffer = buffer;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    noise.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90 + Math.random() * 40, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
}

function playDrillSound() {
    if (!audioCtx) return;
    const noise = audioCtx.createBufferSource();
    const bufferSize = audioCtx.sampleRate * 0.15;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.35;
    }
    noise.buffer = buffer;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    noise.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120 + Math.random() * 60, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
}

function playCompleteSound() {
    if (!audioCtx) return;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, audioCtx.currentTime + i * 0.15);
        gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + i * 0.15 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.15 + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + i * 0.15);
        osc.stop(audioCtx.currentTime + i * 0.15 + 0.8);
    });
}

// ============================================================
// === STAGE 1: PARALLAX BAMBOO SELECTION ===
// ============================================================

// DOM
const parallaxStage = document.getElementById('parallaxStage');
const L = {
    xin: document.getElementById('layerXin'),
    wai: document.getElementById('layerWai'),
    zhi: document.getElementById('layerZhi'),
};
const bambooGuides = {
    xin: document.getElementById('guideXin'),
    wai: document.getElementById('guideWai'),
    zhi: document.getElementById('guideZhi'),
};
const scrollHint   = document.getElementById('scrollHint');
const parallaxProgressFill = document.getElementById('parallaxProgressFill');
const stepDots     = document.querySelectorAll('.step-dot');
const stepIndicator = document.getElementById('stepIndicator');
const backBtn      = document.getElementById('backBtn');
const nextBtn      = document.getElementById('nextBtn');

const allLayers    = [L.xin, L.wai, L.zhi];

// Design base 1440×900
const DW = 1440, DH = 900;

// 竹子滚动位置
const KF = {
    // 新 1 — far bamboo, LEFT side. Appears in focus → zooms past → gone.
    xin: [
        { p:0,    x:  4, y: -2, w: 48, h: 104, o:1.0  },
        { p:0.25, x:-18, y:-20, w: 85, h:170, o:0.40 },
        { p:0.5,  x:-50, y:-45, w:150, h:300, o:0    },
    ],
    // 歪 — near bamboo, RIGHT side when selectable → zooms past right.
    wai: [
        { p:0,    x: 50, y:20, w:  18, h: 50, o:0.08 },
        { p:0.5,  x: 50, y: -21, w: 54, h: 128, o:1.0  },
        { p:0.7,  x: 64, y:-20, w: 62, h:140, o:0.50 },
        { p:1.0,  x:85, y:-40, w:120, h:230, o:0    },
    ],
    // 直 1 — mid bamboo, approaches from right, becomes final hero (centered).
    zhi: [
        { p:0,    x: 72, y:  8, w:  8, h: 16, o:0.05 },
        { p:0.5,  x: 60, y:  0, w: 20, h: 40, o:0.25 },
        { p:1.0,  x: 36, y:  0, w: 48, h: 108, o:1.0  },
    ],
};

// Helpers
function lerp(a,b,t) { return a+(b-a)*t; }
function ease(t) { return t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; }

function lerpKF(arr, p) {
    let lo = arr[0], hi = arr[arr.length-1];
    for (let i=0; i<arr.length-1; i++) {
        if (p >= arr[i].p && p <= arr[i+1].p) { lo=arr[i]; hi=arr[i+1]; break; }
    }
    if (p <= arr[0].p)       { lo=arr[0]; hi=arr[0]; }
    if (p >= arr[arr.length-1].p) { lo=arr[arr.length-1]; hi=arr[arr.length-1]; }
    const range = hi.p - lo.p || 0.001;
    const t = ease((p - lo.p) / range);
    const out = {};
    for (const k of Object.keys(lo)) { if (k==='p') continue; out[k] = lerp(lo[k], hi[k], t); }
    return out;
}

// Parallax state
let parallaxActive   = true;
let scrollTarget     = 0;
let scrollProgress   = 0;
let lastProgress     = 0;
let lastInputTime    = 0;
let parallaxAnimId   = null;
let selected         = null;
let activeDot        = 0;  // step dot index with hysteresis
let currentNavStage  = 0;  // 0=择竹, 1=汗青, 2=开孔, 3=试音

const SNAP_POINTS       = [0, 0.5, 1.0];
const SNAP_THRESHOLD    = 0.18;
const SNAP_IDLE_MS      = 180;
const SMOOTHING         = 0.12;
const SNAP_SMOOTHING    = 0.22;
const SENSITIVITY       = 0.0012;

/*
 * 近图指导配置
 * --------------------------------------------------------------------------
 * snap 对应竹材出现最清晰的滚动进度；fadeRange 越大，文字提前出现且更晚消失。
 * anchorY 是说明相对图片高度的位置，0.5 表示垂直居中。
 */
const GUIDE_CONFIG = {
    xin: { snap: 0,   fadeRange: 0.25, anchorY: 0.45 },
    wai: { snap: 0.5, fadeRange: 0.24, anchorY: 0.48 },
    zhi: { snap: 1,   fadeRange: 0.28, anchorY: 0.44 },
};

function updateBambooGuides(p) {
    Object.entries(GUIDE_CONFIG).forEach(([type, config]) => {
        const guide = bambooGuides[type];
        const rect = L[type].getBoundingClientRect();
        const distance = Math.abs(p - config.snap);
        const opacity = Math.max(0, Math.min(1, 1 - distance / config.fadeRange));
        const side = guide.dataset.guideSide;
        const isCompact = window.innerWidth <= 768;

        // 小屏幕改为图片中心锚定，避免左右展开的说明超出视口。
        guide.style.left = `${isCompact ? rect.left + rect.width / 2 : side === 'right' ? rect.right : rect.left}px`;
        guide.style.top = `${rect.top + rect.height * config.anchorY}px`;
        guide.style.opacity = opacity.toFixed(3);
        guide.classList.toggle('is-near', opacity > 0.12);
        guide.setAttribute('aria-hidden', opacity > 0.12 ? 'false' : 'true');
    });
}

// Apply all layers at given progress
function apply(p) {
    const xi = lerpKF(KF.xin, p);
    L.xin.style.transform = `translate(${xi.x}vw,${xi.y}vh) scaleX(-1)`;
    L.xin.style.width  = xi.w+'vw'; L.xin.style.height = xi.h+'vh';
    L.xin.style.opacity = xi.o;

    const wa = lerpKF(KF.wai, p);
    L.wai.style.transform = `translate(${wa.x}vw,${wa.y}vh)`;
    L.wai.style.width  = wa.w+'vw'; L.wai.style.height = wa.h+'vh';
    L.wai.style.opacity = wa.o;

    const zh = lerpKF(KF.zhi, p);
    L.zhi.style.transform = `translate(${zh.x}vw,${zh.y}vh) scaleX(-1)`;
    L.zhi.style.width  = zh.w+'vw'; L.zhi.style.height = zh.h+'vh';
    L.zhi.style.opacity = zh.o;

    // 指导文字跟随各竹材，并在接近对应吸附点时渐显。
    updateBambooGuides(p);

    // Top progress bar
    parallaxProgressFill.style.width = (p * 100) + '%';

    // Step dots with hysteresis
    const prevDot = activeDot;
    if      (p > 0.28 && activeDot===0) activeDot = 1;
    else if (p < 0.22 && activeDot===1) activeDot = 0;
    else if (p > 0.68 && activeDot===1) activeDot = 2;
    else if (p < 0.62 && activeDot===2) activeDot = 1;
    if (activeDot !== prevDot) {
        stepDots.forEach((d,i) => d.classList.toggle('active', i===activeDot));
    }

    // Scroll hint
    scrollHint.classList.toggle('still', p >= 0.85);
    if      (p < 0.15) scrollHint.textContent = '滚轮滑动 · 深入丛林';
    else if (p < 0.4)  scrollHint.textContent = '继续深入 · 辨识竹材';
    else if (p < 0.85) scrollHint.textContent = '仔细甄别 · 择其良者';
    else               scrollHint.textContent = '择竹将毕 · 直竹已现';
}

// Animation loop
function parallaxLoop() {
    if (!parallaxActive) { parallaxAnimId = null; return; }

    const idle = performance.now() - lastInputTime;
    let effectiveTarget = scrollTarget;
    let isSnapping = false;

    if (idle > SNAP_IDLE_MS) {
        const nearestSnap = SNAP_POINTS.reduce((nearest, point) =>
            Math.abs(scrollProgress - point) < Math.abs(scrollProgress - nearest) ? point : nearest
        );
        if (Math.abs(scrollProgress - nearestSnap) < SNAP_THRESHOLD) {
            effectiveTarget = nearestSnap;
            scrollTarget = nearestSnap;
            isSnapping = true;
        }
    }

    lastProgress = scrollProgress;
    scrollProgress += (effectiveTarget - scrollProgress) * (isSnapping ? SNAP_SMOOTHING : SMOOTHING);
    scrollProgress = Math.max(0, Math.min(1, scrollProgress));

    apply(scrollProgress);
    parallaxAnimId = requestAnimationFrame(parallaxLoop);
}

function startParallaxLoop() {
    if (!parallaxAnimId) { lastProgress = scrollProgress; parallaxAnimId = requestAnimationFrame(parallaxLoop); }
}

// Input: Wheel
window.addEventListener('wheel', e => {
    if (!parallaxActive) return;
    e.preventDefault();
    scrollTarget += e.deltaY * SENSITIVITY;
    scrollTarget = Math.max(0, Math.min(1, scrollTarget));
    lastInputTime = performance.now();
    startParallaxLoop();
}, { passive: false });

// Input: Keyboard
window.addEventListener('keydown', e => {
    if (!parallaxActive) return;
    if (e.key==='ArrowRight'||e.key==='ArrowDown') {
        e.preventDefault(); scrollTarget = Math.min(1, scrollTarget+0.08); lastInputTime = performance.now(); startParallaxLoop();
    } else if (e.key==='ArrowLeft'||e.key==='ArrowUp') {
        e.preventDefault(); scrollTarget = Math.max(0, scrollTarget-0.08); lastInputTime = performance.now(); startParallaxLoop();
    }
});

// Input: Touch
let tY=0, tStart=0;
window.addEventListener('touchstart', e => {
    if (!parallaxActive) return;
    if (e.touches.length===1) { tY=e.touches[0].clientY; tStart=scrollTarget; lastInputTime = performance.now(); }
}, {passive:false});
window.addEventListener('touchmove', e => {
    if (!parallaxActive) return;
    if (e.touches.length===1) {
        const dy = tY - e.touches[0].clientY;
        scrollTarget = Math.max(0, Math.min(1, tStart + dy * SENSITIVITY));
        lastInputTime = performance.now();
        startParallaxLoop();
    }
}, {passive:false});

// Step dots click — snap to bamboo view
stepDots.forEach(d => {
    d.addEventListener('click', function(e) {
        if (!parallaxActive) return;
        e.stopPropagation();
        scrollTarget = SNAP_POINTS[parseInt(this.dataset.idx)];
        lastInputTime = 0; // snap immediately
        startParallaxLoop();
    });
});

// Back button — always go back exactly one step
backBtn.addEventListener('click', () => {
    switch (currentNavStage) {
        case 0:
            // Parallax is the first step — exit to main page
            window.location.href = '../../index.html?instrument=%E7%AC%9B';
            break;
        case 1:
            // From bake → back to parallax
            showParallaxStage();
            break;
        case 2:
            // From drill → back to bake (start of baking)
            showBakeStage();
            currentNavStage = 1;
            break;
        case 3:
            // From tone → back to drill
            backToDrill();
            break;
    }
});

// Next button — advance one step forward
nextBtn.addEventListener('click', () => {
    switch (currentNavStage) {
        case 0:
            // From parallax → advance to bake
            if (selected === 'zhi') {
                // Already selected good bamboo, transition directly
                transitionToBake();
            } else {
                // Auto-select zhi and transition
                initAudio();
                scrollTarget = 1.0;
                lastInputTime = 0;
                startParallaxLoop();
                selected = 'zhi';
                L.zhi.classList.add('selected');
                scrollHint.textContent = '良竹已择 · 进入汗青工序';
                scrollHint.classList.add('still');
                setTimeout(() => {
                    transitionToBake();
                }, 900);
            }
            break;
        case 1:
            // From bake → advance to drill
            if (phase === 'drill') {
                showDrillStage();
            } else if (phase === 'bake' && bakeProgress >= 1) {
                finishBaking();
            } else {
                // Force complete baking
                bakeProgress = 1;
                progressBar.style.width = '100%';
                finishBaking();
            }
            break;
        case 2:
            // From drill → advance to tone (complete remaining holes)
            if (drilledCount >= TOTAL_HOLES) {
                // Already done, just transition
                playCompleteSound();
                completeOverlay.querySelector('.complete-text').innerText = '开孔完成';
                completeOverlay.querySelector('.complete-sub').innerText = '笛开孔完成，进入最后试音步骤';
                completeOverlay.classList.add('active');
                setNavStage(3);
                setTimeout(showToneStage, 1200);
            } else {
                // Auto-complete remaining holes
                drillTargets.forEach(hole => {
                    if (!hole.classList.contains('drilled')) {
                        drillHole(hole, true);
                    }
                });
            }
            break;
        case 3:
            // From tone → exit to main page
            window.location.href = '../../index.html?instrument=%E7%AC%9B';
            break;
    }
});

// Bamboo selection
allLayers.forEach(layer => {
    layer.addEventListener('click', function(e) {
        if (!parallaxActive) return;
        e.stopPropagation();
        const type = this.dataset.bamboo;

        if (type === 'zhi') {
            // Good bamboo — transition to bake stage
            initAudio();
            allLayers.forEach(l=>l.classList.remove('selected'));
            this.classList.add('selected');
            selected = type;
            scrollHint.textContent = '良竹已择 · 进入汗青工序';
            scrollHint.classList.add('still');

            setTimeout(() => {
                transitionToBake();
            }, 900);
            return;
        }

        // Bad bamboo — audio feedback only, no shake/flip
        initAudio();

        // Crossfade guide: requirement ↔ feedback
        const guide = document.getElementById('guide' + type.charAt(0).toUpperCase() + type.slice(1));
        if (guide) {
            const fb = guide.querySelector('.guide-feedback');
            const req = guide.querySelector('.guide-requirement');
            if (fb && req) {
                req.style.opacity = '0';
                fb.classList.add('show');
                clearTimeout(guide._revertTimer);
                guide._revertTimer = setTimeout(function () {
                    fb.classList.remove('show');
                    req.style.opacity = '';
                }, 1800);
            }
        }
    });
});

// 窗口尺寸变化后重新计算竹图与说明文字的相对位置。
window.addEventListener('resize', () => { if (parallaxActive) apply(scrollProgress); });

// ============================================================
// === TRANSITION: PARALLAX → BAKE ===
// ============================================================

// ============================================================
// === BACK NAVIGATION HELPERS ===
// ============================================================

function showParallaxStage() {
    currentNavStage = 0;
    parallaxActive = true;

    // Hide later stages
    stageBake.classList.add('hidden');
    finalStage.classList.remove('visible');

    // 返回步骤 1 时恢复统一四步导航，并将“择竹”标为当前步骤。
    navDots.classList.add('visible');
    setNavStage(0);
    fireGlow.style.display = 'none';

    // Show parallax stage
    parallaxStage.classList.remove('hidden');
    stepIndicator.style.opacity = '1';
    parallaxProgressFill.style.width = '0%';
    scrollHint.style.display = 'block';
    scrollHint.style.opacity = '1';
    scrollHint.classList.remove('still');

    // Reset parallax state
    scrollTarget = 0;
    scrollProgress = 0;
    lastProgress = 0;
    lastInputTime = 0;
    selected = null;
    activeDot = 0;
    allLayers.forEach(l => l.classList.remove('selected'));
    stepDots.forEach((d, i) => d.classList.toggle('active', i === 0));

    // Reset phase (in case we're coming back from bake)
    phase = 'bake';
    stopBakingHold();
    bakeProgress = 0;
    bambooOffset = 0;

    // Apply initial state and restart loop
    apply(0);
    startParallaxLoop();
}

function transitionToBake() {
    currentNavStage = 1;
    parallaxActive = false;
    if (parallaxAnimId) {
        cancelAnimationFrame(parallaxAnimId);
        parallaxAnimId = null;
    }
    parallaxStage.classList.add('hidden');
    scrollHint.style.display = 'none';
    scrollHint.style.opacity = '0';
    stepIndicator.style.opacity = '0';
    parallaxProgressFill.style.width = '100%';
    showBakeStage();
}

// ============================================================
// === STAGE 2-3: BAKE & DRILL ===
// ============================================================

const stageBake = document.getElementById('bake-stage');
const finalStage = document.getElementById('final-stage');
const bgLayer = document.getElementById('bg-layer');
const navDots = document.getElementById('navDots');
const navDotWrappers = document.querySelectorAll('.dot-wrapper');

const bambooPipe = document.getElementById('bamboo-pipe');
const bambooContainer = document.getElementById('bamboo-container');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const bakeHoldHint = document.getElementById('bakeHoldHint');
const steamEl = document.getElementById('steam');
const mainText = document.getElementById('main-text');
const subText = document.getElementById('sub-text');
const holesLayer = document.getElementById('holes-layer');
const scaleOverlay = document.getElementById('scale-overlay');
const gongchePanel = document.getElementById('gongche-panel');
const gongcheChars = document.getElementById('gongche-chars');
const completeOverlay = document.getElementById('complete-overlay');
const fireGlow = document.querySelector('.fire-glow');
const drillPickupBtn = document.getElementById('drillPickupBtn');
const drillPickupHint = document.getElementById('drillPickupHint');
const drillChiselImg = document.getElementById('drillChiselImg');

let drillChiselPickedUp = false;

function setMainText(text) {
    if (mainText) mainText.innerText = text;
}

function setNavStage(index) {
    navDotWrappers.forEach((dot, i) => {
        dot.classList.remove('active', 'completed');
        dot.removeAttribute('aria-current');
        const circle = dot.querySelector('.dot');
        circle.classList.remove('active', 'completed');
        if (i < index) {
            dot.classList.add('completed');
            circle.classList.add('completed');
        } else if (i === index) {
            dot.classList.add('active');
            circle.classList.add('active');
            dot.setAttribute('aria-current', 'step');
        }
    });
}

function showBakeStage() {
    // Show global elements for bake stage
    navDots.classList.add('visible');
    fireGlow.style.display = 'block';
    fireGlow.style.opacity = '0.8';

    stageBake.classList.remove('hidden');
    stageBake.dataset.mode = 'bake';
    stageBake.classList.remove('tool-active');
    setNavStage(1);
    stopBakingHold();
    progressContainer.style.opacity = '1';
    bgLayer.style.transform = 'scale(1)';
    bambooOffset = 0;
    bambooPipe.style.setProperty('--bamboo-offset', '0px');
    bambooPipe.style.bottom = '80px';
    bambooPipe.style.left = '45%';
    bambooPipe.style.transform = 'translateX(-50%) translateY(0) scale(0.78)';
    subText.innerText = '烘烤去湿可防止竹笛后期开裂';
    bambooPipe.classList.remove('baked', 'baking');
    bakeProgress = 0;
    progressBar.style.width = '0%';
    bakeHoldHint.textContent = '点击炉子开始烘烤';
    bakeHoldHint.classList.remove('hidden');
    completeOverlay.classList.remove('active');
    holesLayer.style.display = 'none';
    holesLayer.querySelectorAll('.hole').forEach(hole => {
        hole.classList.remove('drilled');
        hole.classList.add('ink-mark');
    });
    gongchePanel.classList.remove('visible');
    scaleOverlay.classList.remove('visible');
    gongcheChars.innerHTML = '';
    // 确保炉子在汗青阶段可见
    furnace.classList.remove('hidden');
    furnace.style.transform = '';
    // 隐藏打孔阶段的凿子拾取UI
    drillPickupBtn.classList.remove('visible', 'picked-up');
    drillPickupHint.classList.remove('visible');
    drillChiselImg.classList.remove('visible', 'picked-up');
    drillChiselPickedUp = false;
}

// ============================================================
// === BAKE: Click furnace to start automatic heating ===
// ============================================================

let bakeProgress = 0;
let bakeHoldFrame = null;
let bakeHoldStartedAt = 0;
let bakeProgressAtHoldStart = 0;
let bakeRunning = false;
const BAKE_HOLD_DURATION = 3000;
let phase = 'bake';
let bambooOffset = 0;

function startBakingHold(e) {
    if (phase !== 'bake' || bakeProgress >= 1 || bakeRunning) return;
    if (e) e.preventDefault();
    initAudio();
    bakeHoldStartedAt = performance.now();
    bakeProgressAtHoldStart = bakeProgress;
    bakeRunning = true;
    furnace.classList.add('heating');
    bambooPipe.classList.add('baking');
    steamEl.classList.add('active');
    progressContainer.classList.add('is-running');
    progressContainer.style.opacity = '1';
    bakeHoldHint.textContent = '炉火渐旺 · 正在烘烤';
    updateBakingHold();
}

function updateBakingHold(now = performance.now()) {
    if (!bakeRunning || phase !== 'bake') return;
    bakeProgress = Math.min(1, bakeProgressAtHoldStart + (now - bakeHoldStartedAt) / BAKE_HOLD_DURATION);
    progressBar.style.width = `${bakeProgress * 100}%`;
    if (bakeProgress >= 0.66) {
        setMainText('色泽转深，竹质紧实');
    } else if (bakeProgress >= 0.25) {
        setMainText('竹管受热，水分开始蒸发');
    }
    if (bakeProgress >= 1) {
        playBakeSound();
        stopBakingHold();
        finishBaking();
        return;
    }
    bakeHoldFrame = requestAnimationFrame(updateBakingHold);
}

function stopBakingHold() {
    if (bakeHoldFrame) cancelAnimationFrame(bakeHoldFrame);
    bakeHoldFrame = null;
    bakeRunning = false;
    furnace.classList.remove('heating');
    bambooPipe.classList.remove('baking');
    steamEl.classList.remove('active');
    progressContainer.classList.remove('is-running');
    if (phase === 'bake') bakeHoldHint.textContent = bakeProgress > 0 ? '烘烤暂停 · 点击炉子继续' : '点击炉子开始烘烤';
}

const furnace = document.querySelector('.furnace');

function finishBaking() {
    phase = 'drill';
    stopBakingHold();
    bambooPipe.classList.add('baked');
    progressContainer.style.opacity = '0';
    bakeHoldHint.classList.add('hidden');
    furnace.classList.add('hidden');
    bambooPipe.removeAttribute('style');
    setMainText('烘烤完成');
    subText.innerText = '竹管已去湿定型，准备进入开孔工序';
    playCompleteSound();
    completeOverlay.querySelector('.complete-text').innerText = '汗青完成';
    completeOverlay.querySelector('.complete-sub').innerText = '竹管已定型，准备开最后两孔';
    completeOverlay.classList.add('active');
    setTimeout(() => {
        completeOverlay.classList.remove('active');
        showDrillStage();
    }, 900);
}

function showDrillStage() {
    phase = 'drill';
    currentNavStage = 2;
    stageBake.dataset.mode = 'drill';
    stageBake.classList.remove('tool-active');
    setNavStage(2);
    finalStage.classList.remove('visible');
    bambooPipe.removeAttribute('style');
    holesLayer.style.display = 'block';
    resetDrillHoles();
    drillChiselPickedUp = false;
    gongcheChars.innerHTML = '';
    gongchePanel.classList.remove('visible');
    scaleOverlay.classList.remove('visible');
    setMainText('最后两孔待开');
    subText.innerText = '点击白色按钮拿起凿子，再完成最后两个孔位';
    completeOverlay.classList.remove('active');
    scaleOverlay.style.display = 'none';
    progressContainer.style.opacity = '0';
    progressBar.style.width = '0%';
    // 步骤3打孔阶段隐藏炉子
    furnace.classList.add('hidden');
    // 仅显示右下角拾取按钮；凿子图片在点击按钮后才出现。
    drillPickupBtn.classList.add('visible');
    drillPickupBtn.classList.remove('picked-up');
    drillPickupHint.classList.add('visible');
    drillChiselImg.classList.remove('visible', 'picked-up');
}


function createChips(x, y) {
    const container = bambooContainer;
    for (let i = 0; i < 8; i++) {
        const chip = document.createElement('div');
        chip.className = 'chip-particle';
        chip.style.left = x + 'px';
        chip.style.top = y + 'px';
        const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.5;
        const distance = 20 + Math.random() * 40;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        chip.style.setProperty('--tx', tx + 'px');
        chip.style.setProperty('--ty', ty + 'px');
        chip.style.animation = `chipFly 0.6s ease-out forwards`;
        chip.style.animationDelay = (Math.random() * 0.1) + 's';
        container.appendChild(chip);
        setTimeout(() => chip.remove(), 700);
    }
}

function createSoundWave(x, y) {
    const wave = document.createElement('div');
    wave.className = 'sound-wave';
    wave.style.left = x + 'px';
    wave.style.top = y + 'px';
    wave.style.transform = 'translate(-50%, -50%)';
    wave.style.animation = 'waveExpand 0.8s ease-out forwards';
    bambooContainer.appendChild(wave);
    setTimeout(() => wave.remove(), 800);
}

function addGongcheChar(note, name, tone) {
    const item = document.createElement('div');
    item.className = 'gongche-item';
    const char = document.createElement('div');
    char.className = 'gongche-char';
    char.textContent = note;
    item.appendChild(char);
    gongcheChars.appendChild(item);
    requestAnimationFrame(() => {
        char.classList.add('visible');
    });
}

function drillHole(hole, force = false) {
    if (phase !== 'drill' || hole.classList.contains('drilled')) return;
    if (!drillTargets.includes(hole)) return;
    if (!force && !drillChiselPickedUp) return;
    initAudio();
    playDrillSound();
    hole.classList.remove('target-near');
    hole.classList.remove('ink-mark');
    hole.classList.add('drilled');
    const rect = hole.getBoundingClientRect();
    const containerRect = bambooContainer.getBoundingClientRect();
    const x = rect.left - containerRect.left + rect.width / 2;
    const y = rect.top - containerRect.top + rect.height / 2;
    createChips(x, y);
    createSoundWave(x, y);
    const name = hole.dataset.name;
    const note = hole.dataset.note;
    const tone = hole.dataset.tone;
    drilledCount++;
    gongchePanel.classList.add('visible');
    addGongcheChar(note, name, tone);
    setMainText(`已开${name}，对应工尺谱「${note}」，${tone}音`);
    const remaining = TOTAL_HOLES - drilledCount;
    subText.innerText = remaining > 0 ? `还差 ${remaining} 个孔位` : '最后两孔已完成';
    if (drilledCount >= TOTAL_HOLES) {
        // 隐藏凿子拾取UI
        stageBake.classList.remove('tool-active');
        drillPickupBtn.classList.remove('visible', 'picked-up');
        drillPickupHint.classList.remove('visible');
        drillChiselImg.classList.remove('visible', 'picked-up');
        setTimeout(() => {
            playCompleteSound();
            completeOverlay.querySelector('.complete-text').innerText = '开孔完成';
            completeOverlay.querySelector('.complete-sub').innerText = '笛开孔完成，进入最后试音步骤';
            completeOverlay.classList.add('active');
            setNavStage(3);
            setTimeout(showToneStage, 1200);
        }, 600);
    }
}

function showToneStage() {
    phase = 'tone';
    currentNavStage = 3;
    stageBake.classList.add('hidden');
    finalStage.classList.add('visible');
    navDots.classList.add('visible');
    finalMembraneStage.classList.remove('hidden');
    finalPlayStage.classList.remove('visible');
    finalSubText.innerText = '请选择膜材，贴于膜孔之上';
    completeOverlay.classList.remove('active');
    progressContainer.style.opacity = '0';
    progressBar.style.width = '0%';
    // 隐藏打孔阶段的凿子拾取UI
    drillPickupBtn.classList.remove('visible', 'picked-up');
    drillPickupHint.classList.remove('visible');
    drillChiselImg.classList.remove('visible', 'picked-up');
    drillChiselPickedUp = false;
    setNavStage(3);
}

function backToDrill() {
    currentNavStage = 2;
    phase = 'drill';
    stageBake.dataset.mode = 'drill';
    stageBake.classList.remove('tool-active');

    // Hide final stage, show bake stage (which hosts drill UI)
    finalStage.classList.remove('visible');
    stageBake.classList.remove('hidden');

    // Show global elements
    navDots.classList.add('visible');
    fireGlow.style.display = 'block';
    setNavStage(2);

    // Set bamboo to baked, centered position
    bambooPipe.classList.add('baked');
    bambooPipe.removeAttribute('style');

    // Hide bake-specific elements
    furnace.classList.add('hidden');
    furnace.style.transform = '';
    stopBakingHold();
    progressContainer.style.opacity = '0';
    progressBar.style.width = '0%';
    completeOverlay.classList.remove('active');

    // Show drill UI
    holesLayer.style.display = 'block';
    resetDrillHoles();
    drillChiselPickedUp = false;
    gongcheChars.innerHTML = '';
    gongchePanel.classList.remove('visible');
    scaleOverlay.classList.remove('visible');
    scaleOverlay.style.display = 'none';

    setMainText('最后两孔待开');
    subText.innerText = '点击白色按钮拿起凿子，再完成最后两个孔位';

    // 返回步骤 3 时恢复未拾取状态。
    drillPickupBtn.classList.add('visible');
    drillPickupBtn.classList.remove('picked-up');
    drillPickupHint.classList.add('visible');
    drillChiselImg.classList.remove('visible', 'picked-up');

    // Reset final stage internal state
    finalMembraneStage.classList.remove('hidden');
    finalPlayStage.classList.remove('visible');
    selectedMembrane = null;
    currentMembrane = null;
    finalMembraneItems.forEach(i => i.classList.remove('selected'));
    finalConfirmBtn.classList.remove('visible');
    finalNoteDisplay.classList.remove('visible');
    finalBambooPipe.classList.remove('glowing');
    const membraneHole = document.getElementById('final-hole-2');
    if (membraneHole) membraneHole.classList.remove('membrane-covered');
    finalPlayCount = 0;
}

// ============================================================
// === STAGE 4: 试音 (FINAL) ===
// ============================================================
// 试音阶段核心功能：选择膜材、显示指法、播放音阶

/* 膜材音色参数配置
 * - brightness: 基频亮度系数
 * - harmonic: 谐波分量数组，控制音色特征
 * - attack: 起音时间（秒）
 * - decay: 衰减时间（秒）
 */
const membraneTypes = {
    reed:   { name: '芦苇膜', brightness: 1.3, harmonic: [1, 0.6, 0.4, 0.2, 0.1], attack: 0.02, decay: 0.8 },
    bamboo: { name: '竹膜',   brightness: 1.0, harmonic: [1, 0.5, 0.3, 0.15, 0.08], attack: 0.03, decay: 1.0 },
    paper:  { name: '纸膜',   brightness: 0.7, harmonic: [1, 0.4, 0.5, 0.3, 0.2], attack: 0.05, decay: 1.2 }
};

let currentMembrane = null;
let selectedMembrane = null;

/* 音阶指法映射表
 * freq: 基础频率（Hz）
 * name: 工尺谱名称
 * holes: 6个音孔的开闭状态（true=按住，false=放开）
 */
const noteFingerings = {
    '1': { freq: 293.66, name: '宫', holes: [true, true, true, false, false, false] },
    '2': { freq: 329.63, name: '商', holes: [true, true, false, false, false, false] },
    '3': { freq: 369.99, name: '角', holes: [true, false, false, false, false, false] },
    '4': { freq: 392.00, name: '徵', holes: [false, true, true, false, false, false] },
    '5': { freq: 440.00, name: '羽', holes: [true, true, true, true, true, true] },
    '6': { freq: 493.88, name: '变宫', holes: [true, true, true, true, true, false] },
    '7': { freq: 523.25, name: '变徵', holes: [true, true, true, true, false, false] }
};

/* 数字键到工尺谱字符的映射 */
const noteChars = {
    '1': '宫',
    '2': '商',
    '3': '角',
    '4': '徵',
    '5': '羽',
    '6': '变宫',
    '7': '变徵'
};

const finalMembraneStage = document.getElementById('final-membrane-stage');
const finalPlayStage = document.getElementById('final-play-stage');
const finalMembraneItems = document.querySelectorAll('#final-membrane-stage .membrane-item');
const finalConfirmBtn = document.getElementById('final-confirm-btn');
const finalNoteDisplay = document.getElementById('final-note-display');
const finalNoteChar = document.getElementById('final-note-char');
const finalNoteName = document.getElementById('final-note-name');
const finalBambooContainer = document.getElementById('final-bamboo-container');
const finalBambooPipe = document.getElementById('final-bamboo-pipe');
const finalMainText = document.getElementById('final-main-text');
const finalSubText = document.getElementById('final-sub-text');
const resultModal = document.getElementById('result-modal');
const resultRestartBtn = document.getElementById('result-restart-btn');
const resultExploreBtn = document.getElementById('result-explore-btn');

let finalPlayCount = 0;
const PLAY_TO_END = 5;
let resultTimer = null;

function openResultCard() {
    if (!resultModal) return;
    if (resultTimer) {
        clearTimeout(resultTimer);
        resultTimer = null;
    }
    resultModal.classList.add('is-visible');
    resultModal.setAttribute('aria-hidden', 'false');
}

finalMembraneItems.forEach(item => {
    item.addEventListener('click', () => {
        initAudio();
        finalMembraneItems.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        selectedMembrane = item.dataset.type;
        finalConfirmBtn.classList.add('visible');
        const name = item.querySelector('.membrane-name').textContent;
        const desc = item.dataset.desc;
        finalMainText.innerText = `已选${name}，音色${desc}`;
        finalSubText.innerText = '选择完成，点击确认后使用数字键 1-7 听音';
    });
});

finalConfirmBtn.addEventListener('click', () => {
    if (!selectedMembrane) return;
    initAudio();
    playMembraneSound();
    currentMembrane = selectedMembrane;
    const membraneHole = document.getElementById('final-hole-2');
    membraneHole.classList.add('membrane-covered');
    createFinalVibration(membraneHole);
    finalMembraneStage.classList.add('hidden');
    setTimeout(() => {
        finalPlayStage.classList.add('visible');
        const params = membraneTypes[currentMembrane];
        finalMainText.innerText = `已贴${params.name}，${params.name === '芦苇膜' ? '清亮' : params.name === '竹膜' ? '温润' : '浑厚'}之声待君品鉴`;
        finalSubText.innerText = '请按数字键 1-7 听音：宫、商、角、徵、羽、变宫、变徵';
        finalBambooPipe.classList.add('glowing');
    }, 400);
});

function playMembraneSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
}

function createFinalVibration(hole) {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const rect = hole.getBoundingClientRect();
            const containerRect = finalBambooContainer.getBoundingClientRect();
            const x = rect.left - containerRect.left + rect.width / 2;
            const y = rect.top - containerRect.top + rect.height / 2;
            const vib = document.createElement('div');
            vib.className = 'vibration';
            vib.style.left = x + 'px';
            vib.style.top = y + 'px';
            vib.style.transform = 'translate(-50%, -50%)';
            vib.style.animation = 'vibrate 0.8s ease-out forwards';
            finalBambooContainer.appendChild(vib);
            setTimeout(() => vib.remove(), 800);
        }, i * 300);
    }
}

const finalHoleElements = [
    document.getElementById('final-hole-3'),
    document.getElementById('final-hole-4'),
    document.getElementById('final-hole-5'),
    document.getElementById('final-hole-6'),
    document.getElementById('final-hole-7'),
    document.getElementById('final-hole-8')
];
const finalHintElements = [
    document.querySelector('#final-stage .hint-1'),
    document.querySelector('#final-stage .hint-2'),
    document.querySelector('#final-stage .hint-3'),
    document.querySelector('#final-stage .hint-4'),
    document.querySelector('#final-stage .hint-5'),
    document.querySelector('#final-stage .hint-6'),
    document.querySelector('#final-stage .hint-7')
];

/* 播放竹笛音符
 * 使用 Web Audio API 合成音色：
 * 1. 基础正弦波作为基频
 * 2. 多个谐波振荡器模拟泛音列
 * 3. 带通滤波白噪声增加真实感
 * 同时更新孔位指法显示和音符UI
 */
function playFluteNote(key) {
    const note = noteFingerings[key];
    if (!note || !currentMembrane) return;

    initAudio();
    const params = membraneTypes[currentMembrane];
    const baseFreq = note.freq * params.brightness;

    // 主振荡器：正弦波基频
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = baseFreq;
    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + params.attack);
    gain.gain.exponentialRampToValueAtTime(0.001, now + params.attack + params.decay);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + params.attack + params.decay + 0.1);

    // 谐波振荡器：偶数次用正弦，奇数次用三角波
    params.harmonic.forEach((amp, i) => {
        if (amp < 0.05) return;
        const harmOsc = audioCtx.createOscillator();
        const harmGain = audioCtx.createGain();
        harmOsc.type = i % 2 === 0 ? 'sine' : 'triangle';
        harmOsc.frequency.value = baseFreq * (i + 2);
        harmGain.gain.setValueAtTime(0, now);
        harmGain.gain.linearRampToValueAtTime(amp * 0.08, now + params.attack);
        harmGain.gain.exponentialRampToValueAtTime(0.001, now + params.attack + params.decay * 0.7);
        harmOsc.connect(harmGain);
        harmGain.connect(audioCtx.destination);
        harmOsc.start(now);
        harmOsc.stop(now + params.attack + params.decay + 0.1);
    });

    // 白噪声：增加吹奏气息感
    const noise = audioCtx.createBufferSource();
    const bufferSize = audioCtx.sampleRate * 0.1;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.02;
    }
    noise.buffer = buffer;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = baseFreq * 2;
    filter.Q.value = 5;
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(now);

    // 更新音符显示
    finalNoteChar.textContent = noteChars[key];
    finalNoteName.textContent = note.name;
    finalNoteDisplay.classList.add('visible');

    // 更新指法显示：按住的孔显示金色发光
    note.holes.forEach((closed, index) => {
        if (finalHoleElements[index]) {
            if (closed) {
                finalHoleElements[index].classList.add('active');
            } else {
                finalHoleElements[index].classList.remove('active');
            }
        }
        if (finalHintElements[index]) {
            finalHintElements[index].classList.toggle('active', !closed);
        }
    });

    // 按住吹孔和膜孔
    document.getElementById('final-hole-1').classList.add('active');
    document.getElementById('final-hole-2').classList.add('active');

    // 创建声波效果
    const activeHoles = note.holes.map((closed, i) => closed ? finalHoleElements[i] : null).filter(Boolean);
    if (activeHoles.length > 0) {
        const centerHole = activeHoles[Math.floor(activeHoles.length / 2)];
        createFinalSoundWave(centerHole);
    }

    // 更新提示文字和播放计数
    finalMainText.innerText = `吹奏「${note.name}」，指法已示于孔位`;
    finalPlayCount++;
    if (finalPlayCount === PLAY_TO_END) {
        finalSubText.innerText = '五音已备，即将完成体验';
        resultTimer = setTimeout(openResultCard, 2000);
    }

    // 延迟清除指法显示
    setTimeout(() => {
        finalNoteDisplay.classList.remove('visible');
        finalHoleElements.forEach(h => h.classList.remove('active'));
        finalHintElements.forEach(h => h.classList.remove('active'));
        document.getElementById('final-hole-1').classList.remove('active');
        document.getElementById('final-hole-2').classList.remove('active');
    }, 600);
}

function createFinalSoundWave(hole) {
    const rect = hole.getBoundingClientRect();
    const containerRect = finalBambooContainer.getBoundingClientRect();
    const x = rect.left - containerRect.left + rect.width / 2;
    const y = rect.top - containerRect.top + rect.height / 2;
    const wave = document.createElement('div');
    wave.className = 'sound-wave';
    wave.style.left = x + 'px';
    wave.style.top = y + 'px';
    wave.style.transform = 'translate(-50%, -50%)';
    wave.style.animation = 'finalWaveExpand 0.8s ease-out forwards';
    finalBambooContainer.appendChild(wave);
    setTimeout(() => wave.remove(), 800);
}

document.addEventListener('keydown', (e) => {
    if (!finalPlayStage.classList.contains('visible')) return;
    if (e.repeat) return;
    const key = e.key;
    if (noteFingerings[key]) {
        e.preventDefault();
        playFluteNote(key);
    }
});

const finalPlayHoles = [
    document.getElementById('final-hole-3'),
    document.getElementById('final-hole-4'),
    document.getElementById('final-hole-5'),
    document.getElementById('final-hole-6'),
    document.getElementById('final-hole-7'),
    document.getElementById('final-hole-8')
];

finalPlayHoles.forEach((hole, index) => {
    if (!hole) return;
    hole.addEventListener('click', () => {
        if (!finalPlayStage.classList.contains('visible')) return;
        const key = String(index + 1);
        if (noteFingerings[key]) playFluteNote(key);
    });
    hole.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (!finalPlayStage.classList.contains('visible')) return;
        const key = String(index + 1);
        if (noteFingerings[key]) playFluteNote(key);
    });
});

resultRestartBtn?.addEventListener('click', () => location.reload());
resultExploreBtn?.addEventListener('click', () => {
    window.location.href = '../../index.html?instrument=%E7%AC%9B';
});

// ============================================================
// === DRILL HOLES (stage 3) ===
// ============================================================

const holes = holesLayer.querySelectorAll('.hole');
const drillTargets = Array.from(holes).slice(-2);
const TOTAL_HOLES = drillTargets.length;
let drilledCount = 0;

function resetDrillHoles() {
    holes.forEach(hole => {
        const isTarget = drillTargets.includes(hole);
        hole.classList.remove('target-near');
        hole.classList.toggle('drilled', !isTarget);
        hole.classList.toggle('ink-mark', isTarget);
        hole.style.pointerEvents = 'none';
    });
    drilledCount = 0;
}

holes.forEach(hole => {
    hole.addEventListener('click', (e) => {
        e.stopPropagation();
        drillHole(hole);
    });
    hole.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        drillHole(hole);
    });
});

/*
 * 步骤 3 凿子拾取与指针跟随
 * --------------------------------------------------------------------------
 * 统一使用 Pointer Events 支持鼠标、触控笔与触屏。拾取后只开放最后两个墨线
 * 孔位；凿子图片设置 pointer-events:none，因此不会挡住孔位的点击事件。
 */
function pickUpDrillChisel(e) {
    e.preventDefault();
    e.stopPropagation();
    if (phase !== 'drill' || drillChiselPickedUp) return;
    initAudio();
    drillChiselPickedUp = true;
    stageBake.classList.add('tool-active');
    drillPickupBtn.classList.add('picked-up');
    drillPickupHint.classList.remove('visible');
    drillChiselImg.classList.add('visible', 'picked-up');
    moveDrillChisel(e.clientX, e.clientY);

    // 前六孔为完成态，仅最后两个目标孔接收点击。
    drillTargets.forEach(hole => {
        hole.style.pointerEvents = 'all';
    });
    setMainText('凿子已在手，完成最后两孔');
    subText.innerText = '依次点击两个墨线标记';
}

function moveDrillChisel(x, y) {
    if (!drillChiselPickedUp || phase !== 'drill') return;
    drillChiselImg.style.left = `${x}px`;
    drillChiselImg.style.top = `${y}px`;
    updateDrillTargetGlow(x, y);
}

const DRILL_RECOGNITION_RADIUS = 58;

function updateDrillTargetGlow(x, y) {
    drillTargets.forEach(hole => {
        if (hole.classList.contains('drilled')) {
            hole.classList.remove('target-near');
            return;
        }

        const rect = hole.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(x - centerX, y - centerY);
        hole.classList.toggle('target-near', distance <= DRILL_RECOGNITION_RADIUS);
    });
}

drillPickupBtn.addEventListener('pointerdown', pickUpDrillChisel);
document.addEventListener('pointermove', e => moveDrillChisel(e.clientX, e.clientY));

// ============================================================
// === BAKE STAGE EVENT LISTENERS ===
// ============================================================

furnace.addEventListener('click', startBakingHold);
furnace.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') startBakingHold(e);
});

// ============================================================
// === DYNAMIC KEYFRAMES ===
// ============================================================

const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
    }
`;
document.head.appendChild(style);

// ============================================================
// === INIT ===
// ============================================================

apply(0);
startParallaxLoop();
posTooltip();
console.log('竹笛制作已就绪 — 视差择竹 → 汗青 → 开孔 → 试音');
