using Ecommerce.Application.Abstractions.Persistence;
using Ecommerce.Domain.Entities;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Products;

public sealed class AdminProductService
{
    private readonly IAppDbContext _dbContext;
    private readonly IValidator<UpsertAdminProductCommand> _validator;

    public AdminProductService(IAppDbContext dbContext, IValidator<UpsertAdminProductCommand> validator)
    {
        _dbContext = dbContext;
        _validator = validator;
    }

    public async Task<IReadOnlyList<AdminProductListItemDto>> GetListAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Products
            .AsNoTracking()
            .OrderByDescending(product => product.CreatedAt)
            .Select(product => new AdminProductListItemDto(
                product.Id,
                product.Slug,
                product.SkuRoot,
                product.Translations.Select(translation => translation.Name).FirstOrDefault() ?? product.Slug,
                product.Category.Translations.Select(translation => translation.Name).FirstOrDefault() ?? product.Category.Slug,
                product.IsActive,
                product.IsFeatured,
                product.ProductType,
                product.CreatedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<AdminProductDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _dbContext.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Translations)
            .Include(x => x.Variants)
            .Include(x => x.Images)
            .Include(x => x.Attributes)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return product is null ? null : MapDetailDto(product);
    }

    public async Task<Guid> CreateAsync(UpsertAdminProductCommand command, CancellationToken cancellationToken = default)
    {
        await _validator.ValidateAndThrowAsync(command, cancellationToken);
        await EnsureCategoryExistsAsync(command.CategoryId, cancellationToken);
        await EnsureUniqueProductIdentifiersAsync(command, null, cancellationToken);

        var product = new Product();
        ApplyCommand(product, command);

        _dbContext.Products.Add(product);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return product.Id;
    }

    public async Task<bool> UpdateAsync(Guid id, UpsertAdminProductCommand command, CancellationToken cancellationToken = default)
    {
        await _validator.ValidateAndThrowAsync(command, cancellationToken);

        var product = await _dbContext.Products.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (product is null)
        {
            return false;
        }

        await EnsureCategoryExistsAsync(command.CategoryId, cancellationToken);
        await EnsureUniqueProductIdentifiersAsync(command, id, cancellationToken);

        ApplyScalarFields(product, command);
        product.UpdatedAt = DateTime.UtcNow;

        await _dbContext.ProductTranslations.Where(x => x.ProductId == id).ExecuteDeleteAsync(cancellationToken);
        await _dbContext.ProductVariants.Where(x => x.ProductId == id).ExecuteDeleteAsync(cancellationToken);
        await _dbContext.ProductImages.Where(x => x.ProductId == id).ExecuteDeleteAsync(cancellationToken);
        await _dbContext.ProductAttributes.Where(x => x.ProductId == id).ExecuteDeleteAsync(cancellationToken);

        _dbContext.ProductTranslations.AddRange(BuildTranslations(id, command));
        _dbContext.ProductVariants.AddRange(BuildVariants(id, command));
        _dbContext.ProductImages.AddRange(BuildImages(id, command));
        _dbContext.ProductAttributes.AddRange(BuildAttributes(id, command));

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _dbContext.Products.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (product is null)
        {
            return false;
        }

        _dbContext.Products.Remove(product);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task EnsureCategoryExistsAsync(Guid categoryId, CancellationToken cancellationToken)
    {
        var categoryExists = await _dbContext.Categories.AnyAsync(category => category.Id == categoryId, cancellationToken);

        if (!categoryExists)
        {
            throw new InvalidOperationException("Category not found.");
        }
    }

    private async Task EnsureUniqueProductIdentifiersAsync(
        UpsertAdminProductCommand command,
        Guid? productId,
        CancellationToken cancellationToken)
    {
        var normalizedSlug = command.Slug.Trim().ToLowerInvariant();
        var normalizedSkuRoot = command.SkuRoot.Trim().ToUpperInvariant();
        var variantSkus = command.Variants.Select(variant => variant.Sku.Trim().ToUpperInvariant()).ToList();

        var slugExists = await _dbContext.Products.AnyAsync(
            product => product.Slug == normalizedSlug && (!productId.HasValue || product.Id != productId.Value),
            cancellationToken);

        if (slugExists)
        {
            throw new InvalidOperationException("Product slug already exists.");
        }

        var skuRootExists = await _dbContext.Products.AnyAsync(
            product => product.SkuRoot == normalizedSkuRoot && (!productId.HasValue || product.Id != productId.Value),
            cancellationToken);

        if (skuRootExists)
        {
            throw new InvalidOperationException("Product SKU root already exists.");
        }

        var variantSkuExists = await _dbContext.ProductVariants.AnyAsync(
            variant => variantSkus.Contains(variant.Sku) && (!productId.HasValue || variant.ProductId != productId.Value),
            cancellationToken);

        if (variantSkuExists)
        {
            throw new InvalidOperationException("One or more variant SKUs already exist.");
        }
    }

    private static void ApplyCommand(Product product, UpsertAdminProductCommand command)
    {
        ApplyScalarFields(product, command);
        product.Translations = BuildTranslations(product.Id, command).ToList();
        product.Variants = BuildVariants(product.Id, command).ToList();
        product.Images = BuildImages(product.Id, command).ToList();
        product.Attributes = BuildAttributes(product.Id, command).ToList();
    }

    private static void ApplyScalarFields(Product product, UpsertAdminProductCommand command)
    {
        product.CategoryId = command.CategoryId;
        product.Slug = command.Slug.Trim().ToLowerInvariant();
        product.SkuRoot = command.SkuRoot.Trim().ToUpperInvariant();
        product.ProductType = command.ProductType;
        product.IsActive = command.IsActive;
        product.IsFeatured = command.IsFeatured;
        product.IsCustomizable = command.IsCustomizable;
        product.HasVariants = command.HasVariants;
        product.RequiresArtwork = command.RequiresArtwork;
        product.MinOrderQuantity = command.MinOrderQuantity;
        product.MaxOrderQuantity = command.MaxOrderQuantity;
        product.LeadTimeDays = command.LeadTimeDays;
        product.BaseVatRate = command.BaseVatRate;
        product.WeightGrams = command.WeightGrams;
        product.MaterialSummary = NormalizeOptional(command.MaterialSummary);
        product.OriginCountry = NormalizeOptional(command.OriginCountry)?.ToUpperInvariant();
        product.Recyclable = command.Recyclable;
        product.FoodSafe = command.FoodSafe;
    }

    private static IEnumerable<ProductTranslation> BuildTranslations(Guid productId, UpsertAdminProductCommand command)
    {
        return command.Translations
            .OrderBy(x => x.LanguageCode)
            .Select(translation => new ProductTranslation
            {
                ProductId = productId,
                LanguageCode = translation.LanguageCode.Trim().ToLowerInvariant(),
                Name = translation.Name.Trim(),
                ShortDescription = NormalizeOptional(translation.ShortDescription),
                Description = NormalizeOptional(translation.Description),
                SeoTitle = NormalizeOptional(translation.SeoTitle),
                SeoDescription = NormalizeOptional(translation.SeoDescription)
            });
    }

    private static IEnumerable<ProductVariant> BuildVariants(Guid productId, UpsertAdminProductCommand command)
    {
        return command.Variants
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Sku)
            .Select(variant => new ProductVariant
            {
                ProductId = productId,
                Sku = variant.Sku.Trim().ToUpperInvariant(),
                Barcode = NormalizeOptional(variant.Barcode),
                PriceExclVat = variant.PriceExclVat,
                CompareAtPriceExclVat = variant.CompareAtPriceExclVat,
                StockQuantity = variant.StockQuantity,
                ReservedStockQuantity = variant.ReservedStockQuantity,
                IsActive = variant.IsActive,
                SortOrder = variant.SortOrder
            });
    }

