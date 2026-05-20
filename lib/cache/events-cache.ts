import { EventCardProps } from "@/components/events/EventCard";

let memoryCache: EventCardProps[] | null = null;
let cacheTime = 0;

const TTL = 5 * 60 * 1000; // 5 minutes

export function getMemoryCache() {
  if (!memoryCache) return null;
  if (Date.now() - cacheTime > TTL) return null;
  return memoryCache;
}

export function setMemoryCache(data: EventCardProps[]) {
  memoryCache = data;
  cacheTime = Date.now();
}