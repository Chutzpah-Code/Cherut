// Design tokens extracted from docs/rebranding/site.css — the public site's
// light "Geist" rebrand. Shared by every component under components/shell
// and components/ui/{Header,PublicFooter,PublicDisclaimer}.tsx.
//
// This file must have zero imports from sibling design-system modules.
// Shell.tsx, primitives.tsx, AuthShell.tsx and the ui/Header|PublicFooter|
// PublicDisclaimer components all need this value at module-evaluation
// time; if any of them imported it from one another instead of from this
// standalone module, it creates a circular import where a `const` export
// is read before its declaring module finishes initializing — a crash
// shipped to production as "Cannot access 'X' before initialization".
export const SHELL_TOKENS = {
  ink: '#0B0B10',
  ink2: '#3A3A44',
  mute: '#6B6B76',
  paper: '#FFFFFF',
  off: '#F6F6F4',
  rule: 'rgba(11,11,16,.09)',
  ruleD: 'rgba(255,255,255,.12)',
  acc: '#3B5BF6',
  accSoft: '#E8EDFF',
  accLight: '#8FA6FF',
  ease: 'cubic-bezier(.23,1,.32,1)',
  max: 1200,
} as const;
