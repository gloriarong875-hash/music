// ═══════════════════════════════════════════
//  FRAMES DATA — 8 storyboard frames from .pen
//  步骤一、二内部通过滚轮实现图像连续放大
//  步骤二髹漆→髹漆完成切换点两图位置/尺寸对齐 (1411×985)
//  Positions in design px (1440x900 canvas)
// ═══════════════════════════════════════════
const F = [
  { // 0: 步骤一 制胚开始 → 滚轮放大至开槽
    img:'琴部件assets/步骤1-制胚.png',
    ix:272,iy:161,iw:896,ih:578,        // Keyframe A (zoom=0)
    ix2:-366,iy2:-305,iw2:1325,ih2:855, // Keyframe B (zoom=1)
    txt:'', txt2:'开槽决定了古琴最终的音色',
    tx:848,ty:311, tsize:32,tcolor:'#3b4942',
    overlay:null, tilted:null,
    stage:0, sdone:[0,0,0,0],
    zoom:true,
    extra:null
  },
  { // 1: 步骤二 裱布 → 髹漆一层 (滚轮放大，同图)
    img:'琴部件assets/步骤2-髹漆.png',
    ix:257,iy:138,iw:894,ih:624,         // Keyframe A: 裱布
    ix2:-112,iy2:-311,iw2:1411,ih2:985,  // Keyframe B: 髹漆一层
    txt:'', txt2:'麻布裹琴，加上含鹿角粉末的漆料',
    tx:805,ty:674, tsize:32,tcolor:'#3b4942',
    overlay:null, tilted:null,
    stage:1, sdone:[1,0,0,0],
    zoom:true,
    extra:null
  },
  { // 2: 步骤二 髹漆一层 (缩放终点，切换前最后一帧)
    img:'琴部件assets/步骤2-髹漆.png',
    ix:-112,iy:-311,iw:1411,ih:985,      // 与帧3同位置，保证切换无缝
    txt:'麻布裹琴，加上含鹿角粉末的漆料', tx:805,ty:674, tsize:32,tcolor:'#3b4942',
    overlay:null, tilted:null,
    stage:1, sdone:[1,0,0,0],
    extra:null
  },
  { // 3: 步骤二 髹漆完成 (图像切换：髹漆→髹漆完成，位置/尺寸与帧2对齐)
    img:'琴部件assets/步骤2-髹漆完成.png',
    ix:-112,iy:-390,iw:1411,ih:985,      // 与帧2完全对齐，无缝切换
    txt:'混合多种矿石的不同漆料多次髹涂打磨，琴面如镜，音韵愈沉',
    tx:116,ty:654, tsize:32,tcolor:'#3b4942',
    overlay:null, tilted:null,
    stage:1, sdone:[1,0,0,0],
    extra:null
  },
  { // 4: 步骤三 选弦介绍
    img:'琴部件assets/步骤3-选弦.png', ix:254,iy:252,iw:1089,ih:555,
    txt:'', tx:0,ty:0, tsize:32,tcolor:'#3b4942',
    overlay:null, tilted:null,
    stage:2, sdone:[1,1,0,0],
    extra:null
  },
  { // 5: 步骤三 选弦交互 [LOCK]
    img:'琴部件assets/步骤3-选弦.png', ix:-480,iy:239,iw:3113,ih:1588,
    overlay:null, tilted:null,
    stage:2, sdone:[1,1,0,0],
    lock:true,
    strings:[
      {t:'steel', content:'钢弦', x:325,y:281,fs:42,color:'#766541',shadow:true},
      {t:'silk', content:'丝弦', x:455,y:258,fs:32,color:'#647e6d'},
      {t:'nylon',content:'钢丝尼龙弦',x:509,y:203,fs:32,color:'#647e6d'}
    ],
    extra:[
      {src:'琴部件assets/步骤3b-选弦备选.png', x:124,y:225, w:1218,h:610, op:0.5},
      {src:'琴部件assets/步骤3b-选弦备选.png', x:20,y:252, w:1227,h:621, op:0.5}
    ]
  },
  { // 6: 步骤四 上弦
    img:'琴部件assets/步骤4-调音上弦.png', ix:252,iy:132,iw:569,ih:636,
    txt:'', tx:0,ty:0, tsize:32,tcolor:'#3b4942',
    overlay:null, tilted:null,
    stage:3, sdone:[1,1,1,0],
    extra:null
  },
  { // 7: 步骤四 调音完成
    img:'琴部件assets/步骤4-调音上弦.png', ix:21,iy:-276,iw:1053,ih:1176,
    overlay:null, tilted:null,
    stage:3, sdone:[1,1,1,1],
    extra:null,
    final:true
  }
];
const N = F.length; // 8

