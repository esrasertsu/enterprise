using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class ProductAttributeConfiguration : IEntityTypeConfiguration<ProductAttribute>
{
    public void Configure(EntityTypeBuilder<ProductAttribute> builder)
    {
        builder.ToTable("ProductAttributes");

        builder.HasKey(pa => pa.Id);

        builder.Property(pa => pa.AttributeKey)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(pa => pa.AttributeValue)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(pa => pa.LanguageCode)
            .HasMaxLength(10)
            .IsRequired(false);

        builder.Property(pa => pa.IsFilterable)
            .HasDefaultValue(false);

        // Relationships
        builder.HasOne(pa => pa.Product)
            .WithMany(p => p.Attributes)
            .HasForeignKey(pa => pa.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(pa => pa.ProductId);

        builder.HasIndex(pa => new { pa.ProductId, pa.AttributeKey, pa.LanguageCode });

        builder.HasIndex(pa => pa.IsFilterable);
    }
}
