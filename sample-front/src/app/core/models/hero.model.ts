export interface Hero {
  id: string;
  name: string;
  alias: string;
  origin: string;
  powerIds: string[];
}

export interface HeroRequest {
  name: string;
  alias: string;
  origin: string;
  powerIds: string[];
}
