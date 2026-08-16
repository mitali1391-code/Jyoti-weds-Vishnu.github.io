import React, { useMemo } from 'react';

export default function FlowerAnimation({ count = 20 }) {
  const petals = useMemo(() =>
    Array.from({ length: count }).map(() => {
      const left = (Math.random() * 100).toFixed(2) + '%';
      const delay = (Math.random() * 6).toFixed(2) + 's';
      const duration = (6 + Math.random() * 10).toFixed(2) + 's';
      const size = (12 + Math.random() * 28).toFixed(2) + 'px';
      const spin = (Math.random() * 360).toFixed(2) + 'deg';
      const sway = (Math.random() * 60 - 30).toFixed(2) + 'px';
      return { left, delay, duration, size, spin, sway };
    }),
    [count]
  );

  return (
    <div className="flower-field" aria-hidden>
      {petals.map((p, i) => (
        <div
          key={i}
          className="petal"
          style={{
            ['--left']: p.left,
            ['--delay']: p.delay,
            ['--duration']: p.duration,
            ['--size']: p.size,
            ['--spin']: p.spin,
            ['--sway']: p.sway,
          }}
        >
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
            <g transform="translate(16 16)">
              <ellipse cx="0" cy="-8" rx="4" ry="6" fill="#f7b0c6" />
              <ellipse cx="6" cy="-3" rx="4" ry="6" fill="#f7b0c6" transform="rotate(60)" />
              <ellipse cx="-6" cy="-3" rx="4" ry="6" fill="#f7b0c6" transform="rotate(-60)" />
              <ellipse cx="3" cy="6" rx="4" ry="6" fill="#f7b0c6" transform="rotate(20)" />
              <ellipse cx="-3" cy="6" rx="4" ry="6" fill="#f7b0c6" transform="rotate(-20)" />
              <circle cx="0" cy="0" r="2" fill="#ffd39e" />
            </g>
          </svg>
        </div>
      ))}
    </div>
  );
}
