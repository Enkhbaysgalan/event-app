"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Ticket } from "lucide-react";
import TicketCard, { TicketProps } from "@/components/tickets/TicketCard";
import PullToRefresh from "@/components/ui/PullToRefresh";
import TabToggle from "@/components/ui/TabToggle";

type Tab = "upcoming" | "past";

export default function MyTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  const fetchTickets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "tickets"),
        where("userId", "==", user.uid),
        orderBy("purchasedAt", "desc"),
      );
      const snapshot = await getDocs(q);
      const fetched: TicketProps[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          eventId: d.eventId ?? "",
          eventTitle: d.eventTitle ?? "Untitled Event",
          eventImage: d.eventImage ?? "",
          eventDate: d.eventDate ?? "TBA",
          eventTime: d.eventTime ?? "TBA",
          eventLocation: d.eventLocation ?? "TBA",
          category: d.category ?? "Event",
          price: d.price ?? 0,
          ticketNumber: d.ticketNumber ?? doc.id.slice(-6).toUpperCase(),
          status: d.status ?? "upcoming",
          purchasedAt:
            d.purchasedAt?.toDate?.()?.toLocaleDateString("en-US") ?? "",
        };
      });
      setTickets(fetched);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const upcoming = tickets.filter((t) => t.status === "upcoming");
  const past = tickets.filter(
    (t) => t.status === "past" || t.status === "cancelled",
  );
  const displayed = activeTab === "upcoming" ? upcoming : past;

  return (
    <PullToRefresh onRefresh={fetchTickets}>
      <div className="min-h-screen bg-[#0c0c12] text-white pb-24">
        {/* ── Header ── */}
        <div className="px-5 pt-12 pb-5">
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-bold">
              Your
            </p>
            <h1 className="font-display font-black text-[26px] uppercase tracking-wide leading-tight">
              Tickets
            </h1>
          </div>
        </div>
        {/* ── Tab toggle ── */}
        <div className="px-5 mb-5">
          <TabToggle
            tabs={[
              { value: "upcoming", label: `Upcoming (${upcoming.length})` },
              { value: "past", label: `Past (${past.length})` },
            ]}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>
        {/* ── Content ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={28} className="text-primary animate-spin" />
            <p className="text-[11px] text-gray-600 uppercase tracking-widest font-black">
              Loading tickets...
            </p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 px-5">
            <div className="w-16 h-16 border border-dashed border-white/10 flex items-center justify-center">
              <Ticket size={24} className="text-gray-700" strokeWidth={1.5} />
            </div>
            <p className="text-gray-600 text-[12px] font-mono uppercase tracking-widest text-center">
              {activeTab === "upcoming"
                ? "No upcoming tickets"
                : "No past tickets"}
            </p>
          </div>
        ) : (
          <div className="px-5 flex flex-col gap-3">
            {displayed.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}
