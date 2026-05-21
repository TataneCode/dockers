using Microsoft.EntityFrameworkCore;
using SampleApi.Infrastructure.Entities;

namespace SampleApi.Infrastructure.Data;

public sealed class SampleApiDbContext(DbContextOptions<SampleApiDbContext> options) : DbContext(options)
{
    public DbSet<HeroEntity> Heroes => Set<HeroEntity>();
    public DbSet<PowerEntity> Powers => Set<PowerEntity>();
    public DbSet<HeroPowerEntity> HeroPowers => Set<HeroPowerEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SampleApiDbContext).Assembly);
    }
}
