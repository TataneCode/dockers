using SampleApi.Application.Exceptions;
using SampleApi.Domain.Models;
using SampleApi.Domain.Repositories;

namespace SampleApi.Application.Services;

public sealed class HeroService(IHeroRepository heroRepository, IPowerRepository powerRepository)
    : IHeroService
{
    public Task<IReadOnlyList<HeroModel>> GetAllAsync(CancellationToken cancellationToken = default) =>
        heroRepository.GetAllAsync(cancellationToken);

    public Task<HeroModel?> GetByIdAsync(string id, CancellationToken cancellationToken = default) =>
        heroRepository.GetByIdAsync(id, cancellationToken);

    public async Task<HeroModel> CreateAsync(HeroModel hero, CancellationToken cancellationToken = default)
    {
        var normalizedPowerIds = NormalizePowerIds(hero.PowerIds);
        await EnsurePowersExistAsync(normalizedPowerIds, cancellationToken);

        var heroToCreate = hero with
        {
            Id = Guid.NewGuid().ToString(),
            PowerIds = normalizedPowerIds
        };

        return await heroRepository.CreateAsync(heroToCreate, cancellationToken);
    }

    public async Task<HeroModel?> UpdateAsync(
        string id,
        HeroModel hero,
        CancellationToken cancellationToken = default)
    {
        var normalizedPowerIds = NormalizePowerIds(hero.PowerIds);
        await EnsurePowersExistAsync(normalizedPowerIds, cancellationToken);

        var heroToUpdate = hero with
        {
            Id = id,
            PowerIds = normalizedPowerIds
        };

        return await heroRepository.UpdateAsync(heroToUpdate, cancellationToken);
    }

    public Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default) =>
        heroRepository.DeleteAsync(id, cancellationToken);

    private async Task EnsurePowersExistAsync(
        IReadOnlyList<string> powerIds,
        CancellationToken cancellationToken)
    {
        if (powerIds.Count == 0)
        {
            return;
        }

        var missingIds = await powerRepository.GetMissingIdsAsync(powerIds, cancellationToken);
        if (missingIds.Count > 0)
        {
            throw new InvalidPowerReferenceException(missingIds);
        }
    }

    private static IReadOnlyList<string> NormalizePowerIds(IReadOnlyList<string> powerIds)
    {
        var distinctIds = new List<string>(powerIds.Count);
        var seen = new HashSet<string>(StringComparer.Ordinal);

        foreach (var powerId in powerIds)
        {
            if (string.IsNullOrWhiteSpace(powerId) || !seen.Add(powerId))
            {
                continue;
            }

            distinctIds.Add(powerId);
        }

        return distinctIds;
    }
}
