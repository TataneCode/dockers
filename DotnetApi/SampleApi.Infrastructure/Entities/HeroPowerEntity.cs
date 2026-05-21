namespace SampleApi.Infrastructure.Entities;

public sealed class HeroPowerEntity
{
    public string HeroId { get; set; } = string.Empty;
    public string PowerId { get; set; } = string.Empty;
    public int Position { get; set; }
    public HeroEntity Hero { get; set; } = null!;
    public PowerEntity Power { get; set; } = null!;
}
