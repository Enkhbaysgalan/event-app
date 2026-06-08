"use client";

import { useState } from "react";
import LikeIcon from "@/components/icons/recHeart";
import { playPop } from "@/lib/sounds";

interface LikeButtonProps {
  liked?: boolean;           // controlled — if provided, overrides internal state
  defaultLiked?: boolean;    // uncontrolled initial value
  onToggle?: (liked: boolean) => void;
  className?: string;
}

export default function LikeButton({
  liked: likedProp,
  defaultLiked = false,
  onToggle,
  className = "",
}: LikeButtonProps) {
  const [internalLiked, setInternalLiked] = useState(defaultLiked);
  const isControlled = likedProp !== undefined;
  const liked = isControlled ? likedProp : internalLiked;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    playPop();
    const next = !liked;
    if (!isControlled) setInternalLiked(next);
    onToggle?.(next);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-10 h-10 flex items-center justify-center border transition-all duration-200 active:scale-90 ${
        liked
          ? "bg-red-500 border-red-500 text-white"
          : "bg-[#111118]/80 border-white/10 hover:border-white/30 text-white"
      } ${className}`}
    >
      <LikeIcon filled={liked} size={18} strokeWidth={2} />
    </button>
  );
}
