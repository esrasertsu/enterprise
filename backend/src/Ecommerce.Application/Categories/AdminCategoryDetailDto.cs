namespace Ecommerce.Application.Categories;

public sealed record AdminCategoryDetailDto(
    Guid Id,
    Guid? ParentCategoryId,
    string? ParentCategoryName,
    string Slug,
    bool IsActive,
    int SortOrder,
    string? ImageUrl,
    IReadOnlyList<CategoryTranslationInput> Translations,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed class CategoryTranslationInput
{
    public string LanguageCode { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? SeoTitle { get; init; }
    public string? SeoDescription { get; init; }
}