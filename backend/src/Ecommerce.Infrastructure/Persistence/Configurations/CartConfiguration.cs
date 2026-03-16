using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class CartConfiguration : IEntityTypeConfiguration<Cart>
{
    public void Configure(EntityTypeBuilder<Cart> builder)
    {
        builder.ToTable("Carts");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.CustomerId)
            .IsRequired(false);

        builder.Property(c => c.SessionId)
            .HasMaxLength(255)
            .IsRequired(false);

        builder.Property(c => c.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("EUR");

        builder.Property(c => c.CouponId)
            .IsRequired(false);

        builder.Property(c => c.CouponCodeSnapshot)
            .HasMaxLength(100)
            .IsRequired(false);

        builder.Property(c => c.SubtotalExclVat)
            .HasPrecision(18, 2);

        builder.Property(c => c.DiscountExclVat)
            .HasPrecision(18, 2);

        builder.Property(c => c.VatTotal)
            .HasPrecision(18, 2);

        builder.Property(c => c.GrandTotal)
            .HasPrecision(18, 2);

        builder.Property(c => c.ConvertedToOrderId)
            .IsRequired(false);

        // Relationships
        builder.HasOne(c => c.Customer)
            .WithMany(cu => cu.Carts)
            .HasForeignKey(c => c.CustomerId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasOne(c => c.Coupon)
            .WithMany(co => co.Carts)
            .HasForeignKey(c => c.CouponId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasOne(c => c.ConvertedToOrder)
            .WithMany()
            .HasForeignKey(c => c.ConvertedToOrderId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasMany(c => c.Items)
            .WithOne(ci => ci.Cart)
            .HasForeignKey(ci => ci.CartId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(c => c.CustomerId);

        builder.HasIndex(c => c.CouponId);

        builder.HasIndex(c => c.SessionId)
            .IsUnique()
            .HasFilter("\"SessionId\" IS NOT NULL");

        builder.HasIndex(c => c.ConvertedToOrderId)
            .IsUnique()
            .HasFilter("\"ConvertedToOrderId\" IS NOT NULL");

        // Check constraints
        builder.HasCheckConstraint("CK_Carts_CustomerOrSession", "\"CustomerId\" IS NOT NULL OR \"SessionId\" IS NOT NULL");
        builder.HasCheckConstraint("CK_Carts_SubtotalExclVat", "\"SubtotalExclVat\" >= 0");
        builder.HasCheckConstraint("CK_Carts_DiscountExclVat", "\"DiscountExclVat\" >= 0");
        builder.HasCheckConstraint("CK_Carts_VatTotal", "\"VatTotal\" >= 0");
        builder.HasCheckConstraint("CK_Carts_GrandTotal", "\"GrandTotal\" >= 0");
    }
}
