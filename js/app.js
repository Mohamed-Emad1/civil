import './theme.js';
import './navbar.js';
import './scroll.js';
import './counter.js';
import './gallery.js';
import './before-after.js';
import './slider.js';
import './animations.js';
import './insights.js';

const form = document.querySelector('#contactForm');
form?.addEventListener('submit', event => {
  event.preventDefault();
  const fields = [...form.querySelectorAll('input[required], select[required]')];
  let valid = true;
  fields.forEach(field => { const wrapper = field.closest('.field'); const isValid = field.value.trim() && (field.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)); wrapper.classList.toggle('invalid', !isValid); valid = valid && isValid; });
  const status = form.querySelector('.form-status');
  if (!valid) { status.textContent = 'يرجى مراجعة الحقول المطلوبة.'; status.style.color = '#c98977'; return; }
  status.textContent = 'وصلتنا رسالتك — سنعود إليك خلال يومي عمل.'; status.style.color = 'var(--success)'; form.reset();
});
