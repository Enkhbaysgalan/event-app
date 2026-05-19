"use client";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Bell,
  Search,
  SlidersHorizontal,
  Flame,
  Music,
  Cpu,
  Palette,
  Dumbbell,
  Loader2,
} from "lucide-react";
import EventCard, { EventCardProps } from "@/components/events/EventCard";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { label: "All", icon: Flame },
  { label: "Music", icon: Music },
  { label: "Tech", icon: Cpu },
  { label: "Art", icon: Palette },
  { label: "Sport", icon: Dumbbell },
];

export default function ExplorePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [notifications] = useState(3);
  const [allEvents, setAllEvents] = useState<EventCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch from Firestore ──────────────────────
  useEffect(() => {
    const fetchEvents = async () => {
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
          };
        });
        setAllEvents(fetched);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // ── Filter helper (same as before) ───────────
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

  // Same 3 sections — newest, nearby (second half), weekend (reversed)
  const upcoming = allEvents.slice(0, Math.ceil(allEvents.length / 2));
  const nearby = allEvents.slice(Math.ceil(allEvents.length / 2));
  const weekend = [...allEvents].reverse();

  const upcomingFiltered = filterCards(upcoming);
  const nearbyFiltered = filterCards(nearby);
  const weekendFiltered = filterCards(weekend);
  const handleLoginClick = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0c0c12] pb-24 overflow-x-hidden font-display">
      {/* ── Header ── */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-600 uppercase tracking-[0.2em] font-bold">
              Good evening,
            </p>
            <h1 className="text-[22px] font-black text-white leading-tight mt-0.5">
              {user?.displayName ?? user?.email?.split("@")[0] ?? "Explorer"}
            </h1>
          </div>

          <button onClick={!user ? handleLoginClick : undefined} 
          className="relative min-w-11 min-h-11 bg-[#1a1a26] border border-white/8 flex items-center justify-center active:scale-90 transition-transform">
            {!user ? (
              <span className="px-5 text-[14px] font-bold font-display text-white uppercase tracking-wide">
                Login
              </span>
            ) : (
              <>
                <Bell size={18} className="text-gray-300" strokeWidth={2} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-light text-[9px] font-black text-black flex items-center justify-center rounded-full">
                  3
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Search + Filter ── */}
      <div className="px-5 mb-5">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-[#1a1a26] border border-white/8 px-3 h-11">
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
              className="flex-1 bg-transparent text-[13px] text-black placeholder-gray-600 focus:outline-none"
            />
          </div>
          <button className="w-11 h-11 bg-primary-light flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform">
            <SlidersHorizontal
              size={16}
              className="text-black"
              strokeWidth={2.5}
            />
          </button>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading ? (
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
  );
}
