import type { HeroModel } from '../models/hero.model';

export interface HeroRepository {
  findAll(): Promise<HeroModel[]>;
  findById(id: string): Promise<HeroModel | null>;
  create(hero: HeroModel): Promise<HeroModel>;
  update(hero: HeroModel): Promise<HeroModel | null>;
  remove(id: string): Promise<boolean>;
}
