namespace Ecommerce.Application.Products;

public sealed record AdminProductImageDto(
    Guid Id,
    string Url,
    string? AltText,
    bool IsMain,
    int SortOrder,
    DateTime CreatedAt);