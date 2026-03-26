namespace Ecommerce.Application.Categories;

public sealed record PublicCategoryTreeItemDto(
    Guid Id,
    string Slug,
    string Name,
    string? Description,
    string? ImageUrl,
    int ProductCount,
    IReadOnlyList<PublicCategoryTreeItemDto> Children);