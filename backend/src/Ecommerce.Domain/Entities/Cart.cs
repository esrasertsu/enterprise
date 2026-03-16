using Ecommerce.Domain.Common;

namespace Ecommerce.Domain.Entities;
public class Cart : BaseEntity
{
    public Guid? CustomerId { get; set; }
    public string? SessionId { get; set; } // guest cart
    public string CurrencyCode { get; set; } = "EUR";

    public Guid? CouponId { get; set; }
    public string? CouponCodeSnapshot { get; set; }

    public decimal SubtotalExclVat { get; set; }
    public decimal DiscountExclVat { get; set; }
    public decimal VatTotal { get; set; }
    public decimal GrandTotal { get; set; }

    public DateTime? ExpiresAt { get; set; }
    public Guid? ConvertedToOrderId { get; set; }

    public Customer? Customer { get; set; }
    public Coupon? Coupon { get; set; }
    public Order? ConvertedToOrder { get; set; }
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}