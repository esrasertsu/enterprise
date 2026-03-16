using Ecommerce.Domain.Common;

namespace Ecommerce.Domain.Entities;

public class Category : BaseEntity
{
    public Guid? ParentCategoryId { get; set; }
    public string Slug { get; set; } = null!;
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
    public string? ImageUrl { get; set; }

    public Category? ParentCategory { get; set; }
    public ICollection<Category> SubCategories { get; set; } = new List<Category>();
    public ICollection<CategoryTranslation> Translations { get; set; } = new List<CategoryTranslation>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
}