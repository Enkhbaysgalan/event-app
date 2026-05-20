import { AppUser } from "../auth-context";

const KEY = "app_user_cache";

export function saveUserCache(user: AppUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function getUserCache(): AppUser | null {
  if (typeof window === "undefined") return null;

  const data = localStorage.getItem(KEY);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function clearUserCache() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}