"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { getRequiredExp, getTier } from "@/lib/helpers";

export const DEFAULT_HUNTER_DATA = {
  level: 0,
  exp: 0,
  statPoints: 0,
  stats: {
    str: 0,
    vit: 0,
    agi: 0,
    con: 0,
  },
  streak: 0,
  lastWorkoutDate: null,
  huntClaimedToday: false,
  dailyProgress: {
    pushups: false,
    squats: false,
    crunches: false,
    running: false,
  },
};

/**
 * Cloud-synchronized Hunter Data Hook interfacing with MongoDB via Next.js API Routes
 */
export function useHunterData() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [data, setData] = useState(DEFAULT_HUNTER_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [penaltyInfo, setPenaltyInfo] = useState(null);

  // --- FETCH LIVE HUNTER DATA FROM CLOUD ---
  const refreshHunter = useCallback(async () => {
    if (!isAuthenticated) {
      setData(DEFAULT_HUNTER_DATA);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/user");
      if (!res.ok) {
        if (res.status === 401) {
          setData(DEFAULT_HUNTER_DATA);
          return;
        }
        throw new Error(`Failed to fetch hunter data (${res.status})`);
      }

      const payload = await res.json();
      if (payload?.user) {
        setData(payload.user);
      }
    } catch (err) {
      console.error("Error fetching hunter data:", err);
      setError(err.message || "Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // --- AUTO-FETCH ON AUTHENTICATION STATE CHANGE ---
  useEffect(() => {
    if (authLoading) return;
    refreshHunter();
  }, [authLoading, refreshHunter]);

  // --- UPDATE HUNTER PROGRESS (For attributes & bulk sync) ---
  const updateHunterProgress = useCallback(
    async (updates) => {
      if (!data) return;

      try {
        const res = await fetch("/api/user/progress", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Update failed");
        }

        const payload = await res.json();
        if (payload?.user) {
          setData(payload.user);
          return payload.user;
        }
      } catch (err) {
        console.error("Error updating hunter progress:", err);
        setError(err.message);
        throw err;
      }
    },
    [data]
  );

  // --- COMPLETE HUNT (Authoritative server-side calculation) ---
  const completeHunt = useCallback(async () => {
    if (!data) return;

    try {
      const res = await fetch("/api/user/hunt/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Hunt completion failed");
      }

      const payload = await res.json();
      if (payload?.hunter) {
        setData(payload.hunter);
      }
      return payload;
    } catch (err) {
      console.error("Error completing hunt:", err);
      setError(err.message);
      throw err;
    }
  }, [data]);

  // --- TOGGLE DAILY QUEST (Optimistic UI with rollback) ---
  const toggleQuest = useCallback(
    async (exerciseKey) => {
      if (!data) return;

      const previousProgress = { ...(data.dailyProgress || {}) };
      const newProgress = {
        ...previousProgress,
        [exerciseKey]: !previousProgress[exerciseKey],
      };

      // Optimistic update
      setData((prev) => ({ ...prev, dailyProgress: newProgress }));

      try {
        const updated = await updateHunterProgress({ dailyProgress: newProgress });
        return updated;
      } catch (err) {
        // Rollback on failure
        setData((prev) => ({ ...prev, dailyProgress: previousProgress }));
        throw err;
      }
    },
    [data, updateHunterProgress]
  );

  // --- ALLOCATE STAT POINT (Optimistic UI with rollback) ---
  const allocateStat = useCallback(
    async (statKey) => {
      if (!data || (data.statPoints || 0) <= 0) return;

      const prevStats = { ...(data.stats || {}) };
      const prevPoints = data.statPoints || 0;

      const newStats = { ...prevStats, [statKey]: (prevStats[statKey] || 0) + 1 };
      const newStatPoints = prevPoints - 1;

      // Optimistic update
      setData((prev) => ({
        ...prev,
        stats: newStats,
        statPoints: newStatPoints,
      }));

      try {
        const updated = await updateHunterProgress({
          stats: newStats,
          statPoints: newStatPoints,
        });
        return updated;
      } catch (err) {
        // Rollback on failure
        setData((prev) => ({
          ...prev,
          stats: prevStats,
          statPoints: prevPoints,
        }));
        throw err;
      }
    },
    [data, updateHunterProgress]
  );

  // --- DECREASE STAT POINT (Refund - Optimistic UI with rollback) ---
  const decreaseStat = useCallback(
    async (statKey) => {
      if (!data || (data.stats?.[statKey] || 0) <= 0) return;

      const prevStats = { ...(data.stats || {}) };
      const prevPoints = data.statPoints || 0;

      const newStats = { ...prevStats, [statKey]: prevStats[statKey] - 1 };
      const newStatPoints = prevPoints + 1;

      // Optimistic update
      setData((prev) => ({
        ...prev,
        stats: newStats,
        statPoints: newStatPoints,
      }));

      try {
        const updated = await updateHunterProgress({
          stats: newStats,
          statPoints: newStatPoints,
        });
        return updated;
      } catch (err) {
        // Rollback on failure
        setData((prev) => ({
          ...prev,
          stats: prevStats,
          statPoints: prevPoints,
        }));
        throw err;
      }
    },
    [data, updateHunterProgress]
  );

  // --- COMPUTED DERIVED VALUES ---
  const tier = useMemo(() => getTier(data?.level || 0), [data?.level]);
  const requiredExp = useMemo(() => getRequiredExp(data?.level || 0), [data?.level]);
  const isLoaded = !authLoading && !isLoading;

  // --- RETRY ON ERROR ---
  const retry = useCallback(() => {
    if (error) refreshHunter();
  }, [error, refreshHunter]);

  return {
    data: data || DEFAULT_HUNTER_DATA,
    tier,
    requiredExp,
    isLoading: authLoading || isLoading,
    isLoaded,
    error,
    penaltyInfo,
    refreshHunter,
    retry,
    updateData: updateHunterProgress,
    updateHunterProgress,
    completeHunt,
    toggleQuest,
    allocateStat,
    decreaseStat,
  };
}
