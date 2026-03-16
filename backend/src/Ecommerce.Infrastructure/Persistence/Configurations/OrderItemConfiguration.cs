using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("OrderItems");

        builder.HasKey(oi => oi.Id);

        builder.Property(oi => oi.Sku)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(oi => oi.ProductNameSnapshot)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(oi => oi.VariantDescriptionSnapshot)
            .HasColumnType("text");

        builder.Property(oi => oi.UnitPriceExclVat)
            .HasPrecision(18, 2);

        builder.Property(oi => oi.VatRate)
            .HasPrecision(5, 2);

        builder.Property(oi => oi.DiscountExclVat)
            .HasPrecision(18, 2);

        builder.Property(oi => oi.LineTotalExclVat)
            .HasPrecision(18, 2);

        builder.Property(oi => oi.LineVatTotal)
            .HasPrecision(18, 2);

        builder.Property(oi => oi.LineGrandTotal)
            .HasPrecision(18, 2);

        // Relationships - only configure FK to Order
        builder.HasOne(oi => oi.Order)
            .WithMany(o => o.Items)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(oi => oi.Files)
            .WithOne(of => of.OrderItem)
            .HasForeignKey(of => of.OrderItemId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false);

        // Note: ProductId and ProductVariantId are stored as plain fields for historical/reference purposes
        // No FK relationships are configured for Product or ProductVariant

        // Indexes
        builder.HasIndex(oi => oi.OrderId);

        // Check constraints
        builder.HasCheckConstraint("CK_OrderItems_Quantity", "\"Quantity\" > 0");
        builder.HasCheckConstraint("CK_OrderItems_UnitPriceExclVat", "\"UnitPriceExclVat\" >= 0");
        builder.HasCheckConstraint("CK_OrderItems_DiscountExclVat", "\"DiscountExclVat\" >= 0");
        builder.HasCheckConstraint("CK_OrderItems_LineTotalExclVat", "\"LineTotalExclVat\" >= 0");
        builder.HasCheckConstraint("CK_OrderItems_LineVatTotal", "\"LineVatTotal\" >= 0");
        builder.HasCheckConstraint("CK_OrderItems_LineGrandTotal", "\"LineGrandTotal\" >= 0");
        builder.HasCheckConstraint("CK_OrderItems_VatRate", "\"VatRate\" >= 0");
    }
}
