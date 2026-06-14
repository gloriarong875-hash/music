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

function playChiselSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
    const noise = audioCtx.createBufferSource();
    const bufferSize = audioCtx.sampleRate * 0.08;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.2;
    noise.buffer = buffer;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    noise.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start();
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
const circleBtn    = document.getElementById('circleBtn');
const circleTL     = document.getElementById('circleTooltip');
const circleTt     = document.getElementById('circleTtText');
const selectBadge  = document.getElementById('selectBadge');
const scrollHint   = document.getElementById('scrollHint');
const parallaxProgressFill = document.getElementById('parallaxProgressFill');
const stepDots     = document.querySelectorAll('.step-dot');
const stepIndicator = document.getElementById('stepIndicator');
const backBtn      = document.getElementById('backBtn');
const nextBtn      = document.getElementById('nextBtn');

const allLayers    = [L.xin, L.wai, L.zhi];
const BAMBOO_NAME  = { xin:'嫩竹 · 不宜', wai:'歪竹 · 弃用', zhi:'直竹 · 已选 ✓' };

// Design base 1440×900
const DW = 1440, DH = 900;

// Keyframes: walk-forward into forest
const KF = {
    // 新 1 — far bamboo, LEFT side. Appears in focus → zooms past → gone.
    xin: [
        { p:0,    x:  4, y: -5, w: 40, h: 88, o:1.0  },
        { p:0.25, x:-18, y:-20, w: 85, h:170, o:0.40 },
        { p:0.5,  x:-50, y:-45, w:150, h:300, o:0    },
    ],
    // 歪 — near bamboo, RIGHT side when selectable → zooms past right.
    wai: [
        { p:0,    x: 72, y: 12, w:  8, h: 16, o:0.08 },
        { p:0.5,  x: 60, y: -6, w: 34, h: 68, o:1.0  },
        { p:0.7,  x: 34, y:-20, w: 62, h:120, o:0.50 },
        { p:1.0,  x:-25, y:-40, w:120, h:230, o:0    },
    ],
    // 直 1 — mid bamboo, approaches from right, becomes final hero (centered).
    zhi: [
        { p:0,    x: 72, y:  8, w:  8, h: 16, o:0.05 },
        { p:0.5,  x: 40, y:  0, w: 20, h: 40, o:0.25 },
        { p:1.0,  x: 26, y: -6, w: 48, h: 94, o:1.0  },
    ],
    // White circle — follows the active bamboo
    circle: [
        { p:0,    x: 52, y: 58 },
        { p:0.5,  x: 58, y: 52 },
        { p:1.0,  x: 36, y: 54 },
    ],
};

