"use client";

import { useState } from "react";
import Image from "next/image";
import { Users } from "lucide-react";

export interface EventCardProps {
  id: string;
  title: string;
  image: string;
  date: string; // e.g. "24"
  month: string; // e.g. "JUN"
  hostName: string;
  hostAvatar: string;
  attendees: number;
  price: number | "Free";
  category?: string;
}

export default function EventCard({
  title,
  image,
  date,
  month,
  hostName,
  hostAvatar,
  attendees,
  price,
  category,
}: EventCardProps) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="relative w-[260px] flex-shrink-0 bg-[#111118] border border-white/8 overflow-hidden group cursor-pointer active:scale-[0.98] transition-transform duration-150">
      {/* Event image */}
      <div className="relative w-full h-[160px] overflow-hidden bg-[#1e1e2e] flex items-center justify-center">
        {/* Placeholder shown behind image */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
          <div className="w-10 h-10 border border-white/10 flex items-center justify-center">
            <span className="text-2xl">🎪</span>
          </div>
          <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
            No Image
          </span>
        </div>
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="260px"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />
        {/* dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111118]/80 via-transparent to-transparent" />

        {/* TOP LEFT — Date badge (square) */}
        <div className="absolute top-3 left-3 w-12 h-12 bg-[#111118] flex flex-col items-center justify-center border border-white/10">
          <span className="text-[11px] font-black text-violet-400 leading-none tracking-widest uppercase">
            {month}
          </span>
          <span className="text-[20px] font-black text-white leading-tight">
            {date}
          </span>
        </div>

        {/* TOP RIGHT — Like button (square) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className={`absolute top-3 right-3 w-10 h-10 flex items-center justify-center border transition-all duration-200 active:scale-90 ${
            liked
              ? "bg-red-500 border-red-500"
              : "bg-[#111118]/80 border-white/10 hover:border-white/30"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={liked ? "white" : "none"}
            stroke="white"
            strokeWidth="2.5"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Category tag */}
        {category && (
          <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-violet-600 text-[10px] font-bold text-white uppercase tracking-wider">
            {category}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-3">
        {/* Title */}
        <h3 className="text-white font-bold text-[14px] leading-snug line-clamp-2 mb-3 font-mono">
          {title}
        </h3>

        {/* Host + Attendees row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Host avatar — circle (only non-square element) */}
            <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-violet-500 flex-shrink-0">
              <Image
                src={hostAvatar}
                alt={hostName}
                fill
                className="object-cover"
                sizes="28px"
              />
            </div>
            <span className="text-[11px] text-gray-400 font-medium truncate max-w-[80px]">
              {hostName}
            </span>
          </div>

          {/* Attendees */}
          <div className="flex items-center gap-1 text-gray-500">
            <Users size={11} strokeWidth={2.5} />
            <span className="text-[11px] font-semibold">
              {attendees.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-3 h-px bg-white/5" />

        {/* Price — bottom right square badge */}
        <div className="flex justify-end">
          <div className="px-3 py-1.5 bg-violet-600 text-white text-[12px] font-black tracking-wide">
            {price === "Free" ? "FREE" : `$${price}`}
          </div>
        </div>
      </div>
    </div>
  );
}
