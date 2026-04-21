namespace SampleApi.Records;

public record HeroResponse(string Id, string Name, string Alias, string Origin, List<string> PowerIds);
public record HeroRequest(string Name, string Alias, string Origin, List<string> PowerIds);
