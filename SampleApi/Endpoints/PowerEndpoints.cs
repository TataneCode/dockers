using SampleApi.Application.Services;
using SampleApi.Mappers;
using SampleApi.Requests;

namespace SampleApi.Endpoints;

public static class PowerEndpoints
{
    public static IEndpointRouteBuilder MapPowerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/powers").WithTags("Powers");

        group.MapGet("/", async (IPowerService service, CancellationToken cancellationToken) =>
            Results.Ok((await service.GetAllAsync(cancellationToken)).Select(PowerMapper.ToResponse)))
            .WithSummary("Get all powers");

        group.MapGet("/{id}", async (string id, IPowerService service, CancellationToken cancellationToken) =>
        {
            var power = await service.GetByIdAsync(id, cancellationToken);
            return power is null ? Results.NotFound() : Results.Ok(PowerMapper.ToResponse(power));
        }).WithSummary("Get power by id");

        group.MapPost("/", async (PowerRequest request, IPowerService service, CancellationToken cancellationToken) =>
        {
            var created = await service.CreateAsync(PowerMapper.ToModel(request), cancellationToken);
            return Results.Created($"/api/powers/{created.Id}", PowerMapper.ToResponse(created));
        }).WithSummary("Create a power");

        group.MapPut("/{id}", async (string id, PowerRequest request, IPowerService service, CancellationToken cancellationToken) =>
        {
            var updated = await service.UpdateAsync(id, PowerMapper.ToModel(request), cancellationToken);
            return updated is null ? Results.NotFound() : Results.Ok(PowerMapper.ToResponse(updated));
        }).WithSummary("Update a power");

        group.MapDelete("/{id}", async (string id, IPowerService service, CancellationToken cancellationToken) =>
        {
            var deleted = await service.DeleteAsync(id, cancellationToken);
            return deleted ? Results.NoContent() : Results.NotFound();
        }).WithSummary("Delete a power");

        return app;
    }
}
