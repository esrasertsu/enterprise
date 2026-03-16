using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class CouponConfiguration : IEntityTypeConfiguration<Coupon>
{
    public void Configure(EntityTypeBuilder<Coupon> builder)
    {
        builder.ToTable("Coupons");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Code)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Value)
            .HasPrecision(18, 2);

        builder.Property(c => c.MinimumOrderAmount)
            .HasPrecision(18, 2)
            .IsRequired(false);

        builder.Property(c => c.UsageLimit)
            .IsRequired(false);

        builder.Property(c => c.PerCustomerLimit)
            .IsRequired(false);

        builder.Property(c => c.IsActive)
            .HasDefaultValue(true);

        // Relationships
        builder.HasMany(c => c.Orders)
            .WithOne(o => o.Coupon)
            .HasForeignKey(o => o.CouponId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasMany(c => c.Carts)
            .WithOne(ca => ca.Coupon)
            .HasForeignKey(ca => ca.CouponId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(c => c.Code)
            .IsUnique();

        builder.HasIndex(c => c.IsActive);

        builder.HasIndex(c => c.StartsAt);

        builder.HasIndex(c => c.EndsAt);

        // Check constraints
        builder.HasCheckConstraint("CK_Coupons_Value", "\"Value\" >= 0");
        builder.HasCheckConstraint("CK_Coupons_MinimumOrderAmount", "\"MinimumOrderAmount\" IS NULL OR \"MinimumOrderAmount\" >= 0");
        builder.HasCheckConstraint("CK_Coupons_UsageLimit", "\"UsageLimit\" IS NULL OR \"UsageLimit\" > 0");
        builder.HasCheckConstraint("CK_Coupons_PerCustomerLimit", "\"PerCustomerLimit\" IS NULL OR \"PerCustomerLimit\" > 0");
        builder.HasCheckConstraint("CK_Coupons_DateRange", "\"StartsAt\" IS NULL OR \"EndsAt\" IS NULL OR \"StartsAt\" < \"EndsAt\"");
    }
}
