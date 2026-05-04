using SampleApi.Application.Exceptions;
using SampleApi.Application.Services;
using SampleApi.Mappers;
using SampleApi.Requests;

namespace SampleApi.Endpoints;

public static class HeroEndpoints
{
    public static IEndpointRouteBuilder MapHeroEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/heroes").WithTags("Heroes");

        group.MapGet("/", async (IHeroService service, CancellationToken cancellationToken) =>
            Results.Ok((await service.GetAllAsync(cancellationToken)).Select(HeroMapper.ToResponse)))
            .WithSummary("Get all heroes");

        group.MapGet("/{id}", async (string id, IHeroService service, CancellationToken cancellationToken) =>
        {
            var hero = await service.GetByIdAsync(id, cancellationToken);
            return hero is null ? Results.NotFound() : Results.Ok(HeroMapper.ToResponse(hero));
        }).WithSummary("Get hero by id");

        group.MapPost("/", async (HeroRequest request, IHeroService service, CancellationToken cancellationToken) =>
        {
            try
            {
                var created = await service.CreateAsync(HeroMapper.ToModel(request), cancellationToken);
                return Results.Created($"/api/heroes/{created.Id}", HeroMapper.ToResponse(created));
            }
            catch (InvalidPowerReferenceException exception)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["powerIds"] = exception.MissingPowerIds.ToArray()
                });
            }
        }).WithSummary("Create a hero");

        group.MapPut("/{id}", async (string id, HeroRequest request, IHeroService service, CancellationToken cancellationToken) =>
        {
            try
            {
                var updated = await service.UpdateAsync(id, HeroMapper.ToModel(request), cancellationToken);
                return updated is null ? Results.NotFound() : Results.Ok(HeroMapper.ToResponse(updated));
            }
            catch (InvalidPowerReferenceException exception)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["powerIds"] = exception.MissingPowerIds.ToArray()
                });
            }
        }).WithSummary("Update a hero");

        group.MapDelete("/{id}", async (string id, IHeroService service, CancellationToken cancellationToken) =>
        {
            var deleted = await service.DeleteAsync(id, cancellationToken);
            return deleted ? Results.NoContent() : Results.NotFound();
        }).WithSummary("Delete a hero");

        return app;
    }
}
