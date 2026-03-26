using Ecommerce.Application.Abstractions.Persistence;
using Ecommerce.Application.Abstractions.Storage;
using Ecommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Products;

public sealed class AdminProductImageService
{
    private readonly IAppDbContext _dbContext;
    private readonly IFileStorage _fileStorage;

    public AdminProductImageService(IAppDbContext dbContext, IFileStorage fileStorage)
    {
        _dbContext = dbContext;
        _fileStorage = fileStorage;
    }

    public async Task<AdminProductImageDto> UploadAsync(
        Guid productId,
        UploadAdminProductImageCommand command,
        FileStorageUpload upload,
        CancellationToken cancellationToken = default)
    {
        var product = await _dbContext.Products
            .Include(x => x.Images)
            .FirstOrDefaultAsync(x => x.Id == productId, cancellationToken);

        if (product is null)
        {
            throw new InvalidOperationException("Product not found.");
        }

        var storedFile = await _fileStorage.SaveProductImageAsync(productId, upload, cancellationToken);

        var shouldBeMain = command.IsMain || product.Images.Count == 0;
        if (shouldBeMain)
        {
            foreach (var existingImage in product.Images.Where(x => x.IsMain))
            {
                existingImage.IsMain = false;
                existingImage.UpdatedAt = DateTime.UtcNow;
            }
        }

        var nextSortOrder = command.SortOrder.GetValueOrDefault();
        if (nextSortOrder <= 0)
        {
            nextSortOrder = product.Images.Count == 0
                ? 1
                : product.Images.Max(x => x.SortOrder) + 1;
        }

        var image = new ProductImage
        {
            ProductId = productId,
            Url = storedFile.Url,
            AltText = string.IsNullOrWhiteSpace(command.AltText) ? null : command.AltText.Trim(),
            IsMain = shouldBeMain,
            SortOrder = nextSortOrder,
        };

        _dbContext.ProductImages.Add(image);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapDto(image);
    }

    public async Task<AdminProductImageDto?> UpdateAsync(
        Guid productId,
        Guid imageId,
        UpdateAdminProductImageCommand command,
        CancellationToken cancellationToken = default)
    {
        var image = await _dbContext.ProductImages
            .FirstOrDefaultAsync(x => x.ProductId == productId && x.Id == imageId, cancellationToken);

        if (image is null)
        {
            return null;
        }

        image.AltText = string.IsNullOrWhiteSpace(command.AltText) ? null : command.AltText.Trim();
        image.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapDto(image);
    }

    public async Task<IReadOnlyList<AdminProductImageDto>?> ReorderAsync(
        Guid productId,
        ReorderAdminProductImagesCommand command,
        CancellationToken cancellationToken = default)
    {
        var product = await _dbContext.Products
            .Include(x => x.Images)
            .FirstOrDefaultAsync(x => x.Id == productId, cancellationToken);

        if (product is null)
        {
            return null;
        }

        var distinctImageIds = command.ImageIds.Distinct().ToArray();
        var productImageIds = product.Images.Select(x => x.Id).Order().ToArray();

        if (distinctImageIds.Length != product.Images.Count || !distinctImageIds.Order().SequenceEqual(productImageIds))
        {
            throw new InvalidOperationException("Image reorder payload must include each product image exactly once.");
        }

        var orderLookup = distinctImageIds
            .Select((imageId, index) => new { imageId, SortOrder = index + 1 })
            .ToDictionary(x => x.imageId, x => x.SortOrder);

        foreach (var image in product.Images)
        {
            image.SortOrder = orderLookup[image.Id];
            image.UpdatedAt = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return product.Images
            .OrderByDescending(x => x.IsMain)
            .ThenBy(x => x.SortOrder)
            .Select(MapDto)
            .ToList();
    }

    public async Task<AdminProductImageDto?> SetMainAsync(
        Guid productId,
        Guid imageId,
        CancellationToken cancellationToken = default)
    {
        var product = await _dbContext.Products
            .Include(x => x.Images)
            .FirstOrDefaultAsync(x => x.Id == productId, cancellationToken);

        if (product is null)
        {
            return null;
        }

        var image = product.Images.FirstOrDefault(x => x.Id == imageId);
        if (image is null)
        {
            return null;
        }

        foreach (var existingImage in product.Images)
        {
            existingImage.IsMain = existingImage.Id == imageId;
            existingImage.UpdatedAt = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapDto(image);
    }

    public async Task<bool> DeleteAsync(
        Guid productId,
        Guid imageId,
        CancellationToken cancellationToken = default)
    {
        var product = await _dbContext.Products
            .Include(x => x.Images)
            .FirstOrDefaultAsync(x => x.Id == productId, cancellationToken);

        if (product is null)
        {
            return false;
        }

        var image = product.Images.FirstOrDefault(x => x.Id == imageId);
        if (image is null)
        {
            return false;
        }

        var deletedWasMain = image.IsMain;
        var fileUrl = image.Url;

        _dbContext.ProductImages.Remove(image);

        if (deletedWasMain)
        {
            var replacement = product.Images
                .Where(x => x.Id != imageId)
                .OrderBy(x => x.SortOrder)
                .FirstOrDefault();

            if (replacement is not null)
            {
                replacement.IsMain = true;
                replacement.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        await _fileStorage.DeleteAsync(fileUrl, cancellationToken);

        return true;
    }

    private static AdminProductImageDto MapDto(ProductImage image)
    {
        return new AdminProductImageDto(
            image.Id,
            image.Url,
            image.AltText,
            image.IsMain,
            image.SortOrder,
            image.CreatedAt);
    }
}