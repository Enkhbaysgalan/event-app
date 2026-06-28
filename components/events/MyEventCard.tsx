"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Users, Tag } from "lucide-react";

export interface MyEventProps {
  id: string;
  title: string;
  image: string;
  category: string;
  date: string;
  day: string;
  month: string;
  time: string;
  location: string;
  price: number | "Free";
  capacity: number;
  attendees: number;
  createdAt: Date | null;
}

export default function MyEventCard({ event }: { event: MyEventProps }) {
  const router = useRouter();
  const isFree = event.price === "Free" || event.price === 0;

  return (
    <button
      onClick={() => router.push(`/events/${event.id}`)}
      className="w-full flex overflow-hidden border border-white/10 bg-[#111118] transition-all duration-150 active:scale-[0.98] text-left"
    >
      {/* Image */}
      <div className="relative w-[100px] min-h-[120px] self-stretch flex-shrink-0 bg-[#1a1a26] overflow-hidden">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
            sizes="100px"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🎪</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#111118]/60" />
        <div className="absolute top-2 left-0 right-0 flex justify-center">
          <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest bg-primary text-white">
            {event.category}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between p-3 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display font-black text-[13px] uppercase leading-tight line-clamp-2 flex-1 text-white">
            {event.title}
          </h3>
          <span className="flex-shrink-0 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest bg-white/5 text-gray-400">
            {isFree ? "FREE" : `${event.price}k`}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Calendar size={10} className="text-gray-600 flex-shrink-0" strokeWidth={2.5} />
            <span className="text-[10px] text-gray-500 truncate">{event.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={10} className="text-gray-600 flex-shrink-0" strokeWidth={2.5} />
            <span className="text-[10px] text-gray-500 truncate">{event.location || "TBA"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Tag size={10} className="text-gray-600 flex-shrink-0" strokeWidth={2.5} />
            <span className="text-[10px] text-gray-500 truncate">{event.category}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
          <div className="flex items-center gap-1 text-gray-600">
            <Users size={10} strokeWidth={2.5} />
            <span className="text-[10px] font-black">
              {event.attendees} / {event.capacity}
            </span>
          </div>
          <span className="text-[9px] text-gray-700 font-black uppercase tracking-widest">
            {event.month} {event.day}
          </span>
        </div>
      </div>
    </button>
  );
}
