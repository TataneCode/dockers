export const powerTypes = ['Physical', 'Mental', 'Elemental', 'Tech'] as const;

export type PowerType = (typeof powerTypes)[number];
