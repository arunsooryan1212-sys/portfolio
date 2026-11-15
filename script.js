// ---------- Preloader (hides when page loads, with a safety fallback) ----------
(function () {
    const preloader = document.getElementById('preloader');
    function hidePreloader() {
        if (preloader) preloader.classList.add('hide');
    }
    window.addEventListener('load', () => setTimeout(hidePreloader, 500));
    setTimeout(hidePreloader, 3000); // fallback if a CDN loads slowly
})();

// ---------- Subtle particle background (muted, responsive) ----------
(function () {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        const count = w < 768 ? 22 : Math.min(55, Math.floor((w * h) / 30000));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            r: Math.random() * 1.2 + 0.5
        }));
    }

    window.addEventListener('resize', resize);
    resize();

    function draw() {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(148, 163, 200, 0.45)';
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const q = particles[j];
                const d = Math.hypot(p.x - q.x, p.y - q.y);
                if (d < 120) {
                    ctx.strokeStyle = `rgba(108, 156, 240, ${0.12 * (1 - d / 120)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
})();

// ---------- Soft cursor glow (desktop only) ----------
const glow = document.getElementById('cursorGlow');
if (glow && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('mousemove', e => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
}

// ---------- Typing effect ----------
(function () {
    const el = document.getElementById('typed');
    if (!el) return;
    const words = [
        'responsive websites',
        'modern user interfaces',
        'clean front-end code',
        'full-stack web apps'
    ];
    let wi = 0, ci = 0, deleting = false;

    function type() {
        const word = words[wi];
        el.textContent = deleting ? word.slice(0, --ci) : word.slice(0, ++ci);

        let delay = deleting ? 40 : 90;
        if (!deleting && ci === word.length) { delay = 1600; deleting = true; }
        else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 400; }
        setTimeout(type, delay);
    }
    type();
})();

// ---------- Scroll reveal, counters, skill bars ----------
function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || 0, 10);
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || 0, 10);

        setTimeout(() => el.classList.add('visible'), delay);

        el.querySelectorAll('.counter').forEach(animateCounter);
        el.querySelectorAll('.bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.width + '%';
        });

        observer.unobserve(el);
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ---------- Scroll progress, navbar, back-to-top ----------
const scrollBar = document.getElementById('scrollBar');
const navbar = document.getElementById('mainNav');
const toTop = document.getElementById('toTop');

window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollBar && max > 0) scrollBar.style.width = (scrolled / max) * 100 + '%';
    if (navbar) navbar.classList.toggle('scrolled', scrolled > 40);
    if (toTop) toTop.classList.toggle('show', scrolled > 500);
});

// ---------- 3D tilt on cards (desktop only) ----------
if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.tilt').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(700px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ---------- Contact form (opens the visitor's email app) ----------
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('cName').value.trim();
        const email = document.getElementById('cEmail').value.trim();
        const msg = document.getElementById('cMsg').value.trim();

        const subject = encodeURIComponent('Portfolio contact from ' + name);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${msg}`);
        window.location.href = `mailto:arunsooryan1212@gmail.com?subject=${subject}&body=${body}`;
    });
}