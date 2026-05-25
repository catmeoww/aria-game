import React, { useState } from 'react';
import KnockKnock from './KnockKnock.jsx';

const GAMES = [
  { key: 'knock', label: 'KNOCK KNOCK', emoji: '🚪', color: '#FF6B6B' },
  { key: 'pet',   label: 'PET LAB',     emoji: '🧪', color: '#4ECDC4' },
];

function PetLab() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4ECDC4 0%, #A8DADC 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Fredoka", system-ui, sans-serif',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div>
        <div style={{ fontSize: 96, marginBottom: 16 }}>🧪🐾</div>
        <div
          style={{
            fontFamily: '"Lilita One", cursive',
            fontSize: 48,
            color: '#fff',
            textShadow: '4px 4px 0 rgba(0,0,0,0.2)',
            marginBottom: 12,
          }}
        >
          PET LAB
        </div>
        <div style={{ fontSize: 24, color: '#fff', fontWeight: 600 }}>
          Coming soon!
        </div>
      </div>
    </div>
  );
}

function Landing({ onPick }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFD93D 0%, #FF6B6B 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Fredoka", system-ui, sans-serif',
        padding: 24,
        gap: 24,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Fredoka:wght@500;600;700&display=swap');
        @keyframes wobble {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes popIn {
          0% { transform: scale(0); }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .launcher-title {
          font-family: 'Lilita One', cursive;
          font-size: clamp(40px, 9vw, 72px);
          color: #fff;
          text-shadow: 6px 6px 0 rgba(0,0,0,0.18);
          animation: wobble 3s ease-in-out infinite;
          text-align: center;
          line-height: 1;
        }
        .launcher-sub {
          font-size: clamp(18px, 4vw, 26px);
          color: #fff;
          font-weight: 700;
          text-shadow: 2px 2px 0 rgba(0,0,0,0.15);
          margin-bottom: 8px;
        }
        .game-btn {
          font-family: 'Lilita One', cursive;
          font-size: clamp(24px, 5vw, 34px);
          color: #fff;
          border: none;
          border-radius: 28px;
          padding: 28px 32px;
          width: min(360px, 90vw);
          box-shadow: 0 10px 0 rgba(0,0,0,0.18), 0 14px 24px rgba(0,0,0,0.18);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          transition: transform 0.08s ease, box-shadow 0.08s ease;
          animation: popIn 0.5s ease-out backwards;
        }
        .game-btn:active {
          transform: translateY(6px);
          box-shadow: 0 4px 0 rgba(0,0,0,0.18), 0 8px 16px rgba(0,0,0,0.18);
        }
        .game-btn .emoji { font-size: 1.4em; }
      `}</style>

      <div className="launcher-sub">Pick a game!</div>
      <div className="launcher-title">GAME PICKER</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 12 }}>
        {GAMES.map((g, i) => (
          <button
            key={g.key}
            className="game-btn"
            style={{ background: g.color, animationDelay: `${i * 0.1}s` }}
            onClick={() => onPick(g.key)}
          >
            <span className="emoji">{g.emoji}</span>
            <span>{g.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [game, setGame] = useState(null); // null | 'knock' | 'pet'

  if (!game) return <Landing onPick={setGame} />;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setGame(null)}
        aria-label="Back to game picker"
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 1000,
          fontFamily: '"Lilita One", cursive',
          fontSize: 22,
          background: '#fff',
          color: '#333',
          border: 'none',
          borderRadius: 999,
          width: 56,
          height: 56,
          boxShadow: '0 6px 0 rgba(0,0,0,0.18), 0 8px 16px rgba(0,0,0,0.18)',
          cursor: 'pointer',
        }}
      >
        🏠
      </button>
      {game === 'knock' && <KnockKnock />}
      {game === 'pet' && <PetLab />}
    </div>
  );
}
