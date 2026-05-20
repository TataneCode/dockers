using SampleApi.Application.Services;
using SampleApi.Mappers;
using SampleApi.Requests;
using SampleApi.Responses;

namespace SampleApi.Endpoints;

public static class PowerEndpoints
{
    public static IEndpointRouteBuilder MapPowerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/powers").WithTags("Powers");

        group.MapGet("/", async (IPowerService service, CancellationToken cancellationToken) =>
            Results.Ok((await service.GetAllAsync(cancellationToken)).Select(PowerMapper.ToResponse)))
            .WithSummary("Get all powers")
            .WithDescription("Returns a list of all powers.")
            .Produces<IEnumerable<PowerResponse>>(StatusCodes.Status200OK);

        group.MapGet("/{id}", async (string id, IPowerService service, CancellationToken cancellationToken) =>
        {
            var power = await service.GetByIdAsync(id, cancellationToken);
            return power is null ? Results.NotFound() : Results.Ok(PowerMapper.ToResponse(power));
        })
            .WithSummary("Get a power by ID")
            .WithDescription("Returns the power with the specified ID.")
            .Produces<PowerResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/", async (PowerRequest request, IPowerService service, CancellationToken cancellationToken) =>
        {
            var created = await service.CreateAsync(PowerMapper.ToModel(request), cancellationToken);
            return Results.Created($"/api/powers/{created.Id}", PowerMapper.ToResponse(created));
        })
            .WithSummary("Create a power")
            .WithDescription("Creates a new power and returns the created resource.")
            .Produces<PowerResponse>(StatusCodes.Status201Created);

        group.MapPut("/{id}", async (string id, PowerRequest request, IPowerService service, CancellationToken cancellationToken) =>
        {
            var updated = await service.UpdateAsync(id, PowerMapper.ToModel(request), cancellationToken);
            return updated is null ? Results.NotFound() : Results.Ok(PowerMapper.ToResponse(updated));
        })
            .WithSummary("Update a power")
            .WithDescription("Updates an existing power and returns the updated resource.")
            .Produces<PowerResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapDelete("/{id}", async (string id, IPowerService service, CancellationToken cancellationToken) =>
        {
            var deleted = await service.DeleteAsync(id, cancellationToken);
            return deleted ? Results.NoContent() : Results.NotFound();
        })
            .WithSummary("Delete a power")
            .WithDescription("Deletes the power with the specified ID.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);

        return app;
    }
}
