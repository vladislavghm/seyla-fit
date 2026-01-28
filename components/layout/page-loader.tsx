"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

const PROGRESS_DURATION_MS = 1000;
const MIN_VISIBLE_MS = 350;
const HIDE_AFTER_COMPLETE_MS = 180;
const TICK_MS = 50;

export function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const runProgressThenHide = useCallback(() => {
    clearTimers();
    setProgress(0);

    let p = 0;
    progressIntervalRef.current = setInterval(() => {
      p += (92 - p) * 0.18;
      if (p >= 90) p = 92;
      setProgress(p);
    }, TICK_MS);

    const wait = Math.max(PROGRESS_DURATION_MS, MIN_VISIBLE_MS);

    hideTimeoutRef.current = setTimeout(() => {
      clearTimers();
      setProgress(100);
      hideTimeoutRef.current = setTimeout(() => {
        setVisible(false);
        hideTimeoutRef.current = null;
      }, HIDE_AFTER_COMPLETE_MS);
    }, wait);
  }, [clearTimers]);

  useEffect(() => {
    const isInitialLoad = prevPathnameRef.current === null;
    prevPathnameRef.current = pathname;

    if (isInitialLoad) {
      runProgressThenHide();
      return () => clearTimers();
    }

    setVisible(true);
    runProgressThenHide();
    return () => clearTimers();
  }, [pathname, runProgressThenHide, clearTimers]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex flex-col bg-white"
      aria-hidden="true"
      role="presentation"
    >
      <div
        className="h-1 shrink-0 bg-primary transition-[width] duration-75 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
