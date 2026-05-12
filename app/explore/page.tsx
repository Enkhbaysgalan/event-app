"use client";

import { useState } from "react";
import { Bell, Search, SlidersHorizontal, MapPin, Flame, Music, Cpu, Palette, Dumbbell } from "lucide-react";
import EventCard, { EventCardProps } from "@/components/events/EventCard";

// ── Mock data ──────────────────────────────────────────────
const MOCK_UPCOMING: EventCardProps[] = [
  {
    id: "1",
    title: "Neon Rave: Underground Electronic Night",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80",
    date: "14",
    month: "JUN",
    hostName: "DJ Kollektiv",
    hostAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
    attendees: 1240,
    price: 25,
    category: "Music",
  },
  {
    id: "2",
    title: "Tech Summit 2026: AI & The Future",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
    date: "18",
    month: "JUN",
    hostName: "TechHub UB",
    hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    attendees: 580,
    price: 49,
    category: "Tech",
  },
  {
    id: "3",
    title: "Open Air Art Market & Live Painting",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    date: "22",
    month: "JUN",
    hostName: "Artspace MN",
    hostAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    attendees: 320,
    price: "Free",
    category: "Art",
  },
  {
    id: "4",
    title: "Marathon City Run — Summer Edition",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80",
    date: "29",
    month: "JUN",
    hostName: "RunCrew UB",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    attendees: 890,
    price: 15,
    category: "Sport",
  },
];

const MOCK_NEARBY: EventCardProps[] = [
  {
    id: "5",
    title: "Jazz & Wine Evening at Rooftop",
    image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&q=80",
    date: "16",
    month: "JUN",
    hostName: "Rooftop Events",
    hostAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    attendees: 150,
    price: 35,
    category: "Music",
  },
  {
    id: "6",
    title: "Startup Pitch Night — Demo Day",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80",
    date: "20",
    month: "JUN",
    hostName: "Founders Club",
    hostAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    attendees: 210,
    price: "Free",
    category: "Tech",
  },
  {
    id: "7",
    title: "Photography Walk: Golden Hour",
    image: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&q=80",
    date: "25",
    month: "JUN",
    hostName: "Lens Society",
    hostAvatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&q=80",
    attendees: 74,
    price: "Free",
    category: "Art",
  },
];

const CATEGORIES = [
  { label: "All", icon: Flame },
  { label: "Music", icon: Music },
  { label: "Tech", icon: Cpu },
  { label: "Art", icon: Palette },
  { label: "Sport", icon: Dumbbell },
];

// ── Component ───────────────────────────────────────────────
export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [notifications] = useState(3);

  // Filter helper
  const filterCards = (cards: EventCardProps[]) =>
    cards.filter((c) => {
      const matchSearch =
        search === "" ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.hostName.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        activeCategory === "All" || c.category === activeCategory;
      return matchSearch && matchCat;
    });

  const upcomingFiltered = filterCards(MOCK_UPCOMING);
  const nearbyFiltered = filterCards(MOCK_NEARBY);

  return (
    <div
      className="min-h-screen bg-[#0c0c12] pb-24 overflow-x-hidden"
      style={{ fontFamily: "'DM Mono', 'Courier New', monospace" }}
    >
      {/* ── Header ── */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-600 uppercase tracking-[0.2em] font-bold">
              Good evening,
            </p>
            <h1 className="text-[22px] font-black text-white leading-tight mt-0.5">
              Explorer
            </h1>
          </div>

          {/* Notification button — square */}
          <button className="relative w-11 h-11 bg-[#1a1a26] border border-white/8 flex items-center justify-center active:scale-90 transition-transform">
            <Bell size={18} className="text-gray-300" strokeWidth={2} />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 text-[9px] font-black text-white flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>
        </div>

        {/* Location */}
      </div>

      {/* ── Search + Filter ── */}
      <div className="px-5 mb-5">
        <div className="flex gap-2">
          {/* Search bar — square */}
          <div className="flex-1 flex items-center gap-2 bg-[#1a1a26] border border-white/8 px-3 h-11">
            <Search size={15} className="text-gray-600 flex-shrink-0" strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Search events, hosts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[13px] text-white placeholder-gray-600 focus:outline-none"
            />
          </div>

          {/* Filter button — square */}
          <button className="w-11 h-11 bg-violet-600 flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform">
            <SlidersHorizontal size={16} className="text-white" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── Category filters ── */}
      <div className="flex gap-2 px-5 mb-7 overflow-x-auto scrollbar-none">
        {CATEGORIES.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => setActiveCategory(label)}
            className={`flex items-center gap-1.5 px-3 h-8 flex-shrink-0 text-[11px] font-bold uppercase tracking-wider border transition-all duration-150 active:scale-95 ${
              activeCategory === label
                ? "bg-violet-600 border-violet-600 text-white"
                : "bg-transparent border-white/10 text-gray-500 hover:border-white/25 hover:text-gray-300"
            }`}
          >
            <Icon size={12} strokeWidth={2.5} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Upcoming Events ── */}
      <section className="mb-8">
        <div className="flex items-center justify-between px-5 mb-4">
          <h2 className="text-[13px] font-black text-white uppercase tracking-[0.15em]">
            Upcoming
          </h2>
          <button className="text-[11px] text-violet-400 font-bold uppercase tracking-wider">
            See All
          </button>
        </div>

        {upcomingFiltered.length > 0 ? (
          <div className="flex gap-3 px-5 overflow-x-auto scrollbar-none pb-2">
            {upcomingFiltered.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        ) : (
          <div className="mx-5 h-32 border border-dashed border-white/10 flex items-center justify-center">
            <p className="text-gray-600 text-[12px] font-mono">No events found</p>
          </div>
        )}
      </section>

      {/* ── Nearby Events ── */}
      <section className="mb-8">
        <div className="flex items-center justify-between px-5 mb-4">
          <h2 className="text-[13px] font-black text-white uppercase tracking-[0.15em]">
            Near You
          </h2>
          <button className="text-[11px] text-violet-400 font-bold uppercase tracking-wider">
            See All
          </button>
        </div>

        {nearbyFiltered.length > 0 ? (
          <div className="flex gap-3 px-5 overflow-x-auto scrollbar-none pb-2">
            {nearbyFiltered.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        ) : (
          <div className="mx-5 h-32 border border-dashed border-white/10 flex items-center justify-center">
            <p className="text-gray-600 text-[12px] font-mono">No events found</p>
          </div>
        )}
      </section>

      {/* ── This Weekend ── */}
      <section>
        <div className="flex items-center justify-between px-5 mb-4">
          <h2 className="text-[13px] font-black text-white uppercase tracking-[0.15em]">
            This Weekend
          </h2>
          <button className="text-[11px] text-violet-400 font-bold uppercase tracking-wider">
            See All
          </button>
        </div>
        <div className="flex gap-3 px-5 overflow-x-auto scrollbar-none pb-2">
          {filterCards([...MOCK_UPCOMING].reverse()).map((event) => (
            <EventCard key={event.id + "-w"} {...event} />
          ))}
        </div>
      </section>
    </div>
  );
}
