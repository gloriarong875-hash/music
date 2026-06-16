document.addEventListener('DOMContentLoaded', () => {
  const prev = document.getElementById('prevScene');
  const next = document.getElementById('nextScene');
  if (!prev && !next) return;

  function handlePrev(e) {
    // 如果存在全局 go/order/current，优先调用
    try {
      if (typeof window.go === 'function' && Array.isArray(window.order) && typeof window.current === 'string') {
        const idx = window.order.indexOf(window.current);
        if (idx > 0) return window.go(window.order[idx - 1]);
      }
    } catch (err) {}
    // 否则回退历史作为降级方案
    if (window.history && window.history.length) window.history.back();
  }

  function handleNext(e) {
    try {
      if (typeof window.go === 'function' && Array.isArray(window.order) && typeof window.current === 'string') {
        const idx = window.order.indexOf(window.current);
        if (idx < window.order.length - 1) return window.go(window.order[idx + 1]);
      }
    } catch (err) {}
    if (window.history && window.history.length) window.history.forward();
  }

  if (prev) prev.addEventListener('click', handlePrev);
  if (next) next.addEventListener('click', handleNext);
});
