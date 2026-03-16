using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class WishlistConfiguration : IEntityTypeConfiguration<Wishlist>
{
    public void Configure(EntityTypeBuilder<Wishlist> builder)
    {
        builder.ToTable("Wishlists");

        builder.HasKey(w => w.Id);

        builder.Property(w => w.ProductVariantId)
            .IsRequired(false);

        // Relationships
        builder.HasOne(w => w.Customer)
            .WithMany(c => c.WishlistItems)
            .HasForeignKey(w => w.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(w => w.Product)
            .WithMany()
            .HasForeignKey(w => w.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(w => w.ProductVariant)
            .WithMany()
            .HasForeignKey(w => w.ProductVariantId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(w => w.CustomerId);

        builder.HasIndex(w => w.ProductId);

        builder.HasIndex(w => w.ProductVariantId);

        builder.HasIndex(w => new { w.CustomerId, w.ProductId, w.ProductVariantId })
            .IsUnique();
    }
}
