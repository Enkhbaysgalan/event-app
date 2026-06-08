"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import {
  getUserCache,
  saveUserCache,
  clearUserCache,
} from "./cache/auth-cache";

export type UserRole = "organizer" | "attendee";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    password: string,
    role: UserRole,
    displayName: string,
  ) => Promise<void>;
  loginWithGoogle: (role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const googleProvider = new GoogleAuthProvider();

// Fetch or create user profile in Firestore
async function getOrCreateUserProfile(
  firebaseUser: User,
  role?: UserRole,
  displayName?: string,
): Promise<AppUser> {
  const userRef = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      // Prefer live firebase value if available, fall back to Firestore
      displayName: firebaseUser.displayName ?? data.displayName ?? displayName ?? null,
      photoURL: firebaseUser.photoURL ?? data.photoURL ?? null,
      role: data.role as UserRole,
    };
  }

  // New user — create profile
  const resolvedDisplayName = displayName ?? firebaseUser.displayName ?? null;
  const resolvedRole = role ?? "attendee";

  const newUser: AppUser = {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: resolvedDisplayName,
    photoURL: firebaseUser.photoURL,
    role: resolvedRole,
  };

  await setDoc(userRef, {
    ...newUser,
    createdAt: serverTimestamp(),
  });

  return newUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Carries role + displayName from registerWithEmail / loginWithGoogle
   * into the onAuthStateChanged listener so the listener can forward them
   * to getOrCreateUserProfile on the very first fire after registration.
   * Consumed once and immediately reset to null.
   */
  const pendingProfile = useRef<{
    role: UserRole;
    displayName?: string;
  } | null>(null);

  useEffect(() => {
    // 1. Restore cached user immediately (avoids loading flash)
    const cached = getUserCache();
    if (cached) {
      setUser(cached);
    }

    // 2. Firebase auth listener — single source of truth
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Consume the pending registration intent (if any)
        const pending = pendingProfile.current;
        pendingProfile.current = null;

        const appUser = await getOrCreateUserProfile(
          firebaseUser,
          pending?.role,
          pending?.displayName,
        );

        setUser(appUser);
        saveUserCache(appUser);
      } else {
        setUser(null);
        clearUserCache();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged handles state update
  };

  const registerWithEmail = async (
    email: string,
    password: string,
    role: UserRole,
    displayName: string,
  ) => {
    setLoading(true);

    // Set BEFORE triggering auth so the listener can pick it up
    pendingProfile.current = { role, displayName };

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Update Firebase Auth profile — listener may fire before this resolves,
    // which is fine because pendingProfile carries displayName as a fallback.
    await updateProfile(cred.user, { displayName });

    // onAuthStateChanged handles setUser / saveUserCache / setLoading
  };

  const loginWithGoogle = async (role: UserRole = "attendee") => {
    setLoading(true);
    pendingProfile.current = { role };
    await signInWithPopup(auth, googleProvider);
    // onAuthStateChanged handles the rest
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    clearUserCache();
  };

  const refreshUser = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;
    const appUser = await getOrCreateUserProfile(firebaseUser);
    setUser(appUser);
    saveUserCache(appUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}