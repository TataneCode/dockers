namespace SampleApi.Responses;

/// <summary>Result of a seed operation.</summary>
/// <param name="HeroesCreated">Number of heroes created.</param>
/// <param name="PowersCreated">Number of powers created.</param>
public sealed record SeedResponse(int HeroesCreated, int PowersCreated);
