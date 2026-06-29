"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  CheckCircle,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  Plus,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import type { LocationValue } from "@/components/ui/LocationPicker";
import { getBlurDataUrl } from "@/lib/blur";

const LocationPicker = dynamic(() => import("@/components/ui/LocationPicker"), { ssr: false });

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

const CATEGORIES = ["Music", "Tech", "Art", "Sport", "Food", "Business", "Fashion", "Other"];

function Field({ label, icon: Icon, error, children }: {
  label: string;
  icon?: React.ElementType;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon size={11} className="text-gray-600" strokeWidth={2.5} />}
        <label className="text-[10px] text-gray-600 uppercase tracking-widest font-black">{label}</label>
      </div>
      {children}
      {error && <p className="text-[10px] text-red-400 font-mono">{error}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }: {
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

function TextArea({ value, onChange, placeholder, rows = 4 }: {
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

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    title: "", description: "", category: "", date: "", time: "",
    duration: "", location: "", locationDetail: "", lat: null, lng: null,
    price: "", capacity: "", artists: [],
  });
  const [existingImage, setExistingImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);
  const [newArtist, setNewArtist] = useState({ name: "", role: "" });

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "events", id));
        if (!snap.exists()) { setNotAllowed(true); return; }
        const d = snap.data();
        if (d.host?.uid !== user?.uid) { setNotAllowed(true); return; }

        // Parse stored date string back to yyyy-mm-dd for input[type=date]
        const rawDate = d.date ?? "";
        let inputDate = "";
        try {
          const parsed = new Date(rawDate);
          if (!isNaN(parsed.getTime())) {
            inputDate = parsed.toISOString().split("T")[0];
          }
        } catch { /* keep empty */ }

        setExistingImage(d.image ?? "");
        setForm({
          title: d.title ?? "",
          description: d.description ?? "",
          category: d.category ?? "",
          date: inputDate,
          time: d.time ?? "",
          duration: d.duration ?? "",
          location: d.location ?? "",
          locationDetail: d.locationDetail ?? "",
          lat: d.lat ?? null,
          lng: d.lng ?? null,
          price: d.price === 0 ? "" : String(d.price ?? ""),
          capacity: String(d.capacity ?? ""),
          artists: Array.isArray(d.artists) ? d.artists : [],
        });
      } catch {
        setNotAllowed(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, user]);

  const set = (key: keyof FormData) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleLocationChange = (loc: LocationValue) => {
    setForm((prev) => ({ ...prev, location: loc.name, locationDetail: loc.detail, lat: loc.lat, lng: loc.lng }));
    setErrors((prev) => ({ ...prev, location: undefined }));
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addArtist = () => {
    if (!newArtist.name.trim()) return;
    setForm((prev) => ({
      ...prev,
      artists: [...prev.artists, { name: newArtist.name.trim(), role: newArtist.role.trim() || "Artist" }],
    }));
    setNewArtist({ name: "", role: "" });
  };

  const removeArtist = (i: number) =>
    setForm((prev) => ({ ...prev, artists: prev.artists.filter((_, idx) => idx !== i) }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.category) e.category = "Pick a category";
    if (!form.date) e.date = "Date is required";
    if (!form.time) e.time = "Time is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.capacity || isNaN(Number(form.capacity))) e.capacity = "Valid capacity required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); window.scrollTo({ top: 0, behavior: "smooth" }); return; }

    setSubmitting(true);
    try {
      let imageUrl = existingImage;
      let blurDataUrl: string | undefined;

      if (imageFile) {
        blurDataUrl = await getBlurDataUrl(imageFile);
        const storageRef = ref(storage, `events/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const dateObj = new Date(form.date);
      const day = dateObj.getDate().toString();
      const month = dateObj.toLocaleString("en", { month: "short" }).toUpperCase();

      const updatePayload: Record<string, unknown> = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        date: dateObj.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
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
        artists: form.artists,
        image: imageUrl,
      };
      if (blurDataUrl) updatePayload.blurDataUrl = blurDataUrl;

      await updateDoc(doc(db, "events", id), updatePayload);
      setSuccess(true);
      setTimeout(() => router.push(`/events/${id}`), 1200);
    } catch (err) {
      console.error(err);
      setErrors({ title: "Failed to update event. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c12] flex items-center justify-center">
        <Loader2 size={28} className="text-primary animate-spin" />
      </div>
    );
  }

  if (notAllowed) {
    return (
      <div className="min-h-screen bg-[#0c0c12] flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-gray-500 text-sm uppercase tracking-widest">Not allowed</p>
        <button onClick={() => router.back()} className="text-primary text-sm">Go back</button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0c0c12] flex flex-col items-center justify-center gap-5 px-5">
        <div className="w-16 h-16 bg-primary/20 flex items-center justify-center">
          <CheckCircle size={32} className="text-primary" />
        </div>
        <h2 className="font-display font-black text-[24px] uppercase text-white tracking-wide text-center">
          Event Updated!
        </h2>
        <Loader2 size={20} className="text-primary animate-spin" />
      </div>
    );
  }

  const displayImage = imagePreview ?? (existingImage || null);

  return (
    <div className="min-h-screen bg-[#0c0c12] text-white pb-32">
      {/* Header */}
      <div className="px-5 pt-12 pb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 bg-[#111118] border border-white/8 flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
        <div>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">Organizer</p>
          <h1 className="font-display font-black text-[22px] uppercase tracking-wide leading-tight">Edit Event</h1>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-5">
        {/* Image */}
        <Field label="Event Image">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative w-full h-[180px] bg-[#111118] border border-dashed border-white/15 overflow-hidden flex flex-col items-center justify-center gap-2 active:scale-[0.99] transition-transform hover:border-primary/50"
          >
            {displayImage ? (
              <Image src={displayImage} alt="preview" fill className="object-cover" />
            ) : (
              <>
                <div className="w-10 h-10 bg-primary/20 flex items-center justify-center">
                  <ImagePlus size={18} className="text-primary" strokeWidth={2} />
                </div>
                <p className="text-[11px] text-gray-600 uppercase tracking-widest font-black">Tap to change image</p>
              </>
            )}
            {displayImage && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-[11px] text-white font-black uppercase tracking-widest">Change Image</p>
              </div>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
        </Field>

        <div className="h-px bg-white/5" />

        <Field label="Event Title" error={errors.title}>
          <TextInput value={form.title} onChange={set("title")} placeholder="e.g. Neon Rave: Underground Night" />
        </Field>

        <Field label="Category" icon={Tag} error={errors.category}>
          <div className="grid grid-cols-4 gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { set("category")(cat); setErrors((p) => ({ ...p, category: undefined })); }}
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
          <TextArea value={form.description} onChange={set("description")} placeholder="Tell people what makes this event special..." rows={4} />
        </Field>

        <div className="h-px bg-white/5" />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" icon={Calendar} error={errors.date}>
            <TextInput value={form.date} onChange={set("date")} type="date" />
          </Field>
          <Field label="Start Time" icon={Clock} error={errors.time}>
            <TextInput value={form.time} onChange={set("time")} type="time" />
          </Field>
        </div>

        <Field label="Duration (optional)" icon={Clock}>
          <TextInput value={form.duration} onChange={set("duration")} placeholder="e.g. 3 hrs, 2 days" />
        </Field>

        <div className="h-px bg-white/5" />

        <Field label="Venue Location" icon={MapPin} error={errors.location}>
          <LocationPicker
            value={{ name: form.location, detail: form.locationDetail, lat: form.lat, lng: form.lng }}
            onChange={handleLocationChange}
            error={errors.location}
          />
        </Field>

        <div className="h-px bg-white/5" />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (k)" error={errors.price}>
            <TextInput value={form.price} onChange={set("price")} type="number" placeholder="0 for free" />
          </Field>
          <Field label="Capacity" icon={Users} error={errors.capacity}>
            <TextInput value={form.capacity} onChange={set("capacity")} type="number" placeholder="e.g. 500" />
          </Field>
        </div>

        <div className="h-px bg-white/5" />

        <Field label="Artists / Lineup (optional)">
          <div className="flex flex-col gap-2">
            {form.artists.map((artist, i) => (
              <div key={i} className="flex items-center gap-2 bg-[#111118] border border-white/8 px-3 py-2.5">
                <div className="w-1.5 h-1.5 bg-primary flex-shrink-0" />
                <span className="font-display font-black text-[13px] uppercase tracking-wide flex-1">{artist.name}</span>
                <span className="text-[10px] text-gray-600 uppercase tracking-wider">{artist.role}</span>
                <button onClick={() => removeArtist(i)} className="w-6 h-6 flex items-center justify-center text-gray-700 hover:text-red-400 transition-colors">
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>
            ))}
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={newArtist.name}
                  onChange={(e) => setNewArtist((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Artist name"
                  className="bg-[#111118] border border-white/8 px-3 py-2.5 text-[12px] text-white placeholder-gray-700 focus:outline-none focus:border-primary transition-colors font-sans"
                />
                <input
                  value={newArtist.role}
                  onChange={(e) => setNewArtist((p) => ({ ...p, role: e.target.value }))}
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

        {errors.title?.includes("Failed") && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-[12px] font-mono">{errors.title}</p>
          </div>
        )}
      </div>

      {/* Sticky submit */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-lg mx-auto px-5 pb-6 pt-4 bg-gradient-to-t from-[#0c0c12] via-[#0c0c12] to-transparent">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-[50px] bg-secondary font-display font-black text-[15px] uppercase tracking-widest text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <><Loader2 size={18} className="animate-spin" />Saving...</>
            ) : (
              <>Save Changes<ChevronRight size={18} strokeWidth={3} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
