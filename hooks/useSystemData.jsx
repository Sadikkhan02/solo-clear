"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getRequiredExp,
  getTier,
  getTodayDateString,
  getDaysDifference,
} from "@/lib/helpers";

const STORAGE_KEY = "solo_system_data";

export const DEFAULT_SYSTEM_DATA = {
  level: 0,
  exp: 0,
  statPoints: 0,
  stats: {
    str: 0,
    vit: 0,
    agi: 0,
  },
  dailyProgress: {
    pushups: false,
    squats: false,
    crunches: false,
    running: false,
  },
  streak: 0,
  lastWorkoutDate: null,
  lastActiveDate: null,
  huntClaimedToday: false, // Prevents same-day hunt spam exploit
};

/**
 * Mobile Storage & Penalty Hook for Solo Leveling System
 */
export function useSystemData() {
  const [data, setData] = useState(DEFAULT_SYSTEM_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [penaltyInfo, setPenaltyInfo] = useState(null);

  /**
   * Evaluates mobile inactivity penalty and daily quest auto-reset.
   * On every mount / initialization:
   * 1. Check lastWorkoutDate. If it's a new calendar day (today > lastWorkoutDate, i.e. daysElapsed >= 1),
   *    force reset dailyProgress to all false and reset huntClaimedToday so quests are fresh.
   * 2. If day difference >= 2, apply penalty (floor EXP by 50%, streak = 0, exp never < 0).
   * 3. If day difference === 1, dailyProgress is reset for today's workout and streak continuity is maintained.
   *
   * @param {typeof DEFAULT_SYSTEM_DATA} currentData
   * @returns {{ updatedData: typeof DEFAULT_SYSTEM_DATA, penalty: object | null }}
   */
  const checkMobilePenalty = useCallback((currentData) => {
    const today = getTodayDateString();
    const referenceDate = currentData.lastWorkoutDate || currentData.lastActiveDate;

    let updated = { ...currentData };
    let penalty = null;

    if (referenceDate) {
      const daysElapsed = getDaysDifference(referenceDate, today);

      // Rule 1: Auto-reset dailyProgress and unlock hunt on any new calendar day (daysElapsed >= 1)
      if (daysElapsed >= 1) {
        updated.dailyProgress = {
          pushups: false,
          squats: false,
          crunches: false,
          running: false,
        };
        updated.huntClaimedToday = false; // Reset the claim lock for today's fresh hunt

        // Rule 2: Inactivity penalty triggered after 2 or more missed days
        if (daysElapsed >= 2) {
          const originalExp = updated.exp || 0;
          const reducedExp = Math.max(0, Math.floor(originalExp * 0.5));
          const lostExp = originalExp - reducedExp;

          updated.exp = reducedExp;
          updated.streak = 0;

          penalty = {
            applied: true,
            daysMissed: daysElapsed,
            lostExp,
            previousExp: originalExp,
            newExp: reducedExp,
            date: today,
          };
        }
        // Rule 3: If difference is exactly 1, streak is maintained / prepared for next increment
      }
    }

    // Ensure exp is never negative
    updated.exp = Math.max(0, updated.exp || 0);
    updated.lastActiveDate = today;

    return { updatedData: updated, penalty };
  }, []);

  // Hydrate from localStorage on initial mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let parsed = DEFAULT_SYSTEM_DATA;

      if (raw) {
        const item = JSON.parse(raw);
        parsed = {
          ...DEFAULT_SYSTEM_DATA,
          ...item,
          statPoints: item.statPoints !== undefined ? item.statPoints : DEFAULT_SYSTEM_DATA.statPoints,
          huntClaimedToday: item.huntClaimedToday !== undefined ? item.huntClaimedToday : DEFAULT_SYSTEM_DATA.huntClaimedToday,
          stats: { ...DEFAULT_SYSTEM_DATA.stats, ...(item.stats || {}) },
          dailyProgress: {
            ...DEFAULT_SYSTEM_DATA.dailyProgress,
            ...(item.dailyProgress || {}),
          },
        };
      }

      // Run mobile penalty check & daily auto-reset
      const { updatedData, penalty } = checkMobilePenalty(parsed);

      setData(updatedData);
      if (penalty) {
        setPenaltyInfo(penalty);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch (err) {
      console.error("Error loading system data from localStorage:", err);
      setData(DEFAULT_SYSTEM_DATA);
    } finally {
      setIsLoaded(true);
    }
  }, [checkMobilePenalty]);

  /**
   * Generic updater that persists immediately to localStorage
   */
  const updateData = useCallback((updater) => {
    setData((prev) => {
      const next =
        typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error("Error persisting system data to localStorage:", err);
      }
      return next;
    });
  }, []);

  // Derived tier & required exp
  const tier = useMemo(() => getTier(data.level), [data.level]);
  const requiredExp = useMemo(() => getRequiredExp(data.level), [data.level]);

  /**
   * Action: Allocate a stat point (STR, VIT, AGI)
   */
  const allocateStat = useCallback(
    (statKey) => {
      if (!["str", "vit", "agi"].includes(statKey)) return;
      updateData((prev) => {
        const currentPoints = prev.statPoints || 0;
        if (currentPoints <= 0) return prev;

        return {
          ...prev,
          statPoints: currentPoints - 1,
          stats: {
            ...prev.stats,
            [statKey]: (prev.stats[statKey] || 0) + 1,
          },
        };
      });
    },
    [updateData]
  );

  /**
   * Action: Decrease a stat point (STR, VIT, AGI)
   */
  const decreaseStat = useCallback(
    (statKey) => {
      if (!["str", "vit", "agi"].includes(statKey)) return;
      updateData((prev) => {
        const currentVal = prev.stats?.[statKey] || 0;
        if (currentVal <= 0) return prev;

        return {
          ...prev,
          statPoints: (prev.statPoints || 0) + 1,
          stats: {
            ...prev.stats,
            [statKey]: currentVal - 1,
          },
        };
      });
    },
    [updateData]
  );

  /**
   * Action: Hard reset system data to defaults
   */
  const resetData = useCallback(() => {
    setData(DEFAULT_SYSTEM_DATA);
    setPenaltyInfo(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SYSTEM_DATA));
    } catch (err) {
      console.error("Error resetting system data:", err);
    }
  }, []);

  /**
   * Testing Utility: Simulate days jumping forward
   */
  const simulateDateJump = useCallback(
    (daysToAdd = 2) => {
      updateData((prev) => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - daysToAdd);
        const pastDateStr = getTodayDateString(pastDate);

        const simulatedState = {
          ...prev,
          lastWorkoutDate: pastDateStr,
          lastActiveDate: pastDateStr,
        };

        const { updatedData, penalty } = checkMobilePenalty(simulatedState);
        if (penalty) {
          setPenaltyInfo(penalty);
        } else {
          setPenaltyInfo(null);
        }
        return updatedData;
      });
    },
    [updateData, checkMobilePenalty]
  );

  return {
    data,
    updateData,
    tier,
    requiredExp,
    penaltyInfo,
    isLoaded,
    allocateStat,
    decreaseStat,
    resetData,
    simulateDateJump,
    checkMobilePenalty,
  };
}
