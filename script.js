/* =========================================================
   Tejaswini LXD Portfolio — interactions
   Each numbered section is one feature and works on its own.
   ========================================================= */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 1. Hero: portrait that looks at your cursor ----------
   Same idea as the teaching portfolio:
   - assets/frames has 64 photos of me, one for every direction
     around a circle (frame 0 = looking right, 16 = up, 32 = left, 48 = down)
     plus center.webp (looking straight at you).
   - Every animation frame we measure the angle from my face to your
     cursor with Math.atan2 and draw the ONE matching photo on a <canvas>. */
(function hero() {
  const COUNT = 64;
  const FW = 1094, FH = 620;           // size of each photo
  const FACE = { x: 0.52, y: 0.36 };   // where my face sits inside a photo (0–1)
  const BG = '#f1a323';                // hero background, matches the photos

  const cv = document.getElementById('hero-canvas');
  const poster = document.getElementById('hero-poster');
  const cur = document.getElementById('cur');
  const ring = document.getElementById('ring');
  const ctx = cv.getContext('2d');

  const frames = [];
  let loaded = 0;
  const center = new Image();
  center.src = 'assets/frames/center.webp';

  let W = 0, H = 0, dpr = 1, box = { x: 0, y: 0, w: 0, h: 0 }, current = null;

  function layout() {
    const r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    if (W < 820) {                     // phone: photo on top, text below
      const vh = Math.min(H, window.innerHeight);
      const w = Math.max(W * 1.45, (vh * 0.6 * FW) / FH);
      const h = (w * FH) / FW;
      box = { x: (W - w) / 2, y: vh * 0.6 - h, w, h };
    } else {                           // desktop: photo on the right
      const h = H * 0.93;
      const w = (h * FW) / FH;
      box = { x: W * 0.64 - w / 2, y: H - h, w, h };
    }
  }

  function draw(img, force) {
    if (img === current && !force) return;
    current = img;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(img, box.x, box.y, box.w, box.h);
    // soften the photo's edges into the background
    const fade = (x0, y0, x1, y1, rx, ry, rw, rh) => {
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, BG); g.addColorStop(1, BG + '00');
      ctx.fillStyle = g; ctx.fillRect(rx, ry, rw, rh);
    };
    const f = Math.min(80, box.w * 0.08);
    fade(box.x, 0, box.x + f, 0, box.x - 2, box.y, f + 2, box.h);
    fade(box.x + box.w, 0, box.x + box.w - f, 0, box.x + box.w - f, box.y, f + 2, box.h);
    fade(0, box.y, 0, box.y + f, box.x, box.y - 2, box.w, f + 2);
    if (box.y + box.h < H - 2) fade(0, box.y + box.h, 0, box.y + box.h - f * 1.6, box.x, box.y + box.h - f * 1.6, box.w, f * 1.6 + 2);
  }

  center.onload = () => {
    layout();
    draw(center, true);
    cv.classList.add('on');
    poster.hidden = true;
    if (reduceMotion) return;
    for (let i = 0; i < COUNT; i++) {  // load the 64 directions after the first paint
      const im = new Image();
      im.decoding = 'async';
      im.src = `assets/frames/${String(i).padStart(2, '0')}.webp`;
      im.onload = () => loaded++;
      frames[i] = im;
    }
  };

  window.addEventListener('resize', () => { layout(); if (current) draw(current, true); });

  let mx = -1, my = -1, last = 0, angle = 0, inited = false, visible = true;
  let rx = 0, ry = 0;
  window.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect();
    mx = e.clientX - r.left; my = e.clientY - r.top; last = performance.now();
  }, { passive: true });
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(cv);

  const touch = window.matchMedia('(hover: none)').matches;
  const lerpAngle = (a, b, t) => a + ((((b - a + 540) % 360) - 180) * t); // shortest way round

  function loop() {
    requestAnimationFrame(loop);
    if (mx >= 0) {                     // custom cursor + trailing ring
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      cur.style.transform = `translate(${mx}px,${my}px)`;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
    }
    if (!visible || !current || reduceMotion) return;
    if (loaded < COUNT) return draw(center);
    const fx = box.x + box.w * FACE.x, fy = box.y + box.h * FACE.y;
    const now = performance.now();
    let target;
    if (now - last > 5000 || mx < 0) {
      // phones have no cursor, so I glance around by myself now and then
      if (!touch) return draw(center);
      const k = (now % 9000) / 9000;
      if (k < 0.62) return draw(center);
      target = 90 - ((k - 0.62) / 0.38) * 360;
    } else {
      const dx = mx - fx, dy = my - fy;
      if (Math.hypot(dx, dy) < Math.min(W, H) * 0.12) return draw(center); // look straight at you
      target = (Math.atan2(-dy, dx) * 180) / Math.PI;
    }
    angle = inited ? lerpAngle(angle, target, 0.26) : target;
    inited = true;
    const idx = ((Math.round((((angle % 360) + 360) % 360) / (360 / COUNT)) % COUNT) + COUNT) % COUNT;
    draw(frames[idx]);
  }
  requestAnimationFrame(loop);
})();

