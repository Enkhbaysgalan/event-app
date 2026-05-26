"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  collection, query, where, onSnapshot,
  doc, setDoc, deleteDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export interface LikedEventData {
  eventId: string;
  title: string;
  image: string;
  date: string;      // day number e.g. "24"
  month: string;     // abbreviated  e.g. "JUN"
  hostName: string;
  hostAvatar: string;
  attendees: number;
  price: number | "Free";
  category: string;
  location: string;
}

interface LikesContextType {
  isLiked: (eventId: string) => boolean;
  toggleLike: (data: LikedEventData) => Promise<void>;
  likedEvents: LikedEventData[];
  loading: boolean;
}

const LikesContext = createContext<LikesContextType>({
  isLiked: () => false,
  toggleLike: async () => {},
  likedEvents: [],
  loading: true,
});

export function LikesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [likedEvents, setLikedEvents] = useState<LikedEventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLikedEvents([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, "likes"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setLikedEvents(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            eventId: data.eventId,
            title: data.title,
            image: data.image,
            date: data.date,
            month: data.month,
            hostName: data.hostName,
            hostAvatar: data.hostAvatar,
            attendees: data.attendees,
            price: data.price,
            category: data.category,
            location: data.location,
          };
        }),
      );
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const isLiked = useCallback(
    (eventId: string) => likedEvents.some((e) => e.eventId === eventId),
    [likedEvents],
  );

  const toggleLike = useCallback(
    async (data: LikedEventData) => {
      if (!user) return;
      const docRef = doc(db, "likes", `${user.uid}_${data.eventId}`);
      if (isLiked(data.eventId)) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { userId: user.uid, ...data, likedAt: serverTimestamp() });
      }
    },
    [user, isLiked],
  );

  return (
    <LikesContext.Provider value={{ isLiked, toggleLike, likedEvents, loading }}>
      {children}
    </LikesContext.Provider>
  );
}

export const useLikes = () => useContext(LikesContext);
