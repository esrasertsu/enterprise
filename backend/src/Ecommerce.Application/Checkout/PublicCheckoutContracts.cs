using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Checkout;

public sealed class CheckoutAddressInput
{
    public string ContactName { get; init; } = string.Empty;
    public string? CompanyName { get; init; }
    public string Line1 { get; init; } = string.Empty;
    public string? Line2 { get; init; }
    public string PostalCode { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string? State { get; init; }
    public string CountryCode { get; init; } = string.Empty;
    public string? Phone { get; init; }
}

public sealed class CheckoutPreviewCommand
{
    public string SessionId { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public CheckoutAddressInput BillingAddress { get; init; } = new();
    public CheckoutAddressInput? ShippingAddress { get; init; }
    public bool UseBillingAsShippingAddress { get; init; } = true;
    public string? VatNumber { get; init; }
    public bool NeedsDesignSupport { get; init; }
    public string? CustomerNote { get; init; }
}

public sealed class CreateOrderFromCheckoutCommand
{
    public string SessionId { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public CheckoutAddressInput BillingAddress { get; init; } = new();
    public CheckoutAddressInput? ShippingAddress { get; init; }
    public bool UseBillingAsShippingAddress { get; init; } = true;
    public string? VatNumber { get; init; }
    public bool NeedsDesignSupport { get; init; }
    public string? CustomerNote { get; init; }
}

public sealed record CheckoutPreviewDto(
    Guid CartId,
    string SessionId,
    string Email,
    string CurrencyCode,
    int ItemCount,
    decimal SubtotalExclVat,
    decimal DiscountExclVat,
    decimal ShippingExclVat,
    decimal VatTotal,
    decimal GrandTotal,
    string? CouponCode,
    bool NeedsDesignSupport,
    IReadOnlyList<CheckoutPreviewItemDto> Items);

public sealed record CheckoutPreviewItemDto(
    Guid CartItemId,
    Guid ProductId,
    Guid ProductVariantId,
    string ProductSlug,
    string ProductName,
    string Sku,
    string? VariantDescription,
    int Quantity,
    decimal UnitPriceExclVat,
    decimal VatRate,
    decimal LineTotalExclVat,
    decimal LineVatTotal,
    decimal LineGrandTotal);

public sealed record CreatedOrderDto(
    Guid Id,
    string OrderNumber,
    string CurrencyCode,
    decimal SubtotalExclVat,
    decimal DiscountExclVat,
    decimal ShippingExclVat,
    decimal VatTotal,
    decimal GrandTotal,
    OrderStatus OrderStatus,
    PaymentStatus PaymentStatus,
    FulfillmentStatus FulfillmentStatus,
    DateTime CreatedAt);