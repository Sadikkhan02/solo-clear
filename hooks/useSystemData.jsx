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
};

/**
 * Mobile Storage & Penalty Hook for Solo Leveling System
 */
export function useSystemData() {
  const [data, setData] = useState(DEFAULT_SYSTEM_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [penaltyInfo, setPenaltyInfo] = useState(null);

  /**
   * Evaluates mobile inactivity penalty and daily quest reset.
   * - If inactivity >= 2 days: floor EXP by 50% (never below 0), reset streak to 0.
   * - If new day (>= 1 day): reset daily progress quests.
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

      // Inactivity penalty triggered after 2 or more missed days
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

      // Reset daily quests on any new calendar day (>= 1 day)
      if (daysElapsed >= 1) {
        updated.dailyProgress = {
          pushups: false,
          squats: false,
          crunches: false,
          running: false,
        };
      }
    }

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
          stats: { ...DEFAULT_SYSTEM_DATA.stats, ...(item.stats || {}) },
          dailyProgress: {
            ...DEFAULT_SYSTEM_DATA.dailyProgress,
            ...(item.dailyProgress || {}),
          },
        };
      }

      // Run mobile penalty check & daily reset
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
   * Action: Complete or toggle a daily quest exercise
   */
  const completeExercise = useCallback(
    (exerciseKey) => {
      updateData((prev) => {
        const currentTier = getTier(prev.level);
        const wasCompleted = !!prev.dailyProgress[exerciseKey];
        const nextStatus = !wasCompleted;

        const nextDailyProgress = {
          ...prev.dailyProgress,
          [exerciseKey]: nextStatus,
        };

        // EXP delta
        const expDelta = nextStatus
          ? currentTier.expReward
          : -currentTier.expReward;

        let newExp = Math.max(0, (prev.exp || 0) + expDelta);
        let newLevel = prev.level || 0;

        // Level up loop
        while (newExp >= getRequiredExp(newLevel)) {
          newExp -= getRequiredExp(newLevel);
          newLevel += 1;
        }

        // Check if all daily exercises are now complete
        const allCompleted = Object.values(nextDailyProgress).every(Boolean);
        const previouslyAllCompleted = Object.values(prev.dailyProgress).every(
          Boolean
        );

        let newStreak = prev.streak || 0;
        if (allCompleted && !previouslyAllCompleted) {
          newStreak += 1;
        } else if (!allCompleted && previouslyAllCompleted) {
          newStreak = Math.max(0, newStreak - 1);
        }

        const today = getTodayDateString();

        return {
          ...prev,
          level: newLevel,
          exp: newExp,
          dailyProgress: nextDailyProgress,
          streak: newStreak,
          lastWorkoutDate: allCompleted ? today : prev.lastWorkoutDate,
          lastActiveDate: today,
        };
      });
    },
    [updateData]
  );

  /**
   * Action: Allocate a stat point (STR, VIT, AGI)
   */
  const allocateStat = useCallback(
    (statKey) => {
      if (!["str", "vit", "agi"].includes(statKey)) return;
      updateData((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          [statKey]: (prev.stats[statKey] || 0) + 1,
        },
      }));
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
   * Testing Utility: Simulate days jumping forward to test penalty logic
   */
  const simulateDateJump = useCallback(
    (daysToAdd = 2) => {
      updateData((prev) => {
        // Set lastWorkoutDate / lastActiveDate into the past
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
    completeExercise,
    allocateStat,
    resetData,
    simulateDateJump,
    checkMobilePenalty,
  };
}