// ═══════════════════════════════════════════
//  DOM REFS
// ═══════════════════════════════════════════
const canvas = document.getElementById('canvas');
const imgA = document.getElementById('img-a');
const imgB = document.getElementById('img-b');
const imgEx = [0,1,2].map(i=>document.getElementById('img-ex'+i));
const txtA = document.getElementById('text-a');
const txtB = document.getElementById('text-b');
const overlayR = document.getElementById('overlay-rect');
const tiltedR = document.getElementById('tilted-rect');
const stringP = document.getElementById('string-panel');
const stringOpts = stringP.querySelectorAll('.string-opt');
const stringDescription = document.getElementById('string-description');
const scrollHint = document.getElementById('scroll-hint') || { textContent:'', classList:{add(){},remove(){},contains(){return false;}}, style:{} };
const topProgress = document.getElementById('top-progress');
const completeO = document.getElementById('complete-overlay');
const stageNames = ['制胚','髹漆','选弦','上弦'];
const STAGE_STARTS = stageNames.map((_,stage)=>F.findIndex(frame=>frame.stage===stage));

// ── nav-dots (统一使用 generalprocess.css) ──
const navDotWrappers = document.querySelectorAll('.dot-wrapper');
const navDots = document.getElementById('navDots');

// ═══════════════════════════════════════════
//  AUDIO
// ═══════════════════════════════════════════
const AC = window.AudioContext||window.webkitAudioContext;
let actx=null;
function au(){ if(!actx)actx=new AC(); if(actx.state==='suspended')actx.resume(); }
function tone(f,t='sine',d=0.5,v=0.1){
    if(!actx)return;
    const o=actx.createOscillator(),g=actx.createGain();
    o.type=t; o.frequency.value=f;
    const n=actx.currentTime;
    g.gain.setValueAtTime(v,n);
    g.gain.exponentialRampToValueAtTime(0.001,n+d);
    o.connect(g);g.connect(actx.destination);
    o.start(n);o.stop(n+d);
}
function ding(){ tone(660,'sine',0.2,0.08); }
function chime(){ [261.63,329.63,392,523.25].forEach((f,i)=>setTimeout(()=>tone(f,'sine',0.7,0.1),i*160)); }

// ═══════════════════════════════════════════════════════════
//  SCROLL ENGINE — 滚动引擎
// ═══════════════════════════════════════════════════════════

const SENS       = 0.0002;
const TOUCH_SENS = 0.00035;
const KEY_STEP   = 0.143;  // 1/7 ≈ 每个分镜 (8帧→7段)
const SMOOTH     = 0.12;
const SNAP_IDLE  = 400;

let scrollT=0, scrollP=0, lastInput=0, animId=null;
let isLocked=false, stringPicked=null;
let stringHover=null;
let lockP=0;
const LOCK_IDX=5; // 选弦交互帧 (0-based index)

// ── 鼠标滚轮 ──
function onWheel(e){
    e.preventDefault();
    if(isLocked&&!stringPicked) return;
    scrollT+=e.deltaY*SENS;
    scrollT=Math.max(0,Math.min(1,scrollT));
    lastInput=performance.now();
    startLoop();
}
window.addEventListener('wheel',onWheel,{passive:false});

// ── 触摸滑动 ──
let touchStartY=0;
canvas.addEventListener('touchstart',e=>{
    if(isLocked&&!stringPicked) return;
    touchStartY=e.touches[0].clientY;
});
canvas.addEventListener('touchmove',e=>{
    if(isLocked&&!stringPicked) return;
    e.preventDefault();
    const dy=touchStartY-e.touches[0].clientY;
    touchStartY=e.touches[0].clientY;
    scrollT+=dy*TOUCH_SENS;
    scrollT=Math.max(0,Math.min(1,scrollT));
    lastInput=performance.now();
    startLoop();
},{passive:false});

