namespace SampleApi.Requests;

/// <summary>Request body for creating or updating a power.</summary>
/// <param name="Name">Name of the power.</param>
/// <param name="Description">Detailed description of the power.</param>
/// <param name="Type">Category of the power. Allowed values: Physical, Mental, Elemental, Tech.</param>
/// <param name="Level">Strength level of the power (0–10).</param>
public sealed record PowerRequest(string Name, string Description, string Type, int Level);
