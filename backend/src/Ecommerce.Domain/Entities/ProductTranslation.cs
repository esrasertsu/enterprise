using Ecommerce.Domain.Common;

namespace Ecommerce.Domain.Entities;

public class ProductTranslation : BaseEntity
{
    public Guid ProductId { get; set; }
    public string LanguageCode { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }

    public Product Product { get; set; } = null!;
}