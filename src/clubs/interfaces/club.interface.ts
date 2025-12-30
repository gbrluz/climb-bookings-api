export interface ClubProfile {
  id: string;
  owner_id: string;
  name: string;
  city: string;
  state: string;
  address?: string;
  phone?: string;
  images?: string[];
}

export interface Court {
  id: string;
  club_id: string;
  name: string;
  surface_type: 'clay' | 'synthetic_grass' | 'concrete';
  is_indoor: boolean;
  base_price: number;
  is_active: boolean;
}