using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Products;

public sealed record PublicProductDetailDto(
    Guid Id,
    string Slug,
    string Name,
    string? ShortDescription,
    string? Description,
    string CategorySlug,
    string CategoryName,
    string? MaterialSummary,
    string? OriginCountry,
    ProductType ProductType,
    bool IsCustomizable,
    bool HasVariants,
    bool RequiresArtwork,
    bool Recyclable,
    bool FoodSafe,
    int MinOrderQuantity,
    int? MaxOrderQuantity,
    int? LeadTimeDays,
    decimal BaseVatRate,
    decimal? WeightGrams,
    IReadOnlyList<PublicProductVariantDto> Variants,
    IReadOnlyList<PublicProductImageDto> Images,
    IReadOnlyList<PublicProductAttributeDto> Attributes);

public sealed record PublicProductVariantDto(
    Guid Id,
    string Sku,
    string? Barcode,
    decimal PriceExclVat,
    decimal? CompareAtPriceExclVat,
    bool IsActive,
    int SortOrder);

public sealed record PublicProductImageDto(
    Guid Id,
    string Url,
    string? AltText,
    int SortOrder,
    bool IsMain);

public sealed record PublicProductAttributeDto(
    Guid Id,
    string AttributeKey,
    string AttributeValue,
    string? LanguageCode,
    bool IsFilterable,
    int SortOrder);