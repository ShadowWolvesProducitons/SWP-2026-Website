/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // SWP brand tokens — use these in JSX
        'swp-black':       '#08090b',
        'swp-deep':        '#0d0f12',
        'swp-surface':     '#111318',
        'swp-steel':       '#1c2028',
        'swp-muted':       '#2a2f3a',
        'swp-ice':         '#6a9dbe',
        'swp-ice-dim':     'rgba(106,157,190,0.65)',
        'swp-ice-ghost':   'rgba(106,157,190,0.12)',
        'swp-white':       '#eef0f2',
        'swp-white-dim':   'rgba(238,240,242,0.55)',
        'swp-white-ghost': 'rgba(238,240,242,0.22)',
        // shadcn/ui semantic tokens
        background:   'hsl(var(--background))',
        foreground:   'hsl(var(--foreground))',
        card:         { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover:      { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary:      { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary:    { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted:        { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent:       { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive:  { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border:   'hsl(var(--border))',
        input:    'hsl(var(--input))',
        ring:     'hsl(var(--ring))',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body:    ['Outfit', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      borderRadius: {
        lg:  'var(--radius)',
        md:  'calc(var(--radius) - 1px)',
        sm:  'calc(var(--radius) - 2px)',
        swp: '3px',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
