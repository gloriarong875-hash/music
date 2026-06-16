const KNEADING_DURATION = 3000;
const CLAY_FRAME_COUNT = 4;
const THROW_FRAME_COUNT = 4;
const THROWING_DURATION = 4200;

const experience = document.querySelector(".experience");
const kneadingScene = document.querySelector(".kneading-scene");
const throwingScene = document.querySelector(".throwing-scene");
const holeScene = document.querySelector(".hole-scene");
const firingScene = document.querySelector(".firing-scene");
const clayImages = [...document.querySelectorAll(".clay-image")];
const blankImages = [...document.querySelectorAll(".blank-image")];
const arrowButtons = [...document.querySelectorAll(".arrow-key")];
const instructionText = document.querySelector(".instruction-text");
const progressTrack = document.querySelector(".progress-track");
const progressFill = document.querySelector(".progress-fill");
const progressValue = document.querySelector("#progress-value");
const throwingValue = document.querySelector("#throwing-value");
const throwingProgressTrack = document.querySelector(".throwing-progress");
const throwingProgressFill = document.querySelector(".throwing-progress-fill");
const throwingHint = document.querySelector(".throwing-hint");
const throwButton = document.querySelector(".throw-button");
const holeButton = document.querySelector(".hole-button");
const firingButton = document.querySelector(".firing-button");
const firingProgress = document.querySelector(".firing-progress");
const soundToggle = document.querySelector(".sound-toggle");
const showcaseFigureButton = document.querySelector(".showcase-figure-button");
const processSteps = [...document.querySelectorAll(".process-step")];
const navPrevButton = document.querySelector(".navPrev");
const navNextButton = document.querySelector(".navNext");
const resultModal = document.querySelector("#resultModal");
const completionBackdrop = document.querySelector(".completion-backdrop");
const playAgainButton = document.querySelector("#playAgainBtn");
const closeModalButton = document.querySelector("#closeModalBtn");
const scenes = [kneadingScene, throwingScene, holeScene, firingScene];

let scene = "kneading";
let kneadingProgress = 0;
let throwingProgress = 0;
let activeDirections = new Set();
let lastTimestamp = null;
let animationFrame = null;
let transitionTimers = [];
let throwingActive = false;
let throwingLastTimestamp = null;
let throwingAnimationFrame = null;
let throwingCompleted = false;
let isDrilling = false;
let isFiring = false;
let liveStepIndex = 0;
let viewedStepIndex = 0;
let maxUnlockedStep = 0;
let lastFocusedElement = null;
let resultCardPresented = false;

