using SampleApi.Domain.Models;
using SampleApi.Infrastructure.Entities;

namespace SampleApi.Infrastructure.Mappers;

internal static class PowerEntityMapper
{
    public static PowerModel ToDomain(PowerEntity entity) =>
        new(entity.Id, entity.Name, entity.Description, entity.Type, entity.Level);

    public static PowerEntity ToEntity(PowerModel model) =>
        new()
        {
            Id = model.Id,
            Name = model.Name,
            Description = model.Description,
            Type = model.Type,
            Level = model.Level
        };
}