/* ---------- 2. Course progress: fills as you visit each module ---------- */
(function progress() {
  const mods = document.querySelectorAll('[data-mod]');
  const fill = document.getElementById('progress-fill');
  const pct = document.getElementById('progress-pct');
  const seen = new Set();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      seen.add(e.target.id);
      const p = Math.round((seen.size / mods.length) * 100);
      fill.style.width = p + '%';
      pct.textContent = p + '%';
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  mods.forEach(m => io.observe(m));
})();

/* ---------- 3. Pop-in on scroll + counting numbers ---------- */
(function reveal() {
  const items = document.querySelectorAll('.rv');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('is-in');
      io.unobserve(el);
      // once it has popped in, hand control back to the normal hover styles
      setTimeout(() => el.classList.remove('rv', 'is-in'), 1400);
      const n = el.querySelector('[data-count]');
      if (n && !reduceMotion) countUp(n);
    });
  }, { threshold: 0.15 });
  items.forEach(el => io.observe(el));

  function countUp(el) {
    const end = Number(el.dataset.count), t0 = performance.now(), dur = 1200;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
})();

/* ---------- 4. Flip cards ---------- */
document.querySelectorAll('.flip').forEach(card => {
  card.addEventListener('click', () => {
    card.setAttribute('aria-pressed', String(card.getAttribute('aria-pressed') !== 'true'));
  });
});

/* ---------- 5. Design process stops ---------- */
(function process() {
  const steps = [
    { how: 'Talk to learners, parents and teachers. Find out what they already know, where they get stuck, and what success looks like for them.',
      ex: 'Before designing my hands-free Scratch research, I studied how children with motor disabilities use (or can\'t use) block coding.' },
    { how: 'Write measurable objectives with Bloom\'s verbs (build, explain, debug), so both the learner and I can see when they\'ve got it.',
      ex: 'City Traffic Signal: "Learners will build a working traffic-light sequence and explain how timing and conditions control it."' },
    { how: 'Plan backwards from the objective: what will learners make, practise and be checked on? Then pick activities that get them there.',
      ex: 'For a mixed Grades 4–8 class I designed two tiered challenges, so beginners and confident coders both got the right stretch.' },
    { how: 'Produce the materials: decks with speaker notes, activities, assessments and home tasks, in a template any teacher can run.',
      ex: 'Scratch Level 1: every lesson is one deck with a concept test, a recall test, two class challenges and two home tasks.' },
    { how: 'Try it with real learners or reviewers, collect feedback, and revise. Version one is never the final version.',
      ex: 'I revised the City Traffic Signal deck after reviewer feedback, and I\'m writing up what changed and why as a case study.' }
  ];
  const stops = document.querySelectorAll('.stop');
  const how = document.getElementById('step-how');
  const ex = document.getElementById('step-ex');
  stops.forEach(btn => btn.addEventListener('click', () => {
    stops.forEach(b => b.setAttribute('aria-selected', String(b === btn)));
    const s = steps[Number(btn.dataset.step)];
    how.textContent = s.how;
    ex.textContent = s.ex;
  }));
})();

/* ---------- 6. Case-study filter ---------- */
(function filters() {
  const buttons = document.querySelectorAll('.filters button');
  buttons.forEach(btn => btn.addEventListener('click', () => {
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    const f = btn.dataset.f;
    document.querySelectorAll('.case').forEach(c => {
      c.hidden = !(f === 'all' || c.dataset.s === f);
      c.classList.remove('rv', 'is-in');   // show filtered cards straight away
    });
  }));
})();

