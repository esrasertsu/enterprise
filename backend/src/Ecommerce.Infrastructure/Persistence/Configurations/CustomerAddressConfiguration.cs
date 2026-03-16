using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class CustomerAddressConfiguration : IEntityTypeConfiguration<CustomerAddress>
{
    public void Configure(EntityTypeBuilder<CustomerAddress> builder)
    {
        builder.ToTable("CustomerAddresses");

        builder.HasKey(ca => ca.Id);

        builder.Property(ca => ca.ContactName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(ca => ca.CompanyName)
            .HasMaxLength(200)
            .IsRequired(false);

        builder.Property(ca => ca.Line1)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(ca => ca.Line2)
            .HasMaxLength(200)
            .IsRequired(false);

        builder.Property(ca => ca.PostalCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(ca => ca.City)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(ca => ca.State)
            .HasMaxLength(100)
            .IsRequired(false);

        builder.Property(ca => ca.CountryCode)
            .IsRequired()
            .HasMaxLength(2);

        builder.Property(ca => ca.Phone)
            .HasMaxLength(32)
            .IsRequired(false);

        builder.Property(ca => ca.IsDefault)
            .HasDefaultValue(false);

        // Relationships
        builder.HasOne(ca => ca.Customer)
            .WithMany(c => c.Addresses)
            .HasForeignKey(ca => ca.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(ca => ca.CustomerId);

        builder.HasIndex(ca => new { ca.CustomerId, ca.AddressType });

        builder.HasIndex(ca => ca.IsDefault);
    }
}
