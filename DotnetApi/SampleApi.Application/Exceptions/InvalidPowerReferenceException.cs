namespace SampleApi.Application.Exceptions;

public sealed class InvalidPowerReferenceException(IReadOnlyList<string> missingPowerIds)
    : Exception($"Unknown power ids: {string.Join(", ", missingPowerIds)}")
{
    public IReadOnlyList<string> MissingPowerIds { get; } = missingPowerIds;
}
