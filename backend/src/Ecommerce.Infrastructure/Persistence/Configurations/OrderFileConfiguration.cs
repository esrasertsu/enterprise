using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class OrderFileConfiguration : IEntityTypeConfiguration<OrderFile>
{
    public void Configure(EntityTypeBuilder<OrderFile> builder)
    {
        builder.ToTable("OrderFiles");

        builder.HasKey(of => of.Id);

        builder.Property(of => of.OrderItemId)
            .IsRequired(false);

        builder.Property(of => of.FileUrl)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(of => of.OriginalFileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(of => of.StoredFileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(of => of.ContentType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(of => of.FileSize)
            .IsRequired();

        // Relationships
        builder.HasOne(of => of.Order)
            .WithMany(o => o.Files)
            .HasForeignKey(of => of.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(of => of.OrderItem)
            .WithMany(oi => oi.Files)
            .HasForeignKey(of => of.OrderItemId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(of => of.OrderId);

        builder.HasIndex(of => of.OrderItemId);

        builder.HasIndex(of => of.FileCategory);

        // Check constraints
        builder.HasCheckConstraint("CK_OrderFiles_FileSize", "\"FileSize\" > 0");
    }
}
