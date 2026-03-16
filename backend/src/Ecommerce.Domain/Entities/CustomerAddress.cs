using Ecommerce.Domain.Common;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Domain.Entities;

public class CustomerAddress : BaseEntity
{
    public Guid CustomerId { get; set; }
    public AddressType AddressType { get; set; }
    public string ContactName { get; set; } = null!;
    public string? CompanyName { get; set; }
    public string Line1 { get; set; } = null!;
    public string? Line2 { get; set; }
    public string PostalCode { get; set; } = null!;
    public string City { get; set; } = null!;
    public string? State { get; set; }
    public string CountryCode { get; set; } = null!;
    public string? Phone { get; set; }
    public bool IsDefault { get; set; }

    public Customer Customer { get; set; } = null!;
}