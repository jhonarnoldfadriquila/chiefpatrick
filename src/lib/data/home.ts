import { photos, type Photo } from "@/lib/data/photos";

// Dishes from the real menu, sorted into the two kitchens the menu draws on. The photos are CPK's
// own event photos (the site has no per-dish photography yet); each row shows one as atmosphere.
export const filipinoDishes: { name: string; photo: Photo }[] = [
  { name: "Sous Vide Beef Kare-Kare", photo: photos.buffet },
  { name: "Crispy Pork Bagnet in Kare-Kare Sauce", photo: photos.grazing },
  { name: "Cheesy Sous Vide Beef Caldereta", photo: photos.goldTable },
  { name: "Creamy Beef Lengua", photo: photos.autumnSetting },
  { name: "Lumpiang Hubad with Peanut Sauce", photo: photos.lanterns },
  { name: "Chef Patrick’s Birthday Noodles", photo: photos.candelabra },
  { name: "Assorted Kakanin", photo: photos.whiteRoses },
];

export const chineseDishes: { name: string; photo: Photo }[] = [
  { name: "Braised Patatim with Cuapao", photo: photos.buffet },
  { name: "Salt and Pepper Spareribs", photo: photos.roses },
  { name: "Mandarin Chicken", photo: photos.tableNumber },
  { name: "Chef Patrick’s Cha Misua", photo: photos.longTable },
  { name: "Salted Egg Squid", photo: photos.blossoms },
  { name: "Yang Chow Fried Rice", photo: photos.dinnerTable },
  { name: "Assorted Dimsum", photo: photos.grazing },
];

export interface Testimonial {
  quote: string;
  author: string;
  event: string;
  /** Placeholder until CPK supplies real client quotes. Rendered with a visible "Sample" tag. */
  isSample: boolean;
}

// SAMPLE QUOTES. chefpatrickskitchen.ph publishes no reviews; replace with real, approved quotes.
export const testimonials: Testimonial[] = [
  {
    quote: "The kare-kare ran out first, and our titas asked who catered before the programme even started.",
    author: "Sample client",
    event: "Debut · 150 guests",
    isSample: true,
  },
  {
    quote: "They dressed the hall, fed two hundred people and cleared up before the last dance ended.",
    author: "Sample client",
    event: "Wedding · CPK Main Hall",
    isSample: true,
  },
  {
    quote: "Hot food on time for a year-end party of ninety. The crew handled everything.",
    author: "Sample client",
    event: "Company event · 90 guests",
    isSample: true,
  },
];

export const eventTypes = ["Weddings", "Debuts", "Christenings", "Corporate", "Lauriat", "Birthdays"];
