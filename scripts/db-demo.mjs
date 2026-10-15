// npm run db:demo            adds sample dashboard data (reservations, events, inquiries, menu stats)
// npm run db:demo -- --clear  removes it again
//
// Every sample row is flagged is_demo = 1 so it can be removed cleanly (also from Website Settings
// in the admin). Dates are relative to today, so the dashboard always looks current.
import { connectDb, loadEnv } from "./db-lib.mjs";

loadEnv();
const db = await connectDb();

const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};
const at = (offset, hour = 10) => `${day(offset)} ${String(hour).padStart(2, "0")}:00:00`;

async function clear() {
  await db.query("DELETE FROM events WHERE is_demo = 1");
  await db.query("DELETE FROM reservations WHERE is_demo = 1");
  await db.query("DELETE FROM inquiries WHERE is_demo = 1");
  await db.query("UPDATE menu_items SET sold = 0, price = NULL, image = NULL, is_demo = 0 WHERE is_demo = 1");
}

if (process.argv.includes("--clear")) {
  await clear();
  console.log("✓ demo data removed");
  await db.end();
  process.exit(0);
}

await clear();

// Reservations (the reference rows plus more, spread over the last weeks)
const reservations = [
  ["Maria Santos", "maria@example.com", "0917 555 0101", 2, "18:00", 50, "wedding", "confirmed", 0],
  ["John Dela Cruz", "john@example.com", "0918 555 0102", 3, "12:00", 30, "birthday", "pending", -1],
  ["Alyssa Reyes", "alyssa@example.com", "0919 555 0103", 9, "19:00", 80, "corporate", "confirmed", -2],
  ["Mark Tan", "mark@example.com", "0920 555 0104", 16, "11:00", 20, "family", "pending", -3],
  ["Isabel Cruz", "isabel@example.com", "0921 555 0105", 23, "18:00", 40, "birthday", "confirmed", -4],
  ["Paolo Garcia", "paolo@example.com", "0922 555 0106", 30, "17:00", 150, "debut", "pending", -6],
  ["Celine Lim", "celine@example.com", "0923 555 0107", 12, "18:30", 100, "wedding", "confirmed", -8],
  ["Ramon Villanueva", "ramon@example.com", "0924 555 0108", -5, "12:00", 60, "corporate", "completed", -20],
  ["Grace Ong", "grace@example.com", "0925 555 0109", -12, "18:00", 35, "birthday", "completed", -25],
  ["Jessa Bautista", "jessa@example.com", "0926 555 0110", 40, "16:00", 120, "debut", "pending", -9],
];
// Older ones, received 31–60 days ago (the previous period on the dashboard).
reservations.push(
  ["Lea Mendoza", "lea@example.com", "0927 555 0111", -20, "18:00", 90, "wedding", "completed", -40],
  ["Carlo Reyes", "carlo@example.com", "0928 555 0112", -30, "12:00", 45, "birthday", "completed", -45],
  ["Nina Aquino", "nina@example.com", "0929 555 0113", -15, "17:00", 70, "debut", "completed", -50],
  ["Bryan Uy", "bryan@example.com", "0930 555 0114", -25, "19:00", 110, "corporate", "completed", -55],
  ["Tess Navarro", "tess@example.com", "0931 555 0115", -18, "11:00", 25, "family", "cancelled", -36],
  ["Joy Santos", "joy@example.com", "0932 555 0116", -10, "18:00", 60, "birthday", "completed", -38],
  ["Mike Co", "mike@example.com", "0933 555 0117", -8, "18:30", 150, "wedding", "completed", -42],
  ["Rica Lim", "rica@example.com", "0934 555 0118", -6, "12:00", 35, "family", "completed", -58],
);
for (const [name, email, phone, off, time, guests, type, status, created] of reservations) {
  await db.query(
    "INSERT INTO reservations (name, email, phone, event_date, event_time, guests, event_type, message, status, created_at, is_demo) VALUES (?,?,?,?,?,?,?,?,?,?,1)",
    [name, email, phone, day(off), time, guests, type, "Sample reservation (demo data).", status, at(created)],
  );
}

