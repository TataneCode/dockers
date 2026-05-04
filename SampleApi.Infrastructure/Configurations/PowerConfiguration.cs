using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SampleApi.Infrastructure.Entities;

namespace SampleApi.Infrastructure.Configurations;

public sealed class PowerConfiguration : IEntityTypeConfiguration<PowerEntity>
{
    public void Configure(EntityTypeBuilder<PowerEntity> builder)
    {
        builder.ToTable("powers");
        builder.HasKey(power => power.Id);

        builder.Property(power => power.Id)
            .HasMaxLength(64);

        builder.Property(power => power.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(power => power.Description)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(power => power.Type)
            .HasMaxLength(100)
            .IsRequired();
    }
}
