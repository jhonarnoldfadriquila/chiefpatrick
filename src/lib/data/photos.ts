// Chef Patrick's Kitchen's own photographs, taken from chefpatrickskitchen.ph and stored in /public/cpk.

export interface Photo {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
}

const p = (file: string, width: number, height: number, alt: string, caption?: string): Photo => ({
  src: `/cpk/${file}`,
  width,
  height,
  alt,
  caption,
});

export const photos = {
  redHall: p("chef-patrick-image-2.jpg", 975, 1200, "A long banquet table under a ceiling of red flowers and hanging gold baubles", "Red and gold reception"),
  floralHall: p("chef-patrick-image-3.jpg", 975, 1200, "Round tables set beneath a ceiling of hanging flowers and lights", "Floral ceiling, round tables"),
  crewSeated: p("chef-patrick-image-4.jpg", 975, 1200, "The Chef Patrick's Kitchen crew in red polo shirts, seated together in a hall", "Our crew"),
  kidsParty: p("chef-patrick-image-5.jpg", 1350, 800, "A children's party stage decorated with balloons and paper flowers", "Children's party stage"),
  tableNumber: p("chef-patrick-image-6.jpg", 840, 640, "A table number card beside a ball of pink flowers", "Table four"),
  greenAisle: p("chef-patrick-image-7.jpg", 1040, 630, "A wedding aisle under a green-lit ceiling of flowers", "Wedding aisle"),
  candelabra: p("chef-patrick-image-8.jpg", 840, 640, "Crystal candelabras and white flowers along a lit banquet table", "Candelabra table"),
  grazing: p("chef-patrick-image-9.png", 838, 700, "A grazing board of cheeses, cured meats and fruit beside a set table", "Grazing board"),
  longTable: p("chef-patrick-image-12.jpg", 1200, 800, "A long table set with black napkins, wine glasses and white chairs", "Long table setting"),
  balloonWall: p("chef-patrick-image-13.jpg", 1200, 800, "A wall of bright balloons for a birthday party", "Birthday balloon wall"),
  debut: p("chef-patrick-image-14.jpg", 1200, 800, "A debutante in a pink gown in a hall lit in blue", "Debut"),
  wedding: p("chef-patrick-image-15.jpg", 1200, 800, "A bride and groom at their reception among set tables", "Wedding reception"),
  autumnSetting: p("chef-patrick-image-17.jpg", 1200, 581, "A place setting with a gold charger, crystal glass and autumn leaves", "Place setting"),
  crewStanding: p("chef-patrick-image-19.jpg", 1200, 800, "The crew in red polo shirts gathered in a decorated hall", "Our crew on the day"),
  flowerCeiling: p("chef-patrick-image-21.jpg", 1200, 800, "Hanging white flowers and greenery over a lit reception hall", "Hanging flowers"),
  dinnerTable: p("chef-patrick-image-22.jpg", 1400, 647, "A long dinner table with flowers, glasses and folded napkins", "Dinner table"),
  greenCeilingHall: p("chef-patrick-image-23.jpg", 1200, 800, "A hall of round tables under green and white hanging flowers", "Round tables in the hall"),
  pinkHall: p("chef-patrick-image-24.jpg", 1200, 800, "Round tables with pink centrepieces under a ceiling of white flowers", "Pink centrepieces"),
  redCarpetHall: p("chef-patrick-image-25.jpg", 1200, 800, "A function hall with a red carpet between round tables under a canopy of lights", "Red carpet hall"),
  whiteHall: p("chef-patrick-image-26.jpg", 1200, 800, "A red carpet running between round tables under hanging white flowers", "White floral hall"),
  blossoms: p("chef-patrick-image-27.jpg", 1400, 620, "Tall white blossom centrepieces on a dark table", "Blossom centrepieces"),
  loveseat: p("chef-patrick-image-32.jpg", 1200, 895, "A white loveseat stage framed by draped fabric and flowers", "Couple's stage"),
  goldTable: p("chef-patrick-image-33.jpg", 840, 850, "Tall gold vases of white flowers on a black and gold table", "Black and gold table"),
  lanterns: p("chef-patrick-image-34.jpg", 1200, 895, "Gold lantern centrepieces with pink roses on a long table", "Lantern centrepieces"),
  gardenTable: p("chef-patrick-image-35.jpg", 1060, 965, "An outdoor table dressed in red and white with a runner of roses", "Garden table"),
  canopyHall: p("chef-patrick-image-36.jpg", 1200, 616, "A hall of white chairs either side of a red carpet", "Ceremony hall"),
  greenHall: p("chef-patrick-image-37.jpg", 1200, 720, "A hall under a ceiling of green leaves and fairy lights", "Leaf ceiling"),
  purpleHall: p("chef-patrick-image-38.jpg", 1200, 720, "A hall lit in purple under hanging flowers", "Purple-lit hall"),
  whiteRoses: p("chef-patrick-image-39.jpg", 1200, 720, "A centrepiece of white roses and glass candle holders", "White roses"),
  buffet: p("chef-patrick-image-42.jpg", 1200, 583, "A buffet line of chafing dishes filled with noodles and stir-fried dishes", "The buffet"),
  roses: p("delivering-superior-dishes.png", 592, 700, "A gold charger and printed menu among red roses", "Menu card and roses"),
  blueTables: p("chef-patrick-image-1.jpg", 1080, 495, "Round tables set with blue cloths, folded napkins and glassware", "Blue round tables"),
} satisfies Record<string, Photo>;

export const logo = { src: "/cpk/chef-patricks-kitchen-logo.png", width: 600, height: 660 };

/** Every photograph for the gallery, in a deliberate order (food and tables first, then halls). */
export const galleryOrder: (keyof typeof photos)[] = [
  "buffet",
  "redHall",
  "grazing",
  "floralHall",
  "lanterns",
  "wedding",
  "tableNumber",
  "debut",
  "goldTable",
  "kidsParty",
  "autumnSetting",
  "greenAisle",
  "roses",
  "pinkHall",
  "candelabra",
  "loveseat",
  "gardenTable",
  "redCarpetHall",
  "whiteRoses",
  "crewStanding",
  "blossoms",
  "flowerCeiling",
  "balloonWall",
  "greenCeilingHall",
  "longTable",
  "purpleHall",
  "whiteHall",
  "dinnerTable",
  "greenHall",
  "canopyHall",
  "blueTables",
  "crewSeated",
];
