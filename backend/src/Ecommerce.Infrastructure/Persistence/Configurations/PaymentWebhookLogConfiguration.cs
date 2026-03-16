using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class PaymentWebhookLogConfiguration : IEntityTypeConfiguration<PaymentWebhookLog>
{
    public void Configure(EntityTypeBuilder<PaymentWebhookLog> builder)
    {
        builder.ToTable("PaymentWebhookLogs");

        builder.HasKey(pwl => pwl.Id);

        builder.Property(pwl => pwl.Provider)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(pwl => pwl.EventId)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(pwl => pwl.EventType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(pwl => pwl.PayloadJson)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(pwl => pwl.Processed)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(pwl => pwl.ReceivedAt)
            .IsRequired();

        builder.Property(pwl => pwl.ProcessedAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(pwl => pwl.EventId)
            .IsUnique();

        builder.HasIndex(pwl => pwl.Provider);

        builder.HasIndex(pwl => pwl.EventType);

        builder.HasIndex(pwl => pwl.Processed);

        builder.HasIndex(pwl => pwl.ReceivedAt);

        builder.HasIndex(pwl => new { pwl.Provider, pwl.EventType });

        // Check constraints
        builder.HasCheckConstraint("CK_PaymentWebhookLogs_ProcessedAt", 
            "\"ProcessedAt\" IS NULL OR \"ProcessedAt\" >= \"ReceivedAt\"");
    }
}
