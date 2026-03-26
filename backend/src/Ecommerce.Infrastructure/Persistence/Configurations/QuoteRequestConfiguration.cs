using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class QuoteRequestConfiguration : IEntityTypeConfiguration<QuoteRequest>
{
    public void Configure(EntityTypeBuilder<QuoteRequest> builder)
    {
        builder.ToTable("QuoteRequests");

        builder.HasKey(qr => qr.Id);

        builder.Property(qr => qr.FullName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(qr => qr.Email)
            .IsRequired()
            .HasMaxLength(320);

        builder.Property(qr => qr.Phone)
            .HasMaxLength(32)
            .IsRequired(false);

        builder.Property(qr => qr.CompanyName)
            .HasMaxLength(200)
            .IsRequired(false);

        builder.Property(qr => qr.ProductName)
            .HasMaxLength(200)
            .IsRequired(false);

        builder.Property(qr => qr.Quantity)
            .IsRequired(false);

        builder.Property(qr => qr.Notes)
            .HasColumnType("text")
            .IsRequired(false);

        builder.Property(qr => qr.AdminNotificationSentAt)
            .IsRequired(false);

        builder.HasIndex(qr => qr.Email);

        builder.HasIndex(qr => qr.Status);

        builder.HasIndex(qr => qr.CreatedAt);

        builder.HasCheckConstraint("CK_QuoteRequests_Quantity", "\"Quantity\" IS NULL OR \"Quantity\" > 0");
    }
}