const soundscape = (() => {
  let context = null;
  let master = null;
  let noiseBuffer = null;
  let muted = false;
  let melodyTimer = null;
  const textures = new Map();
  const recordings = new Map();

  const recordingSettings = {
    clay: {
      src: "./assets/audio/clay-kneading.mp3",
      volume: 0.44,
      playbackRate: 1,
    },
    wheel: {
      src: "./assets/audio/wheel-reference.mp3",
      volume: 0.38,
      playbackRate: 0.86,
    },
    fire: {
      src: "./assets/audio/fire-burning.mp3",
      volume: 0.42,
      playbackRate: 0.96,
    },
  };

  function ensureContext() {
    if (!context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;

      context = new AudioContextClass();
      master = context.createGain();
      master.gain.value = muted ? 0 : 0.19;
      master.connect(context.destination);
    }

    if (context.state === "suspended") {
      context.resume();
    }

    return context;
  }

  function getNoiseBuffer() {
    const audioContext = ensureContext();
    if (!audioContext) return null;
    if (noiseBuffer) return noiseBuffer;

    const length = audioContext.sampleRate * 3;
    noiseBuffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
    const channel = noiseBuffer.getChannelData(0);
    let brown = 0;

    for (let index = 0; index < length; index += 1) {
      const white = Math.random() * 2 - 1;
      brown = (brown + 0.018 * white) / 1.018;
      channel[index] = brown * 3.2;
    }

    return noiseBuffer;
  }

  function stopTexture(name, fadeDuration = 0.18) {
    const texture = textures.get(name);
    if (!texture || !context) return;

    const now = context.currentTime;
    texture.output.gain.cancelScheduledValues(now);
    texture.output.gain.setValueAtTime(Math.max(texture.output.gain.value, 0.0001), now);
    texture.output.gain.exponentialRampToValueAtTime(0.0001, now + fadeDuration);

    window.setTimeout(() => {
      texture.nodes.forEach((node) => {
        try {
          node.stop();
        } catch {
          // Nodes that have already stopped can be safely ignored.
        }
        node.disconnect();
      });
      texture.output.disconnect();
    }, (fadeDuration + 0.08) * 1000);

    textures.delete(name);
  }

  function startTexture(name, options) {
    const audioContext = ensureContext();
    const buffer = getNoiseBuffer();
    if (!audioContext || !buffer || muted || textures.has(name)) return;

    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const output = audioContext.createGain();
    const lfo = audioContext.createOscillator();
    const lfoDepth = audioContext.createGain();
    const now = audioContext.currentTime;

    source.buffer = buffer;
    source.loop = true;
    source.playbackRate.value = options.playbackRate ?? 1;
    filter.type = options.filterType ?? "bandpass";
    filter.frequency.value = options.frequency ?? 520;
    filter.Q.value = options.q ?? 0.8;
    output.gain.setValueAtTime(0.0001, now);
    output.gain.exponentialRampToValueAtTime(options.gain ?? 0.08, now + 0.08);
    lfo.frequency.value = options.lfoRate ?? 2.2;
    lfoDepth.gain.value = options.lfoDepth ?? 0.018;

    source.connect(filter);
    filter.connect(output);
    lfo.connect(lfoDepth);
    lfoDepth.connect(output.gain);
    output.connect(master);

    const nodes = [source, lfo];
    if (options.toneFrequency) {
      const tone = audioContext.createOscillator();
      const toneFilter = audioContext.createBiquadFilter();
      const toneGain = audioContext.createGain();
      tone.type = options.toneType ?? "triangle";
      tone.frequency.value = options.toneFrequency;
      toneFilter.type = "lowpass";
      toneFilter.frequency.value = options.toneCutoff ?? 180;
      toneGain.gain.value = options.toneGain ?? 0.018;
      tone.connect(toneFilter);
      toneFilter.connect(toneGain);
      toneGain.connect(output);
      tone.start();
      nodes.push(tone);
    }

    source.start();
    lfo.start();
    textures.set(name, { nodes, output });
  }

  function getRecording(name) {
    if (recordings.has(name)) return recordings.get(name);

    const settings = recordingSettings[name];
    if (!settings) return null;

    const audio = new Audio(settings.src);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    audio.playbackRate = settings.playbackRate;
    const recording = {
      audio,
      targetVolume: settings.volume,
      fadeFrame: null,
      fadeToken: 0,
    };
    recordings.set(name, recording);
    return recording;
  }

  function fadeRecording(recording, targetVolume, duration, pauseWhenDone = false) {
    recording.fadeToken += 1;
    const token = recording.fadeToken;
    if (recording.fadeFrame) cancelAnimationFrame(recording.fadeFrame);

    const startedAt = performance.now();
    const initialVolume = recording.audio.volume;

    function fadeFrame(timestamp) {
      if (token !== recording.fadeToken) return;

      const progress = Math.min(1, (timestamp - startedAt) / duration);
      const eased = progress * (2 - progress);
      recording.audio.volume = initialVolume + (targetVolume - initialVolume) * eased;

      if (progress < 1) {
        recording.fadeFrame = requestAnimationFrame(fadeFrame);
        return;
      }

      recording.fadeFrame = null;
      if (pauseWhenDone) recording.audio.pause();
    }

    recording.fadeFrame = requestAnimationFrame(fadeFrame);
  }

  function startRecording(name) {
    if (muted) return;
    const recording = getRecording(name);
    if (!recording) return;

    recording.audio.playbackRate = recordingSettings[name].playbackRate;
    if (recording.audio.paused) {
      recording.audio.currentTime = 0;
      recording.audio.play().catch(() => {
        // A direct pointer or keyboard interaction will unlock playback.
      });
    }
    fadeRecording(recording, recording.targetVolume, 170);
  }

  function stopRecording(name, fadeDuration = 260) {
    const recording = recordings.get(name);
    if (!recording) return;
    fadeRecording(recording, 0, fadeDuration, true);
  }

  function startClay() {
    startRecording("clay");
  }

  function startWheel() {
    startRecording("wheel");
  }

  function playDig() {
    startTexture("dig", {
      filterType: "bandpass",
      frequency: 930,
      q: 1.35,
      gain: 0.06,
      lfoRate: 8.5,
      lfoDepth: 0.026,
      playbackRate: 1.55,
    });
    window.setTimeout(() => stopTexture("dig", 0.32), 1700);
  }

  function startFire() {
    startRecording("fire");
  }

  function playXunPhrase() {
    const audioContext = ensureContext();
    if (!audioContext || muted) return;

    if (melodyTimer) window.clearTimeout(melodyTimer);
    showcaseFigureButton.classList.add("is-playing");

    const notes = [
      [293.66, 0, 0.64],
      [349.23, 0.7, 0.46],
      [392, 1.22, 0.72],
      [440, 2.02, 0.48],
      [392, 2.58, 0.56],
      [349.23, 3.22, 0.48],
      [293.66, 3.78, 0.92],
      [261.63, 4.78, 1.25],
    ];
    const startAt = audioContext.currentTime + 0.05;

    notes.forEach(([frequency, offset, duration]) => {
      const oscillator = audioContext.createOscillator();
      const harmonic = audioContext.createOscillator();
      const toneFilter = audioContext.createBiquadFilter();
      const noteGain = audioContext.createGain();
      const breath = audioContext.createBufferSource();
      const breathFilter = audioContext.createBiquadFilter();
      const breathGain = audioContext.createGain();
      const noteStart = startAt + offset;
      const noteEnd = noteStart + duration;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, noteStart);
      oscillator.detune.setValueAtTime(-7, noteStart);
      oscillator.detune.linearRampToValueAtTime(5, noteEnd);
      harmonic.type = "sine";
      harmonic.frequency.value = frequency * 2;
      toneFilter.type = "lowpass";
      toneFilter.frequency.value = 1450;
      toneFilter.Q.value = 1.2;

      noteGain.gain.setValueAtTime(0.0001, noteStart);
      noteGain.gain.exponentialRampToValueAtTime(0.19, noteStart + 0.1);
      noteGain.gain.setValueAtTime(0.17, Math.max(noteStart + 0.11, noteEnd - 0.16));
      noteGain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

      breath.buffer = getNoiseBuffer();
      breathFilter.type = "bandpass";
      breathFilter.frequency.value = 1250;
      breathFilter.Q.value = 0.7;
      breathGain.gain.setValueAtTime(0.0001, noteStart);
      breathGain.gain.exponentialRampToValueAtTime(0.026, noteStart + 0.08);
      breathGain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

      oscillator.connect(toneFilter);
      harmonic.connect(toneFilter);
      toneFilter.connect(noteGain);
      noteGain.connect(master);
      breath.connect(breathFilter);
      breathFilter.connect(breathGain);
      breathGain.connect(master);

      oscillator.start(noteStart);
      oscillator.stop(noteEnd + 0.05);
      harmonic.start(noteStart);
      harmonic.stop(noteEnd + 0.05);
      breath.start(noteStart);
      breath.stop(noteEnd + 0.05);
    });

    melodyTimer = window.setTimeout(() => {
      showcaseFigureButton.classList.remove("is-playing");
      melodyTimer = null;
    }, 6250);
  }

  function setMuted(nextMuted) {
    muted = nextMuted;
    const audioContext = ensureContext();
    if (audioContext && master) {
      const now = audioContext.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.linearRampToValueAtTime(muted ? 0 : 0.19, now + 0.12);
    }

    if (muted) {
      [...textures.keys()].forEach((name) => stopTexture(name, 0.08));
      recordings.forEach((recording) => {
        recording.fadeToken += 1;
        if (recording.fadeFrame) cancelAnimationFrame(recording.fadeFrame);
        recording.audio.pause();
        recording.audio.volume = 0;
      });
      showcaseFigureButton.classList.remove("is-playing");
    }

    return muted;
  }

  return {
    startClay,
    stopClay: () => stopRecording("clay"),
    startWheel,
    stopWheel: () => stopRecording("wheel"),
    playDig,
    startFire,
    stopFire: () => stopRecording("fire", 650),
    playXunPhrase,
    setMuted,
    isMuted: () => muted,
  };
})();

