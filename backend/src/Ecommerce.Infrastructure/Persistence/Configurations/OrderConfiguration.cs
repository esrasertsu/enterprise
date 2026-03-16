using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(o => o.CustomerId)
            .IsRequired(false);

        builder.Property(o => o.GuestEmail)
            .HasMaxLength(320)
            .IsRequired(false);

        builder.Property(o => o.BillingAddressSnapshotJson)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(o => o.ShippingAddressSnapshotJson)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(o => o.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("EUR");

        builder.Property(o => o.SubtotalExclVat)
            .HasPrecision(18, 2);

        builder.Property(o => o.DiscountExclVat)
            .HasPrecision(18, 2);

        builder.Property(o => o.ShippingExclVat)
            .HasPrecision(18, 2);

        builder.Property(o => o.VatTotal)
            .HasPrecision(18, 2);

        builder.Property(o => o.GrandTotal)
            .HasPrecision(18, 2);

        builder.Property(o => o.VatNumber)
            .HasMaxLength(50)
            .IsRequired(false);

        builder.Property(o => o.CouponCode)
            .HasMaxLength(100)
            .IsRequired(false);

        builder.Property(o => o.CustomerNote)
            .HasColumnType("text");

        builder.Property(o => o.AdminNote)
            .HasColumnType("text");

        builder.Property(o => o.NeedsDesignSupport)
            .HasDefaultValue(false);

        builder.Property(o => o.IsVatReverseCharge)
            .HasDefaultValue(false);

        // Relationships
        builder.HasOne(o => o.Customer)
            .WithMany(c => c.Orders)
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasOne(o => o.Coupon)
            .WithMany(c => c.Orders)
            .HasForeignKey(o => o.CouponId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasMany(o => o.Items)
            .WithOne(oi => oi.Order)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(o => o.Files)
            .WithOne(of => of.Order)
            .HasForeignKey(of => of.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(o => o.Payments)
            .WithOne(p => p.Order)
            .HasForeignKey(p => p.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(o => o.OrderNumber)
            .IsUnique();

        builder.HasIndex(o => o.CustomerId);

        builder.HasIndex(o => o.CouponId);

        builder.HasIndex(o => o.OrderStatus);

        builder.HasIndex(o => o.PaymentStatus);

        builder.HasIndex(o => o.FulfillmentStatus);

        builder.HasIndex(o => o.CreatedAt);

        // Check constraints
        builder.HasCheckConstraint("CK_Orders_SubtotalExclVat", "\"SubtotalExclVat\" >= 0");
        builder.HasCheckConstraint("CK_Orders_DiscountExclVat", "\"DiscountExclVat\" >= 0");
        builder.HasCheckConstraint("CK_Orders_ShippingExclVat", "\"ShippingExclVat\" >= 0");
        builder.HasCheckConstraint("CK_Orders_VatTotal", "\"VatTotal\" >= 0");
        builder.HasCheckConstraint("CK_Orders_GrandTotal", "\"GrandTotal\" >= 0");
    }
}
