import {
  collection,
  addDoc,
  serverTimestamp,
  writeBatch,
  getDocs,
  query,
  where,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";

export type NotifType = "ticket_purchased" | "ticket_received" | "new_event";

interface NotifPayload {
  userId: string;
  type: NotifType;
  title: string;
  body: string;
  image?: string;
  eventId?: string;
  ticketId?: string;
}

export async function createNotification(payload: NotifPayload) {
  await addDoc(collection(db, "notifications"), {
    ...payload,
    read: false,
    createdAt: serverTimestamp(),
  });
}

// Fan-out a new_event notification to all followers of hostUid
export async function notifyFollowers(
  hostUid: string,
  data: { title: string; body: string; image?: string; eventId: string },
) {
  const snap = await getDocs(
    query(collection(db, "follows"), where("hostUid", "==", hostUid)),
  );
  if (snap.empty) return;

  const batch = writeBatch(db);
  snap.docs.forEach((followDoc) => {
    const ref = doc(collection(db, "notifications"));
    batch.set(ref, {
      userId: followDoc.data().followerId,
      type: "new_event",
      ...data,
      read: false,
      createdAt: serverTimestamp(),
    });
  });
  await batch.commit();
}
