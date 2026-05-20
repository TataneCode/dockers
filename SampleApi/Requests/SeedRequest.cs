namespace SampleApi.Requests;

/// <summary>Request body for seeding the database.</summary>
/// <param name="HeroCount">Number of heroes to create.</param>
/// <param name="PowerCount">Number of powers to create.</param>
public sealed record SeedRequest(int HeroCount, int PowerCount);
