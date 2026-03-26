using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Products;

public sealed class UpsertAdminProductCommand
{
    public Guid CategoryId { get; init; }
    public string Slug { get; init; } = string.Empty;
    public string SkuRoot { get; init; } = string.Empty;
    public ProductType ProductType { get; init; }
    public bool IsActive { get; init; } = true;
    public bool IsFeatured { get; init; }
    public bool IsCustomizable { get; init; }
    public bool HasVariants { get; init; }
    public bool RequiresArtwork { get; init; }
    public int MinOrderQuantity { get; init; } = 1;
    public int? MaxOrderQuantity { get; init; }
    public int? LeadTimeDays { get; init; }
    public decimal BaseVatRate { get; init; }
    public decimal? WeightGrams { get; init; }
    public string? MaterialSummary { get; init; }
    public string? OriginCountry { get; init; }
    public bool Recyclable { get; init; }
    public bool FoodSafe { get; init; }
    public IReadOnlyList<ProductTranslationInput> Translations { get; init; } = [];
    public IReadOnlyList<ProductVariantInput> Variants { get; init; } = [];
    public IReadOnlyList<ProductImageInput> Images { get; init; } = [];
    public IReadOnlyList<ProductAttributeInput> Attributes { get; init; } = [];
}