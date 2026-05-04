using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SampleApi.Infrastructure.Data;
using SampleApi.Infrastructure.Entities;
using SampleApi.Infrastructure.Options;

namespace SampleApi.Infrastructure.Seeding;

public sealed class DatabaseInitializationHostedService(
    IServiceProvider serviceProvider,
    IHostEnvironment hostEnvironment,
    IOptions<JsonSeedOptions> seedOptions,
    ILogger<DatabaseInitializationHostedService> logger) : IHostedService
{
    private static readonly JsonSerializerOptions JsonSerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await using var scope = serviceProvider.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<SampleApiDbContext>();

        await dbContext.Database.MigrateAsync(cancellationToken);

        if (!seedOptions.Value.Enabled)
        {
            return;
        }

        await SeedFromJsonAsync(dbContext, cancellationToken);
        logger.LogInformation("SampleApi database seeded from JSON files.");
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private async Task SeedFromJsonAsync(
        SampleApiDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (await dbContext.Powers.AnyAsync(cancellationToken) ||
            await dbContext.Heroes.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Skipping JSON seed because the database already contains data.");
            return;
        }

        var dataPath = seedOptions.Value.DataPath;
        if (!Path.IsPathRooted(dataPath))
        {
            dataPath = Path.Combine(hostEnvironment.ContentRootPath, dataPath);
        }

        var powersFilePath = Path.Combine(dataPath, "powers.json");
        var heroesFilePath = Path.Combine(dataPath, "heroes.json");

        if (!File.Exists(powersFilePath) || !File.Exists(heroesFilePath))
        {
            throw new FileNotFoundException(
                $"JSON seed files were not found in '{dataPath}'.");
        }

        var powers = await ReadJsonAsync<List<PowerSeedItem>>(powersFilePath, cancellationToken);
        var heroes = await ReadJsonAsync<List<HeroSeedItem>>(heroesFilePath, cancellationToken);

        dbContext.Powers.AddRange(powers.Select(power => new PowerEntity
        {
            Id = power.Id,
            Name = power.Name,
            Description = power.Description,
            Type = power.Type,
            Level = power.Level
        }));

        dbContext.Heroes.AddRange(heroes.Select(hero => new HeroEntity
        {
            Id = hero.Id,
            Name = hero.Name,
            Alias = hero.Alias,
            Origin = hero.Origin,
            HeroPowers = hero.PowerIds
                .Select((powerId, index) => new HeroPowerEntity
                {
                    HeroId = hero.Id,
                    PowerId = powerId,
                    Position = index
                })
                .ToList()
        }));

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static async Task<T> ReadJsonAsync<T>(string path, CancellationToken cancellationToken)
    {
        await using var stream = File.OpenRead(path);
        var data = await JsonSerializer.DeserializeAsync<T>(
            stream,
            JsonSerializerOptions,
            cancellationToken);

        return data ?? throw new InvalidOperationException($"Could not deserialize '{path}'.");
    }

    private sealed record HeroSeedItem(
        string Id,
        string Name,
        string Alias,
        string Origin,
        List<string> PowerIds);

    private sealed record PowerSeedItem(
        string Id,
        string Name,
        string Description,
        string Type,
        int Level);
}
