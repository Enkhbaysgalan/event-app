"use client";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Search,
  SlidersHorizontal,
  Flame,
  Music,
  Cpu,
  Palette,
  Dumbbell,
  Loader2,
  BriefcaseBusiness,
  X,
} from "lucide-react";
import EventCard, { EventCardProps } from "@/components/events/EventCard";
import { useRouter } from "next/navigation";
import { getMemoryCache, setMemoryCache, clearMemoryCache } from "@/lib/cache/events-cache";
import { Skeleton } from "@/components/ui/skeleton";
import PullToRefresh from "@/components/ui/PullToRefresh";
import NotificationBell from "@/components/ui/NotificationBell";

const CATEGORIES = [
  { label: "All", icon: Flame },
  { label: "Music", icon: Music },
  { label: "Tech", icon: Cpu },
  { label: "Business", icon: BriefcaseBusiness },
  { label: "Art", icon: Palette },
  { label: "Sport", icon: Dumbbell },
];

export default function ExplorePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [allEvents, setAllEvents] = useState<EventCardProps[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [filterDate, setFilterDate] = useState<"any" | "today" | "week" | "month">("any");
  const [filterPrice, setFilterPrice] = useState<"any" | "free" | "low" | "mid">("any");
  const [filterLocation, setFilterLocation] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);

  // ── Fetch from Firestore ──
  const fetchEvents = useCallback(async (skipCache = false) => {
    setLoadingEvent(true);

    if (!skipCache) {
      const memory = getMemoryCache();
      if (memory) {
        setAllEvents(memory);
        setLoadingEvent(false);
        return;
      }
    }

    try {
      const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const fetched: EventCardProps[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.title ?? "Untitled Event",
          image: d.image ?? "",
          date: d.day ?? "01",
          month: d.month ?? "JAN",
          hostName: d.host?.name ?? "Organizer",
          hostAvatar: d.host?.avatar ?? "",
          attendees: d.attendees ?? 0,
          price: d.price === 0 ? "Free" : d.price,
          category: d.category ?? "Event",
          location: d.location ?? "",
          blurDataUrl: d.blurDataUrl ?? "",
        };
      });
      setAllEvents(fetched);
      setMemoryCache(fetched);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoadingEvent(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleRefresh = async () => {
    clearMemoryCache();
    await fetchEvents(true);
  };

  // ── Filter helper ────────────────────────────
  const MONTH_IDX: Record<string, number> = {
    JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11,
  };

  const filterCards = (cards: EventCardProps[]) => {
    const now = new Date();
    return cards.filter((c) => {
      const matchSearch =
        search === "" ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.hostName.toLowerCase().includes(search.toLowerCase());

      const matchCat =
        activeCategories.size === 0 || activeCategories.has(c.category ?? "");

      let matchDate = true;
      if (filterDate !== "any") {
        const m = MONTH_IDX[c.month?.toUpperCase() ?? ""] ?? now.getMonth();
        const d = parseInt(c.date) || now.getDate();
        const ev = new Date(now.getFullYear(), m, d);
        if (filterDate === "today") matchDate = ev.toDateString() === now.toDateString();
        else if (filterDate === "week") {
          const week = new Date(now); week.setDate(now.getDate() + 7);
          matchDate = ev >= now && ev <= week;
        } else if (filterDate === "month") matchDate = m === now.getMonth();
      }

      let matchPrice = true;
      if (filterPrice !== "any") {
        const p = c.price;
        if (filterPrice === "free") matchPrice = p === "Free" || p === 0;
        else if (filterPrice === "low") matchPrice = typeof p === "number" && p > 0 && p <= 10;
        else if (filterPrice === "mid") matchPrice = typeof p === "number" && p > 10 && p <= 50;
      }

      const matchLocation =
        !filterLocation.trim() ||
        (c.location ?? "").toLowerCase().includes(filterLocation.toLowerCase().trim());

      return matchSearch && matchCat && matchDate && matchPrice && matchLocation;
    });
  };

  // Same 3 sections — newest, nearby (second half), weekend (reversed)
  const upcoming = allEvents.slice(0, Math.ceil(allEvents.length / 2));
  const nearby = allEvents.slice(Math.ceil(allEvents.length / 2));
  const weekend = [...allEvents].reverse();

  const upcomingFiltered = filterCards(upcoming);
  const nearbyFiltered = filterCards(nearby);
  const weekendFiltered = filterCards(weekend);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="min-h-screen bg-[#0c0c12] pb-24 overflow-x-hidden font-display">
      {/* ── Header ── */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-start justify-between gap-2">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-40" />
            </div>
          ) : (
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-bold font-sans">
                Good evening,
              </p>
              <h1 className="font-display font-black text-[26px] uppercase tracking-wide leading-tight text-white">
                {user?.displayName ?? "Explorer"}
              </h1>
            </div>
          )}

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Search toggle button */}
            <button
              onClick={() => setShowSearch((p) => !p)}
              className="w-11 h-11 bg-[#1a1a26] border border-white/8 flex items-center justify-center active:scale-90 transition-transform"
            >
              <Search size={18} className="text-gray-300" strokeWidth={2} />
            </button>

            {/* Notification / Login */}
            <NotificationBell />
          </div>
        </div>

        {/* Expandable search bar */}
        {showSearch && (
          <div className="mt-4">
            <div className="flex items-center gap-2 bg-[#1a1a26] border border-white/8 px-3 h-11">
              <Search size={15} className="text-gray-600 flex-shrink-0" strokeWidth={2.5} />
              <input
                type="text"
                placeholder="Search events, hosts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent text-[13px] text-white placeholder-gray-600 focus:outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <span className="text-gray-600 text-[16px]">×</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Categories ── */}
      <div className="flex items-center mb-7">
        {/* Scrollable category pills */}
        <div className="flex gap-2 pl-5 overflow-x-auto scrollbar-none flex-1 min-w-0">
          {CATEGORIES.map(({ label, icon: Icon }) => {
            const isAll = label === "All";
            const active = isAll
              ? activeCategories.size === 0
              : activeCategories.has(label);
            return (
              <button
                key={label}
                onClick={() => {
                  if (isAll) {
                    setActiveCategories(new Set());
                  } else {
                    setActiveCategories((prev) => {
                      const next = new Set(prev);
                      next.has(label) ? next.delete(label) : next.add(label);
                      return next;
                    });
                  }
                }}
                className={`flex items-center gap-1.5 px-3 h-8 flex-shrink-0 text-[11px] font-bold uppercase tracking-wider border transition-all duration-150 active:scale-95 ${
                  active
                    ? "bg-primary border-primary text-white"
                    : "bg-transparent border-white/10 text-gray-500 hover:border-white/25 hover:text-gray-300"
                }`}
              >
                <Icon size={12} strokeWidth={2.5} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-white/10 flex-shrink-0 mx-3" />

        {/* Filter button — fixed right */}
        <div className="pr-5 flex-shrink-0">
          {(() => {
            const hasActive = filterDate !== "any" || filterPrice !== "any" || filterLocation.trim() !== "";
            return (
              <button
                onClick={() => setShowFilterModal(true)}
                className={`relative w-11 h-9 border flex items-center justify-center active:scale-90 transition-transform ${
                  hasActive ? "bg-primary-light border-primary-light" : "bg-[#1a1a26] border-white/8"
                }`}
              >
                <SlidersHorizontal
                  size={16}
                  className={hasActive ? "text-black" : "text-gray-300"}
                  strokeWidth={2.5}
                />
                {hasActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary" />
                )}
              </button>
            );
          })()}
        </div>
      </div>

      {/* ── Loading ── */}
      {loadingEvent ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={28} className="text-primary animate-spin" />
          <p className="text-[11px] text-gray-600 uppercase tracking-widest font-black">
            Loading events...
          </p>
        </div>
      ) : (
        <>
          {/* ── Upcoming Events ── */}
          <section className="mb-8">
            <div className="flex items-center justify-between px-5 mb-4">
              <h2 className="text-[13px] font-black text-white uppercase tracking-[0.15em]">
                Upcoming
              </h2>
              <button className="text-[11px] text-gray-300 font-bold uppercase tracking-wider">
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
                <p className="text-gray-600 text-[12px] font-mono">
                  No events found
                </p>
              </div>
            )}
          </section>

          {/* ── Nearby Events ── */}
          <section className="mb-8">
            <div className="flex items-center justify-between px-5 mb-4">
              <h2 className="text-[13px] font-black text-white uppercase tracking-[0.15em]">
                Near You
              </h2>
              <button className="text-[11px] text-gray-300 font-bold uppercase tracking-wider">
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
                <p className="text-gray-600 text-[12px] font-mono">
                  No events found
                </p>
              </div>
            )}
          </section>

          {/* ── This Weekend ── */}
          <section>
            <div className="flex items-center justify-between px-5 mb-4">
              <h2 className="text-[13px] font-black text-white uppercase tracking-[0.15em]">
                This Weekend
              </h2>
              <button className="text-[11px] text-gray-300 font-bold uppercase tracking-wider">
                See All
              </button>
            </div>
            <div className="flex gap-3 px-5 overflow-x-auto scrollbar-none pb-2">
              {weekendFiltered.length > 0 ? (
                weekendFiltered.map((event) => (
                  <EventCard key={event.id + "-w"} {...event} />
                ))
              ) : (
                <div className="w-full h-32 border border-dashed border-white/10 flex items-center justify-center">
                  <p className="text-gray-600 text-[12px] font-mono">
                    No events found
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
      {/* ── Filter modal ── */}
      {showFilterModal && (
        <div
          className="fixed inset-0 z-[60] flex items-end bg-black/70 backdrop-blur-sm pb-24"
          onClick={(e) => { if (e.target === e.currentTarget) setShowFilterModal(false); }}
        >
          <div className="w-full max-w-lg mx-auto bg-[#111118] border-t border-white/10 px-5 pt-6 pb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-black text-[15px] uppercase tracking-widest text-white">
                Filter Events
              </h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 active:scale-90 transition-transform"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Date */}
            <div className="mb-6">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black mb-3">Date</p>
              <div className="flex gap-2 flex-wrap">
                {([ ["any","Any"], ["today","Today"], ["week","This Week"], ["month","This Month"] ] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setFilterDate(val)}
                    className={`px-3 h-8 text-[11px] font-black uppercase tracking-wide border transition-all active:scale-95 ${
                      filterDate === val
                        ? "bg-primary-light border-primary-light text-black"
                        : "border-white/10 text-gray-500"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black mb-3">Price</p>
              <div className="flex gap-2 flex-wrap">
                {([ ["any","Any"], ["free","Free"], ["low","Under 10k"], ["mid","Under 50k"] ] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setFilterPrice(val)}
                    className={`px-3 h-8 text-[11px] font-black uppercase tracking-wide border transition-all active:scale-95 ${
                      filterPrice === val
                        ? "bg-primary-light border-primary-light text-black"
                        : "border-white/10 text-gray-500"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="mb-6">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black mb-3">Location</p>
              <input
                type="text"
                placeholder="City or venue..."
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full bg-[#0c0c12] border border-white/8 px-4 h-11 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-primary-light transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => { setFilterDate("any"); setFilterPrice("any"); setFilterLocation(""); }}
                className="flex-1 h-11 border border-white/10 text-gray-500 text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 h-11 bg-primary-light text-black text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </PullToRefresh>
  );
}
