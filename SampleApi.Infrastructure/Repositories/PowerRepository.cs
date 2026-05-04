using Microsoft.EntityFrameworkCore;
using SampleApi.Domain.Models;
using SampleApi.Domain.Repositories;
using SampleApi.Infrastructure.Data;
using SampleApi.Infrastructure.Mappers;

namespace SampleApi.Infrastructure.Repositories;

public sealed class PowerRepository(SampleApiDbContext dbContext) : IPowerRepository
{
    public async Task<IReadOnlyList<PowerModel>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var powers = await dbContext.Powers
            .AsNoTracking()
            .OrderBy(power => power.Name)
            .ToListAsync(cancellationToken);
        return powers.Select(PowerEntityMapper.ToDomain).ToList();
    }

    public async Task<PowerModel?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var power = await dbContext.Powers
            .AsNoTracking()
            .FirstOrDefaultAsync(existingPower => existingPower.Id == id, cancellationToken);

        return power is null ? null : PowerEntityMapper.ToDomain(power);
    }

    public async Task<PowerModel> CreateAsync(PowerModel power, CancellationToken cancellationToken = default)
    {
        var entity = PowerEntityMapper.ToEntity(power);
        dbContext.Powers.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return PowerEntityMapper.ToDomain(entity);
    }

    public async Task<PowerModel?> UpdateAsync(PowerModel power, CancellationToken cancellationToken = default)
    {
        var existingPower = await dbContext.Powers
            .FirstOrDefaultAsync(entity => entity.Id == power.Id, cancellationToken);

        if (existingPower is null)
        {
            return null;
        }

        existingPower.Name = power.Name;
        existingPower.Description = power.Description;
        existingPower.Type = power.Type;
        existingPower.Level = power.Level;

        await dbContext.SaveChangesAsync(cancellationToken);
        return PowerEntityMapper.ToDomain(existingPower);
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var power = await dbContext.Powers
            .FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);

        if (power is null)
        {
            return false;
        }

        dbContext.Powers.Remove(power);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<string>> GetMissingIdsAsync(
        IReadOnlyCollection<string> ids,
        CancellationToken cancellationToken = default)
    {
        if (ids.Count == 0)
        {
            return [];
        }

        var requestedIds = ids
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .Distinct(StringComparer.Ordinal)
            .ToArray();

        if (requestedIds.Length == 0)
        {
            return [];
        }

        var existingIds = await dbContext.Powers
            .AsNoTracking()
            .Where(power => requestedIds.Contains(power.Id))
            .Select(power => power.Id)
            .ToListAsync(cancellationToken);

        return requestedIds
            .Except(existingIds, StringComparer.Ordinal)
            .ToArray();
    }
}
