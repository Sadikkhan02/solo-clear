# Solo Clear Design System Specification (StitchMCP)

**Project Title:** Solo Clear - Gamified Fitness App  
**Stitch Project ID:** `10195320408408459987`  
**Design System ID:** `assets/7444062321205372511`  
**Target Device:** Mobile First (360px - 430px base, responsive to Tablet & Desktop)

---

## 1. Color Palette & Semantics

| Token | Hex Value | Semantic Usage |
| :--- | :--- | :--- |
| `--color-bg` | `#f0f4f8` | Primary application background (soft light blue-grey) |
| `--color-surface` | `#ffffff` | Elevated component surface cards |
| `--color-primary` | `#6366f1` | Primary action buttons, active tabs, hero gradients |
| `--color-secondary` | `#8b5cf6` | Rank badges, secondary pills, subtle accents |
| `--color-accent` | `#ec4899` / `#f472b6` | Pulsing timer ring, streak flame, active alerts |
| `--color-text-primary`| `#1a1a2e` | Headings, level numbers, high-emphasis text |
| `--color-text-secondary`| `#4a4a6a` | Body copy, descriptions, subtitles |
| `--color-text-muted` | `#8a8a9e` | Metadata, timestamps, category labels |
| `--color-success` | `#10b981` | Completed quests, claimed rewards, checkmarks |
| `--color-warning` | `#f59e0b` | Constitution stat (`CON`), streak count, warnings |
| `--color-danger` | `#ef4444` | Strength stat (`STR`), penalty alerts, close actions |

---

## 2. Typography Scale

- **Headings (`--font-heading`)**: `'Inter', sans-serif`, Weight: 700 / 800
- **Body (`--font-body`)**: `'Inter', sans-serif`, Weight: 400 / 500
- **Monospace & Data (`--font-mono`)**: `'JetBrains Mono', monospace`, Weight: 700 / 900

| Level | Size | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-lg` | 32px (2rem) | 800 | 1.2 | -0.02em | Hero Level Up title, major milestones |
| `display-md` | 24px (1.5rem)| 700 | 1.25 | -0.01em | Page headings, modal titles |
| `title-lg` | 18px (1.125rem)| 700 | 1.3 | 0 | Card section titles, rank names |
| `title-sm` | 14px (0.875rem)| 600 | 1.4 | 0 | Exercise names, stat labels |
| `body-md` | 13px (0.8125rem)| 400 | 1.5 | 0 | Descriptions, helper paragraphs |
| `caption` | 10px (0.625rem)| 500 | 1.4 | 0.05em | Category pills, EXP ratios, status tags |
| `data-timer` | 44px (2.75rem)| 900 | 1.0 | 0.02em | Digital timer display (`MM:SS`) |

---

## 3. Elevation, Borders & Shapes

### Border Radii
- `rounded-sm`: `8px` — Tags, category badges, micro pills
- `rounded-md`: `12px` — Buttons, tool buttons, small inputs
- `rounded-lg`: `16px` — Daily quest cards, stat modules, chart containers
- `rounded-xl`: `24px` — Modals, hero progress cards, main panels
- `rounded-full`: `9999px` — Circular avatars, timer ring, status indicators

### Box Shadows & Glows
- `shadow-sm`: `0 2px 8px rgba(0, 0, 0, 0.04)`
- `shadow-md`: `0 4px 24px rgba(0, 0, 0, 0.06)`
- `shadow-lg`: `0 8px 48px rgba(0, 0, 0, 0.08)`
- `shadow-glow-primary`: `0 0 24px rgba(99, 102, 241, 0.3)`
- `shadow-glow-success`: `0 0 20px rgba(16, 185, 129, 0.25)`

---

## 4. Component Blueprints

### A. Hunter Profile & Progress Header
```
┌────────────────────────────────────────────────────────┐
│ [Avatar]  Hunter Jin-Woo           [🔥 4d]  [⚙️] [📊] │
│           E-Rank • LVL 1                               │
├────────────────────────────────────────────────────────┤
│ EXP 0.8 / 12                         Next Level: +11.2 │
│ [████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 7%     │
└────────────────────────────────────────────────────────┘
```

### B. Daily Quest Card
```
┌────────────────────────────────────────────────────────┐
│ [💪] Push-ups                  [STR]        [+2.5 EXP] │
│      Target: 40 reps                                   │
│                                                        │
│ [ ⏱️ Start Timer ]             [ ◯ Mark Complete ]     │
└────────────────────────────────────────────────────────┘
```

### C. 4-Axis Balanced Diamond Radar Chart (Rewards Hub)
```
                          STR (Top)
                              ▲
                             / \
                            /   \
            CON (Left) ◄───┼─────┼───► AGI (Right)
                            \   /
                             \ /
                              ▼
                          VIT (Bottom)
```

### D. Attribute Card (Status Screen)
```
┌────────────────────────────────────────────────────────┐
│ [ - ]          [ 🛡️ CON (Constitution) ]       [ + ]   │
│                             9                          │
│   Bolsters baseline vitality and adds +1% bonus EXP    │
│               per point on hunt completions.           │
└────────────────────────────────────────────────────────┘
```

---

## 5. Responsive Breakpoint Rules

- **Mobile Viewport (`360px - 640px`)**:
  - Full-width stacked containers with `padding: 16px`.
  - 2-column KPI grids, 1-column quest cards.
  - Sticky bottom CTAs with safe area insets.
- **Tablet & Desktop Viewport (`641px+`)**:
  - Max container width: `480px` (Centered mobile device frame simulation).
  - Ambient backdrop glow and subtle outer glass borders.

---

## 6. Generated Screen Assets in StitchMCP

1. **Dashboard (`projects/10195320408408459987/screens/94ee8a2fb9fb454d9db7134fe522d394`)**:
   - High-fidelity Hunter Profile, EXP progress bar, and 4 daily quest cards.
2. **Workout Timer Modal (`projects/10195320408408459987/screens/76ce0556c2f74f6aa199937adc78be3d`)**:
   - Digital MM:SS clock with glowing ring and 4-state workout controls.
3. **Hunter Status Screen (`projects/10195320408408459987/screens/a89da3ef996446ab96b2482c6e89794b`)**:
   - 4 attribute allocation cards (STR, VIT, AGI, CON 🛡️).
4. **Visual Analytics Hub**:
   - 4-KPI grid, EXP area chart, completion rate bar chart, and 30-day activity heatmap.
5. **System Rewards & Arsenal**:
   - 4-axis diamond radar chart, Next Reward preview, and milestone progression cards.
6. **Level Up Celebration & Toasts**:
   - Celebration modal, stat rewards banner, and slide-down notification toasts.
