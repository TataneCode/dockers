namespace SampleApi.Responses;

public sealed record PowerResponse(
    string Id,
    string Name,
    string Description,
    string Type,
    int Level);
