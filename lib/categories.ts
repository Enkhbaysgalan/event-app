export const CATEGORIES = [
  "Music",
  "Movie Night",
  "Art",
  "Business",
  "Fashion",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
