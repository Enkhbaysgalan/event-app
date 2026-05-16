"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import FavouriteEventCard from "@/components/events/FavouriteEventCard";
import { FavouriteEventCardProps } from "@/components/events/FavouriteEventCard";
import Image from "next/image";

// ── Mock liked events ───────────────────────────────────────
const MOCK_LIKED_EVENTS: FavouriteEventCardProps[] = [
  {
    id: "1",
    title: "Neon Rave: Underground Electronic Night",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80",
    date: "14",
    month: "JUN",
    hostName: "DJ Kollektiv",
    hostAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
    attendees: 1240,
    price: 25,
    category: "Music",
    location: "Sky Lounge, UB",
  },
  {
    id: "2",
    title: "Tech Summit 2026: AI & The Future",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
    date: "18",
    month: "JUN",
    hostName: "TechHub UB",
    hostAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    attendees: 580,
    price: 49,
    category: "Tech",
    location: "Innovation Center",
  },
  {
    id: "3",
    title: "Open Air Art Market & Live Painting",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    date: "22",
    month: "JUN",
    hostName: "Artspace MN",
    hostAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    attendees: 320,
    price: "Free",
    category: "Art",
    location: "Sukhbaatar Square",
  },
  {
    id: "4",
    title: "Marathon City Run — Summer Edition",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80",
    date: "29",
    month: "JUN",
    hostName: "RunCrew UB",
    hostAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    attendees: 890,
    price: 15,
    category: "Sport",
    location: "Zaisan Hill",
  },
  {
    id: "5",
    title: "Jazz & Wine Evening at Rooftop",
    image:
      "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&q=80",
    date: "16",
    month: "JUN",
    hostName: "Rooftop Events",
    hostAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    attendees: 150,
    price: 35,
    category: "Music",
    location: "Rooftop Bar, CBD",
  },
];

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
  const [activeTab, setActiveTab] = useState<Tab>("events");
  const [likedEvents, setLikedEvents] = useState(MOCK_LIKED_EVENTS);

  const handleUnlike = (id: string) => {
    setLikedEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0c0c12] pb-24 text-white">
      {/* ── Header ── */}
      <div className="px-5 pt-12 pb-5">
        <p className="text-[11px] text-gray-600 uppercase tracking-[0.2em] font-bold">
          Your collection
        </p>
        <h1 className="text-[26px] font-display font-black text-white leading-tight mt-0.5 uppercase tracking-wide">
          Favourites
        </h1>
      </div>

      {/* ── Toggle switch ── */}
      <div className="px-5 mb-6">
        <div className="flex bg-[#1a1a26] border border-white/8 p-1 gap-1">
          {(["events", "organizers"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-[12px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${
                activeTab === tab
                  ? "bg-white text-black"
                  : "text-gray-600 hover:text-gray-400"
              }`}
            >
              {tab === "events"
                ? `Events ${likedEvents.length > 0 ? `(${likedEvents.length})` : ""}`
                : `Organizers (${MOCK_LIKED_ORGANIZERS.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Events tab ── */}
      {activeTab === "events" && (
        <div className="px-5 flex flex-col gap-3">
          {likedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 border border-white/10 flex items-center justify-center">
                <span className="text-3xl">🎪</span>
              </div>
              <p className="text-gray-600 text-[12px] font-mono uppercase tracking-widest">
                No liked events yet
              </p>
            </div>
          ) : (
            likedEvents.map((event) => (
              <FavouriteEventCard
                key={event.id}
                {...event}
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
