namespace SampleApi.Responses;

public sealed record HeroResponse(
    string Id,
    string Name,
    string Alias,
    string Origin,
    List<string> PowerIds);
