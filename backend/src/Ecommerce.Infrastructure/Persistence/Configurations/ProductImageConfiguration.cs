using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.ToTable("ProductImages");

        builder.HasKey(pi => pi.Id);

        builder.Property(pi => pi.Url)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(pi => pi.AltText)
            .HasMaxLength(200)
            .IsRequired(false);

        builder.Property(pi => pi.IsMain)
            .HasDefaultValue(false);

        builder.Property(pi => pi.ProductVariantId)
            .IsRequired(false);

        // Relationships
        builder.HasOne(pi => pi.Product)
            .WithMany(p => p.Images)
            .HasForeignKey(pi => pi.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pi => pi.ProductVariant)
            .WithMany()
            .HasForeignKey(pi => pi.ProductVariantId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(pi => pi.ProductId);

        builder.HasIndex(pi => pi.ProductVariantId);

        builder.HasIndex(pi => new { pi.ProductId, pi.IsMain });
    }
}