// ── 键盘导航 ──
document.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'||e.key==='ArrowDown'){
        e.preventDefault();
        if(isLocked&&!stringPicked) return;
        scrollT=Math.min(1,scrollT+KEY_STEP);
        lastInput=performance.now();
        startLoop();
    }else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){
        e.preventDefault();
        if(isLocked&&!stringPicked){
            isLocked=false;
            stringP.classList.remove('visible');
            scrollHint.classList.add('still');
            scrollHint.textContent='↓ 滚轮浏览制作过程';
        }
        scrollT=Math.max(0,scrollT-KEY_STEP);
        lastInput=performance.now();
        startLoop();
    }
});

// Step dot click navigation (unified nav-dots)
navDotWrappers.forEach((wrapper,i)=>{
    wrapper.addEventListener('click',()=>{
        if(i===3&&!stringPicked) return;
        goToStage(i);
    });
});

function getStageAt(p){
    return F[getFrameIdx(p).idx].stage;
}

function leaveStringLock(){
    isLocked=false;
    stringP.classList.remove('visible');
    scrollHint.classList.add('still');
    scrollHint.textContent='↓ 滚轮浏览制作过程';
}

function goToStage(stage){
    const safeStage=Math.max(0,Math.min(stageNames.length-1,stage));
    if(safeStage===3&&!stringPicked) return;
    if(safeStage<3) resetCompletion();
    if(safeStage===2&&getStageAt(scrollP)>2) resetStringSelection();
    if(isLocked&&safeStage!==2) leaveStringLock();
    const p=STAGE_STARTS[safeStage]/(N-1);
    scrollT=p;
    scrollP=p;
    lastInput=performance.now();
    applyVisuals(p);
    startLoop();
}

function startLoop(){
    if(animId) return;
    loop();
}

function loop(){
    const idle=performance.now()-lastInput;
    let eff=scrollT;
    if(idle>SNAP_IDLE){
        const near=Math.round(scrollP*(N-1))/(N-1);
        eff=near;
    }
    scrollP+=(eff-scrollP)*SMOOTH;
    scrollP=Math.max(0,Math.min(1,scrollP));

    if(isLocked&&!stringPicked){
        scrollP=Math.min(lockP,scrollP);
        scrollP=Math.max(F[LOCK_IDX].p_start||(LOCK_IDX/(N-1)),scrollP);
    }

    checkLock();
    applyVisuals(scrollP);
    topProgress.style.width=(scrollP*100)+'%';

    if(scrollP<0.95&&completed) resetCompletion();

    if(scrollP>0.99&&stringPicked) showCompletion();

    const diff=Math.abs(eff-scrollP);
    if(diff>0.0005||scrollP<1){
        animId=requestAnimationFrame(loop);
    }else{
        animId=null;
        if(scrollP>=1) showCompletion();
    }
}

// ═══════════════════════════════════════════
//  LOCK LOGIC
// ═══════════════════════════════════════════

function getFrameIdx(p){
    const raw=p*(N-1);
    return {idx:Math.min(N-1,Math.max(0,Math.floor(raw))), frac:raw-Math.floor(raw)};
}

function checkLock(){
    const {idx}=getFrameIdx(scrollP);
    if(idx===LOCK_IDX&&!stringPicked){
        if(!isLocked){
            isLocked=true;
            lockP=LOCK_IDX/(N-1);
            scrollP=lockP;
            scrollT=lockP;
            stringP.classList.add('visible');
            scrollHint.textContent='点击选择琴弦类型';
            scrollHint.classList.remove('still');
        }
    }
    if(isLocked&&stringPicked&&idx!==LOCK_IDX){
        stringP.classList.remove('visible');
        scrollHint.classList.add('still');
        scrollHint.textContent='↓ 滚轮浏览制作过程';
    }
}

// ═══════════════════════════════════════════
//  STRING SELECTION
// ═══════════════════════════════════════════
const STRING_DETAILS={
    steel:'钢弦音色清亮、余韵悠长，张力稳定，适合表现明快而通透的琴声。',
    silk:'丝弦触感柔和，音色温润古朴，细微的吟猱变化最具传统韵味。',
    nylon:'钢丝尼龙弦兼具稳定与柔韧，音色圆润饱满，也更易于日常维护。'
};

