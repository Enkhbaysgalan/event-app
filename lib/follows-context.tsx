"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  collection, query, where, onSnapshot,
  doc, setDoc, deleteDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export interface FollowedHostData {
  hostUid: string;
  hostName: string;
  hostAvatar: string;
}

interface FollowsContextType {
  isFollowing: (hostUid: string) => boolean;
  toggleFollow: (data: FollowedHostData) => Promise<void>;
  followedHosts: FollowedHostData[];
  loading: boolean;
}

const FollowsContext = createContext<FollowsContextType>({
  isFollowing: () => false,
  toggleFollow: async () => {},
  followedHosts: [],
  loading: true,
});

export function FollowsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [followedHosts, setFollowedHosts] = useState<FollowedHostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFollowedHosts([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, "follows"), where("followerId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setFollowedHosts(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            hostUid: data.hostUid,
            hostName: data.hostName,
            hostAvatar: data.hostAvatar,
          };
        }),
      );
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const isFollowing = useCallback(
    (hostUid: string) => followedHosts.some((h) => h.hostUid === hostUid),
    [followedHosts],
  );

  const toggleFollow = useCallback(
    async (data: FollowedHostData) => {
      if (!user) return;
      const docRef = doc(db, "follows", `${user.uid}_${data.hostUid}`);
      if (isFollowing(data.hostUid)) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {
          followerId: user.uid,
          ...data,
          followedAt: serverTimestamp(),
        });
      }
    },
    [user, isFollowing],
  );

  return (
    <FollowsContext.Provider value={{ isFollowing, toggleFollow, followedHosts, loading }}>
      {children}
    </FollowsContext.Provider>
  );
}

export const useFollows = () => useContext(FollowsContext);
