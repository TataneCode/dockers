namespace SampleApi.Responses;

/// <summary>Power resource returned by the API.</summary>
/// <param name="Id">Unique identifier of the power.</param>
/// <param name="Name">Name of the power.</param>
/// <param name="Description">Detailed description of the power.</param>
/// <param name="Type">Category of the power. Allowed values: Physical, Mental, Elemental, Tech.</param>
/// <param name="Level">Strength level of the power (0–10).</param>
public sealed record PowerResponse(
    string Id,
    string Name,
    string Description,
    string Type,
    int Level);
