using SampleApi.Mappers;
using SampleApi.Models;
using SampleApi.Records;

namespace SampleApi.Services;

public class PowerService(JsonRepository<Power> repository)
    : EntityService<Power, PowerRequest, PowerResponse>(repository)
{
    protected override PowerResponse ToResponse(Power model) => PowerMapper.ToResponse(model);
    protected override Power ToModel(PowerRequest request) => PowerMapper.ToModel(request);
    protected override void Apply(PowerRequest request, Power model) => PowerMapper.Apply(request, model);
}
