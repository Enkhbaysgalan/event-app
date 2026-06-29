"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Loader2, CalendarPlus, Plus } from "lucide-react";
import PullToRefresh from "@/components/ui/PullToRefresh";
import MyEventCard, { MyEventProps as MyEvent } from "@/components/events/MyEventCard";

export default function MyEventsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "events"),
        where("createdBy", "==", user.uid),
      );
      const snapshot = await getDocs(q);
      const now = new Date();
      const fetched: MyEvent[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.title ?? "Untitled Event",
          image: d.image ?? "",
          category: d.category ?? "Event",
          date: d.date ?? "TBA",
          day: d.day ?? "",
          month: d.month ?? "",
          time: d.time ?? "TBA",
          location: d.location ?? "",
          price:
            d.price === 0 || d.price === "Free" ? "Free" : (d.price ?? "Free"),
          capacity: d.capacity ?? 0,
          attendees: d.attendees ?? 0,
          createdAt: d.createdAt?.toDate?.() ?? null,
        };
      });
      fetched.sort(
        (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
      );
      setEvents(fetched);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const now = new Date();
  const MONTHS: Record<string, number> = {
    JAN: 0,
    FEB: 1,
    MAR: 2,
    APR: 3,
    MAY: 4,
    JUN: 5,
    JUL: 6,
    AUG: 7,
    SEP: 8,
    OCT: 9,
    NOV: 10,
    DEC: 11,
  };
  const displayed = events.filter((e) => {
    const m = MONTHS[e.month?.toUpperCase() ?? ""] ?? now.getMonth();
    const d = parseInt(e.day) || now.getDate();
    return new Date(now.getFullYear(), m, d) >= now;
  });

  return (
    <PullToRefresh onRefresh={fetchEvents}>
      <div className="min-h-screen bg-[#0c0c12] text-white pb-24">
        {/* Header */}
        <div className="px-5 pt-12 pb-5 flex items-start justify-between">
          <div>
            <p className="font-sans text-[10px] text-gray-600 uppercase tracking-[0.2em] font-bold">
              Your
            </p>
            <h1 className="font-display font-black text-[26px] uppercase tracking-wide leading-tight">
              Events
            </h1>
          </div>
          <button
            onClick={() => router.push("/events/create")}
            className="w-11 h-11 bg-secondary flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
          >
            <Plus size={20} strokeWidth={2.5} className="text-black" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={28} className="text-primary animate-spin" />
            <p className="text-[11px] text-gray-600 uppercase tracking-widest font-black">
              Loading events...
            </p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 px-5">
            <div className="w-16 h-16 border border-dashed border-white/10 flex items-center justify-center">
              <CalendarPlus
                size={24}
                className="text-gray-700"
                strokeWidth={1.5}
              />
            </div>
            <p className="text-gray-600 text-[12px] font-mono uppercase tracking-widest text-center">
              No upcoming events
            </p>
            <button
              onClick={() => router.push("/events/create")}
              className="mt-2 px-6 h-11 bg-secondary text-white text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform"
            >
              Create Event
            </button>
          </div>
        ) : (
          <div className="px-5 flex flex-col gap-3">
            {displayed.map((event) => (
              <MyEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}