/* ---------- 7. Lesson anatomy ---------- */
(function lesson() {
  const segs = [
    ['🧠 Recall · minutes 0–5', 'Retrieval practice. Pulling last week\'s idea back from memory makes it stick far better than re-reading it.'],
    ['💡 Concept · minutes 5–15', 'One new idea, kept to 10 minutes. Short, focused input respects attention spans and leaves time to practise.'],
    ['👀 Demo · minutes 15–25', 'A worked example. Learners see the idea working before they try it, which takes away the fear of a blank screen.'],
    ['🛠️ Challenge 1 · minutes 25–35', 'Guided practice. Everyone builds the core version, with help close at hand.'],
    ['🚀 Challenge 2 · minutes 35–45', 'Independent practice with a twist. Confident learners stretch it; others consolidate. This is where mixed ability is handled.'],
    ['✅ Concept test · minutes 45–50', 'A quick check for understanding, so I know who needs support next time. Formative, not a grade.'],
    ['🏠 Home tasks · minutes 50–55', 'Two short tasks to practise at home, explained before learners leave so nobody gets stuck later.'],
    ['💬 Reflection · minutes 55–60', 'Learners say what they made and what was hard. Naming it builds metacognition, and gives parents something to ask about.']
  ];
  const buttons = document.querySelectorAll('.seg');
  const title = document.getElementById('seg-title');
  const why = document.getElementById('seg-why');
  buttons.forEach(btn => btn.addEventListener('click', () => {
    buttons.forEach(b => b.setAttribute('aria-selected', String(b === btn)));
    const [t, w] = segs[Number(btn.dataset.seg)];
    title.textContent = t;
    why.textContent = w;
  }));
})();

/* ---------- 8. Knowledge check, certificate and confetti ---------- */
(function quiz() {
  const answers = { q1: 'b', q2: 'a', q3: 'c' };
  const praise = {
    q1: 'Yes! A 5-minute recall opens every lesson. 🧠',
    q2: 'Spot on: eye gaze and voice. 👁️',
    q3: 'Exactly: tiered challenges in every lesson. 🚀'
  };
  const form = document.getElementById('quiz');
  const result = document.getElementById('quiz-result');
  const cert = document.getElementById('cert');
  const certName = document.getElementById('cert-name');

  form.addEventListener('submit', e => {
    e.preventDefault();
    let right = 0, answered = 0;
    Object.keys(answers).forEach(q => {
      const pick = form.querySelector(`input[name="${q}"]:checked`);
      const fb = form.querySelector(`.fb[data-for="${q}"]`);
      fb.className = 'fb';
      if (!pick) { fb.textContent = 'Pick an answer 👆'; fb.classList.add('no'); return; }
      answered++;
      if (pick.value === answers[q]) { right++; fb.textContent = praise[q]; fb.classList.add('ok'); }
      else { fb.textContent = 'Not quite. Scroll up for a hint and try again.'; fb.classList.add('no'); }
    });

    if (right === 3) {
      certName.textContent = document.getElementById('learner-name').value.trim() || 'A thoughtful recruiter';
      result.textContent = '3 / 3. Course complete! 🎉';
      cert.hidden = false;
      cert.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      if (!reduceMotion) confetti();
    } else {
      cert.hidden = true;
      result.textContent = answered < 3 ? `Answer all three to finish (${answered} / 3).` : `${right} / 3. So close, try again!`;
    }
  });

  function confetti() {
    const cv = document.getElementById('confetti');
    const c = cv.getContext('2d');
    const d = Math.min(2, devicePixelRatio || 1);
    cv.width = innerWidth * d; cv.height = innerHeight * d;
    c.setTransform(d, 0, 0, d, 0, 0);
    const colours = ['#ffc93c', '#ff6b6b', '#4d96ff', '#2ec4b6', '#8b5cf6', '#ff8fb1'];
    const bits = Array.from({ length: 160 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 120, y: innerHeight * 0.45,
      vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 16 - 6,
      s: 6 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      col: colours[Math.floor(Math.random() * colours.length)]
    }));
    const t0 = performance.now();
    (function frame(now) {
      c.clearRect(0, 0, innerWidth, innerHeight);
      bits.forEach(b => {
        b.vy += 0.45; b.vx *= 0.99; b.x += b.vx; b.y += b.vy; b.r += b.vr;
        c.save(); c.translate(b.x, b.y); c.rotate(b.r); c.fillStyle = b.col;
        c.fillRect(-b.s / 2, -b.s / 3, b.s, b.s * 0.66); c.restore();
      });
      if (now - t0 < 3200) requestAnimationFrame(frame); else c.clearRect(0, 0, innerWidth, innerHeight);
    })(t0);
  }
})();