function getTooltipText(p) {
    if (p < 0.25) return '应取3年以上的老竹，直径2-3公分';
    if (p < 0.65) return '剔除歪斜虫蛀之竹，择其笔直者';
    return '应取质地均匀、壁厚杆直、无虫蛀的竹材';
}

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

    const ci = lerpKF(KF.circle, p);
    circleBtn.style.transform = `translate(${ci.x}vw,${ci.y}vh)`;

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
                selectBadge.classList.remove('show');
                transitionToBake();
            } else {
                // Auto-select zhi and transition
                initAudio();
                scrollTarget = 1.0;
                lastInputTime = 0;
                startParallaxLoop();
                selected = 'zhi';
                L.zhi.classList.add('selected');
                selectBadge.textContent = BAMBOO_NAME['zhi'];
                selectBadge.classList.add('show');
                scrollHint.textContent = '良竹已择 · 进入汗青工序';
                scrollHint.classList.add('still');
                setTimeout(() => {
                    selectBadge.classList.remove('show');
                    transitionToBake();
                }, 900);
            }
            break;
        case 1:
            // From bake → advance to drill
            if (phase === 'done' || phase === 'drill') {
                showDrillStage();
            } else if (phase === 'clear' || phase === 'clearing') {
                finishClearing();
            } else if (phase === 'bake' && swipeCount >= TOTAL_SWIPES_NEEDED) {
                finishBaking();
            } else {
                // Force complete baking
                swipeCount = TOTAL_SWIPES_NEEDED;
                updateSwipeCounter();
                progressBar.style.width = '100%';
                finishBaking();
            }
            break;
        case 2:
            // From drill → advance to tone (complete remaining holes)
            if (drilledCount >= TOTAL_HOLES) {
                // Already done, just transition
                playCompleteSound();
                completeOverlay.querySelector('.complete-text').innerText = '七孔俱全';
                completeOverlay.querySelector('.complete-sub').innerText = '笛开孔完成，进入最后试音步骤';
                completeOverlay.classList.add('active');
                setNavStage(3);
                setTimeout(showToneStage, 1200);
            } else {
                // Auto-complete remaining holes
                holes.forEach(hole => {
                    if (!hole.classList.contains('drilled')) {
                        drillHole(hole);
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
            selectBadge.textContent = BAMBOO_NAME[type];
            selectBadge.classList.add('show');
            scrollHint.textContent = '良竹已择 · 进入汗青工序';
            scrollHint.classList.add('still');

            setTimeout(() => {
                selectBadge.classList.remove('show');
                transitionToBake();
            }, 900);
            return;
        }

        // Bad bamboo — give feedback
        initAudio();
        // Visual shake
        this.classList.add('bad-shake');
        // Store current transform to restore
        const savedTransform = this.style.transform;
        this.style.setProperty('--sx', '0px');
        this.style.setProperty('--sy', '0px');
        setTimeout(() => {
            this.classList.remove('bad-shake');
            this.style.transform = savedTransform;
        }, 400);

        // Show badge
        if (selected === type) {
            selected = null;
            this.classList.remove('selected');
            selectBadge.classList.remove('show');
        } else {
            allLayers.forEach(l=>l.classList.remove('selected'));
            selected = type;
            this.classList.add('selected');
            selectBadge.textContent = BAMBOO_NAME[type];
            selectBadge.classList.add('show');
            clearTimeout(this._t);
            this._t = setTimeout(() => selectBadge.classList.remove('show'), 2000);
        }

        // Update scroll hint
        if (type === 'xin') {
            scrollHint.textContent = '嫩竹不堪用 · 继续寻觅';
        } else if (type === 'wai') {
            scrollHint.textContent = '歪竹不可取 · 再择良材';
        }
    });
});

// Circle tooltip
function posTooltip() {
    const text = getTooltipText(scrollProgress);
    circleTt.textContent = text;
    const r = circleBtn.getBoundingClientRect();
    circleTL.style.left = (r.left + r.width/2) + 'px';
    circleTL.style.top  = (r.top - 22) + 'px';
    circleTL.style.transform = 'translate(-50%, -100%)';
}
circleBtn.addEventListener('mouseenter', () => { posTooltip(); circleTL.classList.add('visible'); });
circleBtn.addEventListener('mouseleave', () => circleTL.classList.remove('visible'));
circleBtn.addEventListener('mousemove', posTooltip);
window.addEventListener('resize', () => { if (parallaxActive) { apply(scrollProgress); posTooltip(); } });

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

    // Hide global bake/tone elements
    navDots.classList.remove('visible');
    bgLayer.style.display = 'none';
    fireGlow.style.display = 'none';

    // Show parallax stage
    parallaxStage.classList.remove('hidden');
    stepIndicator.style.opacity = '1';
    parallaxProgressFill.style.width = '0%';
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
    selectBadge.classList.remove('show');
    stepDots.forEach((d, i) => d.classList.toggle('active', i === 0));

    // Reset phase (in case we're coming back from bake)
    phase = 'bake';
    isDragging = false;
    swipeCount = 0;
    clearClicks = 0;
    bambooOffset = 0;

    // Apply initial state and restart loop
    apply(0);
    startParallaxLoop();
    posTooltip();
}

