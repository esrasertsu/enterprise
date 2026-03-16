using Ecommerce.Domain.Common;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Domain.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = null!;
    public Guid? CustomerId { get; set; }
    public string? GuestEmail { get; set; }
    public string BillingAddressSnapshotJson { get; set; } = null!;
    public string ShippingAddressSnapshotJson { get; set; } = null!;
    public string CurrencyCode { get; set; } = "EUR";
    public OrderStatus OrderStatus { get; set; } = OrderStatus.Received;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public FulfillmentStatus FulfillmentStatus { get; set; } = FulfillmentStatus.Unfulfilled;
    public decimal SubtotalExclVat { get; set; }
    public decimal DiscountExclVat { get; set; }
    public decimal ShippingExclVat { get; set; }
    public decimal VatTotal { get; set; }
    public decimal GrandTotal { get; set; }
    public string? VatNumber { get; set; }
    public bool IsVatReverseCharge { get; set; }
    public string? CouponCode { get; set; }
    public Guid? CouponId { get; set; }
    public Coupon? Coupon { get; set; }
    public bool NeedsDesignSupport { get; set; }
    public string? CustomerNote { get; set; }
    public string? AdminNote { get; set; }

    public Customer? Customer { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ICollection<OrderFile> Files { get; set; } = new List<OrderFile>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}