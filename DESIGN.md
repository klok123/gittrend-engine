# DESIGN.md — GitTrend Design System Blueprint

## 1. Design Archetype & Intent
- **Archetype**: Linear-Dark / High-Tech Developer Radar.
- **Intent**: An authoritative, high-density intelligence engine that balances high tabular data density with sleek developer-tool aesthetics. Zero AI slop, zero generic purple meshes, crisp hairline borders, and purposeful 150ms spring physics.

---

## 2. Color System & 60-30-10 Distribution
- **Dominant Canvas (60%)**:
  - Base Canvas: `#090A0F`
  - Card Surface (Level 1): `#11131F`
  - Elevated Popovers & Modals (Level 2): `#181A2B`
- **Structural Supporting (30%)**:
  - Borders: `#1E2238` (default), `rgba(255, 255, 255, 0.08)` (hairline glass)
  - Text Primary: `#F8FAFC`
  - Text Secondary: `#94A3B8`
  - Text Muted: `#64748B`
- **Semantic Accents (10%)**:
  - Primary Brand Accent: `#FF7905` (GitTrend Orange)
  - Live Telemetry / Organic Trust: `#10B981` (Emerald)
  - Hidden Gem Accent: `#8B5CF6` (Purple)
  - Anomaly / Alert Accent: `#F43F5E` (Rose)

---

## 3. Typography & Tabular Figures
- **Font Stack**:
  - Sans: `var(--font-geist-sans), system-ui, -apple-system, sans-serif`
  - Monospace: `var(--font-geist-mono), monospace` (enforcing `font-feature-settings: "tnum"` for numeric columns and metrics).
- **Hierarchy**:
  - H1 Display: 28px - 36px font-extrabold tracking-tight. (Max 2 lines, never wrap into 4+ lines).
  - H2 Section: 20px - 24px font-bold font-mono.
  - H3 Card Title: 16px - 18px font-bold font-mono.
  - Body: 14px font-normal text-slate-400.
  - Metric Labels: 10px - 12px font-mono uppercase tracking-wider font-semibold.

---

## 4. Component Styling & Bento Grids
- **Bento Breakout Grid**:
  - 3-column asymmetric layout highlighting the #1 Breakout, Fastest Accelerating Star, and Top Hidden Gem.
- **Repo Cards**:
  - Surface elevation: `#11131F`, 1px hairline border `border-white/10`.
  - Hover state: 150ms spring lift (`hover:-translate-y-1 hover:border-[#FF7905]/40 hover:shadow-[0_12px_32px_rgba(0,0,0,0.35)]`).
  - Integrated Trust Badges: `GRADE A+`, `GRADE A`, `GRADE B`, `GRADE C`.

---

## 5. Layout & Container Rules
- Max container width: `max-w-[1560px]`.
- Mobile-first responsiveness with min 44x44px touch targets.
- Zero horizontal overflow (`overflow-x-hidden` on body).

---

## 6. Depth & Elevation
- Layer 0: Background Canvas (`#090A0F`) with subtle ambient radial vignette.
- Layer 1: Content Surfaces (`#11131F`, `shadow-[0_4px_20px_rgba(0,0,0,0.25)]`).
- Layer 2: Modals, Sticky Glass Header (`backdrop-blur-md bg-[#090A0F]/85`).

---

## 7. Motion & Interaction Physics
- Designer Lens: Emil Kowalski restraint & speed.
- Micro-interactions: `150ms - 200ms cubic-bezier(0.16, 1, 0.3, 1)`.
- No stagger-spam, no constant pulsing badges (only the single live ingestion telemetry dot).
- Strict `prefers-reduced-motion` compliance.

---

## 8. Do's & Don'ts
- **DO**: Use tabular numbers (`font-mono`) for stars, forks, and percentage deltas.
- **DO**: Maintain min 4.5:1 WCAG AA contrast on all text elements.
- **DON'T**: Use generic pastel AI gradients or centered empty hero sections.
- **DON'T**: Put emojis in buttons or use low-contrast grey-on-dark-grey text.

---

## 9. Prompt & Agent Guide
- When designing new features or components for GitTrend, always adhere to this `DESIGN.md` specification. Keep styling pure Tailwind CSS without bulky UI kit dependencies.