function smoothStep(value) {
  return value * value * (3 - 2 * value);
}

function renderProcessStep(index) {
  processSteps.forEach((step, stepIndex) => {
    step.classList.toggle("is-complete", stepIndex < maxUnlockedStep && stepIndex !== index);
    step.classList.toggle("is-current", stepIndex === index);

    const dot = step.querySelector(".step-dot");
    if (stepIndex === index) {
      dot.setAttribute("aria-current", "step");
    } else {
      dot.removeAttribute("aria-current");
    }
  });
}

function updateNavButtons() {
  const prevDisabled = viewedStepIndex <= 0;
  const nextDisabled = viewedStepIndex >= liveStepIndex;

  navPrevButton.disabled = prevDisabled;
  navNextButton.disabled = nextDisabled;
  navPrevButton.classList.toggle("disabled", prevDisabled);
  navNextButton.classList.toggle("disabled", nextDisabled);
}

function setProcessStep(index) {
  liveStepIndex = index;
  viewedStepIndex = index;
  maxUnlockedStep = Math.max(maxUnlockedStep, index);
  scenes.forEach((sceneElement, sceneIndex) => {
    sceneElement.classList.toggle("is-active", sceneIndex === index);
    sceneElement.classList.remove("is-review-complete");
  });
  experience.classList.remove("is-reviewing");
  renderProcessStep(index);
  updateNavButtons();
}