function setStringFocus(type){
    stringHover=type;
    stringOpts.forEach(opt=>opt.classList.toggle('hovered',opt.dataset.type===type));
    if(type){
        stringDescription.textContent=STRING_DETAILS[type];
        stringDescription.classList.add('visible');
    }else if(!stringPicked){
        stringDescription.classList.remove('visible');
    }
    applyStringHighlight();
}

function applyStringHighlight(){
    const active=stringHover||stringPicked;
    imgA.style.filter=!active?'none':active==='steel'?'brightness(1.12) saturate(1.06)':'brightness(0.72) saturate(0.78)';
    imgEx.forEach((el,i)=>{
        const type=i===0?'nylon':'silk';
        el.style.filter=active===type?'brightness(1.45) saturate(1.22) drop-shadow(0 0 10px rgba(255,214,130,0.55))':'brightness(0.82) saturate(0.8)';
    });
}

function resetStringSelection(){
    stringPicked=null;
    stringHover=null;
    isLocked=false;
    stringP.classList.remove('visible');
    stringDescription.classList.remove('visible');
    stringOpts.forEach(opt=>{
        opt.classList.remove('selected','hovered');
        opt.setAttribute('aria-pressed','false');
    });
    imgA.style.filter='none';
    imgEx.forEach(el=>{ el.style.filter='none'; });
}

stringOpts.forEach(opt=>{
    opt.addEventListener('mouseenter',()=>setStringFocus(opt.dataset.type));
    opt.addEventListener('focus',()=>setStringFocus(opt.dataset.type));
    opt.addEventListener('mouseleave',()=>setStringFocus(stringPicked));
    opt.addEventListener('blur',()=>setStringFocus(stringPicked));
    opt.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){
            e.preventDefault();
            opt.click();
        }
    });
    opt.addEventListener('click',()=>{
        if(stringPicked) return;
        au(); ding();
        stringPicked=opt.dataset.type;
        setStringFocus(stringPicked);
        opt.classList.add('selected');
        opt.setAttribute('aria-pressed','true');
        scrollHint.textContent=stringPicked==='steel'?'已选钢弦 · 清亮悠长':stringPicked==='silk'?'已选丝弦 · 温润古朴':'已选钢丝尼龙弦 · 刚柔并济';
        scrollHint.classList.add('still');
        setTimeout(()=>{
            leaveStringLock();
            goToStage(3);
            chime();
        },1200);
    });
});

// ═══════════════════════════════════════════════════════════
//  VISUAL RENDER — apply(p)
//  步骤一（制胚）内部通过滚轮实现图像连续放大 (zoom transition)
//  其他步骤间使用交叉淡入淡出 (crossfade)
// ═══════════════════════════════════════════════════════════

const TRANS=0.12;

let lastA=-1, lastB=-1;

function pxToVW(v){ return (v/1440)*100; }
function pxToVH(v){ return (v/900)*100; }

function lerp(a,b,t){ return a+(b-a)*t; }
function easeInOut(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }

function setImgTween(el,from,to,t){
    setImgPos(el,{
        ix:lerp(from.ix,to.ix,t), iy:lerp(from.iy,to.iy,t),
        iw:lerp(from.iw,to.iw,t), ih:lerp(from.ih,to.ih,t)
    });
}

function setImgPos(el, frm, zoomT){
    let ix, iy, iw, ih;
    if(frm.zoom && zoomT!==undefined){
        // Interpolate between keyframe A and B
        const t = zoomT;
        ix = lerp(frm.ix, frm.ix2||frm.ix, t);
        iy = lerp(frm.iy, frm.iy2||frm.iy, t);
        iw = lerp(frm.iw, frm.iw2||frm.iw, t);
        ih = lerp(frm.ih, frm.ih2||frm.ih, t);
    } else {
        ix = frm.ix; iy = frm.iy; iw = frm.iw; ih = frm.ih;
    }
    const cx=pxToVW(ix+iw/2);
    const cy=pxToVH(iy+ih/2);
    const sw=pxToVW(iw);
    const sh=pxToVH(ih);
    el.style.left='50%';
    el.style.top='50%';
    el.style.transform=`translate(-50%,-50%) translate(${cx-50}vw,${cy-50}vh)`;
    el.style.width=sw+'vw';
    el.style.height=sh+'vh';
}

