// The catering menu as published on chefpatrickskitchen.ph/menu (read 2026-10-15).
// Clients build a package by choosing dishes from these lists; the site lists no per-dish prices.

export interface MenuSection {
  id: string;
  name: string;
  items: { name: string; note?: string }[];
}

const list = (...names: string[]) => names.map((name) => ({ name }));

export const menuSections: MenuSection[] = [
  {
    id: "soup",
    name: "Soup",
    items: list(
      "Creamy Pumpkin and Bacon Soup",
      "Cream of Chicken and Asparagus",
      "Creamy Wild Mushroom Soup",
      "Spinach Seafood Soup",
      "Crab and Corn Soup",
      "Egg Drop Soup",
    ),
  },
  {
    id: "appetizer",
    name: "Appetizers",
    items: list(
      "Nacho Chips with Cheese Sauce",
      "Assorted Dimsum",
      "Japanese Gyoza",
      "Mini Quesadilla",
      "Baked Potato Wedges with Cheese and Bacon Bits",
      "Scallop Rockefeller",
      "Baked Cheesy Mussels",
    ),
  },
  {
    id: "salad",
    name: "Salad",
    items: list(
      "Chicken Caesar Salad or Shrimp Caesar Salad",
      "Chicken Waldorf Salad",
      "Tuna Mixed Salad with Ponzu Miso Dressing",
      "Chef Patrick’s Mixed Salad with Russian Dressing",
    ),
  },
  {
    id: "beef",
    name: "Beef",
    items: list(
      "15-hour Slow Roast Beef Belly with Truffle Demi-Glace",
      "Sous Vide Beef Kare-Kare",
      "Cheesy Sous Vide Beef Caldereta",
      "Creamy Beef Lengua with Mixed Vegetables",
      "Stir-Fry Beef with Bell Peppers in Black Pepper Sauce",
      "Stir-Fry Beef with Hoisin-Glazed Vegetables",
    ),
  },
  {
    id: "chicken",
    name: "Chicken",
    items: list(
      "Buttered Chicken",
      "Mandarin Chicken",
      "Chicken Karaage with Japanese Mayonnaise",
      "Chicken à la King",
      "Cordon Bleu with Creamy Mushroom Sauce",
      "Grilled Chicken in Teriyaki Sauce",
      "Grilled Chicken in Chimichurri",
      "Garlic Rosemary Chicken with Roasted Vegetables and Pan Gravy",
      "Roasted Chicken with Zucchini, Shiitake and Liver Sauce",
    ),
  },
  {
    id: "pork",
    name: "Pork",
    items: list(
      "Sous Vide Roast Pork Loin with Vegetables and Mushroom Gravy",
      "Grilled Pork Loin with Green Beans and Mushroom in Chimichurri",
      "Pork Scallopini Parmigiana",
      "Pork Scallopini with French Beans in Creamy Paprika Sauce",
      "Sweet and Sour Pork",
      "Salt and Pepper Spareribs",
      "Braised Patatim with Cuapao",
      "Crispy Pork Bagnet in Kare-Kare Sauce",
    ),
  },
  {
    id: "seafood",
    name: "Fish & Seafood",
    items: list(
      "Fish Fillet in Pesto Cream Sauce",
      "Baked Cheese & Butter Fish Fillet",
      "Baked Fish Fillet Parmigiano",
      "Panko-Crusted Fish Fillet with Tomato Salsa",
      "Panko-Crusted Fish Fillet with Tartar Sauce",
      "Sweet and Sour Fish Fillet",
      "Mixed Seafood Hotpot",
      "Creamy Mixed Seafood Casserole",
      "Salt and Pepper Squid",
      "Salted Egg Squid",
      "Mixed Seafood, Teppanyaki Style",
    ),
  },
  {
    id: "vegetables",
    name: "Vegetables",
    items: list(
      "Buttered Vegetables",
      "Stir-Fry Local Scallops with Broccoli",
      "Stir-Fry Baguio Beans with Chicken",
      "Vegetable Medley with Shrimps",
      "Three Kinds of Mushroom with Broccoli",
      "Lumpiang Hubad with Peanut Sauce",
      "Chopsuey",
    ),
  },
  {
    id: "noodles",
    name: "Noodles & Pasta",
    items: list(
      "Chef Patrick’s Birthday Noodles",
      "Chef Patrick’s Cha Misua",
      "Stir-Fry Scallops Sotanghon",
      "Korean Chapchae",
      "Beef Sate Noodles",
      "Grilled Chicken Penne in Pesto Sauce",
      "Shrimp Penne alla Vodka",
      "Creamy Salmon Linguine",
      "Creamy Carbonara Linguine",
      "Meaty Spaghetti Bolognese",
      "Pinoy-Style Spaghetti",
      "Cheesy Beef Lasagna",
    ),
  },
  {
    id: "rice",
    name: "Rice",
    items: [
      { name: "Steamed Pandan Rice" },
      { name: "Yang Chow Fried Rice", note: "+₱25" },
      { name: "Fukien Fried Rice", note: "+₱25" },
      { name: "Chicken with Salted Fish Fried Rice", note: "+₱25" },
      { name: "Shrimp Cilantro Fried Rice", note: "+₱25" },
    ],
  },
  {
    id: "desserts",
    name: "Desserts",
    items: list(
      "Assorted Pastries",
      "Brownies",
      "Blondies",
      "Carrot Mini Cupcakes",
      "Banana Mini Cupcakes",
      "Chocolate Chip Cookies",
      "Revel Bars",
      "Almond Lychee",
      "Buko Pandan",
      "Coffee Jelly",
      "Assorted Kakanin",
    ),
  },
];

export const dishCount = menuSections.reduce((n, s) => n + s.items.length, 0);

/** Kiddie menu: a fixed-price set for children's parties. */
export const kiddieMenu = {
  price: 350,
  minimum: 30,
  sets: [
    {
      name: "Set A",
      courses: [
        ["Noodles", "Filipino-style spaghetti or creamy carbonara"],
        ["Pork", "Hotdog on stick, pork barbecue or lumpia shanghai"],
        ["Chicken", "Nuggets, parmesan wings or chicken lollipops"],
        ["Desserts", "Cupcakes and brownies"],
        ["Drinks", "Iced tea or orange juice"],
      ],
    },
    {
      name: "Set B",
      courses: [
        ["Noodles", "Macaroni and cheese or baked macaroni"],
        ["Beef", "Burger steak with mushroom sauce or Swedish meatballs"],
        ["Chicken", "Buttered chicken or chicken nuggets"],
        ["Rice", "Steamed rice"],
        ["Desserts", "Cupcakes and brownies"],
        ["Drinks", "Iced tea or orange juice"],
      ],
    },
    {
      name: "Set C",
      courses: [
        ["Noodles", "Beefy lasagna"],
        ["Party", "Hotdog and mallows"],
        ["Sandwich", "Grilled ham and cheese or mini cheeseburgers"],
        ["Chicken", "Nuggets, parmesan wings or chicken lollipops"],
        ["Sweets", "Assorted mallows and candy bars"],
        ["Drinks", "Iced tea or orange juice"],
      ],
    },
  ],
};
