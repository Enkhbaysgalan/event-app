"use client";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Search,
  Flame,
  Music,
  Palette,
  Loader2,
  BriefcaseBusiness,
  Wine,
  Gem,
} from "lucide-react";
import EventCard, { EventCardProps } from "@/components/events/EventCard";
import { useRouter } from "next/navigation";
import {
  getMemoryCache,
  setMemoryCache,
  clearMemoryCache,
} from "@/lib/cache/events-cache";
import { Skeleton } from "@/components/ui/skeleton";
import PullToRefresh from "@/components/ui/PullToRefresh";
import NotificationBell from "@/components/ui/NotificationBell";
import { CATEGORIES as CATEGORY_LIST } from "@/lib/categories";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Music,
  Business: BriefcaseBusiness,
  Art: Palette,
  "Movie Night": Wine,
  Fashion: Gem,
};

const CATEGORIES = [
  { label: "All", icon: Flame },
  ...CATEGORY_LIST.filter((c) => CATEGORY_ICONS[c]).map((c) => ({
    label: c,
    icon: CATEGORY_ICONS[c],
  })),
];

export default function ExplorePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    new Set(),
  );
  const [allEvents, setAllEvents] = useState<EventCardProps[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

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

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRefresh = async () => {
    clearMemoryCache();
    await fetchEvents(true);
  };

  const filterCards = (cards: EventCardProps[]) =>
    cards.filter((c) => {
      const matchSearch =
        search === "" ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.hostName.toLowerCase().includes(search.toLowerCase());

      const matchCat =
        activeCategories.size === 0 || activeCategories.has(c.category ?? "");

      return matchSearch && matchCat;
    });

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
              <button
                onClick={() => setShowSearch((p) => !p)}
                className="w-11 h-11 bg-[#1a1a26] border border-white/8 flex items-center justify-center active:scale-90 transition-transform"
              >
                <Search size={18} className="text-gray-300" strokeWidth={2} />
              </button>
              <NotificationBell />
            </div>
          </div>

          {showSearch && (
            <div className="mt-4">
              <div className="flex items-center gap-2 bg-[#1a1a26] border border-white/8 px-3 h-11">
                <Search
                  size={15}
                  className="text-gray-600 flex-shrink-0"
                  strokeWidth={2.5}
                />
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
        <div className="flex items-center mb-7 pl-5 pr-5">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
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
      </div>
    </PullToRefresh>
  );
}
