namespace SampleApi.Records;

public record PowerResponse(string Id, string Name, string Description, string Type, int Level);
public record PowerRequest(string Name, string Description, string Type, int Level);
