/* SENSY — interacción mínima: nav, menú, reveals, contadores, lightbox, progreso. Sin dependencias. */
(() => {
  // Enlaces externos en un solo lugar: reemplazar por las URLs oficiales cuando estén.
  const LINKS = {
    spotify: 'https://open.spotify.com/search/Sensy',
    youtube: 'https://www.youtube.com/@sensyoficial',
    instagram: 'https://www.instagram.com/sensyoficial',
  };
  document.querySelectorAll('[data-link]').forEach(a => {
    const url = LINKS[a.dataset.link]; if (!url) return;
    a.href = url;
    if (a.hasAttribute('data-label')) a.textContent = url.replace(/^https?:\/\/(www\.)?/, '');
  });

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Nav: fondo al hacer scroll + sección activa + barra de progreso
  const nav = document.getElementById('nav');
  const bar = document.querySelector('.progress span');
  const links = [...document.querySelectorAll('.nav__links a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 24);
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty('--p', h > 0 ? (y / h).toFixed(4) : 0);
    let current = null;
    for (const s of sections) if (s.getBoundingClientRect().top <= innerHeight * 0.4) current = s;
    links.forEach(a => a.classList.toggle('is-active', current && a.getAttribute('href') === '#' + current.id));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Menú móvil
  const burger = document.getElementById('burger'), menu = document.getElementById('menu');
  const setMenu = open => { burger.setAttribute('aria-expanded', String(open)); menu.hidden = !open; document.body.classList.toggle('menu-open', open); burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú'); };
  burger.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', e => { if (e.target.tagName === 'A') setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  // Reveals al entrar en viewport
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Contadores de las estadísticas (una sola vez)
  const counters = document.querySelectorAll('[data-count]');
  const cio = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return; cio.unobserve(en.target);
      const el = en.target, to = +el.dataset.count, suf = el.dataset.suffix || '';
      if (reduce) { el.textContent = to + suf; return; }
      const t0 = performance.now(), dur = 1100;
      const tick = t => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e) + suf; if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => cio.observe(c));

  // Parallax suave de la foto de la cita
  const qp = document.querySelector('.quote__photo');
  if (qp && !reduce) {
    const par = () => { const r = qp.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; qp.style.transform = `scale(1.06) translateY(${(p * -30).toFixed(1)}px)`; };
    addEventListener('scroll', par, { passive: true }); par();
  }

  // Lightbox accesible (dialog nativo)
  const lb = document.getElementById('lightbox'), lbImg = document.getElementById('lbImg'), lbCap = document.getElementById('lbCap');
  let opener = null;
  document.querySelectorAll('[data-lightbox]').forEach(btn => btn.addEventListener('click', () => {
    opener = btn; const img = btn.querySelector('img');
    lbImg.src = btn.dataset.lightbox; lbImg.alt = img ? img.alt : ''; lbCap.textContent = btn.dataset.caption || '';
    lb.showModal(); document.body.style.overflow = 'hidden';
  }));
  const close = () => { lb.close(); };
  document.getElementById('lbClose').addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  lb.addEventListener('close', () => { document.body.style.overflow = ''; lbImg.src = ''; opener && opener.focus(); });
})();
