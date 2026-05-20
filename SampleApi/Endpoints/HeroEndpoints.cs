using Microsoft.AspNetCore.Http.HttpResults;
using SampleApi.Application.Exceptions;
using SampleApi.Application.Services;
using SampleApi.Mappers;
using SampleApi.Requests;
using SampleApi.Responses;

namespace SampleApi.Endpoints;

public static class HeroEndpoints
{
    public static IEndpointRouteBuilder MapHeroEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/heroes").WithTags("Heroes");

        group.MapGet("/", async (IHeroService service, CancellationToken cancellationToken) =>
            Results.Ok((await service.GetAllAsync(cancellationToken)).Select(HeroMapper.ToResponse)))
            .WithSummary("Get all heroes")
            .WithDescription("Returns a list of all heroes.")
            .Produces<IEnumerable<HeroResponse>>(StatusCodes.Status200OK);

        group.MapGet("/{id}", async (string id, IHeroService service, CancellationToken cancellationToken) =>
        {
            var hero = await service.GetByIdAsync(id, cancellationToken);
            return hero is null ? Results.NotFound() : Results.Ok(HeroMapper.ToResponse(hero));
        })
            .WithSummary("Get a hero by ID")
            .WithDescription("Returns the hero with the specified ID.")
            .Produces<HeroResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/", async (HeroRequest request, IHeroService service, CancellationToken cancellationToken) =>
        {
            try
            {
                var created = await service.CreateAsync(HeroMapper.ToModel(request), cancellationToken);
                return Results.Created($"/api/heroes/{created.Id}", HeroMapper.ToResponse(created));
            }
            catch (InvalidPowerReferenceException exception)
            {
                return Results.ValidationProblem(
                    new Dictionary<string, string[]> { ["powerIds"] = exception.MissingPowerIds.ToArray() },
                    statusCode: StatusCodes.Status422UnprocessableEntity);
            }
        })
            .WithSummary("Create a hero")
            .WithDescription("Creates a new hero and returns the created resource.")
            .Produces<HeroResponse>(StatusCodes.Status201Created)
            .ProducesValidationProblem(StatusCodes.Status422UnprocessableEntity);

        group.MapPut("/{id}", async (string id, HeroRequest request, IHeroService service, CancellationToken cancellationToken) =>
        {
            try
            {
                var updated = await service.UpdateAsync(id, HeroMapper.ToModel(request), cancellationToken);
                return updated is null ? Results.NotFound() : Results.Ok(HeroMapper.ToResponse(updated));
            }
            catch (InvalidPowerReferenceException exception)
            {
                return Results.ValidationProblem(
                    new Dictionary<string, string[]> { ["powerIds"] = exception.MissingPowerIds.ToArray() },
                    statusCode: StatusCodes.Status422UnprocessableEntity);
            }
        })
            .WithSummary("Update a hero")
            .WithDescription("Updates an existing hero and returns the updated resource.")
            .Produces<HeroResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .ProducesValidationProblem(StatusCodes.Status422UnprocessableEntity);

        group.MapDelete("/{id}", async (string id, IHeroService service, CancellationToken cancellationToken) =>
        {
            var deleted = await service.DeleteAsync(id, cancellationToken);
            return deleted ? Results.NoContent() : Results.NotFound();
        })
            .WithSummary("Delete a hero")
            .WithDescription("Deletes the hero with the specified ID.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);

        return app;
    }
}
