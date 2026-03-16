using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class OrderStatusHistoryConfiguration : IEntityTypeConfiguration<OrderStatusHistory>
{
    public void Configure(EntityTypeBuilder<OrderStatusHistory> builder)
    {
        builder.ToTable("OrderStatusHistories");

        builder.HasKey(osh => osh.Id);

        builder.Property(osh => osh.StatusType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(osh => osh.OldStatus)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(osh => osh.NewStatus)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(osh => osh.Note)
            .HasColumnType("text")
            .IsRequired(false);

        builder.Property(osh => osh.ChangedByAdminUserId)
            .IsRequired(false);

        // Relationships
        builder.HasOne(osh => osh.Order)
            .WithMany()
            .HasForeignKey(osh => osh.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(osh => osh.ChangedByAdminUser)
            .WithMany()
            .HasForeignKey(osh => osh.ChangedByAdminUserId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(osh => osh.OrderId);

        builder.HasIndex(osh => osh.ChangedByAdminUserId)
            .HasFilter("\"ChangedByAdminUserId\" IS NOT NULL");

        builder.HasIndex(osh => osh.CreatedAt);

        builder.HasIndex(osh => new { osh.OrderId, osh.StatusType });
    }
}
