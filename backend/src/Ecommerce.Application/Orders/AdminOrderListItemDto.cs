using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Orders;

public sealed record AdminOrderListItemDto(
    Guid Id,
    string OrderNumber,
    string CustomerName,
    string CustomerEmail,
    int ItemCount,
    decimal GrandTotal,
    string CurrencyCode,
    OrderStatus OrderStatus,
    PaymentStatus PaymentStatus,
    FulfillmentStatus FulfillmentStatus,
    bool NeedsDesignSupport,
    DateTime CreatedAt);