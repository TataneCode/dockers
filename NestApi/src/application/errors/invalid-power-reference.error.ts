export class InvalidPowerReferenceError extends Error {
  constructor(readonly missingPowerIds: string[]) {
    super(`Unknown power ids: ${missingPowerIds.join(', ')}`);
  }
}
