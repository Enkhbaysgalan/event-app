"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Camera, ChevronRight, LogOut,
  Mail, MapPin, Pencil, Shield,
  UserX, X, Check, Loader2,
  Music, Cpu, Palette, Dumbbell,
  Utensils, Briefcase, Shirt, Flame,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import NotificationBell from "@/components/ui/NotificationBell";
import { useFollows } from "@/lib/follows-context";
import { auth, db, storage } from "@/lib/firebase";
import {
  updateProfile, updateEmail, signOut,
} from "firebase/auth";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ArrowLeft } from "lucide-react";

// ── Types ───────────────────────────────────────
type Screen = "profile" | "settings" | "blocked";

const ALL_INTERESTS = [
  { label: "Music", icon: Music },
  { label: "Tech", icon: Cpu },
  { label: "Art", icon: Palette },
  { label: "Sport", icon: Dumbbell },
  { label: "Food", icon: Utensils },
  { label: "Business", icon: Briefcase },
  { label: "Fashion", icon: Shirt },
  { label: "All", icon: Flame },
];

// ── Small reusable input ─────────────────────────
function SettingsInput({
  label, value, onChange, type = "text", placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] text-gray-600 uppercase tracking-widest font-black">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0c0c12] border border-white/8 px-4 py-3 text-[13px] text-white placeholder-gray-700 focus:outline-none focus:border-primary transition-colors font-sans"
      />
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const { followedHosts } = useFollows();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [screen, setScreen] = useState<Screen>("profile");
  const [attendedCount, setAttendedCount] = useState<number | null>(null);

  // Settings form state
  const [newName, setNewName] = useState(user?.displayName ?? "");
  const [newEmail, setNewEmail] = useState(user?.email ?? "");
  const [newLocation, setNewLocation] = useState("Ulaanbaatar, Mongolia");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Interests
  const [interests, setInterests] = useState<string[]>(["Music", "Tech"]);

  // ── Attended count (unique events) ───────────
  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "tickets"), where("userId", "==", user.uid))).then((snap) => {
      const uniqueEvents = new Set(snap.docs.map((d) => d.data().eventId));
      setAttendedCount(uniqueEvents.size);
    });
  }, [user]);

  // Avatar upload
  const [avatarUploading, setAvatarUploading] = useState(false);

  const toggleInterest = (label: string) => {
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  // ── Avatar upload ─────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;
    setAvatarUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      await updateProfile(auth.currentUser, { photoURL: url });
      await updateDoc(doc(db, "users", auth.currentUser.uid), { photoURL: url });
      await refreshUser();
    } catch (err) {
      console.error(err);
    } finally {
      setAvatarUploading(false);
    }
  };

  // ── Save settings ─────────────────────────────
  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    setSaveError("");
    try {
      if (newName !== user?.displayName) {
        await updateProfile(auth.currentUser, { displayName: newName });
        await updateDoc(doc(db, "users", auth.currentUser.uid), { displayName: newName });
      }
      if (newEmail !== user?.email) {
        await updateEmail(auth.currentUser, newEmail);
        await updateDoc(doc(db, "users", auth.currentUser.uid), { email: newEmail });
      }
      await refreshUser();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      setSaveError(err.message ?? "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Logout ────────────────────────────────────
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? "User";
  const avatarUrl = user?.photoURL ?? "";

  // ════════════════════════════════════════════════
  // SETTINGS SCREEN
  // ════════════════════════════════════════════════
  if (screen === "settings") {
    return (
      <div className="min-h-screen bg-[#0c0c12] text-white pb-28">
        {/* Header */}
        <div className="px-5 pt-12 pb-6 flex items-center gap-4 border-b border-white/5">
          <button
            onClick={() => setScreen("profile")}
            className="w-10 h-10 bg-[#111118] border border-white/8 flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div className="flex-1">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">Account</p>
            <h1 className="font-display font-black text-[20px] uppercase tracking-wide leading-tight">Settings</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary text-white text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : saveSuccess ? <Check size={13} /> : null}
            {saving ? "Saving..." : saveSuccess ? "Saved!" : "Save"}
          </button>
        </div>

        <div className="px-5 py-6 flex flex-col gap-6">

          {/* Error */}
          {saveError && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-[12px] font-mono">{saveError}</p>
            </div>
          )}

          {/* Profile info */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">Profile Info</p>
            <SettingsInput label="Display Name" value={newName} onChange={setNewName} placeholder="Your name" />
            <SettingsInput label="Location" value={newLocation} onChange={setNewLocation} placeholder="City, Country" />
          </div>

          <div className="h-px bg-white/5" />

          {/* Account */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">Account</p>
            <SettingsInput label="Email" value={newEmail} onChange={setNewEmail} type="email" placeholder="your@email.com" />
            <p className="text-[10px] text-gray-700 font-mono -mt-2">
              Changing email requires recent login. If it fails, sign out and back in first.
            </p>
          </div>

          <div className="h-px bg-white/5" />

          {/* Danger zone */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">Danger Zone</p>
            <button
              onClick={() => { setScreen("blocked"); }}
              className="flex items-center justify-between px-4 py-3.5 bg-[#111118] border border-white/8 active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-3">
                <UserX size={16} className="text-gray-500" strokeWidth={2} />
                <span className="text-[13px] text-white font-bold">Blocked Users</span>
              </div>
              <ChevronRight size={15} className="text-gray-700" />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-between px-4 py-3.5 bg-red-500/10 border border-red-500/20 active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-3">
                <LogOut size={16} className="text-red-400" strokeWidth={2} />
                <span className="text-[13px] text-red-400 font-bold">Log Out</span>
              </div>
              <ChevronRight size={15} className="text-red-400/50" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // BLOCKED USERS SCREEN
  // ════════════════════════════════════════════════
  if (screen === "blocked") {
    return (
      <div className="min-h-screen bg-[#0c0c12] text-white pb-28">
        <div className="px-5 pt-12 pb-6 flex items-center gap-4 border-b border-white/5">
          <button
            onClick={() => setScreen("settings")}
            className="w-10 h-10 bg-[#111118] border border-white/8 flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">Settings</p>
            <h1 className="font-display font-black text-[20px] uppercase tracking-wide leading-tight">Blocked Users</h1>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-24 gap-4 px-5">
          <div className="w-14 h-14 border border-dashed border-white/10 flex items-center justify-center">
            <Shield size={22} className="text-gray-700" strokeWidth={1.5} />
          </div>
          <p className="text-gray-600 text-[12px] font-mono uppercase tracking-widest text-center">
            No blocked users
          </p>
          <p className="text-gray-700 text-[11px] font-sans text-center leading-relaxed max-w-[220px]">
            Users you block won't be able to interact with you or see your events.
          </p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // MAIN PROFILE SCREEN
  // ════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#0c0c12] text-white pb-28">

      {/* ── Top bar ── */}
      <div className="px-5 pt-12 pb-4 flex items-start justify-between">
        <p className="text-[11px] text-gray-600 uppercase tracking-[0.2em] font-black">Profile</p>
        <NotificationBell />
      </div>

      {/* ── Avatar ── */}
      <div className="flex flex-col items-center pt-4 pb-6 px-5">
        <div className="relative mb-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/50 bg-[#1a1a26]">
            {avatarUploading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 size={24} className="text-primary animate-spin" />
              </div>
            ) : avatarUrl ? (
              <Image src={avatarUrl} alt={displayName} fill className="object-cover" sizes="96px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
            )}
          </div>
          {/* Camera button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary border-2 border-[#0c0c12] flex items-center justify-center active:scale-90 transition-transform"
          >
            <Camera size={13} strokeWidth={2.5} className="text-white" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </div>

        {/* Name + role */}
        <h2 className="font-display font-black text-[22px] uppercase tracking-wide text-white">
          {displayName}
        </h2>
        <div className="flex items-center gap-1.5 mt-1">
          <MapPin size={11} className="text-primary" strokeWidth={2.5} />
          <span className="text-[12px] text-gray-500">{newLocation}</span>
        </div>
        <div className="mt-2 px-3 py-2 bg-primary/20 border border-primary/30 flex items-center justify-center">
          <span className="text-[10px] text-primary font-black uppercase tracking-widest">
            {user?.role ?? "attendee"}
          </span>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Attended", value: attendedCount },
            { label: "Following", value: followedHosts.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#111118] border border-white/8 p-1 flex flex-col items-center justify-center gap-1">
              {value === null ? (
                <Loader2 size={18} className="text-primary animate-spin" />
              ) : (
                <span className="font-display font-black text-[24px] text-white leading-none">{value}</span>
              )}
              <span className="text-[9px] text-gray-600 uppercase tracking-widest font-black">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/5 mx-5 mb-6" />

      {/* ── Interests ── */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">Interests</p>
          <span className="text-[10px] text-gray-700 font-mono">{interests.length} selected</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_INTERESTS.map(({ label, icon: Icon }) => {
            const active = interests.includes(label);
            return (
              <button
                key={label}
                onClick={() => toggleInterest(label)}
                className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-black uppercase tracking-wider border transition-all duration-150 active:scale-95 ${
                  active
                    ? "bg-primary border-primary text-white"
                    : "bg-[#111118] border-white/8 text-gray-500 hover:border-white/20 hover:text-gray-300"
                }`}
              >
                <Icon size={11} strokeWidth={2.5} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-white/5 mx-5 mb-6" />

      {/* ── Menu ── */}
      <div className="px-5 flex flex-col gap-2">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black mb-1">Account</p>

        <button
          onClick={() => setScreen("settings")}
          className="flex items-center justify-between px-4 py-3.5 bg-[#111118] border border-white/8 active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3">
            <Pencil size={15} className="text-gray-500" strokeWidth={2} />
            <span className="text-[13px] text-white font-bold">Edit Profile & Settings</span>
          </div>
          <ChevronRight size={15} className="text-gray-700" />
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center justify-between px-4 py-3.5 bg-red-500/10 border border-red-500/20 active:scale-[0.99] transition-transform mt-2"
        >
          <div className="flex items-center gap-3">
            <LogOut size={15} className="text-red-400" strokeWidth={2} />
            <span className="text-[13px] text-red-400 font-bold">Log Out</span>
          </div>
          <ChevronRight size={15} className="text-red-400/50" />
        </button>

        {/* Email display */}
        <div className="flex items-center gap-2 px-4 py-3 mt-2">
          <Mail size={13} className="text-gray-700" strokeWidth={2} />
          <span className="text-[11px] text-gray-700 font-mono truncate">{user?.email}</span>
        </div>
      </div>
    </div>
  );
}