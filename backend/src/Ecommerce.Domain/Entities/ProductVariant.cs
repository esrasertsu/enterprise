using Ecommerce.Domain.Common;

namespace Ecommerce.Domain.Entities;

public class ProductVariant : BaseEntity
{
    public Guid ProductId { get; set; }
    public string Sku { get; set; } = null!;
    public string? Barcode { get; set; }
    public decimal PriceExclVat { get; set; }
    public decimal? CompareAtPriceExclVat { get; set; }
    public int StockQuantity { get; set; } // Ignore stock management for now, will be implemented later
    public int ReservedStockQuantity { get; set; } // Ignore stock management for now, will be implemented later
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    public Product Product { get; set; } = null!;
}