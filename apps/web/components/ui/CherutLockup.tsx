// Direction 2A ("ring and centre point") horizontal lockup — mark + wordmark
// + Hebrew subline — per docs/logo/Cherut Logo Spec.md. All three sizes below
// are the ones documented there; geometry (r27 / stroke 5.6 / dot r5.6) is a
// single drawing reused at different render sizes, not redrawn per size.
const SIZES = {
  39: { latin: 18, hebrew: 17.1 },
  61: { latin: 28, hebrew: 26.6 },
  91: { latin: 42, hebrew: 39.9 },
} as const;

interface CherutLockupProps {
  size?: keyof typeof SIZES;
  subline?: boolean;
  reverse?: boolean;
}

export function CherutLockup({ size = 39, subline = true, reverse = false }: CherutLockupProps) {
  const { latin, hebrew } = SIZES[size];
  const ink = reverse ? '#FFFFFF' : '#0F172A';
  const accent = reverse ? '#FFFFFF' : '#1D4ED8';
  const sublineColor = reverse ? '#7E93C4' : '#637499';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.34 }}>
      <svg viewBox="0 0 64 64" width={size} height={size} fill="none" aria-label="Cherut" style={{ flexShrink: 0 }}>
        <circle cx="32" cy="32" r="27" stroke={accent} strokeWidth="5.6" />
        <circle cx="32" cy="32" r="5.6" fill={accent} />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: latin, fontWeight: 700, letterSpacing: '-0.025em', color: ink, lineHeight: 1 }}>Cherut</div>
        {subline && (
          <div style={{ fontFamily: "'Noto Sans Hebrew', sans-serif", fontSize: hebrew, fontWeight: 800, letterSpacing: '0.24em', marginRight: '-0.24em', color: sublineColor, lineHeight: 1, direction: 'rtl' }}>חירות</div>
        )}
      </div>
    </div>
  );
}
