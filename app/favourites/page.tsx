"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLikes } from "@/lib/likes-context";
import { LikedEventData } from "@/lib/likes-context";
import FavouriteEventCard from "@/components/events/FavouriteEventCard";
import Image from "next/image";
import { Loader2 } from "lucide-react";

// ── Mock liked organizers ───────────────────────────────────
const MOCK_LIKED_ORGANIZERS = [
  {
    id: "o1",
    name: "DJ Kollektiv",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
    eventsCount: 24,
    followers: "12.4k",
    category: "Music",
  },
  {
    id: "o2",
    name: "TechHub UB",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    eventsCount: 8,
    followers: "5.8k",
    category: "Tech",
  },
  {
    id: "o3",
    name: "Artspace MN",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    eventsCount: 15,
    followers: "3.2k",
    category: "Art",
  },
  {
    id: "o4",
    name: "RunCrew UB",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    eventsCount: 31,
    followers: "8.9k",
    category: "Sport",
  },
];

type Tab = "events" | "organizers";

export default function FavouritesPage() {
  const { user } = useAuth();
  const { likedEvents, toggleLike, loading } = useLikes();
  const [activeTab, setActiveTab] = useState<Tab>("events");
  const [displayEvents, setDisplayEvents] = useState<LikedEventData[]>([]);
  const initialized = useRef(false);

  // Snapshot once when data first arrives — ignore subsequent context updates
  useEffect(() => {
    if (!loading && !initialized.current) {
      setDisplayEvents(likedEvents);
      initialized.current = true;
    }
  }, [loading, likedEvents]);

  const handleUnlike = (eventId: string) => {
    const ev = displayEvents.find((e) => e.eventId === eventId);
    if (ev) toggleLike(ev); // updates Firestore in background; display stays unchanged
  };

  return (
    <div className="min-h-screen bg-[#0c0c12] pb-24 text-white">
      {/* ── Header ── */}
      <div className="px-5 pt-12 pb-5">
        <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-bold">
          Your collection
        </p>
        <h1 className="text-[26px] font-display font-black text-white leading-tight uppercase tracking-wide">
          Favourites
        </h1>
      </div>

      {/* ── Tab toggle ── */}
      <div className="px-5 mb-5">
        <div className="flex bg-[#111118] border border-white/8 p-1 gap-1">
          {(["events", "organizers"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${
                activeTab === tab
                  ? "bg-white text-black"
                  : "text-gray-600 hover:text-gray-400"
              }`}
            >
              {tab === "events"
                ? `Events ${displayEvents.length > 0 ? `(${displayEvents.length})` : ""}`
                : `Organizers (${MOCK_LIKED_ORGANIZERS.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Events tab ── */}
      {activeTab === "events" && (
        <div className="px-5 flex flex-col gap-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={28} className="text-primary animate-spin" />
            </div>
          ) : displayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 border border-white/10 flex items-center justify-center">
                <span className="text-3xl">🎪</span>
              </div>
              <p className="text-gray-600 text-[12px] font-mono uppercase tracking-widest">
                No liked events yet
              </p>
            </div>
          ) : (
            displayEvents.map((event) => (
              <FavouriteEventCard
                key={event.eventId}
                id={event.eventId}
                title={event.title}
                image={event.image}
                date={event.date}
                month={event.month}
                hostName={event.hostName}
                hostAvatar={event.hostAvatar}
                attendees={event.attendees}
                price={event.price}
                category={event.category}
                location={event.location}
                onUnlike={handleUnlike}
              />
            ))
          )}
        </div>
      )}

      {/* ── Organizers tab ── */}
      {activeTab === "organizers" && (
        <div className="px-5 flex flex-col gap-3">
          {MOCK_LIKED_ORGANIZERS.map((org) => (
            <div
              key={org.id}
              className="flex items-center gap-4 bg-[#111118] border border-white/8 p-4 active:scale-[0.99] transition-transform cursor-pointer"
            >
              {/* Avatar — circle */}
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary/40 flex-shrink-0">
                <Image
                  src={org.avatar}
                  alt={org.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-display font-bold text-[15px] uppercase tracking-wide truncate">
                  {org.name}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-gray-500">
                    <span className="text-white font-bold">
                      {org.eventsCount}
                    </span>{" "}
                    events
                  </span>
                  <span className="text-[10px] text-gray-500">
                    <span className="text-white font-bold">
                      {org.followers}
                    </span>{" "}
                    followers
                  </span>
                </div>
                <span className="inline-block mt-2 px-2 py-0.5 bg-primary/20 text-primary text-[9px] font-black uppercase tracking-wider">
                  {org.category}
                </span>
              </div>

              {/* Follow button */}
              <button className="px-3 py-2 border border-white/20 text-[10px] font-black uppercase tracking-wider text-gray-400 hover:border-primary hover:text-primary transition-colors flex-shrink-0">
                Following
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
