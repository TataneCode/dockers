namespace SampleApi.Infrastructure.Entities;

public sealed class PowerEntity
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int Level { get; set; }
    public List<HeroPowerEntity> HeroPowers { get; set; } = [];
}
