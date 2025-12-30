export interface Slot {
  start: string;
  end: string;
  available: boolean;
  price: number;
}

export interface Player {
  id: string;
  full_name: string; // Isso resolve o erro da image_517d8c.png
  avatar_url?: string;
}