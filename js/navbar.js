const header = document.querySelector('.site-header');
const menu = document.querySelector('.main-nav');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelectorAll('.nav-link');
const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 30);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();
menuToggle?.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuToggle.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('no-scroll', open);
});
navLinks.forEach(link => link.addEventListener('click', () => {
  menu.classList.remove('open'); menuToggle?.classList.remove('open'); document.body.classList.remove('no-scroll');
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.classList.contains('open')) {
    menu.classList.remove('open'); menuToggle?.classList.remove('open'); menuToggle?.setAttribute('aria-expanded', 'false'); document.body.classList.remove('no-scroll'); menuToggle?.focus();
  }
});
const sections = [...document.querySelectorAll('main section[id]')];
const linkById = new Map([...navLinks].map(link => [link.getAttribute('href').slice(1), link]));
const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { navLinks.forEach(link => link.classList.remove('active')); linkById.get(entry.target.id)?.classList.add('active'); }
}), { rootMargin: '-30% 0px -55% 0px' });
sections.forEach(section => navObserver.observe(section));
