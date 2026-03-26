using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Products;

public sealed record AdminProductDetailDto(
    Guid Id,
    Guid CategoryId,
    string CategorySlug,
    string Slug,
    string SkuRoot,
    ProductType ProductType,
    bool IsActive,
    bool IsFeatured,
    bool IsCustomizable,
    bool HasVariants,
    bool RequiresArtwork,
    int MinOrderQuantity,
    int? MaxOrderQuantity,
    int? LeadTimeDays,
    decimal BaseVatRate,
    decimal? WeightGrams,
    string? MaterialSummary,
    string? OriginCountry,
    bool Recyclable,
    bool FoodSafe,
    IReadOnlyList<ProductTranslationInput> Translations,
    IReadOnlyList<ProductVariantInput> Variants,
    IReadOnlyList<AdminProductImageDto> Images,
    IReadOnlyList<ProductAttributeInput> Attributes,
    DateTime CreatedAt,
    DateTime UpdatedAt);