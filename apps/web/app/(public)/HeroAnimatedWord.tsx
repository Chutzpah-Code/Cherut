'use client';

import { useEffect, useState } from 'react';

const WORDS = ['intensity', 'speed', 'focus', 'obsession', 'direction', 'intensity'];
const TYPE_MS = 60;
const DELETE_MS = 34;
const HOLD_MS = 950;
const LONGEST = Math.max(...WORDS.map((w) => w.length));

interface HeroAnimatedWordProps {
  color: string;
}

// Typewriter cycle through WORDS, always settling back on the final
// "intensity" with a blinking cursor left on. Reserves width for the
// longest word up front so swapping words never shifts the layout.
export function HeroAnimatedWord({ color }: HeroAnimatedWordProps) {
  const [display, setDisplay] = useState('');
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setDisplay(WORDS[WORDS.length - 1]);
      setSettled(true);
      return;
    }

    let wordIndex = 0;
    let charIndex = 0;
    let phase: 'typing' | 'holding' | 'deleting' = 'typing';
    let timeoutId: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const word = WORDS[wordIndex];
      const isLastWord = wordIndex === WORDS.length - 1;

      if (phase === 'typing') {
        charIndex += 1;
        setDisplay(word.slice(0, charIndex));
        if (charIndex === word.length) {
          if (isLastWord) {
            setSettled(true);
            return;
          }
          phase = 'holding';
          timeoutId = setTimeout(tick, HOLD_MS);
          return;
        }
        timeoutId = setTimeout(tick, TYPE_MS);
      } else if (phase === 'holding') {
        phase = 'deleting';
        timeoutId = setTimeout(tick, DELETE_MS);
      } else {
        charIndex -= 1;
        setDisplay(word.slice(0, charIndex));
        if (charIndex === 0) {
          wordIndex += 1;
          phase = 'typing';
        }
        timeoutId = setTimeout(tick, DELETE_MS);
      }
    };

    timeoutId = setTimeout(tick, TYPE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <span
      style={{
        display: 'inline-block',
        minWidth: `${LONGEST + 0.6}ch`,
        textAlign: 'left',
        color,
        whiteSpace: 'nowrap',
      }}
    >
      <span aria-hidden="true">{display}</span>
      <span
        aria-hidden="true"
        className={settled ? 'lp-hero-cursor-blink' : undefined}
        style={{
          display: 'inline-block',
          width: '0.08em',
          height: '0.8em',
          marginLeft: 3,
          background: color,
          transform: 'translateY(0.08em)',
        }}
      />
      {/* Screen readers get the final word regardless of animation timing. */}
      <span
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {WORDS[WORDS.length - 1]}
      </span>
    </span>
  );
}
