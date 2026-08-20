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
 * Returns tier rank metadata and corresponding exercises for a given level.
 * - E-Rank: Level < 10 (10 EXP per exercise)
 * - D-Rank: Level 10-19 (15 EXP per exercise)
 * - C-Rank: Level 20-29 (22 EXP per exercise)
 * - B-Rank+: Level >= 30 (30 EXP per exercise)
 *
 * @param {number} level - Current player level
 * @returns {object} Tier info including rank name, badge, base exp, and exercise array
 */
export function getTier(level) {
  const currentLevel = Math.max(0, Math.floor(level || 0));

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
      exercises: [
        { key: "pushups", name: "Push-ups", target: 10, unit: "reps", category: "STR" },
        { key: "squats", name: "Squats", target: 10, unit: "reps", category: "VIT" },
        { key: "crunches", name: "Crunches", target: 10, unit: "reps", category: "AGI" },
        { key: "running", name: "Running", target: 1, unit: "km", category: "VIT" },
      ],
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
      exercises: [
        { key: "pushups", name: "Push-ups", target: 25, unit: "reps", category: "STR" },
        { key: "squats", name: "Squats", target: 25, unit: "reps", category: "VIT" },
        { key: "crunches", name: "Crunches", target: 25, unit: "reps", category: "AGI" },
        { key: "running", name: "Running", target: 2, unit: "km", category: "VIT" },
      ],
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
      exercises: [
        { key: "pushups", name: "Push-ups", target: 50, unit: "reps", category: "STR" },
        { key: "squats", name: "Squats", target: 50, unit: "reps", category: "VIT" },
        { key: "crunches", name: "Crunches", target: 50, unit: "reps", category: "AGI" },
        { key: "running", name: "Running", target: 5, unit: "km", category: "VIT" },
      ],
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
    exercises: [
      { key: "pushups", name: "Push-ups", target: 100, unit: "reps", category: "STR" },
      { key: "squats", name: "Squats", target: 100, unit: "reps", category: "VIT" },
      { key: "crunches", name: "Crunches", target: 100, unit: "reps", category: "AGI" },
      { key: "running", name: "Running", target: 10, unit: "km", category: "VIT" },
    ],
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