// Events: upcoming ones from the reference, plus past completed events that feed the revenue chart.
const events = [
  ["Wedding - Santos", "wedding", 2, "Manila", 50, 45000, "confirmed"],
  ["Corporate - ABC Inc.", "corporate", 9, "Quezon City", 80, 52000, "pending"],
  ["Birthday - Garcia", "birthday", 23, "Makati", 40, 22000, "confirmed"],
  ["Family Gathering", "family", 31, "Tagaytay", 20, 15000, "confirmed"],
];
// The last 8 days, matching the reference chart (₱18k → ₱52k).
[18000, 25000, 20000, 29000, 26000, 34000, 44000, 52000].forEach((amount, i) =>
  events.push([`Catering #${i + 1}`, i % 2 ? "birthday" : "corporate", i - 7, "Caloocan", 60 + i * 10, amount, "completed"]),
);
// Twelve months of history: a few completed events a month, with a December peak.
for (let m = 1; m <= 12; m++) {
  const perMonth = 3 + (m % 3);
  for (let k = 0; k < perMonth; k++) {
    const off = -m * 30 + k * 7;
    const amount = 15000 + ((m * 7919 + k * 104729) % 40000);
    events.push([`Past event ${m}-${k + 1}`, ["wedding", "debut", "birthday", "corporate"][k % 4], off, "Caloocan", 80, amount, "completed"]);
  }
}
for (const [name, type, off, location, guests, amount, status] of events) {
  await db.query(
    "INSERT INTO events (name, event_type, event_date, event_time, location, guests, amount, status, is_demo, created_at) VALUES (?,?,?,?,?,?,?,?,1,?)",
    [name, type, day(off), "18:00", location, guests, amount, status, at(Math.min(off, 0) - 14)],
  );
}

// Inquiries (the reference rows)
const inquiries = [
  ["Anna Lopez", "anna@example.com", "Catering Inquiry", "new", 0],
  ["Rafael Santos", "rafael@example.com", "Event Booking", "in_progress", -10],
  ["Danielle Cruz", "danielle@example.com", "Menu Question", "resolved", -12],
  ["Kevin Lim", "kevin@example.com", "Reservation", "new", -16],
  ["Sophia Garcia", "sophia@example.com", "Catering Package", "in_progress", -18],
];
inquiries.push(
  ["Joel Torres", "joel@example.com", "Venue Question", "resolved", -33],
  ["Mia Flores", "mia@example.com", "Catering Inquiry", "resolved", -40],
  ["Ken Dizon", "ken@example.com", "Menu Question", "resolved", -47],
  ["Ana Ramos", "ana@example.com", "Event Booking", "resolved", -52],
);
for (const [name, email, subject, status, off] of inquiries) {
  await db.query(
    "INSERT INTO inquiries (name, email, subject, message, status, created_at, is_demo) VALUES (?,?,?,?,?,?,1)",
    [name, email, subject, "Sample inquiry (demo data). Hello, I'd like to ask about your catering for an upcoming event.", status, at(off)],
  );
}

// Popular menu items: sample prices and sold counts on five real dishes.
const popular = [
  ["Grilled Chicken in Teriyaki Sauce", 220, 120, "/cpk/chef-patrick-image-42.jpg"],
  ["Creamy Carbonara Linguine", 180, 98, null],
  ["Sous Vide Beef Kare-Kare", 260, 87, null],
  ["Brownies", 150, 76, null],
  ["Chicken Caesar Salad or Shrimp Caesar Salad", 120, 65, null],
];
for (const [name, price, sold, image] of popular) {
  await db.query("UPDATE menu_items SET price = ?, sold = ?, image = ?, is_demo = 1 WHERE name = ?", [price, sold, image, name]);
}

console.log(`✓ demo data: ${reservations.length} reservations, ${events.length} events, ${inquiries.length} inquiries, ${popular.length} menu stats`);
await db.end();
