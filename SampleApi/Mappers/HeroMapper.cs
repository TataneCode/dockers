using SampleApi.Models;
using SampleApi.Records;

namespace SampleApi.Mappers;

public static class HeroMapper
{
    public static HeroResponse ToResponse(Hero hero) =>
        new(hero.Id, hero.Name, hero.Alias, hero.Origin, hero.PowerIds);

    public static Hero ToModel(HeroRequest request) => new()
    {
        Id = Guid.NewGuid().ToString(),
        Name = request.Name,
        Alias = request.Alias,
        Origin = request.Origin,
        PowerIds = request.PowerIds
    };

    public static void Apply(HeroRequest request, Hero hero)
    {
        hero.Name = request.Name;
        hero.Alias = request.Alias;
        hero.Origin = request.Origin;
        hero.PowerIds = request.PowerIds;
    }
}
