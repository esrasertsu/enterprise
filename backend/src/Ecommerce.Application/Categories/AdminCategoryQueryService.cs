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
}