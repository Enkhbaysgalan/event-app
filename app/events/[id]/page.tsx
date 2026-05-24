"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  Share2,
  Loader2,
} from "lucide-react";
import LikeButton from "@/components/ui/LikeButton";
import dynamic from "next/dynamic";

const EventMap = dynamic(() => import("@/components/ui/EventMap"), {
  ssr: false,
});
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";

interface Artist {
  id?: string;
  name: string;
  role: string;
  avatar?: string;
}

interface EventData {
  id: string;
  title: string;
  image: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  locationDetail: string;
  description: string;
  category: string;
  price: number;
  attendees: number;
  capacity: number;
  host: {
    name: string;
    avatar: string;
    events: number;
    followers: string;
  };
  artists: Artist[];
  lat: number | null;
  lng: number | null;
}

export default function EventDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadingBuy, setLoadingBuy] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      try {
        const snap = await getDoc(doc(db, "events", id));
        if (snap.exists()) {
          const d = snap.data();
          // Safely map every Firestore field with fallbacks
          setEvent({
            id: snap.id,
            title: d.title ?? "Untitled Event",
            image: d.image ?? "",
            date: d.date ?? "TBA",
            time: d.time ?? "TBA",
            duration: d.duration ?? "",
            location: d.location ?? "TBA",
            locationDetail: d.locationDetail ?? "",
            description: d.description ?? "No description provided.",
            category: d.category ?? "Event",
            price: d.price ?? 0,
            attendees: d.attendees ?? 0,
            capacity: d.capacity ?? 0,
            host: {
              name: d.host?.name ?? "Organizer",
              avatar: d.host?.avatar ?? "",
              events: d.host?.events ?? 0,
              followers: d.host?.followers ?? "0",
            },
            artists: Array.isArray(d.artists) ? d.artists : [],
            lat: d.lat ?? null,
            lng: d.lng ?? null,
          });
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c12] flex flex-col items-center justify-center gap-4">
        <Loader2 size={28} className="text-primary animate-spin" />
        <p className="text-[11px] text-gray-600 uppercase tracking-widest font-black">
          Loading event...
        </p>
      </div>
    );
  }

  // ── Not found ──
  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-[#0c0c12] flex flex-col items-center justify-center gap-4 px-5">
        <div className="w-16 h-16 border border-dashed border-white/10 flex items-center justify-center">
          <span className="text-3xl">🎪</span>
        </div>
        <p className="text-white font-display font-black text-[18px] uppercase">
          Event Not Found
        </p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-primary text-white text-[11px] font-black uppercase tracking-widest"
        >
          Go Back
        </button>
      </div>
    );
  }

  const soldPct =
    event.capacity > 0
      ? Math.min(100, Math.round((event.attendees / event.capacity) * 100))
      : 0;

  const handleToastClick = () => {
    toast.promise<{ name: string }>(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ name: "Event" }), 2000),
        ),
      {
        loading: "Loading...",
        success: (data) => `${data.name} has been reported`,
        error: "Error",
        style: {
          background: "white",
        },
      },
    );
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: event?.title, text: `Check out this event: ${event?.title}`, url });
      } catch {
        // user cancelled — do nothing
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleBuyClick = async () => {
    if (!user) { router.push("/login"); return; }
    if (!event) return;

    setLoadingBuy(true);

    try {
      await addDoc(collection(db, "tickets"), {
        userId: user.uid,

        eventId: event.id,

        eventTitle: event.title,
        eventImage: event.image,
        eventDate: event.date,
        eventTime: event.time ?? "TBA",
        eventLocation: event.location,

        category: event.category,

        price: event.price ?? "Free",

        ticketNumber: Math.random().toString(36).substring(2, 8).toUpperCase(),

        status: "upcoming",

        purchasedAt: serverTimestamp(),
      });

      toast.success("Ticket purchased successfully!", {
        description: "Your ticket has been added to your account.",
        style: {
          background: "#00DF81",
          color: "white",
        },
      });

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#7c3aed", "#d946ef", "#ffffff", "#a78bfa"],
      });
    } catch (error) {
      console.log(error);

      toast.error("Purchase failed");
    } finally {
      setLoadingBuy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c12] text-white pb-32">
      {/* ── Hero ── */}
      <div className="relative w-full h-[340px] bg-[#111118]">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">🎪</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#0c0c12]" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-[#0c0c12]/70 backdrop-blur-sm border border-white/10 flex items-center justify-center active:scale-90 transition-transform"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div className="flex gap-2">
            <button onClick={handleShare} className="w-10 h-10 bg-[#0c0c12]/70 backdrop-blur-sm border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
              <Share2 size={16} strokeWidth={2.5} />
            </button>
            <LikeButton />
          </div>
        </div>

        {/* Category */}
        <div className="absolute bottom-6 left-5">
          <span className="px-3 py-1.5 bg-primary-light text-black text-[12px] font-bold uppercase tracking-wide font-display">
            {event.category}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-5 -mt-2">
        {/* Title */}
        <h1 className="font-display font-black text-[26px] uppercase leading-tight tracking-wide mt-4 mb-5">
          {event.title}
        </h1>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="bg-[#111118] border border-white/8 p-2 flex gap-3 items-center">
            <div className="w-8 h-8 bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Calendar size={15} className="text-primary" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold mb-0.5">
                Date
              </p>
              <p className="text-[12px] text-white font-bold leading-snug">
                {event.date}
              </p>
            </div>
          </div>

          <div className="bg-[#111118] border border-white/8 p-2 flex gap-3 items-center">
            <div className="w-8 h-8 bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Clock size={15} className="text-primary" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold mb-0.5">
                Time
              </p>
              <p className="text-[12px] text-white font-bold leading-snug">
                {event.time}
              </p>
              {event.duration ? (
                <p className="text-[10px] text-gray-600">{event.duration}</p>
              ) : null}
            </div>
          </div>

          <a
            href={
              event.lat && event.lng
                ? `https://www.google.com/maps/search/?api=1&query=${event.lat},${event.lng}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 bg-[#111118] border border-white/8 p-2 flex gap-3 items-center active:opacity-70 transition-opacity"
          >
            <div className="w-8 h-8 bg-primary/20 flex items-center justify-center flex-shrink-0">
              <MapPin size={15} className="text-primary" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold mb-0.5">
                Location
              </p>
              <p className="text-[13px] text-white font-bold">
                {event.location}
              </p>
              {event.locationDetail ? (
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {event.locationDetail}
                </p>
              ) : null}
            </div>
            <ChevronRight
              size={16}
              className="text-gray-700 flex-shrink-0 mt-1"
            />
          </a>
        </div>

        {/* Capacity bar — only show if capacity set */}
        {event.capacity > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users size={13} className="text-gray-500" strokeWidth={2.5} />
                <span className="text-[11px] text-gray-500 font-bold">
                  <span className="text-white">
                    {event.attendees.toLocaleString()}
                  </span>{" "}
                  / {event.capacity.toLocaleString()} going
                </span>
              </div>
              <span className="text-[11px] font-black text-primary">
                {soldPct}% filled
              </span>
            </div>
            <div className="h-1.5 bg-white/5 w-full">
              <div
                className="h-full bg-primary transition-all duration-700"
                style={{ width: `${soldPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="h-px bg-white/5 mb-6" />

        {/* Host */}
        <div className="mb-6">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black mb-3">
            Hosted by
          </p>
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary flex-shrink-0 bg-[#1a1a26]">
              {event.host.avatar ? (
                <Image
                  src={event.host.avatar}
                  alt={event.host.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg">
                  👤
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-display font-black text-[16px] uppercase tracking-wide">
                {event.host.name}
              </h3>
              <p className="text-[11px] text-gray-500">
                {event.host.events} events · {event.host.followers} followers
              </p>
            </div>
            <button className="px-3 py-2 border border-white/20 text-[10px] font-black uppercase tracking-wider text-gray-400 hover:border-primary hover:text-primary transition-colors">
              Follow
            </button>
          </div>
        </div>

        <div className="h-px bg-white/5 mb-6" />

        {/* Description */}
        <div className="mb-6">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black mb-3">
            About
          </p>
          <p className="text-[13px] text-gray-400 leading-relaxed font-sans">
            {event.description}
          </p>
        </div>

        {/* Artists — only show if exist */}
        {event.artists.length > 0 && (
          <>
            <div className="h-px bg-white/5 mb-6" />
            <div className="mb-6">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black mb-3">
                Artists & Lineup
              </p>
              <div className="flex flex-col gap-2">
                {event.artists.map((artist, i) => (
                  <div
                    key={artist.id ?? i}
                    className="flex items-center gap-3 bg-[#111118] border border-white/8 p-3"
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-[#1a1a26]">
                      {artist.avatar ? (
                        <Image
                          src={artist.avatar}
                          alt={artist.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm">
                          🎵
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-black text-[14px] uppercase tracking-wide">
                        {artist.name}
                      </p>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider">
                        {artist.role}
                      </p>
                    </div>
                    <div className="w-1.5 h-1.5 bg-primary" />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="h-px bg-white/5 mb-6" />

        {/* Map */}
        <div className="mb-6">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black mb-3">
            Location
          </p>
          <div className="w-full h-[200px] overflow-hidden border border-white/8">
            {event.lat && event.lng ? (
              <EventMap
                lat={event.lat}
                lng={event.lng}
                label={event.location}
              />
            ) : (
              <div className="w-full h-full bg-[#111118] flex flex-col items-center justify-center gap-2">
                <MapPin size={24} className="text-gray-700" strokeWidth={1.5} />
                <p className="text-[11px] text-gray-700 uppercase tracking-widest font-black">
                  No location set
                </p>
              </div>
            )}
          </div>
          {event.locationDetail && (
            <p className="text-[10px] text-gray-600 font-mono mt-2">
              {event.locationDetail}
            </p>
          )}
        </div>
        <div className="h-px bg-white/5 mb-6" />
        <p
          onClick={handleToastClick}
          className="text-[10px] text-red-500 uppercase tracking-widest text-center font-black cursor-pointer"
        >
          Report Event
        </p>
      </div>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-lg mx-auto px-5 pb-6 pt-4 bg-gradient-to-t from-[#0c0c12] via-[#0c0c12] to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-[50px] bg-[#111118] border border-white/10 px-4 py-4 flex flex-col items-center justify-center flex-shrink-0">
              <p className="text-[9px] text-gray-600 uppercase tracking-widest font-black leading-none mb-0.5">
                Price
              </p>
              <p className="text-[12px] font-black text-white leading-none">
                {event.price === 0 ? "FREE" : `${event.price}k`}
              </p>
            </div>
            <button
              onClick={handleBuyClick}
              disabled={loadingBuy}
              className="flex-1 h-[50px] bg-primary-light font-display font-black text-[14px] uppercase tracking-widest text-white active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loadingBuy ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Buy Ticket
                  <ChevronRight size={18} strokeWidth={3} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
