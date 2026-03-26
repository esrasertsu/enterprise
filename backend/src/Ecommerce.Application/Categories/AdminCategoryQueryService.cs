using Ecommerce.Application.Abstractions.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Categories;

public sealed class AdminCategoryQueryService
{
    private readonly IAppDbContext _dbContext;

    public AdminCategoryQueryService(IAppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<AdminCategoryOptionDto>> GetListAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Categories
            .AsNoTracking()
            .OrderBy(category => category.SortOrder)
            .ThenBy(category => category.Slug)
            .Select(category => new AdminCategoryOptionDto(
                category.Id,
                category.Slug,
                category.Translations
                    .OrderBy(translation => translation.LanguageCode)
                    .Select(translation => translation.Name)
                    .FirstOrDefault() ?? category.Slug,
                category.IsActive))
            .ToListAsync(cancellationToken);
    }

    public async Task<AdminCategoryDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _dbContext.Categories
            .AsNoTracking()
            .Include(x => x.ParentCategory)
                .ThenInclude(x => x!.Translations)
            .Include(x => x.Translations)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (category is null)
        {
            return null;
        }

        return new AdminCategoryDetailDto(
            category.Id,
            category.ParentCategoryId,
            category.ParentCategory is null
                ? null
                : category.ParentCategory.Translations
                    .OrderBy(translation => translation.LanguageCode)
                    .Select(translation => translation.Name)
                    .FirstOrDefault() ?? category.ParentCategory.Slug,
            category.Slug,
            category.IsActive,
            category.SortOrder,
            category.ImageUrl,
            category.Translations
                .OrderBy(translation => translation.LanguageCode)
                .Select(translation => new CategoryTranslationInput
                {
                    LanguageCode = translation.LanguageCode,
                    Name = translation.Name,
                    Description = translation.Description,
                    SeoTitle = translation.SeoTitle,
                    SeoDescription = translation.SeoDescription,
                })
                .ToList(),
            category.CreatedAt,
            category.UpdatedAt);
    }
}