using SampleApi.Domain.Models;
using SampleApi.Requests;
using SampleApi.Responses;

namespace SampleApi.Mappers;

public static class HeroMapper
{
    public static HeroResponse ToResponse(HeroModel hero) =>
        new(hero.Id, hero.Name, hero.Alias, hero.Origin, hero.PowerIds.ToList());

    public static HeroModel ToModel(HeroRequest request) =>
        new(string.Empty, request.Name, request.Alias, request.Origin, request.PowerIds ?? []);
}
