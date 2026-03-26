namespace Ecommerce.Application.Carts;

public sealed record PublicCartDto(
    Guid? Id,
    string SessionId,
    string CurrencyCode,
    int ItemCount,
    decimal SubtotalExclVat,
    decimal DiscountExclVat,
    decimal VatTotal,
    decimal GrandTotal,
    IReadOnlyList<PublicCartItemDto> Items);

public sealed record PublicCartItemDto(
    Guid Id,
    Guid ProductId,
    Guid ProductVariantId,
    string ProductSlug,
    string ProductName,
    string? MainImageUrl,
    string Sku,
    string? VariantDescription,
    int Quantity,
    decimal UnitPriceExclVat,
    decimal VatRate,
    decimal LineTotalExclVat,
    decimal LineVatTotal,
    decimal LineGrandTotal,
    int MinOrderQuantity,
    int? MaxOrderQuantity);

public sealed class AddCartItemCommand
{
    public string SessionId { get; set; } = string.Empty;
    public Guid ProductId { get; set; }
    public Guid ProductVariantId { get; set; }
    public int Quantity { get; set; }
    public string? LanguageCode { get; set; }
}

public sealed class UpdateCartItemQuantityCommand
{
    public string SessionId { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string? LanguageCode { get; set; }
}