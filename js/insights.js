const root = document.documentElement;
const svgNS = 'http://www.w3.org/2000/svg';
const arabicDigits = value => String(Math.round(value)).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const years = [
  [2010, 1], [2011, 1], [2012, 2], [2013, 2], [2014, 3], [2015, 3], [2016, 4], [2017, 5],
  [2018, 5], [2019, 6], [2020, 4], [2021, 6], [2022, 8], [2023, 9], [2024, 10], [2025, 10], [2026, 7],
].map(([year, value]) => ({ year, value }));

const categories = [
  { label: 'سكني', value: 36, varName: '--chart-1' },
  { label: 'داخلي', value: 20, varName: '--chart-2' },
  { label: 'تجاري', value: 18, varName: '--chart-3' },
  { label: 'فراغات عامة', value: 12, varName: '--chart-4' },
];

const cities = [
  ['القاهرة الجديدة', 14], ['الشيخ زايد', 12], ['المعادي', 10], ['القاهرة', 9], ['الجيزة', 8],
  ['الساحل الشمالي', 8], ['الإسكندرية', 7], ['الغردقة', 6], ['العين السخنة', 5], ['المنصورة', 4], ['أسوان', 3],
].map(([label, value]) => ({ label, value }));

const totalProjects = years.reduce((sum, d) => sum + d.value, 0);

let tooltipEl;
function tooltip() {
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'chart-tooltip';
    tooltipEl.setAttribute('role', 'status');
    document.body.appendChild(tooltipEl);
  }
  return tooltipEl;
}
function showTooltip(x, y, html) {
  const el = tooltip();
  el.innerHTML = html;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.classList.add('is-visible');
}
function hideTooltip() {
  tooltipEl?.classList.remove('is-visible');
}

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(svgNS, tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  return el;
}

