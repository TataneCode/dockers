using System.Text.Json;
using SampleApi.Models;

namespace SampleApi.Services;

public class JsonRepository<T> where T : class, IEntity
{
    private readonly string _filePath;
    private static readonly JsonSerializerOptions Options = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true
    };

    public JsonRepository(string filePath)
    {
        _filePath = filePath;
        Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
        if (!File.Exists(filePath))
            File.WriteAllText(filePath, "[]");
    }

    public async Task<List<T>> ReadAllAsync()
    {
        var json = await File.ReadAllTextAsync(_filePath);
        return JsonSerializer.Deserialize<List<T>>(json, Options) ?? [];
    }

    public async Task SaveAllAsync(List<T> entities)
    {
        var json = JsonSerializer.Serialize(entities, Options);
        await File.WriteAllTextAsync(_filePath, json);
    }
}