function applyVisuals(p){
    const {idx,frac}=getFrameIdx(p);
    let cur=idx, nxt=idx;
    let t=0;
    let zoomT=0; // step 1 internal zoom progress (0..1)

    const fullCrossfade=idx===2;
    const sameImageMove=idx<N-1&&F[idx].img===F[idx+1].img&&!F[idx].zoom;
    if((fullCrossfade||sameImageMove)&&idx<N-1){
        nxt=idx+1;
        t=easeInOut(frac);
    }else if(frac>1-TRANS&&idx<N-1){
        nxt=idx+1;
        t=(frac-(1-TRANS))/TRANS;
        t=Math.max(0,Math.min(1,t));
        t=easeInOut(t);
    }

    const cf=F[cur], nf=nxt!==cur?F[nxt]:null;

    // Zoom mode: when current frame has zoom flag, interpolate within its range
    const isZoomFrame = cf.zoom;
    if(isZoomFrame){
        const frameStart = cur/(N-1);
        const frameEnd = (cur+1)/(N-1);
        const frameRange = frameEnd - frameStart;
        zoomT = frameRange > 0 ? Math.max(0, Math.min(1, (p - frameStart) / frameRange)) : 0;
    }
    // ── Background painting pan L→R with scroll ──
    const bgPaint=document.getElementById('bg-painting');
    if(bgPaint) bgPaint.style.backgroundPositionX=(p*100)+'%';

    // ── Images ──
    if(isZoomFrame){
        // Zoom mode: single image lerps position/size
        if(cur!==lastA){
            imgA.src=cf.img;
            lastA=cur;
        }
        setImgPos(imgA, cf, zoomT);
        imgA.style.opacity='1';
        imgB.style.opacity='0';
    } else if(sameImageMove&&nf){
        if(cur!==lastA){
            imgA.src=cf.img;
            lastA=cur;
        }
        setImgTween(imgA,cf,nf,t);
        imgA.style.opacity='1';
        imgB.style.opacity='0';
    } else if(cur!==lastA||(nf&&nxt!==lastB)){
        if(cur!==lastA){
            imgA.src=cf.img;
            setImgPos(imgA,cf);
            imgA.style.opacity=nf?'1':'1';
            lastA=cur;
        }
        if(nf&&nxt!==lastB){
            imgB.src=nf.img;
            setImgPos(imgB,nf);
            imgB.style.opacity='0';
            lastB=nxt;
        }
    }

    if(!isZoomFrame&&!sameImageMove){
        if(nf){
            imgA.style.zIndex='1';
            imgB.style.zIndex='2';
            imgA.style.opacity=(1-t).toFixed(3);
            imgB.style.opacity=t.toFixed(3);
        }else{
            imgA.style.zIndex='1';
            imgB.style.zIndex='0';
            imgA.style.opacity='1';
            imgB.style.opacity='0';
        }
    }

    // ── Extra image layers (frame 6: string selection) ──
    imgEx.forEach(el=>{ el.style.opacity='0'; });
    const extras=cf.extra||(nf&&nf.extra?nf.extra:null);
    const extraFade=cf.extra?(nf&&nf.stage!==2?1-t:1):(nf&&nf.extra?t:0);
    if(extras){
        extras.forEach((ex,i)=>{
            if(imgEx[i]){
                imgEx[i].src=ex.src;
                const cx=pxToVW(ex.x+ex.w/2), cy=pxToVH(ex.y+ex.h/2);
                imgEx[i].style.left='50%'; imgEx[i].style.top='50%';
                imgEx[i].style.transform=`translate(-50%,-50%) translate(${cx-50}vw,${cy-50}vh)`;
                imgEx[i].style.width=pxToVW(ex.w)+'vw';
                imgEx[i].style.height=pxToVH(ex.h)+'vh';
                const type=i===0?'nylon':'silk';
                const active=stringHover||stringPicked;
                const emphasis=active?(active===type?1:0.2):0.52;
                imgEx[i].style.opacity=(ex.op*extraFade*emphasis).toFixed(3);
            }
        });
    }
    if(cf.stage===2||nf&&nf.stage===2) applyStringHighlight();
    else {
        imgA.style.filter='none';
        imgEx.forEach(el=>{
            el.style.opacity='0';
            el.style.filter='none';
        });
    }

    // ── Overlay rect (暗色遮罩) ──
    const orFade=(cf.overlay?1-t:0)+(nf&&nf.overlay?t:0);
    overlayR.style.opacity=orFade.toFixed(3);
    if(cf.overlay&&orFade>0){
        overlayR.style.left=pxToVW(cf.overlay.x)+'vw';
        overlayR.style.top=pxToVH(cf.overlay.y)+'vh';
        overlayR.style.width=pxToVW(cf.overlay.w)+'vw';
        overlayR.style.height=pxToVH(cf.overlay.h)+'vh';
        overlayR.style.background=cf.overlay.fill;
    }

    // ── Tilted rect ──
    const trFade=(cf.tilted?1-t:0)+(nf&&nf.tilted?t:0);
    tiltedR.style.opacity=(trFade*(cf.tilted?cf.tilted.opacity:0.1)).toFixed(3);
    if(cf.tilted&&trFade>0){
        tiltedR.style.left=pxToVW(cf.tilted.x)+'vw';
        tiltedR.style.top=pxToVH(cf.tilted.y)+'vh';
        tiltedR.style.width=pxToVW(cf.tilted.w)+'vw';
        tiltedR.style.height=pxToVH(cf.tilted.h)+'vh';
        tiltedR.style.transform=`rotate(${cf.tilted.rot}deg)`;
    }

    // ── Text (场景主文案，双通道交叉淡入淡出) ──
    if(isZoomFrame){
        // Zoom mode: text "开槽决定了古琴最终的音色" fades in at zoomT > 0.5
        const showText2 = zoomT > 0.5;
        if(cf.txt2 && showText2){
            txtA.textContent = cf.txt2;
            txtA.style.left=pxToVW(cf.tx)+'vw'; txtA.style.top=pxToVH(cf.ty)+'vh';
            txtA.style.fontSize=pxToVW(cf.tsize*0.7)+'vw';
            txtA.style.color=cf.tcolor;
            txtA.style.opacity=Math.min(1, (zoomT-0.5)*2).toFixed(3);
            txtB.style.opacity='0';
        } else {
            txtA.style.opacity='0';
            txtB.style.opacity='0';
        }
    } else {
        const ct=cf.txt||''; const nt=nf?nf.txt||'':'';
        if(ct&&!nt){
            txtA.textContent=ct;
            txtA.style.left=pxToVW(cf.tx)+'vw'; txtA.style.top=pxToVH(cf.ty)+'vh';
            txtA.style.fontSize=pxToVW(cf.tsize*0.7)+'vw';
            txtA.style.color=cf.tcolor;
            txtA.style.opacity=(1-t).toFixed(3);
            txtB.style.opacity='0';
        }else if(nt&&!ct){
            txtB.textContent=nt;
            txtB.style.left=pxToVW(nf.tx)+'vw'; txtB.style.top=pxToVH(nf.ty)+'vh';
            txtB.style.fontSize=pxToVW(nf.tsize*0.7)+'vw';
            txtB.style.color=nf.tcolor;
            txtA.style.opacity='0';
            txtB.style.opacity=t.toFixed(3);
        }else if(ct&&nt&&ct!==nt){
            txtA.textContent=ct;
            txtA.style.left=pxToVW(cf.tx)+'vw'; txtA.style.top=pxToVH(cf.ty)+'vh';
            txtA.style.fontSize=pxToVW(cf.tsize*0.7)+'vw';
            txtA.style.color=cf.tcolor;
            txtA.style.opacity=(1-t).toFixed(3);
            txtB.textContent=nt;
            txtB.style.left=pxToVW(nf.tx)+'vw'; txtB.style.top=pxToVH(nf.ty)+'vh';
            txtB.style.fontSize=pxToVW(nf.tsize*0.7)+'vw';
            txtB.style.color=nf.tcolor;
            txtB.style.opacity=t.toFixed(3);
        }else if(ct){
            txtA.textContent=ct;
            txtA.style.left=pxToVW(cf.tx)+'vw'; txtA.style.top=pxToVH(cf.ty)+'vh';
            txtA.style.fontSize=pxToVW(cf.tsize*0.7)+'vw';
            txtA.style.color=cf.tcolor;
            txtA.style.opacity='1';
            txtB.style.opacity='0';
        }else{
            txtA.style.opacity='0'; txtB.style.opacity='0';
        }
    }

    // ── String options position ──
    if(cf.strings){
        stringP.style.left=pxToVW(415)+'vw';
        stringP.style.top=pxToVH(323)+'vh';
        stringP.style.width=pxToVW(250)+'vw';
        stringP.style.height=pxToVH(120)+'vh';
        cf.strings.forEach((s,i)=>{
            const el=stringOpts[i];
            if(!el) return;
            el.style.position='absolute';
            el.style.left=pxToVW(s.x-275)+'vw';
            el.style.top=pxToVH(s.y-243)+'vh';
            el.textContent=s.content;
            el.className='string-opt '+s.t;
            el.setAttribute('aria-pressed',stringPicked===s.t?'true':'false');
            if(stringHover===s.t) el.classList.add('hovered');
            if(stringPicked&&s.t===stringPicked) el.classList.add('selected');
        });
    }

    // ── Update nav dots (unified .nav-dots) ──
    updateNavDots(cf);

    // ── Scroll hint ──
    if(!isLocked&&!stringPicked){
        const sn=stageNames[cf.stage];
        const snNext=cf.stage<3?stageNames[cf.stage+1]:'';
        if(p<0.05) scrollHint.textContent='↓ 滚轮浏览制作过程';
        else if(p>0.95) scrollHint.textContent='制作完成';
        else if(isZoomFrame&&cf.stage===0&&zoomT<0.5) scrollHint.textContent='滚动放大 · 查看琴胚细节';
        else if(isZoomFrame&&cf.stage===1&&zoomT<0.5) scrollHint.textContent='滚动放大 · 查看髹漆工艺';
        else if(isZoomFrame&&cf.stage===1&&zoomT>=0.5) scrollHint.textContent='髹漆层层 · 琴体渐显';
        else scrollHint.textContent=sn+(snNext?' → '+snNext:'');
        scrollHint.classList.add('still');
    }
}

