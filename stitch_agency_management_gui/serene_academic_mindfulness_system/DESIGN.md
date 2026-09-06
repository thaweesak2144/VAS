---
name: Serene Academic Mindfulness System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3f4944'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6f7973'
  outline-variant: '#bec9c2'
  surface-tint: '#1b6b51'
  primary: '#004532'
  on-primary: '#ffffff'
  primary-container: '#065f46'
  on-primary-container: '#8bd6b7'
  inverse-primary: '#8bd6b6'
  secondary: '#4059aa'
  on-secondary: '#ffffff'
  secondary-container: '#8fa7fe'
  on-secondary-container: '#1d3989'
  tertiary: '#00443e'
  on-tertiary: '#ffffff'
  tertiary-container: '#005e56'
  on-tertiary-container: '#6cd9cb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a6f2d1'
  primary-fixed-dim: '#8bd6b6'
  on-primary-fixed: '#002116'
  on-primary-fixed-variant: '#00513b'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#b6c4ff'
  on-secondary-fixed: '#00164e'
  on-secondary-fixed-variant: '#264191'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
  margin-mobile: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  max-content-width: 1280px
---

## Brand & Style

This design system establishes a tranquil, disciplined, and institutional interface tailored for high-volume academic meditation retreats, monastic registrations, and student attendance tracking. It bridges formal academic rigor with the serene, contemplative atmosphere of Vipassana meditation.

### Brand Personality & Emotional Impact
- **Serene & Grounded:** Relieves visual noise and administrative anxiety through balanced whitespace, organic sage undertones, and balanced structural rhythm.
- **Trustworthy & Academic:** Projects the administrative reliability, accountability, and clarity required of university governance and accreditation reporting.
- **Mindful & Focused:** Reduces cognitive fatigue for monastic proctors, university registrars, and student retreat participants with high-legibility typographic hierarchies and glanceable visual status cues.

### Visual Style
The aesthetic fuses **Modern Academic Minimalism** with **Calm Organic Tactility**. Structural surfaces feature clean, soft-bordered containers resting on warm neutral tints. Elevation relies on subtle, diffuse ambient shadows reminiscent of natural light filtering through open meditation halls. Functional UI elements balance structured tabular information with rounded, pill-shaped markers for fluid status verification.

## Colors

The palette draws directly from the balance between nature (sage, deep forest green) and institutional authority (deep slate navy). The interaction model prioritizes contrast, legibility, and psychological tranquility.

### Primary Accents & Hierarchy
- **Deep Forest Sage (`#065F46`):** Primary anchor for key interface elements, high-level headers, verified session markers, and primary call-to-actions.
- **Deep Slate Navy (`#1E3A8A`):** Secondary accent for academic metadata, institutional branding, cohort tags, and administrative navigation bars.
- **Muted Teal / Jade (`#0D9488`):** Tertiary accent for interactive links, subtle focus highlights, and active meditation session indicators.
- **Vibrant Sage Emerald (`#10B981`):** Success metric confirmations and attendance affirmations.

### Background & Surface Hierarchy
- **App Canvas (`#F8FAFC`):** Cool slate tinted base canvas minimizing eye strain across extended audit shifts.
- **Surface Elevation / Cards (`#FFFFFF`):** Pure white container surfaces for optimal data row separation and clear content hierarchy.
- **Subtle Surface Tint (`#F0FDF4`):** Soft herbal cream tone reserved for active meditation timers, confirmed check-ins, and highlight rows.

### Attendance & State Indicators
- **Present / Verified:** Forest Green text (`#065F46`) over soft jade wash (`#ECFDF5`) with subtle border (`#A7F3D0`).
- **Late / Delayed:** Warm Amber text (`#B45309`) over calm cream wash (`#FFFBEB`) with subtle border (`#FDE68A`).
- **Absent / Excused:** Slate Muted text (`#64748B`) over light neutral wash (`#F1F5F9`) with subtle border (`#E2E8F0`).
- **Duplicate / Attention Required:** Soft Coral text (`#991B1B`) over rose mist wash (`#FEF2F2`) with subtle border (`#FECACA`).
- **Active Session / In-Progress:** Teal Pulse text (`#0F766E`) over seafoam tint (`#CCFBF1`) with vibrant active ring (`#0D9488`).