function viewUnlockedStep(index) {
  if (index < 0 || index > liveStepIndex || index === viewedStepIndex) return;

  viewedStepIndex = index;
  scenes.forEach((sceneElement, sceneIndex) => {
    sceneElement.classList.toggle("is-active", sceneIndex === index);
    sceneElement.classList.toggle("is-review-complete", sceneIndex === index && sceneIndex < liveStepIndex);
  });

  experience.classList.toggle("is-reviewing", index !== liveStepIndex);
  renderProcessStep(index);
  updateNavButtons();

  if (index === 3 && firingScene.classList.contains("is-showcase") && !resultCardPresented) {
    openResultCard();
  }
}

function openResultCard() {
  if (!resultModal || viewedStepIndex !== 3) return;
  resultCardPresented = true;
  lastFocusedElement = document.activeElement;
  resultModal.classList.add("is-visible");
  resultModal.setAttribute("aria-hidden", "false");
  closeModalButton?.focus();
}

function closeResultCard() {
  if (!resultModal) return;
  resultModal.classList.remove("is-visible");
  resultModal.setAttribute("aria-hidden", "true");
  lastFocusedElement?.focus?.();
}

function renderClay() {
  const position = kneadingProgress * (CLAY_FRAME_COUNT - 1);
  const fromIndex = Math.min(CLAY_FRAME_COUNT - 1, Math.floor(position));
  const toIndex = Math.min(CLAY_FRAME_COUNT - 1, fromIndex + 1);
  const blend = smoothStep(position - fromIndex);
  const kneadWave = Math.sin(kneadingProgress * Math.PI * 6);

  clayImages.forEach((image, index) => {
    let opacity = 0;

    if (index === fromIndex) opacity = 1 - blend;
    if (index === toIndex) opacity = Math.max(opacity, blend);
    if (fromIndex === toIndex && index === fromIndex) opacity = 1;

    image.style.setProperty("--image-opacity", opacity.toFixed(4));
    image.style.setProperty("--scale-x", (1 + kneadWave * 0.014).toFixed(4));
    image.style.setProperty("--scale-y", (1 - kneadWave * 0.009).toFixed(4));
    image.style.setProperty("--shift-x", `${(kneadWave * 6).toFixed(2)}px`);
  });
}

