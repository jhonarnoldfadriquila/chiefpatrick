import type { CateringPackage, EventOffering } from "@/types";

// SAMPLE PRICING. chefpatrickskitchen.ph publishes no package rates (its /packages page is empty),
// so these tiers and prices are placeholders for the layout. Confirm with CPK before launch.
export const cateringPackages: CateringPackage[] = [
  {
    id: "silver",
    tier: "silver",
    name: "Silver",
    guests: 30,
    price: 8500,
    forWho: "Family lunches, small birthdays and team meals at home or in the office.",
    inclusions: ["3 main dishes", "1 dessert", "Steamed pandan rice", "Iced tea", "Buffet chafing dishes"],
    sampleMenu: ["Sweet and Sour Pork", "Buttered Chicken", "Chopsuey", "Buko Pandan"],
    popular: false,
  },
  {
    id: "gold",
    tier: "gold",
    name: "Gold",
    guests: 50,
    price: 15000,
    forWho: "Debuts, christenings and company parties that want a full buffet and a crew to serve it.",
    inclusions: [
      "5 main dishes",
      "2 desserts",
      "Steamed pandan rice",
      "Iced tea and water",
      "Buffet skirting and centrepiece",
      "Plates, glassware and cutlery",
      "2 food attendants",
    ],
    sampleMenu: [
      "Braised Patatim with Cuapao",
      "Salted Egg Squid",
      "Chef Patrick’s Birthday Noodles",
      "Mandarin Chicken",
      "Three Kinds of Mushroom with Broccoli",
      "Coffee Jelly",
      "Almond Lychee",
    ],
    popular: true,
  },
  {
    id: "platinum",
    tier: "platinum",
    name: "Platinum",
    guests: 100,
    price: 28000,
    forWho: "Weddings and big celebrations, with styled tables, a full crew and a coordinator.",
    inclusions: [
      "7 main dishes",
      "3 desserts",
      "Steamed pandan rice",
      "Drinks station",
      "Styled buffet and table centrepieces",
      "Plates, glassware and cutlery",
      "Full service crew and event coordinator",
    ],
    sampleMenu: [
      "15-hour Slow Roast Beef Belly",
      "Crispy Pork Bagnet in Kare-Kare Sauce",
      "Mixed Seafood Hotpot",
      "Chef Patrick’s Cha Misua",
      "Yang Chow Fried Rice",
      "Assorted Kakanin",
    ],
    popular: false,
  },
];

// Event types and their descriptions as written on chefpatrickskitchen.ph/event.
export const eventOfferings: EventOffering[] = [
  {
    id: "weddings",
    title: "Weddings",
    description: "Crafting unforgettable moments of love and culinary perfection for your dream wedding celebration.",
    eventType: "wedding",
    photo: "wedding",
  },
  {
    id: "debuts",
    title: "Debuts",
    description: "A perfect debut: exquisite food, a hall dressed for the night and a programme that runs without a hitch.",
    eventType: "debut",
    photo: "debut",
  },
  {
    id: "birthdays",
    title: "Birthdays",
    description: "Make your birthday celebration a taste-filled delight with our expertly crafted menus.",
    eventType: "birthday",
    photo: "kidsParty",
  },
  {
    id: "corporate",
    title: "Company events",
    description: "Year-end parties, launches and meetings, with cooking that impresses clients and feeds the whole team.",
    eventType: "corporate",
    photo: "longTable",
  },
];
