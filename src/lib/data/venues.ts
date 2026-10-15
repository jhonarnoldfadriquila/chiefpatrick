// Venues from chefpatrickskitchen.ph/venues (read 2026-10-15): CPK's own halls in Caloocan,
// and partner venues where CPK caters. Capacities are guests ("pax").

export interface Venue {
  name: string;
  address?: string;
  min: number;
  max: number;
}

export const ownHalls: Venue[] = [
  { name: "CPK Main Hall", min: 50, max: 200 },
  { name: "CPK Hall B", min: 30, max: 100 },
  { name: "Dine & Cheers 1", min: 30, max: 100 },
  { name: "Dine & Cheers 2", min: 30, max: 100 },
];

export const partnerVenues: { area: string; venues: Venue[] }[] = [
  {
    area: "Quezon City",
    venues: [
      { name: "LeReve Pool Party Venue & Events Place", address: "28 Sgt. Esguerra St., South Triangle", min: 100, max: 200 },
      { name: "Matrix Creations Events Place", address: "11 Malakas St., Pinyahan", min: 100, max: 500 },
      { name: "Light of Love", address: "1163 Santol St.", min: 50, max: 1000 },
      { name: "Artson Events Place", address: "99 Don Alejandro Roces, Brgy. Laging Handa", min: 50, max: 200 },
      { name: "The Circles Events Place", address: "1 Timog Ave.", min: 100, max: 200 },
      { name: "Caza La Chesma", address: "Zabarte Subd., Brgy. Kaligayahan, Novaliches", min: 100, max: 150 },
      { name: "The Third Greenmeadows Clubhouse", address: "Giraffe St., Brgy. Ugong Norte", min: 80, max: 250 },
      { name: "Silver Lotus", address: "25A LZF Building, Timog Ave.", min: 100, max: 300 },
    ],
  },
  {
    area: "Caloocan, Malabon, Navotas & Valenzuela",
    venues: [
      { name: "Patio Arsenio", address: "8 Judge A. Roldan St., San Roque, Navotas", min: 100, max: 200 },
      { name: "Zentral Events Place", address: "Leano St., Tanong, Malabon", min: 100, max: 150 },
      { name: "The Gathering Villa", address: "88 Yanga St., Maysilo, Malabon", min: 100, max: 200 },
      { name: "Sitio Rosal & Pavillion", address: "Tagalag, Valenzuela City", min: 100, max: 300 },
      { name: "V Gardens Event Place", address: "505 A. Mabini St., Caloocan City", min: 30, max: 120 },
      { name: "Costiera Pavillion", address: "198 M. Sioson St., Brgy. Dampalit, Malabon", min: 100, max: 150 },
      { name: "JV Palace Event Place", address: "F. Valenzuela St., Valenzuela City", min: 100, max: 200 },
      { name: "Ron Events Center", address: "62 Karuhatan Rd., Karuhatan, Valenzuela", min: 100, max: 200 },
    ],
  },
  {
    area: "Manila & Pasay",
    venues: [
      { name: "RNS Events Place", address: "Tondo, Manila", min: 80, max: 120 },
      { name: "1588 Benitez Place Events Center", address: "1588 F. Benitez St. cor. Pedro Gil St., Ermita", min: 100, max: 150 },
      { name: "Aqua Sphere", address: "Roxas Blvd. Service Rd., Malate", min: 50, max: 120 },
      { name: "Patio de Manila", min: 100, max: 200 },
      { name: "Le Parc Hall", address: "EDSA, Pasay City", min: 100, max: 250 },
      { name: "Ramon Magsaysay Hall", address: "Quintos St., Malate", min: 100, max: 200 },
      { name: "Paco Arena", address: "Leroy St. cor. San Gregorio St., Paco", min: 100, max: 400 },
      { name: "Vera Studio", address: "Cabildo cor. Beaterio Sts., Intramuros", min: 30, max: 60 },
      { name: "Casa Blanca", address: "Gen. Luna St., Intramuros", min: 80, max: 200 },
      { name: "Padre Blanco Gardens", address: "Real St., Intramuros", min: 100, max: 1000 },
      { name: "Casa Manila Patio", address: "Real St., Intramuros", min: 50, max: 100 },
    ],
  },
];

export const venueCount = ownHalls.length + partnerVenues.reduce((n, a) => n + a.venues.length, 0);

/** Banquet round tables seat ten. */
export const SEATS_PER_TABLE = 10;
