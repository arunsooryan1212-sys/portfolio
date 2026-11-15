(function () {
    'use strict';

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover)').matches;

    /* ---------- Prepare markup immediately ---------- */

    // Split hero title into words for the mask reveal
    $$('[data-split]').forEach(el => {
        const words = el.textContent.trim().split(/\s+/);
        el.setAttribute('aria-label', el.textContent.trim());
        el.innerHTML = words
            .map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`)
            .join(' ');
    });

    // Stagger: children with data-anim get an incremental delay
    $$('[data-stagger]').forEach(parent => {
        const step = parseInt(parent.dataset.stagger, 10) || 100;
        $$(':scope > [data-anim]', parent).forEach((child, i) => {
            child.style.setProperty('--d', i * step + 'ms');
        });
    });

    // Duplicate marquee content for a seamless loop
    const track = $('#marqueeTrack');
    if (track) track.innerHTML += track.innerHTML;

    /* ---------- Preloader ---------- */
    const preloader = $('#preloader');
    let started = false;

    function hidePreloader() {
        if (preloader) preloader.classList.add('hide');
        if (!started) { started = true; initScrollFX(); }
    }

    window.addEventListener('load', () => setTimeout(hidePreloader, 700));
    setTimeout(hidePreloader, 3000); // fallback if a CDN is slow

    /* ---------- Counters & bars ---------- */
    function runCounter(el) {
        cancelAnimationFrame(el._raf);
        const target = parseFloat(el.dataset.count);
        const dec = parseInt(el.dataset.decimals || 0, 10);
        const dur = reduce ? 0 : 1600;
        const t0 = performance.now();

        function tick(now) {
            const p = dur ? Math.min((now - t0) / dur, 1) : 1;
            const e = 1 - Math.pow(1 - p, 3);
            el.textContent = (target * e).toFixed(dec);
            if (p < 1) el._raf = requestAnimationFrame(tick);
        }
        el._raf = requestAnimationFrame(tick);
    }

    function resetCounter(el) {
        cancelAnimationFrame(el._raf);
        el.textContent = (0).toFixed(parseInt(el.dataset.decimals || 0, 10));
    }

    /* ---------- Scroll-triggered animations (replay both directions) ---------- */
    function enter(el) {
        if (el.classList.contains('in-view')) return;
        el.classList.add('in-view');

        $$('.counter', el).forEach(runCounter);

        const delay = parseInt(el.style.getPropertyValue('--d'), 10) || 0;
        $$('.bar-fill', el).forEach(bar => {
            bar.style.transitionDelay = delay + 300 + 'ms';
            bar.style.width = bar.dataset.width + '%';
        });
    }

    function leave(el) {
        if (!el.classList.contains('in-view')) return;
        el.classList.remove('in-view');

        $$('.counter', el).forEach(resetCounter);
        $$('.bar-fill', el).forEach(bar => {
            bar.style.transitionDelay = '0ms';
            bar.style.width = '0';
        });
    }

    function initScrollFX() {
        const targets = $$('[data-anim], [data-split], [data-watch]');

        if (reduce) { targets.forEach(enter); }
        else {
            // Adds the animation when an element enters the screen
            const inObs = new IntersectionObserver(entries => {
                entries.forEach(e => { if (e.isIntersecting) enter(e.target); });
            }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

            // Resets it only after the element is well outside the screen
            // (the extra margin prevents flicker at the edges)
            const outObs = new IntersectionObserver(entries => {
                entries.forEach(e => { if (!e.isIntersecting) leave(e.target); });
            }, { threshold: 0, rootMargin: '320px 0px 320px 0px' });

            targets.forEach(t => { inObs.observe(t); outObs.observe(t); });
        }

        update();
    }

    /* ---------- Active nav link ---------- */
    const links = $$('.navbar-nav .nav-link');
    const secObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('section[id]').forEach(s => secObs.observe(s));

    // Close the mobile menu after clicking a link
    const menu = $('#navMenu');
    $$('.navbar-nav a').forEach(a => {
        a.addEventListener('click', () => {
            if (menu && menu.classList.contains('show') && window.bootstrap) {
                window.bootstrap.Collapse.getOrCreateInstance(menu).hide();
            }
        });
    });

    /* ---------- Scroll-linked effects: progress, navbar, parallax, hero fade ---------- */
    const bar = $('#scrollBar');
    const nav = $('#mainNav');
    const toTop = $('#toTop');
    const heroWrap = $('#heroWrap');
    const parallaxEls = $$('[data-speed]');
    let ticking = false;

    function update() {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;

        if (bar) bar.style.width = max > 0 ? (y / max) * 100 + '%' : '0';
        if (nav) nav.classList.toggle('scrolled', y > 40);
        if (toTop) toTop.classList.toggle('show', y > 600);

        if (!reduce) {
            parallaxEls.forEach(el => {
                el.style.translate = '0 ' + y * parseFloat(el.dataset.speed) + 'px';
            });

            if (heroWrap && y < window.innerHeight * 1.5) {
                const p = Math.min(y / (window.innerHeight * 0.9), 1);
                heroWrap.style.opacity = String(1 - p);
                heroWrap.style.translate = '0 ' + y * 0.18 + 'px';
            }
        }
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);

    /* ---------- Cursor spotlight, card glow, tilt, magnetic buttons ---------- */
    if (canHover && !reduce) {
        // Soft cursor glow with smooth follow
        const glow = $('#cursorGlow');
        let tx = -600, ty = -600, cx = tx, cy = ty;
        window.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
        (function loop() {
            cx += (tx - cx) * 0.12;
            cy += (ty - cy) * 0.12;
            if (glow) glow.style.transform = `translate(${cx - 210}px, ${cy - 210}px)`;
            requestAnimationFrame(loop);
        })();

        // Spotlight highlight that follows the cursor inside cards
        $$('.spot').forEach(card => {
            card.addEventListener('pointermove', e => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mx', e.clientX - r.left + 'px');
                card.style.setProperty('--my', e.clientY - r.top + 'px');
            });
        });

        // 3D tilt
        $$('.tilt').forEach(card => {
            card.addEventListener('pointermove', e => {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform = `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-6px)`;
            });
            card.addEventListener('pointerleave', () => { card.style.transform = ''; });
        });

        // Magnetic buttons
        $$('.magnetic').forEach(btn => {
            btn.addEventListener('pointermove', e => {
                const r = btn.getBoundingClientRect();
                const x = e.clientX - (r.left + r.width / 2);
                const y = e.clientY - (r.top + r.height / 2);
                btn.style.translate = `${x * 0.22}px ${y * 0.3}px`;
            });
            btn.addEventListener('pointerleave', () => { btn.style.translate = ''; });
        });
    }

    /* ---------- Typing effect ---------- */
    (function () {
        const el = $('#typed');
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

    /* ---------- Contact form (opens the visitor's email app) ---------- */
    const form = $('#contactForm');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const name = $('#cName').value.trim();
            const email = $('#cEmail').value.trim();
            const msg = $('#cMsg').value.trim();

            const subject = encodeURIComponent('Portfolio contact from ' + name);
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${msg}`);
            window.location.href = `mailto:arunsooryan1212@gmail.com?subject=${subject}&body=${body}`;
        });
    }
})();