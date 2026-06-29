"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Gift,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { createNotification } from "@/lib/notifications";
import { playSuccess } from "@/lib/sounds";

const EventMap = dynamic(() => import("@/components/ui/EventMap"), { ssr: false });

interface TicketData {
  id: string;
  eventTitle: string;
  eventImage: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  category: string;
  price: number | "Free";
  ticketNumber: string;
  status: "upcoming" | "past" | "cancelled";
  purchasedAt: string;
}

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const id = params?.id as string;

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [giftOpen, setGiftOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [gifting, setGifting] = useState(false);

  useEffect(() => {
    if (!ticket?.eventLocation || ticket.eventLocation === "TBA") return;
    const geocode = async () => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(ticket.eventLocation)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
        );
        const data = await res.json();
        if (data.results?.[0]?.geometry?.location) {
          setCoords(data.results[0].geometry.location);
        }
      } catch {
        // geocoding failed — map stays hidden
      }
    };
    geocode();
  }, [ticket?.eventLocation]);

  useEffect(() => {
    if (!id) return;
    const fetchTicket = async () => {
      try {
        const snap = await getDoc(doc(db, "tickets", id));
        if (!snap.exists()) { setNotFound(true); return; }
        const d = snap.data();
        setTicket({
          id: snap.id,
          eventTitle: d.eventTitle ?? "Untitled Event",
          eventImage: d.eventImage ?? "",
          eventDate: d.eventDate ?? "TBA",
          eventTime: d.eventTime ?? "TBA",
          eventLocation: d.eventLocation ?? "TBA",
          category: d.category ?? "Event",
          price: d.price ?? 0,
          ticketNumber: d.ticketNumber ?? snap.id.slice(-6).toUpperCase(),
          status: d.status ?? "upcoming",
          purchasedAt: d.purchasedAt?.toDate?.()?.toLocaleDateString("en-US") ?? "",
        });
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  const handleGift = async () => {
    if (!recipientEmail.trim() || !ticket || !user) return;
    setGifting(true);
    try {
      const usersQ = query(
        collection(db, "users"),
        where("email", "==", recipientEmail.trim().toLowerCase()),
      );
      const usersSnap = await getDocs(usersQ);
      if (usersSnap.empty) {
        toast.error("User doesn't exist. Check the email and try again.", {
          style: { background: "#1a0505", color: "#f87171", border: "1px solid #7f1d1d" },
        });
        return;
      }
      const recipient = usersSnap.docs[0];
      if (recipient.id === user.uid) {
        toast.error("You can't gift a ticket to yourself.", {
          style: { background: "#1a0505", color: "#f87171", border: "1px solid #7f1d1d" },
        });
        return;
      }
      await updateDoc(doc(db, "tickets", ticket.id), { userId: recipient.id });
      createNotification({
        userId: recipient.id,
        type: "ticket_received",
        title: "You received a ticket!",
        body: `${user.displayName ?? "Someone"} sent you a ticket to ${ticket.eventTitle}`,
        ticketId: ticket.id,
      });
      playSuccess();
      toast.success("Ticket gifted successfully!", {
        style: { background: "#001a0d", color: "#00DF81", border: "1px solid #064e3b" },
      });
      setGiftOpen(false);
      router.push("/my-tickets");
    } catch {
      toast.error("Something went wrong. Please try again.", {
        style: { background: "#1a0505", color: "#f87171", border: "1px solid #7f1d1d" },
      });
    } finally {
      setGifting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c12] flex items-center justify-center">
        <Loader2 size={28} className="text-primary animate-spin" />
      </div>
    );
  }

  if (notFound || !ticket) {
    return (
      <div className="min-h-screen bg-[#0c0c12] flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-gray-500 text-sm uppercase tracking-widest">Ticket not found</p>
        <button onClick={() => router.back()} className="text-primary text-sm">Go back</button>
      </div>
    );
  }

  const isUpcoming = ticket.status === "upcoming";
  const isPast = ticket.status === "past";
  const isCancelled = ticket.status === "cancelled";

  return (
    <div className="min-h-screen bg-[#0c0c12] text-white pb-10">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 border border-white/10 flex items-center justify-center active:scale-90 transition-transform"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
        <h1 className="font-display font-black text-[16px] uppercase tracking-widest flex-1">
          My Ticket
        </h1>
        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${
          isCancelled
            ? "bg-red-500/20 text-red-400"
            : isPast
            ? "bg-white/5 text-gray-500"
            : "bg-primary/20 text-primary"
        }`}>
          {isCancelled ? "Cancelled" : isPast ? "Used" : "Active"}
        </span>
      </div>

      {/* Event banner */}
      <div className="relative w-full h-[200px] bg-[#1a1a26] overflow-hidden">
        {ticket.eventImage ? (
          <Image
            src={ticket.eventImage}
            alt={ticket.eventTitle}
            fill
            className={`object-cover ${isPast ? "grayscale opacity-50" : ""}`}
            sizes="100vw"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎪</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c12] via-[#0c0c12]/40 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5">
          <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/20 px-2 py-0.5">
            {ticket.category}
          </span>
          <h2 className="font-display font-black text-[20px] uppercase leading-tight mt-1 line-clamp-2">
            {ticket.eventTitle}
          </h2>
        </div>
      </div>

      {/* Ticket body */}
      <div className="mx-5 mt-4 bg-[#111118] border border-white/8 overflow-hidden">

        {/* Date / Time / Price row */}
        <div className="grid grid-cols-3 divide-x divide-white/5 border-b border-white/5">
          <div className="p-3 flex flex-col gap-0.5">
            <span className="text-[8px] text-gray-600 uppercase tracking-widest font-black">Date</span>
            <div className="flex items-center gap-1 mt-0.5">
              <Calendar size={10} className="text-primary flex-shrink-0" strokeWidth={2.5} />
              <span className="text-[11px] text-white font-bold truncate">{ticket.eventDate}</span>
            </div>
          </div>
          <div className="p-3 flex flex-col gap-0.5">
            <span className="text-[8px] text-gray-600 uppercase tracking-widest font-black">Time</span>
            <div className="flex items-center gap-1 mt-0.5">
              <Clock size={10} className="text-primary flex-shrink-0" strokeWidth={2.5} />
              <span className="text-[11px] text-white font-bold">{ticket.eventTime}</span>
            </div>
          </div>
          <div className="p-3 flex flex-col gap-0.5">
            <span className="text-[8px] text-gray-600 uppercase tracking-widest font-black">Price</span>
            <span className="text-[13px] font-black text-white mt-0.5">
              {ticket.price === "Free" || ticket.price === 0 ? "FREE" : `${ticket.price}k`}
            </span>
          </div>
        </div>

        {/* Location section */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={12} className="text-primary" strokeWidth={2.5} />
            <span className="text-[9px] text-gray-600 uppercase tracking-widest font-black">
              Venue Location
            </span>
          </div>
          <div className="w-full h-[160px] overflow-hidden">
            {coords ? (
              <EventMap lat={coords.lat} lng={coords.lng} label={ticket.eventLocation} />
            ) : (
              <div className="w-full h-full bg-[#1a1a26] border border-dashed border-white/10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-1.5">
                  <MapPin size={22} className="text-gray-700" strokeWidth={1.5} />
                  <span className="text-[9px] text-gray-700 uppercase tracking-widest font-black">
                    Map loading...
                  </span>
                </div>
              </div>
            )}
          </div>
          <p className="text-[11px] text-gray-500 mt-2 truncate">{ticket.eventLocation}</p>
        </div>

        {/* Tear separator */}
        <div className="relative flex items-center">
          <div className="absolute -left-3 w-6 h-6 rounded-full bg-[#0c0c12] border-r border-white/8" />
          <div className="flex-1 border-t border-dashed border-white/10 mx-3" />
          <div className="absolute -right-3 w-6 h-6 rounded-full bg-[#0c0c12] border-l border-white/8" />
        </div>

        {/* QR code */}
        <div className="flex flex-col items-center py-7 px-4">
          <div className={`p-3 bg-white ${
            isCancelled ? "opacity-30 grayscale" : isPast ? "opacity-50 grayscale" : ""
          }`}>
            <QRCodeSVG
              value={`TICKET:${ticket.ticketNumber}:${ticket.id}`}
              size={160}
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
            />
          </div>
          <p className="mt-4 font-mono text-[14px] text-white font-bold tracking-[0.25em]">
            #{ticket.ticketNumber}
          </p>
          <p className="text-[9px] text-gray-600 uppercase tracking-widest mt-1">
            {isUpcoming
              ? "Scan at venue entrance"
              : isCancelled
              ? "Ticket cancelled"
              : "Ticket used"}
          </p>
          {ticket.purchasedAt && (
            <p className="text-[9px] text-gray-700 uppercase tracking-widest mt-3">
              Purchased {ticket.purchasedAt}
            </p>
          )}
        </div>
      </div>

      {/* Gift button */}
      {isUpcoming && (
        <div className="mx-5 mt-4">
          <button
            onClick={() => setGiftOpen(true)}
            className="w-full py-4 bg-[#111118] border border-white/10 flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
          >
            <Gift size={16} strokeWidth={2} className="text-primary" />
            <span className="text-[12px] font-black uppercase tracking-widest">
              Gift This Ticket
            </span>
          </button>
        </div>
      )}

      {/* Gift modal */}
      {giftOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm px-5 pb-24"
          onClick={(e) => { if (e.target === e.currentTarget) setGiftOpen(false); }}
        >
          <div className="w-full max-w-sm bg-[#1a1a26] border border-white/10 p-5">
            <div className="flex items-center gap-3 mb-1">
              <Gift size={18} className="text-primary" strokeWidth={2} />
              <h3 className="font-display font-black text-[16px] uppercase tracking-wide">
                Gift Ticket
              </h3>
            </div>
            <p className="text-[11px] text-gray-500 mb-5 leading-relaxed">
              Transfer this ticket to another person. Enter their registered email address below.
            </p>
            <input
              type="email"
              placeholder="Recipient's email address"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="w-full bg-[#0c0c12] border border-white/10 px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-primary transition-colors mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setGiftOpen(false); setRecipientEmail(""); }}
                disabled={gifting}
                className="flex-1 py-3 border border-white/10 text-gray-500 text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleGift}
                disabled={gifting || !recipientEmail.trim()}
                className="flex-1 py-3 bg-secondary text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
              >
                {gifting
                  ? <Loader2 size={14} className="animate-spin" />
                  : "Send Gift"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