function renderLineChart(container) {
  container.innerHTML = '';
  const width = 760, height = 220, padTop = 16, padSide = 6, padBottom = 30;
  const plotW = width - padSide * 2, plotH = height - padTop - padBottom;
  const maxValue = 10;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${width} ${height}`, class: 'chart-svg', role: 'img',
    'aria-label': `نمو المشاريع المكتملة من عام ${arabicDigits(years[0].year)} إلى ${arabicDigits(years.at(-1).year)}`,
  });

  const grid = svgEl('g', { class: 'chart-grid' });
  [0, 5, 10].forEach(tick => {
    const y = padTop + plotH - (tick / maxValue) * plotH;
    grid.appendChild(svgEl('line', { x1: padSide, x2: width - padSide, y1: y.toFixed(1), y2: y.toFixed(1) }));
    const tickLabel = svgEl('text', { x: padSide, y: y - 6, class: 'chart-tick' });
    tickLabel.textContent = arabicDigits(tick);
    grid.appendChild(tickLabel);
  });
  svg.appendChild(grid);

  const points = years.map((d, i) => ({
    ...d,
    x: padSide + (i / (years.length - 1)) * plotW,
    y: padTop + plotH - (d.value / maxValue) * plotH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${points.at(-1).x.toFixed(1)},${(padTop + plotH).toFixed(1)} L${points[0].x.toFixed(1)},${(padTop + plotH).toFixed(1)} Z`;

  const area = svgEl('path', { d: areaPath, class: 'chart-area' });
  const line = svgEl('path', { d: linePath, class: 'chart-line-path', fill: 'none' });
  svg.appendChild(area);
  svg.appendChild(line);

  points.forEach((p, i) => {
    if (i % 4 === 0 || i === points.length - 1) {
      const anchor = i === points.length - 1 ? 'end' : i === 0 ? 'start' : 'middle';
      const tickLabel = svgEl('text', { x: p.x.toFixed(1), y: height - 10, class: 'chart-tick', 'text-anchor': anchor });
      tickLabel.textContent = arabicDigits(p.year);
      svg.appendChild(tickLabel);
    }
  });

  const last = points.at(-1);
  svg.appendChild(svgEl('circle', { cx: last.x.toFixed(1), cy: last.y.toFixed(1), r: 4, class: 'chart-marker' }));
  const endLabel = svgEl('text', { x: (last.x - 10).toFixed(1), y: (last.y - 12).toFixed(1), class: 'chart-end-label', 'text-anchor': 'end' });
  endLabel.textContent = `${arabicDigits(last.year)} · ${arabicDigits(last.value)}`;
  svg.appendChild(endLabel);

  const hoverMarker = svgEl('circle', { r: 5, class: 'chart-marker', style: 'opacity:0' });
  svg.appendChild(hoverMarker);

  points.forEach(p => {
    const hit = svgEl('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 13, class: 'chart-hit', tabindex: '0' });
    const activate = () => {
      hoverMarker.setAttribute('cx', p.x.toFixed(1));
      hoverMarker.setAttribute('cy', p.y.toFixed(1));
      hoverMarker.style.opacity = '1';
      const rect = svg.getBoundingClientRect();
      const scaleX = rect.width / width, scaleY = rect.height / height;
      showTooltip(rect.left + p.x * scaleX, rect.top + p.y * scaleY, `<b>${arabicDigits(p.year)}</b><span>${arabicDigits(p.value)} مشروعاً</span>`);
    };
    const deactivate = () => { hoverMarker.style.opacity = '0'; hideTooltip(); };
    hit.addEventListener('pointerenter', activate);
    hit.addEventListener('pointerleave', deactivate);
    hit.addEventListener('focus', activate);
    hit.addEventListener('blur', deactivate);
    svg.appendChild(hit);
  });

  container.appendChild(svg);

  const length = line.getTotalLength();
  if (!reducedMotion.matches) {
    line.style.strokeDasharray = String(length);
    line.style.strokeDashoffset = String(length);
    area.style.opacity = '0';
  }

  return () => {
    if (reducedMotion.matches) return;
    line.style.transition = 'stroke-dashoffset 1.4s var(--ease)';
    line.style.strokeDashoffset = '0';
    area.style.transition = 'opacity 1s var(--ease) .3s';
    area.style.opacity = '1';
  };
}

function renderBarList(container, items, { categorical = false, percentOf } = {}) {
  container.innerHTML = '';
  const max = Math.max(...items.map(i => i.value));
  const list = document.createElement('div');
  list.className = 'bar-list';

  items.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.tabIndex = 0;
    row.style.setProperty('--bar-delay', `${i * 70}ms`);

    const label = document.createElement('span');
    label.className = 'bar-label';
    label.textContent = item.label;

    const track = document.createElement('span');
    track.className = 'bar-track';

    const fill = document.createElement('span');
    fill.className = 'bar-fill';
    fill.style.background = categorical ? `var(${item.varName})` : 'var(--accent)';
    fill.style.setProperty('--bar-pct', `${(item.value / max) * 100}%`);

    const value = document.createElement('span');
    value.className = 'bar-value';
    value.textContent = arabicDigits(item.value);

    track.appendChild(fill);
    track.appendChild(value);
    row.appendChild(label);
    row.appendChild(track);
    list.appendChild(row);

    const onEnter = () => {
      const rect = track.getBoundingClientRect();
      const pct = percentOf ? ` · ${arabicDigits(Math.round((item.value / percentOf) * 100))}%` : '';
      showTooltip(rect.left + rect.width / 2, rect.top, `<b>${item.label}</b><span>${arabicDigits(item.value)} مشروعاً${pct}</span>`);
    };
    row.addEventListener('pointerenter', onEnter);
    row.addEventListener('focus', onEnter);
    row.addEventListener('pointerleave', hideTooltip);
    row.addEventListener('blur', hideTooltip);
  });

  container.appendChild(list);

  return () => {
    list.querySelectorAll('.bar-fill, .bar-value').forEach(el => el.classList.add('is-grown'));
  };
}

function renderLegend(container, items) {
  container.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<i style="background:var(${item.varName})"></i>${item.label}`;
    container.appendChild(li);
  });
}

function fillTable(tbody, rows) {
  tbody.innerHTML = rows.map(([label, value]) => `<tr><td>${label}</td><td>${arabicDigits(value)}</td></tr>`).join('');
}

function init() {
  const section = document.getElementById('insights');
  if (!section) return;

  const yearsHost = document.getElementById('chartYears');
  const categoriesHost = document.getElementById('chartCategories');
  const citiesHost = document.getElementById('chartCities');

  const growLine = renderLineChart(yearsHost);
  const growCategories = renderBarList(categoriesHost, categories, { categorical: true, percentOf: totalProjects });
  const growCities = renderBarList(citiesHost, cities, { percentOf: totalProjects });
  renderLegend(document.getElementById('categoryLegend'), categories);

  fillTable(document.getElementById('yearsTableBody'), years.map(d => [arabicDigits(d.year), d.value]));
  fillTable(document.getElementById('categoriesTableBody'), categories.map(d => [d.label, d.value]));
  fillTable(document.getElementById('citiesTableBody'), cities.map(d => [d.label, d.value]));

  new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    growLine();
    growCategories();
    growCities();
    observer.disconnect();
  }, { threshold: .2 }).observe(section);

  let themeTimer;
  new MutationObserver(() => {
    clearTimeout(themeTimer);
    themeTimer = setTimeout(() => {
      renderLineChart(yearsHost)();
      renderBarList(categoriesHost, categories, { categorical: true, percentOf: totalProjects })();
      renderBarList(citiesHost, cities, { percentOf: totalProjects })();
    }, 350);
  }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
}

init();