// ═══════════════════════════════════════════
//  NAV DOTS (unified generalprocess.css)
// ═══════════════════════════════════════════
function updateNavDots(frm){
    const st=frm.stage;
    const sd=frm.sdone;
    navDotWrappers.forEach((wrapper,i)=>{
        const dot=wrapper.querySelector('.dot');
        wrapper.classList.remove('active','completed');
        dot.classList.remove('active','completed');
        if(sd[i]){
            wrapper.classList.add('completed');
            dot.classList.add('completed');
        }else if(i===st){
            wrapper.classList.add('active');
            dot.classList.add('active');
            wrapper.setAttribute('aria-current','step');
        }else{
            wrapper.removeAttribute('aria-current');
        }
    });
}

// ═══════════════════════════════════════════
//  COMPLETION
// ═══════════════════════════════════════════
let completed=false;
let completionTimer=null;
function showCompletion(){
    if(completed) return;
    completed=true;
    scrollHint.style.opacity='0';
    completionTimer=setTimeout(()=>{
        completeO.classList.add('visible');
        completeO.setAttribute('aria-hidden','false');
        completionTimer=null;
    },2000);
}

function resetCompletion(){
    if(completionTimer){
        clearTimeout(completionTimer);
        completionTimer=null;
    }
    completed=false;
    completeO.classList.remove('visible');
    completeO.setAttribute('aria-hidden','true');
    scrollHint.style.opacity='';
}

document.getElementById('btn-restart').addEventListener('click',()=>location.reload());
document.getElementById('btn-back').addEventListener('click',()=>{
    goNextPage('make');
});

// ── 右上角 cornerNav 前进/后退按钮 ──
document.getElementById('backBtn').addEventListener('click',()=>{
    goToStage(getStageAt(scrollP)-1);
});
document.getElementById('nextBtn').addEventListener('click',()=>{
    goToStage(getStageAt(scrollP)+1);
});

// ═══════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════
const allSrcs=[...new Set(F.map(f=>f.img).concat(
    (F[5].extra||[]).map(e=>e.src),
    ['琴部件assets/步骤4-琴演奏.png']
))];
allSrcs.forEach(src=>{ const img=new Image(); img.src=src; });

imgA.src=F[0].img;
setImgPos(imgA,F[0],0);
imgA.style.opacity='1';
imgB.style.opacity='0';
lastA=0; lastB=-1;
updateNavDots(F[0]);
topProgress.style.width='0%';

scrollP=0; scrollT=0;
lastInput=performance.now();
startLoop();
