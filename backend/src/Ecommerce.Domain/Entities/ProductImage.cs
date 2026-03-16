using Ecommerce.Domain.Common;

namespace Ecommerce.Domain.Entities;

public class ProductImage : BaseEntity
{
    public Guid ProductId { get; set; }
    public Guid? ProductVariantId { get; set; }
    public string Url { get; set; } = null!;
    public string? AltText { get; set; }
    public int SortOrder { get; set; }
    public bool IsMain { get; set; }

    public Product Product { get; set; } = null!;
    public ProductVariant? ProductVariant { get; set; }
}