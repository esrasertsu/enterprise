using Ecommerce.Domain.Common;

namespace Ecommerce.Domain.Entities;

public class CategoryTranslation : BaseEntity
{
    public Guid CategoryId { get; set; }
    public string LanguageCode { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }

    public Category Category { get; set; } = null!;
}