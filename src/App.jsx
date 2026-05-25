import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';

/* ============================================================
   STORAGE SHIM
   Project build: uses localStorage. (The artifact version uses window.storage.)
   All game code calls store.get / store.set the same way.
   ============================================================ */
const store = {
  async get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  async set(key, val) {
    try { localStorage.setItem(key, val); } catch {}
  },
};

/* ============================================================
   SHARED SOUND EFFECTS (module scope, used by both games)
   ============================================================ */
async function playPop(note = 'E5') {
  try {
    await Tone.start();
    const s = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 } }).toDestination();
    s.volume.value = -10;
    s.triggerAttackRelease(note, '16n');
  } catch (e) {}
}
async function playKnock() {
  try {
    await Tone.start();
    const d = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 4, envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 } }).toDestination();
    d.volume.value = -6;
    d.triggerAttackRelease('C2', '8n');
    setTimeout(() => d.triggerAttackRelease('C2', '8n'), 220);
  } catch (e) {}
}
async function playRimshot() {
  try {
    await Tone.start();
    const drum = new Tone.MembraneSynth().toDestination();
    drum.volume.value = -8;
    drum.triggerAttackRelease('C3', '16n', '+0');
    drum.triggerAttackRelease('D3', '16n', '+0.12');
    drum.triggerAttackRelease('E3', '16n', '+0.24');
    const cym = new Tone.MetalSynth({ envelope: { attack: 0.001, decay: 0.5, release: 0.3 }, harmonicity: 5.1, modulationIndex: 32, resonance: 3000, octaves: 1.5 }).toDestination();
    cym.volume.value = -18;
    cym.triggerAttackRelease('C4', '4n', '+0.36');
  } catch (e) {}
}
async function playBubble() {
  try {
    await Tone.start();
    const s = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.08 } }).toDestination();
    s.volume.value = -12;
    ['C4', 'E4', 'G4', 'B4', 'D5', 'F5'].forEach((n, i) => s.triggerAttackRelease(n, '32n', `+${i * 0.13}`));
  } catch (e) {}
}
async function playFanfare() {
  try {
    await Tone.start();
    const s = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.001, decay: 0.18, sustain: 0.1, release: 0.2 } }).toDestination();
    s.volume.value = -8;
    ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => s.triggerAttackRelease(n, '16n', `+${i * 0.1}`));
  } catch (e) {}
}

