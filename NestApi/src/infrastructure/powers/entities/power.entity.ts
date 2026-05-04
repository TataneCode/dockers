import type { PowerType } from '../../../domain/models/power-type';

export interface PowerEntity {
  id: string;
  name: string;
  description: string;
  type: PowerType;
  level: number;
}
