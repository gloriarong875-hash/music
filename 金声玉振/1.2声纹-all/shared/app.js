import * as THREE from 'three';
import { getInstrumentConfig } from '../data/instruments.js';
import { averageRange, loadImage, smoothstep } from './utils.js';

(() => {
      'use strict';

      const requestedInstrument = document.documentElement.dataset.instrument
        || new URLSearchParams(window.location.search).get('instrument');
      const theme = getInstrumentConfig(requestedInstrument);
      const PAINTING_URL = theme.paintingUrl;
      const AUDIO_URL = theme.audioUrl;
      const SHENG_REFERENCE_URL = theme.referenceUrl;
      const PARTICLE_COUNT = 36000;
      const TRANSFORMATION_DURATION = theme.transformationDuration;

      const sceneRoot = document.querySelector('.scene');
      const stage = document.getElementById('particle-stage');
      const audio = document.getElementById('audio');
      const playButton = document.getElementById('play');
      const resetButton = document.getElementById('reset');
      const statusEl = document.getElementById('status');
      const loadingEl = document.getElementById('loading');
      const errorEl = document.getElementById('error');
      const spectrumCanvas = document.getElementById('spectrum');
      const spectrumContext = spectrumCanvas.getContext('2d');
      const volumeValue = document.getElementById('volume-value');
      const pitchValue = document.getElementById('pitch-value');
      const rhythmValue = document.getElementById('rhythm-value');
      const particleIntro = document.querySelector('.card-particle');
      const continueLink = document.getElementById('continue-link');

      function duckGlobalBgm() {
        window.JSYZBgm?.duck?.();
      }

      function restoreGlobalBgm() {
        window.JSYZBgm?.restore?.();
      }

      function applyTheme() {
        document.title = theme.pageTitle;
        if (theme.backgroundUrl) {
          document.documentElement.style.setProperty('--scene-background', `url("${theme.backgroundUrl}")`);
        }
        const painting = document.getElementById('painting-original');
        painting.src = theme.paintingUrl;
        painting.alt = theme.paintingAlt;
        stage.setAttribute('aria-label', `画作粒子化与${theme.targetName}形重组视觉`);
        document.querySelector('.card-painting').innerHTML = theme.paintingInfo;
        document.querySelector('.intro-page.first').innerHTML = theme.introFirst;
        document.querySelector('.intro-page.second').textContent = theme.introSecond;
        document.querySelector('.track-name').textContent = theme.track;
        continueLink.href = theme.continueHref;
        continueLink.textContent = theme.continueText;
        audio.src = theme.audioUrl;
      }

      let renderer, scene, camera, points, geometry, material;
      let positions, paintingPositions, shengPositions, velocities, colors, baseColors, randomOffsets, phases;
      let audioContext, audioSource, analyser, frequencyData, timeDomainData;
      let imageReady = false, audioReady = false, ended = false;

      // 音频分析结果
      let amplitude = 0, bass = 0, mid = 0, treble = 0, pitchHz = 0;
      let audioBurst = 0;

      // 用于估计“节奏活跃度”
      let lastAmplitude = 0;
      let energyDelta = 0;
      let rhythmIntensity = 0;

      // 原画/粒子预览切换与风场过渡状态。
      let previewOriginal = false;
      let windTransition = 0;
      let windDirection = 1;

      let lastTime = performance.now();
      const ripples = [];
      let lastRippleAt = -10;

      function showError(message) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
      }

      function setStatus(text) { statusEl.textContent = text; }

      function initThree() {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
        renderer.setClearColor(0x000000, 0);
        stage.appendChild(renderer.domElement);
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(44, 1, .1, 50);
        camera.position.set(0, 0, 10.5);
        resize();
        window.addEventListener('resize', resize, { passive: true });
      }

      function resize() {
        if (!renderer || !camera) return;
        const width = Math.max(1, stage.clientWidth);
        const height = Math.max(1, stage.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        if (material) material.uniforms.uPixelRatio.value = Math.min(devicePixelRatio, 1.75);
      }

      function loadVisualAssets() {
        if (window.location.protocol === 'file:') loadingEl.textContent = '正在读取本地画作';
        Promise.all([
          loadImage(PAINTING_URL, '画作'),
          loadImage(SHENG_REFERENCE_URL, `${theme.targetName}参考图`)
        ]).then(([paintingImage, shengImage]) => {
          try {
            buildParticles(paintingImage, shengImage);
            imageReady = true;
            loadingEl.classList.add('hidden');
            setTimeout(() => loadingEl.remove(), 650);
            setStatus('Painting');
            updateReadyState();
          } catch (error) {
            console.error(error);
            showError('图片像素读取失败，请确认页面资源完整后重新打开。');
            setStatus('Image Error');
          }
        }).catch((error) => {
          loadingEl.textContent = '视觉资源加载失败';
          showError(`${error.message}，请检查画作与${theme.targetName}参考图。`);
          setStatus('Image Error');
        });
      }

      // 将原画缩放到采样画布，从有效像素中均匀抽取约 3.6 万个粒子。
      function buildParticles(image, shengImage) {
        const sampleWidth = 360;
        const sampleHeight = Math.max(120, Math.round(sampleWidth * image.height / image.width));
        const canvas = document.createElement('canvas');
        canvas.width = sampleWidth;
        canvas.height = sampleHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(image, 0, 0, sampleWidth, sampleHeight);
        const pixels = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;

        positions = new Float32Array(PARTICLE_COUNT * 3);
        paintingPositions = new Float32Array(PARTICLE_COUNT * 3);
        shengPositions = new Float32Array(PARTICLE_COUNT * 3);
        velocities = new Float32Array(PARTICLE_COUNT * 3);
        colors = new Float32Array(PARTICLE_COUNT * 3);
        baseColors = new Float32Array(PARTICLE_COUNT * 3);
        randomOffsets = new Float32Array(PARTICLE_COUNT * 3);
        phases = new Float32Array(PARTICLE_COUNT);

        const imageAspect = image.width / image.height;
        const paintingWidth = theme.paintingWidth;
        const paintingHeight = paintingWidth / imageAspect;
        const step = Math.max(1, Math.floor((sampleWidth * sampleHeight) / PARTICLE_COUNT));
        const shengSamples = sampleShengSilhouette(shengImage);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const sourceIndex = (i * step + Math.floor(Math.random() * step)) % (sampleWidth * sampleHeight);
          const px = sourceIndex % sampleWidth;
          const py = Math.floor(sourceIndex / sampleWidth);
          const pixelIndex = sourceIndex * 4;
          const jitterX = (Math.random() - .5) / sampleWidth;
          const jitterY = (Math.random() - .5) / sampleHeight;
          const index = i * 3;

          const x = ((px / (sampleWidth - 1) - .5) + jitterX) * paintingWidth;
          const y = (.5 - py / (sampleHeight - 1) + jitterY) * paintingHeight;
          paintingPositions[index] = positions[index] = x;
          paintingPositions[index + 1] = positions[index + 1] = y;
          paintingPositions[index + 2] = positions[index + 2] = (Math.random() - .5) * .035;

          const r = Math.pow(pixels[pixelIndex] / 255, .88);
          const g = Math.pow(pixels[pixelIndex + 1] / 255, .88);
          const b = Math.pow(pixels[pixelIndex + 2] / 255, .88);

          const tintedR = Math.min(1, r * theme.particleTint[0]);
          const tintedG = Math.min(1, g * theme.particleTint[1]);
          const tintedB = Math.min(1, b * theme.particleTint[2]);
          baseColors[index] = colors[index] = tintedR;
          baseColors[index + 1] = colors[index + 1] = tintedG;
          baseColors[index + 2] = colors[index + 2] = tintedB;
          randomOffsets[index] = Math.random() * 2 - 1;
          randomOffsets[index + 1] = Math.random() * 2 - 1;
          randomOffsets[index + 2] = Math.random() * 2 - 1;
          phases[i] = Math.random() * Math.PI * 2;
          const shengPoint = shengSamples[(i * 97 + Math.floor(Math.random() * 71)) % shengSamples.length];
          shengPositions[index] = shengPoint.x;
          shengPositions[index + 1] = shengPoint.y;
          shengPositions[index + 2] = (Math.random() - .5) * theme.targetDepth;
        }

        geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
        material = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          vertexColors: true,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uTime: { value: 0 },
            uAmplitude: { value: 0 },
            uTreble: { value: 0 },
            uPixelRatio: { value: Math.min(devicePixelRatio, 1.75) }
          },
          vertexShader: `
            attribute float aPhase;
            varying vec3 vColor;
            varying float vAlpha;
            uniform float uTime;
            uniform float uAmplitude;
            uniform float uTreble;
            uniform float uPixelRatio;
            void main() {
              vColor = color;
              float shimmer = .84 + .16 * sin(uTime * 2.3 + aPhase * 3.0);
              vAlpha = shimmer;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              float audioSize = 1.0 + uAmplitude * 3.8 + uTreble *1.4 *   sin(aPhase * 8.0 + uTime * 11.0);
              gl_PointSize = clamp((${theme.pointSize.toFixed(2)} * uPixelRatio * audioSize) * (9.0 / -mvPosition.z), 1.0, 11.5);
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            varying vec3 vColor;
            varying float vAlpha;
            void main() {
              vec2 p = gl_PointCoord - .5;
              float d = length(p);
              if (d > .5) discard;
              float glow = smoothstep(.5, .03, d);
              gl_FragColor = vec4(vColor * (1.0 + glow * .38), glow * vAlpha * .92);
            }
          `
        });
        points = new THREE.Points(geometry, material);
        scene.add(points);
      }

      // 直接从透明笙 PNG 的有效像素采样，保留竹管、笙斗与吹嘴的真实轮廓。
      function sampleShengSilhouette(image) {
        const height = 500;
        const width = Math.round(height * image.width / image.height);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(image, 0, 0, width, height);
        const data = ctx.getImageData(0, 0, width, height).data;
        const samples = [];
        const targetHeight = theme.targetHeight;
        let minX = 0;
        let minY = 0;
        let maxX = width - 1;
        let maxY = height - 1;
        if (theme.fitReferenceBounds) {
          minX = width;
          minY = height;
          maxX = 0;
          maxY = 0;
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              if (data[(y * width + x) * 4 + 3] > 36) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
              }
            }
          }
        }
        const boundsWidth = Math.max(1, maxX - minX);
        const boundsHeight = Math.max(1, maxY - minY);
        const targetWidth = targetHeight * boundsWidth / boundsHeight;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const alpha = data[(y * width + x) * 4 + 3];
            if (alpha > 36) {
              samples.push({
                x: ((x - minX) / boundsWidth - .5) * targetWidth,
                y: (.5 - (y - minY) / boundsHeight) * targetHeight
              });
            }
          }
        }
        if (!samples.length) throw new Error('笙参考图没有可用的透明轮廓');
        return samples;
      }

      function updateReadyState() {
        playButton.disabled = !(imageReady && audioReady);
      }

      function prepareAudioGraph() {
        // 音频已内嵌为 data URL，双击打开时也可安全接入 Web Audio，
        // 因此粒子、频谱和数值均读取真实音乐数据。
        if (audioContext) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        audioContext = new AudioContextClass();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = .82;
        frequencyData = new Uint8Array(analyser.frequencyBinCount);
        timeDomainData = new Uint8Array(analyser.fftSize);
        // MediaElementSource 对同一 audio 元素只创建一次，后续播放复用。
        audioSource = audioContext.createMediaElementSource(audio);
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
      }

      function analyseAudio() {
        if (!analyser || audio.paused) {
          amplitude *= .94;
          bass *= .93;
          mid *= .93;
          treble *= .9;
          energyDelta *= .85;
          rhythmIntensity *= .92;
          pitchHz *= .9;
          audioBurst *= .88;
          return;
        }
        analyser.getByteFrequencyData(frequencyData);
        analyser.getByteTimeDomainData(timeDomainData);
        let rms = 0;
        for (let i = 0; i < timeDomainData.length; i++) {
          const sample = (timeDomainData[i] - 128) / 128;
          rms += sample * sample;
        }
        const analysisGain = theme.analysisGain || 1;
        const rawAmplitude = Math.min(1, Math.sqrt(rms / timeDomainData.length) * 2.7 * analysisGain);
        amplitude += (rawAmplitude - amplitude) * .2;
        const bassLevel = Math.min(1, averageRange(frequencyData, .005, .09) * analysisGain);
        const midLevel = Math.min(1, averageRange(frequencyData, .09, .36) * analysisGain);
        const trebleLevel = Math.min(1, averageRange(frequencyData, .36, .88) * analysisGain);
        bass += (bassLevel - bass) * .18;
        mid += (midLevel - mid) * .15;
        treble += (trebleLevel - treble) * .22;

        // 取频谱中最强的有效峰值，估算当前主音高。
        let peakIndex = 0;
        let peakValue = 0;
        const minBin = Math.max(1, Math.floor(55 * analyser.fftSize / audioContext.sampleRate));
        const maxBin = Math.min(frequencyData.length - 1, Math.ceil(2200 * analyser.fftSize / audioContext.sampleRate));
        for (let i = minBin; i <= maxBin; i++) {
          if (frequencyData[i] > peakValue) {
            peakValue = frequencyData[i];
            peakIndex = i;
          }
        }
        const detectedPitch = peakValue > 28 ? peakIndex * audioContext.sampleRate / analyser.fftSize : 0;
        pitchHz += (detectedPitch - pitchHz) * .18;

        // 音量突然上升，说明节奏更活跃
        energyDelta = Math.max(0, amplitude - lastAmplitude);
        lastAmplitude = amplitude;

        // 音量峰值产生短促强冲击，使粒子先爆开再被形态弹簧拉回。
        const burstTarget = Math.min(1.6, Math.max(0, amplitude - .12) * 4.8 + energyDelta * 22 + bass * .28);
        audioBurst = Math.max(audioBurst * .91, burstTarget);

        // 节奏活跃度：结合音量突增 + 中高频活跃
        const targetRhythm = Math.min(1, energyDelta * 7.5 + mid * .35 + treble * .25);
        rhythmIntensity += (targetRhythm - rhythmIntensity) * .16;
      }

      function updateAudioMonitor() {
        const volumeLevel = Math.min(1, amplitude * 1.35);
        const rhythmLevel = Math.min(1, rhythmIntensity * 1.6 + energyDelta * 5);
        volumeValue.textContent = `${Math.round(volumeLevel * 100)}%`;
        pitchValue.textContent = pitchHz > 35 ? `${Math.round(pitchHz)} Hz` : '-- Hz';
        rhythmValue.textContent = `${Math.round(rhythmLevel * 100)}%`;

        const rect = spectrumCanvas.getBoundingClientRect();
        const pixelRatio = Math.min(devicePixelRatio, 2);
        const width = Math.max(1, Math.round(rect.width * pixelRatio));
        const height = Math.max(1, Math.round(rect.height * pixelRatio));
        if (spectrumCanvas.width !== width || spectrumCanvas.height !== height) {
          spectrumCanvas.width = width;
          spectrumCanvas.height = height;
        }

        spectrumContext.clearRect(0, 0, width, height);
        const bars = 34;
        const gap = 3 * pixelRatio;
        const barWidth = Math.max(1, (width - gap * (bars - 1)) / bars);
        const gradient = spectrumContext.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, 'rgba(142,112,61,.45)');
        gradient.addColorStop(.58, 'rgba(218,185,112,.9)');
        gradient.addColorStop(1, 'rgba(255,239,190,1)');
        spectrumContext.fillStyle = gradient;

        for (let i = 0; i < bars; i++) {
          const curved = Math.pow(i / (bars - 1), 1.65);
          const bin = frequencyData ? Math.min(frequencyData.length - 1, Math.floor(curved * frequencyData.length * .58)) : 0;
          const level = frequencyData && !audio.paused ? frequencyData[bin] / 255 : 0;
          const barHeight = Math.max(2 * pixelRatio, level * height * .9);
          const x = i * (barWidth + gap);
          spectrumContext.beginPath();
          if (typeof spectrumContext.roundRect === 'function') {
            spectrumContext.roundRect(x, height - barHeight, barWidth, barHeight, barWidth * .5);
          } else {
            spectrumContext.rect(x, height - barHeight, barWidth, barHeight);
          }
          spectrumContext.fill();
        }
      }

      // 视觉转化使用独立时间轴，避免长音频导致画作几十秒都没有明显变化。
      function getTransformationProgress() {
        if (ended) return 1;
        return Math.min(1, audio.currentTime / TRANSFORMATION_DURATION);
      }

      function stageWeights(progress) {
        if (ended) return { painting: 0, burst: 0, sheng: 1 };
        if (progress <= 0) return { painting: 1, burst: 0, sheng: 0 };
        const [holdEnd, burstEnd, formationEnd] = theme.stageTiming;
        // 点击播放后先完整显示粒子画作，再经历明显扩散，最后收束为笙。
        if (progress < holdEnd) {
          const t = smoothstep(0, holdEnd, progress);
          return { painting: 1, burst: t * .28, sheng: 0 };
        }
        if (progress < burstEnd) {
          const t = smoothstep(holdEnd, burstEnd, progress);
          return { painting: 1, burst: .28 + Math.sin(t * Math.PI) * .82, sheng: 0 };
        }
        if (progress < formationEnd) {
          const t = smoothstep(burstEnd, formationEnd, progress);
          return { painting: 1 - t, burst: .7 * (1 - t), sheng: t };
        }
        return { painting: 0, burst: 0, sheng: 1 };
      }

      function updateRipples(time, delta, transformProgress) {
        if (!audio.paused && transformProgress < .62) {
          const trigger = bass > .16 || amplitude > .13 || time - lastRippleAt > 2.8;
          if (trigger && time - lastRippleAt > .72 && ripples.length < 10) {
            ripples.push({
              x: (Math.random() - .5) * 7.8,
              y: (Math.random() - .5) * 4.3,
              radius: .08,
              strength: .28 + amplitude * 1.2 + bass * 1.15 + rhythmIntensity * .5,
              age: 0,
              life: 2.2 + Math.random() * 1.8,
              rotation: Math.random() < .5 ? -1 : 1
            });
            lastRippleAt = time;
          }
        }
        for (let i = ripples.length - 1; i >= 0; i--) {
          const ripple = ripples[i];
          ripple.age += delta;
          ripple.radius += delta * (1.45 + bass * 3.2 + amplitude * 2.1);
          if (ripple.age >= ripple.life) ripples.splice(i, 1);
        }
      }

      function updateParticles(now, delta) {
        if (!positions) return;
        const transformProgress = getTransformationProgress();
        const weights = stageWeights(transformProgress);
        const time = now * .001;
        const active = !audio.paused || ended;

        // 风转场会在点击切换画作/粒子时被拉满，然后逐渐衰减
        windTransition *= Math.pow(.925, delta * 60);

        if (audio.paused && audio.currentTime > .01 && !ended && windTransition < .01) return;
        updateRipples(time, delta, transformProgress);        
        const formed = smoothstep(theme.stageTiming[1], theme.stageTiming[2], transformProgress);
        const drumShapeLock = theme.targetName === '鼓' ? weights.sheng : 0;
        const spring = ended ? .065 : .03 + amplitude * .072 + weights.sheng * .065 + drumShapeLock * .055;
        const dampingBase = theme.targetName === '鼓' ? .87 - weights.sheng * .075 : .89 - weights.sheng * .035;
        const damping = Math.pow(ended ? .76 : dampingBase, delta * 60);
        // 节奏慢时整体偏暗，节奏快时整体更明亮
        const brightnessFactor = 0.7 + rhythmIntensity * 1.5 + bass * .42;

        // 节拍突增和高频产生显著提亮及综合色偏移。
        const beatFlash = Math.min(1, rhythmIntensity * 1.7 + energyDelta * 11 + bass * .35);
        const sparkleLift = treble * .28 + amplitude * .16 + beatFlash * .22;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const k = i * 3;
          const phase = phases[i];
          const rx = randomOffsets[k];
          const ry = randomOffsets[k + 1];
          const rz = randomOffsets[k + 2];

          let tx = paintingPositions[k] * weights.painting + shengPositions[k] * weights.sheng;
          let ty = paintingPositions[k + 1] * weights.painting + shengPositions[k + 1] * weights.sheng;
          let tz = paintingPositions[k + 2] * weights.painting + shengPositions[k + 2] * weights.sheng;

          if (weights.burst > 0) {
            const px = paintingPositions[k];
            const py = paintingPositions[k + 1];
            const length = Math.sqrt(px * px + py * py) + .35;

            // 音量越大，粒子扩散越明显
            const dispersion = weights.burst * (4.8 + amplitude * 25 + bass * 14 + rhythmIntensity * 8.5);

            const swirl = time * (.34 + mid * 1.45) + phase;

            tx += (px / length) * dispersion * (1.2 + Math.abs(rx) * 2.15) + rx * dispersion * .62;
            ty += (py / length) * dispersion * (1.08 + Math.abs(ry) * 1.95) + ry * dispersion * .58;

            // 中频继续控制旋转和流动感
            tx += Math.cos(swirl) * weights.burst * (.38 + mid * 1.55) * ry;
            ty += Math.sin(swirl) * weights.burst * (.38 + mid * 1.55) * rx;

            // z 轴也增强，让扩散更有空间感
            tz += rz * weights.burst * (7.5 + amplitude * 14 + bass * 9);
          }

          // 高音量时明显炸开；笙形成后将爆发限制在轮廓附近，保持乐器可辨识。
          if (active && audioBurst > .015) {
            const originX = weights.sheng > .55 ? shengPositions[k] : paintingPositions[k];
            const originY = weights.sheng > .55 ? shengPositions[k + 1] : paintingPositions[k + 1];
            const radialLength = Math.sqrt(originX * originX + originY * originY) + .28;
            const shapeGuard = Math.max(.055, 1 - formed * .945);
            const guardedBurst = audioBurst * shapeGuard;
            const burstDistance = guardedBurst * (5.5 + Math.abs(rx) * 7.5);
            tx += (originX / radialLength) * burstDistance + rx * guardedBurst * 4.8;
            ty += (originY / radialLength) * burstDistance + ry * guardedBurst * 4.3;
            tz += rz * guardedBurst * 8.5;
          }
          // 声音涟漪局部推动粒子，形成柔和的水墨旋涡而非爆炸。
          for (let r = 0; r < ripples.length; r++) {
            const ripple = ripples[r];
            const dx = paintingPositions[k] - ripple.x;
            const dy = paintingPositions[k + 1] - ripple.y;
            const distance = Math.sqrt(dx * dx + dy * dy) + .001;
            const ringDistance = distance - ripple.radius;
            const envelope = Math.exp(-ringDistance * ringDistance * 2.5) * (1 - ripple.age / ripple.life);
            const influence = envelope * ripple.strength * (1 - weights.sheng);
            tx += (-dy / distance) * influence * ripple.rotation * 1.35 + (dx / distance) * influence * .62;
            ty += (dx / distance) * influence * ripple.rotation * 1.35 + (dy / distance) * influence * .62;
            tz += influence * rz * .72;
          }

          // 成笙后仍持续响应音乐：低频呼吸，中频摆动，高频产生细碎振颤。
          if (formed > 0 && active) {
            const sx = shengPositions[k];
            const sy = shengPositions[k + 1];
            const radialLength = Math.sqrt(sx * sx + sy * sy) + .55;
            const lowPulse = formed * bass * (.12 + .13 * Math.sin(time * 4.2 + phase));
            tx += sx / radialLength * lowPulse;
            ty += sy / radialLength * lowPulse;
            tx += formed * mid * Math.sin(time * 2.1 + sy * .72 + phase) * .11;
            ty += formed * mid * Math.cos(time * 1.7 + sx * .8 + phase) * .055;
            tz += formed * (bass * .24 * Math.sin(time * 3.2 + phase) + treble * rz * .32);
          }

          const hasStarted = audio.currentTime > .01 || ended;
          const breathing = hasStarted ? Math.sin(time * 1.1 + phase) * (.006 + amplitude * .035) : 0;
          tx += rx * breathing;
          ty += ry * breathing + (hasStarted ? Math.sin(time * .7 + phase * 2) * .008 : 0);

          if (active) {
            tx += Math.sin(time * 5.2 + phase * 4) * treble * .04;
            ty += Math.cos(time * 4.7 + phase * 3) * treble * .035;
          }

          // 点击切换原画 / 粒子时出现的“有形的风”
          // 它不是常驻粒子模式，只在切换瞬间出现，然后自然消失。
          if (windTransition > .001) {
            const px = positions[k];
            const py = positions[k + 1];

            // 从左到右/从右到左扫过的风带，让风有“经过画面”的感觉
            const sweep = Math.sin(time * 2.1 + py * 1.15 + phase * .45);

            // 分层风浪：让粒子不是整体平移，而是一层一层摆动
            const layerWave = Math.sin(time * 1.35 + py * 1.8 + phase);
            const softWave = Math.cos(time * .9 + px * .72 + phase * 1.4);

            // 风强度：点击时最大，然后逐渐衰减；音频越强，风稍微更明显
            const windStrength = windTransition * (.48 + amplitude * .65 + mid * .28);

            // 主方向：横向自由吹动，幅度更大
            tx += windDirection * sweep * windStrength * .95;

            // 纵向摆动：像风把画面轻轻掀起来
            ty += layerWave * windStrength * .42;

            // 深度起伏：增强“有形的风”的体积感
            tz += softWave * windStrength * .68;

            // 风扫过时带一点旋涡，不是直线吹散
            const swirl = Math.sin(time * 1.6 + (px + py) * .42 + phase);
            tx += Math.cos(swirl + phase) * windStrength * .22;
            ty += Math.sin(swirl + phase) * windStrength * .18;

            // 如果已经形成笙，笙管也会被风带动，摇摆幅度更明显
            if (weights.sheng > .2) {
              const pipeSway = Math.sin(time * 1.05 + shengPositions[k + 1] * 1.9 + phase);
              tx += pipeSway * windTransition * weights.sheng * .28;
              ty += Math.cos(time * .85 + phase) * windTransition * weights.sheng * .08;
            }
          }
          // 根据节奏活跃度更新粒子颜色：慢节奏暗，快节奏亮
          const warmBeat = beatFlash * (.2 + .8 * Math.sin(phase * 1.7) ** 2);
          const coolBeat = Math.min(1, treble * 1.7 + rhythmIntensity * .65) * (.25 + .75 * Math.cos(phase * 1.3) ** 2);
          if (theme.targetName === '鼓') {
            const mutedBrightness = .68 + rhythmIntensity * .52 + bass * .16;
            colors[k] = Math.min(.82, baseColors[k] * (mutedBrightness + .08) + sparkleLift * .16 + warmBeat * .14);
            colors[k + 1] = Math.min(.72, baseColors[k + 1] * mutedBrightness + sparkleLift * .1 + mid * .04);
            colors[k + 2] = Math.min(.5, baseColors[k + 2] * mutedBrightness * .72 + sparkleLift * .05 + coolBeat * .025);
          } else {
            colors[k] = Math.min(1, baseColors[k] * brightnessFactor + sparkleLift + warmBeat * .42);
            colors[k + 1] = Math.min(1, baseColors[k + 1] * brightnessFactor + sparkleLift * .72 + mid * .24);
            colors[k + 2] = Math.min(1, baseColors[k + 2] * brightnessFactor + sparkleLift * .58 + coolBeat * .38);
          }
          velocities[k] = (velocities[k] + (tx - positions[k]) * spring) * damping;
          velocities[k + 1] = (velocities[k + 1] + (ty - positions[k + 1]) * spring) * damping;
          velocities[k + 2] = (velocities[k + 2] + (tz - positions[k + 2]) * spring) * damping;
          positions[k] += velocities[k] * delta * 60;
          positions[k + 1] += velocities[k + 1] * delta * 60;
          positions[k + 2] += velocities[k + 2] * delta * 60;
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
        material.uniforms.uTime.value = time;
        material.uniforms.uAmplitude.value = amplitude;
        material.uniforms.uTreble.value = treble;

        if (!audio.paused && !ended) {
          if (transformProgress < .12) setStatus('Particle Painting');
          else if (transformProgress < .42) setStatus('Particle Burst');
          else if (transformProgress < .78) setStatus(`${theme.targetName} Formation`);
          else setStatus('Complete · Audio Reactive');
        }
      }

      function animate(now) {
        requestAnimationFrame(animate);
        const delta = Math.min(.035, Math.max(.001, (now - lastTime) / 1000));
        lastTime = now;
        analyseAudio();
        updateAudioMonitor();
        particleIntro.classList.toggle('show-second', audio.currentTime >= 12 || ended);
        updateParticles(now, delta);
        if (renderer) renderer.render(scene, camera);
      }
      sceneRoot.addEventListener('click', (event) => {
        const clickedPanel = event.target.closest('.panel, .audio-visuals, .continue-link');
        if (clickedPanel) return;

        if (!imageReady) return;

        previewOriginal = !previewOriginal;
        windTransition = 1;
        windDirection = previewOriginal ? -1 : 1;

        sceneRoot.classList.toggle('preview-original', previewOriginal);

        if (previewOriginal) {
          setStatus('Original Painting');
        } else {
          if (ended) {
            setStatus(`${theme.targetName} Formation Complete`);
          } else if (!audio.paused && audio.currentTime > 0) {
            const transformProgress = getTransformationProgress();
            if (transformProgress < .12) setStatus('Particle Painting');
            else if (transformProgress < .42) setStatus('Particle Burst');
            else if (transformProgress < .78) setStatus(`${theme.targetName} Formation`);
            else setStatus('Complete · Audio Reactive');
          } else {
            setStatus('Painting');
          }
  }
});  
      continueLink.addEventListener('click', (event) => {
        event.preventDefault();
        audio.pause();
        sceneRoot.classList.add('is-leaving');
        setTimeout(() => { window.location.href = continueLink.href; }, 680);
      });

      playButton.addEventListener('click', async () => {
        if (!imageReady || !audioReady) return;
        try {
          prepareAudioGraph();
          if (audioContext?.state === 'suspended') {
            audioContext.resume().catch((error) => {
              console.warn('声纹分析暂未恢复', error);
            });
          }
          if (audio.paused) {
            if (ended) { audio.currentTime = 0; ended = false; }
            sceneRoot.classList.add('started');
            await audio.play();
          } else {
            audio.pause();
          }
        } catch (error) {
          console.error(error);
          showError('音频播放失败，请检查音频资源或浏览器音频权限。');
        }
      });

      resetButton.addEventListener('click', () => {
        audio.pause();
        audio.currentTime = 0;
        ended = false;

        previewOriginal = false;
        windTransition = 0;
        windDirection = 1;

        sceneRoot.classList.remove('started', 'preview-original');
        ripples.length = 0;
        lastRippleAt = -10;
        amplitude = bass = mid = treble = pitchHz = 0;
        audioBurst = 0;
        energyDelta = rhythmIntensity = 0;
        particleIntro.classList.remove('show-second');
        playButton.textContent = '播放';
        playButton.classList.remove('is-playing');
        playButton.setAttribute('aria-label', '播放');
        setStatus(imageReady ? 'Painting' : 'Loading');
        for (let i = 0; positions && i < positions.length; i++) {
          positions[i] = paintingPositions[i];
          velocities[i] = 0;
        }
        if (geometry) geometry.attributes.position.needsUpdate = true;
      });

      audio.addEventListener('loadedmetadata', () => {
        audioReady = true;
        updateReadyState();
      });
      audio.addEventListener('canplay', () => { audioReady = true; updateReadyState(); }, { once: true });
      audio.addEventListener('error', () => {
        showError('音频加载失败，请检查音频资源。');
        setStatus('Audio Error');
      });
      audio.addEventListener('play', () => {
        duckGlobalBgm();
        playButton.textContent = '暂停';
        playButton.classList.add('is-playing');
        playButton.setAttribute('aria-label', '暂停');
        sceneRoot.classList.add('started');
        if (audio.currentTime < .55) setStatus('Particle Painting');
      });
      audio.addEventListener('pause', () => {
        restoreGlobalBgm();
        if (!ended) playButton.textContent = '播放';
        playButton.classList.remove('is-playing');
        playButton.setAttribute('aria-label', '播放');
      });
      audio.addEventListener('ended', () => {
        restoreGlobalBgm();
        ended = true;
        playButton.textContent = '重播';
        playButton.classList.remove('is-playing');
        playButton.setAttribute('aria-label', '重播');
        setStatus(`${theme.targetName} Formation Complete`);
      });

      applyTheme();
      initThree();
      loadVisualAssets();
      audio.load();
      requestAnimationFrame(animate);
    })();
  
