export interface Power {
  id: string;
  name: string;
  description: string;
  type: 'Physical' | 'Mental' | 'Elemental' | 'Tech';
  level: number;
}

export interface PowerRequest {
  name: string;
  description: string;
  type: 'Physical' | 'Mental' | 'Elemental' | 'Tech';
  level: number;
}
