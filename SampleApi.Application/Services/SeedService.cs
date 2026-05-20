using SampleApi.Domain.Models;

namespace SampleApi.Application.Services;

public sealed class SeedService(IHeroService heroService, IPowerService powerService) : ISeedService
{
    private static readonly string[] PowerPrefixes =
        ["Flame", "Ice", "Shadow", "Lightning", "Stone", "Wind", "Void", "Solar", "Dark", "Aqua", "Iron", "Psychic"];

    private static readonly string[] PowerSuffixes =
        ["Strike", "Shield", "Burst", "Wave", "Blast", "Pulse", "Surge", "Slam", "Ray", "Aura"];

    private static readonly string[] PowerTypes = ["Physical", "Mental", "Elemental", "Tech"];

    private static readonly string[] HeroFirstNames =
        ["Alex", "Maya", "Jordan", "Sam", "Riley", "Morgan", "Casey", "Quinn", "Skyler", "Drake"];

    private static readonly string[] HeroLastNames =
        ["Rivers", "Storm", "Blaze", "Shield", "Arrow", "Night", "Star", "Hunter", "Cross", "Steele"];

    private static readonly string[] AliasAdjectives =
        ["Mighty", "Dark", "Iron", "Swift", "Blazing", "Fearless", "Silent", "Cosmic", "Raging", "Steel"];

    private static readonly string[] AliasNouns =
        ["Falcon", "Tiger", "Phoenix", "Wolf", "Dragon", "Eagle", "Shark", "Panther", "Viper", "Hawk"];

    private static readonly string[] Origins =
    [
        "New York City", "Metropolis", "Gotham City", "Star City", "Central City",
        "Coast City", "Keystone City", "Hub City", "Midway City", "Gateway City"
    ];

    public async Task<SeedResult> SeedAsync(
        int heroCount,
        int powerCount,
        CancellationToken cancellationToken = default)
    {
        var rng = Random.Shared;
        var createdPowerIds = new List<string>(powerCount);

        for (var i = 0; i < powerCount; i++)
        {
            var prefix = Pick(rng, PowerPrefixes);
            var suffix = Pick(rng, PowerSuffixes);
            var created = await powerService.CreateAsync(new PowerModel(
                Id: string.Empty,
                Name: $"{prefix} {suffix}",
                Description: $"Harnesses {prefix.ToLowerInvariant()} energy to unleash a powerful {suffix.ToLowerInvariant()}.",
                Type: Pick(rng, PowerTypes),
                Level: rng.Next(1, 11)), cancellationToken);
            createdPowerIds.Add(created.Id);
        }

        for (var i = 0; i < heroCount; i++)
        {
            var firstName = Pick(rng, HeroFirstNames);
            var lastName = Pick(rng, HeroLastNames);
            var adjective = Pick(rng, AliasAdjectives);
            var noun = Pick(rng, AliasNouns);

            var selectedCount = createdPowerIds.Count > 0
                ? rng.Next(0, Math.Min(4, createdPowerIds.Count) + 1)
                : 0;
            var selectedPowerIds = createdPowerIds
                .OrderBy(_ => rng.Next())
                .Take(selectedCount)
                .ToList();

            await heroService.CreateAsync(new HeroModel(
                Id: string.Empty,
                Name: $"{firstName} {lastName}",
                Alias: $"The {adjective} {noun}",
                Origin: Pick(rng, Origins),
                PowerIds: selectedPowerIds), cancellationToken);
        }

        return new SeedResult(heroCount, powerCount);
    }

    public async Task CleanAsync(CancellationToken cancellationToken = default)
    {
        await heroService.DeleteAllAsync(cancellationToken);
        await powerService.DeleteAllAsync(cancellationToken);
    }

    private static T Pick<T>(Random rng, T[] array) => array[rng.Next(array.Length)];
}
