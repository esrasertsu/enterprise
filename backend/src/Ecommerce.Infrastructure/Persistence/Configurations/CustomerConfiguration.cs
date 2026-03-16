using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("Customers");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Email)
            .IsRequired()
            .HasMaxLength(320);

        builder.Property(c => c.PasswordHash)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(c => c.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Phone)
            .HasMaxLength(32)
            .IsRequired(false);

        builder.Property(c => c.CompanyName)
            .HasMaxLength(200)
            .IsRequired(false);

        builder.Property(c => c.VatNumber)
            .HasMaxLength(50)
            .IsRequired(false);

        builder.Property(c => c.PreferredLanguage)
            .IsRequired()
            .HasMaxLength(10)
            .HasDefaultValue("en");

        builder.Property(c => c.IsActive)
            .HasDefaultValue(true);

        builder.Property(c => c.EmailConfirmed)
            .HasDefaultValue(false);

        // Relationships
        builder.HasMany(c => c.Addresses)
            .WithOne(ca => ca.Customer)
            .HasForeignKey(ca => ca.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.Orders)
            .WithOne(o => o.Customer)
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasMany(c => c.Carts)
            .WithOne(ca => ca.Customer)
            .HasForeignKey(ca => ca.CustomerId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasMany(c => c.WishlistItems)
            .WithOne(w => w.Customer)
            .HasForeignKey(w => w.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(c => c.Email)
            .IsUnique();

        builder.HasIndex(c => c.IsActive);

        builder.HasIndex(c => c.EmailConfirmed);
    }
}
