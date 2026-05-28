"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import PullToRefresh from "@/components/ui/PullToRefresh";
import { useLikes } from "@/lib/likes-context";
import { LikedEventData } from "@/lib/likes-context";
import { useFollows } from "@/lib/follows-context";
import FavouriteEventCard from "@/components/events/FavouriteEventCard";
import Image from "next/image";
import { Loader2 } from "lucide-react";


type Tab = "events" | "organizers";

export default function FavouritesPage() {
  const { likedEvents, toggleLike, loading } = useLikes();
  const { followedHosts, toggleFollow, loading: loadingFollows } = useFollows();
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
    if (ev) toggleLike(ev);
  };

  const handleRefresh = useCallback(async () => {
    initialized.current = false;
    setDisplayEvents(likedEvents);
    initialized.current = true;
  }, [likedEvents]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
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
                : `Organizers${followedHosts.length > 0 ? ` (${followedHosts.length})` : ""}`}
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
          {loadingFollows ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={28} className="text-primary animate-spin" />
            </div>
          ) : followedHosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 border border-white/10 flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <p className="text-gray-600 text-[12px] font-mono uppercase tracking-widest">
                No followed organizers yet
              </p>
            </div>
          ) : (
            followedHosts.map((host) => (
              <div
                key={host.hostUid}
                className="flex items-center gap-4 bg-[#111118] border border-white/8 p-4"
              >
                {/* Avatar */}
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary/40 flex-shrink-0 bg-[#1a1a26]">
                  {host.hostAvatar ? (
                    <Image
                      src={host.hostAvatar}
                      alt={host.hostName}
                      fill
                      className="object-cover"
                      sizes="56px"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                  )}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-display font-bold text-[15px] uppercase tracking-wide truncate">
                    {host.hostName}
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">Organizer</p>
                </div>

                {/* Unfollow button */}
                <button
                  onClick={() => toggleFollow(host)}
                  className="px-3 py-2 border border-primary text-primary text-[10px] font-black uppercase tracking-wider hover:bg-primary/10 transition-colors flex-shrink-0"
                >
                  Following
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
    </PullToRefresh>
  );
}
