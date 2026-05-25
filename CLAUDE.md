# CLAUDE.md — Knock Knock! Joke Builder

Context file for Claude Code. Read this first when picking up the project.

## What this is

A kid-friendly "Knock Knock" joke game, built as a single-page React app. The
player picks a character, taps through the call-and-response of a knock-knock
joke one line at a time (with sound effects and a door that swings open on the
reveal), then rates the joke to earn points. Stats persist between sessions.

It was originally prototyped as a Claude.ai artifact, then exported to this
standalone Vite project. The only change made during export was swapping the
artifact-only `window.storage` API for the browser's `localStorage`.

Target audience: kids. Round length: ~5–15 min. Design goal: chunky, playful,
"so easy a young kid can play it" — big tap targets, bright colors, sound.

## Run it

```bash
npm install
npm run dev      # local dev server (Vite)
npm run build    # production build to dist/
npm run preview  # preview the build
```

## Stack

- React 18 (single component, `src/App.jsx`)
- Vite 5 (build/dev)
- Tailwind CSS 3 (utility classes; some inline styles for the chunky-toy look)
- Tone.js (Web Audio sound effects — knock, pop, rimshot/drumroll)
- Fonts: "Lilita One" + "Fredoka" loaded via Google Fonts `@import` inside a
  `<style>` block in `App.jsx`

## File map

- `src/App.jsx` — the entire game (state machine + render + sounds + styles)
- `src/main.jsx` — React entry
- `src/index.css` — Tailwind directives
- `index.html` — has a no-zoom viewport meta (kids tapping fast)

## How App.jsx is organized

- `JOKES` — array of 18 joke objects: `{ name, emoji, color, setup, q, punch }`
- `REACTIONS` — the 3 rating buttons: `{ key, label, emoji, points, color }`
  - keys are `hilarious` (3 pts), `funny` (2 pts), `corny` (1 pt)
- `App()` — single component. Key state:
  - `screen`: `start | pick | joke | rate | stats` (the whole flow is a screen machine)
  - `step`: 0–5 within a joke. 0 = pre-knock, 1 = "Knock knock!", 2 = "Who's there?",
    3 = setup, 4 = "<setup> who?", 5 = punchline. `advance()` drives this.
  - `stats`: `{ total, points, hilarious, funny, corny, heard[] }`, saved to localStorage key `knock-stats`
  - `doorOpen`, `confetti`: animation flags
- Sound helpers: `playKnock`, `playRimshot`, `playPop` (all guard `Tone.start()` in try/catch)
- Styling: CSS keyframe animations + the chunky look live in the big `<style>`
  block near the top of the render (wobble, popIn, bounceIn, shake, float,
  confetti fall, the door panel transforms, speech bubble, chunky-btn press).

## Known notes / gotchas

- **Punchline pacing was deliberate.** Step 5 (the punchline) does NOT
  auto-advance — the user tapped "RATE IT!" to move on. Earlier there was an
  auto-timeout that dismissed the punchline too fast; it was removed on purpose.
  Don't reintroduce a timer that leaves the punchline screen automatically.
- Audio needs a user gesture to start (browser autoplay policy). That's why
  every sound call awaits `Tone.start()` — the first tap unlocks it.
- All joke text is currently hardcoded in the `JOKES` array.

## Possible next steps (ideas, not committed)

- Add more jokes / let kids unlock characters as they play
- Categories or themes (animal jokes, food jokes)
- A "read aloud" option using the Web Speech API for pre-readers
- Personalize for a specific kid (custom name jokes)
- Optional: an AI-generated "joke of the day" if moving to a backend
- Replace emoji characters with custom illustrations
- Sound on/off toggle and a volume control
