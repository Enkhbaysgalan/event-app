"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  CalendarDays,
  Compass,
  PlusCircle,
  Ticket,
  LayoutDashboard,
  User,
} from "lucide-react";
import LikeIcon from "@/components/icons/recHeart";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: ("organizer" | "attendee")[];
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/explore",
    label: "Explore",
    icon: Compass,
    roles: ["attendee", "organizer"],
  },
  {
    href: "/my-tickets",
    label: "My Tickets",
    icon: Ticket,
    roles: ["attendee", "organizer"], // remove organizer
  },
  {
    href: "/my-events",
    label: "My Events",
    icon: LayoutDashboard,
    roles: ["organizer"],
  },
  {
    href: "/events/create",
    label: "Create",
    icon: PlusCircle,
    roles: ["organizer"],
  },
  {
    href: "/favourites",
    label: "Favourites",
    icon: LikeIcon,
    roles: ["attendee", "organizer"], //remove organzizer
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    roles: ["attendee", "organizer"],
  },
];

export default function BottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <>
      {/* Spacer so content doesn't hide behind nav */}
      <div className="h-20" />

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] safe-area-pb">
        <ul className="flex items-stretch justify-around h-16 px-1">
          {visibleItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className={`flex flex-col items-center justify-center gap-0.5 h-full w-full rounded-xl transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "text-primary-dark"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <span className="relative">
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.2 : 1.8}
                      className="transition-transform duration-200"
                    />
                  </span>
                  <span
                    className={`text-[10px] font-medium tracking-wide transition-all ${
                      isActive ? "opacity-100" : "opacity-70"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