    private static IEnumerable<ProductImage> BuildImages(Guid productId, UpsertAdminProductCommand command)
    {
        return command.Images
            .OrderByDescending(x => x.IsMain)
            .ThenBy(x => x.SortOrder)
            .Select(image => new ProductImage
            {
                ProductId = productId,
                Url = image.Url.Trim(),
                AltText = NormalizeOptional(image.AltText),
                SortOrder = image.SortOrder,
                IsMain = image.IsMain
            });
    }

    private static IEnumerable<ProductAttribute> BuildAttributes(Guid productId, UpsertAdminProductCommand command)
    {
        return command.Attributes
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.AttributeKey)
            .Select(attribute => new ProductAttribute
            {
                ProductId = productId,
                AttributeKey = attribute.AttributeKey.Trim(),
                AttributeValue = attribute.AttributeValue.Trim(),
                LanguageCode = NormalizeOptional(attribute.LanguageCode)?.ToLowerInvariant(),
                IsFilterable = attribute.IsFilterable,
                SortOrder = attribute.SortOrder
            });
    }

    private static AdminProductDetailDto MapDetailDto(Product product)
    {
        return new AdminProductDetailDto(
            product.Id,
            product.CategoryId,
            product.Category.Slug,
            product.Slug,
            product.SkuRoot,
            product.ProductType,
            product.IsActive,
            product.IsFeatured,
            product.IsCustomizable,
            product.HasVariants,
            product.RequiresArtwork,
            product.MinOrderQuantity,
            product.MaxOrderQuantity,
            product.LeadTimeDays,
            product.BaseVatRate,
            product.WeightGrams,
            product.MaterialSummary,
            product.OriginCountry,
            product.Recyclable,
            product.FoodSafe,
            product.Translations
                .OrderBy(x => x.LanguageCode)
                .Select(x => new ProductTranslationInput
                {
                    LanguageCode = x.LanguageCode,
                    Name = x.Name,
                    ShortDescription = x.ShortDescription,
                    Description = x.Description,
                    SeoTitle = x.SeoTitle,
                    SeoDescription = x.SeoDescription
                })
                .ToList(),
            product.Variants
                .OrderBy(x => x.SortOrder)
                .Select(x => new ProductVariantInput
                {
                    Sku = x.Sku,
                    Barcode = x.Barcode,
                    PriceExclVat = x.PriceExclVat,
                    CompareAtPriceExclVat = x.CompareAtPriceExclVat,
                    StockQuantity = x.StockQuantity,
                    ReservedStockQuantity = x.ReservedStockQuantity,
                    IsActive = x.IsActive,
                    SortOrder = x.SortOrder
                })
                .ToList(),
            product.Images
                .OrderByDescending(x => x.IsMain)
                .ThenBy(x => x.SortOrder)
                .Select(x => new AdminProductImageDto(
                    x.Id,
                    x.Url,
                    x.AltText,
                    x.IsMain,
                    x.SortOrder,
                    x.CreatedAt))
                .ToList(),
            product.Attributes
                .OrderBy(x => x.SortOrder)
                .ThenBy(x => x.AttributeKey)
                .Select(x => new ProductAttributeInput
                {
                    AttributeKey = x.AttributeKey,
                    AttributeValue = x.AttributeValue,
                    LanguageCode = x.LanguageCode,
                    IsFilterable = x.IsFilterable,
                    SortOrder = x.SortOrder
                })
                .ToList(),
            product.CreatedAt,
            product.UpdatedAt);
    }

    private static string? NormalizeOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}