function renderKneading() {
  const percentage = Math.min(100, Math.round(kneadingProgress * 100));
  progressFill.style.transform = `scaleX(${kneadingProgress})`;
  progressValue.textContent = String(percentage);
  progressTrack.setAttribute("aria-valuenow", String(percentage));
  renderClay();
}

function stopKneading() {
  activeDirections.clear();
  soundscape.stopClay();
  experience.classList.remove("is-kneading");
  arrowButtons.forEach((button) => button.classList.remove("is-active"));
}

function schedule(callback, delay) {
  const timer = window.setTimeout(callback, delay);
  transitionTimers.push(timer);
}

function finishKneading() {
  scene = "transition";
  kneadingProgress = 1;
  stopKneading();
  renderKneading();
  experience.classList.add("is-knead-finished");

  schedule(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        experience.classList.add("is-completing");
      });
    });
  }, 350);

  schedule(() => {
    experience.classList.add("is-leaving");
  }, 2450);

  schedule(() => {
    kneadingScene.classList.remove("is-active");
    throwingScene.classList.add("is-active", "is-entering");
    experience.classList.remove("is-knead-finished", "is-completing", "is-leaving");
    setProcessStep(1);
    scene = "throwing";

    schedule(() => {
      throwingScene.classList.remove("is-entering");
    }, 1150);
  }, 3550);
}

function tick(timestamp) {
  if (lastTimestamp === null) lastTimestamp = timestamp;
  const elapsed = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  if (scene === "kneading" && activeDirections.size > 0) {
    kneadingProgress = Math.min(1, kneadingProgress + elapsed / KNEADING_DURATION);
    renderKneading();

    if (kneadingProgress >= 1) {
      finishKneading();
      animationFrame = null;
      return;
    }
  }

  animationFrame = requestAnimationFrame(tick);
}

function beginKneading(direction) {
  if (scene !== "kneading") return;

  activeDirections.add(direction);
  soundscape.startClay();
  experience.classList.add("is-kneading");
  document.querySelector(`.arrow-${direction}`).classList.add("is-active");

  if (!animationFrame) {
    lastTimestamp = null;
    animationFrame = requestAnimationFrame(tick);
  }
}

function endKneading(direction) {
  activeDirections.delete(direction);
  document.querySelector(`.arrow-${direction}`).classList.remove("is-active");

  if (activeDirections.size === 0) {
    soundscape.stopClay();
    experience.classList.remove("is-kneading");
  }
}

function renderThrowing() {
  const position = throwingProgress * (THROW_FRAME_COUNT - 1);
  const fromIndex = Math.min(THROW_FRAME_COUNT - 1, Math.floor(position));
  const toIndex = Math.min(THROW_FRAME_COUNT - 1, fromIndex + 1);
  const blend = smoothStep(position - fromIndex);
  const turningWave = Math.sin(throwingProgress * Math.PI * 16);
  const percentage = Math.min(100, Math.round(throwingProgress * 100));

  blankImages.forEach((image, imageIndex) => {
    let opacity = 0;

    if (imageIndex === fromIndex) opacity = 1 - blend;
    if (imageIndex === toIndex) opacity = Math.max(opacity, blend);
    if (fromIndex === toIndex && imageIndex === fromIndex) opacity = 1;

    image.style.setProperty("--blank-opacity", opacity.toFixed(4));
    image.style.setProperty("--throw-scale-x", (1 + turningWave * 0.007).toFixed(4));
    image.style.setProperty("--throw-shift", `${(turningWave * 1.5).toFixed(2)}px`);
  });

  throwingProgressFill.style.transform = `scaleX(${throwingProgress})`;
  throwingValue.textContent = String(percentage);
  throwingProgressTrack.setAttribute("aria-valuenow", String(percentage));
}

function enterHoleScene() {
  throwingScene.classList.add("is-exiting");

  schedule(() => {
    holeScene.classList.add("is-active");
    setProcessStep(2);
    scene = "hole";
  }, 700);

  schedule(() => {
    throwingScene.classList.remove("is-active", "is-finished", "is-exiting");
  }, 1500);
}