## Typography

Typography balances pristine modern Latin forms with flawless Thai script integration. **Plus Jakarta Sans** provides a welcoming, humanist cadence for display headers and section milestones. **Inter** serves as the primary engine for dense administrative dashboards, attendance rosters, and student record summaries due to its neutral proportions, tall x-height, and numerical clarity.

### Thai Language Harmonization (Sarabun / Prompt Fallback)
In runtime environments handling bilingual Thai-English documents (e.g., student IDs, monastic ranks, dharma titles, and university course codes):
- Thai display headlines fallback gracefully to **Prompt** (weights 600, 700) matching Plus Jakarta Sans' open geometric curvature.
- Thai body, tabular records, and data lists map to **Sarabun** (weights 400, 500) matching Inter’s legibility and formal academic tone.
- Base line-height for mixed Thai/English scripts automatically scales to a minimum of 1.5x font-size to prevent upper tone mark and subscript clipping.
- Monospaced digits (`code-md` using JetBrains Mono) are strictly enforced for Student IDs, National IDs, RFID badge values, and timestamp logging.

## Layout & Spacing

The layout is constructed on an 8pt architectural rhythm grid, providing a disciplined yet spacious rhythm that feels unhurried. 

### Grid & Form Factors
- **Mobile (<768px):** 4-column fluid layout with `margin-mobile` (16px) margins and `gutter-mobile` (16px) gutters. Cards and table rows condense into vertical stack summaries featuring thumb-friendly touch targets (minimum 44x44px).
- **Tablet (768px - 1024px):** 8-column layout with `margin-tablet` (32px) margins and `gutter-desktop` (24px) gutters. Top actions consolidate into contextual split toolbars.
- **Desktop (>1024px):** 12-column layout bound by `max-content-width` (1280px) and centered on screen. Features a persistent 280px serene navigation dock with dual-pane layout capability (e.g., roster list on the left, individual student meditation progress card on the right).

### Rhythmic Discipline
- Spacing between related form fields or metadata pairs adheres to `space-xs` (8px) and `space-sm` (12px).
- Major container boundaries and retreat hall session blocks utilize `space-lg` (24px) internal padding and `space-xl` (32px) bottom margins.

## Elevation & Depth

This system avoids heavy drop shadows and dramatic skeuomorphism. It mimics the calm, diffused illumination of an airy meditation hall through soft ambient light and precise border definitions.

### Depth Stratification
- **Ground Floor (Canvas Level):** The `#F8FAFC` foundation provides a non-reflective, soft backdrop.
- **Level 1 (Cards & Data Sections):** High-grade pure white `#FFFFFF` resting with a hairline boundary: `1px solid #E2E8F0` or `#E7ECE9` (sage-tinted border). Casts a faint, ambient floor shadow: `box-shadow: 0 1px 3px 0 rgba(6, 95, 70, 0.03), 0 1px 2px -1px rgba(6, 95, 70, 0.03)`.
- **Level 2 (Hover Surfaces & Session Blocks):** For interactive row cards and retreat hall selectors: `box-shadow: 0 4px 12px -2px rgba(6, 95, 70, 0.06), 0 2px 6px -1px rgba(30, 58, 138, 0.04)`.
- **Level 3 (Modals & Check-In Drawers):** For badge scanning confirmation drawers and popovers: `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)` combined with a frosted backdrop overlay (`rgba(15, 23, 42, 0.25)` with `backdrop-filter: blur(4px)`).

### Ghost Outlines & Tonal Separators
Separators inside data tables never use harsh dark borders; they utilize subtle 1px divider lines in `#F1F5F9`, maintaining crisp organization without visually fragmenting the page.

## Shapes

