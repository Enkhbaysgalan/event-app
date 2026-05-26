"use client";

import Image from "next/image";
import { Users, MapPin } from "lucide-react";
import LikeButton from "@/components/ui/LikeButton";

export interface FavouriteEventCardProps {
  id: string;
  title: string;
  image: string;
  date: string;
  month: string;
  hostName: string;
  hostAvatar: string;
  attendees: number;
  price: number | "Free";
  category?: string;
  location?: string;
  onUnlike?: (id: string) => void;
}

export default function FavouriteEventCard({
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
  location,
  onUnlike,
}: FavouriteEventCardProps) {

  return (
    <div className="relative w-full flex bg-[#111118] border border-white/8 overflow-hidden active:scale-[0.99] transition-transform duration-150 cursor-pointer">

      {/* LEFT — Event image */}
      <div className="relative w-[130px] flex-shrink-0 bg-[#1e1e2e]">
        {image && (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="130px"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        {/* Date badge — bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center py-2 bg-[#111118]/80 backdrop-blur-sm">
          <span className="text-[9px] font-black text-primary uppercase tracking-widest leading-none">
            {month}
          </span>
          <span className="text-[22px] font-black text-white leading-tight">
            {date}
          </span>
        </div>
      </div>

      {/* RIGHT — Info */}
      <div className="flex-1 flex flex-col justify-between p-3 min-w-0">

        {/* Top row — category + like button */}
        <div className="flex items-start justify-between gap-2 mb-2">
          {category && (
            <span className="px-2 py-0.5 bg-primary/20 text-primary text-[9px] font-black uppercase tracking-wider flex-shrink-0">
              {category}
            </span>
          )}
          {/* Like button — top right square */}
          <LikeButton
            defaultLiked
            onToggle={(isLiked) => { if (!isLiked) onUnlike?.(id); }}
            className="ml-auto flex-shrink-0"
          />
        </div>

        {/* Title */}
        <h3 className="text-white font-display font-bold text-[15px] leading-snug line-clamp-2 mb-3 uppercase tracking-wide">
          {title}
        </h3>

        {/* Host row */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-primary flex-shrink-0">
            {hostAvatar ? (
              <Image src={hostAvatar} alt={hostName} fill className="object-cover" sizes="28px" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
            )}
          </div>
          <span className="text-[11px] text-gray-400 truncate">{hostName}</span>
        </div>

        {/* Location */}
        {location && (
          <div className="flex items-center gap-1 mb-3">
            <MapPin size={10} className="text-gray-600 flex-shrink-0" strokeWidth={2.5} />
            <span className="text-[10px] text-gray-600 truncate">{location}</span>
          </div>
        )}

        {/* Bottom row — attendees + price */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1 text-gray-600">
            <Users size={10} strokeWidth={2.5} />
            <span className="text-[10px] font-semibold">{attendees.toLocaleString()}</span>
          </div>
          <div className="px-2.5 py-1 bg-white text-black text-[11px] font-black tracking-wide">
            {price === "Free" ? "FREE" : `${price}k`}
          </div>
        </div>
      </div>
    </div>
  );
}