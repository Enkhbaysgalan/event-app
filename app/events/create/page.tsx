"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowLeft,
  Plus,
  X,
  ImagePlus,
  Loader2,
  CheckCircle,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
} from "lucide-react";
import confetti from "canvas-confetti";
import dynamic from "next/dynamic";
import type { LocationValue } from "@/components/ui/LocationPicker";
import { getBlurDataUrl } from "@/lib/blur";

const LocationPicker = dynamic(() => import("@/components/ui/LocationPicker"), { ssr: false });

// ── Types ───────────────────────────────────────
interface Artist {
  name: string;
  role: string;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  locationDetail: string;
  lat: number | null;
  lng: number | null;
  price: string;
  capacity: string;
  artists: Artist[];
}

const CATEGORIES = [
  "Music",
  "Tech",
  "Art",
  "Sport",
  "Food",
  "Business",
  "Fashion",
  "Other",
];

const EMPTY_FORM: FormData = {
  title: "",
  description: "",
  category: "",
  date: "",
  time: "",
  duration: "",
  location: "",
  locationDetail: "",
  lat: null,
  lng: null,
  price: "",
  capacity: "",
  artists: [],
};

// ── Input component ─────────────────────────────
function Field({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  icon?: React.ElementType;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon size={11} className="text-gray-600" strokeWidth={2.5} />}
        <label className="text-[10px] text-gray-600 uppercase tracking-widest font-black">
          {label}
        </label>
      </div>
      {children}
      {error && <p className="text-[10px] text-red-400 font-mono">{error}</p>}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#111118] border border-white/8 px-4 py-3 text-[13px] text-white placeholder-gray-700 focus:outline-none focus:border-primary transition-colors font-sans"
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-[#111118] border border-white/8 px-4 py-3 text-[13px] text-white placeholder-gray-700 focus:outline-none focus:border-primary transition-colors resize-none font-sans"
    />
  );
}

