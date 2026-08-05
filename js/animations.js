document.querySelectorAll('.button').forEach(button => button.addEventListener('click', event => { const ripple = document.createElement('i'); ripple.className = 'button-ripple'; const rect = button.getBoundingClientRect(); ripple.style.left = `${event.clientX - rect.left}px`; ripple.style.top = `${event.clientY - rect.top}px`; button.appendChild(ripple); setTimeout(() => ripple.remove(), 600); }));
document.querySelector('.newsletter')?.addEventListener('submit', event => { event.preventDefault(); const button = event.currentTarget.querySelector('button'); button.textContent = '✓'; });

const magneticTargets = document.querySelectorAll('.button-primary, .text-link');
const canUseMagneticMotion = window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (canUseMagneticMotion) {
  magneticTargets.forEach(target => {
    target.addEventListener('pointermove', event => {
      const rect = target.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - .5) * 8;
      const y = ((event.clientY - rect.top) / rect.height - .5) * 6;
      target.style.transform = `translate(${x}px, ${y}px)`;
    });
    target.addEventListener('pointerleave', () => { target.style.transform = ''; });
  });
}
