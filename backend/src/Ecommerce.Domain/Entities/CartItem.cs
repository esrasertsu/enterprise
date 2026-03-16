using Ecommerce.Domain.Common;

namespace Ecommerce.Domain.Entities;

public class CartItem : BaseEntity
{
    public Guid CartId { get; set; }
    public Guid ProductId { get; set; }
    public Guid ProductVariantId { get; set; }

    public string Sku { get; set; } = null!;
    public string ProductNameSnapshot { get; set; } = null!;
    public string? VariantDescriptionSnapshot { get; set; }

    public int Quantity { get; set; }
    public decimal UnitPriceExclVat { get; set; }
    public decimal VatRate { get; set; }
    public decimal DiscountExclVat { get; set; }
    public decimal LineTotalExclVat { get; set; }
    public decimal LineVatTotal { get; set; }
    public decimal LineGrandTotal { get; set; }

    public Cart Cart { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public ProductVariant ProductVariant { get; set; } = null!;
}