// ── Main Page ────────────────────────────────────
export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormData | "image", string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newArtist, setNewArtist] = useState({ name: "", role: "" });

  const set = (key: keyof FormData) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleLocationChange = (loc: LocationValue) => {
    setForm((prev) => ({
      ...prev,
      location: loc.name,
      locationDetail: loc.detail,
      lat: loc.lat,
      lng: loc.lng,
    }));
    setErrors((prev) => ({ ...prev, location: undefined }));
  };

  // ── Image picker ─────────────────────────────
  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  // ── Artist management ────────────────────────
  const addArtist = () => {
    if (!newArtist.name.trim()) return;
    setForm((prev) => ({
      ...prev,
      artists: [
        ...prev.artists,
        {
          name: newArtist.name.trim(),
          role: newArtist.role.trim() || "Artist",
        },
      ],
    }));
    setNewArtist({ name: "", role: "" });
  };

  const removeArtist = (i: number) =>
    setForm((prev) => ({
      ...prev,
      artists: prev.artists.filter((_, idx) => idx !== i),
    }));

  // ── Validation ───────────────────────────────
  const validate = () => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.category) e.category = "Pick a category";
    if (!form.date) e.date = "Date is required";
    if (!form.time) e.time = "Time is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.capacity || isNaN(Number(form.capacity)))
      e.capacity = "Valid capacity required";
    return e;
  };

  // ── Submit ───────────────────────────────────
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload image to Firebase Storage
      let imageUrl = "";
      let blurDataUrl = "";
      if (imageFile) {
        const storageRef = ref(
          storage,
          `events/${Date.now()}_${imageFile.name}`,
        );
        blurDataUrl = await getBlurDataUrl(imageFile);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // 2. Parse date to get day/month for EventCard display
      const dateObj = new Date(form.date);
      const day = dateObj.getDate().toString();
      const month = dateObj
        .toLocaleString("en", { month: "short" })
        .toUpperCase();

      // 3. Save event to Firestore
      const docRef = await addDoc(collection(db, "events"), {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        date: dateObj.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        day,
        month,
        time: form.time,
        duration: form.duration.trim(),
        location: form.location.trim(),
        locationDetail: form.locationDetail.trim(),
        lat: form.lat,
        lng: form.lng,
        price: form.price === "" || form.price === "0" ? 0 : Number(form.price),
        capacity: Number(form.capacity),
        attendees: 0,
        image: imageUrl,
        blurDataUrl,
        artists: form.artists,
        host: {
          name: user?.displayName ?? user?.email?.split("@")[0] ?? "Organizer",
          avatar: user?.photoURL ?? "",
          uid: user?.uid ?? "",
          events: 0,
          followers: "0",
        },
        createdAt: serverTimestamp(),
        createdBy: user?.uid ?? "",
      });

      console.log("Event created:", docRef.id);
      setSuccess(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#7c3aed", "#d946ef", "#ffffff", "#a78bfa"],
      });

      // Redirect to event page after 1.5s
      setTimeout(() => router.push(`/events/${docRef.id}`), 1500);
    } catch (err) {
      console.error(err);
      setErrors({ title: "Failed to create event. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ───────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#0c0c12] flex flex-col items-center justify-center gap-5 px-5">
        <div className="w-16 h-16 bg-primary/20 flex items-center justify-center">
          <CheckCircle size={32} className="text-primary" />
        </div>
        <h2 className="font-display font-black text-[24px] uppercase text-white tracking-wide text-center">
          Event Created!
        </h2>
        <p className="text-gray-500 text-[13px] text-center font-sans">
          Redirecting to your event page...
        </p>
        <Loader2 size={20} className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c12] text-white pb-32">
      {/* ── Header ── */}
      <div className="px-5 pt-12 pb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 bg-[#111118] border border-white/8 flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
        <div>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">
            Organizer
          </p>
          <h1 className="font-display font-black text-[22px] uppercase tracking-wide leading-tight">
            Create Event
          </h1>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-5">
        {/* ── Image Upload ── */}
        <Field label="Event Image" error={errors.image}>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative w-full h-[180px] bg-[#111118] border border-dashed border-white/15 overflow-hidden flex flex-col items-center justify-center gap-2 active:scale-[0.99] transition-transform hover:border-primary/50"
          >
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="preview"
                fill
                className="object-cover"
              />
            ) : (
              <>
                <div className="w-10 h-10 bg-primary/20 flex items-center justify-center">
                  <ImagePlus
                    size={18}
                    className="text-primary"
                    strokeWidth={2}
                  />
                </div>
                <p className="text-[11px] text-gray-600 uppercase tracking-widest font-black">
                  Tap to upload image
                </p>
                <p className="text-[10px] text-gray-700 font-mono">
                  JPG, PNG, WEBP
                </p>
              </>
            )}
            {imagePreview && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-[11px] text-white font-black uppercase tracking-widest">
                  Change Image
                </p>
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImagePick}
            className="hidden"
          />
        </Field>

        {/* Divider */}
        <div className="h-px bg-white/5" />

        {/* ── Basic Info ── */}
        <Field label="Event Title" error={errors.title}>
          <TextInput
            value={form.title}
            onChange={set("title")}
            placeholder="e.g. Neon Rave: Underground Night"
          />
        </Field>

        <Field label="Category" icon={Tag} error={errors.category}>
          <div className="grid grid-cols-4 gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  set("category")(cat);
                  setErrors((p) => ({ ...p, category: undefined }));
                }}
                className={`py-2 text-[10px] font-black uppercase tracking-wider border transition-all duration-150 active:scale-95 ${
                  form.category === cat
                    ? "bg-primary border-primary text-white"
                    : "bg-[#111118] border-white/8 text-gray-500 hover:border-white/20 hover:text-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Description" error={errors.description}>
          <TextArea
            value={form.description}
            onChange={set("description")}
            placeholder="Tell people what makes this event special..."
            rows={4}
          />
        </Field>

        {/* Divider */}
        <div className="h-px bg-white/5" />

        {/* ── Date & Time ── */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" icon={Calendar} error={errors.date}>
            <TextInput value={form.date} onChange={set("date")} type="date" />
          </Field>
          <Field label="Start Time" icon={Clock} error={errors.time}>
            <TextInput value={form.time} onChange={set("time")} type="time" />
          </Field>
        </div>

        <Field label="Duration (optional)" icon={Clock}>
          <TextInput
            value={form.duration}
            onChange={set("duration")}
            placeholder="e.g. 3 hrs, 2 days"
          />
        </Field>

        {/* Divider */}
        <div className="h-px bg-white/5" />

        {/* ── Location ── */}
        <Field label="Venue Location" icon={MapPin} error={errors.location}>
          <LocationPicker
            value={{ name: form.location, detail: form.locationDetail, lat: form.lat, lng: form.lng }}
            onChange={handleLocationChange}
            error={errors.location}
          />
        </Field>

        {/* Divider */}
        <div className="h-px bg-white/5" />

        {/* ── Tickets ── */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (k)" error={errors.price}>
            <TextInput
              value={form.price}
              onChange={set("price")}
              type="number"
              placeholder="0 for free"
            />
          </Field>
          <Field label="Capacity" icon={Users} error={errors.capacity}>
            <TextInput
              value={form.capacity}
              onChange={set("capacity")}
              type="number"
              placeholder="e.g. 500"
            />
          </Field>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5" />

        {/* ── Artists ── */}
        <Field label="Artists / Lineup (optional)">
          <div className="flex flex-col gap-2">
            {/* Added artists */}
            {form.artists.map((artist, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-[#111118] border border-white/8 px-3 py-2.5"
              >
                <div className="w-1.5 h-1.5 bg-primary flex-shrink-0" />
                <span className="font-display font-black text-[13px] uppercase tracking-wide flex-1">
                  {artist.name}
                </span>
                <span className="text-[10px] text-gray-600 uppercase tracking-wider">
                  {artist.role}
                </span>
                <button
                  onClick={() => removeArtist(i)}
                  className="w-6 h-6 flex items-center justify-center text-gray-700 hover:text-red-400 transition-colors"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>
            ))}

            {/* Add new artist */}
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={newArtist.name}
                  onChange={(e) =>
                    setNewArtist((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Artist name"
                  className="bg-[#111118] border border-white/8 px-3 py-2.5 text-[12px] text-white placeholder-gray-700 focus:outline-none focus:border-primary transition-colors font-sans"
                />
                <input
                  value={newArtist.role}
                  onChange={(e) =>
                    setNewArtist((p) => ({ ...p, role: e.target.value }))
                  }
                  placeholder="Role (e.g. DJ)"
                  className="bg-[#111118] border border-white/8 px-3 py-2.5 text-[12px] text-white placeholder-gray-700 focus:outline-none focus:border-primary transition-colors font-sans"
                />
              </div>
              <button
                onClick={addArtist}
                className="flex items-center justify-center gap-2 py-2.5 border border-dashed border-white/15 text-[11px] text-gray-600 uppercase tracking-widest font-black hover:border-primary/50 hover:text-primary transition-colors active:scale-[0.99]"
              >
                <Plus size={13} strokeWidth={2.5} />
                Add Artist
              </button>
            </div>
          </div>
        </Field>

        {/* Global error */}
        {errors.title && errors.title.includes("Failed") && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-[12px] font-mono">{errors.title}</p>
          </div>
        )}
      </div>

      {/* ── Sticky Submit ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-lg mx-auto px-5 pb-6 pt-4 bg-gradient-to-t from-[#0c0c12] via-[#0c0c12] to-transparent">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-[50px] bg-primary-light font-display font-black text-[15px] uppercase tracking-widest text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                Publish Event
                <ChevronRight size={18} strokeWidth={3} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
