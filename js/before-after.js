document.querySelectorAll('[data-compare]').forEach(compare => {
  const before = compare.querySelector('.before-image'); const handle = compare.querySelector('.compare-handle'); let dragging = false;
  const move = event => { if (!dragging) return; const rect = compare.getBoundingClientRect(); const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left)); const percent = (x / rect.width) * 100; before.style.width = `${percent}%`; handle.style.right = `${100 - percent}%`; };
  compare.addEventListener('pointerdown', event => { dragging = true; compare.setPointerCapture(event.pointerId); move(event); });
  compare.addEventListener('pointermove', move); compare.addEventListener('pointerup', () => dragging = false); compare.addEventListener('pointercancel', () => dragging = false);
});
