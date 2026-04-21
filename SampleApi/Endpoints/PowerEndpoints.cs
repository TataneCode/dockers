using SampleApi.Records;
using SampleApi.Services;

namespace SampleApi.Endpoints;

public static class PowerEndpoints
{
    public static IEndpointRouteBuilder MapPowerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/powers").WithTags("Powers");

        group.MapGet("/", async (IEntityService<PowerRequest, PowerResponse> service) =>
            Results.Ok(await service.GetAllAsync()))
            .WithSummary("Get all powers");

        group.MapGet("/{id}", async (string id, IEntityService<PowerRequest, PowerResponse> service) =>
        {
            var power = await service.GetByIdAsync(id);
            return power is null ? Results.NotFound() : Results.Ok(power);
        }).WithSummary("Get power by id");

        group.MapPost("/", async (PowerRequest request, IEntityService<PowerRequest, PowerResponse> service) =>
        {
            var created = await service.CreateAsync(request);
            return Results.Created($"/api/powers/{created.Id}", created);
        }).WithSummary("Create a power");

        group.MapPut("/{id}", async (string id, PowerRequest request, IEntityService<PowerRequest, PowerResponse> service) =>
        {
            var updated = await service.UpdateAsync(id, request);
            return updated is null ? Results.NotFound() : Results.Ok(updated);
        }).WithSummary("Update a power");

        group.MapDelete("/{id}", async (string id, IEntityService<PowerRequest, PowerResponse> service) =>
        {
            var deleted = await service.DeleteAsync(id);
            return deleted ? Results.NoContent() : Results.NotFound();
        }).WithSummary("Delete a power");

        return app;
    }
}
