const counters = document.querySelectorAll('[data-counter]');
const formatArabic = value => String(Math.round(value)).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
counters.forEach(counter => {
  const observer = new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    const target = Number(counter.dataset.counter); let start = 0; const duration = 1300; const begin = performance.now();
    const tick = now => { const progress = Math.min((now - begin) / duration, 1); counter.textContent = formatArabic(start + (target - start) * (1 - Math.pow(1 - progress, 3))); if (progress < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick); observer.unobserve(counter);
  }, { threshold: .7 }); observer.observe(counter);
});
