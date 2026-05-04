using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SampleApi.Infrastructure.Entities;

namespace SampleApi.Infrastructure.Configurations;

public sealed class HeroPowerConfiguration : IEntityTypeConfiguration<HeroPowerEntity>
{
    public void Configure(EntityTypeBuilder<HeroPowerEntity> builder)
    {
        builder.ToTable("hero_powers");
        builder.HasKey(heroPower => new { heroPower.HeroId, heroPower.PowerId });

        builder.Property(heroPower => heroPower.HeroId)
            .HasMaxLength(64);

        builder.Property(heroPower => heroPower.PowerId)
            .HasMaxLength(64);

        builder.HasIndex(heroPower => new { heroPower.HeroId, heroPower.Position });

        builder.HasOne(heroPower => heroPower.Hero)
            .WithMany(hero => hero.HeroPowers)
            .HasForeignKey(heroPower => heroPower.HeroId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(heroPower => heroPower.Power)
            .WithMany(power => power.HeroPowers)
            .HasForeignKey(heroPower => heroPower.PowerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