function finishThrowing() {
  throwingCompleted = true;
  throwingActive = false;
  throwingProgress = 1;
  throwingScene.classList.remove("is-throwing");
  soundscape.stopWheel();
  throwingScene.classList.add("is-finished");
  throwingHint.textContent = "拉坯塑形完成";
  throwButton.disabled = true;
  renderThrowing();
  schedule(enterHoleScene, 1700);
}

function throwingTick(timestamp) {
  if (throwingLastTimestamp === null) throwingLastTimestamp = timestamp;
  const elapsed = timestamp - throwingLastTimestamp;
  throwingLastTimestamp = timestamp;

  if (throwingActive && scene === "throwing" && !throwingCompleted) {
    throwingProgress = Math.min(1, throwingProgress + elapsed / THROWING_DURATION);
    renderThrowing();

    if (throwingProgress >= 1) {
      finishThrowing();
      throwingAnimationFrame = null;
      return;
    }
  }

  throwingAnimationFrame = requestAnimationFrame(throwingTick);
}

function beginThrowing() {
  if (scene !== "throwing" || throwingCompleted) return;

  throwingActive = true;
  soundscape.startWheel();
  throwingScene.classList.add("is-throwing");

  if (!throwingAnimationFrame) {
    throwingLastTimestamp = null;
    throwingAnimationFrame = requestAnimationFrame(throwingTick);
  }
}

function endThrowing() {
  throwingActive = false;
  soundscape.stopWheel();
  throwingScene.classList.remove("is-throwing");

  if (throwingAnimationFrame) {
    cancelAnimationFrame(throwingAnimationFrame);
    throwingAnimationFrame = null;
    throwingLastTimestamp = null;
  }
}

function drillHole() {
  if (scene !== "hole" || isDrilling) return;

  isDrilling = true;
  soundscape.playDig();
  holeButton.disabled = true;
  holeScene.classList.add("is-drilling");

  schedule(() => {
    holeScene.classList.add("is-complete");
  }, 1800);

  schedule(enterFiringScene, 3200);
}

function enterFiringScene() {
  holeScene.classList.add("is-exiting");

  schedule(() => {
    firingScene.classList.add("is-active");
    setProcessStep(3);
    scene = "firing";
  }, 650);

  schedule(() => {
    holeScene.classList.remove("is-active", "is-drilling", "is-complete", "is-exiting");
  }, 1450);
}

function fireKiln() {
  if (scene !== "firing" || isFiring) return;

  isFiring = true;
  soundscape.startFire();
  firingButton.disabled = true;
  firingProgress.setAttribute("aria-valuenow", "0");
  firingScene.classList.add("is-firing");

  schedule(() => {
    firingProgress.setAttribute("aria-valuenow", "100");
    firingScene.classList.add("is-fired");
  }, 2600);

  schedule(() => {
    firingScene.classList.add("is-revealing");
    soundscape.stopFire();
  }, 3900);

  schedule(() => {
    firingScene.classList.add("is-showcase");
    experience.classList.add("is-showcase");
    schedule(openResultCard, 2000);
  }, 4750);
}

const directionForKey = {
  ArrowLeft: "left",
  ArrowRight: "right",
};

window.addEventListener("keydown", (event) => {
  if (scene === "throwing" && event.code === "Space") {
    event.preventDefault();
    beginThrowing();
    return;
  }

  const direction = directionForKey[event.key];
  if (!direction || event.repeat) return;
  event.preventDefault();
  beginKneading(direction);
});

window.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    endThrowing();
    return;
  }

  const direction = directionForKey[event.key];
  if (!direction) return;
  event.preventDefault();
  endKneading(direction);
});

window.addEventListener("blur", () => {
  stopKneading();
  endThrowing();
});

arrowButtons.forEach((button) => {
  const direction = button.classList.contains("arrow-left") ? "left" : "right";

  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    beginKneading(direction);
  });

  button.addEventListener("pointerup", () => endKneading(direction));
  button.addEventListener("pointercancel", () => endKneading(direction));
  button.addEventListener("lostpointercapture", () => endKneading(direction));
});

throwButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  throwButton.setPointerCapture(event.pointerId);
  beginThrowing();
});
throwButton.addEventListener("pointerup", endThrowing);
throwButton.addEventListener("pointercancel", endThrowing);
throwButton.addEventListener("lostpointercapture", endThrowing);
holeButton.addEventListener("click", drillHole);
firingButton.addEventListener("click", fireKiln);
showcaseFigureButton.addEventListener("click", soundscape.playXunPhrase);
navPrevButton.addEventListener("click", () => viewUnlockedStep(viewedStepIndex - 1));
navNextButton.addEventListener("click", () => viewUnlockedStep(viewedStepIndex + 1));
playAgainButton?.addEventListener("click", () => window.location.reload());
closeModalButton?.addEventListener("click", closeResultCard);
completionBackdrop?.addEventListener("click", closeResultCard);
soundToggle.addEventListener("click", () => {
  const muted = soundscape.setMuted(!soundscape.isMuted());
  soundToggle.classList.toggle("is-muted", muted);
  soundToggle.setAttribute("aria-pressed", String(muted));
  soundToggle.setAttribute("aria-label", muted ? "开启交互声音" : "关闭交互声音");
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && resultModal?.classList.contains("is-visible")) {
    closeResultCard();
  }
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let parallaxFrame = null;

function updateVisualDepth(clientX, clientY) {
  if (reduceMotion.matches) return;

  const bounds = experience.getBoundingClientRect();
  const normalizedX = Math.max(-1, Math.min(1, ((clientX - bounds.left) / bounds.width - 0.5) * 2));
  const normalizedY = Math.max(-1, Math.min(1, ((clientY - bounds.top) / bounds.height - 0.5) * 2));

  experience.style.setProperty("--pointer-x", `${((normalizedX + 1) * 50).toFixed(2)}%`);
  experience.style.setProperty("--pointer-y", `${((normalizedY + 1) * 50).toFixed(2)}%`);
  experience.style.setProperty("--parallax-x", `${(normalizedX * -7).toFixed(2)}px`);
  experience.style.setProperty("--parallax-y", `${(normalizedY * -5).toFixed(2)}px`);
  experience.style.setProperty("--parallax-inverse-x", `${(normalizedX * 4.9).toFixed(2)}px`);
  experience.style.setProperty("--parallax-inverse-y", `${(normalizedY * 3.5).toFixed(2)}px`);
  experience.style.setProperty("--parallax-far-x", `${(normalizedX * -3.5).toFixed(2)}px`);
  experience.style.setProperty("--parallax-far-y", `${(normalizedY * -2.5).toFixed(2)}px`);
  experience.style.setProperty("--parallax-far-inverse-x", `${(normalizedX * 1.58).toFixed(2)}px`);
  experience.style.setProperty("--parallax-far-inverse-y", `${(normalizedY * 1.13).toFixed(2)}px`);
}

experience.addEventListener("pointermove", (event) => {
  if (parallaxFrame) cancelAnimationFrame(parallaxFrame);
  parallaxFrame = requestAnimationFrame(() => {
    updateVisualDepth(event.clientX, event.clientY);
    parallaxFrame = null;
  });
});

experience.addEventListener("pointerleave", () => {
  experience.style.setProperty("--pointer-x", "50%");
  experience.style.setProperty("--pointer-y", "48%");
  experience.style.setProperty("--parallax-x", "0px");
  experience.style.setProperty("--parallax-y", "0px");
  experience.style.setProperty("--parallax-inverse-x", "0px");
  experience.style.setProperty("--parallax-inverse-y", "0px");
  experience.style.setProperty("--parallax-far-x", "0px");
  experience.style.setProperty("--parallax-far-y", "0px");
  experience.style.setProperty("--parallax-far-inverse-x", "0px");
  experience.style.setProperty("--parallax-far-inverse-y", "0px");
});

setProcessStep(0);
renderKneading();
renderThrowing();
