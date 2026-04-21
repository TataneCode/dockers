using SampleApi.Mappers;
using SampleApi.Models;
using SampleApi.Records;

namespace SampleApi.Services;

public class HeroService(JsonRepository<Hero> repository)
    : EntityService<Hero, HeroRequest, HeroResponse>(repository)
{
    protected override HeroResponse ToResponse(Hero model) => HeroMapper.ToResponse(model);
    protected override Hero ToModel(HeroRequest request) => HeroMapper.ToModel(request);
    protected override void Apply(HeroRequest request, Hero model) => HeroMapper.Apply(request, model);
}
