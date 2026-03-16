using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class AdminUserConfiguration : IEntityTypeConfiguration<AdminUser>
{
    public void Configure(EntityTypeBuilder<AdminUser> builder)
    {
        builder.ToTable("AdminUsers");

        builder.HasKey(au => au.Id);

        builder.Property(au => au.Email)
            .IsRequired()
            .HasMaxLength(320);

        builder.Property(au => au.PasswordHash)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(au => au.FullName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(au => au.IsActive)
            .HasDefaultValue(true);

        builder.Property(au => au.LastLoginAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(au => au.Email)
            .IsUnique();

        builder.HasIndex(au => au.IsActive);
    }
}
