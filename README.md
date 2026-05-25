# 🚪 Knock Knock! Joke Builder

A chunky, colorful knock-knock joke game for kids. Pick a character, tap through
the joke line by line (with sound effects and a door that swings open), then rate
how funny it was to earn points. High scores save automatically.

## Quick start

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually http://localhost:5173).

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # serve the build locally
```

## Tech

React + Vite + Tailwind CSS, with Tone.js for sound effects. The whole game lives
in `src/App.jsx`. See `CLAUDE.md` for a full breakdown of how it works and ideas
for what to build next.

## Adding jokes

Edit the `JOKES` array at the top of `src/App.jsx`. Each entry looks like:

```js
{ name: 'Banana', emoji: '🍌', color: '#FFD93D',
  setup: 'Banana', q: 'Banana who?',
  punch: "Aren't you glad I didn't say banana again?!" }
```
