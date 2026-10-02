const root = document.querySelector('.vc');

if (root) {
  const slides = [...root.querySelectorAll('.vc-slide')];
  const n = slides.length;
  let index = 0;
  let busy = false;

  const preload = i => {
    const video = slides[((i % n) + n) % n].querySelector('video');
    if (video.preload !== 'metadata') video.preload = 'metadata';
  };

  /* dir = 1 goes to the next clip. The page is RTL, so "next" enters from the left. */
  const go = dir => {
    if (busy) return;
    busy = true;
    const next = ((index + dir) % n + n) % n;
    const current = slides[index];
    const incoming = slides[next];

    current.querySelector('video').pause();
    incoming.style.visibility = 'visible';
    incoming.dataset.status = dir > 0 ? 'from-before' : 'from-after';
    void incoming.offsetWidth;
    current.dataset.status = dir > 0 ? 'before' : 'after';
    incoming.dataset.status = 'active';
    incoming.setAttribute('aria-current', 'true');
    current.removeAttribute('aria-current');
    index = next;
    preload(next + 1);
    preload(next - 1);

    setTimeout(() => {
      current.dataset.status = 'inactive';
      current.style.visibility = '';
      busy = false;
    }, 520);
  };

  root.querySelectorAll('.vc-btn').forEach(btn => btn.addEventListener('click', () => go(Number(btn.dataset.dir))));

  root.addEventListener('keydown', event => {
    if (event.target.closest('video')) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); go(-1); }
  });

  let startX = null;
  root.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' || event.target.closest('video, button')) return;
    startX = event.clientX;
  });
  root.addEventListener('pointerup', event => {
    if (startX === null) return;
    const dx = event.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  });

  slides[0].setAttribute('aria-current', 'true');
  preload(1);
}
