namespace SampleApi.Requests;

/// <summary>Request body for creating or updating a hero.</summary>
/// <param name="Name">Full name of the hero.</param>
/// <param name="Alias">Superhero alias.</param>
/// <param name="Origin">Origin story or birthplace of the hero.</param>
/// <param name="PowerIds">IDs of the powers assigned to the hero.</param>
public sealed record HeroRequest(string Name, string Alias, string Origin, List<string> PowerIds);
