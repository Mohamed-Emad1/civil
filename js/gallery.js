const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxCaption = lightbox?.querySelector('p');
const lightboxClose = lightbox?.querySelector('.lightbox-close');
const lightboxPrev = lightbox?.querySelector('.lightbox-prev');
const lightboxNext = lightbox?.querySelector('.lightbox-next');
let lightboxItems = [];
let activeLightboxIndex = 0;
let previousFocus = null;

const renderLightboxItem = index => {
  activeLightboxIndex = (index + lightboxItems.length) % lightboxItems.length;
  const item = lightboxItems[activeLightboxIndex];
  lightboxImage.src = item.image;
  lightboxImage.alt = item.title;
  lightboxCaption.textContent = item.title;
};

export const openLightbox = (items, index = 0) => {
  lightboxItems = items;
  previousFocus = document.activeElement;
  renderLightboxItem(index);
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
