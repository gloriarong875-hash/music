document.addEventListener("DOMContentLoaded", () => {
  const prev = document.getElementById("prevScene");
  const next = document.getElementById("nextScene");

  if (prev) {
    prev.addEventListener("click", () => {
      if (window.history && window.history.length) window.history.back();
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      if (window.history && window.history.length) window.history.forward();
    });
  }
});
