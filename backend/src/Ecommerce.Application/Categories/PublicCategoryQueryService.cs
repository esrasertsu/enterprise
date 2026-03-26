using Ecommerce.Application.Abstractions.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Categories;

public sealed class PublicCategoryQueryService
{
    private readonly IAppDbContext _dbContext;

    public PublicCategoryQueryService(IAppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<PublicCategoryTreeItemDto>> GetTreeAsync(
        string? languageCode,
        CancellationToken cancellationToken = default)
    {
        var normalizedLanguageCode = NormalizeLanguageCode(languageCode);

        var categories = await _dbContext.Categories
            .AsNoTracking()
            .Where(category => category.IsActive)
            .Select(category => new CategoryNode(
                category.Id,
                category.ParentCategoryId,
                category.Slug,
                category.SortOrder,
                category.ImageUrl,
                category.Translations
                    .Where(translation => translation.LanguageCode == normalizedLanguageCode)
                    .Select(translation => translation.Name)
                    .FirstOrDefault()
                    ?? category.Translations.Select(translation => translation.Name).FirstOrDefault()
                    ?? category.Slug,
                category.Translations
                    .Where(translation => translation.LanguageCode == normalizedLanguageCode)
                    .Select(translation => translation.Description)
                    .FirstOrDefault()
                    ?? category.Translations.Select(translation => translation.Description).FirstOrDefault(),
                category.Products.Count(product => product.IsActive)))
            .ToListAsync(cancellationToken);

        var childrenLookup = categories
            .ToLookup(category => category.ParentCategoryId);

        IReadOnlyList<PublicCategoryTreeItemDto> Build(Guid? parentCategoryId)
        {
            var children = childrenLookup[parentCategoryId]
                .OrderBy(x => x.SortOrder)
                .ThenBy(x => x.Name)
                .ToArray();

            if (children.Length == 0)
            {
                return [];
            }

            return children
                .Select(child =>
                {
                    var nestedChildren = Build(child.Id);
                    return new PublicCategoryTreeItemDto(
                        child.Id,
                        child.Slug,
                        child.Name,
                        child.Description,
                        child.ImageUrl,
                        child.ProductCount + nestedChildren.Sum(item => item.ProductCount),
                        nestedChildren);
                })
                .ToList();
        }

        return Build(null);
    }

    private static string NormalizeLanguageCode(string? languageCode)
    {
        var normalizedLanguageCode = languageCode?.Trim().ToLowerInvariant();

        return string.IsNullOrWhiteSpace(normalizedLanguageCode)
            ? "en"
            : normalizedLanguageCode.Split('-')[0];
    }

    private sealed record CategoryNode(
        Guid Id,
        Guid? ParentCategoryId,
        string Slug,
        int SortOrder,
        string? ImageUrl,
        string Name,
        string? Description,
        int ProductCount);
}