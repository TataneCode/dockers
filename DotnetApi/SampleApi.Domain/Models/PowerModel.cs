namespace SampleApi.Domain.Models;

public sealed record PowerModel(
    string Id,
    string Name,
    string Description,
    string Type,
    int Level);
