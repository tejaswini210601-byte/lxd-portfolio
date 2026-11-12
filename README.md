# Tejaswini S — LXD Portfolio

My Learning Experience Designer portfolio, built **as a short course**. Visitors "take" it: six modules, a progress bar that fills as they scroll, a knowledge check, and a certificate at the end.

**Live site:** https://tejaswini210601-byte.github.io/lxd-portfolio/

## What's inside

| File | What it does |
|---|---|
| `index.html` | The content: every module, case study and quiz question |
| `style.css` | The look: colours, fonts, layout, dark mode, mobile layout |
| `script.js` | The interactions: progress bar, flip cards, process steps, filters, lesson bar, quiz |

## The modules

0. **Welcome** — course card with learning objectives for the recruiter
1. **Meet the designer** — stats + "what teaching taught the designer" flip cards
2. **How I design** — my 5-step process, each step with a real example
3. **Case studies** — 8 projects as storyboard frames, filterable by status
4. **Anatomy of a lesson** — my 60-minute lesson template, tap each block to see why
5. **Skills map** — strong / growing / next
6. **Knowledge check** — 3 questions, unlocks a certificate

## How to update it

- **A project moves forward?** In `index.html`, find its `<article class="frame" data-s="prog">`. Change `data-s` to `done` and the chip text to `Delivered`.
- **Add a project?** Copy one whole `<article class="frame">…</article>` block, paste it below, and change the text.
- **Course progress changed?** In `index.html`, find `width:41%` and the `41% complete` line and update both.
- **Change a quiz question?** Edit the question in `index.html` and the right answer in the `answers` list at the top of section 6 in `script.js`.

Commit the change on GitHub and the live site updates in a minute or two.
