import type { HeroPowerEntity } from './hero-power.entity';

export interface HeroEntity {
  id: string;
  name: string;
  alias: string;
  origin: string;
  heroPowers: HeroPowerEntity[];
}
