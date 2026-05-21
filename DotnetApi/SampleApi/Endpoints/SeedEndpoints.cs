using SampleApi.Application.Services;
using SampleApi.Requests;
using SampleApi.Responses;

namespace SampleApi.Endpoints;

public static class SeedEndpoints
{
    public static IEndpointRouteBuilder MapSeedEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/seed").WithTags("Seed");

        group.MapPost("/", async (SeedRequest request, ISeedService service, CancellationToken cancellationToken) =>
        {
            var result = await service.SeedAsync(request.HeroCount, request.PowerCount, cancellationToken);
            return Results.Ok(new SeedResponse(result.HeroesCreated, result.PowersCreated));
        })
            .WithSummary("Seed the database")
            .WithDescription("Creates the specified number of random heroes and powers.")
            .Produces<SeedResponse>(StatusCodes.Status200OK);

        group.MapDelete("/", async (ISeedService service, CancellationToken cancellationToken) =>
        {
            await service.CleanAsync(cancellationToken);
            return Results.NoContent();
        })
            .WithSummary("Clean the database")
            .WithDescription("Deletes all heroes and powers from the database.")
            .Produces(StatusCodes.Status204NoContent);

        return app;
    }
}
