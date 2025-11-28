
import { Product, BrewingGuide } from '../types';

export const COFFEE_MENU: Product[] = [
  {
    id: 1,
    name: "Bella Donovan",
    subTitle: "Blend • Organic",
    price: 6000,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    description: "Our most popular blend. A variation of the Moka-Java blend, it pairs a jammy and wild Ethiopian bean with an earthy Sumatra foundation.",
    tags: ["Best Seller", "Blend"],
    notes: ["Raspberry", "Chocolate", "Molasses"],
    flavorProfile: { body: 4, acidity: 2, sweetness: 4 }
  },
  {
    id: 2,
    name: "Three Africas",
    subTitle: "Single Origin • Radiant",
    price: 7500,
    image: "https://images.unsplash.com/photo-1610632380989-680fe40816c6?auto=format&fit=crop&w=800&q=80",
    description: "Three distinct African coffees converge in this radiant blend. Golden raisin and winey blueberry notes shine through.",
    tags: ["Fruity", "Light Roast"],
    notes: ["Golden Raisin", "Winey Blueberry", "Lemon Zest"],
    flavorProfile: { body: 3, acidity: 4, sweetness: 3 }
  },
  {
    id: 3,
    name: "Hayes Valley",
    subTitle: "Espresso • Dark",
    price: 6500,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80", // Using safe duplicate (Bella Donovan img) to ensure it loads
    description: "Our darkest espresso. Baking chocolate, orange zest, and brown sugar notes make this the perfect base for a latte.",
    tags: ["Espresso", "Bold"],
    notes: ["Baking Chocolate", "Orange Zest", "Brown Sugar"],
    flavorProfile: { body: 5, acidity: 1, sweetness: 4 }
  },
  {
    id: 4,
    name: "Night Light Decaf",
    subTitle: "Decaf • Swiss Water",
    price: 6800,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    description: "A decaf that drinks like a regular. Creamy, delicious, and free of chemical solvents.",
    tags: ["Decaf", "Evening"],
    notes: ["Creme Brulee", "Vanilla", "Key Lime"],
    flavorProfile: { body: 3, acidity: 2, sweetness: 5 }
  },
  {
    id: 5,
    name: "Giant Steps",
    subTitle: "Blend • Dark",
    price: 6500,
    image: "https://images.unsplash.com/photo-1514066558159-fc8c737ef259?auto=format&fit=crop&w=800&q=80",
    description: "Rich, profound, and viscous. This blend stands up to cream and sugar with notes of cocoa and toasted marshmallow.",
    tags: ["Bold", "Dark Roast"],
    notes: ["Cocoa", "Toasted Marshmallow", "Graham Cracker"],
    flavorProfile: { body: 5, acidity: 1, sweetness: 3 }
  }
];

export const BREWING_GUIDES: BrewingGuide[] = [
  {
    id: 1,
    title: "Pour Over",
    time: "3:00",
    temp: "93°C",
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80",
    steps: [
      { label: "GRIND", duration: 0, description: "30g coffee, medium-fine grind." },
      { label: "BLOOM", duration: 45, description: "Pour 60g water. Watch it rise." },
      { label: "POUR", duration: 90, description: "Pour slowly in circles to 350g." },
      { label: "DRAW DOWN", duration: 45, description: "Wait for the drip to finish." }
    ]
  },
  {
    id: 2,
    title: "French Press",
    time: "4:00",
    temp: "95°C",
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80", // Using reliable latte art/coffee image
    steps: [
      { label: "PREP", duration: 0, description: "Coarse grind. Warm the vessel." },
      { label: "POUR", duration: 60, description: "Pour all water rapidly. Stir." },
      { label: "STEEP", duration: 180, description: "Place lid. Do not plunge yet." },
      { label: "PLUNGE", duration: 30, description: "Press down gently. Serve." }
    ]
  },
  {
    id: 3,
    title: "Aeropress",
    time: "1:30",
    temp: "90°C",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80", // Brewing/Espresso style
    steps: [
      { label: "PREP", duration: 0, description: "Insert filter & wet cap. Add coffee." },
      { label: "POUR", duration: 10, description: "Pour water to level 4. Stir 10s." },
      { label: "PRESS", duration: 30, description: "Insert plunger & press gently." },
      { label: "DILUTE", duration: 0, description: "Add water to taste if needed." }
    ]
  },
  {
    id: 4,
    title: "Cold Brew",
    time: "12:00",
    temp: "Cold",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80", // Cold brew pouring
    steps: [
      { label: "GRIND", duration: 0, description: "Extra coarse grind. 1:8 ratio." },
      { label: "COMBINE", duration: 60, description: "Mix coffee & cold water." },
      { label: "STEEP", duration: 43200, description: "Fridge for 12-24 hours." },
      { label: "FILTER", duration: 120, description: "Strain through cheesecloth." }
    ]
  }
];

export const CATEGORIES = ["All", "Blend", "Single Origin", "Espresso", "Cold Brew"];