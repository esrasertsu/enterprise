using Ecommerce.Application.Abstractions.Persistence;
using Ecommerce.Application.Abstractions.Storage;
using Ecommerce.Domain.Entities;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Categories;

public sealed class AdminCategoryService
{
    private readonly IAppDbContext _dbContext;
    private readonly IFileStorage _fileStorage;
    private readonly IValidator<UpsertAdminCategoryCommand> _validator;

    public AdminCategoryService(
        IAppDbContext dbContext,
        IFileStorage fileStorage,
        IValidator<UpsertAdminCategoryCommand> validator)
    {
        _dbContext = dbContext;
        _fileStorage = fileStorage;
        _validator = validator;
    }

    public async Task<Guid> CreateAsync(UpsertAdminCategoryCommand command, CancellationToken cancellationToken = default)
    {
        await _validator.ValidateAndThrowAsync(command, cancellationToken);
        await EnsureParentCategoryExistsAsync(command.ParentCategoryId, null, cancellationToken);
        await EnsureUniqueSlugAsync(command.Slug, null, cancellationToken);

        var category = new Category();
        ApplyCommand(category, command);

        _dbContext.Categories.Add(category);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return category.Id;
    }

    public async Task<bool> UpdateAsync(Guid id, UpsertAdminCategoryCommand command, CancellationToken cancellationToken = default)
    {
        await _validator.ValidateAndThrowAsync(command, cancellationToken);

        var category = await _dbContext.Categories
            .Include(x => x.Translations)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (category is null)
        {
            return false;
        }

        await EnsureParentCategoryExistsAsync(command.ParentCategoryId, id, cancellationToken);
        await EnsureUniqueSlugAsync(command.Slug, id, cancellationToken);

        ApplyScalarFields(category, command);
        category.UpdatedAt = DateTime.UtcNow;
        category.Translations.Clear();

        foreach (var translation in BuildTranslations(category.Id, command))
        {
            category.Translations.Add(translation);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _dbContext.Categories.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (category is null)
        {
            return false;
        }

        var hasChildren = await _dbContext.Categories.AnyAsync(x => x.ParentCategoryId == id, cancellationToken);
        if (hasChildren)
        {
            throw new InvalidOperationException("Delete or reassign child categories first.");
        }

        var hasProducts = await _dbContext.Products.AnyAsync(x => x.CategoryId == id, cancellationToken);
        if (hasProducts)
        {
            throw new InvalidOperationException("Delete or reassign products in this category first.");
        }

        var imageUrl = category.ImageUrl;
        _dbContext.Categories.Remove(category);
        await _dbContext.SaveChangesAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(imageUrl))
        {
            await _fileStorage.DeleteAsync(imageUrl, cancellationToken);
        }

        return true;
    }

    private async Task EnsureParentCategoryExistsAsync(Guid? parentCategoryId, Guid? categoryId, CancellationToken cancellationToken)
    {
        if (!parentCategoryId.HasValue)
        {
            return;
        }

        if (categoryId.HasValue && parentCategoryId.Value == categoryId.Value)
        {
            throw new InvalidOperationException("Category cannot be its own parent.");
        }

        var parentExists = await _dbContext.Categories.AnyAsync(category => category.Id == parentCategoryId.Value, cancellationToken);

        if (!parentExists)
        {
            throw new InvalidOperationException("Parent category not found.");
        }
    }

    private async Task EnsureUniqueSlugAsync(string slug, Guid? categoryId, CancellationToken cancellationToken)
    {
        var normalizedSlug = slug.Trim().ToLowerInvariant();

        var slugExists = await _dbContext.Categories.AnyAsync(
            category => category.Slug == normalizedSlug && (!categoryId.HasValue || category.Id != categoryId.Value),
            cancellationToken);

        if (slugExists)
        {
            throw new InvalidOperationException("Category slug already exists.");
        }
    }

    private static void ApplyCommand(Category category, UpsertAdminCategoryCommand command)
    {
        ApplyScalarFields(category, command);
        category.Translations = BuildTranslations(category.Id, command).ToList();
    }

    private static void ApplyScalarFields(Category category, UpsertAdminCategoryCommand command)
    {
        category.ParentCategoryId = command.ParentCategoryId;
        category.Slug = command.Slug.Trim().ToLowerInvariant();
        category.IsActive = command.IsActive;
        category.SortOrder = command.SortOrder;
        category.ImageUrl = NormalizeOptional(command.ImageUrl);
    }

    private static IEnumerable<CategoryTranslation> BuildTranslations(Guid categoryId, UpsertAdminCategoryCommand command)
    {
        return command.Translations
            .OrderBy(translation => translation.LanguageCode)
            .Select(translation => new CategoryTranslation
            {
                CategoryId = categoryId,
                LanguageCode = translation.LanguageCode.Trim().ToLowerInvariant(),
                Name = translation.Name.Trim(),
                Description = NormalizeOptional(translation.Description),
                SeoTitle = NormalizeOptional(translation.SeoTitle),
                SeoDescription = NormalizeOptional(translation.SeoDescription),
            });
    }

    private static string? NormalizeOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}