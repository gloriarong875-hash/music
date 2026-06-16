const resultModal = document.querySelector("#resultModal");
const playAgainButton = document.querySelector("#playAgainBtn");
const closeModalButton = document.querySelector("#closeModalBtn");
const previewOpenButton = document.querySelector("#previewOpenBtn");

const drumSoundPath = "The_Sound_of_Chinese_%234-1781160583108.mp3";

let resultAudio = null;
let audioFadeTimer = 0;

function playResultDrumSound() {
  stopResultDrumSound();

  resultAudio = new Audio(drumSoundPath);
  resultAudio.preload = "auto";
  resultAudio.volume = 0;
  resultAudio.play().catch(() => {});

  let frame = 0;
  audioFadeTimer = window.setInterval(() => {
    if (!resultAudio) {
      window.clearInterval(audioFadeTimer);
      return;
    }

    frame += 1;
    resultAudio.volume = Math.min(0.46, frame * 0.046);

    if (frame >= 10) {
      window.clearInterval(audioFadeTimer);
    }
  }, 55);
}

function stopResultDrumSound() {
  window.clearInterval(audioFadeTimer);

  if (!resultAudio) return;

  resultAudio.pause();
  resultAudio.currentTime = 0;
  resultAudio = null;
}

function openCompletionCard() {
  resultModal.classList.add("is-visible");
  resultModal.setAttribute("aria-hidden", "false");
  playResultDrumSound();

  window.setTimeout(() => {
    playAgainButton.focus();
  }, 520);
}

function closeCompletionCard() {
  resultModal.classList.remove("is-visible");
  resultModal.setAttribute("aria-hidden", "true");
  stopResultDrumSound();
}

function restartGame() {
  closeCompletionCard();

  // 接入原游戏时，把游戏重置代码放在这里。
  document.dispatchEvent(new CustomEvent("drum-game:restart"));
}

previewOpenButton?.addEventListener("click", openCompletionCard);
playAgainButton.addEventListener("click", restartGame);
closeModalButton.addEventListener("click", closeCompletionCard);

resultModal.addEventListener("click", event => {
  if (event.target === resultModal) {
    closeCompletionCard();
  }
});

window.addEventListener("keydown", event => {
  if (event.key === "Escape" && resultModal.classList.contains("is-visible")) {
    closeCompletionCard();
  }
});

// 独立预览页打开时直接展示完成卡片。
window.addEventListener("load", openCompletionCard, { once: true });

// 原游戏制作完成时调用：openCompletionCard();
