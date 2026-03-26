using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Products;

public sealed record PublicProductListItemDto(
    Guid Id,
    string Slug,
    string Name,
    string? ShortDescription,
    string CategorySlug,
    string CategoryName,
    string? MainImageUrl,
    decimal? MinPriceExclVat,
    decimal? MaxPriceExclVat,
    ProductType ProductType,
    bool IsCustomizable,
    bool RequiresArtwork,
    int MinOrderQuantity);