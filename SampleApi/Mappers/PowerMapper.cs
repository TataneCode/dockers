using SampleApi.Models;
using SampleApi.Records;

namespace SampleApi.Mappers;

public static class PowerMapper
{
    public static PowerResponse ToResponse(Power power) =>
        new(power.Id, power.Name, power.Description, power.Type, power.Level);

    public static Power ToModel(PowerRequest request) => new()
    {
        Id = Guid.NewGuid().ToString(),
        Name = request.Name,
        Description = request.Description,
        Type = request.Type,
        Level = request.Level
    };

    public static void Apply(PowerRequest request, Power power)
    {
        power.Name = request.Name;
        power.Description = request.Description;
        power.Type = request.Type;
        power.Level = request.Level;
    }
}
