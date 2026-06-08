import { Ticket, CalendarPlus, Gift } from "lucide-react";
import type { AppNotification } from "@/lib/notifications-context";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface Props {
  notification: AppNotification;
  onClick: () => void;
}

export default function NotificationCard({ notification, onClick }: Props) {
  const { type, title, body, read, createdAt } = notification;

  const Icon =
    type === "ticket_purchased"
      ? Ticket
      : type === "ticket_received"
        ? Gift
        : CalendarPlus;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-5 py-4 border-b border-white/5 text-left active:bg-white/5 transition-colors ${
        read ? "opacity-50" : ""
      }`}
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 flex-shrink-0 flex items-center justify-center border ${
          read
            ? "border-white/8 text-gray-600"
            : "border-primary/40 text-primary bg-primary/10"
        }`}
      >
        <Icon size={16} strokeWidth={2.5} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-[12px] font-black uppercase tracking-wide leading-snug font-display ${
            read ? "text-gray-400" : "text-white"
          }`}
        >
          {title}
        </p>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2 font-sans">
          {body}
        </p>
        <p className="text-[9px] text-gray-700 uppercase tracking-widest font-black mt-1.5">
          {timeAgo(createdAt)}
        </p>
      </div>

      {/* Unread dot */}
      {!read && <div className="w-2 h-2 bg-primary flex-shrink-0 mt-1.5" />}
    </button>
  );
}
