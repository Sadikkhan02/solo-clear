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

  let rankInfo = {
    rank: "E-Rank",
    rankLetter: "E",
    title: "Novice Awakened",
    color: "text-gray-400",
    accentColor: "#9ca3af",
    badgeClass: "bg-gray-800 text-gray-300 border-gray-700",
    minLevel: 0,
    maxLevel: 9,
  };

  if (currentLevel >= 30) {
    rankInfo = {
      rank: "B-Rank",
      rankLetter: "B",
      title: "Shadow Monarch",
      color: "text-purple-400",
      accentColor: "#a855f7",
      badgeClass: "bg-purple-950/80 text-purple-300 border-purple-800/50",
      minLevel: 30,
      maxLevel: 99,
    };
  } else if (currentLevel >= 20) {
    rankInfo = {
      rank: "C-Rank",
      rankLetter: "C",
      title: "Shadow Initiate",
      color: "text-accent-cyan",
      accentColor: "#4facfe",
      badgeClass: "bg-cyan-950/80 text-cyan-300 border-cyan-800/50",
      minLevel: 20,
      maxLevel: 29,
    };
  } else if (currentLevel >= 10) {
    rankInfo = {
      rank: "D-Rank",
      rankLetter: "D",
      title: "Iron Hunter",
      color: "text-emerald-400",
      accentColor: "#34d399",
      badgeClass: "bg-emerald-950/80 text-emerald-300 border-emerald-800/50",
      minLevel: 10,
      maxLevel: 19,
    };
  }

  return {
    ...rankInfo,
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
