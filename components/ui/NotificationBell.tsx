"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notifications-context";
export default function NotificationBell() {
  const router = useRouter();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={() => { router.push(user ? "/notifications" : "/login"); }}
      className="relative min-w-11 min-h-11 bg-[#1a1a26] border border-white/8 flex items-center justify-center active:scale-90 transition-transform"
    >
      {!user ? (
        <span className="px-5 text-[14px] font-black font-display text-white uppercase tracking-wide">
          Login
        </span>
      ) : (
        <>
          <Bell size={18} className="text-gray-300" strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-light text-[9px] font-black text-black flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </>
      )}
    </button>
  );
}
