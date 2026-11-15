// ---------- Preloader ----------
window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('preloader').classList.add('hide'), 600);
});

// ---------- Particle network background ----------
(function () {
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    const mouse = { x: null, y: null };

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        const count = Math.min(90, Math.floor((w * h) / 16000));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            r: Math.random() * 1.8 + 0.6
        }));
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
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
            ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const q = particles[j];
                const d = Math.hypot(p.x - q.x, p.y - q.y);
                if (d < 130) {
                    ctx.strokeStyle = `rgba(138, 92, 255, ${0.25 * (1 - d / 130)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.stroke();
                }
            }

            if (mouse.x !== null) {
                const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
                if (dm < 160) {
                    ctx.strokeStyle = `rgba(0, 240, 255, ${0.4 * (1 - dm / 160)})`;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
})();

// ---------- Cursor glow ----------
const glow = document.getElementById('cursorGlow');
window.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

// ---------- Typing effect ----------
(function () {
    const el = document.getElementById('typed');
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
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ---------- Scroll progress, navbar, back-to-top ----------
const scrollBar = document.getElementById('scrollBar');
const navbar = document.getElementById('mainNav');
const toTop = document.getElementById('toTop');

window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollBar.style.width = (scrolled / max) * 100 + '%';
    navbar.classList.toggle('scrolled', scrolled > 40);
    toTop.classList.toggle('show', scrolled > 500);
});

// ---------- 3D tilt on cards ----------
document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// ---------- Contact form (opens the visitor's email app) ----------
document.getElementById('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('cName').value.trim();
    const email = document.getElementById('cEmail').value.trim();
    const msg = document.getElementById('cMsg').value.trim();

    const subject = encodeURIComponent('Portfolio contact from ' + name);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${msg}`);
    window.location.href = `mailto:arunsooryan1212@gmail.com?subject=${subject}&body=${body}`;
});