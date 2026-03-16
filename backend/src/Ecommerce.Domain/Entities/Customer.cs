using Ecommerce.Domain.Common;

namespace Ecommerce.Domain.Entities;

public class Customer : BaseEntity
{
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string? Phone { get; set; }
    public string? CompanyName { get; set; }
    public string? VatNumber { get; set; }
    public bool? IsVatValidated { get; set; }
    public string PreferredLanguage { get; set; } = "en";
    public bool IsActive { get; set; } = true;
    public bool EmailConfirmed { get; set; }

    public ICollection<CustomerAddress> Addresses { get; set; } = new List<CustomerAddress>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Cart> Carts { get; set; } = new List<Cart>();
    public ICollection<Wishlist> WishlistItems { get; set; } = new List<Wishlist>();
}