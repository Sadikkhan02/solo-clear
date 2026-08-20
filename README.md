# ⚔️ Solo Clear

> A mobile-first, Solo Leveling-inspired daily quest & system interface with dark atmospheric lighting, tactile neumorphism, and progressive gamification.

---

## 🌟 Overview

**Solo Clear** is an immersive, mobile-optimized fitness quest tracker modeled after the iconic *Solo Leveling System*. It transforms real-world physical training into an RPG-like progression system with rank scaling, attribute allocation, daily quest completion, and inactivity penalty mechanisms.

---

## 🚀 Features

- **📱 Mobile-First Real Estate**: Capped at ~400px with zero grey tap-flash (`-webkit-tap-highlight-color: transparent`) and locked horizontal overflow.
- **🌌 System Atmosphere**: Deep obsidian background (`#0a0a0f`), dark card surfaces (`#14141e`), glowing cyan energy accents (`#4facfe`), and ambient glow orbs.
- **💎 Thumb-Friendly Neumorphism & Glass**: Soft raised (`shadow-neu-raised`) and inset pressed (`shadow-neu-pressed`) tactile surfaces designed specifically for mobile thumb reach.
- **📈 Core Math & Tier Scaling**:
  - Required EXP: $\lceil 10 \times (1.2)^{\text{level}} \rceil$
  - Ranks: **E-Rank** ($<10$), **D-Rank** ($10-19$), **C-Rank** ($20-29$), and **B-Rank+** ($\ge 30$) with adaptive workout targets.
- **⚡ Inactivity Penalty System**: Missing 2+ days of training triggers a 50% EXP penalty and resets your streak to 0.
- **💾 Local Storage Persistence**: All progress, attributes, streaks, and timestamps persist seamlessly across phone browser sessions.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Library**: [React 18](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom Neumorphic Design Tokens
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn / pnpm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd solo_clear

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your mobile browser or emulator to view the application.

---

## 📱 Project Structure

```
solo_clear/
├── app/
│   ├── globals.css         # Global mobile resets & custom scrollbars
│   ├── layout.js           # Atmospheric orbs & mobile viewport container
│   └── page.js             # System dashboard & daily quest interface
├── components/
│   └── ui/
│       ├── GlassCard.jsx        # Translucent glassmorphism container
│       ├── NeumorphicButton.jsx # 56px thumb-friendly interactive button
│       └── ExpBar.jsx           # Glowing h-5 mobile progress bar
├── hooks/
│   └── useSystemData.jsx   # LocalStorage & mobile penalty hook
├── lib/
│   └── helpers.js          # Solo Leveling math formulas & tier definitions
├── tailwind.config.js      # Custom colors, neumorphic shadows & glow tokens
└── package.json
```

---

## 🛡️ License

MIT License.
