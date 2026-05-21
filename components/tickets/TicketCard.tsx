"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, CheckCircle, Clock3 } from "lucide-react";

export interface TicketProps {
  id: string;
  eventId: string;
  eventTitle: string;
  eventImage: string;
  eventDate: string;
  eventTime: string | "TBA";
  eventLocation: string;
  category: string;
  price: number | "Free";
  ticketNumber: string;
  status: "upcoming" | "past" | "cancelled";
  purchasedAt: string;
}

export default function TicketCard({ ticket }: { ticket: TicketProps }) {
  const router = useRouter();
  const isPast = ticket.status === "past";
  const isCancelled = ticket.status === "cancelled";

  return (
    <button
      onClick={() => router.push(`/my-tickets/${ticket.id}`)}
      className={`w-full flex overflow-hidden border transition-all duration-150 active:scale-[0.98] text-left ${
        isPast || isCancelled
          ? "bg-[#0e0e15] border-white/5 opacity-60"
          : "bg-[#111118] border-white/10"
      }`}
    >
      {/* LEFT — event image */}
      <div className="relative w-[100px] min-h-[120px] self-stretch overflow-hidden flex-shrink-0 bg-[#1a1a26]">
        {ticket.eventImage ? (
          <Image
            src={ticket.eventImage}
            alt={ticket.eventTitle}
            fill
            className={`object-cover ${isPast ? "grayscale" : ""}`}
            sizes="100px"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🎪</div>
        )}
        {/* Status overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#111118]/60" />

        {/* Category pill */}
        <div className="absolute top-2 left-0 right-0 flex justify-center">
          <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest ${
            isPast ? "bg-white/10 text-white/40" : "bg-primary text-white"
          }`}>
            {ticket.category}
          </span>
        </div>
      </div>

      {/* RIGHT — details */}
      <div className="flex-1 flex flex-col justify-between p-3 min-w-0">

        {/* Top row — title + status badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className={`font-display font-black text-[13px] uppercase leading-tight line-clamp-2 flex-1 ${
            isPast ? "text-gray-600" : "text-white"
          }`}>
            {ticket.eventTitle}
          </h3>
          {/* Status badge */}
          <span className={`flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest ${
            isCancelled
              ? "bg-red-500/20 text-red-400"
              : isPast
              ? "bg-white/5 text-gray-600"
              : "bg-primary/20 text-primary"
          }`}>
            {isCancelled ? (
              "Cancelled"
            ) : isPast ? (
              <><Clock3 size={8} />Used</>
            ) : (
              <><CheckCircle size={8} />Active</>
            )}
          </span>
        </div>

        {/* Info rows */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Calendar size={10} className="text-gray-600 flex-shrink-0" strokeWidth={2.5} />
            <span className="text-[10px] text-gray-500 truncate">{ticket.eventDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={10} className="text-gray-600 flex-shrink-0" strokeWidth={2.5} />
            <span className="text-[10px] text-gray-500">{ticket.eventTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={10} className="text-gray-600 flex-shrink-0" strokeWidth={2.5} />
            <span className="text-[10px] text-gray-500 truncate">{ticket.eventLocation}</span>
          </div>
        </div>

        {/* Bottom — ticket number + price */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
          <span className="text-[9px] text-gray-700 font-mono uppercase tracking-widest">
            #{ticket.ticketNumber}
          </span>
          <span className={`text-[11px] font-black ${isPast ? "text-gray-700" : "text-white"}`}>
            {ticket.price === "Free" || ticket.price === 0 ? "FREE" : `${ticket.price}k`}
          </span>
        </div>
      </div>
    </button>
  );
}