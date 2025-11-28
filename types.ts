export interface FlavorProfile {
  body: number;     // 1-5
  acidity: number;  // 1-5
  sweetness: number;// 1-5
}

export interface Product {
  id: number;
  name: string;
  subTitle: string;
  price: number;
  image: string;
  description: string;
  tags: string[];
  flavorProfile?: FlavorProfile;
  notes: string[]; // e.g., "Dried Fig", "Dark Chocolate"
}

export interface BrewingStep {
  label: string;
  duration: number; // in seconds
  description: string;
}

export interface BrewingGuide {
  id: number;
  title: string;
  time: string;
  temp: string;
  image: string;
  steps: BrewingStep[];
}

export type ViewState = 'HOME' | 'DETAIL';