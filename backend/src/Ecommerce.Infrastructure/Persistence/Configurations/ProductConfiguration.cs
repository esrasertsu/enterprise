using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Slug)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.SkuRoot)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.ProductType)
            .IsRequired();

        builder.Property(p => p.IsActive)
            .HasDefaultValue(true);

        builder.Property(p => p.IsFeatured)
            .HasDefaultValue(false);

        builder.Property(p => p.IsCustomizable)
            .HasDefaultValue(false);

        builder.Property(p => p.HasVariants)
            .HasDefaultValue(false);

        builder.Property(p => p.RequiresArtwork)
            .HasDefaultValue(false);

        builder.Property(p => p.Recyclable)
            .HasDefaultValue(false);

        builder.Property(p => p.FoodSafe)
            .HasDefaultValue(false);

        builder.Property(p => p.MinOrderQuantity)
            .HasDefaultValue(1);

        builder.Property(p => p.MaxOrderQuantity)
            .IsRequired(false);

        builder.Property(p => p.LeadTimeDays)
            .IsRequired(false);

        builder.Property(p => p.BaseVatRate)
            .HasPrecision(5, 2);

        builder.Property(p => p.WeightGrams)
            .HasPrecision(18, 3)
            .IsRequired(false);

        builder.Property(p => p.MaterialSummary)
            .HasColumnType("text");

        builder.Property(p => p.OriginCountry)
            .HasMaxLength(2);

        // Relationships
        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(p => p.Translations)
            .WithOne(pt => pt.Product)
            .HasForeignKey(pt => pt.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Variants)
            .WithOne(pv => pv.Product)
            .HasForeignKey(pv => pv.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Images)
            .WithOne(pi => pi.Product)
            .HasForeignKey(pi => pi.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Attributes)
            .WithOne(pa => pa.Product)
            .HasForeignKey(pa => pa.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(p => p.Slug)
            .IsUnique();

        builder.HasIndex(p => p.SkuRoot)
            .IsUnique();

        builder.HasIndex(p => p.CategoryId);

        builder.HasIndex(p => p.IsActive);

        builder.HasIndex(p => p.IsFeatured);
    }
}
