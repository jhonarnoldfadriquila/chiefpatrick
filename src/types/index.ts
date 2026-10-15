// Domain types. The static data in src/lib/data follows these shapes so it can later be
// swapped for database rows without UI changes.

export type PackageTier = "silver" | "gold" | "platinum";

export interface CateringPackage {
  id: string;
  tier: PackageTier;
  name: string;
  guests: number;
  price: number;
  /** One sentence: who the package is for. */
  forWho: string;
  inclusions: string[];
  sampleMenu: string[];
  popular: boolean;
}

export interface EventOffering {
  id: string;
  title: string;
  description: string;
  eventType: EventType;
  photo: "wedding" | "debut" | "kidsParty" | "longTable";
}

export const EVENT_TYPES = [
  { value: "wedding", label: "Wedding" },
  { value: "debut", label: "Debut" },
  { value: "birthday", label: "Birthday" },
  { value: "corporate", label: "Corporate event" },
  { value: "family", label: "Family gathering" },
  { value: "catering", label: "Catering package" },
  { value: "dining", label: "Restaurant dining" },
  { value: "other", label: "Other" },
] as const;

export type EventType = (typeof EVENT_TYPES)[number]["value"];

export interface ReservationInput {
  name: string;
  email: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  guests: number;
  eventType: EventType;
  message?: string;
}

// ---------- public-site shapes returned by src/lib/content.ts ----------

export interface PublicPhoto {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
}

export interface PublicVenue {
  name: string;
  address?: string;
  min: number;
  max: number;
}

export interface PublicVenues {
  ownHalls: PublicVenue[];
  partners: { area: string; venues: PublicVenue[] }[];
}

export interface PublicTestimonial {
  id: string;
  quote: string;
  author: string;
  event: string;
  isSample: boolean;
}
