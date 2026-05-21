using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace SampleApi.Infrastructure.Data;

public sealed class SampleApiDbContextFactory : IDesignTimeDbContextFactory<SampleApiDbContext>
{
    private static readonly MySqlServerVersion ServerVersion = new(new Version(8, 4, 0));

    public SampleApiDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__SampleApiDatabase")
            ?? "Server=localhost;Port=3306;Database=sample_api;User=heroes_app;Password=heroes_app;";

        var optionsBuilder = new DbContextOptionsBuilder<SampleApiDbContext>();
        optionsBuilder.UseMySql(connectionString, ServerVersion);

        return new SampleApiDbContext(optionsBuilder.Options);
    }
}