/* ============================================================
   GLOBAL STYLES — injected once at the app root, applies to all screens
   ============================================================ */
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Fredoka:wght@400;500;600;700&display=swap');
      * { -webkit-tap-highlight-color: transparent; }
      .display { font-family: 'Lilita One', cursive; letter-spacing: 0.5px; }
      .wobble { animation: wobble 2.5s ease-in-out infinite; }
      @keyframes wobble { 0%,100%{transform:rotate(-2deg);} 50%{transform:rotate(2deg);} }
      .pop-in { animation: popIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }
      @keyframes popIn { 0%{transform:scale(0.3) translateY(20px);opacity:0;} 100%{transform:scale(1) translateY(0);opacity:1;} }
      .bounce-in { animation: bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
      @keyframes bounceIn { 0%{transform:scale(0.5);opacity:0;} 60%{transform:scale(1.1);opacity:1;} 100%{transform:scale(1);} }
      .shake { animation: shake 0.4s ease-in-out; }
      @keyframes shake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-6px) rotate(-1deg);} 75%{transform:translateX(6px) rotate(1deg);} }
      .float { animation: float 3s ease-in-out infinite; }
      @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
      .confetti-piece { position:absolute; top:-20px; animation: fall 2.2s linear forwards; }
      @keyframes fall { 0%{transform:translateY(-20px) rotate(0);opacity:1;} 100%{transform:translateY(120vh) rotate(720deg);opacity:0;} }
      .door-frame { background: linear-gradient(180deg,#8B4513,#6B3410); box-shadow: 0 8px 0 #4A2308, inset 0 4px 0 rgba(255,255,255,0.1); }
      .door-panel { background: linear-gradient(180deg,#A0522D,#8B4513); box-shadow: inset 0 0 0 4px rgba(0,0,0,0.15), inset 0 8px 16px rgba(0,0,0,0.2); transition: transform 0.6s cubic-bezier(0.34,1.56,0.64,1); transform-origin: left center; }
      .door-panel.open { transform: perspective(600px) rotateY(-75deg); }
      .chunky-btn { transition: transform 0.1s, box-shadow 0.1s; }
      .chunky-btn:active { transform: translateY(4px); box-shadow: 0 0 0 currentColor !important; }
      .speech { background:white; border:4px solid #2D1B4E; border-radius:24px; position:relative; box-shadow:6px 6px 0 #2D1B4E; }
      .speech::after { content:''; position:absolute; bottom:-16px; left:30px; width:0; height:0; border-left:12px solid transparent; border-right:12px solid transparent; border-top:16px solid #2D1B4E; }
      .speech::before { content:''; position:absolute; bottom:-10px; left:34px; width:0; height:0; border-left:8px solid transparent; border-right:8px solid transparent; border-top:12px solid white; z-index:1; }
      .dotted-bg { background-image: radial-gradient(circle, rgba(45,27,78,0.08) 1.5px, transparent 1.5px); background-size: 20px 20px; }
      .bubble-rise { position:absolute; bottom:0; animation: bubbleRise 1.3s ease-in forwards; }
      @keyframes bubbleRise { 0%{transform:translateY(20px) scale(0.4);opacity:0;} 25%{opacity:1;} 100%{transform:translateY(-200px) scale(1.3);opacity:0;} }
      .fizz { animation: fizz 0.5s ease-in-out infinite; }
      @keyframes fizz { 0%,100%{transform:rotate(-4deg) translateY(0);} 50%{transform:rotate(4deg) translateY(-5px);} }
      .sparkle { animation: sparkle 1.4s ease-in-out infinite; }
      @keyframes sparkle { 0%,100%{opacity:0.3; transform:scale(0.8);} 50%{opacity:1; transform:scale(1.25);} }
    `}</style>
  );
}

/* Small reusable header bar for inside a game */
function GameHeader({ onHome, right }) {
  return (
    <div className="flex justify-between items-center mb-3">
      <button
        onClick={() => { playPop('C5'); onHome(); }}
        className="display text-sm px-3 py-1.5 rounded-full chunky-btn"
        style={{ background: '#4ECDC4', color: '#2D1B4E', border: '3px solid #2D1B4E', boxShadow: '3px 3px 0 #2D1B4E' }}
      >
        🏠 HOME
      </button>
      {right}
    </div>
  );
}

/* ============================================================
   LANDING PAGE
   ============================================================ */
function Home({ onSelect }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3" style={{ background: 'radial-gradient(ellipse at top, #C9B6FF 0%, #A6C8FF 45%, #FFB4D6 100%)', fontFamily: '"Fredoka", system-ui, sans-serif' }}>
      <div className="w-full max-w-md relative dotted-bg rounded-3xl p-5" style={{ background: '#FFF8E7', border: '5px solid #2D1B4E', boxShadow: '8px 8px 0 #2D1B4E', minHeight: '600px' }}>
        <div className="flex flex-col items-center text-center pt-6">
          <div className="wobble mb-1 text-6xl">🎮</div>
          <h1 className="display text-5xl leading-none mt-2" style={{ color: '#FF6B6B', textShadow: '4px 4px 0 #2D1B4E' }}>GAME</h1>
          <h1 className="display text-5xl leading-none" style={{ color: '#4ECDC4', textShadow: '4px 4px 0 #2D1B4E' }}>BOX!</h1>
          <p className="display text-xl mt-4 mb-7" style={{ color: '#2D1B4E' }}>PICK A GAME 👇</p>

          {/* Knock Knock */}
          <button
            onClick={() => { playPop('A5'); onSelect('knock'); }}
            className="chunky-btn w-full rounded-3xl p-5 mb-5 flex items-center gap-4 text-left pop-in"
            style={{ background: '#FF6B6B', border: '4px solid #2D1B4E', boxShadow: '6px 6px 0 #2D1B4E' }}
          >
            <span className="text-6xl">🚪</span>
            <span>
              <span className="display text-3xl block text-white" style={{ textShadow: '2px 2px 0 #2D1B4E' }}>KNOCK KNOCK</span>
              <span className="text-sm text-white">Tell silly jokes!</span>
            </span>
          </button>

          {/* Pet Lab */}
          <button
            onClick={() => { playPop('C6'); onSelect('petlab'); }}
            className="chunky-btn w-full rounded-3xl p-5 flex items-center gap-4 text-left pop-in"
            style={{ background: '#7FB069', border: '4px solid #2D1B4E', boxShadow: '6px 6px 0 #2D1B4E', animationDelay: '0.1s' }}
          >
            <span className="text-6xl">🧪</span>
            <span>
              <span className="display text-3xl block text-white" style={{ textShadow: '2px 2px 0 #2D1B4E' }}>PET LAB</span>
              <span className="text-sm text-white">Make crazy pets!</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   GAME 1 — KNOCK KNOCK
   ============================================================ */
const JOKES = [
  { name: 'Lettuce', emoji: '🥬', color: '#7FB069', setup: 'Lettuce', q: 'Lettuce who?', punch: "Lettuce in — it's cold out here!" },
  { name: 'Boo', emoji: '👻', color: '#A8DADC', setup: 'Boo', q: 'Boo who?', punch: "Aww, don't cry — it's just a joke!" },
  { name: 'Cow', emoji: '🐄', color: '#E8C5A0', setup: 'Cow says', q: 'Cow says who?', punch: 'No silly — cow says MOOOO!' },
  { name: 'Olive', emoji: '🫒', color: '#606C38', setup: 'Olive', q: 'Olive who?', punch: 'Olive you so much!' },
  { name: 'Banana', emoji: '🍌', color: '#FFD93D', setup: 'Banana', q: 'Banana who?', punch: "Aren't you glad I didn't say banana again?!" },
  { name: 'Tank', emoji: '🚜', color: '#C58940', setup: 'Tank', q: 'Tank who?', punch: "You're welcome!" },
  { name: 'Honey Bee', emoji: '🐝', color: '#F4A261', setup: 'Honey bee', q: 'Honey bee who?', punch: 'Honey bee a dear and let me in!' },
  { name: 'Iguana', emoji: '🦎', color: '#52B788', setup: 'Iguana', q: 'Iguana who?', punch: 'Iguana hold your hand!' },
  { name: 'Doris', emoji: '🚪', color: '#B5651D', setup: 'Doris', q: 'Doris who?', punch: "Doris locked — that's why I knocked!" },
  { name: 'Wooden Shoe', emoji: '👞', color: '#8B5A2B', setup: 'Wooden shoe', q: 'Wooden shoe who?', punch: 'Wooden shoe like to hear another joke?!' },
  { name: 'Dwayne', emoji: '💧', color: '#5BC0EB', setup: 'Dwayne', q: 'Dwayne who?', punch: "Dwayne the bathtub — I'm drowning!" },
  { name: 'Owl', emoji: '🦉', color: '#9D6B53', setup: 'Owls', q: 'Owls who?', punch: "That's right — owls say WHOOO!" },
  { name: 'Alpaca', emoji: '🦙', color: '#D4A373', setup: 'Alpaca', q: 'Alpaca who?', punch: 'Alpaca lunch — you grab the bags!' },
  { name: 'Snow', emoji: '❄️', color: '#90E0EF', setup: 'Snow', q: 'Snow who?', punch: 'Snow use — I forgot my name!' },
  { name: 'Tuba', emoji: '🎺', color: '#E76F51', setup: 'Tuba', q: 'Tuba who?', punch: 'Tuba toothpaste, please!' },
  { name: 'Atch', emoji: '🤧', color: '#FFB4A2', setup: 'Atch', q: 'Atch who?', punch: 'Bless you!' },
  { name: 'Ya', emoji: '🎉', color: '#F4A6CD', setup: 'Ya', q: 'Ya who?', punch: 'Wow — no need to YELL!' },
  { name: 'Goat', emoji: '🐐', color: '#BDB76B', setup: 'Goat', q: 'Goat who?', punch: 'Goat to the door and see!' },
];
const REACTIONS = [
  { key: 'hilarious', label: 'HILARIOUS', emoji: '🤣', points: 3, color: '#FF6B6B' },
  { key: 'funny',     label: 'FUNNY',     emoji: '😄', points: 2, color: '#FFD93D' },
  { key: 'corny',     label: 'CORNY!',    emoji: '🧀', points: 1, color: '#4ECDC4' },
];

function KnockKnock({ onHome }) {
  const [screen, setScreen] = useState('pick'); // pick | joke | rate | stats
  const [joke, setJoke] = useState(null);
  const [step, setStep] = useState(0);
  const [stats, setStats] = useState({ total: 0, points: 0, hilarious: 0, funny: 0, corny: 0, heard: [] });
  const [confetti, setConfetti] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await store.get('knock-stats');
      if (raw) { try { setStats(JSON.parse(raw)); } catch {} }
    })();
  }, []);

  const saveStats = async (next) => { setStats(next); await store.set('knock-stats', JSON.stringify(next)); };

  const pickRandom = () => selectJoke(JOKES[Math.floor(Math.random() * JOKES.length)]);
  const selectJoke = (j) => { playPop('G5'); setJoke(j); setStep(0); setDoorOpen(false); setScreen('joke'); };

  const advance = () => {
    if (step === 0) { playKnock(); setStep(1); }
    else if (step === 1) { playPop('E5'); setStep(2); }
    else if (step === 2) { playPop('G5'); setDoorOpen(true); setStep(3); }
    else if (step === 3) { playPop('A5'); setStep(4); }
    else if (step === 4) { playRimshot(); setStep(5); setConfetti(true); setTimeout(() => setConfetti(false), 2200); }
    else if (step === 5) { playPop('A5'); setScreen('rate'); }
  };

  const rateJoke = (r) => {
    playPop(r.key === 'hilarious' ? 'C6' : r.key === 'funny' ? 'A5' : 'E4');
    saveStats({ ...stats, total: stats.total + 1, points: stats.points + r.points, [r.key]: (stats[r.key] || 0) + 1, heard: [...stats.heard.slice(-9), joke.name] });
    setScreen('stats');
  };

  const reset = () => { saveStats({ total: 0, points: 0, hilarious: 0, funny: 0, corny: 0, heard: [] }); playPop('C5'); };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3" style={{ background: 'radial-gradient(ellipse at top, #FFE5B4 0%, #FFD89B 35%, #FFA8A8 100%)', fontFamily: '"Fredoka", system-ui, sans-serif' }}>
      <div className="w-full max-w-md relative dotted-bg rounded-3xl p-4" style={{ background: '#FFF8E7', border: '5px solid #2D1B4E', boxShadow: '8px 8px 0 #2D1B4E', minHeight: '600px' }}>
        <GameHeader onHome={onHome} right={
          <div className="display text-sm px-3 py-1.5 rounded-full" style={{ background: '#FFD93D', color: '#2D1B4E', border: '3px solid #2D1B4E', boxShadow: '3px 3px 0 #2D1B4E' }}>⭐ {stats.points} PTS</div>
        } />

        {screen === 'pick' && (
          <div>
            <h2 className="display text-3xl text-center mb-1" style={{ color: '#2D1B4E' }}>WHO'S AT</h2>
            <h2 className="display text-3xl text-center mb-3" style={{ color: '#FF6B6B' }}>THE DOOR?</h2>
            <p className="text-center text-sm mb-4" style={{ color: '#2D1B4E' }}>Tap a character to hear their joke!</p>
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {JOKES.map((j, i) => (
                <button key={j.name} onClick={() => selectJoke(j)} className="chunky-btn rounded-2xl py-3 px-1 flex flex-col items-center pop-in"
                  style={{ background: j.color, border: '3px solid #2D1B4E', boxShadow: '4px 4px 0 #2D1B4E', animationDelay: `${i * 0.03}s` }}>
                  <span className="text-4xl mb-1">{j.emoji}</span>
                  <span className="display text-xs" style={{ color: '#2D1B4E' }}>{j.name.toUpperCase()}</span>
                </button>
              ))}
            </div>
            <button onClick={pickRandom} className="display text-xl w-full py-3 rounded-2xl chunky-btn"
              style={{ background: '#2D1B4E', color: '#FFD93D', border: '4px solid #2D1B4E', boxShadow: '5px 5px 0 #FF6B6B' }}>🎲 SURPRISE ME!</button>
          </div>
        )}

        {screen === 'joke' && joke && (
          <div className="flex flex-col items-center text-center pt-2">
            <p className="display text-sm mb-2" style={{ color: '#2D1B4E' }}>STEP {Math.min(step + 1, 5)} OF 5</p>
            <div className="relative my-2" style={{ width: '180px', height: '230px' }}>
              <div className="door-frame absolute inset-0 rounded-t-3xl" />
              {doorOpen && (<div className="absolute inset-0 flex items-center justify-center bounce-in"><div className="text-8xl">{joke.emoji}</div></div>)}
              <div className="absolute inset-2 top-3 rounded-t-2xl overflow-hidden">
                <div className={`door-panel absolute inset-0 rounded-t-2xl ${doorOpen ? 'open' : ''} ${step === 0 ? 'shake' : ''}`}>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-20 rounded-lg" style={{ background: 'rgba(0,0,0,0.15)', border: '3px solid rgba(0,0,0,0.2)' }} />
                  <div className="absolute top-32 left-1/2 -translate-x-1/2 w-16 h-12 rounded-lg" style={{ background: 'rgba(0,0,0,0.15)', border: '3px solid rgba(0,0,0,0.2)' }} />
                  <div className="absolute top-24 right-3 w-3 h-3 rounded-full" style={{ background: '#FFD93D', boxShadow: '0 0 8px #FFD93D' }} />
                </div>
              </div>
            </div>
            <div className="speech p-4 mx-4 mb-6 min-h-[80px] flex items-center justify-center pop-in" key={step} style={{ minWidth: '85%' }}>
              <p className="display text-2xl" style={{ color: '#2D1B4E' }}>
                {step === 0 && '👆 Tap to knock!'}
                {step === 1 && 'KNOCK KNOCK! 🚪'}
                {step === 2 && "Who's there?"}
                {step === 3 && joke.setup + '!'}
                {step === 4 && joke.q}
                {step === 5 && (<span style={{ color: '#FF6B6B' }} className="shake inline-block">{joke.punch}</span>)}
              </p>
            </div>
            {step < 5 && (
              <button onClick={advance} className="display text-2xl px-8 py-4 rounded-2xl chunky-btn"
                style={{ background: '#FFD93D', color: '#2D1B4E', border: '4px solid #2D1B4E', boxShadow: '6px 6px 0 #2D1B4E' }}>
                {step === 0 ? '✊ KNOCK!' : step === 4 ? '🎤 PUNCHLINE!' : 'NEXT →'}
              </button>
            )}
            {step === 5 && (
              <button onClick={advance} className="display text-2xl px-8 py-4 rounded-2xl chunky-btn"
                style={{ background: '#FF6B6B', color: 'white', border: '4px solid #2D1B4E', boxShadow: '6px 6px 0 #2D1B4E' }}>RATE IT! 🤣</button>
            )}
          </div>
        )}

        {screen === 'rate' && joke && (
          <div className="flex flex-col items-center text-center pt-4 pop-in">
            <div className="text-7xl mb-2">{joke.emoji}</div>
            <h2 className="display text-3xl mb-1" style={{ color: '#2D1B4E' }}>HOW WAS IT?</h2>
            <p className="text-sm mb-5" style={{ color: '#2D1B4E' }}>Rate the joke!</p>
            <div className="flex flex-col gap-3 w-full px-2">
              {REACTIONS.map((r, i) => (
                <button key={r.label} onClick={() => rateJoke(r)} className="display text-xl py-4 rounded-2xl chunky-btn pop-in flex items-center justify-center gap-3"
                  style={{ background: r.color, color: '#2D1B4E', border: '4px solid #2D1B4E', boxShadow: '5px 5px 0 #2D1B4E', animationDelay: `${i * 0.1}s` }}>
                  <span className="text-3xl">{r.emoji}</span><span>{r.label}</span><span className="text-sm">+{r.points}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {screen === 'stats' && (
          <div className="flex flex-col items-center text-center pt-4">
            <div className="text-6xl mb-2 float">🏆</div>
            <h2 className="display text-3xl mb-4" style={{ color: '#2D1B4E' }}>JOKE STATS</h2>
            <div className="grid grid-cols-2 gap-3 w-full mb-4">
              <div className="rounded-2xl p-3" style={{ background: '#FFD93D', border: '3px solid #2D1B4E', boxShadow: '3px 3px 0 #2D1B4E' }}>
                <div className="display text-3xl" style={{ color: '#2D1B4E' }}>{stats.total}</div><div className="text-xs display" style={{ color: '#2D1B4E' }}>JOKES TOLD</div>
              </div>
              <div className="rounded-2xl p-3" style={{ background: '#FF6B6B', border: '3px solid #2D1B4E', boxShadow: '3px 3px 0 #2D1B4E' }}>
                <div className="display text-3xl text-white">{stats.points}</div><div className="text-xs display text-white">TOTAL POINTS</div>
              </div>
              <div className="rounded-2xl p-3" style={{ background: '#FF6B6B', border: '3px solid #2D1B4E', boxShadow: '3px 3px 0 #2D1B4E', opacity: 0.85 }}>
                <div className="display text-2xl text-white">🤣 {stats.hilarious || 0}</div><div className="text-xs display text-white">HILARIOUS</div>
              </div>
              <div className="rounded-2xl p-3" style={{ background: '#FFD93D', border: '3px solid #2D1B4E', boxShadow: '3px 3px 0 #2D1B4E', opacity: 0.85 }}>
                <div className="display text-2xl" style={{ color: '#2D1B4E' }}>😄 {stats.funny || 0}</div><div className="text-xs display" style={{ color: '#2D1B4E' }}>FUNNY</div>
              </div>
              <div className="rounded-2xl p-3 col-span-2" style={{ background: '#4ECDC4', border: '3px solid #2D1B4E', boxShadow: '3px 3px 0 #2D1B4E' }}>
                <div className="display text-2xl" style={{ color: '#2D1B4E' }}>🧀 {stats.corny || 0} CORNY ONES</div><div className="text-xs" style={{ color: '#2D1B4E' }}>(still funny tho!)</div>
              </div>
            </div>
            <button onClick={() => setScreen('pick')} className="display text-2xl px-8 py-4 rounded-2xl chunky-btn mb-2 w-full"
              style={{ background: '#FF6B6B', color: 'white', border: '4px solid #2D1B4E', boxShadow: '6px 6px 0 #2D1B4E' }}>TELL ANOTHER! 🚪</button>
            <button onClick={reset} className="text-xs mt-1 underline" style={{ color: '#2D1B4E' }}>reset stats</button>
          </div>
        )}

        {confetti && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
            {['🎉','⭐','🤣','✨','🎊','💥','🌟','🎈','😂','🎉','⭐','💫'].map((e, i) => (
              <div key={i} className="confetti-piece" style={{ left: `${(i * 8) + Math.random() * 5}%`, animationDelay: `${i * 0.08}s`, fontSize: `${20 + Math.random() * 14}px` }}>{e}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   GAME 2 — PET LAB (creature mixer)
   ============================================================ */
const LOOKS = [
  { emoji: '🐶', name: 'Puppo' }, { emoji: '🐱', name: 'Kitten' }, { emoji: '🐰', name: 'Bunbun' }, { emoji: '🦊', name: 'Foxy' },
  { emoji: '🐸', name: 'Hopper' }, { emoji: '🐙', name: 'Inky' }, { emoji: '🦄', name: 'Sparkle' }, { emoji: '🐲', name: 'Drakey' },
  { emoji: '🐢', name: 'Shellby' }, { emoji: '🐧', name: 'Waddles' }, { emoji: '🦖', name: 'Chompy' }, { emoji: '🐝', name: 'Buzzy' },
  { emoji: '🐨', name: 'Snugs' }, { emoji: '🦥', name: 'Slowpoke' }, { emoji: '🐹', name: 'Cheeks' }, { emoji: '🦔', name: 'Spike' },
];
const COLORS = [
  { name: 'Bubblegum', hex: '#FF8FCB' }, { name: 'Sky', hex: '#7FD4FF' }, { name: 'Lime', hex: '#9EE493' }, { name: 'Sunshine', hex: '#FFD93D' },
  { name: 'Grape', hex: '#B79CE0' }, { name: 'Tangerine', hex: '#FFA45B' }, { name: 'Minty', hex: '#7FE5C7' }, { name: 'Cherry', hex: '#FF6B6B' },
];
const POWERS = ['Super Bounce 🦘', 'Invisible 👻', 'Laser Eyes 🔦', 'Super Speed ⚡', 'Can Fly 🪽', 'Fire Burps 🔥', 'Glows in Dark ✨', 'Mind Reader 🔮', 'Mega Strong 💪', 'Time Travel ⏰', 'Rainbow Sneeze 🌈', 'Bubble Breath 🫧'];
const LOVES = ['pizza 🍕', 'naptime 😴', 'puddles 💦', 'dancing 🕺', 'tacos 🌮', 'tickles 🤗', 'stars 🌟', 'cookies 🍪', 'mud baths 🛁', 'bubbles 🫧'];
const TITLES = ['Captain', 'Sir', 'Princess', 'Doctor', 'Lord', 'Lady', 'Professor', 'King', 'Queen', 'Duke', 'Mega', 'Baron'];
const SILLY = ['Wiggles', 'Sparkle', 'Noodle', 'Bubbles', 'Pickle', 'Waffles', 'Snuggle', 'Ziggy', 'Pancake', 'Mochi', 'Pumpkin', 'Biscuit', 'Marshmallow', 'Tater', 'Cuddles', 'Bonbon'];
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

function PetLab({ onHome }) {
  const [screen, setScreen] = useState('lab'); // lab | mixing | reveal | collection
  const [look, setLook] = useState(0);
  const [color, setColor] = useState(0);
  const [power, setPower] = useState(0);
  const [pet, setPet] = useState(null);
  const [name, setName] = useState('');
  const [pets, setPets] = useState([]);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    (async () => {
      const raw = await store.get('petlab-pets');
      if (raw) { try { setPets(JSON.parse(raw)); } catch {} }
    })();
  }, []);

  const savePets = async (next) => { setPets(next); await store.set('petlab-pets', JSON.stringify(next)); };

  const cycle = (val, setter, len) => { playPop('F5'); setter((val + 1) % len); };
  const surprise = () => {
    playPop('A5');
    setLook(Math.floor(Math.random() * LOOKS.length));
    setColor(Math.floor(Math.random() * COLORS.length));
    setPower(Math.floor(Math.random() * POWERS.length));
  };

  const mix = () => {
    playBubble();
    const newPet = {
      id: Date.now(),
      emoji: LOOKS[look].emoji,
      look: LOOKS[look].name,
      color: COLORS[color],
      power: POWERS[power],
      loves: rand(LOVES),
    };
    setPet(newPet);
    setName(`${rand(TITLES)} ${rand(SILLY)}`);
    setScreen('mixing');
    setTimeout(() => { playFanfare(); setScreen('reveal'); }, 1300);
  };

  const adopt = () => {
    playPop('C6');
    const finalName = name.trim() || `${rand(TITLES)} ${rand(SILLY)}`;
    savePets([...pets.slice(-49), { ...pet, name: finalName }]);
    setScreen('collection');
  };

  const Beaker = () => (
    <div className="relative flex flex-col items-center" style={{ height: '210px' }}>
      <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="bubble-rise text-2xl" style={{ left: `${35 + i * 8}%`, animationDelay: `${i * 0.2}s` }}>🫧</div>
        ))}
      </div>
      <div className="fizz text-8xl mt-6">🧪</div>
      <p className="display text-xl mt-4" style={{ color: '#2D1B4E' }}>Mixing...</p>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3" style={{ background: 'radial-gradient(ellipse at top, #C8F4D8 0%, #A6E3C8 40%, #BFA6FF 100%)', fontFamily: '"Fredoka", system-ui, sans-serif' }}>
      <div className="w-full max-w-md relative dotted-bg rounded-3xl p-4" style={{ background: '#FFF8E7', border: '5px solid #2D1B4E', boxShadow: '8px 8px 0 #2D1B4E', minHeight: '600px' }}>
        <GameHeader onHome={onHome} right={
          <button onClick={() => { playPop('G5'); setScreen('collection'); }} className="display text-sm px-3 py-1.5 rounded-full chunky-btn"
            style={{ background: '#7FB069', color: 'white', border: '3px solid #2D1B4E', boxShadow: '3px 3px 0 #2D1B4E' }}>🐾 {pets.length} PETS</button>
        } />

        {/* LAB */}
        {screen === 'lab' && (
          <div className="flex flex-col items-center text-center">
            <h2 className="display text-4xl mb-1" style={{ color: '#7FB069' }}>PET LAB 🧪</h2>
            <p className="text-sm mb-4" style={{ color: '#2D1B4E' }}>Tap each beaker to change it, then MIX!</p>

            {/* LOOK */}
            <button onClick={() => cycle(look, setLook, LOOKS.length)} className="chunky-btn w-full rounded-2xl p-3 mb-3 flex items-center justify-between"
              style={{ background: 'white', border: '4px solid #2D1B4E', boxShadow: '4px 4px 0 #2D1B4E' }}>
              <span className="display text-xs px-2 py-1 rounded-lg" style={{ background: '#FFD93D', color: '#2D1B4E' }}>LOOK</span>
              <span className="text-5xl">{LOOKS[look].emoji}</span>
              <span className="display text-lg" style={{ color: '#2D1B4E' }}>{LOOKS[look].name}</span>
              <span className="text-xl">🔄</span>
            </button>

            {/* COLOR */}
            <button onClick={() => cycle(color, setColor, COLORS.length)} className="chunky-btn w-full rounded-2xl p-3 mb-3 flex items-center justify-between"
              style={{ background: 'white', border: '4px solid #2D1B4E', boxShadow: '4px 4px 0 #2D1B4E' }}>
              <span className="display text-xs px-2 py-1 rounded-lg" style={{ background: '#FFD93D', color: '#2D1B4E' }}>COLOR</span>
              <span className="w-10 h-10 rounded-full" style={{ background: COLORS[color].hex, border: '3px solid #2D1B4E' }} />
              <span className="display text-lg" style={{ color: '#2D1B4E' }}>{COLORS[color].name}</span>
              <span className="text-xl">🔄</span>
            </button>

            {/* POWER */}
            <button onClick={() => cycle(power, setPower, POWERS.length)} className="chunky-btn w-full rounded-2xl p-3 mb-4 flex items-center justify-between gap-2"
              style={{ background: 'white', border: '4px solid #2D1B4E', boxShadow: '4px 4px 0 #2D1B4E' }}>
              <span className="display text-xs px-2 py-1 rounded-lg whitespace-nowrap" style={{ background: '#FFD93D', color: '#2D1B4E' }}>POWER</span>
              <span className="display text-base flex-1 text-center" style={{ color: '#2D1B4E' }}>{POWERS[power]}</span>
              <span className="text-xl">🔄</span>
            </button>

            <button onClick={surprise} className="display text-lg w-full py-2.5 rounded-2xl chunky-btn mb-3"
              style={{ background: '#2D1B4E', color: '#FFD93D', border: '4px solid #2D1B4E', boxShadow: '4px 4px 0 #BFA6FF' }}>🎲 SURPRISE!</button>

            <button onClick={mix} className="display text-3xl w-full py-4 rounded-2xl chunky-btn"
              style={{ background: '#7FB069', color: 'white', border: '4px solid #2D1B4E', boxShadow: '6px 6px 0 #2D1B4E' }}>🧪 MIX IT!</button>
          </div>
        )}

        {/* MIXING */}
        {screen === 'mixing' && (
          <div className="flex flex-col items-center text-center pt-10"><Beaker /></div>
        )}

        {/* REVEAL */}
        {screen === 'reveal' && pet && (
          <div className="flex flex-col items-center text-center pt-2">
            <p className="display text-xl mb-2" style={{ color: '#7FB069' }}>✨ NEW PET! ✨</p>
            <div className="relative w-full rounded-3xl p-5 mb-4 bounce-in" style={{ background: pet.color.hex, border: '4px solid #2D1B4E', boxShadow: '6px 6px 0 #2D1B4E' }}>
              <div className="absolute top-2 left-3 sparkle text-2xl">✨</div>
              <div className="absolute top-3 right-4 sparkle text-xl" style={{ animationDelay: '0.5s' }}>⭐</div>
              <div className="text-8xl mb-2">{pet.emoji}</div>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={22}
                className="display text-2xl text-center w-full rounded-xl py-1 px-2 mb-3 bg-white/80"
                style={{ color: '#2D1B4E', border: '3px solid #2D1B4E', outline: 'none' }} />
              <div className="flex flex-col gap-2 text-left">
                <div className="rounded-xl px-3 py-2 bg-white/70 display text-sm" style={{ color: '#2D1B4E' }}>🎨 Color: {pet.color.name}</div>
                <div className="rounded-xl px-3 py-2 bg-white/70 display text-sm" style={{ color: '#2D1B4E' }}>⭐ Power: {pet.power}</div>
                <div className="rounded-xl px-3 py-2 bg-white/70 display text-sm" style={{ color: '#2D1B4E' }}>❤️ Loves: {pet.loves}</div>
              </div>
            </div>
            <button onClick={adopt} className="display text-2xl w-full py-4 rounded-2xl chunky-btn mb-2"
              style={{ background: '#FF6B6B', color: 'white', border: '4px solid #2D1B4E', boxShadow: '6px 6px 0 #2D1B4E' }}>ADOPT! 🏠</button>
            <button onClick={() => { playPop('E5'); setScreen('lab'); }} className="display text-lg w-full py-2.5 rounded-2xl chunky-btn"
              style={{ background: '#FFD93D', color: '#2D1B4E', border: '4px solid #2D1B4E', boxShadow: '4px 4px 0 #2D1B4E' }}>🔄 MIX AGAIN</button>
          </div>
        )}

        {/* COLLECTION */}
        {screen === 'collection' && (
          <div className="flex flex-col items-center text-center">
            <div className="text-5xl mb-1 float">🐾</div>
            <h2 className="display text-3xl mb-3" style={{ color: '#7FB069' }}>MY PETS</h2>
            {pets.length === 0 ? (
              <div className="py-8">
                <p className="display text-lg mb-1" style={{ color: '#2D1B4E' }}>No pets yet!</p>
                <p className="text-sm mb-5" style={{ color: '#2D1B4E' }}>Mix one up in the lab 🧪</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5 mb-4 w-full">
                {[...pets].reverse().map((p, i) => (
                  <button key={p.id} onClick={() => { playPop('G5'); setViewing(p); }} className="chunky-btn rounded-2xl py-3 px-1 flex flex-col items-center pop-in"
                    style={{ background: p.color.hex, border: '3px solid #2D1B4E', boxShadow: '4px 4px 0 #2D1B4E', animationDelay: `${i * 0.03}s` }}>
                    <span className="text-4xl mb-1">{p.emoji}</span>
                    <span className="display text-xs leading-tight" style={{ color: '#2D1B4E' }}>{p.name}</span>
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => { playPop('A5'); setScreen('lab'); }} className="display text-2xl w-full py-4 rounded-2xl chunky-btn"
              style={{ background: '#7FB069', color: 'white', border: '4px solid #2D1B4E', boxShadow: '6px 6px 0 #2D1B4E' }}>➕ MAKE A PET</button>
          </div>
        )}

        {/* DETAIL OVERLAY */}
        {viewing && (
          <div className="absolute inset-0 flex items-center justify-center p-5 rounded-3xl" style={{ background: 'rgba(45,27,78,0.55)' }} onClick={() => setViewing(null)}>
            <div className="w-full rounded-3xl p-5 pop-in" style={{ background: viewing.color.hex, border: '4px solid #2D1B4E', boxShadow: '6px 6px 0 #2D1B4E' }} onClick={(e) => e.stopPropagation()}>
              <div className="text-8xl text-center mb-1">{viewing.emoji}</div>
              <div className="display text-2xl text-center mb-3" style={{ color: '#2D1B4E' }}>{viewing.name}</div>
              <div className="flex flex-col gap-2 text-left mb-4">
                <div className="rounded-xl px-3 py-2 bg-white/70 display text-sm" style={{ color: '#2D1B4E' }}>🎨 Color: {viewing.color.name}</div>
                <div className="rounded-xl px-3 py-2 bg-white/70 display text-sm" style={{ color: '#2D1B4E' }}>⭐ Power: {viewing.power}</div>
                <div className="rounded-xl px-3 py-2 bg-white/70 display text-sm" style={{ color: '#2D1B4E' }}>❤️ Loves: {viewing.loves}</div>
              </div>
              <button onClick={() => { playPop('E5'); setViewing(null); }} className="display text-xl w-full py-3 rounded-2xl chunky-btn"
                style={{ background: '#2D1B4E', color: '#FFD93D', border: '4px solid #2D1B4E', boxShadow: '4px 4px 0 #FFF8E7' }}>CLOSE</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   APP — hub router
   ============================================================ */
export default function App() {
  const [game, setGame] = useState('home');
  return (
    <>
      <GlobalStyles />
      {game === 'home' && <Home onSelect={setGame} />}
      {game === 'knock' && <KnockKnock onHome={() => setGame('home')} />}
      {game === 'petlab' && <PetLab onHome={() => setGame('home')} />}
    </>
  );
}
