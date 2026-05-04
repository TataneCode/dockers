using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SampleApi.Infrastructure.Entities;

namespace SampleApi.Infrastructure.Configurations;

public sealed class HeroConfiguration : IEntityTypeConfiguration<HeroEntity>
{
    public void Configure(EntityTypeBuilder<HeroEntity> builder)
    {
        builder.ToTable("heroes");
        builder.HasKey(hero => hero.Id);

        builder.Property(hero => hero.Id)
            .HasMaxLength(64);

        builder.Property(hero => hero.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(hero => hero.Alias)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(hero => hero.Origin)
            .HasMaxLength(300)
            .IsRequired();
    }
}
