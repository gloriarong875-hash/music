
    // 简写选择器，方便在单文件里快速操作 DOM。
    const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
    const scenes = $$(".scene"), dots = $$(".dot"), title = $("#stepTitle"), particles = $("#particles");
    const order = ["pick","chosen","saw","cutDone","bake","bakeDone","carve","carveDone","tune","tuneDone","final"];
    let current = "pick", ctx, testOsc, testGain;

    // WebAudio 工具函数：只有用户点击后才创建音频上下文，避免浏览器自动播放限制。
    function audio(){ if(!ctx) ctx = new (AudioContext || webkitAudioContext)(); if(ctx.state==="suspended") ctx.resume(); return ctx; }
    function tone(f,d=.14,type="sine",g=.055){ const c=audio(), o=c.createOscillator(), v=c.createGain(); o.type=type; o.frequency.value=f; v.gain.setValueAtTime(g,c.currentTime); v.gain.exponentialRampToValueAtTime(.001,c.currentTime+d); o.connect(v).connect(c.destination); o.start(); o.stop(c.currentTime+d); }
    function noise(d=.08,g=.035,ff=1800){ const c=audio(), b=c.createBuffer(1,c.sampleRate*d,c.sampleRate), data=b.getChannelData(0); for(let i=0;i<data.length;i++) data[i]=Math.random()*2-1; const s=c.createBufferSource(), f=c.createBiquadFilter(), v=c.createGain(); f.type="bandpass"; f.frequency.value=ff; v.gain.setValueAtTime(g,c.currentTime); v.gain.exponentialRampToValueAtTime(.001,c.currentTime+d); s.buffer=b; s.connect(f).connect(v).connect(c.destination); s.start(); s.stop(c.currentTime+d); }
    function stopTest(){ if(!testOsc) return; try{ testGain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.08); testOsc.stop(ctx.currentTime+.1); }catch(e){} testOsc=null; testGain=null; }
    function startTest(){ const c=audio(); stopTest(); testOsc=c.createOscillator(); testGain=c.createGain(); testOsc.type="sawtooth"; testOsc.frequency.value=760; testGain.gain.value=.018; testOsc.connect(testGain).connect(c.destination); testOsc.start(); }
    // 完成时的金色粒子，不直接写死在页面里，而是在需要时临时生成。
    function burst(n=50,x=50,y=50){ particles.innerHTML=""; for(let i=0;i<n;i++){ const p=document.createElement("span"), a=Math.random()*Math.PI*2, r=130+Math.random()*420; p.className="gold"; p.style.left=x+"%"; p.style.top=y+"%"; p.style.setProperty("--x",Math.cos(a)*r+"px"); p.style.setProperty("--y",Math.sin(a)*r+"px"); particles.appendChild(p); } setTimeout(()=>particles.innerHTML="",1600); }
    // 更新右上角上一幕/下一幕按钮状态。
    function updateNavButtons(){
      const idx = order.indexOf(current);
      $("#prevScene").classList.toggle("disabled", idx <= 0);
      $("#nextScene").classList.toggle("disabled", idx >= order.length - 1);
    }
    // 切换场景：同步顶部步骤圆点，并重置当前关卡的交互状态。
    function go(name){ current=name; scenes.forEach(s=>s.classList.toggle("active",s.dataset.scene===name)); const s=scenes.find(s=>s.dataset.scene===name), step=+s.dataset.step; title.textContent=s.dataset.title; dots.forEach((d,i)=>{d.classList.toggle("done",i+1<step); d.classList.toggle("active",i+1===step);}); stopTest(); if(name==="saw") resetSaw(); if(name==="bake") resetBake(); if(name==="carve") resetCarve(); if(name==="tune") resetTune(); updateNavButtons();
      // 当切换到最终页时，1s 后显示结果卡片模态
      if(name==="final"){
        setTimeout(()=>{ try{ openResultCard(); }catch(e){} }, 2000);
      }
    }
    document.addEventListener("pointerdown", audio, {passive:true});
    $("#prevScene").onclick=()=>{ const idx=order.indexOf(current); if(idx>0) go(order[idx-1]); };
    $("#nextScene").onclick=()=>{ const idx=order.indexOf(current); if(idx<order.length-1) go(order[idx+1]); };
    $("#pickHit").onclick=()=>{tone(520,.08,"triangle"); go("chosen");};
    $("#chosenHit").onclick=()=>go("saw");
    $$("[data-go]").forEach(b=>b.onclick=()=>{ if(b.dataset.go==="final") burst(80,55,50); go(b.dataset.go); });
    // restart button removed from final scene; no binding needed

    // 第一关锯切：点击木锯或圆形提示后才进入“拿起木锯”的状态。
    let sawP=0, sawDown=false, sawReady=false, lastX=0, lastDir=0;
    function resetSaw(){ sawP=0; sawDown=false; sawReady=false; $("#sawFill").style.width="0%"; $("#sawScene").classList.remove("sawing","tool-ready"); $("#sawImg").style.cssText=""; $("#dust").innerHTML=""; $("#sawHint").textContent="点击圆形按钮拿起木锯"; }
    // 每次有效拉锯都会生成几片独立木屑。
    function spawnChips(){ const box=$("#dust"); for(let i=0;i<4;i++){ const c=document.createElement("span"); c.className="chip"; c.style.setProperty("--s",2+Math.random()*6+"px"); c.style.setProperty("--x",(Math.random()*90-35)+"px"); c.style.setProperty("--y",(45+Math.random()*105)+"px"); c.style.setProperty("--r",(Math.random()*260-130)+"deg"); c.style.setProperty("--d",.45+Math.random()*.55+"s"); box.appendChild(c); setTimeout(()=>c.remove(),1050); } }
    function sawMove(e){ if(current!=="saw"||!sawReady) return; const r=$("#app").getBoundingClientRect(), img=$("#sawImg"); img.style.left=e.clientX-r.left-r.width*.07+"px"; img.style.top=e.clientY-r.top-r.height*.1+"px"; img.style.right="auto"; if(!sawDown) return; const dx=e.clientX-lastX, dir=Math.sign(dx); if(Math.abs(dx)>5&&dir){ sawP+=Math.min(Math.abs(dx)*.18,5.4)+(lastDir&&dir!==lastDir?4.6:0); lastX=e.clientX; lastDir=dir; $("#sawFill").style.width=Math.min(100,sawP)+"%"; spawnChips(); if(Math.random()>.55) noise(.045,.035,2100); if(sawP>=100){ sawDown=false; $("#sawScene").classList.remove("sawing"); tone(180,.08,"square"); setTimeout(()=>tone(430,.14,"triangle"),50); setTimeout(()=>go("cutDone"),560); } } }
    function pickSaw(){ sawReady=true; $("#sawScene").classList.add("tool-ready"); $("#sawHint").textContent="按住虚线，快速左右往复拉锯"; tone(460,.08,"triangle"); }
    $("#sawToolHit").onclick=pickSaw; $("#sawImg").onclick=pickSaw;
    $("#sawZone").onpointerdown=e=>{ if(!sawReady) return; e.preventDefault(); sawDown=true; lastX=e.clientX; lastDir=0; $("#sawScene").classList.add("sawing"); sawMove(e); };
    window.addEventListener("pointermove",sawMove); window.addEventListener("pointerup",()=>{sawDown=false; $("#sawScene").classList.remove("sawing");});

    // 第二关烤料：长按升温，松手时判断是否落在绿色区间。
    let heat=0, heating=false, heatStart=0, heatRaf=0;
    // 过热过渡控制：当超过绿色区间（>81）进入 overheat 状态，有短暂宽限期后才变糊
    let overheated=false, overheatStart=0, OVERHEAT_GRACE=700;
    function resetBake(){ heat=0; heating=false; cancelAnimationFrame(heatRaf); $("#heatFill").style.height="0%"; $("#heatGlow").style.opacity=0; $("#bakeBamboo").classList.remove("heating","ruined","overheated","burning"); overheated=false; overheatStart=0; $("#brazier").classList.remove("hot"); $("#flame").classList.remove("hot"); document.querySelector('[data-scene="bake"]').classList.remove("bake-exit"); $("#bakeHint").textContent="按住竹管加热，进入绿色区间时松开"; }
    function bakeLoop(t){
      if(!heating) return;
      heat = Math.min(114, (t - heatStart) / 31);
      $("#heatFill").style.height = Math.min(100, heat) + "%";
      $("#heatGlow").style.opacity = Math.min(.9, heat / 82);

      // 绿色安全区上限 81：一旦超过立即进入糊化过渡（无需等待进度条填满）
      if(heat > 81){
        heating = false;
        cancelAnimationFrame(heatRaf);
        $("#bakeBamboo").classList.remove("heating","overheated");
        handleRuined();
        return;
      }

      if(Math.random() > .86) noise(.04, .022, 600);
      heatRaf = requestAnimationFrame(bakeLoop);
    }
    // 按住开始加热：如果已经在冷却/糊化中，提示用户等待或手动重置
    $("#hold").onpointerdown=e=>{ e.preventDefault(); if($("#bakeBamboo").classList.contains("ruined")){ $("#bakeHint").textContent = "竹材正在冷却，或点击竹管立即重置"; return; } heating=true; heatStart=performance.now()-heat*31; $("#bakeBamboo").classList.add("heating"); $("#brazier").classList.add("hot"); $("#flame").classList.add("hot"); $("#bakeHint").textContent="火候正在上升，绿色区间马上松开"; heatRaf=requestAnimationFrame(bakeLoop); };

    // 点击竹管可以在“糊”状态或过热后立即重置；否则无影响
    $("#bakeBamboo").onclick = ()=>{ if($("#bakeBamboo").classList.contains("ruined") || $("#bakeBamboo").classList.contains("burning")) resetBake(); };

    // 兼容热区/覆盖元素拦截：若在烤料场景且竹材处于 ruined/burning，点击热区或图片任意位置都能重置
    document.addEventListener('pointerdown', (e)=>{
      if(current !== 'bake') return;
      const bamboo = $("#bakeBamboo");
      if(!bamboo) return;
      if(!(bamboo.classList.contains('ruined') || bamboo.classList.contains('burning'))) return;
      const target = e.target;
      if(target === bamboo || target.closest && target.closest('#hold') ){ resetBake(); }
    }, {passive:true});

    // 处理糊化：添加短暂燃烧/糊化动效后恢复初始状态，给用户自然过渡
    function handleRuined(){
      $("#bakeBamboo").classList.remove("heating","overheated");
      $("#bakeBamboo").classList.add("burning");
      $("#brazier").classList.remove("hot"); $("#flame").classList.remove("hot");
      $("#bakeHint").textContent="火候过头，竹材开始糊化..."; tone(95,.38,"sawtooth"); // 糊化音效
      // 生成若干烟雾粒子，让过渡更自然
      for(let i=0;i<6;i++){ setTimeout(()=>spawnSmoke(), i*140); }
      // 燃烧阶段持续一段时间后，显示 ruined（但不自动 reset，等待用户点击重置）
      setTimeout(()=>{ $("#bakeBamboo").classList.remove("burning"); $("#bakeBamboo").classList.add("ruined"); $("#bakeHint").textContent="竹材已烤糊，点击竹管重置"; }, 1200);
    }

    // 生成烟雾元素并在完成后移除
    function spawnSmoke(){ const s=document.createElement('span'); s.className='smoke'; s.style.left=(48+Math.random()*8)+'%'; s.style.top=(12+Math.random()*6)+'%'; document.querySelector('.app').appendChild(s); setTimeout(()=>s.remove(),1600); }
    window.addEventListener("pointerup",()=>{ if(!heating||current!=="bake") return; heating=false; cancelAnimationFrame(heatRaf); $("#bakeBamboo").classList.remove("heating"); $("#brazier").classList.remove("hot"); $("#flame").classList.remove("hot"); if(heat>=71&&heat<=81){ $("#bakeHint").textContent="啪，竹管瞬间笔直定型"; tone(340,.08,"triangle"); setTimeout(()=>tone(680,.16,"triangle"),60); setTimeout(()=>document.querySelector('[data-scene="bake"]').classList.add("bake-exit"),220); setTimeout(()=>go("bakeDone"),1450); } else { $("#bakeHint").textContent=heat<71?"水分未尽，再加一点火候":"差一点过火了，先稳住再试"; tone(180,.08,"sine"); } });

    // 第三关刻簧：圆形光标持续提示鼠标位置，路径判定通过 SVG 坐标计算。
    // 支持“再做一次”按钮：侦听来自完成卡片的重启事件
    document.addEventListener("drum-game:restart",()=>go("pick"));
    let len=0, samples=[], cp=0, carving=false, locked=false, carveReady=false;
    function resetCarve(){ const p=$("#uProgress"); len=p.getTotalLength(); cp=0; carving=false; locked=false; carveReady=false; samples=[]; for(let d=0;d<=len;d+=4){ const q=p.getPointAtLength(d); samples.push({x:q.x,y:q.y,d}); } p.style.strokeDasharray=len; p.style.strokeDashoffset=len; $("#uGuide").classList.remove("bad"); $("#blank").classList.remove("lift"); $("#carveScene").classList.remove("tracing","tool-ready"); $("#knife").style.cssText=""; $("#traceCursor").style.cssText=""; $("#carveHint").textContent="点击圆形按钮拿起刻刀，圆形会提示描刻位置"; }
    function guidePoint(e){ const pt=$("#guideSvg").createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY; return pt.matrixTransform($("#guideSvg").getScreenCTM().inverse()); }
    function nearest(pt){ let best=samples[0], bd=1e9; for(const s of samples){ const d=Math.hypot(s.x-pt.x,s.y-pt.y); if(d<bd){bd=d; best=s;} } return {best,bd}; }
    function fail(msg){ if(locked) return; locked=true; carving=false; $("#carveScene").classList.remove("tracing"); $("#uGuide").classList.add("bad"); $("#carveHint").textContent=msg; tone(115,.12,"square"); setTimeout(resetCarve,850); }
    function carveAt(e){ if(current!=="carve") return; const r=$("#app").getBoundingClientRect(), cursor=$("#traceCursor"); cursor.style.left=e.clientX-r.left+"px"; cursor.style.top=e.clientY-r.top+"px"; if(carveReady){ $("#knife").style.left=e.clientX-r.left-r.width*.03+"px"; $("#knife").style.top=e.clientY-r.top-r.height*.04+"px"; $("#knife").style.right="auto"; } if(!carveReady||!carving||locked) return; const n=nearest(guidePoint(e)), cur=cp*len; if(n.bd>72) return fail("离虚线太远，重新落刀"); if(n.best.d<cur-70) return fail("回刀过深，重新落刀"); if(n.best.d>cur+220&&cp>.02) return fail("走刀太急，慢一点"); cp=Math.max(cp,n.best.d/len); $("#uProgress").style.strokeDashoffset=len*(1-cp); if(Math.random()>.72) noise(.04,.018,3600); if(cp>=.975){ carving=false; locked=true; $("#carveScene").classList.remove("tracing"); $("#blank").classList.add("lift"); $("#uProgress").style.strokeDashoffset=0; $("#carveHint").textContent="簧舌弹起，金声已开"; tone(760,.12,"triangle"); setTimeout(()=>tone(1180,.22,"sine"),100); burst(34,52,52); setTimeout(()=>go("carveDone"),1250); } }
    function pickKnife(){ carveReady=true; $("#carveScene").classList.add("tool-ready"); $("#carveHint").textContent="让圆形贴着 U 型虚线，沿轮廓慢慢描一圈"; tone(560,.08,"triangle"); }
    $("#knifeToolHit").onclick=pickKnife; $("#knife").onclick=pickKnife;
    $("#carveHit").onpointerdown=e=>{ if(!carveReady) return; e.preventDefault(); const n=nearest(guidePoint(e)); if(n.best.d>185) return fail("请从 U 型虚线左上端附近起刀"); carving=true; $("#carveScene").classList.add("tracing"); carveAt(e); };
    window.addEventListener("pointermove",carveAt); window.addEventListener("pointerup",()=>{carving=false; $("#carveScene").classList.remove("tracing");});

    // 第四关点砂：进入页面不自动出声，第一次点击朱砂才启动测试音。
    let pitch=36, target=false, scraping=false, press=0, activePress=false, moved=false, scrapeTimer=0, tuneRaf=0, slideX=0;
    function resetTune(){ pitch=36; target=false; scraping=false; activePress=false; moved=false; $("#waxDrops").innerHTML=""; $("#tuneHint").textContent="点击红色圆形点砂；长按左键左右滑动刮砂升音"; needleLoop(); }
    function needleLoop(){ if(current!=="tune") return cancelAnimationFrame(tuneRaf); const w=Math.sin(performance.now()/180)*1.4+Math.sin(performance.now()/410)*.9; $("#needle").style.left=Math.max(4,Math.min(96,50+pitch*.78+w))+"%"; if(testOsc) testOsc.frequency.setTargetAtTime(620+pitch*5.8,ctx.currentTime,.04); tuneRaf=requestAnimationFrame(needleLoop); }
    function brushTap(){ const b=$(".brush"); b.classList.remove("tap"); void b.offsetWidth; b.classList.add("tap"); }
    function addDrop(){
      const container = $("#waxDrops");
      const waxEl = $(".wax");
      if(!container || !waxEl) return;
      const waxRect = waxEl.getBoundingClientRect();
      const contRect = container.getBoundingClientRect();
      const waxW = waxRect.width, waxH = waxRect.height;
      const cx = waxRect.left + waxW/2;
      const cy = waxRect.top + waxH/2;
      // 强制与 wax 中心对齐并向右微调（解决偏左问题）
      const offsetX = waxW * 0.12; // 向右移动约 18% 的 wax 宽度，可根据需要调整
      const x = cx + offsetX;
      const y = cy;
      // 使用视口固定像素坐标，确保与 wax 的中心精确对齐
      const d = document.createElement('span');
      d.style.position = 'fixed';
      d.style.left = Math.round(x) + 'px';
      d.style.top = Math.round(y) + 'px';
      d.style.transform = 'translate(-50%,-50%)';
      container.appendChild(d);
    }
    function checkTune(){ if(target||Math.abs(pitch)>3.2) return; target=true; scraping=false; clearInterval(scrapeTimer); $("#tuneHint").textContent="音准对齐，刺音化作笙乐大和弦"; stopTest(); tone(261.63,.72,"sine",.06); setTimeout(()=>tone(329.63,.68,"sine",.052),80); setTimeout(()=>tone(392,.76,"sine",.052),150); burst(86,57,49); setTimeout(()=>go("tuneDone"),1350); }
    function ensureTuneSound(){ if(!testOsc) startTest(); }
    function addWeight(){ if(target) return; ensureTuneSound(); pitch-=7.4; brushTap(); addDrop(); $("#tuneHint").textContent="朱砂变重，音调下降。让红线贴近绿线"; tone(520+pitch*3,.08,"triangle"); checkTune(); }
    function scrape(){ if(target) return; ensureTuneSound(); pitch+=2.2; if(Math.random()>.45) brushTap(); $("#waxDrops").lastElementChild?.remove(); $("#tuneHint").textContent="刮去朱砂，簧舌变轻，音调升高"; noise(.04,.018,4200); checkTune(); }
    function beginScrape(){ if(scraping||target) return; ensureTuneSound(); scraping=true; scrape(); scrapeTimer=setInterval(scrape,150); }
    $("#paintDot").oncontextmenu=e=>e.preventDefault();
    $("#paintDot").onpointerdown=e=>{ e.preventDefault(); brushTap(); press=performance.now(); slideX=e.clientX; moved=false; activePress=true; if(e.button===2) return beginScrape(); clearInterval(scrapeTimer); setTimeout(()=>{ if(activePress&&current==="tune"&&!target&&performance.now()-press>330) beginScrape(); },360); };
    $("#paintDot").onpointermove=e=>{ if(!activePress) return; if(e.buttons===2) return beginScrape(); if(e.buttons===1&&Math.abs(e.clientX-slideX)>8){ moved=true; slideX=e.clientX; beginScrape(); } };
    window.addEventListener("pointerup",()=>{ const wasActive=activePress, wasScrape=scraping; scraping=false; activePress=false; clearInterval(scrapeTimer); if(wasActive&&current==="tune"&&!target&&!wasScrape&&!moved&&performance.now()-press<320) addWeight(); });
    updateNavButtons();

    // 结果卡片控制：打开/关闭以及按钮绑定
    const resultModalEl = document.getElementById('resultModal');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    function openResultCard(){ if(!resultModalEl) return; resultModalEl.classList.add('is-visible'); resultModalEl.setAttribute('aria-hidden','false'); }
    function closeResultCard(){ if(!resultModalEl) return; resultModalEl.classList.remove('is-visible'); resultModalEl.setAttribute('aria-hidden','true'); }
    playAgainBtn?.addEventListener('click', ()=>{ closeResultCard(); go('pick'); });
    closeModalBtn?.addEventListener('click', ()=>{ closeResultCard(); });
 
