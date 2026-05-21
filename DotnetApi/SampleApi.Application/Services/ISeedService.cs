namespace SampleApi.Application.Services;

public interface ISeedService
{
    Task<SeedResult> SeedAsync(int heroCount, int powerCount, CancellationToken cancellationToken = default);
    Task CleanAsync(CancellationToken cancellationToken = default);
}

public sealed record SeedResult(int HeroesCreated, int PowersCreated);
