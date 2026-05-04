namespace SampleApi.Infrastructure.Options;

public sealed class JsonSeedOptions
{
    public const string SectionName = "JsonSeed";

    public bool Enabled { get; set; }
    public string DataPath { get; set; } = ".data";
}
