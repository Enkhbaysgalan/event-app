"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, CheckCheck } from "lucide-react";
import { useNotifications } from "@/lib/notifications-context";
import NotificationCard from "@/components/notifications/NotificationCard";
import type { AppNotification } from "@/lib/notifications-context";

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const handleCardClick = async (notif: AppNotification) => {
    if (!notif.read) await markAsRead(notif.id);
    if (notif.type === "new_event" && notif.eventId) {
      router.push(`/events/${notif.eventId}`);
    } else if (notif.ticketId) {
      router.push(`/my-tickets/${notif.ticketId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c12] text-white pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 border border-white/8 flex items-center justify-center active:scale-90 transition-transform"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="font-display font-black text-[16px] uppercase tracking-widest leading-none">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-[9px] text-primary uppercase tracking-widest font-black mt-0.5">
                {unreadCount} unread
              </p>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 text-[10px] text-primary font-black uppercase tracking-widest active:opacity-60 transition-opacity"
          >
            <CheckCheck size={14} strokeWidth={2.5} />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 px-5">
          <div className="w-14 h-14 border border-dashed border-white/10 flex items-center justify-center">
            <Bell size={22} className="text-gray-700" strokeWidth={1.5} />
          </div>
          <p className="text-[11px] text-gray-600 uppercase tracking-widest font-black">
            No notifications yet
          </p>
          <p className="text-[10px] text-gray-700 text-center leading-relaxed max-w-[200px]">
            We'll let you know when something happens
          </p>
        </div>
      ) : (
        <div>
          {notifications.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onClick={() => handleCardClick(n)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
