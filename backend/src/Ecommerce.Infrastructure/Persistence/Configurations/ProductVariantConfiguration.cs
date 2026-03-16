using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> builder)
    {
        builder.ToTable("ProductVariants");

        builder.HasKey(pv => pv.Id);

        builder.Property(pv => pv.Sku)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(pv => pv.Barcode)
            .HasMaxLength(100)
            .IsRequired(false);

        builder.Property(pv => pv.PriceExclVat)
            .HasPrecision(18, 2);

        builder.Property(pv => pv.CompareAtPriceExclVat)
            .HasPrecision(18, 2)
            .IsRequired(false);

        builder.Property(pv => pv.StockQuantity)
            .HasDefaultValue(0);

        builder.Property(pv => pv.ReservedStockQuantity)
            .HasDefaultValue(0);

        builder.Property(pv => pv.IsActive)
            .HasDefaultValue(true);

        // Relationships
        builder.HasOne(pv => pv.Product)
            .WithMany(p => p.Variants)
            .HasForeignKey(pv => pv.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(pv => pv.Sku)
            .IsUnique();

        builder.HasIndex(pv => pv.ProductId);

        // Check constraints
        builder.HasCheckConstraint("CK_ProductVariants_StockQuantity", "\"StockQuantity\" >= 0");
        builder.HasCheckConstraint("CK_ProductVariants_ReservedStockQuantity", "\"ReservedStockQuantity\" >= 0");
        builder.HasCheckConstraint("CK_ProductVariants_PriceExclVat", "\"PriceExclVat\" >= 0");
    }
}
