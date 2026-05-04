namespace SampleApi.Infrastructure.Entities;

public sealed class HeroEntity
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Alias { get; set; } = string.Empty;
    public string Origin { get; set; } = string.Empty;
    public List<HeroPowerEntity> HeroPowers { get; set; } = [];
}
