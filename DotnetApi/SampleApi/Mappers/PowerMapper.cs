using SampleApi.Domain.Models;
using SampleApi.Requests;
using SampleApi.Responses;

namespace SampleApi.Mappers;

public static class PowerMapper
{
    public static PowerResponse ToResponse(PowerModel power) =>
        new(power.Id, power.Name, power.Description, power.Type, power.Level);

    public static PowerModel ToModel(PowerRequest request) =>
        new(string.Empty, request.Name, request.Description, request.Type, request.Level);
}
