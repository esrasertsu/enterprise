namespace Ecommerce.Application.Categories;

public sealed record AdminCategoryOptionDto(
    Guid Id,
    string Slug,
    string DisplayName,
    bool IsActive);