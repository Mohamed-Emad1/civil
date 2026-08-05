const filterButtons = document.querySelectorAll('.filter-button');
const projectCards = [...document.querySelectorAll('.project-card')];
const mediaCards = [...document.querySelectorAll('.media-card')];
const projectGrid = document.querySelector('#projectGrid');

filterButtons.forEach(button => button.addEventListener('click', () => {
  filterButtons.forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  const filter = button.dataset.filter;
  projectGrid?.classList.toggle('is-filtered', filter !== 'all');
  projectCards.forEach(card => {
    const show = filter === 'all' || card.dataset.category === filter;
    if (show) {
      card.classList.remove('hidden', 'is-filtering-out');
      card.classList.remove('is-visible');
      requestAnimationFrame(() => card.classList.add('is-visible', 'is-filtering-in'));
      window.setTimeout(() => card.classList.remove('is-filtering-in'), 380);
    } else {
      card.classList.add('is-filtering-out');
      window.setTimeout(() => card.classList.add('hidden'), 320);
    }
  });
}));

const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxCaption = lightbox?.querySelector('p');
const lightboxClose = lightbox?.querySelector('.lightbox-close');
const lightboxPrev = lightbox?.querySelector('.lightbox-prev');
const lightboxNext = lightbox?.querySelector('.lightbox-next');
const lightboxItems = [...projectCards, ...mediaCards];
let activeLightboxIndex = 0;
let previousFocus = null;

const renderLightboxItem = index => {
  activeLightboxIndex = (index + lightboxItems.length) % lightboxItems.length;
  const item = lightboxItems[activeLightboxIndex];
  lightboxImage.src = item.dataset.image;
  lightboxImage.alt = item.dataset.title;
  lightboxCaption.textContent = item.dataset.title;
};

const openLightbox = item => {
  previousFocus = document.activeElement;
  renderLightboxItem(lightboxItems.indexOf(item));
  lightbox?.classList.add('open');
  lightbox?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
  lightboxClose?.focus();
};

const closeLightbox = () => {
  lightbox?.classList.remove('open');
  lightbox?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
  previousFocus?.focus?.();
};

projectCards.forEach(card => card.addEventListener('click', () => openLightbox(card)));
mediaCards.forEach(card => card.addEventListener('click', () => openLightbox(card)));
lightboxClose?.addEventListener('click', closeLightbox);
lightboxPrev?.addEventListener('click', () => renderLightboxItem(activeLightboxIndex - 1));
lightboxNext?.addEventListener('click', () => renderLightboxItem(activeLightboxIndex + 1));
lightbox?.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', event => {
  if (!lightbox?.classList.contains('open')) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') renderLightboxItem(activeLightboxIndex + 1);
  if (event.key === 'ArrowRight') renderLightboxItem(activeLightboxIndex - 1);
  if (event.key === 'Tab') {
    const focusable = [lightboxClose, lightboxPrev, lightboxNext].filter(Boolean);
    const current = focusable.indexOf(document.activeElement);
    if (event.shiftKey && current === 0) { event.preventDefault(); focusable[focusable.length - 1].focus(); }
    if (!event.shiftKey && current === focusable.length - 1) { event.preventDefault(); focusable[0].focus(); }
  }
});
