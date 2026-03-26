using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Products;

public sealed record AdminProductListItemDto(
    Guid Id,
    string Slug,
    string SkuRoot,
    string DisplayName,
    string CategoryName,
    bool IsActive,
    bool IsFeatured,
    ProductType ProductType,
    DateTime CreatedAt);