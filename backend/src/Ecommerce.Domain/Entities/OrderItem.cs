using Ecommerce.Domain.Common;

namespace Ecommerce.Domain.Entities;

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
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

    public Order Order { get; set; } = null!;
    public ICollection<OrderFile> Files { get; set; } = new List<OrderFile>();
}