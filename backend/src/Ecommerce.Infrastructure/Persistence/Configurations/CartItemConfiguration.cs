using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
{
    public void Configure(EntityTypeBuilder<CartItem> builder)
    {
        builder.ToTable("CartItems");

        builder.HasKey(ci => ci.Id);

        builder.Property(ci => ci.Sku)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(ci => ci.ProductNameSnapshot)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(ci => ci.VariantDescriptionSnapshot)
            .HasColumnType("text");

        builder.Property(ci => ci.UnitPriceExclVat)
            .HasPrecision(18, 2);

        builder.Property(ci => ci.VatRate)
            .HasPrecision(5, 2);

        builder.Property(ci => ci.DiscountExclVat)
            .HasPrecision(18, 2);

        builder.Property(ci => ci.LineTotalExclVat)
            .HasPrecision(18, 2);

        builder.Property(ci => ci.LineVatTotal)
            .HasPrecision(18, 2);

        builder.Property(ci => ci.LineGrandTotal)
            .HasPrecision(18, 2);

        // Relationships - CartItem is a live cart entity, so FK relationships to Product and ProductVariant are configured
        builder.HasOne(ci => ci.Cart)
            .WithMany(c => c.Items)
            .HasForeignKey(ci => ci.CartId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ci => ci.Product)
            .WithMany()
            .HasForeignKey(ci => ci.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ci => ci.ProductVariant)
            .WithMany()
            .HasForeignKey(ci => ci.ProductVariantId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(ci => ci.CartId);

        builder.HasIndex(ci => ci.ProductId);

        builder.HasIndex(ci => ci.ProductVariantId);

        builder.HasIndex(ci => new { ci.CartId, ci.ProductVariantId })
            .IsUnique();

        // Check constraints
        builder.HasCheckConstraint("CK_CartItems_Quantity", "\"Quantity\" > 0");
        builder.HasCheckConstraint("CK_CartItems_UnitPriceExclVat", "\"UnitPriceExclVat\" >= 0");
        builder.HasCheckConstraint("CK_CartItems_DiscountExclVat", "\"DiscountExclVat\" >= 0");
        builder.HasCheckConstraint("CK_CartItems_LineTotalExclVat", "\"LineTotalExclVat\" >= 0");
        builder.HasCheckConstraint("CK_CartItems_LineVatTotal", "\"LineVatTotal\" >= 0");
        builder.HasCheckConstraint("CK_CartItems_LineGrandTotal", "\"LineGrandTotal\" >= 0");
        builder.HasCheckConstraint("CK_CartItems_VatRate", "\"VatRate\" >= 0");
    }
}
