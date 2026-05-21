using SampleApi.Domain.Models;
using SampleApi.Infrastructure.Entities;

namespace SampleApi.Infrastructure.Mappers;

internal static class HeroEntityMapper
{
    public static HeroModel ToDomain(HeroEntity entity) =>
        new(
            entity.Id,
            entity.Name,
            entity.Alias,
            entity.Origin,
            entity.HeroPowers
                .OrderBy(heroPower => heroPower.Position)
                .Select(heroPower => heroPower.PowerId)
                .ToArray());

    public static HeroEntity ToEntity(HeroModel model) =>
        new()
        {
            Id = model.Id,
            Name = model.Name,
            Alias = model.Alias,
            Origin = model.Origin,
            HeroPowers = model.PowerIds
                .Select((powerId, index) => new HeroPowerEntity
                {
                    HeroId = model.Id,
                    PowerId = powerId,
                    Position = index
                })
                .ToList()
        };
}
