namespace Ecommerce.Domain.Enums;

public enum OrderStatus
{
    Received = 1,
    PendingApproval = 2,
    Approved = 3,
    InProduction = 4,
    Packed = 5,
    Shipped = 6,
    Delivered = 7,
    Cancelled = 8,
    Refunded = 9
}