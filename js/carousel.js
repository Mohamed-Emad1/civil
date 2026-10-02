import { openLightbox } from './gallery.js';

const showcase = document.querySelector('.project-showcase');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const pad = n => String(n).padStart(2, '0');

class Carousel {
  constructor(panel, onUserInput) {
    this.panel = panel;
    this.stage = panel.querySelector('.pc-stage');
    this.slides = [...panel.querySelectorAll('.pc-slide')];
    this.dots = [...panel.querySelectorAll('.pc-dot')];
    this.current = panel.querySelector('.pc-current');
    this.onUserInput = onUserInput;
    this.index = 0;
    this.offsets = [];
    this.wheelLocked = false;
    this.dragged = false;

    this.slides.forEach((slide, i) => {
      const bg = document.createElement('i');
      bg.className = 'pc-bg';
      bg.style.setProperty('--img', slide.style.getPropertyValue('--img'));
      this.stage.prepend(bg);
      slide._bg = bg;
      const img = slide.querySelector('img');
      const markShape = () => slide.classList.toggle('is-portrait', img.naturalHeight > img.naturalWidth);
      if (img.complete) markShape(); else img.addEventListener('load', markShape, { once: true });
      slide.addEventListener('click', () => {
        if (this.dragged) return;
        if (i === this.index) {
          openLightbox(this.slides.map(s => ({ image: s.dataset.image, title: s.dataset.title })), i);
        } else {
          this.go(i, true);
        }
      });
    });

    this.dots.forEach((dot, i) => dot.addEventListener('click', () => this.go(i, true)));
    panel.querySelector('.pc-prev').addEventListener('click', () => this.prev(true));
    panel.querySelector('.pc-next').addEventListener('click', () => this.next(true));
    this.bindStage();
    this.layout(true);
  }

  /* Signed shortest distance on a loop, so the carousel is endless. */
  offset(i) {
    const n = this.slides.length;
    const half = Math.floor(n / 2);
    return ((i - this.index + n + half) % n) - half;
  }

  layout(instant = false) {
    this.slides.forEach((slide, i) => {
      const d = this.offset(i);
      const wrapped = Math.abs(d - (this.offsets[i] ?? d)) > 1;
      // A slide wrapping around the loop jumps while invisible instead of flying across.
      if (instant || wrapped) slide.style.transition = 'none';
      slide.style.setProperty('--d', d);
      slide.style.setProperty('--abs', Math.min(Math.abs(d), 2));
      slide.classList.toggle('is-active', d === 0);
      slide.classList.toggle('is-far', Math.abs(d) > 1);
      slide._bg.classList.toggle('is-active', d === 0);
      this.offsets[i] = d;
      if (instant || wrapped) {
        void slide.offsetWidth;
        slide.style.transition = '';
      }
    });
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === this.index);
      dot.setAttribute('aria-current', i === this.index ? 'true' : 'false');
    });
    this.current.textContent = pad(this.index + 1);
  }

  go(index, byUser = false) {
    const n = this.slides.length;
    this.index = ((index % n) + n) % n;
    this.layout();
    if (byUser) this.onUserInput();
  }
  next(byUser = false) { this.go(this.index + 1, byUser); }
  prev(byUser = false) { this.go(this.index - 1, byUser); }

  bindStage() {
    const stage = this.stage;
    let startX = 0;
    let active = false;

    stage.addEventListener('pointerdown', event => {
      if (event.target.closest('.pc-arrow') || (event.pointerType === 'mouse' && event.button !== 0)) return;
      active = true;
      this.dragged = false;
      startX = event.clientX;
    });
    stage.addEventListener('pointermove', event => {
      if (!active) return;
      if (!this.dragged && Math.abs(event.clientX - startX) > 8) {
        this.dragged = true;
        stage.classList.add('is-dragging');
        stage.setPointerCapture(event.pointerId);
      }
    });
    const end = event => {
      if (!active) return;
      active = false;
      stage.classList.remove('is-dragging');
      const dx = event.clientX - startX;
      if (this.dragged && Math.abs(dx) > 40) {
        // Content follows the finger; the page is RTL so "next" lives on the left.
        if (dx < 0) this.next(true); else this.prev(true);
      }
      // Keep the flag through the click that follows pointerup, then reset.
      setTimeout(() => { this.dragged = false; }, 0);
    };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);

    stage.addEventListener('wheel', event => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 20) return;
      event.preventDefault();
      if (this.wheelLocked) return;
      this.wheelLocked = true;
      setTimeout(() => { this.wheelLocked = false; }, 450);
      if (event.deltaX > 0) this.next(true); else this.prev(true);
    }, { passive: false });

    stage.addEventListener('keydown', event => {
      const keys = { ArrowLeft: () => this.next(true), ArrowRight: () => this.prev(true), Home: () => this.go(0, true), End: () => this.go(this.slides.length - 1, true) };
      if (!keys[event.key]) return;
      event.preventDefault();
      keys[event.key]();
    });
  }
}

if (showcase) {
  const tabs = [...showcase.querySelectorAll('.pc-tab')];
  const panels = [...showcase.querySelectorAll('.pc-panel')];
  const toggle = showcase.querySelector('.pc-toggle');
  const toggleText = toggle.querySelector('.pc-toggle-text');
  const interval = Number(showcase.dataset.autoplay) || 3600;

  let activePanel = 0;
  let userPaused = reducedMotion.matches;
  let hovering = false;
  let inView = false;
  let timer = null;

  const carousels = panels.map(panel => new Carousel(panel, () => restart()));
  const lightboxOpen = () => document.querySelector('.lightbox.open');
  const shouldPlay = () => !userPaused && !hovering && inView && !document.hidden && !lightboxOpen();

  const restart = () => {
    clearInterval(timer);
    timer = setInterval(() => { if (shouldPlay()) carousels[activePanel].next(); }, interval);
  };

  const syncToggle = () => {
    toggle.setAttribute('aria-pressed', String(userPaused));
    toggle.setAttribute('aria-label', userPaused ? 'تشغيل العرض التلقائي' : 'إيقاف العرض التلقائي');
    toggleText.textContent = userPaused ? 'تشغيل' : 'إيقاف مؤقت';
  };
  toggle.addEventListener('click', () => { userPaused = !userPaused; syncToggle(); });
  syncToggle();

  const selectProject = (index, focus = false) => {
    activePanel = index;
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.classList.toggle('active', on);
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
    });
    carousels[index].go(0);
    carousels[index].layout(true);
    tabs[index].scrollIntoView({ inline: 'center', block: 'nearest', behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    if (focus) tabs[index].focus();
    restart();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectProject(i));
    tab.addEventListener('keydown', event => {
      // RTL: the first tab sits on the right, so ArrowLeft moves to the next one.
      const move = { ArrowLeft: 1, ArrowRight: -1 }[event.key];
      if (move) { event.preventDefault(); selectProject((i + move + tabs.length) % tabs.length, true); }
    });
  });

  showcase.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') hovering = true; });
  showcase.addEventListener('pointerleave', () => { hovering = false; });
  showcase.addEventListener('focusin', event => { if (event.target.closest('.pc-stage, .pc-arrow, .pc-dot')) hovering = true; });
  showcase.addEventListener('focusout', () => { hovering = false; });

  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { threshold: .25 }).observe(showcase);
  restart();
}
