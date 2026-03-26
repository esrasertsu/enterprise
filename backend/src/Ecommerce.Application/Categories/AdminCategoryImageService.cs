using Ecommerce.Application.Abstractions.Persistence;
using Ecommerce.Application.Abstractions.Storage;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Categories;

public sealed class AdminCategoryImageService
{
    private readonly IAppDbContext _dbContext;
    private readonly IFileStorage _fileStorage;

    public AdminCategoryImageService(IAppDbContext dbContext, IFileStorage fileStorage)
    {
        _dbContext = dbContext;
        _fileStorage = fileStorage;
    }

    public async Task<AdminCategoryImageDto> UploadAsync(
        Guid categoryId,
        UploadAdminCategoryImageCommand command,
        FileStorageUpload upload,
        CancellationToken cancellationToken = default)
    {
        _ = command;

        var category = await _dbContext.Categories.FirstOrDefaultAsync(x => x.Id == categoryId, cancellationToken);

        if (category is null)
        {
            throw new InvalidOperationException("Category not found.");
        }

        var previousImageUrl = category.ImageUrl;
        var storedFile = await _fileStorage.SaveCategoryImageAsync(categoryId, upload, cancellationToken);

        category.ImageUrl = storedFile.Url;
        category.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(previousImageUrl))
        {
            await _fileStorage.DeleteAsync(previousImageUrl, cancellationToken);
        }

        return new AdminCategoryImageDto(category.ImageUrl, category.UpdatedAt);
    }

    public async Task<bool> DeleteAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        var category = await _dbContext.Categories.FirstOrDefaultAsync(x => x.Id == categoryId, cancellationToken);

        if (category is null)
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(category.ImageUrl))
        {
            return true;
        }

        var previousImageUrl = category.ImageUrl;
        category.ImageUrl = null;
        category.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        await _fileStorage.DeleteAsync(previousImageUrl, cancellationToken);

        return true;
    }
}