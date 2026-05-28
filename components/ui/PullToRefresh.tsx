"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { Loader2, ArrowDown } from "lucide-react";

interface Props {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

const THRESHOLD = 70;
const MAX_PULL = 120;

export default function PullToRefresh({ onRefresh, children }: Props) {
  const [distance, setDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const startY = useRef(0);
  const pulling = useRef(false);
  const currentDist = useRef(0);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0 && !refreshingRef.current) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pulling.current) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0) {
        currentDist.current = Math.min(delta, MAX_PULL);
        setDistance(currentDist.current);
      }
    };

    const onTouchEnd = async () => {
      if (!pulling.current) return;
      pulling.current = false;
      const dist = currentDist.current;
      currentDist.current = 0;
      setDistance(0);

      if (dist >= THRESHOLD && !refreshingRef.current) {
        refreshingRef.current = true;
        setRefreshing(true);
        await onRefreshRef.current();
        refreshingRef.current = false;
        setRefreshing(false);
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const progress = Math.min(distance / THRESHOLD, 1);
  const showIndicator = distance > 0 || refreshing;

  return (
    <div className="relative">
      {showIndicator && (
        <div
          className="absolute left-0 right-0 flex items-end justify-center z-50 pointer-events-none"
          style={{
            top: 0,
            height: refreshing ? 56 : distance * 0.55,
            opacity: refreshing ? 1 : progress,
            transition: refreshing ? "none" : "opacity 0.1s",
          }}
        >
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg mb-1">
            {refreshing ? (
              <Loader2 size={18} className="text-black animate-spin" />
            ) : (
              <ArrowDown
                size={18}
                className="text-black"
                style={{ transform: `rotate(${progress * 180}deg)`, transition: "transform 0.1s" }}
              />
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
