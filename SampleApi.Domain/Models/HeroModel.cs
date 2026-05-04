namespace SampleApi.Domain.Models;

public sealed record HeroModel(
    string Id,
    string Name,
    string Alias,
    string Origin,
    IReadOnlyList<string> PowerIds);
