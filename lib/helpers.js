/**
 * Solo Leveling Formula & Tier Helpers
 */

/**
 * Calculates the required EXP to level up from a given level.
 * Formula: Math.ceil(10 * Math.pow(1.2, level))
 *
 * @param {number} level - Current player level
 * @returns {number} Required EXP for next level
 */
export function getRequiredExp(level) {
  const currentLevel = Math.max(0, Math.floor(level || 0));
  return Math.ceil(10 * Math.pow(1.2, currentLevel));
}

/**
 * Returns tier rank metadata and dynamically scaled exercises for a given level.
 *
 * Scaling Rules:
 * - Starting Base: 20 reps for Push-ups, Squats, Crunches; 1.0 km for Running.
 * - Every 5 levels (Level 5, 10, 15, ...):
 *   - Reps increase by +10 reps (e.g. 20 -> 30 -> 40 -> 50...)
 *   - Running distance increases by +200m / +0.2 km (e.g. 1.0 km -> 1.2 km -> 1.4 km...)
 *
 * @param {number} level - Current player level
 * @returns {object} Tier info including rank name, badge, base exp, and dynamically scaled exercise array
 */
export function getTier(level) {
  const currentLevel = Math.max(0, Math.floor(level || 0));

  // Calculate dynamic scaling based on every 5 levels
  const levelStep = Math.floor(currentLevel / 5);
  const targetReps = 20 + levelStep * 10;
  const targetRunningKm = Math.round((1.0 + levelStep * 0.2) * 10) / 10;

  const exercises = [
    { key: "pushups", name: "Push-ups", target: targetReps, unit: "reps", category: "STR" },
    { key: "squats", name: "Squats", target: targetReps, unit: "reps", category: "VIT" },
    { key: "crunches", name: "Crunches", target: targetReps, unit: "reps", category: "AGI" },
    { key: "running", name: "Running", target: targetRunningKm, unit: "km", category: "VIT" },
  ];

  if (currentLevel < 10) {
    return {
      rank: "E-Rank",
      rankLetter: "E",
      title: "Novice Awakened",
      color: "text-gray-400",
      accentColor: "#9ca3af",
      badgeClass: "bg-gray-800 text-gray-300 border-gray-700",
      expReward: 10,
      minLevel: 0,
      maxLevel: 9,
      exercises,
    };
  }

  if (currentLevel < 20) {
    return {
      rank: "D-Rank",
      rankLetter: "D",
      title: "Iron Hunter",
      color: "text-emerald-400",
      accentColor: "#34d399",
      badgeClass: "bg-emerald-950/80 text-emerald-300 border-emerald-800/50",
      expReward: 15,
      minLevel: 10,
      maxLevel: 19,
      exercises,
    };
  }

  if (currentLevel < 30) {
    return {
      rank: "C-Rank",
      rankLetter: "C",
      title: "Shadow Initiate",
      color: "text-accent-cyan",
      accentColor: "#4facfe",
      badgeClass: "bg-cyan-950/80 text-cyan-300 border-cyan-800/50",
      expReward: 22,
      minLevel: 20,
      maxLevel: 29,
      exercises,
    };
  }

  // Fallback for Level 30+ (B-Rank / Monarch class)
  return {
    rank: "B-Rank",
    rankLetter: "B",
    title: "Shadow Monarch",
    color: "text-purple-400",
    accentColor: "#a855f7",
    badgeClass: "bg-purple-950/80 text-purple-300 border-purple-800/50",
    expReward: 30,
    minLevel: 30,
    maxLevel: 99,
    exercises,
  };
}

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 *
 * @param {Date} [d=new Date()]
 * @returns {string} Date string (YYYY-MM-DD)
 */
export function getTodayDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculates whole calendar days between two YYYY-MM-DD date strings.
 *
 * @param {string} fromDateStr - Past date (YYYY-MM-DD)
 * @param {string} toDateStr - Target date (YYYY-MM-DD)
 * @returns {number} Days elapsed
 */
export function getDaysDifference(fromDateStr, toDateStr) {
  if (!fromDateStr || !toDateStr) return 0;
  const [y1, m1, d1] = fromDateStr.split("-").map(Number);
  const [y2, m2, d2] = toDateStr.split("-").map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((utc2 - utc1) / msPerDay);
}
