namespace SampleApi.Responses;

/// <summary>Hero resource returned by the API.</summary>
/// <param name="Id">Unique identifier of the hero.</param>
/// <param name="Name">Full name of the hero.</param>
/// <param name="Alias">Superhero alias.</param>
/// <param name="Origin">Origin story or birthplace of the hero.</param>
/// <param name="PowerIds">IDs of the powers assigned to the hero.</param>
public sealed record HeroResponse(
    string Id,
    string Name,
    string Alias,
    string Origin,
    List<string> PowerIds);
