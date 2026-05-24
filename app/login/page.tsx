"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useAuth } from "@/lib/auth-context";

type Mode = "login" | "register";
type Role = "attendee" | "organizer";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<Role>("attendee");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const friendlyError = (code: string) => {
    switch (code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Invalid email or password.";
      case "auth/email-already-in-use":
        return "This email is already registered.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/popup-closed-by-user":
        return "Google sign-in was cancelled.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        // Login — role is already stored in Firestore from registration,
        // we do NOT overwrite it here.
        await loginWithEmail(email, password);
      } else {
        // Register — pass role + displayName so auth-context writes them correctly
        await registerWithEmail(email, password, role, name);
      }
      router.push("/explore");
    } catch (e: any) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      // Pass role for new Google sign-ups; existing users keep their stored role
      await loginWithGoogle(role);
      router.push("/explore");
    } catch (e: any) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] flex flex-col items-center justify-center px-5 py-10">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 mb-3 shadow-lg shadow-violet-500/30">
          <span className="text-2xl">🎪</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Eventify
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-[#1a1a24] rounded-3xl p-6 shadow-2xl border border-white/5">
        {/* Mode toggle */}
        <div className="flex bg-[#0f0f13] rounded-2xl p-1 mb-6">
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError("");
              }}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                mode === m
                  ? "bg-violet-600 text-white shadow-md shadow-violet-500/30"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {m === "login" ? "Log In" : "Register"}
            </button>
          ))}
        </div>

        {/* Role selector — register only */}
        {mode === "register" && (
          <div className="mb-5">
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">
              I am a
            </p>
            <div className="flex gap-3">
              {(["attendee", "organizer"] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-3 rounded-2xl text-sm font-semibold border transition-all duration-200 ${
                    role === r
                      ? "bg-violet-600/20 border-violet-500 text-violet-300"
                      : "border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300"
                  }`}
                >
                  {r === "attendee" ? "🎟 Attendee" : "🎙 Organizer"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fields */}
        <div className="flex flex-col gap-3">
          {mode === "register" && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0f0f13] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#0f0f13] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#0f0f13] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-5 w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/30 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Log In"
              : "Create Account"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-xs text-gray-600">or</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full py-3.5 bg-white text-gray-800 font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all duration-200 disabled:opacity-50 text-sm shadow-md"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          Continue with Google
        </button>
      </div>

      <p className="text-xs text-gray-700 mt-6">
        By continuing you agree to our Terms &amp; Privacy Policy
      </p>
    </div>
  );
} 