// ── Shared admin inline style tokens ──
// Import this in every admin tab component and use instead of Tailwind colour classes

export const A = {
  // Surfaces
  card: {
    background: 'rgba(17,19,24,0.7)',
    border: '0.5px solid rgba(255,255,255,0.07)',
    borderRadius: '3px',
    padding: '28px 32px',
  },
  cardSm: {
    background: 'rgba(17,19,24,0.7)',
    border: '0.5px solid rgba(255,255,255,0.07)',
    borderRadius: '3px',
    padding: '18px 22px',
  },

  // Typography
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '26px',
    letterSpacing: '0.03em',
    color: 'var(--swp-white)',
    marginBottom: '4px',
  },
  sectionSub: {
    fontFamily: 'var(--font-mono)',
    fontSize: '9px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'rgba(238,240,242,0.3)',
    marginBottom: '28px',
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: '9px',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'rgba(238,240,242,0.35)',
  },
  bodyText: {
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    fontWeight: 300,
    color: 'rgba(238,240,242,0.55)',
    lineHeight: 1.65,
  },
  mutedText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'rgba(238,240,242,0.25)',
    letterSpacing: '0.1em',
  },

  // Buttons
  btnPrimary: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    fontWeight: 400,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    background: 'var(--swp-ice)',
    color: 'var(--swp-black)',
    border: 'none',
    borderRadius: '2px',
    padding: '10px 20px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  },
  btnGhost: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    background: 'transparent',
    color: 'rgba(238,240,242,0.45)',
    border: '0.5px solid rgba(255,255,255,0.12)',
    borderRadius: '2px',
    padding: '10px 20px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  },
  btnDanger: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    background: 'transparent',
    color: 'rgba(200,80,80,0.75)',
    border: '0.5px solid rgba(200,80,80,0.25)',
    borderRadius: '2px',
    padding: '8px 16px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  },

  // Status badges
  badge: (type) => {
    const map = {
      new:      { bg: 'rgba(106,157,190,0.12)', color: '#6a9dbe',            border: 'rgba(106,157,190,0.25)' },
      read:     { bg: 'rgba(200,175,120,0.10)', color: 'rgba(200,175,120,0.9)', border: 'rgba(200,175,120,0.25)' },
      replied:  { bg: 'rgba(120,200,140,0.10)', color: 'rgba(120,200,140,0.9)', border: 'rgba(120,200,140,0.25)' },
      archived: { bg: 'rgba(238,240,242,0.05)', color: 'rgba(238,240,242,0.3)', border: 'rgba(255,255,255,0.08)' },
      dev:      { bg: 'rgba(200,175,120,0.10)', color: 'rgba(200,175,120,0.9)', border: 'rgba(200,175,120,0.25)' },
      post:     { bg: 'rgba(120,200,140,0.10)', color: 'rgba(120,200,140,0.9)', border: 'rgba(120,200,140,0.25)' },
      released: { bg: 'rgba(106,157,190,0.10)', color: '#6a9dbe',            border: 'rgba(106,157,190,0.2)' },
      featured: { bg: 'rgba(106,157,190,0.12)', color: '#6a9dbe',            border: 'rgba(106,157,190,0.3)' },
    };
    const t = map[type?.toLowerCase()] || map.archived;
    return {
      fontFamily: 'var(--font-mono)',
      fontSize: '8px',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      padding: '3px 9px',
      borderRadius: '1px',
      background: t.bg,
      color: t.color,
      border: \`0.5px solid \${t.border}\`,
      display: 'inline-flex',
      alignItems: 'center',
      whiteSpace: 'nowrap',
    };
  },

  // Divider
  divider: {
    height: '0.5px',
    background: 'rgba(255,255,255,0.07)',
    margin: '24px 0',
  },

  // Section header row
  sectionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '20px',
  },

  // Tabs (sub-nav inside a tab)
  subTab: (active) => ({
    fontFamily: 'var(--font-mono)',
    fontSize: '9px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    padding: '8px 16px',
    borderRadius: '2px',
    border: 'none',
    cursor: 'pointer',
    background: active ? 'rgba(106,157,190,0.12)' : 'transparent',
    color: active ? 'var(--swp-ice)' : 'rgba(238,240,242,0.35)',
    borderBottom: active ? '1px solid var(--swp-ice)' : '1px solid transparent',
    transition: 'all 0.2s',
  }),
};

// Helper: map old Tailwind class strings → new styles
// Use in JSX like: style={statusStyle(film.status)}
export const statusStyle = (status) => A.badge(
  status === 'New' ? 'new'
  : status === 'Read' ? 'read'
  : status === 'Replied' ? 'replied'
  : status === 'Archived' ? 'archived'
  : (status || '').toLowerCase()
);
