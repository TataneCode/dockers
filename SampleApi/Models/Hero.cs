namespace SampleApi.Models;

public class Hero : IEntity
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Alias { get; set; } = string.Empty;
    public string Origin { get; set; } = string.Empty;
    public List<string> PowerIds { get; set; } = [];
}
