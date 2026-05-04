import type { PowerType } from './power-type';

export interface PowerModel {
  id: string;
  name: string;
  description: string;
  type: PowerType;
  level: number;
}
