using Ecommerce.Domain.Common;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Domain.Entities;

public class Product : BaseEntity
{
    public Guid CategoryId { get; set; }
    public string Slug { get; set; } = null!;
    public string SkuRoot { get; set; } = null!;
    public ProductType ProductType { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; }
    public bool IsCustomizable { get; set; }
    public bool HasVariants { get; set; }
    public bool RequiresArtwork { get; set; }
    public int MinOrderQuantity { get; set; }
    public int? MaxOrderQuantity { get; set; }
    public int? LeadTimeDays { get; set; }
    public decimal BaseVatRate { get; set; }
    public decimal? WeightGrams { get; set; }
    public string? MaterialSummary { get; set; }
    public string? OriginCountry { get; set; }
    public bool Recyclable { get; set; }
    public bool FoodSafe { get; set; }

    public Category Category { get; set; } = null!;
    public ICollection<ProductTranslation> Translations { get; set; } = new List<ProductTranslation>();
    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<ProductAttribute> Attributes { get; set; } = new List<ProductAttribute>();
}