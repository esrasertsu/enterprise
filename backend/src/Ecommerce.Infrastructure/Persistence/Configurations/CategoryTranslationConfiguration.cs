using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class CategoryTranslationConfiguration : IEntityTypeConfiguration<CategoryTranslation>
{
    public void Configure(EntityTypeBuilder<CategoryTranslation> builder)
    {
        builder.ToTable("CategoryTranslations");

        builder.HasKey(ct => ct.Id);

        builder.Property(ct => ct.LanguageCode)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(ct => ct.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(ct => ct.Description)
            .HasColumnType("text");

        builder.Property(ct => ct.SeoTitle)
            .HasMaxLength(200);

        builder.Property(ct => ct.SeoDescription)
            .HasColumnType("text");

        // Relationships
        builder.HasOne(ct => ct.Category)
            .WithMany(c => c.Translations)
            .HasForeignKey(ct => ct.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(ct => new { ct.CategoryId, ct.LanguageCode })
            .IsUnique();

        builder.HasIndex(ct => ct.LanguageCode);
    }
}
