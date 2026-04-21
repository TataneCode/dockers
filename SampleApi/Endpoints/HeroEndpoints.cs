using SampleApi.Records;
using SampleApi.Services;

namespace SampleApi.Endpoints;

public static class HeroEndpoints
{
    public static IEndpointRouteBuilder MapHeroEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/heroes").WithTags("Heroes");

        group.MapGet("/", async (IEntityService<HeroRequest, HeroResponse> service) =>
            Results.Ok(await service.GetAllAsync()))
            .WithSummary("Get all heroes");

        group.MapGet("/{id}", async (string id, IEntityService<HeroRequest, HeroResponse> service) =>
        {
            var hero = await service.GetByIdAsync(id);
            return hero is null ? Results.NotFound() : Results.Ok(hero);
        }).WithSummary("Get hero by id");

        group.MapPost("/", async (HeroRequest request, IEntityService<HeroRequest, HeroResponse> service) =>
        {
            var created = await service.CreateAsync(request);
            return Results.Created($"/api/heroes/{created.Id}", created);
        }).WithSummary("Create a hero");

        group.MapPut("/{id}", async (string id, HeroRequest request, IEntityService<HeroRequest, HeroResponse> service) =>
        {
            var updated = await service.UpdateAsync(id, request);
            return updated is null ? Results.NotFound() : Results.Ok(updated);
        }).WithSummary("Update a hero");

        group.MapDelete("/{id}", async (string id, IEntityService<HeroRequest, HeroResponse> service) =>
        {
            var deleted = await service.DeleteAsync(id);
            return deleted ? Results.NoContent() : Results.NotFound();
        }).WithSummary("Delete a hero");

        return app;
    }
}
