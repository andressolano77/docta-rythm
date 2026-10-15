/* =========================================================
   DOCTA RYTHM SELECTA — interacciones y animaciones
   ========================================================= */
(() => {
  'use strict';

  // ---- Config -------------------------------------------------
  const BOOKING_EMAIL = 'calldidocta@gmail.com';
  // Si se configura un endpoint (Formspree, Getform, etc.) el formulario
  // se envía por POST sin abrir el correo. Ej: 'https://formspree.io/f/xxxxxx'
  // Debe ser https y su origen tiene que agregarse a connect-src en la CSP de index.html.
  const FORM_ENDPOINT = '';
  const SHORT_BIO = 'Docta Rythm Selecta, "El Doctor del Ritmo", es selecta, productor y radio host de San José, Costa Rica. Desde 2005 mueve pistas con reggae roots, dancehall, dub, rocksteady y ska. Fundador de Call Di Docta Records y Dancehall Madness CR, parte de The Aces Sounds, y con presencia en el Rototom Sunsplash 2025. Ha compartido cartel con Sizzla, Gentleman, T.O.K., Mr. Vegas y Capleton.';

  const SOCIALS = [
    { name: 'Instagram', url: 'https://www.instagram.com/doctarythmselecta/',
      svg: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>' },
    { name: 'Facebook', url: 'https://www.facebook.com/DoctaRythmSelecta',
      svg: '<path d="M14 21v-8h3l.5-3.5H14V7.6c0-1 .3-1.7 1.8-1.7h1.8V2.8A24 24 0 0 0 15 2.6c-2.6 0-4.4 1.6-4.4 4.5v2.4H7.7V13h2.9v8"/>' },
    { name: 'SoundCloud', url: 'https://soundcloud.com/doctarythmselecta',
      svg: '<path d="M10 17V9.5M7 17v-6M4 17v-3.5M1.5 16.5V15"/><path d="M13 17V8a5 5 0 0 1 9.3 2.6A3.2 3.2 0 0 1 20 17z"/>' },
    { name: 'YouTube', url: 'https://www.youtube.com/@CallDiDoctaMovement',
      svg: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z" fill="currentColor"/>' },
    { name: 'Spotify', url: 'https://open.spotify.com/artist/25P6JrY91mpiTqMJ50JpEH',
      svg: '<circle cx="12" cy="12" r="10"/><path d="M7 9.5c3.5-1 7.5-.6 10.5 1M7.5 12.8c2.8-.8 6-.4 8.5 1M8 15.8c2.2-.5 4.4-.3 6.3.8"/>' },
  ];

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const mediaStarted = src => window.dispatchEvent(new CustomEvent('docta:media', { detail: src }));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const animOn = hasGSAP && !reduceMotion;

  if (animOn) {
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('js-anim');
  }

  // ---- Social icons -------------------------------------------
  $$('[data-social]').forEach(box => {
    box.innerHTML = SOCIALS.map(s =>
      `<a class="social" href="${s.url}" target="_blank" rel="noopener" aria-label="${s.name}"><svg viewBox="0 0 24 24" aria-hidden="true">${s.svg}</svg></a>`
    ).join('');
  });
  const yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Split text helpers -------------------------------------
  // Construido con DOM (textContent), sin reinterpretar texto como HTML
  $$('.split').forEach(el => {
    el.replaceChildren(...[...el.textContent].map(c => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = c === ' ' ? '\u00a0' : c;
      return s;
    }));
  });

  // Agrupa palabras en líneas visuales para el reveal de títulos
  const splitSrc = new WeakMap();
  function splitLines(el) {
    if (!splitSrc.has(el)) splitSrc.set(el, el.cloneNode(true));
    const words = [];
    const walk = (node, em) => node.childNodes.forEach(n => {
      if (n.nodeType === 3) n.textContent.split(/\s+/).forEach(w => { if (w) words.push({ w, em }); });
      else if (n.nodeType === 1) walk(n, em || n.tagName === 'EM');
    });
    walk(splitSrc.get(el), false);
    const wordEl = o => {
      const span = document.createElement('span');
      span.className = 'wd';
      if (o.em) { const e = document.createElement('em'); e.textContent = o.w; span.append(e); }
      else span.textContent = o.w;
      return span;
    };
    el.replaceChildren(...words.flatMap((o, i) => (i ? [' ', wordEl(o)] : [wordEl(o)])));
    const lines = [];
    let top = null;
    $$('.wd', el).forEach(w => {
      const t = w.offsetTop;
      if (top === null || Math.abs(t - top) > 4) { lines.push([]); top = t; }
      lines[lines.length - 1].push(w);
    });
    el.replaceChildren(...lines.map(l => {
      const ln = document.createElement('span');
      const inner = document.createElement('span');
      ln.className = 'ln';
      l.forEach((w, i) => { if (i) inner.append(' '); inner.append(...w.childNodes); });
      ln.append(inner);
      return ln;
    }));
  }

  // ---- Smooth scroll (Lenis) ----------------------------------
  let lenis = null;
  if (animOn && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const scrollToTarget = target => {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2 || !$(id)) return;
    e.preventDefault();
    closeMenu();
    scrollToTarget(id);
  }));

  // ---- Preloader + intro --------------------------------------
  const pre = $('.preloader');
  const countEl = $('.preloader__count span');
  const stripes = $$('.preloader__stripes i');
  let progress = 0;
  const imgs = $$('img').filter(i => !i.loading || i.loading !== 'lazy');
  const heroBg = new Image(); heroBg.src = 'assets/img/decks-smile.jpg';
  const toLoad = [...imgs, heroBg];
  let loaded = 0;
  const bump = () => { loaded++; };
  toLoad.forEach(img => { if (img.complete) bump(); else { img.addEventListener('load', bump, { once: true }); img.addEventListener('error', bump, { once: true }); } });

  const t0 = performance.now();
  const tick = () => {
    const target = Math.min(100, (loaded / toLoad.length) * 100);
    const minTime = Math.min(100, ((performance.now() - t0) / 700) * 100);
    progress += (Math.min(target, minTime) - progress) * 0.2 + 0.8;
    progress = Math.min(progress, 100);
    countEl.textContent = Math.floor(progress);
    stripes.forEach((s, i) => s.style.setProperty('--p', Math.max(0, Math.min(1, (progress - i * 15) / 70))));
    if (progress < 99.5 && performance.now() - t0 < 6000) requestAnimationFrame(tick);
    else finishLoad();
  };
  requestAnimationFrame(tick);

  let introDone = false;
  function finishLoad() {
    if (introDone) return; introDone = true;
    countEl.textContent = '100';
    document.body.classList.remove('is-loading');
    if (lenis) lenis.start();
    setTimeout(radioAutostart, animOn ? 1600 : 300);
    if (!animOn) { pre.remove(); afterIntro(); return; }
    const tl = gsap.timeline({ onComplete: afterIntro });
    tl.to('.preloader__vinyl, .preloader__txt, .preloader__count', { y: -30, opacity: 0, duration: .35, stagger: .04, ease: 'power2.in' })
      .to(pre, { clipPath: 'inset(0 0 100% 0)', duration: .8, ease: 'expo.inOut' }, '-=.1')
      .set(pre, { display: 'none' })
      .from('.hero__slide.is-active', { scale: 1.35, duration: 2.2, ease: 'expo.out' }, '-=.8')
      .from('.hero__title .ch', { yPercent: 115, rotate: 8, duration: 1.1, stagger: .045, ease: 'expo.out' }, '-=2')
      .from('.hero__eyebrow', { y: 20, opacity: 0, duration: .7 }, '-=1.4')
      .from('.hero__script', { scale: .6, rotate: -14, opacity: 0, duration: .9, ease: 'back.out(2)' }, '-=1.1')
      .from('.hero__lead', { y: 24, opacity: 0, duration: .8 }, '-=.8')
      .from('.hero__ctas > *', { y: 24, opacity: 0, duration: .7, stagger: .1 }, '-=.6')
      .from('.hero__badge', { scale: 0, rotate: -180, duration: 1.1, ease: 'back.out(1.6)' }, '-=1')
      .from('.nav', { opacity: 0, duration: .8, clearProps: 'opacity' }, '-=1');
  }
  setTimeout(finishLoad, 7000); // salvavidas

  function afterIntro() {
    if (!animOn) return;
    // Parallax del hero al salir
    gsap.to('.hero__inner', { yPercent: 25, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__media', { yPercent: 18, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__title .ch', {
      yPercent: i => (i % 2 ? -18 : 18), ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
    });
  }

  // ---- Hero slideshow -----------------------------------------
  const slides = $$('.hero__slide');
  let si = 0;
  if (slides.length > 1 && !reduceMotion) {
    setInterval(() => {
      slides[si].classList.remove('is-active');
      si = (si + 1) % slides.length;
      slides[si].classList.add('is-active');
    }, 6000);
  }

  // ---- Hero equalizer (canvas) --------------------------------
  const eq = $('.hero__eq');
  let eqBoost = 0;
  if (eq) {
    const ctx = eq.getContext('2d');
    let w, h, bars, dpr;
    const colors = ['#ec3a2b', '#f6c429', '#1db35f'];
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = eq.clientWidth; h = eq.clientHeight;
      eq.width = w * dpr; eq.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bars = Math.floor(w / (w < 600 ? 9 : 12));
    };
    resize(); addEventListener('resize', resize);
    let visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(eq);
    const draw = t => {
      requestAnimationFrame(draw);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      const bw = w / bars;
      const time = t / 1000;
      const beat = Math.pow(Math.max(0, Math.sin(time * Math.PI * 2 * (90 / 60) / 2)), 8); // ~90 BPM one-drop
      for (let i = 0; i < bars; i++) {
        const x = i / bars;
        const n = (Math.sin(i * .35 + time * 2.1) + Math.sin(i * .12 - time * 1.3) * .8 + Math.sin(i * .9 + time * 4) * .3) / 2.1;
        const env = Math.sin(x * Math.PI) * .7 + .3;
        const amp = reduceMotion ? .25 : (.18 + .5 * Math.abs(n) * env + beat * .35 * env + eqBoost * .35 * env);
        const bh = Math.max(3, amp * h);
        ctx.fillStyle = colors[Math.floor(x * 3) % 3];
        ctx.globalAlpha = .35 + amp * .6;
        ctx.fillRect(i * bw + 1, h - bh, bw - 3, bh);
      }
    };
    requestAnimationFrame(draw);
  }

  // ---- Nav: scrolled / hide on scroll / current ---------------
  const nav = $('#nav');
  const sticky = $('.sticky-cta');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    nav.classList.toggle('is-hidden', y > 400 && y > lastY && !document.body.classList.contains('menu-open'));
    const bookTop = $('#contrataciones').getBoundingClientRect();
    const inBooking = bookTop.top < innerHeight * .6 && bookTop.bottom > innerHeight * .4;
    const stickyOn = y > innerHeight * .8 && !inBooking;
    sticky.classList.toggle('is-on', stickyOn);
    document.body.classList.toggle('has-sticky', stickyOn);
    const rEl = $('#radio'); if (rEl) rEl.classList.toggle('is-compact', y > innerHeight * .8);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const navLinks = $$('.nav__links a');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => io.observe(s));

  // ---- Mobile menu --------------------------------------------
  const burger = $('.nav__burger');
  const menu = $('#menu');
  function closeMenu() {
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start();
  }
  burger.addEventListener('click', () => {
    const open = !document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', open);
    nav.classList.remove('is-hidden');
    burger.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-hidden', String(!open));
    if (lenis) open ? lenis.stop() : lenis.start();
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); closeModal(); } });

  // ---- Scroll reveals -----------------------------------------
  function setupReveals() {
    if (!animOn) return;
    $$('.reveal-lines').forEach(splitLines);
    $$('.reveal-lines').forEach(el => {
      gsap.fromTo($$('.ln > span', el), { yPercent: 105, y: 0 }, {
        yPercent: 0, y: 0, duration: 1.1, stagger: .1, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });
    ScrollTrigger.batch('.reveal', {
      start: 'top 88%',
      onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 1, stagger: .08, ease: 'expo.out', overwrite: true }),
    });

    // Parallax en fotos de la bio
    $$('[data-parallax]').forEach(el => {
      gsap.fromTo(el, { yPercent: -parseFloat(el.dataset.parallax) }, {
        yPercent: parseFloat(el.dataset.parallax), ease: 'none',
        scrollTrigger: { trigger: '.bio', start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
    gsap.from('.bio__ph', { clipPath: 'inset(100% 0 0 0)', duration: 1.4, stagger: .2, ease: 'expo.inOut', scrollTrigger: { trigger: '.bio__photos', start: 'top 80%' } });

    // Ticker inclina con la velocidad del scroll
    const rows = $$('.ticker__row');
    ScrollTrigger.create({
      trigger: '.ticker', start: 'top bottom', end: 'bottom top',
      onUpdate: self => {
        const v = gsap.utils.clamp(-6, 6, self.getVelocity() / 300);
        gsap.to(rows[0], { skewX: v, duration: .4 });
        gsap.to(rows[1], { skewX: -v, duration: .4 });
      }
    });

    // Lista de escenarios se "enciende" con el scroll
    const stageItems = $$('.stages__list li');
    ScrollTrigger.create({
      trigger: '.stages__list', start: 'top 80%', end: 'bottom 35%', scrub: true,
      onUpdate: self => {
        const n = Math.round(self.progress * stageItems.length);
        stageItems.forEach((li, i) => li.classList.toggle('is-lit', i < n));
      }
    });

    // Vinilo entra girando
    gsap.from('.deck__table', { rotate: -8, scale: .9, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.deck', start: 'top 80%' } });
    gsap.from('.track', { x: 40, opacity: 0, duration: .8, stagger: .07, ease: 'expo.out', scrollTrigger: { trigger: '.tracks', start: 'top 85%' } });

    // Booking: palabras gigantes de fondo
    gsap.to('.booking__bg span:nth-child(odd)', { xPercent: -18, ease: 'none', scrollTrigger: { trigger: '.booking', scrub: true } });
    gsap.to('.booking__bg span:nth-child(even)', { xPercent: 12, ease: 'none', scrollTrigger: { trigger: '.booking', scrub: true } });

    // Logos: sticker en la bio y logo 3D al final
    gsap.from('.bio__logo', { scale: 0, rotate: -60, duration: 1.2, ease: 'back.out(1.8)', scrollTrigger: { trigger: '.bio__photos', start: 'top 60%' } });
    gsap.from('.final__logo', { y: 100, scale: .6, rotateX: 50, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.final', start: 'top 80%' } });

    // Final CTA
    gsap.from('.final__big span', { yPercent: 60, opacity: 0, duration: 1.2, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: '.final', start: 'top 75%' } });

    // Galería horizontal (desktop) / parallax interno
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      const track = $('.gallery__track');
      const dist = () => track.scrollWidth - innerWidth;
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '.gallery', pin: '.gallery__pin', start: 'top top', end: () => '+=' + dist(), scrub: 1, invalidateOnRefresh: true }
      });
      $$('.gcard img').forEach(img => {
        gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      });
      gsap.from('.gcard', { y: 120, rotate: 4, opacity: 0, duration: 1.2, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.gallery', start: 'top 70%' } });
    });
    mm.add('(max-width: 899px)', () => {
      gsap.from('.gcard', { x: 80, opacity: 0, duration: 1, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.gallery', start: 'top 80%' } });
    });

    // Counters
    $$('[data-count]').forEach(el => {
      const end = parseFloat(el.dataset.count);
      const from = parseFloat(el.dataset.from || 0);
      const dec = parseInt(el.dataset.dec || 0, 10);
      const suf = el.dataset.suffix || '';
      const o = { v: from };
      gsap.to(o, {
        v: end, duration: 2.2, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' },
        onUpdate: () => { el.textContent = o.v.toFixed(dec) + suf; }
      });
    });
  }

  // Esperar fuentes para medir líneas correctamente
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => {
    setupReveals();
    if (animOn) ScrollTrigger.refresh();
  });

  // ---- Magnetic buttons + tilt --------------------------------
  if (finePointer && !reduceMotion) {
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * .25}px, ${y * .35}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
    $$('.tilt').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.rotate = `${x * 6}deg`;
        el.firstElementChild.style.transform = `scale(1.08) translate(${x * -12}px, ${y * -12}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.rotate = ''; el.firstElementChild.style.transform = ''; });
    });
  }

  // Logo 3D sigue al mouse
  const finalLogo = $('.final__logo');
  if (finePointer && !reduceMotion && finalLogo) {
    finalLogo.addEventListener('mousemove', e => {
      const r = finalLogo.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      finalLogo.style.transform = `perspective(900px) rotateY(${x * 18}deg) rotateX(${-y * 14}deg)`;
    });
    finalLogo.addEventListener('mouseleave', () => { finalLogo.style.transform = ''; });
    finalLogo.style.transition = 'transform .4s cubic-bezier(.2,.7,.1,1)';
  }

  // ---- Custom cursor ------------------------------------------
  if (finePointer && !reduceMotion) {
    const cur = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__ring em');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`; });
    const loop = () => {
      rx += (mx - rx) * .16; ry += (my - ry) * .16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('mouseover', e => {
      const play = e.target.closest('.vcard, [data-cursor]');
      const link = e.target.closest('a, button, input, select, textarea, label');
      cur.classList.toggle('is-play', !!play);
      cur.classList.toggle('is-link', !play && !!link);
      label.textContent = play ? (play.dataset.cursor || 'PLAY') : 'PLAY';
    });
  }

  // ---- SoundCloud deck ----------------------------------------
  const deck = $('.deck');
  const vinyl = $('#vinyl');
  const arm = $('#tonearm');
  const nowTitle = $('#nowTitle');
  const scFrame = $('#scPlayer');
  let widget = null, playing = false;
  const setPlaying = p => {
    playing = p;
    deck.classList.toggle('is-playing', p);
    vinyl.classList.toggle('is-spinning', p);
    arm.classList.toggle('is-on', p);
    $('#deckPlay').setAttribute('aria-label', p ? 'Pausar' : 'Reproducir');
    eqBoost = p || radioEl.dataset.state === 'playing' ? 1 : 0;
    if (p) mediaStarted('soundcloud');
  };
  const bindWidget = () => {
    if (widget || typeof window.SC === 'undefined' || !scFrame) return;
    widget = SC.Widget(scFrame);
    widget.bind(SC.Widget.Events.PLAY, () => setPlaying(true));
    widget.bind(SC.Widget.Events.PAUSE, () => setPlaying(false));
    widget.bind(SC.Widget.Events.FINISH, () => setPlaying(false));
  };
  scFrame && scFrame.addEventListener('load', bindWidget);
  bindWidget();

  $('#deckPlay').addEventListener('click', () => {
    bindWidget();
    if (widget) widget.toggle();
    else setPlaying(!playing); // sin API: solo animación
  });
  $$('.track').forEach(btn => btn.addEventListener('click', () => {
    $$('.track').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    nowTitle.textContent = btn.dataset.title;
    setPlaying(false);
    bindWidget();
    const opts = { auto_play: true, color: '#f6c429', hide_related: true, show_comments: false, show_reposts: false, visual: false };
    if (widget) widget.load(btn.dataset.url, { ...opts, callback: () => widget.play() });
    else scFrame.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(btn.dataset.url)}&color=%23f6c429&auto_play=true&visual=false`;
    if (animOn) gsap.fromTo(vinyl, { scale: .92 }, { scale: 1, duration: .8, ease: 'elastic.out(1, .5)' });
  }));

  // ---- Video modal --------------------------------------------
  const modal = $('#vModal');
  const frame = $('.modal__frame', modal);
  const YT_ID = /^[\w-]{11}$/;
  function openModal(id) {
    if (!YT_ID.test(id)) return;
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
    f.title = 'Video de Docta Rythm';
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    const a = document.createElement('a');
    a.className = 'modal__yt';
    a.href = `https://www.youtube.com/watch?v=${id}`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = '¿No carga? Ver en YouTube ↗';
    frame.replaceChildren(f, a);
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false');
    mediaStarted('youtube');
    if (widget && playing) widget.pause();
    if (lenis) lenis.stop();
    $('.modal__close', modal).focus();
  }
  function closeModal() {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true');
    setTimeout(() => { frame.replaceChildren(); }, 400);
    if (lenis) lenis.start();
  }
  // Videos con música protegida no permiten embed: se abren en YouTube
  $$('[data-yt]').forEach(b => b.addEventListener('click', () => {
    if (!YT_ID.test(b.dataset.yt)) return;
    if (b.hasAttribute('data-ext')) mediaStarted('youtube'), window.open(`https://www.youtube.com/watch?v=${b.dataset.yt}`, '_blank', 'noopener');
    else openModal(b.dataset.yt);
  }));
  $('.modal__close', modal).addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal || e.target.classList.contains('modal__inner')) closeModal(); });


  // ---- Radio en vivo (Zeno.fm) --------------------------------
  // Intenta sonar al entrar. Los navegadores bloquean audio con sonido sin
  // interacción previa: en ese caso arranca con el primer clic / toque.
  // Se detiene sola cuando suena SoundCloud, YouTube o Spotify.
  const RADIO_STREAM = 'https://stream.zeno.fm/vkbolopgeo5uv';
  const RADIO_META = 'https://api.zeno.fm/mounts/metadata/subscribe/vkbolopgeo5uv';
  const radioEl = $('#radio');
  const audio = $('#radioAudio');
  const rBtn = $('#radioBtn');
  const rNow = $('#radioNow');
  const rVol = $('#radioVol');
  const rStatus = $('.radio__status', radioEl);
  let radioWanted = true;
  let radioRetry = 0;
  let meta = null;
  try { if (sessionStorage.getItem('doctaRadio') === 'off') radioWanted = false; } catch {}

  const setRadio = st => {
    radioEl.dataset.state = st;
    document.body.dataset.radio = st;
    rBtn.setAttribute('aria-label', st === 'playing' || st === 'loading' ? 'Pausar radio' : 'Reproducir radio');
    rStatus.textContent = st === 'blocked' ? 'Tocá play' : st === 'error' ? 'Sin señal' : 'En vivo';
    eqBoost = st === 'playing' || playing ? 1 : 0;
  };

  function radioPlay() {
    mediaStarted('radio');
    setRadio('loading');
    audio.src = RADIO_STREAM;
    audio.volume = +rVol.value;
    const pr = audio.play();
    if (pr && pr.then) {
      pr.then(() => { radioRetry = 0; startMeta(); }).catch(err => {
        if (err.name === 'NotAllowedError') { radioStop('blocked'); armUnlock(); }
        else if (err.name !== 'AbortError') setRadio('error');
      });
    }
  }
  function radioStop(state = 'idle') {
    audio.pause();
    audio.removeAttribute('src');
    audio.load(); // corta la descarga del stream
    stopMeta();
    setRadio(state);
  }
  audio.addEventListener('playing', () => setRadio('playing'));
  audio.addEventListener('waiting', () => { if (radioEl.dataset.state === 'playing') setRadio('loading'); });
  audio.addEventListener('error', () => {
    if (!audio.getAttribute('src')) return;
    if (radioRetry++ < 2) setTimeout(() => { if (radioWanted) radioPlay(); }, 2500);
    else radioStop('error');
  });

  // Desbloqueo con el primer gesto (excepto si el gesto es para otro reproductor)
  const unlockEvents = ['pointerdown', 'keydown', 'touchend'];
  let armed = false;
  function onFirstGesture(e) {
    if (!radioWanted) return disarmUnlock();
    const t = e.target && e.target.closest ? e.target : null;
    if (t && t.closest('[data-no-autoradio], .radio, [data-radio-play], #stickyRadio')) return;
    disarmUnlock();
    radioPlay();
  }
  function armUnlock() {
    if (armed) return; armed = true;
    unlockEvents.forEach(ev => document.addEventListener(ev, onFirstGesture, true));
  }
  function disarmUnlock() {
    armed = false;
    unlockEvents.forEach(ev => document.removeEventListener(ev, onFirstGesture, true));
  }

  function radioAutostart() {
    radioEl.classList.add('is-ready');
    if (radioWanted && radioEl.dataset.state === 'idle') radioPlay();
  }

  // Otro audio empezó → la radio cede
  window.addEventListener('docta:media', e => {
    if (e.detail === 'radio') { if (widget && playing) widget.pause(); return; }
    radioWanted = false;
    disarmUnlock();
    if (radioEl.dataset.state !== 'idle') radioStop();
  });
  // Spotify no expone eventos: si el foco entra a su iframe, asumimos que se va a reproducir
  addEventListener('blur', () => setTimeout(() => {
    const a = document.activeElement;
    if (a && a.tagName === 'IFRAME' && a.closest('.spotify')) mediaStarted('spotify');
  }, 0));

  $('#stickyRadio').addEventListener('click', () => rBtn.click());
  rBtn.addEventListener('click', () => {
    const st = radioEl.dataset.state;
    if (st === 'playing' || st === 'loading') {
      radioWanted = false; radioStop();
      try { sessionStorage.setItem('doctaRadio', 'off'); } catch {}
    } else {
      radioWanted = true; radioPlay();
      try { sessionStorage.removeItem('doctaRadio'); } catch {}
    }
  });
  $$('[data-radio-play]').forEach(b => b.addEventListener('click', () => { radioWanted = true; radioPlay(); }));
  rVol.addEventListener('input', () => { audio.volume = +rVol.value; });

  // "Sonando ahora" en vivo
  function setNow(t) {
    rNow.textContent = t;
    const box = rNow.parentElement;
    box.classList.remove('is-long');
    requestAnimationFrame(() => {
      const over = rNow.scrollWidth - box.clientWidth;
      if (over > 4) { box.style.setProperty('--shift', -(over + 40) + 'px'); box.classList.add('is-long'); }
    });
    if ('mediaSession' in navigator && window.MediaMetadata) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: t, artist: 'Call Di Docta Radio', album: 'Docta Rythm Selecta',
        artwork: [{ src: 'assets/img/profile.jpg', sizes: '304x304', type: 'image/jpeg' }]
      });
    }
  }
  function startMeta() {
    if (meta || !window.EventSource) return;
    meta = new EventSource(RADIO_META);
    meta.onmessage = e => {
      try { const t = (JSON.parse(e.data).streamTitle || '').replace(/_+/g, ' ').trim(); if (t) setNow(t); } catch {}
    };
  }
  function stopMeta() { if (meta) { meta.close(); meta = null; } }

  // ---- Agenda: ocultar fechas pasadas + flyer que sigue al mouse
  const today = new Date(); today.setHours(0, 0, 0, 0);
  $$('.event[data-date]').forEach(ev => {
    if (new Date(ev.dataset.date + 'T23:59:59') < today) ev.classList.add('is-past');
  });
  const follow = $('.flyer-follow');
  if (finePointer && follow) {
    const fimg = $('img', follow);
    let fx = 0, fy = 0, tx = 0, ty = 0, on = false;
    $$('.event[data-flyer]').forEach(ev => {
      ev.addEventListener('mouseenter', () => { fimg.src = ev.dataset.flyer; follow.classList.add('is-on'); on = true; });
      ev.addEventListener('mouseleave', () => { follow.classList.remove('is-on'); on = false; });
    });
    addEventListener('mousemove', e => { tx = e.clientX + 150; ty = e.clientY; });
    const fl = () => {
      fx += (tx - fx) * .12; fy += (ty - fy) * .12;
      if (on) follow.style.left = fx + 'px', follow.style.top = fy + 'px';
      requestAnimationFrame(fl);
    };
    fl();
  }

  // ---- Booking form -------------------------------------------
  const form = $('#bookingForm');
  const ok = $('.form__ok', form);
  const dateInput = form.querySelector('[name="fecha"]');
  dateInput.min = new Date().toISOString().slice(0, 10);

  const showToast = msg => {
    const t = $('.toast'); t.textContent = msg; t.classList.add('is-on');
    clearTimeout(showToast.tm); showToast.tm = setTimeout(() => t.classList.remove('is-on'), 2600);
  };

  form.addEventListener('input', e => e.target.closest('.field')?.classList.remove('is-error'));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    let firstBad = null;
    $$('[required]', form).forEach(inp => {
      const field = inp.closest('.field');
      const bad = inp.type === 'radio' ? !form.querySelector(`[name="${inp.name}"]:checked`) : !inp.checkValidity();
      if (bad) { field.classList.add('is-error'); firstBad = firstBad || inp; }
    });
    if (firstBad) {
      showToast('Completá los campos marcados');
      if (animOn) gsap.fromTo(form, { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1, .3)' });
      firstBad.focus({ preventScroll: true });
      scrollToTarget(firstBad.closest('.field'));
      return;
    }
    const d = Object.fromEntries(new FormData(form));
    // Honeypot: los bots completan el campo oculto; se descarta en silencio
    if (d.website) { form.reset(); ok.textContent = '¡Gracias! Recibimos tu solicitud.'; ok.classList.add('is-on'); return; }
    delete d.website;
    const subject = `Contratación Docta Rythm — ${d.tipo} — ${d.fecha} — ${d.ciudad}`;
    const body = [
      'Hola Docta, queremos contratarte:', '',
      `Nombre: ${d.nombre}`, `Email: ${d.email}`, `Teléfono: ${d.telefono || '-'}`,
      `Organización / Venue: ${d.organizacion || '-'}`, `Tipo de evento: ${d.tipo}`,
      `Fecha: ${d.fecha}`, `Ciudad / País: ${d.ciudad}`, `Asistentes: ${d.aforo || '-'}`, '',
      `Detalles: ${d.mensaje || '-'}`
    ].join('\n');

    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    try {
      if (FORM_ENDPOINT) {
        if (!/^https:\/\//.test(FORM_ENDPOINT)) throw new Error('FORM_ENDPOINT debe usar https');
        const r = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ ...d, _subject: subject }) });
        if (!r.ok) throw new Error('send failed');
        ok.textContent = '¡Listo! Recibimos tu solicitud. Te respondemos en 24–48 h.';
        form.reset();
      } else {
        window.location.href = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        ok.textContent = 'Se abrió tu app de correo con la solicitud lista. Solo dale enviar. ¿No se abrió? Escribinos a ' + BOOKING_EMAIL;
      }
      ok.classList.add('is-on');
    } catch (err) {
      ok.textContent = 'No se pudo enviar. Escribinos directo a ' + BOOKING_EMAIL;
      ok.classList.add('is-on');
    } finally {
      btn.disabled = false;
    }
  });

  // ---- Copy bio -----------------------------------------------
  $('#copyBio').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(SHORT_BIO); showToast('Bio copiada ✓'); }
    catch { showToast('No se pudo copiar'); }
  });

  // Refrescar medidas al redimensionar (líneas de títulos)
  let rz;
  addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => { if (animOn) ScrollTrigger.refresh(); }, 250);
  });
})();
