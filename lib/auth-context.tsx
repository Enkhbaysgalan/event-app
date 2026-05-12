"use client";

import {
  createContext,
  useContext,
  useEffect,
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
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

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
    displayName: string
  ) => Promise<void>;
  loginWithGoogle: (role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const googleProvider = new GoogleAuthProvider();

// Fetch or create user profile in Firestore
async function getOrCreateUserProfile(
  firebaseUser: User,
  role?: UserRole,
  displayName?: string
): Promise<AppUser> {
  const userRef = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      role: data.role as UserRole,
    };
  }

  // New user — create profile
  const newUser: AppUser = {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: displayName ?? firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    role: role ?? "attendee",
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const appUser = await getOrCreateUserProfile(firebaseUser);
        setUser(appUser);
      } else {
        setUser(null);
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
    displayName: string
  ) => {
    setLoading(true);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const appUser = await getOrCreateUserProfile(cred.user, role, displayName);
    setUser(appUser);
    setLoading(false);
  };

  const loginWithGoogle = async (role: UserRole = "attendee") => {
    setLoading(true);
    const cred = await signInWithPopup(auth, googleProvider);
    const appUser = await getOrCreateUserProfile(cred.user, role);
    setUser(appUser);
    setLoading(false);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
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
