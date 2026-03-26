namespace Ecommerce.Application.Products;

public sealed class ProductVariantInput
{
    public string Sku { get; init; } = string.Empty;
    public string? Barcode { get; init; }
    public decimal PriceExclVat { get; init; }
    public decimal? CompareAtPriceExclVat { get; init; }
    public int StockQuantity { get; init; }
    public int ReservedStockQuantity { get; init; }
    public bool IsActive { get; init; } = true;
    public int SortOrder { get; init; }
}