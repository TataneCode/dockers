import type { PowerModel } from '../models/power.model';

export interface PowerRepository {
  findAll(): Promise<PowerModel[]>;
  findById(id: string): Promise<PowerModel | null>;
  create(power: PowerModel): Promise<PowerModel>;
  update(power: PowerModel): Promise<PowerModel | null>;
  remove(id: string): Promise<boolean>;
  findMissingIds(ids: readonly string[]): Promise<string[]>;
}
