using Ecommerce.Domain.Common;

namespace Ecommerce.Domain.Entities;

public class ProductAttribute : BaseEntity
{
    public Guid ProductId { get; set; }
    public string AttributeKey { get; set; } = null!;
    public string AttributeValue { get; set; } = null!;
    public string? LanguageCode { get; set; }
    public bool IsFilterable { get; set; }
    public int SortOrder { get; set; }

    public Product Product { get; set; } = null!;
}