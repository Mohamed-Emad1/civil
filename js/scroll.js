document.querySelectorAll('.reveal').forEach(el => {
  new IntersectionObserver(([entry], observer) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }, { threshold: .12 }).observe(el);
});
const glow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', event => { if (window.innerWidth > 900) { glow.style.opacity = '1'; glow.style.left = `${event.clientX}px`; glow.style.top = `${event.clientY}px`; } }, { passive: true });
const heroMedia = document.querySelector('[data-parallax]');
const progressBar = document.querySelector('.scroll-progress span');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const updateScrollEffects = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  if (progressBar) progressBar.style.width = `${progress}%`;
  if (heroMedia && !reducedMotion.matches) heroMedia.style.transform = `translateY(${window.scrollY * .12}px) scale(1.04)`;
};
window.addEventListener('scroll', updateScrollEffects, { passive: true });
window.addEventListener('resize', updateScrollEffects, { passive: true });
updateScrollEffects();
