# Grantly

**See every rupee you qualify for, and the day each one closes.**

Live demo: **https://grantly-aid.vercel.app** (click "Explore with a sample student" for a populated app)

Grantly is a scholarship companion for students. It finds the scholarships you actually qualify for, tells you why in plain language, and keeps your deadlines, documents and applications in one place.

![Grantly landing page](docs/screens/landing.png)

## The problem

Getting educational financial aid is harder than it should be. Students have to:

- find scholarships spread across dozens of portals,
- work out whether they are eligible by reading dense criteria,
- gather the right documents for each application, and
- remember deadlines that all land at different times.

Most tools are long searchable lists. They show everything and explain nothing, so the student does the hard work.

## The idea: your funding runway

Grantly turns that pile of information into one answer and one timeline.

- **One number.** The dashboard opens with what you can actually get: "₹18,95,000 within reach", across the scholarships you qualify for.
- **One timeline.** Every scholarship you qualify for is a pin on a 60-day runway, placed on the day it closes and sized by what it pays. You can see at a glance what to do first.
- **Reasons, not scores.** Every match explains itself ("Your 8.9 CGPA clears the 8.5 minimum"), and every rejection does too ("Needs a 8.5 CGPA, you have 7.9").
- **Documents that work for you.** Upload a document once. Grantly shows which applications it unlocks and what is still missing: "One upload unlocks 3 applications".

The visual language comes from the thing students are chasing: the award letter. Scholarship cards are ticket stubs with a perforated seam, and match percentages are saffron stamps.

## Features

| Area | What it does |
| --- | --- |
| **Live landing demo** | Three answers (field, CGPA, income) produce a real estimate straight away, before any sign-up. |
| **Onboarding** | Three short steps. Each field explains why it is asked, and a live panel shows your matches growing as you answer. |
| **Matching engine** | Evaluates every criterion (CGPA, field, level, income slab, category, state, gender, special status) and ranks eligible scholarships by fit. |
| **Dashboard** | Headline amount, 60-day runway, ranked matches, closing-soon list, profile strength, and the single most valuable document to upload next. |
| **Discover** | Search, filter by type, amount and deadline, sort, and optionally show scholarships you do not qualify for along with the reasons. |
| **Scholarship detail** | Why you match, a document checklist with upload, step-by-step how to apply, and a "what if your numbers were different?" panel for ones you miss. |
| **Tracker** | Kanban board (Saved, Preparing, Submitted, Awarded) with drag and drop, plus a keyboard-accessible "move to" menu on every card. |
| **Vault** | One place for documents, with expiry warnings and a count of the applications each one unlocks. |
| **Calendar export** | Download deadlines as an `.ics` file with a reminder three days before. |
| **Command palette** | Press `Ctrl K` (or `Cmd K`) to jump to any scholarship or page. |
| **Playful details** | Pressable buttons, award stamps, confetti when you get awarded, and friendly microcopy. All motion respects `prefers-reduced-motion`. |

| Dashboard | Scholarship detail |
| --- | --- |
| ![Dashboard](docs/screens/dashboard.png) | ![Scholarship detail](docs/screens/detail.png) |

| Tracker | On a phone |
| --- | --- |
| ![Tracker](docs/screens/tracker.png) | ![Dashboard on mobile](docs/screens/m-dashboard.png) |

## How matching works

The engine lives in [`src/lib/engine.js`](src/lib/engine.js).

1. Each scholarship in [`src/data/scholarships.js`](src/data/scholarships.js) declares its criteria (minimum CGPA, allowed fields and levels, income ceiling, categories, states, gender, special-status flags).
2. `evaluate(scholarship, profile)` checks every criterion and returns a plain-language verdict for each one.
3. A scholarship is **eligible** only if every criterion passes.
4. The **match percentage** for eligible scholarships starts at 70 and rises with a bigger CGPA margin, a niche eligibility fit (special status, category or gender), a goal that matches what the student said they need, and a field-specific scholarship. It is capped at 99.
5. Deadlines are stored as "days from today", so the demo always looks live.

## Tech stack

- [React 19](https://react.dev) and [Vite](https://vite.dev)
- [React Router](https://reactrouter.com) (hash routing, so it deploys anywhere without rewrite rules)
- [Tailwind CSS v4](https://tailwindcss.com)
- [lucide-react](https://lucide.dev) icons
- Bricolage Grotesque and Inter, bundled locally with Fontsource so the app works offline
- No backend. State lives in `localStorage`.

## Run it locally

```bash
git clone https://github.com/AbhishekKumarCode/grantly.git
cd grantly
npm install
npm run dev
```

Build for production with `npm run build` and preview it with `npm run preview`.

## Project structure

```
src/
  components/   Layout, Ticket (scholarship card), Runway, Palette, shared UI
  data/         scholarships.js, docs.js (sample data)
  lib/          engine.js (matching), format.js, ics.js (calendar export)
  pages/        Landing, Onboarding, Dashboard, Discover, Detail, Tracker, Vault
  store.jsx     app state and localStorage persistence
```

## Quality notes

- **Responsive.** Checked for horizontal overflow on every page at 360, 390, 768 and 1024 px. The Tracker board scrolls sideways inside itself on small screens.
- **Accessible.** Visible keyboard focus, labelled controls, dialog and live-region semantics, keyboard alternatives for drag and drop, and AA contrast.
- **Tested.** The main flows were click-tested end to end in headless Chrome: onboarding, applying, uploading, tracker moves (select and drag), filters, calendar download, command palette, and persistence across reloads.

## Honest notes

- **Sample data.** The 16 scholarships use real organisation names for realism, but the amounts, criteria and deadlines are illustrative. This is a prototype, not financial advice.
- **Local only.** Nothing is sent anywhere. Uploads keep only the file name, in your browser.
- **Built with AI assistance.** The UI started from a design generated in Google Stitch from a written brief, and the code was built with Claude Code. The concept, decisions and review are the author's.

Built for a frontend hackathon on the theme "Rethinking the Scholarship Experience".
