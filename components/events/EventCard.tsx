"use client";

import Image from "next/image";
import { Users, User } from "lucide-react";
import { useRouter } from "next/navigation";
import LikeButton from "@/components/ui/LikeButton";
import { useLikes } from "@/lib/likes-context";

export interface EventCardProps {
  id: string;
  title: string;
  image: string;
  blurDataUrl: string;
  date: string;
  month: string;
  hostName: string;
  hostAvatar: string;
  attendees: number;
  price: number | "Free";
  category?: string;
  location?: string;
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
  location,
  blurDataUrl,
}: EventCardProps) {
  const router = useRouter();
  const { isLiked, toggleLike } = useLikes();

  return (
    <div
      onClick={() => router.push(`/events/${id}`)}
      className="relative w-[260px] flex-shrink-0 bg-[#111118] border border-gray-600 overflow-hidden group cursor-pointer active:scale-[0.98] transition-transform duration-150"
    >
      {/* Event image */}
      <div className="relative w-full h-[160px] overflow-hidden bg-[#1e1e2e] flex items-center justify-center">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
          <div className="w-10 h-10 border border-white/10 flex items-center justify-center">
            <span className="text-2xl">🎪</span>
          </div>
          <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
            No Image
          </span>
        </div>
        {image && (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="260px"
            placeholder={blurDataUrl ? "blur" : "empty"} // ← add
            blurDataURL={blurDataUrl ?? undefined}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111118]/80 via-transparent to-transparent" />

        {/* TOP LEFT — Date badge */}
        <div className="absolute top-3 left-3 w-12 h-12 bg-[#111118] flex flex-col items-center justify-center border border-white/10">
          <span className="text-[11px] font-black text-primary leading-none tracking-widest uppercase">
            {month}
          </span>
          <span className="text-[20px] font-black text-white leading-tight">
            {date}
          </span>
        </div>

        {/* TOP RIGHT — Like button */}
        <LikeButton
          liked={isLiked(id)}
          onToggle={() =>
            toggleLike({
              eventId: id,
              title,
              image,
              date,
              month,
              hostName,
              hostAvatar,
              attendees,
              price,
              category: category ?? "Event",
              location: location ?? "",
            })
          }
          className="absolute top-3 right-3"
        />
      </div>

      {/* Card body */}
      <div className="p-3">
        <h3 className="text-white font-bold text-[14px] leading-snug line-clamp-2 mb-3 font-sans">
          {title}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
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

          <div className="flex items-center gap-1 text-gray-500">
            <Users size={11} strokeWidth={2.5} />
            <span className="text-[11px] font-semibold">
              {attendees.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="my-3 h-px bg-white/5" />
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
  );
}