The design uses a roundedness level of **2**, striking an organic yet professional balance. Pure sharp corners feel too aggressive for a contemplative retreat environment, while oversized pill curves dilute institutional academic authority.

### Border Radius Hierarchy
- **Standard UI Elements (`rounded` / 8px):** Applied to form inputs, search fields, dropdown triggers, and utility icon wrappers.
- **Containers & Data Panels (`rounded-lg` / 16px):** Applied to roster cards, meditation hall session wrappers, report export containers, and modals.
- **Hero & Status Cards (`rounded-xl` / 24px):** Applied to active meditation monitors, retreat milestone cards, and dashboard overview metrics.
- **Pill Badges & Buttons (`rounded-full` / 9999px):** Applied exclusively to attendance status chips, QR/RFID indicator lights, and primary meditation action controls.

## Components

### Buttons
- **Primary Action (Check-in / Start Session):** Background `#065F46`, foreground `#FFFFFF`, soft border-radius (`8px`), hover state shifts to `#044E3A` with a micro-lift. Focus ring is an offset 2px ring of `#10B981`.
- **Secondary Action (Export / Print Roster):** Surface white `#FFFFFF` with slate border `1px solid #CBD5E1`, text `#1E3A8A`. Hover transitions background to `#F8FAFC`.
- **Tertiary / Ghost (Dismiss / Secondary Filter):** Transparent background, text `#475569`, hover to `#F1F5F9`.

### Attendance Badges & Status Chips
Pill-shaped containers (`rounded-full`) with a fixed height of 28px, font token `label-sm`, padding `4px 12px`, and a 6px status dot:
- **Present:** Emerald pill (`#ECFDF5`), border `1px solid #A7F3D0`, dot `#059669`, text `#065F46`.
- **Absent:** Slate pill (`#F8FAFC`), border `1px solid #E2E8F0`, dot `#94A3B8`, text `#475569`.
- **Late:** Warm amber pill (`#FFFBEB`), border `1px solid #FDE68A`, dot `#D97706`, text `#92400E`.
- **Duplicate Entry Warning:** Soft ruby pill (`#FEF2F2`), border `1px solid #FECACA`, dot `#DC2626`, text `#991B1B`.
- **Active Meditation Hall Session:** Seafoam pill (`#CCFBF1`), border `1px solid #5EEAD4`, text `#0F766E`, dot features a subtle CSS breathing pulse animation simulating mindful respiration.

### Input Fields & Search
- Standard text and biometric/RFID reader inputs feature a 42px height, soft border (`#CBD5E1`), background `#FFFFFF`, text `#0F172A`, placeholder `#94A3B8`.
- Focus state provides a clean transition to border `#0D9488` with a 3px outer glow `rgba(13, 148, 136, 0.15)`.
- Quick-search fields for Thai name/Student ID include an integrated leading search icon and trailing keyboard shortcut chip.

### Checkboxes & Selection Controls
- Checkboxes use `rounded` (4px) with subtle `#94A3B8` border in rest state. Checked state fills with `#065F46` displaying a crisp white check icon.
- Multi-row bulk attendance selection displays a floating dock at screen bottom with emerald confirmation actions.

### Cards & Data Tables
- **Attendance Card:** Built with `rounded-xl` (24px) wrapping, pure white fill, with subtle `#E2E8F0` border.
- **Roster Table Rows:** Alternating hover highlight with `#F0FDF4`. Row height fixed at 56px to ensure ample touch targets during rapid roll calls. Column headers use `label-md` in uppercase slate navy (`#1E3A8A`).

### Domain-Specific Components
- **Meditation Timer & Session Anchor:** A prominent top module displaying the current retreat sitting (e.g., "Sitting Meditation Session 3 — Hall A"), elapsed countdown, proctor monk in charge, and live presence tally (e.g., "142 / 150 Students Seated").
- **QR / Barcode Quick-Scanner Viewport:** Soft rounded camera target with sage green viewfinder guides (`#10B981`) and instantaneous audio-visual haptic validation toast.