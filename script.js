/* =========================================================
   Tejaswini LXD Portfolio — interactions
   Every feature here is small and independent, so you can
   read (and change) one section without touching the others.
   ========================================================= */

/* ---------- 1. Course progress: modules tick off as you scroll ---------- */
const modules = Array.from(document.querySelectorAll('.module'));
const navLinks = Array.from(document.querySelectorAll('#module-list a'));
const fill = document.getElementById('progress-fill');
const pct = document.getElementById('progress-pct');
const visited = new Set();

function updateProgress() {
  const percent = Math.round((visited.size / modules.length) * 100);
  fill.style.width = percent + '%';
  pct.textContent = percent + '%';
  navLinks.forEach(link => {
    link.classList.toggle('done', visited.has(link.dataset.mod));
  });
}

// IntersectionObserver tells us when a module scrolls into view.
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.dataset.mod;
    visited.add(id);
    navLinks.forEach(link => link.classList.toggle('current', link.dataset.mod === id));
    updateProgress();
  });
}, { rootMargin: '-35% 0px -55% 0px' });

modules.forEach(m => observer.observe(m));

/* ---------- 2. Flip cards (Module 1) ---------- */
document.querySelectorAll('.flip').forEach(card => {
  card.addEventListener('click', () => {
    const flipped = card.getAttribute('aria-pressed') === 'true';
    card.setAttribute('aria-pressed', String(!flipped));
  });
});

/* ---------- 3. Design process steps (Module 2) ---------- */
const steps = [
  {
    how: 'Talk to learners, parents and teachers. Find out what they already know, where they get stuck, and what success looks like for them.',
    ex: 'Before designing my hands-free Scratch research, I studied how children with motor disabilities currently use (or can\'t use) block coding.'
  },
  {
    how: 'Write measurable objectives with Bloom\'s verbs — build, explain, debug — so both the learner and I can see when they\'ve got it.',
    ex: 'City Traffic Signal: "Learners will build a working traffic-light sequence and explain how timing and conditions control it."'
  },
  {
    how: 'Plan backwards from the objective: what will learners make, practise and be checked on? Then choose activities that get them there.',
    ex: 'For a mixed Grades 4–8 class I designed two tiered challenges, so beginners and confident coders both had the right stretch.'
  },
  {
    how: 'Produce the materials: decks with speaker notes, activities, assessments and home tasks, in a consistent template teachers can run.',
    ex: 'Scratch Level 1: every lesson is one deck with a concept test, recall test, two class challenges and two home tasks.'
  },
  {
    how: 'Try it with real learners or reviewers, collect feedback, and revise. A design is never finished after version one.',
    ex: 'I revised the City Traffic Signal deck after reviewer feedback, then planned a before/after write-up of what changed and why.'
  }
];
const stepButtons = document.querySelectorAll('.steps button');
const stepHow = document.getElementById('step-how');
const stepEx = document.getElementById('step-ex');

stepButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    stepButtons.forEach(b => b.setAttribute('aria-selected', String(b === btn)));
    const s = steps[Number(btn.dataset.step)];
    stepHow.textContent = s.how;
    stepEx.textContent = s.ex;
  });
});

/* ---------- 4. Case-study filter (Module 3) ---------- */
const filterButtons = document.querySelectorAll('.filters button');
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const f = btn.dataset.f;
    filterButtons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    document.querySelectorAll('.frame').forEach(frame => {
      frame.hidden = !(f === 'all' || frame.dataset.s === f);
    });
  });
});

/* ---------- 5. Lesson anatomy (Module 4) ---------- */
const segments = [
  { t: 'Recall · minutes 0–5', w: 'Retrieval practice. Pulling last week\'s idea back from memory makes it stick far better than re-reading it.' },
  { t: 'Concept · minutes 5–15', w: 'One new idea, kept to 10 minutes. Short, focused input respects attention spans and leaves time to practise.' },
  { t: 'Demo · minutes 15–25', w: 'A worked example. Learners see the idea working before they try it, which lowers the fear of a blank screen.' },
  { t: 'Challenge 1 · minutes 25–35', w: 'Guided practice. Everyone builds the core version, with help close at hand.' },
  { t: 'Challenge 2 · minutes 35–45', w: 'Independent practice with a twist. Confident learners extend it; others consolidate. This is where mixed ability is handled.' },
  { t: 'Concept test · minutes 45–50', w: 'A quick check for understanding, so I know who needs support next lesson — formative, not a grade.' },
  { t: 'Home tasks · minutes 50–55', w: 'Two short tasks to practise at home, explained before learners leave so nobody is stuck later.' },
  { t: 'Reflection · minutes 55–60', w: 'Learners say what they made and what was hard. Naming it builds metacognition, and gives parents something to ask about.' }
];
const segButtons = document.querySelectorAll('.seg');
const segTitle = document.getElementById('seg-title');
const segWhy = document.getElementById('seg-why');

segButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    segButtons.forEach(b => b.setAttribute('aria-selected', String(b === btn)));
    const s = segments[Number(btn.dataset.seg)];
    segTitle.textContent = s.t;
    segWhy.textContent = s.w;
  });
});

/* ---------- 6. Knowledge check + certificate (Module 6) ---------- */
const answers = { q1: 'b', q2: 'a', q3: 'c' };
const feedback = {
  q1: 'Right — a 5-minute recall opens every lesson.',
  q2: 'Yes — eye gaze and voice, for children with motor disabilities.',
  q3: 'Exactly — two tiered challenges in every lesson.'
};
const quiz = document.getElementById('quiz');
const result = document.getElementById('quiz-result');
const cert = document.getElementById('cert');
const certName = document.getElementById('cert-name');

quiz.addEventListener('submit', event => {
  event.preventDefault();            // stay on the page
  let correct = 0;
  let answered = 0;

  Object.keys(answers).forEach(q => {
    const chosen = quiz.querySelector(`input[name="${q}"]:checked`);
    const fb = quiz.querySelector(`.fb[data-for="${q}"]`);
    fb.className = 'fb';
    if (!chosen) { fb.textContent = 'Pick an answer.'; fb.classList.add('no'); return; }
    answered++;
    if (chosen.value === answers[q]) {
      correct++;
      fb.textContent = feedback[q];
      fb.classList.add('ok');
    } else {
      fb.textContent = 'Not quite — scroll back up and have another look.';
      fb.classList.add('no');
    }
  });

  if (correct === 3) {
    const name = document.getElementById('learner-name').value.trim();
    certName.textContent = name || 'A thoughtful recruiter';
    result.textContent = '3 / 3 — course complete!';
    cert.hidden = false;
    cert.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    result.textContent = answered < 3
      ? `Answer all three to finish (${answered} / 3 answered).`
      : `${correct} / 3 — almost there. Try again.`;
    cert.hidden = true;
  }
});
