using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SampleApi.Domain.Repositories;
using SampleApi.Infrastructure.Data;
using SampleApi.Infrastructure.Options;
using SampleApi.Infrastructure.Repositories;
using SampleApi.Infrastructure.Seeding;

namespace SampleApi.Infrastructure;

public static class DependencyInjection
{
    private static readonly MySqlServerVersion ServerVersion = new(new Version(8, 4, 0));

    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("SampleApiDatabase")
            ?? throw new InvalidOperationException(
                "Connection string 'SampleApiDatabase' was not found.");

        services.AddDbContext<SampleApiDbContext>(options =>
            options.UseMySql(connectionString, ServerVersion));

        services.Configure<JsonSeedOptions>(configuration.GetSection(JsonSeedOptions.SectionName));

        services.AddScoped<IHeroRepository, HeroRepository>();
        services.AddScoped<IPowerRepository, PowerRepository>();
        services.AddHostedService<DatabaseInitializationHostedService>();

        return services;
    }
}
