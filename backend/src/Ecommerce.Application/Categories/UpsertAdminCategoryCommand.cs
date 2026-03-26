namespace Ecommerce.Application.Categories;

public sealed class UpsertAdminCategoryCommand
{
    public Guid? ParentCategoryId { get; init; }
    public string Slug { get; init; } = string.Empty;
    public bool IsActive { get; init; } = true;
    public int SortOrder { get; init; }
    public string? ImageUrl { get; init; }
    public IReadOnlyList<CategoryTranslationInput> Translations { get; init; } = [];
}