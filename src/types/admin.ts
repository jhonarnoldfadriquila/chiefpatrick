// Record shapes shared by the API (server) and the admin screens (client). No server imports here.

export type ReservationStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type EventStatus = ReservationStatus;
export type InquiryStatus = "new" | "in_progress" | "resolved";
export type Role = "admin" | "staff";

export const RESERVATION_STATUSES: ReservationStatus[] = ["pending", "confirmed", "completed", "cancelled"];
export const EVENT_STATUSES: EventStatus[] = RESERVATION_STATUSES;
export const INQUIRY_STATUSES: InquiryStatus[] = ["new", "in_progress", "resolved"];

export interface MenuCategory {
  id: number;
  slug: string;
  name: string;
  position: number;
  itemCount?: number;
}

export interface MenuItemRecord {
  id: number;
  categoryId: number;
  categoryName?: string;
  name: string;
  note: string | null;
  price: number | null;
  image: string | null;
  sold: number;
  isAvailable: boolean;
  position: number;
  createdAt: string;
}

export interface PackageRecord {
  id: number;
  name: string;
  tier: string;
  guests: number;
  price: number;
  forWho: string;
  inclusions: string[];
  sampleMenu: string[];
  popular: boolean;
  position: number;
}

export interface ReservationRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  eventType: string;
  message: string | null;
  status: ReservationStatus;
  notes: string | null;
  isDemo: boolean;
  createdAt: string;
}

export interface EventRecord {
  id: number;
  name: string;
  eventType: string;
  date: string;
  time: string | null;
  location: string;
  guests: number;
  amount: number;
  status: EventStatus;
  notes: string | null;
  reservationId: number | null;
  isDemo: boolean;
  createdAt: string;
}

export interface InquiryRecord {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: InquiryStatus;
  adminNote: string | null;
  isDemo: boolean;
  createdAt: string;
}

export interface GalleryRecord {
  id: number;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string | null;
  position: number;
  createdAt: string;
}

export interface VenueRecord {
  id: number;
  areaId: number | null;
  name: string;
  address: string | null;
  min: number;
  max: number;
  position: number;
}

export interface VenueAreaRecord {
  id: number;
  name: string;
  position: number;
  venues: VenueRecord[];
}

export interface TestimonialRecord {
  id: number;
  quote: string;
  author: string;
  event: string;
  published: boolean;
  isSample: boolean;
  createdAt: string;
}

export interface Branch {
  id: string;
  name: string;
  role: string;
  address: string;
  mapHref: string;
  phones: string[];
  since: string;
}

export interface SiteSettings {
  restaurant: { name: string; tagline: string; description: string; founded: number };
  contact: { hours: string; primaryPhone: string; email: string; branches: Branch[] };
  social: { facebook: string; instagram: string; tiktok: string; youtube: string };
  seo: { title: string; description: string; keywords: string };
  appearance: { accentColor: string; showPreloader: boolean; showGrain: boolean };
  kiddie: { price: number; minimum: number };
}

export type SettingsKey = keyof SiteSettings;

export interface StatCard {
  key: "menu" | "reservations" | "packages" | "events" | "inquiries";
  label: string;
  value: number;
  change: number | null; // percent vs the previous period of the same length
}

export interface RevenuePoint {
  label: string;
  date: string;
  revenue: number;
}

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
  meta?: { total?: number; page?: number; pageSize?: number } & Record<string, unknown>;
}
export interface ApiFailure {
  ok: false;
  error: string;
  fields?: Record<string, string>;
}
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