function transitionToBake() {
    currentNavStage = 1;
    parallaxActive = false;
    if (parallaxAnimId) {
        cancelAnimationFrame(parallaxAnimId);
        parallaxAnimId = null;
    }
    parallaxStage.classList.add('hidden');
    selectBadge.classList.remove('show');
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
const swipeHint = document.getElementById('swipe-hint');
const swipeCounter = document.getElementById('swipe-counter');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const steamEl = document.getElementById('steam');
const mainText = document.getElementById('main-text');
const subText = document.getElementById('sub-text');
const chiselTool = document.getElementById('chisel-tool');
const chiselHint = document.getElementById('chisel-hint');
const clearAnimation = document.getElementById('clear-animation');
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

function setNavStage(index) {
    navDotWrappers.forEach((dot, i) => {
        dot.classList.remove('active', 'completed');
        const circle = dot.querySelector('.dot');
        circle.classList.remove('active', 'completed');
        if (i < index) {
            dot.classList.add('completed');
            circle.classList.add('completed');
        } else if (i === index) {
            dot.classList.add('active');
            circle.classList.add('active');
        }
    });
}

function showBakeStage() {
    // Show global elements for bake stage
    navDots.classList.add('visible');
    bgLayer.style.display = 'block';
    fireGlow.style.display = 'block';
    fireGlow.style.opacity = '0.8';

    stageBake.classList.remove('hidden');
    stageBake.dataset.mode = 'bake';
    setNavStage(1);
    swipeHint.classList.remove('hidden');
    progressContainer.style.opacity = '0';
    swipeCounter.classList.remove('visible');
    bgLayer.style.transform = 'scale(1)';
    bambooOffset = 0;
    bambooPipe.style.setProperty('--bamboo-offset', '0px');
    bambooPipe.style.bottom = '80px';
    bambooPipe.style.left = '45%';
    bambooPipe.style.transform = 'translateX(-50%) translateY(0) scale(0.78)';
    mainText.innerText = '新竹砍下需要阴干2年以上';
    subText.innerText = '烘烤去湿可防止竹笛后期开裂';
    bambooPipe.classList.remove('baked', 'baking');
    clearClicks = 0;
    swipeCount = 0;
    updateSwipeCounter();
    progressBar.style.width = '0%';
    completeOverlay.classList.remove('active');
    chiselTool.classList.remove('active');
    chiselTool.style.display = 'flex';
    chiselHint.classList.remove('visible');
    chiselHint.style.display = 'block';
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
// === BAKE: Drag / Swipe logic ===
// ============================================================

function getY(e) {
    return e.touches ? e.touches[0].clientY : e.clientY;
}

let isDragging = false;
let lastY = 0;
let direction = 0;
let lastDirection = 0;
let swipeCount = 0;
const TOTAL_SWIPES_NEEDED = 3;
let phase = 'bake';
let clearClicks = 0;
const TOTAL_CLEAR_CLICKS = 3;
let bambooOffset = 0;
const MAX_BAMBOO_OFFSET = 28;
const MIN_BAMBOO_OFFSET = -28;

function handleStart(e) {
    if (phase !== 'bake') return;
    initAudio();
    isDragging = true;
    lastY = getY(e);
    direction = 0;
    lastDirection = 0;
    bambooPipe.classList.add('baking');
    steamEl.classList.add('active');
    progressContainer.style.opacity = '1';
    swipeCounter.classList.add('visible');
    bambooContainer.classList.add('grabbing');
}

function handleMove(e) {
    if (!isDragging || phase !== 'bake') return;
    e.preventDefault();
    const currentY = getY(e);
    const delta = currentY - lastY;
    if (Math.abs(delta) > 15) {
        const newDirection = delta > 0 ? 1 : -1;
        bambooOffset = Math.max(MIN_BAMBOO_OFFSET, Math.min(MAX_BAMBOO_OFFSET, bambooOffset + delta * 0.16));
        bambooPipe.style.setProperty('--bamboo-offset', `${bambooOffset}px`);
        if (lastDirection !== 0 && newDirection !== lastDirection) {
            swipeCount++;
            updateSwipeCounter();
            playBakeSound();
            const progress = Math.min((swipeCount / TOTAL_SWIPES_NEEDED) * 100, 100);
            progressBar.style.width = progress + '%';
            if (swipeCount === 1) {
                mainText.innerText = '竹管受热，水分开始蒸发';
            } else if (swipeCount === 2) {
                mainText.innerText = '色泽转深，竹质紧实';
            }
        }
        lastDirection = newDirection;
        lastY = currentY;
    }
    if (swipeCount >= TOTAL_SWIPES_NEEDED && phase === 'bake') {
        finishBaking();
    }
}

function handleEnd() {
    isDragging = false;
    bambooPipe.classList.remove('baking');
    steamEl.classList.remove('active');
    bambooContainer.classList.remove('grabbing');
}

function updateSwipeCounter() {
    for (let i = 1; i <= TOTAL_SWIPES_NEEDED; i++) {
        const dot = document.getElementById('dot-' + i);
        if (dot) dot.classList.toggle('active', i <= swipeCount);
    }
}

const furnace = document.querySelector('.furnace');

function finishBaking() {
    phase = 'clear';
    bambooPipe.classList.add('baked');
    swipeHint.classList.add('hidden');
    swipeCounter.style.opacity = '0';
    progressContainer.style.opacity = '0';
    furnace.classList.add('hidden');
    bambooPipe.style.left = '45%';
    bambooPipe.style.transform = 'translateX(-50%) translateY(0) scale(0.85) rotate(0deg)';
    bambooPipe.style.bottom = '25%';
    mainText.innerText = '烘烤完成，点击右侧凿子打通内节';
    subText.innerText = '通节修内是为了保证气流通畅，为开孔调音打下基础';
    chiselTool.classList.add('active');
    chiselHint.classList.add('visible');
    bambooPipe.style.animation = 'pulse 2s ease-in-out infinite';
}

function handleChiselClick(e) {
    if (phase !== 'clear' && phase !== 'clearing') return;
    e.preventDefault();
    e.stopPropagation();
    initAudio();
    phase = 'clearing';
    clearClicks++;
    chiselTool.classList.remove('clicking');
    void chiselTool.offsetWidth;
    chiselTool.classList.add('clicking');
    playChiselSound();
    bambooPipe.style.animation = 'shake 0.3s ease-in-out';
    setTimeout(() => {
        if (phase === 'clearing' || phase === 'clear') {
            bambooPipe.style.animation = 'pulse 2s ease-in-out infinite';
        }
    }, 300);
    const particles = clearAnimation.querySelectorAll('.clear-particle');
    particles.forEach((p, i) => {
        setTimeout(() => {
            p.style.animation = 'none';
            void p.offsetWidth;
            p.style.animation = 'clearBurst 0.5s ease-out forwards';
        }, i * 100);
    });
    clearAnimation.classList.add('active');
    setTimeout(() => clearAnimation.classList.remove('active'), 600);
    if (clearClicks === 1) {
        mainText.innerText = '凿子破节，竹屑纷飞';
    } else if (clearClicks === 2) {
        mainText.innerText = '内节渐通，气流将畅';
    }
    if (clearClicks >= TOTAL_CLEAR_CLICKS) {
        finishClearing();
    }
}

function finishClearing() {
    phase = 'done';
    chiselTool.classList.remove('active');
    chiselHint.classList.remove('visible');
    bambooPipe.style.animation = '';
    mainText.innerText = '内节已通，气流通畅';
    subText.innerText = '竹管内外壁已修整平滑';
    setTimeout(() => {
        playCompleteSound();
        completeOverlay.querySelector('.complete-text').innerText = '汗青完成';        completeOverlay.querySelector('.complete-sub').innerText = '准备进入第二步：开孔';
        completeOverlay.classList.add('active');
        setTimeout(() => {
            completeOverlay.classList.remove('active');
            showDrillStage();
        }, 1400);
    }, 400);
}

function showDrillStage() {
    phase = 'drill';
    currentNavStage = 2;
    stageBake.dataset.mode = 'drill';
    setNavStage(2);
    finalStage.classList.remove('visible');
    bambooPipe.style.left = '45%';
    bambooPipe.style.bottom = '60px';
    bambooPipe.style.transform = 'translateX(-50%) translateY(0) scale(0.85) rotate(0deg)';
    holesLayer.style.display = 'block';
    holesLayer.querySelectorAll('.hole').forEach(hole => {
        hole.classList.remove('drilled');
        hole.classList.add('ink-mark');
        hole.style.pointerEvents = 'none';
    });
    drilledCount = 0;
    drillChiselPickedUp = false;
    gongcheChars.innerHTML = '';
    gongchePanel.classList.remove('visible');
    scaleOverlay.classList.remove('visible');
    mainText.innerText = '开孔工序开始';
    subText.innerText = '点击白色按钮拿起凿子，再点击墨线标记开孔';
    completeOverlay.classList.remove('active');
    chiselTool.style.display = 'none';
    chiselHint.style.display = 'none';
    scaleOverlay.style.display = 'none';
    progressContainer.style.opacity = '0';
    progressBar.style.width = '0%';
    // 步骤3打孔阶段隐藏炉子
    furnace.classList.add('hidden');
    // 显示凿子拾取按钮（统一白色圆钮）
    drillPickupBtn.classList.add('visible');
    drillPickupBtn.classList.remove('picked-up');
    drillPickupHint.classList.add('visible');
    drillChiselImg.classList.add('visible');
    drillChiselImg.classList.remove('picked-up');
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

function drillHole(hole) {
    if (phase !== 'drill' || hole.classList.contains('drilled')) return;
    if (!drillChiselPickedUp) return;
    initAudio();
    playDrillSound();
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
    mainText.innerText = `已开${name}，对应工尺谱「${note}」，${tone}音`;
    const remaining = TOTAL_HOLES - drilledCount;
    subText.innerText = remaining > 0 ? `还差 ${remaining} 个孔位` : '七孔俱全，上应七星';
    if (drilledCount >= TOTAL_HOLES) {
        // 隐藏凿子拾取UI
        drillPickupBtn.classList.remove('visible', 'picked-up');
        drillPickupHint.classList.remove('visible');
        drillChiselImg.classList.remove('visible', 'picked-up');
        setTimeout(() => {
            playCompleteSound();
            completeOverlay.querySelector('.complete-text').innerText = '七孔俱全';
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
    finalMembraneStage.classList.remove('hidden');
    finalPlayStage.classList.remove('visible');
    finalEndButtons.classList.remove('visible');
    finalMainText.innerText = '笛膜为魂，采芦苇内膜，薄如蝉翼，透似轻纱';
    finalSubText.innerText = '请选择膜材，贴于膜孔之上';
    completeOverlay.classList.remove('active');
    progressContainer.style.opacity = '0';
    progressBar.style.width = '0%';
    chiselTool.style.display = 'none';
    chiselHint.style.display = 'none';
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

    // Hide final stage, show bake stage (which hosts drill UI)
    finalStage.classList.remove('visible');
    stageBake.classList.remove('hidden');

    // Show global elements
    navDots.classList.add('visible');
    bgLayer.style.display = 'block';
    fireGlow.style.display = 'block';
    setNavStage(2);

    // Set bamboo to baked, centered position
    bambooPipe.classList.add('baked');
    bambooPipe.style.transform = 'translateX(-50%) translateY(0) scale(0.85) rotate(0deg)';
    bambooPipe.style.bottom = '25%';
    bambooPipe.style.animation = '';

    // Hide bake-specific elements
    furnace.classList.add('hidden');
    furnace.style.transform = '';
    swipeHint.classList.add('hidden');
    swipeCounter.classList.remove('visible');
    progressContainer.style.opacity = '0';
    progressBar.style.width = '0%';
    chiselTool.style.display = 'none';
    chiselHint.style.display = 'none';
    completeOverlay.classList.remove('active');

    // Show drill UI
    holesLayer.style.display = 'block';
    holesLayer.querySelectorAll('.hole').forEach(hole => {
        hole.classList.remove('drilled');
        hole.classList.add('ink-mark');
        hole.style.pointerEvents = 'none';
    });
    drilledCount = 0;
    drillChiselPickedUp = false;
    gongcheChars.innerHTML = '';
    gongchePanel.classList.remove('visible');
    scaleOverlay.classList.remove('visible');
    scaleOverlay.style.display = 'none';

    mainText.innerText = '开孔工序开始';
    subText.innerText = '点击白色按钮拿起凿子，再点击墨线标记开孔';

    // 显示凿子拾取按钮（统一白色圆钮）
    drillPickupBtn.classList.add('visible');
    drillPickupBtn.classList.remove('picked-up');
    drillPickupHint.classList.add('visible');
    drillChiselImg.classList.add('visible');
    drillChiselImg.classList.remove('picked-up');

    // Reset final stage internal state
    finalMembraneStage.classList.remove('hidden');
    finalPlayStage.classList.remove('visible');
    finalEndButtons.classList.remove('visible');
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

const membraneTypes = {
    reed:   { name: '芦苇膜', brightness: 1.3, harmonic: [1, 0.6, 0.4, 0.2, 0.1], attack: 0.02, decay: 0.8 },
    bamboo: { name: '竹膜',   brightness: 1.0, harmonic: [1, 0.5, 0.3, 0.15, 0.08], attack: 0.03, decay: 1.0 },
    paper:  { name: '纸膜',   brightness: 0.7, harmonic: [1, 0.4, 0.5, 0.3, 0.2], attack: 0.05, decay: 1.2 }
};

let currentMembrane = null;
let selectedMembrane = null;

const noteFingerings = {
    '1': { freq: 293.66, name: '低音5', holes: [true, true, true, false, false, false] },
    '2': { freq: 329.63, name: '低音6', holes: [true, true, false, false, false, false] },
    '3': { freq: 369.99, name: '低音7', holes: [true, false, false, false, false, false] },
    '4': { freq: 392.00, name: '中音1', holes: [false, true, true, false, false, false] },
    '5': { freq: 440.00, name: '中音2', holes: [true, true, true, true, true, true] },
    '6': { freq: 493.88, name: '中音3', holes: [true, true, true, true, true, false] },
    '7': { freq: 523.25, name: '中音4', holes: [true, true, true, true, false, false] }
};

const noteChars = {
    '1': '5',
    '2': '6',
    '3': '7',
    '4': '1',
    '5': '2',
    '6': '3',
    '7': '4'
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
const finalEndButtons = document.getElementById('final-end-buttons');
const finalRestartBtn = document.getElementById('final-restart-btn');
const finalArrowBtn = document.getElementById('final-arrow-btn');
const finalMainText = document.getElementById('final-main-text');
const finalSubText = document.getElementById('final-sub-text');

let finalPlayCount = 0;
const PLAY_TO_END = 5;

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
        finalSubText.innerText = '点击确认贴膜，进入试音';
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
        finalSubText.innerText = '按键盘数字键 1-7 吹奏音阶（筒音作5）';
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

function playFluteNote(key) {
    const note = noteFingerings[key];
    if (!note || !currentMembrane) return;

    initAudio();
    const params = membraneTypes[currentMembrane];
    const baseFreq = note.freq * params.brightness;

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

    finalNoteChar.textContent = noteChars[key];
    finalNoteName.textContent = note.name;
    finalNoteDisplay.classList.add('visible');

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

    document.getElementById('final-hole-1').classList.add('active');
    document.getElementById('final-hole-2').classList.add('active');
    const activeHoles = note.holes.map((closed, i) => closed ? finalHoleElements[i] : null).filter(Boolean);
    if (activeHoles.length > 0) {
        const centerHole = activeHoles[Math.floor(activeHoles.length / 2)];
        createFinalSoundWave(centerHole);
    }

    finalMainText.innerText = `吹奏「${note.name}」，指法已示于孔位`;
    finalPlayCount++;
    if (finalPlayCount >= PLAY_TO_END && !finalEndButtons.classList.contains('visible')) {
        finalEndButtons.classList.add('visible');
        finalSubText.innerText = '五音已备，可再次体验或向下浏览';
    }

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

finalRestartBtn.addEventListener('click', () => {
    location.reload();
});

finalArrowBtn.addEventListener('click', () => {
    window.location.href = '../../index.html?instrument=%E7%AC%9B';
});

// ============================================================
// === DRILL HOLES (stage 3) ===
// ============================================================

const holes = holesLayer.querySelectorAll('.hole');
const TOTAL_HOLES = 8;
let drilledCount = 0;

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

// Drill pickup button — click to pick up chisel, then click holes to drill
drillPickupBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (phase !== 'drill' || drillChiselPickedUp) return;
    initAudio();
    drillChiselPickedUp = true;
    drillPickupBtn.classList.add('picked-up');
    drillPickupHint.classList.remove('visible');
    drillChiselImg.classList.add('picked-up');
    // Enable hole clicks
    holesLayer.querySelectorAll('.hole').forEach(hole => {
        hole.style.pointerEvents = 'all';
    });
    mainText.innerText = '凿子已在手，点击墨线标记开孔';
    subText.innerText = '逐一击打竹管上的标记孔位';
});
drillPickupBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (phase !== 'drill' || drillChiselPickedUp) return;
    initAudio();
    drillChiselPickedUp = true;
    drillPickupBtn.classList.add('picked-up');
    drillPickupHint.classList.remove('visible');
    drillChiselImg.classList.add('picked-up');
    holesLayer.querySelectorAll('.hole').forEach(hole => {
        hole.style.pointerEvents = 'all';
    });
    mainText.innerText = '凿子已在手，点击墨线标记开孔';
    subText.innerText = '逐一击打竹管上的标记孔位';
});

// ============================================================
// === BAKE STAGE EVENT LISTENERS ===
// ============================================================

stageBake.addEventListener('mousedown', handleStart);
stageBake.addEventListener('mousemove', handleMove);
stageBake.addEventListener('mouseup', handleEnd);
stageBake.addEventListener('mouseleave', handleEnd);
stageBake.addEventListener('touchstart', handleStart, { passive: false });
stageBake.addEventListener('touchmove', handleMove, { passive: false });
stageBake.addEventListener('touchend', handleEnd);

chiselTool.addEventListener('click', handleChiselClick);
chiselTool.addEventListener('touchend', function(e) {
    e.preventDefault();
    handleChiselClick(e);
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
