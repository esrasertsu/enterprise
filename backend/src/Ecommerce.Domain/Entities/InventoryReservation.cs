using Ecommerce.Domain.Common;

namespace Ecommerce.Domain.Entities;

public enum ReservationStatus
{
    Pending = 0,
    Confirmed = 1,
    Cancelled = 2,
    Expired = 3
}

public class InventoryReservation : BaseEntity
{
    public Guid ProductVariantId { get; set; }
    public Guid? OrderId { get; set; }
    public Guid? CartId { get; set; }
    public int Quantity { get; set; }
    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    public DateTime ExpiresAt { get; set; }

    public ProductVariant ProductVariant { get; set; } = null!;
    public Order? Order { get; set; }
    public Cart? Cart { get; set; }
}
