using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class ProductTranslationConfiguration : IEntityTypeConfiguration<ProductTranslation>
{
    public void Configure(EntityTypeBuilder<ProductTranslation> builder)
    {
        builder.ToTable("ProductTranslations");

        builder.HasKey(pt => pt.Id);

        builder.Property(pt => pt.LanguageCode)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(pt => pt.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(pt => pt.ShortDescription)
            .HasColumnType("text");

        builder.Property(pt => pt.Description)
            .HasColumnType("text");

        builder.Property(pt => pt.SeoTitle)
            .HasMaxLength(200);

        builder.Property(pt => pt.SeoDescription)
            .HasColumnType("text");

        // Relationships
        builder.HasOne(pt => pt.Product)
            .WithMany(p => p.Translations)
            .HasForeignKey(pt => pt.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(pt => new { pt.ProductId, pt.LanguageCode })
            .IsUnique();

        builder.HasIndex(pt => pt.LanguageCode);
    }
}
