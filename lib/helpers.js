/**
 * Solo Leveling Formula & Progression Helpers
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
 * Returns workout progression targets, rank metadata, and scaled exercises for a given level.
 *
 * Scaling Rules:
 * - Reps Base: 40 reps for Push-ups, Squats, Crunches (+10 reps every 4 levels: 40 -> 50 -> 60...)
 * - Running: Constant 2.0 km across all levels
 * - Base EXP: Starts at 10 EXP (+2 EXP every 4 levels: 10 -> 12 -> 14...)
 *
 * @param {number} level - Current player level
 * @returns {object} Workout progression info including rank metadata, base exp, and scaled exercises
 */
/**
 * Returns standardized Rank Tier Badge metadata according to Hunter Level:
 * S-Rank (50+), A-Rank (30-49), B-Rank (20-29), C-Rank (10-19), D-Rank (5-9), E-Rank (0-4)
 *
 * @param {number} level - Current hunter level
 * @returns {object} { label, letter, color, bgClass, borderClass, badgeClass }
 */
export function getTierBadge(level) {
  const currentLevel = Math.max(0, Math.floor(level || 0));

  if (currentLevel >= 50) {
    return {
      label: "S-Rank",
      letter: "S",
      title: "National Authority Monarch",
      color: "text-amber-600",
      accentColor: "#d97706",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-300 shadow-sm",
    };
  }
  if (currentLevel >= 30) {
    return {
      label: "A-Rank",
      letter: "A",
      title: "Shadow Monarch",
      color: "text-purple-600",
      accentColor: "#9333ea",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-300 shadow-sm",
    };
  }
  if (currentLevel >= 20) {
    return {
      label: "B-Rank",
      letter: "B",
      title: "Shadow Initiate",
      color: "text-blue-600",
      accentColor: "#2563eb",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-300 shadow-sm",
    };
  }
  if (currentLevel >= 10) {
    return {
      label: "C-Rank",
      letter: "C",
      title: "Elite Hunter",
      color: "text-emerald-600",
      accentColor: "#059669",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm",
    };
  }
  if (currentLevel >= 5) {
    return {
      label: "D-Rank",
      letter: "D",
      title: "Iron Hunter",
      color: "text-slate-700",
      accentColor: "#475569",
      badgeClass: "bg-slate-100 text-slate-700 border-slate-300 shadow-sm",
    };
  }
  return {
    label: "E-Rank",
    letter: "E",
    title: "Novice Awakened",
    color: "text-rose-600",
    accentColor: "#e11d48",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-300 shadow-sm",
  };
}

/**
 * Returns workout progression targets, rank metadata, and scaled exercises for a given level.
 *
 * Scaling Rules:
 * - Reps Base: 40 reps for Push-ups, Squats, Crunches (+10 reps every 4 levels: 40 -> 50 -> 60...)
 * - Running: Constant 2.0 km across all levels
 * - Base EXP: Starts at 10 EXP (+2 EXP every 4 levels: 10 -> 12 -> 14...)
 *
 * @param {number} level - Current player level
 * @returns {object} Workout progression info including rank metadata, base exp, and scaled exercises
 */
export function getWorkoutProgression(level) {
  const currentLevel = Math.max(0, Math.floor(level || 0));
  const step = Math.floor(currentLevel / 4);
  const reps = 40 + step * 10;
  const running = 2.0;
  const baseExp = 10 + step * 2;

  const exercises = [
    { key: "pushups", name: "Push-ups", target: reps, unit: "reps", category: "STR" },
    { key: "squats", name: "Squats", target: reps, unit: "reps", category: "VIT" },
    { key: "crunches", name: "Crunches", target: reps, unit: "reps", category: "AGI" },
    { key: "running", name: "Running", target: running, unit: "km", category: "CON" },
  ];

  const tierBadge = getTierBadge(currentLevel);

  return {
    rank: tierBadge.label,
    rankLetter: tierBadge.letter,
    title: tierBadge.title,
    color: tierBadge.color,
    accentColor: tierBadge.accentColor,
    badgeClass: tierBadge.badgeClass,
    reps,
    running,
    baseExp,
    expReward: baseExp,
    exercises,
  };
}

/**
 * Backward compatibility alias for getWorkoutProgression
 */
export function getTier(level) {
  return getWorkoutProgression(level);
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
