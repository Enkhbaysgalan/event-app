"use client";

import { useState } from "react";
import Image from "next/image";
import { Users } from "lucide-react";
import LikeIcon from "../icons/recHeart";
import Link from "next/link";
import { User } from "lucide-react";

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
  id,
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
    <Link href={`/events/${id}`}>
      <div className="relative w-[260px] flex-shrink-0 bg-[#111118] border border-gray-600 overflow-hidden group cursor-pointer active:scale-[0.98] transition-transform duration-150">
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
            <span className="text-[11px] font-black text-primary leading-none tracking-widest uppercase">
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
            className={`absolute top-3 right-3 w-10 h-10 flex items-center justify-center border transition-all duration-200 active:scale-90 rounded-lg ${
              liked
                ? "bg-red-500 border-red-500 text-white"
                : "bg-[#111118]/80 border-white/10 hover:border-white/30 text-white"
            }`}
          >
            <LikeIcon filled={liked} />
          </button>

          {/* Category tag */}
        </div>

        {/* Card body */}
        <div className="p-3">
          {/* Title */}
          <h3 className="text-white font-bold text-[14px] leading-snug line-clamp-2 mb-3 font-sans">
            {title}
          </h3>

          {/* Host + Attendees row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Host avatar — circle (only non-square element) */}
              <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-primary flex-shrink-0">
                {hostAvatar ? (
                  <Image
                    src={hostAvatar}
                    alt={hostName}
                    fill
                    className="object-cover"
                    sizes="28px"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={14} className="text-gray-500" strokeWidth={2} />
                  </div>
                )}
              </div>
              <span className="text-[11px] text-gray-400 font-medium truncate max-w-[100px]">
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
          {/* Price + Category row */}
          <div className="flex items-center justify-between">
            <div className="px-3 py-1.5 bg-white/10 text-white text-[12px] font-display font-bold uppercase tracking-wide">
              {category ?? "Event"}
            </div>
            <div className="px-3 py-1.5 bg-white text-black text-[12px] font-display font-bold tracking-wide">
              {price === "Free" ? "FREE" : `${price}k`}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
