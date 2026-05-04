using Microsoft.EntityFrameworkCore;
using SampleApi.Domain.Models;
using SampleApi.Domain.Repositories;
using SampleApi.Infrastructure.Data;
using SampleApi.Infrastructure.Entities;
using SampleApi.Infrastructure.Mappers;

namespace SampleApi.Infrastructure.Repositories;

public sealed class HeroRepository(SampleApiDbContext dbContext) : IHeroRepository
{
    public async Task<IReadOnlyList<HeroModel>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var heroes = await dbContext.Heroes
            .AsNoTracking()
            .Include(hero => hero.HeroPowers)
            .OrderBy(hero => hero.Name)
            .ToListAsync(cancellationToken);

        return heroes.Select(HeroEntityMapper.ToDomain).ToList();
    }

    public async Task<HeroModel?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var hero = await dbContext.Heroes
            .AsNoTracking()
            .Include(existingHero => existingHero.HeroPowers)
            .FirstOrDefaultAsync(existingHero => existingHero.Id == id, cancellationToken);

        return hero is null ? null : HeroEntityMapper.ToDomain(hero);
    }

    public async Task<HeroModel> CreateAsync(HeroModel hero, CancellationToken cancellationToken = default)
    {
        var entity = HeroEntityMapper.ToEntity(hero);
        dbContext.Heroes.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return HeroEntityMapper.ToDomain(entity);
    }

    public async Task<HeroModel?> UpdateAsync(HeroModel hero, CancellationToken cancellationToken = default)
    {
        var existingHero = await dbContext.Heroes
            .Include(entity => entity.HeroPowers)
            .FirstOrDefaultAsync(entity => entity.Id == hero.Id, cancellationToken);

        if (existingHero is null)
        {
            return null;
        }

        existingHero.Name = hero.Name;
        existingHero.Alias = hero.Alias;
        existingHero.Origin = hero.Origin;

        dbContext.HeroPowers.RemoveRange(existingHero.HeroPowers);
        existingHero.HeroPowers = hero.PowerIds
            .Select((powerId, index) => new HeroPowerEntity
            {
                HeroId = existingHero.Id,
                PowerId = powerId,
                Position = index
            })
            .ToList();

        await dbContext.SaveChangesAsync(cancellationToken);

        existingHero.HeroPowers = existingHero.HeroPowers
            .OrderBy(heroPower => heroPower.Position)
            .ToList();

        return HeroEntityMapper.ToDomain(existingHero);
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var hero = await dbContext.Heroes
            .FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);

        if (hero is null)
        {
            return false;
        }

        dbContext.Heroes.Remove(hero);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
