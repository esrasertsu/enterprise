using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Provider)
            .IsRequired()
            .HasMaxLength(255)
            .HasDefaultValue("Stripe");

        builder.Property(p => p.ProviderPaymentIntentId)
            .HasMaxLength(255)
            .IsRequired(false);

        builder.Property(p => p.ProviderSessionId)
            .HasMaxLength(255)
            .IsRequired(false);

        builder.Property(p => p.ProviderEventId)
            .HasMaxLength(255)
            .IsRequired(false);

        builder.Property(p => p.ProviderChargeId)
            .HasMaxLength(255)
            .IsRequired(false);

        builder.Property(p => p.ProviderCustomerId)
            .HasMaxLength(255)
            .IsRequired(false);

        builder.Property(p => p.ProviderRefundId)
            .HasMaxLength(255)
            .IsRequired(false);

        builder.Property(p => p.IdempotencyKey)
            .HasMaxLength(255)
            .IsRequired(false);

        builder.Property(p => p.Amount)
            .HasPrecision(18, 2);

        builder.Property(p => p.AuthorizedAmount)
            .HasPrecision(18, 2);

        builder.Property(p => p.CapturedAmount)
            .HasPrecision(18, 2);

        builder.Property(p => p.RefundedAmount)
            .HasPrecision(18, 2);

        builder.Property(p => p.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("EUR");

        builder.Property(p => p.RawResponseJson)
            .HasColumnType("text");

        builder.Property(p => p.MetadataJson)
            .HasColumnType("text");

        builder.Property(p => p.FailureCode)
            .HasMaxLength(100)
            .IsRequired(false);

        builder.Property(p => p.FailureMessage)
            .HasColumnType("text");

        builder.Property(p => p.PaymentMethodType)
            .HasMaxLength(50)
            .IsRequired(false);

        builder.Property(p => p.PaymentMethodBrand)
            .HasMaxLength(50)
            .IsRequired(false);

        builder.Property(p => p.PaymentMethodLast4)
            .HasMaxLength(4)
            .IsRequired(false);

        builder.Property(p => p.ReceiptUrl)
            .HasMaxLength(1000)
            .IsRequired(false);

        // Relationships
        builder.HasOne(p => p.Order)
            .WithMany(o => o.Payments)
            .HasForeignKey(p => p.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(p => p.OrderId);

        builder.HasIndex(p => p.Provider);

        builder.HasIndex(p => p.Status);

        builder.HasIndex(p => p.CreatedAt);

        // Filtered unique indexes for provider-specific fields
        builder.HasIndex(p => p.ProviderPaymentIntentId)
            .IsUnique()
            .HasFilter("\"ProviderPaymentIntentId\" IS NOT NULL");

        builder.HasIndex(p => p.ProviderSessionId)
            .IsUnique()
            .HasFilter("\"ProviderSessionId\" IS NOT NULL");

        builder.HasIndex(p => p.ProviderEventId)
            .IsUnique()
            .HasFilter("\"ProviderEventId\" IS NOT NULL");

        builder.HasIndex(p => p.ProviderChargeId)
            .IsUnique()
            .HasFilter("\"ProviderChargeId\" IS NOT NULL");

        builder.HasIndex(p => p.IdempotencyKey)
            .IsUnique()
            .HasFilter("\"IdempotencyKey\" IS NOT NULL");

        // Check constraints
        builder.HasCheckConstraint("CK_Payments_Amount", "\"Amount\" >= 0");
        builder.HasCheckConstraint("CK_Payments_AuthorizedAmount", "\"AuthorizedAmount\" >= 0");
        builder.HasCheckConstraint("CK_Payments_CapturedAmount", "\"CapturedAmount\" >= 0");
        builder.HasCheckConstraint("CK_Payments_RefundedAmount", "\"RefundedAmount\" >= 0");
    }
}
