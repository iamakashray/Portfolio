const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

// Reveal-on-scroll: every major section animates as it enters the viewport.
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      if (entry.target.dataset.scene === 'electronics') entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

$$('.reveal').forEach(el => revealObserver.observe(el));

// Hobby scene activation. Electronics LEDs only light up when the user reaches that card.
const sceneObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    entry.target.classList.toggle('in-view', entry.isIntersecting);
  });
}, { threshold: 0.38 });
$$('[data-scene]').forEach(el => sceneObserver.observe(el));

// Magnetic UI on desktop.
const supportsFinePointer = window.matchMedia('(pointer:fine)').matches;
if (supportsFinePointer) {
  document.body.classList.add('has-pointer');
  const dot = $('.cursor-dot');
  const ring = $('.cursor-ring');
  let tx = 0, ty = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  const cursorLoop = () => {
    rx += (tx - rx) * 0.18;
    ry += (ty - ry) * 0.18;
    dot.style.left = `${tx}px`; dot.style.top = `${ty}px`;
    ring.style.left = `${rx}px`; ring.style.top = `${ry}px`;
    requestAnimationFrame(cursorLoop);
  };
  cursorLoop();
  $$('.magnetic').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('active'));
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('active');
      el.style.transform = '';
    });
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width/2)) * 0.12;
      const y = (e.clientY - (r.top + r.height/2)) * 0.12;
      el.style.transform = `translate(${x}px,${y}px)`;
    });
  });
}

// Subtle 3D tilt for large cards.
if (supportsFinePointer) {
  $$('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(900px) rotateX(${(-y * 2.2).toFixed(2)}deg) rotateY(${(x * 2.4).toFixed(2)}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// Scroll progress in the browser tab title.
const titleBase = document.title;
window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
  document.title = progress > 3 ? `${progress}% — Akash Ray` : titleBase;
}, { passive:true });

// Active navigation state.
const sections = $$('main section[id]');
const navLinks = $$('.nav a');
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
sections.forEach(section => navObserver.observe(section));

// Small dynamic text effect on the hero label.
const labels = ['CREATIVE PORTFOLIO', 'VISUAL / CODE / BUILD', 'MADE TO BE INTERACTIVE'];
const label = $('.hero .eyebrow');
let labelIndex = 0;
setInterval(() => {
  if (!label) return;
  labelIndex = (labelIndex + 1) % labels.length;
  const suffix = ' <span>•</span> 2026';
  label.animate([{opacity:.15, transform:'translateY(5px)'},{opacity:1, transform:'translateY(0)'}], {duration:380, easing:'ease-out'});
  label.innerHTML = labels[labelIndex] + suffix;
}, 3200);


// Mobile navigation
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menuToggle.classList.remove('open');
    mobileMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));
}
