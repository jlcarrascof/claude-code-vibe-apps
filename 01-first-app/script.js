const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const nav = document.getElementById('nav');
const bar = document.getElementById('progress');
const parallaxEls = document.querySelectorAll('[data-parallax]');

let ticking = false;
function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
        nav.classList.toggle('scrolled', y > 40);
        if (!reduce && y < innerHeight * 1.2) {
            parallaxEls.forEach(el => {
                el.style.transform = `translateY(${y * parseFloat(el.dataset.parallax)}px)`;
            });
        }
        ticking = false;
    });
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Reveal al entrar en pantalla
const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
        }
    });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 90 + 'ms';
    io.observe(el);
});

// Contadores
function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = target + suffix; return; }
    const start = performance.now();
    const dur = 1800;
    (function frame(now) {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(frame);
    })(start);
}
const co = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); }
    });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(el => co.observe(el));

// Tilt 3D en tarjetas de cristal
if (!reduce && matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.tilt').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(10px)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
}

// Hotspots de la pista
const tip = document.getElementById('tip');
const spots = document.querySelectorAll('.hot g');
spots.forEach(g => {
    const show = () => {
        spots.forEach(s => s.classList.remove('active'));
        g.classList.add('active');
        tip.textContent = g.dataset.tip;
    };
    g.addEventListener('mouseenter', show);
    g.addEventListener('click', show);
});
