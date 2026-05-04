namespace SampleApi.Requests;

public sealed record HeroRequest(string Name, string Alias, string Origin, List<string> PowerIds);
