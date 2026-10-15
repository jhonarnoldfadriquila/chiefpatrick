// Validation rules for every admin form, shared by POST (all fields) and PATCH (partial) handlers.
import { v } from "@/lib/server/validate";
import { EVENT_TYPES } from "@/types";
import { EVENT_STATUSES, INQUIRY_STATUSES, RESERVATION_STATUSES } from "@/types/admin";

const EVENT_TYPE_VALUES = EVENT_TYPES.map((t) => t.value);

export const menuItemShape = {
  categoryId: v.int({ min: 1 }),
  name: v.string({ max: 160 }),
  note: v.string({ max: 40, optional: true }),
  price: v.money({ optional: true }),
  image: v.string({ max: 255, optional: true }),
  sold: v.int({ min: 0, optional: true }),
  isAvailable: v.bool(),
};

export const packageShape = {
  name: v.string({ max: 60 }),
  tier: v.string({ max: 20, optional: true }),
  guests: v.int({ min: 1, max: 5000 }),
  price: v.money(),
  forWho: v.string({ max: 300, optional: true }),
  inclusions: v.list({ max: 30 }),
  sampleMenu: v.list({ max: 30 }),
  popular: v.bool(),
};

export const reservationShape = {
  name: v.string({ min: 2, max: 100 }),
  email: v.email(),
  phone: v.string({ min: 7, max: 40 }),
  date: v.date(),
  time: v.time(),
  guests: v.int({ min: 1, max: 5000 }),
  eventType: v.oneOf(EVENT_TYPE_VALUES),
  message: v.string({ max: 2000, optional: true }),
  status: v.oneOf(RESERVATION_STATUSES),
  notes: v.string({ max: 4000, optional: true }),
};

export const eventShape = {
  name: v.string({ max: 120 }),
  eventType: v.oneOf(EVENT_TYPE_VALUES),
  date: v.date(),
  time: v.time({ optional: true }),
  location: v.string({ max: 160, optional: true }),
  guests: v.int({ min: 0, max: 5000 }),
  amount: v.money(),
  status: v.oneOf(EVENT_STATUSES),
  notes: v.string({ max: 4000, optional: true }),
};

export const inquiryUpdateShape = {
  status: v.oneOf(INQUIRY_STATUSES),
  adminNote: v.string({ max: 4000, optional: true }),
};

export const venueShape = {
  name: v.string({ max: 120 }),
  address: v.string({ max: 200, optional: true }),
  min: v.int({ min: 0, max: 10000 }),
  max: v.int({ min: 1, max: 10000 }),
};

export const testimonialShape = {
  quote: v.string({ min: 5, max: 400 }),
  author: v.string({ max: 80 }),
  event: v.string({ max: 80, optional: true }),
  published: v.bool(),
  isSample: v.bool(),
};

export const settingsShapes = {
  restaurant: {
    name: v.string({ max: 100 }),
    tagline: v.string({ max: 120, optional: true }),
    description: v.string({ max: 400, optional: true }),
    founded: v.int({ min: 1900, max: 2100 }),
  },
  contact: {
    hours: v.string({ max: 120 }),
    primaryPhone: v.string({ max: 40 }),
    email: v.email({ optional: true }),
  },
  social: {
    facebook: v.url({ optional: true }),
    instagram: v.url({ optional: true }),
    tiktok: v.url({ optional: true }),
    youtube: v.url({ optional: true }),
  },
  seo: {
    title: v.string({ max: 120 }),
    description: v.string({ max: 320 }),
    keywords: v.string({ max: 400, optional: true }),
  },
  appearance: {
    accentColor: v.hexColor(),
    showPreloader: v.bool(),
    showGrain: v.bool(),
  },
  kiddie: {
    price: v.int({ min: 0, max: 100000 }),
    minimum: v.int({ min: 0, max: 1000 }),
  },
};

export const userShape = {
  name: v.string({ min: 2, max: 100 }),
  email: v.email(),
  password: v.string({ min: 8, max: 200 }),
  role: v.oneOf(["staff", "admin"] as const),
};
