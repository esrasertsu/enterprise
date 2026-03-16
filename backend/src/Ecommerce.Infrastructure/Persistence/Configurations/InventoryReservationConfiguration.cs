using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class InventoryReservationConfiguration : IEntityTypeConfiguration<InventoryReservation>
{
    public void Configure(EntityTypeBuilder<InventoryReservation> builder)
    {
        builder.ToTable("InventoryReservations");

        builder.HasKey(ir => ir.Id);

        builder.Property(ir => ir.Quantity)
            .IsRequired();

        builder.Property(ir => ir.Status)
            .IsRequired()
            .HasDefaultValue(ReservationStatus.Pending);

        builder.Property(ir => ir.ExpiresAt)
            .IsRequired();

        builder.Property(ir => ir.OrderId)
            .IsRequired(false);

        builder.Property(ir => ir.CartId)
            .IsRequired(false);

        // Relationships
        builder.HasOne(ir => ir.ProductVariant)
            .WithMany()
            .HasForeignKey(ir => ir.ProductVariantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ir => ir.Order)
            .WithMany()
            .HasForeignKey(ir => ir.OrderId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasOne(ir => ir.Cart)
            .WithMany()
            .HasForeignKey(ir => ir.CartId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(ir => ir.ProductVariantId);

        builder.HasIndex(ir => ir.OrderId)
            .HasFilter("\"OrderId\" IS NOT NULL");

        builder.HasIndex(ir => ir.CartId)
            .HasFilter("\"CartId\" IS NOT NULL");

        builder.HasIndex(ir => ir.Status);

        builder.HasIndex(ir => ir.ExpiresAt);

        builder.HasIndex(ir => new { ir.ProductVariantId, ir.Status });

        // Check constraints
        builder.HasCheckConstraint("CK_InventoryReservations_Quantity", "\"Quantity\" > 0");
        builder.HasCheckConstraint("CK_InventoryReservations_ExpiresAt", "\"ExpiresAt\" > \"CreatedAt\"");
    }
}
